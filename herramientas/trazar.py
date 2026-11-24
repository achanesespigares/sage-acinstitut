"""trazar.py · genera las trazas de los visualizadores de un capítulo, con Sage de verdad.

Uso:   python herramientas/trazar.py capitulos/01-calculadora.md

Es el trazador del libro de Python adaptado a Sage. Busca en el capítulo cada directiva
{anywidget} que carga traza-sage.mjs, toma la celda {code-cell} que la precede, la pasa por
el preparador de Sage, la ejecuta con sys.settrace y guarda la traza en su propio archivo,
datos/trazas/<capítulo>-<n>.json, que el visualizador descarga al abrir la página. En el cuerpo
de la directiva quedan "archivo" y "config"; la parte "config" la escribes tú y se conserva.

Lo propio de Sage que guarda cada paso:
  prep      la línea tal como la reescribe el preparador (solo si cambia): 2^3 → Integer(2)**Integer(3)
  tipos     el padre de cada variable en corto: ZZ, QQ, RR, SR, GF(7)… (int, str… si es de Python)
  padres    el nombre completo del padre: Integer Ring, Rational Field…
  motor     quién hace el cálculo de esa línea, solo si se puede asegurar (véase quien_calcula)

La consola imita la de Sage: cada expresión suelta del programa principal escribe su valor,
como al teclearla tras el indicador sage:.

El mismo fichero corre en el navegador (Pyodide) con el mini-Sage del laboratorio en lugar de
Sage: si no puede importar sage.all, usa minisage. Así el laboratorio y los capítulos comparten
trazador, y herramientas/conformidad.py comprueba que las dos trazas coinciden.

Claves de "config" (las mismas que en el libro de Python):
  titulo, etiqueta, idea      textos del visualizador
  lista, cabecera, puntero, foco, columnas, fila_en, soltar, diccionario, entradas,
  matriz, fila, col           véase el libro de Python
  mostrar_tipos               aquí, true por defecto: enseña el padre de cada variable
"""
import ast, builtins, contextlib, copy, dis, inspect, io, json, linecache, os, re, shutil, sys, tempfile, tokenize, traceback, types
from pathlib import Path, PurePath

# ── El motor: Sage de verdad o el mini-Sage del laboratorio ──────────────────────────────
MOTOR = {"nombre": None, "base": {}, "preparse": None}


def usa(nombre=None):
    """Carga Sage (o el mini-Sage). nombre: None (Sage si está), "sage" o "minisage"."""
    if nombre in (None, "sage"):
        try:
            import warnings
            warnings.filterwarnings("ignore")
            import sage.all as S
            from sage.repl.preparse import preparse
            # Maxima y SymPy se cargan la primera vez que hacen falta, y cargar un módulo ejecuta su
            # código: el perfilador lo vería como un cálculo. Se cargan ya, antes de trazar nada.
            for modulo in ("sage.interfaces.maxima_lib", "sage.interfaces.sympy", "sympy", "scipy.optimize"):
                try:
                    __import__(modulo)
                except ImportError:
                    pass
            MOTOR.update(nombre="sage", base=dict(vars(S)), preparse=preparse)
            return MOTOR
        except ImportError:
            if nombre == "sage":
                raise
    import minisage as S
    MOTOR.update(nombre="minisage", base=dict(S.ENTORNO), preparse=S.preparse)
    return MOTOR


def entorno():
    """Lo que ven las expresiones que evalúa el trazador (condiciones, columnas)."""
    return {**MOTOR["base"], "len": len, "range": range, "sum": sum, "max": max, "min": min, "abs": abs}


def prepara(texto):
    """El preparador de Sage: '2^3' → 'Integer(2)**Integer(3)'."""
    return MOTOR["preparse"](texto)


# ── Padres y motores ──────────────────────────────────────────────────────────────────────
CORTOS = [(r"^Integer Ring$", "ZZ"), (r"^Rational Field$", "QQ"),
          (r"^Real Field with 53 bits of precision$", "RR"), (r"^Real Field with (\d+) bits of precision$", r"RealField(\1)"),
          (r"^Symbolic Ring$", "SR"), (r"^Finite Field of size (\d+)$", r"GF(\1)"),
          (r"^Ring of integers modulo (\d+)$", r"Zmod(\1)"), (r"^Complex Field with 53 bits of precision$", "CC"), (r"^Complex Field with (\d+) bits of precision$", r"ComplexField(\1)"),
          (r"^Real Double Field$", "RDF"),
          # f(x) = x^2: Sage escribe la función como «x |--> x^2»; la etiqueta corta del libro lo imita
          (r"^Callable function ring with argument (\w+)$", r"\1 ↦ SR"),
          (r"^Callable function ring with arguments (\(.*\))$", r"\1 ↦ SR")]


def padre_de(v):
    """(corto, completo) del padre de un valor de Sage; para los de Python, su tipo."""
    if isinstance(v, (bool, int, float, str, list, tuple, dict, set, frozenset, type(None))):
        return type(v).__name__, None
    p = getattr(v, "parent", None)
    if callable(p):
        try:
            P = p()
            if isinstance(P, type):                # algunos objetos devuelven una clase: no es un padre
                return type(v).__name__, None
            completo = str(P)
            corto = completo
            for patron, sustituto in CORTOS:
                if re.match(patron, completo):
                    corto = re.sub(patron, sustituto, completo)
                    break
            return corto, completo
        except Exception:
            pass
    return type(v).__name__, None


