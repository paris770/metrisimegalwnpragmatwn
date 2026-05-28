// Λειτουργία για αλλαγή σελίδων (Single Page Application logic)
function showPage(pageId) {
    // Κρύψε την αρχική
    document.getElementById('home').classList.add('hidden');
    
    // Εμφάνισε τη σελίδα που πατήθηκε
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        window.scrollTo(0, 0); // Scroll στην κορυφή

        // Ξεκίνα το αντίστοιχο ΔΙΑΔΡΑΣΤΙΚΟ 3D μοντέλο
        if (pageId === 'thales') {
            initInteractiveThalesModel();
        } else if (pageId === 'eratosthenes') {
            initInteractiveEratosthenesModel();
        }
    }
}

function goBack() {
    // Κρύψε όλες τις σελίδες (Θαλή και Ερατοσθένη)
    document.getElementById('thales').classList.add('hidden');
    document.getElementById('eratosthenes').classList.add('hidden');
    // Δείξε το Home
    document.getElementById('home').classList.remove('hidden');
}

// ============================================================
// --- ΔΙΑΔΡΑΣΤΙΚΟ ΜΟΝΤΕΛΟ ΠΥΡΑΜΙΔΑΣ (ΘΑΛΗΣ) ---
// ============================================================
function initInteractiveThalesModel() {
    const container = document.getElementById('thales-3d');
    if (!container) return;
    container.innerHTML = ''; // Καθαρισμός προηγούμενου μοντέλου

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Γαλανός ουρανός
    
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true; // Ενεργοποίηση σκιών
    container.appendChild(renderer.domElement);

    // --- ΠΡΟΣΘΗΚΗ CONTROLS (OrbitControls) ΜΕ ΟΡΙΑ ---
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Πιο ομαλή κίνηση
    
    // Όρια Ζουμαρίσματος (Dolly)
    controls.minDistance = 5;  // Πόσο κοντά μπορεί να πάει (Max Zoom In)
    controls.maxDistance = 20; // Πόσο μακριά μπορεί να πάει (Max Zoom Out)
    
    // Όρια κάθετης περιστροφής (maxPolarAngle = PI/2 σημαίνει μέχρι το έδαφος)
    controls.maxPolarAngle = Math.PI / 2.1; 

    // Έδαφος (Άμμος)
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0xEDC9AF });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Πυραμίδα (ConeGeometry) - Αναβαθμισμένη γεωμετρία
    const pyrGeo = new THREE.ConeGeometry(3, 4.5, 4); // Ακτίνα, Ύψος, Πλευρές
    const pyrMat = new THREE.MeshPhongMaterial({ color: 0xC2B280 });
    const pyramid = new THREE.Mesh(pyrGeo, pyrMat);
    pyramid.position.y = 2.25; // Μισό του ύψους για να πατάει στο έδαφος
    pyramid.castShadow = true;
    scene.add(pyramid);

    // Ράβδος (CylinderGeometry)
    const stickGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 16);
    const stickMat = new THREE.MeshPhongMaterial({ color: 0x552200 });
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.position.set(6, 0.75, 0); // Τοποθέτηση δίπλα στην πυραμίδα
    stick.castShadow = true;
    scene.add(stick);

    // Φως/Ήλιος (DirectionalLight) - Σταθερός για να φαίνεται η αναλογία σκιάς
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(10, 8, 4); // Γωνία που ρίχνει σκιά
    light.castShadow = true;
    // Ρυθμίσεις ποιότητας σκιάς
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x606060)); // Απαλό ambient φως

    camera.position.set(12, 6, 12); // Αρχική θέση κάμερας
    controls.update();

    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Απαραίτητο για το damping
        renderer.render(scene, camera);
    }
    animate();

    // Handling window resize
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize(){
        if (!container.clientWidth || !container.clientHeight) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

// ============================================================
// --- ΔΙΑΔΡΑΣΤΙΚΟ ΜΟΝΤΕΛΟ ΓΗΣ (ΕΡΑΤΟΣΘΕΝΗΣ) ---
// ============================================================
function initInteractiveEratosthenesModel() {
    const container = document.getElementById('earth-3d');
    if (!container) return;
    container.innerHTML = ''; // Καθαρισμός

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Μαύρο διάστημα

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // --- ΠΡΟΣΘΗΚΗ CONTROLS (OrbitControls) ΜΕ ΟΡΙΑ ---
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false; // Εμποδίζουμε τη μετακίνηση, θέλουμε μόνο περιστροφή
    
    // Όρια Ζουμαρίσματος
    controls.minDistance = 3.5; // Πόσο κοντά μπορεί να πάει (Max Zoom In)
    controls.maxDistance = 10;  // Πόσο μακριά μπορεί να πάει (Max Zoom Out)

    // Γη (SphereGeometry) - Συμπαγής
    const earthGeo = new THREE.SphereGeometry(2, 64, 64); // Υψηλή ανάλυση
    const earthMat = new THREE.MeshPhongMaterial({ 
        color: 0x2233ff, 
        emissive: 0x000022 // Ελαφριά εσωτερική λάμψη
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // Αναπαράσταση Αλεξάνδρειας και Συήνης (μικρές κόκκινες κουκκίδες)
    // Τις προσθέτουμε ως παιδιά της Γης για να περιστρέφονται μαζί της
    const pinGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({color: 0xff0000});
    
    const syene = new THREE.Mesh(pinGeo, pinMat);
    syene.position.set(0, -2, 0); // Στον ισημερινό (απλοποιημένο)
    earth.add(syene); 

    const alexandria = new THREE.Mesh(pinGeo, pinMat);
    // Τοποθέτηση λίγο πιο πάνω και πιο πέρα για να φαίνεται η γωνία
    alexandria.position.set(0, -1.8, 0.8); 
    earth.add(alexandria);

    // Φως/Ήλιος (DirectionalLight) - Παράλληλες ακτίνες από δεξιά
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(12, 0, 5);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x222222));

    camera.position.set(0, 1, 7); // Αρχική θέση κάμερας
    controls.update();

    function animate() {
        requestAnimationFrame(animate);
        // Δυναμική περιστροφή της Γης
        earth.rotation.y += 0.002;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Handling window resize
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize(){
        if (!container.clientWidth || !container.clientHeight) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}