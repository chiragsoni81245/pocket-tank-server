package routes

import (
	"github.com/gin-gonic/gin"
    "net/http"
)


func AttachUIRoutes(router *gin.RouterGroup){
    router.GET("/", func(c *gin.Context){
        c.HTML(http.StatusOK, "index.tmpl", gin.H{})
    })
}
