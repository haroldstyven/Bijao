# Bijao - Plataforma de Gestión Inteligente (SaaS) 🚀

Bijao es un sistema integral de Punto de Venta (POS), Inventario, Facturación y Marketing, impulsado fuertemente por Inteligencia Artificial. Está diseñado como un SaaS Multi-tenant donde el usuario puede gestionar todo su negocio a través de una interfaz moderna o mediante un "Centro de Mando IA".

## 🏗️ Arquitectura y Stack Tecnológico

El proyecto sigue una estructura **Monorepo** separada en dos servicios principales que se comunican vía API REST.

- **Frontend:** Next.js (React) + Tailwind CSS.
- **Backend:** Python + FastAPI (Asíncrono, hiper-rápido).
- **Base de Datos & Auth:** Supabase (PostgreSQL).
- **Inteligencia Artificial:** Gemini 1.5 Flash API (Google).
- **Despliegue:** Vercel (Frontend) + Render/Railway (Backend).

## 📁 Estructura del Repositorio

\`\`\`text
/Bijao
├── /frontend          # Aplicación web en Next.js
├── /backend           # API REST y lógica de IA en FastAPI
├── README.md          # Documentación central
└── .gitignore         # Archivos ignorados por Git
\`\`\`

## 🧠 Lógica Core: "Regla de Integración"

El sistema está diseñado bajo un principio estricto de **cero módulos aislados**. 
Toda acción impacta automáticamente en cascada (Transacciones SQL ACID):
1. **Venta en POS** -> 
2. Descuenta `Inventario` -> 
3. Actualiza perfil del `Cliente` (Frecuencia, Ticket promedio) -> 
4. Genera `Factura` -> 
5. Actualiza `Dashboard` y `Contabilidad` (Utilidad real calculada con costo/precio histórico).

## 🔐 Seguridad y Multi-tenant

- La aplicación es **Multi-tenant**. Múltiples negocios usan la misma base de datos.
- **NUNCA** el Frontend de Next.js se conecta directamente a la base de datos de Supabase para hacer queries (CRUD).
- Todo el Frontend pasa por el Backend (FastAPI). 
- El Backend es el encargado de filtrar todos los queries mediante el `negocio_id` del usuario autenticado para garantizar aislamiento de datos total.

## 🤖 El "Centro de Mando IA" (Agente)

El diferenciador principal es el **Agente IA** impulsado por Gemini.
- Capacidad de **Function Calling**: Entiende lenguaje natural y devuelve JSON estructurados que el Backend ejecuta.
- **Insights:** Procesa historiales de ventas masivos y devuelve resúmenes financieros "traducidos" a lenguaje de negocio (ej. "Riesgo de quiebre de stock").
- **Marketing Automático:** Genera campañas de *cross-selling* y *bundles* basados en patrones de compra de la tabla `clientes` y `venta_detalles`.

## 🚀 Fases de Desarrollo (Roadmap)

- [x] Definición de Requerimientos Funcionales y Mockups.
- [x] Diseño de Arquitectura y Stack.
- [x] Modelado de Base de Datos PostgreSQL.
- [ ] **Fase 1:** Setup inicial (Inicializar Next.js y FastAPI) y Autenticación con Supabase.
- [ ] **Fase 2:** CRUDs básicos (Inventario, Clientes, Ajustes).
- [ ] **Fase 3:** Motor transaccional (POS, Carrito, Ventas, Cotizaciones).
- [ ] **Fase 4:** Integración de Gemini API (Centro de Mando, Insights, Segmentación).
- [ ] **Fase 5:** Dashboard general, Refinamiento UI/UX y despliegue CI/CD.