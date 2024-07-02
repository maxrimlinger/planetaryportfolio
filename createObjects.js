import * as THREE from "three";
import {planetData} from "./data.js";

/** Linear parametric equation for ellipse - Does not account for Kepler's Second Law */
export function getPosAlongOrbit(t, semiMajorAxisLength, semiMinorAxisLength) {
    const x = -semiMajorAxisLength * Math.cos(t); // the negatives make sure planets speed up at their perihelions
    const y = 0;
    const z = -semiMinorAxisLength * Math.sin(t);
    return new THREE.Vector3(x, y, z);
}

class EllipseCurve extends THREE.Curve {
	constructor(semiMinorAxisLength, semiMajorAxisLength) {
		super();
        this.semiMajorAxisLength = semiMajorAxisLength;
        this.semiMinorAxisLength = semiMinorAxisLength;
	}
	getPoint(t) {
		return getPosAlongOrbit(t * 2 * Math.PI, this.semiMajorAxisLength, this.semiMinorAxisLength);
	}
}

export function createSun(scene) {
    const sunGeometry = new THREE.SphereGeometry(7, 25, 25);
    const sunMaterial = new THREE.MeshBasicMaterial({color: 0xffaf00});
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
}

export function createPlanets(scene, planets) {
    const orbitMaterial = new THREE.MeshBasicMaterial({color: 0xe8e8e8});
    
    for (const planet of planetData) {
        // planet
        const planetGeometry = new THREE.SphereGeometry(planet.radius, 20, 20); // TODO calculate detail based on radius. maybe?
        const planetMaterial = new THREE.MeshPhongMaterial({color: planet.color});
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // orbit
        const [x, y, z] = planet.orbitFocus;
        const distanceBetweenFoci = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
        const semiMinorAxisLength = Math.sqrt(Math.pow(planet.orbitSemiMajorAxisLength, 2) - Math.pow(distanceBetweenFoci / 2, 2));
        const path = new EllipseCurve(planet.orbitSemiMajorAxisLength, semiMinorAxisLength);
        const orbitGeometry = new THREE.TubeGeometry(path, 50, 0.15, 8, true);
        const orbitMesh = new THREE.Mesh(orbitGeometry, orbitMaterial);

        // combine orbit and planet into a local space together
        const planetOrbit = new THREE.Object3D();
        planetOrbit.add(orbitMesh);
        planetOrbit.add(planetMesh);
        planetOrbit.position.x = x / 2;
        planetOrbit.position.y = y / 2;
        planetOrbit.position.z = z / 2;
        planetOrbit.rotation.x = -Math.atan(y / z);
        planetOrbit.rotation.y = Math.asin(x / distanceBetweenFoci);
        planetOrbit.rotation.z = THREE.MathUtils.degToRad(planet.orbitZRotation);
        scene.add(planetOrbit);
        planets.push(
            {
                "planet": planetMesh,
                "semiMajorAxisLength": planet.orbitSemiMajorAxisLength,
                "semiMinorAxisLength": semiMinorAxisLength,
                "distanceBetweenFoci": distanceBetweenFoci
            }
        );
    }
}

export function createLighting(scene) {
    // ambient
    const ambientLight= new THREE.AmbientLight(0xFFFFFF, .1);
    scene.add(ambientLight);
    // sun
    const sunLight = new THREE.PointLight(0xEEEEFF, 100, 200, 1);
    scene.add(sunLight);
}