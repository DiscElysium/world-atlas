import * as THREE from './vendor/three.module.js';
import {layout,PITCH,groundPoint} from './map-model.mjs';
import {modelKit} from './model-kit.js';
import {sceneGround} from './terrain.mjs';
import {PROJECTS} from './projects.mjs';
import {buildTennis,TENNIS_MODULES} from './scene-tennis.js';
import {buildTennisGround} from './tennis-ground.js';
import {createTennisPortrait} from './tennis-portrait.js';

const container=document.querySelector('#study-world'),scene=new THREE.Scene(),project=PROJECTS.find(p=>p.id==='tennis'),root=new THREE.Group(),content=new THREE.Group(),animated=[];
scene.background=new THREE.Color('#f7f7f3');scene.add(root,content);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.append(renderer.domElement);
const camera=new THREE.PerspectiveCamera(40,1,.1,200),raycaster=new THREE.Raycaster();
const moduleFloor=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:'#f7f7f3',roughness:1}));moduleFloor.rotation.x=-Math.PI/2;moduleFloor.receiveShadow=true;moduleFloor.visible=false;scene.add(moduleFloor);
scene.add(new THREE.HemisphereLight('#e7f1ff','#9b9980',1.02));const sun=new THREE.DirectionalLight('#fff0dd',3.1);sun.position.set(-18,30,7);sun.castShadow=true;sun.shadow.mapSize.set(3072,3072);Object.assign(sun.shadow.camera,{left:-31,right:31,top:34,bottom:-34,near:.5,far:100});sun.shadow.normalBias=.08;sun.shadow.bias=-.0004;scene.add(sun,sun.target);const fill=new THREE.DirectionalLight('#c4dfff',.6);fill.position.set(15,16,8);scene.add(fill);
const L=layout(1440,810,[{left:.10,right:.46,top:.15,bottom:.91}]),kit=modelKit(root),ground=(u,v)=>sceneGround(u,v,L,project),built=buildTennis({kit,L,project,ground,animate:fn=>animated.push(fn)}),terrain=buildTennisGround(L);scene.add(terrain);
let selected='all',view='perspective',time=0,previous=performance.now(),distance=L.distance,center=new THREE.Vector3(),currentDistance=distance,focus=new THREE.Vector3(),visible=true;
const interactive=[];
function print(text,w,d,x,z,size=76,color='#e96624',weight='700',font='Arial'){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=Math.round(2048*d/w);const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${weight} ${size}px ${font}`;
 const factor=canvas.width/1024;ctx.scale(factor,factor);ctx.fillText(text,512,canvas.height/factor/2,1000);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.02,roughness:1,emissive:'#ffffff',emissiveMap:texture,emissiveIntensity:.18}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.22,z);mesh.receiveShadow=true;content.add(mesh);return mesh;
}
async function createContent(){
 await document.fonts.ready;
 print('02',4.0,1.3,-15.2,-7.3,300,'#4b5150','600');
 print('TENNISATOM',16.2,2.15,-10.1,-5.7,190,'#e96726','400','Impact');
 print('THE PORTRAIT OF THE BODY',13.4,.7,-10.1,-4.3,40,'#394442','600');
 const portrait=createTennisPortrait(renderer);
 const image=new THREE.Mesh(new THREE.PlaneGeometry(13.8,8.65),new THREE.MeshStandardMaterial({map:portrait.texture,roughness:1,transparent:true,alphaTest:.015,depthWrite:false}));image.rotation.x=-Math.PI/2;image.position.set(-10.25,.217,.45);image.receiveShadow=true;content.add(image);interactive.push(image);
 const button=print('查看作品',4.5,1.22,-6.2,5.3,75,'#fffdf7','600','"Noto Sans SC"');
 const body=new THREE.Mesh(new THREE.BoxGeometry(4.5,.08,1.22),new THREE.MeshStandardMaterial({color:'#ed702c',roughness:1}));body.position.set(-6.2,.175,5.3);body.castShadow=true;content.add(body);button.position.y=.229;interactive.push(button);
 content.rotation.y=.10;
}
function reframe(){
 root.updateMatrixWorld(true);const all=selected==='all'||selected==='foundation';
 built.modules.forEach(m=>m.visible=selected==='all'||m.userData.moduleId===selected);terrain.visible=all;content.visible=selected==='all';
 moduleFloor.visible=!all;
 if(all){center.set(.1,0,selected==='foundation'?-1.8:-.35);distance=(selected==='foundation'?49:43)/(2*Math.tan(20*Math.PI/180)*camera.aspect);if(camera.aspect<1)distance*=1.10;}
 else {const module=built.modules.find(m=>m.userData.moduleId===selected),box=new THREE.Box3().setFromObject(module),size=box.getSize(new THREE.Vector3());box.getCenter(center);moduleFloor.position.y=box.min.y-.018;distance=Math.max(size.x/camera.aspect,size.z*Math.sin(PITCH)+size.y*Math.cos(PITCH),size.y*1.5)/(2*Math.tan(20*Math.PI/180))*1.34;}
 focus.copy(center);currentDistance=distance;
 document.querySelector('#study-note').textContent=all?'上下滚动，镜头沿地图平移':TENNIS_MODULES.find(m=>m.id===selected).name+' · 独立模型';
}
const nav=document.querySelector('#module-nav');for(const {id,name} of TENNIS_MODULES){const b=document.createElement('button');b.type='button';b.dataset.module=id;b.setAttribute('aria-pressed','false');b.textContent=name;nav.append(b)}
nav.addEventListener('click',e=>{const b=e.target.closest('[data-module]');if(!b)return;selected=b.dataset.module;nav.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));reframe();});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));reframe();}));
function resize(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();reframe();}addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>visible=!document.hidden);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function draw(now){requestAnimationFrame(draw);const dt=Math.min(.05,(now-previous)/1000);previous=now;if(!visible)return;if(!reduced.matches)time+=dt;animated.forEach(fn=>fn(time));const pan=selected==='all'||selected==='foundation'?window.scrollY/innerHeight*6:0;
 const pitch=view==='top'?Math.PI/2:55*Math.PI/180;camera.up.set(0,view==='top'?0:1,view==='top'?-1:0);camera.position.set(focus.x,focus.y+Math.sin(pitch)*currentDistance,focus.z+pan+Math.cos(pitch)*currentDistance);camera.lookAt(focus.x,focus.y,focus.z+pan);camera.updateMatrixWorld();renderer.render(scene,camera);
}
container.addEventListener('click',e=>{if(!content.visible)return;const r=container.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);if(raycaster.intersectObjects(interactive,false).length)location.href='./#tennis';});
const capture=document.querySelector('#study-capture');document.querySelector('#study-save').addEventListener('click',()=>{renderer.render(scene,camera);const url=renderer.domElement.toDataURL('image/png'),name='tennisatom-canyon-'+selected+'-'+view;capture.querySelector('img').src=url;document.querySelector('#study-download').href=url;document.querySelector('#study-download').download=name+'.png';if(location.hostname==='127.0.0.1')fetch('/__capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,image:url})}).catch(()=>{});capture.showModal();});document.querySelector('#study-close').addEventListener('click',()=>capture.close());
resize();createContent().catch(error=>{console.error(error);document.querySelector('#study-status').textContent='作品图片暂时无法载入。'});requestAnimationFrame(draw);
