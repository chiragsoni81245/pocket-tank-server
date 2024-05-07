package main

import (
    "database/sql"
	"fmt"
	"log"
	_ "github.com/mattn/go-sqlite3"
    "github.com/gin-gonic/gin"

    "github.com/chiragsoni81245/pocket-tank-server/routes"
)

func SetupRouter(db_name string) (*gin.Engine, *sql.DB) {
    router := gin.Default()
    router.Static("/css", "./assets/css")
    router.Static("/js", "./assets/js")
    router.LoadHTMLGlob("templates/*")
    // Database Setup
    db, err := sql.Open("sqlite3", fmt.Sprintf("%s.db", db_name))
    if err != nil {
        log.Fatal(err)
    }

    UIRouter := router.Group("/")
    routes.AttachUIRoutes(UIRouter)

    return router, db
}

func main() {
    router, db := SetupRouter("pocket_tank")
    defer db.Close()

    router.Run("0.0.0.0:8000")
}

