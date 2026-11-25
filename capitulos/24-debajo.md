---
title: Qué hay debajo
subtitle: Los programas que hacen las cuentas, y cómo hablar con ellos sin intermediarios
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

El capítulo 23 acabó con una lista: MPFR, el procesador, MPFI, Arb… y antes GMP, PARI, FLINT, LinBox, NTL, Maxima, Pynac.

Desde el capítulo 0, el visualizador dice en cada línea **quién calcula**. Casi nunca es Sage.

## La pregunta

¿Cuántos programas hay debajo de Sage? ¿Cómo les habla Sage? ¿Se les puede hablar directamente, en su propio idioma?

## La idea

- Sage está escrito en Python, y reparte el trabajo. Las cuentas las hacen bibliotecas y programas que ya existían, muchos de ellos con décadas de historia.
- Hay dos maneras de hablar con ellos. Una **biblioteca** se carga dentro de Sage, y las llamadas son directas: así funcionan GMP, MPFR, PARI, FLINT o GAP. Un **programa aparte** se arranca por separado, y Sage le escribe y le lee el texto que contesta, como haría una persona en una consola.
- Algunos admiten las dos maneras. Maxima y Singular se usan como bibliotecas en las cuentas de siempre, y como programas aparte con `maxima(...)` y `singular(...)`.
- Cada uno tiene su propio lenguaje, con sus nombres y sus costumbres: `Size` en GAP, `isprime` en PARI. Sage traduce en los dos sentidos.
- Un objeto que viene de debajo no es un elemento de Sage. Para traerlo de vuelta hay que convertirlo: con `ZZ(...)`, con `.sage()`…

:::{figure} ../datos/graficos/24-debajo-mapa.svg
:alt: Los programas que hay debajo de Sage, agrupados por temas, con los capítulos en que han salido
:width: 480px

Los programas que el visualizador ha nombrado hasta aquí, por temas. GAP ya calculó el orden de un grupo en el capítulo 20; Singular sale por primera vez en este.
:::

## Construcción

### 1 · Lo que ya se ha visto

Tres cuentas de los primeros capítulos y una factorización. Cada línea la hace un programa distinto.

:::{tip} Predice
¿Quién calcula `1/3 + 1/6`? ¿Y `0.1 + 0.2`? ¿Y la factorización?
:::

```{code-cell} sage
a = 2^32 + 1
b = 1/3 + 1/6
c = 0.1 + 0.2
f = factor(a)
f
is_prime(641)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/24-debajo-1.json","config":{"titulo":"Tres programas en cuatro líneas","etiqueta":"GMP · MPFR · PARI","idea":"El entero y la fracción los calcula GMP; el decimal, MPFR; la factorización y el test de primalidad, PARI. Sage solo decide a quién preguntar.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `a = 2^32 + 1` vale `4294967297`, y `b = 1/3 + 1/6` vale `1/2`. Los dos los calcula **GMP**.
- `c = 0.1 + 0.2` vale `0.300000000000000`. Lo calcula **MPFR**.
- `f = factor(a)` escribe `641 * 6700417`, e `is_prime(641)` escribe `True`. Los dos los calcula **PARI**.

Fermat creía que todos los números de la forma 2^(2^n) + 1 eran primos. Este es el de n = 5, y Euler encontró en 1732 que se divide entre 641. PARI lo hace hoy en una milésima de segundo.

Este programa solo usa enteros, fracciones y decimales: el laboratorio lo ejecuta entero en el navegador.

### 2 · PARI, sin intermediarios

`pari(...)` le pasa a PARI un texto escrito en su propio lenguaje, GP, y devuelve lo que PARI contesta. PARI es una biblioteca: vive dentro de Sage, a través de **cypari2**.

```{code-cell} sage
p = pari('2^64 + 1')
p
type(p)
p.factor()
M = pari(2)^127 - 1
M.isprime()
ZZ(p)
parent(ZZ(p))
pari.version()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/24-debajo-2.json","config":{"titulo":"Hablar con PARI","etiqueta":"pari · Gen · factor · isprime · ZZ","idea":"p no es un entero de Sage: es un Gen, un objeto de PARI, sin padre. Sus métodos son los de PARI, y la factorización sale como una matriz de PARI. ZZ(p) lo trae de vuelta a los enteros de Sage.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `p` escribe `18446744073709551617`, pero `type(p)` escribe `<class 'cypari2.gen.Gen'>`. Es un **Gen**, el tipo de todos los objetos de PARI, y no tiene padre de Sage.
- `p.factor()` escribe `[274177, 1; 67280421310721, 1]`. Es una matriz de PARI: en la primera columna, los primos; en la segunda, los exponentes. El `;` separa las filas.
- `M = pari(2)^127 - 1` es el primo que Édouard Lucas comprobó a mano en 1876. `M.isprime()` escribe `True`.
- `ZZ(p)` escribe el mismo número, pero ahora `parent` dice `Integer Ring`: ha vuelto a Sage.
- `pari.version()` escribe `(2, 17, 4)`: PARI 2.17.4.

