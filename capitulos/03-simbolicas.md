---
title: Variables simbólicas y expresiones
subtitle: Cuando la x no tiene valor y Sage, aun así, hace álgebra
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

En Python, en el libro de Python o en cualquier intérprete, escribe esto:

```python
p = (x + 1)**2
```

Python contesta con un error: `NameError: name 'x' is not defined`. Para Python, una variable es un nombre con un valor guardado, y `x` no tiene ninguno.

Escríbelo ahora en Sage, con `^`: `p = (x + 1)^2`. No hay error, y `p` vale `(x + 1)^2`. Pide después `expand(p)` y Sage contesta `x^2 + 2*x + 1`: ha hecho álgebra con una `x` que no vale nada.

## La pregunta

¿Qué es esa `x` sin valor? ¿Qué hace Sage con ella por su cuenta, y qué hace solo cuando se lo pides?

## La idea

En Sage, `x` es una **variable simbólica**: un objeto que representa una letra, la *x* de la pizarra. No guarda ningún número, y por eso cada cuenta con ella da una **expresión**, otro objeto que guarda la fórmula entera.

- **`x` viene de serie.** Cualquier otra letra hay que pedirla con `var`: `var('y')`.
- **Todas viven en el mismo padre, SR,** el **anillo simbólico** (*Symbolic Ring*). Las variables, las expresiones y también `pi` o `sqrt(2)`.
- **Las cuentas con expresiones las hace Pynac,** la biblioteca de cálculo simbólico que lleva Sage dentro. Para algunas transformaciones, Sage llama a **Maxima**, un programa de álgebra heredero de Macsyma, que nació en el MIT a finales de los años sesenta.

Al construir una expresión, Pynac la ordena y junta lo evidente: `x + x` pasa a ser `2*x`. Lo que cuesta trabajo, como desarrollar un cuadrado o factorizar, lo hace solo cuando se lo pides.

## Construcción

### 1 · La x de la pizarra

En el visualizador, mira la etiqueta de padre de cada variable: todas dicen `SR`. Y mira el recuadro **Quién hace el cálculo**: desde ahora aparece Pynac.

```{code-cell} sage
p = 2*x + 3*x
q = x*x
r = p + q - 5*x
var('y')
s = x + y
parent(s)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/03-simbolicas-1.json","config":{"titulo":"Álgebra con una x sin valor","etiqueta":"x · var · SR","idea":"Cada cuenta con x da una expresión de SR. Pynac junta los términos semejantes al construirla: 2*x + 3*x ya es 5*x, y en r los 5*x se cancelan. La y no existe hasta que var('y') la crea.","columnas":["p","q","r","s"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `p` vale `5*x`, no `2*x + 3*x`. Pynac junta los términos semejantes en el momento de construir la expresión.
- `q` vale `x^2`. El producto de una letra por sí misma también se agrupa solo.
- `r` vale `x^2`. Los `5*x` de `p` y de `- 5*x` se cancelan, y queda solo el cuadrado.
- `var('y')` hace dos cosas: crea la variable simbólica `y` y la guarda con el nombre `y`. Como la línea no guarda nada en ninguna variable, la consola escribe lo que devuelve: `y`.
- `s` vale `x + y`, y `parent(s)` contesta `Symbolic Ring`: el anillo simbólico, SR.

Sin la línea de `var`, `s = x + y` daría el mismo error que Python: `NameError: name 'y' is not defined`. Solo la `x` viene de serie. Para crear varias variables de una vez, `var('a b c')` devuelve `(a, b, c)` y deja las tres listas.

:::{important} Una variable simbólica no es una variable de Python
`s` es una variable de Python: un nombre que guarda un valor, la expresión `x + y`. `x` e `y` son variables simbólicas: letras dentro de esa expresión. Con `x = 5`, el nombre `x` pasa a guardar el número 5 y deja de ser la letra. Para recuperarla, `var('x')`.
:::

### 2 · Números exactos dentro de SR

En el capítulo 1, `sqrt(2)` y `pi` no se convertían en decimales. Ahora se ve por qué: son expresiones de SR, como `x + 1`, y Sage las guarda como el número exacto.

:::{tip} Predice
`sqrt(8)` es `2*sqrt(2)`, y su cuadrado vale 8. ¿En qué padre está ese 8: en `ZZ`, con los enteros, o en `SR`?
:::

```{code-cell} sage
a = sqrt(8)
b = a^2
c = pi + pi
d = n(c)
t = sin(pi/6)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/03-simbolicas-2.json","config":{"titulo":"Raíces, π y senos exactos","etiqueta":"sqrt · pi · n()","idea":"sqrt(8), pi y sin(pi/6) son expresiones de SR. Sage simplifica lo que sabe sin perder exactitud: sqrt(8) es 2*sqrt(2) y sin(pi/6) es 1/2. Pero el 8 de b sigue en SR: un número que sale de una expresión se queda en el anillo simbólico. Solo n() pasa a decimales, a RR.","columnas":["a","b","c","d","t"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `a` vale `2*sqrt(2)`. Sage saca de la raíz el factor que es un cuadrado, 4, pero no da ningún decimal.
- `b` vale `8`, con la etiqueta `SR`. Ese 8 es una expresión que, simplificada, ha quedado en un número.
- `c` vale `2*pi`, con π exacto.
- `d` vale `6.28318530717959`, en `RR`. `n()` es lo único de este programa que pasa a decimales.
- `t` vale `1/2`, también en `SR`. Sage conoce los valores exactos del seno en los ángulos de la pizarra.

