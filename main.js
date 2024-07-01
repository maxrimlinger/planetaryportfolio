import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

// WebGL compatibility check
if (!WebGL.isWebGLAvailable()) {
	const warning = WebGL.getWebGLErrorMessage();
	document.body.appendChild(warning);
    // TODO give them my resume instead
} else {
    // initialization
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;
    new OrbitControls(camera, canvas);
    
    // add celestial objects
    // sun
    const sunGeometry = new THREE.SphereGeometry(5, 25, 25);
    const sunMaterial = new THREE.MeshBasicMaterial({color: 0xffaf00});
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    
    const orbits = [];
    const orbitTubeRadius = 0.1;
    const orbitMaterial = new THREE.MeshBasicMaterial({color: 0xe8e8e8});
    // planet 1
    const p1Distance = 20;
    const p1Geometry = new THREE.SphereGeometry(2, 10, 10);
    const p1Material = new THREE.MeshPhongMaterial({color: 0x4fc400});
    const p1 = new THREE.Mesh(p1Geometry, p1Material);
    orbits.push({planet: p1, focus: (5, 6, 7), majorAxisLength: 10});
    p1.position.x = p1Distance;
    // orbit
    const p1OrbitGeometry = new THREE.TorusGeometry(15, orbitTubeRadius, 20, 50);
    const p1Orbit = new THREE.Mesh(p1OrbitGeometry, orbitMaterial);
    p1Orbit.scale.x = 3;
    scene.add(p1);
    scene.add(p1Orbit);

    // add lighting
    // ambient
    const ambientLight= new THREE.AmbientLight(0xFFFFFF, .1);
    scene.add(ambientLight);
    // sun
    const sunLight = new THREE.PointLight(0xEEEEFF, 500);
    scene.add(sunLight);

    function animate(time) {
        for (const orbit of orbits) {
            
        }
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        // console.log(canvas.width, width, canvas.height, height);
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time) {
        time *= 0.001;  // convert time to seconds

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