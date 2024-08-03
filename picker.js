import * as THREE from "three";

export class Picker {
    canvas;
    camera;
    raycaster = new THREE.Raycaster();
    colliderToObjectMap = {};
    pickableObjects = [];
    pickedObject = null;
    pickedObjectType = null;
    labelPicked = false;
    pos = {x: -100000, y: -100000};

    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;
        this.raycaster.far = 1000;
    }

    getCanvasRelativePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * this.canvas.width  / rect.width,
            y: (event.clientY - rect.top ) * this.canvas.height / rect.height,
        };
    }

    setPos(event) {
        const relativePos = this.getCanvasRelativePosition(event);
        this.pos.x = (relativePos.x / this.canvas.width ) *  2 - 1;
        this.pos.y = (relativePos.y / this.canvas.height) * -2 + 1;  // note we flip Y
    }

    clearPos() {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        this.pos.x = -100000;
        this.pos.y = -100000;
    }

    addEffect() {
        if (this.pickedObjectType == "orbit") {
            this.pickedObject.scale.set(2, 2, 2);
        } else if (this.pickedObjectType == "planet") {
            this.pickedObject.scale.set(2, 3, 2);
        }
    }

    resetEffect() {
        this.pickedObject.scale.set(1,1,1);
    }
    
    pick() {
        if (this.labelPicked) {
            return
        }
        if (this.pickedObject) {
            this.resetEffect()
        }
        this.raycaster.setFromCamera(this.pos, this.camera);
        const intersectedObjects = this.raycaster.intersectObjects(this.pickableObjects);
        if (intersectedObjects.length) {
            // pick the first object that the ray hit
            const pickedCollider = intersectedObjects[0].object;
            if (Object.hasOwn(this.colliderToObjectMap, pickedCollider.id)) {
                this.pickedObjectType = this.colliderToObjectMap[pickedCollider.id].type;
                this.pickedObject = this.colliderToObjectMap[pickedCollider.id].object;
                this.addEffect()
            }
        }
    }

    labelPick(selectedObject) {
        this.labelPicked = true;
        this.pickedObjectType = "planet";
        this.pickedObject = selectedObject;
        this.addEffect();
    }

    addWindowEventListeners(window) {
        window.addEventListener('mousemove', this.setPos.bind(this));
        window.addEventListener('mouseout', this.clearPos.bind(this));
        window.addEventListener('mouseleave', this.clearPos.bind(this));
        // mobile support
        window.addEventListener('touchstart', (event) => {
            // prevent the window from scrolling
            event.preventDefault();
            this.setPos(event.touches[0]).bind(this);
        }, {passive: false});
        window.addEventListener('touchmove', (event) => {
            this.setPos(event.touches[0]).bind(this);
        });
        window.addEventListener('touchend', this.clearPos.bind(this));
    }

    addLabelEventListeners(label, planet) {
        label.addEventListener("mouseenter", () => {this.labelPick(planet)});
        label.addEventListener("mouseleave", () => this.labelPicked = false);
        // mobile support
        window.addEventListener('touchstart', (event) => {
            // prevent the window from scrolling
            event.preventDefault();
            this.labelPick(planet);
        }, {passive: false});
        window.addEventListener('touchmove', () => {
            this.labelPick(planet);
        });
        window.addEventListener('touchend', () => this.labelPicked = false);
    }
}