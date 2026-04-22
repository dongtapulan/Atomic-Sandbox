import * as THREE from 'three';

export class BohrModel {
    constructor(scene, shells) {
        this.scene = scene;
        this.shells = shells; // Array like [2, 4]
        this.group = new THREE.Group();
        this.electrons = [];
        
        this.electronGeom = new THREE.SphereGeometry(0.15, 16, 16);
        this.electronMat = new THREE.MeshStandardMaterial({
            color: 0x2dccff, // Cyan
            emissive: 0x2dccff,
            emissiveIntensity: 0.5
        });

        this.build();
    }

    build() {
        this.shells.forEach((count, index) => {
            const radius = (index + 1) * 3; // Distance from nucleus

            // 1. Create the Orbit Ring
            const ringGeom = new THREE.TorusGeometry(radius, 0.02, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({ 
                color: 0xcccccc, 
                transparent: true, 
                opacity: 0.3 
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.PI / 2; // Lay it flat
            this.group.add(ring);

            // 2. Create Electrons for this shell
            for (let i = 0; i < count; i++) {
                const electron = new THREE.Mesh(this.electronGeom, this.electronMat);
                
                // Assign properties for animation
                const angle = (i / count) * Math.PI * 2;
                electron.userData = {
                    angle: angle,
                    speed: 0.02 / (index + 1), // Outer shells move slower
                    radius: radius
                };

                this.group.add(electron);
                this.electrons.push(electron);
            }
        });

        this.scene.add(this.group);
    }

    update() {
        // Spin the electrons
        this.electrons.forEach(el => {
            el.userData.angle += el.userData.speed;
            el.position.x = Math.cos(el.userData.angle) * el.userData.radius;
            el.position.z = Math.sin(el.userData.angle) * el.userData.radius;
        });
    }

    destroy() {
        this.scene.remove(this.group);
    }
}