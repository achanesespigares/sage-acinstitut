---
title: Coerción
subtitle: Qué hace Sage cuando suma dos cosas que viven en padres distintos
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

El capítulo 21 acabó con tres cuentas:

- `1 + 1/2` suma un elemento de ZZ y uno de QQ, y el resultado es de QQ.
- `Zmod(7)(3) == GF(7)(3)` compara elementos de dos padres distintos, y da `True`.
- `GF(7)(3) + 1/2` da `TypeError: unsupported operand parent(s)`.

Para sumar, Sage necesita que los dos sumandos vivan en el mismo padre. Si no viven en el mismo, tiene que llevarlos a uno común. A veces sabe hacerlo y a veces no.

## La pregunta

¿Quién decide a qué padre se llevan los dos sumandos? ¿Por qué ZZ puede ir a QQ, pero QQ no puede ir a GF(7)? ¿Y qué pasa cuando ninguno de los dos padres contiene al otro?

## La idea

- Una **coerción** es una flecha de un padre a otro que Sage puede usar **sin que nadie se lo pida**: ZZ → QQ → RR, ZZ → GF(7)…
- Una **conversión** es lo que se hace **a mano**, llamando al padre: `ZZ(4/2)`, `GF(7)(1/2)`. Hay muchas más conversiones que coerciones.
- Sage solo usa una coerción si es **segura**: si respeta las cuentas y no depende de ninguna elección.
- Antes de sumar, multiplicar o comparar, el **modelo de coerción** busca el padre común y lleva allí a los dos elementos. Si no lo encuentra, da un `TypeError`.
- Si ninguno de los dos padres contiene al otro, Sage puede **construir** un padre nuevo que contenga a los dos: el *pushout*.

## Construcción

### 1 · Hacia el padre más grande

ZZ está dentro de QQ, y QQ dentro de RR. Al mezclar, Sage lleva el elemento del padre pequeño al grande.

:::{tip} Predice
`2 + 1/3` mezcla ZZ y QQ. `1/3 + 0.5` mezcla QQ y RR. ¿En qué padre acaba cada suma?
:::

```{code-cell} sage
a = 2
b = 1/3
c = 0.5
s = a + b
parent(s)
t = b + c
parent(t)
u = a*c
parent(u)
v = int(5) + b
parent(v)
w = float(0.5) + b
type(w)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/22-coercion-1.json","config":{"titulo":"Hacia el padre más grande","etiqueta":"ZZ → QQ → RR","idea":"2 + 1/3 acaba en QQ, y 1/3 + 0.5, en RR: el sumando del padre pequeño se lleva al grande. Un int de Python entra en Sage como un entero más. Un float de Python, en cambio, se lleva el resultado a Python.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `s = a + b` vale `7/3`, y `parent(s)` escribe `Rational Field`: el 2 se ha llevado a QQ antes de sumar.
- `t = b + c` vale `0.833333333333333`, y `parent(t)` escribe `Real Field with 53 bits of precision`. El 1/3 se ha llevado a RR, y ya no es exacto.
- `u = a*c` vale `1.00000000000000`, en RR.
- `v = int(5) + b` vale `16/3`, en QQ: un `int` de Python se trata como un entero de Sage.
- `w = float(0.5) + b` vale `0.8333333333333333`, y `type(w)` escribe `<class 'float'>`. Con un `float` de Python, Sage devuelve un `float` de Python, no un elemento de RR.

Siempre se va hacia el padre en el que caben los dos. Nunca al revés: 1/3 no tiene ningún entero que lo represente.

Este programa solo usa ZZ, QQ, RR y números de Python: el laboratorio lo ejecuta entero en el navegador.

### 2 · Coerción y conversión

`P.has_coerce_map_from(Q)` pregunta si hay una coerción de Q a P: una flecha que Sage pueda usar sin pedir permiso.

```{code-cell} sage
QQ.has_coerce_map_from(ZZ)
ZZ.has_coerce_map_from(QQ)
RR.has_coerce_map_from(QQ)
QQ.has_coerce_map_from(RR)
GF(7).has_coerce_map_from(ZZ)
GF(7).has_coerce_map_from(QQ)
GF(7)(1/2)
GF(7)(3) + 1/2
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/22-coercion-2.json","config":{"titulo":"Las flechas que Sage usa solo","etiqueta":"has_coerce_map_from · conversión","idea":"Hay coerción de ZZ a QQ, de QQ a RR y de ZZ a GF(7), pero no al revés, ni de QQ a GF(7). Aun así, GF(7)(1/2) funciona: es una conversión pedida a mano. Lo que no hace Sage es usarla solo, al sumar.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `QQ.has_coerce_map_from(ZZ)` escribe `True`, y `ZZ.has_coerce_map_from(QQ)` escribe `False`.
- `RR.has_coerce_map_from(QQ)` escribe `True`, y `QQ.has_coerce_map_from(RR)` escribe `False`. Un decimal de RR se podría convertir en muchos racionales distintos: no hay una única forma segura (apartado 5).
- `GF(7).has_coerce_map_from(ZZ)` escribe `True`: cada entero tiene su resto módulo 7, sin elegir nada.
- `GF(7).has_coerce_map_from(QQ)` escribe `False`. 1/2 sí tiene un resto, el inverso de 2, que es 4. Pero 1/7 no tendría ninguno, porque 7 es 0 en GF(7) y no se puede dividir entre 0. Una coerción tiene que valer para todo el padre, y esta fallaría.
- `GF(7)(1/2)` escribe `4`. Es una **conversión**: se pide a mano, y Sage la hace porque esta fracción sí tiene sentido en GF(7).
- `GF(7)(3) + 1/2` da `TypeError: unsupported operand parent(s) for +: 'Finite Field of size 7' and 'Rational Field'`. Para sumar, Sage solo usa coerciones, y no hay ninguna entre los dos padres.

