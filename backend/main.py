from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from models import UserAuth

app = FastAPI(title="Bijao API", version="1.0")

# 1. Configurar CORS (Permitir que Next.js se conecte al Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambiaremos "*" por tu URL de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"mensaje": "¡El backend de Bijao está vivo y conectado!"}

# 2. Endpoint de Registro
@app.post("/auth/registro")
def registrar_usuario(user: UserAuth):
    try:
        # Llama a Supabase para crear el usuario
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        return {"mensaje": "Usuario creado exitosamente", "usuario_id": response.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 3. Endpoint de Login
@app.post("/auth/login")
def iniciar_sesion(user: UserAuth):
    try:
        # Llama a Supabase para verificar credenciales
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        # Si es exitoso, Supabase devuelve un Token JWT (access_token)
        return {
            "mensaje": "Login exitoso",
            "access_token": response.session.access_token,
            "usuario_id": response.user.id
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")