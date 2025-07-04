# Step 1
FROM golang:1.24.4-alpine3.22 AS build-env


COPY main.go /app/main.go
COPY vendor /app/vendor
COPY go.mod /app/go.mod
COPY go.sum /app/go.sum

WORKDIR /app
RUN env CGO=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -buildvcs=false -o bulb-server .
RUN mkdir tmp


# Step 2
FROM scratch
COPY --from=build-env /app/bulb-server /bin/bulb-server
COPY --from=build-env /app/tmp /tmp

EXPOSE 80
ENTRYPOINT ["/bin/bulb-server"]