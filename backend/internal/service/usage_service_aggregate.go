package service

import (
	"context"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/usagestats"
)

// GetUserUsageAggregate returns the user's usage grouped by dimension
// ("model" | "api_key" | "provider") over the time range. Powers the
// Activity → Explore aggregation query builder. Unknown dimensions fall back
// to "model".
func (s *UsageService) GetUserUsageAggregate(ctx context.Context, userID int64, startTime, endTime time.Time, dimension string) ([]usagestats.UsageAggregateRow, error) {
	switch dimension {
	case "model", "api_key", "provider":
		// ok
	default:
		dimension = "model"
	}
	return s.usageRepo.GetUserUsageAggregate(ctx, userID, startTime, endTime, dimension)
}
