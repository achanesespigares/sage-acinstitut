---
title: Gráficos en 2D y 3D
subtitle: Lo que hay detrás de una curva dibujada
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Con `f(x) = x^2 - 1`, Sage calcula `f(2) = 3`, `f(0) = -1`, `f(1/2) = -3/4`… Pero en la pizarra, una función no es una lista de valores: es una **curva**, la parábola que baja hasta −1 y vuelve a subir. Para verla de un vistazo hay que dibujarla.

En Sage basta una línea: `plot(f, (x, -2, 2))`. Lo interesante es lo que no se ve: para dibujar esa curva, Sage calcula la función más de doscientas veces.

## La pregunta

¿Qué es un gráfico para Sage: una imagen o un objeto? ¿Qué hace por dentro para dibujar una curva, y quién pinta la imagen al final?

## La idea

`plot()` no dibuja nada todavía. Calcula la función en muchos puntos del intervalo y guarda el resultado en un **objeto gráfico**, de tipo `Graphics`. Es un valor como cualquier otro: se guarda en una variable, se suma con otros gráficos y se mira por dentro.

La imagen aparece al final, cuando la consola tiene que **enseñar** ese objeto. Como en un cuaderno de Jupyter con Sage, una expresión suelta que vale un gráfico no se escribe: se dibuja. En los visualizadores de este capítulo, la **Consola de Sage** enseña el dibujo, y el recuadro **Quién hace el cálculo** dice quién lo ha pintado:

- **matplotlib**, la biblioteca de gráficos de Python, pinta los gráficos en 2D.
- **Tachyon**, un programa de trazado de rayos, hace la foto de los gráficos en 3D.

## Construcción

### 1 · Dibujar una función

```{code-cell} sage
f(x) = x^2 - 1
p = plot(f, (x, -2, 2))
p
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/05-graficos-1.json","config":{"titulo":"De una función a una curva","etiqueta":"plot · Graphics","idea":"plot() calcula la función en muchos puntos y guarda el resultado en un objeto Graphics: en la memoria, p no es un dibujo. El dibujo aparece en la última línea, cuando la consola tiene que enseñar p, y lo pinta matplotlib.","columnas":["p"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `plot(f, (x, -2, 2))` recibe la función y el intervalo: la `x` va de −2 a 2. Con una expresión vale igual: `plot(x^2 - 1, (x, -2, 2))`.
- En la memoria, `p` vale `Graphics object consisting of 1 graphics primitive`: un objeto gráfico con una pieza, la curva. Su etiqueta es `Graphics`, el tipo del objeto: los gráficos no tienen padre.
- La última línea es `p`, sola. No guarda nada: la consola enseña su valor, y como es un gráfico, lo dibuja. En el recuadro **Quién hace el cálculo** aparece matplotlib.

Fuera de la última línea, un gráfico se enseña con `show(p)` o con `p.show()`. Y se guarda en un archivo con `p.save("parabola.png")`; con la extensión `.pdf` o `.svg`, se guarda en esos formatos.

### 2 · Sumar gráficos

Los gráficos se **suman**: `p + q` pone los dos en el mismo dibujo. Así se superponen curvas, puntos y textos.

```{code-cell} sage
q = plot(sin(x), (x, 0, 2*pi), color='red')
r = plot(cos(x), (x, 0, 2*pi), color='green')
c = point((pi/4, sqrt(2)/2), size=60, color='black')
g = q + r + c
g
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/05-graficos-2.json","config":{"titulo":"Un dibujo hecho de piezas","etiqueta":"plot + plot + point","idea":"Cada plot y cada point es un objeto Graphics con una pieza. Al sumarlos, g tiene las tres en el mismo dibujo: la consola dice «3 graphics primitives» y dibuja el seno, el coseno y el punto donde se cortan.","columnas":["g"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `color='red'` es una **opción**: un valor que se le pasa a `plot` con nombre. Hay muchas: `thickness=2` para el grosor, `linestyle='--'` para la línea discontinua, `legend_label='sen x'` para la leyenda.
- `point((pi/4, sqrt(2)/2), size=60)` dibuja un punto. Las coordenadas pueden ser exactas: Sage las pasa a decimales al dibujar.
- `g` tiene **3 graphics primitives**, las tres piezas. El punto marca dónde se cortan las dos curvas, en *x* = π/4.

### 3 · Lo que hay dentro de la curva

:::{tip} Predice
Para dibujar la parábola entre −2 y 2, ¿cuántas veces calcula Sage el valor de `f`: unas diez, unas doscientas o miles?
:::

Un objeto gráfico se puede mirar por dentro. `p[0]` es su primera pieza, la curva; y `len(p[0])`, el número de puntos que la forman.

