let scene, camera, renderer, controls, raycaster, mouse;
let planet1, planet2, planet3;
let selectedPlanet = null;
let spaceView = true;

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

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  const textureLoader = new THREE.TextureLoader();

  const earthGeometry = new THREE.SphereGeometry(0.6, 32, 32);
  const earthMaterial = new THREE.MeshPhongMaterial({
    roughness: 1,
    metalness: 0,
    map: textureLoader.load("images/earthmap1k.jpg"),
    bumpMap: textureLoader.load("images/earthbump.jpg"),
    bumpScale: 0.3,
  });

  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earthMesh);

  const cloudGeometry = new THREE.SphereGeometry(0.61, 32, 32);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("images/earthCloud.png"),
    transparent: true,
  });

  const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
  scene.add(cloudMesh);

  const starGeometry = new THREE.SphereGeometry(80, 64, 64);
  const starMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load("images/galaxy.png"),
    side: THREE.BackSide,
  });

  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  scene.add(starMesh);

  // Add lighting to the scene
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xffffff, 0.9);
  pointLight1.position.set(5, 3, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xffffff, 0.9);
  pointLight2.position.set(-5, -3, -5);
  scene.add(pointLight2);

  // Create orbits and planets
  function createPlanet(size, images, distance, info) {
    const planetGroup = new THREE.Group();

    const orbitGeometry = new THREE.RingGeometry(
      distance - 0.01,
      distance + 0.01,
      64
    );
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      opacity: 0.2,
      transparent: true,
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    planetGroup.add(orbit);

    const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({
      map: textureLoader.load(images),
    });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.position.set(distance, 0, 0);
    planetMesh.userData = { info: info };
    planetGroup.add(planetMesh);

    planetGroup.visible = false;

    scene.add(planetGroup);

    return planetGroup;
  }

  planet1 = createPlanet(0.2, "images/planet1.jpg", 1, "Thông tin về Hành tinh 1");
  planet2 = createPlanet(0.1, "images/planet2.jpg", 1.5, "Thông tin về Hành tinh 2");
  planet3 = createPlanet(0.15, "images/planet3.jpg", 2, "Thông tin về Hành tinh 3");

  let speed1 = 0.02;
  let speed2 = 0.015;
  let speed3 = 0.01;

  let angle1 = 0;
  let angle2 = 0;
  let angle3 = 0;

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

  document.getElementById("planet1").addEventListener("click", () => {
    planet1.visible = !planet1.visible;
  });

  document.getElementById("planet2").addEventListener("click", () => {
    planet2.visible = !planet2.visible;
  });

  document.getElementById("planet3").addEventListener("click", () => {
    planet3.visible = !planet3.visible;
  });

  document.getElementById("searchButton").addEventListener("click", () => {
    const location = document.getElementById("searchLocation").value;
    searchLocation(location);
  });

  document.getElementById("toggleView").addEventListener("click", () => {
    toggleView();
  });

  window.addEventListener("click", onClick, false);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.minDistance = 1;
  controls.maxDistance = 100;

  const animate = () => {
    requestAnimationFrame(animate);
    earthMesh.rotation.y -= 0.001;
    cloudMesh.rotation.y -= 0.0015;

    angle1 -= speed1;
    planet1.children[1].position.set(Math.cos(angle1) * 1, 0, Math.sin(angle1) * 1);

    angle2 -= speed2;
    planet2.children[1].position.set(Math.cos(angle2) * 1.5, 0, Math.sin(angle2) * 1.5);

    angle3 -= speed3;
    planet3.children[1].position.set(Math.cos(angle3) * 2, 0, Math.sin(angle3) * 2);

    controls.update();
    renderer.render(scene, camera);
  };

  animate();
}

main();

function searchLocation(location) {
  if (location === "planet1") {
    selectedPlanet = planet1;
    showPlanetInfo("planet1", "Thông tin về Hành tinh 1");
  } else if (location === "planet2") {
    selectedPlanet = planet2;
    showPlanetInfo("planet2", "Thông tin về Hành tinh 2");
  } else if (location === "planet3") {
    selectedPlanet = planet3;
    showPlanetInfo("planet3", "Thông tin về Hành tinh 3");
  } else {
    alert("Vị trí không hợp lệ!");
  }
}

function toggleView() {
  if (selectedPlanet) {
    spaceView = !spaceView;
    if (spaceView) {
      camera.position.set(0, 0, 3);
      camera.lookAt(scene.position);
      selectedPlanet = null;
    } else {
      camera.position.copy(selectedPlanet.position).multiplyScalar(1.5);
      camera.lookAt(selectedPlanet.position);
    }
  } else {
    alert("Không có hành tinh nào được chọn!");
  }
}

function showPlanetInfo(planetId, info) {
  const planetInfo = document.getElementById(planetId);
  planetInfo.innerHTML = info;
}

function onClick(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(
    [planet1, planet2, planet3],
    true
  );

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    const info = planet.userData.info;
    alert("Thông tin hành tinh: " + info);
  }
}
