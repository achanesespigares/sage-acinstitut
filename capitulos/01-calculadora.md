---
title: Sage como calculadora exacta
subtitle: Enteros, fracciones y decimales, cada uno con su padre
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Teclea 2^100 en una calculadora científica. Lo normal es que conteste algo como 1,2676506 × 10³⁰: un número de 31 cifras convertido en ocho. Las otras 23 se han perdido por el camino, y la calculadora no avisa. Con 1/3 pasa lo mismo: en la pantalla aparece 0,3333333, que no es un tercio, sino un número un poco más pequeño.

Para hacer la compra da igual. Para hacer matemáticas, no: un tercio es un tercio, y 2¹⁰⁰ tiene sus 31 cifras.

## La pregunta

¿Se puede calcular **sin perder nada**, ni una cifra de un número enorme ni la exactitud de una fracción? ¿Y qué hacer cuando lo que se quiere es, precisamente, un número aproximado?

## La idea

Sage calcula **exacto por defecto**. Un entero puede tener tantas cifras como haga falta. Una división entre enteros da una **fracción**, simplificada, no un decimal. Solo cuando escribes un número con punto decimal, o se lo pides con `n()`, Sage pasa a los **aproximados**.

Y cada valor sabe a qué conjunto de números pertenece. Sage lo llama su **padre**:

| Padre | Qué contiene | Ejemplos |
|---|---|---|
| `ZZ` | los enteros, sin tamaño máximo | `7`, `-3`, `2^100` |
| `QQ` | los racionales, como fracciones simplificadas | `7/2`, `1/3`, `-5/8` |
| `RR` | los reales aproximados, con 53 bits de precisión | `0.5`, `3.14159265358979` |

Los nombres vienen de las letras de la pizarra: ℤ, ℚ y ℝ, escritas con dos letras porque el teclado no tiene las de doble trazo.

:::{important} El punto decimal cambia de mundo
`1/3` es la fracción un tercio, exacta, en `QQ`. `1/3.` (con el punto) es 0.333333333333333, un decimal aproximado en `RR`. Un solo punto decide si Sage calcula exacto o aproximado.
:::

## Construcción

### 1 · Las operaciones

Los operadores son los de siempre. La potencia se escribe con `^`, como en la pizarra: `7^2` da `49`. Para la división hay tres:

- `/` es la división de verdad: entre enteros da una fracción, no un decimal.
- `//` da el cociente entero.
- `%` da el resto.

```{code-cell} sage
a = 7 + 2
b = 7 / 2
c = 7^2
d = 7 // 2
r = 7 % 2
g = 2^100
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/01-calculadora-1.json","config":{"titulo":"Las operaciones, exactas","etiqueta":"operadores · ZZ y QQ","idea":"Mira la etiqueta de cada resultado. 7 / 2 no da 3.5: da la fracción 7/2, en QQ. Y 2^100 sale entero, con sus 31 cifras, en ZZ.","columnas":["a","b","d","r"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

`b` vale `7/2`, en `QQ`. Sage no ha redondeado ni ha convertido la división en decimal: ha guardado la fracción. `d` y `r` son el cociente y el resto de dividir 7 entre 2: 3 y 1, porque 7 = 2 · 3 + 1. Y `g` tiene sus 31 cifras: 1267650600228229401496703205376.

Fíjate también en el recuadro del preparador. Escribes `7^2` y Sage lo reescribe como `Integer(7)**Integer(2)` antes de ejecutarlo. En el capítulo siguiente verás por qué hace falta esa traducción.

El orden de las operaciones es el de siempre: primero las potencias, después los productos y las divisiones, y al final las sumas. `2 + 3*4^2` da `50`, y `-2^2` da `-4`, porque la potencia va antes que el signo menos. Si quieres otro orden, usa paréntesis: `(2 + 3)*4` da `20`.

### 2 · Fracciones exactas

Con las fracciones, Sage hace lo que harías en la libreta: busca el denominador común, opera y simplifica.

:::{tip} Predice
`4/2` vale 2. Pero ¿qué padre tiene: `ZZ`, porque 2 es un entero, o `QQ`, porque viene de una división?
:::

```{code-cell} sage
a = 1/3
b = a + 1/6
c = b * 6
d = 4/2
e = d + 1
parent(d)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/01-calculadora-2.json","config":{"titulo":"Fracciones que no se redondean","etiqueta":"QQ · simplificar","idea":"1/3 + 1/6 da 1/2, simplificada. Y 4/2 vale 2, pero sigue en QQ: el padre depende de la operación, no de que el resultado parezca entero.","columnas":["a","b","c","d"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

