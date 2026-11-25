---
title: Grafos
subtitle: Puntos, líneas y caminos, y una matriz que lo sabe todo de ellos
---

```{anywidget} ../widgets/rutas.mjs
{}
```

## Punto de partida

El capítulo 19 acabó con una figura: 23 personas como puntos y una línea por cada pareja, 253 en total. Si solo se unen las parejas que se conocen, o las ciudades que tienen carretera directa, sale un dibujo distinto, con menos líneas.

Ese dibujo es un **grafo**. Los puntos se llaman **vértices**, y las líneas, **aristas**. Lo que importa no es dónde se dibujan los puntos, sino quién está unido con quién.

## La pregunta

¿Cómo se guarda un grafo en un programa? ¿Cómo se encuentra el camino más corto entre dos vértices? ¿Y qué tienen que ver los grafos con las matrices y con los polinomios de los capítulos anteriores?

## La idea

- Un grafo se puede guardar como un **diccionario de vecinos**: cada vértice, con la lista de los vértices a los que está unido.
- El **recorrido en anchura** (BFS, por *breadth-first search*) encuentra las distancias desde un vértice: primero sus vecinos, luego los vecinos de los vecinos…
- Sage tiene la clase **`Graph`** y un catálogo de grafos famosos, **`graphs`**. Con ellos, contar, buscar caminos o comparar grafos es una sola línea.
- La **matriz de adyacencia** convierte el grafo en una matriz de 0 y 1. Sus potencias, su polinomio característico y su determinante cuentan cosas del grafo.

## Construcción

### 1 · El recorrido en anchura

Seis vértices, de A a F, y siete aristas. El diccionario `vecinos` dice, para cada vértice, a quién está unido. Cada arista aparece dos veces: A tiene a B en su lista, y B tiene a A en la suya.

El recorrido usa una **cola**: una lista en la que se entra por el final y se sale por el principio. El primero en llegar es el primero en ser atendido.

:::{tip} Predice
A está a distancia 0 de sí mismo. B y C, a distancia 1. ¿A qué distancia está F?
:::

```{code-cell} sage
vecinos = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A', 'D', 'E'], 'D': ['B', 'C', 'F'], 'E': ['C', 'F'], 'F': ['D', 'E']}
dist = {'A': 0}
cola = ['A']
while cola:
    u = cola.pop(0)
    for v in vecinos[u]:
        if v not in dist:
            dist[v] = dist[u] + 1
            cola.append(v)
dist
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/20-grafos-1.json","config":{"titulo":"Primero los vecinos, luego los vecinos de los vecinos","etiqueta":"recorrido en anchura · cola · diccionario","idea":"La cola empieza con A. Cada vez sale el primero, y sus vecinos que aún no tienen distancia entran por el final, con una unidad más. Al terminar, dist dice a qué distancia está cada vértice de A: F, a 3.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true}}
```

- Sale A, y entran B y C, con distancia `1`.
- Sale B. A ya tiene distancia, así que solo entra D, con distancia `2`.
- Sale C. A y D ya tienen distancia: solo entra E, con `2`.
- Sale D, y entra F, con `3`. Los demás ya no añaden nada, y la cola se vacía.
- La última línea escribe `{'A': 0, 'B': 1, 'C': 1, 'D': 2, 'E': 2, 'F': 3}`.

Como la cola atiende por orden de llegada, los vértices salen ordenados por distancia: primero los de distancia 1, luego los de 2… Por eso, la primera vez que se llega a un vértice, se llega por el camino más corto.

Este programa solo usa diccionarios, listas y enteros: el laboratorio lo ejecuta entero en el navegador.

### 2 · El mismo grafo en Sage

Con `Graph`, basta con escribir cada arista una vez: Sage sabe que una arista une a los dos vértices.

