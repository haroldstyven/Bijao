from pydantic import BaseModel, EmailStr
from typing import Optional

class UserAuth(BaseModel):
    name: str
    email: EmailStr
    password: str

class NegocioUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo_negocio: Optional[str] = None
    logo_url: Optional[str] = None
    tema: Optional[str] = None
    color_acento: Optional[str] = None