package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"unique" json:"email"`
	Name      string    `json:"name"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
}

type Event struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Category        string    `json:"category"`
	City            string    `json:"city"`
	Date            time.Time `json:"date"`
	MaxParticipants int       `json:"maxParticipants"`
	CreatorID       uint      `json:"creatorId"`
	CreatedAt       time.Time `json:"createdAt"`
}

type Attendance struct {
	UserID   uint      `gorm:"primaryKey" json:"userId"`
	EventID  uint      `gorm:"primaryKey" json:"eventId"`
	JoinedAt time.Time `json:"joinedAt"`
}

type ProblemDetail struct {
	Type     string `json:"type"`
	Title    string `json:"title"`
	Status   int    `json:"status"`
	Detail   string `json:"detail"`
	Instance string `json:"instance"`
}
