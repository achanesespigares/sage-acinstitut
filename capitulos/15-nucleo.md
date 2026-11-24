---
title: Núcleo, imagen y bases
subtitle: Lo que una matriz aplasta, lo que alcanza y cómo se describe
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

La matriz *B* de los capítulos 13 y 14 tiene determinante 0: **aplasta** el espacio. Cada vector (*x*, *y*, *z*) entra y sale *B*·(*x*, *y*, *z*), pero las salidas no llenan todo el espacio, solo un plano. Y hay vectores que entran y salen convertidos en 0: se pierden por el camino.

Esas dos colecciones tienen nombre:

- el **núcleo**: los vectores que *B* manda a 0;
- la **imagen**: los vectores a los que *B* llega.

Las dos son **espacios vectoriales**: rectas, planos o el espacio entero, que pasan por el origen. Y un espacio vectorial se describe con una **base**: unos pocos vectores de los que salen todos los demás sumando y multiplicando por números.

## La pregunta

¿Cómo calcula Sage el núcleo y la imagen de una matriz? ¿Qué es una base, y cómo se escribe un vector en ella?

## La idea

- **`B.right_kernel()`** es el núcleo: los *x* con *B*·*x* = 0.
- **`B.column_space()`** es la imagen: todos los *B*·*x*, es decir, las combinaciones de las columnas de *B*.
- **`dimension()`** y **`basis()`** dan su dimensión y una base. Y `v in K` pregunta si un vector está en un subespacio *K*.

Lo que une todo es el **teorema del rango**: el rango (la dimensión de la imagen) más la dimensión del núcleo es el número de columnas. Lo que no llega a la imagen se ha perdido en el núcleo.

## Construcción

### 1 · ¿Va a parar a 0?

Comprobar que un vector está en el núcleo es multiplicar: cada fila de *B* por *v*, sumando.

:::{tip} Predice
*v* = (3, −1, −2). ¿Qué sale al multiplicarlo por la primera fila de *B*, (1, 1, 1)?
:::

```{code-cell} sage
B = [[1, 1, 1], [1, -1, 2], [2, 0, 3]]
v = [3, -1, -2]
for i in [0..2]:
    s = 0
    for j in [0..2]:
        s = s + B[i][j]*v[j]
    print(i, s)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/15-nucleo-1.json","config":{"titulo":"Tres ceros","etiqueta":"producto fila a fila · listas","idea":"Cada fila de B por v da 0: 3 − 1 − 2 = 0, 3 + 1 − 4 = 0 y 6 + 0 − 6 = 0. B manda v a 0: v está en el núcleo.","columnas":["i","j","s"],"fila_en":"cada_linea","mostrar_tipos":true,"matriz":"B","fila":"i","col":"j"}}
```

- La rejilla marca la casilla `B[i][j]` que se está multiplicando por `v[j]`.
- Fila 0: 1·3 + 1·(−1) + 1·(−2) = 0. Fila 1: 1·3 + (−1)·(−1) + 2·(−2) = 0. Fila 2: 2·3 + 0·(−1) + 3·(−2) = 0.
- La consola escribe `0 0`, `1 0` y `2 0`: *B*·*v* = (0, 0, 0).

Y no solo *v*: también 2*v*, −*v* o *v*/3 van a 0, porque *B*·(*t*·*v*) = *t*·(*B*·*v*) = 0. El núcleo es toda la **recta** de *v*. Este programa usa solo listas y enteros, y el laboratorio lo ejecuta entero en el navegador.

### 2 · `right_kernel`: el núcleo

