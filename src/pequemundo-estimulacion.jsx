import React, { useState, useEffect, useRef, useCallback } from "react";
import { Star, Home, BarChart3, ArrowLeft, RotateCcw, Sparkles } from "lucide-react";

// ============================================================
// Mente en Juego v4
//  · PequeMundo (niños): catálogo de 100+ juegos generados por
//    motores × variantes, filtrados AUTOMÁTICAMENTE por edad.
//    El perfil guarda la FECHA DE NACIMIENTO: la edad se
//    recalcula sola y los juegos cambian cuando cumple años.
//  · Área Ahorrar ampliada: alcancía, contar dinero, el vuelto,
//    comparar precios, necesito/quiero, metas de ahorro,
//    descuentos y ¿me alcanza?
//  · MenteActiva (adultos): sin cambios funcionales.
// ============================================================

// ---------- almacenamiento con fallback ----------
const memFallback = {};
async function guardar(clave, valor) {
  try { await window.storage.set(clave, JSON.stringify(valor)); }
  catch (e) { memFallback[clave] = JSON.stringify(valor); }
}
async function leer(clave) {
  try { const r = await window.storage.get(clave); return r ? JSON.parse(r.value) : null; }
  catch (e) { return memFallback[clave] ? JSON.parse(memFallback[clave]) : null; }
}

// ---------- utilidades (RNG con semilla: cada nivel es único y reproducible) ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function semillaDe(txt) {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
let _rng = Math.random;
const setSemilla = (n) => { _rng = mulberry32(n >>> 0); };
const soltarSemilla = () => { _rng = Math.random; };
const mezclar = (arr) => [...arr].sort(() => _rng() - 0.5);
const azar = (n) => Math.floor(_rng() * n);

let vozElegida = null;
function elegirVoz() {
  try {
    if (!window.speechSynthesis) return null;
    if (vozElegida) return vozElegida;
    const voces = window.speechSynthesis.getVoices() || [];
    const esp = voces.filter((v) => v.lang && v.lang.toLowerCase().startsWith("es"));
    if (esp.length === 0) return null;
    const orden = ["es-ar", "es-419", "es-mx", "es-us", "es-es", "es"];
    const femeninas = ["paulina", "mónica", "monica", "sabina", "helena", "laura", "isabela", "francisca", "lupe", "camila", "female", "mujer", "google español"];
    esp.sort((a, b) => {
      const pa = orden.findIndex((o) => a.lang.toLowerCase().startsWith(o));
      const pb = orden.findIndex((o) => b.lang.toLowerCase().startsWith(o));
      if (pa !== pb) return (pa < 0 ? 9 : pa) - (pb < 0 ? 9 : pb);
      const fa = femeninas.some((f) => a.name.toLowerCase().includes(f)) ? 0 : 1;
      const fb = femeninas.some((f) => b.name.toLowerCase().includes(f)) ? 0 : 1;
      return fa - fb;
    });
    vozElegida = esp[0];
    return vozElegida;
  } catch (e) { return null; }
}
try {
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => { vozElegida = null; elegirVoz(); };
} catch (e) { /* nada */ }

function hablar(texto, activo = true, ritmo = 0.95) {
  if (!activo) return;
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    const v = elegirVoz();
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "es-AR"; }
    u.rate = ritmo;
    u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  } catch (e) { /* sin audio */ }
}

// ---------- audio: efectos de sonido sintetizados + festejos ----------
let AUDIO_ON = true;
const setAudioOn = (v) => { AUDIO_ON = !!v; };
let _ctxAudio = null;
function ctxAudio() {
  try {
    if (!_ctxAudio) _ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctxAudio.state === "suspended") _ctxAudio.resume();
    return _ctxAudio;
  } catch (e) { return null; }
}
function tono(c, frec, t0, dur, tipo = "sine", vol = 0.16) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.value = frec;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(c.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
}
function sonido(nombre) {
  if (!AUDIO_ON) return;
  const c = ctxAudio();
  if (!c) return;
  const t = c.currentTime;
  if (nombre === "acierto") { tono(c, 523, t, 0.12); tono(c, 659, t + 0.1, 0.12); tono(c, 784, t + 0.2, 0.22); }
  else if (nombre === "error") { tono(c, 220, t, 0.2, "sine", 0.09); tono(c, 185, t + 0.12, 0.22, "sine", 0.08); }
  else if (nombre === "tap") { tono(c, 880, t, 0.05, "triangle", 0.07); }
  else if (nombre === "pop") { tono(c, 620, t, 0.05, "triangle", 0.14); tono(c, 930, t + 0.04, 0.07, "triangle", 0.12); }
  else if (nombre === "moneda") { tono(c, 988, t, 0.06, "square", 0.08); tono(c, 1319, t + 0.06, 0.12, "square", 0.08); }
  else if (nombre === "estrella") { tono(c, 1047, t, 0.1); tono(c, 1568, t + 0.1, 0.28); }
  else if (nombre === "fanfarria") { tono(c, 523, t, 0.12); tono(c, 659, t + 0.11, 0.12); tono(c, 784, t + 0.22, 0.12); tono(c, 1047, t + 0.33, 0.34, "sine", 0.2); tono(c, 1319, t + 0.5, 0.3, "sine", 0.12); }
}
const FRASES_FESTEJO = ["¡Muy bien!", "¡Excelente!", "¡Genial!", "¡Eso es!", "¡Perfecto!", "¡Bravo!", "¡Qué bien lo hiciste!", "¡Sos increíble!", "¡Sigue así, campeón!", "¡Lo lograste!"];
function festejar() {
  sonido("acierto");
  hablar(FRASES_FESTEJO[Math.floor(Math.random() * FRASES_FESTEJO.length)], AUDIO_ON);
}

// ---------- música de fondo gamer (generativa, según la edad) ----------
let musTimer = null;
function detenerMusica() { if (musTimer) { clearInterval(musTimer); musTimer = null; } }
function iniciarMusica(rango) {
  if (musTimer || !AUDIO_ON) return;
  const c = ctxAudio();
  if (!c) return;
  const escalas = { "3-5": [262, 294, 330, 392, 440], "6-8": [262, 330, 392, 494, 523, 587], "9-11": [220, 262, 330, 392, 440, 523, 587] };
  const esc = escalas[rango] || escalas["6-8"];
  const paso = rango === "3-5" ? 950 : rango === "6-8" ? 640 : 480;
  let i = Math.floor(Math.random() * esc.length);
  musTimer = setInterval(() => {
    if (!AUDIO_ON) return;
    const c2 = ctxAudio();
    if (!c2) return;
    const t = c2.currentTime;
    i = Math.max(0, Math.min(esc.length - 1, i + (Math.floor(Math.random() * 3) - 1)));
    tono(c2, esc[i], t, (paso / 1000) * 0.85, "triangle", 0.032);
    if (rango !== "3-5" && Math.random() < 0.45) tono(c2, esc[i] / 2, t, paso / 1000, "sine", 0.026);
  }, paso);
}

// ---------- edad a partir de la fecha de nacimiento ----------
function calcularEdad(isoNacimiento) {
  const hoy = new Date();
  const nac = new Date(isoNacimiento + "T00:00:00");
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}
function rangoDeEdad(edadAnios) {
  if (edadAnios <= 5) return "3-5";
  if (edadAnios <= 8) return "6-8";
  return "9-11";
}
function esCumpleHoy(isoNacimiento) {
  const hoy = new Date();
  const nac = new Date(isoNacimiento + "T00:00:00");
  return hoy.getDate() === nac.getDate() && hoy.getMonth() === nac.getMonth();
}

// ============================================================
// LIBRERÍA DE ILUSTRACIONES SVG (adaptadas por edad)
// ============================================================
function Figura({ id, edad = "3-5", className = "" }) {
  const d = edad !== "3-5";
  const g = d ? 2.5 : 4.5;
  const comun = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };

  const dibujos = {
    sol: (
      <g>
        {[...Array(8)].map((_, i) => {
          const a = (i * Math.PI) / 4;
          return <line key={i} x1={50 + Math.cos(a) * 30} y1={50 + Math.sin(a) * 30} x2={50 + Math.cos(a) * 42} y2={50 + Math.sin(a) * 42} stroke="#F59E0B" strokeWidth={g + 1} strokeLinecap="round" />;
        })}
        <circle cx="50" cy="50" r="24" fill="#FCD34D" stroke="#F59E0B" strokeWidth={g} />
        {d && (<g>
          <circle cx="43" cy="46" r="2.5" fill="#92400E" />
          <circle cx="57" cy="46" r="2.5" fill="#92400E" />
          <path d="M42 55 Q50 62 58 55" stroke="#92400E" strokeWidth="2.5" {...comun} />
        </g>)}
      </g>
    ),
    casa: (
      <g>
        <rect x="22" y="45" width="56" height="42" rx="3" fill="#FCA5A5" stroke="#B91C1C" strokeWidth={g} />
        <path d="M15 47 L50 15 L85 47 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth={g} />
        <rect x="43" y="62" width="14" height="25" rx="2" fill="#92400E" stroke="#78350F" strokeWidth={d ? 2 : 3.5} />
        {d && (<g>
          <rect x="28" y="52" width="11" height="11" rx="1.5" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="2" />
          <rect x="62" y="52" width="11" height="11" rx="1.5" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="2" />
          <rect x="62" y="20" width="9" height="16" fill="#78350F" />
        </g>)}
      </g>
    ),
    arbol: (
      <g>
        <rect x="44" y="55" width="12" height="32" rx="3" fill="#B45309" stroke="#78350F" strokeWidth={g} />
        <circle cx="50" cy="35" r="24" fill="#4ADE80" stroke="#15803D" strokeWidth={g} />
        <circle cx="32" cy="45" r="15" fill="#4ADE80" stroke="#15803D" strokeWidth={g} />
        <circle cx="68" cy="45" r="15" fill="#4ADE80" stroke="#15803D" strokeWidth={g} />
        {d && (<g>
          <circle cx="42" cy="33" r="4" fill="#EF4444" />
          <circle cx="60" cy="42" r="4" fill="#EF4444" />
          <circle cx="32" cy="48" r="4" fill="#EF4444" />
        </g>)}
      </g>
    ),
    auto: (
      <g>
        <path d="M15 60 Q15 48 27 48 L35 48 L43 34 L68 34 L76 48 L85 48 Q88 48 88 55 L88 62 Q88 66 84 66 L19 66 Q15 66 15 60 Z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth={g} />
        <circle cx="32" cy="68" r="9" fill="#374151" stroke="#111827" strokeWidth={g} />
        <circle cx="70" cy="68" r="9" fill="#374151" stroke="#111827" strokeWidth={g} />
        {d && (<g>
          <path d="M46 38 L46 47 L58 47 L58 38 Z" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="2" />
          <circle cx="85" cy="55" r="3" fill="#FCD34D" />
        </g>)}
      </g>
    ),
    pez: (
      <g>
        <ellipse cx="45" cy="50" rx="28" ry="18" fill="#7DD3FC" stroke="#0369A1" strokeWidth={g} />
        <path d="M70 50 L88 36 L88 64 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth={g} />
        <circle cx="32" cy="45" r={d ? 4 : 5} fill="#0C4A6E" />
        {d && (<g>
          <path d="M48 34 Q52 50 48 66" stroke="#0369A1" strokeWidth="2" {...comun} />
          <circle cx="16" cy="34" r="3" fill="none" stroke="#0369A1" strokeWidth="2" />
        </g>)}
      </g>
    ),
    luna: (
      <g>
        <path d="M62 12 a38 38 0 1 0 0 76 a30 30 0 1 1 0 -76 Z" fill="#FDE68A" stroke="#D97706" strokeWidth={g} />
        {d && <path d="M78 25 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#FCD34D" />}
      </g>
    ),
    estrella: (
      <g>
        <path d="M50 8 L61 38 L93 38 L67 57 L76 88 L50 70 L24 88 L33 57 L7 38 L39 38 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth={g} />
        {d && (<g>
          <circle cx="43" cy="48" r="2.5" fill="#92400E" />
          <circle cx="57" cy="48" r="2.5" fill="#92400E" />
          <path d="M43 57 Q50 63 57 57" stroke="#92400E" strokeWidth="2.5" {...comun} />
        </g>)}
      </g>
    ),
    flor: (
      <g>
        <line x1="50" y1="60" x2="50" y2="90" stroke="#15803D" strokeWidth={g + 1} strokeLinecap="round" />
        {[...Array(5)].map((_, i) => {
          const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          return <circle key={i} cx={50 + Math.cos(a) * 16} cy={40 + Math.sin(a) * 16} r="12" fill="#F9A8D4" stroke="#BE185D" strokeWidth={g - 1} />;
        })}
        <circle cx="50" cy="40" r="10" fill="#FCD34D" stroke="#D97706" strokeWidth={g - 1} />
      </g>
    ),
    pelota: (
      <g>
        <circle cx="50" cy="50" r="34" fill="#FB923C" stroke="#C2410C" strokeWidth={g} />
        <path d="M50 16 L50 84 M16 50 L84 50" stroke="#C2410C" strokeWidth={d ? 2.5 : 4} {...comun} />
        {d && (<g>
          <path d="M26 26 Q50 42 74 26" stroke="#C2410C" strokeWidth="2.5" {...comun} />
          <path d="M26 74 Q50 58 74 74" stroke="#C2410C" strokeWidth="2.5" {...comun} />
        </g>)}
      </g>
    ),
    globo: (
      <g>
        <path d="M50 78 Q46 86 42 92 M50 78 Q54 86 58 92" stroke="#991B1B" strokeWidth={d ? 2 : 3} {...comun} />
        <ellipse cx="50" cy="45" rx="26" ry="32" fill="#F87171" stroke="#B91C1C" strokeWidth={g} />
        <path d="M45 74 L55 74 L50 80 Z" fill="#B91C1C" />
      </g>
    ),
    gato: (
      <g>
        <path d="M25 32 L28 12 L42 26 Z" fill="#FB923C" stroke="#C2410C" strokeWidth={g} />
        <path d="M75 32 L72 12 L58 26 Z" fill="#FB923C" stroke="#C2410C" strokeWidth={g} />
        <circle cx="50" cy="52" r="32" fill="#FDBA74" stroke="#C2410C" strokeWidth={g} />
        <circle cx="38" cy="46" r={d ? 4 : 5} fill="#431407" />
        <circle cx="62" cy="46" r={d ? 4 : 5} fill="#431407" />
        <path d="M46 58 L54 58 L50 63 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="1.5" />
        {d && <path d="M20 50 L34 52 M20 60 L34 58 M80 50 L66 52 M80 60 L66 58" stroke="#C2410C" strokeWidth="2" {...comun} />}
      </g>
    ),
    manzana: (
      <g>
        <path d="M50 30 Q52 20 58 15" stroke="#78350F" strokeWidth={g} {...comun} />
        <path d="M58 22 Q70 14 76 22 Q70 30 58 26 Z" fill="#4ADE80" stroke="#15803D" strokeWidth={g - 1.5} />
        <path d="M50 34 Q30 22 20 42 Q12 60 30 78 Q42 88 50 80 Q58 88 70 78 Q88 60 80 42 Q70 22 50 34 Z" fill="#F87171" stroke="#B91C1C" strokeWidth={g} />
      </g>
    ),
    moneda: (
      <g>
        <circle cx="50" cy="50" r="36" fill="#FCD34D" stroke="#B45309" strokeWidth={g} />
        <circle cx="50" cy="50" r="27" fill="none" stroke="#B45309" strokeWidth={d ? 2 : 3} strokeDasharray="4 4" />
        <text x="50" y="63" textAnchor="middle" fontSize="34" fontWeight="900" fill="#92400E">$</text>
      </g>
    ),
    billete: (
      <g>
        <rect x="8" y="28" width="84" height="44" rx="6" fill="#86EFAC" stroke="#15803D" strokeWidth={g} />
        <rect x="16" y="36" width="68" height="28" rx="4" fill="none" stroke="#15803D" strokeWidth={d ? 1.5 : 2.5} />
        <circle cx="50" cy="50" r="11" fill="#BBF7D0" stroke="#15803D" strokeWidth={d ? 1.5 : 2.5} />
        <text x="50" y="56" textAnchor="middle" fontSize="16" fontWeight="900" fill="#14532D">$</text>
      </g>
    ),
  };

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={id}>
      {dibujos[id] || <circle cx="50" cy="50" r="30" fill="#CBD5E1" />}
    </svg>
  );
}

function Bichito({ className = "" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="bichito">
      <circle cx="50" cy="30" r="14" fill="#1F2937" />
      <path d="M38 20 Q30 10 26 8 M62 20 Q70 10 74 8" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="58" rx="32" ry="34" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
      <line x1="50" y1="26" x2="50" y2="92" stroke="#1F2937" strokeWidth="3" />
      <circle cx="36" cy="48" r="5" fill="#1F2937" />
      <circle cx="64" cy="48" r="5" fill="#1F2937" />
      <circle cx="33" cy="68" r="5" fill="#1F2937" />
      <circle cx="67" cy="68" r="5" fill="#1F2937" />
      <circle cx="45" cy="28" r="2.5" fill="#fff" />
      <circle cx="55" cy="28" r="2.5" fill="#fff" />
    </svg>
  );
}

// Moneda o billete con su valor, para los juegos de dinero
function Dinero({ valor, edad = "6-8", chico = false }) {
  const esBillete = valor >= 10;
  const cl = chico ? (esBillete ? "h-12 w-16" : "h-12 w-12") : (esBillete ? "h-16 w-24 sm:h-20 sm:w-28" : "h-16 w-16 sm:h-20 sm:w-20");
  return (
    <span className={`relative inline-flex ${cl}`}>
      <Figura id={esBillete ? "billete" : "moneda"} edad={edad} className="h-full w-full" />
      <span className={`absolute inset-0 flex items-center justify-center font-black ${esBillete ? "pt-0 text-green-900" : "pt-1 text-amber-900"} ${chico ? "text-sm" : "text-lg sm:text-xl"}`}>{valor}</span>
    </span>
  );
}

const VOCABULARIO = [
  { id: "sol", p: "sol", s: ["sol"] }, { id: "casa", p: "casa", s: ["ca", "sa"] },
  { id: "gato", p: "gato", s: ["ga", "to"] }, { id: "pez", p: "pez", s: ["pez"] },
  { id: "flor", p: "flor", s: ["flor"] }, { id: "pelota", p: "pelota", s: ["pe", "lo", "ta"] },
  { id: "auto", p: "auto", s: ["au", "to"] }, { id: "manzana", p: "manzana", s: ["man", "za", "na"] },
  { id: "arbol", p: "árbol", s: ["ár", "bol"] }, { id: "luna", p: "luna", s: ["lu", "na"] },
  { id: "estrella", p: "estrella", s: ["es", "tre", "lla"] }, { id: "globo", p: "globo", s: ["glo", "bo"] },
];
const PACK_NATURALEZA = ["sol", "arbol", "flor", "luna", "estrella", "manzana"];
const PACK_COSAS = ["casa", "auto", "pelota", "globo", "gato", "pez"];
const PACK_TODO = ["sol", "gato", "pez", "flor", "pelota", "auto", "estrella", "manzana"];
const B_ANIMALES = [
  { e: "🐶", p: "perro", s: ["pe", "rro"] }, { e: "🐮", p: "vaca", s: ["va", "ca"] },
  { e: "🐴", p: "caballo", s: ["ca", "ba", "llo"] }, { e: "🐰", p: "conejo", s: ["co", "ne", "jo"] },
  { e: "🦆", p: "pato", s: ["pa", "to"] }, { e: "🦁", p: "león", s: ["le", "ón"] },
  { e: "🐵", p: "mono", s: ["mo", "no"] }, { e: "🐻", p: "oso", s: ["o", "so"] },
  { e: "🐢", p: "tortuga", s: ["tor", "tu", "ga"] }, { e: "🐝", p: "abeja", s: ["a", "be", "ja"] },
  { e: "🐸", p: "rana", s: ["ra", "na"] }, { e: "🦒", p: "jirafa", s: ["ji", "ra", "fa"] },
  { e: "🐯", p: "tigre", s: ["ti", "gre"] }, { e: "🐘", p: "elefante", s: ["e", "le", "fan", "te"] },
  { e: "🦋", p: "mariposa", s: ["ma", "ri", "po", "sa"] }, { e: "🐊", p: "cocodrilo", s: ["co", "co", "dri", "lo"] },
];
const B_COMIDA = [
  { e: "🥖", p: "pan", s: ["pan"] }, { e: "🧀", p: "queso", s: ["que", "so"] },
  { e: "🥚", p: "huevo", s: ["hue", "vo"] }, { e: "🍲", p: "sopa", s: ["so", "pa"] },
  { e: "🎂", p: "torta", s: ["tor", "ta"] }, { e: "🍦", p: "helado", s: ["he", "la", "do"] },
  { e: "🍊", p: "naranja", s: ["na", "ran", "ja"] }, { e: "🍇", p: "uva", s: ["u", "va"] },
  { e: "🍉", p: "sandía", s: ["san", "dí", "a"] }, { e: "🍅", p: "tomate", s: ["to", "ma", "te"] },
  { e: "🥕", p: "zanahoria", s: ["za", "na", "ho", "ria"] }, { e: "🍌", p: "banana", s: ["ba", "na", "na"] },
  { e: "🍓", p: "frutilla", s: ["fru", "ti", "lla"] },
];
const B_CASA = [
  { e: "🪑", p: "silla", s: ["si", "lla"] }, { e: "🛏️", p: "cama", s: ["ca", "ma"] },
  { e: "🚪", p: "puerta", s: ["puer", "ta"] }, { e: "🪟", p: "ventana", s: ["ven", "ta", "na"] },
  { e: "🥛", p: "vaso", s: ["va", "so"] }, { e: "🍽️", p: "plato", s: ["pla", "to"] },
  { e: "🥄", p: "cuchara", s: ["cu", "cha", "ra"] }, { e: "🧼", p: "jabón", s: ["ja", "bón"] },
  { e: "🪞", p: "espejo", s: ["es", "pe", "jo"] }, { e: "🔑", p: "llave", s: ["lla", "ve"] },
  { e: "⏰", p: "reloj", s: ["re", "loj"] }, { e: "🧤", p: "guante", s: ["guan", "te"] },
];
const B_NATURALEZA = [
  { e: "☁️", p: "nube", s: ["nu", "be"] }, { e: "🌧️", p: "lluvia", s: ["llu", "via"] },
  { e: "⛰️", p: "montaña", s: ["mon", "ta", "ña"] }, { e: "🏖️", p: "playa", s: ["pla", "ya"] },
  { e: "🔥", p: "fuego", s: ["fue", "go"] }, { e: "❄️", p: "nieve", s: ["nie", "ve"] },
  { e: "💨", p: "viento", s: ["vien", "to"] }, { e: "🌱", p: "semilla", s: ["se", "mi", "lla"] },
  { e: "🌍", p: "planeta", s: ["pla", "ne", "ta"] }, { e: "⚡", p: "relámpago", s: ["re", "lám", "pa", "go"] },
  { e: "🧊", p: "hielo", s: ["hie", "lo"] }, { e: "🌵", p: "cactus", s: ["cac", "tus"] },
];
const B_TRANSPORTE = [
  { e: "🚂", p: "tren", s: ["tren"] }, { e: "⛵", p: "barco", s: ["bar", "co"] },
  { e: "✈️", p: "avión", s: ["a", "vión"] }, { e: "🏍️", p: "moto", s: ["mo", "to"] },
  { e: "🚚", p: "camión", s: ["ca", "mión"] }, { e: "🚀", p: "cohete", s: ["co", "he", "te"] },
  { e: "🚲", p: "bicicleta", s: ["bi", "ci", "cle", "ta"] }, { e: "🚁", p: "helicóptero", s: ["he", "li", "cóp", "te", "ro"] },
];
const B_MAGICAS = [
  { e: "🐉", p: "dragón", s: ["dra", "gón"] }, { e: "🧙", p: "bruja", s: ["bru", "ja"] },
  { e: "🥁", p: "tambor", s: ["tam", "bor"] }, { e: "👑", p: "corona", s: ["co", "ro", "na"] },
  { e: "🏰", p: "castillo", s: ["cas", "ti", "llo"] }, { e: "🦄", p: "unicornio", s: ["u", "ni", "cor", "nio"] },
];
const PALABRAS_MEDIO = [...B_ANIMALES.slice(0, 8), ...B_CASA.slice(0, 4)];
const PALABRAS_DIFICIL = [
  B_TRANSPORTE[0], B_COMIDA[12], B_ANIMALES[15], B_NATURALEZA[9], B_NATURALEZA[1],
  B_TRANSPORTE[7], ...B_MAGICAS.slice(0, 3), B_NATURALEZA[8],
];
const BANCO_SILABAS = [...VOCABULARIO, ...B_ANIMALES, ...B_COMIDA, ...B_CASA, ...B_NATURALEZA, ...B_TRANSPORTE, ...B_MAGICAS];
const TODOS_BANCOS = [VOCABULARIO, B_ANIMALES, B_COMIDA, B_CASA, B_NATURALEZA, B_TRANSPORTE, B_MAGICAS];

// ---------- región: cada país nombra las cosas a su manera ----------
const TXT = { plata: "plata" };
const REGLAS_REGION = [
  { base: "banana", sBase: ["ba", "na", "na"], alt: { cl: "plátano", mx: "plátano", es: "plátano", pe: "plátano", co: "banano" }, sAlt: { "plátano": ["plá", "ta", "no"], banano: ["ba", "na", "no"] } },
  { base: "frutilla", sBase: ["fru", "ti", "lla"], alt: { mx: "fresa", es: "fresa", co: "fresa", pe: "fresa", us: "fresa", br: "morango", xx: "fresa" }, sAlt: { fresa: ["fre", "sa"], morango: ["mo", "ran", "go"] } },
  { base: "auto", sBase: ["au", "to"], alt: { mx: "carro", co: "carro", pe: "carro", us: "carro", es: "coche" }, sAlt: { carro: ["ca", "rro"], coche: ["co", "che"] } },
  { base: "torta", sBase: ["tor", "ta"], alt: { mx: "pastel", es: "pastel", pe: "pastel", co: "pastel" }, sAlt: { pastel: ["pas", "tel"] } },
  { base: "pelota", sBase: ["pe", "lo", "ta"], alt: { mx: "balón", es: "balón" }, sAlt: { "balón": ["ba", "lón"] } },
];
function aplicarRegion(pais) {
  TXT.plata = ["ar", "uy", "cl"].includes(pais) ? "plata" : "dinero";
  REGLAS_REGION.forEach((r) => {
    TODOS_BANCOS.forEach((banco) => {
      banco.forEach((it) => {
        const esEste = it.p === r.base || Object.values(r.alt).includes(it.p);
        if (!esEste) return;
        const nueva = r.alt[pais] || r.base;
        it.p = nueva;
        it.s = nueva === r.base ? r.sBase : r.sAlt[nueva];
      });
    });
  });
}

// ============================================================
// ======================  MÓDULO NIÑOS  ======================
// ============================================================

const AREAS = {
  cognitiva: { nombre: "Pensar", icono: "🧠", color: "bg-violet-500", suave: "bg-violet-100", texto: "text-violet-700", desc: "Memoria, lógica, números y patrones",
    habilidad: "Ejercita funciones ejecutivas: memoria de trabajo, atención y flexibilidad mental. La investigación en psicología del desarrollo asocia estas habilidades con el rendimiento académico posterior." },
  lenguaje: { nombre: "Hablar", icono: "💬", color: "bg-amber-500", suave: "bg-amber-100", texto: "text-amber-700", desc: "Palabras, letras y sonidos",
    habilidad: "Ejercita vocabulario y conciencia de las letras y sonidos, que la investigación identifica como bases de la lectura comprensiva." },
  psicomotor: { nombre: "Mover", icono: "✋", color: "bg-emerald-500", suave: "bg-emerald-100", texto: "text-emerald-700", desc: "Coordinación ojo-mano",
    habilidad: "Ejercita coordinación ojo-mano y velocidad de respuesta, vinculadas con la motricidad fina que después requiere la escritura." },
  convivir: { nombre: "Convivir", icono: "💛", color: "bg-rose-500", suave: "bg-rose-100", texto: "text-rose-700", desc: "Modales, palabras mágicas y ayudar en casa",
    habilidad: "Ejercita habilidades socioemocionales: reconocer conductas positivas, usar las palabras mágicas (por favor, gracias, perdón), colaborar en el hogar y tratar con cariño. Los programas de aprendizaje socioemocional en la infancia muestran, en la investigación educativa, asociaciones con mejor convivencia y clima familiar y escolar." },
  descubrir: { nombre: "Descubrir", icono: "🦁", color: "bg-cyan-500", suave: "bg-cyan-100", texto: "text-cyan-700", desc: "Animales, ciencia, geografía e historia",
    habilidad: "Conocimiento del mundo: datos de animales e insectos, nociones de ciencia y del sistema solar, capitales y banderas, e historia argentina básica. El conocimiento general amplio está asociado, en la investigación educativa, con mejor comprensión lectora: cuanto más sabés del mundo, más entendés lo que leés." },
  idiomas: { nombre: "Idiomas", icono: "🌍", color: "bg-indigo-500", suave: "bg-indigo-100", texto: "text-indigo-700", desc: "Inglés, francés, portugués, chino y árabe",
    habilidad: "Primeras palabras en otros idiomas: colores, números, saludos y familia, siempre con audio. Aprender idiomas es valioso en sí mismo (comunicación, cultura); sobre ventajas cognitivas adicionales del bilingüismo la evidencia científica está en debate, y por eso no las prometemos. Este módulo se habilita desde los 6 años: la exposición natural temprana a otros idiomas (canciones, juego en familia) es positiva según la investigación sobre bilingüismo, pero las lecciones estructuradas en pantalla rinden mejor cuando el niño ya afianzó la pronunciación de su propia lengua." },
  economia: { nombre: "Ahorrar", icono: "💰", color: "bg-pink-500", suave: "bg-pink-100", texto: "text-pink-700", desc: "Dinero, precios, ahorro y decisiones",
    habilidad: "Introduce nociones de ahorro, valor del dinero, precios y diferencia entre necesidades y deseos. La OCDE recomienda comenzar la educación financiera en edades tempranas, y estudios longitudinales como el de Dunedin (Moffitt y colegas) asociaron el autocontrol en la infancia con mejores resultados financieros y de salud en la adultez." },
};

// ---------- items para juegos financieros ----------
const ITEMS_NQ = [
  { e: "🍎", p: "comida", tipo: "necesito", por: "Comer es una necesidad para vivir y crecer." },
  { e: "💧", p: "agua", tipo: "necesito", por: "El agua es indispensable todos los días." },
  { e: "🧥", p: "abrigo", tipo: "necesito", por: "Abrigarse protege la salud." },
  { e: "🏠", p: "un hogar", tipo: "necesito", por: "Un lugar seguro para vivir es una necesidad." },
  { e: "💊", p: "remedios", tipo: "necesito", por: "Cuidar la salud es una necesidad." },
  { e: "📚", p: "útiles escolares", tipo: "necesito", por: "Aprender necesita herramientas." },
  { e: "🍭", p: "golosinas", tipo: "quiero", por: "Ricas, pero se puede vivir sin ellas: son un deseo." },
  { e: "🧸", p: "un juguete nuevo", tipo: "quiero", por: "Los juguetes son deseos: pueden esperar o ahorrarse." },
  { e: "🎮", p: "un videojuego", tipo: "quiero", por: "Divertido, pero es un deseo, no una necesidad." },
  { e: "🍦", p: "un helado", tipo: "quiero", por: "Un gusto que se disfruta de vez en cuando." },
  { e: "🎈", p: "globos de fiesta", tipo: "quiero", por: "Alegran, pero son un deseo." },
  { e: "👟", p: "zapatillas de moda", tipo: "quiero", por: "Si ya tenés calzado, las de moda son un deseo." },
];
const ITEMS_NQ_AVANZADO = [
  ...ITEMS_NQ,
  { e: "📱", p: "el celular último modelo", tipo: "quiero", por: "Si el que tenés funciona, el último modelo es un deseo." },
  { e: "🚌", p: "el boleto para ir a la escuela", tipo: "necesito", por: "Llegar a la escuela es parte de aprender: es necesidad." },
  { e: "🪥", p: "un cepillo de dientes", tipo: "necesito", por: "La higiene cuida la salud: es necesidad." },
  { e: "🎧", p: "auriculares nuevos", tipo: "quiero", por: "Suman, pero se puede vivir sin ellos." },
  { e: "🧦", p: "medias sin agujeros", tipo: "necesito", por: "La ropa básica en buen estado es una necesidad." },
  { e: "🍕", p: "pedir pizza otra vez", tipo: "quiero", por: "Si hay comida en casa, pedir de nuevo es un deseo." },
];
const PRODUCTOS = [
  { e: "🍎", p: "manzana" }, { e: "🥖", p: "pan" }, { e: "🥛", p: "leche" }, { e: "🧃", p: "jugo" },
  { e: "🧸", p: "peluche" }, { e: "⚽", p: "pelota" }, { e: "📒", p: "cuaderno" }, { e: "✏️", p: "lápiz" },
  { e: "🍫", p: "chocolate" }, { e: "🚲", p: "bicicleta" }, { e: "🎒", p: "mochila" }, { e: "🧢", p: "gorra" },
];

