package main

import (
	"log"
	"time"
)

// Función para loggear el inicio de una petición HTTP
func logRequestStart(method, path, remoteAddr string) {
	log.Printf("🔍 [REQUEST] %s %s desde %s", method, path, remoteAddr)
}

// Función para loggear el fin de una petición HTTP
func logRequestEnd(method, path string, statusCode int, duration time.Duration) {
	statusEmoji := getStatusEmoji(statusCode)
	log.Printf("✅ [RESPONSE] %s %s %d %s %v", statusEmoji, method, path, statusCode, duration)
}

// Función para obtener emoji según código de estado HTTP
func getStatusEmoji(statusCode int) string {
	switch {
	case statusCode >= 200 && statusCode < 300:
		return "✅"
	case statusCode >= 300 && statusCode < 400:
		return "🔄"
	case statusCode >= 400 && statusCode < 500:
		return "❌"
	case statusCode >= 500:
		return "💥"
	default:
		return "❓"
	}
}

// Función para loggear errores
func logError(message string, err error) {
	log.Printf("❌ [ERROR] %s: %v", message, err)
}

// Función para loggear warnings
func logWarning(message string) {
	log.Printf("⚠️ [WARNING] %s", message)
}

// Función para loggear información importante
func logInfo(message string) {
	log.Printf("ℹ️ [INFO] %s", message)
}

// Función para loggear información de debug
func logDebug(message string) {
	// Puedes implementar lógica para filtrar por nivel de log aquí
	log.Printf("🔍 [DEBUG] %s", message)
}
