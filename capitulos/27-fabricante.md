---
title: Un fabricante de ejercicios con soluciones redondas
subtitle: Un proyecto guiado, paso a paso. Ejercicios que se construyen hacia atrás, desde la solución, y que Sage comprueba
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## El proyecto

En el capítulo 26, los retos que se hacían a mano tenían números limpios: *n* = 187, φ = 160, *d* = 23. No era suerte: los números se eligieron hacia atrás, desde la solución.

Vamos a construir un **fabricante de ejercicios** que trabaja así. Al final:

- `hoja(2026r, 4)` escribe cuatro ecuaciones de segundo grado distintas, con raíces enteras y sin casos triviales, y las soluciones **aparte, al final**;
- otra semilla da otra hoja, y la misma semilla da siempre la misma;
- Sage comprueba cada ejercicio, y un archivo con doctests comprueba el fabricante.

Lo que hace falta ya está en el libro:

- el módulo `random` de Python, que se estrena aquí, y el sufijo `r` del preparador, del capítulo 2;
- determinantes e inversas, del capítulo 14; `solve`, del capítulo 10; e `integrate`, del capítulo 8;
- los doctests, del capítulo 25.

## La idea

- Un ejercicio se fabrica **al revés**: primero la solución, después el enunciado. Si las raíces son 2 y 3, la ecuación es (*x* − 2)(*x* − 3) = *x*² − 5*x* + 6 = 0.
- Para que cada vez salga un ejercicio distinto, las soluciones se eligen **al azar**. Pero con una **semilla** fija, el azar se repite: la misma semilla da siempre los mismos ejercicios, y el profesor puede volver a fabricar la hoja de cualquier alumno.
- No todo lo que sale al azar es un buen ejercicio: una raíz doble, una raíz 0 o un coeficiente 0 lo dejan trivial. El fabricante **filtra**.
- Lo que fabrica, Sage lo **comprueba** resolviéndolo de verdad.

## Paso 1 · Ecuaciones con raíces enteras

**Objetivo:** fabricar ecuaciones *a*·*x*² + *b*·*x* + *c* = 0 a partir de sus raíces.

Si las raíces son *r*₁ y *r*₂, la ecuación es *a*(*x* − *r*₁)(*x* − *r*₂) = 0, es decir, *b* = −*a*(*r*₁ + *r*₂) y *c* = *a*·*r*₁·*r*₂.

:::{tip} Predice
Si las raíces son enteras, ¿qué tiene de especial el discriminante *b*² − 4*ac*?
:::

