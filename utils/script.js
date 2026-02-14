import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- CONFIGURACIÓN DE FECHA EXACTA ---
const fechaInicio = new Date(2024, 2, 13, 20, 38, 0); 

// --- FRASES PERSONALIZADAS ---
const frasesAmor = [
    "Mi Duo favorito", "La mas pro", "Mi MVP", 
    "Mi soporte emocional", "Mi compañera de rank",
    "Mi conexión al alma", "Mi persona favorita", "Mi mejor intención",
    "Grosera", "Mi compañera de chisme", "La mas estudiosa", "Futura bilingue",
    "La que me hace bullying", "Te quiero", "La que me trasnocha",
    "Cuidarte como a un girasol", "Mi compañera en Minecraft",
    "La mas dormilona", "Compañera de desvelos", "La mas terca",
    "Mi persona favorita", "Eres increible", "Me encantas", "Ninguna como tú",
    "Gracias por estar", "Mi casualidad bonita", "Te adoro", "Eres unica",
    "Mi 11:11", "Mi notificacion favorita", "Haces mis dias mejores",
    "La risa mas linda", "Que suerte coincidir", "Mi lugar seguro",
    "Simplemente tu", "La mas linda", "Inexplicable conexion",
    "Tu y yo", "Mi niña", "Eres magia", "Contigo todo es mejor",
    "Mi medicina", "Mi refugio", "Eres arte", "Mi felicidad"
];

let controls; 
let renderer; 

document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos DOM
    const enterButton = document.getElementById('enterButton');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingGif = document.querySelector('.loading-gif');
    const mainSite = document.getElementById('main-site');
    const bgMusic = document.getElementById('backgroundMusic');
    const beeGif = document.getElementById('beeGif');
    const scrollArrow = document.getElementById('scrollArrow');
    const universeSection = document.getElementById('universeSection');
    const toggleBtn = document.getElementById('toggleUniverseBtn');

    // --- ENTRADA ---
    if(enterButton) {
        enterButton.addEventListener('mouseenter', () => { if(beeGif) beeGif.src = beeGif.src; });
        enterButton.addEventListener('click', () => {
            welcomeScreen.style.display = 'none';
            loadingScreen.style.display = 'flex';
            loadingGif.classList.add('active');
            
            if(bgMusic) {
                bgMusic.volume = 0.5;
                bgMusic.play().catch(e => console.log("Audio autoplay prevenido"));
            }

            initUniverse(loadingScreen, mainSite, loadingGif);
        });
    }

    if(scrollArrow && universeSection) {
        scrollArrow.addEventListener('click', () => {
            universeSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- LÓGICA DEL BOTÓN MÓVIL ---
    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if(controls && renderer) {
                controls.enabled = !controls.enabled; 
                
                if(controls.enabled) {
                    renderer.domElement.style.touchAction = 'none';
                    toggleBtn.innerHTML = '<i class="bi bi-pause-circle"></i> Desactivar Giro';
                    toggleBtn.classList.add('active');
                } else {
                    renderer.domElement.style.touchAction = 'pan-y';
                    toggleBtn.innerHTML = '<i class="bi bi-hand-index-thumb"></i> Activar Giro';
                    toggleBtn.classList.remove('active');
                }
            }
        });
    }

    initCounters();
    initSlider();
    initGallery(); // <--- NUEVA FUNCIÓN PARA EL CARRUSEL
});

