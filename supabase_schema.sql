-- ============================================================
-- FLIPCOL — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabla de proyectos de flipping
CREATE TABLE IF NOT EXISTS proyectos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificación
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  ciudad VARCHAR(100),
  departamento VARCHAR(100),
  estrato SMALLINT,
  tipo_inmueble VARCHAR(50), -- apartamento, casa, local, lote
  metros_cuadrados NUMERIC(10,2),

  -- Estado del proyecto
  estado VARCHAR(50) DEFAULT 'evaluacion', 
  -- evaluacion | comprado | remodelacion | en_venta | vendido | cancelado

  -- Fechas clave
  fecha_compra DATE,
  fecha_inicio_remo DATE,
  fecha_fin_remo DATE,
  fecha_venta DATE,
  duracion_meses NUMERIC(5,1),

  -- Financiero compra
  precio_compra BIGINT NOT NULL,
  gastos_notariales_compra BIGINT DEFAULT 0,
  beneficencia_registro BIGINT DEFAULT 0,
  otros_gastos_compra BIGINT DEFAULT 0,

  -- Remodelación
  pct_remodelacion NUMERIC(5,2), -- porcentaje
  costo_remodelacion_presupuestado BIGINT DEFAULT 0,
  costo_remodelacion_real BIGINT DEFAULT 0,
  costo_extras_obra BIGINT DEFAULT 0,

  -- Tenencia
  predial BIGINT DEFAULT 0,
  administracion_mensual BIGINT DEFAULT 0,
  financiacion_mensual BIGINT DEFAULT 0,
  otros_tenencia BIGINT DEFAULT 0,

  -- Venta
  precio_venta_objetivo BIGINT DEFAULT 0,
  precio_venta_real BIGINT DEFAULT 0,
  pct_comision NUMERIC(4,2) DEFAULT 3.0,
  gastos_notariales_venta BIGINT DEFAULT 0,
  retencion_fuente BIGINT DEFAULT 0,
  impuesto_ganancia BIGINT DEFAULT 0,

  -- KPIs calculados (se actualizan al cerrar)
  inversion_total BIGINT DEFAULT 0,
  utilidad_neta BIGINT DEFAULT 0,
  margen_neto NUMERIC(6,2) DEFAULT 0, -- porcentaje
  roi NUMERIC(6,2) DEFAULT 0, -- porcentaje
  roi_anualizado NUMERIC(6,2) DEFAULT 0,

  -- Metadata
  notas TEXT,
  foto_url TEXT,
  anos_tenencia NUMERIC(4,1) DEFAULT 0,
  es_vivienda_habitual BOOLEAN DEFAULT FALSE,
  tipo_contribuyente VARCHAR(20) DEFAULT 'natural'
);

-- Tabla de gastos detallados por proyecto
CREATE TABLE IF NOT EXISTS gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria VARCHAR(100), -- compra, remodelacion, tenencia, venta, impuesto
  concepto VARCHAR(255) NOT NULL,
  monto BIGINT NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  comprobante_url TEXT,
  notas TEXT
);

-- Tabla de hitos / actividades del proyecto
CREATE TABLE IF NOT EXISTS actividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(50), -- nota, hito, alerta, documento
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha DATE DEFAULT CURRENT_DATE
);

-- Tabla de perfil de usuario (equipo)
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nombre VARCHAR(255),
  rol VARCHAR(50) DEFAULT 'agente', -- admin, agente, inversor
  avatar_url TEXT,
  empresa VARCHAR(255) DEFAULT 'FlipCol'
);

-- RLS (Row Level Security)
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuario ve todos los proyectos de su organización
-- (para equipo simple, todos ven todo)
CREATE POLICY "Usuarios autenticados pueden ver proyectos" ON proyectos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver gastos" ON gastos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver actividades" ON actividades
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Perfil propio" ON perfiles
  FOR ALL USING (auth.uid() = id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proyectos_updated_at
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Datos demo (opcional - comentar si no se quieren)
-- INSERT INTO proyectos (nombre, ciudad, tipo_inmueble, metros_cuadrados, precio_compra, precio_venta_real, estado, fecha_compra, fecha_venta, utilidad_neta, margen_neto, roi, duracion_meses)
-- VALUES ('Apto Manga', 'Cartagena', 'apartamento', 75, 280000000, 385000000, 'vendido', '2024-01-15', '2024-07-20', 62000000, 16.1, 22.1, 6.2);