```{code-cell} sage
G = Graph({'A': ['B', 'C'], 'B': ['D'], 'C': ['D', 'E'], 'D': ['F'], 'E': ['F']})
G.order()
G.size()
G.degree('C')
G.shortest_path('A', 'F')
G.distance('A', 'F')
G.plot(layout='circular')
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/20-grafos-2.json","config":{"titulo":"Un grafo de Sage","etiqueta":"Graph · order · shortest_path","idea":"G tiene 6 vértices y 7 aristas, y C está unido a 3 vértices. El camino más corto de A a F pasa por B y D, y tiene 3 aristas, la misma distancia que el recorrido en anchura. Y G.plot lo dibuja.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `G.order()` escribe `6`: el **orden** es el número de vértices.
- `G.size()` escribe `7`: el **tamaño** es el número de aristas.
- `G.degree('C')` escribe `3`: el **grado** de un vértice es el número de aristas que salen de él.
- `G.shortest_path('A', 'F')` escribe `['A', 'B', 'D', 'F']`, y `G.distance('A', 'F')` escribe `3`, como `dist['F']` en el apartado 1. Sage también hace un recorrido en anchura, pero desde A y desde F a la vez, hasta que se encuentran (su algoritmo se llama `BFS_Bid`, de *bidirectional*).
- `G.plot(layout='circular')` dibuja el grafo con los vértices en círculo. Sin `layout`, Sage los coloca con un poco de azar, y el dibujo puede cambiar de una vez a otra. Pero el grafo es el mismo: solo importa quién está unido con quién.

**Trampa:** `G.order()`, `G.size()` y `G.distance('A', 'F')` dan enteros de **Python**, no de Sage. Y `G` no lleva un padre como ZZ o QQ, sino su clase, `Graph`. La grieta de este capítulo sale de ahí.

### 3 · Contar aristas: el apretón de manos

Si en una sala de 23 personas cada una da la mano a todas las demás, ¿cuántos apretones hay? Es el **grafo completo** de 23 vértices, en el que cada pareja está unida.

```{code-cell} sage
K = graphs.CompleteGraph(23)
K.size()
sum(K.degree()) == 2*K.size()
M = Graph({'A': ['B', 'B', 'C', 'C', 'D'], 'B': ['D'], 'C': ['D']}, multiedges=True)
M.degree()
M.is_eulerian()
M.plot(layout='circular')
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/20-grafos-3.json","config":{"titulo":"Cada arista, dos extremos","etiqueta":"grafo completo · grados · Königsberg","idea":"K₂₃ tiene 253 aristas, las 253 parejas del cumpleaños. La suma de los grados es el doble de las aristas, porque cada arista se cuenta desde sus dos extremos. En Königsberg, los cuatro grados son impares: no hay paseo que cruce cada puente una sola vez.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `K.size()` escribe `253` = binomial(23, 2): las parejas del problema del cumpleaños del capítulo 19.
- Cada uno de los 23 vértices tiene grado 22, y 23·22 = 506 = 2·253. `sum(K.degree()) == 2*K.size()` escribe `True`.
- Es el **lema del apretón de manos**: la suma de los grados es el doble del número de aristas, en cualquier grafo, porque cada arista se cuenta una vez desde cada extremo.

`M` es la ciudad de **Königsberg** en 1736: A es la isla del centro, B y C las dos orillas, D la otra isla, y cada arista es un puente. Hay dos puentes entre A y B, y otros dos entre A y C: por eso hace falta `multiedges=True`, que permite aristas repetidas.

- `M.degree()` escribe `[5, 3, 3, 3]`: los cuatro grados son impares.
- `M.is_eulerian()` escribe `False`: no hay un paseo que cruce cada puente una sola vez y vuelva al punto de partida.

Euler lo demostró así. Cada vez que el paseo pasa por un lugar, entra por un puente y sale por otro: gasta los puentes de dos en dos. Así que todos los grados tendrían que ser pares. Si se permite acabar en otro sitio, puede haber dos lugares con grado impar, el de salida y el de llegada, pero no cuatro (ejercicio 8).

### 4 · La matriz de adyacencia

El **grafo de Petersen** tiene 10 vértices, cada uno de grado 3, y es famoso porque sirve de contraejemplo a muchas conjeturas. Su **matriz de adyacencia** `A` tiene un 1 en la fila *i*, columna *j*, si los vértices *i* y *j* están unidos, y un 0 si no.

