---
title: Doctests, cuadernos Jupyter y Cython
subtitle: Ejemplos que se comprueban solos, celdas que guardan el trabajo y Python que corre como C
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

El capítulo 24 acabó con dos descubrimientos.

- Los ejemplos de la documentación de Sage se ejecutan uno a uno, para comprobar que cada función hace lo que dice.
- cypari2 y libgap, por donde Sage habla con PARI y GAP, están escritos en **Cython**, igual que gran parte del propio Sage.

Y desde el capítulo 0, cada programa de este libro va en una celda, como en un cuaderno.

## La pregunta

¿Cómo se escribe un ejemplo que se compruebe solo? ¿Qué es un cuaderno de Jupyter, y cómo se usa Sage en él? ¿Qué es Cython, y qué se gana con él?

## La idea

- Un **doctest** es un ejemplo escrito en la documentación de una función: una línea de código y, debajo, lo que debe escribir. Un programa lo ejecuta y compara los dos **textos**, letra a letra.
- Python trae el módulo `doctest`, con ejemplos que empiezan por `>>>`. Sage usa `sage:`, y antes de ejecutar cada ejemplo lo pasa por el preparador. `sage -t` comprueba los de un archivo.
- Un **cuaderno de Jupyter** mezcla texto y celdas de código. Detrás de cada cuaderno hay un **núcleo**, el programa que ejecuta las celdas. Sage tiene el suyo, `sagemath`, que prepara cada celda antes de ejecutarla.
- **Cython** es Python con tipos de C. Se traduce a C y se compila, y un bucle puede ir cien veces más rápido. Pero un `long` de C tiene 64 bits, como el `int` de Singular del capítulo 24.

## Construcción

### 1 · Un doctest hecho a mano

Antes de usar el módulo, la idea a mano: cada ejemplo es una entrada y el texto que debe escribir. Se ejecuta, se toma el texto de lo que sale y se compara.

:::{tip} Predice
`doble(1/2)` debe escribir `1`. En Sage, ¿lo escribe?
:::

```{code-cell} sage
def doble(n):
    return 2*n
ejemplos = [(3, '6'), (1/2, '1'), (2^10, '2048')]
for e, esperado in ejemplos:
    obtenido = repr(doble(e))
    print(obtenido == esperado, obtenido)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/25-doctests-cython-1.json","config":{"titulo":"Comparar textos","etiqueta":"repr · el texto que se ve · ==","idea":"Un doctest no compara números: compara textos. repr da el texto que escribiría la consola, y la prueba pasa si coincide con el esperado letra a letra.","columnas":["e","esperado","obtenido"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `repr(doble(e))` es el texto que escribiría la consola: `'6'`, `'1'`, `'2048'`.
- Los tres coinciden con lo esperado, y salen tres `True`.
- `doble(1/2)` escribe `1`, porque `1/2` es una fracción de QQ, y 2 · 1/2 = 1 exacto.

Esto es todo lo que hace un doctest. Lo demás es comodidad: leer los ejemplos de la documentación, contar los que fallan y explicar por qué.

Este programa solo usa enteros, fracciones y listas: el laboratorio lo ejecuta entero en el navegador.

### 2 · El doctest de Python

El módulo `doctest` de Python busca en el texto las líneas que empiezan por `>>>`, las ejecuta y compara lo que salen con la línea de debajo.

:::{tip} Predice
Los ejemplos están dentro de un texto. ¿Pasan por el preparador de Sage?
:::

```{code-cell} sage
import doctest
def doble(n):
    """
    >>> doble(3)
    6
    >>> doble(1/2)
    1
    """
    return 2*n
prueba = doctest.DocTestParser().get_doctest(doble.__doc__, globals(), 'doble', 'doble.py', 0)
doctest.DocTestRunner().run(prueba)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/25-doctests-cython-2.json","config":{"titulo":"Un doctest que falla","etiqueta":"doctest · >>> · Expected · Got","idea":"El preparador no toca lo que hay dentro de un texto. En el ejemplo, 1/2 es la división de Python, que da 0.5, y doble(0.5) escribe 1.0. El doctest esperaba 1: falla, y dice qué esperaba y qué ha obtenido.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `DocTestParser().get_doctest(...)` lee los ejemplos del texto. `prueba` se escribe `<DocTest doble from doble.py:0 (2 examples)>`: dos ejemplos.
- `DocTestRunner().run(prueba)` los ejecuta. El primero pasa en silencio.
- El segundo falla: `Expected: 1`, `Got: 1.0`.
- Al final, `TestResults(failed=1, attempted=2)`: un fallo de dos.

El preparador de Sage convierte `1/2` en una fracción, pero no entra en los textos. Dentro del texto, `1/2` es Python puro: el decimal 0.5. Y `doble(0.5)` multiplica un entero de Sage por un `float`, que da el `float` 1.0, como en el capítulo 22.

