from fastapi import FastAPI, HTTPException, File, UploadFile, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from models import UserRegister, UserLogin, NegocioUpdate, ProductoCreate, ProductoUpdate, ClienteCreate, ClienteUpdate, VentaCreate, CotizacionCreate, CotizacionUpdate, CampanaMarketingCreate, CampanaMarketingUpdate
import pandas as pd
import io
import math
from datetime import datetime
import pytz

app = FastAPI(title="Bijao API", version="1.0")

# 1. Configurar CORS (Permitir que Next.js se conecte al Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambiaremos "*" por tu URL de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de Seguridad
security = HTTPBearer()

class CurrentUser:
    def __init__(self, user_id, email, negocio_id, rol):
        self.id = user_id
        self.email = email
        self.negocio_id = negocio_id
        self.rol = rol

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Valida el JWT directamente con Supabase (verifica expiración y firma criptográfica)
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Token inválido o expirado")
            
        user_id = user_response.user.id
        # Verificar el negocio del usuario
        usuario_db = supabase.table("usuarios").select("negocio_id, rol").eq("id", user_id).execute()
        
        if usuario_db.data:
            negocio_id = usuario_db.data[0].get("negocio_id")
            rol = usuario_db.data[0].get("rol")
        else:
            negocio_id = None
            rol = 'CAJERO'
            
        return CurrentUser(user_id=user_id, email=user_response.user.email, negocio_id=negocio_id, rol=rol)
    except Exception as e:
        print(f"[AUTH ERROR] {str(e)}")
        raise HTTPException(status_code=401, detail=f"No autenticado: {str(e)}")

def verificar_acceso_negocio(negocio_id: str, current_user = Depends(get_current_user)):
    """Dependencia adicional para asegurar que un usuario solo lee/escribe su propio negocio"""
    if current_user.negocio_id and str(current_user.negocio_id) != str(negocio_id):
        raise HTTPException(status_code=403, detail="No tienes permisos para acceder a los datos de este negocio")
    return current_user

@app.get("/")
def read_root():
    return {"mensaje": "¡El backend de Bijao está vivo y conectado, con seguridad activada!"}

# 2. Endpoint de Registro (Público)
@app.post("/auth/registro")
def registrar_usuario(user: UserRegister):
    try:
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        
        user_id = response.user.id
        
        nuevo_negocio = supabase.table("negocios").insert({
            "nombre": "Mi Negocio"
        }).execute()
        
        negocio_id = nuevo_negocio.data[0]["id"]
        
        supabase.table("usuarios").insert({
            "id": user_id,
            "negocio_id": negocio_id,
            "nombre": user.name,
            "rol": "ADMIN"
        }).execute()

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

