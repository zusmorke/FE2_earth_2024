let scene, camera, renderer, controls, raycaster, mouse;
let planet1, planet2, planet3;
let selectedPlanet = null;
let spaceView = true;
let showOrbits = true;

function main() {
    const canvas = document.querySelector("#c");

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
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

    // Add atmospheric layer
    const atmosphereGeometry = new THREE.SphereGeometry(0.65, 32, 32);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
            vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
            gl_FragColor = vec4(atmosphereColor, 1.0) * intensity;
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
    });

    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    const starGeometry = new THREE.SphereGeometry(80, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load("images/galaxy.png"),
        side: THREE.BackSide,
    });

    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starMesh);

    // Add Sun
    const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load("images/sun.jpg"),
        emissive: 0xffff00,
        emissiveIntensity: 1,
    });

    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.set(10, 10, 10); // Place the sun further away from the planets
    scene.add(sunMesh);

    const sunLight = new THREE.PointLight(0xffffff, 1);
    sunLight.position.copy(sunMesh.position);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x404040); // Small ambient light
    scene.add(ambientLight);

    // Create orbits and planets
    function createPlanet(size, images, distance, info) {
        const planetGroup = new THREE.Group();

        const orbitGeometry = new THREE.RingGeometry(distance - 0.01, distance + 0.01, 64);
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

    // Speed controls
    let earthSpeed = 0.001;
    document.getElementById("earthSpeed").addEventListener("input", (event) => {
        earthSpeed = parseFloat(event.target.value);
        if (earthSpeed < 0) {
            earthSpeed = 0;
            event.target.value = 0;
        }
        console.log("Earth rotation speed updated to:", earthSpeed);
    });

    // Animate function update
    const animate = () => {
        requestAnimationFrame(animate);
        earthMesh.rotation.y -= earthSpeed;
        cloudMesh.rotation.y -= earthSpeed * 1.5;

        angle1 -= speed1;
        planet1.children[1].position.set(Math.cos(angle1) * 1, 0, Math.sin(angle1) * 1);

        angle2 -= speed2;
        planet2.children[1].position.set(Math.cos(angle2) * 1.5, 0, Math.sin(angle2) * 1.5);

        angle3 -= speed3;
        planet3.children[1].position.set(Math.cos(angle3) * 2, 0, Math.sin(angle3) * 2);

        controls.update();
        renderer.render(scene, camera);
    };

    document.getElementById("toggleOrbits").addEventListener("click", () => {
        toggleOrbits();
    });

    // Meteor impact simulation
    function createMeteor() {
        const meteorGeometry = new THREE.SphereGeometry(0.05, 32, 32);
        const meteorMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const meteorMesh = new THREE.Mesh(meteorGeometry, meteorMaterial);
        meteorMesh.position.set((Math.random() - 0.5) * 5, 3, (Math.random() - 0.5) * 5);

        scene.add(meteorMesh);

        const meteorTween = new TWEEN.Tween(meteorMesh.position)
            .to({ x: 0, y: 0, z: 0 }, 2000)
            .easing(TWEEN.Easing.Quadratic.In)
            .onUpdate(() => {
                meteorMesh.position.y -= 0.1;
            })
            .onComplete(() => {
                scene.remove(meteorMesh);
                createExplosion();
            });

        meteorTween.start();
    }

    function createExplosion() {
        const explosionGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xffa500,
            transparent: true,
            opacity: 0.7,
        });

        const explosionMesh = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosionMesh.position.set(0, 0, 0);

        scene.add(explosionMesh);

        const explosionTween = new TWEEN.Tween(explosionMesh.scale)
            .to({ x: 2, y: 2, z: 2 }, 1000)
            .easing(TWEEN.Easing.Exponential.Out)
            .onComplete(() => {
                scene.remove(explosionMesh);
            });

        explosionTween.start();
    }

    // Search location and animate camera movement
    function searchLocation(location) {
        console.log(`Searching for: ${location}`);
        // Implement search functionality here if needed
    }

    // Toggle between space and surface view
    function toggleView() {
        spaceView = !spaceView;
        if (spaceView) {
            camera.position.set(0, 0, 3);
        } else {
            camera.position.set(0, 0.5, 0.3);
        }
    }

    // Toggle the visibility of orbits
    function toggleOrbits() {
        showOrbits = !showOrbits;
        planet1.children[0].visible = showOrbits;
        planet2.children[0].visible = showOrbits;
        planet3.children[0].visible = showOrbits;
    }

    function onClick(event) {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects([earthMesh, planet1.children[1], planet2.children[1], planet3.children[1]]);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            if (clickedObject.userData.info) {
                alert(clickedObject.userData.info);
            }
              // Mô phỏng va chạm khi người dùng nhấp vào một hành tinh
              createMeteor();
        }
    }

    animate();
}