**Trampa:** un Gen se escribe igual que un entero de Sage, pero no lo es. Sus métodos son los de PARI: tiene `isprime` y no tiene `is_prime`.

### 3 · Maxima, un programa aparte

`maxima(...)` le escribe a Maxima un texto en su lenguaje y lee lo que contesta. Este Maxima es un **programa aparte**: un proceso distinto del de Sage, que arranca la primera vez que se usa.

```{code-cell} sage
m = maxima('integrate(x^2, x)')
m
type(m)
maxima('factor(x^4 - 1)')
s = m.sage()
s
parent(s)
maxima.version()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/24-debajo-3.json","config":{"titulo":"Hablar con Maxima","etiqueta":"maxima · MaximaElement · .sage()","idea":"m vive dentro de Maxima, y se escribe como lo escribe Maxima: x^3/3. Con .sage(), la expresión pasa al anillo simbólico de Sage, que la escribe a su manera: 1/3*x^3.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `m` escribe `x^3/3`, con la notación de Maxima.
- `type(m)` escribe `<class 'sage.interfaces.maxima.MaximaElement'>`. Su padre es la interfaz con Maxima: el objeto es una variable dentro del proceso de Maxima.
- `maxima('factor(x^4 - 1)')` escribe `(x-1)*(x+1)*(x^2+1)`, sin espacios, como Maxima.
- `s = m.sage()` escribe `1/3*x^3`, y `parent(s)` escribe `Symbolic Ring`. La misma expresión, traída a Sage.
- `maxima.version()` escribe `'5.50.0'`.

El `integrate` del capítulo 8 también usa Maxima, pero no este. Maxima está escrito en Lisp, y para las cuentas de siempre Sage lo carga como biblioteca, dentro de ECL, un Lisp que funciona dentro del propio Sage. Con `maxima(...)` se arranca otra copia, aparte. Por eso la primera llamada tarda casi un segundo.

### 4 · GAP, el programa de los grupos

GAP calcula con grupos. Sage lo carga como biblioteca, **libgap**, y `libgap.` da acceso a todas sus funciones, con sus nombres.

```{code-cell} sage
G = libgap.SymmetricGroup(5)
G
G.Size()
type(G.Size())
G.IsSolvable()
S5 = SymmetricGroup(5)
S5.order()
S5.gap()
libgap.eval('Size(AlternatingGroup(5))')
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/24-debajo-4.json","config":{"titulo":"Hablar con GAP","etiqueta":"libgap · Size · IsSolvable · gap()","idea":"G es un grupo de GAP, con los nombres de GAP: Size, IsSolvable. S5 es un grupo de Sage, con los nombres de Sage, pero order() se lo pregunta a GAP. Y .gap() da el mismo grupo dentro de GAP.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `G` escribe `Sym( [ 1 .. 5 ] )`: el grupo de las permutaciones de cinco elementos, con la notación de GAP.
- `G.Size()` escribe `120`, y `type` dice `GapElement_Integer`: un entero de GAP.
- `G.IsSolvable()` escribe `false`, en minúscula: así escribe GAP los valores de verdad.
- `S5 = SymmetricGroup(5)` es el mismo grupo, pero como objeto de Sage. `S5.order()` escribe `120`, y el visualizador dice que lo calcula **GAP**: Sage no guarda el orden, y se lo pregunta.
- `S5.gap()` escribe `Sym( [ 1 .. 5 ] )`: el grupo de Sage, pasado a GAP.
- `libgap.eval('Size(AlternatingGroup(5))')` escribe `60`. Con `eval`, se escribe directamente en el lenguaje de GAP.

GAP usa nombres con mayúsculas, como `Size` o `IsSolvable`; Sage, minúsculas y guiones bajos, como `order` o `is_solvable`. Desde `G` se usan los nombres de GAP, y desde `S5`, los de Sage.

::::{div}
:class: afondo
### 5 · Singular y una trampa de 64 bits

Singular calcula con polinomios de varias variables. Los polinomios de `QQ['x,y']` son suyos: Sage los guarda en **libsingular**, la versión en biblioteca. Con `singular(...)` se arranca, además, el programa aparte.

