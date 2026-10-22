import './style.css';
// TODO · Instala Three.js en esta carpeta (npm install three) e impórtalo aquí, junto con GLTFLoader.
console.log("03-Personaje. 02-Starter.");

/*
  EJERCICIO 03 · PERSONAJE QUE MIRA (en pares)

  Tu personaje es un modelo 3D hecho por ustedes (Blender o Cinema 4D), exportado como .glb.
  Ponlo en public/modelos/. Las partes que quieras mover (cabeza, ojos, antena...)
  deben ser objetos separados y con nombre en tu archivo 3D.

  Piso:        el modelo carga y su cabeza (o el modelo completo) mira al cursor con map() + interpolación.
  Extensión 1: tres o más partes con cof distintos, para que lleguen escalonadas (follow-through).
  Extensión 2: una segunda personalidad: mismas partes, otros números.

  60 fps: modelo ligero (pocos polígonos, texturas chicas) y pixelRatio con tope en 2.
*/

// Obtener referencias a los elementos del DOM ---------------------------------------------------------------
// TODO · Referencias a #norm-x, #norm-y y al canvas #lienzo.
// -------------------------------------------------------------------------






// Definición de variables y constantes ---------------------------------------------------------------
// TODO · Objetos para el puntero (pointerData), el puntero normalizado y el puntero suavizado.
// TODO · Rango, rotación y cof de cada parte que vas a mover.
// -------------------------------------------------------------------------






// Funciones de utilidad ---------------------------------------------------------------
// TODO · Copia aquí la función map() (está en el README y en las slides de la clase).
// -------------------------------------------------------------------------






// Escena 3D ---------------------------------------------------------------
// TODO · Escena, cámara, renderer sobre #lienzo, luces y resize (como en el ejercicio 02).
// TODO · Carga tu modelo desde public/modelos/ con GLTFLoader y guarda sus partes (getObjectByName).
// -------------------------------------------------------------------------






// Cursor / Pointer: leer y normalizar (solo en el evento) ---------------------------------------------------------------
// TODO · En pointermove: guarda la posición del mouse y normalízala de -1 a 1 (y invertida).
// TODO · Escribe los valores normalizados en #norm-x y #norm-y.
// -------------------------------------------------------------------------






// Partes: map del puntero + interpolación ---------------------------------------------------------------
// TODO · Para cada parte: map() del puntero a su rango y acércala a ese destino con su cof.
// -------------------------------------------------------------------------






// Loop de animación ---------------------------------------------------------------
// TODO · Con requestAnimationFrame: actualiza las partes y dibuja la escena.
// -------------------------------------------------------------------------
