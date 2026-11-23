---
title: Derivadas
subtitle: De la secante a la tangente, y lo que hace diff por dentro
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

Toma la parábola *y* = *x*² y dos puntos suyos: (1, 1) y (1 + *h*, (1 + *h*)²). La recta que los une es una **secante**, y su pendiente es

$$\frac{(1 + h)^2 - 1}{h}.$$

Si *h* se hace pequeño, el segundo punto se acerca al primero y la secante gira hasta tocar la parábola en un solo punto: la **tangente**. Pero en *h* = 0 la fórmula da 0/0. Es la grieta del capítulo anterior, y su respuesta tiene nombre: la **derivada**.

## La pregunta

¿Cómo calcula Sage una derivada: acercándose con números, como en el capítulo 6, o de otra manera? ¿Y qué pasa si intentamos derivar con decimales?

## La idea

La derivada de *f* en *a* es el límite de la pendiente de la secante:

$$f'(a) = \lim_{h \to 0} \frac{f(a + h) - f(a)}{h}.$$

Sage podría calcularla así, con `limit`. Pero `diff` no lo hace: aplica las **reglas de derivación** (la de la potencia, la del producto, la de la cadena…) directamente sobre la expresión, como en la pizarra. Lo hace **Pynac**, la biblioteca de expresiones de Sage, sin pasar por Maxima, y el resultado es exacto.

Acercarse con números sirve para entender la idea. Para calcular, `diff`.

## Construcción

### 1 · De la secante a la tangente

Calculamos la pendiente de la secante con *h* = 1/10, 1/100…, con fracciones exactas.

```{code-cell} sage
def pendiente(h):
    return ((1 + h)^2 - 1)/h

for k in [1..4]:
    h = 1/10^k
    print(h, pendiente(h))
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/07-derivadas-1.json","config":{"titulo":"La secante que gira","etiqueta":"pendiente(h) · fracciones","idea":"Con fracciones exactas, la pendiente de la secante vale exactamente 2 + h: 21/10, 201/100, 2001/1000… Cuando h tiende a 0, tiende a 2, la pendiente de la tangente en x = 1.","columnas":["k","h"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- Con `h = 1/10`, la pendiente es `21/10`; con `1/100`, `201/100`; con `1/1000`, `2001/1000`…
- La ley se ve en las fracciones: ((1 + *h*)² − 1)/*h* = (2*h* + *h*²)/*h* = 2 + *h*. Cuando *h* tiende a 0, la pendiente tiende a **2**.
- Ese 2 es la derivada de *x*² en *x* = 1. Con el capítulo anterior, `limit(((1 + x)^2 - 1)/x, x=0)` da `2`.

Este programa solo usa fracciones, así que el laboratorio lo ejecuta entero en el navegador.

### 2 · diff: la derivada exacta

`diff(f, x)` deriva respecto de `x`. También se puede escribir `derivative(f, x)` o `f.diff(x)`; las tres formas hacen lo mismo.

```{code-cell} sage
f(x) = x^3 - 2*x
d = diff(f, x)
d2 = diff(f, x, 2)
a = d(1)
p = diff(x^3 - 2*x, x)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/07-derivadas-2.json","config":{"titulo":"Derivar con las reglas","etiqueta":"diff · derivative","idea":"diff aplica las reglas de derivación sobre la expresión: no se acerca con números ni llama a Maxima. Lo hace Pynac. Si derivas una función, x ↦ SR, sale otra función; si derivas una expresión, sale una expresión.","columnas":["d","d2","a","p"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `d` vale `x |--> 3*x^2 - 2`: la derivada de una **función** es otra función, con la etiqueta `x ↦ SR`.
- `d2` vale `x |--> 6*x`. El tercer argumento, `2`, pide la **segunda derivada**: derivar dos veces.
- `a` vale `1`, en `SR`: la pendiente de la tangente en *x* = 1, porque 3 · 1² − 2 = 1.
- `p` vale `3*x^2 - 2`, sin la flecha: la derivada de una **expresión** es otra expresión, en `SR`. Para evaluarla habría que escribir `p(x=1)`.

En todas las líneas con `diff`, el recuadro **Quién hace el cálculo** dice Pynac. En el código de Sage se ve por qué: la derivada de una expresión acaba en una llamada a `diff` de Pynac, sin pasar por Maxima.

### 3 · La recta tangente, dibujada

La tangente a *f* en *a* es la recta que pasa por (*a*, *f*(*a*)) con pendiente *f* ′(*a*):

$$t(x) = f(a) + f'(a)\,(x - a).$$

Con Sage se escribe casi igual, y se dibuja junto a la parábola, sumando gráficos como en el capítulo 5.

:::{tip} Predice
La tangente a *x*² en *x* = 1 tiene pendiente 2 y pasa por (1, 1). ¿Cuál es su ecuación, *y* = 2*x* − 1 o *y* = 2*x* + 1?
:::