`1/3 + 1/6` da `1/2`: Sage ha sumado los sextos y ha simplificado. `c` vale `3`, exacto, sin el 2,9999999 de la calculadora.

Y `d` vale `2`, pero en `QQ`. La división de dos enteros da siempre un racional, aunque el resultado sea entero, y `parent(d)` lo confirma: *Rational Field*, el nombre completo de `QQ`. Casi nunca importa, porque el 2 de `QQ` y el 2 de `ZZ` son el mismo número y Sage los trata igual. Pero hay operaciones que solo tienen sentido con enteros, como factorizar, y entonces conviene saber dónde vive cada número. Para pasarlo a `ZZ` basta con `ZZ(d)`.

### 3 · Decimales, cuando hacen falta

A veces lo que quieres es justamente el decimal: para comparar tamaños, para medir, para dibujar. Sage lo da cuando se lo pides.

- `n(x)` o `x.n()` da el valor aproximado de `x`. Es la `n` de *numérico*.
- Un número escrito con punto decimal ya es aproximado: `0.5`, `1/3.`, `1e3`.

```{code-cell} sage
q = 1/3
x = q.n()
y = n(2/3)
z = q + 0.5
w = 1/3.
q == x
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/01-calculadora-3.json","config":{"titulo":"De QQ a RR","etiqueta":"n() · decimales","idea":"n() convierte una fracción en un decimal de RR, con 15 cifras. Al sumar una fracción y un decimal, el resultado es decimal: Sage pasa los dos al padre más amplio.","columnas":["q","x","z","w"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

Sage escribe los decimales de `RR` con **15 cifras significativas**, sin quitar los ceros del final: `n(1/2)` da `0.500000000000000`. Es su manera de recordarte que el número es aproximado y cuánta precisión tiene. Por eso `y` sale `0.666666666666667`: la última cifra está redondeada.

`z` es la suma de una fracción y un decimal, y da un decimal: `0.833333333333333`, en `RR`. Sage no puede guardar el resultado en `QQ`, porque `0.5` ya es aproximado, así que pasa la fracción a decimal y suma. Y la última línea, `q == x`, da `True`: para comparar, Sage también pasa `q` a decimal.

Para más cifras se pide la precisión. `n(1/3, digits=30)` da `0.333333333333333333333333333333`, y con `pi`, que Sage guarda como el número π exacto, `n(pi, digits=50)` da sus 50 primeras cifras: `3.1415926535897932384626433832795028841971693993751`. Este programa ya no lo dibuja el laboratorio del navegador; pulsa **Sage real** en cualquiera de los visualizadores y escríbelo allí.

### 4 · Mezclar enteros, fracciones y decimales

Cuando una operación mezcla números de padres distintos, Sage los lleva al padre más amplio de los dos, siguiendo la cadena `ZZ` → `QQ` → `RR`. Entero con fracción da fracción; cualquier cosa con un decimal da decimal. Esta conversión se llama **coerción**, y la parte V del libro la estudia a fondo.

Hay un caso que conviene conocer desde ya. Sage es Python por dentro, y algunas funciones de Python devuelven números de Python, no de Sage. La más habitual es `len()`, que cuenta los elementos de una lista.

```{code-cell} sage
L = [10, 20, 30]
n = len(L)
media = sum(L) / n
media
k = n / 4
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/01-calculadora-4.json","config":{"titulo":"Un número de Python entre los de Sage","etiqueta":"coerción · int","idea":"len() es de Python y devuelve un int: mira su etiqueta gris. Al operar con números de Sage, el int se convierte solo, y n / 4 vuelve a dar una fracción exacta.","columnas":["n","media","k"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

