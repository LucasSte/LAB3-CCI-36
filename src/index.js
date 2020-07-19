import * as THREE from "../three.js/build/three.module.js";
import {OrbitControls} from "../three.js/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "../three.js/examples/jsm/loaders/GLTFLoader.js";
import Clouds from "./clouds.js";
import { Sky } from "../three.js/examples/jsm/objects/Sky.js";
import * as dat from "../dat.gui/build/dat.gui.module.js";

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

let renderer = new THREE.WebGLRenderer({antialias: true});
// renderer.setClearColor(0x87CEEB, 1); //-> This is the blue sky color
renderer.setClearColor(0x787e74, 1);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

let light = new THREE.PointLight(0xffffff);
light.position.set(0, 20, 10);
scene.add(light);

let loader = new GLTFLoader();
loader.load('./src/models/Low_Poly_Island_no_clouds.glb', function (gltf) {
    let obj = gltf.scene;
    obj.scale.set(0.5, 0.5 , 0.5);
    scene.add(obj);
});

let clouds = new Clouds("./src/models/");
clouds.load(scene);

let controls = new OrbitControls(camera, renderer.domElement);
camera.position.y = 10;
camera.position.x = 0;
camera.position.z = 15;

controls.update();

let sky = new Sky();
sky.scale.setScalar(45000);
scene.add(sky);

let sun = new THREE.Vector3();
let effectController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    inclination: 0.49, // elevation / inclination
    azimuth: 0.25, // Facing front,
    exposure: renderer.toneMappingExposure
};


function guiChanged() {

    var uniforms = sky.material.uniforms;
    uniforms[ "turbidity" ].value = effectController.turbidity;
    uniforms[ "rayleigh" ].value = effectController.rayleigh;
    uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
    uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;

    var theta = Math.PI * ( effectController.inclination - 0.5 );
    var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

    sun.x = Math.cos( phi );
    sun.y = Math.sin( phi ) * Math.sin( theta );
    sun.z = Math.sin( phi ) * Math.cos( theta );

    uniforms[ "sunPosition" ].value.copy( sun );
    light.position.x = sun.x*1000;
    light.position.y = sun.y*1000;
    light.position.z = sun.z*1000;

    renderer.toneMappingExposure = effectController.exposure;
    renderer.render( scene, camera );

}

let gui = new dat.GUI();

gui.add( effectController, "turbidity", 0.0, 20.0, 0.1 ).onChange( guiChanged );
gui.add( effectController, "rayleigh", 0.0, 4, 0.001 ).onChange( guiChanged );
gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
gui.add( effectController, "exposure", 0, 1, 0.0001 ).onChange( guiChanged );

guiChanged();

var animate = function () {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    clouds.animate();
};

animate();