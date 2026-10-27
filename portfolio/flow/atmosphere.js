import * as THREE from '../vendor/three.module.js';
import {flowSurface,readingMask,raisedPoint} from './plan.mjs?v=eed7fff475f6';
import {smooth} from '../map-model.mjs?v=eed7fff475f6';
import {FLOW_COLORS as C} from './palette.mjs?v=eed7fff475f6';

function module(root,id,name){const g=new THREE.Group();g.name='FLOW · '+name;g.userData={moduleId:id,name};root.add(g);return g;}
function altitude(x,z,r,plan,gap){let h=0;for(const [dx,dz] of [[0,0],[-r,0],[r,0],[0,-r],[0,r],[-r*.7,-r*.7],[r*.7,r*.7]])h=Math.max(h,flowSurface(x+dx,z+dz,plan,false).height);return h+gap;}
function wingGeometry(){const s=new THREE.Shape();s.moveTo(0,.03);s.lineTo(.16,-.12);s.lineTo(.33,-.1);s.lineTo(.43,.09);s.lineTo(.24,.015);s.lineTo(.055,.09);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.013,bevelEnabled:false});g.rotateX(Math.PI/2);return g;}

// Thin rectangular scene volumes: their uniform alpha leaves the terrain visible.
function cloudMaterial(opacity){
 return new THREE.MeshStandardMaterial({color:C.cloud,emissive:C.cloud,emissiveIntensity:.08,roughness:1,flatShading:true,transparent:true,opacity,depthWrite:false,side:THREE.FrontSide});
}

function makeBird(wing,bodyGeo,{near=false}={}){
 const bird=new THREE.Group(),white=new THREE.MeshStandardMaterial({color:C.bird,roughness:.9,flatShading:true,side:THREE.DoubleSide,transparent:near,depthWrite:!near}),grey=new THREE.MeshStandardMaterial({color:near?'#789097':C.birdBody,roughness:1,flatShading:true,transparent:near,depthWrite:!near});
 const body=new THREE.Mesh(bodyGeo,white);body.scale.set(.043,.032,.16);bird.add(body);
 const beak=new THREE.Mesh(bodyGeo,grey);beak.scale.set(.021,.013,.055);beak.position.z=-.18;bird.add(beak);
 const a=new THREE.Mesh(wing,white),b=new THREE.Mesh(wing,white);b.scale.x=-1;bird.add(a,b);
 if(near)bird.traverse(o=>{if(o.isMesh)o.renderOrder=24;});
 return{bird,a,b,materials:[white,grey]};
}

