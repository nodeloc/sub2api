package usagestats

// UsageAggregateRow is one grouped row for the by-dimension usage aggregation
// (Activity → Explore). Each row carries every metric so the client can switch
// metric / sort / top-N without re-querying.
type UsageAggregateRow struct {
	Key         string  `json:"key"`
	Label       string  `json:"label"`
	Requests    int64   `json:"requests"`
	TotalTokens int64   `json:"total_tokens"`
	Cost        float64 `json:"cost"`
	ActualCost  float64 `json:"actual_cost"`
}
