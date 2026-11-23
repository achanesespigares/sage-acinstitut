---
title: Límites y continuidad
subtitle: Acercarse a un punto sin llegar a pisarlo
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

La función *f*(*x*) = (*x*² − 1)/(*x* − 1) no existe en *x* = 1: sale 0/0. Pero en el dibujo no se nota nada. Es la recta *y* = *x* + 1, con un agujero tan pequeño que no se ve, justo en el punto (1, 2).

Pídele a Sage `f(1)` y contesta con un error. Pídele `limit(f(x), x=1)` y contesta `2`. Las dos respuestas son correctas, y no se contradicen: la primera dice qué **vale** la función en 1; la segunda, a qué valor se **acerca** cuando *x* se acerca a 1.

## La pregunta

¿Qué significa «acercarse» para un programa que solo sabe calcular valores? ¿Cómo encuentra Sage el límite exacto, y cuándo dice que no existe?

## La idea

Hay dos maneras de buscar un límite con Sage, y conviene saber las dos:

- **Acercarse con números.** Calcular *f* en puntos cada vez más cerca del punto, por ejemplo 1,1, 1,01, 1,001…, y mirar a qué valor tienden. Es lo que harías con una calculadora. Da una pista, pero no una demostración.
- **Pedir el límite exacto** con `limit`. Sage no prueba números: le pasa la expresión a **Maxima**, que aplica las reglas del cálculo (factorizar, comparar órdenes de infinito, usar límites conocidos) y devuelve el valor exacto o dice que no existe.

Cuando el límite existe y coincide con el valor de la función en el punto, la función es **continua** ahí.

## Construcción

### 1 · Acercarse sin llegar

Para ver el acercamiento con fracciones exactas, nos quedamos con números de Sage: *t* = 1 + 1/10, 1 + 1/100… Así ningún decimal se interpone.

