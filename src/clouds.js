import {GLTFLoader} from "../three.js/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../three.js/build/three.module.js";

class Clouds
{
    modelsPath;
    cloudBL;
    cloudFL;
    cloudBR;
    cloudFR;

    BLinitial = new THREE.Vector3(-3, 13, 4);
    BLt = 0.006;

    load(scene)
    {
        let scale = 0.5;
        let loader = new GLTFLoader();
        loader.setPath(this.modelsPath);

        var incomingObj;
        var group = new THREE.Group();

        loader.load("CloudBL.glb", function (gltf) {
            incomingObj = gltf.scene;
            incomingObj.scale.set(scale, scale, scale);
            group.add(incomingObj);
        });

        this.cloudBL = group;
        this.cloudBL.position.set(-3, 13, 4);
        scene.add(this.cloudBL);

       loader.load("CloudFL.glb", function (gltf) {
            incomingObj = gltf.scene;
            incomingObj.scale.set(scale, scale, scale);
            incomingObj.position.set(2, 12, 3);
            scene.add(incomingObj);
       });

       this.cloudFL = incomingObj;

        loader.load("CloudBR.glb", function (gltf) {
            incomingObj = gltf.scene;
            incomingObj.scale.set(scale, scale, scale);
            incomingObj.position.set(-4, 12, -4);
            scene.add(incomingObj);
        });

        this.cloudBR = incomingObj;

        loader.load("CloudFR.glb", function (gltf) {
            incomingObj = gltf.scene;
            incomingObj.scale.set(scale, scale, scale);
            incomingObj.position.set(3, 13, -2);
            scene.add(incomingObj);
        });

        this.cloudFR = incomingObj;
    }

    animateBL()
    {
        let BLvector = new THREE.Vector3(-1, -1, -8);
        this.cloudBL.position.add(BLvector.multiplyScalar(this.BLt));
        console.log(this.cloudBL.position.x + 4);
        if(Math.abs(this.cloudBL.position.x + 4) < 0.01)
        {
            this.BLt = -0.006;
        }
        else if(Math.abs(this.cloudBL.position.x - this.BLinitial.x) < 0.01)
        {
            this.BLt = 0.006;
        }
    }

    animate()
    {
        this.animateBL();
    }

    constructor(path) {
        this.modelsPath = path;
    }
}

export default Clouds;