```{code-cell} sage
g(x) = x^2
m = diff(g, x)(1)
t(x) = g(1) + m*(x - 1)
t
plot(g, (x, -1, 3)) + plot(t, (x, -1, 3), color='red')
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/07-derivadas-3.json","config":{"titulo":"La tangente en x = 1","etiqueta":"diff · plot","idea":"m es la derivada en 1, la pendiente de la tangente. t(x) = g(1) + m·(x − 1) es la recta tangente, y Sage la simplifica a 2*x - 1. En el dibujo, la recta roja toca la parábola en (1, 1) sin cruzarla.","columnas":["m"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `m` vale `2`: `diff(g, x)` es `x |--> 2*x`, y en 1 vale 2.
- `t` es `x |--> 2*x - 1`. Sage ha desarrollado `1 + 2*(x - 1)` y ha juntado los términos.
- La última línea suma los dos gráficos y la consola los dibuja: la parábola en azul y la tangente en rojo, que la toca en (1, 1).

Es la recta del ejercicio 3 del capítulo 5, y ahora sabes de dónde sale.

### 4 · Las reglas, a la vista

Las reglas de derivación se reconocen en lo que contesta Sage, aunque lo escriba en su propio orden.

```{code-cell} sage
var('y')
a = diff(sin(x^2), x)
b = diff(x^2*sin(x), x)
c = diff(x^x, x)
d = diff(x^2*y + y^3, y)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/07-derivadas-4.json","config":{"titulo":"Cadena, producto y parciales","etiqueta":"diff · reglas","idea":"a es la regla de la cadena: la derivada de fuera, cos(x^2), por la de dentro, 2x. b es la regla del producto. c, x^x, necesita logaritmos. d deriva respecto de y y trata x como un número: es una derivada parcial.","columnas":["a","b","c","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `a` vale `2*x*cos(x^2)`: **regla de la cadena**. El coseno de lo de dentro por la derivada de lo de dentro.
- `b` vale `x^2*cos(x) + 2*x*sin(x)`: **regla del producto**, *u* ′*v* + *uv* ′, escrita en otro orden.
- `c` vale `x^x*(log(x) + 1)`. *x*^*x* no es una potencia ni una exponencial de las de la tabla: se deriva escribiéndola como *e*^(*x* log *x*). En Sage, `log` es el logaritmo **neperiano**.
- `d` vale `x^2 + 3*y^2`: la **derivada parcial** respecto de `y`. La `x` se trata como un número fijo.

Para derivar respecto de dos variables seguidas, se escriben las dos: `diff(x^2*y + y^3, x, y)` da `2*x`.

::::{div}
:class: afondo
### 5 · Derivar con decimales

Volvamos a la secante del apartado 1, pero ahora con decimales de `RR` en lugar de fracciones. Parece lo mismo: *h* = 10⁻⁴, 10⁻⁸, 10⁻¹², 10⁻¹⁶, cada vez más cerca de 0.