# Quién hace el cálculo. Solo lo que se ha comprobado (véase la hoja de ruta del libro):
#  · Maxima: el perfilador ve las llamadas a la interfaz de Maxima (integrate, limit, solve…).
#  · PARI: lo documenta Sage para factor() de un entero (algoritmo por defecto), is_prime()
#    («Calls the PARI function isprime») y next_prime() («calls the PARI function nextprime»).
#  · MPFR: los decimales de Sage son de real_mpfr («binding for the MPFR … library»).
#  · GMP: los enteros y las fracciones de Sage guardan sus números con GMP.
#  · Pynac: las expresiones de SR son objetos de Pynac (expression.pyx se compila con
#    sage/symbolic/ginac/*.cpp). Las cuentas con ellas, expand() (self._gobj.expand),
#    subs() y la llamada p(x=…) (self._gobj.subs_map) y factor() de una expresión
#    racional (g_factor) las hace Pynac. Si factor() no es racional, va a Maxima, y eso
#    ya lo ve el perfilador. diff() y derivative() de una expresión acaban en
#    Expression._derivative, que llama a self._gobj.diff: también Pynac.
METODOS_PARI = {"factor", "is_prime", "next_prime"}
METODOS_PYNAC = {"expand", "subs", "factor", "diff", "derivative", "differentiate"}
MODULOS_PERFIL = [(re.compile(r"maxima"), "Maxima"),
                  # dibujar: Graphics.save pasa por matplotlib (2D); los 3D en PNG, por la interfaz de Tachyon
                  (re.compile(r"[/\\]matplotlib[/\\]"), "matplotlib"),
                  (re.compile(r"interfaces[/\\]tachyon"), "Tachyon"),
                  # integrate() prueba con Maxima; si no puede, con Giac (si está) y con SymPy
                  (re.compile(r"giac"), "Giac"),
                  (re.compile(r"[/\\]sympy[/\\]"), "SymPy"),
                  # find_root resuelve con scipy.optimize.brentq (lo dice su documentación)
                  (re.compile(r"[/\\]scipy[/\\]optimize[/\\]"), "SciPy")]
# numerical_integral: «ALGORITHM: Uses calls to the GSL (GNU Scientific Library) C library»
FUNCIONES_GSL = {"numerical_integral"}


def motor_por_valor(v):
    corto, _ = padre_de(v)
    if corto in ("ZZ", "QQ"):
        return "GMP"
    if corto in ("RR", "CC") or corto.startswith(("RealField(", "ComplexField(")):
        return "MPFR"                          # CC es sage.rings.complex_mpfr: dos números de MPFR
    if corto == "SR" or corto.endswith("↦ SR"):
        return "Pynac"
    return None


def llamadas_pynac(texto_prep, ctx):
    """¿La línea expande, sustituye o factoriza una expresión de SR, o la llama (p(x=…), f(2))?"""
    try:
        arbol = ast.parse(texto_prep.strip())
    except SyntaxError:
        return False
    for n in ast.walk(arbol):
        if not isinstance(n, ast.Call):
            continue
        f = n.func
        if isinstance(f, ast.Attribute) and f.attr in METODOS_PYNAC:
            objeto = f.value
        elif isinstance(f, ast.Name) and f.id in METODOS_PYNAC and n.args:
            objeto = n.args[0]
        else:
            objeto = f                            # p(x=2) o f(2): llamar a una expresión es sustituir
        try:
            v = eval(compile(ast.Expression(objeto), "", "eval"), entorno(), dict(ctx))
        except Exception:
            continue
        corto = padre_de(v)[0]
        if corto == "SR" or corto.endswith("↦ SR"):
            return True
    return False


def llamadas_pari(texto_prep, ctx):
    """¿La línea llama a factor(), is_prime() o next_prime() sobre un entero de Sage?"""
    try:
        arbol = ast.parse(texto_prep.strip())
    except SyntaxError:
        return False
    for n in ast.walk(arbol):
        if not isinstance(n, ast.Call):
            continue
        f = n.func
        if isinstance(f, ast.Attribute) and f.attr in METODOS_PARI:
            objeto = f.value
        elif isinstance(f, ast.Name) and f.id in METODOS_PARI and n.args:
            objeto = n.args[0]
        else:
            continue
        try:
            v = eval(compile(ast.Expression(objeto), "", "eval"), entorno(), dict(ctx))
        except Exception:
            continue
        if padre_de(v)[0] == "ZZ":
            return True
    return False


def cuenta_devuelta(texto_prep):
    """La expresión que devuelve una línea: lo que sigue a return, o el cuerpo de una lambda."""
    t = texto_prep.strip()
    if t.startswith("return"):
        return t[len("return"):].strip() or None
    try:
        arbol = ast.parse(t)
    except SyntaxError:
        return None
    lambdas = [n for n in ast.walk(arbol) if isinstance(n, ast.Lambda)]
    return ast.unparse(lambdas[0].body) if len(lambdas) == 1 else None


