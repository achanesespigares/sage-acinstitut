"""conformidad.py · el mini-Sage del laboratorio frente a Sage de verdad.

Uso:   python herramientas/conformidad.py [filtro]

Traza cada programa de lab/pruebas/*.sage y cada programa de los capítulos dos veces, con Sage
y con minisage, y compara los pasos: línea, valores, padres, consola, condiciones, preparador,
motor y errores. Si el mini-Sage no sabe hacer algo, tiene que decirlo (NoEnElLaboratorio) en
el mismo paso en que Sage lo hace; los pasos anteriores deben coincidir igualmente.

Una prueba que debe acabar en ese aviso lleva en su primera línea:  # espera: aviso
Sale con código 1 si alguna prueba no coincide.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "herramientas"))
sys.path.insert(0, str(RAIZ / "lab"))
import trazar  # noqa: E402

CAMPOS = ["linea", "repr", "tipos", "padres", "salida", "cond", "prep", "motor", "excepcion", "devuelve", "foco", "fila"]
WIDGET = re.compile(r"^```\{anywidget\}[^\n]*traza-sage\.mjs[^\n]*\n(?::[^\n]*\n)*(.*?)^```", re.S | re.M)
CELDA = re.compile(r"^```\{code-cell\}[^\n]*\n(.*?)^```", re.S | re.M)


def programas(filtro):
    for f in sorted((RAIZ / "lab" / "pruebas").glob("*.sage")):
        if filtro in f.name:
            yield f.name, f.read_text(encoding="utf-8").rstrip("\n"), None
    for cap in sorted((RAIZ / "capitulos").glob("*.md")):
        texto = cap.read_text(encoding="utf-8")
        for i, w in enumerate(WIDGET.finditer(texto)):
            cfg = json.loads(w.group(1))["config"]
            if cfg.get("tipo") in ("laboratorio", "preguntas"):
                continue
            celdas = list(CELDA.finditer(texto, 0, w.start()))
            nombre = f"{cap.stem}#{i + 1}"
            if celdas and filtro in nombre:
                codigo = "\n".join(l for l in celdas[-1].group(1).rstrip("\n").split("\n") if not l.startswith(":"))
                yield nombre, codigo, cfg


def con(motor, codigo, cfg):
    trazar.usa(motor)
    return trazar.traza(codigo, cfg)


def compara(nombre, codigo, cfg):
    espera_aviso = codigo.lstrip().startswith("# espera: aviso")
    cfg = cfg or {"columnas": [], "fila_en": "cada_linea", "mostrar_tipos": True}
    real = con("sage", codigo, json.loads(json.dumps(cfg)))
    mini = con("minisage", codigo, json.loads(json.dumps(cfg)))
    pr, pm = real["pasos"], mini["pasos"]
    for i, (a, b) in enumerate(zip(pr, pm)):
        aviso = (b.get("excepcion") or "").startswith("NoEnElLaboratorio")
        if aviso:
            if not espera_aviso:
                return f"paso {i}: el mini-Sage avisa «{b['excepcion']}» y Sage no"
            return None
        for c in CAMPOS:
            if a.get(c) != b.get(c):
                return f"paso {i} (línea {a.get('linea')}), «{c}»:\n      Sage:      {a.get(c)!r}\n      mini-Sage: {b.get(c)!r}"
    if espera_aviso:
        return "se esperaba el aviso del laboratorio y no ha llegado"
    if len(pr) != len(pm):
        return f"Sage da {len(pr)} pasos y el mini-Sage {len(pm)}"
    if real["filas"] != mini["filas"]:
        return f"tabla de traza distinta:\n      Sage:      {real['filas']}\n      mini-Sage: {mini['filas']}"
    return None


def main():
    filtro = sys.argv[1] if len(sys.argv) > 1 else ""
    bien, mal = 0, []
    for nombre, codigo, cfg in programas(filtro):
        error = compara(nombre, codigo, cfg)
        if error:
            mal.append((nombre, error))
            print(f"  ✗ {nombre}: {error}")
        else:
            bien += 1
    total = bien + len(mal)
    print(f"\nConformidad: {bien}/{total} programas coinciden con Sage")
    sys.exit(1 if mal else 0)


if __name__ == "__main__":
    main()
