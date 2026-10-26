import * as THREE from '../vendor/three.module.js';

export function buildGoldfishCouple(f,p,textures={}){
 const root=f.group('08 · Back-to-back seated paper protagonists'),g=f.group('One shared ivory ground / two separate paper cutouts',root),q=p.couple;g.position.set(q.x,q.y,q.z);
 const width=q.width/2,height=q.height;
 if(textures.couple)for(const [i,name] of ['Male protagonist · facing left','Female protagonist · facing right'].entries()){
  const piece=f.group(name,g),mesh=f.printed('Printed seated silhouette',textures.couple,width,height,piece,{alphaTest:.12});
  const uv=mesh.geometry.attributes.uv,left=i===0?.045:.515,right=i===0?.515:.970,top=.93,bottom=.055;
  uv.setXY(0,left,top);uv.setXY(1,right,top);uv.setXY(2,left,bottom);uv.setXY(3,right,bottom);uv.needsUpdate=true;
  piece.position.x=(i===0?-1:1)*width/2;mesh.rotation.x=-q.lean;mesh.position.set(0,height*Math.cos(q.lean)/2,-height*Math.sin(q.lean)/2);
  const backing=mesh.clone();backing.name='Reverse paper surface';backing.material=mesh.material.clone();backing.material.color.set('#e3d6bf');backing.position.z-=.016;piece.add(backing);
  f.beam('Discrete paper kickstand',[0,.04,-.02],[0,.80,-.63],.013,'#cfc1a6',piece);
  const support=f.mesh(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([-.15,.02,0,.15,.02,0,0,.7,-.6],3)),'#e4d8c1',piece,{side:THREE.DoubleSide});support.geometry.computeVertexNormals();support.name='Folded triangle support';
  piece.userData.paper={width,height,lean:q.lean,textureWindow:[left,bottom,right,top]};
 }
 f.box('Shared narrow paper seating lip',[q.width*.78,.035,.42],[0,.015,-.06],'#eee4d0',g);
 root.userData.moduleId='couple';return root;
}
