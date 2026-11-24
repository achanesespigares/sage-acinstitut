---
title: Sistemas, rango y Gauss paso a paso
subtitle: Hacer ceros, contar escalones y saber si hay solución
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En el capítulo 10, `solve` resolvía sistemas sin decir cómo. Por dentro hay una idea de hace siglos, que hoy lleva el nombre de Gauss: **hacer ceros**. Si a una ecuación se le resta otra multiplicada por un número, las soluciones no cambian. Eligiendo bien el número, desaparece una incógnita. Repitiendo, el sistema queda **en escalera**, y se resuelve de abajo arriba.

El sistema de este capítulo es

*x* + *y* + *z* = 6, 2*x* − *y* + *z* = 3, *x* + 2*y* − *z* = 2,

y su solución es (1, 2, 3).

## La pregunta

¿Cómo resuelve Sage un sistema escrito con matrices, y qué pasos da? ¿Cómo se sabe, antes de resolver, si un sistema tiene una solución, infinitas o ninguna?

## La idea

Un sistema lineal es *A*·*x* = *b*: la matriz *A* de coeficientes, el vector *x* de incógnitas y el vector *b* de términos independientes.

- **`A.solve_right(b)`** resuelve *A*·*x* = *b*. Se llama «right» porque la incógnita está a la derecha de *A*.
- **Las operaciones de fila** (`add_multiple_of_row`, `swap_rows`, `rescale_row`) hacen el método de Gauss a mano, una a una, sobre la **matriz ampliada** [*A* | *b*].
- **El rango** cuenta los escalones que quedan al final. Comparar el rango de *A* con el de [*A* | *b*] dice cuántas soluciones hay: es el teorema de **Rouché-Frobenius**.

## Construcción

### 1 · Hacer ceros con listas

La matriz ampliada como una lista de tres filas. Para hacer cero el primer número de la fila *i*, se le resta la fila 0 multiplicada por *m* = `F[i][0]/F[0][0]`.

:::{tip} Predice
La fila 1 es [2, −1, 1, 3]. ¿Por qué número hay que multiplicar la fila 0, [1, 1, 1, 6], antes de restarla?
:::

```{code-cell} sage
F = [[1, 1, 1, 6], [2, -1, 1, 3], [1, 2, -1, 2]]
for i in [1, 2]:
    m = F[i][0]/F[0][0]
    for j in [0..3]:
        F[i][j] = F[i][j] - m*F[0][j]
    print(i, m, F[i])
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/13-gauss-1.json","config":{"titulo":"Ceros en la primera columna","etiqueta":"Gauss · listas de listas","idea":"Para la fila 1, m = 2: se le resta el doble de la fila 0, casilla a casilla, y queda [0, −3, −1, −9]. Para la fila 2, m = 1, y queda [0, 1, −2, −4]. La x ha desaparecido de las dos ecuaciones de abajo.","columnas":["i","m","j"],"fila_en":"cada_linea","mostrar_tipos":true,"matriz":"F","fila":"i","col":"j"}}
```

- `F[i][j]` es la casilla de la fila *i* y la columna *j*. La rejilla del visualizador marca la casilla que se está cambiando.
- Para la fila 1, `m` vale `2`: 2 − 2·1 = 0. Casilla a casilla, [2, −1, 1, 3] − 2·[1, 1, 1, 6] = `[0, -3, -1, -9]`.
- Para la fila 2, `m` vale `1`, y [1, 2, −1, 2] − [1, 1, 1, 6] = `[0, 1, -2, -4]`.
- Las dos ecuaciones de abajo ya no tienen *x*: −3*y* − *z* = −9 y *y* − 2*z* = −4.

`m` es una fracción de Sage (`QQ`): si el primer número de una fila no divide a los de las otras, salen fracciones exactas, sin decimales. Este programa usa solo listas y fracciones, y el laboratorio lo ejecuta entero en el navegador.

### 2 · `solve_right`: el sistema de una vez

