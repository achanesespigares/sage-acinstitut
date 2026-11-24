---
title: Primos, mcd y congruencias
subtitle: Los números enteros, por dentro
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

El capítulo 16 terminó con la matriz *F* = [1 1; 1 0] y los números de Fibonacci que guardan sus potencias:

1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584…

Son enteros, y los enteros tienen preguntas propias. ¿Cuál es el mayor número que divide a dos de ellos a la vez? ¿Cuáles son **primos**? ¿Qué pasa si de cada uno solo se mira el **resto** al dividir entre 7?

Esas tres preguntas son las tres piezas de la teoría de números elemental: el **máximo común divisor**, los **primos** y las **congruencias**.

## La pregunta

¿Cómo calcula Sage el mcd, cómo decide si un número es primo y cómo trabaja con restos? ¿Y qué tienen de especial los Fibonacci?

## La idea

- **`gcd(a, b)`** es el máximo común divisor, y **`xgcd(a, b)`** lo escribe como combinación de *a* y *b* (la identidad de Bézout). Por dentro, el algoritmo de Euclides.
- **`is_prime(n)`** decide si *n* es primo, y **`factor(n)`** lo descompone en primos. Los hace PARI.
- **`Zmod(n)`** son los restos al dividir entre *n*, con su propia suma y su propio producto: la aritmética **modular**. Allí 3 + 5 = 1 si se trabaja módulo 7.

## Construcción

### 1 · Euclides a mano

El mcd de dos números no cambia si al mayor se le resta el menor, ni si se le quita el menor tantas veces como quepa: mcd(*a*, *b*) = mcd(*b*, *a* mod *b*). Repitiendo, el segundo número baja hasta 0, y entonces el primero es el mcd.

:::{tip} Predice
2584 entre 144: ¿cuántas veces cabe, y qué resto queda?
:::

```{code-cell} sage
a = 2584
b = 144
while b != 0:
    print(a, "=", a // b, "·", b, "+", a % b)
    a, b = b, a % b
a
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/17-primos-1.json","config":{"titulo":"Tres divisiones","etiqueta":"algoritmo de Euclides · // y %","idea":"2584 = 17·144 + 136, 144 = 1·136 + 8 y 136 = 17·8 + 0. Cuando el resto es 0, el mcd es el último divisor: 8. Y 8 es F₆, el mcd de F₁₈ y F₁₂.","columnas":["a","b"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- La consola escribe una división en cada vuelta: `2584 = 17 · 144 + 136`, `144 = 1 · 136 + 8` y `136 = 17 · 8 + 0`.
- `a // b` es el cociente y `a % b` el resto, los dos en ZZ.
- `a, b = b, a % b` cambia los dos a la vez: el divisor pasa a ser el dividendo, y el resto, el divisor.
- Cuando `b` llega a 0, el bucle termina y `a` vale `8`.

Solo hacen falta tres divisiones, aunque 2584 tenga cuatro cifras: Euclides es muy rápido. Y el resultado no es casualidad: 2584 es *F*₁₈, 144 es *F*₁₂ y 8 es *F*₆, con 6 = mcd(18, 12). Este programa solo usa enteros, y el laboratorio lo ejecuta entero en el navegador.

### 2 · `gcd`, `xgcd` y `lcm`

