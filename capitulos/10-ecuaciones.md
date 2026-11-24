---
title: Ecuaciones y sistemas
subtitle: Soluciones exactas cuando las hay, y números cuando no
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

*x*² − 2 = 0 tiene dos soluciones, √2 y −√2. Una ecuación de segundo grado siempre se puede resolver con la fórmula que se aprende en el instituto. Para las de tercer y cuarto grado también hay fórmulas, mucho más largas.

Para la de quinto grado *x*⁵ − *x* − 1 = 0 no hay fórmula. No es que no se haya encontrado: Abel y Galois demostraron hace dos siglos que no puede existir una fórmula general con raíces. Y sin embargo la ecuación tiene una solución, cerca de 1,17, que se puede calcular con tantas cifras como se quiera.

## La pregunta

¿Cuándo da Sage la solución exacta de una ecuación, y qué hace cuando no puede? ¿Cómo se resuelve un sistema de varias ecuaciones?

## La idea

Sage tiene dos herramientas, y conviene saber cuál usar en cada caso:

- **`solve`** busca las soluciones **exactas**: √2, *i*, π/6… Se lo pide a **Maxima**, como las integrales y los límites. Resuelve también sistemas de ecuaciones.
- **`find_root`** busca una solución **numérica** dentro de un intervalo, con unas 16 cifras. Se lo pide a **SciPy**, la biblioteca científica de Python.

Antes de usarlas, el capítulo empieza por la idea más sencilla para encontrar una raíz: partir un intervalo por la mitad una y otra vez.

## Construcción

### 1 · Bisección: partir por la mitad

*f*(*t*) = *t*² − 2 vale −1 en *t* = 1 y 2 en *t* = 2. Cambia de signo, así que entre 1 y 2 hay una raíz. Se mira el punto medio *m*: si *f*(*m*) es positivo, la raíz está a su izquierda y *m* pasa a ser el extremo derecho, `b`; si no, pasa a ser el izquierdo, `a`.

:::{tip} Predice
Cada paso parte el intervalo por la mitad. Después de 6 pasos, ¿cuánto mide el intervalo [`a`, `b`]?
:::

```{code-cell} sage
def f(t):
    return t^2 - 2

a = 1
b = 2
for k in [1..6]:
    m = (a + b)/2
    if f(m) > 0:
        b = m
    else:
        a = m
    print(k, a, b)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/10-ecuaciones-1.json","config":{"titulo":"Acorralar la raíz","etiqueta":"bisección · fracciones","idea":"En cada vuelta, el if decide qué mitad se queda: la raíz siempre está entre a y b. Después de 6 vueltas, el intervalo va de 45/32 a 91/64, y mide 1/64. √2 ≈ 1,4142 está dentro.","columnas":["k","m","a","b"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- En la primera vuelta, *m* = 3/2 y *f*(3/2) = 1/4 > 0: la raíz está a la izquierda y `b` pasa a ser `3/2`.
- En la segunda, *m* = 5/4 y *f*(5/4) = −7/16 < 0: la raíz está a la derecha y `a` pasa a ser `5/4`.
- Después de 6 vueltas, `a` es `45/32` = 1,40625 y `b` es `91/64` = 1,421875. El intervalo mide 1/2⁶ = 1/64, y √2 = 1,41421… está dentro.

Cada vuelta gana un bit, y diez vueltas ganan unas tres cifras decimales (2¹⁰ = 1024). Es lento, pero no falla nunca: si la función es continua y cambia de signo, la raíz no se escapa. Con fracciones, todo sale exacto: el laboratorio ejecuta este programa entero en el navegador.

### 2 · `solve`: las soluciones exactas

`solve(ecuación, x)` devuelve una lista con las soluciones. Cada solución es una **ecuación** `x == valor`, y `rhs()` (del inglés *right-hand side*, «lado derecho») saca el valor.

```{code-cell} sage
s = solve(x^2 - 2 == 0, x)
r = s[1].rhs()
c = solve(x^2 + 1 == 0, x)
t = solve(x^3 - 6*x^2 + 11*x - 6 == 0, x)
m = solve(x^2 - 2*x + 1 == 0, x, multiplicities=True)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/10-ecuaciones-2.json","config":{"titulo":"Soluciones exactas","etiqueta":"solve · rhs","idea":"solve devuelve ecuaciones x == valor, no números. Busca las soluciones en los complejos: x² + 1 = 0 tiene dos, −i e i. Con multiplicities=True dice además cuántas veces cuenta cada solución.","columnas":["r","t","m"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `s` vale `[x == -sqrt(2), x == sqrt(2)]`: una lista de dos ecuaciones.
- `r` vale `sqrt(2)`: `s[1]` es la segunda ecuación, y `rhs()` saca su lado derecho. Es una expresión del anillo simbólico, `SR`, y se puede seguir usando: `r^2` da `2`.
- `c` vale `[x == -I, x == I]`. `solve` busca las soluciones en los **números complejos**, e `I` es la unidad imaginaria *i*, con *i*² = −1.
- `t` vale `[x == 1, x == 2, x == 3]`: la cúbica es (*x* − 1)(*x* − 2)(*x* − 3).
- `m` vale `([x == 1], [2])`: *x*² − 2*x* + 1 = (*x* − 1)², y la solución 1 es **doble**.

