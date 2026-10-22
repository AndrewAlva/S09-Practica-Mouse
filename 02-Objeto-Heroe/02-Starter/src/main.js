import './style.css';
import * as THREE from 'three';
console.log("02-Objeto-Heroe. 02-Starter.");

/*
  EJERCICIO 02 · OBJETO HÉROE 3D (individual)

  Piso (mínimo para entregar):
    TODO 1 · Diseña tu objeto héroe con primitivas (reemplaza el placeholder).
    TODO 2 · El héroe rota hacia el cursor con map() + el puntero suavizado.

  Extensión 1 · TODO 3 · Los secundarios se desplazan según su profundidad (parallax).
  Extensión 2 · TODO 4 · El mouse también mueve la luz (u otra propiedad: escala, opacidad...).

  60 fps: pocas geometrías y pixelRatio con tope en 2 (ya está).
*/

// Obtener referencias a los elementos del DOM ---------------------------------------------------------------
const normContainerX = document.getElementById("norm-x");
const normContainerY = document.getElementById("norm-y");
const rotationContainerX = document.getElementById("rotation-x");
const rotationContainerY = document.getElementById("rotation-y");

const lienzo = document.getElementById("lienzo");
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

let normalizedLerpPointer = {
  x: 0,
  y: 0
};

let rotation = {
  x: 0,
  y: 0
};

const COF = 0.06; // Coefficient of friction: qué tan rápido llega el puntero suavizado

// TODO 2 · Decide la rotación máxima de tu objeto (en grados). ¿Cuánto debe girar para que se lea que te mira?
const ROTATION_LIMIT = 0;

// Para las extensiones: decide tú estos rangos
const LIGHT_RANGE = 0;      // TODO 4 · cuánto se desplaza la luz principal con el mouse
const PARALLAX_CERCA = 0;   // TODO 3 · desplazamiento de un elemento en la profundidad más cercana
const PARALLAX_LEJOS = 0;   // TODO 3 · desplazamiento de un elemento en la profundidad más lejana
// -------------------------------------------------------------------------






// Funciones de utilidad ---------------------------------------------------------------
// map(): convierte un valor de un rango a otro
function map(valor, inMin, inMax, outMin, outMax) {
  const t = (valor - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}
// -------------------------------------------------------------------------






// Escena 3D ---------------------------------------------------------------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // tope en 2: pantallas retina sin castigar el rendimiento
renderer.setSize(window.innerWidth, window.innerHeight);

// Luces: una suave de ambiente y una principal (la que puedes mover con el mouse en la extensión 2)
const hemiLight = new THREE.HemisphereLight("#ffffff", "#333333", 1.2);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight("#ffffff", 2.4);
keyLight.position.set(3, 4, 6);
scene.add(keyLight);

// Objeto héroe: un grupo. Todo lo que agregues con hero.add() rota junto.
const hero = new THREE.Group();
hero.position.x = 1.8;   // a la derecha, para dejar espacio al texto
scene.add(hero);

// TODO 1 · Reemplaza este placeholder por tu objeto: combina primitivas
//   (BoxGeometry, SphereGeometry, TorusGeometry, ConeGeometry, IcosahedronGeometry...),
//   cambia colores y materiales, y agrégalas con hero.add().
const placeholder = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.35, 1),
  new THREE.MeshStandardMaterial({ color: "#9a9a9a", roughness: 0.5, flatShading: true })
);
hero.add(placeholder);

// Elementos secundarios: flotan a distintas profundidades (z) alrededor del héroe
const secundarios = [];
const materialSecundario = new THREE.MeshStandardMaterial({ color: "#6f6f6f", roughness: 0.5, flatShading: true });
const geometrias = [
  new THREE.OctahedronGeometry(0.28),
  new THREE.TetrahedronGeometry(0.3),
  new THREE.BoxGeometry(0.34, 0.34, 0.34),
];

