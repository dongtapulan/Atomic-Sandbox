import { gsap } from 'gsap';

export class SceneTransitions {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Smoothly morphs between atomic models
     * @param {THREE.Group} oldModel - The model to remove
     * @param {THREE.Group} newModel - The model to show
     */
    morphModel(oldModel, newModel) {
        if (!oldModel) return;

        // 1. Prepare the new model (start invisible and small)
        newModel.group.scale.set(0.5, 0.5, 0.5);
        newModel.group.traverse((obj) => {
            if (obj.material) {
                obj.material.transparent = true;
                obj.material.opacity = 0;
            }
        });

        // 2. Animate the Transition
        const tl = gsap.timeline();

        tl.to(oldModel.group.scale, {
            x: 1.5, y: 1.5, z: 1.5,
            duration: 0.5,
            ease: "power2.in"
        })
        .to(oldModel.group.traverse(obj => {
            if(obj.material) gsap.to(obj.material, { opacity: 0, duration: 0.4 });
        }), {}, 0)
        .add(() => {
            oldModel.destroy(); // Remove old model mid-transition
        })
        .to(newModel.group.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.75)"
        })
        .to(newModel.group.traverse(obj => {
            if(obj.material) gsap.to(obj.material, { opacity: 1, duration: 0.4 });
        }), {}, "-=0.8");
    }
}