window.onload = main;
function searchLocation(location) {
  if (location.toLowerCase() === "hanoi") {
    selectedPlanet = planet1;
  } else if (location.toLowerCase() === "hue") {
    selectedPlanet = planet2;
  } else if (location.toLowerCase() === "hochiminh") {
    selectedPlanet = planet3;
  } else {
    alert("Vị trí không hợp lệ. Vui lòng nhập Hanoi, Hue hoặc HoChiMinh.");
    return;
  }

  spaceView = false;
  planet1.visible = false;
  planet2.visible = false;
  planet3.visible = false;

  if (selectedPlanet) {
    selectedPlanet.visible = true;
  }
}

function toggleView() {
  spaceView = !spaceView;

  if (spaceView) {
    planet1.visible = false;
    planet2.visible = false;
    planet3.visible = false;
  } else {
    if (selectedPlanet) {
      selectedPlanet.visible = true;
    }
  }
}

function onClick(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(
    [planet1.children[1], planet2.children[1], planet3.children[1]],
    true
  );

  if (intersects.length > 0) {
    const info = intersects[0].object.userData.info;
    alert(info);
  }
}
  
function toggleOrbits() {
  showOrbits = !showOrbits;
  planet1.children[0].visible = showOrbits;
  planet2.children[0].visible = showOrbits;
  planet3.children[0].visible = showOrbits;
}

document.getElementById("togglePalette").addEventListener("click", () => {
  const palette = document.getElementById("palette");
  if (palette.style.display === "none") {
      palette.style.display = "block";
      document.getElementById("togglePalette").style.display = "block";
      document.getElementById("openPalette").style.display = "none";
  } else {
      palette.style.display = "none";
      document.getElementById("togglePalette").style.display = "none";
      document.getElementById("openPalette").style.display = "block";
  }
});

document.getElementById("openPalette").addEventListener("click", () => {
  const palette = document.getElementById("palette");
  palette.style.display = "block";
  document.getElementById("togglePalette").style.display = "block";
  document.getElementById("openPalette").style.display = "none";
});


// Add Sun
const sunGeometry = new THREE.SphereGeometry(1, 32, 32); // Đặt bán kính của mặt trời
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFA500  }); // Đặt màu vàng cho mặt trời
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

// Đặt vị trí của mặt trời
sunMesh.position.set(10, 10, 10); // Đặt vị trí xa hơn so với các hành tinh

// Thêm ánh sáng từ mặt trời
const sunLight = new THREE.PointLight(0xffffff, 1); // Đặt ánh sáng mạnh từ mặt trời
sunLight.position.copy(sunMesh.position); // Đặt vị trí ánh sáng giống như mặt trời
scene.add(sunLight);

// Thêm nguồn ánh sáng môi trường
const ambientLight = new THREE.AmbientLight(0x404040); // Một ánh sáng môi trường nhỏ để tránh hiện tượng tối đen hoàn toàn
scene.add(ambientLight);