```{code-cell} sage
B = matrix(QQ, [[1, 1, 1], [1, -1, 2], [2, 0, 3]])
K = B.right_kernel()
n = K.dimension()
k = K.basis()[0]
B*k
vector(QQ, [3, -1, -2]) in K
B.rank() + n == B.ncols()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/15-nucleo-2.json","config":{"titulo":"Una recta que se pierde","etiqueta":"right_kernel · dimensión · base","idea":"El núcleo de B es una recta: dimensión 1, con base (1, −1/3, −2/3). El v del apartado 1 es 3 veces ese vector, así que está en K. Rango 2 más núcleo 1 dan las 3 columnas.","columnas":["n","k"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `K` es un **subespacio**: Sage lo escribe como *Vector space of degree 3 and dimension 1 over Rational Field*, con su matriz de base debajo. *Degree* 3 es que sus vectores tienen 3 componentes; *dimension* 1, que es una recta.
- `n` vale `1`.
- `k` vale `(1, -1/3, -2/3)`, con la etiqueta `⊂ QQ^3`: un vector de un subespacio de `QQ^3`. Sage escoge la base con un 1 en la primera posición, como en la forma escalonada.
- `B*k` escribe `(0, 0, 0)`.
- `vector(QQ, [3, -1, -2]) in K` escribe `True`: el *v* del apartado 1 es 3·*k*.
- `B.rank() + n == B.ncols()` escribe `True`: 2 + 1 = 3, el teorema del rango.

### 3 · `column_space`: la imagen

La imagen de *B* son todos los vectores *B*·*x*. Como *B*·*x* es *x*·(columna 1) + *y*·(columna 2) + *z*·(columna 3), la imagen es el espacio generado por las **columnas**.

```{code-cell} sage
B = matrix(QQ, [[1, 1, 1], [1, -1, 2], [2, 0, 3]])
I = B.column_space()
m = I.dimension()
b = I.basis()
vector(QQ, [3, 2, 5]) in I
vector(QQ, [3, 2, 6]) in I
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/15-nucleo-3.json","config":{"titulo":"Hasta dónde llega B","etiqueta":"column_space · pertenencia","idea":"La imagen es un plano (dimensión 2). (3, 2, 5) está en él: B·x = (3, 2, 5) tiene solución. (3, 2, 6) no: el sistema no tiene solución. Es Rouché-Frobenius, preguntado de otra forma.","columnas":["m","b"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `m` vale `2`: la imagen es un **plano**, del mismo tamaño que el rango.
- `b` vale `[(1, 0, 1), (0, 1, 1)]`: una base del plano. No son columnas de *B*, sino una base **escalonada** que Sage calcula; las tres columnas de *B* son combinaciones de estos dos vectores.
- `vector(QQ, [3, 2, 5]) in I` escribe `True`, y con (3, 2, 6) escribe `False`.

Son los dos sistemas del capítulo 13: *B*·*x* = (3, 2, 5) tenía solución y *B*·*x* = (3, 2, 6) no. Preguntar si un sistema tiene solución es preguntar si *b* está en la imagen. Y como el núcleo no es solo el 0, las soluciones que hay son infinitas: *p* + *t*·*k*.

### 4 · Bases y coordenadas

Dos vectores generan un plano. ¿Está *w* = (2, 5, 3) en él? ¿Con qué números se escribe?