En todas las líneas con `solve`, el recuadro **Quién hace el cálculo** dice Maxima. `solve` también acepta una expresión sin `== 0`: `solve(x^2 - 2, x)` da lo mismo que `s`.

### 3 · Sistemas de ecuaciones

Un sistema se escribe como una **lista** de ecuaciones, seguida de las incógnitas. *x* ya existe; *y* hay que crearla con `var`.

```{code-cell} sage
var('y')
s = solve([x + y == 5, x - y == 1], x, y)
d = solve([x + y == 5, x - y == 1], x, y, solution_dict=True)
p = d[0][x]
c = solve([x^2 + y^2 == 1, y == x], x, y)
v = solve([x + y == 1, 2*x + 2*y == 3], x, y)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/10-ecuaciones-3.json","config":{"titulo":"Varias ecuaciones a la vez","etiqueta":"solve · sistemas · solution_dict","idea":"Un sistema da una lista de soluciones, y cada solución es otra lista, una ecuación por incógnita. Con solution_dict=True, cada solución es un diccionario y el valor se saca con d[0][x]. Un sistema sin solución da la lista vacía.","columnas":["d","p","v"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `s` vale `[[x == 3, y == 2]]`: una sola solución, que es una lista con una ecuación por incógnita.
- `d` vale `[{x: 3, y: 2}]`: la misma solución como **diccionario** de Python, que guarda pares clave → valor: aquí, cada incógnita con su valor.
- `p` vale `3`: `d[0]` es la primera solución y `[x]` saca el valor de *x*. Con diccionarios es más cómodo que con `rhs()`.
- `c` vale `[[x == -1/2*sqrt(2), y == -1/2*sqrt(2)], [x == 1/2*sqrt(2), y == 1/2*sqrt(2)]]`: la recta *y* = *x* corta a la circunferencia en dos puntos.
- `v` vale `[]`. Las rectas *x* + *y* = 1 y 2*x* + 2*y* = 3 son paralelas: no se cortan, y el sistema no tiene solución.

### 4 · Cuando no hay fórmula

Ahora la ecuación del principio, *x*⁵ − *x* − 1 = 0.

:::{tip} Predice
¿Qué hará `solve` con una ecuación de quinto grado que no se puede resolver con raíces?
:::

```{code-cell} sage
s = solve(x^5 - x - 1 == 0, x)
r = find_root(x^5 - x - 1, 1, 2)
v = r^5 - r - 1
plot(x^5 - x - 1, (x, 0, 1.5)) + point((r, 0), color='red', size=40)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/10-ecuaciones-4.json","config":{"titulo":"Sin fórmula, pero con número","etiqueta":"solve · find_root","idea":"solve no da error: devuelve la ecuación tal cual, sin resolver. find_root busca la raíz entre 1 y 2 con SciPy y da un float de Python. Al sustituir, no sale 0 exacto, sino algo del orden de 10⁻¹².","columnas":["r","v"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `s` vale `[0 == x^5 - x - 1]`. No es un error: es la ecuación devuelta tal cual. Es la manera que tiene Maxima de decir que no sabe resolverla. Hay que mirar el resultado, porque no avisa de otra forma.
- `r` vale `1.1673039782615173`. En el recuadro **Quién hace el cálculo** aparece SciPy: `find_root` usa por dentro `scipy.optimize.brentq`, el **método de Brent**, que combina la bisección del apartado 1 con trucos para ir más rápido.
- La etiqueta de `r` es `float`, en gris: es un decimal de Python, no un `RR` de Sage. `find_root` trabaja con la precisión de la máquina, unas 16 cifras, y no se le puede pedir más.
- `v` vale `8.169021015191902e-13`: sustituir `r` en la ecuación no da 0, sino algo menos de una billonésima. Ese pequeño error es el precio de trabajar con decimales.
- En el dibujo, la curva cruza el eje en el punto rojo. Entre 0 y 1 la curva no llega a cortar el eje: esa es la única raíz real.

