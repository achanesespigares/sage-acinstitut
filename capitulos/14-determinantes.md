---
title: Determinantes e inversas
subtitle: Un número que decide si una matriz se puede deshacer
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En el capítulo 13, el sistema de *A* tenía solución única y el de *B* no. Sage daba det(*A*) = 7 y det(*B*) = 0. Ese número, el **determinante**, resume en una cifra si una matriz cuadrada «pierde información»: si es 0, la matriz aplasta el espacio (una dimensión desaparece) y lo que ha hecho no se puede deshacer. Si no es 0, existe la matriz que la deshace, su **inversa**.

Para una matriz de 2×2, el determinante es *ad* − *bc*: el área (con signo) del paralelogramo que forman sus columnas.

## La pregunta

¿Cómo se calculan el determinante y la inversa en Sage, y para qué sirven? ¿Puede una matriz tener inversa en un anillo y no en otro?

## La idea

- **`A.det()`** (o `A.determinant()`) da el determinante. Con matrices de `QQ` lo calcula **FLINT**; con matrices de GF(*p*), **LinBox**.
- **`A.inverse()`**, `A^-1` o `~A` dan la inversa *A*⁻¹, la que cumple *A*·*A*⁻¹ = I. También la calcula FLINT.
- Con la inversa, el sistema *A*·*x* = *b* se resuelve de golpe: *x* = *A*⁻¹·*b*.

Y antes, la regla de **Cramer**: un sistema de 2×2 se resuelve con tres determinantes y dos divisiones.

## Construcción

### 1 · Cramer a mano

