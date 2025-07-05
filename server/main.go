package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Post struct {
	CID         string    `json:"cid"`
	Description string    `json:"description"`
	Address     string    `json:"address"`
	CreatedAt   time.Time `json:"created_at"`
	Tags        []string  `json:"tags"`
	Private     bool      `json:"private"`
}

const defaultPort = "80"
const projectName = "bulb.social"

var (
	tmpDir string
	// http://kubo:5001
	ipfsBaseURL string
	// http://orbitdb:3000
	orbitDBBaseURL string
)

func init() {
	var err error
	tmpDir, err = os.MkdirTemp("", projectName+"-tmp")
	if err != nil {
		panic(err)
	}
	ipfsBaseURL = os.Getenv("IPFS_API_URL")
	orbitDBBaseURL = os.Getenv("ORBITDB_API_URL")
}

func main() {
	// API REST using gin
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	// Set a lower memory limit for multipart forms (default is 32 MiB)
	// router.MaxMultipartMemory = 8 << 20

	// 1st request, gets the image, sends it to IPFS, and returns the CID
	router.POST("/api/v0/upload-pic", func(c *gin.Context) {
		// get the file from the request
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file upload"})
			return
		}
		if file.Filename == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
			return
		}
		// save the file to a temporary location
		uuid := uuid.New().String()
		extension := filepath.Ext(file.Filename)

		newFileName := fmt.Sprintf("%s%s", uuid, extension)
		completeNewPath := filepath.Join(tmpDir, newFileName)
		log.Println("Saving file to:", completeNewPath)

		if err := c.SaveUploadedFile(file, completeNewPath); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"message": "Unable to save the file",
			})
		}

		ipfsHash, err := pinIPFS(newFileName, completeNewPath)
		if err != nil {
			log.Println("Error pinning to IPFS:", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to pin file to IPFS",
			})
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "File uploaded and stored on IPFS",
			"cid":     ipfsHash,
		})
	})

	router.POST("/api/v0/create-post", func(c *gin.Context) {
		// get json data from request body
		var postData Post
		if err := c.BindJSON(&postData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON form"})
			return
		}
		// log the post data
		postData.CreatedAt = time.Now()
		// fmt.Printf("%#v\n", postData)
		orbitResponse, err := storeInOrbitDB(postData)
		if err != nil {
			log.Println("Error storing in OrbitDB:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store in OrbitDB"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message":    "Post stored in OrbitDB",
			"orbit_hash": orbitResponse.Hash,
			"db_address": orbitResponse.DBAddress,
		})

	})

	s := &http.Server{
		Addr:           net.JoinHostPort("", defaultPort),
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	var err error
	ctx := context.Background()
	done := make(chan os.Signal, 1)
	errChan := make(chan error, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGTERM)

	go func() {
		err = s.ListenAndServe()
		if err != nil {
			errChan <- err
		}
	}()
	log.Println("server started on port", net.JoinHostPort("", defaultPort))
	var e error
	select {
	case <-done:
	case e = <-errChan:
	}

	err = s.Shutdown(ctx)
	if e != nil || err != nil {
		log.Println("server shutdown error:", err, e)
		os.Exit(1)
	}
	log.Println("server stopped")

	// remove the temporary directory and all its contents
	if err := os.RemoveAll(tmpDir); err != nil {
		log.Println("error removing temporary directory:", err)
		os.Exit(1)
	}
}

type ipfsResp struct {
	Name string `json:"Name"`
	Hash string `json:"Hash"`
	Size string `json:"Size"`
}

func pinIPFS(newFileName, completeNewPath string) (string, error) {
	// --- Send file to IPFS via RPC (HTTP API) ---
	ipfsApiUrl, err := url.JoinPath(ipfsBaseURL, "/api/v0/add")
	if err != nil {
		return "", fmt.Errorf("failed to construct IPFS API URL: %w", err)
	}
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", newFileName)
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %w", err)
	}
	f, err := os.Open(completeNewPath)
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer f.Close()
	if _, err := io.Copy(part, f); err != nil {
		return "", fmt.Errorf("failed to copy file: %w", err)
	}
	writer.Close()

	req, err := http.NewRequest(http.MethodPost, ipfsApiUrl, body)
	if err != nil {
		return "", fmt.Errorf("failed to create IPFS request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to contact IPFS: %w", err)
	}
	defer resp.Body.Close()

	var ipfsResult ipfsResp
	if err := json.NewDecoder(resp.Body).Decode(&ipfsResult); err != nil {
		return "", fmt.Errorf("failed to parse IPFS response: %w", err)
	}

	return ipfsResult.Hash, nil
}

type OrbitDBResponse struct {
	Hash      string `json:"hash"`
	DBAddress string `json:"db_address"`
}

func storeInOrbitDB(postData Post) (*OrbitDBResponse, error) {
	orbitdbApiUrl, err := url.JoinPath(orbitDBBaseURL, "/orbitdb/add")
	if err != nil {
		return nil, fmt.Errorf("failed to construct OrbitDB API URL: %w", err)
	}
	jsonData, err := json.Marshal(postData)
	if err != nil {
		return nil, err
	}
	resp, err := http.Post(orbitdbApiUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("OrbitDB service returned status: %s", resp.Status)
	}
	// reading the response body as json
	var response OrbitDBResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode OrbitDB response: %w", err)
	}

	if response.Hash == "" {
		return nil, fmt.Errorf("OrbitDB response does not contain hash")
	}
	log.Printf("Stored in OrbitDB (%s) with hash: %s\n", response.DBAddress, response.Hash)
	return &response, nil
}
