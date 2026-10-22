import './style.css';
console.log("01-Poster-Capas. 01-Demo.");

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

// Cada capa: cuánto se mueve (rango en px), cuánto rota (grados) y qué tan rápido llega (cof).
// Rango alto = se siente cerca. Rango negativo = se mueve al revés (se siente detrás de todo).
const CAPAS = [
  { id: "capa-fondo",    rango: { x: -28, y: -22 }, rotacion: 0,  cof: 0.05 },
  { id: "capa-anillo",   rango: { x: 46,  y: 34 },  rotacion: 0,  cof: 0.07 },
  { id: "capa-titulo",   rango: { x: 16,  y: 10 },  rotacion: 0,  cof: 0.06 },
  { id: "capa-etiqueta", rango: { x: 80,  y: 60 },  rotacion: 10, cof: 0.11 },
  { id: "capa-texto",    rango: { x: 8,   y: 4 },   rotacion: 0,  cof: 0.05 },
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
  cursor.style.transform = `translate(${pointerData.x}px, ${pointerData.y}px)`;
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
  targetPosition.x += (pointerData.x - targetPosition.x) * COF;
  targetPosition.y += (pointerData.y - targetPosition.y) * COF;
}

function updateTargetPosition() {
  target.style.transform = `translate(${targetPosition.x}px, ${targetPosition.y}px)`;
}
// -------------------------------------------------------------------------






// Capas: map del puntero normalizado a cada rango + interpolación ---------------------------------------------------------------
function updateCapas() {
  for (const capa of CAPAS) {
    // 1. Map: a dónde debería ir esta capa según el mouse
    const destinoX = map(normalizedPointer.x, -1, 1, -capa.rango.x, capa.rango.x);
    // En pantalla, Y crece hacia abajo: por eso el rango de salida va invertido
    const destinoY = map(normalizedPointer.y, -1, 1, capa.rango.y, -capa.rango.y);
    const destinoR = map(normalizedPointer.x, -1, 1, -capa.rotacion, capa.rotacion);

    // 2. Interpolación: cada capa con su propio cof, así llegan a destiempo
    capa.actual.x += (destinoX - capa.actual.x) * capa.cof;
    capa.actual.y += (destinoY - capa.actual.y) * capa.cof;
    capa.actual.r += (destinoR - capa.actual.r) * capa.cof;

    // 3. Dibujar: solo transform, para sostener 60 fps
    capa.el.style.transform = `translate(${capa.actual.x}px, ${capa.actual.y}px) rotate(${capa.actual.r}deg)`;
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
