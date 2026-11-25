---
title: Exacto frente a aproximado
subtitle: Cuántas cifras de un resultado son de fiar, y cómo hacer que Sage lo diga
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

El capítulo 22 acabó con tres avisos:

- `QQ(RR(1/3))` daba 1/3, aunque el número guardado era `6004799503160661/18014398509481984`.
- `1/10 == 0.1` daba `True`, aunque 0.1 no es exactamente 1/10.
- Al mezclar precisiones, Sage se quedaba con la menor sin avisar.

Un número de RR se escribe con 15 cifras, pero eso no quiere decir que las 15 sean correctas. Puede que solo lo sean 10, o ninguna.

## La pregunta

¿Cuándo conviene calcular con exactos (ZZ, QQ, QQbar) y cuándo con aproximados? ¿Qué padres aproximados tiene Sage, además de RR? ¿Y cómo se sabe cuántas cifras de un resultado son de fiar?

## La idea

- Un número **exacto** (ZZ, QQ) es justo el número que se quiere. Las cuentas no pierden nada, pero los números pueden crecer mucho.
- Un número **aproximado** (RR, RDF, `RealField(n)`) guarda una cantidad fija de bits. Cada cuenta redondea, y los redondeos se acumulan.
- **RR** usa MPFR y admite cualquier precisión con `RealField(n)`. **RDF** usa los decimales del procesador, como el `float` de Python: es más rápido, pero siempre tiene 53 bits.
- Un **intervalo** (RIF) guarda dos números, uno por debajo y otro por encima del valor exacto. Las cuentas los redondean hacia fuera, así que el valor exacto queda siempre dentro.
- Una **bola** (RBF) guarda un centro y un radio, y el valor exacto queda siempre a menos de un radio del centro.
- Con intervalos y bolas, Sage escribe solo las cifras seguras. Si no hay ninguna, lo dice.

## Construcción

### 1 · Diez veces una décima

Se suma diez veces 1/10, en QQ, y diez veces 0.1, en RR. Las dos sumas deberían dar 1.

:::{tip} Predice
Las dos sumas se escriben igual. ¿Las dos son iguales a 1?
:::

```{code-cell} sage
s = 0
r = 0.0
for k in [1..10]:
    s = s + 1/10
    r = r + 0.1
s
r
s == 1
r == 1
1 - r
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/23-exacto-aproximado-1.json","config":{"titulo":"Diez veces una décima","etiqueta":"QQ frente a RR · redondeo acumulado","idea":"En QQ, diez veces 1/10 es exactamente 1. En RR, 0.1 ya está redondeado, y cada suma vuelve a redondear: r se escribe 1.00000000000000, pero r == 1 da False. Le faltan 1.11 · 10⁻¹⁶.","columnas":["k","s","r"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `s` escribe `1`, y `s == 1` escribe `True`. En QQ no se pierde nada.
- `r` escribe `1.00000000000000`, pero `r == 1` escribe `False`.
- `1 - r` escribe `1.11022302462516e-16`: lo que se ha perdido por el camino.

0.1 no tiene una expresión exacta en binario, como 1/3 no la tiene en decimal: RR guarda la fracción binaria más cercana. Cada suma redondea otra vez, y los errores se acumulan. RR escribe solo 15 cifras, y el error está más allá: por eso no se ve.

Este programa solo usa ZZ, QQ y RR: el laboratorio lo ejecuta entero en el navegador.

### 2 · Los padres aproximados

Sage tiene varios padres de números reales aproximados. Se diferencian en cuántos bits guardan y en quién hace las cuentas.

```{code-cell} sage
a = RR(1/3)
b = RDF(1/3)
c = RealField(200)(1/3)
RDF.prec()
a + b
b + a
sum([RDF(0.1)]*10)
RDF(2).sqrt()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/23-exacto-aproximado-2.json","config":{"titulo":"RR, RDF y RealField(200)","etiqueta":"precisión · MPFR · el procesador","idea":"RR y RDF guardan 53 bits, pero RR escribe 15 cifras y RDF, 17, como Python. RealField(200) guarda 200 bits. Entre RR y RDF hay coerción en los dos sentidos, así que el resultado acaba en el padre del sumando de la izquierda.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `a = RR(1/3)` vale `0.333333333333333`. Lo calcula **MPFR**.
- `b = RDF(1/3)` vale `0.3333333333333333`. RDF usa los decimales de doble precisión del procesador (`double`, en C): las cuentas las hace el propio procesador, sin ninguna biblioteca.
- `c = RealField(200)(1/3)` vale `0.33333333333333333333333333333333333333333333333333333333333`, con 200 bits.
- `RDF.prec()` escribe `53`: RR y RDF guardan los mismos bits. RR escribe 15 cifras y RDF, 17, como el `float` de Python.
- `a + b` escribe `0.666666666666667`, en RR, y `b + a` escribe `0.6666666666666666`, en RDF. Hay coerción de RR a RDF y de RDF a RR. Cuando hay en los dos sentidos, gana el padre del sumando de la izquierda.
- `sum([RDF(0.1)]*10)` escribe `0.9999999999999999`. Con 17 cifras, el error del apartado 1 ya se ve.

