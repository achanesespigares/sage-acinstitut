---
title: Vectores y matrices
subtitle: Sobre ℚ, ℝ y GF(p), y por qué importa dónde viven las entradas
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Una tienda vende tres productos a 1, 2 y 3 euros. Un cliente se lleva 4 del primero, devuelve 1 del segundo y compra medio kilo del tercero. Lo que paga es 1·4 + 2·(−1) + 3·½ = 7/2 euros: se multiplican los números de dos listas posición a posición y se suma. Eso es el **producto escalar** de dos vectores.

Los **vectores** son listas de números que se suman y se multiplican por números. Las **matrices** son tablas de números que transforman vectores: giran, estiran, mezclan. Con ellas se escriben los sistemas de ecuaciones, las rotaciones de un videojuego o las soluciones del muelle del capítulo 11.

## La pregunta

¿Cómo se trabaja con vectores y matrices en Sage? ¿Y qué cambia según dónde vivan sus entradas: enteros, fracciones, decimales o restos módulo *p*?

## La idea

En Sage, un vector o una matriz **tiene padre**, como los números del capítulo 1. Ese padre dice dos cosas: el tamaño y el anillo de las entradas.

- `vector(QQ, [1, 2, 3])` vive en *Vector space of dimension 3 over Rational Field*. El libro lo abrevia como **`QQ^3`**, que es como se escribe en Sage.
- `matrix(QQ, [[1, 2], [3, 4]])` vive en *Full MatrixSpace of 2 by 2 dense matrices over Rational Field*. El libro lo abrevia como **`Mat(2×2, QQ)`**.

El anillo decide cómo se hacen las cuentas, y también **quién** las hace: las matrices de enteros y fracciones las opera FLINT; las de GF(*p*), LinBox; las de decimales, entrada a entrada con MPFR.

## Construcción

### 1 · El producto escalar a mano

Antes de usar `vector`, el producto escalar con listas de Python y un bucle: multiplicar posición a posición e ir sumando.

```{code-cell} sage
u = [1, 2, 3]
v = [4, -1, 1/2]
s = 0
for i in [0..2]:
    s = s + u[i]*v[i]
    print(i, s)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/12-matrices-1.json","config":{"titulo":"Multiplicar y sumar","etiqueta":"producto escalar · listas","idea":"El for recorre las posiciones 0, 1 y 2. En cada una, multiplica u[i] por v[i] y lo suma a s: 4, luego 4 − 2 = 2, luego 2 + 3/2 = 7/2.","columnas":["i","s"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- Las posiciones de una lista de Python empiezan en **0**: `u[0]` es `1` y `u[2]` es `3`. Por eso el bucle va de 0 a 2.
- En la vuelta 0, `s` pasa a ser `1*4 = 4`; en la 1, `4 + 2*(-1) = 2`; en la 2, `2 + 3*1/2 = 7/2`.
- `s` vale `7/2`, en `QQ`, porque `1/2` es una fracción de Sage.

Las listas no saben sumarse como vectores: `u + v` las **pega** (`[1, 2, 3, 4, -1, 1/2]`), y `2*u` las repite. Para eso está `vector`. Este programa usa solo listas y fracciones, y el laboratorio lo ejecuta entero en el navegador.

### 2 · `vector`: listas que saben sumarse

```{code-cell} sage
u = vector(QQ, [1, 2, 3])
v = vector(QQ, [4, -1, 1/2])
w = u + v
d = 2*u
p = u*v
r = u.norm()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/12-matrices-2.json","config":{"titulo":"Vectores de verdad","etiqueta":"vector · QQ^3","idea":"Un vector de Sage vive en un espacio vectorial, QQ^3. Ahora u + v suma posición a posición, 2*u multiplica cada componente, y u*v es el producto escalar del apartado 1, sin bucle.","columnas":["w","d","p","r"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `u` vale `(1, 2, 3)`, con paréntesis, y su etiqueta es `QQ^3`: los vectores de 3 componentes en los racionales.
- `w` vale `(5, 1, 7/2)`: la suma componente a componente.
- `d` vale `(2, 4, 6)`: cada componente por 2.
- `p` vale `7/2`, en `QQ`: entre dos vectores, `*` es el **producto escalar**. Un vector por un vector da un número.
- `r` vale `sqrt(14)`, en `SR`: la longitud del vector, √(1² + 2² + 3²), exacta.

