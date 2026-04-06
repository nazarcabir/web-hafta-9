package webhook

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
)

type WebhookPayload struct {
	Event string `json:"event"`
	Data  map[string]interface{} `json:"data"`
}

var (
	NotificationHistory []WebhookPayload
	historyMu           sync.Mutex
)

func HandleWebhook() gin.HandlerFunc {
	return func(c *gin.Context) {
		secret := os.Getenv("WEBHOOK_SECRET")
		signature := c.GetHeader("X-Webhook-Signature")

		body, _ := io.ReadAll(c.Request.Body)
		c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

		h := hmac.New(sha256.New, []byte(secret))
		h.Write(body)
		expectedSignature := hex.EncodeToString(h.Sum(nil))

		if signature != expectedSignature {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
			return
		}

		var payload WebhookPayload
		if err := json.Unmarshal(body, &payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
			return
		}

		var wg sync.WaitGroup
		wg.Add(3)

		go func() {
			defer wg.Done()
			f, _ := os.OpenFile("webhooks.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
			defer f.Close()
			fmt.Fprintf(f, "[%s] Event: %s, Data: %v\n", payload.Event, payload.Event, payload.Data)
		}()

		go func() {
			defer wg.Done()
			historyMu.Lock()
			NotificationHistory = append(NotificationHistory, payload)
			historyMu.Unlock()
		}()

		go func() {
			defer wg.Done()
			log.Printf("Stats updated for event: %v", payload.Data["id"])
		}()

		wg.Wait()
		c.JSON(http.StatusOK, gin.H{"status": "received"})
	}
}

func GetNotifications(c *gin.Context) {
	historyMu.Lock()
	defer historyMu.Unlock()
	c.JSON(http.StatusOK, NotificationHistory)
}
