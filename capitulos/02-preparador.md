---
title: El preparador
subtitle: Lo que Sage hace con tu código antes de que Python lo vea
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Copia estas dos líneas en Python, en el libro de Python o en cualquier intérprete:

```python
7^2
1/3
```

Python contesta `5` y `0.3333333333333333`. Escríbelas ahora en Sage: contesta `49` y `1/3`. Y sin embargo Sage es Python por dentro: cada programa de Sage acaba ejecutándolo Python. ¿Cómo puede el mismo texto dar resultados distintos?

## La pregunta

¿Qué le pasa a tu código entre el momento en que lo escribes y el momento en que Python lo ejecuta? ¿Y qué consecuencias tiene?

## La idea

Antes de ejecutar nada, Sage pasa tu código por el **preparador** (*preparser*, en inglés): un traductor de texto a texto que convierte la forma de escribir de la pizarra en Python. Las tres reglas que más se notan:

| Escribes | El preparador escribe | Por qué |
|---|---|---|
| `7` | `Integer(7)` | cada número entero pasa a ser un entero de Sage, de `ZZ` |
| `0.5` | `RealNumber('0.5')` | cada decimal pasa a ser un decimal de Sage, de `RR` |
| `7^2` | `Integer(7)**Integer(2)` | `^` es la potencia, que en Python se escribe `**` |
| `[1..5]` | `(ellipsis_range(Integer(1),Ellipsis,Integer(5)))` | la lista de los números del 1 al 5 |

Después, Python ejecuta el texto traducido. `1/3` llega a Python como `Integer(1)/Integer(3)`: una división entre dos enteros de Sage, que da la fracción exacta.

:::{important} El preparador no calcula
El preparador solo cambia texto: no sabe qué vale ninguna variable ni ejecuta nada. Por eso traduce igual `7^2` que `a^b`: los dos pasan a `**`. Lo que pase después lo decide Python, con los números de Sage que el preparador ha puesto.
:::

## Construcción

### 1 · Ver la traducción

Los visualizadores del libro enseñan la traducción de cada línea en el recuadro **El preparador de Sage la reescribe así**. Pero no hace falta un visualizador para verla: el preparador es una función de Sage, `preparse()`. Le das un texto y te devuelve otro texto, el código traducido.

```{code-cell} sage
a = preparse("2^10 + 1/3")
b = preparse("x = 0.5")
c = preparse("[1..5]")
d = preparse("print('2^10')")
a
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/02-preparador-1.json","config":{"titulo":"El traductor, a la vista","etiqueta":"preparse() · texto a texto","idea":"preparse() recibe un texto y devuelve el código traducido, también como texto: mira que a, b, c y d son str. Fíjate en d: lo que va entre comillas no se toca.","columnas":["a","b"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

Los cuatro resultados son textos (`str`): `preparse()` no ejecuta el código, solo lo traduce. En `d`, lo que hay entre comillas se queda igual: `'2^10'` es un texto, no una cuenta, y el preparador lo respeta. Por eso `print('2^10')` escribe `2^10` tal cual.

### 2 · La potencia, y el `^` de Python

En Python, `^` no es la potencia: es el **o exclusivo bit a bit**, una operación con las cifras binarias de los números. `7` en binario es `111` y `2` es `010`; el o exclusivo pone un 1 donde las cifras son distintas y da `101`, que es `5`. Por eso Python contesta `5` a `7^2`.

En matemáticas `^` es la potencia, así que Sage cambia el significado: el preparador convierte `^` en `**`. Y por si alguna vez necesitas el o exclusivo, en Sage se escribe `^^`.

:::{tip} Predice
`7r` es un 7 «crudo»: la `r` le dice al preparador que no lo convierta en entero de Sage. ¿Qué dará `1r/3r`: la fracción `1/3` o el decimal de Python `0.3333333333333333`?
:::

```{code-cell} sage
p = 7^2
q = 7^^2
r = 7**2
s = 7r^2
t = 1r/3r
u = 7r/2
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/02-preparador-2.json","config":{"titulo":"Potencias, o exclusivo y números crudos","etiqueta":"^ · ^^ · r","idea":"^ y ** son la potencia; ^^ es el o exclusivo de Python. Con la r, el número se queda en Python: 1r/3r es una división de Python y da un float. Pero basta un número de Sage, como el 2 de 7r/2, para volver a la fracción.","columnas":["p","q","s","t","u"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `p` y `r` valen `49`: `^` y `**` son la misma potencia.
- `q` vale `5`: el o exclusivo de siempre, con `^^`.
- `s` vale `49`, pero con la etiqueta gris `int`: los dos números eran de Python, porque el 7 era crudo, y la cuenta la hizo Python.
- `t` vale `0.3333333333333333`, un `float` de Python. Sin números de Sage, `/` vuelve a ser la división de Python.
- `u` vale `7/2`, en `QQ`. El 7 era crudo, pero el 2 no: el preparador lo convirtió en `Integer(2)`, y al dividir un entero de Python entre uno de Sage, Sage convierte el de Python y da la fracción.

