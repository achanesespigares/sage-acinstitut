"""minisage.py · un Sage pequeño para el laboratorio del navegador.

Sage no cabe en un navegador: es Python más cientos de bibliotecas compiladas (PARI, FLINT,
Maxima, GAP…). Este módulo imita, con Python puro, la parte de Sage que el laboratorio sabe
dibujar: los enteros (ZZ), las fracciones (QQ) y los decimales de 53 bits (RR), con sus padres,
su coerción y su forma de escribirse. Corre con el mismo trazador que los capítulos.

Las reglas no se inventan: herramientas/conformidad.py traza cada programa de lab/pruebas/ con
este módulo y con Sage de verdad, y las dos trazas tienen que coincidir paso a paso.

Lo que no sabe hacer, lo dice: cualquier otro nombre de Sage existe, pero al usarlo lanza
NoEnElLaboratorio, con el aviso de probarlo en Sage real.
"""
import builtins as _builtins
import json
import math
from fractions import Fraction
from pathlib import Path

import preparse_sage

preparse = preparse_sage.preparse


class NoEnElLaboratorio(Exception):
    """Algo de Sage que el laboratorio todavía no sabe hacer."""


NoEnElLaboratorio.__module__ = "builtins"       # en la consola sale «NoEnElLaboratorio: …», sin el módulo


def no_lo_se(que):
    raise NoEnElLaboratorio(f"{que} todavía no está en el laboratorio. Pruébalo en Sage real "
                            "(el botón «Sage real» de esta página).")


# ── Padres ────────────────────────────────────────────────────────────────────────────────
class Padre:
    def __init__(self, nombre, corto):
        self._nombre, self._corto = nombre, corto

    def __pow__(self, n):                       # QQ^3: un espacio vectorial
        no_lo_se(f"«{self._corto}^{n}» (los espacios vectoriales)")

    def __getitem__(self, k):                   # QQ['x']: un anillo de polinomios (R.<x> = QQ[])
        no_lo_se(f"«{self._corto}['{k}']» (los anillos de polinomios)")

    def __repr__(self):
        return self._nombre

    __str__ = __repr__

    # ZZ.is_field(), QQ.cardinality()…: aún no. Solo estos nombres avisan; los demás dan AttributeError,
    # porque el trazador sondea atributos (parent, category, base_ring…) con hasattr y getattr
    _METODOS_DE_PADRE = {"is_field", "is_finite", "is_exact", "is_commutative", "is_integral_domain",
                         "cardinality", "order", "characteristic", "zero", "one", "list", "gen", "gens",
                         "ngens", "an_element", "random_element", "fraction_field",
                         "has_coerce_map_from", "coerce_map_from", "convert_map_from"}

    def __getattr__(self, nombre):
        if nombre in Padre._METODOS_DE_PADRE:
            no_lo_se(f"«{self._corto}.{nombre}» (los métodos de los padres)")
        raise AttributeError(nombre)

    def __contains__(self, x):                  # 1/2 in ZZ: como Parent.__contains__, convierte y compara
        try:
            return bool(self(x) == x)
        except (TypeError, ValueError, ZeroDivisionError):
            return False

    def __reduce__(self):                          # copy.deepcopy: el padre es único
        return (_padre_por_nombre, (self._corto,))


def _padre_por_nombre(corto):
    return {"ZZ": ZZ, "QQ": QQ, "RR": RR}[corto]


class EnterosZZ(Padre):
    def __call__(self, v=0, base=None):
        if base is not None:
            if not isinstance(v, str):
                no_lo_se("ZZ(valor, base) con un valor que no es un texto")
            return Integer(int(v, int(base)))
        if isinstance(v, Integer):
            return v
        if isinstance(v, bool):
            return Integer(int(v))
        if isinstance(v, int):
            return Integer(v)
        if isinstance(v, Rational):
            if v._q.denominator != 1:
                raise TypeError("no conversion of this rational to integer")
            return Integer(v._q.numerator)
        if isinstance(v, RealNumber):
            if v._x != v._x or v._x in (math.inf, -math.inf) or v._x != math.floor(v._x):
                raise TypeError(f"Attempt to coerce non-integral RealNumber to Integer")
            return Integer(int(v._x))
        if isinstance(v, str):
            return Integer(int(v.strip()))
        no_lo_se(f"ZZ({type(v).__name__})")