```{code-cell} sage
gcd(2584, 144)
g, s, t = xgcd(2584, 144)
s*2584 + t*144
m = lcm(2584, 144)
gcd(2584, 144)*m == 2584*144
inverse_mod(5, 12)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/17-primos-2.json","config":{"titulo":"Bézout","etiqueta":"gcd · xgcd · lcm · inverse_mod","idea":"xgcd da el mcd y dos números s y t con s·2584 + t·144 = 8: aquí s = −1 y t = 18. El mcd por el mcm es el producto. Y como mcd(5, 12) = 1, 5 tiene inverso módulo 12: el propio 5, porque 25 = 2·12 + 1.","columnas":["g","s","t","m"],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `gcd(2584, 144)` escribe `8`. Lo calcula **GMP**: Sage acaba en su función `mpz_gcd`.
- `xgcd(2584, 144)` da tres números: `g` = `8`, `s` = `-1` y `t` = `18`. Por dentro, `mpz_gcdext`, también de GMP.
- `s*2584 + t*144` escribe `8`: −2584 + 2592 = 8. Es la **identidad de Bézout**: el mcd siempre se escribe como *s*·*a* + *t*·*b*, con *s* y *t* enteros.
- `m` vale `46512`, el **mínimo común múltiplo**, y `gcd(2584, 144)*m == 2584*144` escribe `True`.
- `inverse_mod(5, 12)` escribe `5`: 5·5 = 25 = 2·12 + 1, así que 5 es su propio **inverso** módulo 12.

Bézout es lo que hay detrás de `inverse_mod`. Si mcd(*a*, *n*) = 1, entonces *s*·*a* + *t*·*n* = 1, y módulo *n* eso dice *s*·*a* = 1: *s* es el inverso de *a*. Si el mcd no es 1, no hay inverso (ejercicio 4).

### 3 · ¿Cuáles son primos?

```{code-cell} sage
f = [fibonacci(n) for n in [1..20]]
p = [n for n in [1..30] if is_prime(fibonacci(n))]
fibonacci(19)
factor(fibonacci(19))
factor(fibonacci(30))
is_prime(fibonacci(83))
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/17-primos-3.json","config":{"titulo":"Los Fibonacci primos","etiqueta":"fibonacci · is_prime · factor","idea":"Hasta F₃₀, los Fibonacci primos están en las posiciones 3, 4, 5, 7, 11, 13, 17, 23 y 29: todas primas, salvo el 4. Pero que la posición sea prima no basta: F₁₉ = 4181 = 37·113.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `f` es la lista de los veinte primeros Fibonacci. `fibonacci(n)` llama por defecto a la función `fibo` de **PARI**.
- `p` vale `[3, 4, 5, 7, 11, 13, 17, 23, 29]`: las posiciones *n* en las que *F*ₙ es primo, hasta 30.
- `fibonacci(19)` escribe `4181`, y `factor(fibonacci(19))` escribe `37 * 113`: 19 es primo, pero *F*₁₉ no.
- `factor(fibonacci(30))` escribe `2^3 * 5 * 11 * 31 * 61`.
- `is_prime(fibonacci(83))` escribe `True`: *F*₈₃ = 99194853094755497, de 17 cifras, es primo.

Hay una regla detrás: si *m* divide a *n*, *F*ₘ divide a *F*ₙ. Por eso, si *n* = 15 = 3·5, *F*₁₅ es múltiplo de *F*₃ = 2 y de *F*₅ = 5, y no puede ser primo. El 4 es la excepción porque *F*₂ = 1 no cuenta como divisor.

`is_prime` lo responde **PARI**, con la función `isprime`. Y no es una apuesta: por defecto, Sage pide una **demostración** de que el número es primo. La de *F*₈₃ tarda menos de lo que se tarda en leerla.

### 4 · Congruencias: la aritmética de los restos

Dos números son **congruentes** módulo 7 si dan el mismo resto al dividir entre 7: 10 ≡ 3 (mod 7). En Sage, los restos módulo 7 forman un anillo propio, `Zmod(7)`, donde las cuentas ya se hacen con restos.