// ---------- datos de Convivir (modales y conductas) ----------
const BIEN_MAL = [
  { e: "🧸", t: "Guardar los juguetes después de jugar", ok: true, por: "Ordenar lo que usaste es cuidar tu casa y ayudar a tu familia." },
  { e: "🗣️", t: "Gritarle a mamá o papá cuando me enojo", ok: false, por: "Enojarse está bien, gritar lastima. Podés decir con palabras: «estoy enojado»." },
  { e: "🤝", t: "Prestarle un juguete a un amigo", ok: true, por: "Compartir hace que jugar sea más lindo para todos." },
  { e: "🍽️", t: "Llevar mi plato a la cocina al terminar", ok: true, por: "Cada uno puede ayudar con algo chiquito: así la casa funciona en equipo." },
  { e: "✋", t: "Pegarle a alguien que me sacó algo", ok: false, por: "Pegar nunca arregla nada. Podés pedirlo con palabras o buscar a un grande." },
  { e: "🙏", t: "Pedir las cosas con «por favor»", ok: true, por: "Las palabras mágicas abren puertas: la gente ayuda con más ganas." },
  { e: "🤥", t: "Decir una mentira para no tener problemas", ok: false, por: "Decir la verdad, aunque cueste, hace que confíen en vos." },
  { e: "🧹", t: "Ayudar a barrer o poner la mesa", ok: true, por: "Ayudar en casa te hace parte del equipo de tu familia." },
  { e: "😜", t: "Burlarme de un compañero", ok: false, por: "Las burlas lastiman por dentro. Tratá a los demás como te gusta que te traten." },
  { e: "👂", t: "Escuchar cuando otro habla, sin interrumpir", ok: true, por: "Escuchar es una forma de decir «me importás»." },
  { e: "🚿", t: "Lavarme las manos antes de comer", ok: true, por: "La higiene cuida tu salud y la de tu familia." },
  { e: "🥱", t: "Decir «no quiero» a los gritos y tirarme al piso", ok: false, por: "Podés decir que no con calma. Los berrinches no consiguen nada bueno." },
];
const MAGICAS = [
  { e: "🎁", q: "Te regalan algo que te encanta. ¿Qué decís?", ops: ["¡Gracias!", "¡Dame otro!", "Nada"], ok: 0, por: "«Gracias» es la palabra mágica cuando alguien te da algo." },
  { e: "🥤", q: "Querés que te alcancen el jugo. ¿Cómo lo pedís?", ops: ["¿Me das el jugo, por favor?", "¡Jugo ya!", "Lo agarro sin pedir"], ok: 0, por: "«Por favor» convierte una orden en un pedido amable." },
  { e: "💥", q: "Sin querer chocaste a alguien. ¿Qué decís?", ops: ["¡Perdón!", "¡Salí del medio!", "Nada, sigo caminando"], ok: 0, por: "«Perdón» arregla los accidentes chiquitos y cuida a los demás." },
  { e: "🌅", q: "Te levantás y ves a tu familia. ¿Qué decís?", ops: ["¡Buen día!", "Nada, tengo sueño", "¿Dónde está mi desayuno?"], ok: 0, por: "Saludar al despertar arranca el día con cariño." },
  { e: "🚪", q: "Llegás a la casa de tu abuela. ¿Qué hacés primero?", ops: ["Saludo con un beso o un hola", "Voy directo a la tele", "Pido comida"], ok: 0, por: "Saludar al llegar es mostrar que la otra persona te importa." },
  { e: "🌙", q: "Te vas a dormir. ¿Qué decís?", ops: ["¡Buenas noches!", "Nada", "¡No me quiero dormir!"], ok: 0, por: "Despedirse con «buenas noches» es un mimo antes de dormir." },
  { e: "🍪", q: "Tu amigo te convida una galletita. ¿Qué decís?", ops: ["¡Gracias!", "¿Solo una?", "Nada"], ok: 0, por: "Agradecer lo que te convidan hace que quieran compartir de nuevo." },
  { e: "🆘", q: "Necesitás ayuda con algo difícil. ¿Cómo la pedís?", ops: ["¿Me ayudás, por favor?", "¡Vení ya!", "Lloro fuerte"], ok: 0, por: "Pedir ayuda con «por favor» funciona mucho mejor que a los gritos." },
];
const AYUDAR = [
  { e: "🍽️", q: "Terminaron de comer. ¿Cómo podés ayudar?", ops: ["Llevo mi plato a la cocina", "Me voy corriendo a jugar", "Dejo todo tirado"], ok: 0, por: "Levantar tu plato es una ayuda chiquita que suma un montón." },
  { e: "🧦", q: "Hay ropa limpia doblada. ¿Cómo ayudás?", ops: ["Guardo mis medias en el cajón", "La desarmo toda", "No es mi problema"], ok: 0, por: "Guardar tu propia ropa es tu parte del equipo de la casa." },
  { e: "🐕", q: "El perro tiene el plato vacío. ¿Qué hacés?", ops: ["Aviso o le pongo comida con ayuda", "Nada, que se arregle", "Le doy mi golosina"], ok: 0, por: "Cuidar a las mascotas es una responsabilidad linda para compartir." },
  { e: "🛒", q: "Mamá llega con las bolsas del súper. ¿Qué hacés?", ops: ["Ayudo a llevar una bolsita", "Miro", "Pido lo que compró"], ok: 0, por: "Ayudar con lo que puedas, aunque sea una bolsita, dice «te cuido»." },
  { e: "🧸", q: "Tu cuarto quedó lleno de juguetes. ¿Qué hacés?", ops: ["Los guardo antes de otra cosa", "Los dejo para mañana", "Los escondo abajo de la cama"], ok: 0, por: "Ordenar lo que usaste es parte de jugar." },
  { e: "🍰", q: "Van a cocinar una torta. ¿Cómo participás?", ops: ["Pido ayudar a mezclar o alcanzar cosas", "Meto los dedos en todo", "Solo quiero comerla"], ok: 0, por: "Cocinar juntos es ayudar y aprender al mismo tiempo." },
  { e: "🌱", q: "Las plantas están secas. ¿Qué hacés?", ops: ["Ofrezco regarlas con ayuda", "Les arranco las hojas", "Nada"], ok: 0, por: "Regar las plantas es un trabajo perfecto para vos." },
  { e: "🪥", q: "Es hora de dormir. ¿Qué hacés sin que te lo pidan?", ops: ["Me lavo los dientes y me pongo el pijama", "Me escondo", "Pido cinco minutos mil veces"], ok: 0, por: "Hacer tu rutina solo demuestra lo grande que estás." },
];
const SITUACIONES = [
  { e: "😢", q: "Tu hermanito se cayó y está llorando.", ops: ["Lo ayudo y llamo a un grande", "Me río", "Sigo jugando como si nada"], ok: 0, por: "Ayudar a quien lo necesita es lo más valiente que hay." },
  { e: "🎮", q: "Perdiste en un juego con tus amigos.", ops: ["Felicito al que ganó", "Tiro el juego al piso", "Digo que hicieron trampa"], ok: 0, por: "Saber perder es de campeones: la próxima te toca a vos." },
  { e: "🍬", q: "Quedó un solo caramelo y tu amigo también quiere.", ops: ["Propongo compartirlo", "Me lo como rápido", "Lo escondo"], ok: 0, por: "Compartir a la mitad: los dos contentos." },
  { e: "😠", q: "Estás muy enojado con tu mamá.", ops: ["Le digo con palabras que estoy enojado", "Le grito", "Rompo algo"], ok: 0, por: "Todas las emociones están bien; lo que elegimos hacer con ellas importa." },
  { e: "🆕", q: "Llega un compañero nuevo que no conoce a nadie.", ops: ["Lo invito a jugar", "Lo ignoro", "Me burlo de su ropa"], ok: 0, por: "Incluir al que está solo puede cambiarle el día entero." },
  { e: "💔", q: "Rompiste sin querer algo de tu papá.", ops: ["Le cuento la verdad y pido perdón", "Lo escondo", "Culpo a mi hermano"], ok: 0, por: "La verdad más perdón es la fórmula que arregla casi todo." },
  { e: "👵", q: "Tu abuela cuenta una historia larga.", ops: ["La escucho con atención", "Miro el celular", "La interrumpo"], ok: 0, por: "Escuchar a los abuelos es un regalo para ellos y para vos." },
  { e: "🤫", q: "Un amigo te pide hacer algo que sabés que está mal.", ops: ["Digo que no y aviso a un grande si hace falta", "Lo hago para que no se enoje", "Lo hago si nadie mira"], ok: 0, por: "Decir «no» a lo que está mal es de valientes, aunque cueste." },
];

// ---------- datos de Descubrir ----------
const B_QUIZ_ANIMALES = [
  { e: "🐮", q: "¿Qué come la vaca?", ops: ["Pasto", "Carne", "Pescado"], ok: 0, por: "La vaca es herbívora: come pasto y hierbas." },
  { e: "🐟", q: "¿Dónde vive el pez?", ops: ["En el agua", "En los árboles", "Bajo tierra"], ok: 0, por: "Los peces respiran en el agua con sus branquias." },
  { e: "🦒", q: "¿Cuál es el animal más alto del mundo?", ops: ["La jirafa", "El caballo", "El oso"], ok: 0, por: "La jirafa puede medir más de 5 metros." },
  { e: "🐔", q: "¿Qué animal pone huevos?", ops: ["La gallina", "La vaca", "El perro"], ok: 0, por: "Las aves, como la gallina, nacen de huevos." },
  { e: "🐄", q: "¿Cómo se llama la cría de la vaca?", ops: ["Ternero", "Cachorro", "Pollito"], ok: 0, por: "El ternero es el bebé de la vaca." },
  { e: "🐻", q: "¿Qué animal duerme casi todo el invierno?", ops: ["El oso", "La vaca", "El caballo"], ok: 0, por: "Se llama hibernar: el oso descansa hasta la primavera." },
  { e: "🦇", q: "¿Cuál de estos vuela?", ops: ["El murciélago", "El perro", "La tortuga"], ok: 0, por: "El murciélago es el único mamífero que vuela de verdad." },
  { e: "🐝", q: "¿Qué hacen las abejas al visitar las flores?", ops: ["Llevan polen de flor en flor", "Se las comen", "Las riegan"], ok: 0, por: "Eso se llama polinizar, y gracias a eso crecen frutas y semillas." },
  { e: "🕷️", q: "¿Cuántas patas tiene una araña?", ops: ["8", "6", "4"], ok: 0, por: "Las arañas tienen 8 patas: por eso no son insectos." },
  { e: "🐜", q: "¿Cuántas patas tienen los insectos?", ops: ["6", "8", "10"], ok: 0, por: "Todos los insectos tienen 6 patas, como la hormiga." },
  { e: "🍯", q: "¿Qué producen las abejas?", ops: ["Miel", "Leche", "Lana"], ok: 0, por: "Las abejas fabrican miel con el néctar de las flores." },
  { e: "🐆", q: "¿Cuál es el animal terrestre más veloz?", ops: ["El guepardo", "La tortuga", "El elefante"], ok: 0, por: "El guepardo corre más de 100 km por hora, ¡pero se cansa rápido!" },
  { e: "🐋", q: "La ballena es…", ops: ["Un mamífero", "Un pez", "Un insecto"], ok: 0, por: "Aunque vive en el mar, respira aire y amamanta a sus crías." },
  { e: "🐛", q: "¿En qué se convierte la oruga?", ops: ["En mariposa", "En araña", "En pez"], ok: 0, por: "Se transforma dentro del capullo: se llama metamorfosis." },
];
const B_QUIZ_CIENCIA = [
  { e: "☀️", q: "¿Qué es el Sol?", ops: ["Una estrella", "Un planeta", "Una luna"], ok: 0, por: "El Sol es la estrella más cercana a la Tierra." },
  { e: "🌍", q: "¿En qué planeta vivimos?", ops: ["La Tierra", "Marte", "La Luna"], ok: 0, por: "La Tierra es nuestro hogar, el planeta azul." },
  { e: "🪐", q: "¿Cuál es el planeta más cercano al Sol?", ops: ["Mercurio", "Júpiter", "Saturno"], ok: 0, por: "Mercurio es el primero y el más chiquito." },
  { e: "📅", q: "¿Cuánto tarda la Tierra en dar la vuelta al Sol?", ops: ["Un año", "Un día", "Una semana"], ok: 0, por: "365 días: ¡por eso cumplís años una vez por año!" },
  { e: "🧊", q: "El agua muy fría se convierte en…", ops: ["Hielo", "Vapor", "Arena"], ok: 0, por: "Al congelarse, el agua se vuelve sólida: hielo." },
  { e: "💨", q: "El agua muy caliente se convierte en…", ops: ["Vapor", "Hielo", "Piedra"], ok: 0, por: "Al hervir, el agua se evapora y sube como vapor." },
  { e: "🌱", q: "¿Qué necesitan las plantas para crecer?", ops: ["Agua, luz y tierra", "Solo música", "Caramelos"], ok: 0, por: "Con agua, luz del sol y nutrientes de la tierra, crecen fuertes." },
  { e: "🌙", q: "¿Qué vemos de noche girando alrededor de la Tierra?", ops: ["La Luna", "El Sol", "Otro planeta"], ok: 0, por: "La Luna es el satélite natural de la Tierra." },
  { e: "🌈", q: "¿Cuándo aparece el arcoíris?", ops: ["Con sol y lluvia a la vez", "Solo de noche", "Cuando nieva"], ok: 0, por: "La luz del sol se separa en colores al pasar por las gotitas." },
  { e: "🫁", q: "¿Qué usamos para respirar?", ops: ["Los pulmones", "El estómago", "Las orejas"], ok: 0, por: "Los pulmones llevan el aire a todo el cuerpo." },
  { e: "❤️", q: "¿Qué órgano bombea la sangre?", ops: ["El corazón", "El cerebro", "La nariz"], ok: 0, por: "El corazón late todo el día para mover la sangre." },
  { e: "🦴", q: "¿Qué sostiene nuestro cuerpo por dentro?", ops: ["Los huesos", "El pelo", "La ropa"], ok: 0, por: "El esqueleto tiene más de 200 huesos que nos sostienen." },
];
const B_QUIZ_HISTORIA = [
  { e: "🐎", q: "¿Quién cruzó los Andes para ayudar a liberar países?", ops: ["San Martín", "Belgrano", "Sarmiento"], ok: 0, por: "José de San Martín cruzó la cordillera con su ejército." },
  { e: "🇦🇷", q: "¿Quién creó la bandera argentina?", ops: ["Belgrano", "San Martín", "Colón"], ok: 0, por: "Manuel Belgrano la creó a orillas del río Paraná." },
  { e: "🎩", q: "¿Qué recordamos el 25 de Mayo?", ops: ["El Primer Gobierno Patrio de 1810", "Un mundial de fútbol", "La llegada del tren"], ok: 0, por: "En 1810 se formó el primer gobierno propio en Buenos Aires." },
  { e: "📜", q: "¿Qué se declaró el 9 de Julio de 1816?", ops: ["La Independencia", "El inicio de las vacaciones", "La primavera"], ok: 0, por: "En Tucumán se declaró la Independencia de Argentina." },
  { e: "🎨", q: "¿De qué colores es la bandera argentina?", ops: ["Celeste y blanca", "Roja y verde", "Negra y amarilla"], ok: 0, por: "Celeste y blanca, con un sol dorado en el medio." },
  { e: "📚", q: "¿Qué prócer impulsó las escuelas y fue presidente?", ops: ["Sarmiento", "Belgrano", "San Martín"], ok: 0, por: "Domingo F. Sarmiento fundó cientos de escuelas." },
  { e: "☀️", q: "¿Qué tiene la bandera argentina en el centro?", ops: ["Un sol", "Una estrella", "Una luna"], ok: 0, por: "Es el Sol de Mayo, símbolo de la patria." },
  { e: "🏫", q: "¿Dónde se declaró la Independencia en 1816?", ops: ["En Tucumán", "En la playa", "En la Luna"], ok: 0, por: "En la Casa de Tucumán, que todavía se puede visitar." },
];
const B_QUIZ_ESTUDIO = [
  { e: "📅", q: "¿Qué funciona mejor para recordar lo que estudiás?", ops: ["Repasar un poco varios días", "Todo junto la última noche", "Leer una sola vez"], ok: 0, por: "Se llama práctica espaciada y es de lo más probado por la ciencia del aprendizaje." },
  { e: "🤫", q: "Antes de estudiar conviene…", ops: ["Preparar el lugar y alejar distracciones", "Prender la tele", "Tener el celu al lado"], ok: 0, por: "Un lugar tranquilo hace que el mismo tiempo rinda el doble." },
  { e: "🗣️", q: "Después de leer un texto, ¿qué ayuda a fijarlo?", ops: ["Contarlo con tus palabras", "Cerrar el libro y ya", "Mirarlo de lejos"], ok: 0, por: "Explicarlo con tus palabras es de las técnicas más poderosas." },
  { e: "😴", q: "¿Dormir bien ayuda a aprender?", ops: ["Sí: la memoria se guarda al dormir", "No, es tiempo perdido", "Solo a los adultos"], ok: 0, por: "Mientras dormís, el cerebro ordena y guarda lo aprendido." },
  { e: "🙋", q: "Si algo no lo entendés…", ops: ["Preguntar está buenísimo", "Mejor disimular", "Abandonar"], ok: 0, por: "Preguntar es de valientes y es el camino más corto para entender." },
  { e: "🎧", q: "¿Estudiar con música con letra a todo volumen?", ops: ["Suele distraer", "Ayuda siempre", "Es obligatorio"], ok: 0, por: "La letra compite con lo que leés. Música suave sin letra molesta menos." },
  { e: "📝", q: "Un buen resumen tiene…", ops: ["Las ideas principales con tus palabras", "Todo copiado igual", "Solo dibujitos"], ok: 0, por: "Elegir qué es lo importante ya es estudiar." },
  { e: "❓", q: "Hacerte preguntas a vos mismo sobre lo estudiado…", ops: ["Ayuda un montón a fijarlo", "No sirve", "Da mala suerte"], ok: 0, por: "Autoevaluarse es más efectivo que releer mil veces." },
  { e: "⏸️", q: "¿Qué conviene hacer cada 25-30 minutos de estudio?", ops: ["Una pausa cortita", "Seguir 5 horas sin parar", "Dormirse"], ok: 0, por: "Las pausas breves ayudan a la concentración." },
];
const B_CAPITALES = [
  { pais: "Argentina", cap: "Buenos Aires", e: "🇦🇷" }, { pais: "Chile", cap: "Santiago", e: "🇨🇱" },
  { pais: "Uruguay", cap: "Montevideo", e: "🇺🇾" }, { pais: "Perú", cap: "Lima", e: "🇵🇪" },
  { pais: "Colombia", cap: "Bogotá", e: "🇨🇴" }, { pais: "Paraguay", cap: "Asunción", e: "🇵🇾" },
  { pais: "Brasil", cap: "Brasilia", e: "🇧🇷" }, { pais: "México", cap: "Ciudad de México", e: "🇲🇽" },
  { pais: "España", cap: "Madrid", e: "🇪🇸" }, { pais: "Francia", cap: "París", e: "🇫🇷" },
  { pais: "Italia", cap: "Roma", e: "🇮🇹" }, { pais: "Estados Unidos", cap: "Washington", e: "🇺🇸" },
  { pais: "Japón", cap: "Tokio", e: "🇯🇵" }, { pais: "China", cap: "Pekín", e: "🇨🇳" },
];
const B_LECTURAS = [
  { t: "Luna es una gata blanca. Todas las mañanas toma su leche y después se duerme arriba del sillón.", q: "¿Qué hace Luna después de tomar la leche?", ops: ["Se duerme en el sillón", "Sale a pasear", "Juega con la pelota"], ok: 0 },
  { t: "Tomi tiene una bici roja. Los sábados va a la plaza con su papá y andan juntos hasta que se esconde el sol.", q: "¿Cuándo va Tomi a la plaza?", ops: ["Los sábados", "Todos los días", "Los lunes"], ok: 0 },
  { t: "En el jardín de Emma hay tres flores amarillas y una roja. Cada tarde las riega con su regadera verde.", q: "¿De qué color es la regadera de Emma?", ops: ["Verde", "Roja", "Amarilla"], ok: 0 },
  { t: "Bruno perdió un diente. Lo guardó abajo de la almohada y a la mañana encontró una moneda.", q: "¿Dónde guardó Bruno el diente?", ops: ["Abajo de la almohada", "En la mochila", "En el jardín"], ok: 0 },
  { t: "La maestra pidió llevar una fruta. Sofía llevó una manzana, Leo una banana y Vera llevó uvas.", q: "¿Qué fruta llevó Leo?", ops: ["Una banana", "Una manzana", "Uvas"], ok: 0 },
  { t: "El perro Rocco ladra cuando suena el timbre, pero mueve la cola cuando llega la abuela.", q: "¿Qué hace Rocco cuando llega la abuela?", ops: ["Mueve la cola", "Ladra fuerte", "Se esconde"], ok: 0 },
  { t: "Sofi guardó el paraguas en la mochila antes de salir. Al volver, tenía el pelo seco aunque todos llegaban empapados.", q: "¿Por qué Sofi tenía el pelo seco?", ops: ["Porque usó el paraguas", "Porque no salió de su casa", "Porque hacía calor"], ok: 0, dif: true },
  { t: "Nico miró el cielo gris, cerró las ventanas y entró la ropa que estaba colgada afuera.", q: "¿Qué pensó Nico que iba a pasar?", ops: ["Que iba a llover", "Que iba a salir el sol", "Que era de noche"], ok: 0, dif: true },
  { t: "Cata sopló las velitas, todos aplaudieron y después repartieron la torta en pedacitos.", q: "¿Qué estaban festejando?", ops: ["Un cumpleaños", "Un partido", "La Navidad"], ok: 0, dif: true },
  { t: "El semáforo se puso verde, pero Julián esperó: un señor mayor todavía estaba cruzando despacio.", q: "¿Por qué esperó Julián?", ops: ["Para cuidar al señor que cruzaba", "Porque estaba cansado", "Porque el semáforo estaba roto"], ok: 0, dif: true },
  { t: "Mara metió la mano en el bolsillo y encontró arena. Sonrió acordándose del fin de semana.", q: "¿Dónde estuvo Mara el fin de semana?", ops: ["En la playa", "En el cine", "En la nieve"], ok: 0, dif: true },
  { t: "Apenas terminó de comer, Fede llevó su plato, agarró la mochila y se puso la campera del club.", q: "¿A dónde iba Fede probablemente?", ops: ["A entrenar al club", "A dormir la siesta", "Al médico"], ok: 0, dif: true },
];

// ---------- datos de Idiomas ----------
const IDIOMAS = {
  en: { nombre: "Inglés", bandera: "🇬🇧", lang: "en-US" },
  fr: { nombre: "Francés", bandera: "🇫🇷", lang: "fr-FR" },
  pt: { nombre: "Portugués", bandera: "🇧🇷", lang: "pt-BR" },
  zh: { nombre: "Chino", bandera: "🇨🇳", lang: "zh-CN" },
  ar: { nombre: "Árabe", bandera: "🇸🇦", lang: "ar-SA" },
};
const VOCAB_IDIOMAS = {
  colores: {
    nombre: "Los colores",
    items: [
      { e: "🔴", es: "rojo", en: "red", fr: "rouge", pt: "vermelho", zh: "hóngsè", ar: "ahmar" },
      { e: "🔵", es: "azul", en: "blue", fr: "bleu", pt: "azul", zh: "lánsè", ar: "azraq" },
      { e: "🟡", es: "amarillo", en: "yellow", fr: "jaune", pt: "amarelo", zh: "huángsè", ar: "asfar" },
      { e: "🟢", es: "verde", en: "green", fr: "vert", pt: "verde", zh: "lǜsè", ar: "akhdar" },
      { e: "🟣", es: "violeta", en: "purple", fr: "violet", pt: "roxo", zh: "zǐsè", ar: "banafsaji" },
      { e: "🟠", es: "naranja", en: "orange", fr: "orange", pt: "laranja", zh: "chéngsè", ar: "burtuqali" },
      { e: "⚪", es: "blanco", en: "white", fr: "blanc", pt: "branco", zh: "báisè", ar: "abyad" },
      { e: "⚫", es: "negro", en: "black", fr: "noir", pt: "preto", zh: "hēisè", ar: "aswad" },
    ],
  },
  numeros: {
    nombre: "Los números",
    items: [
      { e: "1️⃣", es: "uno", en: "one", fr: "un", pt: "um", zh: "yī", ar: "wahid" },
      { e: "2️⃣", es: "dos", en: "two", fr: "deux", pt: "dois", zh: "èr", ar: "ithnan" },
      { e: "3️⃣", es: "tres", en: "three", fr: "trois", pt: "três", zh: "sān", ar: "thalatha" },
      { e: "4️⃣", es: "cuatro", en: "four", fr: "quatre", pt: "quatro", zh: "sì", ar: "arbaa" },
      { e: "5️⃣", es: "cinco", en: "five", fr: "cinq", pt: "cinco", zh: "wǔ", ar: "khamsa" },
      { e: "6️⃣", es: "seis", en: "six", fr: "six", pt: "seis", zh: "liù", ar: "sitta" },
      { e: "7️⃣", es: "siete", en: "seven", fr: "sept", pt: "sete", zh: "qī", ar: "sabaa" },
      { e: "8️⃣", es: "ocho", en: "eight", fr: "huit", pt: "oito", zh: "bā", ar: "thamaniya" },
      { e: "9️⃣", es: "nueve", en: "nine", fr: "neuf", pt: "nove", zh: "jiǔ", ar: "tisaa" },
      { e: "🔟", es: "diez", en: "ten", fr: "dix", pt: "dez", zh: "shí", ar: "ashara" },
    ],
  },
  saludos: {
    nombre: "Saludos y palabras mágicas",
    items: [
      { e: "👋", es: "hola", en: "hello", fr: "bonjour", pt: "olá", zh: "nǐ hǎo", ar: "marhaba" },
      { e: "🙏", es: "por favor", en: "please", fr: "s'il te plaît", pt: "por favor", zh: "qǐng", ar: "min fadlik" },
      { e: "💖", es: "gracias", en: "thank you", fr: "merci", pt: "obrigado", zh: "xièxie", ar: "shukran" },
      { e: "😔", es: "perdón", en: "sorry", fr: "pardon", pt: "desculpa", zh: "duìbuqǐ", ar: "asif" },
      { e: "🌅", es: "buen día", en: "good morning", fr: "bonjour", pt: "bom dia", zh: "zǎoshang hǎo", ar: "sabah al-khayr" },
      { e: "🌙", es: "buenas noches", en: "good night", fr: "bonne nuit", pt: "boa noite", zh: "wǎn'ān", ar: "layla saida" },
      { e: "👋", es: "chau", en: "goodbye", fr: "au revoir", pt: "tchau", zh: "zàijiàn", ar: "maa salama" },
    ],
  },
  familia: {
    nombre: "La familia",
    items: [
      { e: "👩", es: "mamá", en: "mom", fr: "maman", pt: "mamãe", zh: "māma", ar: "mama" },
      { e: "👨", es: "papá", en: "dad", fr: "papa", pt: "papai", zh: "bàba", ar: "baba" },
      { e: "👶", es: "bebé", en: "baby", fr: "bébé", pt: "bebê", zh: "bǎobǎo", ar: "tifl" },
      { e: "🧑‍🤝‍🧑", es: "amigo", en: "friend", fr: "ami", pt: "amigo", zh: "péngyou", ar: "sadiq" },
      { e: "🏠", es: "casa", en: "house", fr: "maison", pt: "casa", zh: "jiā", ar: "bayt" },
      { e: "💧", es: "agua", en: "water", fr: "eau", pt: "água", zh: "shuǐ", ar: "ma" },
    ],
  },
};
function hablarIdioma(texto, lang) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    const voces = window.speechSynthesis.getVoices() || [];
    const v = voces.find((x) => x.lang && x.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
    if (v) u.voice = v;
    u.lang = lang;
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  } catch (e) { /* sin audio */ }
}

// ---------- catálogo de videos de premio (links reales verificados por búsqueda web; los padres eligen cuáles habilitar) ----------
const CATALOGO_VIDEOS = [
  {
    cat: "🎵 Canciones para cantar y bailar", edades: "3 a 6 años",
    items: [
      { t: "Plim Plim — Top 30 canciones más escuchadas", url: "https://www.youtube.com/watch?v=LrNpYPRG1Yc", dur: null },
      { t: "Plim Plim — Canciones para cantar en familia", url: "https://www.youtube.com/watch?v=ZgFfF4FsfiI", dur: 15 },
      { t: "Plim Plim — Para bailar con sus amigos", url: "https://www.youtube.com/watch?v=8OymvrjGvyE", dur: 30 },
      { t: "Canticuénticos — Mejores videos", url: "https://www.youtube.com/watch?v=HggpDfQWbTc", dur: 60 },
      { t: "Canticuénticos — Compilado de canciones", url: "https://www.youtube.com/watch?v=v7CSDAFW0nE", dur: 41 },
      { t: "Canticuénticos — Con el Monstruo de la laguna", url: "https://www.youtube.com/watch?v=10wSTVLK9hk", dur: 35 },
    ],
  },
  {
    cat: "📚 Cuentos clásicos narrados", edades: "3 a 8 años",
    items: [
      { t: "El Patito Feo — cuento para dormir", url: "https://www.youtube.com/watch?v=2plf_JFa4VA", dur: null },
      { t: "El Zorro y la Cigüeña — cuento con moraleja", url: "https://www.youtube.com/watch?v=FmisFJpCim0", dur: null },
      { t: "El Rey Midas — cuento clásico narrado", url: "https://www.youtube.com/watch?v=R5VTpUrkVCs", dur: null },
    ],
  },
  {
    cat: "🧠 Aprender e historia (Zamba · Pakapaka)", edades: "6 a 11 años",
    items: [
      { t: "Zamba recorre la vida de San Martín (maratón)", url: "https://www.youtube.com/watch?v=57KIUyJ4H04", dur: null },
      { t: "El asombroso mundo de Zamba: San Martín", url: "https://www.youtube.com/watch?v=X1Sfpo2oUaA", dur: null },
      { t: "El asombroso musical de Zamba con San Martín", url: "https://www.youtube.com/watch?v=KYVyFJxxo-U", dur: null },
    ],
  },
];
const TITULO_VIDEO = {};
const DUR_VIDEO = {};
CATALOGO_VIDEOS.forEach((c) => c.items.forEach((it) => { TITULO_VIDEO[it.url] = it.t; DUR_VIDEO[it.url] = it.dur || null; }));
const durTexto = (url) => (DUR_VIDEO[url] ? `${DUR_VIDEO[url]} min` : "duración s/d");
const URLS_CATALOGO = new Set(Object.keys(TITULO_VIDEO));

// ============================================================
// Motor genérico de juegos por rondas de opción múltiple
// ============================================================
const Tarjeta = ({ children }) => (
  <div className="flex flex-col items-center gap-2 rounded-3xl bg-white px-6 py-5 shadow-md sm:px-8 sm:py-6">{children}</div>
);

function JuegoRondas({ total = 8, generar, alTerminar, colorTexto = "text-violet-600", formato = "cuadrado", espera = 1000, solito = false }) {
  const [r, setR] = useState(() => generar());
  const [num, setNum] = useState(1);
  const [puntos, setPuntos] = useState(0);
  const [marca, setMarca] = useState(null);
  const [preSel, setPreSel] = useState(null);
  const [fallidas, setFallidas] = useState([]);

  // en modo Solito la app lee la consigna de cada ronda
  useEffect(() => {
    if (!solito) return;
    const t = setTimeout(() => {
      if (r.decir) r.decir();
      else if (r.dice) hablar(r.dice, AUDIO_ON, 0.95);
    }, 400);
    return () => clearTimeout(t);
  }, [num]); // eslint-disable-line

  const decirOpcion = (op) => {
    if (r.hablarOpcion) r.hablarOpcion(op);
    else hablar(String(op), AUDIO_ON, 0.95);
  };

  const avanzar = (nuevos) => {
    setTimeout(() => {
      if (num >= total) alTerminar(nuevos, total * 10);
      else { setNum(num + 1); setR(generar()); setMarca(null); setPreSel(null); setFallidas([]); }
    }, r.explicacion ? espera + 700 : espera);
  };

  const responder = (op) => {
    if (marca !== null) return;
    if (fallidas.includes(op)) { decirOpcion(op); return; }
    if (solito && preSel !== op) { setPreSel(op); sonido("tap"); decirOpcion(op); return; }
    const ok = op === r.respuesta;
    if (ok) {
      festejar();
      const ganados = solito && fallidas.length > 0 ? 6 : 10;
      const nuevos = puntos + ganados;
      setPuntos(nuevos);
      setMarca(op);
      avanzar(nuevos);
    } else if (solito) {
      // reintentar hasta que salga bien
      sonido("error");
      hablar(["Probá otra vez", "Casi... probá otra", "¡Vos podés! Otra vez"][Math.floor(Math.random() * 3)], AUDIO_ON);
      setFallidas([...fallidas, op]);
      setPreSel(null);
    } else {
      sonido("error");
      setMarca(op);
      avanzar(puntos);
    }
  };

  const esCorta = (op) => String(op).length <= 3;
  const todasCortas = r.opciones.every(esCorta);
  const usarCuadrado = formato === "cuadrado" && todasCortas;

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6">
      {r.pregunta}
      <div className={usarCuadrado ? "flex flex-wrap justify-center gap-3 sm:gap-4" : "flex w-full max-w-xs flex-col gap-3"}>
        {r.opciones.map((op, i) => (
          <button key={i} onClick={() => responder(op)}
            className={`${usarCuadrado
              ? "h-16 w-16 rounded-2xl text-2xl sm:h-20 sm:w-20 sm:text-3xl"
              : "w-full rounded-full px-6 py-3 text-lg sm:py-4 sm:text-xl"} font-black shadow-md transition-transform active:scale-90 ${
              marca !== null && op === r.respuesta ? "bg-green-300 text-green-900"
              : marca === op ? "bg-red-200 text-red-800"
              : fallidas.includes(op) ? "bg-red-50 text-red-300 line-through"
              : preSel === op ? "bg-white text-slate-700 ring-4 ring-sky-300"
              : "bg-white text-slate-700"
            }`}>
            {String(op)}
          </button>
        ))}
      </div>
      {solito && marca === null && (
        <p className="text-xs font-bold text-slate-400">🎧 Tocá para escuchar · tocá de nuevo para elegir</p>
      )}
      {marca !== null && r.explicacion && (
        <p className={`max-w-sm text-center text-base font-bold sm:text-lg ${marca === r.respuesta ? "text-green-700" : "text-amber-700"}`}>
          {marca === r.respuesta ? "✅ " : "💡 "}{r.explicacion}
        </p>
      )}
      <p className={`text-base font-bold sm:text-lg ${colorTexto}`}>Ronda {num} de {total} · Puntos: {puntos}</p>
    </div>
  );
}

