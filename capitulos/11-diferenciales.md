---
title: Ecuaciones diferenciales
subtitle: Cuando la incógnita es una función
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Una población de bacterias crece más deprisa cuanto más grande es: si hay el doble de bacterias, nacen el doble cada minuto. Escrito con derivadas, la velocidad de crecimiento *y*′ es proporcional a la cantidad *y*. En el caso más sencillo, *y*′ = *y*.

Eso es una **ecuación diferencial**: una ecuación en la que la incógnita no es un número, sino una **función**, y en la que aparecen sus derivadas. Resolverla es encontrar la función. Aquí la respuesta se conoce desde el capítulo 7: la derivada de e^*x* es e^*x*.

## La pregunta

¿Cómo se resuelve una ecuación diferencial con Sage? ¿Y qué se puede hacer cuando no tiene una solución con fórmula?

## La idea

Igual que en el capítulo 10, hay dos caminos:

- **`desolve`** busca la solución **exacta**, una fórmula con constantes. Se lo pide a **Maxima**.
- **`desolve_rk4`** calcula la solución **numérica** punto a punto, con el método de Runge-Kutta. También lo hace Maxima.

Antes, el capítulo empieza por el método numérico más sencillo, el de **Euler**: avanzar a pasitos siguiendo la pendiente que marca la ecuación.

## Construcción

### 1 · Euler: avanzar a pasitos

Se sabe que *y*(0) = 1 y que la pendiente en cada punto es *y*′ = *y*. El método de Euler da un paso de tamaño *h* en la dirección de esa pendiente: el nuevo valor es *y* + *h*·*y*′. Y repite.

:::{tip} Predice
Con pasos de 1/4, en 4 pasos se llega a *t* = 1. La solución exacta vale ahí *e* ≈ 2,718. ¿Euler se quedará corto o se pasará?
:::

```{code-cell} sage
def f(t, y):
    return y

h = 1/4
t = 0
y = 1
for k in [1..4]:
    y = y + h*f(t, y)
    t = t + h
    print(k, t, y)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/11-diferenciales-1.json","config":{"titulo":"Seguir la pendiente","etiqueta":"método de Euler · fracciones","idea":"En cada vuelta, y crece un cuarto de lo que vale: se multiplica por 5/4. Tras 4 vueltas vale (5/4)⁴ = 625/256 ≈ 2,44, por debajo de e ≈ 2,72.","columnas":["k","t","y"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- En la primera vuelta, *y* pasa de `1` a `1 + 1/4·1 = 5/4`.
- Cada vuelta suma a *y* un cuarto de sí misma, así que lo multiplica por 5/4. Después de 4 vueltas, *y* vale (5/4)⁴ = `625/256` = 2,44140625.
- Euler **se queda corto**. La curva *y* = e^*x* se curva hacia arriba (es cóncava, ∪), y cada paso sigue la recta tangente, que queda por debajo de la curva.

Con *n* pasos de tamaño 1/*n*, Euler da (1 + 1/*n*)^*n*: el límite que define *e*, del capítulo 6. Con 100 pasos sale 2,7048: el error baja, pero despacio: casi a la mitad cada vez que se dobla el número de pasos. El programa usa solo fracciones, y el laboratorio lo ejecuta entero en el navegador.

### 2 · `desolve`: la solución exacta

Para escribir la ecuación, Sage necesita saber que *y* es una **función** de *x*, no un número: eso hace `function('y')(x)`. Después, `diff(y, x)` es *y*′.

```{code-cell} sage
y = function('y')(x)
ec = diff(y, x) == y
g = desolve(ec, y)
s = desolve(ec, y, ics=[0, 1])
v = s(x=1)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/11-diferenciales-2.json","config":{"titulo":"Todas las soluciones, y la que buscamos","etiqueta":"desolve · ics","idea":"Sin condición inicial, desolve da todas las soluciones a la vez, con una constante _C. Con ics=[0, 1], es decir, y(0) = 1, elige una: e^x.","columnas":["g","s","v"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `y` vale `y(x)`: una función de *x* sin fórmula todavía, en el anillo simbólico `SR`.
- `ec` vale `diff(y(x), x) == y(x)`: la ecuación, con la derivada sin calcular.
- `g` vale `_C*e^x`. Hay **infinitas** soluciones, una por cada valor de la constante `_C`: 2·e^*x*, −e^*x*, 0… Todas cumplen *y*′ = *y*.
- `s` vale `e^x`. `ics` (del inglés *initial conditions*, «condiciones iniciales») fija *y*(0) = 1, y de todas las soluciones solo queda la que pasa por ese punto.
- `v` vale `e`: el valor exacto en *x* = 1, el que Euler aproximaba con 2,44.