En las cuentas con vectores de `QQ`, el recuadro **Quién hace el cálculo** dice GMP: el código de Sage (`vector_rational_dense.pyx`) guarda cada componente como una fracción de GMP y suma con `mpq_add`.

### 3 · `matrix`: el orden importa

Una matriz se escribe como una lista de filas. El producto de matrices combina filas de la primera con columnas de la segunda.

:::{tip} Predice
Para números, 2·3 = 3·2. ¿Será *A*·*B* igual a *B*·*A* con matrices?
:::

```{code-cell} sage
A = matrix(QQ, [[1, 2], [3, 4]])
B = matrix(QQ, [[0, 1], [1, 0]])
C = A*B
D = B*A
A*B == B*A
t = A.transpose()
y = A*vector(QQ, [1, 1])
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/12-matrices-3.json","config":{"titulo":"A·B no es B·A","etiqueta":"matrix · producto · traspuesta","idea":"B intercambia: a la derecha (A·B) intercambia las columnas de A; a la izquierda (B·A), las filas. Por eso A·B y B·A son distintas. Una matriz por un vector da otro vector.","columnas":["C","D","t","y"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `A` es la tabla `[1 2]` / `[3 4]`, con la etiqueta `Mat(2×2, QQ)`.
- `C` = *A*·*B* vale `[2 1]` / `[4 3]`: las **columnas** de *A*, intercambiadas.
- `D` = *B*·*A* vale `[3 4]` / `[1 2]`: las **filas** de *A*, intercambiadas.
- `A*B == B*A` escribe `False` en la consola. El producto de matrices **no es conmutativo**.
- `t` vale `[1 3]` / `[2 4]`: la traspuesta cambia filas por columnas.
- `y` vale `(3, 7)`: cada fila de *A* por el vector (1, 1), es decir, la suma de cada fila.

En los productos de matrices de `QQ`, el recuadro dice FLINT: en el código de Sage, el producto de `Matrix_rational_dense` llama a `_multiply_flint`.

### 4 · La misma matriz en cuatro anillos

Los mismos números, 1, 2, 3 y 4, en cuatro sitios distintos.

```{code-cell} sage
A = matrix(ZZ, [[1, 2], [3, 4]])
H = A/2
R = matrix(RR, [[1, 2], [3, 4]])
S = R^2
M = matrix(GF(5), [[1, 2], [3, 4]])
Q = M^2
c = GF(5)(2)/GF(5)(3)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/12-matrices-4.json","config":{"titulo":"Dónde viven las entradas","etiqueta":"ZZ · QQ · RR · GF(5)","idea":"Dividir una matriz de enteros entre 2 la lleva a QQ, como 1/2 en el capítulo 1. En RR, las entradas son decimales. En GF(5), todo se hace módulo 5: M² sale [2 0] / [0 2], y 2/3 vale 4 porque 3·4 = 12 deja resto 2.","columnas":["H","S","Q","c"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `A` está en `Mat(2×2, ZZ)`. `H` = *A*/2 vale `[1/2 1]` / `[3/2 2]` y pasa a `Mat(2×2, QQ)`: la coerción del capítulo 1, ahora con matrices.
- `R` escribe cada entrada con 15 cifras, `1.00000000000000`. `S` = *R*² vale `[7.00000000000000 10.0000000000000]` / `[15.0000000000000 22.0000000000000]`. El recuadro dice MPFR: cada entrada es un decimal de MPFR.
- `M` está en `Mat(2×2, GF(5))`, las matrices con entradas en el cuerpo de 5 elementos {0, 1, 2, 3, 4}. `Q` = *M*² vale `[2 0]` / `[0 2]`: en ℚ saldría `[7 10]` / `[15 22]`, y 7, 10, 15 y 22 dejan restos 2, 0, 0 y 2 al dividir entre 5.
- En `Q`, el recuadro dice LinBox: en el código de Sage, el producto de estas matrices llama a `linbox_matrix_matrix_multiply`, que usa la biblioteca FFLAS-FFPACK del proyecto LinBox.
- `c` vale `4`. En GF(5) se puede dividir entre cualquier número que no sea 0: 2/3 es el número que, multiplicado por 3, da 2. Y 3·4 = 12, que deja resto 2.

