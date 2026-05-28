// script_thales.js

// Παγκόσμιες μεταβλητές
let scene, camera, renderer, controls, buildingGroup, stick, light;

// Φυσικά χρώματα με υψηλή αντίθεση
const COLORS = {
    marble: 0xF2F2F2, // Καθαρό λευκό μαρμάρου
    sand: 0xD2B48C,   // Φυσική άμμος
    sky: 0x87CEEB,    // Γαλανός ουρανός
    stick: 0x552200   // Σκούρο ξύλο ράβδου
};

// Δημιουργία απλής υφής πέτρας με Canvas (για να μην χρειαζόμαστε εξωτερικό αρχείο)
function createStoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5f5dc'; // Beige βάση
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for(let i=0; i<1000; i++) {
        ctx.fillRect(Math.random()*256, Math.random()*256, 2, 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2); // Επανάληψη υφής
    return texture;
}
const stoneTexture = createStoneTexture();

window.onload = function() {
    initInteractiveThalesModel();
};

function initInteractiveThalesModel() {
    const container = document.getElementById('thales-interactive-3d');
    if (!container) return;
    container.innerHTML = ''; 

    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.sky); // Καθαρός ουρανός

    // Κάμερα τοποθετημένη για καλή αρχική άποψη
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(15, 10, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true; // Ενεργοποίηση σκιών
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Μαλακές σκιές
    container.appendChild(renderer.domElement);

    // controls ΜΕ ΟΡΙΑ (Για να μην χάνεται ο χρήστης)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 5;  // Max Zoom In
    controls.maxDistance = 40; // Max Zoom Out
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Όριο περιστροφής (έδαφος)

    // Έδαφος (Άμμος)
    const groundMat = new THREE.MeshPhongMaterial({ color: COLORS.sand, map: stoneTexture });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Group για το κτίριο
    buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    // Default Κτίριο (Πυραμίδα Χέοπα) - Visual Height = 10
    addDetailedBuilding('khufu', 10);

    // Ράβδος (Stick) - Visual Height = 2 (Σταθερό)
    const stickMat = new THREE.MeshPhongMaterial({ color: COLORS.stick, shininess: 10 });
    stick = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 16), stickMat);
    // Τοποθέτηση δίπλα στο κτίριο (visual distance = 8)
    stick.position.set(8, 1, 0); 
    stick.castShadow = true;
    scene.add(stick);

    // ΦΩΤΙΣΜΟΣ (Ήλιος) - Δυναμικός
    light = new THREE.DirectionalLight(0xffffff, 1.3);
    light.castShadow = true;
    // Ρυθμίσεις ποιότητας σκιάς (Πολύ σημαντικό για μεγάλα αντικείμενα)
    light.shadow.mapSize.width = 2048; 
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 100;
    light.shadow.camera.left = -20;
    light.shadow.camera.right = 20;
    light.shadow.camera.top = 20;
    light.shadow.camera.bottom = -20;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x606060, 0.6)); // Απαλό ambient

    // Αρχική ρύθμιση ήλιου (βάσει default εισαγωγής: h=1, s=0.8)
    updatePhysicsBasedShadows(1, 0.8);

    controls.update();

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

// === Η ΣΗΜΑΝΤΙΚΗ ΔΙΟΡΘΩΣΗ: Φυσική Σκιά ===
// Υπολογίζει τη θέση του ήλιου ώστε η σκιά να είναι ΠΑΝΤΑ ανάλογη.
function updatePhysicsBasedShadows(stickH, stickS) {
    // tan(theta) = h / s
    const angle = Math.atan2(stickH, stickS);
    
    // Τοποθέτηση του φωτός σε μεγάλη απόσταση ώστε οι ακτίνες να είναι σχεδόν παράλληλες
    const dist = 50;
    light.position.set(
        Math.cos(angle) * dist, 
        Math.sin(angle) * dist, 
        0
    );
    
    // Στόχος του φωτός είναι το κέντρο της σκηνής (0,0,0)
    light.target.position.set(0, 0, 0);
    light.target.updateMatrixWorld();
}