// helpers para opciones numéricas
function opcionesNum(resp, cuantas = 3, dispersion = 4, minimo = 0) {
  const ops = new Set([resp]);
  let intentos = 0;
  while (ops.size < cuantas && intentos < 200) {
    const dd = resp + (azar(dispersion * 2 + 1) - dispersion);
    if (dd >= minimo && dd !== resp) ops.add(dd);
    intentos++;
  }
  let extra = resp + dispersion + 1;
  while (ops.size < cuantas) { ops.add(extra); extra++; }
  return mezclar([...ops]);
}

const Consigna = ({ children }) => <p className="text-center text-lg font-bold text-slate-600 sm:text-xl">{children}</p>;

// ============================================================
// GENERADORES (motores) — cada uno recibe params de la variante
// ============================================================
const GENERADORES = {
  cuentas: (p) => () => {
    let n1, n2, n3 = null, resp, simbolo, disp = 4;
    if (p.tipo === "suma") { n1 = azar(p.tope) + 1; n2 = azar(p.tope) + 1; resp = n1 + n2; simbolo = "+"; }
    else if (p.tipo === "resta") { n1 = azar(p.tope) + 2; n2 = azar(n1 - 1) + 1; resp = n1 - n2; simbolo = "−"; }
    else if (p.tipo === "suma3") { n1 = azar(15) + 1; n2 = azar(15) + 1; n3 = azar(15) + 1; resp = n1 + n2 + n3; simbolo = "+"; }
    else if (p.tipo === "doble") { n1 = azar(15) + 1; resp = n1 * 2; }
    else if (p.tipo === "mitad") { n1 = (azar(15) + 1) * 2; resp = n1 / 2; }
    else if (p.tipo === "mult") { n1 = p.tablas[azar(p.tablas.length)]; n2 = azar(9) + 2; resp = n1 * n2; disp = 6; }
    else { n2 = azar(8) + 2; resp = azar(9) + 2; n1 = n2 * resp; simbolo = "÷"; } // división
    const texto = p.tipo === "doble" ? `El doble de ${n1}` : p.tipo === "mitad" ? `La mitad de ${n1}`
      : p.tipo === "suma3" ? `${n1} + ${n2} + ${n3}` : p.tipo === "mult" ? `${n1} × ${n2}` : `${n1} ${simbolo} ${n2}`;
    return {
      pregunta: (<><Consigna>Resolvé 🧮</Consigna><Tarjeta><p className="text-4xl font-black text-slate-800 sm:text-5xl">{texto}</p></Tarjeta></>),
      opciones: opcionesNum(resp, 3, disp), respuesta: resp,
      dice: "¿Cuánto es " + texto.replace("−", " menos ").replace("×", " por ").replace("÷", " dividido ").replace("+", " más ") + "?",
    };
  },

  sumaFiguras: () => () => {
    const em = ["🍎", "⭐", "🐞", "🌸"][azar(4)];
    const a = azar(4) + 1, b = azar(4) + 1;
    const resp = a + b;
    return {
      pregunta: (<><Consigna>¿Cuántos hay en total? 👀</Consigna><Tarjeta>
        <div className="flex items-center gap-3 text-4xl">
          <span>{em.repeat(a)}</span><span className="font-black text-slate-500">+</span><span>{em.repeat(b)}</span>
        </div></Tarjeta></>),
      opciones: opcionesNum(resp, 3, 2, 1), respuesta: resp, dice: "¿Cuántos hay en total?",
    };
  },

  contar: (p) => () => {
    const em = p.tema || ["🐶", "⭐", "🐟", "🌼"][azar(4)];
    const n = azar(p.max - 1) + 2;
    return {
      pregunta: (<><Consigna>¿Cuántos hay? 🔢</Consigna><Tarjeta>
        <div className="flex max-w-xs flex-wrap justify-center gap-1 text-3xl sm:text-4xl">
          {[...Array(n)].map((_, i) => <span key={i}>{em}</span>)}
        </div></Tarjeta></>),
      opciones: opcionesNum(n, 3, 2, 1), respuesta: n, dice: "¿Cuántos hay?",
    };
  },

  mayorMenor: (p) => () => {
    const cant = p.n || 2;
    const nums = new Set();
    while (nums.size < cant) nums.add(azar(p.tope) + 1);
    const arr = [...nums];
    const resp = p.modo === "menor" ? Math.min(...arr) : Math.max(...arr);
    return {
      pregunta: (<><Consigna>¿Cuál es el número más {p.modo === "menor" ? "chico" : "grande"}? 🤔</Consigna></>),
      opciones: mezclar(arr), respuesta: resp, dice: `¿Cuál es el número más ${p.modo === "menor" ? "chico" : "grande"}?`,
    };
  },

  parImpar: () => () => {
    const n = azar(99) + 1;
    return {
      pregunta: (<><Consigna>¿El número es par o impar?</Consigna><Tarjeta><p className="text-5xl font-black text-slate-800">{n}</p></Tarjeta></>),
      opciones: ["Par", "Impar"], respuesta: n % 2 === 0 ? "Par" : "Impar", dice: `¿El número ${n} es par o impar?`,
      explicacion: n % 2 === 0 ? `${n} se puede repartir en dos partes iguales: es par.` : `${n} no se reparte en dos partes iguales: es impar.`,
    };
  },

  secuencia: (p) => () => {
    const paso = p.paso;
    const desde = p.atras ? paso * 4 + azar(20) + 4 : azar(p.desdeMax || 10) + 1;
    const sec = [...Array(4)].map((_, i) => p.atras ? desde - i * paso : desde + i * paso);
    const resp = p.atras ? desde - 4 * paso : desde + 4 * paso;
    return {
      pregunta: (<><Consigna>¿Qué número sigue? ➡️</Consigna><Tarjeta>
        <p className="text-3xl font-black text-slate-800 sm:text-4xl">{sec.join(" · ")} · <span className="text-violet-500">?</span></p></Tarjeta></>),
      opciones: opcionesNum(resp, 3, Math.max(2, paso)), respuesta: resp, dice: "¿Qué número sigue?",
    };
  },

  faltaNumero: (p) => () => {
    const desde = azar(p.tope - 4) + 1;
    const falta = desde + 1 + azar(2);
    const sec = [desde, desde + 1, desde + 2, desde + 3].map((n) => (n === falta ? "_" : n));
    return {
      pregunta: (<><Consigna>¿Qué número falta? 🔍</Consigna><Tarjeta>
        <p className="text-3xl font-black text-slate-800 sm:text-4xl">{sec.join(" · ")}</p></Tarjeta></>),
      opciones: opcionesNum(falta, 3, 2, 1), respuesta: falta, dice: "¿Qué número falta?",
    };
  },

  patrones: (p) => () => {
    const fichas = mezclar(p.fichas).slice(0, p.cuantas);
    const [a, b, c] = fichas;
    let base;
    const tipo = p.cuantas <= 3 ? 0 : azar(3);
    if (tipo === 0) base = [a, b, a, b, a, b, a, b];
    else if (tipo === 1) base = [a, a, b, b, a, a, b, b];
    else base = [a, b, c, a, b, c, a, b];
    const sec = base.slice(0, p.largo);
    const resp = base[p.largo];
    const ops = new Set([resp]);
    while (ops.size < 3) ops.add(p.fichas[azar(p.fichas.length)]);
    return {
      pregunta: (<><Consigna>¿Qué sigue en la fila? 🔮</Consigna>
        <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-3xl bg-white p-4 shadow-md sm:gap-2">
          {sec.map((f, i) => <span key={i} className="text-3xl sm:text-4xl">{f}</span>)}
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-4 border-dashed border-violet-300 text-xl font-black text-violet-400">?</span>
        </div></>),
      opciones: mezclar([...ops]), respuesta: resp, dice: "¿Qué sigue en la fila?",
    };
  },

  palabras: (p, edad) => () => {
    const banco = p.banco;
    const item = banco[azar(banco.length)];
    const ops = new Set([item.p]);
    while (ops.size < 3) ops.add(banco[azar(banco.length)].p);
    return {
      pregunta: (<><Consigna>¿Cómo se llama esto? 👀</Consigna>
        <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white p-3 shadow-md sm:h-40 sm:w-40">
          {item.id
            ? <Figura id={item.id} edad={edad} className="h-full w-full" />
            : <span className="text-7xl sm:text-8xl">{item.e}</span>}
        </div></>),
      opciones: mezclar([...ops]), respuesta: item.p, dice: "¿Cómo se llama esto?",
    };
  },

  letras: (p) => () => {
    const bancoL = BANCO_SILABAS.filter((x) => /^[a-z]/.test(x.p));
    const item = bancoL[azar(bancoL.length)];
    const abec = "ABCDEFGLMNOPRSTUVZ".split("");
    if (p.modo === "primera" || p.modo === "ultima") {
      const resp = (p.modo === "primera" ? item.p[0] : item.p[item.p.length - 1]).toUpperCase();
      const ops = new Set([resp]);
      while (ops.size < 4) ops.add(abec[azar(abec.length)]);
      return {
        pregunta: (<><Consigna>¿Con qué letra {p.modo === "primera" ? "empieza" : "termina"}? ✏️</Consigna>
          <Tarjeta>{item.id ? <Figura id={item.id} edad="6-8" className="h-24 w-24" /> : <span className="text-6xl">{item.e}</span>}
          <span className="text-2xl font-black text-slate-800">{p.modo === "primera" ? "_" + item.p.slice(1) : item.p.slice(0, -1) + "_"}</span></Tarjeta></>),
        opciones: mezclar([...ops]), respuesta: resp,
      };
    }
    if (p.modo === "cuantasLetras" || p.modo === "cuantasVocales") {
      const limpia = item.p.replace(/\s/g, "");
      const resp = p.modo === "cuantasLetras" ? limpia.length : (limpia.match(/[aeiouáéíóú]/gi) || []).length;
      return {
        pregunta: (<><Consigna>¿Cuántas {p.modo === "cuantasLetras" ? "letras" : "vocales"} tiene? 🔤</Consigna>
          <Tarjeta><span className="text-4xl font-black tracking-widest text-slate-800">{item.p.toUpperCase()}</span></Tarjeta></>),
        opciones: opcionesNum(resp, 3, 2, 1), respuesta: resp,
      };
    }
    // empiezaVocal
    const esVocal = "aeiouáéíóú".includes(item.p[0].toLowerCase());
    return {
      pregunta: (<><Consigna>¿Empieza con vocal? 🎯</Consigna>
        <Tarjeta><span className="text-4xl font-black tracking-widest text-slate-800">{item.p.toUpperCase()}</span></Tarjeta></>),
      opciones: ["Sí", "No"], respuesta: esVocal ? "Sí" : "No",
      explicacion: `"${item.p}" empieza con la letra ${item.p[0].toUpperCase()}${esVocal ? ", que es una vocal (A, E, I, O, U)." : ", que es una consonante."}`,
    };
  },

  silabas: (p) => () => {
    const banco = p.dificil ? BANCO_SILABAS.filter((x) => x.s.length >= 3) : BANCO_SILABAS.filter((x) => x.s.length <= 3);
    const item = banco[azar(banco.length)];
    const resp = item.s.length;
    return {
      pregunta: (<><Consigna>¿Cuántas sílabas tiene? Aplaudí cada parte 👏</Consigna>
        <Tarjeta>
          <span className="text-5xl">{item.e || ""}</span>
          {item.id && <Figura id={item.id} edad="6-8" className="h-20 w-20" />}
          <span className="text-3xl font-black text-slate-800">{item.p}</span>
          <button onClick={() => hablar(item.s.join(", "), true, 0.6)}
            className="rounded-full bg-amber-100 px-5 py-2 text-lg font-black text-amber-700 active:scale-95">🔊 Escuchar por partes</button>
        </Tarjeta></>),
      opciones: opcionesNum(resp, 3, 2, 1), respuesta: resp,
      explicacion: `${item.p.toUpperCase()} tiene ${resp} ${resp === 1 ? "sílaba" : "sílabas"}: ${item.s.join(" - ")}.`,
    };
  },

  primeraSilaba: () => () => {
    const banco = BANCO_SILABAS.filter((x) => x.s.length >= 2);
    const item = banco[azar(banco.length)];
    const resp = item.s[0];
    const ops = new Set([resp]);
    while (ops.size < 3) {
      const otra = banco[azar(banco.length)].s[0];
      if (otra !== resp) ops.add(otra);
    }
    return {
      pregunta: (<><Consigna>¿Con qué sílaba empieza? 🔤</Consigna>
        <Tarjeta>
          <span className="text-5xl">{item.e || ""}</span>
          {item.id && <Figura id={item.id} edad="6-8" className="h-20 w-20" />}
          <span className="text-3xl font-black text-slate-800">{item.p}</span>
          <button onClick={() => hablar(item.p, true, 0.75)}
            className="rounded-full bg-amber-100 px-5 py-2 text-lg font-black text-amber-700 active:scale-95">🔊 Escuchar</button>
        </Tarjeta></>),
      opciones: mezclar([...ops]), respuesta: resp,
      explicacion: `${item.p.toUpperCase()} se separa así: ${item.s.join(" - ")}.`,
    };
  },

  masMenos: (p) => () => {
    const em = ["🐤", "🍎", "⭐", "🌸", "🐟", "🎈"][azar(6)];
    let a = azar(p.max) + 1, b = azar(p.max) + 1;
    while (a === b) b = azar(p.max) + 1;
    const resp = p.modo === "menos" ? (a < b ? "A" : "B") : (a > b ? "A" : "B");
    return {
      pregunta: (<><Consigna>¿Dónde hay {p.modo === "menos" ? "menos" : "más"}? 👀</Consigna>
        <div className="flex gap-3">
          {[["A", a], ["B", b]].map(([et, n]) => (
            <div key={et} className="flex min-w-[8rem] flex-col items-center gap-1 rounded-3xl bg-white px-4 py-3 shadow-md">
              <span className="text-lg font-black text-slate-400">{et}</span>
              <span className="max-w-[8rem] text-center text-2xl leading-tight">{em.repeat(n)}</span>
            </div>
          ))}
        </div></>),
      opciones: ["A", "B"], respuesta: resp, dice: `¿Dónde hay ${p.modo === "menos" ? "menos" : "más"}: en A o en B?`,
      explicacion: `A tiene ${a} y B tiene ${b}: hay ${p.modo === "menos" ? "menos" : "más"} en ${resp}.`,
    };
  },

  convivir: (p) => () => {
    if (p.tipo === "bienmal") {
      const it = BIEN_MAL[azar(BIEN_MAL.length)];
      return {
        pregunta: (<><Consigna>¿Está bien o está mal? 💛</Consigna>
          <Tarjeta><span className="text-5xl">{it.e}</span>
          <span className="max-w-xs text-center text-xl font-black text-slate-700">{it.t}</span></Tarjeta></>),
        opciones: ["Está bien 😊", "Está mal 😕"],
        respuesta: it.ok ? "Está bien 😊" : "Está mal 😕",
        explicacion: it.por, dice: `${it.t}. ¿Está bien o está mal?`,
      };
    }
    const banco = p.tipo === "magicas" ? MAGICAS : p.tipo === "ayudar" ? AYUDAR : SITUACIONES;
    const it = banco[azar(banco.length)];
    return {
      pregunta: (<><Consigna>{p.tipo === "magicas" ? "Las palabras mágicas ✨" : p.tipo === "ayudar" ? "Ayudo en mi casa 🏠" : "¿Qué hago si...? 🤗"}</Consigna>
        <Tarjeta><span className="text-5xl">{it.e}</span>
        <span className="max-w-xs text-center text-lg font-black text-slate-700">{it.q}</span></Tarjeta></>),
      opciones: mezclar([...it.ops]), respuesta: it.ops[it.ok],
      explicacion: it.por, dice: it.q,
    };
  },

  idioma: (p) => () => {
    const cat = VOCAB_IDIOMAS[p.cat];
    const items = cat.items;
    const it = items[azar(items.length)];
    const idi = IDIOMAS[p.idioma];
    const palabra = it[p.idioma];
    const sorteo = azar(100);
    if (sorteo < (p.pAud || 0)) {
      // ESCUCHÁ Y ELEGÍ: suena la palabra, el niño toca el dibujito
      const ops = new Set([it.e]);
      while (ops.size < 3) ops.add(items[azar(items.length)].e);
      return {
        pregunta: (<><Consigna>Escuchá y tocá el dibujito 👂 {idi.bandera}</Consigna>
          <Tarjeta><button onClick={() => hablarIdioma(palabra, idi.lang)}
            className="rounded-full bg-indigo-500 px-8 py-4 text-2xl font-black text-white shadow-md active:scale-95">🔊 Escuchar</button></Tarjeta></>),
        opciones: mezclar([...ops]), respuesta: it.e,
        explicacion: `«${palabra}» es ${it.es} en ${idi.nombre.toLowerCase()}.`,
        decir: () => hablarIdioma(palabra, idi.lang),
      };
    }
    const inverso = sorteo < (p.pAud || 0) + (p.pInv || 0);
    const boton = (
      <button onClick={() => hablarIdioma(palabra, idi.lang)}
        className="rounded-full bg-indigo-100 px-5 py-2 text-lg font-black text-indigo-700 active:scale-95">🔊 Escuchar</button>
    );
    if (inverso) {
      const ops = new Set([it.es]);
      while (ops.size < 3) ops.add(items[azar(items.length)].es);
      return {
        pregunta: (<><Consigna>¿Qué significa en castellano? {idi.bandera}</Consigna>
          <Tarjeta><span className="text-3xl font-black text-indigo-700 sm:text-4xl">{palabra}</span>{boton}</Tarjeta></>),
        opciones: mezclar([...ops]), respuesta: it.es,
        explicacion: `«${palabra}» significa ${it.es} en ${idi.nombre.toLowerCase()}.`,
        decir: () => hablarIdioma(palabra, idi.lang),
      };
    }
    const ops = new Set([palabra]);
    while (ops.size < 3) ops.add(items[azar(items.length)][p.idioma]);
    return {
      pregunta: (<><Consigna>¿Cómo se dice en {idi.nombre.toLowerCase()}? {idi.bandera}</Consigna>
        <Tarjeta><span className="text-5xl">{it.e}</span>
        <span className="text-2xl font-black text-slate-700">{it.es}</span>{boton}</Tarjeta></>),
      opciones: mezclar([...ops]), respuesta: palabra,
      explicacion: `${it.es} se dice «${palabra}» en ${idi.nombre.toLowerCase()}. ¡Tocá 🔊 y repetilo!`,
      dice: `¿Cómo se dice ${it.es} en ${idi.nombre.toLowerCase()}?`,
      hablarOpcion: (op) => hablarIdioma(String(op), idi.lang),
    };
  },

  quiz: (p) => () => {
    const it = p.banco[azar(p.banco.length)];
    return {
      pregunta: (<><Consigna>{p.titulo || "¿Sabés la respuesta? 🤔"}</Consigna>
        <Tarjeta><span className="text-5xl">{it.e}</span>
        <span className="max-w-xs text-center text-lg font-black text-slate-700">{it.q}</span></Tarjeta></>),
      opciones: mezclar([...it.ops]), respuesta: it.ops[it.ok],
      explicacion: it.por, dice: it.q,
    };
  },

  lectura: (p) => () => {
    const banco = B_LECTURAS.filter((x) => (p.dif ? x.dif : !x.dif));
    const it = banco[azar(banco.length)];
    return {
      pregunta: (<><Consigna>Leé con atención 📖</Consigna>
        <Tarjeta><p className="max-w-sm text-left text-base font-bold leading-relaxed text-slate-700 sm:text-lg">{it.t}</p>
        <p className="mt-1 max-w-sm text-center text-lg font-black text-slate-800">{it.q}</p></Tarjeta></>),
      opciones: mezclar([...it.ops]), respuesta: it.ops[it.ok],
      dice: it.t + " … " + it.q,
    };
  },

  capitales: (p) => () => {
    const it = B_CAPITALES[azar(B_CAPITALES.length)];
    const modo = p.modo === "bandera" ? "bandera" : azar(2) === 0 ? "capital" : "pais";
    if (modo === "bandera") {
      const ops = new Set([it.pais]);
      while (ops.size < 3) ops.add(B_CAPITALES[azar(B_CAPITALES.length)].pais);
      return {
        pregunta: (<><Consigna>¿De qué país es esta bandera? 🏳️</Consigna>
          <Tarjeta><span className="text-7xl">{it.e}</span></Tarjeta></>),
        opciones: mezclar([...ops]), respuesta: it.pais, dice: "¿De qué país es esta bandera?",
      };
    }
    if (modo === "capital") {
      const ops = new Set([it.cap]);
      while (ops.size < 3) ops.add(B_CAPITALES[azar(B_CAPITALES.length)].cap);
      return {
        pregunta: (<><Consigna>Capitales del mundo 🗺️</Consigna>
          <Tarjeta><span className="text-5xl">{it.e}</span>
          <span className="text-xl font-black text-slate-700">¿Cuál es la capital de {it.pais}?</span></Tarjeta></>),
        opciones: mezclar([...ops]), respuesta: it.cap, dice: `¿Cuál es la capital de ${it.pais}?`,
      };
    }
    const ops = new Set([it.pais]);
    while (ops.size < 3) ops.add(B_CAPITALES[azar(B_CAPITALES.length)].pais);
    return {
      pregunta: (<><Consigna>Capitales del mundo 🗺️</Consigna>
        <Tarjeta><span className="text-xl font-black text-slate-700">¿De qué país es capital {it.cap}?</span></Tarjeta></>),
      opciones: mezclar([...ops]), respuesta: it.pais, dice: `¿De qué país es capital ${it.cap}?`,
    };
  },

  // ---------------- FINANZAS ----------------
  contarDinero: (p, edad) => () => {
    const cant = p.cant + azar(2);
    const elegidas = [...Array(cant)].map(() => p.valores[azar(p.valores.length)]);
    const resp = elegidas.reduce((a, b) => a + b, 0);
    return {
      pregunta: (<><Consigna>¿Cuánta {TXT.plata} hay? 💵</Consigna><Tarjeta>
        <div className="flex max-w-sm flex-wrap items-center justify-center gap-2">
          {elegidas.map((v, i) => <Dinero key={i} valor={v} edad={edad} chico />)}
        </div></Tarjeta></>),
      opciones: opcionesNum(resp, 3, Math.max(3, Math.round(resp / 4)), 1).map((n) => `$${n}`),
      respuesta: `$${resp}`, dice: `¿Cuánta ${TXT.plata} hay?`,
    };
  },

  vuelto: (p) => () => {
    const cuesta = azar(p.tope - 2) + 1;
    const billetes = [5, 10, 20, 50, 100].filter((b) => b > cuesta && b <= p.tope + 30);
    const paga = billetes[0] || cuesta + 10;
    const resp = paga - cuesta;
    return {
      pregunta: (<><Consigna>El vuelto 🧾</Consigna><Tarjeta>
        <p className="text-center text-xl font-black text-slate-800 sm:text-2xl">Cuesta <span className="text-pink-600">${cuesta}</span></p>
        <p className="text-center text-xl font-black text-slate-800 sm:text-2xl">Pagás con <span className="text-green-600">${paga}</span></p>
        <p className="text-center text-lg font-bold text-slate-500">¿Cuánto te devuelven?</p></Tarjeta></>),
      opciones: opcionesNum(resp, 3, 4, 0).map((n) => `$${n}`), respuesta: `$${resp}`,
      dice: `Cuesta ${cuesta} pesos y pagás con ${paga}. ¿Cuánto te devuelven?`,
    };
  },

  cualCuesta: (p) => () => {
    const prods = mezclar(PRODUCTOS).slice(0, p.n);
    const precios = new Set();
    while (precios.size < p.n) precios.add(azar(p.tope - 1) + 1);
    const arr = [...precios];
    const items = prods.map((pr, i) => ({ ...pr, precio: arr[i] }));
    const resp = items.reduce((a, b) => (p.modo === "barato" ? (a.precio < b.precio ? a : b) : (a.precio > b.precio ? a : b)));
    return {
      pregunta: (<><Consigna>¿Cuál es {p.modo === "barato" ? "el más barato" : "el más caro"}? 🛒</Consigna>
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((it, i) => (
            <div key={i} className="flex flex-col items-center rounded-2xl bg-white px-5 py-3 shadow-md">
              <span className="text-4xl">{it.e}</span>
              <span className="text-sm font-bold text-slate-500">{it.p}</span>
              <span className="text-xl font-black text-slate-800">${it.precio}</span>
            </div>
          ))}
        </div></>),
      opciones: mezclar(items.map((it) => it.p)), respuesta: resp.p, dice: `¿Cuál es ${p.modo === "barato" ? "el más barato" : "el más caro"}?`,
      explicacion: `${resp.p} cuesta $${resp.precio}: es ${p.modo === "barato" ? "el precio más bajo" : "el precio más alto"}.`,
    };
  },

  necesito: (p) => () => {
    const banco = p.avanzado ? ITEMS_NQ_AVANZADO : ITEMS_NQ;
    const item = banco[azar(banco.length)];
    return {
      pregunta: (<><Consigna>¿Es algo que necesitás o algo que querés? 🤔</Consigna>
        <Tarjeta><span className="text-6xl sm:text-7xl">{item.e}</span>
        <span className="text-xl font-black text-slate-700">{item.p}</span></Tarjeta></>),
      opciones: ["Lo necesito", "Lo quiero"],
      respuesta: item.tipo === "necesito" ? "Lo necesito" : "Lo quiero",
      explicacion: item.por, dice: `${item.p}. ¿Es algo que necesitás o algo que querés?`,
    };
  },

  metaAhorro: (p) => () => {
    const porSemana = [2, 5, 10, 20][azar(p.grande ? 4 : 3)];
    const semanas = azar(6) + 2;
    const meta = porSemana * semanas;
    return {
      pregunta: (<><Consigna>Meta de ahorro 🎯</Consigna><Tarjeta>
        <p className="text-center text-lg font-black text-slate-800 sm:text-xl">Querés juntar <span className="text-pink-600">${meta}</span></p>
        <p className="text-center text-lg font-black text-slate-800 sm:text-xl">Ahorrás <span className="text-green-600">${porSemana}</span> por semana</p>
        <p className="text-center font-bold text-slate-500">¿Cuántas semanas necesitás?</p></Tarjeta></>),
      opciones: opcionesNum(semanas, 3, 2, 1), respuesta: semanas, dice: `Querés juntar ${meta} pesos y ahorrás ${porSemana} por semana. ¿Cuántas semanas necesitás?`,
      explicacion: `${semanas} semanas × $${porSemana} = $${meta}. ¡Ahorrar es esperar con un plan!`,
    };
  },

  descuento: (p) => () => {
    const modo = p.modo === "mixto" ? (azar(2) === 0 ? "mitad" : "diez") : p.modo;
    if (modo === "mitad") {
      const precio = (azar(20) + 3) * 2;
      const resp = precio / 2;
      return {
        pregunta: (<><Consigna>¡Oferta! 🏷️</Consigna><Tarjeta>
          <p className="text-center text-lg font-black text-slate-800 sm:text-xl">Cuesta <span className="line-through">${precio}</span> y está a mitad de precio</p>
          <p className="font-bold text-slate-500">¿Cuánto pagás?</p></Tarjeta></>),
        opciones: opcionesNum(resp, 3, 5, 1).map((n) => `$${n}`), respuesta: `$${resp}`,
        explicacion: `La mitad de $${precio} es $${resp}.`,
      };
    }
    const precio = (azar(9) + 1) * 10;
    const resp = precio - precio / 10;
    return {
      pregunta: (<><Consigna>¡Descuento del 10%! 🏷️</Consigna><Tarjeta>
        <p className="text-center text-lg font-black text-slate-800 sm:text-xl">Cuesta <span className="line-through">${precio}</span> con 10% de descuento</p>
        <p className="font-bold text-slate-500">¿Cuánto pagás?</p></Tarjeta></>),
      opciones: opcionesNum(resp, 3, 6, 1).map((n) => `$${n}`), respuesta: `$${resp}`,
      explicacion: `El 10% de $${precio} es $${precio / 10}; pagás $${resp}.`,
    };
  },

  alcanza: (p) => () => {
    const tengo = azar(p.tope) + 3;
    const cuesta = azar(p.tope) + 3;
    const si = tengo >= cuesta;
    const dif = Math.abs(tengo - cuesta);
    return {
      pregunta: (<><Consigna>¿Te alcanza? 💭</Consigna><Tarjeta>
        <p className="text-center text-lg font-black text-slate-800 sm:text-xl">Tenés <span className="text-green-600">${tengo}</span></p>
        <p className="text-center text-lg font-black text-slate-800 sm:text-xl">Lo que querés cuesta <span className="text-pink-600">${cuesta}</span></p></Tarjeta></>),
      opciones: ["Sí, me alcanza", "No me alcanza"],
      respuesta: si ? "Sí, me alcanza" : "No me alcanza", dice: `Tenés ${tengo} pesos y lo que querés cuesta ${cuesta}. ¿Te alcanza?`,
      explicacion: si
        ? (dif === 0 ? "Justo: gastás todo lo que tenés." : `Te alcanza y te sobran $${dif}.`)
        : `Te faltan $${dif}. Podés ahorrar hasta juntarlos.`,
    };
  },
};

// ============================================================
// Juegos con mecánica propia (no son de opción múltiple)
// ============================================================
function JuegoMemoria({ params, edad, alTerminar }) {
  const pares = params.pares;
  const crear = useCallback(() => {
    const elegidas = mezclar(params.pack).slice(0, pares);
    return mezclar([...elegidas, ...elegidas].map((f, i) => ({ id: i, figura: f, vista: false, lista: false })));
  }, [pares]); // eslint-disable-line

  const [cartas, setCartas] = useState(crear);
  const [seleccion, setSeleccion] = useState([]);
  const [intentos, setIntentos] = useState(0);
  const [fin, setFin] = useState(false);
  const bloqueo = useRef(false);

  const tocar = (idx) => {
    if (bloqueo.current || cartas[idx].vista || cartas[idx].lista) return;
    sonido("tap");
    const nuevas = cartas.map((c, i) => (i === idx ? { ...c, vista: true } : c));
    const sel = [...seleccion, idx];
    setCartas(nuevas);
    setSeleccion(sel);
    if (sel.length === 2) {
      bloqueo.current = true;
      setIntentos((v) => v + 1);
      const [a, b] = sel;
      setTimeout(() => {
        setCartas((prev) => {
          const acierto = prev[a].figura === prev[b].figura;
          if (acierto) { sonido("acierto"); hablar("¡Pareja!", AUDIO_ON); }
          else sonido("error");
          const res = prev.map((c, i) =>
            i === a || i === b ? { ...c, vista: acierto, lista: acierto ? true : c.lista } : c
          );
          if (res.every((c) => c.lista)) setFin(true);
          return res;
        });
        setSeleccion([]);
        bloqueo.current = false;
      }, 800);
    }
  };

  useEffect(() => {
    if (fin) {
      const maximo = pares * 10;
      const puntos = Math.max(pares * 10 - Math.max(0, intentos - pares) * 2, pares * 2);
      alTerminar(puntos, maximo);
    }
  }, [fin]); // eslint-disable-line

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6">
      <Consigna>Encontrá las parejas iguales 🔍</Consigna>
      <div className={`grid w-full max-w-xs gap-2 sm:max-w-sm sm:gap-3 ${pares <= 4 ? "grid-cols-3" : "grid-cols-4"}`}>
        {cartas.map((c, i) => (
          <button key={c.id} onClick={() => tocar(i)}
            className={`flex aspect-square w-full items-center justify-center rounded-2xl p-2 shadow-md transition-transform active:scale-95 ${
              c.vista || c.lista ? "bg-white" : "bg-violet-400"
            }`}>
            {c.vista || c.lista
              ? <Figura id={c.figura} edad={edad} className="h-full w-full" />
              : <span className="text-3xl sm:text-4xl">❓</span>}
          </button>
        ))}
      </div>
      <p className="text-base font-bold text-violet-600 sm:text-lg">Intentos: {intentos}</p>
    </div>
  );
}

