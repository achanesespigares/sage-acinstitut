# Mirar y ver · SageMath · cómo piensa tu código

Aprender SageMath viendo cómo se ejecuta cada programa, línea a línea y con la memoria a la vista. Es el cuarto libro de la colección, después de los de Python, R y Julia. Está hecho con Jupyter Book 2 (motor MyST) y se publica en GitHub Pages.

## Las dos rutas

Cada capítulo tiene una **ruta base** (para el aula y el autoestudio) y apartados **A fondo** (cómo funciona Sage por dentro y cómo se trabaja como profesional), como los niveles SL y HL del IB. Un apartado «A fondo» se escribe así:

```markdown
:::{div}
:class: afondo
### 4 · Cómo guarda Sage una fracción
…
:::
```

Si el apartado lleva dentro otra directiva (un bloque de código, un visualizador), se abre y se cierra con `::::{div}`. El interruptor `widgets/rutas.mjs`, al principio de cada capítulo, oculta o muestra esos bloques. La elección se recuerda en el navegador.

## Estructura

```
myst.yml                    configuración e índice del libro
index.md                    portada
capitulos/                  un fichero por capítulo
widgets/traza-sage.mjs      el visualizador de trazas y el laboratorio
widgets/rutas.mjs           el interruptor de las dos rutas
herramientas/trazar.py      ejecuta los programas con Sage paso a paso y escribe las trazas en datos/trazas/
herramientas/laboratorio.py el puente entre el laboratorio del navegador y trazar.py
herramientas/conformidad.py compara el mini-Sage con Sage de verdad
lab/minisage.py             el Sage pequeño del laboratorio (enteros, fracciones, decimales)
lab/preparse_sage.py        el preparador de Sage, copiado de passagemath (GPL-2.0-or-later)
lab/nombres_sage.json       los nombres de Sage: los que el mini-Sage no sabe usar avisan
lab/pruebas/                el banco de pruebas de la conformidad
estilo/ac-institut.css      piel AC Institut (vino, Montserrat, Arimo, IBM Plex Mono) y cápsulas «A fondo»
.github/workflows/          publicación automática y conformidad
```

## Trabajar con el libro

Requisitos: Node 18 o superior y Python 3.13 con Sage. El libro se comprueba con passagemath 10.8.14, que se instala con pip:

```bash
npm ci                                         # instala MyST en la versión fijada
python -m venv .sage && . .sage/bin/activate   # un entorno para Sage
pip install -r herramientas/requisitos.txt     # Sage (passagemath)
npm run trazas                                 # regenera las trazas con Sage
npm run conformidad                            # el mini-Sage frente a Sage
npx myst start                                 # vista previa en el navegador
```

Cada visualizador va en el capítulo así: una celda de código y, justo después, la directiva con su configuración. `trazar.py` ejecuta la celda con Sage y guarda la traza en `datos/trazas/`:

````markdown
```{code-cell} sage
a = 2^10
b = a / 3
```

```{anywidget} ../widgets/traza-sage.mjs
{"config":{"titulo":"…","etiqueta":"…","idea":"…","columnas":["a","b"],"fila_en":"cada_linea"}}
```
````

## Licencia

Texto y código del libro: CC BY-NC-SA 4.0. `lab/preparse_sage.py` es una copia del preparador de SageMath (passagemath-repl) y conserva su licencia, GPL-2.0-or-later.
