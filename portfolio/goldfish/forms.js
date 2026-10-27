import * as THREE from '../vendor/three.module.js';
import {hash,GOLD_COLORS as C} from './plan.mjs?v=eed7fff475f6';
import {tennisForms} from '../tennis-forms.js?v=eed7fff475f6';

export function goldfishForms(root){
 const materials=new Map(),geometries=new Map(),compactKit=tennisForms(root);
 const pixels=new Uint8Array(128*128*4);
 for(let z=0;z<128;z++)for(let x=0;x<128;x++){const i=(z*128+x)*4,v=241+Math.floor(hash(x,z,11)*15);pixels[i]=pixels[i+1]=pixels[i+2]=v;pixels[i+3]=255;}
 const grain=new THREE.DataTexture(pixels,128,128);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(4,4);grain.needsUpdate=true;
 function material(color,options={}){const key=color+JSON.stringify(options);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.94,flatShading:true,map:grain,bumpMap:grain,bumpScale:.018,...options}));return materials.get(key);}
 function group(name,parent=root){const g=new THREE.Group();g.name=name;parent.add(g);return g;}
 function mesh(geometry,color,parent=root,options={}){const m=new THREE.Mesh(geometry,material(color,options));m.castShadow=!options.transparent;m.receiveShadow=true;parent.add(m);return m;}
 function primitive(kind){if(!geometries.has(kind))geometries.set(kind,kind==='box'?new THREE.BoxGeometry(1,1,1):kind==='ball'?new THREE.IcosahedronGeometry(1,1):kind==='rock'?new THREE.IcosahedronGeometry(1,0):new THREE.CylinderGeometry(1,1,1,8));return geometries.get(kind);}
 function box(name,size,position,color=C.paper,parent=root,options={}){const m=mesh(primitive('box'),color,parent,options);m.name=name;m.scale.set(...size);m.position.set(...position);return m;}
 function ball(name,scale,position,color,parent=root,options={}){const m=mesh(primitive('ball'),color,parent,options);m.name=name;m.scale.set(...scale);m.position.set(...position);return m;}
 function beam(name,a,b,r,color,parent=root,options={},endRadius=r){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(from);const m=mesh(new THREE.CylinderGeometry(endRadius,r,d.length(),7),color,parent,options);m.name=name;m.position.copy(from.add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
 function polygon(name,points,y,color,parent=root){const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))),geometry=new THREE.ShapeGeometry(shape);geometry.rotateX(-Math.PI/2);geometry.translate(0,y,0);const m=mesh(geometry,color,parent,{side:THREE.DoubleSide});m.name=name;return m;}
 function slab(name,points,top,bottom,color,parent=root){
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))),geometry=new THREE.ExtrudeGeometry(shape,{depth:top-bottom,bevelEnabled:false,curveSegments:1});geometry.rotateX(-Math.PI/2);geometry.translate(0,bottom,0);const m=mesh(geometry,color,parent);m.name=name;return m;
 }
 function faceted(name,points,heights,bottom,color,parent=root){
  const p=[],colors=[],c=new THREE.Color(color),centroid=points.reduce((v,q)=>[v[0]+q[0]/points.length,v[1]+q[1]/points.length],[0,0]),cy=heights.reduce((a,b)=>a+b,0)/heights.length;
  const tri=(a,b,d,shade)=>{const col=c.clone().multiplyScalar(shade);for(const v of [a,b,d]){p.push(...v);colors.push(col.r,col.g,col.b);}};
  for(let i=0;i<points.length;i++){const j=(i+1)%points.length,a=[points[i][0],heights[i],points[i][1]],b=[points[j][0],heights[j],points[j][1]],ab=[a[0],bottom,a[2]],bb=[b[0],bottom,b[2]];tri([centroid[0],cy,centroid[1]],b,a,.96+.08*hash(i,cy));tri(a,b,bb,.88);tri(a,bb,ab,.88);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const m=mesh(geo,'#ffffff',parent,{vertexColors:true,side:THREE.DoubleSide});m.name=name;return m;
 }
 function ribbon(name,points,color,radius=.025,parent=root,options={}){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*10),radius,5,false),color,parent,options);m.name=name;return{mesh:m,curve};}
 function stairs(name,a,b,width,count,parent=root){
  if(a[1]>b[1])[a,b]=[b,a];const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start),run=Math.hypot(d.x,d.z),g=group(name,parent);g.position.copy(start);g.rotation.y=Math.atan2(d.x,d.z);
  for(let i=0;i<count;i++){const height=d.y*(i+1)/count;box('Step '+(i+1),[width,height+.13,run/count+.03],[0,(height-.13)/2,(i+.5)*run/count],C.paper,g);box('Tread '+(i+1),[width-.03,.027,run/count*.94],[0,height+.022,(i+.5)*run/count],C.white,g);}
  return g;
 }
 function printed(name,texture,width,height,parent=root,options={}){const mat=new THREE.MeshStandardMaterial({map:texture,color:'#fffdf2',roughness:1,transparent:true,alphaTest:.08,side:THREE.DoubleSide,emissive:'#ffffff',emissiveMap:texture,emissiveIntensity:.11,...options});const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function compact(parent){const parts=[];parent.updateMatrixWorld(true);parent.traverse(o=>{if(o.isMesh)parts.push({name:o.name,position:o.getWorldPosition(new THREE.Vector3()).toArray(),geometry:o.geometry.type});});compactKit.compact(parent);parent.userData.parts=parts;}
 return{root,grain,material,group,mesh,box,ball,beam,polygon,slab,faceted,ribbon,stairs,printed,compact};
}
