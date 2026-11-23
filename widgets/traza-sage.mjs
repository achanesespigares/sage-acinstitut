// traza-sage.mjs · Visualizador de trazas de Sage de AC Institut (anywidget para MyST / Jupyter Book 2)
// Es el visualizador del libro de Python con lo propio de Sage: el padre de cada valor, la línea
// reescrita por el preparador, quién hace el cálculo y el botón «Sage real» (SageMathCell).
// Muestra un programa ejecutándose paso a paso: línea ejecutada, casillas de la lista
// consultadas, variables, condiciones evaluadas, pantalla y tabla de traza.
// El modelo llega del cuerpo JSON de la directiva:  { "config": {...}, "traza": {...} }
// La traza la genera herramientas/trazar.py ejecutando el programa con Sage y sys.settrace.

// Los estilos van dentro del módulo (una <style> en el propio widget): así viajan con él
// y funcionan igual en el libro, en el blog o en cualquier página que cargue el módulo.
const ESTILOS = `
/* traza.css · estilos del visualizador (piel AC Institut, paleta vino) */
.tz{
  --acento:#7A1F36; --suave:#F6F0EE; --oscuro:#5A1628;
  --banda:#6B6B6B; --filete:#9A9A9A; --fila:#D4D4D4; --fondo:#F4F4F4; --sub:#333; --tinta:#111; --si:#2D5A48;
  --titulo:"Montserrat","Helvetica Neue",Arial,sans-serif; --texto:"Arimo","Liberation Sans",Arial,sans-serif; --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
  font:400 15px/1.55 var(--texto); color:var(--tinta); background:#fff;
  display:flex; flex-direction:column; gap:16px; padding:16px; border:1px solid var(--fila); border-radius:10px; margin:1.25rem 0;
}
.tz *{ box-sizing:border-box; }
.tz p{ margin:0; }
.tz-cab{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; flex-wrap:wrap; }
.tz-tit{ font:700 18px/1.2 var(--titulo); }
.tz-etq{ font:600 10.5px/1 var(--titulo); letter-spacing:.1em; text-transform:uppercase; color:var(--acento); border:1.5px solid var(--acento); border-radius:6px; padding:5px 8px; }
.tz-idea{ border-left:4px solid var(--acento); padding:2px 0 2px 12px; color:var(--sub); }
.tz-escena{ display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start; }
.tz-col{ display:flex; flex-direction:column; gap:12px; min-width:0; }
.tz-caja{ border:2px solid var(--tinta); background:#fff; }
.tz-barra{ background:var(--acento); color:#fff; padding:6px 12px; font:600 10.5px/1.2 var(--titulo); letter-spacing:.12em; text-transform:uppercase; display:flex; justify-content:space-between; gap:8px; }
.tz-barra.negro{ background:var(--tinta); }
.tz-micro{ font:600 10.5px/1.2 var(--titulo); letter-spacing:.12em; text-transform:uppercase; color:var(--banda); margin-bottom:6px !important; }
.tz-micro.acento{ color:var(--acento); margin:0 !important; }

pre.tz-codigo{ margin:0; font:400 14px/1.85 var(--mono); overflow-x:auto; background:var(--fondo); padding:6px 0; border:0; border-radius:0; }
.tz .ln{ display:flex; align-items:center; white-space:pre; padding-right:12px; border-left:4px solid transparent; }
.tz .ln .fl{ width:20px; flex:none; text-align:center; font-size:11px; color:transparent; }
.tz .ln .no{ width:2.4ch; flex:none; text-align:right; color:var(--filete); margin-right:12px; }
.tz .ln.hecha{ border-left-color:var(--acento); background:var(--suave); }
.tz .ln.hecha .fl{ color:var(--acento); }
.tz .ln.sig .fl{ color:var(--filete); }
.tz .kw{ color:var(--acento); font-weight:600; }
.tz .str{ color:#4A5A2A; }
.tz .num{ color:#1E4A6B; }
.tz-leyenda{ font-size:12.5px; color:var(--banda); display:flex; gap:12px; }
.tz-leyenda b{ color:var(--acento); }
.tz-narr{ white-space:pre-wrap; min-height:4.4em; padding:10px 12px; background:var(--suave); border-left:4px solid var(--acento); font-size:15px; }
.tz-narr code{ font:500 13px/1 var(--mono); background:#fff; padding:2px 5px; border-radius:4px; }

.tz-mem{ padding:12px; display:flex; flex-direction:column; gap:16px; }
.tz-lnom{ font:600 14px/1 var(--mono); }
.tz-nota{ font:400 12px/1 var(--texto); color:var(--banda); }
.tz-casillas{ display:flex; position:relative; padding-top:44px; overflow-x:auto; }
.tz .cas{ display:flex; flex-direction:column; align-items:center; gap:5px; flex:none; }
.tz .cas .v{ width:50px; height:50px; border:2px solid var(--tinta); margin-left:-2px; display:flex; align-items:center; justify-content:center; font:600 19px/1 var(--mono); background:#fff; transition:background .25s,border-color .25s; }
.tz .cas:first-child .v{ margin-left:0; }
.tz .cas .idx{ font:500 12px/1 var(--mono); color:var(--banda); }
.tz .cas.visitada .v{ background:var(--fondo); color:var(--banda); }
.tz .cas.foco .v{ border:3px solid var(--acento); background:var(--suave); color:var(--tinta); position:relative; z-index:1; }
.tz .cas.lee .v{ box-shadow:0 0 0 5px rgba(122,31,54,.18); }
.tz .cas.foco .idx{ color:var(--acento); font-weight:600; }
.tz .puntero{ position:absolute; top:0; left:0; display:flex; flex-direction:column; align-items:center; gap:2px; transition:transform .35s ease; pointer-events:none; }
.tz .puntero .et{ font:600 13px/1 var(--mono); color:#fff; background:var(--acento); padding:5px 8px; border-radius:4px; white-space:nowrap; }
.tz .puntero .flecha{ width:0; height:0; border-left:7px solid transparent; border-right:7px solid transparent; border-top:9px solid var(--acento); }
.tz-consulta{ font:500 14px/1.3 var(--mono); color:var(--acento); min-height:1.3em; margin-top:6px !important; }
.tz-vars,.tz-clases{ display:flex; flex-wrap:wrap; gap:8px; }
.tz .var{ border:1.5px solid var(--fila); border-radius:6px; padding:7px 11px; min-width:72px; display:flex; flex-direction:column; gap:2px; }
.tz .var .k{ font:500 12px/1 var(--mono); color:var(--banda); display:flex; gap:6px; align-items:center; }
.tz .var .tipo{ font:600 9.5px/1 var(--titulo); letter-spacing:.06em; text-transform:uppercase; color:var(--acento); border:1px solid var(--acento); border-radius:3px; padding:2px 4px; }
.tz .var .val{ font:600 19px/1.15 var(--mono); white-space:pre-wrap; }
.tz .var .val.largo{ font:500 14px/1.35 var(--mono); }
.tz .var.cambia{ border:2px solid var(--acento); background:var(--suave); }
.tz .var .antes{ font:400 11px/1 var(--mono); color:var(--banda); text-decoration:line-through; }
.tz-vacio{ font-size:14px; color:var(--banda); font-style:italic; }
.tz .cond{ border:1.5px dashed var(--filete); border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:5px; font:500 15px/1.35 var(--mono); }
.tz .cond .fila-c{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.tz .cond .gris{ color:var(--banda); }
.tz .cond .res{ font:700 13px/1 var(--titulo); padding:5px 9px; border-radius:999px; color:#fff; }
.tz .cond .res.si{ background:var(--si); }
.tz .cond .res.no{ background:var(--acento); }
.tz .cond .res.oculto{ background:var(--banda); }
.tz-dic{ border-collapse:collapse; font:500 15px/1.2 var(--mono); margin:0; min-width:60%; }
.tz-dic th{ font:600 10.5px/1.2 var(--titulo); letter-spacing:.08em; text-transform:uppercase; color:var(--banda); text-align:left; padding:4px 10px; border:0; border-bottom:1.5px solid var(--tinta); background:none; }
.tz-dic td{ padding:7px 10px; border:0; border-bottom:1px solid var(--fila); }
.tz-dic tr.cambia td{ background:var(--suave); }
.tz-dic tr.cambia td:first-child{ box-shadow:inset 3px 0 0 var(--acento); }
.tz-pila{ display:flex; flex-direction:column; gap:10px; }
.tz-pila:empty{ display:none; }
.tz .marco{ border:2px solid var(--acento); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:8px; background:#fff; }
.tz .marco-cab{ display:flex; gap:8px; align-items:baseline; flex-wrap:wrap; font:600 10.5px/1.2 var(--titulo); letter-spacing:.1em; text-transform:uppercase; color:var(--acento); }
.tz .marco-cab code{ font:500 13px/1.2 var(--mono); letter-spacing:0; text-transform:none; color:var(--tinta); background:none; }
.tz .devuelve{ font:500 14px/1.3 var(--mono); color:var(--acento); padding:6px 10px; border-left:4px solid var(--acento); background:var(--suave); }
.tz .obj{ display:flex; flex-direction:column; gap:3px; font:500 13.5px/1.3 var(--mono); }
.tz .obj-n{ font:600 15px/1.2 var(--mono); color:var(--acento); }
.tz .attr{ padding:2px 7px; border-left:2px solid var(--fila); white-space:nowrap; }
.tz .attr .an{ color:var(--banda); }
.tz .attr.cambia{ border-left-color:var(--acento); background:var(--suave); }
.tz .attr.vacio{ color:var(--banda); font-style:italic; }
.tz .devuelve.error{ border-left-color:var(--tinta); background:var(--fondo); color:var(--tinta); }
.tz .exc{ border:2px solid var(--acento); border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:6px; background:var(--suave); }
.tz .exc code{ font:600 14px/1.35 var(--mono); color:var(--oscuro); background:none; white-space:pre-wrap; }
.tz .ln.hecha.error{ background:#F3E3E6; }
.tz .compr{ border:1.5px dashed var(--acento); border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:6px; font:500 14.5px/1.35 var(--mono); }
.tz .compr .fila-c{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.tz .compr .gris{ color:var(--banda); }
.tz .compr .parcial{ color:var(--acento); font-weight:600; }
.tz .devuelve.pausa{ border-left-color:var(--si); color:var(--si); background:#EEF3F0; }
.tz-disco{ display:flex; flex-direction:column; gap:8px; }
.tz .fic{ border:2px solid var(--tinta); background:#fff; }
.tz .fic-cab{ display:flex; justify-content:space-between; gap:8px; padding:5px 10px; background:var(--fondo); border-bottom:1px solid var(--fila); font:600 13px/1.2 var(--mono); }
.tz .fic-cab .tam{ font:500 11.5px/1.2 var(--mono); color:var(--banda); }
.tz .fic pre{ margin:0; padding:8px 10px; font:400 13.5px/1.5 var(--mono); white-space:pre-wrap; word-break:break-all; background:#fff; border:0; min-height:1.5em; }
.tz .fic pre .fin{ color:var(--filete); }
.tz .fic.cambia{ border-color:var(--acento); }
.tz .fic.cambia .fic-cab{ background:var(--suave); color:var(--acento); }
.tz-matriz{ border-collapse:collapse; font:600 16px/1 var(--mono); margin:4px 0 0; }
.tz-matriz td{ width:46px; height:42px; text-align:center; border:2px solid var(--tinta); padding:0; background:#fff; }
.tz-matriz td.fila{ background:var(--fondo); }
.tz-matriz td.foco{ background:var(--suave); outline:3px solid var(--acento); outline-offset:-3px; }
.tz-matriz th{ font:500 12px/1 var(--mono); color:var(--banda); padding:4px 6px; border:0; background:none; }
.tz-consola{ background:var(--tinta); color:#EDEDED; font:400 14px/1.6 var(--mono); padding:10px 12px; min-height:2.6em; white-space:pre-wrap; }
.tz-consola .pr{ color:#9A9A9A; }

.tz-tabla-wrap{ overflow-x:auto; padding:12px 12px 0; }
table.tz-tabla{ width:100%; border-collapse:collapse; font:500 15px/1.2 var(--mono); margin:0; }
table.tz-tabla th{ font:600 11px/1.2 var(--titulo); letter-spacing:.06em; color:#fff; background:var(--tinta); padding:8px 10px; text-align:left; border:0; }
table.tz-tabla td{ padding:8px 10px; border:0; border-bottom:1px solid var(--fila); }
table.tz-tabla tr.nueva td{ background:var(--suave); }
table.tz-tabla tr.nueva td:first-child{ box-shadow:inset 4px 0 0 var(--acento); }
table.tz-tabla td.si{ color:var(--si); font-weight:600; }
table.tz-tabla td.no{ color:var(--acento); font-weight:600; }
table.tz-tabla tr.fantasma td{ color:var(--fila); }
.tz-nota-tabla{ font-size:13px; color:var(--banda); padding:8px 12px 12px; }

.tz-mandos{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; border-top:1px solid var(--fila); padding-top:12px; }
.tz-b{ font:600 14px/1 var(--titulo); color:var(--tinta); background:#fff; border:1px solid var(--tinta); border-radius:999px; padding:10px 15px; cursor:pointer; }
.tz-b:hover{ background:var(--suave); }
.tz-b.prim{ background:var(--acento); border-color:var(--acento); color:#fff; }
.tz-b.prim:hover{ background:var(--oscuro); }
.tz-b:disabled{ opacity:.35; cursor:default; }
.tz-teclas{ display:none; font:500 12.5px/1.3 var(--mono); color:var(--banda); }
.tz:fullscreen{ overflow:auto; padding:24px 4vw 0; border:0; border-radius:0; margin:0; }
.tz:fullscreen > :not(.tz-mandos){ zoom:1.3; }
.tz:fullscreen .tz-mandos{ position:sticky; bottom:0; background:#fff; padding:12px 0 16px; z-index:5; }
.tz:fullscreen .tz-teclas{ display:inline; }
.tz:focus{ outline:none; }
.tz-b:focus-visible,.tz-pred:focus-visible{ outline:2px solid var(--acento); outline-offset:2px; }
.tz-cuenta{ font:500 13px/1 var(--mono); color:var(--banda); }
.tz-toggle{ display:flex; gap:7px; align-items:center; font-size:14px; color:var(--sub); cursor:pointer; margin-left:auto; }
.tz-toggle input{ accent-color:var(--acento); width:17px; height:17px; }

/* preguntas tipo examen */
.pq{ gap:14px; }
.pq-card{ border:1.5px solid var(--fila); border-radius:10px; padding:14px 16px; display:flex; flex-direction:column; gap:10px; background:#fff; }
.pq-card.bien{ border-color:var(--si); }
.pq-card.mal{ border-color:var(--acento); }
.pq-num{ font:600 10.5px/1.2 var(--titulo); letter-spacing:.1em; text-transform:uppercase; color:var(--banda); }
.pq-enun{ font-size:15.5px; }
.pq-enun code, .pq-exp code{ font:500 13.5px/1 var(--mono); background:var(--fondo); padding:2px 5px; border-radius:4px; }
pre.pq-code{ margin:0; font:400 14px/1.6 var(--mono); background:var(--fondo); border-left:4px solid var(--tinta); padding:8px 12px; overflow-x:auto; border-radius:0; }
.pq-ops{ display:flex; flex-direction:column; gap:7px; }
.pq-op{ display:flex; gap:10px; align-items:flex-start; border:1.5px solid var(--fila); border-radius:8px; padding:8px 11px; cursor:pointer; background:#fff; }
.pq-op:hover{ border-color:var(--filete); }
.pq-op input{ margin-top:4px; accent-color:var(--acento); flex:none; }
.pq-op .letra{ font:700 13px/1.6 var(--titulo); color:var(--acento); flex:none; }
.pq-op .txt{ white-space:pre-wrap; }
.pq-op .txt.mono{ font:500 14px/1.5 var(--mono); }
.pq-op.correcta{ border-color:var(--si); background:#EEF3F0; }
.pq-op.fallada{ border-color:var(--acento); background:var(--suave); }
.pq-op.bloq{ cursor:default; }
.pq-aviso{ font-size:13px; color:var(--acento); min-height:0; }
.pq-acc{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.pq-fb{ display:flex; flex-direction:column; gap:6px; }
.pq-fb .veredicto{ font:700 14px/1.3 var(--titulo); }
.pq-fb .veredicto.si{ color:var(--si); }
.pq-fb .veredicto.no{ color:var(--acento); }
.pq-exp{ color:var(--sub); border-left:4px solid var(--fila); padding-left:10px; }
.pq-traza .tz{ margin:6px 0 0; }
.pq-marcador{ font:500 13px/1 var(--mono); color:var(--banda); }
.pq-cab{ display:flex; justify-content:space-between; gap:10px; align-items:center; flex-wrap:wrap; }
.pq-reloj{ font:600 18px/1 var(--mono); }
.pq-reloj.poco{ color:var(--acento); }
.pq-rejilla{ display:flex; flex-wrap:wrap; gap:5px; }
.pq-rejilla button{ width:34px; height:30px; font:500 12.5px/1 var(--mono); border:1px solid var(--fila); background:#fff; border-radius:6px; cursor:pointer; color:var(--tinta); }
.pq-rejilla button.hecha{ background:var(--fondo); border-color:var(--filete); }
.pq-rejilla button.marcada{ box-shadow:inset 0 -3px 0 var(--acento); }
.pq-rejilla button.actual{ outline:2px solid var(--acento); outline-offset:1px; }
.pq-rejilla button.bien{ background:#EEF3F0; border-color:var(--si); }
.pq-rejilla button.mal{ background:var(--suave); border-color:var(--acento); }
.pq-tabla{ border-collapse:collapse; width:100%; font-size:14px; margin:0; }
.pq-tabla th, .pq-tabla td{ text-align:left; padding:7px 10px; border:0; border-bottom:1px solid var(--fila); background:none; }
.pq-tabla th{ font:600 10.5px/1.2 var(--titulo); letter-spacing:.08em; text-transform:uppercase; color:var(--banda); }
.pq-barra{ height:8px; background:var(--fondo); border-radius:4px; overflow:hidden; min-width:80px; }
.pq-barra span{ display:block; height:100%; background:var(--si); }
.pq-barra span.baja{ background:var(--acento); }
.pq-nota{ font:700 40px/1 var(--titulo); }
.pq-nota.si{ color:var(--si); }
.pq-nota.no{ color:var(--acento); }

.tz-sage{ display:flex; flex-direction:column; gap:8px; }
.tz-sage:empty{ display:none; }
.tz-sage .prep, .tz-sage .motor{ border:1.5px solid var(--fila); border-radius:8px; padding:8px 11px; display:flex; flex-direction:column; gap:5px; background:#fff; }
.tz-sage .prep code{ font:500 13px/1.55 var(--mono); white-space:pre-wrap; word-break:break-word; color:var(--tinta); }
.tz-sage .motor .mots{ display:flex; flex-wrap:wrap; gap:6px 14px; }
.tz-sage .motor .mot{ font:700 14px/1.4 var(--titulo); color:var(--oscuro); }
.tz-sage .motor .mot span{ font:400 13.5px/1.4 var(--texto); color:var(--sub); }
.tz .var .tipo{ text-transform:none; letter-spacing:.02em; font-size:10.5px; }
.tz .var .tipo.py{ color:var(--banda); border-color:var(--filete); }
.tz-real:empty{ display:none; }
.tz-real{ border:2px solid var(--tinta); }
.tz-real .tz-real-nota{ padding:10px 12px; font-size:14px; color:var(--sub); background:var(--fondo); }
.tz-real .tz-real-nota a{ color:var(--oscuro); }
.tz-real .tz-real-celda{ padding:10px 12px; min-height:3em; }
@media (max-width:760px){
  .tz{ padding:12px; }
  .tz-escena{ grid-template-columns:1fr; }
  .tz .cas .v{ width:44px; height:44px; font-size:17px; }
  .tz-toggle{ margin-left:0; width:100%; }
}
@media (prefers-reduced-motion:reduce){ .tz *{ transition:none !important; } }
`;

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Quién hace el cálculo (trazar.py solo lo pone cuando lo puede asegurar)
const MOTORES = {
  GMP: "la biblioteca de enteros y fracciones de tamaño ilimitado",
  MPFR: "la biblioteca de decimales con la precisión que se pida",
  PARI: "el programa de teoría de números (factorizar, primos…)",
  Maxima: "el programa de cálculo simbólico (integrales, límites, ecuaciones…)",
  Pynac: "la biblioteca de expresiones simbólicas de Sage (sumar, expandir, sustituir…)",
};
// Nombres completos de los padres, para la narración
const PADRES = { ZZ: "los enteros", QQ: "los racionales", RR: "los reales con 53 bits de precisión", SR: "el anillo simbólico" };
const esDePython = t => ["int", "float", "str", "bool", "list", "tuple", "dict", "set", "NoneType", "range"].includes(t);

