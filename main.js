import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {createSun, createPlanets, createLighting, getPosAlongOrbit, createBackground} from "./createObjects.js"

// WebGL compatibility check
if (!WebGL.isWebGLAvailable()) {
    // TODO give them my resume instead
} else {
    // initialization
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.z = 25;
    new OrbitControls(camera, canvas).enablePan = true;
    
    createSun(scene);
    const planets = [];
    createPlanets(scene, planets);
    createLighting(scene);
    createBackground(scene);

    function animate(time) {
        const GM = 0.07; // the gravitational pull of the sun
        for (const planet of planets) {
            const meanMotion = Math.sqrt(GM / Math.pow(planet.semiMajorAxisLength, 3));
            const meanAnomaly = meanMotion * time;

            // calculate eccentricity   
            const eccentricity = planet.distanceBetweenFoci / (2 * planet.semiMajorAxisLength);
            
            // Solve the Kepler Equation. Big thanks to this StackOverflow: https://space.stackexchange.com/questions/8911/determining-orbital-position-at-a-future-point-in-time
            let eccentricAnomaly = meanAnomaly; // We'll start by estimating that E = M
            while (true) {
                const deltaEccentricAnomaly = (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly) / (1 - eccentricity * Math.cos(eccentricAnomaly));
                eccentricAnomaly -= deltaEccentricAnomaly;
                if (Math.abs(deltaEccentricAnomaly) < 1e-6) break; // estimate till it's good enough
            }

            const position = getPosAlongOrbit(eccentricAnomaly, planet.semiMajorAxisLength, planet.semiMinorAxisLength);
            planet.planet.position.x = position.z; // In all honesty, I do not know why z and x need to be flipped.
            planet.planet.position.y = position.y; 
            planet.planet.position.z = position.x; 
        }
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time) {
        animate(time);
        
        if (resizeRendererToDisplaySize(renderer)) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}