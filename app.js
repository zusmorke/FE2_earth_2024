let scene;
let camera;
let renderer;
let controls;
let planet1;
let planet2;
let planet3;

function main() {
  const canvas = document.querySelector("#c");

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 3);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0.0);

  // Create Earth
  const earthGeometry = new THREE.SphereGeometry(0.6, 32, 32);
  const earthMaterial = new THREE.MeshPhongMaterial({
    roughness: 1,
    metalness: 0,
    map: new THREE.TextureLoader().load("images/earthmap1k.jpg"),
    bumpMap: new THREE.TextureLoader().load("images/earthbump.jpg"),
    bumpScale: 0.3,
  });
  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earthMesh);

  // Set ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Set point lights
  const pointLight1 = new THREE.PointLight(0xffffff, 0.9);
  pointLight1.position.set(5, 3, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xffffff, 0.9);
  pointLight2.position.set(-5, -3, -5);
  scene.add(pointLight2);

  // Cloud
  const cloudGeometry = new THREE.SphereGeometry(0.63, 32, 32);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load("images/earthCloud.png"),
    transparent: true,
  });
  const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
  scene.add(cloudMesh);

  // Star
  const starGeometry = new THREE.SphereGeometry(80, 64, 64);
  const starMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("images/galaxy.png"),
    side: THREE.BackSide,
  });
  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  scene.add(starMesh);

  // Create orbits and planets
  function createPlanet(size, images, distance) {
    const planetGroup = new THREE.Group();

    const orbitGeometry = new THREE.RingGeometry(
      distance - 0.01,
      distance + 0.01,
      64
    );
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      opacity: 0.2, // Adjust opacity to make the orbits less visible
      transparent: true,
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Rotate the orbit to be in the xy-plane
    planetGroup.add(orbit);

    const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load(images),
    });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.position.set(distance, 0, 0);
    planetGroup.add(planetMesh);

    planetGroup.visible = false; // Initially hide the planet

    scene.add(planetGroup);

    return planetGroup;
  }

  // Add example planets
  planet1 = createPlanet(0.2, "images/planet1.jpg", 1);
  planet2 = createPlanet(0.1, "images/planet2.jpg", 1.5);
  planet3 = createPlanet(0.15, "images/planet3.jpg", 2);

  let speed1 = 0.02;
  let speed2 = 0.015;
  let speed3 = 0.01;

  let angle1 = 0;
  let angle2 = 0;
  let angle3 = 0;

  // Event listeners for input changes to update speed variables
  document.getElementById("speed1").addEventListener("input", (event) => {
    speed1 = parseFloat(event.target.value);
    if (speed1 < 0) {
      speed1 = 0;
      event.target.value = 0;
    }
    console.log("Speed of planet 1 updated to:", speed1);
  });

  document.getElementById("speed2").addEventListener("input", (event) => {
    speed2 = parseFloat(event.target.value);
    if (speed2 < 0) {
      speed2 = 0;
      event.target.value = 0;
    }
    console.log("Speed of planet 2 updated to:", speed2);
  });

  document.getElementById("speed3").addEventListener("input", (event) => {
    speed3 = parseFloat(event.target.value);
    if (speed3 < 0) {
      speed3 = 0;
      event.target.value = 0;
    }
    console.log("Speed of planet 3 updated to:", speed3);
  });

  // Event listeners for buttons to toggle planets visibility
  document.getElementById("planet1").addEventListener("click", () => {
    planet1.visible = !planet1.visible; // Toggle planet visibility
  });

  document.getElementById("planet2").addEventListener("click", () => {
    planet2.visible = !planet2.visible; // Toggle planet visibility
  });

  document.getElementById("planet3").addEventListener("click", () => {
    planet3.visible = !planet3.visible; // Toggle planet visibility
  });

  // Add orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Enable damping (inertia)
  controls.dampingFactor = 0.25; // Damping inertia factor
  controls.minDistance = 1; // Minimum zoom distance
  controls.maxDistance = 100; // Maximum zoom distance

  const animate = () => {
    requestAnimationFrame(animate);

    // Rotate Earth and clouds
    earthMesh.rotation.y -= 0.0015;
    cloudMesh.rotation.y += 0.0015;
    starMesh.rotation.y += 0.0005;

    // Rotate planets around Earth
    if (planet1.visible) {
      angle1 += speed1;
      planet1.children[1].position.set(
        1 * Math.cos(angle1),
        0,
        1 * Math.sin(angle1)
      );
    }

    if (planet2.visible) {
      angle2 += speed2;
      planet2.children[1].position.set(
        1.5 * Math.cos(angle2),
        0,
        1.5 * Math.sin(angle2)
      );
    }

    if (planet3.visible) {
      angle3 += speed3;
      planet3.children[1].position.set(
        2 * Math.cos(angle3),
        0,
        2 * Math.sin(angle3)
      );
    }

    // Update controls
    controls.update();

    render();
  };

  const render = () => {
    renderer.render(scene, camera);
  };

  animate();
}

window.onload = main;