// «Sage real»: el mismo programa en SageMathCell, el servidor público de Sage, dentro de la página.
// El script (1 MB) solo se descarga la primera vez que alguien pulsa el botón.
const SAGECELL = "https://sagecell.sagemath.org/";
let SAGECELL_LISTO = null;
function cargaSageCell() {
  if (SAGECELL_LISTO) return SAGECELL_LISTO;
  SAGECELL_LISTO = new Promise((res, rej) => {
    if (window.sagecell && window.sagecell.makeSagecell) return res(window.sagecell);
    const s = document.createElement("script");
    s.src = SAGECELL + "static/embedded_sagecell.js";
    s.onload = () => (window.sagecell && window.sagecell.makeSagecell) ? res(window.sagecell) : rej(new Error("sin sagecell"));
    s.onerror = () => rej(new Error("No se ha podido cargar SageMathCell"));
    document.head.appendChild(s);
  });
  SAGECELL_LISTO.catch(() => { SAGECELL_LISTO = null; });
  return SAGECELL_LISTO;
}
// SageMathCell (jQuery y CodeMirror) no funciona dentro del shadow DOM en el que MyST pinta los
// widgets: la celda se abre en una caja del documento, justo debajo del widget.
function hojaSageCell() {
  if (document.querySelector("link[data-sagecell]")) return;
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.href = SAGECELL + "static/sagecell_embed.css"; l.dataset.sagecell = "1";
  document.head.appendChild(l);
}
function cajaSageReal(nodo) {
  const raiz = nodo.getRootNode && nodo.getRootNode();
  const host = raiz && raiz !== document && raiz.host;
  if (!host) return nodo;                          // sin shadow DOM: la caja del propio widget
  const caja = document.createElement("div");
  caja.className = "ac-sagereal";
  caja.style.cssText = "border:2px solid #111;margin:-0.5rem 0 1.25rem;background:#fff;font:400 15px/1.55 Arimo,'Liberation Sans',Arial,sans-serif;color:#111";
  host.after(caja);
  return caja;
}
function abreSageReal(nodo, codigo) {
  hojaSageCell();
  const caja = cajaSageReal(nodo);
  caja.innerHTML = '<p style="margin:0;padding:10px 12px;font-size:14px;color:#333;background:#F4F4F4">Sage completo en <a href="' + SAGECELL + '" target="_blank" rel="noopener" style="color:#5A1628">SageMathCell</a>, el servidor público de Sage: ' +
    "el programa se envía allí y vuelve la respuesta. Puedes cambiarlo y pulsar «Ejecutar en Sage». Ten en cuenta que ahí solo se ve el valor de la <b>última</b> línea, no el de cada una.</p>" +
    '<div class="ac-sagereal-celda" style="padding:10px 12px;min-height:3em"><span style="color:#6B6B6B">Conectando con SageMathCell…</span></div>';
  const celda = caja.querySelector(".ac-sagereal-celda");
  cargaSageCell().then(S => {
    celda.innerHTML = "";
    const guion = document.createElement("script");
    guion.type = "text/x-sage";
    guion.textContent = codigo;
    celda.appendChild(guion);
    S.makeSagecell({ inputLocation: celda, evalButtonText: "Ejecutar en Sage", autoeval: true, languages: ["sage"], hide: ["messages", "permalink"] });
  }).catch(() => {
    celda.innerHTML = '<span style="color:#6B6B6B">No se ha podido conectar con SageMathCell. Comprueba la conexión, o abre <a href="' + SAGECELL +
      '" target="_blank" rel="noopener">sagecell.sagemath.org</a> y pega allí el programa.</span>';
  });
  return caja;
}
function cierraSageReal(caja, nodo) {
  if (!caja) return;
  if (caja === nodo) caja.innerHTML = ""; else caja.remove();
}
// valores con la escritura de Python: 'texto', True, False, None
const fmtVal = v => typeof v === "string" ? "'" + v + "'" : v === true ? "True" : v === false ? "False" : v === null ? "None" : String(v);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// objetos marcados por trazar.py: {"__obj__": nº, "__clase__": "Cuenta", "attrs": {...}}; excepciones: {"__exc__": "..."}
const esObj = v => v !== null && typeof v === "object" && !Array.isArray(v) && "__obj__" in v;
const pyVal = v => v === null || typeof v !== "object" ? fmtVal(v)
  : Array.isArray(v) ? "[" + v.map(pyVal).join(", ") + "]"
  : "__obj__" in v ? v.__clase__ + " nº" + v.__obj__
  : "__exc__" in v ? v.__exc__
  : "__txt__" in v ? v.__txt__
  : "__bytes__" in v ? v.repr
  : "__tupla__" in v ? "(" + v.__tupla__.map(pyVal).join(", ") + (v.__tupla__.length === 1 ? ",)" : ")")
  : "{" + Object.keys(v).map(c => fmtVal(c) + ": " + pyVal(v[c])).join(", ") + "}";
// todos los objetos que hay en memoria en un paso, por su número
function objetosDe(p) {
  const m = {};
  const mira = v => {
    if (v === null || typeof v !== "object") return;
    if (Array.isArray(v)) return v.forEach(mira);
    if ("__obj__" in v) { m[v.__obj__] = v; return Object.values(v.attrs).forEach(mira); }
    Object.values(v).forEach(mira);
  };
  Object.values(p.estado || {}).forEach(mira);
  (p.pila || []).forEach(mm => Object.values(mm.vars).forEach(mira));
  return m;
}

