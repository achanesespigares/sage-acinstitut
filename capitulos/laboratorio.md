---
title: Laboratorio
subtitle: Tu propio Sage, paso a paso, en el navegador (en construcción)
---

En los otros libros de la colección, el laboratorio ejecuta tu código en el propio navegador y lo dibuja paso a paso, como los visualizadores de los capítulos. Con Sage eso no viene hecho: Sage completo no cabe en un navegador. Así que este laboratorio junta **lo máximo que se puede tener hoy**: un Sage pequeño que corre aquí mismo y se dibuja paso a paso, y Sage completo a un botón de distancia. Irá creciendo con el libro.

:::{important} Lo que hay hoy
| | Qué es | Estado |
|---|---|---|
| **Sage en el navegador** | Tu programa, ejecutado y dibujado aquí mismo, como en los capítulos | Funciona con enteros, fracciones y decimales; crece con el libro |
| **Sage real en la página** | Sage completo en SageMathCell, el servidor público de Sage, sin salir de esta página | Funciona |
| **Sage en la nube con cuaderno** | CoCalc, para guardar tu trabajo | Funciona, con cuenta |
| **Sage en tu ordenador** | Sage instalado en tu máquina: la forma de trabajar de verdad | Funciona |
:::

## 1 · Sage en el navegador

Escribe tu programa, o elige un ejemplo, y pulsa **Ejecutar y ver**. El botón **Sage real** ejecuta ese mismo programa con Sage completo, justo debajo.

```{anywidget} ../widgets/traza-sage.mjs
{"config":{"tipo":"laboratorio"}}
```

:::{note} Cómo funciona por dentro
Sage es Python más cientos de programas compilados (PARI, FLINT, Maxima, GAP…), y eso no cabe en un navegador. Aquí corre Python de verdad, gracias a [Pyodide](https://pyodide.org/), con un **mini-Sage** escrito para este libro. Hace lo mismo que Sage con los enteros (`ZZ`), las fracciones (`QQ`) y los decimales de 53 bits (`RR`): cada valor con su padre, la coerción entre ellos y la misma forma de escribirse. Tu programa pasa antes por el **preparador de Sage**, el mismo que usa Sage, copiado tal cual. El trazador también es el mismo que dibuja los capítulos.

Para que no se aparte ni un milímetro de Sage, un banco de pruebas ejecuta cada programa con el mini-Sage y con Sage de verdad, y compara las dos trazas paso a paso: valores, padres, consola, errores y quién hace el cálculo. Cuando algo no lo sabe hacer, como una variable simbólica o una integral, **lo dice** y te manda a Sage real, en lugar de inventarse un resultado.
:::

## 2 · Sage real en la página

Debajo de cada visualizador de los capítulos, y aquí en el laboratorio, el botón **Sage real** abre el programa en [SageMathCell](https://sagecell.sagemath.org/), el servidor público de Sage. El programa viaja hasta allí, se ejecuta con Sage completo y vuelve la respuesta. Puedes cambiarlo y volver a pulsar **Ejecutar en Sage** las veces que quieras.

Ten en cuenta tres cosas:

- **Necesita conexión.** El cálculo no se hace en tu ordenador, sino en el servidor.
- **Solo enseña la última línea.** SageMathCell escribe el valor de la última línea del programa, no el de cada una como la consola. Para ver otra cosa, usa `print()`.
- **No lo hemos hecho nosotros.** SageMathCell es un servicio público del proyecto Sage. Úsalo con cariño.

## 3 · Sage en la nube con cuaderno

Para guardar lo que haces y volver otro día, [CoCalc](https://cocalc.com/features/sage) ofrece cuadernos de Jupyter con Sage. Basta con crear una cuenta gratuita. Las cuentas gratuitas tienen límites de memoria y de disco, y las de pago amplían recursos.

## 4 · Sage en tu ordenador

Es la forma de trabajar de verdad. La [guía oficial de instalación](https://doc.sagemath.org/html/en/installation/index.html) recomienda:

- **macOS**: la aplicación de Sage que prepara el proyecto 3-manifolds, firmada y lista para instalar, o conda como en Linux.
- **Linux**: conda. Con [Miniforge](https://github.com/conda-forge/miniforge) instalado, escribe en el terminal:

  ```text
  conda create -n sage sage python=3.13
  conda activate sage
  sage
  ```

- **Windows**: la guía oficial instala Sage dentro de Ubuntu, que corre en Windows gracias a WSL 2, y ahí dentro usa conda.

Hay otra vía más ligera, la que usa este libro para comprobar sus trazas: [passagemath](https://github.com/passagemath/passagemath), una variante de Sage dividida en paquetes que se instalan con `pip`, en Linux y en macOS.

```text
pip install passagemath-standard
```

Después, en Python, `from sage.all import *` carga Sage.
