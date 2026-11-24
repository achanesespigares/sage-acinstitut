---
title: Integrales exactas y numéricas
subtitle: Áreas, primitivas y lo que pasa cuando no hay fórmula
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

¿Cuánto mide el área bajo la parábola *y* = *x*² entre *x* = 0 y *x* = 1? No es un triángulo ni un rectángulo, y no hay fórmula de geometría que valga. Arquímedes la encontró hace más de dos mil años llenándola de figuras cada vez más pequeñas: es 1/3.

Hoy la respuesta está en una línea de Sage: `integrate(x^2, x, 0, 1)`. Pero detrás de esa línea hay dos ideas muy distintas, y Sage las usa las dos.

## La pregunta

¿Cómo calcula Sage una integral? ¿Qué hace cuando la función no tiene una primitiva que se pueda escribir? ¿Y podemos fiarnos siempre del resultado exacto?

## La idea

Una integral se puede calcular de dos maneras:

- **Exacta.** Se busca una **primitiva** *F*, una función cuya derivada sea *f*, y se aplica la regla de Barrow: el área entre *a* y *b* es *F*(*b*) − *F*(*a*). Es lo que hace `integrate`. Sage se lo pregunta a **Maxima**; si Maxima no sabe, prueba con Giac (si está instalado) y con **SymPy**.
- **Numérica.** Se suman áreas de trozos pequeños en puntos bien elegidos, sin buscar ninguna primitiva. Es lo que hace `numerical_integral`, con la **GSL**, la biblioteca científica de GNU. Siempre da un número, junto con una estimación de su error.

La primera da una fórmula exacta cuando la hay. La segunda funciona siempre, pero aproxima.

## Construcción

### 1 · El área a base de rectángulos

Partimos el intervalo [0, 1] en *n* trozos iguales y ponemos sobre cada uno un rectángulo con la altura de la parábola en su extremo derecho. La suma de sus áreas es una **suma de Riemann**.

```{code-cell} sage
def suma(n):
    return sum([(k/n)^2 * (1/n) for k in [1..n]])

for n in [2, 4, 8, 16]:
    print(n, suma(n))
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/08-integrales-1.json","config":{"titulo":"Rectángulos cada vez más finos","etiqueta":"suma de Riemann · fracciones","idea":"Cada rectángulo mide 1/n de ancho y (k/n)^2 de alto. Con fracciones exactas, las sumas son 5/8, 15/32, 51/128, 187/512: bajan hacia 1/3 sin llegar nunca, porque los rectángulos se pasan un poco de la curva.","columnas":["n"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- Con 2 rectángulos, el área es `5/8` = 0,625. Con 16, `187/512` ≈ 0,365.
- Las sumas bajan hacia 1/3 ≈ 0,333, pero siempre por encima: cada rectángulo toma la altura de su extremo derecho, el más alto del trozo, y se sale un poco de la curva.
- Con *n* rectángulos, la suma vale exactamente 1/3 + 1/(2*n*) + 1/(6*n*²). Cuando *n* crece, los dos últimos términos se van a 0.

Dentro de `suma`, la lista se construye con `[… for k in [1..n]]`: un rectángulo por cada `k`. El programa solo usa fracciones, así que el laboratorio lo ejecuta entero.

### 2 · La suma con *n* rectángulos, en general

Sage también sabe sumar con una letra como número de términos. `sum(expresión, k, 1, m)` suma desde *k* = 1 hasta *k* = *m*, con *m* simbólica, y da una fórmula. Después, `limit` manda *m* al infinito.

```{code-cell} sage
var('k m')
S = sum((k/m)^2 * (1/m), k, 1, m)
T = S.expand()
a = limit(S, m=oo)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/08-integrales-2.json","config":{"titulo":"Infinitos rectángulos","etiqueta":"sum simbólica · limit","idea":"La suma de los m rectángulos, con m como letra, es una fórmula: 1/6·(2m^2 + 3m + 1)/m^2. Desarrollada, 1/3 + 1/(2m) + 1/(6m^2). Su límite cuando m tiende a infinito es el área exacta: 1/3.","columnas":["S","T","a"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `S` vale `1/6*(2*m^2 + 3*m + 1)/m^2`. Maxima ha sumado los cuadrados de 1 a *m* con la fórmula 1² + 2² + … + *m*² = *m*(*m* + 1)(2*m* + 1)/6.
- `T`, la misma fórmula desarrollada, es `1/2/m + 1/6/m^2 + 1/3`. Sage escribe `1/2/m` para 1/(2*m*).
- `a` vale `1/3`. El límite de las sumas de Riemann es la **integral**, y es exacto.