function colorea(linea) {
  return esc(linea).split(/("[^"]*")/).map(p => p.startsWith('"')
    ? '<span class="str">' + p + "</span>"
    : p.replace(/\b(for|in|while|if|elif|else|and|or|not|print|range|len|def|return|try|except|finally|raise|class|import|from|as|pass|yield|lambda|with|match|case|break|continue|assert|is|None|True|False)\b/g, '<span class="kw">$1</span>')
       .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')).join("");
}

const PLANTILLA = `
<div class="tz">
  <div class="tz-cab"><span class="tz-tit"></span><span class="tz-etq"></span></div>
  <p class="tz-idea"></p>
  <div class="tz-escena">
    <div class="tz-col">
      <div class="tz-caja">
        <div class="tz-barra"><span>Programa</span><span class="tz-linea">listo</span></div>
        <pre class="tz-codigo" aria-label="Código del programa"></pre>
      </div>
      <p class="tz-leyenda"><b>▶</b> se acaba de ejecutar <span>▷ la siguiente</span></p>
      <p class="tz-narr" aria-live="polite"></p>
      <div class="tz-sage"></div>
    </div>
    <div class="tz-col">
      <div class="tz-caja">
        <div class="tz-barra negro"><span>Memoria</span><span>lo que hay ahora</span></div>
        <div class="tz-mem">
          <div class="tz-lista-bloque">
            <p class="tz-lnom"><span class="tz-nom"></span> <span class="tz-nota">(posiciones desde 0)</span></p>
            <div class="tz-casillas"></div>
            <p class="tz-consulta"></p>
          </div>
          <div class="tz-mat-bloque"><p class="tz-micro"><span class="tz-mat-nom"></span> · lista de listas (fila, columna)</p><table class="tz-matriz"></table><p class="tz-consulta tz-mat-consulta"></p></div>
          <div class="tz-dic-bloque"><p class="tz-micro"><span class="tz-dic-nom"></span> · diccionario</p><table class="tz-dic"></table></div>
          <div class="tz-clases-bloque"><p class="tz-micro">Clases · atributos de clase</p><div class="tz-clases"></div></div>
          <div><p class="tz-micro tz-vars-tit">Variables</p><div class="tz-vars"></div></div>
          <div class="tz-pila"></div>
          <div class="tz-cond"></div>
          <div class="tz-compr"></div>
          <div class="tz-exc"></div>
        </div>
      </div>
      <div><p class="tz-micro">Consola de Sage</p><div class="tz-consola" aria-live="polite"></div></div>
      <div class="tz-disco-bloque"><p class="tz-micro">Disco · carpeta del programa</p><div class="tz-disco"></div></div>
    </div>
  </div>
  <div class="tz-caja">
    <div class="tz-barra"><span>Tabla de traza</span><span class="tz-tabla-sub">una fila por vuelta</span></div>
    <div class="tz-tabla-wrap"><table class="tz-tabla"></table></div>
    <p class="tz-nota-tabla"></p>
  </div>
  <div class="tz-mandos">
    <button type="button" class="tz-b tz-atras" aria-label="Paso anterior">◀</button>
    <button type="button" class="tz-b prim tz-sigue">Paso ▶</button>
    <button type="button" class="tz-b tz-play">Reproducir</button>
    <button type="button" class="tz-b tz-reinicia">Reiniciar</button>
    <button type="button" class="tz-b tz-proy" aria-pressed="false" title="Pantalla completa para proyectar en clase (tecla F)">Proyectar</button>
    <span class="tz-cuenta"></span>
    <span class="tz-teclas">→ paso · ← atrás · P reproducir · Inicio reiniciar · Esc salir</span>
    <button type="button" class="tz-b tz-sagereal" aria-expanded="false" title="Ejecuta este mismo programa con Sage completo (SageMathCell)">Sage real</button>
    <label class="tz-toggle"><input type="checkbox" class="tz-pred"> Modo predicción</label>
  </div>
  <div class="tz-real"></div>
</div>`;

// ---------------------------------------------------------------------------
// Preguntas tipo examen: config.tipo === "preguntas"
//   modo "capitulo": tarjetas con corrección inmediata, explicación y la ejecución paso a paso
//   modo "simulacro": n preguntas al azar según el reparto por secciones, con reloj y nota final
// Cada pregunta: {id, sec, q, code?, ops[], ok (índice o lista), exp, mono?, traza?}
// ---------------------------------------------------------------------------
const md = t => esc(t).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
const LETRAS = "ABCDEFGH";
const correctasDe = q => Array.isArray(q.ok) ? q.ok : [q.ok];
const barajar = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function tarjetaPregunta(q, num, total, opciones) {
  // opciones: [{texto, original}] en el orden en que se muestran
  const multi = correctasDe(q).length > 1;
  const nombre = "pq-" + q.id + "-" + Math.random().toString(36).slice(2, 7);
  return '<div class="pq-card" data-id="' + esc(q.id) + '">' +
    '<p class="pq-num">Pregunta ' + num + (total ? " de " + total : "") + (q.secNombre === "" ? "" : " · " + esc(q.secNombre || ("Sección " + q.sec))) + "</p>" +
    '<div class="pq-enun">' + md(q.q) + (multi ? " <b>(Elige " + correctasDe(q).length + ".)</b>" : "") + "</div>" +
    (q.code ? '<pre class="pq-code">' + q.code.split("\n").map(colorea).join("\n") + "</pre>" : "") +
    '<div class="pq-ops">' + opciones.map((o, i) =>
      '<label class="pq-op" data-orig="' + o.original + '"><input type="' + (multi ? "checkbox" : "radio") + '" name="' + nombre + '" value="' + o.original + '">' +
      '<span class="letra">' + LETRAS[i] + '</span><span class="txt' + (q.mono ? " mono" : "") + '">' + (q.mono ? esc(o.texto) : md(o.texto)) + "</span></label>").join("") + "</div>" +
    '<p class="pq-aviso" role="alert"></p>' +
    '<div class="pq-acc"></div><div class="pq-fb"></div><div class="pq-traza"></div></div>';
}
function elegidas(card) { return [...card.querySelectorAll("input:checked")].map(i => +i.value).sort((a, b) => a - b); }
function acierta(q, sel) { return igual(sel, correctasDe(q).slice().sort((a, b) => a - b)); }
function corrige(card, q, sel) {
  const ok = acierta(q, sel), buenas = correctasDe(q);
  card.classList.toggle("bien", ok); card.classList.toggle("mal", !ok);
  card.querySelectorAll(".pq-op").forEach(l => {
    const o = +l.dataset.orig;
    l.classList.add("bloq"); l.querySelector("input").disabled = true;
    if (buenas.includes(o)) l.classList.add("correcta");
    else if (sel.includes(o)) l.classList.add("fallada");
  });
  const letras = [...card.querySelectorAll(".pq-op")].map((l, i) => buenas.includes(+l.dataset.orig) ? LETRAS[i] : null).filter(Boolean);
  card.querySelector(".pq-fb").innerHTML = '<p class="veredicto ' + (ok ? "si" : "no") + '">' + (ok ? "✓ Correcto." : "✗ No es esa. " + (letras.length > 1 ? "Las correctas son " + letras.join(" y ") : "La correcta es la " + letras[0]) + ".") +
    '</p><p class="pq-exp">' + md(q.exp) + "</p>";
  return ok;
}
function botonTraza(card, q) {
  if (!q.traza) return null;
  const b = document.createElement("button");
  b.type = "button"; b.className = "tz-b"; b.textContent = "Ver cómo se ejecuta";
  b.addEventListener("click", () => {
    const caja = card.querySelector(".pq-traza");
    if (caja.childElementCount) { caja.innerHTML = ""; b.textContent = "Ver cómo se ejecuta"; return; }
    const div = document.createElement("div"); caja.appendChild(div);
    renderTraza({ model: { get: k => k === "config" ? q.traza.config : k === "traza" ? q.traza.traza : undefined }, el: div });
    b.textContent = "Ocultar la ejecución";
  });
  return b;
}

// El banco vive en datos/<banco>.json (lo escribe herramientas/preguntas.py); se carga una vez por página.
const BANCOS = {};
function cargaBanco(C) {
  // el módulo se sirve desde <web>/_public/: los datos están en <web>/datos/
  const url = C.datos || new URL("../datos/" + (C.banco || "pcep") + ".json", import.meta.url).href;
  if (!BANCOS[url]) BANCOS[url] = fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  return BANCOS[url];
}
function renderPreguntas({ model, el }) {
  const C = model.get("config") || {};
  el.innerHTML = "<style>" + ESTILOS + '</style><div class="tz pq"><p class="tz-vacio">Cargando las preguntas…</p></div>';
  const raiz = el.querySelector(".pq");
  let limpia = null, vivo = true;
  cargaBanco(C).then(datos => {
    if (!vivo) return;
    const nombres = datos.secciones || {};
    const todas = (datos.preguntas || []).map(q => ({ ...q, secNombre: nombres[q.sec] ? "Sección " + q.sec + " · " + nombres[q.sec] : "Sección " + q.sec }));
    const banco = C.modo === "simulacro" ? todas : todas.filter(q => q.cap === C.capitulo);
    if (!banco.length) { raiz.innerHTML = '<p class="tz-vacio">Este capítulo todavía no tiene preguntas.</p>'; return; }
    limpia = C.modo === "simulacro" ? simulacro(raiz, { reparto: datos.reparto, ...C }, banco, nombres) : porCapitulo(raiz, C, banco);
  }).catch(() => { raiz.innerHTML = '<p class="tz-vacio">No se han podido cargar las preguntas. Comprueba la conexión y recarga la página.</p>'; });
  return () => { vivo = false; if (typeof limpia === "function") limpia(); };
}

function porCapitulo(raiz, C, banco) {
  let hechas = 0, bien = 0;
  raiz.innerHTML = '<div class="pq-cab"><span class="tz-tit">' + esc(C.titulo || "Preguntas tipo examen") + '</span><span class="tz-etq">' + esc(C.etiqueta || "PCEP") + "</span></div>" +
    '<p class="tz-idea">' + md(C.idea || "Elige una respuesta y pulsa «Comprobar». Si fallas, mira la explicación y, en las de código, cómo se ejecuta paso a paso.") + "</p>" +
    banco.map((q, i) => tarjetaPregunta(q, i + 1, banco.length, q.ops.map((t, j) => ({ texto: t, original: j })))).join("") +
    '<p class="pq-marcador" aria-live="polite"></p>';
  const marcador = raiz.querySelector(".pq-marcador");
  const pinta = () => { marcador.textContent = hechas ? "Llevas " + bien + " de " + hechas + " bien" + (hechas === banco.length ? " · " + Math.round(100 * bien / banco.length) + " %" : "") : ""; };
  raiz.querySelectorAll(".pq-card").forEach((card, i) => {
    const q = banco[i], acc = card.querySelector(".pq-acc"), aviso = card.querySelector(".pq-aviso");
    const comprobar = document.createElement("button");
    comprobar.type = "button"; comprobar.className = "tz-b prim"; comprobar.textContent = "Comprobar";
    acc.appendChild(comprobar);
    card.querySelectorAll("input").forEach(inp => inp.addEventListener("change", () => { aviso.textContent = ""; }));
    comprobar.addEventListener("click", () => {
      const sel = elegidas(card);
      if (!sel.length) { aviso.textContent = "Elige una respuesta primero."; return; }
      const n = correctasDe(q).length;
      if (n > 1 && sel.length !== n) { aviso.textContent = "Esta pregunta pide " + n + " respuestas."; return; }
      hechas++; if (corrige(card, q, sel)) bien++;
      comprobar.remove();
      const t = botonTraza(card, q); if (t) acc.appendChild(t);
      pinta();
    });
  });
}

function simulacro(raiz, C, banco, nombres) {
  const reparto = C.reparto || {}, n = C.n || 35, minutos = C.minutos || 50, aprobado = C.aprobado || 70;
  let ronda = null, actual = 0, timer = null, fin = 0, avisoEntrega = false;

  function portada() {
    para();
    raiz.innerHTML = '<div class="pq-cab"><span class="tz-tit">' + esc(C.titulo || "Simulacro") + '</span><span class="tz-etq">' + esc(C.etiqueta || "") + "</span></div>" +
      '<p class="tz-idea">' + md(C.idea || "") + "</p>" +
      '<table class="pq-tabla"><tr><th>Sección</th><th>Preguntas</th></tr>' + Object.keys(reparto).map(s => "<tr><td>" + s + " · " + esc(nombres[s] || "") + "</td><td>" + reparto[s] + "</td></tr>").join("") +
      "<tr><td><b>Total</b></td><td><b>" + n + "</b></td></tr></table>" +
      '<p>' + n + " preguntas · " + minutos + " minutos · para aprobar, " + aprobado + " %. Cada simulacro saca preguntas distintas del banco, que tiene " + banco.length + ".</p>" +
      '<div class="pq-acc"><button type="button" class="tz-b prim pq-empezar">Empezar el simulacro</button></div>';
    raiz.querySelector(".pq-empezar").addEventListener("click", empezar);
  }
  function empezar() {
    const elegidasR = [];
    for (const s of Object.keys(reparto)) elegidasR.push(...barajar(banco.filter(q => String(q.sec) === String(s))).slice(0, reparto[s]));
    ronda = barajar(elegidasR).map(q => ({ q, orden: barajar(q.ops.map((t, j) => ({ texto: t, original: j }))), sel: [], marcada: false }));
    actual = 0; avisoEntrega = false;
    fin = Date.now() + minutos * 60000;
    timer = setInterval(reloj, 1000);
    pintaPregunta();
  }
  function para() { if (timer) { clearInterval(timer); timer = null; } }
  function reloj() {
    const r = raiz.querySelector(".pq-reloj"), quedan = Math.max(0, fin - Date.now());
    if (r) { const m = Math.floor(quedan / 60000), sg = Math.floor(quedan / 1000) % 60; r.textContent = String(m).padStart(2, "0") + ":" + String(sg).padStart(2, "0"); r.classList.toggle("poco", quedan < 5 * 60000); }
    if (quedan <= 0) entregar(true);
  }
  function guarda() {
    const card = raiz.querySelector(".pq-card");
    if (card && ronda) ronda[actual].sel = elegidas(card);
  }
  function pintaPregunta() {
    const R = ronda[actual];
    raiz.innerHTML = '<div class="pq-cab"><span class="pq-marcador">' + esc(C.titulo || "Simulacro") + '</span><span class="pq-reloj" aria-live="off">--:--</span></div>' +
      '<div class="pq-rejilla">' + ronda.map((x, i) => '<button type="button" data-i="' + i + '" class="' + (x.sel.length ? "hecha " : "") + (x.marcada ? "marcada " : "") + (i === actual ? "actual" : "") + '" aria-label="Ir a la pregunta ' + (i + 1) + '">' + (i + 1) + "</button>").join("") + "</div>" +
      tarjetaPregunta({ ...R.q, secNombre: "" }, actual + 1, ronda.length, R.orden) +
      '<div class="pq-acc"><button type="button" class="tz-b pq-ant">◀ Anterior</button><button type="button" class="tz-b prim pq-sig">Siguiente ▶</button>' +
      '<button type="button" class="tz-b pq-marca">' + (R.marcada ? "Quitar la marca" : "Marcar para revisar") + '</button><button type="button" class="tz-b pq-entregar">Entregar</button></div>' +
      '<p class="pq-aviso pq-aviso-entrega" role="alert"></p>';
    const card = raiz.querySelector(".pq-card");
    card.querySelectorAll("input").forEach(inp => { if (R.sel.includes(+inp.value)) inp.checked = true; inp.addEventListener("change", () => { guarda(); refrescaRejilla(); }); });
    raiz.querySelector(".pq-ant").disabled = actual === 0;
    raiz.querySelector(".pq-sig").disabled = actual === ronda.length - 1;
    raiz.querySelector(".pq-ant").addEventListener("click", () => { guarda(); actual--; pintaPregunta(); });
    raiz.querySelector(".pq-sig").addEventListener("click", () => { guarda(); actual++; pintaPregunta(); });
    raiz.querySelector(".pq-marca").addEventListener("click", () => { guarda(); R.marcada = !R.marcada; pintaPregunta(); });
    raiz.querySelector(".pq-entregar").addEventListener("click", () => { guarda(); entregar(false); });
    raiz.querySelectorAll(".pq-rejilla button").forEach(b => b.addEventListener("click", () => { guarda(); actual = +b.dataset.i; pintaPregunta(); }));
    reloj();
  }
  function refrescaRejilla() {
    raiz.querySelectorAll(".pq-rejilla button").forEach((b, i) => b.classList.toggle("hecha", ronda[i].sel.length > 0));
  }
  function entregar(porTiempo) {
    const sin = ronda.filter(x => !x.sel.length).length;
    if (!porTiempo && sin && !avisoEntrega) {
      avisoEntrega = true;
      raiz.querySelector(".pq-aviso-entrega").textContent = "Te quedan " + sin + (sin === 1 ? " pregunta" : " preguntas") + " sin responder. Si quieres terminar igualmente, pulsa otra vez «Entregar».";
      return;
    }
    para();
    const res = ronda.map(x => acierta(x.q, x.sel));
    const bien = res.filter(Boolean).length, pct = Math.round(100 * bien / ronda.length), apto = pct >= aprobado;
    const porSec = {};
    ronda.forEach((x, i) => { const s = x.q.sec; porSec[s] = porSec[s] || [0, 0]; porSec[s][1]++; if (res[i]) porSec[s][0]++; });
    const flojas = Object.keys(porSec).filter(s => porSec[s][0] / porSec[s][1] < aprobado / 100);
    raiz.innerHTML = '<div class="pq-cab"><span class="tz-tit">Resultado</span><span class="tz-etq">' + (porTiempo ? "se acabó el tiempo" : "entregado") + "</span></div>" +
      '<p><span class="pq-nota ' + (apto ? "si" : "no") + '">' + pct + " %</span>  " + bien + " de " + ronda.length + " · " + (apto ? "<b>Aprobado</b>" : "<b>Todavía no</b>: hace falta un " + aprobado + " %") + "</p>" +
      '<table class="pq-tabla"><tr><th>Sección</th><th>Aciertos</th><th></th></tr>' + Object.keys(porSec).sort().map(s => {
        const [a, t] = porSec[s], f = a / t;
        return "<tr><td>" + s + " · " + esc(nombres[s] || "") + "</td><td>" + a + " / " + t + '</td><td><div class="pq-barra"><span class="' + (f < aprobado / 100 ? "baja" : "") + '" style="width:' + Math.round(100 * f) + '%"></span></div></td></tr>';
      }).join("") + "</table>" +
      (flojas.length ? '<p class="tz-idea">Repasa ' + (flojas.length === 1 ? "la sección " : "las secciones ") + flojas.map(s => s + " (" + esc(nombres[s] || "") + ")").join(", ") + ".</p>" : '<p class="tz-idea">Todas las secciones por encima del ' + aprobado + " %.</p>") +
      '<div class="pq-acc"><button type="button" class="tz-b prim pq-otra">Hacer otro simulacro</button></div>' +
      '<p class="tz-micro">Revisión · ' + (ronda.length - bien) + " fallos</p>" +
      ronda.map((x, i) => res[i] ? "" : tarjetaPregunta(x.q, i + 1, ronda.length, x.orden)).join("");
    raiz.querySelector(".pq-otra").addEventListener("click", portada);
    raiz.querySelectorAll(".pq-card").forEach(card => {
      const x = ronda.find(r => r.q.id === card.dataset.id);
      card.querySelectorAll("input").forEach(inp => { if (x.sel.includes(+inp.value)) inp.checked = true; });
      corrige(card, x.q, x.sel);
      if (!x.sel.length) card.querySelector(".pq-fb .veredicto").textContent = "Sin responder. " + card.querySelector(".pq-fb .veredicto").textContent.replace("✗ No es esa. ", "");
      const t = botonTraza(card, x.q); if (t) card.querySelector(".pq-acc").appendChild(t);
    });
  }
  portada();
  return () => para();
}

// ── Laboratorio: el alumno escribe su programa y lo ve ejecutarse ─────────────────────────
// Python corre en el navegador (Pyodide, en un Web Worker para que un bucle sin fin no
// congele la página). El worker carga herramientas/trazar.py y herramientas/laboratorio.py,
// que la publicación copia en <web>/datos/, y devuelve la misma traza que pinta renderTraza.
// Python se sirve junto al libro (la publicación copia Pyodide en <web>/pyodide/); si no está, de la CDN.
const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.29.5/full/";
function basePyodide() {
  const local = new URL("../pyodide/", import.meta.url).href;
  return fetch(local + "pyodide.js", { method: "HEAD" }).then(r => r.ok ? local : PYODIDE_CDN).catch(() => PYODIDE_CDN);
}
const LAB_EJEMPLOS = [
  { nombre: "Enteros, fracciones y decimales", codigo: "a = 2^10\nb = 1/3 + 1/6\nc = b + 0.5\na\nb\nc" },
  { nombre: "Un len() de Python entre números de Sage", codigo: "L = [1..5]\nn = len(L)\nm = n / 2\nk = L[0] / 2\nm\nk" },
  { nombre: "Factorizar y buscar primos", codigo: "n = 360\nfactor(n)\nn.divisors()\np = next_prime(n)\np.is_prime()" },
  { nombre: "La suma de 1/k, exacta", codigo: "s = 0\nfor k in [1..6]:\n    s = s + 1/k\ns\ns.n()" },
  { nombre: "Una función con fracciones", codigo: "def media(a, b):\n    return (a + b) / 2\n\nm = media(3, 4)\nd = media(0.5, 1)\nm\nd" },
  { nombre: "Algo que el laboratorio aún no sabe", codigo: "a = 2\nintegrate(x^a, x)" },
];
const LAB_ESTILOS = `
.lab .lab-fila{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.lab .lab-fila .tz-micro{ margin:0 !important; }
.lab select{ font:500 14px/1.2 var(--texto); padding:7px 10px; border:1px solid var(--filete); border-radius:6px; background:#fff; color:var(--tinta); max-width:100%; }
.lab .lab-ed{ display:flex; background:var(--fondo); }
.lab .lab-num{ margin:0; padding:10px 10px 10px 8px; font:400 14px/1.85 var(--mono); color:var(--filete); text-align:right; user-select:none; background:var(--fondo); border:0; border-radius:0; min-width:3.2ch; }
.lab textarea{ width:100%; border:0; outline:none; resize:none; background:transparent; color:var(--tinta); font:400 14px/1.85 var(--mono); padding:10px 12px 10px 4px; white-space:pre; overflow-x:auto; overflow-y:hidden; tab-size:4; }
.lab .lab-ed:focus-within{ box-shadow:inset 0 0 0 2px var(--acento); }
.lab details{ font-size:14px; }
.lab summary{ cursor:pointer; color:var(--oscuro); font-weight:600; }
.lab .lab-in{ margin-top:8px; border:1px solid var(--fila); background:#fff; padding:8px 10px; min-height:4.6em; overflow-y:auto; }
.lab .lab-acc{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.lab .lab-estado{ font-size:14px; color:var(--banda); }
.lab .lab-error{ border-left:4px solid var(--acento); background:var(--suave); padding:10px 12px; font-size:15px; }
.lab .lab-res:empty{ display:none; }
.lab .lab-res > .tz{ margin:0; }
.lab .lab-pista{ border:2px solid var(--tinta); background:#fff; }
.lab .lab-pista p{ padding:10px 12px; }
.lab .lab-tec{ margin-top:8px; font-size:12.5px; color:var(--banda); }
.lab .lab-tec code{ font:400 12px/1.4 var(--mono); }
.lab .tz-b[aria-pressed="true"]{ background:var(--tinta); color:#fff; }
.lab:fullscreen{ overflow:auto; padding:28px 4vw; border:0; border-radius:0; margin:0; }
.lab:fullscreen .lab-ed, .lab:fullscreen .lab-res{ zoom:1.3; }
.lab:fullscreen .tz-idea{ display:none; }
@media (max-width: 700px){ .lab{ padding:12px; } .lab .lab-acc .lab-estado{ flex-basis:100%; } }
`;
let LAB = null;   // { worker, listo }: un solo Python por página, cargado la primera vez
function trabajadorLab(PYODIDE) {
  const fuente = `importScripts("${PYODIDE}pyodide.js");
let py = null;
self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.tipo === "cargar") {
      py = await loadPyodide({ indexURL: "${PYODIDE}" });
      py.FS.mkdirTree("/lab");
      for (const [n, t] of Object.entries(m.fuentes)) py.FS.writeFile("/lab/" + n, t);
      py.runPython("import sys; sys.path.insert(0, '/lab'); import laboratorio");
      self.postMessage({ tipo: "listo" });
    } else {
      py.globals.set("codigo_lab", m.codigo);
      py.globals.set("entradas_lab", py.toPy(m.entradas));
      self.postMessage({ tipo: "hecho", json: py.runPython("laboratorio.laboratorio(codigo_lab, entradas_lab)") });
    }
  } catch (err) { self.postMessage({ tipo: "fallo", error: String(err) }); }
};`;
  return new Worker(URL.createObjectURL(new Blob([fuente], { type: "text/javascript" })));
}
// El mini-Sage y el trazador se publican en <web>/lab/ (véase .github/workflows/publicar.yml).
const LAB_FICHEROS = ["trazar.py", "laboratorio.py", "minisage.py", "preparse_sage.py", "nombres_sage.json"];
function preparaLab() {
  if (LAB) return LAB.listo;
  const leer = n => fetch(new URL("../lab/" + n, import.meta.url)).then(r => { if (!r.ok) throw new Error("No encuentro " + n); return r.text(); });
  let w = null;
  const listo = Promise.all([Promise.all(LAB_FICHEROS.map(leer)), basePyodide()]).then(([textos, base]) => new Promise((res, rej) => {
    w = trabajadorLab(base); LAB.worker = w;
    w.onmessage = e => e.data.tipo === "listo" ? res() : rej(new Error(e.data.error));
    w.onerror = ev => rej(new Error(ev.message || "No se ha podido cargar Python"));
    w.postMessage({ tipo: "cargar", fuentes: Object.fromEntries(LAB_FICHEROS.map((n, i) => [n, textos[i]])) });
  }));
  LAB = { worker: null, listo };
  listo.catch(() => { if (w) w.terminate(); LAB = null; });
  return listo;
}
function ejecutaLab(codigo, entradas, ms = 12000) {
  return preparaLab().then(() => new Promise((res, rej) => {
    const w = LAB.worker;
    const reloj = setTimeout(() => { w.terminate(); LAB = null; rej(new Error("tiempo")); }, ms);
    w.onmessage = e => {
      clearTimeout(reloj);
      if (e.data.tipo === "hecho") res(JSON.parse(e.data.json)); else rej(new Error(e.data.error));
    };
    w.postMessage({ tipo: "ejecutar", codigo, entradas });
  }));
}

function renderLaboratorio({ model, el }) {
  const C = model.get("config") || {};
  const GUARDA = "acinstitut-sage-laboratorio";
  const lee = k => { try { return localStorage.getItem(GUARDA + k); } catch (e) { return null; } };
  const escribe = (k, v) => { try { localStorage.setItem(GUARDA + k, v); } catch (e) { /* sin almacenamiento */ } };
  el.innerHTML = "<style>" + ESTILOS + LAB_ESTILOS + "</style>" +
    '<div class="tz lab">' +
    '<div class="tz-cab"><span class="tz-tit">' + esc(C.titulo || "Laboratorio") + '</span><span class="tz-etq">' + esc(C.etiqueta || "tu código, paso a paso") + "</span></div>" +
    '<p class="tz-idea">Escribe un programa o elige un ejemplo, pulsa «Ejecutar y ver» y recórrelo paso a paso. Se ejecuta aquí mismo, en tu navegador, con un Sage pequeño (enteros, fracciones y decimales): tu código no sale de tu ordenador. Para todo lo demás, pulsa «Sage real».</p>' +
    '<div class="lab-fila"><label class="tz-micro" for="lab-ej">Ejemplos</label><select class="lab-ej" id="lab-ej"><option value="">Elige un ejemplo…</option>' +
    LAB_EJEMPLOS.map((x, i) => '<option value="' + i + '">' + esc(x.nombre) + "</option>").join("") + "</select></div>" +
    '<div class="tz-caja"><div class="tz-barra"><span>Tu programa</span><span class="lab-lineas"></span></div>' +
    '<div class="lab-ed"><pre class="lab-num" aria-hidden="true"></pre><textarea class="lab-cod" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Tu programa en Sage"></textarea></div></div>' +
    '<details class="lab-ent"><summary>Si tu programa usa input()</summary><p>Escribe lo que se teclearía en cada <code>input()</code>, una respuesta por línea.</p>' +
    '<textarea class="lab-in" spellcheck="false" aria-label="Respuestas para input()"></textarea></details>' +
    '<div class="lab-acc"><button type="button" class="tz-b prim lab-run">Ejecutar y ver</button><button type="button" class="tz-b lab-real" aria-expanded="false">Sage real</button><button type="button" class="tz-b lab-proy" aria-pressed="false">Proyectar</button><span class="lab-estado" aria-live="polite"></span></div>' +
    '<div class="tz-real lab-celda"></div><div class="lab-res"></div></div>';
  const q = s => el.querySelector(s);
  const cod = q(".lab-cod"), num = q(".lab-num"), ent = q(".lab-in"), res = q(".lab-res"), estado = q(".lab-estado"), boton = q(".lab-run");
  function ajusta() {
    const n = cod.value.split("\n").length;
    num.textContent = Array.from({ length: n }, (_, i) => i + 1).join("\n");
    cod.rows = Math.max(8, n + 1);
    q(".lab-lineas").textContent = n === 1 ? "1 línea" : n + " líneas";
  }
  function pon(ejemplo) {
    cod.value = ejemplo.codigo; ent.value = ejemplo.entradas || "";
    q(".lab-ent").open = !!ejemplo.entradas;
    ajusta(); escribe("codigo", cod.value); escribe("entradas", ent.value); res.innerHTML = "";
  }
  cod.value = lee("codigo") || LAB_EJEMPLOS[0].codigo;
  ent.value = lee("entradas") || "";
  if (ent.value) q(".lab-ent").open = true;
  ajusta();
  // Proyectar: el laboratorio a pantalla completa y con letra grande (Esc para salir)
  const proy = q(".lab-proy"), caja = q(".lab");
  if (!document.fullscreenEnabled || !caja.requestFullscreen) proy.remove();
  else {
    proy.addEventListener("click", () => {
      if (document.fullscreenElement) document.exitFullscreen(); else caja.requestFullscreen().catch(() => {});
    });
    document.addEventListener("fullscreenchange", () => {
      const on = !!document.fullscreenElement;
      proy.setAttribute("aria-pressed", on ? "true" : "false");
      proy.textContent = on ? "Salir de la proyección" : "Proyectar";
    });
  }
  const real = q(".lab-real");
  let cajaReal = null;
  real.addEventListener("click", () => {
    if (cajaReal) { cierraSageReal(cajaReal, q(".lab-celda")); cajaReal = null; real.setAttribute("aria-expanded", "false"); real.textContent = "Sage real"; return; }
    real.setAttribute("aria-expanded", "true"); real.textContent = "Cerrar Sage real";
    cajaReal = abreSageReal(q(".lab-celda"), cod.value);
  });
  q(".lab-ej").addEventListener("change", e => { if (e.target.value !== "") pon(LAB_EJEMPLOS[+e.target.value]); });
  cod.addEventListener("input", () => { ajusta(); escribe("codigo", cod.value); });
  ent.addEventListener("input", () => escribe("entradas", ent.value));
  // Tab sangra cuatro espacios; Intro conserva la sangría (y la aumenta tras «:»)
  cod.addEventListener("keydown", e => {
    const ini = cod.selectionStart, fin = cod.selectionEnd, v = cod.value;
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      cod.setRangeText("    ", ini, fin, "end");
    } else if (e.key === "Enter" && !e.isComposing) {
      const linea = v.slice(v.lastIndexOf("\n", ini - 1) + 1, ini);
      let sangria = linea.match(/^ */)[0];
      if (/:\s*$/.test(linea)) sangria += "    ";
      e.preventDefault();
      cod.setRangeText("\n" + sangria, ini, fin, "end");
    } else return;
    ajusta(); escribe("codigo", cod.value);
  });
  boton.addEventListener("click", () => {
    const entradas = ent.value === "" ? [] : ent.value.replace(/\n$/, "").split("\n");
    const sinComentarios = cod.value.split("\n").map(l => l.replace(/#.*$/, "")).join("\n");
    if (/\binput\s*\(/.test(sinComentarios) && !entradas.length) {
      q(".lab-ent").open = true;
      res.innerHTML = '<p class="lab-error">Tu programa usa <code>input()</code>. Escribe en el recuadro de arriba lo que se teclearía, una respuesta por línea, y vuelve a pulsar «Ejecutar y ver».</p>';
      ent.focus();
      return;
    }
    boton.disabled = true; res.innerHTML = "";
    estado.textContent = LAB ? "Ejecutando…" : "Preparando Python y el mini-Sage en tu navegador. La primera vez tarda unos segundos…";
    const listo = LAB ? Promise.resolve() : preparaLab().then(() => { estado.textContent = "Ejecutando…"; });
    listo.then(() => ejecutaLab(cod.value, entradas)).then(r => {
      estado.textContent = "";
      if (r.error) {
        res.innerHTML = '<p class="lab-error">' + esc(r.error) + "</p>" +
          (r.interno ? '<p class="lab-tec">Detalle técnico: <code>' + esc(r.interno) + "</code></p>" : "");
        return;
      }
      const div = document.createElement("div"); res.appendChild(div);
      renderTraza({ model: { get: k => k === "config" ? r.config : k === "traza" ? r.traza : undefined }, el: div });
      if (r.pista) {
        const caja = document.createElement("div"); caja.className = "tz-caja lab-pista";
        caja.innerHTML = '<div class="tz-barra negro"><span>Pista</span><span>para el error del final</span></div><p>' + esc(r.pista) + "</p>";
        res.appendChild(caja);
      }
      const pasos = r.traza.pasos.length - 1;
      const cortado = /se ha detenido al llegar a \d+ pasos/.test(r.traza.pasos[pasos].salida || "");
      estado.textContent = cortado
        ? "Detenido a los " + pasos + " pasos: parece un bucle que no termina. Recórrelo para ver por qué."
        : pasos + (pasos === 1 ? " paso" : " pasos") + ". Pulsa «Paso ▶» para empezar.";
      res.scrollIntoView({ behavior: "smooth", block: "start" });
    }).catch(err => {
      estado.textContent = "";
      const msg = err.message === "tiempo"
        ? "Tu programa ha tardado demasiado y lo he detenido. ¿Hay un bucle que no termina nunca?"
        : /Python|Error|error/.test(err.message) && LAB
          ? "Este programa todavía no se puede visualizar en el laboratorio. Pruébalo con «Sage real» y, si puedes, pásaselo a tu profesor."
          : "No se ha podido cargar Python en este navegador. Comprueba la conexión (la primera vez hay que descargarlo) y vuelve a intentarlo.";
      res.innerHTML = '<p class="lab-error">' + esc(msg) + "</p>";
    }).finally(() => { boton.disabled = false; });
  });
}

function render({ model, el }) {
  const C0 = model.get("config") || {};
  if (C0.tipo === "preguntas") return renderPreguntas({ model, el });
  if (C0.tipo === "laboratorio") return renderLaboratorio({ model, el });
  const archivo = model.get("archivo");
  if (!model.get("traza") && archivo) {
    // la traza está en su propio archivo JSON (en datos/trazas/): se descarga al abrir la página
    el.textContent = "Cargando el visualizador…";
    let limpia = null;
    fetch(new URL("../" + archivo, import.meta.url))
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(D => { limpia = renderTraza({ model: { get: k => k === "traza" ? D : model.get(k) }, el }); })
      .catch(() => { el.textContent = "No se ha podido cargar el visualizador (" + archivo + ")."; });
    return () => { if (typeof limpia === "function") limpia(); };
  }
  return renderTraza({ model, el });
}

function renderTraza({ model, el }) {
  const C = model.get("config") || {};
  const D = model.get("traza");
  if (!D || !D.pasos) { el.textContent = "Falta la traza: ejecuta herramientas/trazar.py sobre este capítulo."; return; }
  el.innerHTML = "<style>" + ESTILOS + "</style>" + PLANTILLA;
  const q = s => el.querySelector(s);
  const P = D.pasos, L = D.codigo.split("\n"), lista = C.lista, cab = C.cabecera;
  const columnas = C.columnas.concat(C.fila_en === "comprobacion" ? ["¿sigue?"] : []);
  // valor tal como lo escribe Python (True, 4.0, 'texto'), si la traza lo trae
  const rep = (p, n) => (p.repr && n in p.repr) ? p.repr[n] : pyVal(p.estado[n]);
  const sangria = l => l.length - l.trimStart().length;
  // ¿el bucle de la línea n tiene else? (la línea con su misma sangría tras el cuerpo)
  function tieneElse(nLinea) {
    const s0 = sangria(L[nLinea - 1]);
    for (let j = nLinea; j < L.length; j++) {
      if (!L[j].trim()) continue;
      if (sangria(L[j]) <= s0) return sangria(L[j]) === s0 && /^else\s*:/.test(L[j].trim());
    }
    return false;
  }
  // el for / while que contiene la línea n
  function bucleDe(nLinea) {
    let s0 = sangria(L[nLinea - 1]);
    for (let j = nLinea - 2; j >= 0; j--) {
      if (!L[j].trim() || sangria(L[j]) >= s0) continue;
      s0 = sangria(L[j]);
      if (/^(for|while)\b/.test(L[j].trim())) return j + 1;
    }
    return null;
  }
  // ¿qué función de Python ha llamado a la lambda? (sorted, map, filter…)
  const quienLlama = t => (t.match(/\b(sorted|map|filter|max|min|sort)\(/) || [])[1];
  const PAPEL = { sorted: "sorted lo usa como clave para ordenar", sort: "sort lo usa como clave para ordenar",
    map: "map lo guarda para el resultado", filter: "filter lo usa para decidir si el elemento se queda (True) o no (False)",
    max: "max lo usa como clave para comparar", min: "min lo usa como clave para comparar" };
  const MODOS = { r: "para leer", w: "para escribir (si ya existía, se vacía)", a: "para añadir al final", x: "para crearlo (falla si ya existe)",
    rb: "para leer bytes (modo binario)", wb: "para escribir bytes (modo binario)", ab: "para añadir bytes al final" };
  const esFichero = v => v && typeof v === "object" && typeof v.__txt__ === "string" && v.__txt__.startsWith("fichero");
  const discoIgual = (a, b) => igual(a || [], b || []);
  // variables globales que apuntan al objeto nº n
  const etiquetas = (p, n) => Object.keys(p.estado).filter(c => esObj(p.estado[c]) && p.estado[c].__obj__ === n);
  const codigos = ns => "<code>" + ns.join("</code> y <code>") + "</code>";
  // un objeto dibujado como tarjeta: «Cuenta nº1» y sus atributos; se resaltan los que acaban de cambiar
  function tarjeta(v, antes, ocultar) {
    const pa = antes && antes.__obj__ === v.__obj__ ? antes.attrs : null;
    const filas = Object.keys(v.attrs).map(a => {
      const cambia = pa !== null && !igual(pa[a], v.attrs[a]);
      return '<span class="attr' + (cambia ? " cambia" : "") + '"><span class="an">.' + esc(a) + " =</span> " + esc(ocultar && cambia ? "?" : pyVal(v.attrs[a])) + "</span>";
    }).join("");
    return '<span class="obj"><span class="obj-n">' + esc(v.__clase__) + " nº" + v.__obj__ + "</span>" + (filas || '<span class="attr vacio">sin atributos todavía</span>') + "</span>";
  }
  // qué ha cambiado dentro de un objeto (mismo número) entre dos pasos
  function cambioAtributo(prefijo, a, b, p) {
    const nuevo = Object.keys(b.attrs).find(x => !(x in a.attrs));
    const camb = Object.keys(b.attrs).find(x => (x in a.attrs) && !igual(a.attrs[x], b.attrs[x]));
    const obj = b.__clase__ + " nº" + b.__obj__;
    const et = etiquetas(p, b.__obj__);
    const comparten = et.length > 1 ? " Como " + codigos(et) + " son etiquetas de ese mismo objeto, " + (et.length === 2 ? "las dos ven" : "todas ven") + " el cambio." : "";
    const mangle = nuevo !== undefined && nuevo.match(/^_(\w+?)__(\w+)$/);
    if (mangle) return "En el código pone <code>" + prefijo + ".__" + mangle[2] + "</code>, pero Python lo guarda como <code>" + nuevo + "</code> = " + esc(pyVal(b.attrs[nuevo])) +
      ". Es la <b>desfiguración de nombres</b> (name mangling): un atributo que empieza por dos guiones bajos se rebautiza con el nombre de la clase, y desde fuera <code>.__" + mangle[2] + "</code> ya no existe.";
    if (nuevo !== undefined) return "Se crea el atributo <code>" + prefijo + "." + nuevo + "</code> = " + esc(pyVal(b.attrs[nuevo])) + ": queda guardado dentro del objeto " + obj + "." + comparten;
    if (camb !== undefined) return "El atributo <code>" + prefijo + "." + camb + "</code> del objeto " + obj + " cambia: valía " + esc(pyVal(a.attrs[camb])) + " y ahora vale " + esc(pyVal(b.attrs[camb])) + "." + comparten;
    return null;
  }
  // ¿este if tiene más ramas (elif / else) detrás?
  function tieneRamas(nLinea) {
    const s0 = sangria(L[nLinea - 1]);
    for (let j = nLinea; j < L.length; j++) {
      if (!L[j].trim()) continue;
      if (sangria(L[j]) < s0) return false;
      if (sangria(L[j]) === s0) return /^(elif|else)\b/.test(L[j].trim());
    }
    return false;
  }
  let k = 0, oculto = false, timer = null;

  q(".tz-tit").textContent = C.titulo || "";
  q(".tz-etq").textContent = C.etiqueta || "";
  q(".tz-idea").textContent = C.idea || "";
  q(".tz-nom").textContent = lista;
  const porLinea = C.fila_en === "cada_linea";
  const conMarcos = P.some(x => x.pila && x.pila.length);
  const hayDisco = P.some(x => x.disco);
  const hayClases = P.some(x => x.clases && Object.keys(x.clases).length);
  if (!hayClases) q(".tz-clases-bloque").style.display = "none";
  const hayHerencia = /^class\s+\w+\s*\(\s*\w/m.test(D.codigo);
  const casillasDe = v => typeof v === "string" ? Array.from(v) : (v && v.__bytes__) ? v.__bytes__ : v;
  if (!hayDisco) q(".tz-disco-bloque").style.display = "none";
  if (conMarcos) q(".tz-vars-tit").textContent = "Variables globales";
  if (!C.diccionario) q(".tz-dic-bloque").style.display = "none"; else q(".tz-dic-nom").textContent = C.diccionario;
  const ocultas = new Set(C.diccionario ? [C.diccionario] : []);
  const marco = p => (p.pila && p.pila.length) ? p.pila[p.pila.length - 1] : null;
  const parametros = m => m.args.concat(Object.keys(m.estrella || {}));
  const firma = m => m.nombre + "(" + parametros(m).map(a => ((m.estrella || {})[a] || "") + a + "=" + (m.repr[a] ?? "?")).join(", ") + ")";
  const EXPLICA_ESTRELLA = { "*": "el <code>*</code> junta todos los argumentos sueltos en una tupla", "**": "el <code>**</code> junta los argumentos con nombre en un diccionario" };
  if (!C.matriz) q(".tz-mat-bloque").style.display = "none"; else q(".tz-mat-nom").textContent = C.matriz;
  if (!lista) q(".tz-lista-bloque").style.display = "none";
  q(".tz-tabla-sub").textContent = porLinea ? "una fila por línea ejecutada" : "una fila por vuelta";
  q(".tz-nota-tabla").textContent = porLinea
    ? "Cada fila es el estado de las variables justo después de ejecutar esa línea: así se hace una traza a mano."
    : C.fila_en === "comprobacion"
      ? "En el while, la fila se escribe cada vez que se comprueba la condición."
      : "La fila de cada vuelta se escribe al terminarla, cuando el for vuelve a la cabecera.";

  const salida = t => t.split("\n").filter(Boolean);
  const saleDelBucle = (p, sig) => p.linea === cab && !p.cond && (!sig || sig.linea !== cab + 1);

  function narra(p, prev, sig) {
    if (p.linea === null) return "El programa está listo. Pulsa «Paso» para ejecutar la primera línea.";
    const mp = marco(p), mprev = marco(prev);
    const txt0 = L[p.linea - 1].trim();
    if (p.excepcion) {
      const sigTxt = sig && sig.linea ? L[sig.linea - 1].trim() : "";
      let h = txt0.startsWith("raise")
        ? "<code>raise</code> lanza una excepción a propósito: <code>" + esc(p.excepcion) + "</code>."
        : "⚠ Esta línea produce un error: <code>" + esc(p.excepcion) + "</code>.";
      if (txt0.startsWith("assert")) h = "<code>assert</code> comprueba <code>" + esc(txt0.slice(7).split(/,\s*["']/)[0]) + "</code> y resulta <b>False</b>: lanza <code>" + esc(p.excepcion) + "</code>.";
      if (sig && sig.devuelve && sig.devuelve.error) h += " La función se interrumpe aquí: lo que queda de ella ya no se ejecuta.";
      else if (!sig) h += " Nadie atiende el error: el programa se detiene aquí y Sage escribe el <b>traceback</b> en la consola.";
      else if (sigTxt.startsWith("except")) h += " Python abandona el resto del <code>try</code> y busca un <code>except</code> que encaje.";
      return h;
    }
    if (p.devuelve && p.devuelve.error) {
      return "La función <code>" + p.devuelve.funcion + "</code> se interrumpe por el error: no llega al <code>return</code> y no devuelve nada. Su marco desaparece y la excepción sale hacia la línea que la llamó." +
        (!sig ? " Allí tampoco la atiende nadie: el programa se detiene y en la pantalla aparece el <b>traceback</b>. Se lee de abajo arriba: la última línea dice qué error ha sido, y las de encima, por dónde ha pasado." : "");
    }
    if (p.devuelve && p.devuelve.pausa) {
      const recibe = Object.keys(p.estado).filter(n => !igual(p.estado[n], prev.estado[n]));
      return "<code>yield</code> entrega " + esc(p.devuelve.valor) + (recibe.length ? ", que llega a <code>" + recibe[0] + "</code>" : "") +
        ". El generador <code>" + p.devuelve.funcion + "</code> no termina: se queda <b>en pausa</b> justo aquí, guardando sus variables, hasta que le pidan el siguiente valor.";
    }
    if (p.devuelve && p.devuelve.gen) {
      return "El generador <code>" + p.devuelve.funcion + "</code> llega al final sin otro <code>yield</code>: ya no le quedan valores. Quien lo recorría (el <code>for</code>) se da cuenta y termina.";
    }
    if (p.devuelve && p.devuelve.funcion === "<lambda>") {
      const quien = quienLlama(txt0);
      const recibe = Object.keys(p.estado).filter(n => !igual(p.estado[n], prev.estado[n]));
      return "La lambda devuelve " + esc(p.devuelve.valor) + (quien ? ": " + PAPEL[quien] + "." : ".") +
        (recibe.length ? " Ya no quedan elementos: " + (quien ? "<code>" + quien + "</code>" : "la función") + " termina y el resultado se guarda en <code>" + recibe[0] + "</code>." : "");
    }
    if (p.devuelve && p.devuelve.funcion.endsWith(".__init__")) {
      const recibe = Object.keys(p.estado).filter(n => !igual(p.estado[n], prev.estado[n]) && esObj(p.estado[n]));
      const ob = recibe.length ? p.estado[recibe[0]] : null;
      return "<code>__init__</code> termina: el objeto" + (ob ? " " + ob.__clase__ + " nº" + ob.__obj__ : "") + " ya tiene sus atributos. Su marco desaparece" +
        (recibe.length ? " y el objeto queda guardado en <code>" + recibe[0] + "</code>." : /\[/.test(txt0) ? ". El objeto queda en la lista que se está construyendo." : ".");
    }
    if (p.devuelve && p.devuelve.valor === "None" && p.devuelve.funcion.includes(".")) {
      return "El método <code>" + p.devuelve.funcion.split(".").pop() + "</code> termina. No tiene <code>return</code>, así que devuelve None: lo que cuenta es el cambio que ha dejado en el objeto. Su marco desaparece.";
    }
    if (p.devuelve) {
      let recibe = Object.keys(p.estado).filter(n => !igual(p.estado[n], prev.estado[n]));
      if (!recibe.length && mp) {
        const antes = (prev.pila || [])[p.pila.length - 1];
        if (antes) recibe = Object.keys(mp.vars).filter(n => !igual(mp.vars[n], antes.vars[n]));
      }
      return "La función <code>" + p.devuelve.funcion + "</code> termina y <b>devuelve " + esc(p.devuelve.valor) + "</b>. Su marco desaparece: sus variables locales ya no existen." +
        (recibe.length > 1 && /^\(/.test(p.devuelve.valor) ? " Devuelve varios valores juntos, en una tupla, y la tupla se <b>desempaqueta</b>: " + recibe.map(r => "<code>" + r + "</code> = " + esc(rep(p, r))).join(" y ") + "."
          : recibe.length ? " El resultado se guarda en <code>" + recibe[0] + "</code>." : mp ? " La función <code>" + mp.nombre + "</code> recibe el valor y sigue con su cálculo." : "");
    }
    if (L[p.linea - 1].trim().startsWith("def ")) {
      const nom = L[p.linea - 1].trim().slice(4).split("(")[0];
      if (mp && mp.vars[nom]) {
        const externas = Object.keys(mp.vars).filter(n => n !== nom);
        return "Dentro de <code>" + mp.nombre + "</code> se define otra función, <code>" + nom + "</code>." +
          (externas.length ? " Se lleva consigo las variables de fuera que usa (" + externas.map(n => "<code>" + n + "</code> = " + esc(mp.repr[n])).join(", ") + "): eso es un <b>cierre</b>." : "");
      }
      const esGen = (() => { const s0 = sangria(L[p.linea - 1]); for (let j = p.linea; j < L.length; j++) { if (!L[j].trim()) continue; if (sangria(L[j]) <= s0) break; if (/\byield\b/.test(L[j])) return true; } return false; })();
      if (esGen) return "Se define <code>" + nom + "</code>. Como dentro tiene <code>yield</code>, no es una función normal: es un <b>generador</b>. Llamarla no ejecuta nada todavía; irá entregando valores de uno en uno cuando se los pidan.";
      return "Se define la función <code>" + nom + "</code>: Python la guarda con ese nombre, pero todavía no ejecuta su cuerpo. Eso pasará cuando alguien la llame.";
    }
    if (txt0.startsWith("class ")) {
      const nom = txt0.slice(6).split(/[(:]/)[0].trim(), s0 = sangria(L[p.linea - 1]), mets = [];
      for (let j = p.linea; j < L.length; j++) {
        if (!L[j].trim()) continue;
        if (sangria(L[j]) <= s0) break;
        const m = L[j].trim().match(/^def\s+(\w+)/);
        if (m) mets.push(m[1]);
      }
      return "Se define la clase <code>" + nom + "</code>: es el molde." + (mets.length ? " Python guarda sus métodos (" + codigos(mets).replace(/<\/code> y <code>/g, "</code>, <code>") + ")," : "") + " pero todavía no existe ningún objeto.";
    }
    if (/^import\s/.test(txt0)) {
      const mods = txt0.slice(7).split(",").map(x => x.trim().split(/\s+as\s+/));
      if (mods.length === 1 && mods[0][1]) return "Se importa el módulo <code>" + mods[0][0] + "</code> con el alias <code>" + mods[0][1] + "</code>: sus herramientas se usan como <code>" + mods[0][1] + ".algo</code>.";
      if (mods.length === 1) {
        const uso = D.codigo.match(new RegExp("\\b" + mods[0][0] + "\\.(\\w+)"));
        return "Se importa el módulo <code>" + mods[0][0] + "</code>: a partir de ahora sus herramientas se escriben con el prefijo <code>" + mods[0][0] + ".</code>" + (uso ? ", como <code>" + mods[0][0] + "." + uso[1] + "</code>." : ".");
      }
      return "Se importan los módulos " + codigos(mods.map(m => m[0])) + ".";
    }
    if (/^from\s/.test(txt0)) {
      const m = txt0.match(/^from\s+([\w.]+)\s+import\s+(.+)$/);
      if (m) return "Del módulo <code>" + m[1] + "</code> se traen " + codigos(m[2].split(",").map(x => x.trim())) + ": se usan directamente, sin prefijo.";
    }
    if ((p.pila || []).length > (prev.pila || []).length && mp && mp.nombre.endsWith(".__init__") && esObj(mp.vars.self)) {
      const otros = mp.args.filter(a => a !== "self"), deClase = mp.nombre.split(".")[0];
      return "Se fabrica un objeto nuevo de la clase <code>" + mp.vars.self.__clase__ + "</code>: el <b>nº" + mp.vars.self.__obj__ + "</b>, todavía vacío. Python llama a <code>__init__</code> para rellenarlo: <code>self</code> es ese objeto nuevo" +
        (otros.length ? ", y llegan " + otros.map(a => "<code>" + a + "</code> = " + esc(mp.repr[a])).join(" y ") : "") + "." +
        (deClase !== mp.vars.self.__clase__ ? " <code>" + mp.vars.self.__clase__ + "</code> no tiene <code>__init__</code> propio: usa el que hereda de <code>" + deClase + "</code>." : "");
    }
    if ((p.pila || []).length > (prev.pila || []).length && mp && mp.args[0] === "self" && esObj(mp.vars.self)) {
      const ob = mp.vars.self, et = etiquetas(prev, ob.__obj__), otros = mp.args.filter(a => a !== "self");
      return "Se llama al método <code>" + mp.nombre.split(".").pop() + "</code> del objeto " + ob.__clase__ + " nº" + ob.__obj__ + (et.length ? " (el de " + codigos(et) + ")" : "") +
        ". Dentro del método, <code>self</code> es ese mismo objeto" + (otros.length ? ", y " + otros.map(a => "<code>" + a + "</code> = " + esc(mp.repr[a])).join(" y ") : "") + "." +
        (hayHerencia ? (mp.nombre.split(".")[0] !== ob.__clase__
          ? " <code>" + ob.__clase__ + "</code> no tiene su propio <code>" + mp.nombre.split(".").pop() + "</code>: Python sube a la clase madre y usa el de <code>" + mp.nombre.split(".")[0] + "</code>."
          : " Python busca el método primero en la clase del objeto, <code>" + ob.__clase__ + "</code>, y ahí lo encuentra.") : "");
    }
    if ((p.pila || []).length > (prev.pila || []).length && mp && mp.gen) {
      const pausas = P.slice(0, k0()).filter(x => x.devuelve && x.devuelve.pausa && x.devuelve.funcion === mp.nombre);
      const ultimaPausa = [...P.slice(0, k0())].reverse().find(x => x.devuelve && x.devuelve.funcion === mp.nombre);
      if (ultimaPausa && ultimaPausa.devuelve.pausa)
        return "El <code>for</code> pide el siguiente valor: el generador <code>" + mp.nombre + "</code> <b>se reanuda</b> justo después de su <code>yield</code>, con sus variables tal como las dejó (" +
          Object.keys(mp.vars).map(n => "<code>" + n + "</code> = " + esc(mp.repr[n])).join(", ") + ").";
      return "El <code>for</code> pide el primer valor: el generador <code>" + mp.nombre + "</code> empieza a ejecutarse por primera vez, con " +
        mp.args.map(a => "<code>" + a + "</code> = " + esc(mp.repr[a])).join(" y ") + "." + (pausas.length ? "" : "");
    }
    if ((p.pila || []).length > (prev.pila || []).length && mp && mp.nombre === "<lambda>") {
      const quien = quienLlama(txt0);
      return (quien ? "<code>" + quien + "</code> llama a la lambda" : "Se llama a la lambda") + " con " + mp.args.map(a => "<code>" + a + "</code> = " + esc(mp.repr[a])).join(" y ") + ".";
    }
    if ((p.pila || []).length > (prev.pila || []).length && mp) {
      const recuerda = Object.keys(mp.vars).filter(n => !parametros(mp).includes(n));
      if (recuerda.length) return "Se llama a la función <code>" + mp.nombre + "</code> con " +
        mp.args.map(a => "<code>" + a + "</code> = " + esc(mp.repr[a])).join(" y ") + ". En su marco aparece también " +
        recuerda.map(n => "<code>" + n + "</code> = " + esc(mp.repr[n])).join(" y ") + ": no es un parámetro, es lo que la función <b>recuerda</b> del sitio donde se creó (un cierre).";
      return "Se llama a la función <code>" + mp.nombre + "</code>: se crea su marco, con " +
        (parametros(mp).length ? parametros(mp).map(a => "<code>" + a + "</code> = " + esc(mp.repr[a]) + ((mp.estrella || {})[a] ? " (" + EXPLICA_ESTRELLA[mp.estrella[a]] + ")" : "")).join(" y ") : "ningún parámetro") +
        ". Ahora se ejecuta el cuerpo de la función.";
    }
    if (mp && mprev && mp.nombre === "<lambda>" && mprev.nombre === "<lambda>" && mp.expr)
      return "La lambda calcula <code>" + esc(mp.expr) + "</code> con " + mp.args.map(a => "<code>" + a + "</code> = " + esc(mp.repr[a])).join(" y ") + ".";
    if (mp && mprev && mp.nombre === mprev.nombre && (p.pila || []).length === (prev.pila || []).length) {
      const cl = Object.keys(mp.vars).filter(n => !igual(mp.vars[n], mprev.vars[n]));
      if (cl.length && !p.cond) {
        const n = cl[0];
        if (esObj(mp.vars[n]) && esObj(mprev.vars[n]) && mp.vars[n].__obj__ === mprev.vars[n].__obj__) {
          const h = cambioAtributo(n, mprev.vars[n], mp.vars[n], p);
          if (h) return h;
        }
        return mprev.vars[n] === undefined
          ? "Dentro de la función se crea la variable local <code>" + n + "</code> y vale " + esc(mp.repr[n]) + "." +
            (n in p.estado ? " Fuera hay una variable global que también se llama <code>" + n + "</code> y vale " + esc(rep(p, n)) + ": esta es otra, local, que la tapa mientras dura la función." : "")
          : "La variable local <code>" + n + "</code> cambia: valía " + esc(mprev.repr[n]) + " y ahora vale " + esc(mp.repr[n]) + ".";
      }
    }
    if (p.clases && prev.clases) {
      for (const c of Object.keys(p.clases)) for (const a of Object.keys(p.clases[c])) {
        const antes = (prev.clases[c] || {})[a];
        if (!igual(antes, p.clases[c][a]))
          return antes === undefined
            ? "La clase <code>" + c + "</code> tiene el atributo de clase <code>" + a + "</code> = " + esc(pyVal(p.clases[c][a])) + ". Es uno solo para toda la clase: lo comparten todos sus objetos."
            : "El atributo de clase <code>" + c + "." + a + "</code> cambia: valía " + esc(pyVal(antes)) + " y ahora vale " + esc(pyVal(p.clases[c][a])) + ". Hay uno solo, compartido por todos los objetos de <code>" + c + "</code>.";
      }
    }
    const txt = L[p.linea - 1].trim();
    if (txt.startsWith("assert ") && !p.excepcion) return "<code>assert</code> comprueba <code>" + esc(txt.slice(7).split(/,\s*["']/)[0]) + "</code>: se cumple, así que el programa sigue como si nada.";
    const cambios = Object.keys(p.estado).filter(n => n !== lista && !ocultas.has(n) && !igual(p.estado[n], prev.estado[n]));
    if (lista && !(lista in prev.estado) && (lista in p.estado)) {
      const L0 = casillasDe(p.estado[lista]).length, cad = typeof p.estado[lista] === "string";
      if (p.estado[lista].__bytes__) return "Se crea <code>" + lista + "</code>, un <code>bytearray</code> de " + L0 + " bytes, todos a 0. A diferencia de <code>bytes</code>, se puede modificar casilla a casilla.";
      if (L0 === 0) return "Se crea " + (cad ? "la cadena" : "la lista") + " <code>" + lista + "</code>, vacía: todavía no tiene " + (cad ? "caracteres." : "casillas.");
      return "Se crea " + (cad ? "la cadena" : "la lista") + " <code>" + lista + "</code> con " + L0 + (cad ? " caracteres" : " casillas") + ", numerados de 0 a " + (L0 - 1) + ".";
    }
    if (C.diccionario && !igual(p.estado[C.diccionario], prev.estado[C.diccionario]) && !p.cond) {
      const a = prev.estado[C.diccionario], b = p.estado[C.diccionario];
      if (a === undefined) return "Se crea el diccionario <code>" + C.diccionario + "</code>" + (Object.keys(b).length ? " con " + Object.keys(b).length + " parejas clave → valor." : ", vacío.");
      const nueva = Object.keys(b).find(k => !(k in a)), cambiada = Object.keys(b).find(k => (k in a) && !igual(a[k], b[k]));
      if (nueva !== undefined) return "La clave <code>" + esc(JSON.stringify(nueva)) + "</code> no estaba: se añade al diccionario con el valor " + esc(fmtVal(b[nueva])) + ".";
      if (cambiada !== undefined) return "La clave <code>" + esc(JSON.stringify(cambiada)) + "</code> ya estaba: su valor pasa de " + esc(fmtVal(a[cambiada])) + " a " + esc(fmtVal(b[cambiada])) + ".";
    }
    if (p.compr) {
      const c = p.compr;
      let h = "La comprensión toma <code>" + c.var + "</code> = " + esc(c.valor);
      if (c.cond && !c.pasa) return h + ". No cumple <code>" + esc(c.cond) + "</code>, así que no se añade nada.";
      return h + (c.cond ? ", cumple <code>" + esc(c.cond) + "</code>" : "") + ", calcula <code>" + esc(c.expr) + "</code> → " + esc(c.res) + " y lo añade: " + esc(c.parcial) + ".";
    }
    if (/^with\s/.test(txt)) {
      const sale = prev.linea !== null && prev.linea > p.linea;
      const m = txt.match(/open\(\s*(['"])(.+?)\1(?:\s*,\s*(['"])(\w+)\3)?.*?\)\s+as\s+(\w+)/);
      if (sale) {
        const modo = m ? (m[4] || "r") : "r";
        return "Termina el bloque <code>with</code>: Python <b>cierra el fichero</b> automáticamente, aunque nadie escriba <code>close()</code>." +
          (/[wax]/.test(modo) ? (discoIgual(p.disco, prev.disco) ? "" : " Al cerrarlo, lo que esperaba en el búfer se escribe de verdad en el disco.") : "");
      }
      if (m) return "Se abre el fichero <code>" + esc(m[2]) + "</code> " + (MODOS[m[4] || "r"] || "en modo '" + m[4] + "'") + ". La variable <code>" + m[5] + "</code> es el objeto fichero: por ella se lee o se escribe." +
        (m[4] && /[wx]/.test(m[4]) && p.disco && !(prev.disco || []).some(f => f.nombre === m[2]) ? " En el disco aparece el fichero, de momento vacío." : "");
    }
    if (/\.write\(/.test(txt)) {
      const arg = (txt.match(/\.write\((.*)\)\s*$/) || [])[1] || "";
      return "Se escribe <code>" + esc(arg) + "</code> en el fichero." + (discoIgual(p.disco, prev.disco)
        ? " Pero fíjate en el disco: todavía no aparece. Python lo guarda en un <b>búfer</b> y lo vuelca de golpe al cerrar el fichero."
        : " Ya se ve en el disco.");
    }
    if (/^match\s/.test(txt)) {
      const sujeto = txt.slice(6).replace(/:$/, "").trim();
      return "Empieza un <code>match</code>: Python compara " + (sujeto in p.estado ? "<code>" + sujeto + "</code>, que vale " + esc(rep(p, sujeto)) : "<code>" + esc(sujeto) + "</code>") + ", con cada <code>case</code>, de arriba abajo, hasta que uno encaje.";
    }
    if (/^case\s/.test(txt)) {
      const dentro = sig && sig.linea && sig.linea > p.linea && sangria(L[sig.linea - 1]) > sangria(L[p.linea - 1]);
      const patron = txt.slice(5).replace(/:$/, "").trim();
      if (!dentro) return "El patrón <code>" + esc(patron) + "</code> no encaja: Python prueba el siguiente <code>case</code>.";
      const capt = Object.keys(p.estado).filter(n => !(n in prev.estado));
      if (patron === "_") return "Ningún <code>case</code> anterior ha encajado: <code>case _</code> es el comodín, encaja siempre.";
      return "El patrón <code>" + esc(patron) + "</code> encaja: se ejecuta este <code>case</code> y los demás ya no se miran." +
        (capt.length ? " Además, el patrón captura " + capt.map(n => "<code>" + n + "</code> = " + esc(rep(p, n))).join(" y ") + "." : "");
    }
    if (/^break\b/.test(txt)) {
      const b = bucleDe(p.linea);
      return "<code>break</code> sale del bucle de golpe, sin esperar a que se acabe." + (b && tieneElse(b) ? " Como el bucle termina por un <code>break</code>, su <code>else</code> <b>no</b> se ejecuta." : "");
    }
    if (/^continue\b/.test(txt)) return "<code>continue</code> se salta el resto de esta vuelta y pasa directamente a la siguiente.";
    if (txt.startsWith("try")) return "Empieza un bloque <code>try</code>: Python intenta ejecutar lo que hay dentro. Si algo falla, saltará a su <code>except</code>.";
    if (txt.startsWith("except")) {
      const dentro = sig && sig.linea && sig.linea > p.linea && sangria(L[sig.linea - 1]) > sangria(L[p.linea - 1]);
      const m = txt.match(/^except\s*([\w.]+)?(?:\s+as\s+(\w+))?/);
      if (!dentro) return "Este <code>except</code> no encaja con el error: Python prueba el siguiente.";
      return "Este <code>" + esc(txt.split(" as ")[0].replace(/:$/, "")) + "</code> encaja con el error: se ejecuta su bloque, el plan B." + (m && m[2] ? " La excepción queda guardada en <code>" + m[2] + "</code>." : "");
    }
    if (p.cond) {
      const r = p.cond.valor;
      if (txt.startsWith("while")) return "Se comprueba la condición del <code>while</code>: " + (r ? "es <b>True</b>, así que da otra vuelta." : "es <b>False</b>, así que sale del bucle.");
      const kw = txt.startsWith("elif") ? "elif" : "if";
      const sigTxt = sig && sig.linea ? L[sig.linea - 1].trim() : "";
      if (r) return "Se evalúa la condición del <code>" + kw + "</code>: es <b>True</b>, así que entra en esta rama." + (tieneRamas(p.linea) ? " Las ramas que quedan ya no se comprueban." : "");
      if (sigTxt.startsWith("elif")) return "Se evalúa la condición del <code>" + kw + "</code>: es <b>False</b>, así que pasa a comprobar la siguiente condición.";
      if (tieneRamas(p.linea)) return "Se evalúa la condición del <code>" + kw + "</code>: es <b>False</b>, así que salta a la rama <code>else</code>.";
      return "Se evalúa la condición del <code>" + kw + "</code>: es <b>False</b>, así que se salta el bloque.";
    }
    if (p.linea === cab) {
      const iter = (txt.match(/\sin\s+(\w+)\s*:$/) || [])[1];
      const deFichero = iter && esFichero(p.estado[iter]);
      if (saleDelBucle(p, sig)) return "No quedan " + (deFichero ? "líneas por leer" : txt.includes("range") ? "posiciones por recorrer" : "elementos por recorrer") + ": el bucle <code>" + (txt.startsWith("while") ? "while" : "for") + "</code> termina." +
        (tieneElse(p.linea) ? " Ha terminado por sí solo, sin <code>break</code>, así que ahora se ejecuta su <code>else</code>." : "");
      if (deFichero) return "Vuelta " + p.vuelta + ": Python lee la siguiente línea del fichero y la guarda en <code>" + C.puntero + "</code> = " + esc(rep(p, C.puntero)) + "." +
        (p.vuelta === 1 && /\\n'$/.test(rep(p, C.puntero)) ? " Fíjate en el <code>\\n</code> del final: cada línea llega con su salto de línea." : "");
      if (txt.includes("range")) return "Vuelta " + p.vuelta + ": <code>" + C.puntero + "</code> pasa a valer " + p.estado[C.puntero] + "." + (lista && p.foco !== null ? " Es la siguiente posición que se va a consultar." : "");
      if (!lista || p.foco === null) return "Vuelta " + p.vuelta + ": <code>" + C.puntero + "</code> toma el siguiente valor, " + esc(rep(p, C.puntero)) + (C.diccionario && txt.includes(C.diccionario) ? ", que es la siguiente clave del diccionario." : ".");
      return "Vuelta " + p.vuelta + ": Python toma el siguiente elemento, el de la posición " + p.foco + ", y lo guarda en <code>" + C.puntero + "</code> = " + esc(rep(p, C.puntero)) + ".";
    }
    if (/^yield\s/.test(txt) && mp) return "El generador llega al <code>yield</code>: va a entregar <code>" + esc(txt.slice(6)) + "</code>" + (txt.slice(6).trim() in mp.vars ? ", que ahora vale " + esc(mp.repr[txt.slice(6).trim()]) : "") + ".";
    const devFun = (txt.match(/^return\s+(\w+)$/) || [])[1];
    if (devFun && mp && mp.vars[devFun] && mp.vars[devFun].__txt__ && /^(función|lambda)/.test(mp.vars[devFun].__txt__))
      return "Se devuelve <code>" + devFun + "</code> sin paréntesis: no se llama a la función, se entrega <b>la función misma</b>, que se lleva lo que recuerda.";
    if (txt.startsWith("return ") && mp) return "Se calcula el valor de <code>" + esc(txt.slice(7)) + "</code>. En el paso siguiente, la función lo devuelve a quien la llamó.";
    const aum = txt.match(/^(\w+)\s*(\*\*|\/\/|[+\-*/%])=\s*(.+)$/);
    if (aum && cambios.includes(aum[1]) && !mp) return "<code>" + esc(txt) + "</code> es la forma corta de <code>" + aum[1] + " = " + aum[1] + " " + aum[2] + " " + esc(aum[3]) + "</code>: <code>" + aum[1] + "</code> valía " + esc(rep(prev, aum[1])) + " y ahora vale " + esc(rep(p, aum[1])) + ".";
    if (/\.pop\(/.test(txt) && lista && Array.isArray(casillasDe(p.estado[lista])) && Array.isArray(casillasDe(prev.estado[lista])) && casillasDe(p.estado[lista]).length === casillasDe(prev.estado[lista]).length - 1) {
      const la0 = casillasDe(p.estado[lista]), lb0 = casillasDe(prev.estado[lista]);
      let i = 0; while (i < la0.length && igual(la0[i], lb0[i])) i++;
      const quien = cambios.find(x => x !== lista);
      return "<code>pop(" + (/\.pop\(\s*\)/.test(txt) ? "" : i) + ")</code> saca la casilla " + i + " de <code>" + lista + "</code>, que valía " + esc(pyVal(lb0[i])) + ", y además la <b>devuelve</b>" + (quien ? ": se guarda en <code>" + quien + "</code>." : ".");
    }
    if (/\.writerow\(/.test(txt)) return "<code>writerow</code> convierte la lista en una línea de texto, con las columnas separadas por comas, y la escribe en el fichero" + (discoIgual(p.disco, prev.disco) ? ". De momento espera en el búfer: llegará al disco al cerrar el fichero." : ".");
    if (txt === "pass") return "<code>pass</code> no hace nada. Está porque Python no admite un bloque vacío: ocupa el hueco.";
    if (/\binput\(/.test(txt) && cambios.length) {
      const n = cambios[0], ult = salida(p.salida).slice(-1)[0] || "";
      const msj = (txt.match(/input\(\s*(['"])(.*?)\1/) || [])[2] || "";
      const tecleado = ult.startsWith(msj) ? ult.slice(msj.length) : ult;
      const conv = (txt.match(/\b(int|float)\(\s*input\(/) || [])[1];
      return "<code>input()</code> escribe " + (msj ? "el mensaje y " : "") + "espera a que teclees algo. Aquí el visualizador teclea por ti: <code>" + esc(tecleado) + "</code>. " +
        "<code>input()</code> siempre devuelve <b>texto</b>" + (conv ? ", así que <code>" + conv + "()</code> lo convierte en el número " + esc(rep(p, n)) + ", que se guarda en <code>" + n + "</code>."
          : ": <code>" + n + "</code> vale " + esc(rep(p, n)) + (p.tipos && p.tipos[n] === "str" && /^'\d+(\.\d+)?'$/.test(rep(p, n)) ? ", que parece un número pero es una cadena." : "."));
    }
    if (txt.startsWith("print")) return "Se muestra en pantalla: <code>" + esc(salida(p.salida).slice(-1)[0] || "") + "</code>";
    if (cambios.length) {
      const nombrada = x => new RegExp("(^|[^\\w.])" + x + "\\b").test(txt);
      if (!nombrada(cambios[0]) && cambios.some(nombrada)) cambios.sort((x, y) => nombrada(y) - nombrada(x));
      const callados = cambios.filter(x => !nombrada(x));
      const n = cambios[0], a = prev.estado[n];
      const alias = nombrada(n) && callados.length && Array.isArray(p.estado[callados[0]]) && igual(p.estado[callados[0]], p.estado[n])
        ? " ¡Ojo! También cambia <code>" + callados[0] + "</code>, y la línea ni la nombra: <code>" + callados[0] + "</code> y <code>" + n + "</code> son <b>la misma lista</b> con dos etiquetas." : "";
      const desdeFuncion = mp && new RegExp("\\bglobal\\s+[\\w, ]*\\b" + n + "\\b").test(D.codigo) ? " La función puede cambiar esta variable global porque la ha declarado con <code>global</code>." : "";
      const lee = p.lee && p.foco !== null ? " Para ello se consulta la casilla " + p.foco + " de la lista, que vale " + fmtVal(p.estado[lista][p.foco]) + "." : "";
      const tp = p.tipos && p.tipos[n], completo = p.padres && p.padres[n];
      const tipo = C.mostrar_tipos === false || !tp ? ""
        : completo ? ", en <code>" + esc(tp) + "</code>" + (PADRES[tp] ? ", " + PADRES[tp] : "") + " (<i>" + esc(completo) + "</i>)"
        : esDePython(tp) ? ", un <code>" + esc(tp) + "</code> de Python, no de Sage" : " (<code>" + esc(tp) + "</code>)";
      const otras = cambios.length > 1 ? " También cambia <code>" + cambios.slice(1).join("</code>, <code>") + "</code>." : "";
      if (esObj(p.estado[n]) && esObj(a) && a.__obj__ === p.estado[n].__obj__) {
        const h = cambioAtributo(n, a, p.estado[n], p);
        if (h) return h;
      }
      if (a === undefined && esObj(p.estado[n])) {
        const otrasEt = etiquetas(prev, p.estado[n].__obj__);
        if (otrasEt.length) return "Se crea la variable <code>" + n + "</code>, pero no se fabrica ningún objeto: <code>" + n + "</code> es otra etiqueta pegada al objeto " + esc(rep(p, n)) + ", el mismo que " + codigos(otrasEt) + ".";
      }
      const forVar = (txt.match(/^for\s+(\w+)\s+in\s/) || [])[1];
      if (forVar && cambios.includes(forVar) && p.linea !== cab)
        return a === undefined && forVar === n
          ? "Empieza el <code>for</code>: <code>" + forVar + "</code> toma su primer valor, " + esc(rep(p, forVar)) + "."
          : "Siguiente vuelta del <code>for</code>: <code>" + forVar + "</code> pasa a valer " + esc(rep(p, forVar)) + ".";
      if (alias) return "<code>" + n + "</code> cambia: valía " + esc(rep(prev, n)) + " y ahora vale " + esc(rep(p, n)) + "." + alias;
      if (a === undefined) return "Se crea la variable <code>" + n + "</code> y vale " + esc(rep(p, n)) + tipo + "." + lee + otras;
      return "<code>" + n + "</code> cambia: valía " + esc(rep(prev, n)) + " y ahora vale " + esc(rep(p, n)) + tipo + "." + lee + otras + desdeFuncion;
    }
    const la = lista && casillasDe(p.estado[lista]), lb = lista && casillasDe(prev.estado[lista]);
    if (Array.isArray(la) && Array.isArray(lb) && la.length === lb.length) {
      const i = la.findIndex((x, j) => !igual(x, lb[j]));
      if (i >= 0) return "La casilla " + i + " de <code>" + lista + "</code> cambia: valía " + esc(pyVal(lb[i])) + " y ahora vale " + esc(pyVal(la[i])) + "." +
        (p.estado[lista] && p.estado[lista].__bytes__ ? " En un <code>bytearray</code> cada casilla es un byte, un número de 0 a 255." : "");
    }
    if (Array.isArray(la) && Array.isArray(lb) && la.length === lb.length + 1 && igual(la.slice(0, -1), lb))
      return "Se añade " + esc(pyVal(la[la.length - 1])) + " al final de <code>" + lista + "</code>: ahora tiene " + la.length + (la.length === 1 ? " casilla." : " casillas.");
    if (Array.isArray(la) && Array.isArray(lb) && Math.abs(la.length - lb.length) === 1) {
      const corta = la.length < lb.length ? la : lb, larga = la.length < lb.length ? lb : la;
      let i = 0; while (i < corta.length && igual(corta[i], larga[i])) i++;
      if (la.length > lb.length) return "Se inserta " + esc(pyVal(la[i])) + " en la posición " + i + " de <code>" + lista + "</code>: las casillas de detrás se corren un sitio a la derecha.";
      return "Se quita la casilla " + i + " de <code>" + lista + "</code>, que valía " + esc(pyVal(lb[i])) + ": las de detrás se corren un sitio a la izquierda y la lista queda con " + la.length + (la.length === 1 ? " casilla." : " casillas.");
    }
    const escrito = p.salida !== prev.salida && !/^(print|for|while|if|elif|else|def|return)\b/.test(txt) && !/^\w+\s*=[^=]/.test(txt)
      ? salida(p.salida).slice(salida(prev.salida).length).join(" ") : "";
    if (escrito) return "Esta línea no guarda nada en ninguna variable. Como en la consola de Sage, se escribe su valor: <code>" + esc(escrito) + "</code>.";
    if (/^for\s/.test(txt) && p.linea !== cab) return "El <code>for</code> no tiene más elementos que recorrer: termina, y el programa sigue por la primera línea de después del bucle.";
    if (/\.seed\(/.test(txt)) return "Se fija la semilla de los números al azar: a partir de aquí, la secuencia que salga será siempre la misma.";
    return "Se ejecuta la línea " + p.linea + ".";
  }

  const k0 = () => k;
  function pinta() {
    const p = P[k], prev = P[Math.max(0, k - 1)], sig = P[k + 1];
    q(".tz-linea").textContent = p.linea === null ? "listo" : "línea " + p.linea;

    q(".tz-codigo").innerHTML = L.map((l, i) => {
      const n = i + 1, hecha = p.linea === n, s = sig && sig.linea === n && !hecha, err = hecha && p.excepcion && !oculto;
      return '<div class="ln' + (hecha ? " hecha" : "") + (err ? " error" : "") + (s ? " sig" : "") + '"><span class="fl">' + (err ? "⚠" : hecha ? "▶" : "▷") +
        '</span><span class="no">' + n + "</span><span>" + colorea(l) + "</span></div>";
    }).join("");

    const arr0 = p.estado[lista], arr = casillasDe(arr0);
    const foco = saleDelBucle(p, sig) ? null : p.foco;
    if (C.matriz) {
      const m = p.estado[C.matriz], fi = p.estado[C.fila], co = p.estado[C.col];
      const ok = Array.isArray(m) && Number.isInteger(fi) && fi >= 0 && fi < m.length && Array.isArray(m[fi]) && Number.isInteger(co) && co >= 0 && co < m[fi].length && !saleDelBucle(p, sig);
      q(".tz-matriz").innerHTML = !Array.isArray(m) ? '<tr><td class="tz-vacio" style="border:0;width:auto">Todavía no existe.</td></tr>'
        : "<tr><th></th>" + (m[0] || []).map((_, j) => "<th>" + j + "</th>").join("") + "</tr>" + m.map((fila, i) => "<tr><th>" + i + "</th>" + (Array.isArray(fila) ? fila : [fila]).map((v, j) =>
            '<td class="' + (ok && i === fi && j === co ? "foco" : ok && i === fi ? "fila" : "") + '">' + esc(pyVal(v)) + "</td>").join("") + "</tr>").join("");
      q(".tz-mat-consulta").textContent = ok ? C.matriz + "[" + fi + "][" + co + "] → " + (oculto ? "?" : pyVal(m[fi][co])) + "   (fila " + fi + ", columna " + co + ")" : "";
    }
    const cas = q(".tz-casillas");
    if (!arr) { cas.innerHTML = '<span class="tz-vacio">Todavía no existe.</span>'; q(".tz-consulta").textContent = ""; }
    else {
      let h = "";
      arr.forEach((v, i) => {
        h += '<div class="cas' + (i === foco ? " foco" : "") + (foco !== null && i < foco ? " visitada" : "") + (i === foco && p.lee ? " lee" : "") +
          '"><span class="v">' + esc(typeof arr0 === "string" ? v : pyVal(v)) + '</span><span class="idx">' + i + "</span></div>";
      });
      if (foco !== null) h += '<div class="puntero"><span class="et">' + (C.puntero === "i" || /range/.test(L[cab - 1]) ? C.puntero + " = " + p.estado[C.puntero] : C.puntero) + '</span><span class="flecha"></span></div>';
      cas.innerHTML = h;
      if (foco !== null) {
        const c = cas.children[foco], pu = cas.querySelector(".puntero");
        requestAnimationFrame(() => { pu.style.transform = "translateX(" + (c.offsetLeft + c.offsetWidth / 2 - pu.offsetWidth / 2) + "px)"; });
      }
      q(".tz-consulta").textContent = (p.lee && foco !== null) ? "Se consulta " + lista + "[" + foco + "] → " + (oculto ? "?" : pyVal(arr[foco])) : "";
    }

    const objPrev = k > 0 ? objetosDe(prev) : {};
    const valorHtml = (v, texto, ocultar) => esObj(v) ? tarjeta(v, objPrev[v.__obj__], ocultar) : esc(ocultar ? "?" : texto);
    if (hayClases) {
      const cl = p.clases || {}, clp = prev.clases || {};
      q(".tz-clases").innerHTML = Object.keys(cl).map(c => '<div class="var"><span class="k">clase</span><span class="val"><span class="obj"><span class="obj-n">' + esc(c) + "</span>" +
        Object.keys(cl[c]).map(a => {
          const cambia = k > 0 && !igual((clp[c] || {})[a], cl[c][a]);
          return '<span class="attr' + (cambia ? " cambia" : "") + '"><span class="an">.' + esc(a) + " =</span> " + esc(oculto && cambia ? "?" : pyVal(cl[c][a])) + "</span>";
        }).join("") + "</span></span></div>").join("") || '<span class="tz-vacio">Todavía no hay clases.</span>';
    }
    const nombres = Object.keys(p.estado).filter(n => n !== lista && n !== C.matriz && !ocultas.has(n));
    q(".tz-vars").innerHTML = nombres.length ? nombres.map(n => {
      const cambia = k > 0 && !igual(p.estado[n], prev.estado[n]);
      if (esObj(p.estado[n])) {
        const nuevo = k > 0 && !igual(p.estado[n], prev.estado[n]) && !(esObj(prev.estado[n]) && prev.estado[n].__obj__ === p.estado[n].__obj__);
        return '<div class="var' + (cambia ? " cambia" : "") + '"><span class="k">' + n + '</span><span class="val">' +
          (oculto && nuevo ? "?" : valorHtml(p.estado[n], "", oculto && cambia)) + "</span></div>";
      }
      const antes = cambia && prev.estado[n] !== undefined ? '<span class="antes">' + esc(rep(prev, n)) + "</span>" : "";
      const tp = p.tipos && p.tipos[n], completo = p.padres && p.padres[n];
      const tipo = C.mostrar_tipos !== false && tp ? '<span class="tipo' + (completo ? "" : " py") + '" title="' + esc(completo ? "Padre: " + completo : "Tipo de Python: " + tp) + '">' + esc(tp) + "</span>" : "";
      const largo = p.estado[n] !== null && typeof p.estado[n] === "object" && ("__txt__" in p.estado[n] || "__bytes__" in p.estado[n]);
      return '<div class="var' + (cambia ? " cambia" : "") + '"><span class="k">' + n + tipo + '</span><span class="val' + (largo ? " largo" : "") + '">' +
        (oculto && cambia ? "?" : esc(rep(p, n))) + "</span>" + antes + "</div>";
    }).join("") : '<span class="tz-vacio">Aún no hay variables.</span>';

    if (C.diccionario) {
      const d = p.estado[C.diccionario], dprev = prev.estado[C.diccionario] || {};
      q(".tz-dic").innerHTML = d === undefined ? '<tr><td class="tz-vacio">Todavía no existe.</td></tr>'
        : Object.keys(d).length === 0 ? '<tr><td class="tz-vacio">{ } vacío</td></tr>'
        : '<tr><th>clave</th><th>valor</th></tr>' + Object.keys(d).map(k => {
            const cambia = k0() > 0 && (!(k in dprev) || !igual(dprev[k], d[k]));
            return '<tr class="' + (cambia ? "cambia" : "") + '"><td>' + esc(fmtVal(k)) + "</td><td>" + (oculto && cambia ? "?" : esc(fmtVal(d[k]))) + "</td></tr>";
          }).join("");
    }

    const pila = p.pila || [];
    q(".tz-pila").innerHTML = pila.map((mm, i) => {
      const anterior = (prev.pila || [])[i];
      const vars = Object.keys(mm.vars).map(n => {
        const cambia = !anterior || anterior.nombre !== mm.nombre || !igual(anterior.vars[n], mm.vars[n]);
        return '<div class="var' + (cambia && k > 0 ? " cambia" : "") + '"><span class="k">' + n + '</span><span class="val">' +
          (esObj(mm.vars[n]) ? tarjeta(mm.vars[n], objPrev[mm.vars[n].__obj__], oculto && cambia) : esc(oculto && cambia ? "?" : mm.repr[n])) + "</span></div>";
      }).join("");
      return '<div class="marco"><div class="marco-cab"><span>Marco</span><code>' + esc(firma(mm)) + "</code></div>" +
        '<div class="tz-vars">' + (vars || '<span class="tz-vacio">sin variables locales</span>') + "</div></div>";
    }).join("") + (!p.devuelve ? ""
      : p.devuelve.error ? '<div class="devuelve error">⚠ ' + esc(p.devuelve.funcion) + " se interrumpe: no devuelve nada, el error sale hacia fuera</div>"
      : p.devuelve.pausa ? '<div class="devuelve pausa">⏸ ' + esc(p.devuelve.funcion) + " entrega <b>" + esc(oculto ? "?" : p.devuelve.valor) + "</b> y se queda en pausa</div>"
      : p.devuelve.gen ? '<div class="devuelve">■ el generador ' + esc(p.devuelve.funcion) + " se ha agotado</div>"
      : p.devuelve.funcion.endsWith(".__init__") ? '<div class="devuelve">↩ ' + esc(p.devuelve.funcion) + " termina: el objeto está listo</div>"
      : '<div class="devuelve">↩ ' + esc(p.devuelve.funcion) + " devuelve <b>" + esc(oculto ? "?" : p.devuelve.valor) + "</b></div>");

    if (p.cond) {
      const r = p.cond.valor;
      q(".tz-cond").innerHTML = '<div class="cond"><span class="tz-micro acento">Condición</span><div>' + esc(p.cond.expr) +
        '</div><div class="fila-c"><span class="gris">→</span><span>' + esc(p.cond.sust) + '</span><span class="gris">→</span><span class="res ' +
        (oculto ? "oculto" : (r ? "si" : "no")) + '">' + (oculto ? "¿True o False?" : (r ? "True" : "False")) + "</span></div></div>";
    } else q(".tz-cond").innerHTML = "";
    q(".tz-compr").innerHTML = p.compr ? '<div class="compr"><span class="tz-micro acento">Comprensión</span><div class="fila-c"><span>' + esc(p.compr.var) + " = " + esc(p.compr.valor) + "</span>" +
      (p.compr.cond ? '<span class="gris">→</span><span>' + esc(p.compr.cond) + '</span><span class="gris">→</span><span class="res">' + (oculto ? "?" : p.compr.pasa ? "✓ True" : "✗ False") + "</span>" : "") +
      (p.compr.pasa ? '<span class="gris">→</span><span>' + esc(p.compr.expr) + " = " + esc(oculto ? "?" : p.compr.res) + "</span>" : "") +
      '</div><div class="fila-c"><span class="gris">lista en construcción</span><span class="parcial">' + esc(oculto ? "?" : p.compr.parcial) + "</span></div></div>" : "";
    if (hayDisco) {
      const d = p.disco || [], dprev = prev.disco || [];
      q(".tz-disco").innerHTML = d.length ? d.map(f => {
        const a = dprev.find(x => x.nombre === f.nombre), cambia = k > 0 && (!a || a.contenido !== f.contenido);
        const cont = f.binario ? f.contenido : f.contenido.replace(/\r/g, "␍").replace(/\n/g, "↵\n");
        return '<div class="fic' + (cambia ? " cambia" : "") + '"><div class="fic-cab"><span>' + esc(f.nombre) + '</span><span class="tam">' + f.tam + (f.tam === 1 ? " byte" : " bytes") + (f.binario ? " · binario" : "") +
          "</span></div><pre>" + (oculto && cambia ? "?" : f.contenido === "" ? '<span class="fin">(vacío)</span>' : esc(cont)) + "</pre></div>";
      }).join("") : '<span class="tz-vacio">Todavía no hay ficheros.</span>';
    }
    const prepH = p.prep ? '<div class="prep"><span class="tz-micro acento">El preparador de Sage la reescribe así</span><code>' + esc(p.prep) + "</code></div>" : "";
    const motH = p.motor && p.motor.length && !oculto ? '<div class="motor"><span class="tz-micro acento">Quién hace el cálculo</span><div class="mots">' +
      p.motor.map(m => '<span class="mot">' + esc(m) + (MOTORES[m] ? " <span>· " + MOTORES[m] + "</span>" : "") + "</span>").join("") + "</div></div>" : "";
    q(".tz-sage").innerHTML = prepH + motH;
    q(".tz-exc").innerHTML = p.excepcion ? '<div class="exc"><span class="tz-micro acento">⚠ Excepción</span><code>' +
      (oculto ? "¿Funciona esta línea?" : esc(p.excepcion)) + "</code></div>" : "";

    const out = salida(p.salida), nueva = p.salida !== prev.salida;
    q(".tz-consola").innerHTML = out.length
      ? out.map((l, i) => esc(oculto && nueva && i === out.length - 1 ? "?" : l)).join("\n")
      : '<span class="pr">(nada todavía)</span>';

    const vis = P.slice(0, k + 1).filter(x => x.fila !== null && x.fila !== undefined).map(x => x.fila);
    let t = "<thead><tr><th>" + (porLinea ? "Línea" : C.fila_en === "comprobacion" ? "Comprobación" : "Vuelta") + "</th>" + columnas.map(c => "<th>" + esc(c) + "</th>").join("") + "</tr></thead><tbody>";
    D.filas.forEach((f0, i) => {
      const v = vis.includes(i), nv = v && p.fila === i;
      const primera = porLinea ? f0[0] : (i + 1), f = porLinea ? f0.slice(1) : f0;
      t += '<tr class="' + (nv ? "nueva" : "") + (v ? "" : " fantasma") + '"><td>' + (porLinea && !v ? "·" : primera) + "</td>" + f.map(c => {
        if (!v) return "<td>·</td>";
        const cls = oculto && nv ? "" : (c === "Sí" ? "si" : c === "No" ? "no" : "");
        return '<td class="' + cls + '">' + esc(oculto && nv ? "?" : c) + "</td>";
      }).join("") + "</tr>";
    });
    q(".tz-tabla").innerHTML = t + "</tbody>";

    q(".tz-narr").innerHTML = oculto ? "<b>Predice antes de mirar.</b> ¿Qué valor saldrá donde ves «?»? Piénsalo y pulsa «Revelar»." : narra(p, prev, sig);
    q(".tz-cuenta").textContent = k + " / " + (P.length - 1);
    q(".tz-atras").disabled = k === 0;
    const fin = k === P.length - 1 && !oculto;
    q(".tz-sigue").disabled = fin;
    q(".tz-sigue").textContent = oculto ? "Revelar" : "Paso ▶";
    if (fin) para();
  }

  function avanza() {
    if (oculto) { oculto = false; pinta(); return; }
    if (k < P.length - 1) {
      k++;
      const p = P[k], prev = P[k - 1];
      const novedad = p.cond || p.devuelve || p.excepcion || p.compr || !igual(p.clases || {}, prev.clases || {}) || !discoIgual(p.disco, prev.disco) || !igual(p.pila || [], prev.pila || []) || (p.fila !== null && p.fila !== undefined) || p.salida !== prev.salida ||
        Object.keys(p.estado).some(n => n !== lista && !igual(p.estado[n], prev.estado[n]));
      oculto = q(".tz-pred").checked && !!novedad;
      pinta();
    }
  }
  function para() { if (timer) { clearInterval(timer); timer = null; } q(".tz-play").textContent = "Reproducir"; }

  q(".tz-sigue").addEventListener("click", () => { para(); avanza(); });
  const real = q(".tz-sagereal");
  if (C.sin_sage_real) real.remove();
  let cajaReal = null;
  if (!C.sin_sage_real) real.addEventListener("click", () => {
    if (cajaReal) { cierraSageReal(cajaReal, q(".tz-real")); cajaReal = null; real.setAttribute("aria-expanded", "false"); real.textContent = "Sage real"; return; }
    real.setAttribute("aria-expanded", "true"); real.textContent = "Cerrar Sage real";
    cajaReal = abreSageReal(q(".tz-real"), C.codigo_real || D.codigo);
  });
  q(".tz-atras").addEventListener("click", () => { para(); oculto = false; if (k > 0) k--; pinta(); });
  q(".tz-reinicia").addEventListener("click", () => { para(); oculto = false; k = 0; pinta(); });
  q(".tz-pred").addEventListener("change", () => { oculto = false; pinta(); });
  q(".tz-play").addEventListener("click", () => {
    if (timer) { para(); return; }
    if (k === P.length - 1) { k = 0; oculto = false; }
    q(".tz-play").textContent = "Pausa";
    timer = setInterval(() => { avanza(); if (oculto) para(); }, 1100);
  });
  // Proyectar: el visualizador a pantalla completa con letra grande; se maneja con el teclado
  // o con un mando de presentaciones (envían Avance Pág / Retroceso Pág).
  const raiz = q(".tz"), proy = q(".tz-proy");
  raiz.tabIndex = -1;
  const proyectando = () => ((raiz.getRootNode().fullscreenElement || document.fullscreenElement) === raiz);
  if (!document.fullscreenEnabled || !raiz.requestFullscreen) proy.remove();
  else proy.addEventListener("click", () => { if (proyectando()) document.exitFullscreen(); else raiz.requestFullscreen().then(() => raiz.focus()).catch(() => {}); });
  const alCambiarPantalla = () => {
    const on = proyectando();
    proy.setAttribute("aria-pressed", on ? "true" : "false");
    proy.textContent = on ? "Salir de la proyección" : "Proyectar";
    pinta();
  };
  document.addEventListener("fullscreenchange", alCambiarPantalla);
  raiz.addEventListener("keydown", e => {
    if (e.target.matches && e.target.matches("input, textarea, select")) return;
    const acciones = { ArrowRight: () => q(".tz-sigue").click(), PageDown: () => q(".tz-sigue").click(),
      ArrowLeft: () => q(".tz-atras").click(), PageUp: () => q(".tz-atras").click(),
      Home: () => q(".tz-reinicia").click(), p: () => q(".tz-play").click(), P: () => q(".tz-play").click(),
      f: () => proy.isConnected && proy.click(), F: () => proy.isConnected && proy.click() };
    if (acciones[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); acciones[e.key](); }
  });
  const alRedimensionar = () => pinta();
  window.addEventListener("resize", alRedimensionar);
  pinta();
  return () => { para(); window.removeEventListener("resize", alRedimensionar); document.removeEventListener("fullscreenchange", alCambiarPantalla); };
}

export default { render };