```{code-cell} sage
import random
random.seed(2026r)
def ecuacion(a, r1, r2):
    return (a, -a*(r1 + r2), a*r1*r2)
for k in [1..4]:
    a = random.choice([1, 2, 3])
    r1 = random.randint(-6, 6)
    r2 = random.randint(-6, 6)
    a, b, c = ecuacion(a, r1, r2)
    print(a, b, c, '|', r1, r2, '|', b^2 - 4*a*c)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/27-fabricante-1.json","config":{"titulo":"De las raíces a la ecuación","etiqueta":"random.seed · randint · al revés","idea":"Cada vuelta elige a, r1 y r2 al azar y escribe los coeficientes. El discriminante sale siempre un cuadrado: 9, 729, 0, 324. Pero la tercera ecuación tiene una raíz doble y la cuarta, una raíz 0: el fabricante aún no filtra.","columnas":["k","a","r1","r2","b","c"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `random.seed(2026r)` fija la semilla. Con `2026` sin la `r`, el preparador lo convierte en un entero de Sage, y `random.seed` da `TypeError: The only supported seed types are: None, int, float, str, bytes, and bytearray.` La `r` del capítulo 2 lo deja como `int` de Python.
- Las cuatro ecuaciones son (1, −1, −2), (3, 3, −60), (1, −6, 9) y (3, −18, 0).
- Los discriminantes son `9`, `729`, `0` y `324`: 3², 27², 0² y 18². Siempre es un cuadrado, porque *b*² − 4*ac* = *a*²(*r*₁ − *r*₂)².
- La tercera tiene la raíz doble 3, y la cuarta, la raíz 0 y *c* = 0. Valen, pero no son buenos ejercicios.

Las cuentas son de enteros de Python, porque `randint` devuelve `int`: por eso el visualizador no dice quién calcula. Este programa corre entero en el laboratorio.

**Comprueba:** `random.seed(2026r)` y las mismas líneas dan siempre estas cuatro ecuaciones, aquí y en el laboratorio del navegador.

## Paso 2 · Sistemas con solución entera

**Objetivo:** un sistema de tres ecuaciones con solución (2, −1, 3) que se pueda resolver a mano sin fracciones.

La solución se elige primero, y los términos independientes salen de multiplicar: *b* = *A*·*s*. Para que Cramer o Gauss no den fracciones por el camino, se buscan matrices con determinante ±1.

```{code-cell} sage
import random
random.seed(66r)
def det3(A):
    return (A[0][0]*(A[1][1]*A[2][2] - A[1][2]*A[2][1])
            - A[0][1]*(A[1][0]*A[2][2] - A[1][2]*A[2][0])
            + A[0][2]*(A[1][0]*A[2][1] - A[1][1]*A[2][0]))
intentos = 0
d = 0
while d not in [1, -1]:
    A = [[random.randint(-3, 3) for j in range(3)] for i in range(3)]
    d = det3(A)
    intentos = intentos + 1
intentos
A
d
s = [2, -1, 3]
b = [A[i][0]*s[0] + A[i][1]*s[1] + A[i][2]*s[2] for i in range(3)]
b
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/27-fabricante-2.json","config":{"titulo":"Buscar un determinante ±1","etiqueta":"while · det3 · b = A·s","idea":"El bucle prueba matrices al azar con entradas de −3 a 3 hasta que el determinante es 1 o −1. Aquí lo consigue al tercer intento. Después, b sale de multiplicar A por la solución elegida.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `det3` desarrolla el determinante 3 × 3 por la primera fila, escrito con listas.
- El bucle `while` prueba matrices al azar hasta que el determinante es 1 o −1. `intentos` escribe `3`.
- `A` es `[[1, -2, 3], [2, -3, 2], [-1, 2, -2]]`, con determinante `1`.
- `b` es `[13, 13, -10]`. El sistema es *x* − 2*y* + 3*z* = 13, 2*x* − 3*y* + 2*z* = 13, −*x* + 2*y* − 2*z* = −10, y su solución es (2, −1, 3) por construcción.

Este programa también corre entero en el laboratorio.

## Paso 3 · Que Sage lo compruebe

**Objetivo:** resolver el sistema fabricado con Sage, y otra manera de fabricar matrices con determinante ±1.

