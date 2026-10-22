# S09 · Práctica con Mouse

**Bloque 2 · Sesión 02 · Práctica de Diseño de Interacciones con Mouse / Cursor.**
Interacción y Renderizado Web Avanzado (CC325-21) · CENTRO · Jueves 22 de octubre de 2026.

Esta sesión no tiene conceptos nuevos: es práctica. Aplicamos lo de la sesión anterior ([S08 · Interacciones con Mouse](https://github.com/AndrewAlva/S08-Interacciones-Mouse)) en tres piezas con dirección de arte propia. Cada ejercicio trae una **demo** (un resultado posible, como referencia) y un **starter** (el punto de partida donde trabajas tú).

---

## Contenido

- [Antes de empezar](#antes-de-empezar)
- [Cómo usar el repositorio](#cómo-usar-el-repositorio)
- [Estructura](#estructura)
- [Overview de la clase](#overview-de-la-clase)
- [Si algo no funciona](#si-algo-no-funciona)
- [Referencias](#referencias)

---

## Antes de empezar

Necesitas:

- **Node.js 20.19 o más nuevo** (o 22.12+). Revisa tu versión con `node -v`. Lo pide Vite, la herramienta que corre cada ejercicio.
- **npm** (viene con Node).
- **Git** para clonar el repositorio. Si no lo tienes configurado, usa **Code → Download ZIP** en GitHub.
- Un editor: **VS Code** o **Cursor**.

---

## Cómo usar el repositorio

### 1 · Clona una sola vez

El repositorio ya tiene todos los ejercicios. Lo clonas una vez al inicio de la clase y no necesitas volver a actualizarlo.

```bash
git clone https://github.com/AndrewAlva/S09-Practica-Mouse
```

Abre la carpeta `S09-Practica-Mouse` en VS Code.

### 2 · Dos terminales: demo y starter

Cada ejercicio se trabaja con **dos terminales abiertas al mismo tiempo**: una corre la demo (tu referencia) y otra corre el starter (donde programas).

**Primer ejercicio.** Abre dos terminales nuevas en VS Code (*Terminal → New Terminal*); arrancan en la raíz del repositorio:

```bash
# Terminal 1 · Demo
cd 01-Poster-Capas/01-Demo
npm install
npm run dev        # → http://localhost:5173
```

```bash
# Terminal 2 · Starter
cd 01-Poster-Capas/02-Starter
npm install
npm run dev        # → http://localhost:5174
```

**Ejercicios 02 y 03.** Usa las mismas dos terminales. Detén el servidor anterior con `Ctrl + C` y entra a la carpeta nueva:

```bash
# Terminal 1 · Demo
cd ../../02-Objeto-Heroe/01-Demo
npm install
npm run dev
```

```bash
# Terminal 2 · Starter
cd ../../02-Objeto-Heroe/02-Starter
npm install
npm run dev
```

Para el ejercicio 03 es igual, con `03-Personaje` en lugar de `02-Objeto-Heroe`.

Cada `../` sube un nivel: el primero te saca de `01-Demo/` (o `02-Starter/`), el segundo de la carpeta del ejercicio anterior. Así quedas en la raíz y entras al siguiente.

> **Ojo con los puertos.** Si no detienes los servidores anteriores, Vite manda los nuevos a otro puerto (`:5175`, `:5176`…) y es fácil abrir la pestaña equivocada. Siempre `Ctrl + C` antes de cambiar de ejercicio.

**Ejercicio 03 (en pares)** se trabaja en una sola laptop: la de quien va a entregar. La otra persona puede correr solo la demo como referencia.

---

## Estructura

```
S09-Practica-Mouse/
├── 01-Poster-Capas/
│   ├── 01-Demo/
│   └── 02-Starter/
├── 02-Objeto-Heroe/
│   ├── 01-Demo/
│   └── 02-Starter/
└── 03-Personaje/
    ├── 01-Demo/
    └── 02-Starter/
```

Cada carpeta `01-Demo/` o `02-Starter/` es un proyecto de Vite independiente, con su propio `package.json`, `index.html` y `src/`. Por eso `npm install` se corre en cada una.

En cada starter, abre `src/main.js`: arriba hay un bloque que lista el **piso** y las **extensiones** del ejercicio, y en el código hay comentarios `TODO` justo donde tienes que decidir algo.

---

## Overview de la clase

Todo lo de hoy sale de la misma cadena de la sesión anterior:

```
leer el mouse  →  normalizar  →  mapear  →  suavizar  →  dibujar
```

### Repaso rápido

- **Leer en el evento, animar en el loop.** `pointermove` solo guarda datos; `requestAnimationFrame` calcula y dibuja una vez por frame.
- **Normalizar.** El mouse de `-1` a `1`, con el centro en `0`. Y invertida: `+1` arriba, `-1` abajo.

  ```js
  normalizedPointer.x = (pointerData.x / window.innerWidth) * 2 - 1;
  normalizedPointer.y = -(pointerData.y / window.innerHeight) * 2 + 1;
  ```

- **Mapear.** Convertir un valor de un rango a otro:

  ```js
  function map(valor, inMin, inMax, outMin, outMax) {
    const t = (valor - inMin) / (inMax - inMin);
    return outMin + t * (outMax - outMin);
  }
  ```

- **Suavizar (interpolación).** En cada frame, recorrer una fracción (`COF`) de lo que falta:

  ```js
  actual.x += (destino.x - actual.x) * COF;
  ```

### Calentamiento · La tabla de `map()`

Antes de programar, se diseña. Una interacción se puede describir completa en una tabla:

| Input | Rango de entrada | → | Salida | Rango de salida | Suavizado (`COF`) |
|---|---|---|---|---|---|
| x del mouse | -1 a 1 | → | ¿qué propiedad? | ¿de cuánto a cuánto? | ¿qué tan rápido llega? |

Cada fila es una llamada a `map()` más una interpolación. Si la tabla está clara, el código casi se escribe solo. Úsala para planear los tres ejercicios.

---

### 01 · Póster en capas · *individual*

*Un póster editorial que se mueve en profundidad.*

Un póster o un hero de landing con tu propia dirección de arte, hecho con 3 a 5 capas (fondo, forma, tipografía, detalle). Cada capa se desplaza con el mouse normalizado según su propio rango: la que más se mueve se siente más cerca. Encima va un cursor custom y un círculo que lo sigue.

**Repasa:** cursor custom (01 de S08), interpolación (02) y parallax con `map()` (05).

| | |
|---|---|
| **Piso** | El cursor custom va exacto al mouse, el círculo lo sigue con interpolación, y al menos 3 capas se mueven con `map()` + interpolación, cada una con un rango distinto. |
| **Extensión 1** | Una capa además rota con `map()`, y alguna se mueve al revés (rango negativo). |
| **Extensión 2** | Cada capa con su propio `cof`, para que lleguen a destiempo (*overlap*). |
| **60 FPS** | Anima solo con `transform`. Imágenes comprimidas. |
| **Defensa** | ¿Qué capa se mueve más y por qué esa? ¿Qué rango rompería tu composición? |

**Necesitas:** posicionamiento con CSS, variables, loops de animación y `map()`.

---

### 02 · Objeto héroe 3D · *individual*

*Un* product shot *interactivo que te mira.*

Un objeto protagonista hecho con primitivas de Three.js que gira para mirar al cursor. Alrededor flotan elementos secundarios con parallax según su profundidad, y encima va texto en HTML (nombre, frase).

**Repasa:** rotación con `map()` (04 de S08) y parallax (05), ahora en 3D.

| | |
|---|---|
| **Piso** | Tu objeto, diseñado con primitivas, rota hacia el cursor con `map()` y el puntero suavizado. Fondo transparente con texto en HTML encima. |
| **Extensión 1** | Los elementos secundarios se desplazan según su profundidad: más cerca, más movimiento. Son dos `map()`: la profundidad decide el rango y el mouse decide cuánto de ese rango se usa. |
| **Extensión 2** | El mouse también mueve otra propiedad: la posición de la luz, la escala o la opacidad. |
| **60 FPS** | Pocas geometrías; `pixelRatio` con tope en 2 (ya está en el starter). |
| **Defensa** | ¿Por qué ese rango de rotación para este objeto? ¿Qué decide que un elemento esté "cerca" o "lejos"? |

**Necesitas:** variables, funciones, `map()` y la escena base de Three.js (ya viene armada).

---

### 03 · Personaje que mira · *en pares*

*Una criatura que sigue al mouse con todo el cuerpo.*

Un personaje original cuyas partes siguen al cursor, cada una con su propio rango y su propio suavizado. Las pupilas llegan primero, la cabeza después, y el cuerpo y los accesorios al final. Es el principio de animación *follow-through*, hecho con lo que ya saben.

**Roles:** una persona diseña al personaje (`style.css`) y la otra conecta el movimiento (`main.js`). A la mitad, intercambian.

**Repasa:** normalización, `map()` a posición y rotación, e interpolación con distintos `cof`.

| | |
|---|---|
| **Piso** | Personaje rediseñado; las pupilas y la cabeza siguen al mouse con `map()` + interpolación, cada una con su rango y su `cof`. |
| **Extensión 1** | Tres o más partes con `cof` distintos, para que el movimiento se lea escalonado. |
| **Extensión 2** | Una segunda personalidad: el mismo personaje, otros números. Por ejemplo, tímido (rangos negativos: aparta la mirada) contra curioso. Se cambia con el botón o la tecla `P`. |
| **60 FPS** | Pocas partes animadas y solo con `transform`. |
| **Defensa** | ¿Qué parte llega primero y por qué? ¿Qué valores le dan su personalidad? |

**Necesitas:** CSS para dibujar al personaje, variables, `map()` e interpolación.

---

### Para todos los ejercicios

- **Bitácora de IA:** en el README de tu repositorio, qué le consultaste a la IA, qué aceptaste y qué descartaste, y por qué.
- **60 fps en el equipo más lento del grupo.** Compruébalo en Chrome: *DevTools → Rendering → Frame rendering stats*.
- **Defensa oral:** cada pieza se presenta respondiendo sus dos preguntas.

---

## Si algo no funciona

| Síntoma | Qué revisar |
|---|---|
| `npm install` falla | Tu versión de Node: `node -v`. Necesitas 20.19+ o 22.12+. |
| `cd: no such file or directory` | Dónde estás parado: `pwd` (Mac / Linux) o `cd` sin argumentos (Windows). Si abriste una terminal nueva, arranca en la raíz del repositorio: ahí va sin `../../`. |
| La página abre en otro puerto | Quedó un servidor corriendo. `Ctrl + C` en las terminales anteriores. |
| Los cambios no aparecen | Revisa que estés editando el `02-Starter` y viendo su puerto (`:5174`), no el de la demo. |
| Todo se mueve al revés en vertical | En pantalla, Y crece hacia abajo. Revisa el orden del rango de salida en tu `map()` de y. |
| El objeto 3D mira hacia el lado contrario | Una de las dos rotaciones va con el rango de salida invertido. ¿Cuál? |
| Las pupilas desaparecen | Su rango es más grande que el ojo. Bájalo. |
| Nada se mueve | Revisa que tus rangos no sigan en `0` y que la función esté llamada dentro de `animate()`. |
| Abrir el `index.html` con doble clic no funciona | Es normal: los módulos de JavaScript necesitan un servidor. Usa `npm run dev`. |

---

## Referencias

- [S08 · Interacciones con Mouse](https://github.com/AndrewAlva/S08-Interacciones-Mouse) · la sesión anterior, con todos los conceptos.
- [Pointer events · MDN (inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [`requestAnimationFrame` · MDN](https://developer.mozilla.org/es/docs/Web/API/Window/requestAnimationFrame)
- [`transform` · MDN](https://developer.mozilla.org/es/docs/Web/CSS/transform)
- [Three.js · documentación](https://threejs.org/docs/)
- [`MathUtils.mapLinear` · Three.js](https://threejs.org/docs/#api/en/math/MathUtils)
- [Vite · Guía](https://vite.dev/guide/)

Dudas: salvaradoh@centro.edu.mx · lunes a viernes, 10:00–20:00.