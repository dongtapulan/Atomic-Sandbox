import * as THREE from 'three';

export class QuantumModel {
    constructor(scene, shells) {
        this.scene = scene;
        this.shells = shells;
        this.group = new THREE.Group();
        this.clouds = [];
        
        // Create a reusable soft glow texture for "cloudy" particles
        this.particleTexture = this.createGlowTexture();
        
        this.build();
    }

    /**
     * Creates a soft circular gradient texture programmatically 
     * to avoid external 404 image errors.
     */
    createGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(0, 255, 255, 0.5)');
        gradient.addColorStop(0.5, 'rgba(0, 64, 128, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    build() {
        this.shells.forEach((count, index) => {
            const baseRadius = (index + 1) * 3;
            // 800 particles per electron provides a thick cloud without lagging
            const particleCount = count * 800; 
            
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const sizes = new Float32Array(particleCount);

            for (let i = 0; i < particleCount; i++) {
                // Spherical distribution math
                const angle = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                
                // Gaussian spread: makes the cloud denser near the center of the shell
                const spread = 0.8; 
                const r = baseRadius + (Math.random() - 0.5) * spread;

                positions[i * 3] = r * Math.sin(phi) * Math.cos(angle);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(angle);
                positions[i * 3 + 2] = r * Math.cos(phi);

                // Randomize sizes to make the cloud look more organic and "fuzzy"
                sizes[i] = Math.random() * 0.4 + 0.1;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const material = new THREE.PointsMaterial({
                size: 0.15,
                map: this.particleTexture, // Makes them look like soft clouds
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending, // Overlapping particles create a glow
                depthWrite: false, // Essential for transparent particles to not "clip" each other
                color: 0x2dccff // Electron Cyan
            });

            const cloud = new THREE.Points(geometry, material);
            this.group.add(cloud);
            this.clouds.push(cloud);
        });

        this.scene.add(this.group);
    }

    update() {
        // Slow, drifting rotation makes the cloud feel fluid
        this.group.rotation.y += 0.0015;
        this.group.rotation.z += 0.0008;

        // Subtle "pulsing" effect
        const time = Date.now() * 0.001;
        this.group.scale.setScalar(1 + Math.sin(time) * 0.02);
    }

    destroy() {
        // Dispose of the texture and geometry to prevent memory leaks
        this.group.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        this.scene.remove(this.group);
    }
}