```{code-cell} sage
A = matrix(ZZ, [[1, -2, 3], [2, -3, 2], [-1, 2, -2]])
b = vector(ZZ, [13, 13, -10])
A.det()
A.solve_right(b)
B = A.inverse()
B
parent(B)
set_random_seed(2026)
U = random_matrix(ZZ, 3, algorithm='unimodular', upper_bound=4)
U
U.det()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/27-fabricante-3.json","config":{"titulo":"La comprobación","etiqueta":"det · solve_right · inverse · unimodular","idea":"Sage confirma el determinante 1 y la solución (2, −1, 3). La inversa tiene entradas enteras, aunque viva en QQ. Y random_matrix con algorithm='unimodular' fabrica directamente matrices de determinante 1.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `A.det()` escribe `1` y `A.solve_right(b)` escribe `(2, -1, 3)`: lo que se eligió.
- `B = A.inverse()` es `[2 2 5; 2 1 4; 1 0 1]`, con todas las entradas enteras, porque el determinante es 1. Pero `parent(B)` dice `Full MatrixSpace of 3 by 3 dense matrices over Rational Field`: la inversa de una matriz de ZZ siempre vive en QQ, como en el capítulo 14.
- `random_matrix(ZZ, 3, algorithm='unimodular', upper_bound=4)` fabrica una matriz de determinante 1 sin probar a ciegas. Con `set_random_seed(2026)` sale siempre `[1 -1 -1; 1 0 -3; -1 3 -2]`, y `U.det()` escribe `1`.

Matrices y `random_matrix` no están en el laboratorio: pruébalo con **Sage real**.

## Paso 4 · Áreas con resultado entero

**Objetivo:** una parábola cuya área con el eje de abscisas salga un número entero.

El área entre *y* = *a*(*x* − *r*₁)(*x* − *r*₂) y el eje, de *r*₁ a *r*₂, es |*a*|·*d*³/6, con *d* = *r*₂ − *r*₁. Para que sea entera, *a*·*d*³ tiene que ser múltiplo de 6.

```{code-cell} sage
import random
random.seed(10r)
a = random.randint(1, 3)
d = random.randint(1, 4)
intentos = 1
while a*d^3 % 6 != 0:
    a = random.randint(1, 3)
    d = random.randint(1, 4)
    intentos = intentos + 1
r1 = random.randint(-4, 2)
r2 = r1 + d
area = a*d^3 // 6
area
integrate(a*(x - r1)*(x - r2), x, r1, r2)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/27-fabricante-4.json","config":{"titulo":"Buscar un área entera","etiqueta":"a·d³ múltiplo de 6 · integrate","idea":"El bucle prueba a y d al azar hasta que a·d³ es múltiplo de 6: al quinto intento sale a = 2 y d = 3, y el área es 2·27/6 = 9. integrate da −9, porque entre las raíces la parábola está por debajo del eje.","columnas":["intentos","a","d"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- El bucle descarta (*a*, *d*) hasta que *a*·*d*³ es múltiplo de 6: lo consigue al quinto intento, con *a* = 2 y *d* = 3.
- Con *r*₁ = 1 y *r*₂ = 4, la parábola es *y* = 2(*x* − 1)(*x* − 4) = 2*x*² − 10*x* + 8, y `area` escribe `9`.
- `integrate(a*(x - r1)*(x - r2), x, r1, r2)` escribe `-9`, y lo calcula **Maxima**. El signo menos dice que, entre las raíces, la parábola está por debajo del eje: el área es 9.

Hasta `area`, el programa corre en el laboratorio; `integrate` y la `x` simbólica, no.

## Paso 5 · La hoja, con el solucionario aparte

**Objetivo:** una hoja de ecuaciones sin casos triviales ni repetidos, con las soluciones al final.