`n` vale 3, con la etiqueta gris `int`: es un entero de Python. Pero en cuanto se opera con números de Sage, se convierte solo. `sum(L) / n` da `20`, y `n / 4` da `3/4`, una fracción exacta, en `QQ`. En Python puro, `3 / 4` daría `0.75`.

::::{div}
:class: afondo
### 5 · Cómo guarda Sage cada número

Detrás de cada padre trabaja una biblioteca especializada, y el recuadro **Quién hace el cálculo** de los visualizadores dice cuál:

- Los enteros de `ZZ` los guarda **GMP**, una biblioteca de aritmética con números de cualquier tamaño. Un entero ocupa tanta memoria como cifras tiene, y por eso `2^100` o `factorial(30)` (265252859812191058636308480000000) salen completos.
- Las fracciones de `QQ` son dos enteros de GMP, el numerador y el denominador, siempre simplificados.
- Los decimales de `RR` los calcula **MPFR**, una biblioteca de números aproximados con la precisión que se pida. Por defecto, 53 bits: los mismos que un decimal de Python o de Julia, unas 15 o 16 cifras.

Con 53 bits, muchos decimales sencillos, como 0,1, no tienen representación exacta en binario. Y aquí Sage tiene una trampa propia:

```{code-cell} sage
a = 0.1 + 0.2
b = 0.3
a == b
a - b
c = 1/10 + 2/10
c == 3/10
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/01-calculadora-5.json","config":{"titulo":"0.1 + 0.2 no es 0.3, aunque lo parezca","etiqueta":"a fondo · RR","idea":"a y b se escriben igual, 0.300000000000000, pero a == b da False: son decimales distintos a partir de la cifra 17. Con fracciones, la cuenta es exacta.","columnas":["a","b","c"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

`a` y `b` se escriben igual, `0.300000000000000`, y sin embargo `a == b` da `False`. Sage enseña 15 cifras, pero guarda algo más: `a` es en realidad 0.30000000000000004 y `b` es 0.29999999999999999 (con 17 cifras). La diferencia, `a - b`, es `5.55111512312578e-17`, diminuta pero no cero. Julia o Python escriben `0.30000000000000004` y así avisan; Sage redondea al escribir y la diferencia queda escondida. La lección es la misma en todos los lenguajes: **no compares decimales con `==`**.

Con fracciones, el problema desaparece: `1/10 + 2/10 == 3/10` da `True`, porque las tres son exactas. Y si necesitas decimales con más precisión, Sage tiene otros padres: `RealField(100)` trabaja con 100 bits, y `RealField(100)(1/3)` da `0.33333333333333333333333333333`.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Fracciones exactas y números grandes:

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| Un tercio más un sexto | `1/3 + 1/6` da `1/2` | `Rational(1, 3) + Rational(1, 6)` da `1/2` | `1//3 + 1//6` da `1//2` |
| ¿Y sin decirlo? | `1/3 + 1/6` ya es exacto | `1/3 + 1/6` da `0.5` | `1/3 + 1/6` da `0.5` |
| 2¹⁰⁰ | `2^100` da las 31 cifras | `2**100` da las 31 cifras | `2^100` da `0`; hace falta `big(2)^100` |
| Pasar a decimal | `n(1/3)` da `0.333333333333333` | `N(Rational(1, 3))` da `0.333333333333333` | `float(1//3)` da `0.3333333333333333` |