**Trampa:** el doctest compara textos. `1.0` y `1` valen lo mismo, pero no se escriben igual, así que el ejemplo falla.

### 3 · Con el preparador

`preparse` hace a mano lo que el preparador hace con cada línea. Si el ejemplo se escribe ya preparado, pasa.

```{code-cell} sage
import doctest
preparse('doble(1/2)')
def doble(n):
    """
    >>> doble(3)
    6
    >>> doble(Integer(1)/Integer(2))
    1
    """
    return 2*n
prueba = doctest.DocTestParser().get_doctest(doble.__doc__, globals(), 'doble', 'doble.py', 0)
doctest.DocTestRunner(verbose=True).run(prueba)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/25-doctests-cython-3.json","config":{"titulo":"El ejemplo, preparado","etiqueta":"preparse · verbose · ok","idea":"preparse('doble(1/2)') da 'doble(Integer(1)/Integer(2))'. Con el ejemplo escrito así, la división es de fracciones y sale 1. Con verbose=True, el doctest cuenta cada ejemplo: Trying, Expecting, ok.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `preparse('doble(1/2)')` escribe `'doble(Integer(1)/Integer(2))'`.
- Con `verbose=True`, el doctest escribe cada ejemplo: `Trying:` (lo que ejecuta), `Expecting:` (lo que espera) y `ok`.
- Al final, `TestResults(failed=0, attempted=2)`: los dos pasan.

Nadie escribe `Integer(1)/Integer(2)` en un ejemplo. Por eso Sage tiene su propio doctest: los ejemplos empiezan por `sage:`, y cada uno pasa por el preparador antes de ejecutarse. Este es un archivo `mimod.py` con tres ejemplos al estilo de Sage:

```python
def doble(n):
    r"""
    Devuelve el doble de ``n``.

    EXAMPLES::

        sage: doble(3)
        6
        sage: doble(1/2)
        1
        sage: doble(2^10)
        2048
    """
    return 2*n
```

`sage -t mimod.py` los comprueba, también con passagemath (o con `sage-runtests`, que es lo mismo). Entre otras líneas, escribe:

```text
Doctesting 1 file.
    [3 tests, 0.01s wall]
----------------------------------------------------------------------
All tests passed!
```

Si un ejemplo espera `1.5` y la función devuelve `3/2`, el informe tiene la misma forma que el de Python: `Failed example`, `Expected: 1.5`, `Got: 3/2`. Así se comprueba cada función de Sage.

### 4 · ¿Python o Cython?

Las funciones que se escriben en una celda son de Python. Muchas de las de Sage, no.

```{code-cell} sage
import sage.arith.misc
is_prime.__module__
sage.arith.misc.__file__.endswith('.py')
type(ZZ(7)).__module__
import sage.rings.integer
sage.rings.integer.__file__.endswith('.py')
sage.rings.integer.__file__.endswith('.so')
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/25-doctests-cython-4.json","config":{"titulo":"Dos clases de archivos","etiqueta":"__module__ · __file__ · .py · .so","idea":"is_prime está en sage/arith/misc.py, un archivo de Python. Los enteros de Sage están en sage.rings.integer, que es un .so: una biblioteca compilada, que sale de un archivo de Cython, integer.pyx.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `is_prime.__module__` escribe `'sage.arith.misc'`, y su archivo acaba en `.py`: la función `is_prime` está escrita en Python.
- `type(ZZ(7)).__module__` escribe `'sage.rings.integer'`, y su archivo no acaba en `.py`, sino en `.so`: es una biblioteca compilada.
- Ese `.so` sale de un archivo de Cython, `integer.pyx`: Cython lo traduce a C, y el compilador de C lo convierte en código de máquina.

`is_prime(641)`, del capítulo 24, pasa por las dos capas. La función de Python llama al método del entero, que está compilado, y ese método llama a PARI.

El laboratorio no tiene los módulos de dentro de Sage, así que este programa avisa en la primera línea. Pruébalo con **Sage real**.

## Cuadernos de Jupyter

Un **cuaderno** es un documento con celdas de texto y celdas de código. Cada celda de código se ejecuta y su resultado queda debajo, guardado con el cuaderno. Lo ejecuta un **núcleo**, un programa aparte que recibe las celdas y devuelve lo que sale.

