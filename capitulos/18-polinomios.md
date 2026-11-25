---
title: Polinomios y anillos
subtitle: Dividir, factorizar y cambiar de dónde salen los coeficientes
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En el capítulo 17, los enteros se dividían con cociente y resto, tenían máximo común divisor y se descomponían en primos. Los **polinomios** hacen lo mismo:

- se dividen con cociente y resto, como en la regla de Ruffini;
- tienen mcd, y el algoritmo de Euclides sirve igual;
- se descomponen en «polinomios primos», que se llaman **irreducibles**.

Pero hay una diferencia: un polinomio depende de **dónde viven sus coeficientes**. *x*⁴ + 1 no se puede factorizar con coeficientes racionales. Módulo 2, en cambio, es (*x* + 1)⁴. El polinomio parece el mismo, pero no lo es.

## La pregunta

¿Cómo guarda Sage un polinomio, y en qué se diferencia de una expresión simbólica? ¿Por qué el mismo *x*⁴ + 1 es irreducible en un sitio y se parte en otro?

## La idea

- **`R.<x> = QQ[]`** crea el **anillo de polinomios** en *x* con coeficientes en QQ. Sus elementos no son expresiones de SR: son listas de coeficientes con su propia suma, producto y división.
- **`quo_rem`**, **`gcd`**, **`roots`** y **`factor`** funcionan como con los enteros.
- **`change_ring(GF(p))`** lleva el mismo polinomio a otro anillo de coeficientes. Allí puede factorizarse de otra manera.

## Construcción

### 1 · Ruffini a mano

Un polinomio es su lista de coeficientes. Para dividir *p*(*x*) = *x*³ − 2*x*² − 5*x* + 6 entre *x* − 3, la regla de Ruffini baja el primer coeficiente y luego, en cada paso, multiplica por 3 y suma el siguiente.

:::{tip} Predice
Primer coeficiente: 1. Se multiplica por 3 y se suma −2. ¿Qué sale?
:::

```{code-cell} sage
c = [1, -2, -5, 6]
r = 3
b = [c[0]]
for k in [1..3]:
    b.append(b[-1]*r + c[k])
b
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/18-polinomios-1.json","config":{"titulo":"Bajar, multiplicar y sumar","etiqueta":"Ruffini · listas","idea":"1, luego 1·3 − 2 = 1, luego 1·3 − 5 = −2, y por último −2·3 + 6 = 0. El cociente es x² + x − 2 y el resto 0: x = 3 es raíz de p.","columnas":["k","b"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `b` empieza con el primer coeficiente, `[1]`.
- Vuelta 1: 1·3 + (−2) = 1. Vuelta 2: 1·3 + (−5) = −2. Vuelta 3: (−2)·3 + 6 = 0.
- `b` acaba valiendo `[1, 1, -2, 0]`: los tres primeros números son el **cociente**, *x*² + *x* − 2, y el último es el **resto**, 0.

El resto es justo *p*(3): Ruffini es una forma rápida de evaluar el polinomio (se llama **esquema de Horner**). Como sale 0, *x* = 3 es una **raíz**, y *x* − 3 divide a *p*. Este programa solo usa listas de enteros: el laboratorio lo ejecuta entero en el navegador.

### 2 · El anillo `QQ[x]`

```{code-cell} sage
R.<x> = QQ[]
p = x^3 - 2*x^2 - 5*x + 6
p(3)
q, r = p.quo_rem(x - 3)
p.roots()
p.factor()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/18-polinomios-2.json","config":{"titulo":"Un polinomio de verdad","etiqueta":"QQ[x] · quo_rem · roots · factor","idea":"p ya no es una expresión de SR: vive en QQ[x]. quo_rem da el mismo cociente y resto que Ruffini, roots da las tres raíces con su multiplicidad, y factor descompone p en (x − 3)(x − 1)(x + 2).","columnas":["q","r"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `R.<x> = QQ[]` no es Python. El preparador la reescribe como `R = QQ['x']; (x,) = R._first_ngens(1)`: crea el anillo `R` y le pide su variable, *x*.
- `R` lleva la etiqueta `anillo`: es *Univariate Polynomial Ring in x over Rational Field*.
- `p` lleva la etiqueta `QQ[x]`. Sus cuentas las hace **FLINT**, con sus polinomios de coeficientes racionales (`fmpq_poly`).
- `p(3)` escribe `0`.
- `q` vale `x^2 + x - 2` y `r` vale `0`: lo mismo que Ruffini.
- `p.roots()` escribe `[(3, 1), (1, 1), (-2, 1)]`: cada raíz con su **multiplicidad**.
- `p.factor()` escribe `(x - 3) * (x - 1) * (x + 2)`. Para factorizar en QQ[x], Sage llama a **PARI**.