# 3. Endpoint de Login (Público)
@app.post("/auth/login")
def iniciar_sesion(user: UserLogin):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        
        user_id = response.user.id
        
        usuario_db = supabase.table("usuarios").select("negocio_id").eq("id", user_id).execute()
        negocio_id = usuario_db.data[0]["negocio_id"] if usuario_db.data else None
        
        onboarding_completado = False
        if negocio_id:
            negocio_db = supabase.table("negocios").select("onboarding_completado").eq("id", negocio_id).execute()
            if negocio_db.data:
                onboarding_completado = negocio_db.data[0].get("onboarding_completado", False)

        return {
            "mensaje": "Login exitoso",
            "access_token": response.session.access_token,
            "usuario_id": user_id,
            "negocio_id": negocio_id,
            "onboarding_completado": onboarding_completado
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

# 4. Obtener Negocio (Privado)
@app.get("/api/negocios/{negocio_id}")
def obtener_negocio(negocio_id: str, current_user = Depends(verificar_acceso_negocio)):
    try:
        negocio_db = supabase.table("negocios").select("*").eq("id", negocio_id).execute()
        
        if not negocio_db.data:
            raise HTTPException(status_code=404, detail="Negocio no encontrado")
            
        return negocio_db.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 5. Actualizar Negocio (Privado)
@app.put("/api/negocios/{negocio_id}")
def actualizar_negocio(negocio_id: str, negocio: NegocioUpdate, current_user = Depends(verificar_acceso_negocio)):
    try:
        update_data = {k: v for k, v in negocio.dict(exclude_unset=True).items() if v is not None}
        
        if not update_data:
            return {"mensaje": "No hay datos para actualizar"}
            
        result = supabase.table("negocios").update(update_data).eq("id", negocio_id).execute()
        
        return {"mensaje": "Negocio actualizado correctamente", "data": result.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 6. Crear Producto (Privado)
@app.post("/api/inventario")
def crear_producto(producto: ProductoCreate, current_user = Depends(get_current_user)):
    try:
        if current_user.negocio_id and str(producto.negocio_id) != str(current_user.negocio_id):
            raise HTTPException(status_code=403, detail="No puedes crear items para otro negocio")

        nuevo_producto = supabase.table("productos").insert(producto.dict()).execute()
        return {"mensaje": "Producto creado exitosamente", "data": nuevo_producto.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 7. Obtener Productos por Negocio (Privado)
@app.get("/api/inventario/{negocio_id}")
def obtener_productos(negocio_id: str, current_user = Depends(verificar_acceso_negocio)):
    try:
        productos_db = supabase.table("productos").select("*").eq("negocio_id", negocio_id).order("created_at", desc=True).execute()
        return {"data": productos_db.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 8. Actualizar Producto (Privado)
@app.put("/api/inventario/{producto_id}")
def actualizar_producto(producto_id: str, producto: ProductoUpdate, current_user = Depends(get_current_user)):
    try:
        update_data = {k: v for k, v in producto.dict(exclude_unset=True).items() if v is not None}
        if not update_data:
            return {"mensaje": "No hay datos para actualizar"}
            
        result = supabase.table("productos").update(update_data).eq("id", producto_id).execute()
        return {"mensaje": "Producto actualizado", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 9. Eliminar Producto (Privado)
@app.delete("/api/inventario/{producto_id}")
def eliminar_producto(producto_id: str, current_user = Depends(get_current_user)):
    try:
        supabase.table("productos").delete().eq("id", producto_id).execute()
        return {"mensaje": "Producto eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 10. Importar Productos masivamente desde Excel (Privado)
@app.post("/api/inventario/{negocio_id}/importar")
async def importar_productos_excel(negocio_id: str, file: UploadFile = File(...), current_user = Depends(verificar_acceso_negocio)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="El archivo debe ser un Excel (.xlsx o .xls)")
        
    try:
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        
        column_mapping = {
            "nombre": "nombre", "producto": "nombre",
            "categoria": "categoria", "categoría": "categoria",
            "precio": "precio_venta", "precio de venta": "precio_venta", "precio_venta": "precio_venta",
            "costo": "costo", "costo unitario": "costo",
            "stock": "stock_actual", "stock inicial": "stock_actual", "cantidad": "stock_actual", "stock_actual": "stock_actual",
            "stock minimo": "stock_minimo", "stock mínimo": "stock_minimo", "stock_minimo": "stock_minimo",
            "tipo": "tipo"
        }
        
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        mapped_df = pd.DataFrame()
        for excel_col, df_col in df.items():
            if excel_col in column_mapping:
                mapped_df[column_mapping[excel_col]] = df_col
                
        if "nombre" not in mapped_df.columns:
            raise HTTPException(status_code=400, detail="El excel debe tener al menos una columna 'nombre' o 'producto'")

        productos_a_insertar = []
        for index, row in mapped_df.iterrows():
            if pd.isna(row.get('nombre')) or str(row.get('nombre')).strip() == '':
                continue
                
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
            
        resultado = supabase.table("productos").insert(productos_a_insertar).execute()
        
        return {
            "mensaje": f"Se importaron {len(productos_a_insertar)} productos exitosamente",
            "data": resultado.data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error procesando el Excel: {str(e)}")


# --- MÓDULO DE CLIENTES ---

# 11. Obtener Clientes de un Negocio (Privado)
@app.get("/api/clientes/{negocio_id}")
def obtener_clientes(negocio_id: str, current_user = Depends(verificar_acceso_negocio)):
    try:
        result = supabase.table("clientes").select("*").eq("negocio_id", negocio_id).order("created_at", desc=True).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 12. Crear Cliente (Privado)
@app.post("/api/clientes")
def crear_cliente(cliente: ClienteCreate, current_user = Depends(get_current_user)):
    try:
        if current_user.negocio_id and str(cliente.negocio_id) != str(current_user.negocio_id):
            raise HTTPException(status_code=403, detail="No puedes crear items para otro negocio")

        nuevo_cliente = cliente.dict()
        result = supabase.table("clientes").insert(nuevo_cliente).execute()
        return {"mensaje": "Cliente creado exitosamente", "data": result.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 13. Actualizar Cliente (Privado)
@app.put("/api/clientes/{cliente_id}")
def actualizar_cliente(cliente_id: str, cliente: ClienteUpdate, current_user = Depends(get_current_user)):
    try:
        update_data = {k: v for k, v in cliente.dict(exclude_unset=True).items() if v is not None}
        if not update_data:
            return {"mensaje": "No hay datos para actualizar"}
            
        result = supabase.table("clientes").update(update_data).eq("id", cliente_id).execute()
        return {"mensaje": "Cliente actualizado", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 14. Eliminar Cliente (Privado)
@app.delete("/api/clientes/{cliente_id}")
def eliminar_cliente(cliente_id: str, current_user = Depends(get_current_user)):
    try:
        supabase.table("clientes").delete().eq("id", cliente_id).execute()
        return {"mensaje": "Cliente eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- MÓDULO DE VENTAS Y FACTURACIÓN ---

# 15. Crear Venta (Facturar) (Privado)
@app.post("/api/ventas")
def crear_venta(venta: VentaCreate, current_user = Depends(get_current_user)):
    try:
        if current_user.negocio_id and str(venta.negocio_id) != str(current_user.negocio_id):
            raise HTTPException(status_code=403, detail="Permiso denegado")

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
            
            producto_db = supabase.table("productos").select("stock_actual").eq("id", detalle.producto_id).execute()
            if producto_db.data:
                stock_previo = producto_db.data[0].get("stock_actual", 0)
                nuevo_stock = stock_previo - detalle.cantidad
                supabase.table("productos").update({"stock_actual": nuevo_stock}).eq("id", detalle.producto_id).execute()

        if detalles_a_insertar:
            supabase.table("venta_detalles").insert(detalles_a_insertar).execute()
        
        if venta.cliente_id:
            cliente_db = supabase.table("clientes").select("n_compras, total_consumido").eq("id", venta.cliente_id).execute()
            if cliente_db.data:
                compras_previas = cliente_db.data[0].get("n_compras") or 0
                consumo_previo = float(cliente_db.data[0].get("total_consumido") or 0)
                
                supabase.table("clientes").update({
                    "n_compras": compras_previas + 1,
                    "total_consumido": consumo_previo + float(venta.total)
                }).eq("id", venta.cliente_id).execute()

        try:
            campanas_activas = supabase.table("campanas_marketing").select("*").eq("negocio_id", venta.negocio_id).eq("estado", "ACTIVA").execute()
            if campanas_activas.data:
                for camp in campanas_activas.data:
                    incrementar = False
                    
                    if camp.get("producto_id"):
                        if any(str(d.producto_id) == str(camp["producto_id"]) for d in venta.detalles):
                            incrementar = True
                    else:
                        incrementar = True
                        
                    if incrementar:
                        nuevo_avance = int(camp.get("avance_actual", 0) or 0) + 1
                        supabase.table("campanas_marketing").update({"avance_actual": nuevo_avance}).eq("id", camp["id"]).execute()
        except Exception as msg_error:
            print(f"[CAMPANAS MARKETING TRACKING ERROR] {str(msg_error)}")

        return {"mensaje": "Venta registrada exitosamente", "venta_id": venta_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 16. Obtener Historial de Ventas por Negocio (Privado)
@app.get("/api/ventas/{negocio_id}")
def obtener_ventas(negocio_id: str, current_user = Depends(verificar_acceso_negocio)):
    try:
        result = supabase.table("ventas").select("*, clientes(nombre)").eq("negocio_id", negocio_id).order("fecha_emision", desc=True).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 17. Obtener los detalles de una Venta (Privado)
@app.get("/api/ventas/detalle/{venta_id}")
def obtener_detalles_venta(venta_id: str, current_user = Depends(get_current_user)):
    try:
        result = supabase.table("venta_detalles").select("*, productos(nombre)").eq("venta_id", venta_id).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- MÓDULO DE COTIZACIONES ---

# 18. Crear Cotización (Privado)
@app.post("/api/cotizaciones")
def crear_cotizacion(cotizacion: CotizacionCreate, current_user = Depends(get_current_user)):
    try:
        if current_user.negocio_id and str(cotizacion.negocio_id) != str(current_user.negocio_id):
            raise HTTPException(status_code=403, detail="Permiso denegado")

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
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 19. Obtener Historial de Cotizaciones (Privado)
@app.get("/api/cotizaciones/{negocio_id}")
def obtener_cotizaciones(negocio_id: str, current_user = Depends(verificar_acceso_negocio)):
    try:
        result = supabase.table("cotizaciones").select("*, clientes(nombre)").eq("negocio_id", negocio_id).order("fecha_emision", desc=True).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 20. Obtener detalles de una Cotización (Privado)
@app.get("/api/cotizaciones/detalle/{cotizacion_id}")
def obtener_detalles_cotizacion(cotizacion_id: str, current_user = Depends(get_current_user)):
    try:
        result = supabase.table("cotizacion_detalles").select("*, productos(nombre)").eq("cotizacion_id", cotizacion_id).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 21. Actualizar estado de Cotización (Privado)
@app.put("/api/cotizaciones/{cotizacion_id}/estado")
def actualizar_estado_cotizacion(cotizacion_id: str, cotizacion: CotizacionUpdate, current_user = Depends(get_current_user)):
    try:
        result = supabase.table("cotizaciones").update({"estado": cotizacion.estado}).eq("id", cotizacion_id).execute()
        return {"mensaje": f"Cotización marcada como {cotizacion.estado}", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- MÓDULO DE DASHBOARD / MÉTRICAS ---

# 22. Obtener Metricas del Dashboard (Privado)
@app.get("/api/metricas/{negocio_id}")
def obtener_metricas(negocio_id: str, current_user = Depends(verificar_acceso_negocio)):
    try:
        ventas_db = supabase.table("ventas").select("total, fecha_emision").eq("negocio_id", negocio_id).execute()
        
        clientes_db = supabase.table("clientes").select("id").eq("negocio_id", negocio_id).execute()
        total_clientes = len(clientes_db.data) if clientes_db.data else 0
        
        ventas_hoy = 0.0
        ventas_mes = 0.0
        ticket_promedio = 0.0
        grafico = []
        
        # Precompletar grafica con dias de la semana para asegurar estructura
        nombres_dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        bogota_tz = pytz.timezone('America/Bogota')
        now = datetime.now(bogota_tz)
        
        for i in range(6, -1, -1):
            dia_obj = (now - pd.Timedelta(days=i)).date()
            grafico.append({
                "day": nombres_dias[dia_obj.weekday()], 
                "val": 0.0,
                "date": str(dia_obj)
            })

        if ventas_db.data:
            df = pd.DataFrame(ventas_db.data)
            df['fecha_emision'] = pd.to_datetime(df['fecha_emision'], errors='coerce')
            
            if df['fecha_emision'].dt.tz is None:
                df['fecha_emision'] = df['fecha_emision'].dt.tz_localize('UTC')
            df['fecha_emision'] = df['fecha_emision'].dt.tz_convert('America/Bogota')
            
            # Filtros temporales
            hoy = df[df['fecha_emision'].dt.date == now.date()]
            ventas_hoy = float(hoy['total'].sum())
            
            mes = df[(df['fecha_emision'].dt.year == now.year) & (df['fecha_emision'].dt.month == now.month)]
            ventas_mes = float(mes['total'].sum())
            ticket_promedio = float(mes['total'].mean()) if not mes.empty else 0.0
            
            # Popular la data en el grafico
            for item in grafico:
                dia_data = df[df['fecha_emision'].dt.date == pd.to_datetime(item["date"]).date()]
                item["val"] = float(dia_data['total'].sum())
                
        # Calcular los porcentajes relativos para el frontend
        max_val = max([g["val"] for g in grafico]) if grafico else 0
        for g in grafico:
            g["percent"] = (g["val"] / max_val * 100) if max_val > 0 else 0
            
        return {
            "ventas_hoy": ventas_hoy,
            "ventas_mes": ventas_mes,
            "ticket_promedio": ticket_promedio,
            "clientes_activos": total_clientes,
            "grafico": grafico
        }
        
    except Exception as e:
        print(f"[METRICAS ERROR] {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# --- MÓDULO DE MARKETING ---

# 23. Obtener Campañas
@app.get("/api/marketing/campanas/{negocio_id}")
def obtener_campanas(negocio_id: str, current_user = Depends(verificar_acceso_negocio)):
    try:
        result = supabase.table("campanas_marketing").select("*, productos(nombre)").eq("negocio_id", negocio_id).order("fecha_inicio", desc=True).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 24. Crear Campaña
@app.post("/api/marketing/campanas")
def crear_campana(campana: CampanaMarketingCreate, current_user = Depends(get_current_user)):
    try:
        if current_user.negocio_id and str(campana.negocio_id) != str(current_user.negocio_id):
            raise HTTPException(status_code=403, detail="Permiso denegado")
            
        data = campana.dict(exclude_unset=True)
        result = supabase.table("campanas_marketing").insert(data).execute()
        return {"mensaje": "Campaña creada exitosamente", "data": result.data}
    except Exception as e:
        print(f"[MARKETING ERROR] {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# 25. Actualizar Campaña
@app.put("/api/marketing/campanas/{campana_id}")
def actualizar_campana(campana_id: str, campana: CampanaMarketingUpdate, current_user = Depends(get_current_user)):
    try:
        update_data = {k: v for k, v in campana.dict(exclude_unset=True).items() if v is not None}
        if not update_data:
            return {"mensaje": "No hay datos para actualizar"}
        result = supabase.table("campanas_marketing").update(update_data).eq("id", campana_id).execute()
        return {"mensaje": "Campaña actualizada", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 26. Eliminar Campaña
@app.delete("/api/marketing/campanas/{campana_id}")
def eliminar_campana(campana_id: str, current_user = Depends(get_current_user)):
    try:
        supabase.table("campanas_marketing").delete().eq("id", campana_id).execute()
        return {"mensaje": "Campaña eliminada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 27. Insights de Marketing
@app.get("/api/marketing/insights/{negocio_id}")
def obtener_insights(negocio_id: str, current_user = Depends(verificar_acceso_negocio)):
    try:
        insights = [
            {"id": 1, "title": "Cliente más recurrente", "value": "N/A", "percentage": "", "desc": "Sin datos suficientes", "color": "text-blue-600 bg-blue-50 border-blue-100"},
            {"id": 2, "title": "Producto más repetido", "value": "N/A", "percentage": "", "desc": "Sin datos suficientes", "color": "text-purple-600 bg-purple-50 border-purple-100"},
            {"id": 3, "title": "Rentabilidad real", "value": "0%", "percentage": "0%", "desc": "De cada $100 que vendes, te quedan $0", "color": "text-emerald-600 bg-emerald-50 border-emerald-100"},
            {"id": 4, "title": "Riesgo de quiebre", "value": "N/A", "percentage": "", "desc": "Sin alertas de stock actuales", "color": "text-red-600 bg-red-50 border-red-100"},
            {"id": 5, "title": "Ticket promedio", "value": "$0", "percentage": "", "desc": "Cada cliente gasta en promedio $0", "color": "text-amber-600 bg-amber-50 border-amber-100"}
        ]
        
        clientes_db = supabase.table("clientes").select("id, nombre, n_compras").eq("negocio_id", negocio_id).execute()
        ventas_db = supabase.table("ventas").select("id, total, fecha_emision, cliente_id").eq("negocio_id", negocio_id).execute()
        
        if not ventas_db.data:
            return {"data": insights}
        
        df_ventas = pd.DataFrame(ventas_db.data)
        df_clientes = pd.DataFrame(clientes_db.data) if clientes_db.data else pd.DataFrame()
        
        if not df_clientes.empty and 'n_compras' in df_clientes.columns:
            df_clientes['n_compras'] = pd.to_numeric(df_clientes['n_compras']).fillna(0)
            avg_compras = max(df_clientes['n_compras'].mean(), 1)
            top_cliente = df_clientes.loc[df_clientes['n_compras'].idxmax()]
            if top_cliente['n_compras'] > 0:
                mult = round(top_cliente['n_compras'] / avg_compras, 1)
                insights[0]["value"] = top_cliente["nombre"]
                insights[0]["desc"] = f"Compra {mult}x más que el promedio ({int(top_cliente['n_compras'])} compras)"
                
        ticket_promedio = df_ventas['total'].mean()
        insights[4]["value"] = f"${ticket_promedio:,.0f}" if pd.notna(ticket_promedio) else "$0"
        insights[4]["desc"] = f"Cada compra promedia ${ticket_promedio:,.0f}" if pd.notna(ticket_promedio) else "Cada compra promedia $0"

        venta_ids = df_ventas['id'].tolist()
        detalles_data = []
        for i in range(0, len(venta_ids), 100):
            chunk = venta_ids[i:i+100]
            res = supabase.table("venta_detalles").select("venta_id, producto_id, cantidad, precio_unitario, costo_unitario").in_("venta_id", chunk).execute()
            if res.data:
                detalles_data.extend(res.data)
                
        if detalles_data:
            df_det = pd.DataFrame(detalles_data)
            
            df_det['ingreso'] = df_det['cantidad'] * df_det['precio_unitario']
            df_det['costo_total'] = df_det['cantidad'] * df_det['costo_unitario']
            total_ingreso = df_det['ingreso'].sum()
            total_costo = df_det['costo_total'].sum()
            
            if total_ingreso > 0:
                rentabilidad = ((total_ingreso - total_costo) / total_ingreso) * 100
                rentabilidad_int = int(rentabilidad)
                insights[2]["value"] = f"{rentabilidad_int}%"
                insights[2]["desc"] = f"De cada $100 que vendes, te quedan ${rentabilidad_int} antes de gastos"

            productos_db = supabase.table("productos").select("id, nombre, stock_actual").eq("negocio_id", negocio_id).execute()
            df_prod = pd.DataFrame(productos_db.data) if productos_db.data else pd.DataFrame()
            
            if not df_prod.empty:
                df_merged = df_det.merge(df_prod, left_on='producto_id', right_on='id')
                if not df_merged.empty:
                    prod_counts = df_merged.groupby('nombre')['cantidad'].sum().reset_index()
                    top_prod = prod_counts.loc[prod_counts['cantidad'].idxmax()]
                    total_sold_units = prod_counts['cantidad'].sum()
                    porcentaje_pref = int((top_prod['cantidad'] / total_sold_units) * 100) if total_sold_units > 0 else 0
                    
                    insights[1]["value"] = top_prod['nombre']
                    insights[1]["desc"] = f"Representa el {porcentaje_pref}% del volumen total vendido"

                df_det_ventas = df_det.merge(df_ventas[['id', 'fecha_emision']], left_on='venta_id', right_on='id')
                df_det_ventas['fecha_emision'] = pd.to_datetime(df_det_ventas['fecha_emision'], errors='coerce')
                
                if df_det_ventas['fecha_emision'].dt.tz is None:
                    df_det_ventas['fecha_emision'] = df_det_ventas['fecha_emision'].dt.tz_localize('UTC')
                
                now = datetime.now(pytz.utc)
                thirty_days_ago = now - pd.Timedelta(days=30)
                
                recent_sales = df_det_ventas[df_det_ventas['fecha_emision'] >= thirty_days_ago]
                if not recent_sales.empty:
                    velocity = recent_sales.groupby('producto_id')['cantidad'].sum().reset_index()
                    velocity.rename(columns={'cantidad': 'sold_30d'}, inplace=True)
                    
                    df_risk = df_prod.merge(velocity, left_on='id', right_on='producto_id', how='left')
                    df_risk['sold_30d'] = df_risk['sold_30d'].fillna(0)
                    df_risk['stock_actual'] = pd.to_numeric(df_risk['stock_actual']).fillna(0)
                    
                    df_risk = df_risk[df_risk['sold_30d'] > 0]
                    
                    if not df_risk.empty:
                        df_risk['daily_velocity'] = df_risk['sold_30d'] / 30.0
                        df_risk['days_coverage'] = df_risk['stock_actual'] / df_risk['daily_velocity']
                        
                        top_risk = df_risk.loc[df_risk['days_coverage'].idxmin()]
                        days_left = int(top_risk['days_coverage'])
                        
                        if days_left <= 14:
                            risk_level = "Alto" if days_left <= 7 else "Medio"
                        else:
                            risk_level = "Bajo"
                            
                        insights[3]["value"] = risk_level
                        insights[3]["desc"] = f"'{top_risk['nombre']}' — Stock actual cubre solo {days_left} días"

        return {"data": insights}
    except Exception as e:
        print(f"[INSIGHTS ERROR] {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# 29. Segmentación de Clientes
@app.get("/api/marketing/segmentos/{negocio_id}")
def obtener_segmentos(negocio_id: str, current_user = Depends(verificar_acceso_negocio)):
    try:
        ventas_db = supabase.table("ventas").select("id, cliente_id, total, fecha_emision").eq("negocio_id", negocio_id).execute()
        clientes_db = supabase.table("clientes").select("id, nombre").eq("negocio_id", negocio_id).execute()
        productos_db = supabase.table("productos").select("id, categoria").eq("negocio_id", negocio_id).execute()
        
        if not ventas_db.data or not clientes_db.data:
            return {"data": []}
            
        df_ventas = pd.DataFrame(ventas_db.data)
        df_clientes = pd.DataFrame(clientes_db.data)
        df_prod = pd.DataFrame(productos_db.data) if productos_db.data else pd.DataFrame()
        
        df_ventas = df_ventas.dropna(subset=['cliente_id'])
        if df_ventas.empty:
            return {"data": []}
            
        venta_ids = df_ventas['id'].tolist()
        detalles_data = []
        for i in range(0, len(venta_ids), 100):
            chunk = venta_ids[i:i+100]
            res = supabase.table("venta_detalles").select("venta_id, producto_id, cantidad, precio_unitario").in_("venta_id", chunk).execute()
            if res.data:
                detalles_data.extend(res.data)
                
        if not detalles_data or df_prod.empty:
            return {"data": []}
            
        df_det = pd.DataFrame(detalles_data)
        df_merged = df_det.merge(df_prod, left_on='producto_id', right_on='id', how='left')
        df_merged['categoria'] = df_merged['categoria'].fillna('General')
        
        df_full = df_merged.merge(df_ventas, left_on='venta_id', right_on='id')
        
        client_cats = df_full.groupby(['cliente_id', 'categoria'])['cantidad'].sum().reset_index()
        idx = client_cats.groupby('cliente_id')['cantidad'].idxmax()
        pref_cats = client_cats.loc[idx]
        
        client_stats = df_ventas.groupby('cliente_id').agg(
            total_gastado=('total', 'sum'),
            compras=('id', 'count'),
            ultima_compra=('fecha_emision', 'max')
        ).reset_index()
        
        final_df = pref_cats.merge(client_stats, on='cliente_id').merge(df_clientes, left_on='cliente_id', right_on='id')
        
        resultados = []
        total_clientes = len(final_df)
        
        # Helper dictionary to add colors and icons to the frontend
        colors = [
            'text-purple-600 bg-purple-50 border-purple-100',
            'text-blue-600 bg-blue-50 border-blue-100',
            'text-amber-600 bg-amber-50 border-amber-100',
            'text-emerald-600 bg-emerald-50 border-emerald-100',
            'text-pink-600 bg-pink-50 border-pink-100',
        ]
        
        color_idx = 0
        for name, group in final_df.groupby('categoria'):
            porcentaje = int((len(group) / total_clientes) * 100) if total_clientes > 0 else 0
            
            clientes_agrupados = []
            for _, c in group.iterrows():
                try:
                    fecha = pd.to_datetime(c['ultima_compra']).strftime('%Y-%m-%d')
                except:
                    fecha = 'N/A'
                clientes_agrupados.append({
                    "nombre": c['nombre'],
                    "compras": int(c['compras']),
                    "total_gastado": float(c['total_gastado']),
                    "ultima_compra": fecha
                })
                
            clientes_agrupados = sorted(clientes_agrupados, key=lambda x: x['total_gastado'], reverse=True)
            
            resultados.append({
                "segmento": f"Prefiere: {name}",
                "total_clientes": len(group),
                "porcentaje": porcentaje,
                "color": colors[color_idx % len(colors)],
                "clientes": clientes_agrupados
            })
            color_idx += 1
            
        resultados = sorted(resultados, key=lambda x: x['porcentaje'], reverse=True)
        return {"data": resultados}
        
    except Exception as e:
        print(f"[SEGMENTOS ERROR] {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# 28. Campañas Sugeridas IA
@app.get("/api/marketing/sugerencias/{negocio_id}")
def obtener_sugerencias(negocio_id: str, current_user = Depends(verificar_acceso_negocio)):
    try:
        productos_db = supabase.table("productos").select("*").eq("negocio_id", negocio_id).execute()
        sugerencias = []
        
        if productos_db.data:
            df_prod = pd.DataFrame(productos_db.data)
            df_prod['stock_actual'] = pd.to_numeric(df_prod['stock_actual'], errors='coerce').fillna(0)
            
            alto_stock = df_prod[df_prod['stock_actual'] > 20]
            if not alto_stock.empty:
                prod = alto_stock.iloc[0]
                sugerencias.append({
                    "id": f"sug_{prod['id']}",
                    "type": "Promoción",
                    "title": f"Liquidar Stock: {prod['nombre']}",
                    "desc": f"El algoritmo detectó abundancia de unidades ({int(prod['stock_actual'])}) de '{prod['nombre']}'. Crea una campaña individual de promoción a toda tu base para rotar este inventario urgentemente.",
                    "metric": "Optimiza Cashflow",
                    "producto_id": prod['id'],
                    "meta_ventas": int(prod['stock_actual'] * 0.5),
                    "duracion_dias": 15
                })
        
        if not sugerencias:
            sugerencias.append({
                "id": "sug_generic",
                "type": "Retención",
                "title": "Descuento para Clientes Inactivos",
                "desc": "Tenemos prospectos que no han comprado recientemente. Ofréceles un 10% en su próxima compra para reactivarlos y asegurar su lealtad.",
                "metric": "Evita el Churn",
                "producto_id": None,
                "meta_ventas": 5,
                "duracion_dias": 30
            })
            
        return {"data": sugerencias}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