Para usar `find_root` hay que dar un intervalo donde la función cambie de signo. Dibujar primero es la manera más fácil de encontrarlo.

::::{div}
:class: afondo
### 5 · `solve` se deja soluciones

sen *x* = 1/2 tiene infinitas soluciones: π/6, 5π/6, y todas las que salen de sumarles vueltas enteras, 2π, 4π…

```{code-cell} sage
s = solve(sin(x) == 1/2, x)
r = find_root(sin(x) - 1/2, 2, 3)
a = n(5*pi/6)
c = sin(5*pi/6)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/10-ecuaciones-5.json","config":{"titulo":"Una solución de infinitas","etiqueta":"solve · ecuaciones trigonométricas","idea":"solve da solo π/6. find_root, buscando entre 2 y 3, encuentra 2,6179…, que es 5π/6: también es solución, y solve no la ha dado.","columnas":["s","r","a","c"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `s` vale `[x == 1/6*pi]`. Una sola solución, y sin ningún aviso de que hay más.
- `r` vale `2.6179938779914944`, y `a`, `2.61799387799149`: la raíz que encuentra `find_root` entre 2 y 3 es 5π/6.
- `c` vale `1/2`, exacto: 5π/6 es solución, y `solve` no la ha dado.

Maxima resuelve sen *x* = 1/2 con la función inversa, el arcoseno, y el arcoseno solo da un ángulo. Con `to_poly_solve='force'`, Sage le pide a Maxima un método más completo, que da las dos familias: `5/6*pi + 2*pi*z…` y `1/6*pi + 2*pi*z…`. La *z* seguida de un número es una variable nueva que representa **cualquier entero**, y su número cambia cada vez. SymPy, en cambio, da las dos soluciones de la primera vuelta, π/6 y 5π/6, sin pedírselo.

La lección: el resultado de `solve` no es necesariamente la lista completa de soluciones. Con funciones periódicas, o con ecuaciones que mezclan tipos de funciones, hay que comprobar, por ejemplo dibujando.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Resolver *x*² − 2 = 0, un sistema, la quíntica y sen *x* = 1/2 (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13 con Symbolics 7.49, Nemo 0.57 y Roots 3.0):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| *x*² − 2 = 0 | `solve(x^2 - 2 == 0, x)` da `[x == -sqrt(2), x == sqrt(2)]` | `solve(x**2 - 2, x)` da `[-sqrt(2), sqrt(2)]` | `symbolic_solve(x^2 - 2, x)` da `[√(2), -√(2)]` |
| Sistema | `solve([x + y == 5, x - y == 1], x, y)` da `[[x == 3, y == 2]]` | `solve([x + y - 5, x - y - 1], [x, y])` da `{x: 3, y: 2}` | `[1 1; 1 -1] \ [5, 1]` da `[3.0, 2.0]` |
| *x*⁵ − *x* − 1 = 0 | `solve` la devuelve sin resolver; `find_root(…, 1, 2)` da `1.1673039782615173` | `solve` da cinco `CRootOf(…)`; `nsolve(…, x, 1.5)` da `1.16730397826142` | `symbolic_solve` da `roots_of(…)`; `find_zero(…, (1, 2))` da `1.1673039782614187` |
| sen *x* = 1/2 | `[x == 1/6*pi]` | `[pi/6, 5*pi/6]` | — |

Las tres herramientas reconocen que la quíntica no tiene fórmula, cada una a su manera: Sage devuelve la ecuación, SymPy nombra las raíces sin calcularlas (`CRootOf`) y Symbolics escribe `roots_of`. Los valores numéricos coinciden en las 12 primeras cifras decimales y difieren al final: cada programa para cuando la raíz está «suficientemente cerca». Julia resuelve el sistema lineal con una matriz y la barra invertida `\`; las matrices son la Parte III del libro.
:::

## Conexiones

- La bisección es un bucle `for` con un `if` dentro, como los del capítulo 2. La condición de que la función cambie de signo es el teorema de Bolzano, consecuencia de la continuidad del capítulo 6.
- `solve` trabaja con el anillo simbólico `SR` del capítulo 3, y sus soluciones son expresiones con las que se puede seguir calculando.
- `find_root` con *f*′ en vez de *f* encuentra los máximos y mínimos del capítulo 7, donde la derivada se anula.
- Los sistemas lineales vuelven en la Parte III, escritos con matrices: el capítulo 13 los resuelve paso a paso con el método de Gauss.

## La grieta

`solve` resuelve ecuaciones donde la incógnita es un número. ¿Y si la incógnita es una **función**? La ecuación *y*′ = *y* pide una función que sea igual a su derivada, y la respuesta es *y* = *C*·e^*x*. Resolver ecuaciones así es el capítulo 11, **Ecuaciones diferenciales**, con `desolve`.

## Ejercicios

1. **Primer grado.** ¿Qué da `solve(2*x + 3 == 7, x)`?

2. **Segundo grado.** ¿Qué da `solve(x^2 - 5*x + 6 == 0, x)`? ¿En qué orden salen las soluciones?

3. **Complejas.** ¿Qué da `solve(x^2 + x + 1 == 0, x)`? ¿Cuál es el discriminante?

4. **Tres incógnitas.** Con `var('y z')`, ¿qué da `solve([x + y + z == 6, x - y == 0, z == 2], x, y, z)`?

5. **Un punto fijo.** ¿Qué da `find_root(cos(x) - x, 0, 1)`? ¿Qué significa ese número?

6. **Traza a mano.** Con el programa del apartado 1, cambia `t^2 - 2` por `t^2 - 3` y `[1..6]` por `[1..3]`. ¿Qué escribe?

::::{div}
:class: afondo
7. **Infinitas soluciones.** ¿Qué da `solve([x + y == 1, 2*x + 2*y == 2], x, y)`? ¿Qué es la `r` que aparece?

8. **Cuando ninguna funciona.** ¿Qué da `solve(cos(x) == x, x)`? ¿Y `find_root(x^2 + 1, -1, 1)`?
::::

## Solucionario

1. `[x == 2]`.
2. `[x == 3, x == 2]`: primero la mayor. `solve` no promete ningún orden; si hace falta uno, se ordena después.
3. `[x == -1/2*I*sqrt(3) - 1/2, x == 1/2*I*sqrt(3) - 1/2]`. El discriminante es 1 − 4 = −3, negativo: las dos soluciones son complejas conjugadas.
4. `[[x == 2, y == 2, z == 2]]`.
5. `0.7390851332151559`. Es el número que cumple cos *x* = *x*: si en una calculadora se pulsa la tecla del coseno (en radianes) una y otra vez, se acaba en él.
6. `1 3/2 2`, `2 3/2 7/4` y `3 13/8 7/4`. √3 ≈ 1,732 está entre 13/8 = 1,625 y 7/4 = 1,75.

::::{div}
:class: afondo
7. `[[x == -r1 + 1, y == r1]]`. Las dos ecuaciones son la misma recta (la segunda es la primera multiplicada por 2), y todos sus puntos son solución. `r1` es un **parámetro**: una variable nueva que puede valer cualquier número. Para cada valor de `r1` sale un punto de la recta. El número tras la `r` puede cambiar si ya se han resuelto otros sistemas.
8. `solve` da `[x == cos(x)]`: despeja la *x*, pero la *x* sigue a los dos lados. No es una solución, es la ecuación reordenada. `find_root(x^2 + 1, -1, 1)` da un error: `RuntimeError: f appears to have no zero on the interval`. *x*² + 1 no tiene raíces reales, y `find_root` solo busca en los reales.
::::
