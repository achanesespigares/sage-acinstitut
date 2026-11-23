---
title: Funciones
subtitle: La f de la pizarra, el def de Python y en qué se diferencian
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

El capítulo anterior terminó con un error. Con `p = x^2 + 1`, `p(x=2)` daba `5`, pero `p(2)` se quejaba: una expresión no sabe cuál es su variable.

En la pizarra escribimos *f*(*x*) = *x*² + 1 y después *f*(2) = 5, sin pensarlo. Escríbelo así en Sage:

```sage
f(x) = x^2 + 1
f(2)
```

Sage contesta `5`. En Python, la primera línea sería un error de sintaxis: no se puede asignar nada a una llamada. ¿Qué ha hecho Sage con ella?

## La pregunta

¿Qué es una función en Sage? ¿Es lo mismo la `f` de la pizarra que una función de Python, la que se escribe con `def`?

## La idea

En Sage conviven dos clases de funciones, y se parecen tanto que es fácil confundirlas:

- **La función simbólica**, `f(x) = x^2 + 1`. Es una expresión de SR que sabe cuál es su variable: Sage la escribe `x |--> x^2 + 1`, «*x* va a *x*² + 1». Al llamarla, cambia la `x` por el valor, y el resultado es siempre una expresión de SR.
- **La función de Python**, con `def` o con `lambda`. Es un trozo de programa: al llamarla, Python ejecuta sus líneas con el valor que le das. El resultado es lo que salga de esas cuentas, y su padre depende del valor que entra.

La primera es una fórmula; la segunda, unas instrucciones. Con números las dos dan lo mismo, pero no se comportan igual.

## Construcción

### 1 · La f de la pizarra

Mira el recuadro **El preparador de Sage la reescribe así** en la primera línea: ahí está el truco.

```{code-cell} sage
f(x) = x^2 + 1
a = f(2)
b = f(1/2)
c = f(x + 1)
f
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/04-funciones-1.json","config":{"titulo":"Una función que es una fórmula","etiqueta":"f(x) = …","idea":"El preparador convierte f(x) = x^2 + 1 en una expresión que sabe que su variable es x. Llamarla es sustituir: f(2) cambia la x por 2, y por eso lo hace Pynac. El resultado siempre está en SR, también cuando es un número.","columnas":["a","b","c"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

El preparador convierte la primera línea en dos instrucciones de Python:

```text
__tmp__=var("x"); f = symbolic_expression(x**Integer(2) + Integer(1)).function(x)
```

Primero se asegura de que `x` es una variable simbólica, con `var("x")`. Después construye la expresión `x^2 + 1` y, con `.function(x)`, le dice cuál es su variable. Por eso `f` lleva la etiqueta `x ↦ SR`: es la forma corta que usa el libro para el padre de las funciones simbólicas, que Sage llama *Callable function ring with argument x*. El nombre completo sale al pasar el ratón por la etiqueta.

- `a` vale `5` y `b` vale `5/4`, los dos en `SR`, como al sustituir en el capítulo 3.
- `c` vale `(x + 1)^2 + 1`. Si le das una expresión, `f` la pone en el sitio de la `x`, sin desarrollar nada.
- La última línea escribe `f` en la consola: `x |--> x^2 + 1`.

La variable no tiene por qué ser `x`: `g(t) = t^3` crea la variable simbólica `t` y la función a la vez. Y una expresión que ya tienes se convierte en función con `.function`: si `p = x^2 - 1`, entonces `p.function(x)` es `x |--> x^2 - 1`.

### 2 · El def de Python

`def` define una función de Python: un nombre, unos parámetros y unas líneas que se ejecutan cada vez que la llamas. `lambda` es lo mismo en una sola línea, para funciones que solo devuelven una cuenta.

:::{tip} Predice
`g` hace la misma cuenta que la `f` de antes. ¿En qué padre estará `g(2)`: en `SR`, como `f(2)`, o en otro?
:::

```{code-cell} sage
def g(n):
    return n^2 + 1

h = lambda t: t^2 + 1
a = g(2)
b = g(1/2)
c = h(0.5)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/04-funciones-2.json","config":{"titulo":"Una función que es un programa","etiqueta":"def · lambda","idea":"Al llamar a g, el programa entra en la función con n valiendo 2, hace la cuenta y vuelve con el resultado. El padre lo decide el número que entra: g(2) está en ZZ, g(1/2) en QQ y h(0.5) en RR. Nada de SR.","columnas":["a","b","c"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `a` vale `5`, en `ZZ`. Dentro de `g`, `n` vale el entero 2, y `n^2 + 1` es una cuenta entre enteros de Sage.
- `b` vale `5/4`, en `QQ`: la misma cuenta, con una fracción.
- `c` vale `1.25000000000000`, en `RR`: con un decimal, la cuenta es de decimales.

