---
title: Autovalores, diagonalización y Jordan
subtitle: Las direcciones que una matriz solo estira
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

El capítulo 15 terminó con una pregunta. El núcleo de *B* son los vectores que *B* manda a 0, es decir, a 0 veces ellos mismos. ¿Hay vectores que *B* mande a 2 veces ellos mismos, o a −1 veces?

En general, una matriz **gira y estira** cada vector a la vez: *B*·(1, 1, 1) es (3, 2, 5), que apunta hacia otro lado. Pero puede haber direcciones especiales que *B* no gira, solo las estira o las encoge:

*B*·*v* = λ·*v*

Si eso pasa con un *v* que no es 0, se dice que *v* es un **autovector** de *B* y que λ es su **autovalor**. El núcleo es el caso λ = 0.

## La pregunta

¿Cómo encuentra Sage los autovalores y los autovectores de una matriz? ¿Y para qué sirven?

## La idea

- **`B.charpoly()`** es el **polinomio característico**, det(*x*·I − *B*). Sus raíces son los autovalores, y **`B.eigenvalues()`** las da.
- Para cada autovalor λ, los autovectores son el núcleo de *B* − λ·I: lo que ya sabemos calcular desde el capítulo 15.
- Si hay suficientes autovectores para formar una base, la matriz se **diagonaliza**: en esa base, *B* solo estira cada eje.
- Si no los hay, lo más cerca de una diagonal que se puede llegar es la **forma de Jordan**.

## Construcción

### 1 · ¿Lo gira o solo lo estira?

Para saber si *v* es un autovector, se calcula *w* = *B*·*v* y se compara con *v* componente a componente. Si todos los cocientes *w*ᵢ / *v*ᵢ son el mismo número λ, entonces *w* = λ·*v*.

:::{tip} Predice
*v* = (1, 1, 2). ¿Qué sale al multiplicarlo por la primera fila de *B*, (1, 1, 1)? ¿Y por la tercera, (2, 0, 3)?
:::

```{code-cell} sage
B = [[1, 1, 1], [1, -1, 2], [2, 0, 3]]
for v in [[1, 1, 1], [1, 1, 2], [2, -3, -1]]:
    w = [0, 0, 0]
    for i in [0..2]:
        w[i] = B[i][0]*v[0] + B[i][1]*v[1] + B[i][2]*v[2]
    print(v, w, [w[k]/v[k] for k in [0..2]])
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/16-autovalores-1.json","config":{"titulo":"Tres candidatos","etiqueta":"B·v fila a fila · cocientes","idea":"(1, 1, 1) sale girado: los cocientes 3, 2 y 5 no coinciden. (1, 1, 2) sale multiplicado por 4 y (2, −3, −1) por −1: son autovectores, con autovalores 4 y −1.","columnas":["v","i","w"],"fila_en":"cada_linea","mostrar_tipos":true,"matriz":"B","fila":"i"}}
```

- La rejilla marca la fila `B[i]`, que se multiplica por *v* casilla a casilla para dar `w[i]`.
- (1, 1, 1) da (3, 2, 5), con cocientes 3, 2 y 5: **no** es un autovector. *B* lo gira.
- (1, 1, 2) da (4, 4, 8), con cocientes 4, 4 y 4: es un **autovector** con autovalor **4**.
- (2, −3, −1) da (−2, 3, 1), con cocientes −1, −1 y −1: autovector con autovalor **−1**.

Los cocientes `w[k]/v[k]` son fracciones de Sage, en QQ (aquí todas dan un entero). Este programa solo usa listas, enteros y fracciones: el laboratorio lo ejecuta entero en el navegador.

Ya tenemos la respuesta a la mitad de la pregunta: −1 sí. ¿Y 2? Probar candidatos al azar no sirve para demostrar que **no** hay ninguno. Hace falta otra herramienta.

### 2 · El polinomio característico

*B*·*v* = λ·*v* es lo mismo que (*B* − λ·I)·*v* = 0. Hay un *v* que no es 0 justo cuando *B* − λ·I tiene núcleo, es decir, cuando su determinante es 0 (capítulo 14). Así que los autovalores son las raíces de det(*x*·I − *B*), un polinomio en *x*.