Una **base de Gröbner** de un sistema de ecuaciones polinómicas es otro sistema con las mismas soluciones, pero más fácil de resolver, como la forma escalonada de Gauss del capítulo 13. Aquí, la circunferencia x² + y² = 1 y la recta x = y.

```{code-cell} sage
R.<x,y> = PolynomialRing(QQ, order='lex')
I = R.ideal([x^2 + y^2 - 1, x - y])
B = I.groebner_basis()
B
I.variety(AA)
singular(I).groebner()
singular('2^62')
singular('2^63')
singular('bigint(2)^63')
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/24-debajo-5.json","config":{"titulo":"Hablar con Singular","etiqueta":"Gröbner · variety · int · bigint","idea":"La base de Gröbner se lee de abajo arriba: y² = 1/2, y después x = y. Las dos soluciones son reales. En el lenguaje de Singular, un número sin más es un int de 64 bits: 2^63 se pasa y da la vuelta, sin que Sage avise.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `order='lex'` ordena los monomios como un diccionario: primero por la potencia de x, después por la de y. Con este orden, la base de Gröbner va eliminando variables.
- `B` escribe `[x - y, y^2 - 1/2]`. Se lee de abajo arriba: la última ecuación solo tiene y, y da y² = 1/2. La primera da x = y.
- `I.variety(AA)` escribe las dos soluciones, x = y = −0.7071067811865475? y x = y = 0.7071067811865475?. Son ±√2/2, en AA: los números algebraicos de QQbar (capítulo 16) que son reales. También aquí calcula Singular.
- `singular(I).groebner()` hace la misma cuenta en el programa aparte, y escribe `2*y^2-1,` y `x-y`. Singular no divide para que el primer coeficiente sea 1; Sage, sí.
- `singular('2^62')` escribe `4611686018427387904`, que es correcto.
- `singular('2^63')` escribe `-9223372036854775808`, que es falso. En el lenguaje de Singular, un número sin más es un `int`, un entero de 64 bits del procesador, y el mayor es 2⁶³ − 1. Al pasarse, da la vuelta, como un cuentakilómetros, y sale negativo.
- `singular('bigint(2)^63')` escribe `9223372036854775808`. Un `bigint` de Singular no tiene límite: lo guarda GMP.

Singular sí avisa: `singular.eval('2^63')` escribe `// ** int overflow(^), result may be wrong` antes del número. Pero `singular(...)` se queda solo con el número, y el aviso se pierde. Al hablar directamente con un programa, se habla con sus reglas, también con las que Sage normalmente esconde.
::::

## Dos maneras de hablar

| Programa | Cómo lo carga Sage | Cómo se le habla directamente | Qué devuelve |
|---|---|---|---|
| PARI | biblioteca (cypari2) | `pari('...')` | un `Gen` |
| GAP | biblioteca (libgap) | `libgap.Funcion(...)`, `libgap.eval('...')` | un `GapElement` |
| Maxima | biblioteca dentro de ECL, para `integrate`, `limit`… | `maxima('...')`, programa aparte | un `MaximaElement` |
| Singular | biblioteca (libsingular), para los polinomios de varias variables | `singular('...')`, programa aparte | un `SingularElement` |

Y para volver a Sage: `ZZ(...)`, `QQ(...)` o el padre que toque, y `.sage()` en los objetos de las interfaces.

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Quién hace las cuentas en cada lenguaje (comprobado con Sage 10.8, Python 3.13 con SymPy 1.14 y Julia con Nemo 0.57):

| | Sage | Python | Julia |
|---|---|---|---|
| Enteros grandes | GMP | `int` de Python, con su propia aritmética | `BigInt`, con GMP 6.3.0 |
| Decimales con precisión | MPFR | `mpmath`, escrito en Python | `BigFloat`, con MPFR 4.2.2 |
| Factorizar 2³² + 1 | `factor(2^32 + 1)`, con PARI | `sympy.factorint(2**32 + 1)` da `{641: 1, 6700417: 1}` | `factor(ZZ(2)^32 + 1)`, con Nemo, da `641 * 6700417` |
| ¿Es primo 2¹²⁷ − 1? | `is_prime(2^127 - 1)`, con PARI | `sympy.isprime(2**127 - 1)` da `True` | `is_prime(ZZ(2)^127 - 1)` da `true` |
| Quién está debajo | PARI, GMP, FLINT, Maxima… | nadie: SymPy y mpmath son Python puro | Nemo es una capa sobre FLINT |

