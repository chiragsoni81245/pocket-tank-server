run: build
	@./bin/pocket-tank-server

build:
	@go build -o bin/pocket-tank-server cmd/server/main.go