Usamos `m` y no `n` a propósito: `var('n')` crearía una variable simbólica llamada `n` y taparía la función `n()` de Sage, la que pasa a decimales. Después, `n(a)` ya no funcionaría.

### 3 · integrate: primitivas y áreas

`integrate(f, x)` busca una primitiva. Con dos números más, `integrate(f, x, a, b)` calcula la integral definida entre *a* y *b*. También se puede escribir `integral`.

:::{tip} Predice
La derivada de `x^3/3` es `x^2`. ¿Qué escribirá Sage como primitiva de `x^2`: `1/3*x^3`, o `1/3*x^3 + C`?
:::

```{code-cell} sage
f(x) = x^2
F = integrate(f(x), x)
a = integrate(f(x), x, 0, 1)
b = integrate(sin(x), x, 0, pi)
plot(f, (x, 0, 1), fill=True)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/08-integrales-3.json","config":{"titulo":"La primitiva y el área","etiqueta":"integrate · Barrow","idea":"integrate se lo pide a Maxima. La primitiva sale sin la constante + C. Con los límites 0 y 1 sale el área exacta, 1/3; y bajo un arco de seno, exactamente 2. El dibujo sombrea el área de la parábola.","columnas":["F","a","b"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `F` vale `1/3*x^3`, **sin** el «+ C». Sage da una primitiva, no todas: la constante la pones tú.
- `a` vale `1/3`, el área de Arquímedes: *F*(1) − *F*(0) = 1/3 − 0.
- `b` vale `2`: el área bajo un arco de seno, de 0 a π. Un número entero que sale de una curva.
- La última línea dibuja la parábola con `fill=True`, que sombrea el área entre la curva y el eje *x*.

En las tres líneas con `integrate`, el recuadro **Quién hace el cálculo** dice Maxima.

### 4 · Exacto y numérico

`exp(-x^2)` es la campana de Gauss, y su primitiva no se puede escribir con funciones elementales: ni polinomios, ni senos, ni logaritmos. Sage la escribe con una función especial, `erf`, la **función error**. Y `x^x` no tiene primitiva conocida de ninguna clase.

```{code-cell} sage
a = integrate(exp(-x^2), x, 0, 1)
b = n(a)
c = numerical_integral(exp(-x^2), 0, 1)
d = integrate(x^x, x, 0, 1)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/08-integrales-4.json","config":{"titulo":"Con fórmula y sin ella","etiqueta":"integrate · numerical_integral","idea":"La campana tiene una integral exacta con erf. x^x no: Maxima no sabe, Sage prueba con SymPy, y tampoco; la integral vuelve sin hacer. numerical_integral no busca primitivas: la GSL suma trozos y da el número con su error estimado.","columnas":["a","b","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `a` vale `1/2*sqrt(pi)*erf(1)`: exacto, con la función error.
- `b` vale `0.746824132812427`: el mismo número, pasado a decimales con `n()`.
- `c` vale `(0.746824132812427, 8.291413475940723e-15)`. `numerical_integral` devuelve una **pareja**: el valor y una estimación de su error, unas 10⁻¹⁴. Los dos son `float` de Python. En el recuadro **Quién hace el cálculo** sale la GSL.
- `d` vale `integrate(x^x, x, 0, 1)`: la integral, **sin hacer**. Fíjate en el recuadro **Quién hace el cálculo**: Maxima no ha podido, Sage se lo ha preguntado a SymPy, y SymPy tampoco. Sage la devuelve tal cual, en vez de un error.