```{code-cell} sage
def pendiente(h):
    return ((1 + h)^2 - 1)/h

for k in [4, 8, 12, 16]:
    print(k, pendiente(10.0^-k))
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/07-derivadas-5.json","config":{"titulo":"Cuando h es demasiado pequeño","etiqueta":"RR · 53 bits","idea":"Con decimales, la pendiente se acerca a 2 hasta h = 10^-8 y después empeora. Con h = 10^-16, 1 + h ya es exactamente 1 en RR: el numerador vale 0, y la pendiente, 0. Restar dos números casi iguales pierde las cifras buenas.","columnas":["k"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- Con *k* = 4 sale `2.00009999999917`: casi 2,0001, como debía.
- Con *k* = 8 sale `1.99999998784506`: muy cerca de 2, pero ya con error en la octava cifra.
- Con *k* = 12 sale `2.00017780116468`: **peor** que con *k* = 4, aunque *h* es mucho más pequeño.
- Con *k* = 16 sale `0.000000000000000`. La derivada de *x*² en 1 no es 0: la cuenta se ha roto.

Un decimal de `RR` guarda unas 16 cifras significativas (53 bits). `1 + 10.0^-16` necesitaría 17 cifras para guardar el 1 del final, y se redondea a `1` exactamente. Entonces el numerador es 1² − 1 = 0, y la pendiente, 0. Con *h* = 10⁻¹² no se pierde todo, pero sí la mayoría de las cifras: (1 + *h*)² − 1 resta dos números casi iguales, y las cifras que quedan son sobre todo error de redondeo. Es la **cancelación**.

Con fracciones, en cambio, `pendiente(1/10^16)` da `20000000000000001/10000000000000000`, exacto. Y con `diff` no hay *h*: no hay cancelación. Este programa también se ejecuta entero en el laboratorio: el mini-Sage hace las mismas cuentas de 53 bits que Sage.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
La derivada de sen(*x*²) y la de *x*² en 1 (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13 con Symbolics 7.49 y ForwardDiff 1.5):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| Derivar sen(*x*²) | `diff(sin(x^2), x)` | `diff(sin(x**2), x)` | `expand_derivatives(Differential(x)(sin(x^2)))` |
| Resultado | `2*x*cos(x^2)` | `2*x*cos(x**2)` | `2cos(x^2)*x` |
| Segunda derivada de *x*³ − 2*x* | `diff(f, x, 2)` da `x \|--> 6*x` | `diff(x**3 - 2*x, x, 2)` da `6*x` | `expand_derivatives((Differential(x)^2)(x^3 - 2x))` da `6x` |
| Derivada de *x*² en 1.0, sin fórmula | — | — | `ForwardDiff.derivative(t -> t^2, 1.0)` da `2.0` |

Los tres derivan con reglas, sin acercarse con números. Julia tiene además una tercera vía muy usada en ciencia: la **diferenciación automática** de ForwardDiff. Calcula la derivada de un programa con decimales, pero sin secantes ni *h*, y por eso da `2.0` exacto, sin la cancelación del apartado 5.
:::

## Conexiones

- La derivada da la monotonía y los extremos: donde `diff(f, x)` es positiva, *f* crece. Con `solve`, del capítulo 10, se buscan los puntos donde vale cero.
- La segunda derivada, `diff(f, x, 2)`, da la curvatura. En el material de AC Institut, convexa es ∩ (*f* ″ < 0) y cóncava es ∪ (*f* ″ > 0), al revés que en otros libros.
- Las derivadas sucesivas en un punto son los coeficientes del polinomio de Taylor, en el capítulo 9.
- La cancelación del apartado 5 vuelve en la parte V, en el capítulo **Exacto frente a aproximado**.

## La grieta

Derivar da la pendiente de una función en cada punto. ¿Se puede ir al revés? Si sabes que la pendiente de una función es 2*x* en cada punto, ¿qué función es? ¿Y cuál es el área bajo la parábola entre 0 y 1? Es la **integral**, el capítulo 8, con su versión exacta y su versión numérica.

## Ejercicios

1. **Potencias.** ¿Qué dan `diff(x^5, x)` y `diff(1/x, x)`?

2. **Función o expresión.** Con `f(x) = x^3 - 2*x`, ¿qué diferencia hay entre `diff(f, x)` y `diff(f(x), x)`? ¿Cuál de los dos se puede evaluar escribiendo `(2)`?

3. **Segunda derivada.** ¿Cuánto vale la segunda derivada de `x^4` en *x* = 1?

4. **Cadena.** ¿Qué da `diff(exp(x)*cos(x), x)`? ¿Qué regla se usa?

5. **Tangente.** Calcula con Sage la recta tangente a `x^3` en *x* = 1. ¿Qué ecuación sale?

6. **Traza a mano.** ¿Qué escribe este programa?

   ```sage
   def pendiente(h):
       return ((2 + h)^2 - 4)/h

   for k in [1..3]:
       print(pendiente(1/10^k))
   ```

::::{div}
:class: afondo
7. **El mejor h.** Con la `pendiente` del apartado 5, prueba `pendiente(10.0^-k)` para *k* de 1 a 16. ¿Con qué *k* sale más cerca de 2?

8. **Sin cancelación.** ¿Qué da `pendiente(1/10^16)` con la `pendiente` del apartado 5? ¿Por qué no hay cancelación?
::::

## Solucionario

1. `5*x^4` y `-1/x^2`.
2. `diff(f, x)` es la función `x |--> 3*x^2 - 2`, con la etiqueta `x ↦ SR`; `diff(f(x), x)` es la expresión `3*x^2 - 2`, en `SR`. Solo la primera se evalúa con `(2)`: da `10`. La segunda necesita `(x=2)`.
3. `12`. `diff(x^4, x, 2)` da `12*x^2`, que en 1 vale 12.
4. `cos(x)*e^x - e^x*sin(x)`. Es la **regla del producto**: la derivada de *e*^*x* es *e*^*x*, y la de cos *x*, −sen *x*.
5. `t(x) = 3*x - 2`: *f*(1) = 1 y *f* ′(1) = 3, así que *t*(*x*) = 1 + 3(*x* − 1).
6. `41/10`, `401/100` y `4001/1000`. La pendiente es 4 + *h*, y tiende a 4, la derivada de *x*² en 2.

::::{div}
:class: afondo
7. Con *k* = 8, que da `1.99999998784506`. Antes, *h* todavía es grande; después, la cancelación gana. Para esta cuenta, el mejor *h* ronda la raíz cuadrada de la precisión, unos 10⁻⁸.
8. `20000000000000001/10000000000000000`, es decir, 2 + 10⁻¹⁶ exacto. Con fracciones no hay redondeo: (1 + *h*)² − 1 se calcula sin perder ninguna cifra.
::::
