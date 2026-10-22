import './style.css';
console.log("01-Poster-Capas. 02-Starter.");

/*
  EJERCICIO 01 · PÓSTER EN CAPAS (individual)

  Piso (mínimo para entregar):
    TODO 1 · El cursor custom va exacto a la posición del mouse.
    TODO 2 · El círculo sigue al cursor con interpolación.
    TODO 3 · Decide el rango de cada capa en CAPAS.
    TODO 4 · Cada capa se mueve con map() + interpolación.

  Extensión 1 · Una capa además rota (usa "rotacion") y alguna se mueve al revés (rango negativo).
  Extensión 2 · Cada capa con su propio "cof", para que lleguen a destiempo (overlap).

  60 fps: anima solo con transform.
*/

// Obtener referencias a los elementos del DOM ---------------------------------------------------------------
const normContainerX = document.getElementById("norm-x");
const normContainerY = document.getElementById("norm-y");

const cursor = document.getElementById("cursor");
const target = document.getElementById("target");
// -------------------------------------------------------------------------






// Definición de variables y constantes ---------------------------------------------------------------
let pointerData = {
  x: 0,
  y: 0
};

let normalizedPointer = {
  x: 0,
  y: 0
};

let targetPosition = {
  x: 0,
  y: 0
};

const COF = 0.12; // Coefficient of friction for the target (círculo) movement

// TODO 3 · Decide cuánto se mueve cada capa (en px).
//   Rango alto = se siente cerca. Rango bajo = se siente lejos. Rango negativo = se mueve al revés.
//   "rotacion" (grados) y "cof" son para las extensiones.
const CAPAS = [
  { id: "capa-fondo",   rango: { x: 0, y: 0 }, rotacion: 0, cof: 0.08 },
  { id: "capa-forma",   rango: { x: 0, y: 0 }, rotacion: 0, cof: 0.08 },
  { id: "capa-titulo",  rango: { x: 0, y: 0 }, rotacion: 0, cof: 0.08 },
  { id: "capa-detalle", rango: { x: 0, y: 0 }, rotacion: 0, cof: 0.08 },
];

// A cada capa le agregamos su elemento y su posición actual (la que se interpola)
for (const capa of CAPAS) {
  capa.el = document.getElementById(capa.id);
  capa.actual = { x: 0, y: 0, r: 0 };
}
// -------------------------------------------------------------------------






// Funciones de utilidad ---------------------------------------------------------------
// map(): convierte un valor de un rango a otro
function map(valor, inMin, inMax, outMin, outMax) {
  const t = (valor - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}
// -------------------------------------------------------------------------






// Cursor / Pointer: leer y normalizar (solo en el evento) ---------------------------------------------------------------
function calculateNormalizedPointer() {
  normalizedPointer.x = (pointerData.x / window.innerWidth) * 2 - 1;   // -1 izquierda, 1 derecha
  normalizedPointer.y = -(pointerData.y / window.innerHeight) * 2 + 1; // -1 abajo, 1 arriba
}

function updateCursorPosition() {
  // TODO 1 · Mueve #cursor a la posición exacta del mouse (pointerData), con transform: translate().
  //          Pista: ejercicio 01 de S08.
}

document.addEventListener("pointermove", (event) => {
  pointerData.x = Math.floor(event.clientX);
  pointerData.y = Math.floor(event.clientY);

  calculateNormalizedPointer();
  updateCursorPosition();   // el cursor no se suaviza: va exacto, sin esperar al loop

  normContainerX.innerText = normalizedPointer.x.toFixed(2);
  normContainerY.innerText = normalizedPointer.y.toFixed(2);
});
// -------------------------------------------------------------------------






// Círculo que sigue al cursor (interpolación) ---------------------------------------------------------------
function calculateTargetPosition() {
  // TODO 2 · Acerca targetPosition a pointerData una fracción (COF) de lo que le falta.
  //          Pista: ejercicio 02 de S08.
}

function updateTargetPosition() {
  target.style.transform = `translate(${targetPosition.x}px, ${targetPosition.y}px)`;
}
// -------------------------------------------------------------------------






// Capas: map del puntero normalizado a cada rango + interpolación ---------------------------------------------------------------
function updateCapas() {
  for (const capa of CAPAS) {
    // TODO 4 · Para cada capa:
    //   1. Map: convierte normalizedPointer.x (de -1 a 1) a su rango en x (de -capa.rango.x a capa.rango.x).
    //      Haz lo mismo en y. Ojo: en pantalla Y crece hacia abajo; ¿cómo ordenas el rango de salida?
    //   2. Interpolación: acerca capa.actual.x / capa.actual.y a ese destino con capa.cof.
    //   3. Dibujar: capa.el.style.transform = `translate(...px, ...px) rotate(...deg)`
  }
}
// -------------------------------------------------------------------------






// Loop de animación ---------------------------------------------------------------
function animate() {
  calculateTargetPosition();
  updateTargetPosition();
  updateCapas();

  requestAnimationFrame(animate);
}

animate();
// -------------------------------------------------------------------------
