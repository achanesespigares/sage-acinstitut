---
title: RSA de juguete para el aula
subtitle: Un proyecto guiado, paso a paso. Cifrar un mensaje con lo que ya sabes, y después romperlo
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## El proyecto

Vamos a construir un sistema de cifrado de verdad: **RSA**, el que protege las conexiones seguras de internet, a escala de aula. Cada paso es un programa corto que se puede ejecutar y mirar por dentro. Al final:

- el mensaje «HOLA AULA» se convierte en el número `13435327208462900899669939372700824025459`;
- quien tiene la llave privada lo devuelve a «HOLA AULA»;
- y quien no la tiene, si los primos son pequeños, la saca con `factor`.

Lo que hace falta ya está en el libro:

- `gcd`, `inverse_mod` y `power_mod`, del capítulo 17;
- `next_prime` y `factor`, de los capítulos 17 y 24;
- los doctests, del capítulo 25.

## La idea de RSA

- Se eligen dos primos, *p* y *q*, y se multiplican: *n* = *p*·*q*. También se calcula φ = (*p* − 1)(*q* − 1).
- Se elige un número *e* primo con φ, y su inverso módulo φ: *d*, con *e*·*d* ≡ 1 (mod φ).
- La **llave pública** es (*n*, *e*), y se le puede dar a cualquiera. La **llave privada** es *d*, y no se enseña.
- Para **cifrar** un número *m* menor que *n*: *c* = *m*^*e* mod *n*. Puede hacerlo cualquiera.
- Para **descifrar**: *m* = *c*^*d* mod *n*. Solo puede quien tiene *d*.
- Para sacar *d* hace falta φ, y para φ hacen falta *p* y *q*. Quien solo tiene *n* tiene que **factorizarlo**. Con primos grandes, nadie sabe hacerlo a tiempo.

## Paso 1 · Las llaves

**Objetivo:** fabricar una llave pública y una privada con dos primos pequeños.

:::{tip} Predice
Con *p* = 61 y *q* = 53, ¿cuánto valen *n* y φ?
:::

```{code-cell} sage
p = 61
q = 53
n = p*q
phi = (p - 1)*(q - 1)
e = 17
gcd(e, phi)
d = inverse_mod(e, phi)
e*d % phi
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/26-rsa-1.json","config":{"titulo":"Fabricar las llaves","etiqueta":"n = p·q · φ · inverse_mod","idea":"n = 3233 y φ = 3120. Como mcd(17, 3120) = 1, 17 tiene inverso módulo 3120: d = 2753. La comprobación, 17·2753 mod 3120 = 1, dice que d es el inverso de verdad.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `n` vale `3233` y `phi` vale `3120`.
- `gcd(e, phi)` escribe `1`: 17 y 3120 no tienen ningún divisor común, así que 17 sirve.
- `d = inverse_mod(e, phi)` vale `2753`.
- `e*d % phi` escribe `1`: 17 · 2753 = 46801 = 15 · 3120 + 1.

**Comprueba:** la llave pública es (3233, 17) y la privada es 2753. Si *e* no es primo con φ, no hay inverso: con *e* = 3, `inverse_mod(3, 3120)` da `ZeroDivisionError: inverse of Mod(3, 3120) does not exist`.

## Paso 2 · Cifrar y descifrar un número

**Objetivo:** comprobar que lo que cifra la llave pública lo descifra la privada.

```{code-cell} sage
p = 61
q = 53
n = p*q
e = 17
d = 2753
for m in [65, 7, 3000]:
    c = power_mod(m, e, n)
    print(m, c, power_mod(c, d, n))
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/26-rsa-2.json","config":{"titulo":"Ida y vuelta","etiqueta":"power_mod · cifrar con e · descifrar con d","idea":"power_mod(m, e, n) calcula m^e mod n sin calcular m^e entero. 65 se convierte en 2790, y 2790 elevado a d vuelve a ser 65. Lo mismo con 7 y con 3000.","columnas":["m","c"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- 65 se cifra en `2790`, y 2790 se descifra en `65`.
- 7 se cifra en `2369`, y 3000 en `1780`. Los dos vuelven.
- El número cifrado no se parece en nada al original: 7 se convierte en 2369, mucho mayor, y 3000 en 1780, menor.

`power_mod` no calcula 65¹⁷ entero, que tiene 31 cifras, ni 2790²⁷⁵³, que tendría casi 9500. Eleva al cuadrado y reduce módulo *n* a cada paso, como en el capítulo 17.

**Comprueba:** un número mayor o igual que *n* no vuelve. Lo verás en el reto 6.

## Paso 3 · Del texto al número

**Objetivo:** convertir un mensaje en un número, y al revés.

Cada letra se cambia por su posición en un alfabeto, más 10, para que todas ocupen dos cifras: el espacio es 10, la A es 11, la Ñ es 25 y la Z es 37.

