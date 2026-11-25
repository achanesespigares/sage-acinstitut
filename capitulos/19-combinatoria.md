---
title: Combinatoria y probabilidad
subtitle: Contar sin equivocarse, y repartir la suerte en fracciones exactas
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

El capítulo 18 acabó con dos cuentas de la misma potencia:

- en QQ[x], (*x* + 1)⁵ = *x*⁵ + 5*x*⁴ + 10*x*³ + 10*x*² + 5*x* + 1;
- en GF(5)[x], (*x* + 1)⁵ = *x*⁵ + 1.

Los números 1, 5, 10, 10, 5, 1 tienen nombre: son los **números combinatorios**. El 10 que acompaña a *x*³ cuenta de cuántas maneras se pueden elegir 3 de los 5 paréntesis (*x* + 1) para tomar la *x*. Y contar maneras es el primer paso de la **probabilidad**: casos favorables entre casos posibles.

## La pregunta

¿Cómo cuenta Sage combinaciones, permutaciones y subconjuntos? ¿Por qué los números del medio son múltiplos de 5? ¿Y cómo se calculan probabilidades sin perder exactitud?

## La idea

- **`binomial(n, k)`** es el número de maneras de elegir *k* cosas de *n*, y **`factorial(n)`** el de ordenar *n* cosas. Los calcula GMP.
- **`Combinations`**, **`Permutations`** y **`Subsets`** no solo cuentan: también **enumeran** las posibilidades una a una.
- Una probabilidad es una fracción. Si se calcula con enteros de Sage, sale exacta, en QQ.

## Construcción

### 1 · El triángulo de Pascal

Cada número del triángulo es la suma de los dos que tiene encima. Con listas, cada fila nueva empieza y acaba en 1, y en medio suma las parejas de la fila anterior.

:::{tip} Predice
La fila 4 es [1, 4, 6, 4, 1]. ¿Cuál es la fila 5?
:::

```{code-cell} sage
fila = [1]
for n in [1..5]:
    nueva = [1]
    for k in [1..n-1]:
        nueva.append(fila[k-1] + fila[k])
    nueva.append(1)
    fila = nueva
    print(fila)
[c % 5 for c in fila]
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/19-combinatoria-1.json","config":{"titulo":"Cada número, la suma de los dos de arriba","etiqueta":"triángulo de Pascal · listas","idea":"Las filas salen una tras otra: [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1] y [1, 5, 10, 10, 5, 1]. Sus restos módulo 5 son [1, 0, 0, 0, 0, 1]: los del medio son múltiplos de 5.","columnas":["n","fila"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- En la primera vuelta, `[1..0]` está vacía: la fila 1 es solo `[1, 1]`.
- Desde la fila 2, el bucle de dentro suma parejas: `fila[0] + fila[1]`, `fila[1] + fila[2]`…
- La consola escribe las cinco filas, y la última es `[1, 5, 10, 10, 5, 1]`: los coeficientes de (*x* + 1)⁵.
- La lista de los restos módulo 5 es `[1, 0, 0, 0, 0, 1]`. Por eso, en GF(5)[x], (*x* + 1)⁵ se queda en *x*⁵ + 1.

Este programa solo usa listas y enteros: el laboratorio lo ejecuta entero en el navegador.

### 2 · Contar: `binomial`, `factorial` y compañía

```{code-cell} sage
binomial(5, 2)
factorial(5)
C = Combinations(['a', 'b', 'c', 'd', 'e'], 2)
C.cardinality()
list(Combinations(['a', 'b', 'c'], 2))
Permutations(3).list()
Subsets([1..4]).cardinality()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/19-combinatoria-2.json","config":{"titulo":"Contar y enumerar","etiqueta":"binomial · factorial · Combinations","idea":"binomial(5, 2) = 10 son las parejas que se forman con 5 letras, y factorial(5) = 120 las maneras de ordenar 5 cosas. Combinations y Permutations, además de contarlas, las escriben una a una. Un conjunto de 4 elementos tiene 2⁴ = 16 subconjuntos.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `binomial(5, 2)` escribe `10`, y `factorial(5)` escribe `120`. Los calcula **GMP**, con sus funciones `mpz_bin_ui` y `mpz_fac_ui`.
- `C` es *Combinations of ['a', 'b', 'c', 'd', 'e'] of length 2*: un objeto que **representa** las combinaciones sin haberlas escrito todavía. `C.cardinality()` escribe `10`, como `binomial(5, 2)`.
- `list(Combinations(['a', 'b', 'c'], 2))` escribe `[['a', 'b'], ['a', 'c'], ['b', 'c']]`: ahora sí, una a una.
- `Permutations(3).list()` escribe las 6 ordenaciones de 1, 2 y 3, de `[1, 2, 3]` a `[3, 2, 1]`: 3! = 6.
- `Subsets([1..4]).cardinality()` escribe `16`. Cada elemento puede estar o no estar: 2·2·2·2 = 2⁴.