function JuegoAtrapa({ params, alTerminar }) {
  const DURACION = 30;
  const { velocidad, meta, tam } = params;
  const [pos, setPos] = useState({ x: 40, y: 40 });
  const [atrapados, setAtrapados] = useState(0);
  const [tiempo, setTiempo] = useState(DURACION);
  const [activo, setActivo] = useState(false);

  const mover = () => setPos({ x: 5 + azar(70), y: 5 + azar(65) });

  useEffect(() => {
    if (!activo) return;
    const reloj = setInterval(() => setTiempo((t) => t - 1), 1000);
    const salto = setInterval(mover, velocidad);
    return () => { clearInterval(reloj); clearInterval(salto); };
  }, [activo, velocidad]);

  useEffect(() => {
    if (activo && tiempo <= 0) alTerminar(Math.min(atrapados, meta), meta);
  }, [tiempo]); // eslint-disable-line

  if (!activo) {
    return (
      <div className="flex flex-col items-center gap-5 py-8 sm:gap-6 sm:py-10">
        <Bichito className="h-24 w-24 sm:h-28 sm:w-28" />
        <p className="max-w-xs text-center text-lg font-bold text-slate-600 sm:text-xl">
          ¡El bichito se escapa! Tocalo cada vez que aparezca. Tenés {DURACION} segundos.
        </p>
        <button onClick={() => setActivo(true)}
          className="rounded-full bg-emerald-500 px-10 py-4 text-xl font-black text-white shadow-lg active:scale-95 sm:px-12 sm:py-5 sm:text-2xl">
          ¡A jugar!
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-md justify-between text-lg font-black sm:text-xl">
        <span className="text-emerald-600">🐞 {atrapados}</span>
        <span className={tiempo <= 5 ? "text-red-500" : "text-slate-600"}>⏰ {tiempo}s</span>
      </div>
      <div className="relative h-72 w-full max-w-md overflow-hidden rounded-3xl bg-lime-100 shadow-inner sm:h-96">
        <button onClick={() => { sonido("pop"); setAtrapados((v) => v + 1); mover(); }}
          className={`absolute ${tam} active:scale-75`}
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          aria-label="Atrapar bichito">
          <Bichito className="h-full w-full" />
        </button>
      </div>
    </div>
  );
}

function JuegoAlcancia({ params, edad, alTerminar }) {
  const TOTAL = 6;
  const { monedas, min, max } = params;
  const generarMeta = () => min + azar(max - min + 1);

  const [meta, setMeta] = useState(generarMeta);
  const [suma, setSuma] = useState(0);
  const [num, setNum] = useState(1);
  const [puntos, setPuntos] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const agregar = (v) => {
    if (mensaje) return;
    const nueva = suma + v;
    if (nueva === meta) {
      const ganados = fallo ? 5 : 10;
      const nuevos = puntos + ganados;
      setPuntos(nuevos);
      setSuma(nueva);
      sonido("fanfarria");
      hablar("¡Justo! ¡Llenaste la alcancía!", AUDIO_ON);
      setMensaje(`🎉 ¡Justo! +${ganados} puntos`);
      setTimeout(() => {
        if (num >= TOTAL) alTerminar(nuevos, TOTAL * 10);
        else { setNum(num + 1); setMeta(generarMeta()); setSuma(0); setFallo(false); setMensaje(null); }
      }, 1100);
    } else if (nueva > meta) {
      sonido("error");
      setFallo(true);
      setMensaje("😅 ¡Te pasaste! Empezá de nuevo");
      setTimeout(() => { setSuma(0); setMensaje(null); }, 1000);
    } else {
      sonido("moneda");
      setSuma(nueva);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6">
      <Consigna>Llená la alcancía con <span className="text-pink-600">${meta}</span> justos 🐷</Consigna>
      <div className="flex items-center gap-4 rounded-3xl bg-white px-8 py-5 shadow-md">
        <span className="text-6xl sm:text-7xl">🐷</span>
        <div className="text-center">
          <p className="text-4xl font-black text-slate-800 sm:text-5xl">${suma}</p>
          <p className="text-sm font-bold text-slate-400">de ${meta}</p>
        </div>
      </div>
      <div className="h-3 w-full max-w-xs overflow-hidden rounded-full bg-pink-100">
        <div className="h-full rounded-full bg-pink-500 transition-all" style={{ width: `${Math.min(100, (suma / meta) * 100)}%` }} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {monedas.map((v) => (
          <button key={v} onClick={() => agregar(v)} className="transition-transform active:scale-90" aria-label={`Agregar ${v}`}>
            <Dinero valor={v} edad={edad} />
          </button>
        ))}
        <button onClick={() => { setSuma(0); setFallo(true); }}
          className="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-black text-slate-600 active:scale-95">Vaciar</button>
      </div>
      {mensaje && <p className="text-xl font-black text-slate-700 sm:text-2xl">{mensaje}</p>}
      <p className="text-base font-bold text-pink-600 sm:text-lg">Alcancía {num} de {TOTAL} · Puntos: {puntos}</p>
    </div>
  );
}

function JuegoPronuncia({ params, edad, alTerminar, permitirMic = true }) {
  const TOTAL = 6;
  const SR = permitirMic && typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const [items] = useState(() => mezclar(params.banco).slice(0, TOTAL));
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [escuchado, setEscuchado] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [robot, setRobot] = useState(null); // {ok, texto}
  const recRef = useRef(null);
  const item = items[idx];

  const normalizar = (t) => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zñ ]/g, "").trim();

  const porPartes = () => { hablar(item.s.join(", "), true, 0.55); setEscuchado(true); };
  const completa = () => { hablar(item.p, true, 0.8); setEscuchado(true); };

  const escucharMic = () => {
    if (!SR || escuchando) return;
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      const rec = new SR();
      recRef.current = rec;
      rec.lang = "es-AR";
      rec.interimResults = false;
      rec.maxAlternatives = 4;
      setRobot(null);
      setEscuchando(true);
      const objetivo = normalizar(item.p);
      rec.onresult = (ev) => {
        const alternativas = [];
        for (let i = 0; i < ev.results[0].length; i++) alternativas.push(ev.results[0][i].transcript);
        const ok = alternativas.some((a) => normalizar(a).includes(objetivo));
        setRobot({ ok, texto: alternativas[0] || "" });
        setEscuchando(false);
        if (ok) { sonido("acierto"); hablar("¡Te entendí perfecto!", AUDIO_ON); }
      };
      rec.onerror = () => { setRobot({ ok: null, texto: "" }); setEscuchando(false); };
      rec.onend = () => setEscuchando(false);
      rec.start();
      setTimeout(() => { try { rec.stop(); } catch (e) { /* nada */ } }, 5000);
    } catch (e) { setEscuchando(false); }
  };

  useEffect(() => () => { try { if (recRef.current) recRef.current.abort(); } catch (e) { /* nada */ } }, []);

  const evaluar = (salio) => {
    try { if (recRef.current) recRef.current.abort(); } catch (e) { /* nada */ }
    const nuevos = puntos + (salio ? 10 : 7);
    setPuntos(nuevos);
    sonido(salio ? "acierto" : "estrella");
    hablar(salio ? "¡Muy bien!" : "¡Buen intento! Practicar es lo que importa.", AUDIO_ON);
    setTimeout(() => {
      if (idx + 1 >= TOTAL) alTerminar(nuevos, TOTAL * 10);
      else { setIdx(idx + 1); setEscuchado(false); setRobot(null); setEscuchando(false); }
    }, 900);
  };

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6">
      <Consigna>Escuchá la palabra y decila en voz alta 🎤</Consigna>
      <Tarjeta>
        {item.id
          ? <Figura id={item.id} edad={edad} className="h-24 w-24 sm:h-28 sm:w-28" />
          : <span className="text-6xl sm:text-7xl">{item.e}</span>}
        <span className="text-3xl font-black text-slate-800 sm:text-4xl">{item.p}</span>
        <span className="text-xl font-bold tracking-widest text-amber-600">{item.s.join(" · ")}</span>
      </Tarjeta>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={porPartes}
          className="rounded-full bg-amber-400 px-6 py-3 text-lg font-black text-white shadow-md active:scale-95">🐢 Por partes</button>
        <button onClick={completa}
          className="rounded-full bg-amber-500 px-6 py-3 text-lg font-black text-white shadow-md active:scale-95">🔊 Completa</button>
      </div>
      <div className={`flex flex-col items-center gap-2 transition-opacity ${escuchado ? "opacity-100" : "pointer-events-none opacity-30"}`}>
        <p className="font-bold text-slate-500">Ahora repetila vos, fuerte y claro.</p>
        {SR && (
          <button onClick={escucharMic} disabled={escuchando}
            className={`rounded-full px-6 py-3 text-lg font-black text-white shadow-md active:scale-95 ${escuchando ? "animate-pulse bg-red-400" : "bg-violet-500"}`}>
            {escuchando ? "🎙️ Te escucho…" : "🤖 ¿Me entiende el robot?"}
          </button>
        )}
        {robot && robot.ok === true && (
          <p className="max-w-sm text-center text-lg font-black text-green-600">🤖✅ ¡El robot te entendió clarito!</p>
        )}
        {robot && robot.ok === false && (
          <p className="max-w-sm text-center text-base font-bold text-amber-700">
            🤖 El robot escuchó: «{robot.texto}». ¡Probá de nuevo, más fuerte y despacio! (A veces el robot se equivoca, no vos 😉)
          </p>
        )}
        {robot && robot.ok === null && (
          <p className="max-w-sm text-center text-base font-bold text-slate-500">🤖 No pude escuchar. Fijate que el micrófono tenga permiso.</p>
        )}
        <p className="font-bold text-slate-500">¿Cómo te salió?</p>
        <div className="flex gap-3">
          <button onClick={() => evaluar(true)}
            className="rounded-full bg-green-400 px-6 py-3 text-lg font-black text-white shadow-md active:scale-95">😀 ¡Me salió!</button>
          <button onClick={() => evaluar(false)}
            className="rounded-full bg-sky-400 px-6 py-3 text-lg font-black text-white shadow-md active:scale-95">🙂 Sigo practicando</button>
        </div>
      </div>
      <p className="text-base font-bold text-amber-600 sm:text-lg">Palabra {idx + 1} de {TOTAL} · Puntos: {puntos}</p>
      {SR && (
        <p className="max-w-sm text-center text-[11px] leading-snug text-slate-400">
          El botón del robot usa el reconocimiento de voz del navegador: necesita internet y permiso de micrófono, y el audio lo procesa el servicio de voz del navegador. Es un juego aproximado, no una evaluación del habla.
        </p>
      )}
    </div>
  );
}

const PALABRAS_TRAZO = ["mamá", "papá", "yo", "sol", "pan", "oso", "mimo", "nene", "hola", "luna", "casa", "agua", "amor", "vida", "abuela", "familia", "escuela", "gracias", "amigo", "te amo"];