Un número de SR se comporta casi siempre como el entero o la fracción que parece, pero no es lo mismo que el `8` de `ZZ`. Para pasarlo a los enteros, se convierte: `ZZ(b)` da `8`, ya en `ZZ`.

### 3 · Lo que Sage no hace por su cuenta

Al construir una expresión, Pynac junta términos semejantes, pero no desarrolla potencias, no factoriza y no simplifica fracciones. Para eso hay que pedirlo.

```{code-cell} sage
p = (x + 1)^2
q = expand(p)
r = factor(x^2 - 1)
f = (x^2 - 1)/(x - 1)
g = f.simplify_full()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/03-simbolicas-3.json","config":{"titulo":"Desarrollar, factorizar, simplificar","etiqueta":"expand · factor · simplify_full","idea":"Cada transformación hay que pedirla. expand y factor las hace Pynac; simplify_full se la encarga a Maxima. Mira el recuadro «Quién hace el cálculo» en la última línea.","columnas":["p","q","r","f","g"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `p` se queda como `(x + 1)^2`. Construir la potencia no la desarrolla.
- `expand(p)` la desarrolla: `x^2 + 2*x + 1`. Lo hace Pynac.
- `factor(x^2 - 1)` da `(x + 1)*(x - 1)`. Con un polinomio de coeficientes racionales, `factor` también es cosa de Pynac. Según la documentación de Sage, el trabajo de fondo lo hace Singular, un programa especializado en polinomios.
- `f` se queda como `(x^2 - 1)/(x - 1)`: Pynac no simplifica la fracción.
- `f.simplify_full()` da `x + 1`. Esta vez, en el recuadro **Quién hace el cálculo** aparece Maxima: Sage le pasa la expresión, Maxima la simplifica y le devuelve el resultado.

`simplify_full` solo existe como método: se escribe `f.simplify_full()`, con el punto. En cambio, `expand` y `factor` se pueden escribir de las dos maneras: `expand(p)` o `p.expand()`.

:::{warning} Simplificar no es igual de válido en todas partes
`x + 1` y `(x^2 - 1)/(x - 1)` no son exactamente lo mismo: la fracción no está definida en `x = 1`, y `x + 1` sí. `simplify_full` cancela el factor `x - 1` sin avisarte. En la pizarra escribirías: *para x ≠ 1*.
:::

### 4 · Sustituir

Una expresión no tiene valor, pero se le puede dar uno a cada letra: eso es **sustituir**. Hay dos maneras de escribirlo, y las dos hacen lo mismo: `p.subs(x=2)` y `p(x=2)`.

```{code-cell} sage
p = x^2 - 3*x + 1
a = p.subs(x=2)
b = p(x=1/2)
c = p(x=sqrt(2))
d = n(c)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/03-simbolicas-4.json","config":{"titulo":"Darle un valor a la x","etiqueta":"subs · p(x=…)","idea":"Sustituir cambia la letra por el valor y simplifica. El resultado sigue en SR aunque sea un número, y es exacto: con x = sqrt(2) sale 3 - 3*sqrt(2), sin decimales, hasta que n() los pide.","columnas":["a","b","c","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `a` vale `-1`: 4 − 6 + 1. Es un número, pero en `SR`, como el 8 de antes.
- `b` vale `-1/4`. Con `x = 1/2`, la cuenta se hace con fracciones exactas.
- `c` vale `-3*sqrt(2) + 3`. El cuadrado de `sqrt(2)` es 2, y queda 2 − 3√2 + 1, exacto.
- `d` vale `-1.24264068711929`, el decimal de `c`, en `RR`.