**Trampa:** que `GF(7)(1/2)` funcione no quiere decir que `GF(7)(3) + 1/2` vaya a funcionar. La conversión hay que pedirla; la coerción, Sage la busca sola, y solo usa las que valen siempre.

### 3 · Un padre nuevo para los dos

A veces ninguno de los dos padres contiene al otro. Un polinomio de ZZ[x] no está en QQ, y 1/2 no está en ZZ[x]. Pero los dos están en QQ[x].

```{code-cell} sage
x = ZZ['x'].gen()
p = x + 1/2
parent(x)
parent(p)
coercion_model.common_parent(ZZ['x'], QQ)
M = matrix(ZZ, [[1, 2], [3, 4]])
N = M/2
N.parent()
import operator
coercion_model.explain(x, 1/2, operator.add)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/22-coercion-3.json","config":{"titulo":"Construir el padre común","etiqueta":"pushout · common_parent · explain","idea":"x es de ZZ[x], y 1/2 de QQ. Ninguno contiene al otro, así que Sage construye QQ[x]: cambia ZZ por QQ en la construcción de ZZ[x]. Con una matriz de enteros dividida entre 2 pasa lo mismo. explain cuenta paso a paso qué flechas ha usado.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `x = ZZ['x'].gen()` es la *x* de los polinomios con coeficientes enteros, y `parent(x)` escribe `Univariate Polynomial Ring in x over Integer Ring`.
- `p = x + 1/2` vale `x + 1/2`, y `parent(p)` escribe `Univariate Polynomial Ring in x over Rational Field`: un padre que no era el de ninguno de los dos sumandos.
- `coercion_model.common_parent(ZZ['x'], QQ)` escribe el mismo QQ[x]. `coercion_model` es el modelo de coerción, el objeto de Sage que toma estas decisiones.
- `N = M/2` divide una matriz de enteros entre 2, y `N.parent()` escribe `Full MatrixSpace of 2 by 2 dense matrices over Rational Field`. La división de ZZ lleva a QQ, así que las matrices también.
- `coercion_model.explain(x, 1/2, operator.add)` escribe el razonamiento. El de la izquierda se lleva de ZZ[x] a QQ[x] (*Induced from base ring*), y el de la derecha, de QQ a QQ[x] (*Polynomial base injection morphism*). Acaba en *Result lives in Univariate Polynomial Ring in x over Rational Field*. Después, la consola escribe otra vez QQ[x]: es lo que `explain` devuelve.

Este padre común se llama **pushout**. Sage sabe que ZZ[x] se construye aplicando «polinomios en *x*» a ZZ. Para juntarlo con QQ, aplica la misma construcción al padre común de ZZ y QQ, que es QQ.

`operator.add` es la suma de Python como función. Sin ella, `explain` explicaría la multiplicación.

### 4 · Comparar también es coercionar

`==` no compara solo los números: antes, lleva los dos elementos a un padre común. Y en GF(7), 10 y 3 son el mismo elemento.

```{code-cell} sage
a = GF(7)(3)
a + 2
a == 10
c = Zmod(7)(4)
a + c
parent(a + c)
b = GF(5)(3)
a == b
a + b
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/22-coercion-4.json","config":{"titulo":"Comparar en el padre común","etiqueta":"== · GF(7) · Zmod(7) · GF(5)","idea":"a == 10 lleva el 10 a GF(7), donde vale 3: da True. Entre Zmod(7) y GF(7) hay coerción, y la suma acaba en GF(7). Entre GF(7) y GF(5) no hay ninguna: comparar da False, y sumar da un error.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `a + 2` escribe `5`: el 2 se lleva a GF(7).
- `a == 10` escribe `True`. El 10 se lleva a GF(7), donde 10 = 7 + 3 es 3.
- `a + c` escribe `0`, y `parent(a + c)` escribe `Finite Field of size 7`. Hay coerción de `Zmod(7)` a `GF(7)`, pero no al revés: `GF(7).has_coerce_map_from(Zmod(7))` da `True`, y `Zmod(7).has_coerce_map_from(GF(7))` da `False`.
- `a == b` escribe `False`. No hay coerción entre GF(7) y GF(5): un 3 módulo 7 y un 3 módulo 5 no son comparables, y Sage responde que no son iguales.
- `a + b` da `TypeError: unsupported operand parent(s) for +: 'Finite Field of size 7' and 'Finite Field of size 5'`.