```{code-cell} sage
R = Zmod(7)
a = R(3)
a^6
a^-1
[fibonacci(n) % 7 for n in [0..17]]
F = matrix(Zmod(7), [[1, 1], [1, 0]])
F^8
F.multiplicative_order()
power_mod(3, 100, 7)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/17-primos-4.json","config":{"titulo":"Restos que se repiten","etiqueta":"Zmod(7) · Fermat · periodo","idea":"En Zmod(7), 3⁶ = 1: es el pequeño teorema de Fermat. Los Fibonacci módulo 7 se repiten cada 16 términos, porque la matriz F, con entradas en Zmod(7), cumple F¹⁶ = I. Y 3¹⁰⁰ = 3⁴ = 4, porque 100 = 6·16 + 4.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `R` es el anillo de los restos módulo 7, *Ring of integers modulo 7*, con la etiqueta `anillo`: es un padre, como ZZ o QQ.
- `a` vale `3`, con la etiqueta `Zmod(7)`: no es el entero 3, sino el **resto** 3 módulo 7.
- `a^6` escribe `1`. Es el **pequeño teorema de Fermat**: si *p* es primo y *a* no es múltiplo de *p*, *a*ᵖ⁻¹ ≡ 1 (mod *p*).
- `a^-1` escribe `5`: 3·5 = 15 ≡ 1 (mod 7). Dividir es posible.
- La lista de los Fibonacci módulo 7 es `[0, 1, 1, 2, 3, 5, 1, 6, 0, 6, 6, 5, 4, 2, 6, 1, 0, 1]`: a partir de la posición 16 vuelve a empezar, 0, 1…
- `F^8` es `[6 0; 0 6]`: 6 ≡ −1, así que *F*⁸ = −I. Lo multiplica **LinBox**, como las matrices de GF(*p*) del capítulo 12.
- `F.multiplicative_order()` escribe `16`: la primera potencia que da la identidad. Por eso la sucesión se repite cada 16.
- `power_mod(3, 100, 7)` escribe `4`. Con Fermat sale sin calcular 3¹⁰⁰: 100 = 6·16 + 4, así que 3¹⁰⁰ ≡ 3⁴ = 81 ≡ 4.

`Zmod(7)` y `GF(7)` tienen la misma aritmética: como 7 es primo, todo resto que no sea 0 tiene inverso, y los restos forman un **cuerpo**. Con un módulo que no es primo, como 9, `Zmod(9)` es un anillo donde el 3 no tiene inverso.

::::{div}
:class: afondo
### 5 · El número que engaña a Fermat

El pequeño teorema de Fermat da una prueba rápida: si *a*ⁿ⁻¹ ≢ 1 (mod *n*), entonces *n* **no** es primo. ¿Vale al revés? Si *a*ⁿ⁻¹ ≡ 1, ¿*n* es primo?

```{code-cell} sage
n = 561
Mod(2, n)^(n - 1)
Mod(5, n)^(n - 1)
is_prime(n)
factor(n)
[a for a in [2..20] if Mod(a, n)^(n - 1) != 1]
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/17-primos-5.json","config":{"titulo":"561 se hace pasar por primo","etiqueta":"Carmichael · Fermat · is_prime","idea":"2⁵⁶⁰ y 5⁵⁶⁰ dan 1 módulo 561, como si 561 fuera primo. No lo es: 561 = 3·11·17. Los únicos a que lo delatan son los múltiplos de 3, 11 o 17. Es un número de Carmichael, y is_prime no se deja engañar.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `Mod(2, n)^(n - 1)` escribe `1`, y con 5 también: 561 pasa la prueba de Fermat.
- `is_prime(n)` escribe `False`, y `factor(n)` escribe `3 * 11 * 17`.
- La lista de los *a* entre 2 y 20 que **sí** delatan a 561 es `[3, 6, 9, 11, 12, 15, 17, 18]`: justo los múltiplos de 3, de 11 o de 17.

561 es el primer **número de Carmichael**: un compuesto *n* con *a*ⁿ⁻¹ ≡ 1 para **todo** *a* sin factores comunes con *n*. Una prueba de Fermat con *a* = 2, 5, 7… nunca lo descubre. Solo lo delata un *a* que comparta un factor con 561, y eso ya es haber encontrado un divisor.

Por eso `is_prime` no usa Fermat. Llama a la función `isprime` de PARI, que **demuestra** si el número es primo, combinando varios algoritmos de certificación. Si solo se quiere una prueba rápida, sin demostración, está `is_pseudoprime(n)`: usa la prueba de Baillie-PSW, de la que no se conoce ningún número compuesto que la engañe. Para 561 también da `False`.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
mcd, Bézout, primos y restos (comprobado con Sage 10.8, SymPy 1.14 y Julia 1.13):

| | Sage | Python con SymPy | Julia |
|---|---|---|---|
| mcd | `gcd(2584, 144)` da `8` | `gcd(2584, 144)` da `8` | `gcd(2584, 144)` da `8` |
| Bézout | `xgcd(2584, 144)` da `(8, -1, 18)` | `gcdex(2584, 144)` da `(-1, 18, 8)` (el mcd al final) | `gcdx(2584, 144)` da `(8, -1, 18)` |
| Factorizar | `factor(4181)` da `37 * 113` | `factorint(4181)` da `{37: 1, 113: 1}` | `factor(4181)` da 37 · 113, con el paquete `Primes` |
| ¿Primo? | `is_prime(561)` da `False` | `isprime(561)` da `False` | `isprime(561)` da `false`, con `Primes` |
| Inverso | `inverse_mod(5, 12)` da `5` | `mod_inverse(5, 12)` da `5` | `invmod(5, 12)` da `5` |
| Potencia | `power_mod(3, 100, 7)` da `4` | `pow(3, 100, 7)` (de Python) da `4` | `powermod(3, 100, 7)` da `4` |

