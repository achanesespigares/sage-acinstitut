---
title: Series, Taylor y sumas
subtitle: Sumas infinitas que dan un número, y funciones que se vuelven polinomios
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Suma 1 + 1/2 + 1/4 + 1/8 + … sin parar. Cada término es la mitad del anterior, y la suma nunca pasa de 2: le falta siempre justo el último término. Ahora suma 1 + 1/2 + 1/3 + 1/4 + … Los términos también se hacen tan pequeños como quieras, pero esta suma crece sin límite.

Las dos sumas se parecen mucho, y una da un número y la otra no. Distinguirlas es el primer problema de este capítulo. El segundo es el contrario: escribir una función como sen *x* como una suma infinita de potencias.

## La pregunta

¿Cómo sabe Sage si una suma infinita da un número, y cuál? ¿Qué es un polinomio de Taylor, y hasta dónde se puede fiar uno de él?

## La idea

Una **serie** es una suma infinita. No se puede sumar término a término hasta el final, porque no hay final. Lo que se hace es mirar las **sumas parciales**: la suma de los *n* primeros términos. Si se acercan a un número cuando *n* crece, la serie **converge** y ese número es su suma. Si no, **diverge**.

Sage tiene dos maneras de trabajar con esto:

- **Sumar a mano**, con un bucle y fracciones exactas, para ver las sumas parciales.
- **Pedir la suma exacta** con `sum(término, k, inicio, oo)`. Sage se la pasa a **Maxima**, que conoce las series clásicas y sus sumas.

Un **polinomio de Taylor** es lo mismo, pero con potencias de *x*: la suma de los primeros términos de una serie que, cerca de un punto, se parece a la función. Lo calcula `taylor`, también con Maxima.

## Construcción

### 1 · Sumas parciales

Sumamos los siete primeros términos de las dos series, con fracciones exactas: `s` es la geométrica 1 + 1/2 + 1/4 + …, y `h`, la **armónica** 1 + 1/2 + 1/3 + …