```{code-cell} sage
A = matrix(QQ, [[1, 1, 1], [2, -1, 1], [1, 2, -1]])
b = vector(QQ, [6, 3, 2])
s = A.solve_right(b)
A*s == b
r = A.rank()
d = A.det()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/13-gauss-2.json","config":{"titulo":"A·x = b","etiqueta":"solve_right · rango","idea":"solve_right devuelve el vector solución, (1, 2, 3). Multiplicarlo por A devuelve b: la comprobación da True. El rango es 3, tantos escalones como incógnitas: solución única.","columnas":["s","r","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `s` vale `(1, 2, 3)`, un vector de `QQ^3`.
- `A*s == b` escribe `True` en la consola: comprobar una solución es multiplicar.
- `r` vale `3`: la matriz tiene rango 3, el máximo para 3 filas.
- `d` vale `7`. Un determinante distinto de 0 es otra forma de decir que hay solución única; el capítulo 14 lo explica.

En Julia y en MATLAB, el sistema se resuelve con una barra invertida, `A \ b`. En Sage 10.8 esa barra da `SyntaxError`: el preparador ya no la traduce, y hay que escribir `A.solve_right(b)`.

### 3 · Gauss con operaciones de fila

Ahora el método entero, sobre la matriz ampliada [*A* | *b*] de Sage. Cada operación **cambia la matriz** y no devuelve nada.

:::{tip} Predice
Después de los dos primeros pasos, la fila 2 tiene un 1 en la segunda columna y la fila 1 un −3. ¿Para qué servirá intercambiarlas?
:::

```{code-cell} sage
M = matrix(QQ, [[1, 1, 1, 6], [2, -1, 1, 3], [1, 2, -1, 2]])
M.add_multiple_of_row(1, 0, -2)
M.add_multiple_of_row(2, 0, -1)
M.swap_rows(1, 2)
M.add_multiple_of_row(2, 1, 3)
M.rescale_row(2, -1/7)
E = M.echelon_form()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/13-gauss-3.json","config":{"titulo":"La escalera","etiqueta":"operaciones de fila · echelon_form","idea":"Cada línea cambia M. Tras el intercambio, el 1 de la segunda columna hace de pivote, y la fila 2 queda 0 0 −7 −21. Dividiendo entre −7, z = 3. echelon_form termina el trabajo: la última columna es la solución.","columnas":["M","E"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `M.add_multiple_of_row(1, 0, -2)` suma a la fila 1 la fila 0 multiplicada por −2: es lo que hacía el apartado 1. Las filas se cuentan desde 0.
- Después de las dos primeras líneas, `M` es `[1 1 1 6]` / `[0 -3 -1 -9]` / `[0 1 -2 -4]`, como en el apartado 1.
- `M.swap_rows(1, 2)` intercambia las filas 1 y 2: así el **pivote** de la segunda columna es un 1, y hacer ceros debajo de él no necesita fracciones.
- `M.add_multiple_of_row(2, 1, 3)` deja la fila 2 en `[0 0 -7 -21]`: −7*z* = −21.
- `M.rescale_row(2, -1/7)` la divide entre −7: `[0 0 1 3]`, es decir, *z* = 3. De abajo arriba: *y* − 2·3 = −4 da *y* = 2, y *x* + 2 + 3 = 6 da *x* = 1.
- `E` vale `[1 0 0 1]` / `[0 1 0 2]` / `[0 0 1 3]`: la **forma escalonada reducida**, con unos en la diagonal y ceros encima y debajo. La última columna es la solución.

Las líneas que cambian `M` no escriben nada en la consola: estos métodos modifican la matriz y devuelven `None`, que la consola de Sage no muestra.

### 4 · Una, infinitas o ninguna

Otro sistema, *B*·*x* = *c*: su tercera ecuación es la suma de las otras dos.