ARITMETICA = (ast.BinOp, ast.UnaryOp, ast.AugAssign)
APROXIMAR = {"n", "N", "numerical_approx"}


def es_aproximar(nodo):
    """Una llamada a n(), N() o numerical_approx(), como función o como método: pasar a RR es cosa de MPFR."""
    if not isinstance(nodo, ast.Call):
        return False
    f = nodo.func
    return (isinstance(f, ast.Name) and f.id in APROXIMAR) or (isinstance(f, ast.Attribute) and f.attr in APROXIMAR)


def quien_calcula(texto_prep, perfil, nuevos, ctx_antes):
    """Lista de motores de una línea: los que se pueden asegurar, y ninguno más."""
    motores = []
    for m in perfil:
        if m not in motores:
            motores.append(m)
    if llamadas_pari(texto_prep, ctx_antes) and "PARI" not in motores:
        motores.append("PARI")
    try:
        if any(isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id in FUNCIONES_GSL
               for n in ast.walk(ast.parse(texto_prep.strip()))) and "GSL" not in motores:
            motores.append("GSL")
    except SyntaxError:
        pass
    if not motores and llamadas_pynac(texto_prep, ctx_antes):
        motores.append("Pynac")
    try:
        arbol = ast.parse(texto_prep.strip())
        opera = any(isinstance(n, ARITMETICA) or es_aproximar(n) for n in ast.walk(arbol))
    except SyntaxError:
        opera = False
    if opera and not motores:
        for v in nuevos:
            m = motor_por_valor(v)
            if m and m not in motores:
                motores.append(m)
    return motores


# ── Sustituir valores en una condición, sobre el texto de Sage ────────────────────────────
def sustituye(expr, estado):
    """'k^2 > limite' -> 'k^2 > 10': cambia los nombres de variables por su valor (como se escribe)."""
    try:
        toks = list(tokenize.generate_tokens(io.StringIO(expr).readline))
    except (tokenize.TokenError, IndentationError, SyntaxError):
        return expr
    trozos, ultimo = [], 0
    lineas = expr
    for i, t in enumerate(toks):
        if t.type != tokenize.NAME or t.string not in estado:
            continue
        sig = toks[i + 1] if i + 1 < len(toks) else None
        ant = toks[i - 1] if i > 0 else None
        if sig is not None and sig.string == "(":
            continue                             # una llamada: se deja tal cual
        if ant is not None and ant.string == ".":
            continue                             # un atributo
        v = estado[t.string]
        if es_rutina(v):
            continue
        ini, fin = t.start[1], t.end[1]
        trozos.append(lineas[ultimo:ini])
        trozos.append(muestra(marca(v, {})))
        ultimo = fin
    trozos.append(lineas[ultimo:])
    return "".join(trozos)


ARCHIVO = "programa.py"          # nombre con el que el código del alumno sale en los tracebacks
CODIGO = {"texto": ""}          # el programa que se está trazando (para escribir las lambdas)
LIMITE = None                   # máximo de pasos; el laboratorio del navegador lo fija para cortar bucles sin fin
AVISA_SIN_RESPUESTA = False     # el laboratorio: si input() se queda sin respuestas, avisa en vez de devolver ""
ECO = "__eco_sage__"             # la consola de Sage: cada expresión suelta escribe su valor
IMAGEN = "\u0000img:"           # en la salida, una línea así es un gráfico dibujado en la consola
GRAFICOS = {"prefijo": None, "n": 0}   # procesa() dice dónde guardar los gráficos de cada visualizador


def es_grafico(v):
    """Un gráfico de Sage (plot, plot3d…): la consola lo dibuja en vez de escribir su repr."""
    return type(v).__module__.startswith("sage.plot") and callable(getattr(v, "save", None))


def dibuja(v):
    """Guarda el gráfico como lo enseñaría un cuaderno de Sage y devuelve su ruta (o None)."""
    if not GRAFICOS["prefijo"]:
        return None
    GRAFICOS["n"] += 1
    tres_d = "plot3d" in type(v).__module__
    ruta = f"{GRAFICOS['prefijo']}-{GRAFICOS['n']}.{'png' if tres_d else 'svg'}"
    destino = RAIZ / ruta
    destino.parent.mkdir(parents=True, exist_ok=True)
    v.save(str(destino))
    return ruta


class DemasiadosPasos(Exception):
    """El programa ha dado más pasos que LIMITE (casi siempre, un bucle que no termina)."""


def funcion_como_valor(k, v):
    """Una función que vale la pena ver como valor: una lambda, un cierre o un alias."""
    return isinstance(v, types.FunctionType) and (
        v.__name__ == "<lambda>" or "<locals>" in v.__qualname__ or v.__name__ != k)


def es_rutina(v):
    """Una función (de Python, de Sage compilada con Cython o integrada), no un valor."""
    return inspect.isroutine(v) or type(v).__name__ == "cython_function_or_method"


def visible(k, v):
    if k.startswith("__") or k == ECO or isinstance(v, (types.ModuleType, type)):
        return False
    base = MOTOR["base"]
    if k in base and base[k] is v:               # lo que Sage trae de serie (ZZ, QQ, sin, x…)
        return False
    if k == "_" or k.startswith("_sage_const"):
        return False
    if es_rutina(v):
        return funcion_como_valor(k, v)
    return True


