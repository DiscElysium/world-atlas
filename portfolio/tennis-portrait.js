import * as THREE from './vendor/three.module.js';
import {tennisForms} from './tennis-forms.js';
import {buildTennisAthlete} from './tennis-athlete.js';

// Render the actual modeled poses into a transparent scene-plane illustration.
export function createTennisPortrait(renderer){
 const scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);const f=tennisForms(root);
 buildTennisAthlete(f,{portrait:true,scale:1,court:{x:0,y:0,z:0,angle:0}});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.14}));floor.rotation.x=-Math.PI/2;floor.position.y=.137;floor.receiveShadow=true;scene.add(floor);
 scene.add(new THREE.HemisphereLight('#edf5ff','#8c927e',1.7));
 const sun=new THREE.DirectionalLight('#fff2da',2.7);sun.position.set(-3,7,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-4,right:4,top:5,bottom:-5,near:.1,far:25});sun.shadow.normalBias=.008;scene.add(sun);
 const camera=new THREE.OrthographicCamera(-2.65,2.65,1.66,-1.66,.1,40);camera.position.set(.8,2.8,11);camera.lookAt(-.4,1.10,4.4);camera.updateMatrixWorld();
 const target=new THREE.WebGLRenderTarget(1920,1200,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true});
 const previousTarget=renderer.getRenderTarget(),clear=renderer.getClearColor(new THREE.Color()),alpha=renderer.getClearAlpha();
 renderer.setClearColor('#ffffff',0);renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,camera);renderer.setRenderTarget(previousTarget);renderer.setClearColor(clear,alpha);
 const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material)});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
 target.texture.userData.tennisPortrait=true;
 return {texture:target.texture,dispose:()=>target.dispose()};
}
