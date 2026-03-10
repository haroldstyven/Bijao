from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from models import UserAuth, NegocioUpdate, ProductoCreate, ProductoUpdate

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
        
        user_id = response.user.id
        
        # 1. Crear un negocio por defecto
        nuevo_negocio = supabase.table("negocios").insert({
            "nombre": "Mi Negocio"
        }).execute()
        
        negocio_id = nuevo_negocio.data[0]["id"]
        
        # 2. Insertar el perfil del usuario público asociado al negocio
        supabase.table("usuarios").insert({
            "id": user_id,
            "negocio_id": negocio_id,
            "nombre": user.name,
            "rol": "ADMIN"
        }).execute()

        # Iniciar sesión automáticamente después de registrar
        sign_in_response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        return {
            "mensaje": "Usuario y negocio creados exitosamente", 
            "access_token": sign_in_response.session.access_token,
            "usuario_id": user_id,
            "negocio_id": negocio_id,
            "onboarding_completado": False
        }
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
        
        user_id = response.user.id
        
        # Consultar la tabla usuarios para obtener negocio_id
        usuario_db = supabase.table("usuarios").select("negocio_id").eq("id", user_id).execute()
        negocio_id = usuario_db.data[0]["negocio_id"] if usuario_db.data else None
        
        onboarding_completado = False
        if negocio_id:
            # Consultar la tabla negocios para ver si completó el onboarding
            negocio_db = supabase.table("negocios").select("onboarding_completado").eq("id", negocio_id).execute()
            if negocio_db.data:
                onboarding_completado = negocio_db.data[0].get("onboarding_completado", False)

        # Si es exitoso, Supabase devuelve un Token JWT (access_token)
        return {
            "mensaje": "Login exitoso",
            "access_token": response.session.access_token,
            "usuario_id": user_id,
            "negocio_id": negocio_id,
            "onboarding_completado": onboarding_completado
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

# 4. Obtener Negocio (Ajustes y Sidebar)
@app.get("/api/negocios/{negocio_id}")
def obtener_negocio(negocio_id: str):
    try:
        # Consultar la tabla negocios para obtener todos los campos
        negocio_db = supabase.table("negocios").select("*").eq("id", negocio_id).execute()
        
        if not negocio_db.data:
            raise HTTPException(status_code=404, detail="Negocio no encontrado")
            
        return negocio_db.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 5. Actualizar Negocio (Onboarding o Ajustes)
@app.put("/api/negocios/{negocio_id}")
def actualizar_negocio(negocio_id: str, negocio: NegocioUpdate):
    try:
        # Extraer solo los campos que fueron enviados (no None)
        update_data = {k: v for k, v in negocio.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            return {"mensaje": "No hay datos para actualizar"}
            
        result = supabase.table("negocios").update(update_data).eq("id", negocio_id).execute()
        
        return {"mensaje": "Negocio actualizado correctamente", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 6. Crear Producto
@app.post("/api/inventario")
def crear_producto(producto: ProductoCreate):
    try:
        nuevo_producto = supabase.table("productos").insert(producto.dict()).execute()
        return {"mensaje": "Producto creado exitosamente", "data": nuevo_producto.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 7. Obtener Productos por Negocio
@app.get("/api/inventario/{negocio_id}")
def obtener_productos(negocio_id: str):
    try:
        productos_db = supabase.table("productos").select("*").eq("negocio_id", negocio_id).execute()
        return {"data": productos_db.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 8. Actualizar Producto
@app.put("/api/inventario/{producto_id}")
def actualizar_producto(producto_id: str, producto: ProductoUpdate):
    try:
        update_data = {k: v for k, v in producto.dict(exclude_unset=True).items() if v is not None}
        if not update_data:
            return {"mensaje": "No hay datos para actualizar"}
            
        result = supabase.table("productos").update(update_data).eq("id", producto_id).execute()
        return {"mensaje": "Producto actualizado", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 9. Eliminar Producto
@app.delete("/api/inventario/{producto_id}")
def eliminar_producto(producto_id: str):
    try:
        supabase.table("productos").delete().eq("id", producto_id).execute()
        return {"mensaje": "Producto eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))