```{code-cell} sage
B = matrix(QQ, [[1, 1, 1], [1, -1, 2], [2, 0, 3]])
p = B.charpoly()
p.factor()
e = B.eigenvalues()
(B - 2*identity_matrix(QQ, 3)).det()
(B + identity_matrix(QQ, 3)).right_kernel().basis()[0]
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/16-autovalores-2.json","config":{"titulo":"Las raíces del polinomio","etiqueta":"charpoly · factor · eigenvalues","idea":"El polinomio característico de B es x³ − 3x² − 4x = (x − 4)·x·(x + 1). Los autovalores son 4, 0 y −1, y ninguno más. Por eso B − 2I tiene determinante 12: no tiene núcleo y ningún vector va a parar a 2 veces él mismo.","columnas":["p","e"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `p` vale `x^3 - 3*x^2 - 4*x`, con la etiqueta `QQ[x]`: un **polinomio** en *x* con coeficientes racionales. No vive en SR, sino en un anillo de polinomios propio. Lo calcula **FLINT**: Sage quita los denominadores de la matriz y llama a `fmpz_mat_charpoly`.
- `p.factor()` escribe `(x - 4) * x * (x + 1)`.
- `e` vale `[4, 0, -1]`: los autovalores, uno por raíz.
- `(B - 2*identity_matrix(QQ, 3)).det()` escribe `12` (el determinante también lo calcula FLINT). Como no es 0, *B* − 2I es invertible y su núcleo es solo el 0: **ningún** vector va a parar a 2 veces él mismo.
- El núcleo de *B* + I (es decir, de *B* − (−1)·I) es una recta, y el vector de su base es `(1, -3/2, -1/2)`: la mitad del (2, −3, −1) del apartado 1.

La respuesta completa a la grieta: *B* manda vectores a 4, a 0 y a −1 veces ellos mismos, y a ningún otro múltiplo. El 0 ya lo conocíamos: su autovector es el núcleo del capítulo 15, (1, −1/3, −2/3).

### 3 · Diagonalizar

*B* tiene tres autovalores distintos, así que tiene tres autovectores independientes: una **base** de QQ³. Si se ponen como columnas de una matriz *P*, el cambio de base deja a *B* convertida en una matriz **diagonal** *D*, con los autovalores en la diagonal:

*P*⁻¹·*B*·*P* = *D*

```{code-cell} sage
B = matrix(QQ, [[1, 1, 1], [1, -1, 2], [2, 0, 3]])
D, P = B.eigenmatrix_right()
B*P == P*D
P^-1*B*P == D
D^10
B^10 == P*D^10*P^-1
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/16-autovalores-3.json","config":{"titulo":"La base que lo simplifica todo","etiqueta":"eigenmatrix_right · P⁻¹BP = D","idea":"En la base de autovectores, B es la diagonal (4, 0, −1). Elevarla a 10 es elevar cada número de la diagonal: 4¹⁰ = 1048576, 0 y 1. Y B¹⁰ es P·D¹⁰·P⁻¹.","columnas":["D","P"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `D` es la diagonal con 4, 0 y −1. Su etiqueta dice `dispersa`: Sage la guarda como matriz *sparse*, que solo apunta las casillas que no son 0.
- `P` tiene por **columnas** los autovectores: (1, 1, 2), (1, −1/3, −2/3) y (1, −3/2, −1/2). Sage los escala para que la primera componente sea 1.
- `B*P == P*D` escribe `True`: es *B*·*v* = λ·*v* para las tres columnas a la vez.
- `P^-1*B*P == D` escribe `True`.
- `D^10` es la diagonal `1048576`, `0`, `1`: elevar una diagonal es elevar cada número.
- `B^10 == P*D^10*P^-1` escribe `True`.

Para eso sirve diagonalizar. Las potencias de *B* son difíciles de prever, pero las de *D* no: *B*ⁿ = *P*·*D*ⁿ·*P*⁻¹. Cuando *n* crece, el 4ⁿ gana a todo lo demás, y para casi cualquier vector *v*, *B*ⁿ·*v* acaba apuntando hacia el autovector (1, 1, 2).

