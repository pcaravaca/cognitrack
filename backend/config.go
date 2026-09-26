package main

import (
	"log"
	"os"
	"runtime"
	"time"
)

// Configuración de la aplicación
type Config struct {
	Port         string
	Environment  string
	LogLevel     string
	EnableCORS   bool
	CORSOrigins  []string
	StartTime    time.Time
}

// Obtener configuración desde variables de entorno
func getConfig() *Config {
	return &Config{
		Port:        getEnvOrDefault("PORT", "8081"),
		Environment: getEnvOrDefault("NODE_ENV", "development"),
		LogLevel:    getEnvOrDefault("LOG_LEVEL", "info"),
		EnableCORS:  getEnvOrDefault("ENABLE_CORS", "true") == "true",
		CORSOrigins: getEnvSliceOrDefault("CORS_ORIGINS", []string{"*"}),
		StartTime:   time.Now(),
	}
}

// Función auxiliar para obtener variable de entorno con valor por defecto
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// Función auxiliar para obtener variable de entorno como slice
func getEnvSliceOrDefault(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		// Aquí podrías implementar lógica para parsear strings separados por comas
		// Por simplicidad, retornamos el valor por defecto
		return defaultValue
	}
	return defaultValue
}

// Función para loggear información de configuración
func logConfig(config *Config) {
	log.Printf("📊 [CONFIG] Puerto: %s", config.Port)
	log.Printf("📊 [CONFIG] Entorno: %s", config.Environment)
	log.Printf("📊 [CONFIG] Nivel de log: %s", config.LogLevel)
	log.Printf("📊 [CONFIG] CORS habilitado: %v", config.EnableCORS)
	log.Printf("📊 [CONFIG] Orígenes CORS: %v", config.CORSOrigins)
	log.Printf("📊 [CONFIG] Variables de entorno totales: %d", len(os.Environ()))
}

// Función para loggear información del sistema
func logSystemInfo() {
	log.Printf("🔧 [SYSTEM] Sistema Operativo: %s %s", runtime.GOOS, runtime.GOARCH)
	log.Printf("🔧 [SYSTEM] CPUs disponibles: %d", runtime.NumCPU())
	log.Printf("🔧 [SYSTEM] Versión Go: %s", runtime.Version())
	log.Printf("🔧 [SYSTEM] Número de goroutines iniciales: %d", runtime.NumGoroutine())
}
