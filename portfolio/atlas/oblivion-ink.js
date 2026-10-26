import * as THREE from '../vendor/three.module.js';
// A material variation of the existing geometry. White feature edges are
// geometry, so they follow the worktop's growth and all camera movements.
export function applyOblivionInk(entry){
  const black=new THREE.MeshStandardMaterial({color:'#07090b',roughness:1,metalness:0,flatShading:true});black.name='OBLIVION / black model faces';
  const white=new THREE.LineBasicMaterial({color:'#ffffff',toneMapped:false});white.name='OBLIVION / white feature edges';
  let meshes=0,segments=0;
  for(const group of entry.groups){
    group.updateWorldMatrix(true,true);const inverse=group.matrixWorld.clone().invert(),points=[];
    group.traverse(o=>{
      if(!o.isMesh||o.userData.surface_marking)return;
      const materials=Array.isArray(o.material)?o.material:[o.material];
      if(materials.every(m=>m.transparent||m.transmission>0))return;
      const edge=new THREE.EdgesGeometry(o.geometry,32),p=edge.attributes.position,matrix=inverse.clone().multiply(o.matrixWorld),v=new THREE.Vector3();
      for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(matrix);points.push(v.x,v.y,v.z);}segments+=p.count/2;edge.dispose();
      o.material=black;meshes++;
    });
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
    const lines=new THREE.LineSegments(geometry,white);lines.name='Oblivion white borders';lines.userData.feature_edges=true;lines.renderOrder=1;group.add(lines);
  }
  entry.inkStyle={black:'#07090b',border:'#ffffff',meshes,segments,featureAngle:32};return entry.inkStyle;
}
