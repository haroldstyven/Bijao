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
    precio: float
    costo: float
    stock: int
    stock_minimo: int
    imagen_url: Optional[str] = None
    negocio_id: Optional[str] = None

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    categoria: Optional[str] = None
    precio: Optional[float] = None
    costo: Optional[float] = None
    stock: Optional[int] = None
    stock_minimo: Optional[int] = None
    imagen_url: Optional[str] = None