**Trampa:** que RR escriba menos cifras no quiere decir que guarde menos. Los dos guardan 53 bits; RDF escribe las 17 cifras que hacen falta para recuperar el número guardado, y RR, solo 15.

### 3 · Intervalos: dos números en lugar de uno

`RIF` es el padre de los intervalos de reales. Cada elemento guarda un extremo por debajo del valor exacto y otro por encima. Lo calcula **MPFI**, que redondea siempre hacia fuera.

```{code-cell} sage
I = RIF(1/3)
I
I.lower()
I.upper()
I.absolute_diameter()
J = 3*I
J
J == 1
1 in J
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/23-exacto-aproximado-3.json","config":{"titulo":"Un intervalo que contiene el valor exacto","etiqueta":"RIF · lower · upper · el ? final","idea":"RIF(1/3) se escribe 0.3333333333333334?: el ? dice que la última cifra no es segura. 3·I contiene el 1, pero también otros números, así que J == 1 no puede dar True. Sage solo dice True cuando está seguro.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `I` escribe `0.3333333333333334?`. El `?` final quiere decir que todas las cifras son seguras menos la última, que puede variar en una unidad.
- `I.lower()` escribe `0.333333333333333` e `I.upper()` escribe `0.333333333333334`: los dos extremos. El 1/3 exacto está entre ellos.
- `I.absolute_diameter()` escribe `5.55111512312578e-17`: lo que mide el intervalo.
- `J = 3*I` escribe `1.000000000000000?`.
- `J == 1` escribe `False`, pero `1 in J` escribe `True`. `J` contiene el 1, pero también otros números muy cercanos, y Sage no puede asegurar que `J` sea exactamente 1. Con intervalos, `==` solo da `True` si los dos lados son el mismo número sin ninguna duda.

### 4 · Bolas: un centro y un radio

`RBF` es el padre de las **bolas** de reales. Cada elemento es un centro y un radio, y el valor exacto está a menos de un radio del centro. Lo calcula **Arb**, la aritmética de bolas que hoy forma parte de FLINT.

```{code-cell} sage
B = RBF(1/3)
B
B.mid()
B.rad()
C = 3*B
C
C.contains_exact(1)
RBF(2).sqrt()
RealBallField(100)(pi)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/23-exacto-aproximado-4.json","config":{"titulo":"Centro y radio","etiqueta":"RBF · mid · rad · Arb","idea":"RBF(1/3) se escribe [0.3333333333333333 +/- 7.04e-17]: un centro y una cota del error. Al multiplicar por 3, el radio crece, y la bola sigue conteniendo el 1. Con 100 bits, π sale con 30 cifras seguras.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `B` escribe `[0.3333333333333333 +/- 7.04e-17]`: el centro y, después de `+/-`, el radio redondeado hacia arriba.
- `B.mid()` escribe `0.333333333333333` y `B.rad()` escribe `5.5511151e-17`. El radio se guarda con pocos bits: solo hace falta una cota.
- `C = 3*B` escribe `[1.00000000000000 +/- 3.89e-16]`: el radio ha crecido, porque al multiplicar también crece el error.
- `C.contains_exact(1)` escribe `True`: el 1 exacto está dentro de la bola.
- `RBF(2).sqrt()` escribe `[1.414213562373095 +/- 2.99e-16]`.
- `RealBallField(100)(pi)` escribe `[3.14159265358979323846264338328 +/- 2.25e-30]`: con 100 bits, 30 cifras seguras.

