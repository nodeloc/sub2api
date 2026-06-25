package repository

import (
	"context"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/usagestats"
)

// GetUserUsageAggregate aggregates a user's usage over a time range, grouped by
// the given dimension: "model", "api_key" or "provider". Each row includes
// requests, total tokens, standard cost and actual cost. Kept in its own file
// (fork-local) so the large upstream repo file stays untouched for clean merges.
func (r *usageLogRepository) GetUserUsageAggregate(ctx context.Context, userID int64, startTime, endTime time.Time, dimension string) ([]usagestats.UsageAggregateRow, error) {
	var query string
	switch dimension {
	case "api_key":
		query = `
			SELECT u.api_key_id::text AS k,
				COALESCE(NULLIF(k.name, ''), '#' || u.api_key_id::text) AS label,
				COUNT(*) AS requests,
				COALESCE(SUM(u.input_tokens + u.output_tokens + u.cache_creation_tokens + u.cache_read_tokens), 0) AS total_tokens,
				COALESCE(SUM(u.total_cost), 0) AS cost,
				COALESCE(SUM(u.actual_cost), 0) AS actual_cost
			FROM usage_logs u
			LEFT JOIN api_keys k ON k.id = u.api_key_id
			WHERE u.user_id = $1 AND u.created_at >= $2 AND u.created_at < $3
			GROUP BY u.api_key_id, k.name
			ORDER BY actual_cost DESC`
	case "provider":
		query = `
			SELECT ` + usageLogEffectivePlatformExpr + ` AS k,
				` + usageLogEffectivePlatformExpr + ` AS label,
				COUNT(*) AS requests,
				COALESCE(SUM(ul.input_tokens + ul.output_tokens + ul.cache_creation_tokens + ul.cache_read_tokens), 0) AS total_tokens,
				COALESCE(SUM(ul.total_cost), 0) AS cost,
				COALESCE(SUM(ul.actual_cost), 0) AS actual_cost
			FROM usage_logs ul
			LEFT JOIN groups g ON g.id = ul.group_id
			LEFT JOIN accounts a ON a.id = ul.account_id
			WHERE ul.user_id = $1 AND ul.created_at >= $2 AND ul.created_at < $3
			GROUP BY ` + usageLogEffectivePlatformExpr + `
			HAVING ` + usageLogEffectivePlatformExpr + ` IS NOT NULL AND ` + usageLogEffectivePlatformExpr + ` <> ''
			ORDER BY actual_cost DESC`
	default: // "model"
		query = `
			SELECT model AS k, model AS label,
				COUNT(*) AS requests,
				COALESCE(SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens), 0) AS total_tokens,
				COALESCE(SUM(total_cost), 0) AS cost,
				COALESCE(SUM(actual_cost), 0) AS actual_cost
			FROM usage_logs
			WHERE user_id = $1 AND created_at >= $2 AND created_at < $3
			GROUP BY model
			ORDER BY actual_cost DESC`
	}

	rows, err := r.sql.QueryContext(ctx, query, userID, startTime, endTime)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	results := make([]usagestats.UsageAggregateRow, 0, 16)
	for rows.Next() {
		var row usagestats.UsageAggregateRow
		if err := rows.Scan(&row.Key, &row.Label, &row.Requests, &row.TotalTokens, &row.Cost, &row.ActualCost); err != nil {
			return nil, err
		}
		results = append(results, row)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return results, nil
}
