package handler

import (
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/response"
	middleware2 "github.com/Wei-Shaw/sub2api/internal/server/middleware"

	"github.com/gin-gonic/gin"
)

// DashboardAggregate aggregates the current user's usage grouped by a
// dimension ("model" | "api_key" | "provider") over the requested time range.
// Powers the Activity → Explore aggregation query builder.
// GET /api/v1/usage/dashboard/aggregate?dimension=model&start_date=&end_date=
func (h *UsageHandler) DashboardAggregate(c *gin.Context) {
	subject, ok := middleware2.GetAuthSubjectFromContext(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	startTime, endTime := parseUserTimeRange(c)
	dimension := c.DefaultQuery("dimension", "model")

	rows, err := h.usageService.GetUserUsageAggregate(c.Request.Context(), subject.UserID, startTime, endTime, dimension)
	if err != nil {
		response.ErrorFrom(c, err)
		return
	}

	response.Success(c, gin.H{
		"dimension":  dimension,
		"rows":       rows,
		"start_date": startTime.Format("2006-01-02"),
		"end_date":   endTime.Add(-24 * time.Hour).Format("2006-01-02"),
	})
}
