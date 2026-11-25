---
title: Padres y elementos
subtitle: Cada valor de Sage sabe a qué conjunto pertenece, y ese conjunto también es un objeto
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Desde el capítulo 1, cada valor del libro llevaba una etiqueta: `ZZ`, `QQ`, `RR`, `GF(7)`, `QQ[x]`, `Mat(10×10, ZZ)`… Es su **padre**: el conjunto matemático al que pertenece.

El capítulo 20 acabó con una excepción. Un grafo no tiene padre, y su etiqueta es su clase, `Graph`. Así que el padre no es algo que tenga cualquier objeto de Sage. Es algo que Sage da a los números, los polinomios, las matrices… a los **elementos** de una estructura algebraica.

## La pregunta

¿Qué es exactamente un padre? ¿Qué se le puede preguntar? ¿Por qué hay dos padres distintos, `GF(7)` y `Zmod(7)`, para los mismos siete restos? ¿Y qué gana Sage guardando el padre de cada valor?

## La idea

- Un **padre** es un objeto de Sage que representa un conjunto con su estructura: los enteros, los racionales, un cuerpo finito, un anillo de polinomios, un espacio de matrices.
- Un **elemento** es un valor que pertenece a un padre, y lo sabe: `parent(a)` lo devuelve.
- Al padre se le pueden hacer preguntas matemáticas: si es un cuerpo, cuántos elementos tiene, cuál es su cero.
- Con un padre se puede **convertir** un valor (`QQ(3)`) y preguntar si un valor **pertenece** a él (`3 in QQ`).
- Cada padre es **único**: escribir `GF(7)` dos veces da el mismo objeto.
- Los padres se agrupan en **categorías** (anillos, cuerpos…), y la categoría de un padre puede cambiar cuando Sage descubre algo nuevo sobre él.

## Construcción

### 1 · Pertenecer y convertir

`parent(a)` dice a qué padre pertenece `a`. `a in QQ` pregunta si `a` está en los racionales. Y `QQ(a)` convierte `a` en un racional.

:::{tip} Predice
`c = 4/2` vale 2. ¿Su padre es `ZZ` o `QQ`? ¿Y qué responde `c in ZZ`?
:::

```{code-cell} sage
a = 3
b = 1/2
parent(a)
parent(b)
a in QQ
b in ZZ
c = 4/2
parent(c)
c in ZZ
d = ZZ(c)
parent(d)
QQ(a)
ZZ(b)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/21-padres-1.json","config":{"titulo":"El padre de cada valor","etiqueta":"parent · in · conversión","idea":"4/2 vale 2, pero es una división, y su padre es QQ. Aun así, c in ZZ dice True: hay un entero igual a c. ZZ(c) lo convierte y le cambia el padre. Con 1/2 no hay entero igual, y ZZ(b) da un error.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `parent(a)` escribe `Integer Ring`, y `parent(b)` escribe `Rational Field`. Son los nombres completos de `ZZ` y `QQ`.
- `a in QQ` escribe `True`: todo entero es un racional.
- `b in ZZ` escribe `False`: ningún entero es igual a 1/2.
- `c = 4/2` vale `2`, pero `parent(c)` escribe `Rational Field`. Una división de enteros siempre da un racional, aunque el resultado sea entero.
- Aun así, `c in ZZ` escribe `True`.
- `d = ZZ(c)` convierte `c` en un entero de verdad: `parent(d)` escribe `Integer Ring`.
- `QQ(a)` escribe `3`, pero ahora es un racional.
- `ZZ(b)` da `TypeError: no conversion of this rational to integer`. No hay ningún entero igual a 1/2.

**Trampa:** `in` y `parent` son preguntas distintas. `c in ZZ` pregunta si hay un entero **igual** a `c`. Para responder, Sage intenta convertir `c` en un entero y compara: así lo explica la documentación de `Parent.__contains__`. Pero `c` sigue siendo un racional, y su padre sigue siendo `QQ`.

Este programa solo usa ZZ y QQ: el laboratorio lo ejecuta entero en el navegador.

### 2 · El padre también es un objeto

`ZZ`, `QQ` y `GF(7)` no son solo etiquetas: son objetos de Sage, y tienen sus propios métodos.

```{code-cell} sage
ZZ.is_field()
QQ.is_field()
GF(7).is_field()
GF(7).cardinality()
ZZ.cardinality()
GF(7).characteristic()
QQ.zero()
GF(7).list()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/21-padres-2.json","config":{"titulo":"Preguntas al padre","etiqueta":"is_field · cardinality · characteristic","idea":"ZZ no es un cuerpo, porque 2 no tiene inverso entero. QQ y GF(7) sí lo son. GF(7) tiene 7 elementos, y ZZ, infinitos. En GF(7), sumar 7 veces el 1 da 0: su característica es 7.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `ZZ.is_field()` escribe `False`: en los enteros, 2 no tiene inverso. `QQ.is_field()` y `GF(7).is_field()` escriben `True`.
- `GF(7).cardinality()` escribe `7`, y `ZZ.cardinality()` escribe `+Infinity`.
- `GF(7).characteristic()` escribe `7`: la **característica** es cuántas veces hay que sumar el 1 para llegar al 0. En ZZ y QQ no se llega nunca, y la característica es 0.
- `QQ.zero()` escribe `0`: el cero de los racionales, que es un elemento de QQ.
- `GF(7).list()` escribe `[0, 1, 2, 3, 4, 5, 6]`: un cuerpo finito se puede recorrer entero.