// Λειτουργία για προσθήκη/αντικατάσταση κτιρίου
// Το visualHeight είναι σταθερό (π.χ. 10) για να χωράει στην οθόνη.
function addDetailedBuilding(type, visualHeight) {
    buildingGroup.clear(); // Καθαρισμός προηγούμενου

    let geometry;
    const material = new THREE.MeshPhongMaterial({ 
        color: COLORS.marble, 
        map: stoneTexture, 
        shininess: 50 
    });

    if (type === 'khufu') {
        // Πυραμίδα Χέοπα
        geometry = new THREE.ConeGeometry(visualHeight/1.3, visualHeight, 4); 
    } else if (type === 'parthenon') {
        // Παρθενώνας (σχηματικά)
        geometry = new THREE.BoxGeometry(visualHeight*1.8, visualHeight, visualHeight*0.9); 
    } else if (type === 'column') {
        // Λευκός Πύργος
        geometry = new THREE.CylinderGeometry(visualHeight/6, visualHeight/6, visualHeight, 32); 
    } else {
        geometry = new THREE.BoxGeometry(visualHeight, visualHeight, visualHeight); 
    }

    buildingMesh = new THREE.Mesh(geometry, material);
    buildingMesh.position.y = visualHeight / 2; // Να πατάει στο έδαφος
    buildingMesh.rotation.y = Math.PI / 4; // Σωστή γωνία για την πυραμίδα
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true; // Να δέχεται και σκιά
    buildingGroup.add(buildingMesh);
}

// CALCULATOR ΘΑΛΗ
function calculateShadowAndUpdate3D() {
    const buildingSelect = document.getElementById('building-select');
    const stickH = parseFloat(document.getElementById('stick-height').value);
    const stickS = parseFloat(document.getElementById('stick-shadow').value);
    const resultDiv = document.getElementById('calc-result');

    // Πραγματικά δεδομένα κτιρίων
    const buildingsData = {
        'khufu': { height: 139, type: 'khufu', name: 'Πυραμίδα Χέοπα' },
        'parthenon': { height: 13.7, type: 'parthenon', name: 'Παρθενώνας' },
        'leykos-pyrgos': { height: 34, type: 'column', name: 'Λευκός Πύργος' },
        'piraeus-tower': { height: 84, type: 'column', name: 'Πύργος Πειραιά' }
    };

    const selectedBuilding = buildingsData[buildingSelect.value];

    if (isNaN(stickH) || isNaN(stickS) || stickH <= 0 || stickS <= 0) {
        resultDiv.innerHTML = "⚠️ Παρακαλώ βάλε έγκυρες θετικές τιμές.";
        resultDiv.classList.remove('hidden');
        return;
    }

    // 1. Υπολογισμός ΠΡΑΓΜΑΤΙΚΗΣ Σκιάς (Αναλογία Θαλή)
    const realBuildingShadow = (selectedBuilding.height * stickS) / stickH;

    resultDiv.innerHTML = `⚠️ Βάσει της αναλογίας του Θαλή:<br>
                           Αν ο <strong>${selectedBuilding.name}</strong> έχει ύψος ${selectedBuilding.height}μ,<br>
                           τότε η σκιά του θα είναι περίπου <strong>${realBuildingShadow.toFixed(2)} μέτρα</strong>!`;
    resultDiv.classList.remove('hidden');

    // 2. Ενημέρωση του 3D Μοντέλου (Χρησιμοποιούμε Visual Scale height=10)
    addDetailedBuilding(selectedBuilding.type, 10);
    
    // 3. ΕΥΘΥΓΡΑΜΜΙΖΟΥΜΕ ΤΗΝ ΠΡΑΓΜΑΤΙΚΗ ΣΚΙΑ ΜΕ ΤΗΝ 3D
    // Η γωνία του ήλιου αλλάζει βάσει των inputs, 
    // άρα η σκιά της 3D πυραμίδας θα είναι *αναλογικά* σωστή.
    updatePhysicsBasedShadows(stickH, stickS);
}