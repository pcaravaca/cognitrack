# CogniTrack - Script de Despliegue

## 🚀 **Un Solo Script - Todo Automático**

**Solo necesitas ejecutar:**
```bash
./deploy.sh
```

## 📋 **¿Qué hace automáticamente?**

1. ✅ **Detecta si SSH funciona**
   - Si SSH funciona → Despliegue remoto en servidor
   - Si SSH no funciona → Despliegue local en tu máquina

2. ✅ **Instala dependencias**
   - Docker y Docker Compose
   - Nginx como proxy reverso

3. ✅ **Construye la aplicación**
   - Frontend (Vue.js)
   - Backend (Go)

4. ✅ **Configura todo**
   - Docker Compose
   - Nginx proxy reverso
   - Permisos y directorios

5. ✅ **Inicia la aplicación**
   - Todos los servicios funcionando
   - URLs de acceso mostradas

## 🎯 **Uso**

```bash
# Despliegue automático (usa servidor por defecto)
./deploy.sh

# Despliegue en servidor específico
./deploy.sh 10.10.1.185

# Mostrar ayuda
./deploy.sh help
```

## 📊 **Resultado**

- **Despliegue remoto**: `http://10.10.1.185`
- **Despliegue local**: `http://localhost`

## 🔧 **Configuración por defecto**

- **Usuario SSH**: peter
- **Puerto SSH**: 2222
- **Puerto Backend**: 8081
- **Servidor por defecto**: 10.10.1.185

## 🆘 **Si no funciona**

### **Opción 1: Instalar Docker**
```bash
# Solo si Docker no está instalado
./final-solution.sh
# Elige opción 1 para instrucciones de instalación
```

### **Opción 2: Usar PowerShell**
```powershell
# Si prefieres PowerShell (tienes Deploy.ps1)
.\Deploy.ps1 -ServerIP "10.10.1.185" -Username "peter"
```

### **Opción 3: Despliegue manual**
```bash
# Ver instrucciones paso a paso
./final-solution.sh
# Elige opción 3
```

## 🎉 **¡Listo!**

**Un script, una línea, todo automático.** Ya no hay scripts confusos ni comandos complicados.

## 📁 **Archivos**

- ✅ `deploy.sh` - **Script principal**
- ✅ `README.md` - **Estas instrucciones**
- ❌ **Sin archivos confusos**