¿En qué se diferencia de la *x* simbólica del capítulo 3? En SR, *x* es un símbolo cualquiera y Sage no sabe que (*x*² − 1)/(*x* − 1) tiene que ser un polinomio. En QQ[x], *p* es una lista de coeficientes, y la división, el mcd o la factorización tienen un significado preciso, como con los enteros.

### 3 · Euclides con polinomios

El algoritmo de Euclides del capítulo 17 funciona igual: se divide, se toma el resto y se repite. El mcd es el polinomio de mayor grado que divide a los dos.

```{code-cell} sage
R.<x> = QQ[]
p = x^3 - 2*x^2 - 5*x + 6
q = x^2 - 1
gcd(p, q)
d, s, t = xgcd(p, q)
s*p + t*q
lcm(p, q)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/18-polinomios-3.json","config":{"titulo":"El mcd de dos polinomios","etiqueta":"gcd · xgcd · lcm en QQ[x]","idea":"p = (x − 3)(x − 1)(x + 2) y q = (x − 1)(x + 1) solo comparten x − 1: ese es el mcd. xgcd lo escribe como s·p + t·q, igual que la identidad de Bézout de los enteros, pero con s y t polinomios.","columnas":["d","s","t"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `gcd(p, q)` escribe `x - 1`. Como en QQ se puede dividir, Sage da el mcd **mónico**, con coeficiente principal 1.
- `d` vale `x - 1`, `s` vale `-1/4` y `t` vale `1/4*x - 1/2`.
- `s*p + t*q` escribe `x - 1`: −¼·*p* + (¼*x* − ½)·*q* = *x* − 1.
- `lcm(p, q)` escribe `x^4 - x^3 - 7*x^2 + x + 6`, que es (*x* − 3)(*x* − 1)(*x* + 2)(*x* + 1).

Las cuatro cuentas las hace **FLINT**: `gcd`, `xgcd` y `lcm` de QQ[x] llaman a `fmpq_poly_gcd`, `fmpq_poly_xgcd` y `fmpq_poly_lcm`.

### 4 · El mismo polinomio, en otros anillos

```{code-cell} sage
R.<x> = QQ[]
f = x^4 + 1
f.is_irreducible()
f.factor()
for p in [2, 3, 5, 7, 17]:
    print(p, f.change_ring(GF(p)).factor())
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/18-polinomios-4.json","config":{"titulo":"Irreducible aquí, partido allí","etiqueta":"change_ring · GF(p)[x]","idea":"En QQ[x], x⁴ + 1 es irreducible. En GF(2)[x] es (x + 1)⁴; en GF(3), GF(5) y GF(7) se parte en dos factores de grado 2; en GF(17), en cuatro de grado 1.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `f.is_irreducible()` escribe `True`, y `f.factor()` escribe `x^4 + 1`, sin partir.
- `2 (x + 1)^4`: en GF(2), (*x* + 1)⁴ = *x*⁴ + 4*x*³ + 6*x*² + 4*x* + 1, y 4 y 6 son pares, así que valen 0.
- `3 (x^2 + x + 2) * (x^2 + 2*x + 2)`, `5 (x^2 + 2) * (x^2 + 3)` y `7 (x^2 + 3*x + 1) * (x^2 + 4*x + 1)`: dos factores de grado 2, distintos en cada caso.
- `17 (x + 2) * (x + 8) * (x + 9) * (x + 15)`: cuatro factores de grado 1. Módulo 17, *x*⁴ + 1 tiene cuatro raíces: 2, 8, 9 y 15 (por ejemplo, 2⁴ + 1 = 17 ≡ 0).

`f.change_ring(GF(p))` es el mismo polinomio con los coeficientes leídos módulo *p*. En GF(*p*)[x], las cuentas y la factorización las hace **FLINT** (`nmod_poly_factor`), no PARI.