Las dos formas las hace Pynac, como se ve en el recuadro **Quién hace el cálculo**. Hay que nombrar la letra: `p(2)`, sin decir cuál, da un error. El mensaje de Sage lo explica: sustituir llamando sin nombre ya no está permitido; usa nombres, como `EXPR(x=..., y=...)`.

::::{div}
:class: afondo
### 5 · Ecuaciones y supuestos

En Python, `==` pregunta: `2 == 3` contesta `False`. Con expresiones simbólicas, `==` **construye una ecuación**: `x^2 == 4` no contesta nada, es un objeto de SR que guarda la igualdad. Para saber si es cierta, se le pregunta con `bool()`.

```{code-cell} sage
ec = (x + 1)^2 == x^2 + 2*x + 1
v = bool(ec)
w = bool(x^2 == 4)
r = sqrt(x^2)
assume(x > 0)
s = sqrt(x^2)
forget()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/03-simbolicas-5.json","config":{"titulo":"Igualdades que se construyen y se comprueban","etiqueta":"== · bool · assume","idea":"== construye una ecuación de SR; bool() comprueba si es cierta para todo x, y para eso Sage llama a Maxima. sqrt(x^2) no es x, porque x podría ser negativa, hasta que assume(x > 0) se lo asegura.","columnas":["v","w","r","s"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `ec` es la ecuación `(x + 1)^2 == x^2 + 2*x + 1`, con la etiqueta `SR`.
- `bool(ec)` da `True`, con la etiqueta gris `bool`: es cierta para cualquier `x`. Para comprobarlo, Sage llama a Maxima.
- `bool(x^2 == 4)` da `False`, aunque `x = 2` la cumple. `bool()` no resuelve la ecuación: contesta `True` solo si puede asegurar que es cierta para **todo** `x`, y `False` en otro caso. Para resolverla está `solve`, en la parte II.
- `r` vale `sqrt(x^2)`, sin simplificar. Si `x` fuera −3, `sqrt(x^2)` valdría 3, no −3, y Sage no se arriesga.
- `assume(x > 0)` le asegura a Sage que `x` es positiva. Con eso, `s` sí vale `x`. En cambio, `r` se queda como estaba: el supuesto cuenta para las expresiones que se construyen después, no cambia las que ya están guardadas.
- `forget()` borra los supuestos. Si no, seguirían activos en el resto de la sesión.

Con `assume(x < 0)`, `sqrt(x^2)` da `-x`. En los dos casos, Sage hace lo que en la pizarra escribirías como `|x|`.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
SymPy es la biblioteca de cálculo simbólico de Python, y Symbolics.jl la de Julia. Cómo se escriben las mismas cuentas (comprobado con Sage 10.8, SymPy 1.14 y Symbolics 7.49):

| | Sage | Python con SymPy | Julia con Symbolics |
|---|---|---|---|
| Crear la variable `y` | `var('y')` (la `x` ya existe) | `y = symbols('y')` (también la `x`) | `@variables y` (también la `x`) |
| `x + x` | `2*x` | `2*x` | `2x` |
| Desarrollar `(x + 1)²` | `expand((x + 1)^2)` | `expand((x + 1)**2)` | `expand((x + 1)^2)` |
| Resultado | `x^2 + 2*x + 1` | `x**2 + 2*x + 1` | `1 + 2x + x^2` |
| `sqrt(8)` | `2*sqrt(2)` | `2*sqrt(2)` | `2.8284271247461903` |
| Sustituir `x = 2` en `p` | `p.subs(x=2)` | `p.subs(x, 2)` | `substitute(p, x => 2)` |

Los tres juntan `x + x` al construir la expresión, y los tres desarrollan solo cuando se les pide. La diferencia está en los números: en Julia, `sqrt(8)` es la raíz de un número, y la calcula en decimales; Sage y SymPy la guardan exacta. Y solo Sage trae la `x` de serie.
:::

## Conexiones

- Los números exactos de SR conviven con los de `ZZ`, `QQ` y `RR` del capítulo 1. Cómo pasa un número de un padre a otro es la **coerción**, que la parte V cuenta por dentro.
- `expand`, `factor` y `simplify_full` son la puerta del cálculo de la parte II: límites, derivadas e integrales trabajan con expresiones de SR, y muchos de ellos se los encarga Sage a Maxima.
- Las ecuaciones construidas con `==` son las que resuelve `solve`, en el capítulo de ecuaciones y sistemas.

## La grieta

`p(x=2)` funciona, pero `p(2)` da un error: una expresión no sabe cuál es su variable. En la pizarra escribimos *f*(2) sin pensarlo, porque *f* es una **función**, no una expresión. ¿Cómo se define en Sage una función de verdad, que entienda `f(2)`? En el capítulo siguiente, **Funciones**, el preparador vuelve a escena con `f(x) = x^2`, y aparece también el `def` de Python.

## Ejercicios

1. **Lo que se cancela.** ¿Qué da `x + 2*x - 3*x`? ¿En qué padre está el resultado?

2. **Una letra que no existe.** En una sesión nueva de Sage, ¿qué pasa con `y + 1`? ¿Qué hay que escribir antes para que funcione?

3. **Ida y vuelta.** ¿Qué dan `expand((x - 2)*(x + 2))` y `factor(x^2 - 4)`?

4. **Raíces exactas.** ¿Qué dan `sqrt(12)` y `sqrt(12)^2`? ¿En qué padre está el segundo? ¿Cómo lo pasas a `ZZ`?

5. **Sustituir.** Con `p = x^3 - x`, ¿cuánto valen `p.subs(x=3)` y `p(x=1/3)`?

6. **Traza a mano.** ¿Qué valen `b` y `c`, y en qué padre está `c`?

   ```sage
   a = (x - 1)^2
   b = expand(a)
   c = b.subs(x=1)
   ```

::::{div}
:class: afondo
7. **Una identidad.** ¿Qué da `bool(sin(x)^2 + cos(x)^2 == 1)`? ¿Y `(sin(x)^2 + cos(x)^2).simplify_full()`?

8. **El otro supuesto.** Después de `assume(x < 0)`, ¿qué da `sqrt(x^2)`? ¿Qué hay que escribir después para que Sage olvide el supuesto?
::::

## Solucionario

1. `0`, en `SR`. Pynac junta los tres términos al construir la expresión, y se cancelan.
2. Un error: `NameError: name 'y' is not defined`. Antes hay que crear la variable con `var('y')`.
3. `x^2 - 4` y `(x + 2)*(x - 2)`. Son la misma expresión, desarrollada y factorizada.
4. `2*sqrt(3)` y `12`. El 12 está en `SR`; `ZZ(sqrt(12)^2)` da `12` en `ZZ`.
5. `24` y `-8/27`, los dos en `SR`.
6. `b` vale `x^2 - 2*x + 1` y `c` vale `0`, en `SR`.

::::{div}
:class: afondo
7. `True` y `1`. Las dos maneras llegan a la identidad fundamental de la trigonometría, y en las dos Sage llama a Maxima.
8. `-x`: si `x` es negativa, la raíz de su cuadrado es `-x`, que es positivo. Para olvidar el supuesto, `forget()`.
::::