def inmutable_de_sage(v):
    """Un elemento de Sage que no se puede modificar (un entero, una expresión de SR…)."""
    if not type(v).__module__.startswith("sage."):
        return False
    mutable = getattr(v, "is_mutable", None)
    try:
        return not (callable(mutable) and mutable())
    except Exception:
        return False


def copia(v):
    # Los elementos inmutables de Sage se guardan tal cual: copiarlos los reconstruye, y una
    # expresión de SR reconstruida se vuelve a simplificar con los supuestos activos en ese
    # momento (assume), así que la foto no enseñaría lo que el programa tiene guardado.
    if inmutable_de_sage(v):
        return v
    try:
        return copy.deepcopy(v)
    except Exception:            # generadores, ficheros…: se guarda la referencia
        return v


def foto(d):
    """Copia real de las variables visibles (para evaluar expresiones después)."""
    return {k: copia(v) for k, v in d.items() if visible(k, v)}


def describe_funcion(f):
    params = ", ".join(f.__code__.co_varnames[:f.__code__.co_argcount])
    if f.__name__ == "<lambda>":
        texto = f"lambda {params}: …"
        try:
            linea = CODIGO["texto"].split("\n")[f.__code__.co_firstlineno - 1]
            lambdas = [n for n in ast.walk(ast.parse(linea.strip())) if isinstance(n, ast.Lambda)]
            if len(lambdas) == 1:
                texto = ast.unparse(lambdas[0])
        except Exception:
            pass
    else:
        texto = f"función {f.__name__}({params})"
    if f.__closure__:
        recuerda = ", ".join(f"{n} = {c.cell_contents!r}" for n, c in zip(f.__code__.co_freevars, f.__closure__))
        texto += f" · recuerda {recuerda}"
    return texto


def cuerpo_lambda(code):
    try:
        linea = CODIGO["texto"].split("\n")[code.co_firstlineno - 1]
        lambdas = [n for n in ast.walk(ast.parse(linea.strip())) if isinstance(n, ast.Lambda)]
        return ast.unparse(lambdas[0].body) if len(lambdas) == 1 else None
    except Exception:
        return None


def nombre_de(code):
    q = getattr(code, "co_qualname", code.co_name)
    return code.co_name if "<locals>" in q else q


def es_objeto(v):
    """Objeto de una clase definida por el alumno."""
    return hasattr(v, "__dict__") and not isinstance(v, (type, types.ModuleType, BaseException)) \
        and type(v).__module__ == "__main__"


def marca(v, numeros):
    """Versión para el visualizador. Los valores de Sage se escriben como los escribe Sage."""
    if es_objeto(v):
        n = numeros.setdefault(id(v), len(numeros) + 1)
        return {"__obj__": n, "__clase__": type(v).__name__,
                "attrs": {k: marca(x, numeros) for k, x in vars(v).items()}}
    if isinstance(v, list):
        return [marca(x, numeros) for x in v]
    if isinstance(v, tuple):
        return {"__tupla__": [marca(x, numeros) for x in v]}
    if isinstance(v, dict):
        if all(isinstance(k, str) for k in v):
            return {k: marca(x, numeros) for k, x in v.items()}
        # Claves que no son textos (x, 1…): el JSON solo admite textos, así que se escribe como Python
        return {"__txt__": re.sub(r" at 0x[0-9a-fA-F]+", "", repr(v))}
    if isinstance(v, BaseException):
        return {"__exc__": repr(v)}
    if isinstance(v, float) and (v != v or v in (float("inf"), float("-inf"))):
        return {"__txt__": repr(v)}
    if isinstance(v, (bool, int, float, str, type(None))):
        return v
    corto, completo = padre_de(v)
    if completo:                                  # un elemento de Sage: su repr y su padre
        return {"__txt__": repr(v), "__padre__": corto}
    if isinstance(v, types.FunctionType):
        return {"__txt__": describe_funcion(v)}
    if isinstance(v, types.GeneratorType):
        return {"__txt__": f"generador {v.__name__}" + (" (agotado)" if v.gi_frame is None else "")}
    if isinstance(v, (set, frozenset)):
        return {"__txt__": ("{" + ", ".join(sorted(repr(x) for x in v)) + "}") if v else "set()"}
    return {"__txt__": re.sub(r" at 0x[0-9a-fA-F]+", "", repr(v))}


def muestra(v):
    """Cómo se escribe un valor marcado."""
    if isinstance(v, dict) and "__obj__" in v:
        return f"{v['__clase__']} nº{v['__obj__']}"
    if isinstance(v, dict) and "__exc__" in v:
        return v["__exc__"]
    if isinstance(v, dict) and "__txt__" in v:
        return v["__txt__"]
    if isinstance(v, dict) and "__tupla__" in v:
        t = v["__tupla__"]
        return "(" + ", ".join(muestra(x) for x in t) + ("," if len(t) == 1 else "") + ")"
    if isinstance(v, list):
        return "[" + ", ".join(muestra(x) for x in v) + "]"
    if isinstance(v, dict):
        return "{" + ", ".join(f"{k!r}: {muestra(x)}" for k, x in v.items()) + "}"
    return repr(v)