En las líneas con `desolve`, el recuadro **Quién hace el cálculo** dice Maxima. La constante se llama `_C`, con guion bajo, para no chocar con ninguna variable del alumno.

### 3 · Segundo orden: el muelle

Una masa colgada de un muelle, sin rozamiento, cumple *y*″ = −*y*: la aceleración es opuesta al desplazamiento. `diff(y, x, 2)` es la segunda derivada.

```{code-cell} sage
y = function('y')(x)
ec = diff(y, x, 2) + y == 0
g = desolve(ec, y)
s = desolve(ec, y, ics=[0, 1, 0])
plot(s, (x, 0, 4*pi))
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/11-diferenciales-3.json","config":{"titulo":"Un muelle que oscila","etiqueta":"desolve · segundo orden","idea":"Una ecuación de segundo orden tiene dos constantes, _K1 y _K2, y necesita dos condiciones: dónde empieza (y = 1) y con qué velocidad (y′ = 0). La solución es cos(x): oscila sin parar.","columnas":["g","s"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `g` vale `_K2*cos(x) + _K1*sin(x)`: todas las soluciones son combinaciones de coseno y seno, con **dos** constantes.
- Para una ecuación de segundo orden, `ics` lleva tres números: el punto *x*₀ = 0, el valor *y*(0) = 1 y la derivada *y*′(0) = 0. La masa se suelta desde 1 y sin velocidad.
- `s` vale `cos(x)`. El dibujo muestra dos oscilaciones completas entre 0 y 4π.

Una ecuación de orden *n* tiene *n* constantes, y hacen falta *n* condiciones para fijarlas.

### 4 · `desolve_rk4`: la solución numérica

Euler sigue la pendiente del principio de cada paso. El método de **Runge-Kutta de orden 4** (RK4) mira la pendiente en cuatro puntos del paso y hace una media ponderada. Con el mismo paso de 1/4, la diferencia es enorme.

```{code-cell} sage
y = function('y')(x)
p = desolve_rk4(diff(y, x) == y, y, ics=[0, 1], step=1/4, end_points=1)
u = p[-1][1]
d = u - n(e)
list_plot(p, plotjoined=True, marker='o') + plot(exp(x), (x, 0, 1), color='red')
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/11-diferenciales-4.json","config":{"titulo":"Cuatro pendientes por paso","etiqueta":"desolve_rk4 · Runge-Kutta","idea":"desolve_rk4 devuelve una lista de puntos [x, y]. Con 4 pasos de 1/4, llega a 2,71821: le faltan 7 cienmilésimas para e. Euler, con los mismos pasos, se quedaba en 2,44.","columnas":["d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `p` vale `[[0, 1], [0.25, 1.2840169270833333], [0.5, 1.648699469036526], [0.75, 2.1169580259162033], [1.0, 2.718209939201323]]`: una lista de puntos [*x*, *y*].
- En el recuadro **Quién hace el cálculo** aparece Maxima. La documentación de `desolve_rk4` lo confirma: es un envoltorio de la orden `rk` del paquete `dynamics` de Maxima.
- `u` vale `2.718209939201323`, el último valor. Lleva la etiqueta `SR`, no `RR`: los números que llegan de Maxima se quedan como expresiones de Sage.
- `d` vale `-7.188925772227961e-05`, es decir, −0,0000719: RK4 se queda corto en unas 7 cienmilésimas. El error de Euler era 0,28, casi 4000 veces mayor.
- En el dibujo, los puntos de RK4 caen encima de la curva roja e^*x*.

El error de RK4 baja casi **16 veces** cada vez que se parte el paso por la mitad (2⁴ = 16: de ahí lo de «orden 4»; con pasos de 1/8 y 1/16 sale 7·10⁻⁵ → 5·10⁻⁶ → 3·10⁻⁷). El de Euler, solo unas 2 veces.