### 4 · Cuando no se puede

No todas las matrices se diagonalizan. Hay dos maneras de quedarse corto.

```{code-cell} sage
M = matrix(QQ, [[3, 1], [-1, 1]])
M.charpoly().factor()
N = M - 2*identity_matrix(QQ, 2)
N.right_kernel().dimension()
M.is_diagonalizable()
J, Q = M.jordan_form(transformation=True)
Q^-1*M*Q == J
R = matrix(QQ, [[0, -1], [1, 0]])
r = R.eigenvalues()
R.is_diagonalizable()
R.change_ring(QQbar).is_diagonalizable()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/16-autovalores-4.json","config":{"titulo":"Faltan autovectores","etiqueta":"jordan_form · QQbar","idea":"M tiene el autovalor 2 dos veces, pero una sola recta de autovectores: no llega para una base, y lo mejor es la forma de Jordan [2 1; 0 2]. El giro R no tiene autovalores en QQ: son i y −i, que viven en QQbar, y allí sí se diagonaliza.","columnas":["J","Q","r"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

**Faltan autovectores.**

- El polinomio de *M* es `(x - 2)^2`: el autovalor 2 aparece **dos** veces (multiplicidad algebraica 2).
- Pero el núcleo de *N* = *M* − 2I tiene dimensión `1`: solo **una** recta de autovectores (multiplicidad geométrica 1). Con una recta no se forma una base del plano.
- `M.is_diagonalizable()` escribe `False`.
- `J` es `[2 1; 0 2]`: la **forma de Jordan**. Es casi diagonal; el 1 de arriba es lo que falta para serlo. A esa pieza se la llama **bloque de Jordan**.
- `Q` es la matriz del cambio de base, `[1 1; -1 0]`, y `Q^-1*M*Q == J` escribe `True`.

**Los autovalores no están en QQ.**

- *R* es el giro de 90°: no deja ninguna dirección quieta, así que no tiene autovalores reales. Su polinomio es *x*² + 1.
- `r` vale `[-1*I, 1*I]`, en `QQbar`: los **números algebraicos**, las raíces de polinomios con coeficientes racionales. Sage los guarda de forma exacta.
- `R.is_diagonalizable()` escribe `False`: Sage pregunta en el anillo de la matriz, QQ, y allí no hay autovalores.
- `R.change_ring(QQbar).is_diagonalizable()` escribe `True`: en QQbar, con *i* y −*i*, sí se diagonaliza.

::::{div}
:class: afondo
### 5 · Una gota cambia la forma

¿Qué pasa si a la matriz de Jordan [2 1; 0 2] se le cambia el 0 de abajo por un número diminuto, 10⁻²⁰?

```{code-cell} sage
J = matrix(QQ, [[2, 1], [0, 2]])
G = matrix(QQ, [[2, 1], [1/10^20, 2]])
J.is_diagonalizable()
G.is_diagonalizable()
G.eigenvalues()
H = matrix(RR, [[2, 1], [1/10^20, 2]])
H.charpoly()
H.eigenvalues()
H.jordan_form()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/16-autovalores-5.json","config":{"titulo":"Una gota de 10⁻²⁰","etiqueta":"Jordan exacto · RR y PARI","idea":"En QQ, una casilla de 10⁻²⁰ separa el autovalor doble en 2 ± 10⁻¹⁰ y la matriz pasa a ser diagonalizable. En RR, el 10⁻²⁰ se pierde al redondear 4 − 10⁻²⁰: el polinomio vuelve a ser (x − 2)² y PARI da 2 dos veces. Con decimales, Sage no calcula la forma de Jordan.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `J.is_diagonalizable()` escribe `False`, y `G.is_diagonalizable()` escribe `True`.
- `G.eigenvalues()` escribe `[20000000001/10000000000, 19999999999/10000000000]`: 2 + 10⁻¹⁰ y 2 − 10⁻¹⁰, **exactos**. El polinomio es (*x* − 2)² − 10⁻²⁰, y sus raíces son 2 ± √(10⁻²⁰).
- `H.charpoly()` escribe `x^2 - 4.00000000000000*x + 4.00000000000000`. El término independiente debería ser 4 − 10⁻²⁰, pero con 53 bits 4 − 10⁻²⁰ se redondea a 4: la gota ha desaparecido.
- `H.eigenvalues()` escribe `[2.00000000000000000, 2.00000000000000000]`. Con matrices de RR, Sage le pasa la matriz a **PARI**, que calcula el polinomio característico y sus raíces (`polroots`). Por eso salen en `ComplexField(64)`: los complejos de PARI, con 64 bits.
- `H.jordan_form()` acaba en `ValueError: Jordan normal form not implemented over inexact rings.`