def es_cuerpo_de_clase(frame):
    nombres = frame.f_code.co_names
    return "__module__" in nombres and "__qualname__" in nombres and frame.f_code.co_name != "<module>"


CO_GENERATOR = inspect.CO_GENERATOR


def estrellas(code):
    r, i = {}, code.co_argcount + code.co_kwonlyargcount
    if code.co_flags & inspect.CO_VARARGS:
        r[code.co_varnames[i]] = "*"
        i += 1
    if code.co_flags & inspect.CO_VARKEYWORDS:
        r[code.co_varnames[i]] = "**"
    return r


class ConEco(ast.NodeTransformer):
    """Las expresiones sueltas del programa principal escriben su valor, como en la consola de Sage."""
    def visit_Module(self, nodo):
        nuevo = []
        for s in nodo.body:
            if isinstance(s, ast.Expr):
                llamada = ast.Call(func=ast.Name(id=ECO, ctx=ast.Load()), args=[s.value], keywords=[])
                s = ast.copy_location(ast.Expr(value=ast.copy_location(llamada, s.value)), s)
            nuevo.append(s)
        nodo.body = nuevo
        return nodo


def compila(codigo_prep):
    arbol = ast.fix_missing_locations(ConEco().visit(ast.parse(codigo_prep, ARCHIVO)))
    return compile(arbol, ARCHIVO, "exec")


def ejecuta(codigo, codigo_prep, entradas=()):
    """Ejecuta el código ya preparado y devuelve un evento por cada línea (y por cada return),
    con las variables, la pila de marcos, lo impreso, los errores y lo que vio el perfilador."""
    CODIGO["texto"] = codigo
    eventos, salida, numeros = [], io.StringIO(), {}
    pendientes = list(entradas)
    perfil = []                                   # motores vistos por el perfilador desde la última línea
    ecos = []                                     # valores que la consola ha escrito desde la última línea

    def entrada_simulada(mensaje=""):
        if not pendientes and AVISA_SIN_RESPUESTA:
            salida.write(f"{mensaje}\n")
            raise EOFError("input() no tiene más respuestas. Escríbelas en el recuadro "
                           "«Si tu programa usa input()», una por línea.")
        valor = pendientes.pop(0) if pendientes else ""
        salida.write(f"{mensaje}{valor}\n")
        return valor

    def eco(valor):
        if valor is not None:
            ecos.append(valor)
            ruta = dibuja(valor) if es_grafico(valor) else None
            salida.write((IMAGEN + ruta if ruta else repr(valor)) + "\n")

    estado_error = {"propagando": False}

    def perfilador(frame, evento, arg):
        if evento == "call":
            nombre = frame.f_code.co_filename
            for patron, motor in MODULOS_PERFIL:
                if patron.search(nombre) and motor not in perfil:
                    perfil.append(motor)

    def tracer(frame, evento, arg):
        if frame.f_code.co_filename != ARCHIVO or es_cuerpo_de_clase(frame):
            return tracer
        if evento == "exception":
            if not estado_error["propagando"] and eventos:
                tipo, valor, _ = arg
                eventos[-1]["excepcion"] = f"{tipo.__name__}: {valor}" if str(valor) else tipo.__name__
                estado_error["propagando"] = True
            return tracer
        if evento in ("line", "return"):
            if LIMITE and len(eventos) >= LIMITE:
                raise DemasiadosPasos(f"El programa se ha detenido al llegar a {LIMITE} pasos. "
                                      "¿Hay un bucle que no termina nunca?")
            if eventos:                            # lo que hizo la línea anterior
                eventos[-1]["perfil"] = list(perfil)
                eventos[-1]["ecos"] = list(ecos)
            perfil.clear()
            ecos.clear()
            por_error = evento == "return" and estado_error["propagando"]
            if evento == "line":
                estado_error["propagando"] = False
            cadena, f = [], frame
            while f is not None and f.f_code.co_filename == ARCHIVO:
                if not es_cuerpo_de_clase(f):
                    cadena.append(f)
                f = f.f_back
            cadena.reverse()
            modulo = cadena[0]
            pila = [{"nombre": nombre_de(fr.f_code),
                     "args": list(fr.f_code.co_varnames[:fr.f_code.co_argcount]),
                     "estrella": estrellas(fr.f_code),
                     "vars": {k: marca(v, numeros) for k, v in fr.f_locals.items() if visible(k, v)},
                     "real": foto(fr.f_locals), "gen": bool(fr.f_code.co_flags & CO_GENERATOR),
                     "expr": cuerpo_lambda(fr.f_code) if fr.f_code.co_name == "<lambda>" else None} for fr in cadena[1:]]
            es_funcion = frame is not modulo
            pausa = (evento == "return" and es_funcion and not por_error and bool(frame.f_code.co_flags & CO_GENERATOR)
                     and dis.opname[frame.f_code.co_code[frame.f_lasti]] not in ("RETURN_VALUE", "RETURN_CONST"))
            loc = modulo.f_locals
            compr = {} if loc is modulo.f_globals else {k: v for k, v in loc.items() if not k.startswith("__")}
            eventos.append({"ev": evento, "linea": frame.f_lineno,
                            "glob": foto(modulo.f_globals),
                            "glob_m": {k: marca(v, numeros) for k, v in modulo.f_globals.items() if visible(k, v)},
                            "local": foto(frame.f_locals) if es_funcion else {}, "pila": pila, "compr": foto(compr),
                            "marco": nombre_de(frame.f_code), "funcion": es_funcion,
                            "retorno": marca(arg, numeros) if (evento == "return" and es_funcion and not por_error) else None,
                            "retorno_real": copia(arg) if (evento == "return" and es_funcion and not por_error) else None,
                            "por_error": por_error, "pausa": pausa, "salida": salida.getvalue(), "perfil": []})
        return tracer

    carpeta, antes = tempfile.mkdtemp(prefix="traza-"), os.getcwd()
    os.chdir(carpeta)
    lineas = codigo_prep.split("\n")
    linecache.cache[ARCHIVO] = (len(codigo_prep), None, [l + "\n" for l in lineas], ARCHIVO)
    try:
        with contextlib.redirect_stdout(salida), contextlib.redirect_stderr(salida):
            perfilar = MOTOR["nombre"] == "sage"
            if perfilar:
                sys.setprofile(perfilador)
            sys.settrace(tracer)
            try:
                mios = {**vars(builtins), "input": entrada_simulada}
                exec(compila(codigo_prep), {**MOTOR["base"], "__name__": "__main__", "__builtins__": mios, ECO: eco})
            except BaseException as e:
                sys.settrace(None)
                sys.setprofile(None)
                tb = e.__traceback__.tb_next
                if isinstance(e, DemasiadosPasos):
                    salida.write(str(e) + "\n")
                elif isinstance(e, SystemExit):
                    if e.code not in (None, 0):
                        salida.write(f"{e.code}\n")
                else:
                    salida.write(error_del_alumno(e, tb))
                while eventos and eventos[-1]["ev"] == "return" and not eventos[-1]["funcion"]:
                    eventos.pop()
                ultimo = eventos[-1]
                eventos.append({**ultimo, "ev": "fin", "pila": [], "local": {}, "funcion": False,
                                "salida": salida.getvalue(), "perfil": []})
            finally:
                sys.settrace(None)
                sys.setprofile(None)
    finally:
        os.chdir(antes)
        shutil.rmtree(carpeta, ignore_errors=True)
    return eventos