```{code-cell} sage
alfabeto = ' ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
def a_numero(texto):
    m = 0
    for letra in texto:
        m = 100*m + alfabeto.index(letra) + 10
    return m
def a_texto(m):
    texto = ''
    while m > 0:
        m, r = divmod(m, 100)
        texto = alfabeto[r - 10] + texto
    return texto
h = a_numero('HOLA')
h
a_texto(h)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/26-rsa-3.json","config":{"titulo":"Dos cifras por letra","etiqueta":"index · 100·m + código · divmod","idea":"a_numero va añadiendo dos cifras por letra: H = 18, O = 26, L = 22, A = 11, y sale 18262211. a_texto las quita de dos en dos por la derecha con divmod(m, 100) y reconstruye HOLA.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `alfabeto.index(letra)` da la posición de la letra: la H está en la posición 8, y su código es 18.
- `100*m + código` corre el número dos cifras a la izquierda y añade la letra nueva: 18, 1826, 182622, 18262211.
- `a_texto` hace lo contrario: `divmod(m, 100)` separa las dos últimas cifras, que son la última letra.
- `h` escribe `18262211`, y `a_texto(h)` escribe `'HOLA'`.

**Comprueba:** «HOLA AULA» se convierte en `182622111011322211`, 18 cifras. Para cifrarlo hace falta un *n* mayor que ese número: el de 3233 no sirve.

## Paso 4 · Llaves más grandes

**Objetivo:** cifrar el mensaje entero, con primos de 21 cifras.

```{code-cell} sage
p = next_prime(10^20)
q = next_prime(3*10^20)
n = p*q
phi = (p - 1)*(q - 1)
e = 65537
gcd(e, phi)
d = inverse_mod(e, phi)
m = 182622111011322211
c = power_mod(m, e, n)
c
power_mod(c, d, n)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/26-rsa-4.json","config":{"titulo":"HOLA AULA, cifrado","etiqueta":"next_prime · e = 65537 · 41 cifras","idea":"Con dos primos de 21 cifras, n tiene 41: caben mensajes de hasta 20 letras. El número de HOLA AULA se cifra en otro de 41 cifras que no se parece en nada, y la llave privada lo devuelve.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `p` vale `100000000000000000039` y `q` vale `300000000000000000053`: los primeros primos después de 10²⁰ y de 3 · 10²⁰.
- `n` tiene 41 cifras. Cabe cualquier mensaje de hasta 20 letras, que son 40 cifras.
- `e = 65537` es el que se usa en la práctica: es primo, y 65537 = 2¹⁶ + 1, así que elevar a *e* son 16 cuadrados y una multiplicación.
- `m` es el número de «HOLA AULA», del paso 3.
- `c` escribe `13435327208462900899669939372700824025459`.
- `power_mod(c, d, n)` escribe `182622111011322211`, y `a_texto` de ese número es `'HOLA AULA'`.

**Comprueba:** este programa también corre en el laboratorio del navegador, con primos de 21 cifras.

## Paso 5 · Por qué funciona

**Objetivo:** entender por qué elevar a *e* y después a *d* devuelve el número.

Como *e*·*d* ≡ 1 (mod φ), hay un *k* con *e*·*d* = 1 + *k*·φ. Y el teorema de Euler, que generaliza el de Fermat del capítulo 17, dice que si *m* es primo con *n*, entonces *m*^φ ≡ 1 (mod *n*). Así que *m*^(*e*·*d*) = *m* · (*m*^φ)^*k* ≡ *m*.

```{code-cell} sage
p = 61
q = 53
n = p*q
phi = (p - 1)*(q - 1)
e = 17
d = inverse_mod(e, phi)
k = (e*d - 1) // phi
k
power_mod(65, phi, n)
power_mod(65, e*d, n)
power_mod(61, phi, n)
power_mod(61, e*d, n)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/26-rsa-5.json","config":{"titulo":"El teorema de Euler, en marcha","etiqueta":"m^φ ≡ 1 · m^(e·d) ≡ m","idea":"e·d = 1 + 15·φ. Como 65 es primo con 3233, 65^φ da 1, y 65^(e·d) da 65. Con 61, que divide a n, 61^φ no da 1, pero 61^(e·d) vuelve a dar 61: RSA funciona con cualquier m menor que n.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `k` escribe `15`: 17 · 2753 = 1 + 15 · 3120.
- `power_mod(65, phi, n)` escribe `1`, como dice Euler, y `power_mod(65, e*d, n)` escribe `65`.
- `power_mod(61, phi, n)` escribe `1220`, no 1: 61 no es primo con *n*, porque es uno de sus factores.
- Aun así, `power_mod(61, e*d, n)` escribe `61`. RSA funciona con **todo** *m* menor que *n*, también con los que no son primos con *n* (reto 8).

## Paso 6 · Empaquetar el proyecto

**Objetivo:** guardar el sistema en un archivo, con ejemplos que se comprueban solos, como en el capítulo 25.

```python
from sage.all import gcd, inverse_mod, power_mod

