package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
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

const defaultPort = "8080"
const projectName = "bulb.social"

var tmpDir string

func init() {
	var err error
	tmpDir, err = os.MkdirTemp("", projectName+"-tmp")
	if err != nil {
		panic(err)
	}
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
		c.JSON(http.StatusOK, gin.H{
			"message": "File uploaded successfully",
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
