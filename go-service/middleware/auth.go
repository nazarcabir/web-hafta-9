package middleware

import (
	"campus-connect/go/models"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func APIKeyGuard() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		expectedKey := os.Getenv("API_KEY")

		if apiKey == "" || apiKey != expectedKey {
			problem := models.ProblemDetail{
				Type:     "https://httpstatuses.com/401",
				Title:    "Unauthorized",
				Status:   http.StatusUnauthorized,
				Detail:   "Invalid or missing API Key",
				Instance: c.Request.URL.Path,
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, problem)
			return
		}
		c.Next()
	}
}
