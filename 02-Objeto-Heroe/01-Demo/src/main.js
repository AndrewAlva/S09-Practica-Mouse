import './style.css';
import * as THREE from 'three';
console.log("02-Objeto-Heroe. 01-Demo.");

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

const COF = 0.06;            // Coefficient of friction: qué tan rápido llega el puntero suavizado
const ROTATION_LIMIT = 35;   // Rotación máxima del objeto héroe, en grados (±35)
const LIGHT_RANGE = 6;       // Cuánto se desplaza la luz principal con el mouse (±6)
const PARALLAX_CERCA = 1.2;  // Desplazamiento de un elemento en la profundidad más cercana
const PARALLAX_LEJOS = 0.1;  // Desplazamiento de un elemento en la profundidad más lejana
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

// Luces: una suave de ambiente y una principal que se va a mover con el mouse
const hemiLight = new THREE.HemisphereLight("#b9a8ff", "#1a1020", 1.2);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight("#ffffff", 2.4);
keyLight.position.set(3, 4, 6);
scene.add(keyLight);

// Objeto héroe: un grupo de primitivas que se mueve como una sola pieza
const hero = new THREE.Group();
hero.position.x = 1.8;   // a la derecha, para dejar espacio al texto
scene.add(hero);

const planeta = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.35, 1),
  new THREE.MeshStandardMaterial({ color: "#ff6a3d", roughness: 0.45, flatShading: true })
);
hero.add(planeta);

const anillo = new THREE.Mesh(
  new THREE.TorusGeometry(2.25, 0.05, 12, 120),
  new THREE.MeshStandardMaterial({ color: "#f4efe6", roughness: 0.3 })
);
anillo.rotation.x = THREE.MathUtils.degToRad(72);
anillo.rotation.y = THREE.MathUtils.degToRad(-14);
hero.add(anillo);

const luna = new THREE.Mesh(
  new THREE.SphereGeometry(0.22, 24, 16),
  new THREE.MeshStandardMaterial({ color: "#f4efe6", roughness: 0.6 })
);
luna.position.set(2.25, 0.35, 0.2);
hero.add(luna);

// Elementos secundarios: flotan a distintas profundidades (z) alrededor del héroe
const secundarios = [];
const materialSecundario = new THREE.MeshStandardMaterial({ color: "#8f7cff", roughness: 0.5, flatShading: true });
const geometrias = [
  new THREE.OctahedronGeometry(0.28),
  new THREE.TetrahedronGeometry(0.3),
  new THREE.BoxGeometry(0.34, 0.34, 0.34),
];

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
  // Signo invertido en X para que el objeto mire al cursor
  rotation.x = map(normalizedLerpPointer.y, -1, 1, ROTATION_LIMIT, -ROTATION_LIMIT);
  rotation.y = map(normalizedLerpPointer.x, -1, 1, -ROTATION_LIMIT, ROTATION_LIMIT);

  // Three.js rota en radianes; nuestros valores están en grados
  hero.rotation.x = THREE.MathUtils.degToRad(rotation.x);
  hero.rotation.y = THREE.MathUtils.degToRad(rotation.y);

  rotationContainerX.innerText = Math.round(rotation.x); // Math.round evita mostrar "-0"
  rotationContainerY.innerText = Math.round(rotation.y);
}

function updateSecundarios() {
  for (const s of secundarios) {
    // Map 1: la profundidad decide el rango. Más cerca (z alto) = se mueve más.
    const rango = map(s.base.z, -6, 2, PARALLAX_LEJOS, PARALLAX_CERCA);

    // Map 2: el puntero decide cuánto de ese rango se usa
    s.mesh.position.x = s.base.x + map(normalizedLerpPointer.x, -1, 1, -rango, rango);
    s.mesh.position.y = s.base.y + map(normalizedLerpPointer.y, -1, 1, -rango, rango);
  }
}

function updateLight() {
  // La luz principal sigue al mouse: cambia qué caras del objeto se iluminan
  keyLight.position.x = map(normalizedLerpPointer.x, -1, 1, -LIGHT_RANGE, LIGHT_RANGE);
  keyLight.position.y = map(normalizedLerpPointer.y, -1, 1, -LIGHT_RANGE, LIGHT_RANGE);
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