function JuegoTrazar({ params, alTerminar }) {
  const TOTAL = 4;
  const ANCHO = 320, ALTO = 240;
  const [items] = useState(() => {
    if (params.tipo === "letras") return mezclar(params.banco.split("")).slice(0, TOTAL);
    const candidatas = PALABRAS_TRAZO.filter((p) => (params.largas ? p.length >= 5 : p.length <= (params.maxLargo || 4)));
    return mezclar(candidatas).slice(0, TOTAL);
  });
  const [idx, setIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [intento, setIntento] = useState(1);
  const [mensaje, setMensaje] = useState(null); // {ok, texto}
  const lienzoRef = useRef(null);
  const trazosRef = useRef([]);
  const dibujandoRef = useRef(false);
  const item = items[idx];
  const esLetra = params.tipo === "letras";

  const pintar = () => {
    const cv = lienzoRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, ANCHO, ALTO);
    // modelo en gris clarito
    ctx.font = `900 ${params.tam || 180}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#dbe4ee";
    ctx.fillText(item, ANCHO / 2, ALTO / 2 + 8);
    // trazos del peque
    ctx.strokeStyle = "#0ea5e9";
    ctx.lineWidth = 13;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    trazosRef.current.forEach((t) => {
      if (t.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(t[0].x, t[0].y);
      t.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  };
  useEffect(pintar, [idx]); // eslint-disable-line

  const punto = (ev) => {
    const r = lienzoRef.current.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) / r.width) * ANCHO, y: ((ev.clientY - r.top) / r.height) * ALTO };
  };
  const bajar = (ev) => { if (mensaje && mensaje.ok) return; dibujandoRef.current = true; trazosRef.current.push([punto(ev)]); pintar(); };
  const mover = (ev) => { if (!dibujandoRef.current) return; trazosRef.current[trazosRef.current.length - 1].push(punto(ev)); pintar(); };
  const soltar = () => { dibujandoRef.current = false; };
  const borrar = () => { sonido("tap"); trazosRef.current = []; setMensaje(null); pintar(); };

  const evaluar = () => {
    if (trazosRef.current.reduce((a, t) => a + t.length, 0) < 6) { setMensaje({ ok: false, texto: "Dibujá sobre las letras grises 😊" }); return; }
    // máscara del modelo
    const m = document.createElement("canvas"); m.width = ANCHO; m.height = ALTO;
    const mc = m.getContext("2d");
    mc.font = `900 ${params.tam || 180}px system-ui, sans-serif`;
    mc.textAlign = "center"; mc.textBaseline = "middle"; mc.fillStyle = "#000";
    mc.fillText(item, ANCHO / 2, ALTO / 2 + 8);
    const mm = mc.getImageData(0, 0, ANCHO, ALTO).data;
    // máscara del modelo agrandada (para medir qué quedó afuera)
    mc.lineWidth = 26; mc.strokeStyle = "#000"; mc.strokeText(item, ANCHO / 2, ALTO / 2 + 8);
    const mg = mc.getImageData(0, 0, ANCHO, ALTO).data;
    // máscara del trazo del peque, con pincel gordo
    const h = document.createElement("canvas"); h.width = ANCHO; h.height = ALTO;
    const hc = h.getContext("2d");
    hc.strokeStyle = "#000"; hc.lineWidth = 30; hc.lineCap = "round"; hc.lineJoin = "round";
    trazosRef.current.forEach((t) => {
      if (t.length < 2) { hc.fillStyle = "#000"; hc.beginPath(); hc.arc(t[0].x, t[0].y, 15, 0, 7); hc.fill(); return; }
      hc.beginPath(); hc.moveTo(t[0].x, t[0].y);
      t.slice(1).forEach((p) => hc.lineTo(p.x, p.y));
      hc.stroke();
    });
    const hh = hc.getImageData(0, 0, ANCHO, ALTO).data;
    let modelo = 0, cubierto = 0, chico = 0, adentro = 0;
    for (let i = 3; i < mm.length; i += 8) { // muestreo
      const esModelo = mm[i] > 60, esGrande = mg[i] > 60, esChico = hh[i] > 60;
      if (esModelo) { modelo++; if (esChico) cubierto++; }
      if (esChico) { chico++; if (esGrande) adentro++; }
    }
    const cobertura = modelo > 0 ? cubierto / modelo : 0;
    const precision = chico > 0 ? adentro / chico : 0;
    const minCob = (params.minCob || 55) / 100;
    const ok = cobertura >= minCob && precision >= 0.4;
    if (ok) {
      const ganados = intento === 1 ? 10 : intento === 2 ? 8 : 6;
      const nuevos = puntos + ganados;
      setPuntos(nuevos);
      sonido(intento === 1 ? "fanfarria" : "acierto");
      setMensaje({ ok: true, texto: `🎉 ¡${esLetra ? `Qué linda te salió la ${item}` : `Escribiste "${item}"`}! +${ganados}` });
      hablar(esLetra ? `¡Muy bien! Esa es la ${item}.` : `¡Excelente! Escribiste ${item}.`, AUDIO_ON);
      setTimeout(() => {
        if (idx + 1 >= TOTAL) alTerminar(nuevos, TOTAL * 10);
        else { trazosRef.current = []; setIdx(idx + 1); setIntento(1); setMensaje(null); }
      }, 1400);
    } else if (intento >= 3) {
      const nuevos = puntos + 5;
      setPuntos(nuevos);
      sonido("estrella");
      hablar("¡Buen intento! Practicar es lo que vale.", AUDIO_ON);
      setMensaje({ ok: true, texto: "💪 ¡Buen intento! Practicar es lo que vale. +5" });
      setTimeout(() => {
        if (idx + 1 >= TOTAL) alTerminar(nuevos, TOTAL * 10);
        else { trazosRef.current = []; setIdx(idx + 1); setIntento(1); setMensaje(null); }
      }, 1400);
    } else {
      sonido("error");
      setIntento(intento + 1);
      setMensaje({ ok: false, texto: cobertura < minCob ? "¡Casi! Repasá las partes grises que faltan ✏️" : "¡Casi! Tratá de no salirte tanto del modelo 🎯" });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-5">
      <Consigna>{esLetra ? <>Dibujá con el dedo: <span className="text-sky-600">{item}</span></> : <>Escribí: <span className="text-sky-600">{item}</span></>} ✍️</Consigna>
      <button onClick={() => hablar(esLetra ? `Dibujá la ${item}` : `Escribí ${item}`, true, 0.85)}
        className="rounded-full bg-emerald-100 px-5 py-2 text-lg font-black text-emerald-700 active:scale-95">🔊 Escuchar</button>
      <canvas ref={lienzoRef} width={ANCHO} height={ALTO}
        onPointerDown={bajar} onPointerMove={mover} onPointerUp={soltar} onPointerLeave={soltar}
        className="w-full max-w-sm touch-none rounded-3xl bg-white shadow-md"
        style={{ touchAction: "none" }} />
      {mensaje && (
        <p className={`max-w-sm text-center text-lg font-black ${mensaje.ok ? "text-green-600" : "text-amber-600"}`}>{mensaje.texto}</p>
      )}
      <div className="flex gap-3">
        <button onClick={borrar} className="rounded-full bg-slate-200 px-6 py-3 font-black text-slate-600 active:scale-95">🧽 Borrar</button>
        <button onClick={evaluar} className="rounded-full bg-emerald-500 px-8 py-3 text-lg font-black text-white shadow-md active:scale-95">¡Listo! ✅</button>
      </div>
      <p className="text-base font-bold text-emerald-600">Trazo {idx + 1} de {TOTAL} · Puntos: {puntos}</p>
    </div>
  );
}

// ============================================================
// SERIES × NIVELES = catálogo de más de 5.000 niveles únicos.
// Cada serie interpola su dificultad del nivel 1 al último, y cada
// nivel usa una semilla propia: su contenido es único y siempre el
// mismo (se puede reintentar el MISMO nivel).
// ============================================================
// >>> SERIES
const SERIES = [];
function S(id, nombre, icono, area, motor, edades, niveles, p0, p1, colorTexto) {
  SERIES.push({ id, nombre, icono, area, motor, edades, niveles, p0: p0 || {}, p1: p1 || null, colorTexto: colorTexto || (area === "lenguaje" ? "text-amber-600" : area === "psicomotor" ? "text-emerald-600" : area === "economia" ? "text-pink-600" : "text-violet-600") });
}
function paramsNivel(serie, k) {
  const t = serie.niveles <= 1 ? 1 : (k - 1) / (serie.niveles - 1);
  const out = { ...serie.p0 };
  if (serie.p1) {
    Object.keys(serie.p1).forEach((c) => {
      if (typeof serie.p1[c] === "number" && typeof out[c] === "number") out[c] = Math.round(out[c] + (serie.p1[c] - out[c]) * t);
      else out[c] = serie.p1[c];
    });
  }
  return out;
}

// --- Pensar · memoria ---
[["nat", "naturaleza", PACK_NATURALEZA], ["cos", "objetos", PACK_COSAS], ["mix", "mezclada", PACK_TODO],
 ["tot", "gigante", ["sol", "casa", "gato", "pez", "flor", "pelota", "auto", "manzana", "arbol", "luna", "estrella", "globo"]]].forEach(([k, nom, pack]) => {
  S(`mem-${k}`, `Memoria ${nom}`, "🃏", "cognitiva", "memoria", ["3-5", "6-8", "9-11"], 30, { pares: 3, pack }, { pares: Math.min(pack.length, 10) });
});

// --- Pensar · patrones ---
[["col", "de colores", ["🔴", "🔵", "🟡", "🟢", "🟣"], ["3-5", "6-8"]],
 ["fru", "de frutas", ["🍎", "🍌", "🍇", "🍓", "🍊"], ["3-5", "6-8"]],
 ["ani", "de animales", ["🐶", "🐱", "🐸", "🐰", "🦁"], ["3-5", "6-8"]],
 ["for", "de formas", ["⬛", "🔺", "⚪", "🟦", "🔶"], ["3-5", "6-8"]],
 ["veh", "de vehículos", ["🚗", "🚌", "🚲", "✈️", "⛵"], ["3-5", "6-8"]],
 ["car", "de caritas", ["😀", "😎", "🤠", "🥳", "😴"], ["3-5", "6-8"]],
 ["com", "de comidas", ["🍕", "🍦", "🍪", "🥐", "🍉"], ["6-8", "9-11"]],
 ["dep", "de deportes", ["⚽", "🏀", "🎾", "🏈", "⚾"], ["6-8", "9-11"]],
 ["cli", "del clima", ["☀️", "🌧️", "⛈️", "🌈", "❄️"], ["6-8", "9-11"]],
 ["ins", "de bichitos", ["🐞", "🦋", "🐝", "🐜", "🦗"], ["6-8", "9-11"]],
 ["mar", "del mar", ["🐟", "🐙", "🦀", "🐬", "🐚"], ["6-8", "9-11"]],
 ["esp", "del espacio", ["🌟", "🌙", "🪐", "🚀", "☄️"], ["6-8", "9-11"]]].forEach(([k, nom, fichas, ed]) => {
  S(`pat-${k}`, `Patrones ${nom}`, "🔮", "cognitiva", "patrones", ed, 30, { fichas, cuantas: 2, largo: 4 }, { cuantas: 3, largo: 8 });
});

// --- Pensar · cuentas ---
S("cta-sumi", "Sumitas con dedos", "➕", "cognitiva", "cuentas", ["3-5"], 20, { tipo: "suma", tope: 2 }, { tope: 6 });
S("cta-suma", "Súper sumas", "➕", "cognitiva", "cuentas", ["6-8"], 60, { tipo: "suma", tope: 4 }, { tope: 40 });
S("cta-sumax", "Sumas gigantes", "➕", "cognitiva", "cuentas", ["9-11"], 60, { tipo: "suma", tope: 20 }, { tope: 140 });
S("cta-resta", "Restas valientes", "➖", "cognitiva", "cuentas", ["6-8"], 60, { tipo: "resta", tope: 5 }, { tope: 40 });
S("cta-restax", "Restas gigantes", "➖", "cognitiva", "cuentas", ["9-11"], 60, { tipo: "resta", tope: 20 }, { tope: 140 });
S("cta-suma3", "Sumas de a tres", "➕", "cognitiva", "cuentas", ["9-11"], 40, { tipo: "suma3" });
S("cta-doble", "El doble", "✖️", "cognitiva", "cuentas", ["6-8", "9-11"], 40, { tipo: "doble" });
S("cta-mitad", "La mitad", "➗", "cognitiva", "cuentas", ["9-11"], 40, { tipo: "mitad" });
[2, 3, 4, 5, 6, 7, 8, 9].forEach((tabla) => {
  S(`cta-tab${tabla}`, `Tabla del ${tabla}`, "✖️", "cognitiva", "cuentas", tabla <= 3 ? ["6-8", "9-11"] : ["9-11"], 40, { tipo: "mult", tablas: [tabla] });
});
S("cta-div", "Divisiones", "➗", "cognitiva", "cuentas", ["9-11"], 80, { tipo: "div" });

// --- Pensar · contar (temas × niveles) ---
const TEMAS_CONTAR_A = ["🐶", "🍓", "⭐", "🐟", "🌼", "🐤", "🎈", "🍎", "🦆", "🐞", "🧁", "⚽", "🐢", "🍄", "🌙", "☂️"];
const TEMAS_CONTAR_B = ["🚗", "✈️", "🦀", "🍪", "🐙", "🌵", "🪁", "🍩", "🦋", "🐬", "🎁", "🧸", "🍇", "🚀", "🐝", "🌈"];
TEMAS_CONTAR_A.forEach((em, i) => S(`con-a${i}`, `Contar ${em}`, em, "cognitiva", "contar", ["3-5", "6-8"], 40, { max: 3, tema: em }, { max: 15 }));
TEMAS_CONTAR_B.forEach((em, i) => S(`con-b${i}`, `Contar ${em}`, em, "cognitiva", "contar", ["6-8", "9-11"], 40, { max: 8, tema: em }, { max: 30 }));

// --- Pensar · sumar con dibujos ---
["🍎", "⭐", "🐞", "🌸", "🐤", "🍪", "🎈", "🐟", "🚗", "🧁", "🌙", "⚽"].forEach((em, i) =>
  S(`sfg-${i}`, `Sumar ${em}`, em, "cognitiva", "sumaFiguras", ["3-5"], 30, { tema: em })
);

// --- Pensar · comparar ---
S("may-2g", "¿Cuál es más grande?", "⚖️", "cognitiva", "mayorMenor", ["6-8"], 40, { tope: 8, modo: "mayor", n: 2 }, { tope: 100 });
S("men-2c", "¿Cuál es más chico?", "⚖️", "cognitiva", "mayorMenor", ["6-8"], 40, { tope: 8, modo: "menor", n: 2 }, { tope: 100 });
S("may-3g", "El más grande de tres", "⚖️", "cognitiva", "mayorMenor", ["6-8", "9-11"], 40, { tope: 20, modo: "mayor", n: 3 }, { tope: 1000 });
S("men-3c", "El más chico de tres", "⚖️", "cognitiva", "mayorMenor", ["6-8", "9-11"], 40, { tope: 20, modo: "menor", n: 3 }, { tope: 1000 });
S("may-4g", "El más grande de cuatro", "⚖️", "cognitiva", "mayorMenor", ["9-11"], 40, { tope: 50, modo: "mayor", n: 4 }, { tope: 5000 });
S("par-impar", "¿Par o impar?", "🎲", "cognitiva", "parImpar", ["9-11"], 40, {});

// --- Pensar · secuencias ---
[[1, ["3-5", "6-8"]], [2, ["6-8"]], [3, ["6-8", "9-11"]], [4, ["9-11"]], [5, ["6-8"]],
 [10, ["6-8", "9-11"]], [20, ["9-11"]], [25, ["9-11"]], [50, ["9-11"]], [100, ["9-11"]]].forEach(([paso, ed]) => {
  S(`sec-${paso}`, `Contar de ${paso} en ${paso}`, "➡️", "cognitiva", "secuencia", ed, 40, { paso, desdeMax: paso * 3 + 8 });
});
[[1, ["6-8", "9-11"]], [2, ["9-11"]], [5, ["9-11"]], [10, ["9-11"]]].forEach(([paso, ed]) => {
  S(`sea-${paso}`, `Hacia atrás de ${paso} en ${paso}`, "⬅️", "cognitiva", "secuencia", ed, 40, { paso, atras: true });
});
S("fal-a", "¿Qué número falta?", "🔍", "cognitiva", "faltaNumero", ["6-8"], 40, { tope: 10 }, { tope: 60 });
S("fal-b", "¿Qué número falta? (grandes)", "🔍", "cognitiva", "faltaNumero", ["9-11"], 40, { tope: 50 }, { tope: 500 });

// --- Hablar ---
[["cla", "figuras clásicas", VOCABULARIO, ["3-5"]],
 ["ani", "animales", B_ANIMALES, ["3-5", "6-8"]],
 ["com", "comidas", B_COMIDA, ["3-5", "6-8"]],
 ["cas", "cosas de casa", B_CASA, ["6-8"]],
 ["nat", "naturaleza", B_NATURALEZA, ["6-8"]],
 ["tra", "transportes", B_TRANSPORTE, ["3-5", "6-8"]]].forEach(([k, nom, banco, ed]) => {
  S(`pal-${k}`, `Nombrar ${nom}`, "🗣️", "lenguaje", "palabras", ed, 30, { banco });
});
S("let-pri", "Primera letra", "🔤", "lenguaje", "letras", ["6-8"], 40, { modo: "primera" });
S("let-ult", "Última letra", "🔚", "lenguaje", "letras", ["9-11"], 40, { modo: "ultima" });
S("let-cua", "¿Cuántas letras tiene?", "🔢", "lenguaje", "letras", ["6-8"], 40, { modo: "cuantasLetras" });
S("let-voc", "¿Cuántas vocales tiene?", "🅰️", "lenguaje", "letras", ["9-11"], 40, { modo: "cuantasVocales" });
S("let-emp", "¿Empieza con vocal?", "🎯", "lenguaje", "letras", ["6-8", "9-11"], 40, { modo: "empiezaVocal" });
S("sil-f", "¿Cuántas sílabas? (con aplausos)", "👏", "lenguaje", "silabas", ["6-8"], 40, {});
S("sil-d", "¿Cuántas sílabas? (difícil)", "👏", "lenguaje", "silabas", ["9-11"], 40, { dificil: true });
S("sil-p1", "La primera sílaba", "🧩", "lenguaje", "primeraSilaba", ["6-8"], 25, {});
S("sil-p2", "La primera sílaba (experto)", "🧩", "lenguaje", "primeraSilaba", ["9-11"], 25, {});
[["cla", "palabras fáciles", VOCABULARIO, ["3-5"]],
 ["ani", "animales", B_ANIMALES, ["3-5", "6-8"]],
 ["com", "comidas", B_COMIDA, ["6-8"]],
 ["dif", "palabras trabadas", PALABRAS_DIFICIL, ["6-8", "9-11"]],
 ["mag", "palabras mágicas", B_MAGICAS, ["6-8", "9-11"]]].forEach(([k, nom, banco, ed]) => {
  S(`pro-${k}`, `Escuchá y repetí: ${nom}`, "🎤", "lenguaje", "pronuncia", ed, 25, { banco });
});

// --- Mover ---
S("atr-1", "Bichito tranquilo", "🐞", "psicomotor", "atrapa", ["3-5"], 40, { velocidad: 2400, meta: 8, tam: "h-20 w-20 sm:h-24 sm:w-24" }, { velocidad: 1400, meta: 16 });
S("atr-2", "Bichito veloz", "🐞", "psicomotor", "atrapa", ["6-8"], 40, { velocidad: 1600, meta: 12, tam: "h-12 w-12 sm:h-16 sm:w-16" }, { velocidad: 950, meta: 22 });
S("atr-3", "Bichito turbo", "🐞", "psicomotor", "atrapa", ["9-11"], 40, { velocidad: 1200, meta: 15, tam: "h-10 w-10 sm:h-12 sm:w-12" }, { velocidad: 700, meta: 28 });

// --- Mover · trazado de letras, números y palabras ---
S("tra-voc", "Trazar las vocales", "✍️", "psicomotor", "trazar", ["3-5"], 20, { tipo: "letras", banco: "AEIOU", tam: 190, minCob: 45 }, { minCob: 68 });
S("tra-abc", "Trazar el abecedario", "✍️", "psicomotor", "trazar", ["3-5", "6-8"], 30, { tipo: "letras", banco: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ", tam: 190, minCob: 45 }, { minCob: 72 });
S("tra-num", "Trazar los números", "✍️", "psicomotor", "trazar", ["3-5", "6-8"], 25, { tipo: "letras", banco: "0123456789", tam: 190, minCob: 45 }, { minCob: 72 });
S("tra-pal", "Mis primeras palabras: mamá, papá…", "📝", "psicomotor", "trazar", ["3-5", "6-8"], 25, { tipo: "palabras", maxLargo: 4, tam: 105, minCob: 42 }, { maxLargo: 5, minCob: 62 });
S("tra-lar", "Palabras grandes", "📝", "psicomotor", "trazar", ["6-8", "9-11"], 25, { tipo: "palabras", largas: true, tam: 72, minCob: 48 }, { minCob: 68 });

// --- Ahorrar ---
S("alc-a", "La alcancía: monedas", "🐷", "economia", "alcancia", ["6-8"], 30, { monedas: [1, 2], min: 3, max: 6 }, { monedas: [1, 2, 5], min: 8, max: 16 });
S("alc-b", "La alcancía: con billetes", "🐷", "economia", "alcancia", ["9-11"], 30, { monedas: [1, 2, 5, 10, 20], min: 12, max: 30 }, { monedas: [5, 10, 20, 50], min: 60, max: 160 });
S("din-a", `¿Cuánto hay en el bolsillo?`, "💵", "economia", "contarDinero", ["6-8"], 30, { valores: [1, 2], cant: 2 }, { valores: [1, 2, 5], cant: 4 });
S("din-b", `¿Cuánto hay? (con billetes)`, "💵", "economia", "contarDinero", ["9-11"], 30, { valores: [2, 5, 10], cant: 3 }, { valores: [5, 10, 20, 50], cant: 5 });
S("vue-a", "El vuelto", "🧾", "economia", "vuelto", ["6-8"], 30, { tope: 4 }, { tope: 18 });
S("vue-b", "El vuelto (grandes compras)", "🧾", "economia", "vuelto", ["9-11"], 30, { tope: 15 }, { tope: 95 });
S("pre-a", "¿Cuál cuesta más?", "🛒", "economia", "cualCuesta", ["6-8"], 25, { n: 2, modo: "caro", tope: 8 }, { tope: 30 });
S("pre-b", "¿Cuál es más barato?", "🛒", "economia", "cualCuesta", ["6-8"], 25, { n: 2, modo: "barato", tope: 10 }, { n: 3, tope: 60 });
S("pre-c", "El más caro de tres", "🛒", "economia", "cualCuesta", ["9-11"], 25, { n: 3, modo: "caro", tope: 40 }, { tope: 200 });
S("nq-a", "¿Necesito o quiero?", "🤔", "economia", "necesito", ["6-8"], 25, {});
S("nq-b", "¿Necesito o quiero? (avanzado)", "🤔", "economia", "necesito", ["9-11"], 25, { avanzado: true });
S("met-a", "Meta de ahorro", "🎯", "economia", "metaAhorro", ["9-11"], 25, {});
S("met-b", "Meta de ahorro (grande)", "🎯", "economia", "metaAhorro", ["9-11"], 25, { grande: true });
S("des-a", "Mitad de precio", "🏷️", "economia", "descuento", ["6-8"], 25, { modo: "mitad" });
S("des-b", "Descuento del 10%", "🏷️", "economia", "descuento", ["9-11"], 25, { modo: "diez" });
S("des-c", "Rebajas mezcladas", "🏷️", "economia", "descuento", ["9-11"], 25, { modo: "mixto" });
S("alz-a", "¿Me alcanza?", "💭", "economia", "alcanza", ["6-8"], 25, { tope: 10 }, { tope: 40 });
S("alz-b", "¿Me alcanza? (hasta 100)", "💭", "economia", "alcanza", ["9-11"], 25, { tope: 40 }, { tope: 120 });

// --- Pensar · comparar cantidades a ojo (aptas para 3-5) ---
S("mas-1", "¿Dónde hay más?", "👀", "cognitiva", "masMenos", ["3-5"], 20, { max: 3, modo: "mas" }, { max: 8 });
S("men-1", "¿Dónde hay menos?", "👀", "cognitiva", "masMenos", ["3-5"], 20, { max: 3, modo: "menos" }, { max: 8 });

// --- Convivir (modales y conductas, desde los 3) ---
S("cvv-bm", "¿Está bien o está mal?", "💛", "convivir", "convivir", ["3-5", "6-8"], 20, { tipo: "bienmal" });
S("cvv-mg", "Las palabras mágicas", "✨", "convivir", "convivir", ["3-5", "6-8"], 20, { tipo: "magicas" });
S("cvv-ay", "Ayudo en mi casa", "🏠", "convivir", "convivir", ["3-5", "6-8"], 20, { tipo: "ayudar" });
S("cvv-sc", "¿Qué hago si...?", "🤗", "convivir", "convivir", ["6-8", "9-11"], 20, { tipo: "situaciones" });

// --- Descubrir: animales, ciencia, geografía e historia ---
S("des-ani", "Animales increíbles", "🦁", "descubrir", "quiz", ["3-5", "6-8"], 25, { banco: B_QUIZ_ANIMALES, titulo: "Animales increíbles 🦁" }, null, "text-cyan-700");
S("des-cie", "Ciencia y planetas", "🔭", "descubrir", "quiz", ["6-8", "9-11"], 25, { banco: B_QUIZ_CIENCIA, titulo: "Ciencia y planetas 🔭" }, null, "text-cyan-700");
S("des-his", "Historia argentina", "🎩", "descubrir", "quiz", ["6-8", "9-11"], 20, { banco: B_QUIZ_HISTORIA, titulo: "Historia argentina 🎩" }, null, "text-cyan-700");
S("des-ban", "Banderas del mundo", "🏳️", "descubrir", "capitales", ["6-8", "9-11"], 20, { modo: "bandera" }, null, "text-cyan-700");
S("des-cap", "Capitales del mundo", "🗺️", "descubrir", "capitales", ["9-11"], 25, {}, null, "text-cyan-700");

// --- Hablar · lectocomprensión ---
S("lec-1", "Leo y comprendo", "📖", "lenguaje", "lectura", ["6-8"], 20, {});
S("lec-2", "Leo y comprendo: detective", "🕵️", "lenguaje", "lectura", ["9-11"], 20, { dif: true });

// --- Pensar · técnicas de estudio ---
S("est-1", "Aprendo a estudiar", "🎓", "cognitiva", "quiz", ["9-11"], 15, { banco: B_QUIZ_ESTUDIO, titulo: "Aprendo a estudiar 🎓" });

// --- Idiomas (desde los 6: primero se afianza la propia lengua) ---
Object.keys(IDIOMAS).forEach((l) => {
  Object.keys(VOCAB_IDIOMAS).forEach((cat) => {
    S(`idi-${l}-${cat}`, `${IDIOMAS[l].bandera} ${VOCAB_IDIOMAS[cat].nombre} en ${IDIOMAS[l].nombre.toLowerCase()}`,
      IDIOMAS[l].bandera, "idiomas", "idioma", ["6-8", "9-11"], 20, { idioma: l, cat, pInv: 0, pAud: 15 }, { pInv: 45, pAud: 35 });
  });
});

const TOTAL_NIVELES = SERIES.reduce((a, s) => a + s.niveles, 0);
// <<< SERIES

const idNivel = (serie, k) => `${serie.id}-n${k}`;
function buscarSeriePorNivel(id) {
  const m = String(id).match(/^(.*)-n(\d+)$/);
  if (!m) return null;
  const serie = SERIES.find((s) => s.id === m[1]);
  return serie ? { serie, nivel: Number(m[2]) } : null;
}
function nombreDeJuego(id) {
  const r = buscarSeriePorNivel(id);
  if (r) return `${r.serie.icono} ${r.serie.nombre} · Nivel ${r.nivel}`;
  const m = String(id).match(/^(.*)-inf$/);
  if (m) { const s = SERIES.find((x) => x.id === m[1]); if (s) return `${s.icono} ${s.nombre} · ∞ Práctica libre`; }
  return String(id);
}

// Desbloqueo adelantado: si domina su etapa en un área (15+ niveles con 80%+
// de acierto promedio), se le abre el contenido de la etapa SIGUIENTE en esa área.
const ORDEN_BANDA = { "3-5": 0, "6-8": 1, "9-11": 2 };
const BANDA_SIG = { "3-5": "6-8", "6-8": "9-11", "9-11": null };
function areasAdelantadas(sesiones, rango) {
  const mejor = {};
  sesiones.forEach((s) => { const r = s.puntos / s.maximo; if (mejor[s.juego] == null || r > mejor[s.juego]) mejor[s.juego] = r; });
  const res = {};
  Object.keys(AREAS).forEach((area) => { res[area] = false; });
  if (!BANDA_SIG[rango]) return res;
  Object.keys(AREAS).forEach((area) => {
    let cant = 0, suma = 0;
    Object.keys(mejor).forEach((id) => {
      const r = buscarSeriePorNivel(id);
      if (r && r.serie.area === area && r.serie.edades.includes(rango)) { cant++; suma += mejor[id]; }
    });
    res[area] = cant >= 15 && suma / cant >= 0.8;
  });
  return res;
}

// Punto de partida según la edad: en series que abarcan varias etapas, el niño
// de la etapa mayor NO arranca del nivel 1 (calibrado para los más chicos),
// sino más adelante. Los niveles previos quedan abiertos para repasar o reforzar.
function nivelInicial(serie, rango) {
  if (!rango || !serie.edades.includes(rango)) return 1;
  const menores = serie.edades.filter((e) => (ORDEN_BANDA[e] || 0) < (ORDEN_BANDA[rango] || 0));
  if (menores.length === 0) return 1;
  return Math.max(1, Math.floor(serie.niveles * (menores.length / serie.edades.length) * 0.85));
}
function progresoSerie(s, mejor) {
  let c = 0;
  for (let k = 1; k <= s.niveles; k++) if (mejor[idNivel(s, k)] != null) c++;
  return c / s.niveles;
}
function nivelDesbloqueado(s, k, mejor, rango) {
  if (k <= nivelInicial(s, rango)) return true;
  if (mejor[idNivel(s, k - 1)] != null) return true;
  return k >= 3 && mejor[idNivel(s, k - 2)] != null && mejor[idNivel(s, k - 2)] >= 0.85; // ⭐⭐⭐ saltea un nivel
}
// Próximo nivel recomendado, con REFUERZO automático: si los dos últimos intentos
// en la serie salieron muy flojos, baja 3 niveles para encontrar el punto seguro
// y desde ahí volver a subir.
function proximoNivel(s, mejor, rango, sesiones) {
  const inicio = nivelInicial(s, rango);
  let base = null;
  for (let k = inicio; k <= s.niveles; k++) {
    if (nivelDesbloqueado(s, k, mejor, rango) && mejor[idNivel(s, k)] == null) { base = k; break; }
  }
  if (base == null) {
    for (let k = 1; k <= s.niveles; k++) if (mejor[idNivel(s, k)] == null) return k;
    return inicio;
  }
  if (sesiones) {
    const ult = sesiones.filter((x) => String(x.juego).startsWith(s.id + "-n")).slice(-2);
    if (ult.length === 2 && ult.every((x) => x.puntos / x.maximo < 0.4)) return Math.max(1, base - 3);
  }
  return base;
}
// ---------- medallas y diplomas ----------
const MEDALLAS = [
  { id: "primera", icono: "🐣", nombre: "¡Primer nivel!", desc: "Superá tu primer nivel", check: (c) => c.completados >= 1 },
  { id: "diez", icono: "🎖️", nombre: "Diez al hilo", desc: "Superá 10 niveles", check: (c) => c.completados >= 10 },
  { id: "coleccion", icono: "🏅", nombre: "Coleccionista", desc: "Superá 25 niveles", check: (c) => c.completados >= 25 },
  { id: "cien", icono: "🏆", nombre: "Gran Explorador", desc: "Superá 100 niveles", check: (c) => c.completados >= 100, diploma: "Gran Explorador: 100 niveles superados" },
  { id: "racha3", icono: "🔥", nombre: "Rachita", desc: "Jugá 3 días seguidos", check: (c) => c.racha >= 3 },
  { id: "racha7", icono: "🌟", nombre: "Semana perfecta", desc: "Jugá 7 días seguidos", check: (c) => c.racha >= 7, diploma: "Constancia: una semana entera de práctica" },
  { id: "estrellas", icono: "⭐", nombre: "Estrella brillante", desc: "Lográ ⭐⭐⭐ en 10 niveles", check: (c) => c.tresEstrellas >= 10 },
  { id: "escritor", icono: "✍️", nombre: "Manos a la letra", desc: "Superá 5 niveles de escritura", check: (c) => c.porPrefijo("tra-") >= 5 },
  { id: "lector", icono: "📖", nombre: "Pequeño lector", desc: "Superá 5 lecturas", check: (c) => c.porPrefijo("lec-") >= 5 },
  { id: "mundo", icono: "🌍", nombre: "Ciudadano del mundo", desc: "Superá 10 niveles de idiomas", check: (c) => c.porPrefijo("idi-") >= 10 },
  { id: "corazon", icono: "💛", nombre: "Buen compañero", desc: "Superá 10 niveles de Convivir", check: (c) => c.porPrefijo("cvv-") >= 10 },
  { id: "cohete", icono: "🚀", nombre: "Adelantado", desc: "Jugá niveles de la etapa siguiente", check: (c) => c.adelantado },
];
function calcularLogros(sesiones, rango) {
  const mejor = {};
  sesiones.forEach((s) => { const r = s.puntos / s.maximo; if (mejor[s.juego] == null || r > mejor[s.juego]) mejor[s.juego] = r; });
  const ids = Object.keys(mejor);
  const dias = new Set(sesiones.map((s) => new Date(s.fecha).toDateString()));
  let racha = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (dias.has(d.toDateString())) racha++;
    else if (i === 0) continue;
    else break;
  }
  const ctx = {
    completados: ids.length,
    tresEstrellas: ids.filter((id) => mejor[id] >= 0.8).length,
    racha,
    porPrefijo: (p) => ids.filter((id) => id.startsWith(p)).length,
    adelantado: rango ? sesiones.some((s) => {
      const r = buscarSeriePorNivel(s.juego);
      return r && !r.serie.edades.includes(rango) && r.serie.edades.some((e) => (ORDEN_BANDA[e] || 0) > (ORDEN_BANDA[rango] || 0));
    }) : false,
  };
  return MEDALLAS.map((m) => ({ ...m, ganada: !!m.check(ctx) }));
}
const isoParaEdad = (a) => { const d = new Date(); d.setFullYear(d.getFullYear() - a); d.setDate(d.getDate() - 40); return d.toISOString().slice(0, 10); };

// Áreas en refuerzo: últimas 5 partidas del área con menos del 45% de acierto.
function areasEnRefuerzo(sesiones) {
  const res = [];
  Object.keys(AREAS).forEach((a) => {
    const del = sesiones.filter((s) => s.area === a).slice(-5);
    if (del.length >= 5 && del.reduce((x, s) => x + s.puntos / s.maximo, 0) / del.length < 0.45) res.push(a);
  });
  return res;
}

// ============================================================
// Análisis de progreso (lectura honesta, sin promesas)
// ============================================================
function analizarProgreso(sesiones, seriesDisp, rango, edadAnios) {
  const porArea = {};
  Object.keys(AREAS).forEach((a) => { porArea[a] = { jugadas: 0, prom: 0, antes: [], ahora: [] }; });
  const mitad = Math.floor(sesiones.length / 2);
  sesiones.forEach((s, i) => {
    const d = porArea[s.area];
    if (!d) return;
    d.jugadas++;
    (i < mitad ? d.antes : d.ahora).push(s.puntos / s.maximo);
  });
  Object.values(porArea).forEach((d) => {
    const todas = [...d.antes, ...d.ahora];
    d.prom = todas.length ? Math.round((todas.reduce((a, b) => a + b, 0) / todas.length) * 100) : 0;
    const pa = d.antes.length ? d.antes.reduce((a, b) => a + b, 0) / d.antes.length : null;
    const ph = d.ahora.length ? d.ahora.reduce((a, b) => a + b, 0) / d.ahora.length : null;
    d.tendencia = pa !== null && ph !== null ? Math.round((ph - pa) * 100) : null;
  });

  // racha de días seguidos
  let racha = 0;
  const dias = new Set(sesiones.map((s) => new Date(s.fecha).toDateString()));
  for (let i = 0; i < 400; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (dias.has(d.toDateString())) racha++;
    else if (i === 0) continue;
    else break;
  }

  // ritmo última semana
  const hace7 = Date.now() - 7 * 86400000;
  const ritmo = Math.round((sesiones.filter((s) => s.fecha >= hace7).length / 7) * 10) / 10;

  // cobertura: niveles superados sobre el total de su etapa
  const total = seriesDisp.reduce((a, s) => a + s.niveles, 0);
  const prefijos = new Set(seriesDisp.map((s) => s.id));
  const cubiertos = new Set(
    sesiones.map((s) => s.juego).filter((id) => {
      const r = buscarSeriePorNivel(id);
      return r && prefijos.has(r.serie.id);
    })
  ).size;

  const frases = [];
  if (sesiones.length === 0) {
    frases.push("Todavía no hay partidas: cuando empiece a jugar, acá va a aparecer una lectura de su progreso.");
  } else {
    Object.keys(AREAS).forEach((a) => {
      const d = porArea[a];
      if (d.jugadas < 4) return;
      if (d.tendencia !== null && d.tendencia >= 10) frases.push(`En ${AREAS[a].nombre} pasó de un ${Math.max(0, d.prom - d.tendencia)}% a un ${d.prom}% de acierto: está mejorando claramente con la práctica.`);
      else if (d.tendencia !== null && d.tendencia <= -10) frases.push(`En ${AREAS[a].nombre} bajó el acierto últimamente: puede ser cansancio o niveles nuevos más difíciles. Conviene acompañarle en una sesión.`);
      else if (d.prom >= 85 && d.jugadas >= 8) frases.push(`🚀 En ${AREAS[a].nombre} domina los niveles (${d.prom}% de acierto): la app le está acelerando el avance — con puntaje excelente puede saltear niveles y llegar antes a desafíos mayores.`);
      else frases.push(`En ${AREAS[a].nombre} sostiene un ${d.prom}% de acierto: rendimiento estable dentro de su etapa.`);
    });
    const menos = Object.keys(AREAS).reduce((a, b) => (porArea[a].jugadas <= porArea[b].jugadas ? a : b));
    frases.push(`El área menos explorada es ${AREAS[menos].nombre}: sumar niveles variados estimula el desarrollo integral.`);
    if (racha >= 3) frases.push(`Lleva ${racha} días seguidos practicando. La constancia en sesiones cortas es lo que más pesa según la investigación sobre aprendizaje.`);
    if (cubiertos > 0) frases.push(`Ya superó ${cubiertos} de los ${total.toLocaleString("es-AR")} niveles disponibles para su etapa: hay contenido de sobra para no repetirse nunca.`);
    if (ritmo > 0) frases.push(`A este ritmo (${ritmo} niveles por día) avanza unos ${Math.round(ritmo * 30)} niveles nuevos por mes, con dificultad que sube de a poco.`);
  }
  // adelanto: niveles de una etapa superior a la suya, jugados y superados
  if (rango && edadAnios != null) {
    const porAdel = {};
    sesiones.forEach((s) => {
      const r = buscarSeriePorNivel(s.juego);
      if (!r || r.serie.edades.includes(rango)) return;
      const banda = r.serie.edades.find((e) => (ORDEN_BANDA[e] || 0) > (ORDEN_BANDA[rango] || 0));
      if (!banda) return;
      if (!porAdel[r.serie.area]) porAdel[r.serie.area] = { cant: 0, suma: 0, banda };
      porAdel[r.serie.area].cant++;
      porAdel[r.serie.area].suma += s.puntos / s.maximo;
    });
    const adel = Object.keys(porAdel).filter((a) => porAdel[a].cant >= 3);
    adel.forEach((a) => {
      const d = porAdel[a];
      frases.unshift(`🚀 ¡Va adelantado! Con ${edadAnios} años está jugando niveles de ${AREAS[a].nombre} de la etapa ${d.banda} — contenido pensado para chicos de ${d.banda} años — con un ${Math.round((d.suma / d.cant) * 100)}% de acierto. Dominó su propia etapa y la app le abrió estos desafíos.`);
    });
    if (adel.length > 0) frases.push(`Nota importante sobre el adelanto: describe el contenido de esta app que domina, no es una medición de inteligencia ni una «edad mental» — eso solo pueden evaluarlo profesionales con pruebas estandarizadas. Es una gran señal para seguir alimentando su curiosidad.`);
  }

  // señales para conversar con el pediatra (NO diagnóstico)
  const alertas = [];
  Object.keys(AREAS).forEach((a) => {
    const d = porArea[a];
    if (d.jugadas >= 10 && d.prom <= 35 && (d.tendencia === null || d.tendencia < 8)) {
      alertas.push(`En ${AREAS[a].nombre} (${AREAS[a].desc.toLowerCase()}), los primeros niveles de su etapa le están costando de forma sostenida: ${d.prom}% de acierto en ${d.jugadas} partidas, sin mejora clara todavía.`);
    }
  });
  const refuerzos = areasEnRefuerzo(sesiones);
  return { porArea, racha, ritmo, cubiertos, total, frases, alertas, refuerzos, jugadas: sesiones.length };
}

function ResultadoPlan({ puntos, maximo, siguiente, ultimo, onSeguir, onSalir }) {
  const [cuenta, setCuenta] = useState(4);
  useEffect(() => {
    const ratio0 = maximo > 0 ? puntos / maximo : 0;
    sonido(ratio0 >= 0.8 ? "fanfarria" : "estrella");
    hablar(ratio0 >= 0.8 ? "¡Excelente! Vamos por el siguiente." : "¡Muy bien! Seguimos.", AUDIO_ON);
  }, []); // eslint-disable-line
  useEffect(() => {
    if (cuenta <= 0) { onSeguir(); return; }
    const t = setTimeout(() => setCuenta(cuenta - 1), 1000);
    return () => clearTimeout(t);
  }, [cuenta]); // eslint-disable-line
  const ratio = maximo > 0 ? puntos / maximo : 0;
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="text-6xl">{ratio >= 0.8 ? "🏆" : ratio >= 0.5 ? "🎉" : "💪"}</div>
      <p className="text-2xl font-black text-slate-800">{puntos} de {maximo} puntos</p>
      {ultimo ? (
        <p className="text-xl font-black text-emerald-600">🧭 ¡Último nivel del plan!</p>
      ) : (
        siguiente && <p className="text-lg font-bold text-slate-500">Siguiente: <span className="font-black text-slate-700">{siguiente.icono} {siguiente.nombre}</span></p>
      )}
      <button onClick={onSeguir}
        className="rounded-full bg-emerald-500 px-8 py-4 text-xl font-black text-white shadow-lg active:scale-95">
        {ultimo ? "Terminar plan 🎊" : `Seguir (${cuenta})`}
      </button>
      <button onClick={onSalir} className="text-sm font-bold text-slate-400">Salir del plan</button>
    </div>
  );
}

function GuiaPadres() {
  const secciones = [
    { t: "🤝 Jugar con ellos cambia todo", c: "Diez minutos jugando juntos valen más que una hora de pantalla en soledad. Sentate al lado, dejá que resuelva, y preguntá cómo lo pensó. La app está diseñada para eso: niveles cortos que terminan rápido." },
    { t: "💬 Elogiá el esfuerzo, no la inteligencia", c: "La investigación sobre mentalidad de crecimiento (Carol Dweck y colegas) sugiere celebrar el proceso: «¡Qué bien que probaste otra forma!» en lugar de «¡Qué inteligente sos!». Los chicos elogiados por esfuerzo se animan a desafíos más difíciles; los elogiados por «ser inteligentes» tienden a evitar equivocarse." },
    { t: "⏱️ Corto y seguido le gana a largo y esporádico", c: "Es mejor 10-15 minutos casi todos los días que una hora el domingo. La práctica espaciada es de los hallazgos más sólidos de la ciencia del aprendizaje. El «objetivo de hoy» y el «plan del día» de la app están calibrados para eso." },
    { t: "🧠 Pensar, fuera de la pantalla", c: "Juegos de mesa, memotest físico, contar escalones, buscar formas en la calle. Pedile que te ayude a recordar la lista del súper: la memoria de trabajo se ejercita en la vida real." },
    { t: "💬 Hablar: leer juntos es lo más poderoso", c: "La lectura compartida diaria es una de las prácticas con mejor evidencia para el lenguaje. Cantar, jugar con rimas, separar palabras en sílabas con aplausos y dejar que termine las frases del cuento. El juego «Escuchá y repetí» rinde el doble si vos también repetís la palabra con él." },
    { t: "✋ Mover: manos ocupadas, cerebro activo", c: "Dibujar, recortar con tijera de punta redonda, masa, enhebrar fideos, pelota. La motricidad fina de hoy es la escritura de mañana. La app solo complementa: el movimiento real es insustituible." },
    { t: "💰 Ahorrar: la alcancía de verdad", c: "Una alcancía física, una meta concreta («juntar para el juguete») y participar en compras chicas: que pague el pan y reciba el vuelto. Hablar de «necesito o quiero» frente a la góndola convierte cada salida en una lección. La OCDE recomienda empezar la educación financiera temprano, siempre como juego." },
    { t: "😤 Si se frustra", c: "Validá la emoción («te dio bronca, te entiendo»), bajá a un nivel que le salga bien para cerrar en positivo, y retomá otro día. Frustrarse un poco es parte de aprender; frustrarse mucho es señal de que el nivel todavía no es para su momento, y no pasa nada." },
    { t: "🌙 Lo que más importa no está en ninguna app", c: "Dormir bien, jugar libre, moverse y conversar en familia tienen más impacto en el desarrollo que cualquier aplicación, incluida esta. Usala como un complemento divertido, no como el plan principal. Y ante cualquier duda sobre el desarrollo (habla, atención, aprendizaje), el camino es el pediatra, no una app." },
  ];
  return (
    <div className="flex w-full flex-col gap-3">
      {secciones.map((s, i) => (
        <div key={i} className="rounded-3xl bg-white p-5 shadow-md">
          <p className="font-black text-slate-800">{s.t}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.c}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Pantalla de resultado
// ============================================================
function Resultado({ puntos, maximo, onRepetir, onSalir }) {
  const ratio = maximo > 0 ? puntos / maximo : 0;
  const estrellas = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
  const mensaje = estrellas === 3 ? "¡Increíble!" : estrellas === 2 ? "¡Muy bien!" : "¡Buen intento!";
  useEffect(() => {
    if (estrellas === 3) { sonido("fanfarria"); hablar("¡Increíble! ¡Tres estrellas! ¡Sos una estrella vos!", AUDIO_ON); }
    else if (estrellas === 2) { sonido("estrella"); hablar("¡Muy bien! ¡Dos estrellas! Casi perfecto.", AUDIO_ON); }
    else { sonido("acierto"); hablar("¡Buen intento! Cada vez te sale mejor.", AUDIO_ON); }
  }, []); // eslint-disable-line
  return (
    <div className="flex flex-col items-center gap-5 py-8 sm:gap-6 sm:py-10">
      <div className="text-6xl sm:text-7xl">{estrellas === 3 ? "🏆" : estrellas === 2 ? "🎉" : "💪"}</div>
      <h2 className="text-3xl font-black text-slate-800 sm:text-4xl">{mensaje}</h2>
      <div className="flex gap-2">
        {[1, 2, 3].map((n) => (
          <Star key={n} className={`h-10 w-10 sm:h-12 sm:w-12 ${n <= estrellas ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
        ))}
      </div>
      <p className="text-xl font-bold text-slate-600 sm:text-2xl">{puntos} de {maximo} puntos</p>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        <button onClick={onRepetir} className="flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-lg font-black text-white shadow-lg active:scale-95 sm:px-8 sm:py-4 sm:text-xl">
          <RotateCcw /> Otra vez
        </button>
        <button onClick={onSalir} className="flex items-center gap-2 rounded-full bg-slate-200 px-6 py-3 text-lg font-black text-slate-700 active:scale-95 sm:px-8 sm:py-4 sm:text-xl">
          <Home /> Menú
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Panel para padres
// ============================================================
function PanelPadres({ sesiones, perfil, edadAnios }) {
  const porArea = Object.keys(AREAS).map((clave) => {
    const del = sesiones.filter((s) => s.area === clave);
    const jugadas = del.length;
    const promedio = jugadas > 0 ? Math.round((del.reduce((a, s) => a + s.puntos / s.maximo, 0) / jugadas) * 100) : 0;
    return { clave, jugadas, promedio };
  });
  const ultimas = [...sesiones].reverse().slice(0, 8);

  return (
    <div className="flex w-full max-w-md flex-col gap-5 sm:gap-6">
      <div className="rounded-3xl bg-white p-5 shadow-md sm:p-6">
        <h3 className="mb-1 text-lg font-black text-slate-800 sm:text-xl">Progreso por área</h3>
        <p className="mb-4 text-sm text-slate-500">{perfil?.nombre} tiene {edadAnios} años · etapa {rangoDeEdad(edadAnios)}. Los juegos se actualizan solos con cada cumpleaños.</p>
        {porArea.map(({ clave, jugadas, promedio }) => (
          <div key={clave} className="mb-4">
            <div className="mb-1 flex flex-wrap justify-between gap-1 text-sm font-bold text-slate-600">
              <span>{AREAS[clave].icono} {AREAS[clave].nombre} — {AREAS[clave].desc}</span>
              <span>{jugadas > 0 ? `${promedio}%` : "sin datos"}</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${AREAS[clave].color}`} style={{ width: `${promedio}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-400">{jugadas} {jugadas === 1 ? "partida" : "partidas"}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-md sm:p-6">
        <h3 className="mb-3 text-lg font-black text-slate-800 sm:text-xl">¿Qué habilidades ejercita cada área?</h3>
        <div className="flex flex-col gap-3">
          {Object.keys(AREAS).map((clave) => (
            <div key={clave} className={`rounded-2xl ${AREAS[clave].suave} p-4`}>
              <p className={`font-black ${AREAS[clave].texto}`}>{AREAS[clave].icono} {AREAS[clave].nombre}</p>
              <p className="mt-1 text-sm text-slate-600">{AREAS[clave].habilidad}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-2xl bg-slate-100 p-3 text-xs text-slate-500">
          <span className="font-black">Nota de honestidad científica:</span> estas asociaciones provienen de estudios
          poblacionales. Describen tendencias generales, no predicen el futuro de un niño en particular — ninguna
          app puede hacer eso. El valor está en ejercitar habilidades, no en etiquetar.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-md sm:p-6">
        <h3 className="mb-3 text-lg font-black text-slate-800 sm:text-xl">Últimas partidas</h3>
        {ultimas.length === 0 ? (
          <p className="text-slate-500">Todavía no hay partidas registradas.</p>
        ) : (
          ultimas.map((s, i) => {
            return (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                <span className="font-bold text-slate-700">{nombreDeJuego(s.juego)}</span>
                <span className={`font-black ${s.puntos / s.maximo >= 0.7 ? "text-green-600" : "text-amber-600"}`}>
                  {s.puntos}/{s.maximo}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="rounded-3xl bg-sky-50 p-5 text-sm text-slate-600">
        <p className="font-bold text-slate-700">💡 Sugerencia</p>
        <p>
          {(() => {
            const sinJugar = porArea.filter((a) => a.jugadas === 0);
            if (sinJugar.length > 0) return `Todavía no exploraron el área "${AREAS[sinJugar[0].clave].nombre}". Probar juegos variados estimula el desarrollo integral.`;
            const menor = porArea.reduce((a, b) => (a.promedio <= b.promedio ? a : b));
            return `El área con más espacio para crecer es "${AREAS[menor.clave].nombre}". Repetir juegos cortos varias veces por semana ayuda más que sesiones largas.`;
          })()}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Sub-app NIÑOS — multiperfil con PIN, objetivo diario y premio
// ============================================================
const AVATARES = ["🦁", "🐼", "🦊", "🐸", "🦄", "🐯", "🐙", "🦖", "🐨", "🐥"];

function idYoutube(url) {
  const m = String(url).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
const esHoy = (ts) => new Date(ts).toDateString() === new Date().toDateString();

function CampoPin({ valor, setValor, placeholder = "PIN de 4 números" }) {
  return (
    <input type="password" inputMode="numeric" maxLength={4} value={valor} placeholder={placeholder}
      onChange={(e) => setValor(e.target.value.replace(/\D/g, "").slice(0, 4))}
      className="rounded-2xl border-4 border-sky-200 px-4 py-3 text-center text-2xl font-black tracking-[0.5em] text-slate-700 outline-none focus:border-sky-400" />
  );
}

function AppNinos({ alSelector, permisos = { mic: true, videos: true }, alRevisar }) {
  const [pantalla, setPantalla] = useState("cargando");
  const [perfiles, setPerfiles] = useState([]);
  const [activo, setActivo] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [premio, setPremio] = useState({ meta: 5, videos: [] });
  const [pinPadres, setPinPadres] = useState(null);

  const [juegoActivo, setJuegoActivo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [claveJuego, setClaveJuego] = useState(0);
  const [plan, setPlan] = useState(null); // { lista: [ids de nivel], idx }
  const [serieAbierta, setSerieAbierta] = useState(null);
  const [vistosHoy, setVistosHoy] = useState(0);
  const [videoActivo, setVideoActivo] = useState(null);
  const [maxInput, setMaxInput] = useState(2);
  const [sonidoOn, setSonidoOn] = useState(true);
  const [demoNoti, setDemoNoti] = useState(null);
  const [demoBrisa, setDemoBrisa] = useState(null);
  const [leeInput, setLeeInput] = useState("no");
  const [pinEdit, setPinEdit] = useState(null); // {id, val}

  const [nombreInput, setNombreInput] = useState("");
  const [nacInput, setNacInput] = useState("");
  const [pinNuevo, setPinNuevo] = useState("");
  const [errorPerfil, setErrorPerfil] = useState(null);
  const [pendiente, setPendiente] = useState(null);
  const [pinIntento, setPinIntento] = useState("");
  const [errorPin, setErrorPin] = useState(null);
  const [pinPA, setPinPA] = useState("");
  const [pinPA2, setPinPA2] = useState("");
  const [metaInput, setMetaInput] = useState(5);
  const [videosTxt, setVideosTxt] = useState("");
  const [videosSel, setVideosSel] = useState([]);
  const [borrando, setBorrando] = useState(null);

  useEffect(() => {
    (async () => {
      let lista = (await leer("pequemundo:perfiles")) || [];
      // migración desde la versión de un solo perfil
      if (lista.length === 0) {
        const viejo = await leer("pequemundo:perfil");
        if (viejo && viejo.nacimiento) {
          lista = [{ id: "p1", nombre: viejo.nombre, nacimiento: viejo.nacimiento, pin: null, avatar: AVATARES[0] }];
          await guardar("pequemundo:perfiles", lista);
          const viejasSes = await leer("pequemundo:sesiones");
          if (viejasSes) await guardar("pequemundo:sesiones:p1", viejasSes);
        }
      }
      const pr = await leer("pequemundo:premio");
      const pp = await leer("pequemundo:pinpadres");
      const so = await leer("pequemundo:sonido");
      const sonidoV = so === null ? true : !!so;
      setSonidoOn(sonidoV);
      setAudioOn(sonidoV);
      if (pr) setPremio(pr);
      if (pp) setPinPadres(pp);
      setPerfiles(lista);
      setPantalla(lista.length > 0 ? "elegirPerfil" : "nuevoPerfil");
    })();
  }, []);

  useEffect(() => { try { window.scrollTo(0, 0); } catch (e) { /* nada */ } }, [pantalla]);
  useEffect(() => {
    const conMusica = activo && sonidoOn && ["menu", "serie", "juego", "logros"].includes(pantalla);
    detenerMusica();
    if (conMusica) iniciarMusica(rangoDeEdad(Math.min(Math.max(calcularEdad(activo.nacimiento), 3), 11)));
    return detenerMusica;
  }, [pantalla, activo, sonidoOn]);

  const activar = async (p) => {
    const s = (await leer(`pequemundo:sesiones:${p.id}`)) || [];
    const v = await leer(`pequemundo:vistos:${p.id}`);
    setVistosHoy(v && v.fecha === new Date().toDateString() ? v.cant : 0);
    setVideoActivo(null);
    setActivo(p);
    setSesiones(s);
    setPendiente(null);
    setPinIntento("");
    setErrorPin(null);
    setPantalla("menu");
  };

  const elegir = (p) => {
    if (p.pin) { setPendiente(p); setPinIntento(""); setErrorPin(null); setPantalla("pinNino"); }
    else activar(p);
  };

  const crearPerfil = () => {
    setErrorPerfil(null);
    if (!nombreInput.trim() || !nacInput) return;
    const edad = calcularEdad(nacInput);
    if (isNaN(edad) || edad < 0 || edad > 17) { setErrorPerfil("Revisá la fecha: no parece correcta."); return; }
    if (edad < 3) { setErrorPerfil("PequeMundo está diseñado desde los 3 años. ¡Los esperamos pronto! 💛"); return; }
    if (edad > 11) { setErrorPerfil("PequeMundo llega hasta los 11 años. Para más grandes, pronto habrá una etapa nueva."); return; }
    if (pinNuevo && pinNuevo.length !== 4) { setErrorPerfil("El PIN debe tener 4 números (o dejalo vacío)."); return; }
    const p = {
      id: "p" + Date.now(),
      nombre: nombreInput.trim(),
      nacimiento: nacInput,
      pin: pinNuevo || null,
      solito: leeInput === "no",
      avatar: AVATARES[perfiles.length % AVATARES.length],
    };
    const lista = [...perfiles, p];
    setPerfiles(lista);
    guardar("pequemundo:perfiles", lista);
    setNombreInput(""); setNacInput(""); setPinNuevo("");
    activar(p);
  };

  const borrarPerfil = (id) => {
    const lista = perfiles.filter((p) => p.id !== id);
    setPerfiles(lista);
    guardar("pequemundo:perfiles", lista);
    setBorrando(null);
    if (activo && activo.id === id) { setActivo(null); setSesiones([]); }
  };

  const terminarJuego = (puntos, maximo) => {
    const s = { juego: juegoActivo.id, area: juegoActivo.serie.area, puntos, maximo, fecha: Date.now() };
    const nuevas = [...sesiones, s];
    setSesiones(nuevas);
    guardar(`pequemundo:sesiones:${activo.id}`, nuevas);
    setResultado({ puntos, maximo });
  };

  const mejorPorNivel = () => {
    const m = {};
    sesiones.forEach((s) => { const r = s.puntos / s.maximo; if (m[s.juego] == null || r > m[s.juego]) m[s.juego] = r; });
    return m;
  };
  const alternarSonido = () => {
    const v = !sonidoOn;
    setSonidoOn(v);
    setAudioOn(v);
    guardar("pequemundo:sonido", v);
    if (v) { sonido("acierto"); hablar("¡Sonido activado!", true); }
    else { try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* nada */ } }
  };
  const registrarVisto = (url) => {
    const n = vistosHoy + 1;
    setVistosHoy(n);
    guardar(`pequemundo:vistos:${activo.id}`, { fecha: new Date().toDateString(), cant: n });
    setVideoActivo(url);
  };

  const abrirNivel = (serie, k) => {
    const id = idNivel(serie, k);
    setSemilla(semillaDe(id));
    setJuegoActivo({ serie, nivel: k, id, params: paramsNivel(serie, k) });
    setResultado(null);
    setClaveJuego((c) => c + 1);
    setPantalla("juego");
  };
  const abrirNivelPorId = (id) => { const r = buscarSeriePorNivel(id); if (r) abrirNivel(r.serie, r.nivel); };
  const abrirInfinito = (s) => {
    setSemilla(Date.now() % 2147483647);
    setJuegoActivo({ serie: s, nivel: "∞", id: `${s.id}-inf`, params: paramsNivel(s, s.niveles) });
    setResultado(null);
    setClaveJuego((c) => c + 1);
    setPantalla("juego");
  };
  const repetir = () => {
    setSemilla(juegoActivo.nivel === "∞" ? Date.now() % 2147483647 : semillaDe(juegoActivo.id));
    setResultado(null);
    setClaveJuego((c) => c + 1);
  };

  const iniciarPlan = (seriesDisp, cuantos) => {
    const mejor = mejorPorNivel();
    const lista = [];
    const areas = Object.keys(AREAS);
    const usadas = new Set();
    let i = 0;
    while (lista.length < cuantos && i < 80) {
      const area = areas[i % areas.length];
      const cand = seriesDisp.filter((s) => s.area === area && !usadas.has(s.id)).sort((a, b) => progresoSerie(a, mejor) - progresoSerie(b, mejor));
      if (cand.length > 0) { const s = cand[0]; usadas.add(s.id); lista.push(idNivel(s, proximoNivel(s, mejor, rango, sesiones))); }
      i++;
    }
    if (lista.length === 0) return;
    setPlan({ lista, idx: 0 });
    abrirNivelPorId(lista[0]);
  };

  const seguirPlan = () => {
    if (!plan) return;
    const prox = plan.idx + 1;
    if (prox >= plan.lista.length) {
      setPlan(null);
      setResultado(null);
      setPantalla("menu");
      sonido("fanfarria");
      hablar("¡Plan del día completo! ¡Excelente trabajo!", AUDIO_ON);
      return;
    }
    setPlan({ ...plan, idx: prox });
    abrirNivelPorId(plan.lista[prox]);
  };

  const salirPlan = () => { setPlan(null); setResultado(null); setPantalla("menu"); };

  const descargarInforme = (disponibles) => {
    const an = analizarProgreso(sesiones, disponibles, rango, edadAnios);
    const f = new Date().toLocaleDateString("es-AR");
    const filas = Object.keys(AREAS).map((a) => {
      const d = an.porArea[a];
      const tend = d.tendencia === null ? "—" : d.tendencia > 5 ? "▲ mejorando" : d.tendencia < -5 ? "▼ atención" : "= estable";
      return `<tr><td>${AREAS[a].icono} ${AREAS[a].nombre}</td><td>${d.jugadas}</td><td>${d.jugadas ? d.prom + "%" : "—"}</td><td>${tend}</td></tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Informe de progreso — ${activo.nombre}</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#1e293b;line-height:1.5}
h1{color:#0369a1}h2{color:#334155;margin-top:28px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #cbd5e1;padding:8px;text-align:left}
th{background:#f1f5f9}.caja{background:#fef9c3;border-radius:12px;padding:14px;font-size:14px}
.pie{margin-top:32px;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:12px}</style></head><body>
<h1>🌈 PequeMundo — Informe de progreso</h1>
<p><b>${activo.nombre}</b> · ${edadAnios} años (etapa ${rango}) · Informe generado el ${f}</p>
<h2>Resumen</h2>
<p>Partidas totales: <b>${an.jugadas}</b> · Racha actual: <b>${an.racha} ${an.racha === 1 ? "día" : "días"}</b> · Ritmo última semana: <b>${an.ritmo} niveles/día</b> · Niveles superados en su etapa: <b>${an.cubiertos} de ${an.total.toLocaleString("es-AR")}</b></p>
<h2>Por área</h2>
<table><tr><th>Área</th><th>Partidas</th><th>Acierto promedio</th><th>Tendencia</th></tr>${filas}</table>
<h2>Lectura del progreso</h2>
${an.frases.map((x) => `<p>• ${x}</p>`).join("")}
${an.refuerzos.length ? `<h2>Ajuste automático de dificultad</h2><p>En ${an.refuerzos.map((a) => AREAS[a].nombre).join(", ")} la app bajó automáticamente la dificultad para encontrar el punto donde ${activo.nombre} responde con seguridad, y desde ahí volver a subir de a poco. Es una adaptación del juego, no un diagnóstico.</p>` : ""}
${an.alertas.length ? `<h2>Para conversar en el próximo control pediátrico</h2>${an.alertas.map((x) => `<p>• ${x}</p>`).join("")}<p><b>Importante:</b> esto no es un diagnóstico ni una detección de retraso madurativo — ninguna app puede hacer eso. Las evaluaciones del desarrollo las realiza el pediatra con controles y herramientas validadas. Es una observación del juego para conversar en el control, junto con lo que la familia observa en casa.</p>` : ""}
<h2>Cómo seguir en casa</h2>
<p>Sesiones cortas y frecuentes (10-15 minutos), jugar juntos cuando se pueda, elogiar el esfuerzo y la estrategia, leer juntos todos los días y llevar el área Ahorrar a la vida real con una alcancía física. La guía completa está en el panel de padres de la app.</p>
<div class="caja"><b>Nota de honestidad científica.</b> Este informe describe el desempeño de ${activo.nombre} <b>dentro de la app y comparado con su propio historial</b>. No es una evaluación del desarrollo, no calcula «edad mental» ni predice notas o resultados futuros: eso no puede hacerlo ninguna app con seriedad — las evaluaciones del desarrollo usan pruebas estandarizadas administradas por profesionales, y el futuro de un niño no se predice desde un juego. Las habilidades que se ejercitan acá están asociadas en estudios poblacionales con buenos resultados educativos, pero son tendencias generales, no promesas individuales. Ante cualquier inquietud sobre el desarrollo, consulte al pediatra.</div>
<p class="pie">Generado localmente por Mente en Juego. Los datos viven solo en su dispositivo; este archivo no se envió a ningún servidor. Puede imprimirlo o guardarlo como PDF desde el navegador (Imprimir → Guardar como PDF).</p>
</body></html>`;
    try {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `informe-${activo.nombre.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { /* sin descarga */ }
  };

  const abrirPanel = () => {
    setPinPA(""); setPinPA2(""); setErrorPin(null);
    setMetaInput(premio.meta || 5);
    setMaxInput(premio.maxDia || 2);
    const vs = premio.videos || [];
    setVideosSel(vs.filter((u) => URLS_CATALOGO.has(u)));
    setVideosTxt(vs.filter((u) => !URLS_CATALOGO.has(u)).join("\n"));
    setPantalla(pinPadres ? "panelPin" : "panelPinCrear");
  };

  const guardarPremio = (sel = videosSel) => {
    const propios = videosTxt.split("\n").map((l) => l.trim()).filter((l) => l && idYoutube(l));
    const videos = [...sel, ...propios.filter((u) => !sel.includes(u))];
    const cfg = { ...premio, meta: Math.min(20, Math.max(1, Number(metaInput) || 5)), maxDia: Math.min(6, Math.max(1, Number(maxInput) || 2)), videos };
    setPremio(cfg);
    guardar("pequemundo:premio", cfg);
  };

  const alternarVideo = (url) => {
    const sel = videosSel.includes(url) ? videosSel.filter((u) => u !== url) : [...videosSel, url];
    setVideosSel(sel);
    guardarPremio(sel);
  };
  const alternarPack = (items) => {
    const urls = items.map((it) => it.url);
    const todos = urls.every((u) => videosSel.includes(u));
    const sel = todos ? videosSel.filter((u) => !urls.includes(u)) : [...new Set([...videosSel, ...urls])];
    setVideosSel(sel);
    guardarPremio(sel);
  };

  if (pantalla === "cargando") {
    return <div className="flex min-h-screen items-center justify-center bg-sky-100 text-2xl font-black text-sky-600">Cargando… 🎈</div>;
  }

  // ---------- elegir perfil (tablet compartida) ----------
  if (pantalla === "elegirPerfil") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sky-100 p-4 sm:p-6">
        <div className="text-center">
          <div className="text-6xl sm:text-7xl">🌈</div>
          <h1 className="mt-2 text-4xl font-black text-sky-700 sm:text-5xl">PequeMundo</h1>
          <p className="mt-2 text-base font-bold text-slate-500 sm:text-lg">¿Quién va a jugar hoy?</p>
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:gap-4">
          {perfiles.map((p) => (
            <button key={p.id} onClick={() => elegir(p)}
              className="flex flex-col items-center gap-1 rounded-3xl bg-white p-5 shadow-lg transition-transform active:scale-95">
              <span className="text-5xl">{p.avatar}</span>
              <span className="text-lg font-black text-slate-700">{p.nombre}</span>
              <span className="text-xs font-bold text-slate-400">{calcularEdad(p.nacimiento)} años {p.pin ? "· 🔒" : ""}</span>
            </button>
          ))}
          <button onClick={() => { setErrorPerfil(null); setPantalla("nuevoPerfil"); }}
            className="flex flex-col items-center justify-center gap-1 rounded-3xl border-4 border-dashed border-sky-300 p-5 text-sky-500 transition-transform active:scale-95">
            <span className="text-4xl">➕</span>
            <span className="font-black">Nuevo peque</span>
          </button>
        </div>
        <button onClick={() => setPantalla("clase")}
          className="rounded-full bg-white px-6 py-2 text-sm font-black text-slate-600 shadow active:scale-95">🏫 Modo clase (para la seño)</button>
        <button onClick={alSelector} className="text-sm font-bold text-slate-400">← Volver al inicio</button>
      </div>
    );
  }

  // ---------- modo clase: elegir etapa ----------
  if (pantalla === "clase") {
    const etapas = [["3-5", 4, "Salita (3 a 5)"], ["6-8", 7, "Primer ciclo (6 a 8)"], ["9-11", 10, "Segundo ciclo (9 a 11)"]];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-sky-100 p-4">
        <span className="text-6xl">🏫</span>
        <h2 className="text-2xl font-black text-slate-700">Modo clase</h2>
        <p className="max-w-sm text-center text-sm font-bold text-slate-500">Para jugar entre todos con proyector o pantalla: la seño elige, los chicos responden a mano alzada ✋. El progreso de la clase se guarda aparte.</p>
        <div className="flex w-full max-w-sm flex-col gap-3">
          {etapas.map(([r, edadRep, nom]) => (
            <button key={r} onClick={() => activar({ id: "clase-" + r, nombre: "Mi clase", avatar: "🏫", nacimiento: isoParaEdad(edadRep), solito: r === "3-5" })}
              className="rounded-3xl bg-white p-5 text-lg font-black text-slate-700 shadow-lg active:scale-95">{nom}</button>
          ))}
        </div>
        <button onClick={() => setPantalla("elegirPerfil")} className="text-sm font-bold text-slate-400">← Volver</button>
      </div>
    );
  }

  // ---------- PIN del niño ----------
  if (pantalla === "pinNino" && pendiente) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-sky-100 p-4">
        <span className="text-6xl">{pendiente.avatar}</span>
        <h2 className="text-2xl font-black text-slate-700">Hola, {pendiente.nombre} 🔒</h2>
        <div className="flex w-full max-w-xs flex-col gap-3 rounded-3xl bg-white p-6 shadow-lg">
          <CampoPin valor={pinIntento} setValor={setPinIntento} placeholder="Tu PIN" />
          {errorPin && <p className="text-center text-sm font-bold text-red-500">{errorPin}</p>}
          <button onClick={() => { if (pinIntento === pendiente.pin) activar(pendiente); else { setErrorPin("Ese PIN no es. ¡Probá de nuevo!"); setPinIntento(""); } }}
            disabled={pinIntento.length !== 4}
            className="rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95 disabled:opacity-40">Entrar</button>
          <button onClick={() => setPantalla("elegirPerfil")} className="text-sm font-bold text-slate-400">← Elegir otro perfil</button>
        </div>
      </div>
    );
  }

  // ---------- crear perfil ----------
  if (pantalla === "nuevoPerfil") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sky-100 p-4 sm:p-6">
        <div className="text-center">
          <div className="text-6xl sm:text-7xl">🌈</div>
          <h1 className="mt-2 text-4xl font-black text-sky-700 sm:text-5xl">PequeMundo</h1>
          <p className="mt-2 text-base font-bold text-slate-500 sm:text-lg">{TOTAL_NIVELES.toLocaleString("es-AR")} niveles que crecen con tu peque</p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg sm:p-6">
          <label className="text-base font-black text-slate-700 sm:text-lg">¿Cómo se llama?</label>
          <input value={nombreInput} onChange={(e) => setNombreInput(e.target.value)} placeholder="Escribí su nombre"
            className="rounded-2xl border-4 border-sky-200 px-4 py-3 text-lg font-bold text-slate-700 outline-none focus:border-sky-400 sm:text-xl" />
          <label className="text-base font-black text-slate-700 sm:text-lg">¿Cuándo nació? 🎂</label>
          <input type="date" value={nacInput} onChange={(e) => setNacInput(e.target.value)}
            className="rounded-2xl border-4 border-sky-200 px-4 py-3 text-lg font-bold text-slate-700 outline-none focus:border-sky-400" />
          <p className="text-xs text-slate-400">Con la fecha de nacimiento los juegos se eligen solos para su edad y se renuevan automáticamente con cada cumpleaños.</p>
          <label className="text-base font-black text-slate-700 sm:text-lg">¿Ya lee sin ayuda?</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setLeeInput("no")}
              className={`flex-1 rounded-2xl px-3 py-3 text-sm font-black active:scale-95 ${leeInput === "no" ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600"}`}>🎧 Todavía no<br /><span className="text-[10px] font-bold opacity-80">la app le lee todo</span></button>
            <button type="button" onClick={() => setLeeInput("si")}
              className={`flex-1 rounded-2xl px-3 py-3 text-sm font-black active:scale-95 ${leeInput === "si" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>📖 Sí, ya lee<br /><span className="text-[10px] font-bold opacity-80">o juega con un adulto</span></button>
          </div>
          <label className="text-base font-black text-slate-700 sm:text-lg">PIN del peque (opcional)</label>
          <CampoPin valor={pinNuevo} setValor={setPinNuevo} placeholder="4 números" />
          <p className="text-xs text-slate-400">Útil en tablets compartidas: cada peque entra a su propio perfil con su PIN y el progreso no se mezcla.</p>
          {errorPerfil && <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">{errorPerfil}</p>}
          <button onClick={crearPerfil} disabled={!nombreInput.trim() || !nacInput}
            className="mt-1 rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg transition-transform active:scale-95 disabled:opacity-40 sm:py-4 sm:text-2xl">
            ¡Empezar a jugar!
          </button>
          <button onClick={() => setPantalla(perfiles.length > 0 ? "elegirPerfil" : "cargando") || (perfiles.length === 0 && alSelector())}
            className="text-sm font-bold text-slate-400">← Volver</button>
        </div>
      </div>
    );
  }

  // ---------- PIN de padres: crear o verificar ----------
  if (pantalla === "panelPinCrear" || pantalla === "panelPin") {
    const crear = pantalla === "panelPinCrear";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-sky-100 p-4">
        <span className="text-6xl">🔐</span>
        <h2 className="text-2xl font-black text-slate-700">{crear ? "Creá el PIN de padres" : "Zona de padres"}</h2>
        <div className="flex w-full max-w-xs flex-col gap-3 rounded-3xl bg-white p-6 shadow-lg">
          {crear ? (
            <>
              <p className="text-sm text-slate-500">Este PIN protege el panel, los perfiles y la configuración del premio para que los peques no lo cambien.</p>
              <CampoPin valor={pinPA} setValor={setPinPA} placeholder="Nuevo PIN" />
              <CampoPin valor={pinPA2} setValor={setPinPA2} placeholder="Repetilo" />
              {errorPin && <p className="text-center text-sm font-bold text-red-500">{errorPin}</p>}
              <button onClick={() => {
                  if (pinPA.length !== 4) { setErrorPin("El PIN debe tener 4 números."); return; }
                  if (pinPA !== pinPA2) { setErrorPin("Los PIN no coinciden."); return; }
                  setPinPadres(pinPA); guardar("pequemundo:pinpadres", pinPA); setPantalla("panel");
                }}
                className="rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95">Guardar y entrar</button>
            </>
          ) : (
            <>
              <CampoPin valor={pinPA} setValor={setPinPA} placeholder="PIN de padres" />
              {errorPin && <p className="text-center text-sm font-bold text-red-500">{errorPin}</p>}
              <button onClick={() => { if (pinPA === pinPadres) { setErrorPin(null); setPantalla("panel"); } else { setErrorPin("PIN incorrecto."); setPinPA(""); } }}
                disabled={pinPA.length !== 4}
                className="rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95 disabled:opacity-40">Entrar</button>
            </>
          )}
          <button onClick={() => setPantalla("menu")} className="text-sm font-bold text-slate-400">← Volver</button>
        </div>
      </div>
    );
  }

  if (!activo) { setPantalla("elegirPerfil"); return null; }

  const edadAnios = calcularEdad(activo.nacimiento);
  const rango = rangoDeEdad(Math.min(Math.max(edadAnios, 3), 11));
  const modoSolito = activo.solito != null ? !!activo.solito : edadAnios <= 5;
  const esClase = String(activo.id).startsWith("clase");
  const alternarLectura = () => {
    const v = !modoSolito;
    const nuevoP = { ...activo, solito: v };
    setActivo(nuevoP);
    const lista = perfiles.map((x) => (x.id === nuevoP.id ? nuevoP : x));
    setPerfiles(lista);
    guardar("pequemundo:perfiles", lista);
    hablar(v ? "Modo Solito activado: yo te leo todo." : "Modo Acompañado: listo para leer.", true);
  };
  const cumple = esCumpleHoy(activo.nacimiento);
  const jugadasHoy = sesiones.filter((s) => esHoy(s.fecha)).length;
  const metaVideo = premio.meta || 5;          // niveles para ganar CADA video
  const maxDia = premio.maxDia || 2;           // videos máximos por día
  const ganados = Math.min(maxDia, Math.floor(jugadasHoy / metaVideo));
  const dispVideos = Math.max(0, ganados - vistosHoy);
  const faltanProx = ganados >= maxDia ? 0 : metaVideo - (jugadasHoy % metaVideo);
  const guiado = premio.guiado !== false;

  // ---------- pantalla de juego ----------
  if (pantalla === "juego" && juegoActivo) {
    const motor = juegoActivo.serie.motor;
    return (
      <div className="min-h-screen bg-sky-100 p-3 sm:p-4">
        <div className="mx-auto flex max-w-lg flex-col gap-4 sm:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => setPantalla("menu")} className="flex items-center gap-1 rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">
              <ArrowLeft /> Volver
            </button>
            <span className="text-base font-black text-slate-700 sm:text-lg">{juegoActivo.serie.icono} {juegoActivo.serie.nombre} · Nivel {juegoActivo.nivel}</span>
          </div>
          {plan && (
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
              🧭 Plan del día: juego {plan.idx + 1} de {plan.lista.length}
              <span className="flex gap-1">{plan.lista.map((_, i) => <span key={i} className={`h-2 w-2 rounded-full ${i <= plan.idx ? "bg-emerald-500" : "bg-emerald-200"}`} />)}</span>
            </div>
          )}
          <div className="rounded-3xl bg-sky-50 p-3 sm:p-4">
            {resultado ? (
              plan ? (
                <ResultadoPlan
                  puntos={resultado.puntos} maximo={resultado.maximo}
                  ultimo={plan.idx + 1 >= plan.lista.length}
                  siguiente={plan.idx + 1 < plan.lista.length ? (() => { const r = buscarSeriePorNivel(plan.lista[plan.idx + 1]); return r ? { icono: r.serie.icono, nombre: `${r.serie.nombre} · Nivel ${r.nivel}` } : null; })() : null}
                  onSeguir={seguirPlan} onSalir={salirPlan}
                />
              ) : (
                <Resultado puntos={resultado.puntos} maximo={resultado.maximo} onRepetir={repetir} onSalir={() => setPantalla("menu")} />
              )
            ) : (
              <div key={claveJuego}>
                {motor === "memoria" && <JuegoMemoria params={juegoActivo.params} edad={rango} alTerminar={terminarJuego} />}
                {motor === "atrapa" && <JuegoAtrapa params={juegoActivo.params} alTerminar={terminarJuego} />}
                {motor === "alcancia" && <JuegoAlcancia params={juegoActivo.params} edad={rango} alTerminar={terminarJuego} />}
                {motor === "pronuncia" && <JuegoPronuncia params={juegoActivo.params} edad={rango} alTerminar={terminarJuego} permitirMic={permisos.mic} />}
                {motor === "trazar" && <JuegoTrazar params={juegoActivo.params} alTerminar={terminarJuego} />}
                {motor !== "memoria" && motor !== "atrapa" && motor !== "alcancia" && motor !== "pronuncia" && motor !== "trazar" && (
                  <JuegoRondas
                    generar={GENERADORES[motor](juegoActivo.params, rango)}
                    colorTexto={juegoActivo.serie.colorTexto}
                    solito={modoSolito}
                    alTerminar={terminarJuego}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- premio: un video por vez, se gana jugando ----------
  if (pantalla === "premio") {
    const habilitados = (premio.videos || []).filter((u) => idYoutube(u));
    return (
      <div className="min-h-screen bg-sky-100 p-3 sm:p-4">
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => { setVideoActivo(null); setPantalla("menu"); }} className="flex items-center gap-1 rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">
              <ArrowLeft /> Volver
            </button>
            <span className="text-lg font-black text-slate-700">🎬 Mis videos</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs font-black">
            <span className="rounded-full bg-white px-3 py-1 text-slate-600 shadow">🏅 Ganados hoy: {ganados}/{maxDia}</span>
            <span className="rounded-full bg-white px-3 py-1 text-slate-600 shadow">👀 Vistos: {vistosHoy}</span>
            <span className="rounded-full bg-white px-3 py-1 text-slate-600 shadow">🎁 Para ver: {dispVideos}</span>
          </div>

          {!permisos.videos ? (
            <div className="rounded-3xl bg-white p-6 text-center shadow-md">
              <p className="text-5xl">🎉</p>
              <p className="mt-2 text-xl font-black text-slate-700">¡Muy bien, {activo.nombre}!</p>
              <p className="mt-1 font-bold text-slate-500">Los videos están desactivados en el consentimiento de tus papás. ¡Igual sos un campeón! 🏆</p>
            </div>
          ) : videoActivo ? (
            <>
              <div className="overflow-hidden rounded-3xl bg-white p-2 shadow-md">
                <p className="px-2 py-1 text-sm font-black text-slate-600">{TITULO_VIDEO[videoActivo] || "Tu video"} <span className="font-bold text-slate-400">· {durTexto(videoActivo)}</span></p>
                <iframe
                  className="aspect-video w-full rounded-2xl"
                  src={`https://www.youtube-nocookie.com/embed/${idYoutube(videoActivo)}?rel=0&modestbranding=1`}
                  title={TITULO_VIDEO[videoActivo] || "Video premio"}
                  allow="accelerometer; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <button onClick={() => setVideoActivo(null)}
                className="rounded-full bg-slate-200 px-6 py-3 font-black text-slate-700 active:scale-95">Terminé de verlo</button>
              <p className="rounded-2xl bg-white p-3 text-center text-xs text-slate-400">Cuando termine, {dispVideos > 0 ? "te queda otro para ver" : faltanProx > 0 && ganados < maxDia ? `jugá ${faltanProx} ${faltanProx === 1 ? "nivel" : "niveles"} más para ganar otro` : "mañana hay más"}. 💛</p>
            </>
          ) : ganados === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-center shadow-md">
              <p className="text-5xl">🔒</p>
              <p className="mt-2 text-xl font-black text-slate-700">Todavía no, {activo.nombre}</p>
              <p className="mt-1 font-bold text-slate-500">Completá {faltanProx} {faltanProx === 1 ? "nivel" : "niveles"} y ganás tu primer video de hoy.</p>
            </div>
          ) : dispVideos > 0 ? (
            habilitados.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 text-center shadow-md">
                <p className="text-5xl">🎉</p>
                <p className="mt-2 text-xl font-black text-slate-700">¡Ganaste un video!</p>
                <p className="mt-1 font-bold text-slate-500">Pedile a tu papá o mamá que elija los videos en el panel de padres.</p>
              </div>
            ) : (
              <>
                <div className="rounded-3xl bg-yellow-100 p-4 text-center">
                  <p className="text-lg font-black text-amber-700">🎉 ¡Te ganaste {dispVideos === 1 ? "un video" : `${dispVideos} videos`}! Elegí UNO para ver ahora:</p>
                </div>
                {habilitados.map((u) => (
                  <div key={u} className="flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-md">
                    <div>
                      <p className="text-sm font-black text-slate-700">{TITULO_VIDEO[u] || u}</p>
                      <p className="text-xs font-bold text-slate-400">⏱️ {durTexto(u)}</p>
                    </div>
                    <button onClick={() => registrarVisto(u)}
                      className="shrink-0 rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white shadow active:scale-95">▶ Ver</button>
                  </div>
                ))}
                <p className="rounded-2xl bg-white p-3 text-center text-xs text-slate-400">Al elegir uno se usa 1 premio. Para ver otro, ¡hay que seguir jugando! 🎮</p>
              </>
            )
          ) : ganados < maxDia ? (
            <div className="rounded-3xl bg-white p-6 text-center shadow-md">
              <p className="text-5xl">🎬</p>
              <p className="mt-2 text-xl font-black text-slate-700">¡Ya viste tu video de hoy!</p>
              <p className="mt-1 font-bold text-slate-500">Jugá {faltanProx} {faltanProx === 1 ? "nivel" : "niveles"} más y ganás otro (hoy podés ver hasta {maxDia}).</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-6 text-center shadow-md">
              <p className="text-5xl">🌟</p>
              <p className="mt-2 text-xl font-black text-slate-700">¡Completaste los {maxDia} videos de hoy!</p>
              <p className="mt-1 font-bold text-slate-500">Mañana hay más. Ahora, ¡a jugar sin pantalla un rato! 🏃💨</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- mis logros ----------
  if (pantalla === "logros") {
    const logros = calcularLogros(sesiones, rango);
    const ganadas = logros.filter((l) => l.ganada).length;
    const diplomas = logros.filter((l) => l.ganada && l.diploma);
    const descargarDiploma = (l) => {
      const f = new Date().toLocaleDateString("es-AR");
      const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Diploma — ${activo.nombre}</title>
<style>body{font-family:Georgia,serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#fef9c3;margin:0}
.d{background:#fff;border:10px double #d97706;border-radius:18px;padding:48px 56px;text-align:center;max-width:640px}
h1{color:#b45309;letter-spacing:2px}h2{font-size:40px;margin:12px 0;color:#1e293b}p{color:#475569}</style></head><body>
<div class="d"><h1>🎓 DIPLOMA · MENTE EN JUEGO</h1><p>Se otorga con orgullo a</p><h2>${activo.nombre}</h2>
<p><b>${l.icono} ${l.nombre}</b> — ${l.diploma}</p><p>⭐ ⭐ ⭐</p><p>${f}</p>
<p style="font-size:12px;color:#94a3b8">Un logro de práctica y constancia. ¡Seguí así!</p></div></body></html>`;
      try {
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `diploma-${activo.nombre.toLowerCase().replace(/\s+/g, "-")}-${l.id}.html`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) { /* sin descarga */ }
    };
    return (
      <div className="min-h-screen bg-sky-100 p-3 pb-10 sm:p-4">
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => setPantalla("menu")} className="flex items-center gap-1 rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">
              <ArrowLeft /> Volver
            </button>
            <span className="text-lg font-black text-slate-700">🏅 Mis logros · {ganadas}/{logros.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {logros.map((l) => (
              <div key={l.id} className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center shadow ${l.ganada ? "bg-yellow-100" : "bg-slate-100 opacity-70"}`}>
                <span className="text-3xl">{l.ganada ? l.icono : "🔒"}</span>
                <span className="text-xs font-black leading-tight text-slate-700">{l.nombre}</span>
                <span className="text-[9px] font-bold leading-tight text-slate-400">{l.desc}</span>
              </div>
            ))}
          </div>
          {diplomas.length > 0 && (
            <div className="rounded-3xl bg-white p-4 shadow-md">
              <p className="font-black text-slate-700">🎓 Diplomas para imprimir y colgar</p>
              {diplomas.map((l) => (
                <button key={l.id} onClick={() => descargarDiploma(l)}
                  className="mt-2 w-full rounded-full bg-amber-500 py-3 font-black text-white shadow active:scale-95">
                  🎓 Descargar diploma «{l.nombre}»
                </button>
              ))}
            </div>
          )}
          <p className="rounded-2xl bg-white p-3 text-center text-xs text-slate-400">Muy pronto: puntos canjeables por premios de verdad (juguetes didácticos y más), con la versión con cuentas.</p>
        </div>
      </div>
    );
  }

  // ---------- guía para padres ----------
  if (pantalla === "guia") {
    return (
      <div className="min-h-screen bg-sky-100 p-3 sm:p-4">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <button onClick={() => setPantalla("panel")} className="flex items-center gap-1 rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">
              <ArrowLeft /> Volver
            </button>
            <span className="text-lg font-black text-slate-700">📖 Guía para enseñar en casa</span>
          </div>
          <GuiaPadres />
        </div>
      </div>
    );
  }

  // ---------- panel de padres (protegido por PIN) ----------
  if (pantalla === "panel") {
    return (
      <div className="min-h-screen bg-sky-100 p-3 sm:p-4">
        <div className="mx-auto flex max-w-md flex-col items-center gap-5 sm:gap-6">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <button onClick={() => setPantalla("menu")} className="flex items-center gap-1 rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">
              <ArrowLeft /> Volver
            </button>
            <span className="text-lg font-black text-slate-700 sm:text-xl">📊 Panel para padres</span>
          </div>

          {(() => {
            const adelantosPanel = areasAdelantadas(sesiones, rango);
            const bandaSigPanel = BANDA_SIG[rango];
            const disponiblesPanel = SERIES.filter((s) => s.edades.includes(rango) || (bandaSigPanel && adelantosPanel[s.area] && s.edades.includes(bandaSigPanel)));
            const areasAdelPanel = Object.keys(AREAS).filter((a) => adelantosPanel[a]);
            const an = analizarProgreso(sesiones, disponiblesPanel, rango, edadAnios);
            return (
              <div className="w-full rounded-3xl bg-white p-5 shadow-md sm:p-6">
                <h3 className="text-lg font-black text-slate-800 sm:text-xl">🤖 Lectura del progreso</h3>
                <p className="mt-1 text-xs text-slate-400">Generada automáticamente comparando a {activo.nombre} con su propio historial.</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">🔥 Racha: {an.racha} {an.racha === 1 ? "día" : "días"}</span>
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">⚡ {an.ritmo} niveles/día</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">🗺️ {an.cubiertos}/{an.total.toLocaleString("es-AR")} niveles</span>
                  {areasAdelPanel.length > 0 && (
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">🚀 Adelantado en {areasAdelPanel.map((a) => AREAS[a].nombre).join(", ")}</span>
                  )}
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {an.frases.map((fr, i) => (
                    <p key={i} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">• {fr}</p>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => descargarInforme(disponiblesPanel)}
                    className="rounded-full bg-sky-500 px-5 py-2 font-black text-white shadow active:scale-95">📄 Descargar informe</button>
                  <button onClick={() => setPantalla("guia")}
                    className="rounded-full bg-violet-500 px-5 py-2 font-black text-white shadow active:scale-95">📖 Guía para enseñar</button>
                  {alRevisar && (
                    <button onClick={alRevisar}
                      className="rounded-full bg-slate-500 px-5 py-2 font-black text-white shadow active:scale-95">🔏 Privacidad y consentimiento</button>
                  )}
                </div>
                {an.refuerzos.length > 0 && (
                  <div className="mt-3 rounded-2xl border-4 border-sky-200 bg-sky-50 p-4">
                    <p className="font-black text-sky-700">🔎 Ajuste automático de dificultad activado</p>
                    <p className="mt-2 text-sm text-slate-600">
                      En <b>{an.refuerzos.map((a) => AREAS[a].nombre).join(", ")}</b> los últimos niveles le costaron a {activo.nombre},
                      así que la app <b>bajó sola la dificultad</b>: va a proponerle niveles más fáciles hasta encontrar el punto
                      donde se sienta seguro, y desde ahí volver a subir de a poquito. Para {activo.nombre} esto es invisible —
                      solo nota que "le sale" — y para ustedes es información: si en casa también notan que algo cuesta,
                      es un buen tema para el pediatra.
                    </p>
                  </div>
                )}
                {an.alertas.length > 0 && (
                  <div className="mt-3 rounded-2xl border-4 border-rose-200 bg-rose-50 p-4">
                    <p className="font-black text-rose-700">👀 Para conversar en el próximo control pediátrico</p>
                    {an.alertas.map((al, i) => <p key={i} className="mt-2 text-sm text-slate-600">• {al}</p>)}
                    <p className="mt-3 text-xs font-bold text-slate-500">
                      Importante: esto <b>NO es un diagnóstico</b> ni una detección de retraso madurativo — ninguna app puede
                      hacer eso. Las evaluaciones del desarrollo las realiza el pediatra con controles y herramientas validadas.
                      Esta es solo una observación del juego (que también puede deberse a desinterés, cansancio o simplemente
                      su ritmo) para que la conversen en el próximo control, junto con lo que ustedes ven en casa.
                    </p>
                  </div>
                )}
                <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-slate-500">
                  Esta lectura compara a su hijo <b>consigo mismo</b>. A propósito no calcula «edad mental» ni promete notas futuras:
                  eso requeriría evaluaciones profesionales estandarizadas y ninguna app puede predecir el futuro de un niño con seriedad.
                  Preferimos decirle la verdad: la práctica constante ejercita habilidades valiosas, y eso ya es mucho.
                </p>
              </div>
            );
          })()}

          <div className="w-full rounded-3xl bg-white p-5 shadow-md sm:p-6">
            <h3 className="text-lg font-black text-slate-800 sm:text-xl">🔔 Modelos de notificaciones (vista de prueba)</h3>
            <p className="mt-1 text-xs text-slate-400">Así se ven los tres tipos de aviso que el sistema genera automáticamente cuando corresponde. Tocá para previsualizar cada uno.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setDemoNoti(demoNoti === "adelantado" ? null : "adelantado")}
                className={`rounded-full px-4 py-2 text-sm font-black active:scale-95 ${demoNoti === "adelantado" ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-700"}`}>🚀 Va adelantado</button>
              <button onClick={() => setDemoNoti(demoNoti === "convivir" ? null : "convivir")}
                className={`rounded-full px-4 py-2 text-sm font-black active:scale-95 ${demoNoti === "convivir" ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-700"}`}>💛 Reforzar cercanía</button>
              <button onClick={() => setDemoNoti(demoNoti === "refuerzo" ? null : "refuerzo")}
                className={`rounded-full px-4 py-2 text-sm font-black active:scale-95 ${demoNoti === "refuerzo" ? "bg-sky-500 text-white" : "bg-sky-100 text-sky-700"}`}>🔎 Bajamos la dificultad</button>
              <button onClick={() => { setDemoNoti(demoNoti === "brisa" ? null : "brisa"); setDemoBrisa(null); }}
                className={`rounded-full px-4 py-2 text-sm font-black active:scale-95 ${demoNoti === "brisa" ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-700"}`}>🏫 Solicitud de la seño</button>
            </div>
            {demoNoti === "adelantado" && (
              <div className="mt-3 rounded-2xl border-4 border-indigo-200 bg-indigo-50 p-4">
                <p className="font-black text-indigo-700">🚀 ¡{activo.nombre} va adelantado!</p>
                <p className="mt-2 text-sm text-slate-600">
                  Con {edadAnios} años, dominó su etapa en <b>Pensar</b> y está superando niveles de la etapa <b>6-8</b> —
                  contenido pensado para chicos más grandes — con un 88% de acierto. La app ya le abrió esos desafíos.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  <b>¿Puede beneficiarlo a futuro?</b> Las habilidades que está ejercitando (memoria de trabajo, autocontrol,
                  razonamiento) están asociadas en estudios poblacionales de largo plazo — como el estudio de Dunedin — con
                  mejores resultados académicos, financieros y de salud en la adultez. Son <b>tendencias generales de la
                  investigación, no una promesa sobre {activo.nombre}</b>: nadie puede predecir el futuro de un niño. Lo que sí
                  está en sus manos hoy: alimentarle la curiosidad, celebrar el esfuerzo y acompañarlo en desafíos a su medida.
                </p>
              </div>
            )}
            {demoNoti === "convivir" && (
              <div className="mt-3 rounded-2xl border-4 border-rose-200 bg-rose-50 p-4">
                <p className="font-black text-rose-700">💛 Una oportunidad para reforzar la cercanía</p>
                <p className="mt-2 text-sm text-slate-600">
                  En el área <b>Convivir</b> (modales, normas de la casa, palabras mágicas), a {activo.nombre} le están costando
                  las últimas partidas. Esto <b>no dice nada malo de {activo.nombre}</b>: las normas se aprenden sobre todo en el
                  vínculo, no en una pantalla.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  <b>Qué puede ayudar en casa:</b> jugar juntos estos niveles y conversar cada situación ("¿y vos qué harías?"),
                  anticipar las normas con calma antes de que pasen las cosas, usar ustedes mismos las palabras mágicas (los chicos
                  imitan mucho más de lo que obedecen) y celebrar cada vez que colabora. Diez minutos de juego compartido valen más
                  que cualquier repetición. Si además en casa o en el jardín notan dificultades sostenidas con las normas,
                  es un buen tema para conversar con el pediatra — sin alarma: cada niño tiene su ritmo.
                </p>
              </div>
            )}
            {demoNoti === "refuerzo" && (
              <div className="mt-3 rounded-2xl border-4 border-sky-200 bg-sky-50 p-4">
                <p className="font-black text-sky-700">🔎 Bajamos la dificultad para encontrar su punto justo</p>
                <p className="mt-2 text-sm text-slate-600">
                  Para la edad de {activo.nombre} ({edadAnios} años), los niveles que le tocaban le están costando más de lo
                  esperado. El sistema activó el <b>modo de refuerzo</b>: automáticamente le va a proponer niveles más fáciles
                  hasta encontrar el punto donde responde con seguridad, y desde ahí volverá a subir la dificultad de a poco,
                  a su ritmo. {activo.nombre} no ve nada de esto — solo siente que "le sale", que es exactamente lo que necesita
                  para no frustrarse.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  <b>Qué significa y qué no:</b> puede ser cansancio, desinterés o simplemente su ritmo — <b>no es un diagnóstico</b>
                  ni una detección de retraso: eso solo lo evalúa el pediatra con herramientas validadas. Les avisaremos cuando
                  retome el ritmo. Si en casa observan algo que les preocupe, llévenlo a la próxima consulta junto con el informe
                  descargable de la app.
                </p>
              </div>
            )}
            {demoNoti === "brisa" && (
              <div className="mt-3 rounded-2xl border-4 border-amber-200 bg-amber-50 p-4">
                <p className="font-black text-amber-700">🏫 Solicitud de grupo escolar</p>
                <p className="mt-2 text-sm text-slate-600">
                  La <b>seño Brisa</b> quiere sumar a <b>{activo.nombre}</b> a su grupo <b>«Sala Amarilla 2026»</b> para
                  enviarle tareas y actividades para hacer en clase y en casa.
                </p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setDemoBrisa("ok")} className="rounded-full bg-emerald-500 px-5 py-2 font-black text-white active:scale-95">Autorizar ✅</button>
                  <button onClick={() => setDemoBrisa("no")} className="rounded-full bg-slate-200 px-5 py-2 font-black text-slate-600 active:scale-95">Rechazar</button>
                </div>
                {demoBrisa && (
                  <p className="mt-2 text-sm font-black text-slate-600">{demoBrisa === "ok" ? "✔️ ¡Así de simple va a ser autorizar!" : "✔️ Y así de simple rechazar."} Los grupos escolares llegan con la versión con cuentas (requiere servidor).</p>
                )}
                <p className="mt-3 rounded-xl bg-white p-3 text-xs text-slate-500">
                  <b>Cómo va a funcionar, con la privacidad primero:</b> la seño genera un <b>código de aula</b> y son USTEDES
                  quienes lo cargan acá para sumar a su hijo. La app nunca va a permitir que un docente busque niños por DNI
                  o teléfono: los datos de los chicos no se exponen a búsquedas, y sin la autorización expresa de ustedes no
                  pasa absolutamente nada.
                </p>
              </div>
            )}
          </div>

          <PanelPadres sesiones={sesiones} perfil={activo} edadAnios={edadAnios} />

          <div className="w-full rounded-3xl bg-white p-5 shadow-md sm:p-6">
            <h3 className="text-lg font-black text-slate-800 sm:text-xl">🎁 Premio diario</h3>
            <p className="mt-1 text-sm text-slate-500">Cuando {activo.nombre} completa el objetivo del día, se le habilitan únicamente los videos de YouTube que ustedes elijan acá (uno por línea).</p>
            <div className="mt-3 flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-black text-slate-600">Niveles para ganar CADA video</label>
                <input type="number" min={1} max={20} value={metaInput} onChange={(e) => setMetaInput(e.target.value)}
                  className="mt-1 w-24 rounded-2xl border-4 border-sky-200 px-3 py-2 text-lg font-black text-slate-700 outline-none focus:border-sky-400" />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-600">Videos máximos por día</label>
                <input type="number" min={1} max={6} value={maxInput} onChange={(e) => setMaxInput(e.target.value)}
                  className="mt-1 w-24 rounded-2xl border-4 border-sky-200 px-3 py-2 text-lg font-black text-slate-700 outline-none focus:border-sky-400" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">Así funciona: cada {"{"}niveles{"}"} jugados ganan 1 video, ven UNO por vez, y para el siguiente hay que volver a jugar. Cada video muestra su duración para que decidan con información.</p>
            <label className="mt-4 block text-sm font-black text-slate-600">Packs sugeridos — tocá para habilitar ✅</label>
            <p className="text-xs text-slate-400">Videos de canales infantiles conocidos, ya cargados. Solo se le muestran al peque los que ustedes activen.</p>
            <div className="mt-2 flex flex-col gap-3">
              {CATALOGO_VIDEOS.map((c, i) => {
                const todosActivos = c.items.every((it) => videosSel.includes(it.url));
                return (
                  <div key={i} className="rounded-2xl bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-slate-700">{c.cat} <span className="font-bold text-slate-400">· {c.edades}</span></p>
                      <button onClick={() => alternarPack(c.items)}
                        className={`rounded-full px-3 py-1 text-xs font-black active:scale-95 ${todosActivos ? "bg-emerald-500 text-white" : "bg-white text-slate-600 shadow"}`}>
                        {todosActivos ? "Pack activado ✓" : "Activar todo el pack"}
                      </button>
                    </div>
                    <div className="mt-2 flex flex-col gap-1">
                      {c.items.map((it) => {
                        const on = videosSel.includes(it.url);
                        return (
                          <button key={it.url} onClick={() => alternarVideo(it.url)}
                            className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold active:scale-[0.98] ${on ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-600 shadow-sm"}`}>
                            <span>{it.t} <span className="opacity-60">· ⏱️ {it.dur ? `${it.dur} min` : "s/d"}</span></span>
                            <span className="shrink-0">{on ? "✅" : "＋"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <label className="mt-4 block text-sm font-black text-slate-600">Agregar otros videos (links de YouTube, uno por línea)</label>
            <textarea value={videosTxt} onChange={(e) => setVideosTxt(e.target.value)} rows={3}
              placeholder={"https://www.youtube.com/watch?v=...\nhttps://youtu.be/..."}
              className="mt-1 w-full rounded-2xl border-4 border-sky-200 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-400" />
            <button onClick={() => guardarPremio()}
              className="mt-3 rounded-full bg-emerald-500 px-6 py-2 font-black text-white shadow active:scale-95">Guardar premio</button>
            <p className="mt-2 text-xs text-slate-400">Activados ahora: {videosSel.length + videosTxt.split("\n").filter((l) => idYoutube(l.trim())).length} videos. Los links del catálogo fueron verificados al armar la app, pero YouTube puede eliminarlos con el tiempo: si alguno no carga, desactivalo. La responsabilidad final sobre el contenido es siempre de ustedes.</p>
            <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-slate-500">
              💡 Sugerencia: premios cortos (1 o 2 videos) y elegidos por ustedes. La pantalla como recompensa funciona mejor con límites claros, y este premio solo muestra lo que ustedes aprobaron: no abre YouTube libre.
            </p>
          </div>

          <div className="w-full rounded-3xl bg-white p-5 shadow-md sm:p-6">
            <h3 className="text-lg font-black text-slate-800 sm:text-xl">🧭 Cómo elige los juegos</h3>
            <button onClick={() => { const cfg = { ...premio, guiado: !(premio.guiado !== false) }; setPremio(cfg); guardar("pequemundo:premio", cfg); }}
              className={`mt-3 flex w-full items-center justify-between rounded-2xl p-4 text-left font-black active:scale-[0.99] ${premio.guiado !== false ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
              <span>{premio.guiado !== false ? "✨ Modo guiado (recomendado)" : "🗺️ Modo explorar"}</span>
              <span className="text-xs">{premio.guiado !== false ? "Activado ✅ · tocá para cambiar" : "Tocá para volver al guiado"}</span>
            </button>
            <p className="mt-2 text-xs text-slate-400">
              En modo guiado, el sistema elige los niveles justos para la edad y el progreso de cada peque (menos abrumador y mejor dosificado).
              En modo explorar se muestra el catálogo completo de series para que naveguen libremente.
            </p>
          </div>

          <div className="w-full rounded-3xl bg-white p-5 shadow-md sm:p-6">
            <h3 className="text-lg font-black text-slate-800 sm:text-xl">👨‍👩‍👧‍👦 Peques del dispositivo</h3>
            <div className="mt-3 flex flex-col gap-2">
              {perfiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2">
                  <span className="font-bold text-slate-700">{p.avatar} {p.nombre} · {calcularEdad(p.nacimiento)} años {p.pin ? "· 🔒 con PIN" : ""}</span>
                  <span className="flex items-center gap-1">
                    <button onClick={() => setPinEdit(pinEdit && pinEdit.id === p.id ? null : { id: p.id, val: "" })}
                      className="rounded-full bg-sky-100 px-3 py-1 text-sm font-black text-sky-700">🔑 PIN</button>
                    {borrando === p.id ? (
                      <button onClick={() => borrarPerfil(p.id)} className="rounded-full bg-red-500 px-3 py-1 text-sm font-black text-white">¿Seguro?</button>
                    ) : (
                      <button onClick={() => setBorrando(p.id)} className="rounded-full bg-slate-200 px-3 py-1 text-sm font-black text-slate-600">Borrar</button>
                    )}
                  </span>
                </div>
              ))}
              {pinEdit && (
                <div className="flex items-center gap-2 rounded-2xl bg-sky-50 p-3">
                  <CampoPin valor={pinEdit.val} setValor={(v) => setPinEdit({ ...pinEdit, val: v })} placeholder="Nuevo PIN" />
                  <button onClick={() => {
                      const lista = perfiles.map((x) => (x.id === pinEdit.id ? { ...x, pin: pinEdit.val.length === 4 ? pinEdit.val : null } : x));
                      setPerfiles(lista);
                      guardar("pequemundo:perfiles", lista);
                      if (activo && activo.id === pinEdit.id) setActivo({ ...activo, pin: pinEdit.val.length === 4 ? pinEdit.val : null });
                      setPinEdit(null);
                    }}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-black text-white active:scale-95">Guardar</button>
                </div>
              )}
              <p className="text-xs text-slate-400">💡 Con «🔑 PIN» pueden ponerle o cambiarle la clave a cada peque (o dejarla vacía para quitarla): útil si la olvidó y quiere seguir su racha 🔥.</p>
            </div>
            <button onClick={() => { setErrorPerfil(null); setPantalla("nuevoPerfil"); }}
              className="mt-3 rounded-full bg-sky-500 px-6 py-2 font-black text-white shadow active:scale-95">➕ Agregar peque</button>
            <p className="mt-3 text-xs text-slate-400">
              Los perfiles y PIN viven solo en este dispositivo (no son cuentas en internet). Sirven para ordenar el progreso en tablets compartidas, no como seguridad fuerte. Las cuentas reales con contraseña llegan con la versión con servidor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- pantalla de una serie: mapa de niveles ----------
  if (pantalla === "serie" && serieAbierta) {
    const s = serieAbierta;
    const mejor = mejorPorNivel();
    const estrellasDe = (r) => (r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1);
    const inicio = nivelInicial(s, rango);
    const quedanIncompletos = [...Array(s.niveles)].some((_, i) => mejor[idNivel(s, i + 1)] == null);
    const siguiente = quedanIncompletos ? proximoNivel(s, mejor, rango, sesiones) : null;
    const completados = Object.keys(mejor).filter((id) => id.startsWith(s.id + "-n")).length;
    return (
      <div className="min-h-screen bg-sky-100 p-3 pb-10 sm:p-4">
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => setPantalla("menu")} className="flex items-center gap-1 rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">
              <ArrowLeft /> Volver
            </button>
            <span className="text-base font-black text-slate-700 sm:text-lg">{s.icono} {s.nombre}</span>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-md">
            <p className="text-sm font-bold text-slate-500">{completados} de {s.niveles} niveles superados. La dificultad sube de a poco y cada nivel es único. Con ⭐⭐⭐ ¡salteás un nivel! 🚀{inicio > 1 ? ` Por tu edad arrancás en el nivel ${inicio}: los celestes de antes son de la etapa más chica y quedan abiertos para repasar.` : ""}</p>
            {siguiente && (
              <button onClick={() => abrirNivel(s, siguiente)}
                className="mt-3 w-full rounded-full bg-emerald-500 py-3 text-lg font-black text-white shadow-md active:scale-95">
                ▶ Jugar nivel {siguiente}
              </button>
            )}
            <button onClick={() => abrirInfinito(s)}
              className="mt-2 w-full rounded-full bg-violet-500 py-3 font-black text-white shadow-md active:scale-95">
              ∞ Práctica libre (dificultad máxima, siempre distinta)
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(s.niveles)].map((_, i) => {
              const k = i + 1;
              const r = mejor[idNivel(s, k)];
              const desb = nivelDesbloqueado(s, k, mejor, rango);
              const previa = desb && r == null && k < inicio;
              return (
                <button key={k} disabled={!desb} onClick={() => abrirNivel(s, k)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-black shadow transition-transform active:scale-90 ${
                    r != null ? "bg-emerald-400 text-white"
                    : k === siguiente ? "bg-white text-slate-700 ring-4 ring-emerald-300"
                    : previa ? "bg-sky-50 text-slate-300"
                    : desb ? "bg-white text-slate-700"
                    : "bg-slate-200 text-slate-400"
                  }`}>
                  <span>{desb ? k : "🔒"}</span>
                  {r != null && <span className="text-[9px] leading-none">{"⭐".repeat(estrellasDe(r))}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------- menú principal ----------
  const adelantos = areasAdelantadas(sesiones, rango);
  const bandaSig = BANDA_SIG[rango];
  const disponibles = SERIES.filter((s) => s.edades.includes(rango) || (bandaSig && adelantos[s.area] && s.edades.includes(bandaSig)));
  const esAdelantada = (s) => !s.edades.includes(rango);
  const areasAdel = Object.keys(AREAS).filter((a) => adelantos[a]);
  const nivelesEtapa = disponibles.reduce((a, s) => a + s.niveles, 0);
  const mejorMenu = mejorPorNivel();
  const completadosDe = (s) => Object.keys(mejorMenu).filter((id) => id.startsWith(s.id + "-n")).length;
  return (
    <div className="min-h-screen bg-sky-100 p-3 pb-10 sm:p-4">
      <div className="mx-auto flex max-w-lg flex-col gap-5 sm:gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div>
            <h1 className="text-2xl font-black text-sky-700 sm:text-3xl">{activo.avatar} ¡Hola, {activo.nombre}!</h1>
            <p className="font-bold text-slate-500">{edadAnios} años · {nivelesEtapa.toLocaleString("es-AR")} niveles para tu edad</p>
          </div>
          <div className="flex gap-2">
            <button onClick={abrirPanel}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">
              <BarChart3 /> Padres
            </button>
            <button onClick={() => setPantalla("logros")} aria-label="Mis logros"
              className="rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">🏅</button>
            <button onClick={alternarLectura} aria-label={modoSolito ? "Pasar a modo Acompañado" : "Pasar a modo Solito"}
              className={`rounded-full px-4 py-2 font-black shadow active:scale-95 ${modoSolito ? "bg-sky-500 text-white" : "bg-white text-slate-600"}`}>{modoSolito ? "🎧" : "📖"}</button>
            <button onClick={alternarSonido} aria-label={sonidoOn ? "Silenciar" : "Activar sonido"}
              className="rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">{sonidoOn ? "🔊" : "🔇"}</button>
            <button onClick={() => setPantalla("elegirPerfil")} aria-label="Cambiar de peque"
              className="rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">👤</button>
          </div>
        </header>

        {cumple && (
          <div className="rounded-3xl bg-yellow-100 p-4 text-center">
            <p className="text-2xl font-black text-amber-700">🎂 ¡FELIZ CUMPLEAÑOS, {activo.nombre.toUpperCase()}! 🎉</p>
            <p className="font-bold text-amber-600">Hoy cumplís {edadAnios}. ¡Tus juegos crecen con vos!</p>
          </div>
        )}

        {areasAdel.length > 0 && (
          <div className="rounded-3xl bg-indigo-100 p-4">
            <p className="text-lg font-black text-indigo-700">🚀 ¡Nivel adelantado desbloqueado!</p>
            <p className="text-sm font-bold text-indigo-600">Dominaste tu etapa en {areasAdel.map((a) => AREAS[a].nombre).join(", ")} y se abrieron desafíos de chicos más grandes. ¡A por ellos!</p>
          </div>
        )}

        <button onClick={() => iniciarPlan(disponibles, Math.min(Math.max(metaVideo, 3), 8))}
          className="rounded-3xl bg-emerald-500 p-4 text-left shadow-md transition-transform active:scale-95">
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-white">🧭 Mi plan de hoy</span>
            <span className="rounded-full bg-white/25 px-3 py-1 text-sm font-black text-white">{Math.min(Math.max(metaVideo, 3), 8)} niveles</span>
          </div>
          <p className="mt-1 text-sm font-bold text-emerald-50">La app elige niveles de todas las áreas y va pasando sola al siguiente. ¡Tocá y empezá!</p>
        </button>

        <button onClick={() => setPantalla("premio")}
          className={`rounded-3xl p-4 text-left shadow-md transition-transform active:scale-95 ${dispVideos > 0 ? "bg-yellow-200" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-slate-700">
              {dispVideos > 0 ? `🎁 ¡Tenés ${dispVideos === 1 ? "un video" : `${dispVideos} videos`} para ver!`
                : ganados >= maxDia ? "🎬 Videos de hoy completos"
                : "🎯 Próximo video"}
            </span>
            <span className="font-black text-slate-500">🏅 {ganados}/{maxDia}</span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${dispVideos > 0 ? "bg-yellow-500" : "bg-sky-400"}`}
              style={{ width: `${dispVideos > 0 || ganados >= maxDia ? 100 : ((jugadasHoy % metaVideo) / metaVideo) * 100}%` }} />
          </div>
          <p className="mt-1 text-xs font-bold text-slate-400">
            {dispVideos > 0 ? "Tocá para elegir cuál ver" : ganados >= maxDia ? "Mañana se renuevan 🌅" : `Te ${faltanProx === 1 ? "falta 1 nivel" : `faltan ${faltanProx} niveles`} para ganar un video 🎬`}
          </p>
        </button>

        {esClase && (
          <div className="rounded-3xl bg-rose-100 p-4">
            <p className="font-black text-rose-700">🏫 Modo clase</p>
            <p className="text-sm font-bold text-rose-600">Elijan una serie, proyecten y respondan entre todos a mano alzada ✋. ¡Que pase el que sigue!</p>
          </div>
        )}

        {guiado && !esClase ? (
          <section className="rounded-3xl bg-white p-4 shadow-md sm:p-5">
            <h2 className="mb-1 text-xl font-black text-slate-700 sm:text-2xl">✨ Elegidos hoy para vos</h2>
            <p className="mb-3 text-xs font-bold text-slate-400">La app eligió estos niveles según tu edad y tu progreso. ¡Cada día cambian!</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {Object.keys(AREAS).flatMap((clave) => {
                const cand = disponibles.filter((s) => s.area === clave).sort((a, b) => progresoSerie(a, mejorMenu) - progresoSerie(b, mejorMenu)).slice(0, 2);
                return cand.map((s) => {
                  const k = proximoNivel(s, mejorMenu, rango, sesiones);
                  return (
                    <button key={s.id} onClick={() => abrirNivel(s, k)}
                      className={`flex flex-col gap-1 rounded-2xl ${AREAS[clave].suave} p-3 text-left shadow-sm transition-transform active:scale-95`}>
                      <span className="flex items-center gap-2">
                        <span className="shrink-0 text-2xl">{s.icono}</span>
                        <span className="text-sm font-black leading-tight text-slate-700">{s.nombre}</span>
                      </span>
                      <span className={`text-[10px] font-black ${AREAS[clave].texto}`}>{AREAS[clave].icono} {AREAS[clave].nombre} · Nivel {k}{esAdelantada(s) ? " · 🚀 adelantado" : ""}</span>
                    </button>
                  );
                });
              })}
            </div>
          </section>
        ) : (
          Object.keys(AREAS).map((clave) => {
            const seriesArea = disponibles.filter((s) => s.area === clave);
            if (seriesArea.length === 0) return null;
            const a = AREAS[clave];
            const nivelesArea = seriesArea.reduce((x, s) => x + s.niveles, 0);
            return (
              <section key={clave} className={`rounded-3xl ${a.suave} p-4 sm:p-5`}>
                <h2 className={`mb-3 text-xl font-black sm:text-2xl ${a.texto}`}>{a.icono} {a.nombre} <span className="text-sm font-bold opacity-60">· {seriesArea.length} series · {nivelesArea.toLocaleString("es-AR")} niveles</span></h2>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {seriesArea.map((s) => {
                    const c = completadosDe(s);
                    return (
                      <button key={s.id} onClick={() => { setSerieAbierta(s); setPantalla("serie"); }}
                        className="flex flex-col gap-1 rounded-2xl bg-white p-3 text-left shadow-md transition-transform active:scale-95">
                        <span className="flex items-center gap-2">
                          <span className="shrink-0 text-2xl sm:text-3xl">{s.icono}</span>
                          <span className="text-sm font-black leading-tight text-slate-700 sm:text-base">{s.nombre}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{c}/{s.niveles} niveles{esAdelantada(s) ? " · 🚀 adelantado" : ""}</span>
                        <span className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <span className={`block h-full rounded-full ${a.color}`} style={{ width: `${(c / s.niveles) * 100}%` }} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================
// =================  MÓDULO ADULTOS (MenteActiva)  ============
// ============================================================

const DOMINIOS = {
  memoria: { nombre: "Memoria", icono: "🧩", desc: "Recordar pares de figuras" },
  atencion: { nombre: "Atención", icono: "🔎", desc: "Encontrar figuras entre distractores" },
  calculo: { nombre: "Cálculo", icono: "🔢", desc: "Cuentas a su propio ritmo" },
  lenguaje: { nombre: "Lenguaje", icono: "🗣️", desc: "Nombrar objetos cotidianos" },
};

function tema(cfg) {
  if (cfg.contraste) {
    return {
      fondo: "bg-slate-950", tarjeta: "bg-slate-900 border-2 border-yellow-300",
      texto: "text-yellow-50", sub: "text-yellow-200",
      boton: "bg-yellow-300 text-slate-950", botonSec: "bg-slate-800 text-yellow-200 border-2 border-yellow-300",
      opcion: "bg-slate-800 text-yellow-100 border-2 border-yellow-300",
      bien: "bg-green-400 text-slate-950", mal: "bg-red-400 text-slate-950",
    };
  }
  return {
    fondo: "bg-stone-100", tarjeta: "bg-white",
    texto: "text-slate-800", sub: "text-slate-500",
    boton: "bg-teal-600 text-white", botonSec: "bg-white text-slate-700 shadow",
    opcion: "bg-white text-slate-800 shadow-md",
    bien: "bg-green-300 text-green-900", mal: "bg-red-200 text-red-800",
  };
}
function claseLetra(cfg, base, grande) { return cfg.letra === "grande" ? grande : base; }

function EjMemoriaAdulto({ nivel, cfg, alTerminar }) {
  const t = tema(cfg);
  const pares = Math.min(2 + nivel, 6);
  const crear = useCallback(() => {
    const elegidas = mezclar(PACK_TODO).slice(0, pares);
    return mezclar([...elegidas, ...elegidas].map((f, i) => ({ id: i, figura: f, vista: false, lista: false })));
  }, [pares]);

  const [cartas, setCartas] = useState(crear);
  const [seleccion, setSeleccion] = useState([]);
  const [intentos, setIntentos] = useState(0);
  const [fin, setFin] = useState(false);
  const bloqueo = useRef(false);

  useEffect(() => { hablar("Encuentre las parejas de figuras iguales, sin apuro.", cfg.audio); }, []); // eslint-disable-line

  const tocar = (idx) => {
    if (bloqueo.current || cartas[idx].vista || cartas[idx].lista) return;
    const nuevas = cartas.map((c, i) => (i === idx ? { ...c, vista: true } : c));
    const sel = [...seleccion, idx];
    setCartas(nuevas);
    setSeleccion(sel);
    if (sel.length === 2) {
      bloqueo.current = true;
      setIntentos((v) => v + 1);
      const [a, b] = sel;
      setTimeout(() => {
        setCartas((prev) => {
          const acierto = prev[a].figura === prev[b].figura;
          if (acierto) hablar("Muy bien.", cfg.audio);
          const res = prev.map((c, i) =>
            i === a || i === b ? { ...c, vista: acierto, lista: acierto ? true : c.lista } : c
          );
          if (res.every((c) => c.lista)) setFin(true);
          return res;
        });
        setSeleccion([]);
        bloqueo.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    if (fin) {
      const maximo = pares * 10;
      const puntos = Math.max(Math.round((pares / Math.max(intentos, pares)) * maximo), Math.round(maximo * 0.3));
      alTerminar(puntos, maximo);
    }
  }, [fin]); // eslint-disable-line

  return (
    <div className="flex flex-col items-center gap-6">
      <p className={`text-center font-bold ${t.texto} ${claseLetra(cfg, "text-xl", "text-2xl")}`}>
        Encuentre las parejas iguales. Sin apuro. 🧩
      </p>
      <div className={`grid w-full max-w-sm gap-3 ${pares <= 3 ? "grid-cols-3" : "grid-cols-4"}`}>
        {cartas.map((c, i) => (
          <button key={c.id} onClick={() => tocar(i)}
            className={`flex aspect-square w-full items-center justify-center rounded-2xl p-2 transition-transform active:scale-95 ${
              c.vista || c.lista ? "bg-white" : cfg.contraste ? "bg-yellow-300" : "bg-teal-500"
            }`}>
            {c.vista || c.lista
              ? <Figura id={c.figura} edad="6-8" className="h-full w-full" />
              : <span className="text-4xl">❓</span>}
          </button>
        ))}
      </div>
      <p className={`font-bold ${t.sub} ${claseLetra(cfg, "text-lg", "text-xl")}`}>Intentos: {intentos}</p>
    </div>
  );
}

function EjAtencionAdulto({ nivel, cfg, alTerminar }) {
  const t = tema(cfg);
  const totalCeldas = 6 + nivel * 2;
  const objetivo = "⭐";
  const distractores = ["🌙", "☀️", "☁️", "🌈"].slice(0, 1 + Math.min(nivel, 3));
  const cuantos = 3 + Math.floor(nivel / 2);

  const [estado, setEstado] = useState(() => {
    const arr = [];
    for (let i = 0; i < cuantos; i++) arr.push({ s: objetivo, hallada: false });
    for (let i = cuantos; i < totalCeldas; i++) arr.push({ s: distractores[azar(distractores.length)], hallada: false });
    return mezclar(arr).map((c, i) => ({ ...c, id: i }));
  });
  const [errores, setErrores] = useState(0);

  useEffect(() => { hablar(`Toque todas las estrellas. Hay ${cuantos}.`, cfg.audio); }, []); // eslint-disable-line

  const tocar = (id) => {
    const c = estado.find((x) => x.id === id);
    if (!c || c.hallada) return;
    if (c.s === objetivo) {
      const nuevo = estado.map((x) => (x.id === id ? { ...x, hallada: true } : x));
      setEstado(nuevo);
      const restan = nuevo.filter((x) => x.s === objetivo && !x.hallada).length;
      if (restan === 0) {
        hablar("Excelente, encontró todas.", cfg.audio);
        const maximo = cuantos * 10;
        alTerminar(Math.max(maximo - errores * 3, Math.round(maximo * 0.3)), maximo);
      }
    } else {
      setErrores((e) => e + 1);
    }
  };

  const restantes = estado.filter((x) => x.s === objetivo && !x.hallada).length;

  return (
    <div className="flex flex-col items-center gap-6">
      <p className={`text-center font-bold ${t.texto} ${claseLetra(cfg, "text-xl", "text-2xl")}`}>
        Toque todas las {objetivo}. Faltan {restantes}.
      </p>
      <div className="grid w-full max-w-sm grid-cols-4 gap-3">
        {estado.map((c) => (
          <button key={c.id} onClick={() => tocar(c.id)}
            className={`flex aspect-square items-center justify-center rounded-2xl text-4xl transition-transform active:scale-90 ${
              c.hallada ? t.bien : t.opcion
            }`}>
            {c.hallada ? "✔️" : c.s}
          </button>
        ))}
      </div>
      <p className={`font-bold ${t.sub} ${claseLetra(cfg, "text-lg", "text-xl")}`}>Toques de más: {errores}</p>
    </div>
  );
}

function EjCalculoAdulto({ nivel, cfg, alTerminar }) {
  const t = tema(cfg);
  const TOTAL = 8;
  const generar = () => {
    let n1, n2, resp, simbolo;
    if (nivel <= 1) { n1 = azar(9) + 1; n2 = azar(9) + 1; resp = n1 + n2; simbolo = "+"; }
    else if (nivel === 2) { n1 = azar(15) + 5; n2 = azar(15) + 1; resp = n1 + n2; simbolo = "+"; }
    else if (nivel === 3) { n1 = azar(15) + 5; n2 = azar(Math.min(n1, 10)) + 1; resp = n1 - n2; simbolo = "−"; }
    else if (nivel === 4) { n1 = azar(40) + 10; n2 = azar(30) + 1; const s = azar(2) === 0; if (!s && n1 < n2) [n1, n2] = [n2, n1]; resp = s ? n1 + n2 : n1 - n2; simbolo = s ? "+" : "−"; }
    else { n1 = azar(8) + 2; n2 = azar(8) + 2; resp = n1 * n2; simbolo = "×"; }
    const ops = new Set([resp]);
    while (ops.size < 3) { const dd = resp + (azar(9) - 4); if (dd >= 0 && dd !== resp) ops.add(dd); }
    return { n1, n2, resp, simbolo, opciones: mezclar([...ops]) };
  };

  const [p, setP] = useState(generar);
  const [num, setNum] = useState(1);
  const [puntos, setPuntos] = useState(0);
  const [marca, setMarca] = useState(null);

  useEffect(() => { hablar("Resuelva la cuenta a su ritmo. No hay tiempo límite.", cfg.audio); }, []); // eslint-disable-line

  const responder = (op) => {
    if (marca !== null) return;
    const ok = op === p.resp;
    if (ok) hablar("Correcto.", cfg.audio);
    setMarca(op);
    const nuevos = ok ? puntos + 1 : puntos;
    if (ok) setPuntos(nuevos);
    setTimeout(() => {
      if (num >= TOTAL) alTerminar(nuevos * 10, TOTAL * 10);
      else { setNum(num + 1); setP(generar()); setMarca(null); }
    }, 1100);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className={`text-center font-bold ${t.texto} ${claseLetra(cfg, "text-xl", "text-2xl")}`}>
        Resuelva a su ritmo, sin tiempo límite 🔢
      </p>
      <div className={`rounded-3xl px-10 py-8 ${t.tarjeta}`}>
        <p className={`font-black ${t.texto} ${claseLetra(cfg, "text-6xl", "text-7xl")}`}>{p.n1} {p.simbolo} {p.n2}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {p.opciones.map((op) => (
          <button key={op} onClick={() => responder(op)}
            className={`h-24 w-24 rounded-2xl font-black transition-transform active:scale-90 ${claseLetra(cfg, "text-3xl", "text-4xl")} ${
              marca !== null && op === p.resp ? t.bien : marca === op ? t.mal : t.opcion
            }`}>
            {op}
          </button>
        ))}
      </div>
      <p className={`font-bold ${t.sub} ${claseLetra(cfg, "text-lg", "text-xl")}`}>Cuenta {num} de {TOTAL} · Aciertos: {puntos}</p>
    </div>
  );
}

function EjLenguajeAdulto({ nivel, cfg, alTerminar }) {
  const t = tema(cfg);
  const TOTAL = 8;
  const numOpciones = nivel >= 4 ? 4 : 3;
  const generar = useCallback(() => {
    const item = VOCABULARIO[azar(VOCABULARIO.length)];
    const ops = new Set([item.p]);
    while (ops.size < numOpciones) ops.add(VOCABULARIO[azar(VOCABULARIO.length)].p);
    return { ...item, opciones: mezclar([...ops]) };
  }, [numOpciones]);

  const [r, setR] = useState(generar);
  const [num, setNum] = useState(1);
  const [puntos, setPuntos] = useState(0);
  const [marca, setMarca] = useState(null);

  useEffect(() => { hablar("¿Cómo se llama el objeto de la imagen?", cfg.audio); }, []); // eslint-disable-line

  const responder = (op) => {
    if (marca !== null) return;
    const ok = op === r.p;
    if (ok) hablar(`Muy bien. Es ${r.p}.`, cfg.audio);
    else hablar(`Era ${r.p}.`, cfg.audio);
    setMarca(op);
    const nuevos = ok ? puntos + 1 : puntos;
    if (ok) setPuntos(nuevos);
    setTimeout(() => {
      if (num >= TOTAL) alTerminar(nuevos * 10, TOTAL * 10);
      else { setNum(num + 1); setR(generar()); setMarca(null); }
    }, 1300);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <p className={`text-center font-bold ${t.texto} ${claseLetra(cfg, "text-xl", "text-2xl")}`}>¿Cómo se llama este objeto?</p>
        <button onClick={() => hablar("¿Cómo se llama el objeto de la imagen?", true)} aria-label="Escuchar consigna"
          className={`rounded-full px-4 py-2 text-xl active:scale-90 ${t.botonSec}`}>🔊</button>
      </div>
      <div className="flex h-44 w-44 items-center justify-center rounded-3xl bg-white p-4 shadow-md">
        <Figura id={r.id} edad="6-8" className="h-full w-full" />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3">
        {r.opciones.map((op) => (
          <button key={op} onClick={() => responder(op)}
            className={`w-full rounded-2xl px-8 py-4 font-black transition-transform active:scale-95 ${claseLetra(cfg, "text-2xl", "text-3xl")} ${
              marca !== null && op === r.p ? t.bien : marca === op ? t.mal : t.opcion
            }`}>
            {op}
          </button>
        ))}
      </div>
      <p className={`font-bold ${t.sub} ${claseLetra(cfg, "text-lg", "text-xl")}`}>Objeto {num} de {TOTAL} · Aciertos: {puntos}</p>
    </div>
  );
}

function PanelCuidador({ sesiones, niveles, cfg }) {
  const t = tema(cfg);
  const porDominio = Object.keys(DOMINIOS).map((clave) => {
    const del = sesiones.filter((s) => s.dominio === clave);
    const jugadas = del.length;
    const promedio = jugadas > 0 ? Math.round((del.reduce((a, s) => a + s.puntos / s.maximo, 0) / jugadas) * 100) : 0;
    return { clave, jugadas, promedio };
  });
  const ultimas = [...sesiones].reverse().slice(0, 10);

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <div className={`rounded-3xl p-6 ${t.tarjeta}`}>
        <h3 className={`mb-4 text-xl font-black ${t.texto}`}>Evolución por dominio</h3>
        {porDominio.map(({ clave, jugadas, promedio }) => (
          <div key={clave} className="mb-4">
            <div className={`mb-1 flex flex-wrap justify-between gap-1 text-sm font-bold ${t.sub}`}>
              <span>{DOMINIOS[clave].icono} {DOMINIOS[clave].nombre} · nivel {niveles[clave] || 1} de 5</span>
              <span>{jugadas > 0 ? `${promedio}% de acierto` : "sin sesiones"}</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-teal-500" style={{ width: `${promedio}%` }} />
            </div>
            <p className={`mt-1 text-xs ${t.sub}`}>{jugadas} {jugadas === 1 ? "sesión" : "sesiones"}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-3xl p-6 ${t.tarjeta}`}>
        <h3 className={`mb-3 text-xl font-black ${t.texto}`}>Últimas sesiones</h3>
        {ultimas.length === 0 ? (
          <p className={t.sub}>Todavía no hay sesiones registradas.</p>
        ) : (
          ultimas.map((s, i) => (
            <div key={i} className="flex items-center justify-between border-b border-slate-200 py-2 last:border-0">
              <span className={`font-bold ${t.texto}`}>{DOMINIOS[s.dominio]?.icono} {DOMINIOS[s.dominio]?.nombre} · nivel {s.nivel}</span>
              <span className={`font-black ${s.puntos / s.maximo >= 0.7 ? "text-green-600" : "text-amber-600"}`}>
                {Math.round((s.puntos / s.maximo) * 100)}%
              </span>
            </div>
          ))
        )}
      </div>

      <div className={`rounded-3xl p-5 text-sm ${cfg.contraste ? "bg-slate-800 text-yellow-100" : "bg-amber-50 text-slate-600"}`}>
        <p className="font-black">⚕️ Importante</p>
        <p className="mt-1">
          MenteActiva es una herramienta de estimulación cognitiva. No es un tratamiento médico ni lo reemplaza.
          Si la persona atraviesa una rehabilitación (por ejemplo, luego de un ACV), este registro está pensado para
          compartirse con el profesional tratante (neuropsicología, fonoaudiología, terapia ocupacional), que es quien
          debe guiar el proceso.
        </p>
      </div>
    </div>
  );
}

function AppAdultos({ alSelector }) {
  const [pantalla, setPantalla] = useState("cargando");
  const [perfil, setPerfil] = useState(null);
  const [cfg, setCfg] = useState({ contraste: false, letra: "normal", audio: true });
  const [niveles, setNiveles] = useState({ memoria: 1, atencion: 1, calculo: 1, lenguaje: 1 });
  const [sesiones, setSesiones] = useState([]);
  const [dominioActivo, setDominioActivo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [nombreInput, setNombreInput] = useState("");
  const [claveEj, setClaveEj] = useState(0);
  const t = tema(cfg);

  useEffect(() => { try { window.scrollTo(0, 0); } catch (e) { /* nada */ } }, [pantalla]);

  useEffect(() => {
    (async () => {
      const p = await leer("menteactiva:perfil");
      const c = await leer("menteactiva:config");
      const n = await leer("menteactiva:niveles");
      const s = await leer("menteactiva:sesiones");
      if (c) setCfg(c);
      if (n) setNiveles(n);
      if (s) setSesiones(s);
      if (p) { setPerfil(p); setPantalla("menu"); }
      else setPantalla("perfil");
    })();
  }, []);

  const guardarCfg = (nueva) => { setCfg(nueva); guardar("menteactiva:config", nueva); };

  const crearPerfil = () => {
    if (!nombreInput.trim()) return;
    const p = { nombre: nombreInput.trim() };
    setPerfil(p);
    guardar("menteactiva:perfil", p);
    setPantalla("menu");
  };

  const terminarEjercicio = (puntos, maximo) => {
    const d = dominioActivo;
    const nivelActual = niveles[d] || 1;
    const ratio = puntos / maximo;
    let nuevoNivel = nivelActual;
    let cambio = null;
    if (ratio >= 0.8 && nivelActual < 5) { nuevoNivel = nivelActual + 1; cambio = "sube"; }
    else if (ratio < 0.4 && nivelActual > 1) { nuevoNivel = nivelActual - 1; cambio = "baja"; }
    const nuevosNiveles = { ...niveles, [d]: nuevoNivel };
    setNiveles(nuevosNiveles);
    guardar("menteactiva:niveles", nuevosNiveles);
    const s = { dominio: d, puntos, maximo, nivel: nivelActual, fecha: Date.now() };
    const nuevas = [...sesiones, s];
    setSesiones(nuevas);
    guardar("menteactiva:sesiones", nuevas);
    setResultado({ puntos, maximo, cambio, nuevoNivel });
    if (cambio === "sube") hablar("Muy buen trabajo. El próximo ejercicio será un poco más desafiante.", cfg.audio);
    else hablar("Sesión terminada. Buen trabajo.", cfg.audio);
  };

  if (pantalla === "cargando") {
    return <div className={`flex min-h-screen items-center justify-center ${t.fondo} text-2xl font-black ${t.texto}`}>Cargando…</div>;
  }

  if (pantalla === "perfil") {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center gap-8 p-6 ${t.fondo}`}>
        <div className="text-center">
          <div className="text-6xl">🧠</div>
          <h1 className={`mt-2 text-4xl font-black ${t.texto} sm:text-5xl`}>MenteActiva</h1>
          <p className={`mt-2 text-lg font-bold ${t.sub}`}>Ejercicios para mantener la mente en movimiento</p>
        </div>
        <div className={`flex w-full max-w-sm flex-col gap-4 rounded-3xl p-6 ${t.tarjeta}`}>
          <label className={`text-lg font-black ${t.texto}`}>¿Cuál es su nombre?</label>
          <input value={nombreInput} onChange={(e) => setNombreInput(e.target.value)} placeholder="Escriba su nombre"
            className="rounded-2xl border-4 border-teal-200 px-4 py-4 text-xl font-bold text-slate-700 outline-none focus:border-teal-400" />
          <button onClick={crearPerfil} disabled={!nombreInput.trim()}
            className={`rounded-full py-4 text-2xl font-black transition-transform active:scale-95 disabled:opacity-40 ${t.boton}`}>
            Comenzar
          </button>
          <button onClick={alSelector} className={`text-sm font-bold ${t.sub}`}>← Volver al inicio</button>
        </div>
      </div>
    );
  }

  if (pantalla === "ejercicio" && dominioActivo) {
    const nivel = niveles[dominioActivo] || 1;
    return (
      <div className={`min-h-screen p-4 ${t.fondo}`}>
        <div className="mx-auto flex max-w-lg flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => setPantalla("menu")} className={`flex items-center gap-1 rounded-full px-5 py-3 text-lg font-black active:scale-95 ${t.botonSec}`}>
              <ArrowLeft /> Volver
            </button>
            <span className={`text-xl font-black ${t.texto}`}>{DOMINIOS[dominioActivo].icono} {DOMINIOS[dominioActivo].nombre} · nivel {nivel}</span>
          </div>
          <div className={`rounded-3xl p-4 ${cfg.contraste ? "" : "bg-stone-50"}`}>
            {resultado ? (
              <div className="flex flex-col items-center gap-6 py-10">
                <div className="text-7xl">{resultado.puntos / resultado.maximo >= 0.7 ? "🎉" : "💪"}</div>
                <h2 className={`text-3xl font-black ${t.texto}`}>Sesión terminada</h2>
                <p className={`text-2xl font-bold ${t.sub}`}>{Math.round((resultado.puntos / resultado.maximo) * 100)}% de acierto</p>
                {resultado.cambio === "sube" && <p className="text-xl font-black text-green-600">⬆️ Pasa al nivel {resultado.nuevoNivel}</p>}
                {resultado.cambio === "baja" && <p className={`max-w-xs text-center text-lg font-bold ${t.sub}`}>Ajustamos el próximo ejercicio para que sea más cómodo. Está muy bien ir a su propio ritmo.</p>}
                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={() => { setResultado(null); setClaveEj((k) => k + 1); }}
                    className={`flex items-center gap-2 rounded-full px-8 py-4 text-xl font-black active:scale-95 ${t.boton}`}>
                    <RotateCcw /> Otra sesión
                  </button>
                  <button onClick={() => { setResultado(null); setPantalla("menu"); }}
                    className={`flex items-center gap-2 rounded-full px-8 py-4 text-xl font-black active:scale-95 ${t.botonSec}`}>
                    <Home /> Menú
                  </button>
                </div>
              </div>
            ) : (
              <div key={claveEj}>
                {dominioActivo === "memoria" && <EjMemoriaAdulto nivel={nivel} cfg={cfg} alTerminar={terminarEjercicio} />}
                {dominioActivo === "atencion" && <EjAtencionAdulto nivel={nivel} cfg={cfg} alTerminar={terminarEjercicio} />}
                {dominioActivo === "calculo" && <EjCalculoAdulto nivel={nivel} cfg={cfg} alTerminar={terminarEjercicio} />}
                {dominioActivo === "lenguaje" && <EjLenguajeAdulto nivel={nivel} cfg={cfg} alTerminar={terminarEjercicio} />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (pantalla === "panel") {
    return (
      <div className={`min-h-screen p-4 ${t.fondo}`}>
        <div className="mx-auto flex max-w-md flex-col items-center gap-5">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <button onClick={() => setPantalla("menu")} className={`flex items-center gap-1 rounded-full px-5 py-3 text-lg font-black active:scale-95 ${t.botonSec}`}>
              <ArrowLeft /> Volver
            </button>
            <span className={`text-xl font-black ${t.texto}`}>📊 Panel de cuidador</span>
          </div>
          <PanelCuidador sesiones={sesiones} niveles={niveles} cfg={cfg} />
        </div>
      </div>
    );
  }

  if (pantalla === "config") {
    return (
      <div className={`min-h-screen p-4 ${t.fondo}`}>
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => setPantalla("menu")} className={`flex items-center gap-1 rounded-full px-5 py-3 text-lg font-black active:scale-95 ${t.botonSec}`}>
              <ArrowLeft /> Volver
            </button>
            <span className={`text-xl font-black ${t.texto}`}>⚙️ Accesibilidad</span>
          </div>
          <div className={`flex flex-col gap-5 rounded-3xl p-6 ${t.tarjeta}`}>
            <button onClick={() => guardarCfg({ ...cfg, contraste: !cfg.contraste })}
              className={`flex items-center justify-between rounded-2xl p-5 text-xl font-black active:scale-95 ${t.opcion}`}>
              <span>🌓 Alto contraste</span><span>{cfg.contraste ? "Activado ✅" : "Desactivado"}</span>
            </button>
            <button onClick={() => guardarCfg({ ...cfg, letra: cfg.letra === "normal" ? "grande" : "normal" })}
              className={`flex items-center justify-between rounded-2xl p-5 text-xl font-black active:scale-95 ${t.opcion}`}>
              <span>🔠 Letra grande</span><span>{cfg.letra === "grande" ? "Activada ✅" : "Normal"}</span>
            </button>
            <button onClick={() => { const n = { ...cfg, audio: !cfg.audio }; guardarCfg(n); hablar("Audio activado.", n.audio); }}
              className={`flex items-center justify-between rounded-2xl p-5 text-xl font-black active:scale-95 ${t.opcion}`}>
              <span>🔊 Guía por voz</span><span>{cfg.audio ? "Activada ✅" : "Desactivada"}</span>
            </button>
            <p className={`text-sm ${t.sub}`}>
              Pensado para que también sea cómodo con una sola mano, con visión reducida o con fatiga:
              botones grandes, sin tiempo límite y con la dificultad que se adapta sola.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 pb-10 ${t.fondo}`}>
      <div className="mx-auto flex max-w-lg flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div>
            <h1 className={`text-3xl font-black ${t.texto}`}>🧠 Hola, {perfil.nombre}</h1>
            <p className={`font-bold ${t.sub}`}>Elija un ejercicio para hoy</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPantalla("config")} aria-label="Accesibilidad"
              className={`rounded-full px-4 py-3 text-xl font-black active:scale-95 ${t.botonSec}`}>⚙️</button>
            <button onClick={() => setPantalla("panel")} aria-label="Panel de cuidador"
              className={`rounded-full px-4 py-3 text-xl font-black active:scale-95 ${t.botonSec}`}>📊</button>
            <button onClick={alSelector} aria-label="Cambiar de usuario"
              className={`rounded-full px-4 py-3 text-xl font-black active:scale-95 ${t.botonSec}`}>👤</button>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {Object.keys(DOMINIOS).map((clave) => (
            <button key={clave}
              onClick={() => { soltarSemilla(); setDominioActivo(clave); setResultado(null); setClaveEj((k) => k + 1); setPantalla("ejercicio"); }}
              className={`flex items-center gap-4 rounded-3xl p-5 text-left transition-transform active:scale-95 ${t.opcion}`}>
              <span className="text-5xl">{DOMINIOS[clave].icono}</span>
              <span>
                <span className={`block font-black ${claseLetra(cfg, "text-2xl", "text-3xl")}`}>{DOMINIOS[clave].nombre}</span>
                <span className={`block font-bold ${t.sub} ${claseLetra(cfg, "text-base", "text-lg")}`}>{DOMINIOS[clave].desc} · nivel {niveles[clave] || 1}</span>
              </span>
            </button>
          ))}
        </div>

        <p className={`rounded-3xl p-4 text-sm ${cfg.contraste ? "bg-slate-900 text-yellow-200" : "bg-white text-slate-500 shadow"}`}>
          ⚕️ MenteActiva es una herramienta de estimulación y no reemplaza ningún tratamiento médico.
          En procesos de rehabilitación, úsela con la guía de su profesional de la salud.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Consentimiento parental por país
// (Textos de referencia con normas reales y verificables de cada
//  país. NO constituyen asesoramiento legal: antes de un
//  lanzamiento comercial deben ser revisados por asesoría legal
//  local. Los datos de la app viven solo en el dispositivo.)
// ============================================================
const PAISES = [
  { id: "ar", nombre: "Argentina", bandera: "🇦🇷", trato: "vos", marco: "Ley 25.326 de Protección de los Datos Personales y Ley 26.061 de Protección Integral de los Derechos de las Niñas, Niños y Adolescentes" },
  { id: "uy", nombre: "Uruguay", bandera: "🇺🇾", trato: "vos", marco: "Ley 18.331 de Protección de Datos Personales" },
  { id: "cl", nombre: "Chile", bandera: "🇨🇱", trato: "tu", marco: "Ley 19.628 sobre Protección de la Vida Privada" },
  { id: "mx", nombre: "México", bandera: "🇲🇽", trato: "tu", marco: "Ley Federal de Protección de Datos Personales en Posesión de los Particulares" },
  { id: "co", nombre: "Colombia", bandera: "🇨🇴", trato: "tu", marco: "Ley 1581 de 2012 de Protección de Datos Personales" },
  { id: "pe", nombre: "Perú", bandera: "🇵🇪", trato: "tu", marco: "Ley 29733 de Protección de Datos Personales" },
  { id: "es", nombre: "España", bandera: "🇪🇸", trato: "tu", marco: "Reglamento (UE) 2016/679 (RGPD) y Ley Orgánica 3/2018 (LOPDGDD); en España la edad mínima para el consentimiento digital propio es de 14 años" },
  { id: "us", nombre: "Estados Unidos", bandera: "🇺🇸", trato: "tu", marco: "COPPA (Children's Online Privacy Protection Act), que exige consentimiento parental verificable para menores de 13 años" },
  { id: "br", nombre: "Brasil", bandera: "🇧🇷", trato: "pt", marco: "LGPD — Lei Geral de Proteção de Dados (Lei nº 13.709/2018)" },
  { id: "xx", nombre: "Otro país", bandera: "🌎", trato: "tu", marco: "las normas de protección de datos personales y de protección de la infancia vigentes en su país" },
];

const TEXTOS_CONSENT = {
  vos: {
    titulo: "Consentimiento de madre, padre o tutor",
    intro: "Antes de empezar necesitamos tu autorización. Esta app está pensada para que la configure una persona adulta responsable del niño o de la niña.",
    datos: "📱 Los datos que cargás (nombres, fechas de nacimiento, PIN y progreso de juego) se guardan únicamente en este dispositivo. La app no tiene servidores propios y no envía, vende ni comparte esos datos con nadie.",
    derechos: "🗑️ Podés borrar perfiles y datos cuando quieras desde el panel de padres, y podés cambiar este consentimiento en cualquier momento.",
    mic: "Permitir el micrófono en los juegos de pronunciación (opcional). El audio se procesa con el servicio de voz del navegador, que es un tercero. Sin esto, los juegos funcionan igual.",
    videos: "Permitir los videos de premio de YouTube (opcional). Al reproducirlos rigen las condiciones y cookies de YouTube. Solo se muestran los videos que vos actives.",
    acepto: "Declaro ser mayor de edad y responsable legal del niño o la niña, y acepto el funcionamiento descripto.",
    marco: "Marco normativo de referencia",
    boton: "Aceptar y continuar",
    pais: "¿Desde qué país usás la app?",
    plantilla: "Texto de referencia. Antes de un lanzamiento comercial debe revisarlo asesoría legal del país correspondiente.",
  },
  tu: {
    titulo: "Consentimiento de madre, padre o tutor",
    intro: "Antes de empezar necesitamos tu autorización. Esta app está pensada para que la configure una persona adulta responsable del niño o de la niña.",
    datos: "📱 Los datos que ingresas (nombres, fechas de nacimiento, PIN y progreso de juego) se guardan únicamente en este dispositivo. La app no tiene servidores propios y no envía, vende ni comparte esos datos con nadie.",
    derechos: "🗑️ Puedes borrar perfiles y datos cuando quieras desde el panel de padres, y puedes cambiar este consentimiento en cualquier momento.",
    mic: "Permitir el micrófono en los juegos de pronunciación (opcional). El audio se procesa con el servicio de voz del navegador, que es un tercero. Sin esto, los juegos funcionan igual.",
    videos: "Permitir los videos de premio de YouTube (opcional). Al reproducirlos rigen las condiciones y cookies de YouTube. Solo se muestran los videos que tú actives.",
    acepto: "Declaro ser mayor de edad y responsable legal del niño o la niña, y acepto el funcionamiento descrito.",
    marco: "Marco normativo de referencia",
    boton: "Aceptar y continuar",
    pais: "¿Desde qué país usas la app?",
    plantilla: "Texto de referencia. Antes de un lanzamiento comercial debe revisarlo asesoría legal del país correspondiente.",
  },
  pt: {
    titulo: "Consentimento de mãe, pai ou responsável",
    intro: "Antes de começar, precisamos da sua autorização. Este app foi pensado para ser configurado por um adulto responsável pela criança.",
    datos: "📱 Os dados inseridos (nomes, datas de nascimento, PIN e progresso) ficam armazenados somente neste dispositivo. O app não possui servidores próprios e não envia, vende nem compartilha esses dados.",
    derechos: "🗑️ Você pode apagar perfis e dados quando quiser no painel dos pais, e pode alterar este consentimento a qualquer momento.",
    mic: "Permitir o microfone nos jogos de pronúncia (opcional). O áudio é processado pelo serviço de voz do navegador, que é um terceiro. Sem isso, os jogos funcionam normalmente.",
    videos: "Permitir os vídeos de prêmio do YouTube (opcional). Ao reproduzi-los valem os termos e cookies do YouTube. Só aparecem os vídeos que você ativar.",
    acepto: "Declaro ser maior de idade e responsável legal pela criança, e aceito o funcionamento descrito.",
    marco: "Marco normativo de referência",
    boton: "Aceitar e continuar",
    pais: "De qual país você usa o app?",
    plantilla: "Texto de referência. Antes de um lançamento comercial, deve ser revisado por assessoria jurídica local.",
  },
};

function ConsentimientoScreen({ inicial, alAceptar }) {
  const [pais, setPais] = useState(inicial ? inicial.pais : null);
  const [acepta, setAcepta] = useState(false);
  const [mic, setMic] = useState(inicial ? !!inicial.mic : true);
  const [videos, setVideos] = useState(inicial ? !!inicial.videos : true);
  const p = PAISES.find((x) => x.id === pais);
  const t = p ? TEXTOS_CONSENT[p.trato] : TEXTOS_CONSENT.tu;

  if (!pais) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-sky-100 to-stone-100 p-6">
        <div className="text-center">
          <div className="text-5xl">🔏</div>
          <h1 className="mt-2 text-2xl font-black text-slate-800 sm:text-3xl">{TEXTOS_CONSENT.tu.pais}</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">Adaptamos el consentimiento, las leyes de referencia y algunas palabras a tu país.</p>
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          {PAISES.map((x) => (
            <button key={x.id} onClick={() => setPais(x.id)}
              className="flex items-center gap-2 rounded-2xl bg-white p-4 text-left font-black text-slate-700 shadow-md transition-transform active:scale-95">
              <span className="text-3xl">{x.bandera}</span>{x.nombre}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-sky-100 to-stone-100 p-4 sm:p-6">
      <div className="flex w-full max-w-md flex-col gap-3 rounded-3xl bg-white p-5 shadow-lg sm:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-800 sm:text-2xl">🔏 {t.titulo}</h1>
          <button onClick={() => setPais(null)} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">{p.bandera} cambiar</button>
        </div>
        <p className="text-sm text-slate-600">{t.intro}</p>
        <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{t.datos}</p>
        <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{t.derechos}</p>
        <p className="rounded-2xl bg-amber-50 p-3 text-xs text-slate-600"><b>{t.marco} — {p.nombre}:</b> {p.marco}.</p>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-3">
          <input type="checkbox" checked={mic} onChange={(e) => setMic(e.target.checked)} className="mt-1 h-5 w-5 accent-violet-500" />
          <span className="text-sm text-slate-600">🎙️ {t.mic}</span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-3">
          <input type="checkbox" checked={videos} onChange={(e) => setVideos(e.target.checked)} className="mt-1 h-5 w-5 accent-red-500" />
          <span className="text-sm text-slate-600">🎬 {t.videos}</span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-4 border-emerald-100 bg-emerald-50 p-3">
          <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-1 h-5 w-5 accent-emerald-600" />
          <span className="text-sm font-bold text-slate-700">✅ {t.acepto}</span>
        </label>

        <button disabled={!acepta}
          onClick={() => alAceptar({ pais, mic, videos, fecha: new Date().toISOString(), version: 1 })}
          className="rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg transition-transform active:scale-95 disabled:opacity-40">
          {t.boton}
        </button>
        <p className="text-center text-[10px] leading-snug text-slate-400">{t.plantilla}</p>
      </div>
    </div>
  );
}

// ============================================================
// Selector de módulo
// ============================================================
export default function App() {
  const [modo, setModo] = useState("selector");
  const [consent, setConsent] = useState(undefined); // undefined = cargando, null = falta
  const [revisando, setRevisando] = useState(false);

  useEffect(() => {
    (async () => {
      const c = await leer("mentejuego:consentimiento");
      if (c && c.pais) aplicarRegion(c.pais);
      setConsent(c || null);
    })();
  }, []);

  if (consent === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-sky-100 text-2xl font-black text-sky-600">Cargando…</div>;
  }

  if (consent === null || revisando) {
    return (
      <ConsentimientoScreen
        inicial={consent}
        alAceptar={(c) => { guardar("mentejuego:consentimiento", c); aplicarRegion(c.pais); setConsent(c); setRevisando(false); }}
      />
    );
  }

  const permisos = { mic: !!consent.mic, videos: !!consent.videos };

  if (modo === "nino") return <AppNinos alSelector={() => setModo("selector")} permisos={permisos} alRevisar={() => setRevisando(true)} />;
  if (modo === "adulto") return <AppAdultos alSelector={() => setModo("selector")} />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-sky-100 to-stone-100 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-800 sm:text-5xl">Mente en Juego</h1>
        <p className="mt-2 text-lg font-bold text-slate-500">Estimulación cognitiva para cada etapa de la vida</p>
      </div>
      <div className="flex w-full max-w-lg flex-col gap-5 sm:flex-row">
        <button onClick={() => setModo("nino")}
          className="flex flex-1 flex-col items-center gap-3 rounded-3xl bg-white p-8 shadow-lg transition-transform active:scale-95">
          <span className="text-7xl">🌈</span>
          <span className="text-2xl font-black text-sky-700">PequeMundo</span>
          <span className="text-center font-bold text-slate-500">{TOTAL_NIVELES.toLocaleString("es-AR")} niveles para chicos de 3 a 11 años, elegidos solos según su edad</span>
        </button>
        <button onClick={() => setModo("adulto")}
          className="flex flex-1 flex-col items-center gap-3 rounded-3xl bg-white p-8 shadow-lg transition-transform active:scale-95">
          <span className="text-7xl">🧠</span>
          <span className="text-2xl font-black text-teal-700">MenteActiva</span>
          <span className="text-center font-bold text-slate-500">Adultos: memoria, atención, cálculo y lenguaje, con accesibilidad</span>
        </button>
      </div>
      <p className="max-w-md text-center text-xs text-slate-400">
        Herramienta de estimulación y aprendizaje. No realiza diagnósticos ni reemplaza tratamientos ni predice el futuro de nadie.
      </p>
    </div>
  );
}