ALFABETO = ' ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'


def llaves(p, q, e):
    r"""
    La llave pública ``(n, e)`` y la privada ``d``.

    EXAMPLES::

        sage: llaves(61, 53, 17)
        ((3233, 17), 2753)
        sage: llaves(61, 53, 3)
        Traceback (most recent call last):
        ...
        ValueError: e y phi no son primos entre sí
    """
    phi = (p - 1)*(q - 1)
    if gcd(e, phi) != 1:
        raise ValueError("e y phi no son primos entre sí")
    return (p*q, e), inverse_mod(e, phi)


def cifra(m, publica):
    r"""
    EXAMPLES::

        sage: cifra(65, (3233, 17))
        2790
    """
    n, e = publica
    return power_mod(m, e, n)


def descifra(c, n, d):
    r"""
    EXAMPLES::

        sage: descifra(2790, 3233, 2753)
        65
    """
    return power_mod(c, d, n)
```

Las funciones `a_numero` y `a_texto` del paso 3 van igual, cada una con sus ejemplos. Un ejemplo que espera un error se escribe con `Traceback (most recent call last):`, una línea con `...` y el error, y el doctest comprueba que salga ese error.

Con el archivo guardado como `rsa_aula.py`, `sage -t rsa_aula.py` escribe, entre otras líneas:

```text
    [7 tests, 0.01s wall]
----------------------------------------------------------------------
All tests passed!
```

**Comprueba:** si alguien cambia el alfabeto, o el orden de *p* y *q* en una fórmula, `sage -t` lo dice en el acto.

::::{div}
:class: afondo
## A fondo · Romper la llave

**Objetivo:** leer un mensaje sin tener la llave privada, solo con la pública.

Hemos interceptado un mensaje cifrado, `705788091757`, y conocemos la llave pública: *n* = 999985999949 y *e* = 65537.

```{code-cell} sage
n = 999985999949
e = 65537
c = 705788091757
f = factor(n)
f
p = f[0][0]
q = f[1][0]
d = inverse_mod(e, (p - 1)*(q - 1))
power_mod(c, d, n)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/26-rsa-6.json","config":{"titulo":"Sin la llave privada","etiqueta":"factor(n) · φ · d · el mensaje","idea":"factor(n) da 999983 · 1000003. Con p y q se calcula φ, y con φ, la llave privada d, igual que en el paso 1. El mensaje sale: 302630, que es SOS.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- `factor(n)` escribe `999983 * 1000003`, y lo calcula **PARI**.
- Con *p* y *q*, `d` sale igual que en el paso 1: vale `83020476125`.
- `power_mod(c, d, n)` escribe `302630`: 30, 26 y 30 son S, O y S. «SOS».

Toda la seguridad de RSA está en `factor`. Estos son los tiempos que tarda PARI en factorizar *n* = *p*·*q*, con *p* y *q* los primeros primos después de 10^*k* y de 3 · 10^*k*, medidos en el ordenador de trabajo:

| Cifras de *n* | 21 | 31 | 41 | 51 | 61 | 71 |
|---|---|---|---|---|---|---|
| Tiempo | 0,003 s | 0,004 s | 0,03 s | 0,4 s | 4 s | 41 s |

Desde las 41 cifras, cada 10 cifras más el tiempo se multiplica por 10. Una llave RSA de 2048 bits tiene 617 cifras: con este ritmo, ni todos los ordenadores del mundo juntos llegarían. Y la llave del paso 4, de 41 cifras, cae en tres centésimas de segundo: era una llave de juguete.
::::

:::{admonition} En el aula
:class: tip
Una actividad para grupos de tres, con el programa del paso 4 y primos que elige cada grupo:

1. La persona A fabrica sus llaves y publica (*n*, *e*) en la pizarra.
2. La persona B escribe un mensaje corto, lo cifra con la llave pública de A y le pasa solo el número cifrado.
3. A lo descifra con su *d*.
4. La persona C, que ha visto la pizarra y el número, intenta romperlo con `factor`, como en el A fondo.

Con primos de 3 cifras, C gana enseguida. Con primos de 30 cifras, PARI sigue rompiendo la llave en segundos. La conclusión es la misma que la de la tabla: la seguridad no está en el método, que es público, sino en el tamaño de los primos.
:::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
RSA con lo que trae cada lenguaje (comprobado con Sage 10.8, Python 3.13 con SymPy 1.14 y Julia 1.13 con Primes.jl):