::::{div}
:class: afondo
### 5 · Cuando no hay fórmula, o no se puede despejar

No todas las ecuaciones diferenciales tienen una solución con funciones conocidas, y no todas las soluciones se pueden despejar.

```{code-cell} sage
y = function('y')(x)
s = desolve(diff(y, x) == x/y, y)
q = desolve_rk4(diff(y, x) == x^2 + y^2, y, ics=[0, 0], step=1/4, end_points=1)
r = q[-1]
desolve(diff(y, x) == x^2 + y^2, y)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/11-diferenciales-5.json","config":{"titulo":"Implícita, numérica o nada","etiqueta":"desolve · NotImplementedError","idea":"y′ = x/y tiene solución, pero desolve la da sin despejar: una ecuación con y(x). y′ = x² + y² no la sabe resolver: da un error. desolve_rk4 sí la calcula, punto a punto.","columnas":["s","r"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `s` vale `1/2*y(x)^2 == 1/2*x^2 + _C`. Es una solución **implícita**: una ecuación que cumple *y*, sin despejar. Despejando, *y* = ±√(*x*² + 2*C*): hipérbolas. Hay que mirar si el resultado lleva `==`.
- `r` vale `[1.0, 0.35028929428543765]`: RK4 calcula *y*(1) ≈ 0,350 para *y*′ = *x*² + *y*², *y*(0) = 0, sin ninguna fórmula. Con pasos de 0,1 sale 0,35023: las tres primeras cifras decimales ya no cambian.
- La última línea da un error: `NotImplementedError: Maxima was unable to solve this ODE. Consider to set option contrib_ode to True.` Maxima no sabe resolver esta ecuación con sus métodos habituales.

El error sugiere `contrib_ode=True`, un conjunto de métodos más amplio de Maxima. Con él, `desolve` sí da una fórmula, pero de más de 200 caracteres, con funciones de Bessel (`bessel_J`), unas funciones especiales que aparecen en física. Es la ecuación de **Riccati**, y su solución exacta existe, pero no con las funciones del instituto.

Otros programas tampoco lo tienen fácil: SymPy 1.14 da un error interno (`TypeError`) con esta ecuación, y Symbolics, en Julia, devuelve `1 / (C₁*exp(0))`, una constante, que **no** es solución (su derivada es 0, y *x*² + *y*² no). Por eso conviene comprobar siempre: sustituir la solución en la ecuación, o compararla con la numérica.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Resolver *y*′ = *y*, con y sin condición inicial, *y*″ + *y* = 0 y la ecuación de Riccati (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13 con Symbolics 7.49 y Nemo 0.57):

| | Sage | Python con SymPy | Julia con Symbolics |
|---|---|---|---|
| *y*′ = *y* | `desolve(diff(y, x) == y, y)` da `_C*e^x` | `dsolve(y(x).diff(x) - y(x))` da `Eq(y(x), C1*exp(x))` | `symbolic_solve_ode(Dx(y(x)) ~ y(x), y(x), x)` da `C₁*exp(x)` |
| *y*(0) = 1 | `ics=[0, 1]` da `e^x` | `ics={y(0): 1}` da `Eq(y(x), exp(x))` | `symbolic_solve_ode` no admite condiciones iniciales |
| *y*″ + *y* = 0 | `_K2*cos(x) + _K1*sin(x)` | `Eq(y(x), C1*sin(x) + C2*cos(x))` | `C₁*cos(x)*exp(0) + C₂*exp(0)*sin(x)` |
| *y*′ = *x*² + *y*² | `NotImplementedError` (con `contrib_ode=True`, funciones de Bessel) | `TypeError` | `1 / (C₁*exp(0))`, que no es solución |

Las tres herramientas coinciden en las ecuaciones lineales con coeficientes constantes. Symbolics deja `exp(0)` sin simplificar a 1, y necesita `using Nemo` para resolver. Con la de Riccati, cada una falla de una manera distinta, y la de Julia es la peor: da una respuesta equivocada sin avisar.
:::

## Conexiones

- *y*′ = 2*x* es simplemente una integral: `desolve` da `x^2 + _C`, la primitiva del capítulo 8 con su constante.
- El método de Euler con *n* pasos da (1 + 1/*n*)^*n*, el límite del capítulo 6 que define *e*.
- Euler sigue la recta tangente del capítulo 7: por eso se queda corto cuando la curva es cóncava (∪).
- Las soluciones de *y*″ + *y* = 0 son combinaciones `_K1*sin(x) + _K2*cos(x)`: se suman y se multiplican por números, como los vectores.

## La grieta

Todas las soluciones del muelle se escriben con **dos números**, *K*₁ y *K*₂. Elegir una solución es elegir un par de números, como un punto del plano o una flecha. Esa estructura, objetos que se suman y se multiplican por números, es un **espacio vectorial**, y sirve igual para flechas, polinomios o soluciones de ecuaciones. La parte III empieza ahí: el capítulo 12, **Vectores y matrices**.

## Ejercicios

1. **Desintegración.** ¿Qué da `desolve(diff(y, x) == -2*y, y, ics=[0, 3])`? ¿Qué le pasa a la solución cuando *x* crece?

2. **Una integral disfrazada.** ¿Qué da `desolve(diff(y, x) == 2*x, y)`?

3. **Caída libre.** Una piedra lanzada hacia arriba a 20 m/s, con *g* = 10 m/s², cumple *y*″ = −10, *y*(0) = 0, *y*′(0) = 20. ¿Qué da `desolve(diff(y, x, 2) == -10, y, ics=[0, 0, 20])`? ¿Qué altura máxima alcanza?

4. **Dos exponenciales.** ¿Qué da `desolve(diff(y, x, 2) - 3*diff(y, x) + 2*y == 0, y)`?

5. **Otro muelle.** ¿Qué da `desolve(diff(y, x, 2) + 4*y == 0, y, ics=[0, 0, 2])`? ¿Con qué periodo oscila?

6. **Traza a mano.** Con el programa del apartado 1, cambia `h = 1/4` por `h = 1/2` y `[1..4]` por `[1..2]`. ¿Qué escribe?

::::{div}
:class: afondo
7. **Euler y *e*.** Con *n* pasos de 1/*n*, Euler da (1 + 1/*n*)^*n*. ¿Qué dan `(9/8)^8` y `n((1 + 1/100)^100)`? ¿Hacia dónde van?

8. **La logística.** Una población limitada cumple *y*′ = *y*(1 − *y*). ¿Qué da `desolve(diff(y, x) == y*(1 - y), y)`? ¿Es explícita o implícita?
::::

## Solucionario

1. `3*e^(-2*x)`. Empieza en 3 y se acerca a 0 sin llegar nunca: decrece exponencialmente, como un material radiactivo.
2. `x^2 + _C`. Resolver *y*′ = 2*x* es buscar una primitiva de 2*x*: `integrate(2*x, x)` da `x^2`, y `desolve` añade la constante.
3. `-5*x^2 + 20*x`. La altura es máxima cuando la velocidad se anula: *y*′ = −10*x* + 20 = 0 en *x* = 2 s, y entonces *y* = −20 + 40 = 20 m.
4. `_K1*e^(2*x) + _K2*e^x`. Las raíces de *r*² − 3*r* + 2 = 0 son 2 y 1, y cada una da una exponencial.
5. `sin(2*x)`. Su periodo es 2π/2 = π: oscila el doble de rápido que el muelle del apartado 3.
6. `1 1/2 3/2` y `2 1 9/4`. Cada paso multiplica por 1 + 1/2 = 3/2, y (3/2)² = 9/4 = 2,25, todavía más lejos de *e* que con pasos de 1/4.

::::{div}
:class: afondo
7. `43046721/16777216` (≈ 2,5658) y `2.70481382942153`. Van hacia *e* = 2,71828…, porque `limit((1 + 1/x)^x, x=oo)` es `e` (capítulo 6). Pero despacio: con 100 pasos aún falla la tercera cifra.
8. `-log(y(x) - 1) + log(y(x)) == _C + x`. Es implícita: lleva `y(x)` dentro de logaritmos, y `desolve` no la despeja. A mano, log(*y*/(*y* − 1)) = *C* + *x* lleva a *y* = 1/(1 − e^(−*C* − *x*)), y con otra constante se suele escribir *y* = 1/(1 + *A*·e^(−*x*)): la curva en forma de S de la población que se acerca a 1.
::::