Una perturbación de 10⁻²⁰ en una casilla mueve los autovalores 10⁻¹⁰: un **cuadrado** menos de precisión. Y cambia la forma de Jordan entera, de un bloque [2 1; 0 2] a una diagonal. La forma de Jordan no es continua: no se puede calcular con decimales, porque cualquier redondeo puede cambiarla. Por eso Sage se niega con RR y la deja para los anillos exactos.

Otros programas no la detectan, pero tampoco se libran del problema. Julia (y Sage con `RDF`) usan LAPACK, que no pasa por el polinomio: con *G* aciertan 1.9999999999 y 2.0000000001. Pero con la matriz *M* del apartado 4, que sí es un bloque de Jordan, dan dos autovalores distintos, 1.9999999789265754 y 2.000000021073424, y dos autovectores casi paralelos. Con decimales, una matriz de Jordan y una matriz casi de Jordan no se distinguen.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Autovalores de *B* (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| Polinomio | `B.charpoly()` da `x^3 - 3*x^2 - 4*x` | `B.charpoly()` da `lambda**3 - 3*lambda**2 - 4*lambda` | `LinearAlgebra` no tiene orden para el polinomio |
| Autovalores | `B.eigenvalues()` da `[4, 0, -1]` | `B.eigenvals()` da `{4: 1, -1: 1, 0: 1}` (con su multiplicidad) | `eigvals(B)` da `[-1.0000000000000004, -6.938893903907228e-18, 3.999999999999999]` |
| Diagonalizar | `D, P = B.eigenmatrix_right()` | `P, D = B.diagonalize()` (al revés) | `E = eigen(B)`: `E.values` y `E.vectors` |
| Jordan | `M.jordan_form()` da `[2 1; 0 2]` | `M.jordan_form()` da `(P, J)` | `LinearAlgebra` no la tiene: con decimales no tiene sentido |
| El giro *R* | no diagonalizable en QQ; sí en QQbar | `R.is_diagonalizable()` da `True` (pregunta en los complejos) | `eigvals(R)` da `0.0 - 1.0im` y `0.0 + 1.0im` |

Julia calcula siempre con decimales, también con `Rational{Int}`: el autovalor 0 sale como −6.9·10⁻¹⁸ y el 4 como 3.999999999999999. Sus autovectores tienen longitud 1. SymPy los escala a su manera: (−2, 3, 1) para el −1 y (1/2, 1/2, 1) para el 4.
:::

## Conexiones

- Los autovectores de λ son el núcleo de *B* − λ·I (capítulo 15). El autovalor 0 es justo el núcleo de *B*.
- det(*B*) es el producto de los autovalores, 4·0·(−1) = 0, y por eso *B* no tenía inversa (capítulo 14).
- El giro de 30° del capítulo 12 cumplía *R*¹² = I. Sus autovalores son números complejos *z* con *z*¹² = 1.
- El muelle del capítulo 11, *y*″ + *y* = 0, tiene soluciones cos *x* y sen *x* porque su matriz, [0 1; −1 0], tiene autovalores ±*i*: como el giro *R* de este capítulo.

## La grieta

La matriz *F* = [1 1; 1 0] guarda los números de Fibonacci: sus potencias *F*ⁿ tienen dentro 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89… (ejercicio 5). Son enteros, pero sus autovalores son (1 ± √5)/2. ¿Qué Fibonacci son primos? ¿Por qué *F*₆ = 8 divide a *F*₁₂ = 144? ¿Y qué pasa con la sucesión si solo se miran los restos al dividir entre 7? Son preguntas de **números enteros**: el capítulo 17, **Primos, mcd y congruencias**, abre la parte IV.

## Ejercicios

1. **Simétrica.** ¿Qué dan `A = matrix(QQ, [[2, 1], [1, 2]])`, `A.eigenvalues()` y `A.eigenmatrix_right()`?

2. **Triangular.** ¿Qué da `matrix(QQ, [[2, 5, 7], [0, 3, 1], [0, 0, 4]]).eigenvalues()`? ¿Por qué no hace falta calcular nada?

3. **Traza y determinante.** Con la *B* del capítulo, ¿qué dan `B.trace()` y `B.det()`? ¿Qué relación tienen con 4, 0 y −1?

4. **El polinomio de la matriz.** ¿Qué da `B.charpoly()(B)`, es decir, sustituir *x* por la propia matriz en *x*³ − 3*x*² − 4*x*?

5. **Fibonacci.** Con `F = matrix(QQ, [[1, 1], [1, 0]])`, ¿qué dan `F^10`, `F.eigenvalues()` y `F.is_diagonalizable()`? ¿Qué significan los `?` de la respuesta?

6. **Traza a mano.** En el programa del apartado 1, cambia la lista de candidatos por `[[3, -1, -2]]`. ¿Qué escribe? ¿Qué autovalor tiene?

::::{div}
:class: afondo
7. **Dos bloques.** ¿Qué dan `M3 = matrix(QQ, [[2, 1, 0], [0, 2, 0], [0, 0, 2]])`, `M3.is_diagonalizable()` y `M3.jordan_form()`?

8. **Un giro en GF(5).** ¿Qué dan `matrix(GF(5), [[0, -1], [1, 0]]).eigenvalues()` y `.is_diagonalizable()`? ¿Y en GF(3)?
::::

## Solucionario

1. `[3, 1]`, y `D` = `[3 0; 0 1]`, `P` = `[1 1; 1 -1]`. Los autovectores (1, 1) y (1, −1) son perpendiculares: en una matriz simétrica, los autovectores de autovalores distintos siempre lo son.
2. `[4, 3, 2]`: los números de la diagonal. det(*x*·I − *T*) de una triangular es el producto de la diagonal, (*x* − 2)(*x* − 3)(*x* − 4).
3. `3` y `0`. La traza (la suma de la diagonal, 1 − 1 + 3) es la suma de los autovalores, 4 + 0 − 1 = 3. El determinante es su producto, 4·0·(−1) = 0. Ojo: `trace(B)`, sin punto, es otra orden de Sage (un depurador que sigue la ejecución paso a paso), no la traza.
4. La matriz de ceros 3×3. Es el **teorema de Cayley-Hamilton**: toda matriz anula a su polinomio característico.
5. `F^10` = `[89 55; 55 34]`. `F.eigenvalues()` = `[-0.618033988749895?, 1.618033988749895?]`, en QQbar. `F.is_diagonalizable()` da `False`, porque sus autovalores no son racionales (en QQbar da `True`). El `?` avisa de que la última cifra escrita puede no ser exacta, pero Sage guarda el número exacto: es una raíz de *x*² − *x* − 1, y `F.eigenvalues()[1].radical_expression()` da `1/2*sqrt(5) + 1/2`.
6. `[3, -1, -2] [0, 0, 0] [0, 0, 0]`. Autovalor 0: es el vector del núcleo del capítulo 15.

::::{div}
:class: afondo
7. `False`, y la forma de Jordan tiene dos bloques: uno de 2×2, [2 1; 0 2], y otro de 1×1, [2]. Sage los separa con líneas. El autovalor 2 aparece tres veces, pero sus autovectores forman un plano: dimensión 2, una menos de las que harían falta.
8. En GF(5), `[3, 2]` y `True`: *x*² + 1 = (*x* + 2)(*x* + 3), porque 2² = 4 = −1 en GF(5). En GF(3), *x*² + 1 no tiene raíces: Sage las busca en un cuerpo más grande, GF(9), y escribe `[z2 + 1, 2*z2 + 2]`. `is_diagonalizable()` da `False`, porque pregunta en GF(3).
::::