```{code-cell} sage
V = QQ^3
u = vector(QQ, [1, 1, 0])
v = vector(QQ, [0, 1, 1])
W = V.span([u, v])
w = vector(QQ, [2, 5, 3])
w in W
W2 = V.subspace_with_basis([u, v])
c = W2.coordinate_vector(w)
r = V.linear_dependence([u, v, u + v])
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/15-nucleo-4.json","config":{"titulo":"Escribir un vector en una base","etiqueta":"span · coordenadas · dependencia","idea":"w está en el plano de u y v, y sus coordenadas en esa base son (2, 3): w = 2u + 3v. Tres vectores donde el tercero es u + v son dependientes: 1·u + 1·v − 1·(u + v) = 0.","columnas":["c","r"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `V` es `QQ^3`, el espacio entero, escrito como en el libro.
- `W` es el plano generado por *u* y *v*. Sage lo guarda con una base escalonada, (1, 0, −1) y (0, 1, 1), no con *u* y *v*.
- `w in W` escribe `True`.
- `W2` es el mismo plano, pero con **la base que se le da**: *u* y *v*, en ese orden. Por eso existen las dos órdenes, `span` y `subspace_with_basis`.
- `c` vale `(2, 3)`: las **coordenadas** de *w* en la base (*u*, *v*). Comprobación: 2·(1, 1, 0) + 3·(0, 1, 1) = (2, 5, 3).
- `r` vale `[(1, 1, -1)]`: los vectores *u*, *v* y *u* + *v* son **linealmente dependientes**, y la relación es 1·*u* + 1·*v* − 1·(*u* + *v*) = 0.

Una base es justo eso: vectores que generan el espacio y que son **independientes** (ninguno sobra). Con *u*, *v* y *u* + *v*, el tercero sobra.

::::{div}
:class: afondo
### 5 · La trampa: Sage multiplica por la izquierda

Los libros de álgebra lineal escriben *B*·*x*, con el vector a la derecha y en columna. Sage, por tradición, piensa los vectores como **filas** a la izquierda: *x*·*B*. Por eso sus órdenes «cortas» no dicen lo que esperaría un estudiante.

```{code-cell} sage
B = matrix(QQ, [[1, 1, 1], [1, -1, 2], [2, 0, 3]])
L = B.kernel()
l = L.basis()[0]
l*B
B*l
B.image() == B.row_space()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/15-nucleo-5.json","config":{"titulo":"El núcleo que no era","etiqueta":"kernel = left_kernel","idea":"B.kernel() da (1, 1, −1), no (1, −1/3, −2/3). Es el núcleo por la izquierda: l·B = 0, pero B·l no es 0. Y B.image() es el espacio de las filas, no el de las columnas.","columnas":["l"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `l` vale `(1, 1, -1)`: la base de `B.kernel()`.
- `l*B` escribe `(0, 0, 0)`: fila 0 + fila 1 − fila 2 = 0. Es el núcleo **por la izquierda** (`left_kernel`).
- `B*l` escribe `(1, -2, -1)`: **no** es 0. `l` no está en el núcleo de los libros.
- `B.image() == B.row_space()` escribe `True`: `image()` es el espacio de las **filas**, no la imagen de *B*·*x*.