Intervalos y bolas dicen lo mismo de dos maneras. Un intervalo da los dos extremos; una bola, el centro y lo que se puede alejar de él. Con mucha precisión, las bolas suelen ser más rápidas, porque el radio solo necesita unos pocos bits.

::::{div}
:class: afondo
### 5 · El ejemplo de Rump

Siegfried Rump propuso en 1988 una función de dos variables que engaña a los ordenadores. Aquí va escrita con fracciones, para que los coeficientes sean exactos en cualquier padre.

```{code-cell} sage
def rump(a, b):
    return 1335/4*b^6 + a^2*(11*a^2*b^2 - b^6 - 121*b^4 - 2) + 11/2*b^8 + a/(2*b)
rump(RR(77617), RR(33096))
rump(RealField(100)(77617), RealField(100)(33096))
rump(RIF(77617), RIF(33096))
rump(RealIntervalField(130)(77617), RealIntervalField(130)(33096))
v = rump(77617, 33096)
v
n(v)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/23-exacto-aproximado-5.json","config":{"titulo":"Un resultado falso con todas sus cifras","etiqueta":"Rump · RR · RealField(100) · RIF · QQ","idea":"RR da −1.18 · 10²¹, y con 100 bits sale 1.17260394005317…: dos resultados falsos, escritos con todas sus cifras. Con 53 bits, el intervalo escribe 0.?e22: no hay ninguna cifra segura. Con 130 bits ya acierta, y QQ da el valor exacto, −54767/66192.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `rump(RR(77617), RR(33096))` escribe `-1.18059162071741e21`.
- Con 100 bits, escribe `1.1726039400531786318588349045`: 29 cifras, todas falsas. Con más precisión, el resultado no se acerca: cambia por completo.
- `rump(RIF(77617), RIF(33096))` escribe `0.?e22`. El intervalo va de unos −5,9 · 10²¹ a 4,7 · 10²¹, y Sage lo dice tal cual: no sabe ni una cifra.
- Con un intervalo de 130 bits, escribe `-0.827396059946821368141165095479816291999?`, y esas cifras sí son de fiar.
- `v = rump(77617, 33096)` se calcula con enteros y fracciones, y vale `-54767/66192`. `n(v)` escribe `-0.827396059946821`.

Pasa porque los términos grandes se cancelan casi del todo. Hay sumandos de unas 10³⁷, y el resultado está por debajo de 1. Con 53 bits se guardan unas 16 cifras de cada sumando, y lo que queda tras la cancelación es solo el error de redondeo. Con `RealField` se comprueba que hacen falta 122 bits: con 121, el resultado aún es 1,17…

El aproximado sin más da un número y no avisa. El intervalo da el número y lo que vale. El exacto, cuando se puede, da la respuesta sin ninguna duda.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Exactos, decimales e intervalos (comprobado con Sage 10.8, Python 3.13 con mpmath 1.3 y Julia 1.13 con IntervalArithmetic.jl 1.0):

| | Sage | Python | Julia |
|---|---|---|---|
| Diez veces 0.1, en un bucle | `r == 1` da `False` | `0.9999999999999999` | `sum(fill(0.1, 10))` da `0.9999999999999999` |
| Diez veces 1/10, exacto | `1` en QQ | `Fraction(1, 10)` diez veces da `1` | `sum(fill(1//10, 10))` da `1//1` |
| Más precisión | `RealField(200)` | `decimal.Decimal`, `mpmath` | `BigFloat` (256 bits por defecto) |
| Intervalos | `RIF(1/3)` da `0.3333333333333334?` | `mpmath.iv.mpf(1)/3` da `[0.33333333333333331483, 0.33333333333333337034]` | `interval(1)/3` da `[0.333333, 0.333334]` |
| Rump con 53 bits | `-1.18059162071741e21` | `-1.1805916207174113e+21` | `-1.1805916207174113e21` |
| Rump con intervalos | `0.?e22` | de −5,9 · 10²¹ a 4,7 · 10²¹ | de −5,9 · 10²¹ a 4,7 · 10²¹ |

**Trampa de Python:** desde la versión 3.12, `sum([0.1]*10)` da `1.0`, porque `sum` compensa los redondeos de los `float`. El mismo bucle con `r += 0.1` sigue dando `0.9999999999999999`. En Sage, `sum` de elementos de RR no compensa: da `1.00000000000000`, y `== 1` da `False`.
:::

## Conexiones

- En el capítulo 1, `0.1 + 0.2 == 0.3` daba `False`. Es el mismo redondeo que en el apartado 1.
- En el capítulo 7, la secante con decimales empeoraba al acercar los puntos: la resta de dos números casi iguales deja solo el error, como en Rump.
- En el capítulo 14, la inversa de Hilbert de 10×10 en RR tenía un error relativo de 10⁻⁴, y en QQ era exacta.
- En el capítulo 16, la matriz con 10⁻²⁰ dejaba de ser diagonalizable en RR, porque 4 − 10⁻²⁰ se redondeaba a 4.
- El capítulo 22 explicaba por qué no hay coerción de RR a QQ: un decimal es en realidad un intervalo de números posibles. RIF y RBF lo dicen abiertamente.

## La grieta

Al hablar de RR, RDF, RIF y RBF han salido MPFR, el procesador, MPFI y Arb. Antes, GMP, PARI, FLINT, LinBox, NTL, Maxima, Pynac… Sage no hace casi ninguna cuenta él mismo: pregunta a otros programas.

¿Cuántos programas hay debajo de Sage? ¿Cómo se habla con cada uno? ¿Se les puede llamar directamente, saltándose a Sage? Es el capítulo 24, **Qué hay debajo**.

## Ejercicios

1. **Un séptimo.** ¿Qué escriben `RR(1/7)` y `RDF(1/7)`?

2. **Dos tercios.** ¿Qué escribe `RIF(2/3)`? ¿Qué quiere decir el `?`?

3. **Sumar intervalos.** ¿Qué escriben `RIF(1, 2) + RIF(3, 4)` y `(RIF(1, 2) + RIF(3, 4)).endpoints()`?

4. **Una bola que vuelve.** ¿Qué escribe `(RBF(1/7)*7).contains_exact(1)`?

5. **Traza a mano.** En el programa del apartado 1, cambia `0.1` por `0.5` y `1/10` por `1/2`. ¿Qué escriben `r` y `r == 5`? ¿Por qué ahora no hay error?

6. **Poca precisión.** ¿Qué escribe `RealField(20)(pi)`?

::::{div}
:class: afondo
7. **El umbral de Rump.** ¿Qué escribe `rump(RealIntervalField(120)(77617), RealIntervalField(120)(33096))`? ¿Qué quiere decir?

8. **El problema de la dependencia.** Con `x = RIF(-1, 1)`, ¿qué dan `(x^2).endpoints()` y `(x*x).endpoints()`? ¿Por qué no coinciden?
::::

## Solucionario

1. `0.142857142857143` y `0.14285714285714285`: los dos guardan 53 bits, pero RR escribe 15 cifras y RDF, 17.
2. `0.6666666666666667?`. Todas las cifras son seguras menos la última.
3. `5.?` y `(4.00000000000000, 6.00000000000000)`. La suma de un número entre 1 y 2 y otro entre 3 y 4 está entre 4 y 6. `5.?` quiere decir eso: un 5 cuya última cifra puede variar en una unidad.
4. `True`: la bola `[1.00000000000000 +/- 4.17e-16]` contiene el 1.
5. `5.00000000000000` y `True`. 0.5 = 1/2 se escribe exactamente en binario, y sumar 0.5 no redondea nada.
6. `3.1416`: con 20 bits caben unas 6 cifras.

::::{div}
:class: afondo
7. `0.?e1`: con `.endpoints()` se ve que el intervalo va de −6,83 a 1,17, así que no hay ninguna cifra segura. Con 120 bits aún no basta; con 130, sí.
8. `(0.000000000000000, 1.00000000000000)` y `(-1.00000000000000, 1.00000000000000)`. `x^2` sabe que es un cuadrado y nunca es negativo. `x*x` trata los dos factores como si fueran números distintos del intervalo, y −1·1 = −1. Los intervalos no recuerdan que las dos `x` son la misma.
::::