class RacionalesQQ(Padre):
    def __call__(self, v=0, d=None):
        if d is not None:
            return Rational(Fraction(int(ZZ(v)), int(ZZ(d))))
        if isinstance(v, Rational):
            return v
        if isinstance(v, (Integer, int, bool)):
            return Rational(Fraction(int(v)))
        if isinstance(v, RealNumber):
            if v._x != v._x or v._x in (math.inf, -math.inf):
                raise TypeError("unable to convert to a rational")
            return Rational(Fraction(v._x))
        if isinstance(v, str):
            return Rational(Fraction(v.strip()))
        no_lo_se(f"QQ({type(v).__name__})")


class RealesRR(Padre):
    def __call__(self, v=0):
        if isinstance(v, RealNumber):
            return v
        if isinstance(v, (Integer, Rational)):
            return RealNumber._de(float(v._valor_exacto()))
        if isinstance(v, (int, float, bool)):
            return RealNumber._de(float(v))
        if isinstance(v, str):
            return RealNumber(v)
        no_lo_se(f"RR({type(v).__name__})")


ZZ = EnterosZZ("Integer Ring", "ZZ")
QQ = RacionalesQQ("Rational Field", "QQ")
RR = RealesRR("Real Field with 53 bits of precision", "RR")
IntegerRing = lambda: ZZ
RationalField = lambda: QQ


def parent(x):
    p = getattr(x, "parent", None)
    if callable(p):
        return p()
    return type(x)


# ── Elementos ─────────────────────────────────────────────────────────────────────────────
class Elemento:
    """Lo común a los tres: la coerción. Un número de Python se convierte al padre de Sage."""
    _rango = None                                 # 0 = ZZ, 1 = QQ, 2 = RR

    def _valor_exacto(self):
        raise NotImplementedError

    def __hash__(self):
        return hash(self._valor_exacto())

    def __bool__(self):
        return bool(self._valor_exacto())

    def __float__(self):
        return float(self._valor_exacto())

    def __int__(self):
        return int(self._valor_exacto())

    def __format__(self, spec):
        if not spec:
            return str(self)
        return format(self._valor_exacto(), spec)

    def __reduce__(self):
        return (type(self)._de_estado, (self._estado(),))


def _eleva(x):
    """Un operando cualquiera → (rango, valor de Sage) o None si no se sabe mezclar."""
    if isinstance(x, Elemento):
        return x
    if isinstance(x, bool):
        return Integer(int(x))
    if isinstance(x, int):
        return Integer(x)
    return None


def _comun(a, b):
    """La coerción de Sage entre ZZ ⊂ QQ → RR: los dos al padre más grande."""
    r = max(a._rango, b._rango)
    conv = (ZZ, QQ, RR)[r]
    return conv(a), conv(b), r


class _Operaciones(Elemento):
    """Los operadores, con la coerción de Sage. Los floats de Python dan float, como en Sage."""

    def _opera(self, otro, nombre, al_reves=False):
        if isinstance(otro, float) and not isinstance(self, RealNumber):
            a, b = float(self._valor_exacto()), otro
            if al_reves:
                a, b = b, a
            return _OPS_FLOAT[nombre](a, b)
        o = _eleva(otro)
        if o is None:
            return NotImplemented
        a, b, r = _comun(self, o)
        if al_reves:
            a, b = b, a
        return a._op_mismo(b, nombre)

    def __add__(self, o): return self._opera(o, "+")
    def __radd__(self, o): return self._opera(o, "+", True)
    def __sub__(self, o): return self._opera(o, "-")
    def __rsub__(self, o): return self._opera(o, "-", True)
    def __mul__(self, o): return self._opera(o, "*")
    def __rmul__(self, o): return self._opera(o, "*", True)
    def __truediv__(self, o): return self._opera(o, "/")
    def __rtruediv__(self, o): return self._opera(o, "/", True)
    def __floordiv__(self, o): return self._opera(o, "//")
    def __rfloordiv__(self, o): return self._opera(o, "//", True)
    def __mod__(self, o): return self._opera(o, "%")
    def __rmod__(self, o): return self._opera(o, "%", True)
    def __divmod__(self, o): return (self._opera(o, "//"), self._opera(o, "%"))
    def __rdivmod__(self, o): return (self._opera(o, "//", True), self._opera(o, "%", True))

    def _compara(self, otro):
        if isinstance(otro, float) and not isinstance(self, RealNumber):
            otro = RealNumber._de(otro)
        o = _eleva(otro) if not isinstance(otro, Elemento) else otro
        if o is None:
            return None
        a, b, _ = _comun(self, o)
        return a._clave(), b._clave()

    def __eq__(self, o):
        c = self._compara(o)
        return NotImplemented if c is None else c[0] == c[1]

    def __ne__(self, o):
        c = self._compara(o)
        return NotImplemented if c is None else c[0] != c[1]

    def __lt__(self, o):
        c = self._compara(o)
        return NotImplemented if c is None else c[0] < c[1]

    def __le__(self, o):
        c = self._compara(o)
        return NotImplemented if c is None else c[0] <= c[1]

    def __gt__(self, o):
        c = self._compara(o)
        return NotImplemented if c is None else c[0] > c[1]

    def __ge__(self, o):
        c = self._compara(o)
        return NotImplemented if c is None else c[0] >= c[1]

    __hash__ = Elemento.__hash__

    def n(self, prec=None, digits=None):
        if prec not in (None, 53) or digits is not None:
            no_lo_se("n() con otra precisión")
        return RR(self)

    numerical_approx = n
    N = n


