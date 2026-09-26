# Contribuciones a CogniTrack

## Cómo Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Guía de Estilo

- Usa Python 3.9+
- Sigue PEP 8
- Escribe docstrings
- Añade pruebas unitarias

## Desarrollo

### Configuración del Entorno

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

### Ejecutar Pruebas

```bash
pytest tests/
```

## Proceso de Revisión

- Todos los PRs requieren revisión
- Asegúrate de que las pruebas pasen
- Mantén el código limpio y documentado
