from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class NegocioUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo_negocio: Optional[str] = None
    logo_url: Optional[str] = None
    tema: Optional[str] = None
    color_acento: Optional[str] = None
    onboarding_completado: Optional[bool] = None

class ProductoCreate(BaseModel):
    nombre: str
    categoria: str
    precio_venta: float
    costo: float
    stock_actual: int
    stock_minimo: int
    tipo: str = "PRODUCTO"
    imagen_url: Optional[str] = None
    negocio_id: Optional[str] = None

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    categoria: Optional[str] = None
    precio_venta: Optional[float] = None
    costo: Optional[float] = None
    stock_actual: Optional[int] = None
    stock_minimo: Optional[int] = None
    tipo: Optional[str] = None
    imagen_url: Optional[str] = None
    is_active: Optional[bool] = None

class ClienteCreate(BaseModel):
    nombre: str
    email: Optional[EmailStr] = None
    celular: Optional[str] = None
    cumpleanos: Optional[str] = None
    negocio_id: Optional[str] = None

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    celular: Optional[str] = None
    cumpleanos: Optional[str] = None
    is_active: Optional[bool] = None

class VentaDetalleCreate(BaseModel):
    producto_id: str
    cantidad: float
    precio_unitario: float
    costo_unitario: float
    descuento_item: Optional[float] = 0.00

class VentaCreate(BaseModel):
    negocio_id: str
    cliente_id: Optional[str] = None
    numero_factura: str
    subtotal: float
    descuento_global: Optional[float] = 0.00
    total: float
    estado: Optional[str] = "VIGENTE"
    detalles: list[VentaDetalleCreate]

class CotizacionDetalleCreate(BaseModel):
    producto_id: str
    cantidad: float
    precio_unitario: float
    costo_unitario: float
    descuento_item: Optional[float] = 0.00

class CotizacionCreate(BaseModel):
    negocio_id: str
    cliente_id: Optional[str] = None
    numero_cotizacion: str
    subtotal: float
    descuento_global: Optional[float] = 0.00
    total: float
    estado: Optional[str] = "PENDIENTE"
    detalles: list[CotizacionDetalleCreate]

class CotizacionUpdate(BaseModel):
    estado: str
