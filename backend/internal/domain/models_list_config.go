package domain

// GroupModelsListConfig controls the optional custom /v1/models response list
// and whether the group acts as a cross-platform router (MultiPlatform).
type GroupModelsListConfig struct {
	Enabled bool     `json:"enabled"`
	Models  []string `json:"models,omitempty"`
	// MultiPlatform turns the group into a cross-platform router: instead of
	// pinning account selection to group.Platform, the gateway resolves the
	// target platform from the requested model (channel-pricing platform, then a
	// model-name heuristic). This lets one API key reach Anthropic + OpenAI +
	// Gemini accounts assigned to the same group ("one key, all models").
	MultiPlatform bool `json:"multi_platform,omitempty"`
}
