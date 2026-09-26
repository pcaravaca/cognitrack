package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// OllamaChatRequest representa la petición de chat
type OllamaChatRequest struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
	Stream   bool      `json:"stream"`
}

// Message representa un mensaje en el chat
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// OllamaChatResponse representa la respuesta del chat
type OllamaChatResponse struct {
	Message  Message `json:"message"`
	Response string  `json:"response"`
	Done     bool    `json:"done"`
}

// HandleOllamaChat maneja las peticiones de chat con modelos Ollama
func HandleOllamaChat(w http.ResponseWriter, r *http.Request) {
	// Verificar autenticación
	user := r.Context().Value("user")
	if user == nil {
		http.Error(w, "No autorizado", http.StatusUnauthorized)
		return
	}

	// Solo permitir POST
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// Parsear el body
	var chatReq OllamaChatRequest
	if err := json.NewDecoder(r.Body).Decode(&chatReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Valores por defecto
	if chatReq.Model == "" {
		chatReq.Model = "granite3.2-vision:2b"
	}

	// Obtener servidor Ollama de configuración
	ollamaURL := getOllamaServerURL(r)
	
	// Construir la petición para Ollama
	ollamaReqBody, err := json.Marshal(chatReq)
	if err != nil {
		http.Error(w, "Error procesando petición", http.StatusInternalServerError)
		return
	}

	// Hacer la petición a Ollama
	resp, err := http.Post(
		fmt.Sprintf("%s/api/chat", ollamaURL),
		"application/json",
		bytes.NewBuffer(ollamaReqBody),
	)
	if err != nil {
		http.Error(w, "Error conectando con Ollama", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	// Leer la respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Error leyendo respuesta", http.StatusInternalServerError)
		return
	}

	// Reenviar la respuesta
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}

// getOllamaServerURL obtiene la URL del servidor Ollama
func getOllamaServerURL(r *http.Request) string {
	// Primero intentar obtener de header
	serverID := r.Header.Get("X-Ollama-Server-ID")
	if serverID != "" {
		// Buscar en la configuración de servidores
		// Por ahora usar el servidor por defecto
		return "http://192.168.0.104:11434"
	}
	
	// Servidor por defecto
	return "http://192.168.0.104:11434"
}
