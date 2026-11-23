// rutas.mjs · el interruptor de las dos rutas (AC Institut · anywidget)
// «Ruta base» oculta en la página todo lo marcado «A fondo» (los bloques {div} con la clase afondo);
// «Libro completo» lo muestra. La elección se recuerda en el navegador y vale para todo el libro.
const CLAVE = "acinstitut-ruta";
const ESTILOS = `
.rt{ font:400 15px/1.5 "Arimo","Liberation Sans",Arial,sans-serif; display:flex; flex-wrap:wrap; gap:10px 16px; align-items:center;
  border:1px solid #D4D4D4; border-radius:10px; padding:12px 14px; margin:1rem 0; background:#fff; color:#111; }
.rt-sw{ display:flex; background:#F6F0EE; border-radius:999px; padding:4px; gap:4px; }
.rt-sw button{ font:700 14px/1 "Montserrat",Arial,sans-serif; min-height:40px; padding:0 16px; border:0; border-radius:999px; background:transparent; color:#7A1F36; cursor:pointer; }
.rt-sw button[aria-pressed=true]{ background:#7A1F36; color:#fff; }
.rt-sw button:focus-visible{ outline:3px solid #7A1F36; outline-offset:2px; }
.rt-txt{ color:#555; font-size:14px; flex:1 1 220px; }
.rt-txt b{ color:#111; }
`;
const lee = () => { try { return localStorage.getItem(CLAVE) || "completo"; } catch (e) { return "completo"; } };
const aplica = r => document.documentElement.classList.toggle("solo-base", r === "base");

function render({ el }) {
  el.innerHTML = "<style>" + ESTILOS + '</style><div class="rt"><div class="rt-sw" role="group" aria-label="Qué ruta seguir">' +
    '<button data-r="base">Ruta base</button><button data-r="completo">Libro completo</button></div><span class="rt-txt"></span></div>';
  const txt = el.querySelector(".rt-txt");
  const pinta = r => {
    aplica(r);
    el.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.r === r));
    const n = document.querySelectorAll(".afondo").length;
    txt.innerHTML = r === "base"
      ? "Ves la <b>ruta base</b>: " + (n ? n + (n === 1 ? " apartado «A fondo» oculto." : " apartados «A fondo» ocultos.") : "este capítulo no tiene apartados «A fondo».")
      : "Ves el <b>libro completo</b>" + (n ? ": los " + n + " apartados «A fondo» llevan su cápsula negra." : ".");
  };
  el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    try { localStorage.setItem(CLAVE, b.dataset.r); } catch (e) {}
    pinta(b.dataset.r);
  }));
  pinta(lee());
  setTimeout(() => pinta(lee()), 400);          // la página termina de pintarse después del widget
}
export default { render };