// [x, y, z] de cada secundario. z cerca de la cámara = alto (2); lejos = bajo (-6)
const posiciones = [
  [-1.0,  2.6, -4.0], [ 4.6,  2.4, -2.5], [ 5.4, -1.6, -5.0], [ 0.2, -2.8, -1.0],
  [ 3.4, -3.0,  1.4], [-2.2, -0.8, -6.0], [ 6.2,  0.6,  0.8], [ 1.2,  3.2,  1.8],
];

posiciones.forEach(([x, y, z], i) => {
  const mesh = new THREE.Mesh(geometrias[i % geometrias.length], materialSecundario);
  mesh.position.set(x, y, z);
  mesh.rotation.set(i, i * 0.7, 0);
  scene.add(mesh);
  // Guardamos su posición base: el parallax se suma a partir de ahí
  secundarios.push({ mesh, base: { x, y, z } });
});

// Canvas responsivo: cámara y renderer siguen el tamaño de la ventana
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// -------------------------------------------------------------------------






// Cursor / Pointer: leer y normalizar (solo en el evento) ---------------------------------------------------------------
function calculateNormalizedPointer() {
  normalizedPointer.x = (pointerData.x / window.innerWidth) * 2 - 1;   // -1 izquierda, 1 derecha
  normalizedPointer.y = -(pointerData.y / window.innerHeight) * 2 + 1; // -1 abajo, 1 arriba
}

document.addEventListener("pointermove", (event) => {
  pointerData.x = Math.floor(event.clientX);
  pointerData.y = Math.floor(event.clientY);

  calculateNormalizedPointer();
});

function calculateNormalizedLerpPointer() {
  normalizedLerpPointer.x += (normalizedPointer.x - normalizedLerpPointer.x) * COF;
  normalizedLerpPointer.y += (normalizedPointer.y - normalizedLerpPointer.y) * COF;

  normContainerX.innerText = normalizedLerpPointer.x.toFixed(2);
  normContainerY.innerText = normalizedLerpPointer.y.toFixed(2);
}
// -------------------------------------------------------------------------






// Map: del puntero suavizado a rotación, parallax y luz ---------------------------------------------------------------
function updateHero() {
  // TODO 2 · Con map(), convierte el puntero suavizado (de -1 a 1) a grados (de -ROTATION_LIMIT a ROTATION_LIMIT):
  //   - normalizedLerpPointer.x → rotation.y  (girar a los lados)
  //   - normalizedLerpPointer.y → rotation.x  (inclinar arriba y abajo)
  //   Ojo: para que el objeto MIRE al cursor, uno de los dos va con el rango de salida invertido. ¿Cuál?
  //   Luego aplícalo a hero.rotation (Three.js usa radianes: THREE.MathUtils.degToRad()).

  rotationContainerX.innerText = Math.round(rotation.x); // Math.round evita mostrar "-0"
  rotationContainerY.innerText = Math.round(rotation.y);
}

function updateSecundarios() {
  for (const s of secundarios) {
    // TODO 3 · Parallax por profundidad, con dos map():
    //   1. La profundidad decide el rango: map(s.base.z, -6, 2, PARALLAX_LEJOS, PARALLAX_CERCA)
    //   2. El puntero decide cuánto de ese rango se usa, sumado a la posición base:
    //      s.mesh.position.x = s.base.x + map(normalizedLerpPointer.x, -1, 1, ...)
  }
}

function updateLight() {
  // TODO 4 · Con map(), mueve keyLight.position.x / .y según el puntero (de -LIGHT_RANGE a LIGHT_RANGE).
  //   Observa qué caras de tu objeto se iluminan.
}
// -------------------------------------------------------------------------






// Loop de animación ---------------------------------------------------------------
function animate() {
  calculateNormalizedLerpPointer();
  updateHero();
  updateSecundarios();
  updateLight();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
// -------------------------------------------------------------------------
