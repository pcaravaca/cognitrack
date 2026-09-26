package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"runtime"
	"strings"
	"sync"
	"time"
)

// Estructuras básicas
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	FullName  string    `json:"full_name"`
	Role      string    `json:"role"`
	IsAdmin   bool      `json:"is_admin"`
	CreatedAt time.Time `json:"created_at"`
	Password  string    `json:"-"`
}

type SystemMetrics struct {
	CPUUsage    float64 `json:"cpu_usage"`
	MemoryUsage float64 `json:"memory_usage"`
	Timestamp   string  `json:"timestamp"`
}

// Almacén de datos en memoria
var users = map[string]*User{
	"admin": {
		ID:        "admin-001",
		Username:  "admin",
		Email:     "admin@cognitrack.com",
		FullName:  "Peter Caravaca",
		Role:      "admin",
		IsAdmin:   true,
		CreatedAt: time.Now(),
		Password:  "admin123",
	},
	"peter": {
		ID:        "user-001",
		Username:  "peter",
		Email:     "peter@cognitrack.com",
		FullName:  "Peter Caravaca",
		Role:      "user",
		IsAdmin:   false,
		CreatedAt: time.Now(),
		Password:  "user123",
	},
}

var tokens = make(map[string]*User)
var tokensMutex = &sync.RWMutex{}

// Utilidades CORS
func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

// Middleware de autenticación
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == "OPTIONS" {
			return
		}

		// Obtener token
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "No authorization header", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		
		// Verificar token
		tokensMutex.RLock()
		user, exists := tokens[token]
		tokensMutex.RUnlock()

		if !exists {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Agregar usuario al contexto
		ctx := context.WithValue(r.Context(), "user", user)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// Handler para login
func loginHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var credentials struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Verificar credenciales
	user, exists := users[credentials.Username]
	if !exists || user.Password != credentials.Password {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generar token
	token := fmt.Sprintf("token-%s-%d", user.Username, time.Now().Unix())
	
	tokensMutex.Lock()
	tokens[token] = user
	tokensMutex.Unlock()

	// Respuesta
	response := map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"id":        user.ID,
			"username":  user.Username,
			"email":     user.Email,
			"full_name": user.FullName,
			"role":      user.Role,
			"is_admin":  user.IsAdmin,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Handler para verificar autenticación
func handleVerifyAuth(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"authenticated": true})
}

// Handler para obtener usuario actual
func handleGetCurrentUser(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	user := r.Context().Value("user").(*User)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":        user.ID,
		"username":  user.Username,
		"email":     user.Email,
		"full_name": user.FullName,
		"role":      user.Role,
		"is_admin":  user.IsAdmin,
	})
}