```{code-cell} sage
f(x) = x^2 - 1
p = plot(f, (x, -2, 2))
n = len(p)
L = p[0]
m = len(L)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/05-graficos-3.json","config":{"titulo":"Una curva hecha de puntos","etiqueta":"p[0] · len","idea":"La curva es una línea quebrada: unos 230 puntos unidos por segmentos tan cortos que parecen una curva. plot() empieza con 200 puntos repartidos y añade más donde la curva se dobla.","columnas":["n","m"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `n` vale `1`: el gráfico tiene una sola pieza.
- `L` es esa pieza, una línea: `Line defined by 235 points`.
- `m` vale `235`. Para dibujar la parábola, Sage ha calculado `f` en 235 valores de `x`.

`plot()` empieza con **200 puntos** repartidos por el intervalo, con un poco de azar para no caer siempre en los mismos sitios. Después mira en qué tramos la curva se dobla y los parte con puntos intermedios, una y otra vez, hasta cinco veces seguidas. Por eso el número no es redondo, y por eso en tu Sage saldrá un poco distinto cada vez: 229, 232, 240… (este libro fija el azar para que el visualizador dé siempre lo mismo). Con `plot_points=20` se empieza con 20, pero en la parábola Sage acaba añadiendo muchos más: salen unos 60.

Un efecto curioso: `plot()` calcula con números, no con letras. Por eso dibuja bien una función de Python con `if`, como el valor absoluto `va` del capítulo 4: `plot(va, (-2, 2))` da la V correcta, porque `va` nunca recibe la `x`, solo números.

### 4 · Una superficie en 3D

Una función de dos variables, *z* = *f*(*x*, *y*), es una superficie. `plot3d` la dibuja con el intervalo de cada variable.

```{code-cell} sage
var('y')
s = plot3d(x^2 - y^2, (x, -1, 1), (y, -1, 1))
s
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/05-graficos-4.json","config":{"titulo":"La silla de montar","etiqueta":"plot3d","idea":"plot3d calcula z = x^2 - y^2 en una rejilla de puntos y guarda una superficie. Este libro enseña una foto fija, hecha por Tachyon. Con «Sage real», la misma superficie sale en 3D de verdad: se gira con el ratón o con el dedo.","columnas":["s"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `var('y')` crea la segunda variable. La consola escribe `y`, lo que devuelve `var`.
- `s` es un `Graphics3d Object`. Su etiqueta es su tipo, `ParametricSurface`: una superficie.
- La superficie sube en la dirección de *x* y baja en la de *y*: es la **silla de montar**, con un punto de silla en el origen.

En un cuaderno de Sage o en SageMathCell, un gráfico 3D no es una foto: se dibuja con **three.js**, una biblioteca de 3D para el navegador, y se gira, se acerca y se aleja. Pulsa **Sage real** en el visualizador y gírala.

::::{div}
:class: afondo
### 5 · Gráficos con mandos: interact

En un cuaderno de Sage, `@interact` convierte una función en un pequeño programa con mandos: cada parámetro con un valor por defecto se convierte en un deslizador, y al moverlo, Sage vuelve a ejecutar la función y dibuja otra vez.

```{anywidget} ../widgets/traza-sage.mjs
{"config":{"tipo":"sagereal","titulo":"La parábola con un deslizador","etiqueta":"@interact · solo en Sage real","idea":"interact necesita un cuaderno de Sage o SageMathCell: el visualizador no puede ejecutarlo paso a paso. Pulsa el botón, mueve el deslizador y mira cómo cambia la parábola con a.","codigo":"@interact\ndef _(a=slider(-2, 2, 1/2, default=1)):\n    show(plot(a*x^2, (x, -2, 2), ymin=-4, ymax=4))"}}
```

- `slider(-2, 2, 1/2, default=1)` es un deslizador de −2 a 2, de medio en medio, que empieza en 1.
- Cada vez que lo mueves, Sage llama a la función con el nuevo valor de `a` y ejecuta `show(...)`, que dibuja la parábola *a*·*x*².
- `ymin=-4, ymax=4` fija la altura del dibujo. Sin eso, Sage la ajustaría a cada curva, y al mover el deslizador parecería que la parábola no cambia.
- La función se llama `_`, un nombre que no se va a usar: lo que importa es lo que dibuja.

Con *a* negativo, la parábola se abre hacia abajo; con *a* = 0, es la recta *y* = 0.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La parábola *y* = *x*² − 1 entre −2 y 2 (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13 con Plots 1.41):