```{code-cell} sage
B = matrix(QQ, [[1, 1, 1], [1, -1, 2], [2, 0, 3]])
c = vector(QQ, [3, 2, 5])
r = B.rank()
ra = B.augment(c).rank()
p = B.solve_right(c)
k = B.right_kernel().basis()[0]
B*(p + 3*k) == c
d = vector(QQ, [3, 2, 6])
rd = B.augment(d).rank()
B.solve_right(d)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/13-gauss-4.json","config":{"titulo":"Rouché-Frobenius","etiqueta":"rank · augment · right_kernel","idea":"rango de B = rango de [B | c] = 2, menos que 3 incógnitas: infinitas soluciones. solve_right da una, p; sumándole múltiplos de k salen todas. Con d, el rango de la ampliada sube a 3: no hay solución, y Sage da un error.","columnas":["r","ra","p","k","rd"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `r` vale `2`: *B* solo tiene dos escalones, porque la fila 2 es la suma de las filas 0 y 1.
- `ra` vale `2`: añadir la columna *c* no crea un escalón nuevo (5 = 3 + 2). Rango igual al de *B*, pero menor que 3 incógnitas: **infinitas soluciones**.
- `p` vale `(5/2, 1/2, 0)`: `solve_right` devuelve **una** de ellas, sin avisar de que hay más.
- `k` vale `(1, -1/3, -2/3)`: la base del **núcleo**, las direcciones en las que *B* da 0. Todas las soluciones son *p* + *t*·*k*, con *t* cualquier número. `B*(p + 3*k) == c` escribe `True`.
- Con *d* = (3, 2, 6), `rd` vale `3`: la ampliada tiene un escalón más que *B*. Las dos primeras ecuaciones suman 5, y la tercera pide 6: **no hay solución**.
- La última línea da `ValueError: matrix equation has no solutions`.

El teorema de Rouché-Frobenius lo resume: si rango(*A*) ≠ rango([*A* | *b*]), no hay solución; si son iguales y valen el número de incógnitas, hay una; si son iguales y menores, hay infinitas.

::::{div}
:class: afondo
### 5 · Con decimales, el rango puede mentir

La matriz `[1 2]` / `[3/10 6/10]` tiene la segunda fila igual a la primera por 3/10: rango 1. ¿Y si la segunda fila se calcula con decimales?

```{code-cell} sage
P = matrix(QQ, [[1, 2], [3/10, 6/10]])
r = P.rank()
Q = matrix(RR, [[1, 2], [0.1*3, 0.6]])
s = Q.rank()
d = Q.det()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/13-gauss-5.json","config":{"titulo":"Rango 1 o rango 2","etiqueta":"QQ frente a RR","idea":"En QQ, el rango es 1. En RR, 0.1*3 no es exactamente 0.3, sino 0.30000000000000004: la segunda fila ya no es proporcional a la primera, y el rango sale 2. El determinante, que debería ser 0, vale −1,1·10⁻¹⁶.","columnas":["r","s","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `r` vale `1`, exacto.
- `Q` **se escribe** igual que la matriz exacta, `0.300000000000000` y `0.600000000000000`. Pero 0.1·3 es 0.30000000000000004 por dentro (capítulo 1), y 0.6 no es exactamente su doble.
- `s` vale `2`: para Sage, la segunda fila no es proporcional a la primera.
- `d` vale `-1.11022302462516e-16`: casi 0, pero no 0.