**Trampa de Python:** SymPy puede usar GMP si está instalado `gmpy2`, y entonces va mucho más rápido. Sin él, `sympy.external.gmpy.GROUND_TYPES` vale `'python'` y todo se hace con los enteros de Python.
:::

## Conexiones

- En el capítulo 8, `integrate` pasaba por Maxima, y `numerical_integral`, por GSL. Aquí se ha visto el Maxima que hay detrás, y otro, aparte.
- En el capítulo 17, `is_prime` y `factor` eran de PARI. Aquí se le ha hablado sin Sage de por medio.
- En el capítulo 18, `roots(AA)` daba las raíces reales exactas de un polinomio de una variable. `variety(AA)` hace lo mismo con un sistema de varias.
- En el capítulo 20, el orden del grupo de simetrías del grafo de Petersen ya lo calculaba GAP.
- En los capítulos 21 y 22, cada elemento tenía un padre. Los objetos de PARI no lo tienen, y los de Maxima, GAP y Singular tienen por padre la interfaz: por eso hay que convertirlos para volver.
- En el capítulo 23, MPFI y Arb hacían los intervalos y las bolas. Están en el mapa, con los demás.

## La grieta

cypari2 y libgap están escritos en **Cython**, un lenguaje que mezcla Python y C, y así es como Sage llega a las bibliotecas de C. Gran parte del propio Sage también lo está.

Y los ejemplos de la documentación de Sage no son solo ejemplos: se ejecutan uno a uno para comprobar que cada función hace lo que dice.

¿Cómo se escriben esos ejemplos que se comprueban solos? ¿Cómo se usa Sage en un cuaderno de Jupyter? ¿Y cómo se escribe una función en Cython para que vaya más rápido? Es el capítulo 25, **Doctests, cuadernos Jupyter y Cython**.

## Ejercicios

1. **El siguiente de Fermat.** ¿Qué escribe `factor(2^64 + 1)`? ¿Quién lo calcula?

2. **Verdadero en GP.** ¿Qué escribe `pari('isprime(2^127 - 1)')`? ¿Por qué no escribe `True`, como `M.isprime()`?

3. **Una suma mixta.** ¿Qué escribe `5 + pari(10)`? ¿De qué tipo es el resultado?

4. **Derivar en Maxima.** ¿Qué escribe `maxima('diff(sin(x)^2, x)')`?

5. **Grupos resolubles.** ¿Qué escriben `libgap.AlternatingGroup(5).IsSolvable()` y `libgap.SymmetricGroup(4).IsSolvable()`?

6. **Maxima no se pasa.** ¿Qué escribe `maxima('2^100')`? Compáralo con Singular.

::::{div}
:class: afondo
7. **Una vuelta completa.** ¿Qué escriben `singular('2^64')` y `singular.eval('2^64')`? ¿Por qué sale ese número?

8. **La circunferencia y la parábola.** Con el anillo del apartado 5, ¿qué escribe `R.ideal([x^2 + y^2 - 1, y - x^2]).groebner_basis()`? ¿Cuántos puntos da `variety(AA)`? ¿Y `variety(QQbar)`?
::::

## Solucionario

1. `274177 * 67280421310721`. Lo calcula PARI, como `factor(a)` en el apartado 1.
2. `1`. En GP no hay `True` ni `False`: verdadero es 1, y falso es 0. Al llamar a `isprime` como método desde Python, cypari2 convierte el resultado en un `bool`.
3. `15`, de tipo `Gen`: el resultado se queda en PARI. Para volver a Sage, `ZZ(5 + pari(10))`.
4. `2*cos(x)*sin(x)`.
5. `false` y `true`. El grupo alternado de 5 elementos no es resoluble; el simétrico de 4, sí.
6. `1267650600228229401496703205376`, exacto. Maxima usa enteros sin límite, como GMP. En Singular, `2^100` sería un `int` de 64 bits, y saldría mal.

::::{div}
:class: afondo
7. `0`, y `'// ** int overflow(^), result may be wrong\n0'`. 2⁶⁴ da una vuelta completa a los 64 bits, como un cuentakilómetros que pasa de 99999 a 00000, y vuelve al 0. Solo `eval` deja ver el aviso.
8. `[x^2 - y, y^2 + y - 1]`. La última ecuación da y = (−1 ± √5)/2. Con y = 0.618033988749895?, x² = y tiene dos soluciones reales, x = ±0.7861513777574233?: `variety(AA)` da 2 puntos. Con y = −1.618033988749895?, x² = y es negativo: las soluciones son complejas, y `variety(QQbar)` da 4 puntos.
::::