_OPS_FLOAT = {"+": lambda a, b: a + b, "-": lambda a, b: a - b, "*": lambda a, b: a * b,
              "/": lambda a, b: a / b, "//": lambda a, b: a // b, "%": lambda a, b: a % b}


class Integer(_Operaciones):
    """Un entero de Sage (ZZ). Con Python se escribe Integer(5); en Sage, 5."""
    __module__ = "sage.rings.integer"
    _rango = 0
    __slots__ = ("_n",)

    def __init__(self, n=0, base=None):
        if isinstance(n, Integer):
            n = n._n
        elif base is not None:
            n = int(str(n), int(base))
        elif isinstance(n, str):
            n = int(n.strip())
        elif isinstance(n, Rational):
            n = int(ZZ(n))
        elif isinstance(n, RealNumber):
            n = int(ZZ(n))
        elif isinstance(n, float):
            if n != math.floor(n):
                raise TypeError("Cannot convert non-integral float to integer")
            n = int(n)
        self._n = int(n)

    @classmethod
    def _de_estado(cls, n):
        return cls(n)

    def _estado(self):
        return self._n

    def _valor_exacto(self):
        return self._n

    def _clave(self):
        return self._n

    def __repr__(self):
        return str(self._n)

    __str__ = __repr__

    def __index__(self):
        return self._n

    def __int__(self):
        return self._n

    def __hash__(self):
        return hash(self._n)

    def parent(self):
        return ZZ

    def _op_mismo(self, b, op):
        x, y = self._n, b._n
        if op == "+": return Integer(x + y)
        if op == "-": return Integer(x - y)
        if op == "*": return Integer(x * y)
        if op == "/":
            if y == 0:
                raise ZeroDivisionError("rational division by zero")
            return Rational(Fraction(x, y))
        if op == "//":
            if y == 0:
                raise ZeroDivisionError("Integer division by zero")
            return Integer(x // y)
        if op == "%":
            if y == 0:
                raise ZeroDivisionError("Integer modulo by zero")
            return Integer(x % y)
        raise TypeError(op)

    def __pow__(self, e, mod=None):
        if mod is not None:
            return Integer(pow(self._n, int(ZZ(e)), int(ZZ(mod))))
        if isinstance(e, (Integer, int)) and not isinstance(e, bool):
            k = int(e)
            if k >= 0:
                return Integer(self._n ** k)
            if self._n == 0:
                raise ZeroDivisionError("rational division by zero")
            return Rational(Fraction(1, self._n ** (-k)))
        if isinstance(e, RealNumber):
            return RR(self) ** e
        if isinstance(e, float):
            return float(self._n) ** e
        if isinstance(e, Rational):
            r = _potencia_exacta(Fraction(self._n), e._q)
            if r is not None:
                return Rational(r)
        no_lo_se("Elevar un entero a una fracción cuando la raíz no es exacta (es simbólica)")

    def __rpow__(self, b):
        if isinstance(b, int):                    # un int de Python elevado a un entero de Sage: cuenta de Python
            return b ** self._n
        o = _eleva(b)
        if o is None:
            return NotImplemented
        return o ** self

    # Operaciones bit a bit: en Sage, ^^ (el preparador lo pasa a ^ de Python), &, |, << y >>
    def _bits(self, o, f, al_reves=False):
        if isinstance(o, bool) or not isinstance(o, (Integer, int)):
            return NotImplemented
        a, b = (int(o), self._n) if al_reves else (self._n, int(o))
        return Integer(f(a, b))

    def __xor__(self, o): return self._bits(o, lambda a, b: a ^ b)
    def __rxor__(self, o): return self._bits(o, lambda a, b: a ^ b, True)
    def __and__(self, o): return self._bits(o, lambda a, b: a & b)
    def __rand__(self, o): return self._bits(o, lambda a, b: a & b, True)
    def __or__(self, o): return self._bits(o, lambda a, b: a | b)
    def __ror__(self, o): return self._bits(o, lambda a, b: a | b, True)
    def __lshift__(self, o): return self._bits(o, lambda a, b: a << b)
    def __rshift__(self, o): return self._bits(o, lambda a, b: a >> b)

    def __neg__(self): return Integer(-self._n)
    def __pos__(self): return self
    def __abs__(self): return Integer(abs(self._n))

    # Métodos de los enteros de Sage que el laboratorio sabe hacer
    def is_prime(self, proof=None):
        return _es_primo(self._n)

    def is_square(self):
        return self._n >= 0 and math.isqrt(self._n) ** 2 == self._n

    def next_prime(self, proof=None):
        k = max(self._n + 1, 2)
        while not _es_primo(k):
            k += 1
        return Integer(k)

    def previous_prime(self, proof=None):
        if self._n <= 2:
            raise ValueError("no prime less than 2")
        k = self._n - 1
        while not _es_primo(k):
            k -= 1
        return Integer(k)

    def factor(self, algorithm=None, proof=None):
        if algorithm is not None:
            no_lo_se("factor() con un algoritmo a elegir")
        return IntegerFactorization.de_entero(self._n)

    def divisors(self):
        if self._n == 0:
            raise ValueError("n must be nonzero")
        n = abs(self._n)
        peque = [d for d in range(1, math.isqrt(n) + 1) if n % d == 0]
        todos = sorted(set(peque + [n // d for d in peque]))
        return [Integer(d) for d in todos]

    def digits(self, base=10):
        n, b = abs(self._n), int(base)
        if n == 0:
            return []
        r = []
        while n:
            n, c = divmod(n, b)
            r.append(Integer(c))
        return r

    def ndigits(self, base=10):
        return Integer(len(self.digits(base))) if self._n else Integer(1)

    def factorial(self):
        if self._n < 0:
            raise ValueError("factorial only defined for nonnegative integers")
        return Integer(math.factorial(self._n))

    def gcd(self, otro):
        return Integer(math.gcd(self._n, int(ZZ(otro))))

    def lcm(self, otro):
        return Integer(math.lcm(self._n, int(ZZ(otro))))

    def sqrt(self):
        if self.is_square():
            return Integer(math.isqrt(self._n))
        no_lo_se("La raíz de un entero que no es un cuadrado (es un número simbólico)")

    def isqrt(self):
        if self._n < 0:
            raise ValueError("square root of negative integer not defined")
        return Integer(math.isqrt(self._n))

    def numerator(self):
        return self

    def denominator(self):
        return Integer(1)

    def round(self, mode="away"):
        return self

    def floor(self):
        return self

    def ceil(self):
        return self

    def is_integer(self):
        return True

    def nbits(self):
        return Integer(abs(self._n).bit_length())

    def binary(self):
        return format(self._n, "b")

    def str(self, base=10):
        if int(base) == 10:
            return str(self._n)
        return _en_base(self._n, int(base))


class Rational(_Operaciones):
    """Una fracción de Sage (QQ), siempre simplificada."""
    __module__ = "sage.rings.rational"
    _rango = 1
    __slots__ = ("_q",)

    def __init__(self, q=0, d=None):
        if d is not None:
            q = Fraction(int(ZZ(q)), int(ZZ(d)))
        elif isinstance(q, Rational):
            q = q._q
        elif isinstance(q, Integer):
            q = Fraction(q._n)
        elif isinstance(q, str):
            q = Fraction(q.strip())
        self._q = Fraction(q)

    @classmethod
    def _de_estado(cls, par):
        return cls(Fraction(*par))

    def _estado(self):
        return (self._q.numerator, self._q.denominator)

    def _valor_exacto(self):
        return self._q

    def _clave(self):
        return self._q

    def __repr__(self):
        q = self._q
        return str(q.numerator) if q.denominator == 1 else f"{q.numerator}/{q.denominator}"

    __str__ = __repr__

    def __hash__(self):
        return hash(self._q)

    def parent(self):
        return QQ

    def _op_mismo(self, b, op):
        x, y = self._q, b._q
        if op == "+": return Rational(x + y)
        if op == "-": return Rational(x - y)
        if op == "*": return Rational(x * y)
        if op == "/":
            if y == 0:
                raise ZeroDivisionError("rational division by zero")
            return Rational(x / y)
        if op == "//":
            if y == 0:
                raise ZeroDivisionError("rational division by zero")
            return Integer(x // y)
        if op == "%":
            no_lo_se("El resto (%) de una fracción")
        raise TypeError(op)

    def __pow__(self, e, mod=None):
        if mod is not None:
            no_lo_se("Una potencia modular de una fracción")
        if isinstance(e, (Integer, int)) and not isinstance(e, bool):
            k = int(e)
            if k < 0 and self._q == 0:
                raise ZeroDivisionError("rational division by zero")
            return Rational(self._q ** k)
        if isinstance(e, RealNumber):
            return RR(self) ** e
        if isinstance(e, float):
            return float(self._q) ** e
        if isinstance(e, Rational):
            r = _potencia_exacta(self._q, e._q)
            if r is not None:
                return Rational(r)
        no_lo_se("Elevar una fracción a una fracción cuando la raíz no es exacta (es simbólica)")

    def __rpow__(self, b):
        o = _eleva(b)
        if o is None:
            return NotImplemented
        return o ** self

    def __neg__(self): return Rational(-self._q)
    def __pos__(self): return self
    def __abs__(self): return Rational(abs(self._q))

    def numerator(self):
        return Integer(self._q.numerator)

    def denominator(self):
        return Integer(self._q.denominator)

    def floor(self):
        return Integer(math.floor(self._q))

    def ceil(self):
        return Integer(math.ceil(self._q))

    def is_integer(self):
        return self._q.denominator == 1

    def round(self, mode="even"):
        if mode != "even":
            no_lo_se("round() con otro modo")
        return Integer(_builtins.round(self._q))      # al par más cercano, como Sage


class RealNumber(_Operaciones):
    """Un decimal de Sage de 53 bits (RR). Se escribe con 15 cifras significativas."""
    __module__ = "sage.rings.real_mpfr"
    _rango = 2
    __slots__ = ("_x",)

    def __init__(self, s="0", min_prec=53):
        if not isinstance(s, str):
            self._x = float(s)
            return
        texto = s.strip().lower().replace("_", "")
        mantisa = texto.split("e")[0].lstrip("+-")
        cifras = mantisa.replace(".", "").lstrip("0")
        if len(cifras) > 15:
            no_lo_se("Un decimal con más de 15 cifras (Sage le da más precisión)")
        self._x = float(texto)
        self._comprueba()

    @classmethod
    def _de(cls, x):
        r = cls.__new__(cls)
        r._x = float(x)
        r._comprueba()
        return r

    @classmethod
    def _de_estado(cls, x):
        return cls._de(x)

    def _estado(self):
        return self._x

    def _comprueba(self):
        x = self._x
        if x != x or x in (math.inf, -math.inf):
            no_lo_se("Un decimal tan grande (o que no es un número)")
        if x != 0 and abs(x) < 2.2250738585072014e-308:
            no_lo_se("Un decimal tan pequeño")

    def _valor_exacto(self):
        return Fraction(self._x)

    def _clave(self):
        return self._x

    def __float__(self):
        return self._x

    def __hash__(self):
        return hash(self._x)

    def __bool__(self):
        return self._x != 0

    def parent(self):
        return RR

    def __repr__(self):
        return _escribe_rr(self._x)

    __str__ = __repr__

    def _op_mismo(self, b, op):
        x, y = self._x, b._x
        if op == "+": return RealNumber._de(x + y)
        if op == "-": return RealNumber._de(x - y)
        if op == "*": return RealNumber._de(x * y)
        if op == "/":
            if y == 0:
                no_lo_se("Dividir un decimal entre cero (Sage da ±infinity)")
            return RealNumber._de(x / y)
        if op in ("//", "%"):
            no_lo_se(f"El operador {op} con decimales")
        raise TypeError(op)

    def _opera(self, otro, nombre, al_reves=False):
        if isinstance(otro, float):
            otro = RealNumber._de(otro)
        return super()._opera(otro, nombre, al_reves)

    def __pow__(self, e, mod=None):
        if mod is not None:
            no_lo_se("Una potencia modular de un decimal")
        if isinstance(e, (Integer, int)) and not isinstance(e, bool):
            return RealNumber._de(self._x ** int(e))
        if isinstance(e, (Rational, RealNumber, float)):
            if self._x < 0:
                no_lo_se("Elevar un decimal negativo a algo que no es entero (da un complejo)")
            return RealNumber._de(self._x ** float(e))
        return NotImplemented

    def __rpow__(self, b):
        o = _eleva(b)
        if o is None:
            return NotImplemented
        return RR(o) ** self

    def __neg__(self): return RealNumber._de(-self._x)
    def __pos__(self): return self
    def __abs__(self): return RealNumber._de(abs(self._x))

    def sqrt(self):
        if self._x < 0:
            no_lo_se("La raíz de un decimal negativo (da un complejo)")
        return RealNumber._de(math.sqrt(self._x))

    def prec(self):
        return Integer(53)

    def floor(self):
        return Integer(math.floor(self._x))

    def ceil(self):
        return Integer(math.ceil(self._x))

    def is_integer(self):
        return self._x == math.floor(self._x)

    def round(self):
        q = abs(Fraction(self._x))
        r = math.floor(q + Fraction(1, 2))
        return Integer(r if self._x >= 0 else -r)


def _escribe_rr(x):
    """Como escribe Sage un decimal de 53 bits: 15 cifras significativas, sin quitar ceros;
    en notación fija si 10^-5 ≤ |x| < 10^6 y en científica fuera de ese margen."""
    if x == 0:
        return ("-" if math.copysign(1, x) < 0 else "") + "0.000000000000000"
    signo = "-" if x < 0 else ""
    m, e = f"{abs(x):.14e}".split("e")
    cifras = m.replace(".", "")
    k = int(e)                                    # x = d.ddd… × 10^k
    if -5 <= k <= 5:
        if k >= 0:
            return signo + cifras[:k + 1] + "." + cifras[k + 1:]
        return signo + "0." + "0" * (-k - 1) + cifras
    return signo + cifras[0] + "." + cifras[1:] + "e" + str(k)


# ── Factorizationes ───────────────────────────────────────────────────────────────────────
class Factorization:
    """Lo que devuelve factor(): se escribe 2^3 * 3^2 * 5 y se recorre como pares (primo, exponente)."""
    __module__ = "sage.structure.factorization"

    def __init__(self, pares, unidad=1):
        self._pares = [(Integer(p), Integer(e)) for p, e in pares]
        self._unidad = int(unidad)

    @classmethod
    def de_entero(cls, n):
        if n == 0:
            raise ArithmeticError("factorization of 0 is not defined")
        unidad, m, pares, p = (1 if n > 0 else -1), abs(n), [], 2
        while p * p <= m:
            e = 0
            while m % p == 0:
                m //= p
                e += 1
            if e:
                pares.append((p, e))
            p += 1 if p == 2 else 2
        if m > 1:
            pares.append((m, 1))
        return cls(pares, unidad)

    def __repr__(self):
        trozos = [f"{p}" if e == 1 else f"{p}^{e}" for p, e in self._pares]
        if self._unidad == -1:
            trozos = ["-1"] + trozos
        return " * ".join(trozos) if trozos else "1"

    __str__ = __repr__

    def __iter__(self):
        return iter(self._pares)

    def __len__(self):
        return len(self._pares)

    def __getitem__(self, i):
        return self._pares[i]

    def unit(self):
        return Integer(self._unidad)

    def value(self):
        v = self._unidad
        for p, e in self._pares:
            v *= int(p) ** int(e)
        return Integer(v)

    expand = value

    def __reduce__(self):
        return (type(self), ([(int(p), int(e)) for p, e in self._pares], self._unidad))


class IntegerFactorization(Factorization):
    """La factorización de un entero: en Sage es una clase hija de Factorization."""
    __module__ = "sage.structure.factorization_integer"


# ── Funciones de Sage que el laboratorio sabe hacer ───────────────────────────────────────
_PRIMOS_PEQUENOS = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71]


def _es_primo(n):
    """Divisiones hasta 1000 y después Miller-Rabin con las bases 2, 3, …, 71: es exacto para
    n < 3,3·10²⁴ (bases hasta 41), y para números mayores el error es despreciable."""
    if n < 2:
        return False
    for p in range(2, 1000):
        if p * p > n:
            return True
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for a in _PRIMOS_PEQUENOS:
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True


def _raiz_entera(n, k):
    """La raíz k-ésima exacta de un entero n ≥ 0, o None."""
    r = _builtins.round(n ** (1.0 / k)) if n < 2 ** 1000 else None
    if r is None:
        return None
    for c in (r - 1, r, r + 1):
        if c >= 0 and c ** k == n:
            return c
    return None


def _potencia_exacta(b, e):
    """b^e con b y e fracciones, si el resultado es una fracción exacta (4^(1/2) = 2); si no, None."""
    p, q = e.numerator, e.denominator
    if b < 0:                                     # (-8)^(1/3) es simbólico en Sage: 2*(-1)^(1/3)
        return None
    num, den = _raiz_entera(b.numerator, q), _raiz_entera(b.denominator, q)
    if num is None or den is None:
        return None
    if num == 0 and p < 0:
        raise ZeroDivisionError("rational division by zero")
    return Fraction(num, den) ** p


def _en_base(n, b):
    cifras = "0123456789abcdefghijklmnopqrstuvwxyz"
    if n == 0:
        return "0"
    s, m = "", abs(n)
    while m:
        m, c = divmod(m, b)
        s = cifras[c] + s
    return ("-" if n < 0 else "") + s


def _entero(x, que):
    if isinstance(x, (Integer, int)) and not isinstance(x, bool):
        return Integer(x)
    if isinstance(x, Rational) and x._q.denominator == 1:
        return Integer(x._q.numerator)
    no_lo_se(que)


def factor(n, *args, **kw):
    if args or kw:
        no_lo_se("factor() con opciones")
    return _entero(n, "factor() de algo que no es un entero").factor()


def is_prime(n):
    return _entero(n, "is_prime() de algo que no es un entero").is_prime()


def next_prime(n):
    return _entero(n, "next_prime() de algo que no es un entero").next_prime()


def previous_prime(n):
    return _entero(n, "previous_prime() de algo que no es un entero").previous_prime()


def divisors(n):
    return _entero(n, "divisors() de algo que no es un entero").divisors()


def factorial(n):
    return _entero(n, "factorial() de algo que no es un entero").factorial()


def binomial(n, k):
    return Integer(math.comb(int(_entero(n, "binomial()")), int(_entero(k, "binomial()"))))


def gcd(a, b=None):
    if b is None:
        no_lo_se("gcd() de una lista")
    if isinstance(a, Rational) or isinstance(b, Rational):
        no_lo_se("gcd() de fracciones")
    return Integer(math.gcd(int(_entero(a, "gcd()")), int(_entero(b, "gcd()"))))


def inverse_mod(a, m):
    """inverse_mod de Sage: el inverso de a módulo m (siempre un entero de Sage)."""
    a, m = _entero(a, "inverse_mod() de algo que no es un entero"), _entero(m, "inverse_mod() módulo algo que no es un entero")
    if abs(m._n) == 1:
        return Integer(0)
    try:
        return Integer(pow(a._n, -1, abs(m._n)))
    except ValueError:
        raise ZeroDivisionError(f"inverse of Mod({a._n}, {m._n}) does not exist") from None


def power_mod(a, n, m):
    """power_mod de Sage: a^n módulo m, con el mismo tipo que a % m."""
    if not m:
        raise ZeroDivisionError("modulus must be nonzero")
    if isinstance(a, Rational) or isinstance(n, Rational) or isinstance(m, Rational):
        no_lo_se("power_mod() con fracciones")
    a = a % m
    if m == 1:
        if not isinstance(a, Integer):
            raise AttributeError("'int' object has no attribute 'parent'")
        return Integer(0)
    n = _entero(n, "power_mod() con un exponente que no es un entero")
    if not n:
        return Integer(1) if isinstance(a, Integer) else 1
    if n < 0:
        a = inverse_mod(a, m)
        n = -n
    r = pow(int(a), int(n), int(m))
    return Integer(r) if isinstance(a, Integer) else r


def lcm(a, b=None):
    if b is None:
        no_lo_se("lcm() de una lista")
    return Integer(math.lcm(int(_entero(a, "lcm()")), int(_entero(b, "lcm()"))))


def n(x, prec=None, digits=None):
    if isinstance(x, (int, bool)):
        x = Integer(x)
    if not isinstance(x, Elemento):
        no_lo_se("n() de algo que no es un número")
    return x.n(prec, digits)


N = numerical_approx = n


def sqrt(x):
    if isinstance(x, (int, bool)):
        x = Integer(x)
    if isinstance(x, Integer):
        return x.sqrt()
    if isinstance(x, RealNumber):
        return x.sqrt()
    no_lo_se("La raíz de una fracción (puede ser simbólica)")


def floor(x):
    if isinstance(x, (int, bool)):
        return Integer(x)
    if isinstance(x, Elemento):
        return x.floor()
    if isinstance(x, float):
        return Integer(math.floor(x))
    no_lo_se("floor() de algo que no es un número")


def ceil(x):
    if isinstance(x, (int, bool)):
        return Integer(x)
    if isinstance(x, Elemento):
        return x.ceil()
    if isinstance(x, float):
        return Integer(math.ceil(x))
    no_lo_se("ceil() de algo que no es un número")


def srange(a, b=None, step=1):
    if b is None:
        a, b = 0, a
    a, b, step = Integer(a) if not isinstance(a, Elemento) else a, b, step
    if not all(isinstance(v, (Integer, int)) for v in (a, b, step)):
        no_lo_se("srange() con fracciones o decimales")
    return [Integer(k) for k in range(int(a), int(b), int(step))]


def ellipsis_range(*args, step=None):
    """[1..10] y [1, 3..11] del preparador: listas que incluyen el último valor."""
    i = args.index(Ellipsis)
    antes, despues = args[:i], args[i + 1:]
    if len(despues) != 1 or len(antes) not in (1, 2):
        no_lo_se("Esta forma de […]")
    ini, fin = antes[0], despues[0]
    paso = antes[1] - antes[0] if len(antes) == 2 else (step if step is not None else Integer(1))
    if not all(isinstance(v, (Integer, int)) for v in (ini, fin, paso)):
        no_lo_se("[a..b] con fracciones o decimales")
    ini, fin, paso = int(ini), int(fin), int(paso)
    if paso == 0:
        raise ValueError("step must not be zero")
    fin_excl = fin + (1 if paso > 0 else -1)
    return [Integer(k) for k in range(ini, fin_excl, paso)]


def sum(expression, *args, **kwds):
    """Como el sum() de Sage: con una lista, el sum() de Python."""
    if hasattr(expression, "sum"):
        no_lo_se("sum() simbólico")
    if max(len(args), len(kwds)) <= 1:
        return _builtins.sum(expression, *args, **kwds)
    no_lo_se("sum() simbólico (con variable y límites)")


def round(x, ndigits=None):
    """Como el round() de Sage: el método round() del número (redondea alejándose del cero)."""
    if ndigits:
        no_lo_se("round() con cifras decimales (da un número de Real Double Field)")
    if isinstance(x, Elemento):
        return x.round()
    no_lo_se("round() de un número de Python (da un número de Real Double Field)")


def ellipsis_iter(*args, step=None):
    return iter(ellipsis_range(*args, step=step))


# ── Todo lo demás de Sage: existe, pero avisa ─────────────────────────────────────────────
class Pendiente:
    """Un nombre de Sage que el laboratorio todavía no sabe usar."""

    def __init__(self, nombre):
        object.__setattr__(self, "_nombre", nombre)

    def _aviso(self, *a, **k):
        no_lo_se(f"«{self._nombre}»")

    __call__ = _aviso

    def __getattr__(self, a):
        if a.startswith("_") or a == "parent":
            raise AttributeError(a)
        self._aviso()
    __add__ = __radd__ = __sub__ = __rsub__ = __mul__ = __rmul__ = _aviso
    __truediv__ = __rtruediv__ = __pow__ = __rpow__ = __neg__ = __lt__ = __gt__ = __le__ = __ge__ = _aviso
    __getitem__ = __iter__ = __bool__ = __len__ = _aviso

    def __eq__(self, o):
        self._aviso()

    __hash__ = object.__hash__

    def __repr__(self):
        return f"<{self._nombre}: todavía no está en el laboratorio>"

    def __reduce__(self):
        return (Pendiente, (self._nombre,))


PROPIOS = {
    "preparse": preparse, "Integer": Integer, "Rational": Rational, "RealNumber": RealNumber, "ZZ": ZZ, "QQ": QQ, "RR": RR,
    "IntegerRing": IntegerRing, "RationalField": RationalField, "parent": parent,
    "factor": factor, "is_prime": is_prime, "next_prime": next_prime, "previous_prime": previous_prime,
    "divisors": divisors, "factorial": factorial, "binomial": binomial, "gcd": gcd, "lcm": lcm,
    "inverse_mod": inverse_mod, "power_mod": power_mod,
    "n": n, "N": N, "numerical_approx": numerical_approx, "sqrt": sqrt, "srange": srange,
    "ellipsis_range": ellipsis_range, "ellipsis_iter": ellipsis_iter, "sum": sum, "round": round, "floor": floor, "ceil": ceil,
}


def _entorno():
    nombres = json.loads((Path(__file__).with_name("nombres_sage.json")).read_text())
    base = {k: Pendiente(k) for k in nombres}
    base["x"] = Pendiente("x (la variable simbólica)")
    base.update(PROPIOS)
    return base


ENTORNO = _entorno()
