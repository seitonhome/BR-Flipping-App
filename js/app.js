// ============================================================
// FlipCol — B&R Inversiones S.A.S — Shared Utilities
// ============================================================

const SUPABASE_URL = 'https://woagfgjsbmxeizglomfh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvYWdmZ2pzYm14ZWl6Z2xvbWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDY2MjQsImV4cCI6MjA5MzQyMjYyNH0.yMjM8uPSAUge5IA3Aw_euZagyqXPKk_hHLSo4GxOmwo';

// Lazy init - handles different Supabase CDN export formats
var _sbClient = null;
function getSB() {
  if (!_sbClient) {
    var sb = window.supabase;
    var createClient = sb.createClient || (sb.default && sb.default.createClient);
    if (!createClient) throw new Error('Supabase CDN not loaded correctly');
    _sbClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sbClient;
}
// Global alias so pages can use `supabase.from(...)` directly
var supabase = {
  from: (...a) => getSB().from(...a),
  auth: {
    getSession: (...a) => getSB().auth.getSession(...a),
    getUser: (...a) => getSB().auth.getUser(...a),
    signOut: (...a) => getSB().auth.signOut(...a),
    signInWithPassword: (...a) => getSB().auth.signInWithPassword(...a),
    signUp: (...a) => getSB().auth.signUp(...a),
    onAuthStateChange: (...a) => getSB().auth.onAuthStateChange(...a),
  }
};

// ---- Auth Guard ----
async function requireAuth() {
  const { data } = await getSB().auth.getSession();
  if (!data.session) { window.location.href = 'index.html'; return null; }
  return data.session;
}

async function getUser() {
  const { data } = await getSB().auth.getUser();
  return data.user;
}

function doLogout() {
  getSB().auth.signOut().then(() => { window.location.href = 'index.html'; });
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

// ---- DOM helpers ----
function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;font-family:'DM Sans',sans-serif;animation:toastIn 0.3s ease;${type==='success'?'background:#1A3026;color:#70C090;border:1px solid rgba(76,175,124,0.3);':type==='error'?'background:#3A1A1A;color:#F07070;border:1px solid rgba(224,85,85,0.3);':'background:#1A2A3A;color:#80AEDD;border:1px solid rgba(91,155,213,0.3);'}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, 3000);
}

const _s = document.createElement('style');
_s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(_s);

// ---- Calc engine ----
const UVT_2026 = 49000;
const UVT_TOPE_1PCT = 20000 * UVT_2026;

function calcFiscal({ precioCompra, precioVenta, costoRemo, pctComision, duracion, predial, admin, financiacion, otrosG, anosPropiedad, tipoInmueble }) {
  const pc = precioCompra, pv = precioVenta;
  const notarialC = pc * 0.0027, beneficencia = pc * 0.0167, adminC = 200000;
  const totGC = notarialC + beneficencia + adminC;
  const notarialV = pv * 0.0027, comision = pv * (pctComision / 100), adminV = 150000;
  const totGV = notarialV + comision + adminV;
  const tasaRet = (pv > UVT_TOPE_1PCT || tipoInmueble === 'local') ? 0.025 : 0.01;
  const retencion = pv * tasaRet;
  const costoFiscal = pc + costoRemo + totGC;
  const utilBruta = pv - costoFiscal;
  let impGO = 0, notaGO = '';
  if (anosPropiedad < 2) { impGO = Math.max(0, utilBruta) * 0.33; notaGO = 'Renta ordinaria 33% (< 2 años)'; }
  else { impGO = Math.max(0, utilBruta) * 0.15; notaGO = 'Ganancia ocasional 15% (≥ 2 años)'; }
  const impGONeto = Math.max(0, impGO - retencion);
  const predialP = (predial / 12) * duracion, adminTotal = admin * duracion, finTotal = financiacion * duracion;
  const totalTenencia = predialP + adminTotal + finTotal + (otrosG || 0);
  const totalInv = pc + costoRemo + totGC + totalTenencia;
  const totalEgr = totalInv + totGV + retencion + impGONeto;
  const utilNeta = pv - totalEgr;
  const margen = pv > 0 ? utilNeta / pv : 0;
  const roi = totalInv > 0 ? utilNeta / totalInv : 0;
  const roiAnual = duracion > 0 ? roi * (12 / duracion) : 0;
  return { totGC, totGV, notarialC, beneficencia, adminC, notarialV, comision, adminV, tasaRet, retencion, costoFiscal, utilBruta, impGO, impGONeto, notaGO, predialP, adminTotal, finTotal, totalTenencia, totalInv, totalEgr, utilNeta, margen, roi, roiAnual };
}

function viabilidad(d) {
  const checks = [
    { ok: d.pctRemo <= 20, warn: d.pctRemo <= 25, key: 'remo' },
    { ok: d.margen * 100 >= 25, warn: d.margen * 100 >= 15, key: 'margen' },
    { ok: d.roi * 100 >= 20, warn: d.roi * 100 >= 10, key: 'roi' },
    { ok: d.utilNeta > 0, warn: false, key: 'utilidad' },
  ];
  const pasados = checks.filter(c => c.ok).length;
  const advertencias = checks.filter(c => !c.ok && c.warn).length;
  let verdict = pasados >= 3 ? 'viable' : (pasados >= 2 || advertencias >= 2 ? 'marginal' : 'noviable');
  return { checks, pasados, advertencias, verdict };
}