La fórmula que une las dos funciones es binomial(*n*, *k*) = *n*! / (*k*!·(*n* − *k*)!): 120 / (2·6) = 10.

### 3 · Por qué los del medio son múltiplos de *p*

binomial(*p*, *k*) = *p*! / (*k*!·(*p* − *k*)!). Si *p* es primo y 0 < *k* < *p*, el *p* del numerador no se puede simplificar con nada del denominador, porque allí todos los números son menores que *p*. Así que *p* divide a binomial(*p*, *k*).

```{code-cell} sage
[binomial(7, k) for k in [0..7]]
[binomial(7, k) % 7 for k in [0..7]]
[binomial(6, k) % 6 for k in [0..6]]
R.<x> = GF(7)[]
(x + 1)^7
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/19-combinatoria-3.json","config":{"titulo":"El primo no se va","etiqueta":"binomial(p, k) mod p","idea":"Con 7, que es primo, todos los del medio son múltiplos de 7. Con 6 no: binomial(6, 2) = 15 deja resto 3, porque el 6 del numerador se simplifica con el 2 y el 3 del denominador. Y en GF(7)[x], (x + 1)⁷ = x⁷ + 1.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- La fila 7 es `[1, 7, 21, 35, 35, 21, 7, 1]`.
- Sus restos módulo 7 son `[1, 0, 0, 0, 0, 0, 0, 1]`.
- Con 6, que no es primo, los restos son `[1, 0, 3, 2, 3, 0, 1]`: binomial(6, 2) = 15 y binomial(6, 3) = 20 no son múltiplos de 6.
- `(x + 1)^7` escribe `x^7 + 1`, y lo calcula **FLINT**, con los polinomios de GF(7)[x] del capítulo 18.

En GF(*p*)[x], (*x* + *a*)ᵖ = *x*ᵖ + *a*ᵖ para cualquier *a*. A esta regla se la conoce, en broma, como «el sueño del estudiante», porque es el error que tantos cometen con los números reales… y que módulo *p* resulta ser verdad.

### 4 · Probabilidad exacta

Con dos dados hay 6·6 = 36 resultados, todos igual de probables. ¿Qué probabilidad hay de que sumen 7? Para cada valor *a* del primer dado, el segundo tiene que sacar 7 − *a*, y eso solo es posible si 7 − *a* está entre 1 y 6.

```{code-cell} sage
caras = [1..6]
casos = len(caras)^2
fav = len([a for a in caras if 1 <= 7 - a <= 6])
fav/casos
ZZ(fav)/casos
p = 1 - (5/6)^4
n(p)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/19-combinatoria-4.json","config":{"titulo":"Casos favorables entre casos posibles","etiqueta":"dados · len · QQ","idea":"6 de los 36 resultados suman 7, así que la probabilidad es 1/6. Pero len da enteros de Python, y 6/36 con ellos es el decimal 0.16666666666666666. Pasando uno a ZZ, la división se hace en QQ y sale 1/6 exacto.","columnas":["casos","fav"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `casos` vale `36` y `fav` vale `6`: los seis pares (1, 6), (2, 5)… (6, 1). Los dos llevan la etiqueta `int`, de **Python**, no de Sage.
- **Trampa:** `len` devuelve enteros de Python (capítulo 1), y el preparador no los toca. `len(caras)^2` también da un `int`: un entero de Python elevado a uno de Sage sigue siendo de Python (capítulo 2).
- `fav/casos` escribe `0.16666666666666666`: dos `int` de Python dan una división con decimales.
- `ZZ(fav)/casos` escribe `1/6`. Con un entero de Sage, la división se hace en QQ.
- `p` vale `671/1296`: la probabilidad de sacar al menos un 6 en cuatro tiradas, uno menos la de no sacar ninguno. `n(p)` escribe `0.517746913580247`.

