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

// ---------- utilidades ----------
const mezclar = (arr) => [...arr].sort(() => Math.random() - 0.5);
const azar = (n) => Math.floor(Math.random() * n);

function hablar(texto, activo = true) {
  if (!activo) return;
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-AR";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch (e) { /* sin audio */ }
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
  { id: "sol", p: "sol" }, { id: "casa", p: "casa" }, { id: "gato", p: "gato" }, { id: "pez", p: "pez" },
  { id: "flor", p: "flor" }, { id: "pelota", p: "pelota" }, { id: "auto", p: "auto" }, { id: "manzana", p: "manzana" },
  { id: "arbol", p: "árbol" }, { id: "luna", p: "luna" }, { id: "estrella", p: "estrella" }, { id: "globo", p: "globo" },
];
const PACK_NATURALEZA = ["sol", "arbol", "flor", "luna", "estrella", "manzana"];
const PACK_COSAS = ["casa", "auto", "pelota", "globo", "gato", "pez"];
const PACK_TODO = ["sol", "gato", "pez", "flor", "pelota", "auto", "estrella", "manzana"];

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

// ============================================================
// Motor genérico de juegos por rondas de opción múltiple
// ============================================================
const Tarjeta = ({ children }) => (
  <div className="flex flex-col items-center gap-2 rounded-3xl bg-white px-6 py-5 shadow-md sm:px-8 sm:py-6">{children}</div>
);

