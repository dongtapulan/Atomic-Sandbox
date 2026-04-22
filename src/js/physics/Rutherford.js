import * as THREE from 'three';

export class RutherfordModel {
    constructor(scene, totalElectrons) {
        this.scene = scene;
        this.count = totalElectrons;
        this.group = new THREE.Group();
        this.electrons = [];
        
        this.electronGeom = new THREE.SphereGeometry(0.15, 16, 16);
        this.electronMat = new THREE.MeshStandardMaterial({
            color: 0x2dccff,
            emissive: 0x2dccff,
            emissiveIntensity: 0.8
        });

        this.build();
    }

    build() {
        for (let i = 0; i < this.count; i++) {
            const orbitRadius = 4 + (Math.random() * 2); // Varying sizes
            
            // 1. Create a Tilted Orbit Ring
            const ringGeom = new THREE.TorusGeometry(orbitRadius, 0.015, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.2 });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            
            // Randomize the tilt (The Rutherford Look)
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.y = Math.random() * Math.PI;
            this.group.add(ring);

            // 2. Create the Electron
            const electron = new THREE.Mesh(this.electronGeom, this.electronMat);
            
            electron.userData = {
                angle: Math.random() * Math.PI * 2,
                speed: 0.01 + (Math.random() * 0.02),
                radius: orbitRadius,
                rotX: ring.rotation.x,
                rotY: ring.rotation.y
            };

            this.group.add(electron);
            this.electrons.push(electron);
        }

        this.scene.add(this.group);
    }

    update() {
        this.electrons.forEach(el => {
            const d = el.userData;
            d.angle += d.speed;

            // Math for tilted circular motion
            const x = Math.cos(d.angle) * d.radius;
            const z = Math.sin(d.angle) * d.radius;

            // Apply the same rotation as the ring
            el.position.set(x, 0, z);
            el.position.applyEuler(new THREE.Euler(d.rotX, d.rotY, 0));
        });
    }

    destroy() {
        this.scene.remove(this.group);
    }
}