Ser irreducible no es una propiedad del polinomio solo: es del polinomio **y de su anillo**. Lo mismo pasaba con el giro del capítulo 16, que no se diagonalizaba en QQ y sí en QQbar.

::::{div}
:class: afondo
### 5 · Por qué se parte módulo cualquier primo

Lo raro no es que *x*⁴ + 1 se parta módulo 17. Lo raro es que se parte módulo **todos** los primos, sin excepción, y en QQ no. Hay tres maneras de partirlo:

- (*x*² + 1)² − 2*x*² = (*x*² + √2·*x* + 1)(*x*² − √2·*x* + 1), si 2 tiene raíz cuadrada;
- *x*⁴ − (−1) = (*x*² + √−1)(*x*² − √−1), si −1 tiene raíz cuadrada;
- (*x*² − 1)² + 2*x*² = (*x*² + √−2·*x* − 1)(*x*² − √−2·*x* − 1), si −2 tiene raíz cuadrada.

```{code-cell} sage
for p in primes(3, 30):
    F = GF(p)
    print(p, F(-1).is_square(), F(2).is_square(), F(-2).is_square())
F = GF(7)
s = F(2).sqrt()
S.<y> = F[]
(y^2 + s*y + 1)*(y^2 - s*y + 1)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/18-polinomios-5.json","config":{"titulo":"Siempre hay un cuadrado","etiqueta":"is_square · sqrt en GF(p)","idea":"Para cada primo impar, al menos uno de −1, 2 y −2 es un cuadrado en GF(p). En GF(7), 2 = 3²: con s = 3, (y² + 3y + 1)(y² − 3y + 1) = y⁴ + 1. En QQ ninguno de los tres es un cuadrado, y x⁴ + 1 no se parte.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- Cada línea dice si −1, 2 y −2 son cuadrados módulo *p*: `3 False False True`, `5 True False False`, `7 False True False`… Ninguna fila es `False False False`.
- `s` vale `3`: en GF(7), 3² = 9 ≡ 2.
- El producto escribe `y^4 + 1`. Es la factorización de GF(7) del apartado 4: −3 ≡ 4, así que *y*² − 3*y* + 1 es *y*² + 4*y* + 1.

¿Por qué nunca falla? En GF(*p*), con *p* impar, el producto de dos números que **no** son cuadrados sí es un cuadrado. Si −1 y 2 no lo son, su producto, −2, lo es. Así que siempre funciona una de las tres maneras (y para *p* = 2, *x*⁴ + 1 = (*x* + 1)⁴). En QQ, en cambio, ni −1, ni 2, ni −2 son cuadrados de un racional. Así que ninguna de las tres maneras funciona, y Sage comprueba que no hay otra: `f.is_irreducible()` da `True`.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Polinomios en QQ y en GF(3) (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13 con Nemo 0.57):

| | Sage | Python con SymPy | Julia con Nemo |
|---|---|---|---|
| El anillo | `R.<x> = QQ[]` | no hay anillo: `x = symbols('x')` | `R, x = polynomial_ring(QQ, :x)` |
| División | `p.quo_rem(x - 3)` da `(x^2 + x - 2, 0)` | `div(p, x - 3)` da `(x**2 + x - 2, 0)` | `divrem(p, x - 3)` da `(x^2 + x - 2, 0)` |
| Bézout | `xgcd(p, q)` da `(x - 1, -1/4, 1/4*x - 1/2)` | `gcdex(p, q)` da `(-1/4, x/4 - 1/2, x - 1)` | `gcdx(p, q)` da `(x - 1, -1//4, 1//4*x - 1//2)` |
| En QQ | `factor(x^4 + 1)` no lo parte | `factor(x**4 + 1)` no lo parte | `factor(x^4 + 1)` no lo parte |
| Módulo 3 | `(x^2 + x + 2) * (x^2 + 2*x + 2)` | `factor(x**4 + 1, modulus=3)` da `(x**2 - x - 1)*(x**2 + x - 1)` | `(y^2 + y + 2) * (y^2 + 2*y + 2)` |

SymPy escribe los restos módulo 3 como −1, 0 y 1, y no como 0, 1 y 2: *x*² − *x* − 1 es el mismo polinomio que *x*² + 2*x* + 2. Nemo, igual que Sage, usa FLINT por debajo.
:::

## Conexiones

- Ruffini es Horner: evaluar *p*(3) cuesta tres multiplicaciones y tres sumas.
- El mcd, Bézout y la factorización de polinomios copian los de los enteros del capítulo 17: los dos son **anillos euclídeos**, donde se divide con resto.
- El polinomio característico del capítulo 16 vivía en `QQ[x]`: por eso `p.factor()` daba `(x - 4) * x * (x + 1)`.
- `solve` del capítulo 10 buscaba raíces en SR; `roots()` las busca en el anillo que se le pide, y `(x^2 - 2).roots()` en QQ da `[]` (ejercicio 2).

## La grieta

En el apartado 4, (*x* + 1)⁴ perdía sus coeficientes centrales módulo 2. Con la quinta potencia pasa lo mismo: en QQ[x], (*x* + 1)⁵ es *x*⁵ + 5*x*⁴ + 10*x*³ + 10*x*² + 5*x* + 1, y en GF(5)[x] es solo *x*⁵ + 1. ¿De dónde salen esos números, 1, 5, 10, 10, 5, 1? ¿Por qué todos los del medio son múltiplos de 5? Son **números combinatorios**: cuentan de cuántas maneras se eligen cosas. El capítulo 19, **Combinatoria y probabilidad**.

## Ejercicios

1. **Ruffini en Sage.** Con `R.<x> = QQ[]`, ¿qué da `(x^3 - 7*x + 6).quo_rem(x - 2)`?

2. **Sin raíces racionales.** ¿Qué dan `(x^2 - 2).roots()` y `(x^2 - 2).roots(AA)`?

3. **Dividir de verdad.** En QQ[x], ¿qué dan `(x^2 - 1)/(x - 1)` y `(x^2 - 1)//(x - 1)`? ¿En qué se diferencian?

4. **Un mcd.** ¿Qué da `gcd(x^4 - 1, x^6 - 1)`?

5. **Irreducibles de grado 2.** ¿Qué da `[f for f in GF(2)['x'].polynomials(of_degree=2) if f.is_irreducible()]`?

6. **Traza a mano.** En el programa del apartado 1, cambia `r = 3` por `r = 2`. ¿Qué vale `b` al final? ¿Qué significa su último número?

::::{div}
:class: afondo
7. **Con √2.** ¿Qué da `K.<a> = QuadraticField(2)` seguido de `(x^4 + 1).change_ring(K).factor()`?

8. **Contar irreducibles.** ¿Qué da `len([f for f in GF(3)['x'].polynomials(of_degree=2) if f.is_irreducible() and f.is_monic()])`?
::::

## Solucionario

1. `(x^2 + 2*x - 3, 0)`: *x* = 2 es raíz, y *x*³ − 7*x* + 6 = (*x* − 2)(*x*² + 2*x* − 3) = (*x* − 2)(*x* − 1)(*x* + 3).
2. `[]` y `[(-1.414213562373095?, 1), (1.414213562373095?, 1)]`. √2 no es racional, así que en QQ no hay raíces; en AA, los algebraicos reales del capítulo 16, sí.
3. Los dos escriben `x + 1`, pero el primero vive en *Fraction Field of Univariate Polynomial Ring in x over Rational Field*, el cuerpo de las fracciones de polinomios. `//` es la división entera, como en los números, y se queda en QQ[x].
4. `x^2 - 1`. *x*⁴ − 1 = (*x*² − 1)(*x*² + 1) y *x*⁶ − 1 = (*x*² − 1)(*x*⁴ + *x*² + 1), y los segundos factores no tienen nada en común.
5. `[x^2 + x + 1]`: es el único polinomio de grado 2 sin raíces en GF(2), porque vale 1 en *x* = 0 y en *x* = 1.
6. `[1, 0, -5, -4]`. El cociente es *x*² − 5 y el resto, −4, es *p*(2) = 8 − 8 − 10 + 6. Como no es 0, 2 no es raíz.

::::{div}
:class: afondo
7. `(x^2 - a*x + 1) * (x^2 + a*x + 1)`, con *a* = √2: la primera de las tres maneras del apartado 5, ahora en un anillo que contiene √2.
8. `3`. Hay 9 polinomios mónicos de grado 2 en GF(3), y 6 se parten (los que tienen raíces, (*x* − *a*)(*x* − *b*)): quedan 9 − 6 = 3 irreducibles. En general son (*p*² − *p*)/2.
::::