```{code-cell} sage
s = 0
h = 0
for k in [0..6]:
    s = s + 1/2^k
    h = h + 1/(k + 1)
    print(k, s, h)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/09-series-1.json","config":{"titulo":"Dos sumas que crecen distinto","etiqueta":"sumas parciales · fracciones","idea":"La geométrica s se queda siempre justo por debajo de 2: 127/64 es 2 − 1/64. La armónica h también crece cada vez menos, pero no se para: después de 7 términos va por 363/140 ≈ 2,59, y con más términos pasaría de cualquier número.","columnas":["k","s","h"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `s` va `1`, `3/2`, `7/4`, `15/8`… Cada suma parcial es 2 − 1/2^*k*: le falta siempre la mitad del último término para llegar a 2.
- `h` va `1`, `3/2`, `11/6`, `25/12`… Con siete términos vale `363/140`, un poco más de 2,59.
- Las dos crecen cada vez menos, y en siete términos no se ve la diferencia. Hace falta otro tipo de razonamiento, y por eso se le pide a Sage la suma exacta.

Con fracciones, las sumas parciales salen exactas, sin redondeos: el laboratorio ejecuta este programa entero en el navegador.

### 2 · Sumas infinitas exactas

`sum(término, k, inicio, oo)` suma desde `k = inicio` hasta el infinito. Antes hay que crear la variable `k` con `var`.

:::{tip} Predice
La suma 1 + 1/4 + 1/9 + 1/16 + … de los inversos de los cuadrados converge. ¿Será una fracción, un decimal o algo con π?
:::

```{code-cell} sage
var('k')
a = sum(1/2^k, k, 0, oo)
b = sum(1/k^2, k, 1, oo)
c = sum((-1)^(k+1)/k, k, 1, oo)
d = sum(x^k/factorial(k), k, 0, oo)
sum(1/k, k, 1, oo)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/09-series-2.json","config":{"titulo":"Infinitos términos, un número exacto","etiqueta":"sum · oo","idea":"Maxima conoce las series clásicas: la geométrica da 2, la de los cuadrados π²/6, la armónica alternada log(2) y la de x^k/k! es e^x. La armónica no da ningún número: Sage se para con «Sum is divergent».","columnas":["a","b","c","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `a` vale `2`, con la etiqueta `ZZ`: cuando la suma es un entero, Sage lo devuelve como entero de Sage.
- `b` vale `1/6*pi^2`. Es el **problema de Basilea**, que resolvió Euler en 1734: la suma de los inversos de los cuadrados es π²/6.
- `c` vale `log(2)`. La armónica con los signos alternados sí converge, al logaritmo neperiano de 2.
- `d` vale `e^x`. La serie de *x*^*k*/*k*! es la exponencial: es su serie de Taylor.
- La última línea, la armónica sin signos, da `ValueError: Sum is divergent.` No hay número que dar.

En todas las líneas con `sum`, el recuadro **Quién hace el cálculo** dice Maxima. Con un número final en vez de `oo`, `sum` da la suma finita: `sum(k, k, 1, 100)` es `5050`.

### 3 · Taylor: funciones que se vuelven polinomios

`taylor(f, x, a, n)` calcula el **polinomio de Taylor** de grado *n* de *f* alrededor de *x* = *a*: el polinomio que mejor se parece a *f* cerca de *a*. Sus coeficientes salen de las derivadas del capítulo 7: el de *x*^*k* es *f*^(*k*)(*a*)/*k*!.

```{code-cell} sage
p = taylor(sin(x), x, 0, 7)
a = p(x=1)
b = n(a)
c = n(sin(1))
plot(sin(x), (x, -4, 4), color='black') + plot(p, (x, -4, 4), color='red', ymin=-2, ymax=2)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/09-series-3.json","config":{"titulo":"El seno como polinomio","etiqueta":"taylor · grado 7","idea":"p es x − x³/6 + x⁵/120 − x⁷/5040. En x = 1 da 4241/5040, que coincide con sen 1 en cinco cifras. En el dibujo, el polinomio rojo se pega al seno negro cerca de 0 y se separa al alejarse.","columnas":["a","b","c"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `p` vale `-1/5040*x^7 + 1/120*x^5 - 1/6*x^3 + x`: los cuatro primeros términos de la serie del seno. Sage los escribe empezando por el de mayor grado.
- `a` vale `4241/5040`: el polinomio en *x* = 1, una fracción exacta.
- `b` vale `0.841468253968254` y `c`, el seno de verdad, `0.841470984807897`. Coinciden en las cinco primeras cifras decimales.
- El dibujo enseña por qué: cerca de 0, la curva roja (el polinomio) y la negra (el seno) no se distinguen. Lejos de 0, en ±4, el polinomio se escapa.

Con más grado, el polinomio se pega al seno en un trozo más largo. Las bibliotecas matemáticas de los ordenadores calculan el seno, la exponencial o el logaritmo con polinomios bien elegidos: no exactamente los de Taylor, pero de la misma familia.

::::{div}
:class: afondo
### 4 · Taylor lejos del centro

El polinomio de Taylor de sen *x* mejora en todas partes al subir el grado. Pero no todas las funciones son así. Mira el logaritmo log(1 + *x*) alrededor de 0, en *x* = 1/2 y en *x* = 2, con grados 5, 10 y 20.

```{code-cell} sage
D = [5, 10, 20]
A = [n(taylor(log(1 + x), x, 0, d)(x=1/2)) for d in D]
B = [n(taylor(log(1 + x), x, 0, d)(x=2)) for d in D]
a = n(log(3/2))
b = n(log(3))
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/09-series-4.json","config":{"titulo":"Más grado, peor resultado","etiqueta":"taylor · radio de convergencia","idea":"En x = 1/2, subir el grado acerca el polinomio a log(3/2). En x = 2 pasa lo contrario: 5,07, luego −64,8, luego −34 359. La serie de log(1 + x) solo converge si −1 < x ≤ 1: su radio de convergencia es 1, y 2 está fuera.","columnas":["a","b"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `A` vale `[0.407291666666667, 0.405434647817460, 0.405465092734177]`: con cada grado, más cerca de `a`, el valor de verdad, `0.405465108108164`.
- `B` vale `[5.06666666666667, -64.8253968253968, -34359.7080921143]`. El valor de verdad es `b`, `1.09861228866811`, y el polinomio se aleja cada vez más, cambiando de signo.

La serie de log(1 + *x*) es *x* − *x*²/2 + *x*³/3 − … En *x* = 2, sus términos son 2^*k*/*k*: en vez de hacerse pequeños, crecen sin límite. La serie solo converge cuando −1 < *x* ≤ 1, un intervalo de **radio** 1 alrededor del centro. Fuera de ese **radio de convergencia**, un polinomio de Taylor con más grado no ayuda: empeora.

En *x* = 1, en el borde, la serie converge (despacio) a log 2: es la armónica alternada del apartado 2.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La serie de los cuadrados, la armónica y el polinomio de Taylor de sen *x* (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13 con Symbolics 7.49):

