import uvicorn

def start():
    """Inicia el servidor con Uvicorn."""
    uvicorn.run(
        "src.ai_sytem_backend.main:app", host="0.0.0.0", port=7013, reload=True
    )
