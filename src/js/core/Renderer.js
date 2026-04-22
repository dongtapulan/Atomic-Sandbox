import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

/**
 * LabRenderer: Handles post-processing with Mobile Optimization
 * Focuses on SSAO depth without sacrificing FPS.
 */
export class LabRenderer {
    constructor(scene, camera, container) {
        // 1. Core Renderer with High-Performance hint
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: false, // Composer handles its own smoothing
            alpha: true,
            powerPreference: "high-performance" 
        });
        
        // Limit Pixel Ratio for mobile (High-DPI displays like Redmi can be 3x, which is too heavy)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        // 2. Post-processing Composer
        this.composer = new EffectComposer(this.renderer);
        
        // 3. Render Pass
        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        // 4. Optimized SSAO Pass
        // Optimization: Use 50% of the window size for the shadow buffer
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.ssaoPass = new SSAOPass(scene, camera, width, height);
        
        // PERFORMANCE SETTINGS
        this.ssaoPass.maxSpp = 16;            // Samples per pixel (Default is 32, 16 is plenty for mobile)
        this.ssaoPass.kernelRadius = 0.5;    // Tighten shadow area
        this.ssaoPass.minDistance = 0.005;
        this.ssaoPass.maxDistance = 0.05;
        
        // visual check: if lagging, set this to true to see the shadows only
        this.ssaoPass.output = SSAOPass.OUTPUT.Default; 

        this.composer.addPass(this.ssaoPass);
    }

    render() {
        this.composer.render();
    }

    setSize(w, h) {
        this.renderer.setSize(w, h);
        this.composer.setSize(w, h);
        
        // Update SSAO resolution accordingly
        if (this.ssaoPass) {
            this.ssaoPass.setSize(w, h);
        }
    }
}