GF(*p*) viene de *Galois field*, «cuerpo de Galois». Los cuerpos finitos son la base de los códigos que corrigen errores (los códigos QR usan uno de 256 elementos) y de buena parte de la criptografía. Sus cuentas son **exactas** y nunca crecen: todo se queda entre 0 y *p* − 1.

::::{div}
:class: afondo
### 5 · Girar doce veces 30°

La matriz que gira 30° tiene cos 30° y sen 30° en sus entradas. Doce giros de 30° son una vuelta entera: *R*¹² debería ser la identidad.

```{code-cell} sage
R = matrix([[cos(pi/6), -sin(pi/6)], [sin(pi/6), cos(pi/6)]])
P = R^12
N = matrix(RR, R)
Q = N^12
Q == identity_matrix(RR, 2)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/12-matrices-5.json","config":{"titulo":"Una vuelta entera, o casi","etiqueta":"SR frente a RR","idea":"En SR, R¹² es exactamente la identidad. En RR, cada uno de los productos redondea, y tras doce giros quedan restos de 10⁻¹⁶ fuera de la diagonal: Q no es la identidad.","columnas":["P","Q"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `R` vale `[1/2*sqrt(3) -1/2]` / `[1/2 1/2*sqrt(3)]`, en `Mat(2×2, SR)`: Sage ha calculado cos(π/6) = √3/2 y sen(π/6) = 1/2 exactos.
- `P` vale `[1 0]` / `[0 1]`: la identidad, exacta. Las raíces de 3 se cancelan solas.
- `N` es la misma matriz en `RR`: `0.866025403784439` en lugar de √3/2.
- `Q` vale `[0.999999999999999 -3.88578058618805e-16]` / `[3.88578058618805e-16 0.999999999999999]`: casi la identidad, pero no.
- `Q == identity_matrix(RR, 2)` escribe `False`.

Es el mismo fenómeno que `0.1 + 0.2 == 0.3` en el capítulo 1, multiplicado por doce productos. En un videojuego que gira un objeto un poco en cada fotograma, esos errores se acumulan y el objeto acaba deformado; por eso es habitual «arreglar» la matriz cada cierto tiempo. Con entradas exactas no hace falta.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Producto escalar, producto de matrices y una matriz módulo 5 (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| Producto escalar | `vector(QQ, [1, 2, 3])*vector(QQ, [4, -1, 1/2])` da `7/2` | `Matrix([1, 2, 3]).dot(Matrix([4, -1, Rational(1, 2)]))` da `7/2` | `[1, 2, 3]' * [4, -1, 1//2]` da `7//2` |
| *A*·*B* | `matrix(QQ, [[1, 2], [3, 4]])*matrix(QQ, [[0, 1], [1, 0]])` da `[2 1]` / `[4 3]` | `Matrix([[1, 2], [3, 4]])*Matrix([[0, 1], [1, 0]])` da `Matrix([[2, 1], [4, 3]])` | `[1 2; 3 4] * [0 1; 1 0]` da `[2 1; 4 3]` |
| *M*² en GF(5) | `matrix(GF(5), [[1, 2], [3, 4]])^2` da `[2 0]` / `[0 2]` | `(Matrix([[1, 2], [3, 4]])**2).applyfunc(lambda e: e % 5)` da `Matrix([[2, 0], [0, 2]])` | `mod.([1 2; 3 4]^2, 5)` da `[2 0; 0 2]` |

Sage es el único de los tres en el que la matriz **sabe** que vive en GF(5): SymPy y Julia calculan con enteros y reducen al final. En Julia, las listas entre corchetes ya son vectores y matrices: `[1 2; 3 4]` es una matriz, y `'` traspone.
:::

## Conexiones

