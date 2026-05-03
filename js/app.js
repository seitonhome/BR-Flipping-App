// ============================================================
// FlipCol — Shared Utilities
// ============================================================

// Supabase config — REPLACE with your actual values
const SUPABASE_URL = 'https://TU_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Auth Guard ----
async function requireAuth() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) { window.location.href = 'index.html'; return null; }
  return data.session;
}

async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

function doLogout() {
  supabase.auth.signOut().then(() => { window.location.href = 'index.html'; });
}

// ---- Formatters ----
function fmtCOP(n) {
  if (!n && n !== 0) return '—';
  return '$ ' + Math.round(n).toLocaleString('es-CO');
}

function fmtCOPShort(n) {
  if (!n && n !== 0) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e9) return sign + '$ ' + (abs / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return sign + '$ ' + Math.round(abs / 1e6) + 'M';
  if (abs >= 1e3) return sign + '$ ' + Math.round(abs / 1e3) + 'K';
  return fmtCOP(n);
}

function fmtPct(n, dec = 1) {
  if (n === null || n === undefined) return '—';
  return (Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)).toFixed(dec) + '%';
}

function fmtDate(d) {
  if (!d) return '—';
  const dd = new Date(d + 'T00:00:00');
  return dd.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtInput(el) {
  let raw = el.value.replace(/\D/g, '');
  if (raw) el.value = parseInt(raw).toLocaleString('es-CO');
}

function parseInput(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  return parseFloat(el.value.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, '')) || 0;
}

function parseInputEl(el) {
  return parseFloat(el.value.replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.]/g, '')) || 0;
}

function setInputCOP(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val ? Math.round(val).toLocaleString('es-CO') : '';
}

// ---- DOM helpers ----
function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

function showEl(id) { const el = $(id); if (el) el.style.display = ''; }
function hideEl(id) { const el = $(id); if (el) el.style.display = 'none'; }

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  t.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;
    font-family:'DM Sans',sans-serif;
    animation:toastIn 0.3s ease;
    ${type === 'success' ? 'background:#1A3026;color:#70C090;border:1px solid rgba(76,175,124,0.3);' : ''}
    ${type === 'error' ? 'background:#3A1A1A;color:#F07070;border:1px solid rgba(224,85,85,0.3);' : ''}
    ${type === 'info' ? 'background:#1A2A3A;color:#80AEDD;border:1px solid rgba(91,155,213,0.3);' : ''}
  `;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

const toastCSS = document.createElement('style');
toastCSS.textContent = '@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(toastCSS);

// ---- Nav helpers ----
function setActivePage(id) {
  $$('.nav-item').forEach(el => el.classList.remove('active'));
  const el = $(id + '-nav');
  if (el) el.classList.add('active');
}

// ---- Calc engine ----
const UVT_2026 = 49000;
const UVT_TOPE_1PCT = 20000 * UVT_2026; // ~980M

function calcFiscal({
  precioCompra, precioVenta, costoRemo, totalGastosCompra,
  pctComision, duracion, predial, admin, financiacion, otrosG,
  anosPropiedad, tipoInmueble
}) {
  const pc = precioCompra;
  const pv = precioVenta;

  // Gastos compra
  const notarialC = pc * 0.0027;
  const beneficencia = pc * 0.0167;
  const adminC = 200000;
  const totGC = notarialC + beneficencia + adminC;

  // Gastos venta
  const notarialV = pv * 0.0027;
  const comision = pv * (pctComision / 100);
  const adminV = 150000;
  const totGV = notarialV + comision + adminV;

  // Retención
  const tasaRet = (pv > UVT_TOPE_1PCT || tipoInmueble === 'local') ? 0.025 : 0.01;
  const retencion = pv * tasaRet;

  // Impuesto ganancia
  const costoFiscal = pc + costoRemo + totGC;
  const utilBruta = pv - costoFiscal;
  let impGO = 0, notaGO = '';
  if (anosPropiedad < 2) {
    impGO = Math.max(0, utilBruta) * 0.33;
    notaGO = 'Renta ordinaria 33% (< 2 años)';
  } else {
    impGO = Math.max(0, utilBruta) * 0.15;
    notaGO = 'Ganancia ocasional 15% (≥ 2 años)';
  }
  const impGONeto = Math.max(0, impGO - retencion);

  // Tenencia
  const predialP = (predial / 12) * duracion;
  const adminTotal = admin * duracion;
  const finTotal = financiacion * duracion;
  const totalTenencia = predialP + adminTotal + finTotal + (otrosG || 0);

  // Totales
  const totalInv = pc + costoRemo + totGC + totalTenencia;
  const totalEgr = totalInv + totGV + retencion + impGONeto;
  const utilNeta = pv - totalEgr;
  const margen = pv > 0 ? utilNeta / pv : 0;
  const roi = totalInv > 0 ? utilNeta / totalInv : 0;
  const roiAnual = duracion > 0 ? roi * (12 / duracion) : 0;

  return {
    totGC, totGV, notarialC, beneficencia, adminC,
    notarialV, comision, adminV,
    tasaRet, retencion, costoFiscal, utilBruta,
    impGO, impGONeto, notaGO,
    predialP, adminTotal, finTotal, totalTenencia,
    totalInv, totalEgr, utilNeta,
    margen, roi, roiAnual,
  };
}

function viabilidad(d) {
  const checks = [
    { ok: d.pctRemo <= 20, warn: d.pctRemo <= 25, key: 'remo', label: `Remodelación: ${fmtPct(d.pctRemo)}` },
    { ok: d.margen * 100 >= 25, warn: d.margen * 100 >= 15, key: 'margen', label: `Margen neto: ${fmtPct(d.margen * 100)}` },
    { ok: d.roi * 100 >= 20, warn: d.roi * 100 >= 10, key: 'roi', label: `ROI: ${fmtPct(d.roi * 100)}` },
    { ok: d.utilNeta > 0, warn: false, key: 'utilidad', label: `Utilidad neta: ${fmtCOPShort(d.utilNeta)}` },
  ];
  const pasados = checks.filter(c => c.ok).length;
  const advertencias = checks.filter(c => !c.ok && c.warn).length;
  let verdict;
  if (pasados >= 3) verdict = 'viable';
  else if (pasados >= 2 || advertencias >= 2) verdict = 'marginal';
  else verdict = 'noviable';
  return { checks, pasados, advertencias, verdict };
}
