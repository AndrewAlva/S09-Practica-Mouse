import './style.css';
import * as THREE from 'three';
console.log("03-Personaje. 01-Demo.");

// Obtener referencias a los elementos del DOM ---------------------------------------------------------------
const normContainerX = document.getElementById("norm-x");
const normContainerY = document.getElementById("norm-y");

const botonPersonalidad = document.getElementById("personalidad");
const nombrePersonalidad = document.getElementById("personalidad-nombre");

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

// La personalidad son solo números. Para cada parte:
//   rotacion: grados máximos en x, y, z     posicion: desplazamiento máximo en x, y     cof: qué tan rápido llega
// El código que los aplica es el mismo para todas las partes y todas las personalidades.
const PERSONALIDADES = {
  curioso: {
    ojos:    { rotacion: { x: 16, y: 20, z: 0 },   posicion: { x: 0, y: 0 },       cof: 0.30 }, // los más rápidos (su giro se suma al de la cabeza)
    cabeza:  { rotacion: { x: 16, y: 24, z: 0 },   posicion: { x: 0, y: 0 },       cof: 0.09 },
    cuerpo:  { rotacion: { x: 5,  y: 12, z: 0 },   posicion: { x: 0, y: 0 },       cof: 0.05 },
    antena:  { rotacion: { x: 0,  y: 0,  z: 28 },  posicion: { x: 0, y: 0 },       cof: 0.035 }, // llega al último: follow-through
  },
  timido: {
    // Rangos negativos: aparta la mirada del cursor
    ojos:    { rotacion: { x: -16, y: -22, z: 0 },   posicion: { x: 0, y: 0 },         cof: 0.22 },
    cabeza:  { rotacion: { x: -10, y: -22, z: 0 },   posicion: { x: 0, y: 0 },         cof: 0.06 },
    cuerpo:  { rotacion: { x: -3,  y: -8,  z: 0 },   posicion: { x: 0, y: 0 },         cof: 0.04 },
    antena:  { rotacion: { x: 0,   y: 0,   z: -16 }, posicion: { x: 0, y: 0 },         cof: 0.03 },
  },
};

const NOMBRES = Object.keys(PERSONALIDADES);
let personalidadActual = "curioso";
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

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.6, 11);
camera.lookAt(0, 0.35, 0);

const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // tope en 2: pantallas retina sin castigar el rendimiento
renderer.setSize(window.innerWidth, window.innerHeight);

const hemiLight = new THREE.HemisphereLight("#fff4e0", "#5a4a8a", 1.6);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight("#ffffff", 2.2);
keyLight.position.set(3, 5, 6);
scene.add(keyLight);

// Canvas responsivo: cámara y renderer siguen el tamaño de la ventana
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// -------------------------------------------------------------------------






// Personaje hecho con primitivas ---------------------------------------------------------------
// Se arma como si fuera un .glb exportado de Blender o Cinema 4D: un grupo con partes NOMBRADAS.
// En su starter, esta función la reemplaza GLTFLoader:
//   loader.load("/modelos/personaje.glb", (gltf) => { const modelo = gltf.scene; ... });
// y el resto del código (getObjectByName, map, interpolación) queda igual.
function construirPersonaje() {
  const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.55 });
  const azul = material("#3d5afe");
  const azulOscuro = material("#2a3fc4");
  const blanco = material("#fffaf2");
  const tinta = material("#1b1b2b");
  const rosa = material("#ff8fa3");
  const acento = material("#ff5a3d");

  const personaje = new THREE.Group();
  personaje.name = "personaje";

  // Cuerpo: gira desde la cadera
  const cuerpo = new THREE.Group();
  cuerpo.name = "cuerpo";
  cuerpo.position.y = -1.6;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 0.7, 8, 24), azulOscuro);
  torso.position.y = 0.95;
  cuerpo.add(torso);
  personaje.add(cuerpo);

  // Cabeza: gira desde el cuello. Es hija del cuerpo: lo que mueve al cuerpo también la mueve.
  const cabeza = new THREE.Group();
  cabeza.name = "cabeza";
  cabeza.position.y = 1.85;
  cuerpo.add(cabeza);

  const craneo = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), azul);
  craneo.scale.set(1.15, 0.95, 1);
  craneo.position.y = 0.85;
  cabeza.add(craneo);

  // Ojos: globos que giran desde su centro, con la pupila en la superficie.
  // Como en un rig: al rotar el ojo, la pupila recorre el globo y nunca se sale.
  for (const lado of [-1, 1]) {
    const ojo = new THREE.Group();
    ojo.name = lado < 0 ? "ojo-izq" : "ojo-der";
    ojo.position.set(0.4 * lado, 0.98, 0.72);   // medio hundido en la cabeza
    cabeza.add(ojo);

    const globo = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 16), blanco);
    ojo.add(globo);

    const pupila = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), tinta);
    pupila.scale.z = 0.4;
    pupila.position.z = 0.25;
    ojo.add(pupila);

    const mejilla = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), rosa);
    mejilla.scale.set(1.4, 0.7, 0.4);
    mejilla.position.set(0.66 * lado, 0.62, 0.72);
    cabeza.add(mejilla);
  }

  const boca = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 24, Math.PI), tinta);
  boca.rotation.z = Math.PI;   // medio toro boca abajo = sonrisa
  boca.position.set(0, 0.62, 0.94);
  cabeza.add(boca);

  // Antena: gira desde su base, sobre la cabeza
  const antena = new THREE.Group();
  antena.name = "antena";
  antena.position.y = 1.7;
  cabeza.add(antena);

  const palo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 12), tinta);
  palo.position.y = 0.3;
  antena.add(palo);

  const bola = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), acento);
  bola.position.y = 0.66;
  antena.add(bola);

  return personaje;
}