// Handler para logout
func handleLogout(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	
	authHeader := r.Header.Get("Authorization")
	token := strings.TrimPrefix(authHeader, "Bearer ")
	
	tokensMutex.Lock()
	delete(tokens, token)
	tokensMutex.Unlock()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

// Handler para health check
func handleHealth(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok",
		"version": "2.0.0-go",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

// Handler para obtener servidores
func handleServers(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	
	servers := []map[string]interface{}{
		{
			"id":          "1",
			"name":        "Servidor Principal",
			"host":        "192.168.0.104",
			"port":        11434,
			"status":      "online",
			"isDefault":   true,
			"description": "Servidor Ollama principal",
			"gpu":         "NVIDIA RTX 3090",
			"memory":      "24GB",
			"models": []string{
				"granite3.2-vision:2b",
				"llama3.1",
				"mistral",
				"codellama",
			},
		},
		{
			"id":          "2",
			"name":        "Servidor Secundario",
			"host":        "192.168.0.105",
			"port":        11434,
			"status":      "online",
			"isDefault":   false,
			"description": "Servidor Ollama de respaldo",
			"gpu":         "NVIDIA RTX 3080",
			"memory":      "16GB",
			"models": []string{
				"granite3.2-vision:2b",
				"llama3.1",
				"phi3",
			},
		},
		{
			"id":          "3",
			"name":        "Servidor de Pruebas",
			"host":        "10.10.1.131",
			"port":        11434,
			"status":      "online",
			"isDefault":   false,
			"description": "Servidor Ollama de pruebas",
			"gpu":         "NVIDIA RTX 3090",
			"memory":      "24GB",
			"models": []string{
				"granite3.2-vision:2b",
			},
		},
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(servers)
}

// Handler para obtener servidor por ID
func handleServerByID(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	
	// Extraer ID del path
	path := r.URL.Path
	id := path[len("/api/v1/servers/"):]
	
	servers := []map[string]interface{}{
		{
			"id":          "1",
			"name":        "Servidor Principal",
			"host":        "192.168.0.104",
			"port":        11434,
			"status":      "online",
			"isDefault":   true,
			"description": "Servidor Ollama principal",
			"gpu":         "NVIDIA RTX 3090",
			"memory":      "24GB",
			"models": []string{
				"granite3.2-vision:2b",
				"llama3.1",
				"mistral",
				"codellama",
			},
		},
		{
			"id":          "2",
			"name":        "Servidor Secundario",
			"host":        "192.168.0.105",
			"port":        11434,
			"status":      "online",
			"isDefault":   false,
			"description": "Servidor Ollama de respaldo",
			"gpu":         "NVIDIA RTX 3080",
			"memory":      "16GB",
			"models": []string{
				"granite3.2-vision:2b",
				"llama3.1",
				"phi3",
			},
		},
		{
			"id":          "3",
			"name":        "Servidor de Pruebas",
			"host":        "10.10.1.131",
			"port":        11434,
			"status":      "online",
			"isDefault":   false,
			"description": "Servidor Ollama de pruebas",
			"gpu":         "NVIDIA RTX 3090",
			"memory":      "24GB",
			"models": []string{
				"granite3.2-vision:2b",
			},
		},
	}
	
	// Buscar servidor
	for _, server := range servers {
		if server["id"] == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(server)
			return
		}
	}
	
	// No encontrado
	http.Error(w, "Server not found", http.StatusNotFound)
}

// Handler para métricas del sistema
func handleSystemMetrics(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	
	metrics := SystemMetrics{
		CPUUsage:    45.2, // Mock data
		MemoryUsage: float64(m.Alloc) / 1024 / 1024,
		Timestamp:   time.Now().Format(time.RFC3339),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}

// Handler para proxy de Ollama
func handleOllamaProxy(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	
	// Por ahora retornar mock data
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok",
		"server": "10.10.1.131:11434",
	})
}

// Handler para chat con Ollama
func handleOllamaChat(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	if r.Method == "OPTIONS" {
		return
	}

	// Verificar método
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parsear request
	var chatReq struct {
		Model    string `json:"model"`
		Messages []struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"messages"`
		Stream bool `json:"stream"`
	}

	if err := json.NewDecoder(r.Body).Decode(&chatReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Por defecto usar granite3.2-vision:2b
	if chatReq.Model == "" {
		chatReq.Model = "granite3.2-vision:2b"
	}

	// Configurar servidor Ollama
	ollamaURL := "http://10.10.1.131:11434" // Servidor de pruebas
	
	// Preparar petición para Ollama
	ollamaReqBody, err := json.Marshal(chatReq)
	if err != nil {
		http.Error(w, "Error preparing request", http.StatusInternalServerError)
		return
	}

	// Hacer petición a Ollama
	resp, err := http.Post(
		fmt.Sprintf("%s/api/chat", ollamaURL),
		"application/json",
		bytes.NewBuffer(ollamaReqBody),
	)
	
	if err != nil {
		log.Printf("Error connecting to Ollama: %v", err)
		// Respuesta simulada si falla la conexión
		response := map[string]interface{}{
			"message": map[string]interface{}{
				"role":    "assistant",
				"content": fmt.Sprintf("Lo siento, no puedo conectar con el servidor Ollama en %s. Por favor verifica que el servidor esté funcionando y que el modelo %s esté disponible.", ollamaURL, chatReq.Model),
			},
			"done": true,
			"model": chatReq.Model,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Error reading response", http.StatusInternalServerError)
		return
	}

	// Reenviar respuesta
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}

// Handler para verificar token
func handleVerifyToken(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"valid": true})
}

// Handlers adicionales para compatibilidad
func psHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"models": []map[string]interface{}{
			{
				"name": "granite3.2-vision:2b",
				"size": 2147483648,
				"digest": "abc123",
			},
		},
	})
}

func tagsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"models": []map[string]interface{}{
			{
				"name": "granite3.2-vision:2b",
				"modified_at": time.Now().Format(time.RFC3339),
				"size": 2147483648,
			},
		},
	})
}

func faviconHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotFound)
}

func wsGenerateHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	http.Error(w, "WebSocket not implemented", http.StatusNotImplemented)
}

func ollamaTagsHandler(w http.ResponseWriter, r *http.Request) {
	tagsHandler(w, r)
}

func generateHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	http.Error(w, "Generate endpoint not implemented", http.StatusNotImplemented)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	// Rutas de la API
	http.HandleFunc("/api/v1/auth/login", loginHandler)
	http.HandleFunc("/api/v1/auth/verify", authMiddleware(handleVerifyAuth))
	http.HandleFunc("/api/v1/auth/me", authMiddleware(handleGetCurrentUser))
	http.HandleFunc("/api/v1/auth/logout", authMiddleware(handleLogout))
	
	// Health check
	http.HandleFunc("/api/v1/health", handleHealth)
	
	// Server endpoints
	http.HandleFunc("/api/v1/servers", handleServers)
	http.HandleFunc("/api/v1/servers/", handleServerByID)
	
	// System metrics
	http.HandleFunc("/api/v1/metrics/system", authMiddleware(handleSystemMetrics))
	
	// Ollama proxy endpoints
	http.HandleFunc("/api/v1/ollama/", authMiddleware(handleOllamaProxy))
	
	// Ollama chat endpoint
	http.HandleFunc("/api/ollama/chat", handleOllamaChat)
	
	// Auth verification endpoint
	http.HandleFunc("/api/auth/verify-token", authMiddleware(handleVerifyToken))
	http.HandleFunc("/api/auth/me", authMiddleware(handleGetCurrentUser))
	
	// Compatibilidad
	http.HandleFunc("/api/ps", psHandler)
	http.HandleFunc("/api/tags", tagsHandler)
	http.HandleFunc("/api/favicon.ico", faviconHandler)
	http.HandleFunc("/ws/generate", wsGenerateHandler)
	http.HandleFunc("/api/v1/ollama/tags", ollamaTagsHandler)
	http.HandleFunc("/api/v1/ollama/ps", psHandler)
	http.HandleFunc("/api/v1/ollama/generate", generateHandler)

	// Middleware CORS global
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		http.DefaultServeMux.ServeHTTP(w, r)
	})

	log.Printf("🚀 CogniTrack Backend v2.0.0-go iniciado en puerto %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
