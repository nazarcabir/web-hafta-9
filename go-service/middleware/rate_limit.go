package middleware

import (
	"campus-connect/go/models"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type IPRateLimiter struct {
	ips map[string]*rate.Limiter
	mu  *sync.RWMutex
	r   rate.Limit
	b   int
}

func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	return &IPRateLimiter{
		ips: make(map[string]*rate.Limiter),
		mu:  &sync.RWMutex{},
		r:   r,
		b:   b,
	}
}

func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	limiter, exists := i.ips[ip]
	if !exists {
		limiter = rate.NewLimiter(i.r, i.b)
		i.ips[ip] = limiter
	}

	return limiter
}

func RateLimitMiddleware(limiter *IPRateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		l := limiter.GetLimiter(ip)

		if !l.Allow() {
			problem := models.ProblemDetail{
				Type:     "https://httpstatuses.com/429",
				Title:    "Rate Limit Exceeded",
				Status:   http.StatusTooManyRequests,
				Detail:   "You have exceeded your request quota",
				Instance: c.Request.URL.Path,
			}
			c.Header("Retry-After", "60")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, problem)
			return
		}
		c.Next()
	}
}
