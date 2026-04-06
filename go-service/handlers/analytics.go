package handlers

import (
	"campus-connect/go/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AnalyticsHandler struct {
	DB *gorm.DB
}

func (h *AnalyticsHandler) GetPopularEvents(c *gin.Context) {
	var results []map[string]interface{}
	
	h.DB.Table("attendances").
		Select("events.id, events.title, count(attendances.user_id) as participant_count").
		Joins("join events on events.id = attendances.event_id").
		Group("events.id").
		Order("participant_count desc").
		Limit(5).
		Scan(&results)

	c.JSON(http.StatusOK, results)
}

func (h *AnalyticsHandler) GetCategoryStats(c *gin.Context) {
	var results []map[string]interface{}
	
	h.DB.Model(&models.Event{}).
		Select("category, count(*) as event_count").
		Group("category").
		Scan(&results)

	c.JSON(http.StatusOK, results)
}

func (h *AnalyticsHandler) GetWeeklyStats(c *gin.Context) {
	var results []map[string]interface{}
	sevenDaysAgo := time.Now().AddDate(0, 0, -7)

	h.DB.Table("attendances").
		Select("date(joined_at) as date, count(*) as count").
		Where("joined_at >= ?", sevenDaysAgo).
		Group("date(joined_at)").
		Order("date asc").
		Scan(&results)

	c.JSON(http.StatusOK, results)
}