```{code-cell} sage
P = graphs.PetersenGraph()
A = P.adjacency_matrix()
A2 = A^2
A2[0, 0]
A3 = A2*A
A3[0, 1]
p = A.charpoly()
p.factor()
P.spanning_trees_count()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/20-grafos-4.json","config":{"titulo":"Una matriz que cuenta caminos","etiqueta":"adyacencia · charpoly · árboles","idea":"La casilla (i, j) de Aᵏ cuenta los caminos de k pasos de i a j. Del 0 al 0 hay 3 de dos pasos: ir a un vecino y volver. El polinomio característico es (x − 3)(x + 2)⁴(x − 1)⁵, y el grafo tiene 2000 árboles generadores.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `A` es una matriz de 10×10 de enteros, en `Mat(10×10, ZZ)`. `A2 = A^2` y `A3 = A2*A` las calcula **FLINT**, como las matrices de enteros del capítulo 12.
- La casilla (*i*, *j*) de `A^k` cuenta los **caminos de *k* pasos** del vértice *i* al *j*. `A2[0, 0]` escribe `3`: los tres caminos que van del 0 a uno de sus 3 vecinos y vuelven.
- `A3[0, 1]` escribe `5`: hay 5 caminos de tres pasos del vértice 0 al 1.
- `p = A.charpoly()` es un polinomio de ZZ[x] de grado 10. Lo calcula **LinBox**, como en el capítulo 16.
- `p.factor()` escribe `(x - 3) * (x + 2)^4 * (x - 1)^5`. Esta vez lo factoriza **NTL**: para los polinomios de ZZ[x] de grado menor que 30, Sage elige esta biblioteca.
- Los autovalores son 3, −2 (cuatro veces) y 1 (cinco veces). El 3 es el grado: en un grafo en el que todos los vértices tienen grado *d*, *d* siempre es autovalor.
- `P.spanning_trees_count()` escribe `2000`. Un **árbol generador** es una forma de quedarse con 9 de las 15 aristas sin cerrar ningún ciclo y sin dejar ningún vértice suelto.

Para contarlos, Sage usa el **teorema de Kirchhoff**: los árboles generadores son el determinante de una matriz de 9×9 de enteros, que calcula FLINT. Con los autovalores sale la misma cuenta: (1/10)·5⁴·2⁵ = 2000.

::::{div}
:class: afondo
### 5 · Dos grafos que son el mismo

El **grafo de Kneser** K(5, 2) se construye de otra manera. Sus vértices son las parejas de {1, 2, 3, 4, 5}, binomial(5, 2) = 10, y dos parejas están unidas si no tienen ningún número en común.

```{code-cell} sage
P = graphs.PetersenGraph()
K = graphs.KneserGraph(5, 2)
K.order()
K.size()
K.neighbors(Set([1, 2]))
K.is_isomorphic(P)
P.automorphism_group().order()
```

```{anywidget} ../widgets/traza-sage.mjs
{"archivo":"datos/trazas/20-grafos-5.json","config":{"titulo":"Petersen, disfrazado","etiqueta":"Kneser · isomorfismo · simetrías","idea":"K(5, 2) tiene 10 vértices y 15 aristas, como Petersen. Y no es un parecido: hay una forma de renombrar sus vértices que convierte uno en el otro. Petersen tiene 120 simetrías, tantas como maneras de reordenar 1, 2, 3, 4 y 5.","columnas":[],"fila_en":"cada_linea","mostrar_tipos":true,"solo_sage":true}}
```

- `K.order()` escribe `10`, y `K.size()` escribe `15`.
- `K.neighbors(Set([1, 2]))` escribe `[{3, 4}, {3, 5}, {4, 5}]`: las parejas que no tocan ni el 1 ni el 2. Cada vértice tiene grado binomial(3, 2) = 3, como en Petersen.
- `K.is_isomorphic(P)` escribe `True`. Dos grafos son **isomorfos** si se pueden renombrar los vértices de uno para obtener exactamente el otro.
- `P.automorphism_group().order()` escribe `120`. Una **simetría** del grafo (un *automorfismo*) es un renombramiento que lo deja igual, y el grafo de Petersen tiene 120.

En K(5, 2) se ven las 120 sin hacer ninguna cuenta. Si se reordenan los números 1, 2, 3, 4 y 5 (5! = 120 maneras, capítulo 19), las parejas disjuntas siguen siendo disjuntas. Cada reordenación mueve los vértices y deja el grafo igual.

Lo que devuelve `automorphism_group` es un **grupo de permutaciones**. Sage tiene una parte entera dedicada a los grupos, y su orden lo calcula el programa que hay detrás de muchos de ellos: **GAP**, que se presenta en el capítulo 24.
::::

:::{admonition} La misma idea en tres lenguajes
:class: seealso
Grafos (comprobado con Sage 10.8, NetworkX 3.7 y Julia 1.13 con Graphs.jl 1.15):

| | Sage | Python con NetworkX | Julia con Graphs.jl |
|---|---|---|---|
| Construir | `Graph({'A': ['B', 'C'], …})` | `nx.Graph({'A': ['B', 'C'], …})` | `g = SimpleGraph(6)` y `add_edge!(g, 1, 2)`…: los vértices son 1, 2, …, 6 |
| Vértices y aristas | `G.order()` y `G.size()` dan `6` y `7` | `G.number_of_nodes()` y `G.number_of_edges()` dan `6` y `7` | `nv(g)` y `ne(g)` dan `6` y `7` |
| Camino más corto | `G.shortest_path('A', 'F')` da `['A', 'B', 'D', 'F']` | `nx.shortest_path(G, 'A', 'F')`, igual | `enumerate_paths(dijkstra_shortest_paths(g, 1), 6)` da `[1, 2, 4, 6]` |
| Distancias | `G.distance('A', 'F')` da `3` | `nx.shortest_path_length(G, 'A', 'F')` da `3` | `gdistances(g, 1)` da `[0, 1, 1, 2, 2, 3]` |
| Königsberg | `M.is_eulerian()` da `False` | `nx.is_eulerian(nx.MultiGraph(…))` da `False` | `SimpleGraph` no admite aristas repetidas: el segundo `add_edge!` da `false` |
| Árboles de Petersen | `spanning_trees_count()` da `2000` | `nx.number_of_spanning_trees(nx.petersen_graph())` da `1999.9999999999998` | no trae una función para contarlos |

NetworkX cuenta los árboles con decimales: el determinante le sale con un error de redondeo, como el `0.1 + 0.2` del capítulo 1. Sage lo hace con enteros de FLINT y da 2000 exacto.
:::

## Conexiones

- El grafo completo de 23 vértices tiene binomial(23, 2) = 253 aristas: las parejas del problema del cumpleaños del capítulo 19.
- La matriz de adyacencia es una matriz de enteros como las del capítulo 12, y su polinomio característico y sus autovalores son los del capítulo 16.
- La factorización del polinomio característico conecta con el capítulo 18. Pero esta vez es en ZZ[x], y no la hace PARI, sino NTL.
- Las 120 simetrías del grafo de Petersen son las 5! = 120 permutaciones del capítulo 19.

## La grieta

Hasta aquí, cada valor de Sage llevaba una etiqueta: `ZZ`, `QQ`, `GF(7)`, `QQ[x]`, `Mat(10×10, ZZ)`… Es su **padre**, el conjunto al que pertenece. Pero `G` no tiene padre, y su etiqueta es su clase, `Graph`. Y `G.order()` da un entero de Python, no de ZZ.

¿Qué es exactamente un padre? ¿Por qué un entero y una matriz lo tienen y un grafo no? ¿Y qué hace Sage cuando se suman dos cosas con padres distintos, como `1 + 1/2`? Es la Parte V, que empieza con el capítulo 21, **Padres y elementos**.

## Ejercicios

1. **Un hexágono.** ¿Qué dan `C = graphs.CycleGraph(6)`, `C.order()` y `C.size()`?

2. **Diez personas.** ¿Qué da `graphs.CompleteGraph(10).size()`? ¿Y la suma de sus grados?

3. **Sin cruces.** Un grafo es **plano** si se puede dibujar sin que se crucen aristas. ¿Qué dan `graphs.CompleteGraph(4).is_planar()` y `graphs.CompleteGraph(5).is_planar()`?

4. **Colorear.** El **número cromático** es el mínimo de colores para pintar los vértices sin que dos vecinos tengan el mismo. ¿Qué dan `chromatic_number()` en `graphs.CycleGraph(5)`, `graphs.CycleGraph(6)` y `graphs.PetersenGraph()`?

5. **Árboles de K₄.** ¿Qué da `graphs.CompleteGraph(4).spanning_trees_count()`?

6. **Traza a mano.** En el programa del apartado 1, empieza en F: `dist = {'F': 0}` y `cola = ['F']`. ¿Qué escribe la última línea?

::::{div}
:class: afondo
7. **La fórmula de Cayley.** ¿Qué dan `spanning_trees_count()` en `graphs.CompleteGraph(5)` y en `graphs.CompleteGraph(6)`? Compáralos con 5³ y 6⁴.

8. **Un puente menos.** En el programa del apartado 3, añade `M.delete_edge('A', 'B')` después de crear `M`. ¿Qué dan `M.degree()`, `M.is_eulerian()` y `M.is_eulerian(path=True)`?
::::

## Solucionario

1. `6` y `6`: el ciclo de 6 vértices tiene 6 aristas, y cada vértice tiene grado 2.
2. `45` = binomial(10, 2). La suma de los grados es 10·9 = `90`, el doble de 45.
3. `True` y `False`: K₄ se puede dibujar sin cruces, como un triángulo con un punto en medio; K₅ no.
4. `3`, `2` y `3`. Un ciclo par se pinta alternando dos colores; uno impar necesita un tercero.
5. `16` = 4²: de las 6 aristas de K₄, hay 16 maneras de quedarse con 3 que unan los 4 vértices sin ciclos.
6. `{'F': 0, 'D': 1, 'E': 1, 'B': 2, 'C': 2, 'A': 3}`: el grafo es simétrico, y A queda a distancia 3 de F.

::::{div}
:class: afondo
7. `125` = 5³ y `1296` = 6⁴. Es la **fórmula de Cayley**: el grafo completo de *n* vértices tiene *n*ⁿ⁻² árboles generadores.
8. `[4, 2, 3, 3]`, `False` y `('C', 'D')`. Ahora solo hay dos lugares con grado impar: no se puede volver al punto de partida, pero sí hay un paseo que cruza cada puente una vez, de C a D.
::::