def error_del_alumno(e, tb):
    """El traceback solo con las líneas del programa del alumno: lo de dentro de Sage
    (o del mini-Sage) no le dice nada y cambia de una versión a otra."""
    te = traceback.TracebackException(type(e), e, tb)
    # También las excepciones encadenadas («During handling of the above exception…»): las que
    # nacen dentro de Sage (sum divergente: un RuntimeError de ECL) no tienen ninguna línea del
    # alumno y llevan rutas de la instalación, así que se quitan de la cadena.
    actual = te
    while actual is not None:
        actual.stack = traceback.StackSummary.from_list([f for f in actual.stack if f.filename == ARCHIVO])
        for enlace in ("__cause__", "__context__"):
            previa = getattr(actual, enlace)
            if previa is not None and not any(f.filename == ARCHIVO for f in previa.stack):
                setattr(actual, enlace, None)
        actual = actual.__cause__ or actual.__context__
    return "".join(te.format())


def comprension(texto):
    try:
        arbol = ast.parse(texto)
    except SyntaxError:
        return None
    for n in ast.walk(arbol):
        if isinstance(n, (ast.ListComp, ast.DictComp)) and len(n.generators) == 1 \
                and isinstance(n.generators[0].target, ast.Name):
            return n, n.generators[0].target.id
    return None


def contexto(ev):
    return {**ev["glob"], **ev["local"]}