Sin primitiva, la integral numérica sigue funcionando: `numerical_integral(x^x, 0, 1)` da `(0.783430509431797, 3.2535723438599945e-07)`. Lo verás en el ejercicio 7.

Según la documentación de Sage, `numerical_integral` usa la GSL con una regla de **Gauss-Kronrod**: evalúa la función en unos puntos elegidos de cada trozo y parte los trozos donde el error estimado es grande.

::::{div}
:class: afondo
### 5 · Cuando lo exacto se equivoca

Un resultado exacto parece más fiable que uno numérico. Casi siempre lo es, pero no siempre. Comparemos las dos vías con `sin(x)/x` entre 0 y 1.

```{code-cell} sage
a = integrate(sin(x)/x, x, 0, 1)
b = n(a)
c = numerical_integral(sin(x)/x, 0, 1)
d = n(sin_integral(1))
b - d
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/08-integrales-5.json","config":{"titulo":"Dos respuestas que no coinciden","etiqueta":"integrate frente a numerical_integral","idea":"La fórmula exacta de Maxima, pasada a decimales, da 4.0877; la integral numérica, 0.9461. La buena es la numérica: es el seno integral de 1, Si(1). Y la diferencia es exactamente π: la fórmula de Maxima usa una rama de Ei que no es la que usa Sage al pasar a decimales.","columnas":["b","c","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `a` vale `1/2*pi - 1/2*I*Ei(I) + 1/2*I*Ei(-I)`: una fórmula exacta con la **integral exponencial** `Ei` en números complejos.
- `b`, su valor decimal, es `4.08767572395698`, con la etiqueta `CC`: un número **complejo**, porque la fórmula lleva `I`, aunque su parte imaginaria sea 0. Y no puede ser: `sin(x)/x` vale como mucho 1 en todo el intervalo, que mide 1, así que el área no puede pasar de 1.
- `c`, la integral numérica, da `0.946083070367183`, con un error estimado de 10⁻¹⁴.
- `d` es el **seno integral**, `sin_integral(1)`, la función especial que vale exactamente esta integral: `0.946083070367183`. Coincide con la numérica.
- La última línea da `3.14159265358979`: la fórmula exacta se pasa justo en **π**.

Las funciones como `Ei` en números complejos tienen varias **ramas**, y la fórmula que da Maxima solo vale con una de ellas. Al pasar a decimales, Sage usa otra, y aparece π de más. Pedírsela a SymPy, con `integrate(sin(x)/x, x, 0, 1, algorithm='sympy')`, da la respuesta buena: `sin_integral(1)`.

La lección no es desconfiar de Sage, sino **comprobar**. Una integral exacta se puede contrastar en una línea con `numerical_integral`, y un buen hábito es hacerlo, sobre todo cuando aparecen funciones especiales o números complejos. (Comprobado en Sage 10.8; pulsa «Sage real» para ver qué da la versión de SageMathCell).
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La integral de la campana entre 0 y 1, exacta y numérica (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13 con QuadGK 2.11):

| | Sage | Python con SymPy | Julia con QuadGK |
|---|---|---|---|
| Exacta | `integrate(exp(-x^2), x, 0, 1)` da `1/2*sqrt(pi)*erf(1)` | `integrate(exp(-x**2), (x, 0, 1))` da `sqrt(pi)*erf(1)/2` | — |
| Numérica | `numerical_integral(exp(-x^2), 0, 1)` | `N(Integral(exp(-x**2), (x, 0, 1)))` | `quadgk(x -> exp(-x^2), 0, 1)` |
| Resultado | `(0.746824132812427, 8.3e-15)` | `0.746824132812427` | `(0.746824132812427, 7.9e-13)` |
| `x^x` exacta | sin hacer | `Integral(x**x, (x, 0, 1))`, sin hacer | — |

Sage y Julia devuelven el valor con su error estimado, y los dos usan reglas de Gauss-Kronrod; SymPy devuelve solo el valor, y la cuenta numérica se la pasa a mpmath. Y el valor exacto de ∫₀¹ *x*^*x* d*x* existe como serie: es 1 − 1/2² + 1/3³ − 1/4⁴ + …, el «sueño del estudiante de segundo», 0,7834305107…
:::

## Conexiones

- La suma de Riemann del apartado 1 es una suma finita; la del apartado 2, una suma con *m* términos que tiende a una integral. Las sumas infinitas, las **series**, son el capítulo 9.
- Una primitiva es una función cuya derivada es *f*: `diff(integrate(f(x), x), x)` devuelve *f*. Integrar y derivar son operaciones inversas.
- Las ecuaciones diferenciales del capítulo 11 piden primitivas más difíciles: funciones de las que solo se conoce una relación con su derivada.
- La rama de `Ei` del apartado 5 vuelve en la parte V, en el capítulo **Exacto frente a aproximado**.

## La grieta

La suma de los rectángulos tenía *m* términos. ¿Y si una suma tiene infinitos? 1 + 1/2 + 1/4 + 1/8 + … da 2, pero 1 + 1/2 + 1/3 + 1/4 + … no da ningún número: crece sin fin. ¿Cómo sabe Sage cuál es cuál? ¿Y cómo se escribe sen *x* como un polinomio «infinito»? En el capítulo 9, **Series, Taylor y sumas**.

## Ejercicios

1. **Primitiva y área.** ¿Qué dan `integrate(x^3, x)` e `integrate(x^3, x, 0, 2)`?

2. **El logaritmo.** ¿Qué dan `integrate(1/x, x)` e `integrate(1/x, x, 1, e)`?

3. **Medio arco.** ¿Cuánto vale `integrate(cos(x), x, 0, pi/2)`?

4. **Área entre dos curvas.** La recta *y* = *x* y la parábola *y* = *x*² se cortan en 0 y en 1. ¿Cuánto mide el área entre ellas? (Integra la de arriba menos la de abajo).

5. **Hasta el infinito.** ¿Qué dan `integrate(1/x^2, x, 1, oo)` e `integrate(1/x, x, 1, oo)`?

6. **Traza a mano.** Con la función `suma` del apartado 1, ¿cuánto vale `suma(3)`?

::::{div}
:class: afondo
7. **El sueño del estudiante.** Calcula `n(sum([(-1)^(k+1)/k^k for k in [1..20]]))` y compáralo con `numerical_integral(x^x, 0, 1)`. ¿En qué cifra se separan? ¿Cuál está más cerca del valor verdadero?

8. **Otra comprobación.** ¿Qué da `n(integrate(sin(x)/x, x, 0, 2))`? ¿Y `numerical_integral(sin(x)/x, 0, 2)`? ¿Cuánto se separan?
::::

## Solucionario

1. `1/4*x^4` y `4`.
2. `log(x)` y `1`. En Sage, `log` es el logaritmo neperiano, y log *e* − log 1 = 1.
3. `1`.
4. `integrate(x - x^2, x, 0, 1)` da `1/6`.
5. `1`, y un error: `ValueError: Integral is divergent`. El área bajo 1/*x*² hasta el infinito es finita; la de 1/*x*, no.
6. `14/27`: (1 + 4 + 9)/27. Con la fórmula, 1/3 + 1/6 + 1/54 = 14/27.

::::{div}
:class: afondo
7. La serie da `0.783430510712134` y la integral numérica, `0.783430509431797`: se separan en la octava cifra decimal. La serie, con 20 términos, ya acierta todas las cifras que muestra; la integral numérica se equivoca en algo más de 10⁻⁹, dentro del error que ella misma estima (3·10⁻⁷).
8. `4.74700563039249` y `1.6054129768026952`. Se separan en π otra vez: 4,747 − 1,605 = 3,1416. La buena es la numérica.
::::
