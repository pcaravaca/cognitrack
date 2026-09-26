from abc import ABC, abstractmethod
from typing import Dict, Any

class BasePlugin(ABC):
    @abstractmethod
    async def get_metrics(self) -> Dict[str, Any]:
        """Obtener métricas del sistema"""
        pass

    @abstractmethod
    async def configure(self, action: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Configurar plataforma"""
        pass