def traza(codigo, cfg):
    if not MOTOR["nombre"]:
        usa()
    if MOTOR["nombre"] == "sage":
        # plot() elige sus puntos con un poco de azar, y matplotlib pone la fecha en los SVG:
        # con la semilla y la fecha fijas, la misma celda da siempre la misma traza y el mismo dibujo
        os.environ["SOURCE_DATE_EPOCH"] = "0"
        try:
            import matplotlib
            matplotlib.rcParams["svg.hashsalt"] = "acinstitut"
        except ImportError:
            pass
        MOTOR["base"]["set_random_seed"](0)
    GRAFICOS["n"] = 0
    lineas = codigo.split("\n")
    codigo_prep = prepara(codigo)
    lineas_prep = codigo_prep.split("\n")
    if codigo_prep.endswith("\n") and not codigo.endswith("\n"):
        lineas_prep = lineas_prep[:-1]
    if len(lineas_prep) != len(lineas):
        raise ValueError("El preparador ha cambiado el número de líneas: no se puede trazar.")
    lista, cab = cfg.get("lista"), cfg.get("cabecera")
    eventos = ejecuta(codigo, "\n".join(lineas_prep), cfg.get("entradas", ()))
    pasos = [{"linea": None, "estado": {}, "salida": "", "foco": None, "lee": False, "cond": None, "vuelta": 0,
              "fila": None, "repr": {}, "tipos": {}, "padres": {}, "pila": [], "devuelve": None, "excepcion": None}]
    filas, vueltas = [], 0
    parcial, linea_compr = None, None
    ENT = entorno()
    orden = []                                    # las variables, en el orden en que aparecen

    def foco(estado):
        if not lista:
            return None
        arr = estado.get(lista)
        if not isinstance(arr, (list, str)):
            return None
        if cfg.get("foco") == "ninguno":
            return None
        if cfg.get("foco", "vuelta") == "vuelta":
            return vueltas - 1 if 0 < vueltas <= len(arr) and cfg["puntero"] in estado else None
        idx = estado.get(cfg["foco"])
        try:
            idx = int(idx) if not isinstance(idx, (dict, list, str)) else None
        except Exception:
            idx = None
        return idx if isinstance(idx, int) and 0 <= idx < len(arr) else None

    try:
        asignadas = {n.id for n in ast.walk(ast.parse(codigo_prep)) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store)}
    except SyntaxError:
        asignadas = set()

    def evalua(expr, ctx):
        """Una columna de la tabla. Si nombra una variable del programa que aún no existe, «—»
        (y no la función de Sage que lleva ese nombre: n, e, i…)."""
        try:
            e = prepara(expr)
            nombres = {n.id for n in ast.walk(ast.parse(e, mode="eval")) if isinstance(n, ast.Name)}
            if (nombres & asignadas) - set(ctx):
                return "—"
            return muestra(marca(eval(e, dict(ENT), dict(ctx)), {}))
        except Exception:
            return "—"

    for ejec, despues in zip(eventos, eventos[1:]):
        n = ejec["linea"]
        texto = lineas[n - 1].strip()
        texto_prep = lineas_prep[n - 1].strip()
        devuelve = None
        if ejec["ev"] == "return":
            if not ejec["funcion"]:
                continue
            devuelve = {"funcion": ejec["marco"], "valor": muestra(ejec["retorno"]), "error": ejec["por_error"]}
        elif n == cab:
            vueltas += 1
        tras = despues
        if devuelve and len(despues["pila"]) >= len(ejec["pila"]):
            tras = {**ejec, "pila": ejec["pila"][:-1], "salida": despues["salida"]}
        for k in tras["glob_m"]:
            if k not in orden:
                orden.append(k)
        estado = {k: tras["glob_m"][k] for k in orden if k in tras["glob_m"]}
        ctx_despues = {**tras["glob"], **(tras["pila"][-1]["real"] if tras["pila"] else {})}
        f = foco(estado)
        if cfg.get("soltar") and n >= cfg["soltar"]:
            f = None
        lee = bool(lista) and devuelve is None and f is not None and (
            f"{lista}[" in texto or (n == cab and " in " in texto and lista in texto))

        cond = None
        if devuelve is None:
            for clave in ("if ", "elif ", "while "):
                if texto.startswith(clave) and texto_prep.startswith(clave):
                    expr = texto[len(clave):].rstrip(":").strip()
                    expr_prep = texto_prep[len(clave):].rstrip(":").strip()
                    antes = contexto(ejec)
                    try:
                        valor = bool(eval(expr_prep, dict(ENT), dict(antes)))
                    except Exception:             # la condición misma falla: el error lo cuenta el paso
                        break
                    cond = {"expr": expr, "sust": sustituye(expr, antes), "valor": valor}

        compr = None
        nodo = comprension(texto_prep) if devuelve is None else None
        if nodo and despues["linea"] == n and nodo[1] in despues["compr"]:
            c, var = nodo
            if linea_compr != n or nodo[1] not in ejec["compr"]:
                parcial = {} if isinstance(c, ast.DictComp) else []
            linea_compr = n
            ctx = {**despues["glob"], **despues["local"], **despues["compr"]}
            ev = lambda e: eval(compile(ast.Expression(e), "", "eval"), dict(ENT), dict(ctx))
            try:
                pasa = all(ev(i) for i in c.generators[0].ifs)
                if isinstance(c, ast.DictComp):
                    expr = ast.unparse(c.key) + ": " + ast.unparse(c.value)
                    res = None
                    if pasa:
                        kk, vv = ev(c.key), ev(c.value)
                        parcial[kk] = vv
                        res = f"{kk!r}: {muestra(marca(vv, {}))}"
                else:
                    expr = ast.unparse(c.elt)
                    res = None
                    if pasa:
                        x = ev(c.elt)
                        parcial.append(x)
                        res = muestra(marca(x, {}))
                compr = {"var": var, "valor": muestra(marca(ctx[var], {})), "expr": expr, "res": res,
                         "cond": " and ".join(ast.unparse(i) for i in c.generators[0].ifs) or None,
                         "pasa": pasa, "parcial": muestra(marca(parcial, {}))}
            except Exception:
                compr = None
        elif devuelve is None and not (nodo and n == linea_compr):
            linea_compr = None

        fila = None
        if cfg["fila_en"] == "cada_linea":
            valores = [f"{n} ↩" if devuelve else str(n)] + [evalua(c, ctx_despues) for c in cfg["columnas"]]
            if (any(v != "—" for v in valores[1:]) or despues["salida"] != ejec["salida"]
                    or ejec.get("excepcion") or (devuelve and devuelve["error"])):
                filas.append(valores)
                fila = len(filas) - 1
        elif devuelve is None and n == cab and (cfg["fila_en"] == "comprobacion" or vueltas > 1):
            valores = []
            for c in cfg["columnas"]:
                valores.append(evalua(c, contexto(ejec)))
            if cfg["fila_en"] == "comprobacion" and cond:
                valores.append("Sí" if cond["valor"] else "No")
            filas.append(valores)
            fila = len(filas) - 1

        pila = [{"nombre": m["nombre"], "args": m["args"], "vars": m["vars"],
                 "repr": {k: muestra(v) for k, v in m["vars"].items()}, **({"gen": True} if m["gen"] else {}),
                **({"expr": m["expr"]} if m["expr"] else {}), **({"estrella": m["estrella"]} if m["estrella"] else {})}
                for m in tras["pila"]]
        if devuelve and ejec["pausa"]:
            devuelve["pausa"] = True
        if devuelve and ejec["pila"] and ejec["pila"][-1]["gen"]:
            devuelve["gen"] = True
        padres = {k: padre_de(v) for k, v in tras["glob"].items()}
        paso = {"linea": n, "estado": estado, "salida": despues["salida"], "foco": f,
                "lee": lee, "cond": cond, "vuelta": vueltas, "fila": fila,
                "repr": {k: muestra(v) for k, v in estado.items()},
                "tipos": {k: c for k, (c, _) in padres.items()},
                "padres": {k: l for k, (_, l) in padres.items() if l},
                "pila": pila, "devuelve": devuelve, "excepcion": ejec.get("excepcion")}
        if devuelve is None and texto_prep != texto:
            paso["prep"] = texto_prep
        if devuelve is None and not ejec.get("excepcion"):
            cambiados = [v for k, v in ctx_despues.items()
                         if k not in contexto(ejec) or repr(contexto(ejec)[k]) != repr(v)]
            if not cambiados:                     # una expresión suelta: el valor que escribió la consola
                cambiados = ejec.get("ecos", [])
            motor = quien_calcula(texto_prep, ejec.get("perfil", []), cambiados, contexto(ejec))
            if motor:
                paso["motor"] = motor
        elif devuelve is not None and not devuelve["error"]:
            # return n^2 + 1, o lambda t: t^2 + 1: la cuenta se hace al volver, y el valor devuelto
            # dice quién la hizo
            cuenta = cuenta_devuelta(texto_prep)
            if cuenta:
                motor = quien_calcula(cuenta, ejec.get("perfil", []), [ejec["retorno_real"]], contexto(ejec))
                if motor:
                    paso["motor"] = motor
        if compr:
            paso["compr"] = compr
        pasos.append(paso)
    return {"codigo": codigo, "pasos": pasos, "filas": filas, "motor": MOTOR["nombre"]}