Los números crudos sirven para pocas cosas, pero explican mucho. Son la forma de ver, dentro de Sage, cómo se comportaría Python sin el preparador.

### 3 · Rangos con los dos extremos

En matemáticas, «del 1 al 5» incluye el 5. En Python, `range(1, 5)` se queda en el 4. Sage añade una forma de escribir más cercana a la pizarra:

- `[a..b]` es la lista de los enteros de `a` a `b`, **los dos incluidos**.
- `[a, b..c]` empieza en `a`, avanza de `b - a` en `b - a` y no pasa de `c`.

```{code-cell} sage
L = [1..5]
M = [2, 4..12]
N = [10, 7..0]
n = len([1..100])
p = sum([1..100])
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/02-preparador-3.json","config":{"titulo":"Del 1 al 5, con el 5","etiqueta":"[a..b] · [a, b..c]","idea":"[1..5] incluye el 5. [2, 4..12] avanza de 2 en 2 y [10, 7..0] baja de 3 en 3 sin pasar de 0, así que termina en 1.","columnas":["n","p"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

`M` va de 2 en 2 hasta el 12. `N` baja de 3 en 3 desde el 10: 10, 7, 4 y 1, porque el siguiente, −2, ya pasaría del 0. Y la suma de Gauss sale sola: `sum([1..100])` da `5050`.

Los elementos de `L` son enteros de Sage: en el recuadro del preparador se ve que los extremos llegan a Python como `Integer(1)` e `Integer(5)`, y `ellipsis_range` construye la lista con enteros de Sage. En cambio `n`, que viene de `len()`, lleva la etiqueta gris `int`: es un entero de Python, como en el capítulo anterior.

Con paréntesis, `(1..5)`, el preparador escribe `ellipsis_iter` en lugar de `ellipsis_range`: los números se generan de uno en uno, cuando se piden, sin guardar la lista entera. Para verlos todos, `list((1..5))` da `[1, 2, 3, 4, 5]`.

::::{div}
:class: afondo
### 4 · Dónde actúa el preparador

El preparador actúa en todos los sitios donde escribes Sage: la consola, los cuadernos de Jupyter con Sage, SageMathCell y los ficheros con extensión **`.sage`**. Al ejecutar un fichero `.sage`, Sage lo traduce entero, y lo hace de una forma un poco distinta: cada número que se repite se crea una sola vez, al principio.

```{code-cell} sage
from sage.repl.preparse import preparse_file
texto = "a = 2^10\nb = a + 1\n"
print(preparse_file(texto))
```

`preparse_file()` no viene cargada de serie, por eso la primera línea la importa. El programa escribe esto:

```text
_sage_const_2 = Integer(2); _sage_const_10 = Integer(10); _sage_const_1 = Integer(1)
a = _sage_const_2 **_sage_const_10 
b = a + _sage_const_1 
```

En cambio, el preparador **no actúa** en los ficheros `.py`. Si escribes un módulo de Python que usa Sage, empiezas con `from sage.all import *` y escribes Python: `Integer(2)**10` en lugar de `2^10`, y `QQ(1)/3` en lugar de `1/3`. Así se usa Sage desde un programa de Python, por ejemplo con passagemath, la versión de Sage que se instala con `pip`.

El preparador tiene alguna opción más. La más curiosa es la **multiplicación implícita**: con `implicit_multiplication(True)`, el preparador acepta `2x + 3y` y lo traduce a `Integer(2)*x + Integer(3)*y`, como en la pizarra. Viene apagada, porque es fácil equivocarse con ella, y se apaga con `implicit_multiplication(False)`.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Cómo se escriben la potencia, un tercio y un rango con los dos extremos:

| | Sage | Python | Julia |
|---|---|---|---|
| 2 elevado a 10 | `2^10` o `2**10` | `2**10` (`2^10` da `8`) | `2^10` |
| Un tercio, exacto | `1/3` | `Fraction(1, 3)` | `1//3` |
| `1/3` sin más | la fracción `1/3` | `0.3333333333333333` | `0.3333333333333333` |
| Del 1 al 5 | `[1..5]` | `list(range(1, 6))` | `collect(1:5)` |

