import {GLTFLoader} from "../three.js/examples/jsm/loaders/GLTFLoader.js";

class Clouds
{
    modelsPath;

    load(scene)
    {
        let scale = 0.5;
        let loader = new GLTFLoader();
        loader.setPath(this.modelsPath);
        loader.load("CloudBL.glb", function (gltf) {
            let obj = gltf.scene;
            obj.scale.set(scale, scale, scale);
            obj.position.set(-3, 13, 4);
            scene.add(obj);
        });

       loader.load("CloudFL.glb", function (gltf) {
            let obj = gltf.scene;
            obj.scale.set(scale, scale, scale);
            obj.position.set(2, 12, 3);
            scene.add(obj);
       });

        loader.load("CloudBR.glb", function (gltf) {
            let obj = gltf.scene;
            obj.scale.set(scale, scale, scale);
            obj.position.set(-4, 12, -4);
            scene.add(obj);
        });

        loader.load("CloudFR.glb", function (gltf) {
            let obj = gltf.scene;
            obj.scale.set(scale, scale, scale);
            obj.position.set(3, 13, -2);
            scene.add(obj);
        });
    }

    constructor(path) {
        this.modelsPath = path;
    }
}

export default Clouds;