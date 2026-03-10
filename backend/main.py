from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from models import UserRegister, UserLogin, NegocioUpdate, ProductoCreate, ProductoUpdate
import pandas as pd
import io
import math

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
def registrar_usuario(user: UserRegister):
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
def iniciar_sesion(user: UserLogin):
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
        productos_db = supabase.table("productos").select("*").eq("negocio_id", negocio_id).order("created_at", desc=True).execute()
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

# 10. Importar Productos masivamente desde Excel
@app.post("/api/inventario/{negocio_id}/importar")
async def importar_productos_excel(negocio_id: str, file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="El archivo debe ser un Excel (.xlsx o .xls)")
        
    try:
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        
        # Diccionario para mapear posibles nombres de columnas en el Excel a nuestro esquema
        column_mapping = {
            "nombre": "nombre", "producto": "nombre",
            "categoria": "categoria", "categoría": "categoria",
            "precio": "precio_venta", "precio de venta": "precio_venta", "precio_venta": "precio_venta",
            "costo": "costo", "costo unitario": "costo",
            "stock": "stock_actual", "stock inicial": "stock_actual", "cantidad": "stock_actual", "stock_actual": "stock_actual",
            "stock minimo": "stock_minimo", "stock mínimo": "stock_minimo", "stock_minimo": "stock_minimo",
            "tipo": "tipo"
        }
        
        # Renombrar columnas a minúsculas y quitar espacios extra para facilitar el mapeo
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        # Mapear columnas del df a las esperadas
        mapped_df = pd.DataFrame()
        for excel_col, df_col in df.items():
            if excel_col in column_mapping:
                mapped_df[column_mapping[excel_col]] = df_col
                
        if "nombre" not in mapped_df.columns:
            raise HTTPException(status_code=400, detail="El excel debe tener al menos una columna 'nombre' o 'producto'")

        productos_a_insertar = []
        for index, row in mapped_df.iterrows():
            if pd.isna(row.get('nombre')) or str(row.get('nombre')).strip() == '':
                continue # Saltar filas sin nombre
                
            # Limpiar NaNs (convertirlos a None o sus valores numéricos por defecto)
            def clean_number(val, default=0):
                if pd.isna(val) or val == "" or val is None:
                    return default
                return float(val)
                
            producto = {
                "negocio_id": negocio_id,
                "nombre": str(row.get('nombre')),
                "categoria": str(row.get('categoria', 'General')) if pd.notna(row.get('categoria')) else 'General',
                "precio_venta": clean_number(row.get('precio_venta')),
                "costo": clean_number(row.get('costo')),
                "stock_actual": int(clean_number(row.get('stock_actual'))),
                "stock_minimo": int(clean_number(row.get('stock_minimo'))),
                "tipo": str(row.get('tipo', 'PRODUCTO')).upper() if pd.notna(row.get('tipo')) else 'PRODUCTO'
            }
            productos_a_insertar.append(producto)
            
        if not productos_a_insertar:
            raise HTTPException(status_code=400, detail="No se encontraron productos válidos para importar")
            
        # Bulk insert
        resultado = supabase.table("productos").insert(productos_a_insertar).execute()
        
        return {
            "mensaje": f"Se importaron {len(productos_a_insertar)} productos exitosamente",
            "data": resultado.data
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error procesando el Excel: {str(e)}")