Solo Sage tiene un anillo para los restos, `Zmod(7)`, donde `3^6` ya da `1`. En SymPy y en Julia se trabaja con enteros y se toma el resto cada vez. Sin inverso, Sage da `ZeroDivisionError`, SymPy `ValueError` y Julia `DomainError`.
:::

## Conexiones

- `//` y `%` son los del capítulo 1, con enteros exactos de GMP.
- Las matrices de GF(*p*) de los capítulos 12 y 14 son matrices con entradas en `Zmod(p)`: el inverso módulo 5 del capítulo 14 es el `inverse_mod` de este capítulo.
- La matriz *F* del capítulo 16 vuelve con entradas en `Zmod(7)`: allí *F*⁸ = −I y *F*¹⁶ = I. El orden de una matriz es a las potencias lo que el periodo es a la sucesión.
- Fermat con `power_mod` hace lo mismo que *B*¹⁰ = *P*·*D*¹⁰·*P*⁻¹ en el capítulo 16: evitar una potencia enorme cambiando a un sitio donde es fácil.

## La grieta

Los enteros tienen mcd, primos y restos. Los **polinomios** también: se dividen con cociente y resto, tienen mcd, y se descomponen en «polinomios primos», los **irreducibles**. Pero el resultado depende de dónde vivan los coeficientes. *x*⁴ + 1 no se factoriza con coeficientes racionales; en cambio, módulo 2 es (*x* + 1)⁴, y módulo 3, 5, 7… también se parte en dos trozos. ¿Cómo puede un polinomio ser irreducible y factorizarse módulo cualquier primo? El capítulo 18, **Polinomios y anillos**.

## Ejercicios

1. **Otros dos Fibonacci.** ¿Qué da `gcd(610, 55)`? ¿Qué Fibonacci son 610, 55 y el resultado?

2. **Bézout pequeño.** ¿Qué da `xgcd(7, 3)`? ¿Cómo se lee en ella el inverso de 3 módulo 7?

3. **El error de Fermat.** Fermat creyó que todos los números 2^(2^*k*) + 1 eran primos. ¿Qué da `factor(2^32 + 1)`?

4. **Sin inverso.** ¿Qué da `Mod(3, 9)^-1`? ¿Por qué?

5. **Dos restos a la vez.** ¿Qué da `crt(2, 3, 5, 7)`? Comprueba qué restos deja al dividir entre 5 y entre 7.

6. **Traza a mano.** En el programa del apartado 1, cambia `a` y `b` por 610 y 55. ¿Qué escribe?

::::{div}
:class: afondo
7. **La regla del mcd.** ¿Qué da `all(gcd(fibonacci(m), fibonacci(n)) == fibonacci(gcd(m, n)) for m in [1..30] for n in [1..30])`?

8. **Otros periodos.** ¿Qué dan `matrix(GF(p), [[1, 1], [1, 0]]).multiplicative_order()` para *p* = 2, 3, 5 y 11?
::::

## Solucionario

1. `5`. 610 = *F*₁₅, 55 = *F*₁₀ y 5 = *F*₅, con 5 = mcd(15, 10).
2. `(1, 1, -2)`: 1·7 − 2·3 = 1. Módulo 7, eso dice −2·3 ≡ 1, así que el inverso de 3 es −2 ≡ 5, el mismo que daba `a^-1` en el apartado 4.
3. `641 * 6700417`. Euler encontró este divisor en 1732: 2³² + 1 no es primo.
4. `ZeroDivisionError: inverse of Mod(3, 9) does not exist`. mcd(3, 9) = 3, no 1: no hay *s* con 3·*s* ≡ 1 (mod 9), porque 3·*s* siempre es múltiplo de 3.
5. `17`: 17 = 3·5 + 2 y 17 = 2·7 + 3. Es el **teorema chino de los restos**: como 5 y 7 no tienen factores comunes, hay un único número módulo 35 con esos dos restos.
6. `610 = 11 · 55 + 5`, `55 = 11 · 5 + 0` y, al final, `5`.

::::{div}
:class: afondo
7. `True`: mcd(*F*ₘ, *F*ₙ) = *F*ₘcd₍ₘ,ₙ₎ para todos los pares hasta 30. Es la regla que hay detrás del apartado 1.
8. `3`, `8`, `20` y `10`: los Fibonacci se repiten cada 3 términos módulo 2 (par, impar, impar…), cada 8 módulo 3, cada 20 módulo 5 y cada 10 módulo 11. Se llaman **periodos de Pisano**.
::::
