package main

import (
    // "github.com/chiragsoni81245/pocket-tank-server/internal/types"
    // "github.com/chiragsoni81245/pocket-tank-server/internal/routes"
    "github.com/gin-gonic/gin"
)


func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080
}