En el visualizador se ve la diferencia con la `f` simbólica: en la llamada a `g`, el programa **entra** en la función, ejecuta su línea con el valor de `n` y **vuelve** con el resultado. Una función simbólica no tiene líneas que ejecutar, solo una fórmula en la que sustituir.

Este programa no usa la `x`, así que el laboratorio lo ejecuta entero, también en el navegador. Y si a `g` le pasas la `x`, también funciona: `g(x)` da la expresión `x^2 + 1`, porque `x^2 + 1` es una cuenta como otra cualquiera. La diferencia aparece cuando la función hace algo más que una cuenta, como se verá en el apartado 4.

:::{important} Dos funciones, dos padres
`f(2)` y `g(2)` valen lo mismo, 5, pero `f(2)` está en `SR` y `g(2)` en `ZZ`. Una función simbólica siempre da expresiones. Una función de Python da lo que salga de sus cuentas, y eso depende de lo que le pases.
:::

### 3 · Varias variables y composición

Una función simbólica puede tener varias variables, y una función se puede aplicar al resultado de otra, como en la pizarra.

```{code-cell} sage
F(x, y) = x^2 + y^2
a = F(3, 4)
f(x) = x^2
u(x) = x + 1
c = f(u(x))
d = f(u(2))
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/04-funciones-3.json","config":{"titulo":"Dos variables y una función dentro de otra","etiqueta":"F(x, y) · f(u(x))","idea":"F(x, y) = … crea también la variable simbólica y. Los valores se reparten en orden: x = 3, y = 4. f(u(x)) es la composición f ∘ u: primero u, después f.","columnas":["a","c","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `F(x, y) = x^2 + y^2` define una función de dos variables. El preparador escribe `var("x,y")`, así que también crea la variable simbólica `y` sin pedirla.
- `F(3, 4)` reparte los valores en el orden de la definición, `x = 3` e `y = 4`, y da `25`.
- `f(u(x))` es la composición *f* ∘ *u*: `u(x)` da `x + 1`, y `f` lo eleva al cuadrado. Resultado: `(x + 1)^2`.
- `f(u(2))` calcula primero `u(2) = 3` y después `f(3) = 9`.

Cada vez que defines `f(x) = …`, el nombre `f` pasa a guardar la nueva función: la `f` de este programa ya no es la del apartado 1. Y lo mismo con las variables: `F(x, y) = …` deja `y` convertida en variable simbólica, aunque antes guardara otra cosa.

::::{div}
:class: afondo
### 4 · Un if que no sabe qué hacer con la x

Las funciones de Python pueden decidir con `if`. Esta es el valor absoluto: si `t` es positivo o cero, lo devuelve tal cual; si no, le cambia el signo.

```{code-cell} sage
def va(t):
    if t >= 0:
        return t
    return -t

a = va(-3)
b = va(x)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/04-funciones-4.json","config":{"titulo":"El valor absoluto de una letra","etiqueta":"def · if · x","idea":"Con -3, la condición -3 >= 0 es falsa y va devuelve 3. Con la x, la condición x >= 0 no es ni cierta ni falsa: Sage no puede asegurarla, así que el if la toma como falsa y va(x) devuelve -x, sin ningún aviso.","columnas":["a","b"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `va(-3)` da `3`, en `ZZ`. La condición `-3 >= 0` es falsa y la función devuelve `-t`, es decir, `3`.
- `va(x)` da `-x`. Y esto está mal: el valor absoluto de `x` no es `-x`.

¿Qué ha pasado? Con la `x`, `t >= 0` no es una pregunta con respuesta: es la desigualdad `x >= 0`, un objeto de SR, como las ecuaciones del capítulo 3. El `if` necesita un sí o un no, así que le pide a Sage su valor de verdad, igual que `bool(x >= 0)`. Sage no puede asegurar que `x >= 0` sea cierta para toda `x`, y contesta `False`. La función sigue por el camino del «no» y devuelve `-x`, sin ningún error que te avise.

