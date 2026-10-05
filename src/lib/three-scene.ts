import type * as ThreeNS from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneSetup {
  THREE: typeof import('three');
  scene: ThreeNS.Scene;
  camera: ThreeNS.PerspectiveCamera;
  renderer: ThreeNS.WebGLRenderer;
  controls: OrbitControls;
}

/**
 * Crea una escena Three.js dentro de `container`: luces, cámara, renderer
 * transparente, `OrbitControls` y manejo de tamaño. Elimina el elemento
 * `.loading` si existe.
 */
export async function setupScene(
  container: HTMLElement,
  cameraPosition: [number, number, number] = [2.3, 1.9, 2.7]
): Promise<SceneSetup> {
  const THREE = await import('three');
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(1.6, 2.4, 1.6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-2, -1, -2);
  scene.add(fillLight);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(...cameraPosition);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0, 0);
  controls.update();

  container.querySelector('.loading')?.remove();
  container.appendChild(renderer.domElement);

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  resize();
  new ResizeObserver(resize).observe(container);

  return { THREE, scene, camera, renderer, controls };
}

/** Añade una caja de referencia translúcida y los ejes de coordenadas. */
export function addReferenceBox(
  THREE: typeof import('three'),
  scene: ThreeNS.Scene,
  halfSize = 1
): void {
  const box = new THREE.LineSegments(
    new THREE.EdgesGeometry(
      new THREE.BoxGeometry(halfSize * 2, halfSize * 2, halfSize * 2)
    ),
    new THREE.LineBasicMaterial({ color: 0x8a8a8a, transparent: true, opacity: 0.35 })
  );
  scene.add(box);
  scene.add(new THREE.AxesHelper(halfSize * 1.4));
}

/** Inicia el bucle de render con amortiguación de los controles. */
export function startLoop(
  renderer: ThreeNS.WebGLRenderer,
  scene: ThreeNS.Scene,
  camera: ThreeNS.PerspectiveCamera,
  controls: OrbitControls
): void {
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
}