RAIZ = Path(__file__).resolve().parent.parent   # las trazas van a datos/trazas/, junto a los capítulos
CELDA = re.compile(r"^```\{code-cell\}[^\n]*\n(.*?)^```", re.S | re.M)
WIDGET = re.compile(r"^(```\{anywidget\}[^\n]*traza-sage\.mjs[^\n]*\n(?::[^\n]*\n)*)(.*?)^```", re.S | re.M)


def procesa(ruta):
    texto = Path(ruta).read_text(encoding="utf-8")
    trozos, pos, hechos = [], 0, 0
    for w in WIDGET.finditer(texto):
        cuerpo = json.loads(w.group(2))
        cfg = cuerpo["config"]
        if cfg.get("tipo") in ("preguntas", "laboratorio", "sagereal"):
            continue
        cfg.setdefault("mostrar_tipos", True)
        celdas = list(CELDA.finditer(texto, 0, w.start()))
        if not celdas:
            raise SystemExit(f"{ruta}: hay un visualizador sin celda de código antes.")
        codigo = "\n".join(l for l in celdas[-1].group(1).rstrip("\n").split("\n") if not l.startswith(":"))
        hechos += 1
        archivo = f"datos/trazas/{Path(ruta).stem}-{hechos}.json"
        destino = RAIZ / archivo
        destino.parent.mkdir(parents=True, exist_ok=True)
        GRAFICOS["prefijo"] = f"datos/graficos/{Path(ruta).stem}-{hechos}"
        try:
            resultado = traza(codigo, cfg)
        finally:
            GRAFICOS["prefijo"] = None
        datos = json.dumps(resultado, ensure_ascii=False, separators=(",", ":"), default=repr, allow_nan=False)
        destino.write_text(datos, encoding="utf-8")
        nuevo = json.dumps({"archivo": archivo, "config": cfg}, ensure_ascii=False, separators=(",", ":"))
        trozos += [texto[pos:w.start()], w.group(1), nuevo, "\n"]
        pos = w.end() - 3
        print(f"  · {cfg.get('titulo', '(sin título)')}: {len(datos):,} caracteres de traza en {archivo}")
    trozos.append(texto[pos:])
    Path(ruta).write_text("".join(trozos), encoding="utf-8")
    print(f"{ruta}: {hechos} visualizador(es) actualizados")


if __name__ == "__main__":
    usa("sage")
    for r in sys.argv[1:]:
        procesa(r)