Julia y Sage escriben la potencia como en la pizarra, cada uno a su manera: Julia porque su `^` es la potencia desde el principio, y Sage porque el preparador la traduce. Python reserva `^` para el o exclusivo.
:::

## Conexiones

- El preparador hace mucho más que lo visto aquí. `f(x) = x^2` define una función matemática, y `R.<t> = PolynomialRing(QQ)` crea un anillo de polinomios con su variable. Los verás en los capítulos 4 y 18.
- Los enteros de Sage que pone el preparador son los que hacen exactas las cuentas del capítulo 1. La parte V cuenta qué son por dentro.
- Los rangos `[a..b]` volverán en los bucles y en las sumas de las partes II y IV.

## La grieta

En el capítulo 1, `pi` y `sqrt(2)` no se convertían en decimales: Sage los guardaba como el número π y la raíz de 2, exactos. Y el preparador traduce `f(x) = x^2` creando una «variable» `x` que no tiene ningún valor. ¿Qué clase de objeto es esa `x`, y qué se puede hacer con ella? En el capítulo siguiente, **Variables simbólicas y expresiones**, Sage empieza a hacer álgebra.

## Ejercicios

1. **Leer la traducción.** ¿Qué devuelve `preparse("3^2^2")`? ¿Cuánto vale `3^2^2`: 81 o 6561?

2. **El o exclusivo.** ¿Qué da `2^10` en Python? ¿Y `2^^10` en Sage? Explica por qué coinciden.

3. **Rangos.** Escribe con `[a, b..c]` la lista de los múltiplos de 5 del 0 al 30. ¿Cuántos elementos tiene `[1..100]`?

4. **¿De quién es cada número?** ¿Qué dan `type(2)` y `type(2r)`? ¿Y `2r/4` y `2r/4r`?

5. **Traza a mano.** ¿Qué valen `b` y `c`, y de qué tipo son?

   ```sage
   a = 10r
   b = a / 4
   c = a / 4r
   ```

6. **Lo que no se traduce.** ¿Qué escribe `print("1/3 vale", 1/3)`? ¿Por qué el primer `1/3` no se convierte en una fracción?

::::{div}
:class: afondo
7. **El fichero entero.** ¿Qué diferencia hay entre lo que escriben `preparse("a = 2 + 2")` y `print(preparse_file("a = 2 + 2"))`? (Recuerda importar antes `preparse_file`).

8. **Multiplicación implícita.** Con `implicit_multiplication(True)`, ¿qué devuelve `preparse("2x + 1")`? Apágala después con `implicit_multiplication(False)`.
::::

## Solucionario

1. `'Integer(3)**Integer(2)**Integer(2)'`, y vale `81`. La potencia se agrupa de derecha a izquierda: es `3^(2^2)` = `3^4`, no `(3^2)^2`.
2. `8` en los dos. En binario, 2 es `0010` y 10 es `1010`; el o exclusivo da `1000`, que es 8. En Python se escribe `^`; en Sage, `^^`, porque `^` ya es la potencia.
3. `[0, 5..30]`, que da `[0, 5, 10, 15, 20, 25, 30]`. Y `len([1..100])` da `100`: los dos extremos cuentan.
4. `<class 'sage.rings.integer.Integer'>` y `<class 'int'>`. `2r/4` da la fracción `1/2`, porque el 4 es de Sage; `2r/4r` da `0.5`, un `float`, porque los dos son de Python.
5. `b` vale `5/2`, en `QQ`: el 4 lo convierte el preparador en entero de Sage. `c` vale `2.5`, un `float` de Python: los dos números son crudos.
6. Escribe `1/3 vale 1/3`. El primer `1/3` está entre comillas: es un texto, y el preparador no toca los textos. El segundo es código, y da la fracción.

::::{div}
:class: afondo
7. `preparse("a = 2 + 2")` da `'a = Integer(2) + Integer(2)'`. `preparse_file` crea el 2 una sola vez, en una primera línea, `_sage_const_2 = Integer(2)`, y en la segunda escribe `a = _sage_const_2  + _sage_const_2`.
8. `'Integer(2)*x + Integer(1)'`.
::::
