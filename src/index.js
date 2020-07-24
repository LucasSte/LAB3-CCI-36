import * as THREE from "../three.js/build/three.module.js";
import {OrbitControls} from "../three.js/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "../three.js/examples/jsm/loaders/GLTFLoader.js";
import Clouds from "./clouds.js";
import { Sky } from "../three.js/examples/jsm/objects/Sky.js";
import * as dat from "../dat.gui/build/dat.gui.module.js";
import {BufferGeometryUtils} from "../three.js/examples/jsm/utils/BufferGeometryUtils.js"

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
light.shadow.mapSize.width = 4096;
light.shadow.mapSize.height = 4096;
light.shadow.bias = -0.001;
scene.add(light);
let helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );

let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

let allObjectsGroup = new THREE.Group();


let loader = new GLTFLoader();
loader.load('./src/models/Low_Poly_Island_no_clouds.glb', function (gltf) {
    let obj = gltf.scene;
    obj.scale.set(0.5, 0.5 , 0.5);

    obj.traverse(function (child) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.flatShading = false;
        if ( child instanceof THREE.Object3D ) {
            if(child.geometry !== undefined){
                // console.log("~ geometry ~");
                // console.log(child.geometry);

                // let geo = new THREE.Geometry().fromBufferGeometry( child.geometry );
                // geo.mergeVertices();
                // geo.computeVertexNormals();
                // child.geometry.fromGeometry( geo );

                // let mergedGeometry = BufferGeometryUtils.mergeVertices(child.geometry, 1);
                // mergedGeometry.computeVertexNormals();
                // child.geometry = mergedGeometry;

                child.geometry.computeVertexNormals();


                // console.log("~ smooth geometry ~");
                // console.log(child.geometry);

            }
        }
    })
    //scene.add(obj);
    allObjectsGroup.add(obj);
});

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