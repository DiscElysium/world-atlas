import * as THREE from '../vendor/three.module.js';

// Authored working notes continue under the physical prints, never over them.
export function createPhotoDraft(){
 const material=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);mesh.name='Other Works · measured contact sheet';mesh.rotation.x=-Math.PI/2;mesh.position.y=.630;let previous;
 return {mesh,configure(mobile,data,photos){
  if(previous===mobile)return;previous=mobile;
  const width=mobile?27.1:43.5,depth=mobile?61.3:27.5,c=document.createElement('canvas');c.width=mobile?1536:2304;c.height=Math.round(c.width*depth/width);const g=c.getContext('2d'),s=c.width/width,X=x=>(x+width/2)*s,Z=z=>(z+depth/2)*s;
  function path(points,alpha=.22,dash=[]){g.save();g.strokeStyle='#6b8586';g.globalAlpha=alpha;g.lineWidth=.70;g.setLineDash(dash);g.beginPath();points.forEach(([x,z],i)=>i?g.lineTo(X(x),Z(z)):g.moveTo(X(x),Z(z)));g.stroke();g.restore();}
  function text(value,x,z,size=13){g.save();g.fillStyle='#6d8586';g.globalAlpha=.65;g.font=size+'px Arial';g.fillText(value,X(x),Z(z));g.restore();}
  const edge=width/2-.55;for(let z=-depth/2+1;z<depth/2-1;z+=.65)path([[-edge,z],[-edge+.18+(Math.round(z*10)%5===0?.10:0),z]],.4);
  for(let x=-width/2+1;x<width/2-1;x+=1.1)path([[x,depth/2-.5],[x,depth/2-.7]],.30);
  text('FIELDNOTES / OTHER PERSPECTIVES',-width/2+.8,-depth/2+.8,14);text('SENSE / PLAY / SEE',width/2-(mobile?9:7),-depth/2+.8,13);
  // Registered silhouettes record the final actual rigid-body placements.
  for(const photo of photos){const p=data.tracks[photo.name].at(-1).p;photo.geometry.computeBoundingBox();const b=photo.geometry.boundingBox,scale=data.scales?.[photo.name]?.[0]??1,w=(b.max.x-b.min.x)*scale+.45,d=(b.max.z-b.min.z)*scale+.45;
   const x=p[0],z=p[2];for(const [a,c]of [[-1,-1],[1,1]])path([[x+a*w/2,z+c*(d/2-.45)],[x+a*w/2,z+c*d/2],[x+a*(w/2-.65),z+c*d/2]],.32);
  }
  if(!mobile){
   text('01 / SENSORY MEMORY',-20.3,-6.4,13);path([[-20.3,-6.1],[-17.8,-6.1],[-16.2,-5]],.35);
   for(let k=0;k<4;k++){const x=-19.9+k*.4;path([[x,-8.2],[x+.25,-8.05],[x,-7.9],[x-.25,-8.05],[x,-8.2]],.23);}
   text('02 / MOTION & MATERIAL',-6.6,4.3,12);text('03 / SEMANTICS > GEOMETRY',9.3,-2.0,12);
   text('04 / TRACE / MEASURE / REPEAT',-10.6,12.8,12);
   for(let k=0;k<5;k++){const r=.34+k*.18,points=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;points.push([-18.6+Math.cos(a)*r,-9.8+Math.sin(a)*r*.45]);}path(points,.20);}
  }else{for(const [label,z]of [['MEMORY & PERCEPTION',-10.2],['MOVEMENT & MATERIAL',8.5],['RULES & REPRESENTATION',18.8],['IMAGE / EVIDENCE / STUDY',28.9]]){text(label,-width/2+.8,z,13);path([[-width/2+.8,z+.3],[-width/2+5,z+.3]],.23);}}
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;material.map?.dispose();material.map=texture;material.needsUpdate=true;mesh.geometry.dispose();mesh.geometry=new THREE.PlaneGeometry(width,depth);
 }};
}
