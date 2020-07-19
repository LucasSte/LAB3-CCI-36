import * as THREE from "../three.js/build/three.module.js";
import {OrbitControls} from "../three.js/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "../three.js/examples/jsm/loaders/GLTFLoader.js";
import Clouds from "./clouds.js";

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

var animate = function () {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    clouds.animate();
};

animate();