```{code-cell} sage
import random
def con_signo(k, letra=''):
    signo = '+' if k > 0 else '-'
    k = abs(k)
    if k == 1 and letra:
        return f'{signo} {letra}'
    return f'{signo} {k}{letra}'
def hoja(semilla, cuantos):
    random.seed(semilla)
    enunciados = []
    soluciones = []
    while len(enunciados) < cuantos:
        r1 = random.randint(-6, 6)
        r2 = random.randint(-6, 6)
        if r1 >= r2 or r1*r2 == 0 or r1 + r2 == 0:
            continue
        e = f'x^2 {con_signo(-(r1 + r2), "x")} {con_signo(r1*r2)} = 0'
        if e in enunciados:
            continue
        enunciados.append(e)
        soluciones.append(f'x = {r1}, x = {r2}')
    for k in range(cuantos):
        print(f'{k + 1}. {enunciados[k]}')
    print('Soluciones')
    for k in range(cuantos):
        print(f'{k + 1}. {soluciones[k]}')
hoja(2026r, 4)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/27-fabricante-5.json","config":{"titulo":"Una hoja entera","etiqueta":"filtros · continue · solucionario al final","idea":"hoja descarta las raíces repetidas, la raíz 0, las raíces opuestas (darían b = 0) y las ecuaciones ya escritas. Guarda enunciados y soluciones por separado, y escribe las soluciones al final.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `con_signo` escribe cada coeficiente con su signo: `+ 6x`, `- 11x`, `+ x` y no `+ 1x`.
- El primer `continue` descarta *r*₁ ≥ *r*₂ (raíz doble, o la misma pareja en otro orden), *r*₁·*r*₂ = 0 (raíz 0) y *r*₁ + *r*₂ = 0 (daría *b* = 0).
- El segundo `continue` descarta una ecuación que ya está en la hoja.
- Los enunciados y las soluciones van en dos listas, y las soluciones se escriben al final:

```text
1. x^2 + 6x + 5 = 0
2. x^2 - 11x + 30 = 0
3. x^2 + 7x + 10 = 0
4. x^2 + 4x - 5 = 0
Soluciones
1. x = -5, x = -1
2. x = 5, x = 6
3. x = -5, x = -2
4. x = -5, x = 1
```

Este programa corre entero en el laboratorio.

**Comprueba:** `hoja(2026r, 4)` da siempre esta hoja. Con otra semilla, otra.

## Paso 6 · Empaquetar el fabricante

**Objetivo:** guardar las funciones en un archivo, con ejemplos que se comprueban solos.

```python
def ecuacion(a, r1, r2):
    r"""
    Los coeficientes de una ecuación de segundo grado con raíces ``r1`` y ``r2``.

    EXAMPLES::

        sage: ecuacion(1, 2, 3)
        (1, -5, 6)
        sage: a, b, c = ecuacion(2, -1, 4)
        sage: b^2 - 4*a*c
        100
        sage: solve(a*x^2 + b*x + c == 0, x)
        [x == 4, x == -1]
    """
    return (a, -a*(r1 + r2), a*r1*r2)


def con_signo(k, letra=''):
    r"""
    EXAMPLES::

        sage: con_signo(5, 'x'), con_signo(-1, 'x'), con_signo(-3)
        ('+ 5x', '- x', '- 3')
    """
    signo = '+' if k > 0 else '-'
    k = abs(k)
    if k == 1 and letra:
        return f'{signo} {letra}'
    return f'{signo} {k}{letra}'


def area(a, r1, r2):
    r"""
    El área entre la parábola `y = a(x - r1)(x - r2)` y el eje de abscisas.

    EXAMPLES::

        sage: area(2, 1, 4)
        9
        sage: bool(area(2, 1, 4) == abs(integrate(2*(x - 1)*(x - 4), x, 1, 4)))
        True
    """
    return abs(a)*(r2 - r1)**3/6
```

Con el archivo guardado como `fabricante.py`, `sage -t fabricante.py` escribe `[7 tests, …]` y `All tests passed!`. Pero no a la primera: los doctests encontraron dos errores en el primer borrador, y los dos merecen la pena.

- **El `^` dentro del archivo.** La primera versión de `area` decía `(r2 - r1)^3/6`. Los ejemplos se preparan, pero el código de un `.py` no: ahí `^` es el *o exclusivo* de Python, y `area(2, 1, 4)` daba `TypeError`. Dentro de un archivo hay que escribir `**`.
- **Comparar con una expresión simbólica.** El ejemplo `area(2, 1, 4) == abs(integrate(...))` esperaba `True` y obtenía `9 == 9`: con una expresión simbólica, `==` construye una ecuación, como en el capítulo 3. Con `bool(...)` se convierte en `True` o `False`.

**Comprueba:** cada vez que cambies el fabricante, `sage -t fabricante.py` dice en un segundo si sigue fabricando bien.

::::{div}
:class: afondo
## A fondo · Doce ecuaciones, doce comprobaciones

**Objetivo:** que Sage resuelva cada ecuación fabricada y compare con las raíces elegidas.

```{code-cell} sage
import random
random.seed(1r)
bien = 0
for k in range(12):
    r1 = random.randint(-9, 0)
    r2 = random.randint(1, 9)
    sol = solve(x^2 - (r1 + r2)*x + r1*r2 == 0, x)
    raices = sorted([s.rhs() for s in sol])
    if raices == [r1, r2]:
        bien = bien + 1
