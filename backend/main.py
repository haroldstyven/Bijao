from fastapi import FastAPI

app = FastAPI(title="Bijao API", version="1.0")

@app.get("/")
def read_root():
    return {"mensaje": "¡El backend de Bijao está vivo y conectado!"}