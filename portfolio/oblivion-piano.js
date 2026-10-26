import * as THREE from './vendor/three.module.js';
import {pianoData} from './oblivion-piano-data.mjs';

export function buildPiano(f,parent){
 const piano=f.group('OBLIVION source grand piano · body, keys and open wing lid',parent);
 piano.position.set(.1,.75,.2);piano.rotation.y=Math.PI/2-.25;piano.scale.setScalar(1.55);
 for(const part of pianoData.meshes){
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(part.positions,3));
  geometry.setIndex(part.indices);geometry.computeVertexNormals();
  const mesh=f.mesh(geometry,piano,part.name.endsWith('Keys')?.95:.87,18);mesh.name=part.name;
  mesh.material=new THREE.MeshStandardMaterial({color:part.name.endsWith('Keys')?'#ecece4':'#29393f',roughness:.42,metalness:.08,flatShading:true});
 }
 parent.userData.pianoSource=pianoData.source;parent.userData.pianoHash=pianoData.sha256;
 const bench=f.group('Piano bench',parent);bench.position.set(.1,.75,2.13);bench.rotation.y=-.25;
 f.box([.93,.12,.48],[0,.60,0],bench,.75);
 for(const x of [-.36,.36])for(const z of [-.17,.17])f.box([.08,.54,.08],[x,.27,z],bench,.6);
 return piano;
}