Es el problema del **caballero de Méré**, con el que empezó la teoría de la probabilidad (Pascal y Fermat, 1654): apostar a sacar algún 6 en cuatro tiradas sale a cuenta, porque gana algo más de la mitad de las veces. Este programa también corre entero en el laboratorio.

::::{div}
:class: afondo
### 5 · El problema del cumpleaños

¿Cuántas personas tiene que haber en una sala para que sea más probable que improbable que dos cumplan años el mismo día? Se calcula la probabilidad de que **todos** los cumpleaños sean distintos, *q*, multiplicando persona a persona: la primera tiene 365 días libres de 365, la segunda 364 de 365…

```{code-cell} sage
q = 1
k = 0
while 1 - q < 1/2:
    q = q*(365 - k)/365
    k = k + 1
k
p = 1 - q
p.denominator()
n(p)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/19-combinatoria-5.json","config":{"titulo":"23 personas bastan","etiqueta":"cumpleaños · fracciones de GMP","idea":"q baja persona a persona: 364/365, 364·363/365², … Con 23 personas, 1 − q pasa de 1/2: 0,507. La fracción exacta tiene un denominador de 53 cifras, y Sage la guarda entera.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `q` es una fracción de QQ que se va multiplicando, y cada producto lo hace **GMP**.
- El bucle termina con `k` = `23`.
- `p.denominator()` escribe un número de **53 cifras**, 75091883268515350125426207425223147563269805908203125: la fracción exacta, ya simplificada.
- `n(p)` escribe `0.507297234323985`.

23 parece poco para 365 días. Pero la pregunta no es si alguien cumple el mismo día que **tú**, sino si **alguna pareja** coincide. Y con 23 personas hay binomial(23, 2) = 253 parejas.

Todo el cálculo es exacto. Las fracciones crecen, pero GMP no tiene límite de tamaño: solo al final, con `n`, se pasa a decimales. El laboratorio también lo ejecuta entero.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Contar y calcular probabilidades (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| Combinatorio | `binomial(5, 2)` da `10` | `binomial(5, 2)` da `10` (y `math.comb`) | `binomial(5, 2)` da `10` |
| Factorial | `factorial(21)` da `51090942171709440000` | `factorial(21)` igual | `factorial(21)` da `OverflowError`; con `factorial(big(21))`, el número |
| Enumerar | `list(Combinations(['a', 'b', 'c'], 2))` | `list(subsets(['a', 'b', 'c'], 2))` da tuplas | no está en la base; hay paquetes (`Combinatorics`) |
| Dos dados | `ZZ(len(siete))/len(dados)` da `1/6` | `P(Eq(X + Y, 7))` con `sympy.stats` da `1/6` | `count(t -> sum(t) == 7, d)//length(d)` da `1//6` |
| Méré | `1 - (5/6)^4` da `671/1296` | `1 - Rational(5, 6)**4` da `671/1296` | `1 - (5//6)^4` da `671//1296` |