**Trampa:** comparar elementos de padres sin coerción no da error, da `False`. Sumarlos sí da error.

::::{div}
:class: afondo
### 5 · Lo exacto se pierde

Con RR y QQ, la coerción va de lo exacto a lo aproximado. Y entre dos precisiones, gana la menor.

```{code-cell} sage
p = RealField(100)(1/3)
q = RR(1/3)
s = p + q
parent(s)
r = QQ(q)
r
q.exact_rational()
1/10 == 0.1
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/22-coercion-5.json","config":{"titulo":"Gana la menor precisión","etiqueta":"RealField · simplest_rational · exact_rational","idea":"Al sumar 100 bits y 53 bits, el resultado tiene 53: Sage no se inventa cifras que no tiene. QQ(q) no da el valor exacto que guarda q, sino el racional más sencillo que se escribe igual, 1/3.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `s = p + q` suma un número de 100 bits y uno de 53, y `parent(s)` escribe `Real Field with 53 bits of precision`.
- Hay coerción de `RealField(100)` a RR, y no al revés. Si el resultado tuviera 100 bits, Sage estaría inventándose 47 bits que `q` no tiene.
- `r = QQ(q)` es una conversión, y `r` escribe `1/3`. Pero `q` no guarda 1/3: guarda la fracción binaria más cercana.
- `q.exact_rational()` escribe `6004799503160661/18014398509481984`: el número que guarda `q`, exacto.
- `QQ(q)` da 1/3 porque, para convertir un decimal de RR, Sage elige el racional más sencillo que se redondea al mismo decimal (`simplest_rational`, en el código de `Rational`). Por eso no puede ser una coerción: es una elección, no la única respuesta posible.
- `1/10 == 0.1` escribe `True`: el 1/10 se lleva a RR y se redondea igual que el 0.1.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Mezclar tipos de números (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13):

| | Sage | SymPy | Julia |
|---|---|---|---|
| Entero más fracción | `2 + 1/3` da `7/3` (QQ) | `Integer(2) + Rational(1, 3)` da `7/3` | `2 + 1//3` da `7//3` (`Rational{Int64}`) |
| Fracción más decimal | `1/3 + 0.5` da `0.833333333333333` (RR) | `Rational(1, 3) + Float(0.5)` da `0.833333333333333` (`Float`) | `1//3 + 0.5` da `0.8333333333333333` (`Float64`) |
| Dos precisiones | gana la menor: 100 y 53 bits dan 53 | gana la mayor: 50 y 15 cifras dan un `Float` de 169 bits | gana la mayor: `big(1)/3 + 1/3` es un `BigFloat` de 256 bits |
| Quién decide | el modelo de coerción (`coercion_model`) | cada clase, en su suma | `promote_rule` y `promote_type(Int, Rational{Int})`, que da `Rational{Int64}` |