Los tres saben calcular exacto, pero solo Sage lo hace sin que se lo pidas. En Python y en Julia, `/` da un decimal y hay que escribir las fracciones de otra forma. Con los enteros grandes, Python y Sage no tienen límite, y Julia, por velocidad, da la vuelta al pasar de 64 bits.
:::

## Conexiones

- Los **padres** son la idea central de Sage. Aquí has visto tres, `ZZ`, `QQ` y `RR`; en el libro aparecerán más: el anillo simbólico `SR` en la parte II, los cuerpos finitos `GF(p)` en la III, los anillos de polinomios en la IV.
- La **coerción**, el paso automático de un padre a otro, tiene sus reglas, y la parte V las cuenta.
- El **cociente y el resto** (`//` y `%`) son la base de la divisibilidad, de los números primos y de las congruencias, en la parte IV.

## La grieta

Sage es Python por dentro. Pero en Python `7^2` no es una potencia, sino otra operación que da `5`, y `1/3` es un decimal, `0.3333333333333333`. ¿Cómo puede el mismo código dar `49` y una fracción exacta en Sage? Algo cambia tu programa antes de que Python lo vea. En el capítulo siguiente, **El preparador**, verás quién es y qué hace.

## Ejercicios

1. **El cociente y el resto.** ¿Qué dan `17 // 5` y `17 % 5`? Comprueba que `5 * (17 // 5) + 17 % 5` vuelve a dar 17.

2. **El orden de las operaciones.** Predice y después comprueba: `2 + 3*4^2`, `(2 + 3)*4` y `-2^2`.

3. **¿Qué padre?** Di el padre de cada resultado antes de comprobarlo con `parent()`: `6/3`, `6//3`, `6/3.`, `2^10` y `2^-1`.

4. **Una suma exacta.** Calcula 1/2 + 1/3 + 1/4 + 1/5 + 1/6 como fracción y después su valor aproximado.

5. **Traza a mano.** ¿Qué escribe la última línea, y en qué padre está?

   ```sage
   a = 3
   b = a / 4
   c = b + 0.25
   c
   ```

6. **Cifras de verdad.** ¿Cuántas cifras tiene 2¹⁰⁰⁰? (Pista: `len(str(2^1000))`).

::::{div}
:class: afondo
7. **Comparar decimales.** `0.1 + 0.2 == 0.3` da `False`. Escribe una comparación que diga que «son iguales salvo una tolerancia» de una billonésima.

8. **Exacto contra aproximado.** Calcula `(1/3)^20` y `(1/3.)^20`. ¿Qué diferencia hay entre los dos resultados?
::::

## Solucionario

1. `3` y `2`. `5 * 3 + 2` da `17`: es la división entera de toda la vida, dividendo = divisor · cociente + resto.
2. `50`, `20` y `-4`. En `-2^2` la potencia va antes que el signo menos: es `-(2^2)`.
3. `6/3` da `2` en `QQ` (es una división); `6//3` da `2` en `ZZ` (el cociente entero); `6/3.` da `2.00000000000000` en `RR` (hay un decimal); `2^10` da `1024` en `ZZ`; y `2^-1` da `1/2` en `QQ`.
4. `1/2 + 1/3 + 1/4 + 1/5 + 1/6` da `29/20`, y `n(29/20)` da `1.45000000000000`.
5. `0.500000000000000`, en `RR`. `b` vale `3/4`, en `QQ`; al sumarle `0.25`, que es un decimal, el resultado pasa a `RR`.
6. 302 cifras: `len(str(2^1000))` da `302`. `str()` convierte el número en texto y `len()` cuenta sus caracteres.

::::{div}
:class: afondo
7. Por ejemplo, `abs((0.1 + 0.2) - 0.3) < 10^-12`, que da `True`.
8. `(1/3)^20` da la fracción exacta `1/3486784401`, en `QQ`. `(1/3.)^20` da `2.86797199079244e-10`, un decimal de `RR` con 15 cifras: el mismo número, aproximado.
::::