### 3 · Un solo padre para cada conjunto

Un elemento guarda a su padre, y se le puede preguntar con `c.parent()`. El operador `is` de Python pregunta si dos cosas son **el mismo objeto** en la memoria, no solo si son iguales.

```{code-cell} sage
c = GF(7)(3)
c.parent()
c.parent() is GF(7)
c + 5
c^-1
Z = Zmod(7)
Z == GF(7)
Z(3) == c
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/21-padres-3.json","config":{"titulo":"El mismo padre, siempre","etiqueta":"parent() · is · GF frente a Zmod","idea":"Cada vez que se escribe GF(7), Sage devuelve el mismo objeto. Zmod(7) tiene los mismos siete restos, pero es otro padre. Aun así, el 3 de uno y el 3 del otro se consideran iguales.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `c.parent()` escribe `Finite Field of size 7`.
- `c.parent() is GF(7)` escribe `True`. El segundo `GF(7)` no crea un cuerpo nuevo: Sage guarda cada padre una sola vez y lo devuelve siempre que se pide.
- `c + 5` escribe `1`, y `c^-1` escribe `5`: las cuentas de un elemento las decide su padre. En GF(7), 3 + 5 = 8 = 1 y 3·5 = 15 = 1.
- `Z == GF(7)` escribe `False`. `Zmod(7)` es *Ring of integers modulo 7*: los restos módulo 7 vistos como anillo. `GF(7)` es el cuerpo de 7 elementos. Tienen los mismos elementos, pero son dos padres distintos.
- `Z(3) == c` escribe `True`: el 3 de uno y el 3 del otro se consideran iguales. Para compararlos, Sage tiene que llevar los dos al mismo padre. El capítulo 22 explica cómo.

Que cada padre sea único tiene una ventaja: comparar dos padres es rapidísimo, porque basta con mirar si son el mismo objeto. Y Sage compara padres constantemente, en cada suma y en cada producto.

### 4 · Padres hechos con padres

Muchos padres se construyen a partir de otro, su **anillo base**. Los polinomios de QQ[x] tienen coeficientes en QQ; las matrices de 2×2 de GF(7) tienen entradas en GF(7).

```{code-cell} sage
R = QQ['x']
R.base_ring()
x = R.gen()
p = x^2 + 1/2
p.parent() is R
M = MatrixSpace(GF(7), 2)
M.cardinality()
A = M([1, 2, 3, 4])
A.parent() is M
A.det()
G = graphs.PetersenGraph()
parent(G)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/21-padres-4.json","config":{"titulo":"Un padre sobre otro","etiqueta":"QQ['x'] · MatrixSpace · base_ring","idea":"QQ['x'] se construye sobre QQ, y MatrixSpace(GF(7), 2) sobre GF(7). Las matrices de 2×2 de GF(7) son 7⁴ = 2401. El grafo de Petersen no tiene padre: parent(G) devuelve su clase.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `R = QQ['x']` es el anillo de polinomios en *x* con coeficientes racionales. `R.base_ring()` escribe `Rational Field`.
- `x = R.gen()` es el **generador** del anillo, la *x*. Es lo que hace por dentro `R.<x> = QQ[]`, del capítulo 18.
- `p = x^2 + 1/2` es un elemento de `R` (la cuenta la hace FLINT, como en el capítulo 18), y `p.parent() is R` escribe `True`.
- `M = MatrixSpace(GF(7), 2)` es el padre de las matrices de 2×2 con entradas en GF(7). `M.cardinality()` escribe `2401` = 7⁴: cuatro entradas, siete posibilidades para cada una.
- `A = M([1, 2, 3, 4])` crea una matriz llamando a su padre, como `QQ(3)` crea un racional. `A.parent() is M` escribe `True`.
- `A.det()` escribe `5`: 1·4 − 2·3 = −2, que en GF(7) es 5. Lo calcula **LinBox**, como los determinantes de GF(*p*) del capítulo 14.
- `parent(G)` escribe `<class 'sage.graphs.graph.Graph'>`. Un grafo no es el elemento de ninguna estructura algebraica, así que `parent` devuelve lo único que tiene: su clase.