El código de Sage lo dice con todas las letras: en `matrix2.pyx` hay una línea `kernel = left_kernel`, y la documentación de `image()` explica que es la imagen de multiplicar por la derecha a las filas, «that is, the row-space». Para la convención de los libros (vector a la derecha), hay que pedir `right_kernel()` y `column_space()` de forma explícita, como en este capítulo. Para *B* las dimensiones coinciden (una matriz cuadrada tiene el mismo rango por filas que por columnas), pero las bases no.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Núcleo e imagen de *B* (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| Núcleo | `B.right_kernel().basis()` da `(1, -1/3, -2/3)` | `B.nullspace()` da `(-3/2, 1/2, 1)` | `nullspace(B)` da `[0.8017837257372733, -0.2672612419124241, -0.5345224838248487]` |
| Imagen | `B.column_space().basis()` da `(1, 0, 1)` y `(0, 1, 1)` | `B.columnspace()` da las columnas `(1, 1, 2)` y `(1, -1, 0)` | `rank(B)` da `2`; no hay orden para una base exacta |
| Núcleo por la izquierda | `B.kernel()` da `(1, 1, -1)` | `B.T.nullspace()` da `(-1, -1, 1)` | `nullspace(B')` |

Los tres núcleos son la **misma recta**, con vectores distintos: (1, −1/3, −2/3), (−3/2, 1/2, 1) y el de Julia, que tiene longitud 1 y es (3, −1, −2)/√14. Una base no es única. Julia lo calcula con decimales incluso si la matriz tiene fracciones.
:::

## Conexiones

- El núcleo es la parte *t*·*k* de las infinitas soluciones del capítulo 13: todas son *p* + *t*·*k*.
- La imagen responde a Rouché-Frobenius: *A*·*x* = *b* tiene solución si y solo si *b* está en `column_space()`.
- det(*A*) ≠ 0 (capítulo 14) es lo mismo que núcleo {0}: `A.right_kernel().dimension()` da `0`.
- Las soluciones del muelle del capítulo 11, *K*₁ sen *x* + *K*₂ cos *x*, son un espacio de dimensión 2 con base {sen *x*, cos *x*}, y (*K*₁, *K*₂) son sus coordenadas.

## La grieta

El núcleo son los vectores que *B* manda a 0, es decir, a 0 veces ellos mismos. ¿Hay vectores que *B* mande a 2 veces ellos mismos, o a −1 veces? Una matriz que solo estira ciertas direcciones, sin girarlas, se entiende mucho mejor en una base hecha de esas direcciones. Son los **autovectores** y sus **autovalores**: el capítulo 16, **Autovalores, diagonalización y Jordan**.

## Ejercicios

1. **Una recta.** ¿Qué da `matrix(QQ, [[1, 2], [2, 4]]).right_kernel().basis()`? ¿Por qué el núcleo no es solo el 0?

2. **Núcleo trivial.** Con la matriz *A* de los capítulos 13 y 14, ¿qué da `A.right_kernel().dimension()`?

3. **Teorema del rango.** Para `M = matrix(QQ, [[1, 2, 3], [4, 5, 6]])`, ¿qué dan `M.rank()` y `M.right_kernel().basis()`? ¿Se cumple el teorema?

4. **¿Independientes?** ¿Qué da `(QQ^3).linear_dependence([vector(QQ, [1, 2, 3]), vector(QQ, [4, 5, 6]), vector(QQ, [7, 8, 9])])`?

5. **Coordenadas.** Con `W2` del apartado 4, ¿qué da `W2.coordinate_vector(vector(QQ, [5, 7, 2]))`?

6. **Traza a mano.** En el programa del apartado 1, cambia `v` por `[1, 1, 1]`. ¿Qué escribe? ¿Está en el núcleo? ¿Has visto ese resultado antes?

::::{div}
:class: afondo
7. **Izquierda y derecha.** ¿Qué da `B.right_kernel() == B.transpose().left_kernel()`? ¿Por qué?

8. **Un núcleo con dos vectores.** En GF(2), ¿qué dan `K = matrix(GF(2), [[1, 1, 0], [0, 1, 1]]).right_kernel()`, `K.basis()` y `list(K)`?
::::

## Solucionario

1. `[(1, -1/2)]`. La segunda fila es el doble de la primera, el rango es 1, y en 2 columnas eso deja un núcleo de dimensión 2 − 1 = 1: la recta de (1, −1/2), o de (2, −1).
2. `0`. *A* tiene determinante 7, rango 3 y núcleo {0}: solo el vector 0 va a parar a 0.
3. `2` y `[(1, -2, 1)]`. Rango 2 más núcleo 1 dan las 3 columnas.
4. `[(1, -2, 1)]`: son dependientes, porque 1·(1, 2, 3) − 2·(4, 5, 6) + 1·(7, 8, 9) = (0, 0, 0). La del medio es la media de las otras dos.
5. `(5, 2)`: 5·(1, 1, 0) + 2·(0, 1, 1) = (5, 7, 2).
6. `0 3`, `1 2` y `2 5`. No es 0, así que (1, 1, 1) no está en el núcleo. Y (3, 2, 5) es el *c* del capítulo 13: *B*·(1, 1, 1) = *c*, así que (1, 1, 1) también es una solución de ese sistema.

::::{div}
:class: afondo
7. `True`. El núcleo por la izquierda de *Bᵀ* son los *x* con *x*·*Bᵀ* = 0, y trasponiendo, *B*·*x* = 0: el núcleo por la derecha de *B*.
8. `K.basis()` da `[(1, 1, 1)]` y `list(K)` da `[(0, 0, 0), (1, 1, 1)]`. En GF(2), una recta tiene solo **dos** puntos, porque los únicos múltiplos son 0·*k* y 1·*k*. Sobre un cuerpo finito, un subespacio tiene un número finito de vectores: `K.cardinality()` da `2`.
::::