- Con passagemath instalado, `jupyter kernelspec list` muestra el núcleo `sagemath`, que en Jupyter se llama «passagemath 10.8.14». Hay otros dos de PARI: `pari_jupyter` y `xeus-gp`.
- El núcleo `sagemath` prepara cada celda: `1/3 + 1/6` escribe `1/2` y `2^10` escribe `1024`, como en la consola.
- En un cuaderno, una celda solo escribe el valor de su **última línea**. Una celda con `2`, `3`, `print(4)` y `5`, cada uno en una línea, escribe `4` (el `print`) y `5`. El visualizador de este libro, en cambio, escribe el valor de cada línea suelta, como la consola de Sage.
- SageMathCell, que ejecuta los botones **Sage real** de este libro, funciona igual: por dentro, cada celda la ejecuta un núcleo de Jupyter.

::::{div}
:class: afondo
### 5 · Cython en Sage real

`cython("...")` compila el código que se le da y deja sus funciones en la sesión. Primero, la velocidad: la misma suma, en Python y en Cython.

```{anywidget} ../widgets/traza-sage.mjs
{"config":{"tipo":"sagereal","titulo":"Sumar hasta un millón","etiqueta":"cython · cdef long · solo en Sage real","idea":"suma_c declara s y k como long de C: el bucle se convierte en un bucle de C. El resultado es el mismo, pero la versión de Python tarda del orden de cien veces más. Pulsa el botón para ver los tiempos en el servidor.","codigo":"cython(\"\"\"\ndef suma_c(long n):\n    cdef long s = 0\n    cdef long k\n    for k in range(n + 1):\n        s += k\n    return s\n\"\"\")\ndef suma_py(n):\n    s = 0\n    for k in range(n + 1):\n        s += k\n    return s\nimport time\nfor f in [suma_py, suma_c]:\n    t = time.perf_counter()\n    r = f(10^6)\n    t = time.perf_counter() - t\n    print(f.__name__, r, type(r).__name__, round(t*1000, 2), 'ms')"}}
```

- `cdef long s = 0` declara `s` como un entero de C, de 64 bits.
- Las dos dan `500000500000`. `suma_py` devuelve un `Integer` de Sage; `suma_c`, un `int` de Python.
- En SageMathCell, `suma_py` tardó unos 90 ms y `suma_c` menos de 1 ms. Cada vez que se ejecuta, los tiempos cambian un poco, pero la diferencia es de unas cien veces.

Y ahora, el precio de usar los tipos de C.

```{anywidget} ../widgets/traza-sage.mjs
{"config":{"tipo":"sagereal","titulo":"Un long no es un entero de Sage","etiqueta":"cython · long · 64 bits","idea":"Con long n, el argumento se convierte en un entero de C de 64 bits. Un cuadrado demasiado grande da la vuelta, sin avisar; 1/2 y 2.7 se cortan a 0 y a 2, también sin avisar; y 2^63 ya no cabe.","codigo":"cython(\"\"\"\ndef cuadrado(long n):\n    return n*n\n\"\"\")\nprint(cuadrado(7), type(cuadrado(7)))\nprint(cuadrado(2^31), cuadrado(2^32), cuadrado(3037000500))\nprint(cuadrado(1/2), cuadrado(2.7))\ncuadrado(2^63)"}}
```

- `cuadrado(7)` escribe `49`, de tipo `int`: un entero de Python, no de Sage.
- `cuadrado(2^31)` escribe `4611686018427387904`, que es correcto.
- `cuadrado(2^32)` escribe `0`, y `cuadrado(3037000500)` escribe `-9223372036709301616`. Los dos cuadrados pasan de 2⁶³ − 1 y dan la vuelta, como el `int` de Singular.
- `cuadrado(1/2)` escribe `0`, y `cuadrado(2.7)` escribe `4`: la fracción y el decimal se cortan al entero, sin avisar.
- `cuadrado(2^63)` da `OverflowError: Python int too large to convert to C long`. Solo aquí avisa.

**Trampa:** con passagemath instalado con pip, `cython()` falla en este ordenador: `PackageNotFoundError: fflas-ffpack not found`. Sage busca las cabeceras de esa biblioteca, y la instalación con pip no las trae. En una instalación completa de Sage, como la de SageMathCell, funciona.

Los tipos de C son la razón de la velocidad y también el peligro. Por eso las partes compiladas de Sage guardan los enteros con GMP, que no tiene límite, y solo usan los tipos de C donde está claro que el número cabe.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Ejemplos que se comprueban solos, cuadernos y código rápido (comprobado con Sage 10.8 y 10.10, Python 3.13 y Julia 1.13; los tiempos son orientativos, medidos en SageMathCell y en el ordenador de trabajo):

| | Sage | Python | Julia |
|---|---|---|---|
| Ejemplos en la documentación | `sage:`, preparados | `>>>`, sin preparar | `julia>`, en bloques `jldoctest` |
| Quién los comprueba | `sage -t` (`sage-runtests`) | el módulo `doctest` | el paquete Documenter.jl |
| Núcleo de Jupyter | `sagemath` | `python3` | IJulia |
| Sumar de 0 a 10⁶ en un bucle | unos 90 ms con `Integer`; menos de 1 ms con Cython | unos 23 ms | unos 4 ms, sin hacer nada más |
| Cuadrado de 2³² con enteros de 64 bits | `0` con un `long` de Cython | no pasa: los `int` no tienen límite | `0` con `Int64` |

