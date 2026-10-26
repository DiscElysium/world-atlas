import * as THREE from './vendor/three.module.js';

// Normal lit stone; the image-wide renderer supplies the white outlines.
export function stoneForms(root){
 const stone=new THREE.MeshStandardMaterial({color:'#bbc5bf',roughness:.9,flatShading:true,side:THREE.DoubleSide});
 const strokes=new Map(),boxGeometry=new THREE.BoxGeometry(1,1,1);
 function stroke(opacity=.72){if(!strokes.has(opacity))strokes.set(opacity,new THREE.LineBasicMaterial({color:'#647570',transparent:true,opacity:opacity*.5,depthWrite:false}));return strokes.get(opacity)}
 function mesh(geometry,parent=root,opacity=.72,angle=28){if(!geometry.attributes.normal)geometry.computeVertexNormals();const m=new THREE.Mesh(geometry,stone);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function group(name,parent=root){const g=new THREE.Group();g.name=name;parent.add(g);return g}
 function box(size,position=[0,0,0],parent=root,opacity=.72){const m=mesh(boxGeometry,parent,opacity);m.scale.set(...size);m.position.set(...position);return m}
 function segment(a,b,parent=root,opacity=.6){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);const l=new THREE.Line(g,stroke(opacity));parent.add(l);return l}
 function polyline(points,parent=root,opacity=.6,closed=false){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const line=closed?new THREE.LineLoop(g,stroke(opacity)):new THREE.Line(g,stroke(opacity));parent.add(line);return line}
 function beam(a,b,width=.08,depth=width,parent=root,opacity=.65){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(from);const m=box([width,d.length(),depth],from.add(to).multiplyScalar(.5).toArray(),parent,opacity);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m}
 function extrude(shape,depth,parent=root,opacity=.8){return mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:5}),parent,opacity)}
 function pointedShape(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,h*.6);s.quadraticCurveTo(-w*.49,h*.79,0,h);s.quadraticCurveTo(w*.49,h*.79,w/2,h*.6);s.lineTo(w/2,0);s.closePath();return s}
 function pointed(w,h,depth=.16,thickness=.12,parent=root,opacity=.8){const s=pointedShape(w,h),inside=pointedShape(w-2*thickness,h-thickness);const hole=new THREE.Path(inside.getPoints(10).reverse());s.holes.push(hole);const m=extrude(s,depth,parent,opacity);m.userData.structure='pointed arch';return m}
 function gable(w,h,d,parent=root,opacity=.65){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(0,h);s.lineTo(w/2,0);s.closePath();const m=extrude(s,d,parent,opacity);m.position.z=-d/2;return m}
 function stairs(a,b,width,parent=root,count=12){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start),run=Math.hypot(delta.x,delta.z);const g=group('Stone staircase',parent);g.position.copy(start);g.rotation.y=Math.atan2(delta.x,delta.z);for(let i=0;i<count;i++){const y=delta.y*(i+.5)/count;box([width,.13,run/count+.02],[0,y,(i+.5)*run/count],g,.5)}return g}
 function compact(parent){
  parent.updateMatrixWorld(true);const inverse=parent.matrixWorld.clone().invert(),faces=new Map(),lines=new Map(),remove=[];let parts=0;
  parent.traverse(o=>{
   if(!o.geometry||(!o.isMesh&&!o.isLine))return;
   const transform=inverse.clone().multiply(o.matrixWorld),p=o.geometry.attributes.position,index=o.geometry.index,v=new THREE.Vector3();
   const point=i=>v.fromBufferAttribute(p,i).applyMatrix4(transform).toArray();
   if(o.isMesh){parts++;if(!faces.has(o.material))faces.set(o.material,[]);for(let i=0;i<(index?.count??p.count);i++)faces.get(o.material).push(...point(index?index.getX(i):i))}
   else{const opacity=Math.round(o.material.opacity*4)/4;if(!lines.has(opacity))lines.set(opacity,[]);const target=lines.get(opacity);if(o.isLineSegments){for(let i=0;i<p.count;i++)target.push(...point(i))}else{for(let i=0;i<p.count-1;i++)target.push(...point(i),...point(i+1));if(o.isLineLoop)target.push(...point(p.count-1),...point(0))}}
   remove.push(o);
  });
  remove.forEach(o=>o.removeFromParent());
  for(const [material,vertices] of faces){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.name=parent.name+' · lit geometry';m.castShadow=true;m.receiveShadow=true;parent.add(m)}
  for(const [opacity,vertices] of lines){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));parent.add(new THREE.LineSegments(g,stroke(opacity)))}
  parent.userData.modeledParts=parts;
 }
 return{root,stone,stroke,mesh,group,box,segment,polyline,beam,extrude,pointed,pointedShape,gable,stairs,compact};
}