Sage es el único de los tres que, al mezclar precisiones, se queda con la menor. Es la opción prudente: el resultado no puede ser más preciso que el menos preciso de los datos.
:::

## Conexiones

- Desde el capítulo 1, el visualizador marca `1/2` con QQ y `0.5` con RR. Cada vez que se mezclaban, había una coerción de QQ a RR.
- `matrix(ZZ, …)/2` acaba en QQ, como en el capítulo 12, y la suma de un vector de ZZ y uno de QQ acaba en QQ² (ejercicio 5).
- En el ejercicio 7 del capítulo 12, sumar una matriz de QQ y una de GF(5) daba `TypeError: unsupported operand parent(s)`: no hay coerción entre QQ y GF(5).
- Los padres únicos del capítulo 21 hacen rápida la coerción. Sage guarda las flechas que encuentra entre cada pareja de padres, y la siguiente vez ya las tiene.

## La grieta

`QQ(q)` daba 1/3, pero `q` guarda `6004799503160661/18014398509481984`. `1/10 == 0.1` da `True`, aunque 0.1 no es exactamente 1/10. Y al sumar precisiones, se pierden cifras sin avisar.

¿Cuándo conviene trabajar con exactos y cuándo con aproximados? ¿Qué otros padres aproximados tiene Sage (RDF, intervalos, bolas)? ¿Y cómo se sabe cuántas cifras de un resultado son de fiar? Es el capítulo 23, **Exacto frente a aproximado**.

## Ejercicios

1. **¿Dónde acaba?** ¿Qué escriben `parent(3 + 1/2)` y `parent(3*0.5)`?

2. **Flechas.** ¿Qué escriben `ZZ.has_coerce_map_from(QQ)` y `RR.has_coerce_map_from(ZZ)`?

3. **Módulo 5.** ¿Qué escriben `GF(5)(2) + 4` y `GF(5)(2) == 7`?

4. **Pedir o no pedir.** ¿Qué escriben `GF(7)(1/3)` y `GF(7)(3) + 1/3`?

5. **Vectores.** ¿Qué escribe `vector(ZZ, [1, 2]) + vector(QQ, [1/2, 0])`, y en qué padre vive?

6. **Traza a mano.** En el laboratorio, `v = int(5) + b` daba `16/3`. ¿Qué daría `v = int(5) + c`, con `c = 0.5`? ¿Y su padre?

::::{div}
:class: afondo
7. **Tres precisiones.** ¿Qué escribe `RealField(200)(1/7) + RealField(30)(1/7)`, y cuál es su padre?

8. **El 0,1 por dentro.** ¿Qué escriben `QQ(0.1)`, `0.1.exact_rational()` y `QQ(0.1) == 0.1.exact_rational()`?
::::

## Solucionario

1. `Rational Field` y `Real Field with 53 bits of precision`.
2. `False` y `True`.
3. `1` (2 + 4 = 6 = 1) y `True` (7 es 2 en GF(5)).
4. `5`, porque 3·5 = 15 = 1 en GF(7). Y `TypeError: unsupported operand parent(s) for +: 'Finite Field of size 7' and 'Rational Field'`: la conversión a mano funciona, pero no hay coerción de QQ a GF(7).
5. `(3/2, 2)`, en `Vector space of dimension 2 over Rational Field`.
6. `5.50000000000000`, en `Real Field with 53 bits of precision`: el 5 se lleva a RR.

::::{div}
:class: afondo
7. `0.28571429`, en `Real Field with 30 bits of precision`: gana la menor.
8. `1/10`, `3602879701896397/36028797018963968` y `False`. `QQ(0.1)` elige el racional más sencillo; `exact_rational()` da el que de verdad guarda el 0.1.
::::