**Trampa de Julia:** compila cada función la primera vez que se llama, así que un bucle normal ya va casi tan rápido como Cython. Pero sus enteros son de 64 bits, como un `long`: `f(n) = n*n` da `0` con 2³² y `-9223372036709301616` con 3037000500, los mismos números que Cython.
:::

## Conexiones

- En el capítulo 2, el preparador convertía `1/2` en `Integer(1)/Integer(2)`. Aquí se ha visto que no entra en los textos, y que el doctest de Sage lo aplica a cada ejemplo.
- En el capítulo 22, un entero de Sage por un `float` daba un `float`. Por eso el ejemplo de Python obtenía `1.0`.
- En el capítulo 24, el `int` de Singular daba la vuelta al pasar de 2⁶³. Un `long` de Cython hace lo mismo.
- Desde el capítulo 0, cada visualizador ejecuta una celda, como un cuaderno, y el botón **Sage real** la manda a un núcleo de Jupyter.

## La grieta

Con lo visto hasta aquí, ya se puede construir algo entero con Sage: un programa con funciones, con ejemplos que se comprueban solos, que usa los padres adecuados y sabe qué programa hace cada cuenta.

Por ejemplo, cifrar un mensaje. RSA, el cifrado de las conexiones seguras, se hace con lo de los capítulos 17 y 24: primos grandes, `inverse_mod` y `power_mod`. ¿Se puede montar un RSA de juguete para el aula? ¿Por qué es seguro con primos grandes, y cómo se rompe con primos pequeños? Es el capítulo 26, **RSA de juguete para el aula**.

## Ejercicios

1. **El primer doctest propio.** Escribe en el texto de `doble` un ejemplo `>>> doble(5)` que espere `10`. ¿Qué escribe `doctest.DocTestRunner().run(prueba)`?

2. **Un espacio de más.** Si el ejemplo `>>> doble(3)` espera `6 `, con un espacio detrás, ¿pasa?

3. **Lo que espera Python.** En el apartado 2, ¿qué habría que escribir debajo de `>>> doble(1/2)` para que el doctest de Python pase?

4. **El xor escondido.** Un ejemplo `>>> doble(2^3)` que espera `16`, ¿pasa en el doctest de Python? ¿Qué obtiene?

5. **Más módulos.** ¿Qué escriben `factor.__module__` y `type(QQ(1/2)).__module__`?

6. **La última línea.** En un cuaderno, una celda tiene `a = 2^10`, `a + 1` y `a`, cada uno en una línea. ¿Qué escribe?

::::{div}
:class: afondo
7. **Más vueltas.** Con el `cuadrado` de Cython del apartado 5, ¿qué escriben `cuadrado(2^33)`, `cuadrado(-7)` y `cuadrado(2^31 + 1)`?

8. **Sin tipos.** En Cython, `def cuadrado_bien(n): return n*n`, sin `long`. ¿Qué escriben `cuadrado_bien(2^32)`, su tipo y `cuadrado_bien(1/2)`?
::::

## Solucionario

1. `TestResults(failed=0, attempted=1)`: un ejemplo, y pasa.
2. No: `Expected: 6 ` frente a `Got: 6`, y `TestResults(failed=1, attempted=1)`. El doctest compara los textos tal cual, y el espacio cuenta.
3. `1.0`. Sin el preparador, `1/2` es el `float` 0.5, y `doble(0.5)` escribe `1.0`.
4. No pasa: obtiene `2`. En Python, `^` es el *o exclusivo* bit a bit, y `2^3` vale 1. Con `sage:`, el preparador lo convierte en `2**3` y pasaría.
5. `'sage.arith.misc'` y `'sage.rings.rational'`. `factor` también es una función de Python; las fracciones, como los enteros, están compiladas.
6. Solo `1024`, el valor de `a`. `a + 1` se calcula, pero no es la última línea, y el cuaderno no lo escribe.

::::{div}
:class: afondo
7. `0`, `49` y `4611686022722355201`. 2⁶⁶ da varias vueltas y cae en el 0. El cuadrado de −7 cabe, y el de 2³¹ + 1 también, porque es menor que 2⁶³.
8. `18446744073709551616`, de tipo `Integer`, y `1/4`. Sin tipo, `n` es un objeto cualquiera: se queda como entero o fracción de Sage, y `n*n` lo calcula Sage, con GMP. Es correcto, pero no tan rápido.
::::
