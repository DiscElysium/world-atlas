import * as THREE from '../vendor/three.module.js';

export const WORKTOP_VIEW={position:[-5,48.5,51],target:[0,1.4,0],width:55.3,reference:{width:1664,height:944},turn:[-.075,.035,.025]};
export const DRAFT_TITLE={text:'portfolio',font:'italic 560px Georgia, "Times New Roman", serif',canvasWidth:3072,canvasHeight:720,anchorX:1536,anchorY:350,x:-.7,z:.4,width:37,height:8.67,rotation:-.205,fill:'#344244',stroke:'#536d73',lineWidth:3.6};
export const smoother=(a,b,x)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*t*(t*(t*6-15)+10);};
export const worktopWidth=(width,height)=>Math.max(WORKTOP_VIEW.width,WORKTOP_VIEW.width*WORKTOP_VIEW.reference.height/WORKTOP_VIEW.reference.width*width/height);
let titleImages,titleImagesReady;
export function prepareTitleBitmaps(){
 return titleImagesReady??=(async()=>{titleImages=await Promise.all(['fill','outline'].map(async name=>{const image=new Image();image.src=new URL('../assets/atlas/title-'+name+'.png',import.meta.url).href;await image.decode();return image;}));})();
}
export function worktopOrientation(initial=false){
 const camera=new THREE.PerspectiveCamera();camera.position.fromArray(WORKTOP_VIEW.position);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3(...WORKTOP_VIEW.target));
 if(initial)camera.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...WORKTOP_VIEW.turn)));return camera.quaternion.clone();
}
export function makeTitleBitmap(outline=false){
 const d=DRAFT_TITLE,c=document.createElement('canvas');c.width=d.canvasWidth;c.height=d.canvasHeight;const ctx=c.getContext('2d');ctx.font=d.font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=d.fill;ctx.strokeStyle=d.stroke;ctx.lineWidth=d.lineWidth;
 if(titleImages){ctx.drawImage(titleImages[outline?1:0],0,0);return c;}
 if(outline)ctx.strokeText(d.text,d.anchorX,d.anchorY);else ctx.fillText(d.text,d.anchorX,d.anchorY);return c;
}
export function initialTitleProjection(){
 const d=DRAFT_TITLE,{width,height}=WORKTOP_VIEW.reference,camera=new THREE.OrthographicCamera(-WORKTOP_VIEW.width/2,WORKTOP_VIEW.width/2,WORKTOP_VIEW.width*height/width/2,-WORKTOP_VIEW.width*height/width/2,.1,400);
 camera.quaternion.copy(worktopOrientation(true));camera.position.set(0,0,new THREE.Vector3(...WORKTOP_VIEW.position).distanceTo(new THREE.Vector3(...WORKTOP_VIEW.target))).applyQuaternion(camera.quaternion).add(new THREE.Vector3(...WORKTOP_VIEW.target));camera.updateMatrixWorld();
 const corner=(u,v)=>{const x=(u-.5)*d.width,z=(v-.5)*d.height,p=new THREE.Vector3(d.x+x*Math.cos(d.rotation)-z*Math.sin(d.rotation),.018,d.z+x*Math.sin(d.rotation)+z*Math.cos(d.rotation)).project(camera);return new THREE.Vector2((p.x+1)*width/2,(1-p.y)*height/2);};
 const a=corner(0,0),b=corner(1,0),c=corner(0,1);return [(b.x-a.x)/d.canvasWidth,(b.y-a.y)/d.canvasWidth,(c.x-a.x)/d.canvasHeight,(c.y-a.y)/d.canvasHeight,a.x,a.y];
}