Para *x* + 2*y* = 5, 3*x* − *y* = 1: *D* es el determinante de los coeficientes; *D*ₓ, el mismo con la columna de *x* cambiada por los términos independientes; *D*ᵧ, con la de *y* cambiada. Entonces *x* = *D*ₓ/*D* e *y* = *D*ᵧ/*D*.

:::{tip} Predice
*D* = 1·(−1) − 2·3. ¿Cuánto vale? ¿Qué pasaría si fuera 0?
:::

```{code-cell} sage
def det2(a, b, c, d):
    return a*d - b*c

D = det2(1, 2, 3, -1)
Dx = det2(5, 2, 1, -1)
Dy = det2(1, 5, 3, 1)
x = Dx/D
y = Dy/D
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/14-determinantes-1.json","config":{"titulo":"Tres determinantes y dos divisiones","etiqueta":"regla de Cramer · fracciones","idea":"D = −7, Dx = −7 y Dy = −14. Dividiendo, x = 1 e y = 2: la solución del ejercicio 1 del capítulo 13, sin hacer ceros.","columnas":["D","Dx","Dy","x","y"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `D` vale `-7`: 1·(−1) − 2·3 = −1 − 6.
- `Dx` vale `-7`: la columna de *x*, (1, 3), cambiada por (5, 1): 5·(−1) − 2·1.
- `Dy` vale `-14`: la columna de *y*, (2, −1), cambiada por (5, 1): 1·1 − 5·3.
- `x` vale `1` e `y` vale `2`, los dos en `QQ`: dividir enteros de Sage da fracciones, aunque salgan exactas.

Si *D* fuera 0, las divisiones darían `ZeroDivisionError`: no hay solución única. Cramer sirve para 2×2 y 3×3; para matrices grandes es mucho más lento que Gauss. Este programa usa solo enteros y fracciones, y el laboratorio lo ejecuta entero en el navegador.

### 2 · `det()` y sus reglas

```{code-cell} sage
A = matrix(QQ, [[1, 1, 1], [2, -1, 1], [1, 2, -1]])
d = A.det()
S = copy(A)
S.swap_rows(0, 1)
s = S.det()
B = matrix(QQ, [[1, 2], [3, 4]])
C = matrix(QQ, [[0, 1], [1, 0]])
(B*C).det() == B.det()*C.det()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/14-determinantes-2.json","config":{"titulo":"Un número con reglas","etiqueta":"det · propiedades","idea":"det(A) = 7. Al intercambiar dos filas, el determinante cambia de signo: −7. Y el determinante de un producto es el producto de los determinantes: la consola escribe True.","columnas":["d","s"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `d` vale `7`, en `QQ`. El recuadro **Quién hace el cálculo** dice FLINT: la documentación de `determinant` para matrices de `QQ` dice que, por defecto, «uses flint».
- `copy(A)` hace una copia: `swap_rows` cambia la matriz, y así *A* no se toca.
- `s` vale `-7`: intercambiar dos filas cambia el **signo** del determinante.
- `(B*C).det() == B.det()*C.det()` escribe `True`: det(*B*·*C*) = 2 y det(*B*)·det(*C*) = (−2)·(−1) = 2.

Otras reglas, comprobadas con Sage: el determinante de la traspuesta es el mismo (`A.transpose().det()` da `7`); el de una matriz triangular es el producto de la diagonal; y multiplicar una matriz de 3×3 por 2 multiplica el determinante por 2³ = 8 (`(2*A).det()` da `56`).

### 3 · La inversa

```{code-cell} sage
A = matrix(QQ, [[1, 1, 1], [2, -1, 1], [1, 2, -1]])
b = vector(QQ, [6, 3, 2])
Ai = A.inverse()
A*Ai == identity_matrix(QQ, 3)
x = Ai*b
R = A.augment(identity_matrix(QQ, 3)).rref()
R.submatrix(0, 3) == Ai
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/14-determinantes-3.json","config":{"titulo":"Deshacer una matriz","etiqueta":"inverse · Gauss-Jordan","idea":"A⁻¹ tiene sétimos en todas las casillas: es 1/7 por una matriz de enteros, y 7 es det(A). A⁻¹·b da la solución (1, 2, 3). Gauss sobre [A | I] deja [I | A⁻¹]: la mitad derecha es la inversa.","columnas":["Ai","x"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `Ai` vale `[-1/7 3/7 2/7]` / `[3/7 -2/7 1/7]` / `[5/7 -1/7 -3/7]`. Todos los denominadores son 7, el determinante: la inversa de una matriz de enteros es 1/det por una matriz de enteros.
- El recuadro **Quién hace el cálculo** vuelve a decir FLINT: en el código de Sage, la inversa de una matriz de `QQ` llama a `fmpq_mat_inv`.
- `A*Ai == identity_matrix(QQ, 3)` escribe `True`.
- `x` vale `(1, 2, 3)`: la solución del sistema, con una sola multiplicación.
- `R` es la forma escalonada reducida de [*A* | I], una matriz de 3×6. Gauss deja la identidad a la izquierda y la inversa a la derecha. `R.submatrix(0, 3)` (de la fila 0 y la columna 3 en adelante) es esa mitad, y `== Ai` escribe `True`.

`A^-1` y `~A` dan la misma matriz. Calcular la inversa cuesta más que resolver con `solve_right`: si solo se quiere resolver **un** sistema, Gauss es más rápido. La inversa compensa cuando se resuelven muchos sistemas con la misma *A*.

### 4 · Cuando no hay inversa

:::{tip} Predice
La matriz `[1 2]` / `[3 1]` tiene determinante 1 − 6 = −5. ¿Tendrá inversa en QQ? ¿Y en GF(5)?
:::

```{code-cell} sage
B = matrix(QQ, [[1, 1, 1], [1, -1, 2], [2, 0, 3]])
d = B.det()
C = matrix(QQ, [[1, 2], [3, 1]])
Ci = C.inverse()
M = matrix(GF(5), [[1, 2], [3, 1]])
e = M.det()
M.inverse()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/14-determinantes-4.json","config":{"titulo":"Det = 0, sin vuelta atrás","etiqueta":"matrices singulares · QQ frente a GF(5)","idea":"det(B) = 0: B no tiene inversa. C tiene det −5 y en QQ se invierte, con quintos. La misma matriz en GF(5) tiene det 0, porque −5 deja resto 0 al dividir entre 5: ahí no tiene inversa, y Sage da un error.","columnas":["d","Ci","e"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `d` vale `0`. `B.inverse()` daría `ZeroDivisionError: input matrix must be nonsingular`: *B* es **singular**.
- `Ci` vale `[-1/5 2/5]` / `[3/5 -1/5]`, con denominador 5 = |det(*C*)|.
- `e` vale `0`, en GF(5). El recuadro dice LinBox: en el código de Sage, el determinante de estas matrices llama a `linbox_det` cuando *p* es primo y mayor que 2.
- La última línea da `ZeroDivisionError: input matrix must be nonsingular`. Para invertir hay que dividir entre el determinante, y en GF(5), −5 = 0.

Una matriz es invertible si su determinante tiene inverso **en su anillo**. En `QQ` basta con que no sea 0. En GF(5) también, pero −5 **es** 0 allí. En `ZZ`, haría falta que fuera ±1 (aunque `inverse` de una matriz de `ZZ` devuelve siempre una de `QQ`: el ejercicio 8 lo explica).

::::{div}
:class: afondo
### 5 · La matriz de Hilbert

La matriz de Hilbert tiene 1/(*i* + *j* − 1) en la fila *i*, columna *j*: `[1 1/2 1/3]` / `[1/2 1/3 1/4]` / `[1/3 1/4 1/5]` para 3×3. Sus filas se parecen tanto que es «casi» singular. Sage la crea con `matrix.hilbert(n)`.

```{code-cell} sage
H = matrix.hilbert(10)
d = H.det()
g = H.inverse()[9, 9]
HR = matrix(RR, H)
gR = HR.inverse()[9, 9]
e = (gR - g)/g
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/14-determinantes-5.json","config":{"titulo":"Casi singular","etiqueta":"Hilbert · QQ frente a RR","idea":"El determinante de la matriz de Hilbert de 10×10 tiene 53 cifras en el denominador. Su inversa exacta tiene enteros de hasta 13 cifras. En RR, la última casilla sale con un error relativo de una diezmilésima, aunque cada número tiene 16 cifras.","columnas":["g","gR","e"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `d` vale 1 dividido entre un entero de 53 cifras: no es 0, pero casi.
- `g` vale `44914183600`: la última casilla de la inversa exacta. Todas las casillas de *H*⁻¹ son **enteros**, la mayor de 13 cifras.
- `gR` vale `4.49089405783196e10`: la misma casilla calculada en `RR`. Se parece, pero no es igual.
- `e` vale `-0.000116734208664518`: un error relativo de más de una diezmilésima, aunque cada número de `RR` lleva unas 16 cifras.

Al invertir una matriz casi singular, los pequeños errores de redondeo se **amplifican** muchísimo: aquí se pierden unas 12 de las 16 cifras. Con 12×12, el error ya es del 6 %. Con fracciones exactas no se pierde nada: `QQ` da los enteros exactos, aunque tarde más.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Determinante e inversa de la matriz *A* del capítulo, la singular *B* y la última casilla de la inversa de Hilbert de 10×10 (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| det(*A*) | `A.det()` da `7` | `A.det()` da `7` | `det(A)` da `7.000000000000001`; con `Rational{Int}.(A)`, `7//1` |
| *A*⁻¹ | `A.inverse()`, con sétimos | `A.inv()`, con sétimos | `inv(Rational{Int}.(A))`, con sétimos |
| *B*⁻¹ (det 0) | `ZeroDivisionError: input matrix must be nonsingular` | `NonInvertibleMatrixError` | `SingularException` |
| Hilbert 10×10 | exacta `44914183600`; en `RR`, `4.49089405783196e10` | `44914183600` | con fracciones, `44914183600//1`; con `Float64`, `4.4910393592051476e10` |

Julia calcula el determinante por defecto con decimales (por factorización LU) y da `7.000000000000001` para una matriz de enteros. En los decimales de la matriz de Hilbert, Julia y Sage fallan **distinto** (4,49104·10¹⁰ frente a 4,49089·10¹⁰): cada uno acumula sus propios redondeos, y ninguno acierta la quinta cifra.
:::

## Conexiones

- El determinante decide el caso de Rouché-Frobenius del capítulo 13 para matrices cuadradas: det ≠ 0 es lo mismo que rango máximo y solución única.
- La inversa con `rref` sobre [*A* | I] es el método de Gauss del capítulo 13, aplicado a la vez a tres sistemas (uno por columna de I).
- En GF(*p*) del capítulo 12, una matriz es invertible si su determinante no es múltiplo de *p*.
- La matriz de Hilbert repite la lección del capítulo 1: los decimales de `RR` tienen unas 16 cifras, y una cuenta mal condicionada se las come.

## La grieta

Una matriz singular aplasta el espacio: *B* lleva todo el espacio a un plano, porque su rango es 2. ¿Qué vectores se pierden por el camino (los que van a parar a 0)? ¿Y qué vectores salen (los que forman ese plano)? Son el **núcleo** y la **imagen**, dos espacios vectoriales con sus bases. Eso es el capítulo 15, **Núcleo, imagen y bases**.

## Ejercicios

1. **Inversa de enteros.** ¿Qué dan el determinante y la inversa de `matrix(QQ, [[2, 1], [5, 3]])`? ¿Por qué la inversa no tiene fracciones?

2. **Triangular.** ¿Qué da `matrix(QQ, [[2, 5, 7], [0, 3, 1], [0, 0, 4]]).det()`?

3. **Por dos.** Con *A* del apartado 2, `(2*A).det()` da `56`. ¿Por qué 56 y no 14?

4. **Girar hacia atrás.** ¿Qué da `matrix(QQ, [[0, -1], [1, 0]]).inverse()`? Esa matriz gira 90°; ¿qué hace su inversa?

5. **En GF(7).** ¿Qué dan `M.det()` y `M.inverse()` con `M = matrix(GF(7), [[1, 2], [3, 1]])`? Comprueba que `M*M.inverse()` es la identidad.

6. **Traza a mano.** Con el programa del apartado 1, resuelve 2*x* + *y* = 5, *x* + 3*y* = 5. ¿Qué valen `D`, `Dx`, `Dy`, `x` e `y`?

::::{div}
:class: afondo
7. **El determinante de la inversa.** Con `Ai` del apartado 3, ¿qué da `Ai.det()`? ¿Por qué?

8. **De ZZ a QQ.** ¿Qué da `matrix(ZZ, [[2, 1], [1, 1]]).inverse()`, y en qué anillo vive, si su determinante es 1?
::::

## Solucionario

1. `1` y `[ 3 -1]` / `[-5  2]`. El determinante es 1, así que dividir entre él no crea fracciones: la inversa de una matriz de 2×2 es [*d* −*b*; −*c* *a*]/det.
2. `24` = 2·3·4, el producto de la diagonal.
3. Multiplicar la matriz por 2 multiplica por 2 **cada una de las 3 filas**, y cada fila multiplica el determinante por 2: 2³·7 = 56.
4. `[ 0  1]` / `[-1  0]`: gira 90° en sentido contrario, deshaciendo el giro.
5. `2` y `[4 6]` / `[2 4]`. En GF(7), −5 = 2, que no es 0, y 1/2 = 4 (porque 2·4 = 8 deja resto 1). `M*M.inverse()` da `[1 0]` / `[0 1]`.
6. `D` = 2·3 − 1·1 = `5`, `Dx` = 5·3 − 1·5 = `10`, `Dy` = 2·5 − 5·1 = `5`; `x` = `2` e `y` = `1`.

::::{div}
:class: afondo
7. `1/7`. Como *A*·*A*⁻¹ = I, det(*A*)·det(*A*⁻¹) = det(I) = 1, y det(*A*⁻¹) = 1/det(*A*).
8. `[ 1 -1]` / `[-1  2]`, en `Full MatrixSpace of 2 by 2 dense matrices over Rational Field`. Las entradas son enteras, pero la documentación de Sage dice que la inversa se da sobre el **cuerpo de fracciones** del anillo (*over the fraction field*), y el de `ZZ` es `QQ`: no mira si el determinante es ±1. Para tenerla en `ZZ`, se convierte: `matrix(ZZ, M.inverse())`.
::::
