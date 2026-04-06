package main

import (
	"campus-connect/go/handlers"
	"campus-connect/go/middleware"
	"campus-connect/go/webhook"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/time/rate"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	limiter := middleware.NewIPRateLimiter(rate.Every(time.Minute/60), 60)

	r := gin.Default()
	r.Use(middleware.RateLimitMiddleware(limiter))

	analytics := &handlers.AnalyticsHandler{DB: db}

	v1 := r.Group("/api/v1")
	{
		v1.POST("/webhooks/events", webhook.HandleWebhook())
		v1.GET("/notifications", webhook.GetNotifications)

		analyticsGroup := v1.Group("/analytics")
		analyticsGroup.Use(middleware.APIKeyGuard())
		{
			analyticsGroup.GET("/popular", analytics.GetPopularEvents)
			analyticsGroup.GET("/categories", analytics.GetCategoryStats)
			analyticsGroup.GET("/weekly", analytics.GetWeeklyStats)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
