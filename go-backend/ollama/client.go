package ollama

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client para conectar con servidores Ollama
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

// Estructuras para la API de Ollama
type Model struct {
	Name       string    `json:"name"`
	Size       int64     `json:"size"`
	Digest     string    `json:"digest"`
	ModifiedAt time.Time `json:"modified_at"`
	Format     string    `json:"format,omitempty"`
	Family     string    `json:"family,omitempty"`
}

type ModelsResponse struct {
	Models []Model `json:"models"`
}

type ServerInfo struct {
	Version string `json:"version,omitempty"`
}

type GenerateRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

type GenerateResponse struct {
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	Response  string    `json:"response"`
	Done      bool      `json:"done"`
}

// NewClient crea un nuevo cliente Ollama
func NewClient(baseURL string) *Client {
	return &Client{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Ping verifica si el servidor Ollama está activo
func (c *Client) Ping() error {
	resp, err := c.HTTPClient.Get(fmt.Sprintf("%s/api/tags", c.BaseURL))
	if err != nil {
		return fmt.Errorf("error conectando al servidor: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("servidor respondió con código %d", resp.StatusCode)
	}

	return nil
}

// GetModels obtiene la lista de modelos disponibles
func (c *Client) GetModels() ([]Model, error) {
	resp, err := c.HTTPClient.Get(fmt.Sprintf("%s/api/tags", c.BaseURL))
	if err != nil {
		return nil, fmt.Errorf("error obteniendo modelos: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("servidor respondió con código %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error leyendo respuesta: %w", err)
	}

	var modelsResp ModelsResponse
	if err := json.Unmarshal(body, &modelsResp); err != nil {
		return nil, fmt.Errorf("error parseando JSON: %w", err)
	}

	return modelsResp.Models, nil
}

// GetServerInfo obtiene información del servidor
func (c *Client) GetServerInfo() (*ServerInfo, error) {
	resp, err := c.HTTPClient.Get(fmt.Sprintf("%s/api/version", c.BaseURL))
	if err != nil {
		return nil, fmt.Errorf("error obteniendo info del servidor: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("servidor respondió con código %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error leyendo respuesta: %w", err)
	}

	var info ServerInfo
	if err := json.Unmarshal(body, &info); err != nil {
		return nil, fmt.Errorf("error parseando JSON: %w", err)
	}

	return &info, nil
}

// Generate realiza una inferencia con un modelo
func (c *Client) Generate(model, prompt string) (*GenerateResponse, error) {
	reqBody := GenerateRequest{
		Model:  model,
		Prompt: prompt,
		Stream: false,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("error serializando request: %w", err)
	}

	resp, err := c.HTTPClient.Post(
		fmt.Sprintf("%s/api/generate", c.BaseURL),
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return nil, fmt.Errorf("error enviando request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("servidor respondió con código %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error leyendo respuesta: %w", err)
	}

	var genResp GenerateResponse
	if err := json.Unmarshal(body, &genResp); err != nil {
		return nil, fmt.Errorf("error parseando JSON: %w", err)
	}

	return &genResp, nil
}

// HealthCheck verifica el estado completo del servidor
func (c *Client) HealthCheck() map[string]interface{} {
	result := map[string]interface{}{
		"url":         c.BaseURL,
		"status":      "unknown",
		"ping":        false,
		"models":      0,
		"version":     "",
		"error":       "",
		"checked_at":  time.Now(),
	}

	// Verificar ping
	if err := c.Ping(); err != nil {
		result["status"] = "offline"
		result["error"] = err.Error()
		return result
	}
	result["ping"] = true

	// Obtener modelos
	models, err := c.GetModels()
	if err != nil {
		result["status"] = "partial"
		result["error"] = fmt.Sprintf("Error obteniendo modelos: %v", err)
	} else {
		result["models"] = len(models)
		if len(models) > 0 {
			result["status"] = "active"
		}
	}

	// Obtener versión
	info, err := c.GetServerInfo()
	if err != nil {
		// No es crítico si no se puede obtener la versión
		result["version"] = "unknown"
	} else {
		result["version"] = info.Version
	}

	return result
}