Julia usa enteros de 64 bits por defecto: 20! todavía cabe, 21! ya no. SymPy y Sage usan enteros sin límite. Y en Python sin SymPy, `6/36` también da el decimal `0.16666666666666666`, igual que la trampa de `len` del apartado 4.
:::

## Conexiones

- Los coeficientes de (*x* + 1)ⁿ del capítulo 18 son la fila *n* del triángulo de Pascal: es el **binomio de Newton**.
- Que *p* divida a binomial(*p*, *k*) es otra cara del pequeño teorema de Fermat del capítulo 17: de (*x* + 1)ᵖ = *x*ᵖ + 1 en GF(*p*) se deduce que *a*ᵖ ≡ *a* (mod *p*).
- La serie *e*ˣ = Σ *x*ᵏ/*k*! del capítulo 9 usa los factoriales de este capítulo, y la probabilidad de un desorden total tiende a 1/*e* (ejercicio 8).
- El problema del cumpleaños es «exacto frente a aproximado» otra vez, como en el capítulo 1: la fracción exacta y, al final, sus decimales.

## La grieta

Las 23 personas del cumpleaños forman 253 parejas. Si se dibuja cada persona como un punto y cada pareja como una línea entre dos puntos, sale una figura con 23 puntos y 253 líneas. Con menos líneas (solo entre quienes se conocen, o entre ciudades unidas por carretera), sale un dibujo distinto. ¿Se puede ir de un punto a cualquier otro? ¿Cuál es el camino más corto? Un dibujo de puntos y líneas es un **grafo**: el capítulo 20, **Grafos**.

## Ejercicios

1. **Una mano.** ¿Qué da `binomial(10, 3)`? ¿De cuántas maneras se eligen 3 personas de 10?

2. **Factoriales grandes.** ¿Qué dan `factorial(20)` y `len(str(factorial(100)))`?

3. **Subconjuntos.** ¿Qué da `Subsets([1..10]).cardinality()`? ¿Por qué?

4. **Doble seis.** En el programa del apartado 4, cambia el 7 por 12. ¿Qué escriben `fav/casos` y `ZZ(fav)/casos`?

5. **Dos seises.** ¿Qué da `binomial(4, 2)*(1/6)^2*(5/6)^2`? ¿Qué probabilidad es?

6. **Traza a mano.** En el programa del apartado 1, cambia `[1..5]` por `[1..7]` y `c % 5` por `c % 7`. ¿Qué escribe la última línea?

::::{div}
:class: afondo
7. **Treinta personas.** Cambia el programa del apartado 5 para que calcule la probabilidad con 30 personas exactamente. ¿Cuánto da?

8. **Nadie con su sombrero.** ¿Qué dan `Derangements(4).cardinality()` y `n(Derangements(10).cardinality()/factorial(10))`? Compáralo con `n(exp(-1))`.
::::

## Solucionario

1. `120`: 10·9·8 / 3! = 720 / 6.
2. `2432902008176640000` y `158`: 100! tiene 158 cifras, y Sage lo calcula exacto.
3. `1024` = 2¹⁰: cada uno de los 10 elementos está o no está.
4. `0.027777777777777776` y `1/36`: solo (6, 6) suma 12, así que `fav` vale 1.
5. `25/216`, alrededor del 11,6 %: la probabilidad de sacar **exactamente** dos seises en cuatro tiradas. binomial(4, 2) = 6 elige en qué dos tiradas salen.
6. `[1, 0, 0, 0, 0, 0, 0, 1]`: la fila 7 es [1, 7, 21, 35, 35, 21, 7, 1] y todos los del medio son múltiplos de 7.

::::{div}
:class: afondo
7. Con `while k < 30:` en lugar de la condición del apartado, `n(1 - q)` da `0.706316242719269`: con 30 personas, un 70 %.
8. `9` y `0.367879464285714`, muy cerca de `n(exp(-1))` = `0.367879441171442`. Un **desarreglo** es una permutación en la que nadie se queda en su sitio (nadie recoge su sombrero), y la proporción tiende a 1/*e*.
::::