bien
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/27-fabricante-6.json","config":{"titulo":"Verificadas con Sage","etiqueta":"solve · rhs · sorted · contar aciertos","idea":"Para cada ecuación fabricada, solve la resuelve con Maxima, rhs saca cada raíz y sorted las ordena. Si coinciden con las elegidas, cuenta un acierto: salen 12 de 12.","columnas":["k","r1","r2","raices","bien"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- Cada vuelta elige una raíz negativa o 0 y otra positiva, y fabrica *x*² − (*r*₁ + *r*₂)*x* + *r*₁*r*₂ = 0.
- `solve` la resuelve, con **Maxima**, y `[s.rhs() for s in sol]` saca las raíces, como en el capítulo 10.
- `sorted` las ordena, porque `solve` no promete ningún orden.
- `bien` escribe `12`: las doce ecuaciones tienen exactamente las raíces elegidas.

Esto es lo que dice el título del capítulo. El fabricante construye hacia atrás, y Sage resuelve hacia delante, por un camino independiente. Si los dos coinciden, el ejercicio está bien, sin revisarlo a mano.
::::

:::{admonition} En el aula
:class: tip
Una hoja distinta para cada alumno, con la misma dificultad:

1. Cada alumno recibe la hoja de su semilla: su número de lista. `hoja(7r, 6)` es la del alumno 7.
2. El profesor no guarda las soluciones: si un alumno pregunta, vuelve a ejecutar `hoja` con su semilla y tiene su solucionario.
3. Como todas las hojas salen del mismo fabricante, todas piden lo mismo: dos raíces enteras distintas, sin ceros, con *b* y *c* distintos de 0.

Copiar del compañero no sirve de nada: tiene otros números.
:::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Azar con semilla y comprobación (comprobado con Sage 10.8, Python 3.13 con SymPy 1.14 y Julia 1.13 con Nemo):

| | Sage | Python | Julia |
|---|---|---|---|
| Fijar la semilla | `random.seed(2026r)` (con la `r`) o `set_random_seed(2026)` | `random.seed(2026)` | `Random.seed!(2026)` |
| Primeros números (`choice([1, 2, 3])` y dos de −6 a 6) | `1`, `-1`, `2` | `1`, `-1`, `2`: es el mismo `random` | `2`, `-3`, `1` |
| Raíces de *x*² − *x* − 2 | `solve(x^2 - x - 2 == 0, x)` da `[x == 2, x == -1]` | `sympy.solve(x**2 - x - 2, x)` da `[-1, 2]` | `roots(x^2 - x - 2)` (Nemo) da `[2, -1]` |
| Matriz de determinante 1 al azar | `random_matrix(ZZ, 3, algorithm='unimodular')` | a mano, probando | a mano, probando |

**Trampa:** la misma semilla no da los mismos números en lenguajes distintos. Sage y Python comparten el módulo `random`, y coinciden; Julia tiene su propio generador. Una hoja fabricada en un lenguaje solo se puede volver a fabricar en ese mismo lenguaje.
:::

## Conexiones

- En el capítulo 2, `7r` dejaba un número como `int` de Python. Aquí `random.seed` lo necesita.
- En el capítulo 14, la inversa de una matriz de ZZ vivía en QQ. Aquí también, aunque todas sus entradas sean enteras.
- En el capítulo 3, `==` entre expresiones simbólicas construía una ecuación, y `bool` la decidía. Aquí lo ha recordado un doctest.
- En el capítulo 25, el `^` de Python era el *o exclusivo*. Aquí lo ha cazado un doctest.
- En el capítulo 26, los números de los retos estaban elegidos hacia atrás. Aquí se ha construido la máquina que lo hace.

