import asyncio
import psutil
import requests
import logging
from typing import Dict, Any
from .base_plugin import BasePlugin

class OllamaPlugin(BasePlugin):
    def __init__(self):
        # Configuración del servidor Ollama remoto
        self.server_ip = "10.10.1.210"
        self.server_port = 11434
        self.base_url = f"http://{self.server_ip}:{self.server_port}"
        self.logger = logging.getLogger(__name__)
        self.logger.info(f"Inicializando OllamaPlugin con servidor remoto: {self.base_url}")

    async def get_metrics(self) -> Dict[str, Any]:
        try:
            metrics = {
                "cpu": self._get_cpu_metrics(),
                "memory": self._get_memory_metrics(),
                "models": self._list_models(),
                "containers": self._get_containers(),
                "gpu": self._get_gpu_metrics()
            }
            return metrics
        except Exception as e:
            self.logger.error(f"Error obteniendo métricas: {e}")
            return {
                "error": str(e),
                "cpu": [],
                "memory": {},
                "models": [],
                "containers": [],
                "gpu": {}
            }

    def _get_cpu_metrics(self):
        try:
            return [
                {"time": "now", "value": psutil.cpu_percent(interval=1)}
            ]
        except Exception as e:
            self.logger.warning(f"Error obteniendo métricas de CPU: {e}")
            return []

    def _get_memory_metrics(self):
        try:
            mem = psutil.virtual_memory()
            return {
                "total": round(mem.total / (1024 ** 3), 2),
                "used": round(mem.used / (1024 ** 3), 2),
                "free": round(mem.free / (1024 ** 3), 2),
                "percentage": mem.percent
            }
        except Exception as e:
            self.logger.warning(f"Error obteniendo métricas de memoria: {e}")
            return {}

    def _list_models(self):
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            models = response.json().get('models', [])
            return [
                {"name": model.get('name', 'Unknown'), "size": f"{model.get('size', 0)} MB"} 
                for model in models
            ]
        except Exception as e:
            self.logger.warning(f"Error listando modelos: {e}")
            return []

    def _get_containers(self):
        try:
            # Fallback a una lista vacía si Docker no está disponible
            return []
        except Exception as e:
            self.logger.warning(f"Error obteniendo contenedores: {e}")
            return []

    def _get_gpu_metrics(self):
        # Placeholder para métricas de GPU
        return {"usage": 0, "memory": 0}

    async def configure(self, action: str, config: Dict[str, Any]) -> Dict[str, Any]:
        try:
            if action == "pull_model":
                return self._pull_model(config.get('model_name'))
            elif action == "delete_model":
                return self._delete_model(config.get('model_name'))
            else:
                raise ValueError(f"Acción no soportada: {action}")
        except Exception as e:
            self.logger.error(f"Error en configuración: {e}")
            return {"status": "error", "message": str(e)}

    def _pull_model(self, model_name: str):
        try:
            response = requests.post(
                f"{self.base_url}/api/pull", 
                json={"name": model_name}
            )
            return {"status": "success", "details": response.json()}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def _delete_model(self, model_name: str):
        try:
            response = requests.delete(
                f"{self.base_url}/api/delete", 
                json={"name": model_name}
            )
            return {"status": "success", "details": response.json()}
        except Exception as e:
            return {"status": "error", "message": str(e)}

Plugin = OllamaPlugin