| | Sage | Python | Julia |
|---|---|---|---|
| *m*^*e* mod *n* | `power_mod(65, 17, 3233)` da `2790` | `pow(65, 17, 3233)` da `2790` | `powermod(65, 17, 3233)` da `2790` |
| Inverso de *e* módulo φ | `inverse_mod(17, 3120)` da `2753` | `pow(17, -1, 3120)` da `2753` | `invmod(17, 3120)` da `2753` |
| Sin inverso | `ZeroDivisionError` | `ValueError: base is not invertible for the given modulus` | `DomainError` |
| Siguiente primo | `next_prime(10^20)` | `sympy.nextprime(10**20)` | `nextprime(big(10)^20)` |
| Factorizar 999985999949 | `999983 * 1000003` (PARI) | `sympy.factorint` da `{999983: 1, 1000003: 1}` | `factor` (Primes.jl) da `999983 => 1, 1000003 => 1` |

**Trampa de Julia:** `10^20` no cabe en un `Int64`, y `nextprime(10^20)` trabajaría con un número que ha dado la vuelta. Hay que escribir `big(10)^20`.
:::

## Conexiones

- En el capítulo 17, el pequeño teorema de Fermat decía que *a*^(*p* − 1) ≡ 1 (mod *p*), y `power_mod` y `inverse_mod` hacían las cuentas. RSA es Fermat con dos primos: el teorema de Euler.
- En el capítulo 17, `inverse_mod` salía de Bézout. Aquí fabrica la llave privada.
- En el capítulo 24, `factor` era cosa de PARI. Aquí, PARI es el atacante.
- En el capítulo 25, los doctests comprobaban una función. Aquí comprueban el proyecto entero.

## La grieta

Para el reto 1 hay que hacer las cuentas a mano, y conviene que los números sean pequeños y salgan redondos: *n* = 187, φ = 160, *d* = 23. Los números de un buen ejercicio no salen por casualidad: se eligen hacia atrás, desde la solución.

¿Se puede pedir a Sage que fabrique ejercicios así, con datos pequeños y soluciones redondas, y que además los compruebe? Es el capítulo 27, **Un fabricante de ejercicios con soluciones redondas**.

## Retos

1. **Llaves a mano.** Con *p* = 11, *q* = 17 y *e* = 7, ¿cuánto valen *n*, φ y *d*?

2. **Cifrar a mano.** Con la llave pública (187, 7), ¿en qué se cifra *m* = 88? Descífralo con el *d* del reto 1.

3. **Un e que no sirve.** Con *p* = 61 y *q* = 53, ¿qué pasa con *e* = 3?

4. **Codificar.** ¿Qué número da `a_numero('SAGE')`?

5. **Decodificar.** ¿Qué texto da `a_texto(2211)`?

6. **Un mensaje demasiado largo.** Con la llave del paso 1 (*n* = 3233), se cifra `a_numero('HOLA')` y se descifra. ¿Qué número sale? ¿Qué texto?

::::{div}
:class: afondo
7. **Romper la llave del paso 4.** ¿Qué escribe `factor(n)` con el *n* de 41 cifras del paso 4?

8. **Un m que no es primo con n.** En el paso 5, 61^φ no da 1 módulo 3233, y sin embargo 61^(*e*·*d*) da 61. ¿Por qué?
::::

## Solucionario

1. *n* = 187, φ = 10 · 16 = 160 y *d* = `inverse_mod(7, 160)` = 23. Comprobación: 7 · 23 = 161 = 160 + 1.
2. `power_mod(88, 7, 187)` da `11`, y `power_mod(11, 23, 187)` da `88`.
3. `gcd(3, 3120)` da 3, no 1, y `inverse_mod(3, 3120)` da `ZeroDivisionError: inverse of Mod(3, 3120) does not exist`. Sin *d*, no hay llave privada.
4. `30111715`: S = 30, A = 11, G = 17, E = 15.
5. `'LA'`: 22 es la L y 11 es la A.
6. Sale `2227`, que es 18262211 mod 3233, y `a_texto(2227)` da `'LP'`. RSA trabaja módulo *n*: un número mayor que *n* no se puede recuperar. Por eso el paso 4 usa primos más grandes.

::::{div}
:class: afondo
7. `100000000000000000039 * 300000000000000000053`, en unas centésimas de segundo. Con *p* y *q*, la llave privada sale como en el A fondo.
8. Módulo 61, el número 61 es 0, y 0 elevado a cualquier cosa es 0. Módulo 53, 61 es primo con 53, y Fermat da 61^(*e*·*d*) ≡ 61, porque *e*·*d* = 1 + 15 · 52 · 60 es 1 más un múltiplo de 52. Como 61^(*e*·*d*) y 61 coinciden módulo 61 y módulo 53, coinciden módulo 61 · 53 = 3233. Es el teorema chino de los restos.
::::
