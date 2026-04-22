import * as THREE from 'three';

export class Nucleus {
    constructor(scene, protonCount, neutronCount) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.particles = [];
        
        this.protonMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff4d4d, // Red-ish
            metalness: 0.1,
            roughness: 0.2,
            clearcoat: 1.0
        });

        this.neutronMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x999999, // Gray
            metalness: 0.0,
            roughness: 0.5
        });

        this.build(protonCount, neutronCount);
    }

    build(protons, neutrons) {
        const total = protons + neutrons;
        const radius = 0.4 + (total * 0.05); // Grows slightly with size
        const sphereGeom = new THREE.SphereGeometry(0.3, 16, 16);

        for (let i = 0; i < total; i++) {
            // Fibonacci Sphere Algorithm for even distribution
            const phi = Math.acos(-1 + (2 * i) / total);
            const theta = Math.sqrt(total * Math.PI) * phi;

            const mesh = new THREE.Mesh(
                sphereGeom, 
                i < protons ? this.protonMaterial : this.neutronMaterial
            );

            // Position with a bit of random "jitter" for a natural clump look
            mesh.position.set(
                (radius * Math.cos(theta) * Math.sin(phi)) * (0.8 + Math.random() * 0.4),
                (radius * Math.sin(theta) * Math.sin(phi)) * (0.8 + Math.random() * 0.4),
                (radius * Math.cos(phi)) * (0.8 + Math.random() * 0.4)
            );

            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.group.add(mesh);
        }

        this.scene.add(this.group);
    }

    destroy() {
        this.scene.remove(this.group);
    }
}