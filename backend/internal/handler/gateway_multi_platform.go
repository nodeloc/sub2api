package handler

import (
	"bytes"
	"context"
	"io"
	"strings"

	"github.com/Wei-Shaw/sub2api/internal/pkg/ctxkey"
	middleware2 "github.com/Wei-Shaw/sub2api/internal/server/middleware"
	"github.com/gin-gonic/gin"
	"github.com/tidwall/gjson"
)

// MultiPlatformRouting resolves the upstream platform per-request for groups that
// have ModelsListConfig.MultiPlatform enabled, so a single API key can reach
// Anthropic + OpenAI + Gemini accounts ("one key, all models").
//
// It peeks the requested model, resolves its platform via the gateway service, and
// stores the result as ForcePlatform on the request context. Both the route
// dispatch (getGroupPlatform) and account selection honor ForcePlatform, so the
// chosen forwarder (Gateway / OpenAIGateway / gemini-compat) and the selected
// account end up on the same platform — instead of everything following the
// group's single platform.
//
// It is a no-op for non-multi-platform groups (returns immediately without touching
// the body) and never overrides an explicit ForcePlatform (e.g. the /antigravity
// routes). Request-body compression is rare on inbound API calls; when present the
// peek is skipped and routing falls back to the group platform.
func (h *GatewayHandler) MultiPlatformRouting() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey, ok := middleware2.GetAPIKeyFromContext(c)
		if !ok || apiKey.Group == nil || !apiKey.Group.ModelsListConfig.MultiPlatform {
			c.Next()
			return
		}
		if fp, _ := c.Request.Context().Value(ctxkey.ForcePlatform).(string); fp != "" {
			c.Next()
			return
		}
		if c.Request == nil || c.Request.Body == nil {
			c.Next()
			return
		}

		raw, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.Next()
			return
		}
		// Always restore the raw body so the downstream handler reads it unchanged
		// (it does its own Content-Encoding decoding).
		c.Request.Body = io.NopCloser(bytes.NewReader(raw))
		c.Request.ContentLength = int64(len(raw))

		enc := strings.ToLower(strings.TrimSpace(c.Request.Header.Get("Content-Encoding")))
		if enc != "" && enc != "identity" {
			c.Next()
			return
		}

		model := gjson.GetBytes(raw, "model").String()
		if model == "" {
			c.Next()
			return
		}
		if platform := h.gatewayService.ResolvePlatformForModel(c.Request.Context(), apiKey.Group.ID, model); platform != "" {
			c.Request = c.Request.WithContext(context.WithValue(c.Request.Context(), ctxkey.ForcePlatform, platform))
		}
		c.Next()
	}
}
