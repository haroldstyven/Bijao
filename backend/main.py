from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from models import UserRegister, UserLogin, NegocioUpdate, ProductoCreate, ProductoUpdate, ClienteCreate, ClienteUpdate, VentaCreate, CotizacionCreate, CotizacionUpdate
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


# --- MÓDULO DE CLIENTES ---

# 11. Obtener Clientes de un Negocio
@app.get("/api/clientes/{negocio_id}")
def obtener_clientes(negocio_id: str):
    try:
        result = supabase.table("clientes").select("*").eq("negocio_id", negocio_id).order("created_at", desc=True).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 12. Crear Cliente
@app.post("/api/clientes")
def crear_cliente(cliente: ClienteCreate):
    try:
        nuevo_cliente = cliente.dict()
        result = supabase.table("clientes").insert(nuevo_cliente).execute()
        return {"mensaje": "Cliente creado exitosamente", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 13. Actualizar Cliente
@app.put("/api/clientes/{cliente_id}")
def actualizar_cliente(cliente_id: str, cliente: ClienteUpdate):
    try:
        update_data = {k: v for k, v in cliente.dict(exclude_unset=True).items() if v is not None}
        if not update_data:
            return {"mensaje": "No hay datos para actualizar"}
            
        result = supabase.table("clientes").update(update_data).eq("id", cliente_id).execute()
        return {"mensaje": "Cliente actualizado", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 14. Eliminar Cliente
@app.delete("/api/clientes/{cliente_id}")
def eliminar_cliente(cliente_id: str):
    try:
        supabase.table("clientes").delete().eq("id", cliente_id).execute()
        return {"mensaje": "Cliente eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- MÓDULO DE VENTAS Y FACTURACIÓN ---

# 15. Crear Venta (Facturar)
@app.post("/api/ventas")
def crear_venta(venta: VentaCreate):
    try:
        # 1. Insertar en la tabla ventas
        nueva_venta_data = {
            "negocio_id": venta.negocio_id,
            "cliente_id": venta.cliente_id,
            "numero_factura": venta.numero_factura,
            "subtotal": venta.subtotal,
            "descuento_global": venta.descuento_global,
            "total": venta.total,
            "estado": venta.estado
        }
        
        resultado_venta = supabase.table("ventas").insert(nueva_venta_data).execute()
        if not resultado_venta.data:
            raise Exception("Error al insertar la venta")
            
        venta_id = resultado_venta.data[0]["id"]
        
        # 2. Insertar los detalles de la venta y actualizar stock
        detalles_a_insertar = []
        for detalle in venta.detalles:
            detalles_a_insertar.append({
                "venta_id": venta_id,
                "producto_id": detalle.producto_id,
                "cantidad": detalle.cantidad,
                "precio_unitario": detalle.precio_unitario,
                "costo_unitario": detalle.costo_unitario,
                "descuento_item": detalle.descuento_item
            })
            
            # Obtener el producto actual y reducir stock
            producto_db = supabase.table("productos").select("stock_actual").eq("id", detalle.producto_id).execute()
            if producto_db.data:
                stock_previo = producto_db.data[0].get("stock_actual", 0)
                nuevo_stock = stock_previo - detalle.cantidad
                supabase.table("productos").update({"stock_actual": nuevo_stock}).eq("id", detalle.producto_id).execute()

        # Insertar todos los detalles juntos
        if detalles_a_insertar:
            supabase.table("venta_detalles").insert(detalles_a_insertar).execute()
        
        # 3. Actualizar métricas del Cliente (si se proporcionó)
        if venta.cliente_id:
            cliente_db = supabase.table("clientes").select("n_compras, total_consumido").eq("id", venta.cliente_id).execute()
            if cliente_db.data:
                compras_previas = cliente_db.data[0].get("n_compras") or 0
                consumo_previo = float(cliente_db.data[0].get("total_consumido") or 0)
                
                supabase.table("clientes").update({
                    "n_compras": compras_previas + 1,
                    "total_consumido": consumo_previo + float(venta.total)
                }).eq("id", venta.cliente_id).execute()

        return {"mensaje": "Venta registrada exitosamente", "venta_id": venta_id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 16. Obtener Historial de Ventas por Negocio
@app.get("/api/ventas/{negocio_id}")
def obtener_ventas(negocio_id: str):
    try:
        # Traer ventas y cruzar con nombre de cliente (relación 1-1 opcional)
        result = supabase.table("ventas").select("*, clientes(nombre)").eq("negocio_id", negocio_id).order("fecha_emision", desc=True).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 17. Obtener los detalles de una Venta
@app.get("/api/ventas/detalle/{venta_id}")
def obtener_detalles_venta(venta_id: str):
    try:
        result = supabase.table("venta_detalles").select("*, productos(nombre)").eq("venta_id", venta_id).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- MÓDULO DE COTIZACIONES ---

# 18. Crear Cotización
@app.post("/api/cotizaciones")
def crear_cotizacion(cotizacion: CotizacionCreate):
    try:
        nueva_cotizacion_data = {
            "negocio_id": cotizacion.negocio_id,
            "cliente_id": cotizacion.cliente_id,
            "numero_cotizacion": cotizacion.numero_cotizacion,
            "subtotal": cotizacion.subtotal,
            "descuento_global": cotizacion.descuento_global,
            "total": cotizacion.total,
            "estado": cotizacion.estado
        }
        
        resultado_cotizacion = supabase.table("cotizaciones").insert(nueva_cotizacion_data).execute()
        if not resultado_cotizacion.data:
            raise Exception("Error al insertar la cotización")
            
        cot_id = resultado_cotizacion.data[0]["id"]
        
        detalles_a_insertar = []
        for detalle in cotizacion.detalles:
            detalles_a_insertar.append({
                "cotizacion_id": cot_id,
                "producto_id": detalle.producto_id,
                "cantidad": detalle.cantidad,
                "precio_unitario": detalle.precio_unitario,
                "costo_unitario": detalle.costo_unitario,
                "descuento_item": detalle.descuento_item
            })
            
        if detalles_a_insertar:
            supabase.table("cotizacion_detalles").insert(detalles_a_insertar).execute()
            
        return {"mensaje": "Cotización registrada exitosamente", "cotizacion_id": cot_id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 19. Obtener Historial de Cotizaciones
@app.get("/api/cotizaciones/{negocio_id}")
def obtener_cotizaciones(negocio_id: str):
    try:
        result = supabase.table("cotizaciones").select("*, clientes(nombre)").eq("negocio_id", negocio_id).order("fecha_emision", desc=True).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 20. Obtener detalles de una Cotización
@app.get("/api/cotizaciones/detalle/{cotizacion_id}")
def obtener_detalles_cotizacion(cotizacion_id: str):
    try:
        result = supabase.table("cotizacion_detalles").select("*, productos(nombre)").eq("cotizacion_id", cotizacion_id).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 21. Actualizar estado de Cotización
@app.put("/api/cotizaciones/{cotizacion_id}/estado")
def actualizar_estado_cotizacion(cotizacion_id: str, cotizacion: CotizacionUpdate):
    try:
        result = supabase.table("cotizaciones").update({"estado": cotizacion.estado}).eq("id", cotizacion_id).execute()
        return {"mensaje": f"Cotización marcada como {cotizacion.estado}", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