| | Sage | Python con SymPy | Julia con Symbolics |
|---|---|---|---|
| Σ 1/*k*² | `sum(1/k^2, k, 1, oo)` da `1/6*pi^2` | `summation(1/k**2, (k, 1, oo))` da `pi**2/6` | sin sumas infinitas exactas: `sum(1/k^2 for k in 1:10^6)` da un decimal |
| La armónica | `ValueError: Sum is divergent.` | `oo`, sin error | — |
| Taylor de sen *x* | `taylor(sin(x), x, 0, 7)` | `series(sin(x), x, 0, 8)` | `taylor(sin(x), x, 0, 0:7)` |
| Resultado | `-1/5040*x^7 + 1/120*x^5 - 1/6*x^3 + x` | `x - x**3/6 + x**5/120 - x**7/5040 + O(x**8)` | `x - (1//6)*(x^3) + (1//120)*(x^5) - (1//5040)*(x^7)` |

Sage para con un error ante una suma que diverge; SymPy contesta `oo`. SymPy escribe además el término `O(x**8)`, que recuerda que lo que falta empieza en *x*⁸ (en SymPy, el último número es el primer grado que **no** se incluye). Symbolics escribe las fracciones con `//`, la barra de los racionales de Julia.
:::

## Conexiones

- Las sumas parciales son la versión discreta de las sumas de Riemann del capítulo 8, y la convergencia es el límite del capítulo 6 aplicado a una sucesión.
- Los coeficientes de Taylor son las derivadas del capítulo 7 divididas por factoriales. Con `taylor` se ve de un golpe.
- Las series vuelven en las ecuaciones diferenciales del capítulo 11, donde muchas soluciones solo se pueden escribir como serie.
- π²/6 aparece también en teoría de números: la probabilidad de que dos enteros elegidos al azar sean primos entre sí es 6/π².

## La grieta

El polinomio de Taylor de sen *x* se acerca al seno; ¿y si queremos el punto exacto donde una función vale 0? Para *x*² − 2 = 0 la respuesta es √2, pero ¿y para *x*⁵ − *x* − 1 = 0, o para un sistema de tres ecuaciones con tres incógnitas? Resolver es el capítulo 10, **Ecuaciones y sistemas**, con `solve` para las soluciones exactas y `find_root` para las numéricas.

## Ejercicios

1. **Una suma finita.** ¿Cuánto valen `sum(k, k, 1, 100)` y `sum(k^2, k, 1, 10)`?

2. **Otra geométrica.** ¿Cuánto vale `sum(1/3^k, k, 0, oo)`? ¿Y `sum(2^k, k, 0, oo)`?

3. **Los cuartos.** ¿Cuánto vale `sum(1/k^4, k, 1, oo)`?

4. **Taylor del coseno.** ¿Qué da `taylor(cos(x), x, 0, 6)`? ¿Qué potencias de *x* aparecen y cuáles no?

5. **Taylor de la exponencial.** ¿Qué da `taylor(exp(x), x, 0, 5)`? Evalúalo en *x* = 1 con `n()` y compáralo con `n(e)`.

6. **Traza a mano.** ¿Qué escribe este programa?

   ```sage
   t = 0
   for k in [1..4]:
       t = t + 1/(k*(k + 1))
       print(t)
   ```

::::{div}
:class: afondo
7. **Otro centro.** ¿Qué da `taylor(sin(x), x, pi, 3)`? ¿Por qué aparece `(pi - x)`?

8. **En el borde.** Con el programa del apartado 4, cambia `x=2` por `x=1`. ¿Se acerca el polinomio a `n(log(2))` al subir el grado? ¿Rápido o despacio?
::::

## Solucionario

1. `5050` y `385`.
2. `3/2` y un error: `ValueError: Sum is divergent.` La razón es 2: los términos crecen.
3. `1/90*pi^4`. Euler también la calculó.
4. `-1/720*x^6 + 1/24*x^4 - 1/2*x^2 + 1`. Solo aparecen potencias pares: el coseno es una función par, cos(−*x*) = cos *x*.
5. `1/120*x^5 + 1/24*x^4 + 1/6*x^3 + 1/2*x^2 + x + 1`. En *x* = 1 da `2.71666666666667`, y `n(e)` es `2.71828182845905`: coinciden en dos cifras decimales.
6. `1/2`, `2/3`, `3/4` y `4/5`. Cada término es 1/*k* − 1/(*k* + 1), así que la suma se **telescopa**: queda 1 − 1/(*n* + 1), que tiende a 1.

::::{div}
:class: afondo
7. `pi - 1/6*(pi - x)^3 - x`. Alrededor de π, el polinomio se escribe con potencias de *x* − π; Sage lo ordena a su manera y escribe `(pi - x)`.
8. Sí, pero despacio y dando saltos: con grados 5, 10 y 20, el polinomio da `0.783333333333333`, `0.645634920634921` y `0.668771403175428`, por encima y por debajo de log 2, que es `0.693147180559945`. En el borde del radio de convergencia, la serie converge, pero cada término solo mejora un poco el resultado.
::::
