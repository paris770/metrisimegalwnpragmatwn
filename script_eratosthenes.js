// script_eratosthenes.js
let scene, camera, renderer, controls, planetMesh, sunRaysGroup;

const COLORS = {
    space: 0x0a0a0a,
    earth: 0x2233ff,
    sun: 0xffff00,
    ray: 0xffffff
};

window.onload = function() {
    initEratosthenesModel();
};

function initEratosthenesModel() {
    const container = document.getElementById('eratosthenes-interactive-3d');
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.space);

    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(8, 5, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 1. ΔΗΜΙΟΥΡΓΙΑ ΓΗΣ
    const geo = new THREE.SphereGeometry(3, 64, 64);
    const mat = new THREE.MeshPhongMaterial({ 
        color: COLORS.earth, 
        wireframe: false,
        shininess: 20 
    });
    planetMesh = new THREE.Mesh(geo, mat);
    scene.add(planetMesh);

    // 2. ΗΛΙΑΚΕΣ ΑΚΤΙΝΕΣ (Παράλληλες)
    sunRaysGroup = new THREE.Group();
    const rayGeo = new THREE.CylinderGeometry(0.01, 0.01, 20);
    const rayMat = new THREE.MeshBasicMaterial({ color: COLORS.ray, transparent: true, opacity: 0.3 });

    for(let i = -4; i <= 4; i += 1) {
        for(let j = -4; j <= 4; j += 1) {
            const ray = new THREE.Mesh(rayGeo, rayMat);
            ray.rotation.z = Math.PI / 2;
            ray.position.set(-10, i, j);
            sunRaysGroup.add(ray);
        }
    }
    scene.add(sunRaysGroup);

    // 3. ΣΗΜΕΙΑ: ΣΥΗΝΗ & ΑΛΕΞΑΝΔΡΕΙΑ
    // Συήνη (Ο ήλιος πέφτει κάθετα - καμία σκιά)
    addMarker(0, 0, 3, "Συήνη (Κάθετα)", 0x00ff00);
    
    // Αλεξάνδρεια (Ο ήλιος πέφτει υπό γωνία 7.2 μοιρών)
    // Χρησιμοποιούμε λίγη τριγωνομετρία για να τη βάλουμε στη σωστή γωνία
    const angle = 7.2 * (Math.PI / 180);
    addMarker(Math.sin(angle) * 3, Math.cos(angle) * 3, 0, "Αλεξάνδρεια (Γωνία)", 0xff0000);

    // ΦΩΤΙΣΜΟΣ
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(-10, 0, 0); // Ο ήλιος έρχεται από αριστερά
    scene.add(sunLight);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function addMarker(x, y, z, label, color) {
    const markerGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 16);
    const markerMat = new THREE.MeshPhongMaterial({ color: color });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    
    // Τοποθέτηση ώστε να "εξέχει" από την επιφάνεια σαν ράβδος
    marker.position.set(x, y, z);
    
    // Σωστός προσανατολισμός (να δείχνει προς τα έξω από το κέντρο)
    const vector = new THREE.Vector3(x, y, z).normalize();
    marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vector);
    
    scene.add(marker);
}