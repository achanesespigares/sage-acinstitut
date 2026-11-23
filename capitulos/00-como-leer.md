---
title: Cómo leer este libro
---

Cada capítulo sigue el mismo recorrido, el del método genético-constructivo:

1. Un **punto de partida** cotidiano.
2. La **pregunta** que lo generaliza.
3. La **idea** mínima que lo sostiene.
4. La **construcción** con código.
5. Las **conexiones** con otros temas.
6. Una **grieta**: algo que el capítulo deja abierto y que lleva al siguiente.

## Las dos rutas

Lo que no es imprescindible va en apartados marcados **A fondo**, con su cápsula negra y un filete a la izquierda. Si sigues la ruta base, puedes ocultarlos con el interruptor que hay al principio de cada capítulo. Así lo que lees nunca da un salto.

```{anywidget} ../widgets/rutas.mjs
{}
```

:::{div}
:class: afondo
Esto es un apartado «A fondo». Si eliges la ruta base, desaparece de la página.
:::

## Los visualizadores

Debajo de los programas clave hay un visualizador. Las trazas no son un dibujo hecho a mano: salen de ejecutar el programa con Sage de verdad, línea a línea. Este es el primero:

```{code-cell} sage
a = 2^10
b = a / 3
c = b + 0.5
n = len([1, 2, 3])
factor(a)
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/00-como-leer-1.json","config":{"titulo":"Lo que ve el visualizador","etiqueta":"padres · preparador · motor","idea":"Cada valor lleva la etiqueta de su padre: ZZ, QQ, RR… o int si es de Python. Mira también cómo reescribe Sage cada línea antes de ejecutarla y quién hace el cálculo.","columnas":["a","b","c","n"],"fila_en":"cada_linea","mostrar_tipos":true}}
```

Así se usa:

- **Paso ▶** ejecuta la siguiente línea; **◀** vuelve atrás; **Reproducir** avanza solo.
- La línea marcada con **▶** es la que se acaba de ejecutar.
- En **Memoria** aparece cada variable con la etiqueta de su **padre**, el conjunto de números al que pertenece. `a` vale 1024 y vive en `ZZ`, los enteros. `b` vale 1024/3 y vive en `QQ`, los racionales: Sage no redondea, guarda la fracción exacta. `c` vive en `RR`, los reales con 53 bits de precisión, que es como Sage llama a los decimales. Si dejas el dedo o el ratón sobre la etiqueta, aparece el nombre completo del padre: *Integer Ring*, *Rational Field*… Lo que acaba de cambiar se resalta en vino.
- Una etiqueta gris, como la de `n`, avisa de que ese valor **no es de Sage, sino de Python**. `len()` es una función de Python y devuelve un `int` de Python, no un entero de Sage. Casi siempre da igual, pero a veces no, y entonces conviene verlo.
- El recuadro **El preparador de Sage la reescribe así** enseña lo que Sage hace con tu línea antes de ejecutarla. Sage es Python por dentro, y Python no entiende `2^10` como una potencia ni `1/3` como una fracción. Así que Sage traduce: `2^10` pasa a `Integer(2)**Integer(10)` y `0.5` pasa a `RealNumber('0.5')`.
- El recuadro **Quién hace el cálculo** dice qué programa de dentro de Sage ha trabajado en esa línea: GMP con los enteros y las fracciones, MPFR con los decimales, PARI al factorizar, Maxima al integrar… Solo aparece cuando se puede asegurar. Si no, no se inventa.
- Las variables **locales** de una función se ven en su propio marco, y desaparecen al terminar la llamada.
- Cuando el programa evalúa una condición, la ves en tres tiempos: la expresión, la expresión con los valores de ese momento y el resultado (`True` o `False`).
- La **tabla de traza** se rellena sola, una fila por línea o por vuelta del bucle.
- **Modo predicción** tapa con «?» lo que va a cambiar en el paso siguiente, para que lo pienses antes de verlo. **Proyectar** pone el visualizador a pantalla completa, para la clase.
- **Sage real** abre debajo el mismo programa en SageMathCell, el servidor público de Sage, para que lo ejecutes con Sage completo y lo cambies a tu gusto.

Los programas se ejecutan como en la consola de Sage, la ventana donde se escribe línea a línea. Por eso en la **consola** del visualizador se ve el valor de cada línea que no es una asignación: en este programa, el `2^10` que devuelve `factor(a)`. Ojo, que las posiciones de una lista empiezan en **0**, como en Python. Si vienes del libro de Julia, ahí empezaban en 1.

## La misma idea en tres lenguajes

En algunos capítulos hay un recuadro con el mismo problema resuelto en Sage, en Python con SymPy y en Julia con Symbolics. Sirve para ver qué es propio de Sage y qué es común a todos, y conecta este libro con los otros de la colección.