export function buildFlowAtmosphere(root,plan,animate){
 const clouds=module(root,'clouds','漂浮薄云'),birds=module(root,'birds','远近鸟群');
 const geo=new THREE.BoxGeometry(1,1,1),wing=wingGeometry(),bodyGeo=new THREE.IcosahedronGeometry(1,0);
 const definitions=plan.blueprint?plan.clouds.map(q=>({...q,height:.12})):
  plan.clouds.map(([x,z,w,gap],i)=>({x,z,y:0,width:w*1.2,depth:w*.25,height:.18,rotation:i%2?.08:-.16,gap}));
 definitions.push({...raisedPoint(.84,.045,8.0,plan.L),y:8.0,width:2.0,depth:.45,height:.10,rotation:-.12,opacity:.32});
 for(const [i,q] of definitions.entries()){
  const cloud=new THREE.Group(),drift=i===3?2.6:1.55,level=Math.max(q.y,altitude(q.x,q.z,q.width*.52+drift,plan,q.gap||.95));
  cloud.name='Translucent cloud '+(i+1);cloud.position.set(q.x,level,q.z);cloud.rotation.y=q.rotation;
  cloud.userData={anchor:[q.x,q.z],flightLevel:level,drift,translucent:true};clouds.add(cloud);
  const material=cloudMaterial(q.opacity||.38),mesh=new THREE.Mesh(geo,material);mesh.scale.set(q.width,q.height,q.depth);mesh.renderOrder=18;mesh.castShadow=false;cloud.add(mesh);
  const baseline=material.opacity;
  animate(t=>{cloud.position.x=q.x+Math.sin(t*.117+i*.8)*drift;cloud.position.z=q.z+Math.sin(t*.081+i*.6)*.48;cloud.position.y=level+Math.sin(t*.10+i)*.08;material.opacity=baseline*(1-readingMask(cloud.position.x,cloud.position.z,plan)*.65);});
 }

 const far=plan.blueprint?plan.birds:plan.flocks.flatMap(([x,z,n],f)=>Array.from({length:n},(_,i)=>({x:x+(i-(n-1)/2)*.72,z:z+Math.abs(i-(n-1)/2)*.39,y:0,scale:.21,phase:f+i*.5})));
 for(const [i,q] of far.entries()){
  const {bird,a,b}=makeBird(wing,bodyGeo),level=Math.max(q.y,altitude(q.x,q.z,1.65,plan,1.65));
  bird.name='Valley bird '+i;bird.position.set(q.x,level,q.z);bird.scale.setScalar(q.scale/.21*.65);bird.userData={anchor:[q.x,q.z],flightLevel:level,foreground:false};birds.add(bird);
  animate(t=>{const phase=i*.4,tx=t*.11+phase,tz=t*.085+phase;a.rotation.z=Math.sin(t*2.6+phase)*.33;b.rotation.z=-a.rotation.z;bird.position.x=q.x+Math.sin(tx)*1.1;bird.position.z=q.z+Math.cos(tz)*.55;bird.position.y=level+Math.sin(t*.5+phase)*.09;bird.rotation.y=Math.atan2(-.121*Math.cos(tx),.04675*Math.sin(tz));});
 }

 // Place near passes in camera space, then transform them into the real scene.
 const passes=Array.from({length:3},(_,i)=>{const q=makeBird(wing,bodyGeo,{near:true});q.bird.name='Near-camera bird '+i;q.bird.visible=false;q.bird.userData={foreground:true};birds.add(q.bird);return q;});
 const parentInverse=new THREE.Quaternion(),cameraRotation=new THREE.Quaternion(),bank=new THREE.Quaternion(),tilt=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2),heading=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-Math.PI/2),point=new THREE.Vector3(),axis=new THREE.Vector3(0,0,1);
 function updateView(camera,{time=0,enabled=true,reduced=false}={}){
  camera.updateWorldMatrix(true,false);birds.updateWorldMatrix(true,false);birds.getWorldQuaternion(parentInverse).invert();camera.getWorldQuaternion(cameraRotation);
  passes.forEach(({bird,a,b,materials},i)=>{
   const cycle=28,phase=((time+(i<2?2-i*.5:14))%cycle+cycle)%cycle,duration=i<2?7:5.6,p=phase/duration;
   bird.visible=enabled&&!reduced&&p<1;if(!bird.visible)return;
   const base=camera.isPerspectiveCamera?Math.max(8,camera.position.y*.27):18,depth=base*(1.25-.46*Math.sin(p*Math.PI)),halfHeight=camera.isPerspectiveCamera?Math.tan(camera.fov*Math.PI/360)*depth:(camera.top-camera.bottom)/2,aspect=camera.isPerspectiveCamera?camera.aspect:(camera.right-camera.left)/(camera.top-camera.bottom),x=-1.35+2.7*p,y=i<2?.65-.35*p+i*.09:-.52+.20*p;
   point.set(x*halfHeight*aspect,(y+Math.sin(p*Math.PI)*.08)*halfHeight,-depth).applyMatrix4(camera.matrixWorld);bird.position.copy(birds.worldToLocal(point));
   bank.setFromAxisAngle(axis,-.13+Math.sin(p*Math.PI*2)*.12);bird.quaternion.copy(parentInverse).multiply(cameraRotation).multiply(bank).multiply(tilt).multiply(heading);
   bird.scale.setScalar((camera.isPerspectiveCamera?Math.tan(camera.fov*Math.PI/360)*base*2:halfHeight*2)*.09*(i===2?1.25:1));
   a.rotation.z=Math.sin(time*5.4+i*.7)*.48;b.rotation.z=-a.rotation.z;const alpha=smooth(0,.10,p)*(1-smooth(.9,1,p));materials.forEach(m=>m.opacity=alpha);
  });
 }
 clouds.userData.cloudCount=definitions.length;clouds.userData.modeledParts=definitions.length;birds.userData.birdCount=far.length;birds.userData.foregroundBirdCount=passes.length;birds.userData.modeledParts=(far.length+passes.length)*4;
 return{modules:[birds,clouds],updateView};
}
