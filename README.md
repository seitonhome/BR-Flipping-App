# B&R Inversiones S.A.S — Plataforma de Flipping Inmobiliario — Plataforma de Gestión de Flipping Inmobiliario
**Colombia 2026 · Tarifas notariales y fiscales actualizadas**

---

## 🚀 Setup en 10 minutos

### 1. Crear proyecto en Supabase (gratis)

1. Ve a https://supabase.com y crea una cuenta
2. Crea un nuevo proyecto (elige región: São Paulo - más cercana a Colombia)
3. Espera que el proyecto se inicialice (~2 min)
4. En el panel lateral ve a **SQL Editor**
5. Copia el contenido de `supabase_schema.sql` y ejecútalo completo
6. Ve a **Settings > API** y copia:
   - `Project URL` → tu SUPABASE_URL
   - `anon public key` → tu SUPABASE_ANON_KEY

### 2. Configurar las credenciales

Abre el archivo `js/app.js` y reemplaza en las líneas 5-6:

```javascript
const SUPABASE_URL = 'https://TU_PROJECT_ID.supabase.co';  // ← tu URL aquí
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';              // ← tu key aquí
```

También actualiza las mismas variables en `index.html` (líneas del script al final).

### 3. Subir a Vercel

**Opción A — Drag & Drop (más fácil):**
1. Ve a https://vercel.com, crea cuenta
2. En el dashboard haz click en "Add New > Project"
3. Selecciona "Browse" y sube la carpeta `BR-Flipping-App` completa
4. Click en Deploy → ¡listo!

**Opción B — GitHub:**
1. Sube la carpeta a un repositorio en GitHub
2. Conecta el repo en Vercel
3. Deploy automático

### 4. Configurar dominio (opcional)
En Vercel puedes agregar tu propio dominio en Settings > Domains.

---

## 📁 Estructura de archivos

```
BR-Flipping-App/
├── index.html          ← Login / Registro
├── dashboard.html      ← Panel principal con KPIs y gráficas
├── calculadora.html    ← Calculadora paso a paso con análisis fiscal
├── proyectos.html      ← Lista y gestión de proyectos
├── reportes.html       ← Analytics completo con 8 gráficas
├── vercel.json         ← Configuración de despliegue
├── supabase_schema.sql ← Esquema de base de datos (ejecutar en Supabase)
├── css/
│   └── app.css         ← Estilos compartidos
└── js/
    └── app.js          ← Utilidades y lógica de negocio compartida
```

---

## 🏗 Funcionalidades

### Calculadora de flipping
- Precio de compra → análisis fiscal completo
- Gastos notariales 2026 (SNR Resolución 2026-000964-6):
  - Escrituración: 0.54% (50/50 comprador/vendedor)
  - Beneficencia y registro: ~1.67%
- Retención en la fuente: 1% (<20.000 UVT) / 2.5% (>20.000 UVT o local)
- Impuesto de ganancia ocasional: 15% (≥2 años) / Renta ordinaria 33% (<2 años)
- Comisión inmobiliaria configurable
- Análisis de viabilidad con 4 criterios
- Veredicto automático: Viable / Marginal / No viable

### Pipeline de proyectos
- 5 estados: Evaluación → Comprado → Remodelación → En venta → Vendido
- Actualización de estado en tiempo real
- Precio de venta real al cerrar (recalcula KPIs automáticamente)
- Notas por proyecto
- Búsqueda y filtros

### Reportes & Analytics
- Utilidad acumulada en el tiempo
- Ranking de proyectos por rentabilidad
- Distribución de costos (pie chart)
- Margen neto vs. meta 25%
- ROI vs. meta 20%
- Precio compra vs. venta
- Duración promedio por etapa
- Insights automáticos inteligentes
- Filtro por período (3M, 6M, 12M, Todo)

---

## 🔒 Seguridad

- Autenticación con Supabase Auth (email/password)
- Row Level Security (RLS): todos los usuarios del equipo ven todos los proyectos
- Sesiones seguras con JWT

---

## 💡 Personalización del logo

Para agregar tu propio logo:
1. En `index.html`, `dashboard.html`, etc., busca el elemento `.logo-mark`
2. Reemplaza el texto "FC" con tu inicial o agrega un `<img>` con tu logo
3. Ajusta los colores en `css/app.css` modificando las variables `--gold`, `--dark`, etc.

---

## 📊 Parámetros fiscales Colombia 2026

| Concepto | Valor | Quién paga |
|----------|-------|-----------|
| Derechos notariales | 0.54% del precio | 50/50 |
| Beneficencia + registro | ~1.67% | Comprador |
| Gastos admin (biometría, copias) | ~$200K fijo | Comprador |
| Retención en la fuente | 1% o 2.5% | Vendedor |
| Ganancia ocasional (≥2 años) | 15% sobre utilidad | Vendedor |
| Renta ordinaria (<2 años) | Hasta 33% | Vendedor |
| IVA inmuebles usados | **No aplica** | — |

---

## 🛠 Tech stack

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Gráficas**: Chart.js 4.4
- **Deploy**: Vercel (serverless)
- **Fonts**: Syne + DM Sans (Google Fonts)

---

Desarrollado para gestión de flipping inmobiliario en Colombia.
B&R Inversiones S.A.S · Versión 1.0 · Mayo 2026