const modelo = construirPersonaje();
scene.add(modelo);

// Encontrar las partes por nombre, igual que con un modelo importado.
// "base" guarda su posición y rotación originales: el movimiento se suma a partir de ahí.
const PARTES = {
  cuerpo:  [modelo.getObjectByName("cuerpo")],
  cabeza:  [modelo.getObjectByName("cabeza")],
  ojos:    [modelo.getObjectByName("ojo-izq"), modelo.getObjectByName("ojo-der")],
  antena:  [modelo.getObjectByName("antena")],
};

for (const nombre in PARTES) {
  PARTES[nombre] = {
    objetos: PARTES[nombre].map((obj) => ({
      obj,
      base: { posicion: obj.position.clone(), rotacion: obj.rotation.clone() },
    })),
    actual: { rx: 0, ry: 0, rz: 0, px: 0, py: 0 },   // lo que se interpola
  };
}
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

  normContainerX.innerText = normalizedPointer.x.toFixed(2);
  normContainerY.innerText = normalizedPointer.y.toFixed(2);
});
// -------------------------------------------------------------------------






// Personalidad: cambiar de un set de valores a otro ---------------------------------------------------------------
function cambiarPersonalidad() {
  const siguiente = (NOMBRES.indexOf(personalidadActual) + 1) % NOMBRES.length;
  personalidadActual = NOMBRES[siguiente];
  nombrePersonalidad.innerText = personalidadActual;
}

botonPersonalidad.addEventListener("click", cambiarPersonalidad);
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "p") cambiarPersonalidad();
});
// -------------------------------------------------------------------------






// Partes: map del puntero normalizado + interpolación, cada una con sus valores ---------------------------------------------------------------
function updatePartes() {
  const valores = PERSONALIDADES[personalidadActual];
  const nx = normalizedPointer.x;
  const ny = normalizedPointer.y;

  for (const nombre in PARTES) {
    const parte = PARTES[nombre];
    const { rotacion, posicion, cof } = valores[nombre];

    // 1. Map: a dónde debería ir esta parte según el mouse
    //    rotation.x positiva inclina el frente hacia abajo: para mirar arriba, el rango de salida va invertido
    const destino = {
      rx: map(ny, -1, 1, rotacion.x, -rotacion.x),
      ry: map(nx, -1, 1, -rotacion.y, rotacion.y),
      rz: map(nx, -1, 1, -rotacion.z, rotacion.z),
      // En 3D, Y crece hacia arriba (como el puntero normalizado): aquí el rango NO se invierte
      px: map(nx, -1, 1, -posicion.x, posicion.x),
      py: map(ny, -1, 1, -posicion.y, posicion.y),
    };

    // 2. Interpolación: cada parte con su propio cof, así llegan a destiempo
    for (const clave in destino) {
      parte.actual[clave] += (destino[clave] - parte.actual[clave]) * cof;
    }

    // 3. Aplicar: base + movimiento. Three.js rota en radianes.
    for (const { obj, base } of parte.objetos) {
      obj.rotation.x = base.rotacion.x + THREE.MathUtils.degToRad(parte.actual.rx);
      obj.rotation.y = base.rotacion.y + THREE.MathUtils.degToRad(parte.actual.ry);
      obj.rotation.z = base.rotacion.z + THREE.MathUtils.degToRad(parte.actual.rz);
      obj.position.x = base.posicion.x + parte.actual.px;
      obj.position.y = base.posicion.y + parte.actual.py;
    }
  }
}
// -------------------------------------------------------------------------






// Loop de animación ---------------------------------------------------------------
function animate() {
  updatePartes();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
// -------------------------------------------------------------------------
