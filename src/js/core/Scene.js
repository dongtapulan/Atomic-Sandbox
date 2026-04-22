import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

// 🛠️ FIX: Removed the extra Composer/SSAO imports here. 
// They live inside Renderer.js now!
import { LabRenderer } from './Renderer.js';

// Physics Models
import { Nucleus } from '../physics/Nucleus.js';
import { BohrModel } from '../physics/Bohr.js';
import { RutherfordModel } from '../physics/Rutherford.js';
import { QuantumModel } from '../physics/Quantum.js';

// UI Logic
import { Sidebar } from '../ui/Sidebar.js'; 
import { SceneTransitions } from '../ui/Transitions.js';

class AtomicScene {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        
        // 1. Initialize Post-Processing Renderer
        // We initialize camera first so the renderer can use it for SSAO
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(12, 8, 15);
        
        this.labRenderer = new LabRenderer(this.scene, this.camera, this.container);
        
        // 2. Initialize Logic Managers
        this.transitions = new SceneTransitions(this.scene);
        
        // 3. Initialize Sidebar & Connect the "Automatic" Info Card bridge
        this.sidebar = new Sidebar();
        this.sidebar.setCallback((p, n, s) => this.loadAtom(p, n, s));

        // 4. Atmosphere & Environment
        this.scene.background = new THREE.Color(0xe0eafc); 
        
        // 5. State Management
        this.currentNucleus = null;
        this.currentElectrons = null;
        this.currentStyle = 'bohr'; 
        this.lastData = { p: 6, n: 6, s: [2, 4] }; 

        this.init();
        this.setupModelToggles();
    }

    init() {
        // 1. Controls - The Smooth Interaction Fix
        this.controls = new OrbitControls(this.camera, this.labRenderer.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.zoomSpeed = 0.6; 
        
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 2;   
        this.controls.maxDistance = 100; 
        this.controls.target.set(0, 0, 0);

        // 2. Lighting (SSAO works best with a good main light)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(10, 15, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.set(2048, 2048);
        this.scene.add(mainLight);

        // 3. Environment Grid
        const grid = new THREE.GridHelper(30, 30, 0xd1d9e6, 0xffffff);
        grid.position.y = -8; 
        this.scene.add(grid);

        // 4. Load the initial Element (Carbon)
        this.loadAtom(this.lastData.p, this.lastData.n, this.lastData.s);

        // Listeners
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Start Loop
        this.animate = this.animate.bind(this);
        this.animate();
        
        console.log("HueMind Lab: Engine Stabilized with Post-Processing.");
    }

    setupModelToggles() {
        const buttons = document.querySelectorAll('#model-controls button');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentStyle = btn.getAttribute('data-model');
                this.loadAtom(this.lastData.p, this.lastData.n, this.lastData.s);
            });
        });
    }

    /**
     * loadAtom: Handles the 3D assembly and morphing transitions
     */
    loadAtom(protons, neutrons, shells = [2, 4]) {
        const oldElectrons = this.currentElectrons;
        this.lastData = { p: protons, n: neutrons, s: shells };

        // Nucleus Update
        if (this.currentNucleus) this.currentNucleus.destroy();
        this.currentNucleus = new Nucleus(this.scene, protons, neutrons);

        // Electron Model Selection
        let newElectrons;
        if (this.currentStyle === 'bohr') {
            newElectrons = new BohrModel(this.scene, shells);
        } 
        else if (this.currentStyle === 'rutherford') {
            const totalElectrons = shells.reduce((a, b) => a + b, 0);
            newElectrons = new RutherfordModel(this.scene, totalElectrons);
        }
        else if (this.currentStyle === 'quantum') {
            newElectrons = new QuantumModel(this.scene, shells);
        }

        // Morphing Logic
        if (this.transitions && oldElectrons) {
            this.transitions.morphModel(oldElectrons, newElectrons);
        } else {
            if (oldElectrons) oldElectrons.destroy();
        }

        this.currentElectrons = newElectrons;

        if (this.controls) {
            this.controls.target.set(0, 0, 0);
        }
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Pass resize to the custom renderer
        this.labRenderer.setSize(width, height);
        
        if(this.controls) this.controls.update();
    }

    animate() {
        requestAnimationFrame(this.animate);
        
        if (this.controls) {
            this.controls.update(); 
        }

        if (this.currentElectrons) {
            this.currentElectrons.update();
        }

        // Render via the Post-Processing Composer
        this.labRenderer.render();
    }
}

// Global instance for the lab sandbox
const sandbox = new AtomicScene();
export default sandbox;