- La coerción del capítulo 1 (ZZ ⊂ QQ → RR) funciona igual con matrices: *A*/2 lleva una matriz de enteros a `QQ`.
- Las listas y el `for` del capítulo 2 hacen el producto escalar a mano; `vector` lo hace en una sola operación.
- Las soluciones del muelle del capítulo 11, *K*₁ sen *x* + *K*₂ cos *x*, se comportan como los vectores (*K*₁, *K*₂): se suman y se multiplican por números.
- El sistema *x* + *y* = 5, *x* − *y* = 1 del capítulo 10 es *A*·(*x*, *y*) = (5, 1), con *A* = `[1 1]` / `[1 -1]`.

## La grieta

`solve` resolvía sistemas en el capítulo 10, pero sin decir **cómo**. Con matrices, un sistema es *A*·*x* = *b*, y se resuelve con el método de Gauss: hacer ceros fila a fila. ¿Qué pasos da Sage, y cómo se sabe si el sistema tiene una solución, infinitas o ninguna? Eso es el capítulo 13, **Sistemas, rango y Gauss paso a paso**.

## Ejercicios

1. **Sin decir el anillo.** ¿Cuál es el padre de `vector([1, 2, 3])`? ¿Y el de `vector([1.0, 2, 3])`?

2. **Producto vectorial.** Con `u` y `v` del apartado 2, ¿qué da `u.cross_product(v)`? Comprueba que es perpendicular a `u`.

3. **Al cuadrado.** ¿Qué da `matrix(QQ, [[1, 2], [3, 4]])^2`?

4. **En GF(2).** ¿Qué da `matrix(GF(2), [[1, 1], [1, 0]])^3`?

5. **Matrices no cuadradas.** Con `A = matrix(QQ, 2, 3, [1..6])` y `B = matrix(QQ, 3, 2, [1..6])`, ¿qué tamaño tienen `A*B` y `B*A`? ¿Qué valen?

6. **Traza a mano.** Con el programa del apartado 1, cambia `v` por `[1, 1, 1]`. ¿Qué escribe?

::::{div}
:class: afondo
7. **Anillos que no se mezclan.** ¿Qué da `matrix(QQ, [[1, 2], [3, 4]]) + matrix(GF(5), [[1, 0], [0, 1]])`? ¿Por qué?

8. **Tamaños que no encajan.** Con `A` del ejercicio 5, ¿qué da `A*A`?
::::

## Solucionario

1. `Ambient free module of rank 3 over the principal ideal domain Integer Ring`, es decir, `ZZ^3`. Sage no lo llama espacio vectorial, sino **módulo**, porque en ZZ no se puede dividir: 1/2 no es entero. Con `1.0`, todo pasa a RR: `Vector space of dimension 3 over Real Field with 53 bits of precision`.
2. `(4, 23/2, -9)`. Y `u*(4, 23/2, -9)` = 4 + 23 − 27 = `0`: el producto vectorial es perpendicular a los dos vectores.
3. `[ 7 10]` / `[15 22]`.
4. `[1 0]` / `[0 1]`, la identidad: en GF(2), *M*³ = I.
5. `A*B` es de 2×2 y vale `[22 28]` / `[49 64]`. `B*A` es de 3×3 y vale `[ 9 12 15]` / `[19 26 33]` / `[29 40 51]`. Ni siquiera tienen el mismo tamaño.
6. `0 1`, `1 3` y `2 6`: con todo unos, el producto escalar es la suma de `u`, 1 + 2 + 3 = 6.

::::{div}
:class: afondo
7. `TypeError: unsupported operand parent(s) for +: 'Full MatrixSpace of 2 by 2 dense matrices over Rational Field' and 'Full MatrixSpace of 2 by 2 dense matrices over Finite Field of size 5'`. No hay coerción entre QQ y GF(5): 1/2 es un número en QQ, pero en GF(5) es 3 (porque 2·3 = 6 deja resto 1). Sage no adivina cuál de los dos significados se quiere.
8. Un `TypeError` del mismo tipo, con `'Full MatrixSpace of 2 by 3 dense matrices over Rational Field'` dos veces. Para multiplicar, el número de columnas de la primera tiene que ser el de filas de la segunda, y 3 ≠ 2.
::::
