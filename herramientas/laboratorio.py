"""laboratorio.py · el puente entre el laboratorio del libro y trazar.py, para Sage.

El navegador (Pyodide) carga trazar.py, minisage.py, preparse_sage.py y este fichero, y llama a
laboratorio(codigo, entradas). Devuelve en JSON lo mismo que ve un visualizador del libro:
{"config": …, "traza": …}. Decide solo qué dibujar: si el programa recorre una lista con un
for, la lista sale como casillas.
"""
import ast
import json
import re
import sys

import trazar

PASOS_MAXIMOS = 1000
PROFUNDIDAD = 160          # llamadas anidadas como máximo (una recursión sin fin para pronto)

AVISO_SAGE_REAL = ("Esto el laboratorio todavía no lo sabe hacer: aquí solo hay un Sage pequeño, con enteros, "
                   "fracciones y decimales. Pulsa «Sage real» y pruébalo con Sage completo.")
PISTAS = {
    "NoEnElLaboratorio": AVISO_SAGE_REAL,
    "ZeroDivisionError": "Has dividido entre cero. Mira en la memoria qué vale el divisor justo en ese paso.",
    "NameError": "Usas un nombre que Sage no conoce. ¿Está escrito igual que cuando lo creaste, con las mismas "
                 "mayúsculas? ¿Lo usas antes de darle valor?",
    "IndexError": "Pides una posición que no existe. En una lista de n elementos, las posiciones van de 0 a n − 1, "
                  "como en Python.",
    "KeyError": "Esa clave no está en el diccionario.",
    "TypeError": "Mezclas cosas que no casan, o una conversión que Sage no puede hacer. Mira en la memoria el "
                 "valor y el padre de cada variable de esa línea.",
    "ValueError": "El valor no tiene la forma esperada. ¿De dónde viene ese dato?",
    "AttributeError": "Ese valor no tiene ese método. Comprueba el nombre y a qué padre pertenece el valor.",
    "ArithmeticError": "Esa operación no tiene sentido con ese número (por ejemplo, factorizar el 0).",
    "RecursionError": "La función se llama a sí misma sin parar. ¿Falta el caso base, o la llamada no se acerca a él?",
}
SINTAXIS = [
    ("expected ':'", "falta «:» al final de la línea"),
    ("expected an indented block", "después de esta línea falta un bloque con sangría"),
    ("unexpected indent", "esta línea tiene una sangría que sobra"),
    ("unindent does not match", "la sangría no coincide con la de las líneas de arriba"),
    ("unterminated string", "faltan las comillas de cierre"),
    ("was never closed", "hay un paréntesis, corchete o llave que no se cierra"),
    ("unmatched", "hay un paréntesis, corchete o llave que se cierra sin haberse abierto"),
    ("Perhaps you forgot a comma", "¿falta una coma?"),
    ("Maybe you meant '==' or ':=' instead of '='", "para comparar se escribe «==», no «=»"),
    ("cannot assign to", "a la izquierda del «=» tiene que haber un nombre de variable"),
    ("invalid syntax", "hay algo que Sage no entiende"),
]


def explica_sintaxis(msg):
    for clave, texto in SINTAXIS:
        if clave in msg:
            return texto
    return None


def pista(salida):
    m = re.search(r"^(\w+(?:Error|Exception|Laboratorio))\b", salida.strip().split("\n")[-1]) if salida.strip() else None
    return PISTAS.get(m.group(1)) if m else None


def nombres_asignados(arbol):
    vistos = []
    for nodo in arbol.body:
        if isinstance(nodo, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            continue
        for n in ast.walk(nodo):
            if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store) and n.id not in vistos and not n.id.startswith("__"):
                vistos.append(n.id)
    return vistos


def recorrido(arbol, asignados):
    """El primer for del programa que recorre una lista global, si lo hay."""
    for nodo in arbol.body:
        if not isinstance(nodo, ast.For) or not isinstance(nodo.target, ast.Name):
            continue
        it = nodo.iter
        if isinstance(it, ast.Name) and it.id in asignados:
            return {"lista": it.id, "cabecera": nodo.lineno, "puntero": nodo.target.id, "foco": "vuelta"}
        if (isinstance(it, ast.Call) and isinstance(it.func, ast.Name) and it.func.id == "range"
                and len(it.args) == 1 and isinstance(it.args[0], ast.Call)
                and isinstance(it.args[0].func, ast.Name) and it.args[0].func.id == "len"
                and it.args[0].args and isinstance(it.args[0].args[0], ast.Name)
                and it.args[0].args[0].id in asignados):
            return {"lista": it.args[0].args[0].id, "cabecera": nodo.lineno,
                    "puntero": nodo.target.id, "foco": nodo.target.id}
    return None


def laboratorio(codigo, entradas=()):
    if not trazar.MOTOR["nombre"]:
        trazar.usa()
    codigo = codigo.replace("\t", "    ").rstrip()
    if not codigo.strip():
        return json.dumps({"error": "Escribe un programa antes de ejecutarlo."})
    try:
        arbol = ast.parse(trazar.prepara(codigo))
    except SyntaxError as e:
        es = explica_sintaxis(e.msg)
        texto = f"Error en la línea {e.lineno}: {es}." if es else f"Sage no entiende la línea {e.lineno}."
        return json.dumps({"error": texto + f" (Python dice: {e.msg})", "linea": e.lineno}, ensure_ascii=False)
    asignados = nombres_asignados(arbol)
    cfg = {"titulo": "Tu programa", "etiqueta": "paso a paso",
           "idea": "Avanza con «Paso ▶». Antes de cada paso, intenta predecir qué va a pasar… y a qué padre pertenece el resultado.",
           "columnas": asignados[:4], "fila_en": "cada_linea", "mostrar_tipos": True}
    lista = recorrido(arbol, asignados)
    if lista:
        cfg.update(lista)
        cfg["fila_en"] = "fin_iteracion"
        extra = [f"{lista['lista']}[{lista['puntero']}]"] if lista["foco"] != "vuelta" else []
        resto = [n for n in asignados if n not in (lista["puntero"], lista["lista"])]
        cfg["columnas"] = ([lista["puntero"]] + extra + resto)[:4]
    if entradas:
        cfg["entradas"] = list(entradas)
    trazar.LIMITE = PASOS_MAXIMOS
    trazar.AVISA_SIN_RESPUESTA = True
    antes = sys.getrecursionlimit()
    try:
        sys.setrecursionlimit(PROFUNDIDAD + 40)
        traza = trazar.traza(codigo, cfg)
        traza["pasos"] = [p for p in traza["pasos"] if p["linea"] is None or p["linea"] >= 1]
        if len(traza["pasos"]) <= 1:
            return json.dumps({"error": "Tu programa no ejecuta nada todavía: solo tiene comentarios o definiciones. "
                                        "Añade una línea que haga algo, como 2^10 o un print()."},
                              ensure_ascii=False)
        res = {"config": cfg, "traza": traza, "pista": pista(traza["pasos"][-1]["salida"])}
        return json.dumps(res, ensure_ascii=False, separators=(",", ":"), default=repr, allow_nan=False)
    except Exception as e:                          # un fallo del trazador, no del programa
        return json.dumps({"error": "Este programa todavía no se puede visualizar en el laboratorio. "
                                    "Pruébalo con «Sage real» y, si puedes, pásaselo a tu profesor: "
                                    "así el laboratorio aprende a dibujarlo.",
                           "interno": f"{type(e).__name__}: {e}"[:300]}, ensure_ascii=False)
    finally:
        sys.setrecursionlimit(antes)
