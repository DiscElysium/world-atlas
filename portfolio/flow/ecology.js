import * as THREE from '../vendor/three.module.js';
import {seeded} from '../map-model.mjs?v=eed7fff475f6';
import {flowSurface} from './plan.mjs?v=eed7fff475f6';
import {FLOW_COLORS as C} from './palette.mjs?v=eed7fff475f6';
const mat=color=>new THREE.MeshStandardMaterial({color,roughness:1,flatShading:true});
function part(root,id,name){const g=new THREE.Group();g.name='FLOW · '+name;g.userData={moduleId:id,name};root.add(g);return g;}
// Five asymmetric, flat-bottomed rock forms. Each ring follows the same angular
// vertices, so the silhouette has broad geological faces rather than ball facets.
export function rockGeometry(variant=0){
 const random=seeded(64920+variant*431),n=variant===1||variant===3?5:6,rings=[],faces=[],colors=[],stone=new THREE.Color(C.rock),forms=[{w:1.2,d:.8,h:.72,top:.58},{w:.63,d:.66,h:1.65,top:.15},{w:1.52,d:.61,h:.94,top:.42},{w:.72,d:.63,h:.60,top:.09},{w:.85,d:.75,h:1.12,top:.34}],form=forms[variant%5];
 const profiles=[[1,0],[.87,form.h*.45],[form.top,form.h*.85]];
 for(let j=0;j<profiles.length;j++){const [r,y]=profiles[j],ring=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,irregular=.88+random()*.22;ring.push(new THREE.Vector3(Math.cos(a)*r*irregular*form.w+j*.08,y*(.91+random()*.15),Math.sin(a)*r*irregular*form.d-j*.055));}rings.push(ring);}
 const add=(a,b,c)=>{const shade=.89+random()*.20,col=stone.clone().multiplyScalar(shade);for(const q of[a,b,c]){faces.push(q.x,q.y,q.z);colors.push(col.r,col.g,col.b);}};
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const k=(i+1)%n;add(rings[j][i],rings[j+1][i],rings[j][k]);add(rings[j][k],rings[j+1][i],rings[j+1][k]);}
 const cap=new THREE.Vector3(.22,form.h,-.17);for(let i=0;i<n;i++)add(rings.at(-1)[i],cap,rings.at(-1)[(i+1)%n]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(faces,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}
function twig(a,b,r,material,parent){const d=new THREE.Vector3().subVectors(b,a),m=new THREE.Mesh(new THREE.CylinderGeometry(r*.58,r,d.length(),5),material);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m.castShadow=m.receiveShadow=true;parent.add(m);}
export function buildFlowEcology(root,plan){
 const life=part(root,'ecology','针叶林与枯树'),rocks=part(root,'outcrops','岩簇与碎石'),leaves=C.leaves.map(mat),bark=mat(C.trunk),stone=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}),variants=Array.from({length:5},(_,i)=>rockGeometry(i)),trunk=new THREE.CylinderGeometry(.019,.028,1,5),crowns=[5,6,7].map(n=>new THREE.ConeGeometry(1,1,n));
 let treeCount=0,bareCount=0,stoneCount=0;
 const anchors=[];
 for(const [index,q]of plan.props.entries()){
  const s=flowSurface(q.x,q.z,plan);if(s.white>.94||s.shore<.12||s.river<s.metric.width+.06)continue;
  if(q.kind.startsWith('pine')){
   if(s.rawHeight>3.6)continue;const tree=new THREE.Group(),k=Number(q.kind.at(-1))-1,h=q.scale*1.35;tree.name='Conifer variant '+k+' · '+index;tree.position.set(q.x,s.height-.025,q.z);tree.rotation.y=q.rotation;life.add(tree);
   const t=new THREE.Mesh(trunk,bark);t.scale.y=h*.60;t.position.y=h*.30;tree.add(t);
   for(let j=0;j<3;j++){const c=new THREE.Mesh(crowns[k],leaves[(k+j)%3]),r=h*(.105-j*.022)*(k===2?.82:1);c.scale.set(r,h*(.53-j*.025),r);c.position.y=h*(.36+j*.23);c.rotation.y=j*.28;c.castShadow=c.receiveShadow=true;tree.add(c);}treeCount++;anchors.push({kind:'pine',x:q.x,z:q.z,y:s.height});
  }else if(q.kind==='bare-tree'){
   const tree=new THREE.Group(),h=q.scale;tree.name='Bare branching tree · '+index;tree.position.set(q.x,s.height-.01,q.z);tree.rotation.y=q.rotation;life.add(tree);twig(new THREE.Vector3(),new THREE.Vector3(.022,h,0),.012,bark,tree);
   for(let j=0;j<6;j++){const a=j*2.4,y=h*(.31+j*.075),start=new THREE.Vector3(.018,y,0),end=new THREE.Vector3(Math.cos(a)*h*.21,y+h*.23,Math.sin(a)*h*.21);twig(start,end,.0065,bark,tree);if(j%2===0)twig(start.clone().lerp(end,.62),end.clone().add(new THREE.Vector3(.055,h*.10,-.04)),.004,bark,tree);}bareCount++;
  }else{
   const count=q.kind==='outcrop'?5:1;
   for(let i=0;i<count;i++){
    const a=i*2.38+q.rotation,r=i?q.scale*.72:0,x=q.x+Math.cos(a)*r,z=q.z+Math.sin(a)*r*.7,surface=flowSurface(x,z,plan);if(surface.white>.94||surface.shore<.06||surface.river<surface.metric.width+.025)continue;
    const size=q.scale*(i===0?1:.18+.12*(i%3)),m=new THREE.Mesh(variants[(index+i)%5],stone);m.name='Grounded angular rock '+stoneCount;m.scale.set(size,size*(q.kind==='pebble'?.45:q.kind==='outcrop'?1.04:.65),size);m.position.set(x,surface.height-size*.06,z);m.rotation.y=q.rotation+i*1.9;m.castShadow=m.receiveShadow=true;rocks.add(m);stoneCount++;anchors.push({kind:'rock',x,z,y:surface.height});
   }
  }
 }
 batch(life);batch(rocks);life.userData={...life.userData,treeCount,bareCount,modeledParts:treeCount*4+bareCount*10,variants:3};rocks.userData={...rocks.userData,modeledParts:stoneCount,variants:5};rocks.userData.anchors=anchors;return[life,rocks];
}
function batch(group){
 group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),buckets=new Map();group.traverse(o=>{if(!o.isMesh)return;const key=o.geometry.uuid+o.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);});
 for(const meshes of buckets.values())if(meshes.length>1){const first=meshes[0],b=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);b.name='Grounded instances · '+meshes.length;meshes.forEach((m,i)=>{b.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld));m.parent.remove(m);});b.castShadow=b.receiveShadow=true;b.instanceMatrix.needsUpdate=true;b.computeBoundingBox();b.computeBoundingSphere();group.add(b);}
}