## El final del libro

Este es el último capítulo. Has visto Sage por fuera, como una calculadora que sabe matemáticas, y por dentro: los padres, la coerción, los programas que hacen las cuentas, los doctests y Cython. Y lo has usado para construir dos proyectos enteros.

Queda una grieta, la más honda. Sage comprueba: doce ecuaciones de doce, siete doctests de siete. Pero comprobar muchos casos no es **demostrar** que vale para todos. El fabricante dice que el discriminante siempre es un cuadrado, y lo hemos visto en cuatro ejemplos y razonado en una línea. ¿Puede un ordenador comprobar ese razonamiento, paso a paso, sin fiarse de nadie? Ese es el oficio de Lean 4, y el último libro de la colección «Mirar y ver tu código pensar».

## Retos

1. **Del revés.** ¿Qué escribe `ecuacion(1, 3, -7)`?

2. **Raíces fraccionarias.** ¿Qué escribe `ecuacion(2, 1/2, 3)`? ¿Qué raíces tiene esa ecuación?

3. **El discriminante.** ¿Por qué *b*² − 4*ac* es siempre un cuadrado? Comprueba con *a* = 3, *r*₁ = 4 y *r*₂ = −5.

4. **Un fallo escondido.** ¿Qué escribe `con_signo(0)`? ¿Por qué `hoja` nunca lo llama con 0?

5. **Otra solución.** Con la matriz *A* del paso 2, ¿qué términos independientes hay que poner para que la solución sea (1, 1, 1)?

6. **Otra área.** ¿Qué área encierran *y* = 3(*x* + 1)(*x* − 1) y el eje de abscisas?

::::{div}
:class: afondo
7. **¿Cuántas hojas?** Con raíces de −6 a 6 y los filtros del paso 5, ¿cuántas ecuaciones distintas puede fabricar `hoja`?

8. **Inversas enteras.** ¿Por qué, si el determinante de una matriz de enteros es 1 o −1, su inversa tiene todas las entradas enteras?
::::

## Solucionario

1. `(1, 4, -21)`: *x*² + 4*x* − 21 = (*x* − 3)(*x* + 7).
2. `(2, -7, 3)`: 2*x*² − 7*x* + 3 = 0, con raíces 1/2 y 3. Con *a* igual al denominador, unas raíces fraccionarias dan coeficientes enteros.
3. Porque *b*² − 4*ac* = *a*²(*r*₁ + *r*₂)² − 4*a*²*r*₁*r*₂ = *a*²(*r*₁ − *r*₂)². Con *a* = 3, 4 y −5: 9 · 81 = 729 = 27².
4. `'- 0'`: como 0 no es mayor que 0, sale el signo menos. `hoja` descarta *r*₁·*r*₂ = 0 y *r*₁ + *r*₂ = 0, así que *b* y *c* nunca valen 0.
5. Las sumas de cada fila: `[2, 1, -1]`.
6. Con *a* = 3 y *d* = 2: 3 · 8/6 = 4.

::::{div}
:class: afondo
7. Hay 12 raíces posibles (de −6 a 6, sin el 0), que forman C(12, 2) = 66 parejas con *r*₁ < *r*₂. Quitando las 6 parejas opuestas (−6 y 6, …, −1 y 1), quedan **60**. Cada pareja da una ecuación distinta, porque *b* y *c* determinan las raíces.
8. La inversa es la matriz adjunta dividida entre el determinante. La adjunta tiene por entradas determinantes de submatrices de enteros, que son enteros. Si el determinante es ±1, dividir no hace fracciones.
::::