| | Sage | Python con SymPy | Julia con Plots |
|---|---|---|---|
| Dibujarla | `plot(x^2 - 1, (x, -2, 2))` | `plot(x**2 - 1, (x, -2, 2))` | `plot(x -> x^2 - 1, -2, 2)` |
| Quién pinta | matplotlib | matplotlib | GR (por defecto) |
| Puntos que calcula | unos 230: empieza con 200 y añade donde la curva se dobla | 1000, repartidos por igual | 89: los elige según cuánto se dobla la curva |
| Juntar dos curvas | `p + q` | `p.extend(q)` | `plot!(…)` añade al último dibujo |

Los tres convierten la curva en una línea quebrada; cambia cuántos puntos usan y cómo los reparten. SymPy, sin más opciones, reparte 1000 por igual. Sage y Julia miran la forma de la curva y ponen más puntos donde hace falta.
:::

## Conexiones

- Los gráficos acompañarán toda la parte II: la recta tangente de las derivadas, el área bajo la curva de las integrales, los polinomios de Taylor acercándose a una función.
- `point`, `line` y `polygon` dibujan vectores y regiones en la parte III, y `graph.plot()` dibuja los grafos de la parte IV.
- Que una curva sea una línea quebrada es la primera aparición de una idea que vuelve en la parte V: lo exacto frente a lo aproximado. `f` es exacta; su dibujo, no.

## La grieta

La parábola de `x^2 - 1` corta el eje *x* en dos puntos, y en el dibujo se ven: en −1 y en 1. Pero el dibujo solo sugiere: ¿es exactamente 1, o 0,9999? ¿Y qué pasa con una función como `sin(x)/x` cerca de 0, donde no se puede calcular? El dibujo no lo dice. Para eso hace falta el primer concepto del cálculo: el **límite**, en el capítulo 6, que abre la parte II.

## Ejercicios

1. **Leer el objeto.** ¿Qué escribe Sage en la memoria para `plot(x^3, (x, -1, 1))`? ¿Y para `plot(x^3, (x, -1, 1)) + plot(x, (x, -1, 1))`?

2. **Opciones.** Dibuja `cos(x)` entre 0 y 2π en verde, con grosor 3 y línea discontinua.

3. **Tres piezas.** Dibuja en un mismo gráfico la parábola `x^2`, la recta `2*x - 1` y el punto `(1, 1)`. ¿Qué tienen de especial la recta y el punto?

4. **Contar puntos.** ¿Cuántos puntos tiene `plot(x^2, (x, -2, 2), plot_points=20)[0]`? ¿Por qué no salen exactamente 20?

5. **plot y def.** Con la función `va` del capítulo 4, ¿qué dibuja `plot(va, (-2, 2))`? ¿Por qué aquí no falla el `if`?

6. **Una superficie.** Dibuja `plot3d(x^2 + y^2, (x, -1, 1), (y, -1, 1))`. ¿Qué forma tiene? ¿Dónde está su punto más bajo?

::::{div}
:class: afondo
7. **Un deslizador más.** Cambia el programa de `interact` para que dibuje `a*sin(x)` entre 0 y 2π. ¿Qué hace `a` con la curva?

8. **Guardar el dibujo.** ¿Qué escribe `p.save("parabola.svg")` en la consola? ¿Dónde queda el archivo?
::::

## Solucionario

1. `Graphics object consisting of 1 graphics primitive`, y para la suma, `Graphics object consisting of 2 graphics primitives`.
2. `plot(cos(x), (x, 0, 2*pi), color='green', thickness=3, linestyle='--')`.
3. `plot(x^2, (x, -2, 2)) + plot(2*x - 1, (x, -2, 2)) + point((1, 1), size=60)`. La recta es la **tangente** a la parábola en el punto (1, 1): la toca ahí sin cruzarla. Volverá en el capítulo de derivadas.
4. Unos 60, distinto cada vez (58, 60, 63…). `plot` empieza con 20 puntos y, como con tan pocos la parábola se ve quebrada, parte los tramos y añade muchos más.
5. La V del valor absoluto, correcta. `plot` llama a `va` con números (decimales), nunca con la `x`, así que el `if` siempre sabe decidir.
6. Un cuenco, un paraboloide: sube en todas direcciones. Su punto más bajo es el origen, (0, 0, 0).

::::{div}
:class: afondo
7. `show(plot(a*sin(x), (x, 0, 2*pi), ymin=-2, ymax=2))`. `a` estira o encoge la onda en vertical: es su **amplitud**. Con `a` negativo, la onda se da la vuelta.
8. Nada: `save` no devuelve ningún valor, así que la consola no escribe nada. El archivo queda en la carpeta en la que trabaja Sage, con el formato que dice la extensión: aquí, SVG.
::::