Con `RR`, Sage cuenta los pivotes de la forma escalonada (en su código, `len(self.pivots())`), y un resto de 10⁻¹⁷ es un número distinto de 0: un escalón más. Julia, en cambio, calcula el rango de una matriz de decimales con otro método (la descomposición en valores singulares) y un **margen de tolerancia**: para la misma matriz, da 1. Ninguno de los dos está mal; son decisiones distintas. Con números exactos, en `QQ`, la pregunta tiene una única respuesta.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Resolver el sistema del capítulo, su rango y la matriz del A fondo (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| Resolver | `A.solve_right(b)` da `(1, 2, 3)` | `A.solve(b)` da `Matrix([[1], [2], [3]])` | `A \ b` da `[1.0, 2.0, 3.0]`; con `Rational{Int}.(A) \ b`, `[1, 2, 3]` |
| Escalonar | `A.augment(b).rref()` | `A.row_join(b).rref()` | no viene de serie |
| Sin solución | `ValueError: matrix equation has no solutions` | `NonInvertibleMatrixError` | `SingularException` |
| Rango de `[1 2]` / `[0.1*3 0.6]` | `2` | `2` | `1` (con tolerancia) |

Julia trabaja por defecto con decimales: `A \ b` da `1.0`, no `1`. Para cuentas exactas hay que convertir la matriz a fracciones (`Rational`). SymPy y Julia se niegan a resolver un sistema cuadrado con determinante 0, aunque tenga infinitas soluciones; Sage, con `solve_right`, devuelve una.
:::

## Conexiones

- `solve` del capítulo 10 y `solve_right` resuelven los mismos sistemas: `solve` da ecuaciones con parámetros `r1`, `solve_right` un vector y el núcleo aparte.
- Las listas de listas son las del capítulo 2; `F[i][j]` es fila *i*, columna *j*.
- Las fracciones exactas de `QQ` del capítulo 1 evitan que el rango mienta, como en el A fondo.
- El núcleo `right_kernel` es un espacio vectorial, como las soluciones del muelle del capítulo 11: todas las soluciones de *B*·*x* = 0 son múltiplos de *k*.

## La grieta

El determinante de *A* era 7, y el de *B*, 0. Cuando el determinante es 0, el sistema no tiene solución única; cuando no lo es, la tiene, y existe una matriz *A*⁻¹ que lo resuelve de golpe: *x* = *A*⁻¹·*b*. ¿Qué es el determinante, de dónde sale, y cómo se calcula la inversa? Eso es el capítulo 14, **Determinantes e inversas**.

## Ejercicios

1. **Dos por dos.** Resuelve *x* + 2*y* = 5, 3*x* − *y* = 1 con `solve_right`.

2. **Un rango famoso.** ¿Qué da `matrix(QQ, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]).rank()`? ¿Qué relación hay entre las filas?

3. **Escalonar.** ¿Qué da `matrix(QQ, [[2, 4, 6], [1, 3, 5]]).rref()`?

4. **Filas iguales.** ¿Qué rango tiene `matrix(QQ, [[1, 1], [1, 1]])`?

5. **En GF(2).** ¿Qué da `matrix(GF(2), [[1, 1], [0, 1]]).solve_right(vector(GF(2), [1, 1]))`? Compruébalo a mano, sabiendo que en GF(2) es 1 + 1 = 0.

6. **Traza a mano.** En el programa del apartado 1, cambia la fila 1 por `[3, 1, 2, 11]`. ¿Qué escribe la primera vuelta?

::::{div}
:class: afondo
7. **Decimales con suerte.** ¿Qué da `matrix(RR, [[1, 2], [3/10, 6/10]]).rank()`? ¿Por qué no sale 2, como en el apartado 5?

8. **Las infinitas soluciones con `solve`.** Con `var('y z')`, ¿qué da `solve([x + y + z == 3, x - y + 2*z == 2, 2*x + 3*z == 5], x, y, z)`? ¿Qué valor de `r1` da la solución `p` del apartado 4?
::::

## Solucionario

1. `matrix(QQ, [[1, 2], [3, -1]]).solve_right(vector(QQ, [5, 1]))` da `(1, 2)`: *x* = 1, *y* = 2.
2. `2`. La fila del medio es la media de las otras dos: (1, 2, 3) + (7, 8, 9) = 2·(4, 5, 6). Solo dos filas aportan escalones.
3. `[ 1  0 -1]` / `[ 0  1  2]`.
4. `1`: la segunda fila es igual a la primera, y al restarlas queda una fila de ceros.
5. `(0, 1)`. Con *x* = 0 e *y* = 1: la primera ecuación, *x* + *y* = 1, se cumple, y la segunda, *y* = 1, también.
6. `1 3 [0, -2, -1, -7]`: `m` = 3/1 = 3, y [3, 1, 2, 11] − 3·[1, 1, 1, 6] = [0, −2, −1, −7].

::::{div}
:class: afondo
7. `1`. Al pasar 3/10 a `RR` sale el decimal binario más cercano, y al pasar 6/10 sale **exactamente** su doble (multiplicar por 2 en binario es correr la coma, sin redondeo). La fila sigue siendo proporcional. En el apartado 5, 0.1·3 se redondea **dos** veces (al escribir 0.1 y al multiplicar), y el resultado ya no es la mitad de 0.6. `RR(3/10)*2 == RR(6/10)` da `True`.
8. `[[x == -3/2*r1 + 5/2, y == 1/2*r1 + 1/2, z == r1]]`. Con `r1` = 0 sale (5/2, 1/2, 0), que es `p`. `solve` escribe las infinitas soluciones con un parámetro; `solve_right` da una y el núcleo aparte.
::::