// ==========================================
//    CONFIGURACIÓN DEL UNIVERSO 3D
// ==========================================
function initUniverse(loadingScreen, mainSite, loadingGif) {
    const container = document.getElementById('universe-container');
    if (!container) return;

    const manager = new THREE.LoadingManager();
    
    manager.onLoad = function () {
        loadingGif.classList.remove('active');
        loadingGif.classList.add('finish');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainSite.classList.add('active'); 
        }, 500);
    };

    const textureLoader = new THREE.TextureLoader(manager);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 45); 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace; 
    renderer.domElement.style.touchAction = 'pan-y'; 
    container.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.enabled = false; 

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); 
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 3, 500);
    scene.add(pointLight);

    const sunGeo = new THREE.SphereGeometry(5, 64, 64);
    const sunTexture = textureLoader.load('img/planetas/sol.jpg'); 
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture, color: 0xffdd00 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    const sunDiv = document.createElement('div');
    sunDiv.className = 'planet-label sun-label';
    sunDiv.textContent = 'MI JULY'; 
    const sunLabel = new CSS2DObject(sunDiv);
    sunLabel.position.set(0, 0, 0);
    sun.add(sunLabel);

    const planets = [];

    function createPlanet(data) {
        const { size, distance, speed, texturePath } = data;
        const pivot = new THREE.Object3D();
        pivot.rotation.y = Math.random() * Math.PI * 2;
        scene.add(pivot);

        const geo = new THREE.SphereGeometry(size, 64, 64);
        const texture = textureLoader.load(texturePath);
        const mat = new THREE.MeshStandardMaterial({ 
            map: texture, roughness: 0.5, metalness: 0.1, emissive: 0x222222 
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.x = distance;
        mesh.userData = { rotationSpeed: 0.005 + Math.random() * 0.01 };
        pivot.add(mesh);

        const pathGeo = new THREE.RingGeometry(distance - 0.05, distance + 0.05, 128);
        const pathMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
        const path = new THREE.Mesh(pathGeo, pathMat);
        path.rotation.x = Math.PI / 2;
        scene.add(path);

        return { pivot, mesh, speed };
    }

    planets.push(createPlanet({ size: 1.5, distance: 10, speed: 0.008, texturePath: 'img/planetas/mercurio.jpg' }));
    planets.push(createPlanet({ size: 2.0, distance: 16, speed: 0.006, texturePath: 'img/planetas/venus.jpg' }));
    planets.push(createPlanet({ size: 2.2, distance: 24, speed: 0.004, texturePath: 'img/planetas/tierra.jpg' }));
    planets.push(createPlanet({ size: 1.8, distance: 32, speed: 0.003, texturePath: 'img/planetas/marte.jpg' }));
    planets.push(createPlanet({ size: 3.5, distance: 45, speed: 0.002, texturePath: 'img/planetas/jupiter.jpg' }));

    const outerRingPivot = new THREE.Object3D();
    scene.add(outerRingPivot);

    const ringRadius = 60; 
    const totalPhrases = 60; 
    const step = (Math.PI * 2) / totalPhrases;

    for (let i = 0; i < totalPhrases; i++) {
        const angle = i * step;
        const textContent = frasesAmor[i % frasesAmor.length]; 
        const div = document.createElement('div');
        div.className = 'outer-ring-label';
        div.textContent = textContent;
        const label = new CSS2DObject(div);
        label.position.set(Math.cos(angle) * ringRadius, (Math.random() - 0.5) * 8, Math.sin(angle) * ringRadius);
        outerRingPivot.add(label);
    }

    const starGeo = new THREE.BufferGeometry();
    const starCount = 4000;
    const posArray = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) posArray[i] = (Math.random() - 0.5) * 800;
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({size: 0.6, color: 0xffffff, transparent: true, opacity: 0.8});
    const starMesh = new THREE.Points(starGeo, starMat);
    scene.add(starMesh);

    function animate() {
        requestAnimationFrame(animate);
        planets.forEach(p => {
            p.pivot.rotation.y += p.speed; 
            p.mesh.rotation.y += p.mesh.userData.rotationSpeed;
        });
        outerRingPivot.rotation.y += 0.0008; 
        starMesh.rotation.y += 0.0001;
        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        labelRenderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function initCounters() {
    function actualizar() {
        const ahora = new Date();
        const diferencia = ahora - fechaInicio;
        const segs = Math.floor(diferencia / 1000);
        const mins = Math.floor(segs / 60);
        const horas = Math.floor(mins / 60);
        const dias = Math.floor(horas / 24);
        setText('totalDias', dias);
        setText('horas', horas % 24);
        setText('minutos', mins % 60);
        setText('segundos', segs % 60);
        let aniosCalc = ahora.getFullYear() - fechaInicio.getFullYear();
        let mesesCalc = ahora.getMonth() - fechaInicio.getMonth();
        let diasCalc = ahora.getDate() - fechaInicio.getDate();
        if (ahora.getHours() < fechaInicio.getHours() || (ahora.getHours() === fechaInicio.getHours() && ahora.getMinutes() < fechaInicio.getMinutes())) { diasCalc--; }
        if (diasCalc < 0) { mesesCalc--; diasCalc += new Date(ahora.getFullYear(), ahora.getMonth(), 0).getDate(); }
        if (mesesCalc < 0) { aniosCalc--; mesesCalc += 12; }
        setText('anios2', aniosCalc);
        setText('meses2', mesesCalc);
        setText('diasSolo2', diasCalc);
        setText('horas2', horas % 24);
    }
    function setText(id, val) { const el = document.getElementById(id); if(el) el.innerText = val < 10 ? '0'+val : val; }
    setInterval(actualizar, 1000);
    actualizar();
}

function initSlider() {
    const slider = document.getElementById('contadorSlider');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    if(!slider) return;
    function update() {
        slider.style.transform = `translateX(-${currentSlide * 50}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }
    dots.forEach((dot, i) => dot.addEventListener('click', () => { currentSlide = i; update(); }));
    let startX = 0;
    slider.parentElement.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    slider.parentElement.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        if(startX - endX > 50 && currentSlide < 1) currentSlide++;
        if(endX - startX > 50 && currentSlide > 0) currentSlide--;
        update();
    });
}

// --- NUEVA LÓGICA PARA EL CARRUSEL DE GALERÍA ---
function initGallery() {
    const cards = document.querySelectorAll('.gallery-card');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentIndex = 0;

    if (!cards.length || !prevBtn || !nextBtn) return;

    function showCard(index) {
        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    nextBtn.addEventListener('click', () => {
        currentIndex++;
        if (currentIndex >= cards.length) {
            currentIndex = 0; // Vuelve al principio
        }
        showCard(currentIndex);
    });

    prevBtn.addEventListener('click', () => {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = cards.length - 1; // Va al final
        }
        showCard(currentIndex);
    });
}