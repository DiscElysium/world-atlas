import * as THREE from './vendor/three.module.js';
import {translate} from './i18n.mjs?v=8f12d970b90a';
import {PROJECTS} from './projects.mjs?v=8f12d970b90a';
import {removePrintedRegion} from './space-identity.js';

function print(text,width,depth,color,size=.8){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=Math.max(64,Math.round(2048*depth/width));
 const c=canvas.getContext('2d');let font=canvas.height*size;c.font=`600 ${font}px Arial,"Microsoft YaHei",sans-serif`;
 const measured=c.measureText(text).width;if(measured>canvas.width*.97){font*=canvas.width*.97/measured;c.font=`600 ${font}px Arial,"Microsoft YaHei",sans-serif`;}
 c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(text,canvas.width/2,canvas.height*.51);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.025,depthWrite:false,toneMapped:false,side:THREE.DoubleSide}));
 mesh.rotation.x=-Math.PI/2;mesh.name='Localized ground print: '+text;mesh.userData.localizedText=text;return mesh;
}
function tennisTranslation(view,name,text,color){
 const source=view.model.getObjectByName(name);if(!source?.isMesh)return()=>{};
 const attribute=source.geometry.attributes.position,point=new THREE.Vector3(),points=[];source.updateWorldMatrix(true,false);
 for(let i=0;i<attribute.count;i++)points.push(point.fromBufferAttribute(attribute,i).applyMatrix4(source.matrixWorld).clone());
 const center=points.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).divideScalar(points.length);
 let xx=0,xz=0,zz=0;for(const p of points){xx+=(p.x-center.x)**2;xz+=(p.x-center.x)*(p.z-center.z);zz+=(p.z-center.z)**2;}
 const angle=.5*Math.atan2(2*xz,xx-zz),u=new THREE.Vector3(Math.cos(angle),0,Math.sin(angle)),v=new THREE.Vector3(Math.sin(angle),0,-Math.cos(angle));
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity,y=-Infinity;
 for(const p of points){const a=p.dot(u),b=p.dot(v);left=Math.min(left,a);right=Math.max(right,a);top=Math.min(top,b);bottom=Math.max(bottom,b);y=Math.max(y,p.y);}
 const mesh=print(text,right-left,bottom-top,color,.96);mesh.position.copy(u.clone().multiplyScalar((left+right)/2).addScaledVector(v,(top+bottom)/2));mesh.position.y=y+.002;mesh.rotation.z=-angle;
 // Imported letter meshes are already in the source model's ground coordinates.
 view.model.add(mesh);return language=>{source.visible=language==='en';mesh.visible=language!=='en';};
}
function engineTranslation(view){
 const frame=new THREE.Group();frame.position.set(-8.65,.55,.70);frame.rotation.y=-.05;frame.updateMatrixWorld(true);
 const inverse=frame.matrixWorld.clone().invert(),variants=[];
 view.model.updateMatrixWorld(true);
 // The imported chapter number shares a mesh with its wordmark. Remove only
 // its tiny printed faces, then print the current number in the same plane.
 const number=PROJECTS.find(p=>p.id==='engine').number,source=view.model.getObjectByName('Information_Wing__navy');
 const removedTitle=removePrintedRegion(source,inverse,{x:[-5.12,6.0],y:[.387,.402],z:[-2.85,-.20]});
 removePrintedRegion(view.model.getObjectByName('Information_Wing__cyan_ink'),inverse,{x:[-4.85,-3.4],y:[.385,.43],z:[-1.60,-.85]});
 const titleFrame=frame.clone(),title=print('SPACE',10.5,2.25,'#193c80',.98);title.position.set(.1,.405,-1.46);titleFrame.add(title);titleFrame.name='SPACE project wordmark';view.model.add(titleFrame);if(source){source.userData.displayTitle='SPACE';source.userData.renamedTitleTriangles=removedTitle;}
 if(source?.isMesh){
  const geometry=source.geometry,positions=geometry.attributes.position,index=geometry.index,indices=[],transform=new THREE.Matrix4().multiplyMatrices(inverse,source.matrixWorld),p=new THREE.Vector3(),center=new THREE.Vector3();
  const count=index?index.count:positions.count;let removed=0;
  for(let i=0;i<count;i+=3){center.set(0,0,0);for(let j=0;j<3;j++)center.add(p.fromBufferAttribute(positions,index?index.getX(i+j):i+j).applyMatrix4(transform));center.divideScalar(3);
   if(center.x>=-5.05&&center.x<=-4.58&&center.y>=.40&&center.y<=.42&&center.z>=-3.4&&center.z<=-2.9){removed++;continue;}
   for(let j=0;j<3;j++)indices.push(index?index.getX(i+j):i+j);
  }
  source.geometry=geometry.clone();source.geometry.setIndex(indices);source.userData.chapterNumber=number;source.userData.renumberedTriangles=removed;
  const label=print(number,.42,.20,'#253d77',.96);label.position.set(-4.82,.412,-3.17);const numberedFrame=frame.clone();numberedFrame.name='Current Space chapter number';numberedFrame.add(label);view.model.add(numberedFrame);
 }
 const regions={
  Information_Wing__navy:{x:[-5.1,5.0],y:[.393,.397],z:[.05,.85]},
  Information_Wing__blue:{x:[-5.1,5.0],y:[.393,.397],z:[1.06,1.65]},
  Information_Wing__white:{x:[-5.0,1.8],y:[.703,.707],z:[2.16,2.91]}
 };
 for(const [name,region] of Object.entries(regions)){
  const mesh=view.model.getObjectByName(name);if(!mesh?.isMesh)continue;
  const original=mesh.geometry,positions=original.attributes.position,index=original.index,indices=[],transform=new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld),p=new THREE.Vector3(),center=new THREE.Vector3();
  const count=index?index.count:positions.count;let removed=0;
  for(let i=0;i<count;i+=3){center.set(0,0,0);for(let j=0;j<3;j++)center.add(p.fromBufferAttribute(positions,index?index.getX(i+j):i+j).applyMatrix4(transform));center.divideScalar(3);
   if(center.x>=region.x[0]&&center.x<=region.x[1]&&center.y>=region.y[0]&&center.y<=region.y[1]&&center.z>=region.z[0]&&center.z<=region.z[1]){removed++;continue;}
   for(let j=0;j<3;j++)indices.push(index?index.getX(i+j):i+j);
  }
  const english=original.clone();english.setIndex(indices);variants.push({mesh,original,english});mesh.userData.localizedTriangles=removed;
 }
 const specs=[['An automated factory in space.',7.8,.58,-1.05,.45,.400,'#253d77'],['Modular decks · Logistics · Resource voyages',7.8,.40,-1.05,1.38,.400,'#427cc0'],[translate('viewArrow','en'),6.35,.64,-1.65,2.60,.711,'#ffffff']];
 for(const [text,width,depth,x,z,y,color] of specs){const mesh=print(text,width,depth,color);mesh.position.set(x,y,z);frame.add(mesh);}
 view.model.add(frame);
 return language=>{frame.visible=language==='en';for(const item of variants)item.mesh.geometry=language==='en'?item.english:item.original;};
}
export function prepareReferenceLanguage(view){
 if(typeof document==='undefined')return()=>{};
 if(view.id==='otherworks')return()=>{};
 if(view.id==='engine')return engineTranslation(view);
 // The title and its English subtitle are part of the baked project wordmark.
 // Localize the action without covering that original artwork with new ink.
 return tennisTranslation(view,'Button_label_surface','查看作品','#ffffff');
}