La función simbólica correcta existe y se llama `abs`: `abs(x)` da `abs(x)`, el valor absoluto de la pizarra, y `abs(-3)` da `3`. La lección vale para cualquier `def` con un `if`: con números funciona; con letras, el `if` decide algo que no se puede decidir.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La función *f*(*x*) = *x*² + 1, aplicada a 2 y a la letra *x* (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13 con Symbolics 7.49):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| Definirla | `f(x) = x^2 + 1` | `f = Lambda(x, x**2 + 1)` | `f(x) = x^2 + 1` |
| `f(2)` | `5`, en SR | `5`, un entero de SymPy | `5`, un `Int64` |
| `f` aplicada a la letra *x* | `f(x)` da `x^2 + 1` | `f(x)` da `x**2 + 1` | `f(x)` da `1 + x^2` (con `@variables x`) |
| Función de programa | `def g(n): return n^2 + 1` | `def g(n): return n**2 + 1` | `function g(n) n^2 + 1 end` |

En Julia, `f(x) = x^2 + 1` es una función normal del lenguaje: la misma línea que en Sage, pero sin preparador y sin fórmula guardada. Con un número calcula, y con una variable de Symbolics construye la expresión. Sage es el único de los tres que distingue dos clases de función con dos padres distintos.
:::

## Conexiones

- Las funciones simbólicas son las que derivarás e integrarás en la parte II: `diff(f, x)` y `integral(f, x)` trabajan con la fórmula, no con un programa.
- Las funciones de Python, con `def`, son las que escribirás para los algoritmos de las partes III y IV: Gauss paso a paso, el algoritmo de Euclides, RSA.
- La composición *f* ∘ *u* volverá con la regla de la cadena, en el capítulo de derivadas.

## La grieta

Ya tienes funciones: `f(x) = x^2 + 1` da `f(2) = 5`, `f(3) = 10`, `f(4) = 17`… Pero una función de la pizarra no es una lista de valores: es una **curva**. ¿Cómo se dibuja en Sage? En el capítulo siguiente, **Gráficos en 2D y 3D**, `plot(f, (x, -2, 2))` dibuja la parábola, y Sage vuelve a hacer muchas cuentas por dentro.

## Ejercicios

1. **Evaluar.** Con `f(x) = 3*x - 1`, ¿cuánto valen `f(2)` y `f(1/3)`? ¿En qué padre están?

2. **Lo que escribe el preparador.** ¿Qué devuelve `preparse("f(x) = 3*x - 1")`?

3. **Un def con tres padres.** Con

   ```sage
   def cubo(n):
       return n^3
   ```

   ¿cuánto valen `cubo(2)`, `cubo(2/3)` y `cubo(x)`, y en qué padre está cada uno?

4. **Una lambda.** Con `doble = lambda t: 2*t`, ¿qué dan `doble(5)` y `doble(x + 1)`?

5. **El área de un triángulo.** Define `A(b, h) = b*h/2`. ¿Cuánto vale `A(3, 4)`? ¿Qué le ha pasado al nombre `b`?

6. **Traza a mano.** ¿Cuánto valen `a` y `b`?

   ```sage
   f(x) = x^2
   g(x) = x - 3
   a = f(g(5))
   b = g(f(5))
   ```

::::{div}
:class: afondo
7. **Lo que bool() puede asegurar.** ¿Qué dan `bool(x >= 0)` y `bool(x^2 >= 0)`? ¿Qué devolvería `va(x^2)`, con la `va` del apartado 4?

8. **De expresión a función.** Con `p = x^2 - 1`, ¿qué da `p(3)`? ¿Y `p.function(x)(3)`?
::::

## Solucionario

1. `5` y `0`, los dos en `SR`: los resultados de una función simbólica siempre son expresiones.
2. `'__tmp__=var("x"); f = symbolic_expression(Integer(3)*x - Integer(1)).function(x)'`.
3. `8` en `ZZ`, `8/27` en `QQ` y `x^3` en `SR`. El padre lo decide lo que entra.
4. `10` y `2*x + 2`. Pynac junta la expresión en cuanto la construye.
5. `6`, en `SR`. El preparador ha escrito `var("b,h")`, así que `b` es ahora la variable simbólica `b`, y lo que guardara antes se ha perdido. `A` se escribe `(b, h) |--> 1/2*b*h`.
6. `a` vale `4`: `g(5) = 2` y `f(2) = 4`. `b` vale `22`: `f(5) = 25` y `g(25) = 22`. Los dos en `SR`, y el orden importa: *f* ∘ *g* no es *g* ∘ *f*.

::::{div}
:class: afondo
7. `False` y `True`: Sage no puede asegurar que `x` sea positiva, pero sí que `x^2` no es negativa. Por eso `va(x^2)` devuelve `x^2`, que esta vez es correcto.
8. `p(3)` da un error, porque una expresión no sabe cuál es su variable: hay que escribir `p(x=3)`. `p.function(x)(3)` da `8`: `.function(x)` convierte la expresión en la función `x |--> x^2 - 1`.
::::
