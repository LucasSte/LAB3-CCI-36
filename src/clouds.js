import {GLTFLoader} from "../three.js/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "../three.js/build/three.module.js";

class Clouds
{
    modelsPath;
    cloudBL;
    cloudFL;
    cloudBR;
    cloudFR;

    BLInitial = new THREE.Vector3(-3, 13, 4);
    BLt = 0.006;
    FLt = 0.006;
    BRt = 0.006;
    FRt = 0.006;

    load(scene)
    {
        let scale = 0.5;
        let loader = new GLTFLoader();
        loader.setPath(this.modelsPath);

        let incomingObj;
        const group = new THREE.Group();

        loader.load("CloudBL.glb", function (gltf) {
            incomingObj = gltf.scene;
            incomingObj.scale.set(scale, scale, scale);
            group.add(incomingObj);
        });

        this.cloudBL = group;
        this.cloudBL.position.set(-3, 13, 4);
        scene.add(this.cloudBL);

        const group2 = new THREE.Group();
        loader.load("CloudFL.glb", function (gltf) {
            incomingObj = gltf.scene;
            incomingObj.scale.set(scale, scale, scale);
            group2.add(incomingObj);
        });

        this.cloudFL = group2;
        this.cloudFL.position.set(2, 11.5, 3);
        scene.add(this.cloudFL);

        const group3 = new THREE.Group();
        loader.load("CloudBR.glb", function (gltf) {
            incomingObj = gltf.scene;
            incomingObj.scale.set(scale, scale, scale);
            group3.add(incomingObj);
        });

        this.cloudBR = group3;
        this.cloudBR.position.set(-4, 13, -4);
        scene.add(this.cloudBR);

        const group4 = new THREE.Group();
        loader.load("CloudFR.glb", function (gltf) {
            incomingObj = gltf.scene;
            incomingObj.scale.set(scale, scale, scale);
            group4.add(incomingObj);
        });

        this.cloudFR = group4;
        this.cloudFR.position.set(3, 12, -2);
        scene.add(this.cloudFR);
    }

    animateBL()
    {
        let BLVector = new THREE.Vector3(-1, -1, -8);
        this.cloudBL.position.add(BLVector.multiplyScalar(this.BLt));
        if(Math.abs(this.cloudBL.position.x + 4) < 0.01)
        {
            this.BLt = -0.001;
        }
        else if(Math.abs(this.cloudBL.position.x - this.BLInitial.x) < 0.01)
        {
            this.BLt = 0.001;
        }
    }

    animateFL()
    {
        this.cloudFL.position.x -= this.FLt;
        this.cloudFL.position.z = 24 / 25 * Math.pow(this.cloudFL.position.x + 0.5, 2) - 3;
        if(Math.abs(this.cloudFL.position.x + 0.5) < 0.1)
        {
            this.FLt = - 0.006;
        }
        else if(Math.abs(this.cloudFL.position.x - 2) < 0.1)
        {
            this.FLt = 0.006;
        }
    }

    animateBR()
    {
        let BRVector = new THREE.Vector3(6.5, 0.5, 4.5);
        this.cloudBR.position.add(BRVector.multiplyScalar(this.BRt));
        if(Math.abs(this.cloudBR.position.x - 2.5) < 0.1)
        {
            this.BRt = -0.001;
        }
        else if(Math.abs(this.cloudBR.position.x + 4) < 0.1)
        {
            this.BRt = 0.001;
        }
    }

    animateFR()
    {
        let FRVector = new THREE.Vector3(-3.5, 1, 5.5);
        this.cloudFR.position.add(FRVector.multiplyScalar(this.FRt));
        if(Math.abs(this.cloudFR.position.x + 0.5) < 0.1)
        {
            this.FRt = -0.001;
        }
        else if(Math.abs(this.cloudFR.position.x - 3) < 0.1)
        {
            this.FRt = 0.001;
        }
    }

    animate()
    {
        this.animateBL();
        this.animateFL();
        this.animateBR();
        this.animateFR();
    }

    constructor(path) {
        this.modelsPath = path;
    }
}

export default Clouds;