function JuegoRondas({ total = 8, generar, alTerminar, colorTexto = "text-violet-600", formato = "cuadrado", espera = 1000 }) {
  const [r, setR] = useState(() => generar());
  const [num, setNum] = useState(1);
  const [puntos, setPuntos] = useState(0);
  const [marca, setMarca] = useState(null);

  const responder = (op) => {
    if (marca !== null) return;
    const ok = op === r.respuesta;
    setMarca(op);
    const nuevos = ok ? puntos + 1 : puntos;
    if (ok) setPuntos(nuevos);
    const ms = r.explicacion ? espera + 700 : espera;
    setTimeout(() => {
      if (num >= total) alTerminar(nuevos, total);
      else { setNum(num + 1); setR(generar()); setMarca(null); }
    }, ms);
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
              : marca === op ? "bg-red-200 text-red-800" : "bg-white text-slate-700"
            }`}>
            {String(op)}
          </button>
        ))}
      </div>
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
      opciones: opcionesNum(resp, 3, 2, 1), respuesta: resp,
    };
  },

  contar: (p) => () => {
    const em = p.tema || ["🐶", "🍓", "⭐", "🐟", "🌼"][azar(5)];
    const n = azar(p.max - 1) + 2;
    return {
      pregunta: (<><Consigna>¿Cuántos hay? 🔢</Consigna><Tarjeta>
        <div className="flex max-w-xs flex-wrap justify-center gap-1 text-3xl sm:text-4xl">
          {[...Array(n)].map((_, i) => <span key={i}>{em}</span>)}
        </div></Tarjeta></>),
      opciones: opcionesNum(n, 3, 2, 1), respuesta: n,
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
      opciones: mezclar(arr), respuesta: resp,
    };
  },

  parImpar: () => () => {
    const n = azar(99) + 1;
    return {
      pregunta: (<><Consigna>¿El número es par o impar?</Consigna><Tarjeta><p className="text-5xl font-black text-slate-800">{n}</p></Tarjeta></>),
      opciones: ["Par", "Impar"], respuesta: n % 2 === 0 ? "Par" : "Impar",
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
      opciones: opcionesNum(resp, 3, Math.max(2, paso)), respuesta: resp,
    };
  },

  faltaNumero: (p) => () => {
    const desde = azar(p.tope - 4) + 1;
    const falta = desde + 1 + azar(2);
    const sec = [desde, desde + 1, desde + 2, desde + 3].map((n) => (n === falta ? "_" : n));
    return {
      pregunta: (<><Consigna>¿Qué número falta? 🔍</Consigna><Tarjeta>
        <p className="text-3xl font-black text-slate-800 sm:text-4xl">{sec.join(" · ")}</p></Tarjeta></>),
      opciones: opcionesNum(falta, 3, 2, 1), respuesta: falta,
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
      opciones: mezclar([...ops]), respuesta: resp,
    };
  },

  palabras: (p, edad) => () => {
    const banco = p.banco.map((id) => VOCABULARIO.find((v) => v.id === id)).filter(Boolean);
    const item = banco[azar(banco.length)];
    const ops = new Set([item.p]);
    while (ops.size < 3) ops.add(VOCABULARIO[azar(VOCABULARIO.length)].p);
    return {
      pregunta: (<><Consigna>¿Cómo se llama esto? 👀</Consigna>
        <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white p-3 shadow-md sm:h-40 sm:w-40">
          <Figura id={item.id} edad={edad} className="h-full w-full" />
        </div></>),
      opciones: mezclar([...ops]), respuesta: item.p,
    };
  },

  letras: (p) => () => {
    const item = VOCABULARIO[azar(VOCABULARIO.length)];
    const abec = "ABCDEFGLMNOPRSTUVZ".split("");
    if (p.modo === "primera" || p.modo === "ultima") {
      const resp = (p.modo === "primera" ? item.p[0] : item.p[item.p.length - 1]).toUpperCase();
      const ops = new Set([resp]);
      while (ops.size < 4) ops.add(abec[azar(abec.length)]);
      return {
        pregunta: (<><Consigna>¿Con qué letra {p.modo === "primera" ? "empieza" : "termina"}? ✏️</Consigna>
          <Tarjeta><Figura id={item.id} edad="6-8" className="h-24 w-24" />
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

  // ---------------- FINANZAS ----------------
  contarDinero: (p, edad) => () => {
    const cant = p.cant + azar(2);
    const elegidas = [...Array(cant)].map(() => p.valores[azar(p.valores.length)]);
    const resp = elegidas.reduce((a, b) => a + b, 0);
    return {
      pregunta: (<><Consigna>¿Cuánta plata hay? 💵</Consigna><Tarjeta>
        <div className="flex max-w-sm flex-wrap items-center justify-center gap-2">
          {elegidas.map((v, i) => <Dinero key={i} valor={v} edad={edad} chico />)}
        </div></Tarjeta></>),
      opciones: opcionesNum(resp, 3, Math.max(3, Math.round(resp / 4)), 1).map((n) => `$${n}`),
      respuesta: `$${resp}`,
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
      opciones: mezclar(items.map((it) => it.p)), respuesta: resp.p,
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
      explicacion: item.por,
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
      opciones: opcionesNum(semanas, 3, 2, 1), respuesta: semanas,
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
      respuesta: si ? "Sí, me alcanza" : "No me alcanza",
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
        <button onClick={() => { setAtrapados((v) => v + 1); mover(); }}
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
      setMensaje(`🎉 ¡Justo! +${ganados} puntos`);
      setTimeout(() => {
        if (num >= TOTAL) alTerminar(nuevos, TOTAL * 10);
        else { setNum(num + 1); setMeta(generarMeta()); setSuma(0); setFallo(false); setMensaje(null); }
      }, 1100);
    } else if (nueva > meta) {
      setFallo(true);
      setMensaje("😅 ¡Te pasaste! Empezá de nuevo");
      setTimeout(() => { setSuma(0); setMensaje(null); }, 1000);
    } else {
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

// ============================================================
// CATÁLOGO DE JUEGOS (motores × variantes = 100+)
// ============================================================
const CATALOGO = [];
function j(id, nombre, icono, area, motor, params, edades, colorTexto) {
  CATALOGO.push({ id, nombre, icono, area, motor, params, edades, colorTexto: colorTexto || "text-violet-600" });
}

// --- Pensar · memoria (12) ---
[["nat", "naturaleza", PACK_NATURALEZA], ["cos", "objetos", PACK_COSAS], ["mix", "mezclada", PACK_TODO]].forEach(([k, nom, pack]) => {
  j(`mem-${k}-3`, `Memoria ${nom} (fácil)`, "🃏", "cognitiva", "memoria", { pares: 3, pack }, ["3-5"]);
  j(`mem-${k}-4`, `Memoria ${nom}`, "🃏", "cognitiva", "memoria", { pares: 4, pack }, ["3-5"]);
  j(`mem-${k}-6`, `Memoria ${nom} (media)`, "🃏", "cognitiva", "memoria", { pares: 6, pack }, ["6-8"]);
  j(`mem-${k}-8`, `Memoria ${nom} (difícil)`, "🃏", "cognitiva", "memoria", { pares: 8, pack }, ["9-11"]);
});

// --- Pensar · patrones (16) ---
const PACKS_PATRON = [
  ["col", "de colores", ["🔴", "🔵", "🟡", "🟢", "🟣"]],
  ["fru", "de frutas", ["🍎", "🍌", "🍇", "🍓", "🍊"]],
  ["ani", "de animales", ["🐶", "🐱", "🐸", "🐰", "🦁"]],
  ["for", "de formas", ["⬛", "🔺", "⚪", "🟦", "🔶"]],
];
PACKS_PATRON.forEach(([k, nom, fichas]) => {
  j(`pat-${k}-1`, `Patrones ${nom} (fácil)`, "🔮", "cognitiva", "patrones", { fichas, cuantas: 2, largo: 4 }, ["3-5"]);
  j(`pat-${k}-2`, `Patrones ${nom}`, "🔮", "cognitiva", "patrones", { fichas, cuantas: 3, largo: 5 }, ["6-8"]);
  j(`pat-${k}-3`, `Patrones ${nom} (difícil)`, "🔮", "cognitiva", "patrones", { fichas, cuantas: 3, largo: 6 }, ["9-11"]);
  j(`pat-${k}-4`, `Patrones ${nom} (experto)`, "🔮", "cognitiva", "patrones", { fichas, cuantas: 3, largo: 7 }, ["9-11"]);
});

// --- Pensar · cuentas (16) ---
j("cta-sumfig", "Sumar con dibujos", "🍎", "cognitiva", "sumaFiguras", {}, ["3-5"]);
j("cta-suma5", "Sumitas hasta 5", "➕", "cognitiva", "cuentas", { tipo: "suma", tope: 4 }, ["3-5"]);
j("cta-suma10", "Sumas hasta 10", "➕", "cognitiva", "cuentas", { tipo: "suma", tope: 9 }, ["6-8"]);
j("cta-suma20", "Sumas hasta 20", "➕", "cognitiva", "cuentas", { tipo: "suma", tope: 19 }, ["6-8"]);
j("cta-suma50", "Sumas hasta 50", "➕", "cognitiva", "cuentas", { tipo: "suma", tope: 49 }, ["9-11"]);
j("cta-suma100", "Sumas grandes", "➕", "cognitiva", "cuentas", { tipo: "suma", tope: 99 }, ["9-11"]);
j("cta-suma3", "Sumas de 3 números", "➕", "cognitiva", "cuentas", { tipo: "suma3" }, ["9-11"]);
j("cta-resta10", "Restas hasta 10", "➖", "cognitiva", "cuentas", { tipo: "resta", tope: 9 }, ["6-8"]);
j("cta-resta20", "Restas hasta 20", "➖", "cognitiva", "cuentas", { tipo: "resta", tope: 19 }, ["6-8"]);
j("cta-resta50", "Restas hasta 50", "➖", "cognitiva", "cuentas", { tipo: "resta", tope: 49 }, ["9-11"]);
j("cta-doble", "El doble", "✖️", "cognitiva", "cuentas", { tipo: "doble" }, ["6-8"]);
j("cta-mitad", "La mitad", "➗", "cognitiva", "cuentas", { tipo: "mitad" }, ["9-11"]);
j("cta-tab23", "Tablas del 2 y 3", "✖️", "cognitiva", "cuentas", { tipo: "mult", tablas: [2, 3] }, ["6-8", "9-11"]);
j("cta-tab456", "Tablas del 4 al 6", "✖️", "cognitiva", "cuentas", { tipo: "mult", tablas: [4, 5, 6] }, ["9-11"]);
j("cta-tab789", "Tablas del 7 al 9", "✖️", "cognitiva", "cuentas", { tipo: "mult", tablas: [7, 8, 9] }, ["9-11"]);
j("cta-div", "Divisiones", "➗", "cognitiva", "cuentas", { tipo: "div" }, ["9-11"]);

// --- Pensar · contar (8) ---
j("con-ani5", "Contar animalitos", "🐶", "cognitiva", "contar", { max: 5, tema: "🐶" }, ["3-5"]);
j("con-fru5", "Contar frutas", "🍓", "cognitiva", "contar", { max: 5, tema: "🍓" }, ["3-5"]);
j("con-est10", "Contar estrellas", "⭐", "cognitiva", "contar", { max: 10, tema: "⭐" }, ["3-5", "6-8"]);
j("con-flo10", "Contar flores", "🌼", "cognitiva", "contar", { max: 10, tema: "🌼" }, ["3-5", "6-8"]);
j("con-mix10", "Contar hasta 10", "🔢", "cognitiva", "contar", { max: 10 }, ["3-5", "6-8"]);
j("con-mix15", "Contar hasta 15", "🔢", "cognitiva", "contar", { max: 15 }, ["6-8"]);
j("con-mix20", "Contar hasta 20", "🔢", "cognitiva", "contar", { max: 20 }, ["6-8"]);
j("con-pec20", "Contar pececitos", "🐟", "cognitiva", "contar", { max: 20, tema: "🐟" }, ["6-8"]);

// --- Pensar · comparar números (6) ---
j("may-10", "¿Cuál es más grande? (hasta 10)", "⚖️", "cognitiva", "mayorMenor", { tope: 10, modo: "mayor" }, ["3-5", "6-8"]);
j("men-10", "¿Cuál es más chico? (hasta 10)", "⚖️", "cognitiva", "mayorMenor", { tope: 10, modo: "menor" }, ["3-5", "6-8"]);
j("may-100", "¿Cuál es más grande? (hasta 100)", "⚖️", "cognitiva", "mayorMenor", { tope: 100, modo: "mayor" }, ["6-8"]);
j("may-100x3", "El más grande de tres", "⚖️", "cognitiva", "mayorMenor", { tope: 100, modo: "mayor", n: 3 }, ["6-8"]);
j("may-1000", "El más grande (hasta 1000)", "⚖️", "cognitiva", "mayorMenor", { tope: 1000, modo: "mayor", n: 3 }, ["9-11"]);
j("par-impar", "¿Par o impar?", "🎲", "cognitiva", "parImpar", {}, ["9-11"]);

// --- Pensar · secuencias numéricas (9) ---
j("sec-1", "Contar de 1 en 1", "➡️", "cognitiva", "secuencia", { paso: 1 }, ["3-5", "6-8"]);
j("sec-2", "De 2 en 2", "➡️", "cognitiva", "secuencia", { paso: 2 }, ["6-8"]);
j("sec-5", "De 5 en 5", "➡️", "cognitiva", "secuencia", { paso: 5 }, ["6-8"]);
j("sec-10", "De 10 en 10", "➡️", "cognitiva", "secuencia", { paso: 10 }, ["6-8", "9-11"]);
j("sec-3", "De 3 en 3", "➡️", "cognitiva", "secuencia", { paso: 3 }, ["9-11"]);
j("sec-100", "De 100 en 100", "➡️", "cognitiva", "secuencia", { paso: 100, desdeMax: 300 }, ["9-11"]);
j("sec-atras", "Contar hacia atrás", "⬅️", "cognitiva", "secuencia", { paso: 2, atras: true }, ["9-11"]);
j("fal-20", "¿Qué número falta? (hasta 20)", "🔍", "cognitiva", "faltaNumero", { tope: 20 }, ["6-8"]);
j("fal-100", "¿Qué número falta? (hasta 100)", "🔍", "cognitiva", "faltaNumero", { tope: 100 }, ["9-11"]);

// --- Hablar (8) ---
j("pal-nat", "Nombra la naturaleza", "🌳", "lenguaje", "palabras", { banco: PACK_NATURALEZA }, ["3-5"], "text-amber-600");
j("pal-cos", "Nombra los objetos", "🏠", "lenguaje", "palabras", { banco: PACK_COSAS }, ["3-5", "6-8"], "text-amber-600");
j("pal-mix", "Nombra la figura", "🗣️", "lenguaje", "palabras", { banco: VOCABULARIO.map((v) => v.id) }, ["6-8"], "text-amber-600");
j("let-pri", "Primera letra", "🔤", "lenguaje", "letras", { modo: "primera" }, ["6-8"], "text-amber-600");
j("let-ult", "Última letra", "🔚", "lenguaje", "letras", { modo: "ultima" }, ["9-11"], "text-amber-600");
j("let-cua", "¿Cuántas letras tiene?", "🔢", "lenguaje", "letras", { modo: "cuantasLetras" }, ["6-8"], "text-amber-600");
j("let-voc", "¿Cuántas vocales tiene?", "🅰️", "lenguaje", "letras", { modo: "cuantasVocales" }, ["9-11"], "text-amber-600");
j("let-emp", "¿Empieza con vocal?", "🎯", "lenguaje", "letras", { modo: "empiezaVocal" }, ["6-8", "9-11"], "text-amber-600");

// --- Mover (3) ---
j("atr-1", "Bichito tranquilo", "🐞", "psicomotor", "atrapa", { velocidad: 2000, meta: 10, tam: "h-20 w-20 sm:h-24 sm:w-24" }, ["3-5"], "text-emerald-600");
j("atr-2", "Bichito veloz", "🐞", "psicomotor", "atrapa", { velocidad: 1200, meta: 15, tam: "h-12 w-12 sm:h-16 sm:w-16" }, ["6-8"], "text-emerald-600");
j("atr-3", "Bichito turbo", "🐞", "psicomotor", "atrapa", { velocidad: 900, meta: 18, tam: "h-10 w-10 sm:h-12 sm:w-12" }, ["9-11"], "text-emerald-600");

// --- Ahorrar · FINANZAS (22) ---
j("alc-12", "Alcancía: monedas de 1 y 2", "🐷", "economia", "alcancia", { monedas: [1, 2], min: 4, max: 9 }, ["6-8"], "text-pink-600");
j("alc-125", "Alcancía: monedas de 1, 2 y 5", "🐷", "economia", "alcancia", { monedas: [1, 2, 5], min: 6, max: 14 }, ["6-8"], "text-pink-600");
j("alc-bil", "Alcancía con billetes", "🐷", "economia", "alcancia", { monedas: [1, 2, 5, 10, 20], min: 18, max: 55 }, ["9-11"], "text-pink-600");
j("alc-gra", "Alcancía: montos grandes", "🐷", "economia", "alcancia", { monedas: [5, 10, 20, 50], min: 60, max: 145 }, ["9-11"], "text-pink-600");
j("din-1", "¿Cuánta plata hay? (fácil)", "💵", "economia", "contarDinero", { valores: [1, 2], cant: 2 }, ["6-8"], "text-pink-600");
j("din-2", "¿Cuánta plata hay?", "💵", "economia", "contarDinero", { valores: [1, 2, 5], cant: 3 }, ["6-8"], "text-pink-600");
j("din-3", "¿Cuánta plata hay? (con billetes)", "💵", "economia", "contarDinero", { valores: [2, 5, 10, 20], cant: 3 }, ["9-11"], "text-pink-600");
j("vue-10", "El vuelto (hasta 10)", "🧾", "economia", "vuelto", { tope: 9 }, ["6-8"], "text-pink-600");
j("vue-20", "El vuelto (hasta 20)", "🧾", "economia", "vuelto", { tope: 19 }, ["6-8", "9-11"], "text-pink-600");
j("vue-100", "El vuelto (hasta 100)", "🧾", "economia", "vuelto", { tope: 90 }, ["9-11"], "text-pink-600");
j("pre-caro2", "¿Cuál cuesta más?", "🛒", "economia", "cualCuesta", { n: 2, modo: "caro", tope: 10 }, ["3-5", "6-8"], "text-pink-600");
j("pre-bar2", "¿Cuál es más barato?", "🛒", "economia", "cualCuesta", { n: 2, modo: "barato", tope: 20 }, ["6-8"], "text-pink-600");
j("pre-caro3", "El más caro de tres", "🛒", "economia", "cualCuesta", { n: 3, modo: "caro", tope: 100 }, ["9-11"], "text-pink-600");
j("nq-1", "¿Necesito o quiero?", "🤔", "economia", "necesito", {}, ["6-8"], "text-pink-600");
j("nq-2", "¿Necesito o quiero? (avanzado)", "🤔", "economia", "necesito", { avanzado: true }, ["9-11"], "text-pink-600");
j("met-1", "Meta de ahorro", "🎯", "economia", "metaAhorro", {}, ["9-11"], "text-pink-600");
j("met-2", "Meta de ahorro (grande)", "🎯", "economia", "metaAhorro", { grande: true }, ["9-11"], "text-pink-600");
j("des-mit", "Mitad de precio", "🏷️", "economia", "descuento", { modo: "mitad" }, ["6-8"], "text-pink-600");
j("des-10", "Descuento del 10%", "🏷️", "economia", "descuento", { modo: "diez" }, ["9-11"], "text-pink-600");
j("des-mix", "Rebajas mezcladas", "🏷️", "economia", "descuento", { modo: "mixto" }, ["9-11"], "text-pink-600");
j("alz-20", "¿Me alcanza?", "💭", "economia", "alcanza", { tope: 17 }, ["6-8"], "text-pink-600");
j("alz-100", "¿Me alcanza? (hasta 100)", "💭", "economia", "alcanza", { tope: 95 }, ["9-11"], "text-pink-600");

// ============================================================
// Pantalla de resultado
// ============================================================
function Resultado({ puntos, maximo, onRepetir, onSalir }) {
  const ratio = maximo > 0 ? puntos / maximo : 0;
  const estrellas = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
  const mensaje = estrellas === 3 ? "¡Increíble!" : estrellas === 2 ? "¡Muy bien!" : "¡Buen intento!";
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
            const juego = CATALOGO.find((x) => x.id === s.juego);
            return (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                <span className="font-bold text-slate-700">{juego?.icono} {juego?.nombre || s.juego}</span>
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
// Sub-app NIÑOS
// ============================================================
function AppNinos({ alSelector }) {
  const [pantalla, setPantalla] = useState("cargando");
  const [perfil, setPerfil] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [nombreInput, setNombreInput] = useState("");
  const [nacInput, setNacInput] = useState("");
  const [errorPerfil, setErrorPerfil] = useState(null);
  const [claveJuego, setClaveJuego] = useState(0);

  useEffect(() => {
    (async () => {
      const p = await leer("pequemundo:perfil");
      const s = await leer("pequemundo:sesiones");
      if (s) setSesiones(s);
      if (p && p.nacimiento) { setPerfil(p); setPantalla("menu"); }
      else {
        if (p && p.nombre) setNombreInput(p.nombre); // migración de perfiles viejos
        setPantalla("perfil");
      }
    })();
  }, []);

  const crearPerfil = () => {
    setErrorPerfil(null);
    if (!nombreInput.trim() || !nacInput) return;
    const edad = calcularEdad(nacInput);
    if (isNaN(edad) || edad < 0 || edad > 17) { setErrorPerfil("Revisá la fecha: no parece correcta."); return; }
    if (edad < 3) { setErrorPerfil("PequeMundo está diseñado desde los 3 años. ¡Los esperamos pronto! 💛"); return; }
    if (edad > 11) { setErrorPerfil("PequeMundo llega hasta los 11 años. Para más grandes, pronto habrá una etapa nueva."); return; }
    const p = { nombre: nombreInput.trim(), nacimiento: nacInput };
    setPerfil(p);
    guardar("pequemundo:perfil", p);
    setPantalla("menu");
  };

  const terminarJuego = (puntos, maximo) => {
    const s = { juego: juegoActivo.id, area: juegoActivo.area, puntos, maximo, fecha: Date.now() };
    const nuevas = [...sesiones, s];
    setSesiones(nuevas);
    guardar("pequemundo:sesiones", nuevas);
    setResultado({ puntos, maximo });
  };

  const abrirJuego = (jg) => { setJuegoActivo(jg); setResultado(null); setClaveJuego((k) => k + 1); setPantalla("juego"); };
  const repetir = () => { setResultado(null); setClaveJuego((k) => k + 1); };

  if (pantalla === "cargando") {
    return <div className="flex min-h-screen items-center justify-center bg-sky-100 text-2xl font-black text-sky-600">Cargando… 🎈</div>;
  }

  if (pantalla === "perfil") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sky-100 p-4 sm:gap-8 sm:p-6">
        <div className="text-center">
          <div className="text-6xl sm:text-7xl">🌈</div>
          <h1 className="mt-2 text-4xl font-black text-sky-700 sm:text-5xl">PequeMundo</h1>
          <p className="mt-2 text-base font-bold text-slate-500 sm:text-lg">{CATALOGO.length} juegos que crecen con tu peque</p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg sm:p-6">
          <label className="text-base font-black text-slate-700 sm:text-lg">¿Cómo se llama tu peque?</label>
          <input value={nombreInput} onChange={(e) => setNombreInput(e.target.value)} placeholder="Escribí su nombre"
            className="rounded-2xl border-4 border-sky-200 px-4 py-3 text-lg font-bold text-slate-700 outline-none focus:border-sky-400 sm:text-xl" />
          <label className="text-base font-black text-slate-700 sm:text-lg">¿Cuándo nació? 🎂</label>
          <input type="date" value={nacInput} onChange={(e) => setNacInput(e.target.value)}
            className="rounded-2xl border-4 border-sky-200 px-4 py-3 text-lg font-bold text-slate-700 outline-none focus:border-sky-400" />
          <p className="text-xs text-slate-400">Con la fecha de nacimiento, los juegos se eligen solos para su edad y se van renovando automáticamente con cada cumpleaños.</p>
          {errorPerfil && <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">{errorPerfil}</p>}
          <button onClick={crearPerfil} disabled={!nombreInput.trim() || !nacInput}
            className="mt-1 rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg transition-transform active:scale-95 disabled:opacity-40 sm:py-4 sm:text-2xl">
            ¡Empezar a jugar!
          </button>
          <button onClick={alSelector} className="text-sm font-bold text-slate-400">← Volver al inicio</button>
        </div>
      </div>
    );
  }

  const edadAnios = calcularEdad(perfil.nacimiento);
  const rango = rangoDeEdad(Math.min(Math.max(edadAnios, 3), 11));
  const cumple = esCumpleHoy(perfil.nacimiento);

  if (pantalla === "juego" && juegoActivo) {
    const motor = juegoActivo.motor;
    return (
      <div className="min-h-screen bg-sky-100 p-3 sm:p-4">
        <div className="mx-auto flex max-w-lg flex-col gap-4 sm:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => setPantalla("menu")} className="flex items-center gap-1 rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">
              <ArrowLeft /> Volver
            </button>
            <span className="text-base font-black text-slate-700 sm:text-lg">{juegoActivo.icono} {juegoActivo.nombre}</span>
          </div>
          <div className="rounded-3xl bg-sky-50 p-3 sm:p-4">
            {resultado ? (
              <Resultado puntos={resultado.puntos} maximo={resultado.maximo} onRepetir={repetir} onSalir={() => setPantalla("menu")} />
            ) : (
              <div key={claveJuego}>
                {motor === "memoria" && <JuegoMemoria params={juegoActivo.params} edad={rango} alTerminar={terminarJuego} />}
                {motor === "atrapa" && <JuegoAtrapa params={juegoActivo.params} alTerminar={terminarJuego} />}
                {motor === "alcancia" && <JuegoAlcancia params={juegoActivo.params} edad={rango} alTerminar={terminarJuego} />}
                {motor !== "memoria" && motor !== "atrapa" && motor !== "alcancia" && (
                  <JuegoRondas
                    generar={GENERADORES[motor](juegoActivo.params, rango)}
                    colorTexto={juegoActivo.colorTexto}
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
          <PanelPadres sesiones={sesiones} perfil={perfil} edadAnios={edadAnios} />
        </div>
      </div>
    );
  }

  const disponibles = CATALOGO.filter((jg) => jg.edades.includes(rango));
  return (
    <div className="min-h-screen bg-sky-100 p-3 pb-10 sm:p-4">
      <div className="mx-auto flex max-w-lg flex-col gap-5 sm:gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div>
            <h1 className="text-2xl font-black text-sky-700 sm:text-3xl">🌈 ¡Hola, {perfil.nombre}!</h1>
            <p className="font-bold text-slate-500">{edadAnios} años · {disponibles.length} juegos para tu edad</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPantalla("panel")}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">
              <BarChart3 /> Padres
            </button>
            <button onClick={alSelector} aria-label="Cambiar de usuario"
              className="rounded-full bg-white px-4 py-2 font-black text-slate-600 shadow active:scale-95">👤</button>
          </div>
        </header>

        {cumple && (
          <div className="rounded-3xl bg-yellow-100 p-4 text-center">
            <p className="text-2xl font-black text-amber-700">🎂 ¡FELIZ CUMPLEAÑOS, {perfil.nombre.toUpperCase()}! 🎉</p>
            <p className="font-bold text-amber-600">Hoy cumplís {edadAnios}. ¡Tus juegos crecen con vos!</p>
          </div>
        )}

        {Object.keys(AREAS).map((clave) => {
          const juegosArea = disponibles.filter((jg) => jg.area === clave);
          if (juegosArea.length === 0) return null;
          const a = AREAS[clave];
          return (
            <section key={clave} className={`rounded-3xl ${a.suave} p-4 sm:p-5`}>
              <h2 className={`mb-3 text-xl font-black sm:text-2xl ${a.texto}`}>{a.icono} {a.nombre} <span className="text-sm font-bold opacity-60">· {juegosArea.length} juegos</span></h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {juegosArea.map((jg) => (
                  <button key={jg.id} onClick={() => abrirJuego(jg)}
                    className="flex items-center gap-2 rounded-2xl bg-white p-3 text-left shadow-md transition-transform active:scale-95">
                    <span className="shrink-0 text-2xl sm:text-3xl">{jg.icono}</span>
                    <span className="text-sm font-black leading-tight text-slate-700 sm:text-base">{jg.nombre}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
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
              onClick={() => { setDominioActivo(clave); setResultado(null); setClaveEj((k) => k + 1); setPantalla("ejercicio"); }}
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
// Selector de módulo
// ============================================================
export default function App() {
  const [modo, setModo] = useState("selector");

  if (modo === "nino") return <AppNinos alSelector={() => setModo("selector")} />;
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
          <span className="text-center font-bold text-slate-500">{CATALOGO.length} juegos para chicos de 3 a 11 años, elegidos solos según su edad</span>
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
