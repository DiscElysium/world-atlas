import * as THREE from '../../vendor/three.module.js';
import {tennisForms} from '../../tennis-forms.js';
import {C,hash} from './plan.mjs';
export function goldfishForms(root){
 const materials=new Map(),geometries=new Map(),sourceGeometry=new Set(),kit=tennisForms(root),pixels=new Uint8Array(64*64*4);
 for(let i=0;i<64*64;i++){const v=235+Math.floor(hash(i%64,i>>6)*20);pixels.set([v,v,v,255],i*4);}
 const grain=new THREE.DataTexture(pixels,64,64);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(6,6);grain.needsUpdate=true;
 function material(color,options={}){const key=color+JSON.stringify(options);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.87,flatShading:true,bumpMap:grain,bumpScale:.009,...options}));return materials.get(key);}
 function group(name,parent=root){const g=new THREE.Group();g.name=name;parent.add(g);return g;}
 function mesh(geo,color,parent=root,options={}){sourceGeometry.add(geo);const m=new THREE.Mesh(geo,color?.isMaterial?color:material(color,options));m.castShadow=!m.material.transparent;m.receiveShadow=true;parent.add(m);return m;}
 function geometry(kind){if(!geometries.has(kind)){
  let g;if(kind==='bevel'){const b=.025,s=new THREE.Shape();s.moveTo(-.5+b,-.5+b);s.lineTo(.5-b,-.5+b);s.lineTo(.5-b,.5-b);s.lineTo(-.5+b,.5-b);s.closePath();g=new THREE.ExtrudeGeometry(s,{depth:1-2*b,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:1,steps:1,curveSegments:1});g.translate(0,0,-.5+b);}else g=kind==='box'?new THREE.BoxGeometry(1,1,1):new THREE.IcosahedronGeometry(1,0);geometries.set(kind,g);
 }return geometries.get(kind);}
 function box(name,size,position,color=C.paper,parent=root,options={}){const {bevel=true,...matOptions}=options,m=mesh(geometry(bevel?'bevel':'box'),color,parent,matOptions);m.name=name;m.scale.set(...size);m.position.set(...position);return m;}
 function ball(name,size,position,color,parent=root){const m=mesh(geometry('rock'),color,parent);m.name=name;m.scale.set(...size);m.position.set(...position);return m;}
 function beam(name,a,b,r,color,parent=root,endRadius=r,sides=7){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),v=to.clone().sub(from),m=mesh(new THREE.CylinderGeometry(endRadius,r,v.length(),sides),color,parent);m.name=name;m.position.copy(from.add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
 function slab(name,points,top,bottom,color,parent=root){const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))),geo=new THREE.ExtrudeGeometry(shape,{depth:top-bottom,bevelEnabled:false,curveSegments:1});geo.rotateX(-Math.PI/2);geo.translate(0,bottom,0);const m=mesh(geo,color,parent);m.name=name;return m;}
 function polygon(name,points,y,color,parent=root){const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))),geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);geo.translate(0,y,0);const m=mesh(geo,color,parent,{side:THREE.DoubleSide});m.name=name;return m;}
 function ribbon(name,points,color,radius=.025,parent=root){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),m=mesh(new THREE.TubeGeometry(curve,Math.max(10,points.length*4),radius,5,false),color,parent);m.name=name;return{mesh:m,curve};}
 function printed(name,texture,width,height,parent=root,options={}){const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshStandardMaterial({map:texture,color:'#ffffff',roughness:1,transparent:true,alphaTest:.15,side:THREE.DoubleSide,emissive:'#ffffff',emissiveMap:texture,emissiveIntensity:.08,...options}));m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function compact(parent){const parts=[],glass=new Set();parent.updateMatrixWorld(true);parent.traverse(o=>{if(o.isMesh){parts.push({name:o.name,position:o.getWorldPosition(new THREE.Vector3()).toArray(),geometry:o.geometry.type});if(o.userData.batchGlass){glass.add(o.material);o.material.transparent=false;}}});kit.compact(parent);for(const m of glass)m.transparent=true;parent.traverse(o=>{if(o.isMesh&&o.material.transparent)o.castShadow=false;});parent.userData.parts=parts;}
 function releaseBakedGeometry(){const active=new Set();root.traverse(o=>{if(o.geometry)active.add(o.geometry);});for(const geo of sourceGeometry)if(!active.has(geo))geo.dispose();sourceGeometry.clear();}
 return{root,grain,materials,material,group,mesh,box,ball,beam,slab,polygon,ribbon,printed,compact,releaseBakedGeometry};
}