```{code-cell} sage
def f(t):
    return (t^2 - 1)/(t - 1)

for k in [1..4]:
    t = 1 + 1/10^k
    print(t, f(t))
f(1)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/06-limites-1.json","config":{"titulo":"Cada vez más cerca de 1","etiqueta":"for · fracciones exactas","idea":"Con t = 1 + 1/10^k, f(t) da exactamente 2 + 1/10^k: se acerca a 2 tanto como queramos. Pero en t = 1 la cuenta es 0/0, y Sage se detiene con un error: la función no existe justo ahí.","columnas":["k","t"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- En cada vuelta, `t` se acerca a 1: `11/10`, `101/100`, `1001/1000`, `10001/10000`.
- `f(t)` se acerca a 2: `21/10`, `201/100`, `2001/1000`, `20001/10000`. Con fracciones se ve la ley: *f*(1 + *h*) = 2 + *h*.
- La última línea, `f(1)`, da `ZeroDivisionError: rational division by zero`. En *t* = 1, el numerador y el denominador valen 0, y 0/0 no es ningún número.

La tabla sugiere que el límite es 2, pero no lo demuestra: cuatro valores no son infinitos valores. Este programa usa solo fracciones, así que el laboratorio lo ejecuta entero en el navegador.

### 2 · El límite exacto

`limit(expresión, x=a)` calcula el límite cuando `x` tiende a `a`. Para el infinito, Sage escribe `oo`: dos oes, como un 8 tumbado.

```{code-cell} sage
f(x) = (x^2 - 1)/(x - 1)
a = limit(f(x), x=1)
b = limit(sin(x)/x, x=0)
c = limit((1 + 1/x)^x, x=oo)
d = limit((2*x^2 + 1)/(x^2 - 3), x=oo)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/06-limites-2.json","config":{"titulo":"Cuatro límites exactos","etiqueta":"limit · oo","idea":"limit no prueba números: Sage le pasa la expresión a Maxima, que razona con las reglas del cálculo y devuelve el valor exacto. Mira el recuadro «Quién hace el cálculo» en cada línea con limit.","columnas":["a","b","c","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `a` vale `2`: el agujero de la recta. Como *x*² − 1 = (*x* − 1)(*x* + 1), fuera de *x* = 1 la fracción es *x* + 1, que en 1 vale 2.
- `b` vale `1`: el límite fundamental de la trigonometría. Cerca de 0, sen *x* y *x* son casi iguales.
- `c` vale `e`, el número *e* exacto, no 2,718… Es la definición clásica de *e*.
- `d` vale `2`. En el infinito mandan los términos de mayor grado: 2*x*²/*x*².

En las cuatro líneas, el recuadro **Quién hace el cálculo** dice Maxima. Y los cuatro resultados están en `SR`: son números exactos, como en el capítulo 3. `limit` también se puede escribir `lim`, más corto.

### 3 · Por la derecha y por la izquierda

Acercarse a un punto se puede hacer desde los dos lados. Con `dir='+'`, Sage solo mira los valores de *x* mayores que el punto; con `dir='-'`, los menores. Si los dos límites laterales no coinciden, no hay límite.

:::{tip} Predice
Cerca de 0, 1/*x* es enorme. Por la derecha es positivo y por la izquierda, negativo. ¿Qué contestará Sage si no le dices el lado?
:::

```{code-cell} sage
a = limit(1/x, x=0, dir='+')
b = limit(1/x, x=0, dir='-')
c = limit(1/x, x=0)
d = limit(abs(x)/x, x=0)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/06-limites-3.json","config":{"titulo":"Los dos lados de un punto","etiqueta":"dir='+' · dir='-'","idea":"Por la derecha, 1/x crece sin límite (+Infinity); por la izquierda, decrece sin límite (-Infinity). Sin decir el lado, Sage contesta Infinity a secas: infinito, pero sin signo. Con abs(x)/x, los lados dan 1 y -1, y Sage contesta ind.","columnas":["a","b","c","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `a` vale `+Infinity` y `b` vale `-Infinity`: los dos límites laterales, cada uno con su signo.
- `c` vale `Infinity`, sin signo. Para Maxima es el **infinito complejo**: el tamaño crece sin límite, pero el signo no se decide. No es lo mismo que `+Infinity`.
- `d` vale `ind`. `abs(x)/x` vale 1 a la derecha de 0 y −1 a la izquierda: los límites laterales existen, pero no coinciden.

La documentación de `limit` explica las tres palabras especiales que puede devolver: `ind` significa *indefinido pero acotado*, es decir, que no hay límite aunque la función no se escapa al infinito; `und`, *indefinido*; e `Infinity`, el infinito complejo.

### 4 · Continuidad

Una función es **continua** en un punto *a* si se cumplen tres cosas: existe *f*(*a*), existe el límite cuando *x* tiende a *a*, y los dos valen lo mismo. En Sage se comprueba con dos líneas: `f(a)` y `limit(f(x), x=a)`.

| Función en el punto | `f(a)` | `limit(f(x), x=a)` | ¿Continua? |
|---|---|---|---|
| `x^2` en 3 | `9` | `9` | Sí |
| `(x^2 - 1)/(x - 1)` en 1 | error | `2` | No: falta el valor (discontinuidad **evitable**) |
| `floor(x)` en 2 | `2` | por la izquierda `1`, por la derecha `2` | No: hay un **salto** |
| `1/x` en 0 | error | `Infinity` | No: la función se escapa al infinito (**asíntota**) |

La discontinuidad evitable se llama así porque se arregla: basta definir *f*(1) = 2, el valor del límite, y la función pasa a ser continua. En el salto y en la asíntota no hay ningún valor que arregle nada.

`floor(x)` es la **parte entera**, el entero más cercano por debajo: `floor(2.7)` es `2`. Salta de golpe en cada entero.

::::{div}
:class: afondo
### 5 · Cuando los números engañan

La tabla del apartado 1 sugería bien el límite. Pero acercarse con números puede engañar, y este ejemplo lo hace a propósito.

```{code-cell} sage
g(x) = sin(pi/x)
L = [g(1/10^k) for k in [1..5]]
a = limit(g(x), x=0)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/06-limites-4.json","config":{"titulo":"Cinco ceros que no demuestran nada","etiqueta":"sin(pi/x) · ind","idea":"En x = 1/10, 1/100, 1/1000… sale sin(pi·10^k), y el seno de un múltiplo de π es exactamente 0. La lista dice 0, 0, 0, 0, 0. Pero entre esos puntos, sin(pi/x) oscila entre -1 y 1 cada vez más deprisa: no tiene límite, y Maxima contesta ind.","columnas":["a"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `L` vale `[0, 0, 0, 0, 0]`. En *x* = 1/10^*k*, sale `sin(pi*10^k)`, y el seno de un múltiplo entero de π vale exactamente 0. Sage lo sabe, y los ceros son exactos.
- `a` vale `ind`: no hay límite. Cerca de 0, `sin(pi/x)` pasa por 1 y por −1 infinitas veces, cada vez más deprisa.

Los puntos elegidos han caído justo donde la función vale 0. Con otros, como *x* = 2/(4*k* + 1), saldría siempre 1. Por eso una tabla de valores sirve para hacerse una idea, pero el límite hay que calcularlo. Dibújalo con `plot(sin(pi/x), (x, -1, 1))` y verás la maraña cerca de 0.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Tres límites con cada herramienta (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13 con Symbolics 7.49):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| sen *x*/*x* en 0 | `limit(sin(x)/x, x=0)` da `1` | `limit(sin(x)/x, x, 0)` da `1` | sin límites exactos que funcionen: con números, `f(1e-8)` da `1.0` |
| 1/*x* en 0, sin decir el lado | `Infinity`, sin signo | `oo`: SymPy calcula **por la derecha** si no se le dice nada | `1/1e-8` da `1.0e8` |
| 1/*x* en 0 por la izquierda | `dir='-'` da `-Infinity` | `limit(1/x, x, 0, '-')` da `-oo` | `1/-1e-8` da `-1.0e8` |
| \|*x*\|/*x* en 0 | `ind` | `1` por la derecha; con `'+-'`, error: los laterales no coinciden | — |

Cuidado con SymPy: `limit(1/x, x, 0)` da `oo`, como si el límite existiera, porque solo mira la derecha. Para los dos lados hay que pedir `'+-'`. Symbolics.jl trae una función `limit`, pero en nuestra prueba no funcionó con estas expresiones: dio un error de métodos.
:::

## Conexiones

- La derivada del capítulo siguiente es un límite: el de la pendiente de la recta secante cuando los dos puntos se juntan.
- Los límites en el infinito vuelven en las series del capítulo 9, para saber si una suma infinita da un número.
- `oo` es un elemento de la recta real ampliada, un padre más de Sage (*The Infinity Ring*). La parte V cuenta cómo convive con los demás.

## La grieta

El agujero de (*x*² − 1)/(*x* − 1) se rellenaba con su límite. Ahora piensa en la recta que pasa por dos puntos de la parábola *y* = *x*², el (1, 1) y el (1 + *h*, (1 + *h*)²). Su pendiente es ((1 + *h*)² − 1)/*h*, y en *h* = 0 vuelve a salir 0/0. ¿Qué pasa con esa recta cuando los dos puntos se juntan? Es la **derivada**, en el capítulo 7.

## Ejercicios

1. **Límites directos.** ¿Cuánto valen `limit(x^2, x=3)` y `limit((x^2 - 4)/(x - 2), x=2)`?

2. **En el infinito.** ¿Cuánto valen `limit(exp(-x), x=oo)` y `limit(x^2, x=oo)`?

3. **Con raíces.** ¿Cuánto vale `limit((sqrt(x + 1) - 1)/x, x=0)`?

4. **Los dos lados.** ¿Qué dan `limit(floor(x), x=2, dir='-')` y `limit(floor(x), x=2, dir='+')`? ¿Tiene límite `floor(x)` en 2?

5. **Sin signo o con signo.** ¿Qué da `limit(1/x^2, x=0)`? ¿Por qué esta vez sale con signo?

6. **Traza a mano.** ¿Qué escribe este programa? (Fracciones exactas: no hay decimales).

   ```sage
   def g(t):
       return (t^2 - 4)/(t - 2)

   for k in [1..3]:
       print(g(2 + 1/10^k))
   ```

::::{div}
:class: afondo
7. **Acotada por un cero.** ¿Cuánto vale `limit(x*sin(1/x), x=0)`? ¿Por qué no da `ind`, como `sin(1/x)`?

8. **Otros puntos.** Con `g(x) = sin(pi/x)`, ¿qué da la lista `[g(2/(4*k + 1)) for k in [1..5]]`?
::::

## Solucionario

1. `9` y `4`. La segunda es otra discontinuidad evitable: (*x*² − 4)/(*x* − 2) = *x* + 2 fuera de *x* = 2.
2. `0` y `+Infinity`.
3. `1/2`.
4. `1` y `2`. Los límites laterales no coinciden, así que `floor(x)` no tiene límite en 2: hay un salto.
5. `+Infinity`. Ahora los dos lados se escapan hacia arriba, porque *x*² es positivo a los dos lados de 0, así que el signo está decidido.
6. Escribe `41/10`, `401/100` y `4001/1000`: *g*(2 + *h*) = 4 + *h*, y se acerca a 4.

::::{div}
:class: afondo
7. `0`. `sin(1/x)` oscila entre −1 y 1, pero al multiplicarla por `x`, que tiende a 0, el producto queda aplastado contra el 0.
8. `[1, 1, 1, 1, 1]`. Con *x* = 2/(4*k* + 1), sale el seno de (4*k* + 1)π/2, que siempre vale 1. Otra lista que sugiere un límite que no existe.
::::
