import * as THREE from "./three_src/three.module.js";
import {OrbitControls} from "./three_src/OrbitControls.js";
import {GLTFLoader} from "./three_src/GLTFLoader.js";
import Clouds from "./clouds.js";
import { Sky } from "./three_src/Sky.js";
import * as dat from "./three_src/dat.gui.module.js";
import { Water } from './three_src/Water2.js';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor(0x787e74, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

let light = new THREE.DirectionalLight(0xffffff);
light.castShadow = true;
light.shadow.camera.near = 1;
light.shadow.camera.far = 30;
let d = 15;
light.shadow.camera.top = d;
light.shadow.camera.bottom = -d;
light.shadow.camera.right = d;
light.shadow.camera.left = - d;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.bias = -0.001;
scene.add(light);
// let helper = new THREE.CameraHelper( light.shadow.camera );
// scene.add( helper );

let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

let allObjectsGroup = new THREE.Group();

// Ground
let loader = new GLTFLoader();
loader.load('./src/models/Low_Poly_Island_Ground.glb', function (gltf) {
    let obj = gltf.scene;
    obj.scale.set(0.5, 0.5 , 0.5);

    obj.traverse(function (child) {
        child.castShadow = true;
        child.receiveShadow = true;
    })
    //scene.add(obj);
    allObjectsGroup.add(obj);
});

// Water
let waterGeometry = new THREE.PlaneBufferGeometry( 200, 200 );
let water = new Water( waterGeometry,
    {
        color: '#009dff',
        // color: '#ffffff',
        scale: 10,
        flowDirection: new THREE.Vector2( 2, 1),
        textureWidth: 1024,
        textureHeight: 1024
    }
);
water.position.y = 5.6;
water.rotation.x = Math.PI * - 0.5;
scene.add(water)


let texture = THREE.ImageUtils.loadTexture("./textures/floor.jpg");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(100, 100);
// let material = new THREE.MeshPhongMaterial({map:texture});

let floorGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
let material = new THREE.MeshBasicMaterial({map:texture});
// material.color.setHex('#000000');
let plane = new THREE.Mesh(floorGeometry, material);
plane.receiveShadow = true;
plane.position.y = -100;
plane.rotation.x = Math.PI * - 0.5;
scene.add(plane);


// loader.load('./src/models/Water.glb', function (gltf) {
//     gltf.scene.traverse(function (child) {
//         if ( child instanceof THREE.Object3D ) {
//             if(child.geometry !== undefined) {
//                 let waterGeometry = child.geometry;
//                 let water = new Water( waterGeometry,
//                     {
//                         color: '#009dff',
//                         // color: '#ffffff',
//                         scale: 10,
//                         flowDirection: new THREE.Vector2( 1, 1),
//                         textureWidth: 1024,
//                         textureHeight: 1024
//                     }
//                 );
//                 water.position.set(0, 5.72, 0);
//                 water.scale.set(10, 10, 10);
//                 allObjectsGroup.add(water)
//
//             }
//         }
//     })
// });

let clouds = new Clouds("./src/models/");
clouds.load(allObjectsGroup);

scene.add(allObjectsGroup);

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
    azimuth: 0.25, // Facing front,
};

let skyUniforms = sky.material.uniforms;
skyUniforms[ "mieDirectionalG" ].value = 0.7;
skyUniforms[ "mieCoefficient" ].value = 0.005;
skyUniforms[ "turbidity" ].value = 10;
skyUniforms[ "rayleigh" ].value = 3;

function guiChanged() {

    let theta = Math.PI * -0.5;
    let phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

    if(effectController.azimuth < 0.030)
    {
        light.color.set(0xff9448 + (effectController.azimuth)/0.03 * (0xffffff - 0xff9448));
    }
    else if(effectController.azimuth < 0.472)
    {
        light.color.set(0xffffff);
    }
    else
    {
        light.color.set(0xff9448 + ((effectController.azimuth*100 - 50) / 3) * (0xffffff - 0xff9448));
    }
    sun.x = Math.cos( phi );
    sun.y = Math.sin( phi ) * Math.sin( theta );
    sun.z = Math.sin( phi ) * Math.cos( theta );

    skyUniforms[ "sunPosition" ].value.copy( sun );
    light.position.x = sun.x*20;
    light.position.y = sun.y*20;
    light.position.z = sun.z*20;

    renderer.render( scene, camera );

}

let gui = new dat.GUI();

gui.add( effectController, "azimuth", 0, 0.5, 0.001 ).onChange( guiChanged );

guiChanged();

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let objColor;

let intersects;
let clickedObject;
let down = false;
let lastMousePos = new THREE.Vector2();

let cloudsArr = [clouds.cloudFR, clouds.cloudBR, clouds.cloudFL, clouds.cloudBL];

function keyDown(event) {
    if(event.which === 74)
    {
        allObjectsGroup.rotateY(-0.01);
    }
    else if(event.which === 76)
    {
        allObjectsGroup.rotateY(0.01);
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    intersects = raycaster.intersectObjects(cloudsArr, true);
    if(down === true)
    {
        if(mouse.y > lastMousePos.y)
            clickedObject.position.y += 0.1;
        else if(mouse.y < lastMousePos.y)
            clickedObject.position.y -= 0.1;
    }
    lastMousePos.x = mouse.x;
    lastMousePos.y = mouse.y;

    controls.enabled = intersects.length <= 1;
}

function onMouseDown(event) {

    if(intersects.length > 1)
    {
        down = true;
        objColor = intersects[1].object.material.color.getHex();
        clickedObject = intersects[1].object;
        intersects[1].object.material.color.set(Math.random() * 0xffffff);
        controls.enabled = false;
    }
}

function onMouseUp(event) {
    if (clickedObject != null)
    {
        down = false;
        clickedObject.material.color.set(objColor);
        controls.enabled = true;
        clickedObject = null;
    }
}

var animate = function () {
    raycaster.setFromCamera(mouse, camera);


    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    if(clickedObject == null)
    {
        clouds.animate();
    }
};

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);
window.addEventListener('keydown', keyDown, false);

animate();