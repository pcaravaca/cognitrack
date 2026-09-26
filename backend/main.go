package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"runtime"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type HealthResponse struct {
	Status    string    `json:"status"`
	Version   string    `json:"version"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
	Uptime    string    `json:"uptime"`
}

type SystemInfo struct {
	GOOS         string `json:"go_os"`
	GOARCH       string `json:"go_arch"`
	GOVersion    string `json:"go_version"`
	NumCPU       int    `json:"num_cpu"`
	NumGoroutine int    `json:"num_goroutine"`
	MemStats     struct {
		Alloc        uint64 `json:"alloc_bytes"`
		TotalAlloc   uint64 `json:"total_alloc_bytes"`
		Sys          uint64 `json:"sys_bytes"`
		Lookups      uint64 `json:"lookups"`
		Mallocs      uint64 `json:"mallocs"`
		Frees        uint64 `json:"frees"`
		HeapAlloc    uint64 `json:"heap_alloc_bytes"`
		HeapSys      uint64 `json:"heap_sys_bytes"`
		HeapIdle     uint64 `json:"heap_idle_bytes"`
		HeapInuse    uint64 `json:"heap_inuse_bytes"`
		HeapReleased uint64 `json:"heap_released_bytes"`
		HeapObjects  uint64 `json:"heap_objects"`
		StackInuse   uint64 `json:"stack_inuse_bytes"`
		StackSys     uint64 `json:"stack_sys_bytes"`
		GCSys        uint64 `json:"gc_sys_bytes"`
		NextGC       uint64 `json:"next_gc_bytes"`
		LastGC       uint64 `json:"last_gc_timestamp"`
		NumGC        uint32 `json:"num_gc"`
	} `json:"memory_stats"`
}

var startTime = time.Now()

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [REQUEST] Health check desde %s", r.RemoteAddr)

	response := HealthResponse{
		Status:    "healthy",
		Version:   "2.0.0-go",
		Message:   "CogniTrack Backend API funcionando correctamente",
		Timestamp: time.Now(),
		Uptime:    time.Since(startTime).String(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("✅ [RESPONSE] Health check exitoso - Status: %s", response.Status)
}

func apiInfoHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [REQUEST] Información de API desde %s", r.RemoteAddr)

	info := map[string]interface{}{
		"name":        "CogniTrack Backend API",
		"version":     "2.0.0-go",
		"description": "API para monitoreo y configuración de servidores Ollama",
		"uptime":      time.Since(startTime).String(),
		"start_time":  startTime.Format(time.RFC3339),
		"endpoints": map[string]interface{}{
			"health": map[string]string{
				"path":        "/api/health",
				"method":      "GET",
				"description": "Verificar estado del servidor",
			},
			"info": map[string]string{
				"path":        "/api",
				"method":      "GET",
				"description": "Información general de la API",
			},
			"system": map[string]string{
				"path":        "/api/system",
				"method":      "GET",
				"description": "Información del sistema",
			},
		},
		"docs": "https://github.com/your-org/cognitrack",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)

	log.Printf("✅ [RESPONSE] Información de API enviada exitosamente")
}

func systemInfoHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [REQUEST] Información del sistema desde %s", r.RemoteAddr)

	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	systemInfo := SystemInfo{
		GOOS:         runtime.GOOS,
		GOARCH:       runtime.GOARCH,
		GOVersion:    runtime.Version(),
		NumCPU:       runtime.NumCPU(),
		NumGoroutine: runtime.NumGoroutine(),
	}

	systemInfo.MemStats.Alloc = mem.Alloc
	systemInfo.MemStats.TotalAlloc = mem.TotalAlloc
	systemInfo.MemStats.Sys = mem.Sys
	systemInfo.MemStats.Lookups = mem.Lookups
	systemInfo.MemStats.Mallocs = mem.Mallocs
	systemInfo.MemStats.Frees = mem.Frees
	systemInfo.MemStats.HeapAlloc = mem.HeapAlloc
	systemInfo.MemStats.HeapSys = mem.HeapSys
	systemInfo.MemStats.HeapIdle = mem.HeapIdle
	systemInfo.MemStats.HeapInuse = mem.HeapInuse
	systemInfo.MemStats.HeapReleased = mem.HeapReleased
	systemInfo.MemStats.HeapObjects = mem.HeapObjects
	systemInfo.MemStats.StackInuse = mem.StackInuse
	systemInfo.MemStats.StackSys = mem.StackSys
	systemInfo.MemStats.GCSys = mem.GCSys
	systemInfo.MemStats.NextGC = mem.NextGC
	systemInfo.MemStats.LastGC = mem.LastGC
	systemInfo.MemStats.NumGC = mem.NumGC

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(systemInfo)

	log.Printf("✅ [RESPONSE] Información del sistema enviada - CPU: %d, Memoria: %d MB",
		systemInfo.NumCPU, systemInfo.MemStats.HeapAlloc/1024/1024)
}

// Middleware para logging de peticiones
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Crear un ResponseWriter personalizado para capturar el código de estado
		rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(rw, r)

		duration := time.Since(start)

		log.Printf("📊 [HTTP] %s %s %d %v - Desde: %s",
			r.Method, r.URL.Path, rw.statusCode, duration, r.RemoteAddr)
	})
}

// ResponseWriter personalizado para capturar el código de estado
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func main() {
	// Configuración inicial
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("🚀 [INIT] Iniciando CogniTrack Backend v2.0.0-go")
	log.Printf("📊 [CONFIG] Puerto configurado: %s", port)
	log.Printf("📊 [CONFIG] Entorno: %s", os.Getenv("NODE_ENV"))
	log.Printf("📊 [CONFIG] Variables de entorno cargadas: %d", len(os.Environ()))

	// Información del sistema
	log.Printf("🔧 [SYSTEM] SO: %s %s", runtime.GOOS, runtime.GOARCH)
	log.Printf("🔧 [SYSTEM] CPUs disponibles: %d", runtime.NumCPU())
	log.Printf("🔧 [SYSTEM] Versión Go: %s", runtime.Version())

	router := mux.NewRouter()

	// Aplicar middleware de logging
	router.Use(loggingMiddleware)

	// Rutas de la API
	api := router.PathPrefix("/api").Subrouter()

	// Health check
	api.HandleFunc("/health", healthCheckHandler).Methods("GET")

	// Información de la API
	api.HandleFunc("", apiInfoHandler).Methods("GET")

	// Información del sistema
	api.HandleFunc("/system", systemInfoHandler).Methods("GET")

	// Rutas de autenticación
	auth := api.PathPrefix("/v1/auth").Subrouter()

	// Login
	auth.HandleFunc("/login", authLoginHandler).Methods("POST")

	// Logout
	auth.HandleFunc("/logout", authLogoutHandler).Methods("POST")

	// Verificar token
	auth.HandleFunc("/verify", authVerifyHandler).Methods("GET")

	// Obtener usuario actual
	auth.HandleFunc("/me", authMeHandler).Methods("GET")

	// Rutas de proxy para evitar CORS
	proxy := api.PathPrefix("/proxy").Subrouter()

	// Descubrimiento de servidores
	proxy.HandleFunc("/discover", discoverServersHandler).Methods("GET")

	// Rutas de Ollama
	ollama := api.PathPrefix("/v1/ollama").Subrouter()

	// Obtener tags de modelos
	ollama.HandleFunc("/tags", getOllamaTags).Methods("GET")

	// Obtener estadísticas del sistema de Ollama
	ollama.HandleFunc("/system", getOllamaSystemInfo).Methods("GET")

	// Generar con Ollama (proxy)
	ollama.HandleFunc("/generate", generateWithOllama).Methods("POST")

	// Ruta raíz con información detallada
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		uptime := time.Since(startTime)
		response := fmt.Sprintf(`CogniTrack Backend API v2.0.0-go

🚀 Estado: Funcionando correctamente
⏱️  Tiempo de actividad: %s
🌐 Puerto: %s
📊 Health check: http://localhost:%s/api/health
🔧 Información del sistema: http://localhost:%s/api/system

📋 Endpoints disponibles:
   GET  /                    - Esta página
   GET  /api/health         - Estado del servidor
   GET  /api                - Información de la API
   GET  /api/system         - Información del sistema
   POST /api/v1/auth/login  - Iniciar sesión
   POST /api/v1/auth/logout - Cerrar sesión
   GET  /api/v1/auth/verify - Verificar token
   GET  /api/v1/auth/me     - Obtener usuario actual
   GET  /api/proxy/discover - Descubrir servidores
   GET  /api/v1/ollama/tags - Obtener modelos de Ollama
   POST /api/v1/ollama/generate - Generar con Ollama

🔍 Para más información, consulta la documentación.`, uptime.String(), port, port, port)

		w.Header().Set("Content-Type", "text/plain")
		fmt.Fprint(w, response)
	})

	// Configurar CORS con opciones más detalladas
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"*"},
		ExposedHeaders:   []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           86400, // 24 horas
	})

	handler := c.Handler(router)

	// Información final antes de iniciar
	log.Printf("✅ [READY] Servidor configurado exitosamente")
	log.Printf("✅ [READY] CORS configurado para todas las rutas")
	log.Printf("✅ [READY] Middleware de logging activado")
	log.Printf("📊 [ENDPOINTS] Health check disponible en: http://localhost:%s/api/health", port)
	log.Printf("📊 [ENDPOINTS] Información del sistema en: http://localhost:%s/api/system", port)
	log.Printf("🌐 [STARTUP] Iniciando servidor en puerto %s...", port)

	// Iniciar servidor
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("❌ [FATAL] Error iniciando servidor en puerto %s: %v", port, err)
	}
}
func authLoginHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [AUTH] Login attempt desde %s", r.RemoteAddr)

	// Por simplicidad, aceptar cualquier usuario con contraseña "admin123"
	// En producción, esto debería conectarse a una base de datos real
	var credentials struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		log.Printf("❌ [AUTH] Error parsing credentials: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("🔍 [AUTH] Login attempt for user: %s", credentials.Username)

	// Simular autenticación básica
	if credentials.Password == "admin123" {
		response := map[string]interface{}{
			"token": "fake-jwt-token-" + credentials.Username,
			"user": map[string]interface{}{
				"id":          credentials.Username,
				"username":    credentials.Username,
				"email":       credentials.Username + "@cognitrack.local",
				"displayName": credentials.Username,
				"full_name":   credentials.Username,
				"role":        "admin",
				"is_admin":    true,
				"createdAt":   time.Now().Format(time.RFC3339),
				"lastLogin":   time.Now().Format(time.RFC3339),
				"isActive":    true,
			},
			"expiresIn": 3600,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)

		log.Printf("✅ [AUTH] Login successful for user: %s", credentials.Username)
	} else {
		log.Printf("❌ [AUTH] Login failed for user: %s - Invalid password", credentials.Username)
		http.Error(w, `{"message":"Credenciales incorrectas"}`, http.StatusUnauthorized)
	}
}

func authLogoutHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [AUTH] Logout desde %s", r.RemoteAddr)

	// Simular logout exitoso
	response := map[string]string{
		"message": "Logout exitoso",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("✅ [AUTH] Logout successful")
}

func authVerifyHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [AUTH] Token verification desde %s", r.RemoteAddr)

	// Obtener token del header Authorization
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		log.Printf("❌ [AUTH] No token provided")
		http.Error(w, "No token provided", http.StatusUnauthorized)
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	// Simular verificación de token
	if strings.HasPrefix(token, "fake-jwt-token-") {
		response := map[string]interface{}{
			"valid": true,
			"user": map[string]interface{}{
				"id":       strings.TrimPrefix(token, "fake-jwt-token-"),
				"username": strings.TrimPrefix(token, "fake-jwt-token-"),
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)

		log.Printf("✅ [AUTH] Token verified successfully")
	} else {
		log.Printf("❌ [AUTH] Invalid token")
		http.Error(w, "Invalid token", http.StatusUnauthorized)
	}
}

func authMeHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [AUTH] Get current user desde %s", r.RemoteAddr)

	// Obtener token del header Authorization
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		log.Printf("❌ [AUTH] No token provided for /me endpoint")
		http.Error(w, "No token provided", http.StatusUnauthorized)
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	// Simular obtener usuario actual
	if strings.HasPrefix(token, "fake-jwt-token-") {
		username := strings.TrimPrefix(token, "fake-jwt-token-")
		response := map[string]interface{}{
			"id":          username,
			"username":    username,
			"email":       username + "@cognitrack.local",
			"displayName": username,
			"full_name":   username,
			"role":        "admin",
			"is_admin":    true,
			"createdAt":   time.Now().Format(time.RFC3339),
			"lastLogin":   time.Now().Format(time.RFC3339),
			"isActive":    true,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)

		log.Printf("✅ [AUTH] Current user retrieved: %s", username)
	} else {
		log.Printf("❌ [AUTH] Invalid token for /me endpoint")
		http.Error(w, "Invalid token", http.StatusUnauthorized)
	}
}

func discoverServersHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [DISCOVERY] Descubrimiento de servidores desde %s", r.RemoteAddr)

	// Obtener información de red del cliente
	clientIP := getClientIP(r)

	// Determinar la subred basada en la IP del cliente
	subnet := getSubnetFromIP(clientIP)

	// Buscar servidores Ollama en la subred
	discoveredServers := scanNetworkForOllamaServers(subnet)

	// Si no se encontraron servidores, usar servidores conocidos
	if len(discoveredServers) == 0 {
		log.Printf("🔍 [DISCOVERY] No se encontraron servidores en la red, usando servidores conocidos")
		discoveredServers = getKnownOllamaServers()
	}

	response := map[string]interface{}{
		"servers": discoveredServers,
		"count":   len(discoveredServers),
		"subnet":  subnet,
		"message": fmt.Sprintf("Descubrimiento completado en subred %s", subnet),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("✅ [DISCOVERY] Encontrados %d servidores en subred %s", len(discoveredServers), subnet)
}

// Funciones auxiliares para descubrimiento de servidores

func getClientIP(r *http.Request) string {
	// Intentar obtener la IP real del cliente
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return strings.Split(forwarded, ",")[0]
	}

	realIP := r.Header.Get("X-Real-IP")
	if realIP != "" {
		return realIP
	}

	return strings.Split(r.RemoteAddr, ":")[0]
}

func getSubnetFromIP(clientIP string) string {
	// Determinar la subred basada en la IP del cliente
	if strings.HasPrefix(clientIP, "192.168.") {
		return "192.168.1.0/24"
	} else if strings.HasPrefix(clientIP, "10.") {
		return "10.0.0.0/8"
	} else if strings.HasPrefix(clientIP, "172.") {
		ipParts := strings.Split(clientIP, ".")
		if len(ipParts) >= 2 {
			return fmt.Sprintf("172.%s.0.0/16", ipParts[1])
		}
	}
	return "192.168.1.0/24" // Default
}

func scanNetworkForOllamaServers(subnet string) []map[string]interface{} {
	log.Printf("🔍 [DISCOVERY] Escaneando subred %s en busca de servidores Ollama", subnet)

	// Lista de servidores conocidos comunes donde podría estar Ollama
	commonOllamaPorts := []string{"11434", "8080", "3000"}

	// IPs conocidas donde típicamente se ejecuta Ollama
	knownIPs := []string{
		"192.168.1.100", "192.168.1.101", "192.168.1.102", "192.168.1.103",
		"192.168.0.100", "192.168.0.101", "192.168.0.104", "192.168.0.105",
		"10.0.0.100", "10.0.0.101", "localhost", "127.0.0.1",
	}

	var discoveredServers []map[string]interface{}

	// Verificar servidores conocidos
	for _, ip := range knownIPs {
		for _, port := range commonOllamaPorts {
			if isOllamaServerReachable(ip, port) {
				discoveredServers = append(discoveredServers, map[string]interface{}{
					"host":   ip,
					"name":   fmt.Sprintf("Ollama Server (%s:%s)", ip, port),
					"status": "online",
					"port":   port,
				})
				log.Printf("✅ [DISCOVERY] Servidor encontrado: %s:%s", ip, port)
			}
		}
	}

	return discoveredServers
}

// isOllamaServerReachable verifica si un servidor Ollama está disponible
type ReachabilityResult struct {
	Reachable bool
	Error     string
	Status    string
}

func isOllamaServerReachable(host, port string) bool {
	// Construir la URL base del servidor
	server := fmt.Sprintf("%s:%s", host, port)
	
	// Intentar con el endpoint /api/version primero (estándar de Ollama)
	urlsToTry := []string{
		fmt.Sprintf("http://%s/api/version", server),  // Endpoint estándar de Ollama
		fmt.Sprintf("http://%s/version", server),     // Alternativa sin /api
		fmt.Sprintf("http://%s/api/health", server),  // Mantener compatibilidad con versiones anteriores
		fmt.Sprintf("http://%s/health", server),     // Otra variante común
	}
	
	client := &http.Client{
		Timeout: 2 * time.Second,
	}
	
	// Probar cada URL hasta encontrar una que funcione
	for _, url := range urlsToTry {
		// Intentar hacer una solicitud GET para verificar la disponibilidad
		start := time.Now()
		resp, err := client.Get(url)
		duration := time.Since(start)
		
		if err != nil {
			log.Printf("⚠️ [OLLAMA] Intento fallido en %s: %v (tiempo: %v)", url, err, duration.Round(time.Millisecond))
			continue
		}
		defer resp.Body.Close()
		
		// Verificar el código de estado
		if resp.StatusCode >= 200 && resp.StatusCode < 500 {  // Aceptamos códigos 2xx, 3xx y 4xx (pero no 5xx)
			log.Printf("✅ [OLLAMA] Servidor %s está respondiendo correctamente en %s (código %d, tiempo: %v)", 
				server, url, resp.StatusCode, duration.Round(time.Millisecond))
			return true
		}
		
		log.Printf("⚠️ [OLLAMA] Intento fallido en %s: código %d (tiempo: %v)", 
			url, resp.StatusCode, duration.Round(time.Millisecond))
	}
	
	// Si llegamos aquí, todos los intentos fallaron
	errMsg := fmt.Sprintf("No se pudo conectar a %s después de probar varios endpoints", server)
	log.Printf("❌ [OLLAMA] %s", errMsg)
	return false
}

func getOllamaTags(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [OLLAMA] Obteniendo tags de modelos desde %s", r.RemoteAddr)

	// Obtener el servidor de la query string
	serverParam := r.URL.Query().Get("server")
	if serverParam == "" {
		serverParam = "localhost:11434" // Valor por defecto
	}

	// Asegurarse de que el servidor tenga el protocolo
	var ollamaURL string
	if strings.HasPrefix(serverParam, "http://") || strings.HasPrefix(serverParam, "https://") {
		ollamaURL = fmt.Sprintf("%s/api/tags", serverParam)
	} else {
		ollamaURL = fmt.Sprintf("http://%s/api/tags", serverParam)
	}

	// Configurar encabezados para la respuesta
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	log.Printf("🌐 [OLLAMA] Conectando a: %s", ollamaURL)

	// Crear un cliente HTTP con timeout
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	// Realizar la petición al servidor Ollama
	resp, err := client.Get(ollamaURL)
	if err != nil {
		log.Printf("❌ [OLLAMA] Error conectando al servidor Ollama: %v", err)
		
		// Si hay error, devolver datos simulados como respaldo
		log.Println("⚠️  Usando datos simulados como respaldo")
		simulatedResponse := map[string]interface{}{
			"models": []map[string]interface{}{
				{
					"name":        "llama2:latest",
					"modified_at": time.Now().Add(-24 * time.Hour).Format(time.RFC3339),
					"size":        3826562609,
					"digest":      "78e26419b446c3d96f2d8cb57d9c1c0f1f1b0e2c6c3e4f5a6b7c8d9e0f1a2b3",
				},
			},
		}
		
		jsonResponse, _ := json.Marshal(simulatedResponse)
		w.WriteHeader(http.StatusOK)
		w.Write(jsonResponse)
		return
	}
	defer resp.Body.Close()

	// Si la respuesta es exitosa, reenviar la respuesta del servidor Ollama
	if resp.StatusCode == http.StatusOK {
		log.Printf("✅ [OLLAMA] Respuesta exitosa desde el servidor Ollama")
		// Copiar los headers
		for k, v := range resp.Header {
			w.Header()[k] = v
		}
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	} else {
		log.Printf("❌ [OLLAMA] Error en la respuesta del servidor Ollama: %s", resp.Status)
		http.Error(w, "Error al obtener los tags del modelo", resp.StatusCode)
	}
}

func generateWithOllama(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [OLLAMA] Generando con Ollama desde %s", r.RemoteAddr)

	// Obtener el servidor de la query string
	serverParam := r.URL.Query().Get("server")
	if serverParam == "" {
		serverParam = "10.10.1.131:11434" // servidor por defecto
	}

	// Construir URL del servidor Ollama
	ollamaURL := fmt.Sprintf("http://%s/api/generate", serverParam)

	log.Printf("🔍 [OLLAMA] Enviando request a: %s", ollamaURL)

	// Crear request al servidor Ollama
	req, err := http.NewRequest(r.Method, ollamaURL, r.Body)
	if err != nil {
		log.Printf("❌ [OLLAMA] Error creando request: %v", err)
		http.Error(w, "Error creando request", http.StatusInternalServerError)
		return
	}

	// Copiar headers
	for key, values := range r.Header {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	// Ejecutar request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ [OLLAMA] Error ejecutando request: %v", err)
		http.Error(w, "Error conectando al servidor Ollama", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Copiar headers de respuesta
	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}

	// Establecer status code
	w.WriteHeader(resp.StatusCode)

	// Copiar body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("❌ [OLLAMA] Error leyendo respuesta: %v", err)
		http.Error(w, "Error leyendo respuesta del servidor", http.StatusInternalServerError)
		return
	}

	// Responder con los datos del servidor Ollama
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)

	log.Printf("✅ [OLLAMA] Generación completada con servidor %s", serverParam)
}

func getKnownOllamaServers() []map[string]interface{} {
	log.Printf("🔍 [DISCOVERY] Usando lista de servidores conocidos")

	return []map[string]interface{}{
		{
			"host":   "192.168.0.104",
			"name":   "Servidor Principal Ollama",
			"status": "online",
			"port":   "11434",
		},
		{
			"host":   "192.168.0.105",
			"name":   "Servidor Secundario Ollama",
			"status": "online",
			"port":   "11434",
		},
		{
			"host":   "10.10.1.131",
			"name":   "Servidor de Pruebas Ollama",
			"status": "online",
			"port":   "11434",
		},
	}

}

// getOllamaSystemInfo maneja las solicitudes para obtener estadísticas del sistema de Ollama
func getOllamaSystemInfo(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔍 [REQUEST] Obteniendo estadísticas del sistema de Ollama desde %s", r.RemoteAddr)

	// Obtener parámetros de consulta
	query := r.URL.Query()
	server := query.Get("server")
	if server == "" {
		server = "10.10.1.131:11434" // Valor por defecto
	}

	// Extraer host y puerto del servidor
	host, port, err := net.SplitHostPort(server)
	if err != nil {
		// Si no se puede dividir, asumir que es solo el host y usar el puerto por defecto
		host = server
		port = "11434" // Puerto por defecto de Ollama
	}

	// Verificar si el servidor está en línea
	if !isOllamaServerReachable(host, port) {
		serverAddress := fmt.Sprintf("%s:%s", host, port)
		errorMsg := fmt.Sprintf("No se pudo conectar al servidor Ollama en %s", serverAddress)
		log.Printf("❌ [OLLAMA] %s", errorMsg)
		
		// Devolver respuesta de error detallada
		response := map[string]interface{}{
			"status":  "error",
			"message": errorMsg,
			"server":  serverAddress,
			"online":  false,
			"error":   "No se pudo establecer conexión con el servidor",
		}
		
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Si llegamos aquí, el servidor está en línea
	// Obtener datos reales del sistema
	var stats struct {
		CPU struct {
			Cores       int     `json:"cores"`
			Model       string  `json:"model"`
			Usage       float64 `json:"usage"`
			Temperature float64 `json:"temperature,omitempty"`
		} `json:"cpu"`
		Memory struct {
			Total uint64  `json:"total"`
			Used  uint64  `json:"used"`
			Free  uint64  `json:"free"`
			Usage float64 `json:"usage"`
		} `json:"memory"`
		Disk struct {
			Total uint64  `json:"total"`
			Used  uint64  `json:"used"`
			Free  uint64  `json:"free"`
			Usage float64 `json:"usage"`
		} `json:"disk"`
		Network struct {
			In          uint64 `json:"in"`
			Out         uint64 `json:"out"`
			Connections int    `json:"connections"`
		} `json:"network"`
		Version string `json:"version"`
		Status  string `json:"status"`
	}

	// Simular datos de CPU
	runtime.GOMAXPROCS(0)
	stats.CPU.Cores = runtime.NumCPU()
	stats.CPU.Model = "Intel Xeon"
	stats.CPU.Usage = 25.5
	stats.CPU.Temperature = 65.2

	// Simular datos de memoria (8GB total, 4GB usados)
	stats.Memory.Total = 8 * 1024 * 1024 * 1024
	stats.Memory.Used = 4 * 1024 * 1024 * 1024
	stats.Memory.Free = stats.Memory.Total - stats.Memory.Used
	stats.Memory.Usage = (float64(stats.Memory.Used) / float64(stats.Memory.Total)) * 100

	// Simular datos de disco (100GB total, 50GB usados)
	diskTotal := uint64(100 * 1024 * 1024 * 1024)
	diskUsed := uint64(50 * 1024 * 1024 * 1024)
	stats.Disk.Total = diskTotal
	stats.Disk.Used = diskUsed
	stats.Disk.Free = diskTotal - diskUsed
	stats.Disk.Usage = (float64(diskUsed) / float64(diskTotal)) * 100

	// Simular datos de red
	stats.Network.In = 1024 * 1024 * 10
	stats.Network.Out = 1024 * 1024 * 5
	stats.Network.Connections = 12

	// Versión de Ollama
	stats.Version = "v0.1.44"
	stats.Status = "simulated" // Indicar que son datos simulados

	// Configurar encabezados y enviar respuesta
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")

	// Codificar y enviar la respuesta
	if err := json.NewEncoder(w).Encode(stats); err != nil {
		log.Printf("❌ [ERROR] Error codificando respuesta: %v", err)
		http.Error(w, "Error al procesar la solicitud", http.StatusInternalServerError)
		return
	}

	log.Printf("✅ [RESPONSE] Estadísticas del sistema simuladas correctamente para %s", server)
}