::::{div}
:class: afondo
### 5 · Categorías: Sage aprende sobre sus padres

Cada padre pertenece a una **categoría**: anillos, cuerpos, conjuntos finitos… La categoría dice qué operaciones tienen sentido, y Sage elige con ella los algoritmos.

```{code-cell} sage
ZZ in Fields()
QQ in Fields()
Z = Zmod(11)
Z.category()
Z in Fields()
Z.category()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/21-padres-5.json","config":{"titulo":"La categoría cambia","etiqueta":"Fields() · category · Zmod","idea":"Al crear Zmod(11), Sage solo sabe que es un anillo conmutativo finito. Al preguntarle si es un cuerpo, comprueba que 11 es primo, responde True y se lo apunta: la categoría pasa a ser la de los cuerpos finitos.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `ZZ in Fields()` escribe `False`, y `QQ in Fields()` escribe `True`. `Fields()` es la categoría de los cuerpos.
- La primera vez, `Z.category()` empieza por `Join of Category of finite commutative rings`: Sage solo sabe que `Zmod(11)` es un anillo conmutativo finito. Para cualquier *n*, `Zmod(n)` es un anillo, pero solo es un cuerpo si *n* es primo.
- `Z in Fields()` escribe `True`: para responder, Sage comprueba si 11 es primo.
- La segunda vez, `Z.category()` empieza por `Join of Category of finite enumerated fields`. Sage se ha apuntado lo que ha descubierto: en su código, si el orden es primo, `is_field` llama a `_refine_category_(Fields())`. Ahora `Zmod(11)` está en la categoría de los cuerpos finitos.

Como cada padre es único, lo apuntado vale para toda la sesión: cualquier `Zmod(11)` que se escriba después ya sale como cuerpo. Por eso este programa usa el 11 y no el 7: en el capítulo 17 ya se trabajó con `Zmod(7)`, y Sage ya sabía que era un cuerpo.

Con `GF(11)` no hace falta: se construye ya como cuerpo. Por eso, cuando se trabaja con un primo, es mejor `GF(p)` que `Zmod(p)`. Con `Zmod(9)`, la respuesta es `False`, porque 3·3 = 9 = 0 y 3 no tiene inverso (ejercicio 8).
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Padres y elementos (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13 con Nemo 0.57):

| | Sage | SymPy | Julia con Nemo |
|---|---|---|---|
| El padre de 1/2 | `parent(1/2)` da `Rational Field` | el dominio `QQ`: `QQ.of_type(QQ(1, 2))` da `True` | `parent(QQ(1, 2))` da `Rational field` |
| ¿Es un cuerpo? | `QQ.is_field()` da `True` | `QQ.is_Field` da `True` | — |
| Un cuerpo finito | `GF(7)(3)^-1` da `5` | `GF(7)(3)**-1` da `5 mod 7` | `inv(GF(7)(3))` da `5` |
| Un solo padre | `GF(7) is GF(7)` da `True` | — | `GF(7) === GF(7)` da `true` |
| Convertir 1/2 en entero | `ZZ(1/2)` da `TypeError` | `ZZ.convert(Rational(1, 2))` da `CoercionFailed` | `ZZ(QQ(1, 2))` da `InexactError` |

En SymPy, los padres solo existen en el módulo de polinomios (`sympy.polys.domains`): un `Rational(1, 2)` normal no tiene padre. En Julia, cada valor tiene un **tipo** (`typeof(1//2)` da `Rational{Int64}`). Nemo añade padres encima, con un diseño muy parecido al de Sage.
:::

## Conexiones

- Las etiquetas `ZZ`, `QQ`, `RR`, `GF(7)` y `QQ[x]` que el visualizador pone desde el capítulo 1 son los padres de este capítulo, en corto.
- `R.<x> = QQ[]`, del capítulo 18, crea el padre `QQ['x']` y su generador `x`.
- El determinante 5 de GF(7) lo calcula LinBox, como en el capítulo 14.
- El grafo del capítulo 20 no tiene padre: `parent(G)` devuelve su clase.

## La grieta

`1 + 1/2` suma un elemento de ZZ y uno de QQ, y el resultado es de QQ. `Z(3) == c` compara un elemento de `Zmod(7)` con uno de `GF(7)`, y da `True`. Pero `GF(7)(3) + 1/2` da `TypeError: unsupported operand parent(s) for +: 'Finite Field of size 7' and 'Rational Field'`.

¿Quién decide a qué padre se llevan los dos sumandos? ¿Por qué ZZ puede ir a QQ, pero QQ no puede ir a GF(7)? Es la **coerción**, el capítulo 22.

## Ejercicios

1. **Divisiones.** ¿Qué escriben `parent(2/3)` y `parent(6/3)`?

2. **¿Está o no está?** ¿Qué escriben `7 in ZZ`, `7/2 in ZZ` y `0.5 in QQ`?

3. **Un cuerpo pequeño.** ¿Qué escriben `GF(5).cardinality()` y `GF(5).list()`?

4. **¿Cuerpo?** ¿Qué escriben `Zmod(8).is_field()` y `Zmod(7).is_field()`?

5. **Matrices de bits.** ¿Cuántas matrices de 2×2 hay con entradas en GF(2)? Compruébalo con `MatrixSpace(GF(2), 2).cardinality()`.

6. **Traza a mano.** ¿Qué escribe cada línea de `QQ(5)`, `ZZ(10/5)` y `ZZ(10/4)`? ¿Cuál es el padre de las dos primeras?

::::{div}
:class: afondo
7. **Polinomios sobre un cuerpo finito.** Con `R = GF(7)['t']`, ¿qué escriben `R.base_ring().cardinality()`, `R.characteristic()` y `R.is_field()`?

8. **Un anillo que no es cuerpo.** ¿Qué escriben `Zmod(9) in Fields()`, `Zmod(9)(3)*Zmod(9)(3)` y `Zmod(9)(3)^-1`?
::::

## Solucionario

1. `Rational Field` las dos veces: aunque 6/3 = 2, es una división, y su padre es QQ.
2. `True`, `False` y `True`: 0,5 es exactamente 1/2, y hay un racional igual.
3. `5` y `[0, 1, 2, 3, 4]`.
4. `False` y `True`: 8 no es primo (2·4 = 8 = 0), y 7 sí.
5. `16` = 2⁴: cuatro entradas, dos posibilidades para cada una.
6. `5`, `2` y `TypeError: no conversion of this rational to integer`. `QQ(5)` es de QQ, y `ZZ(10/5)` es de ZZ: la conversión cambia el padre.

::::{div}
:class: afondo
7. `7`, `7` y `False`. La característica de un anillo de polinomios es la de sus coeficientes, y un anillo de polinomios nunca es un cuerpo: *t* no tiene inverso.
8. `False`, `0` y `ZeroDivisionError: inverse of Mod(3, 9) does not exist`. El 3 multiplicado por sí mismo da 0, así que no puede tener inverso; es el error del ejercicio 4 del capítulo 17.
::::
