import * as THREE from './vendor/three.module.js';
import {modelKit} from './model-kit.js?v=03bcba9148dc';
import {buildGoldfish,GOLD_MODULES} from './scene-goldfish.js?v=03bcba9148dc';
import {buildGoldfishContent} from './goldfish/content.js?v=03bcba9148dc';
import {loadGoldfishTextures} from './goldfish/assets.js?v=03bcba9148dc';

const container=document.querySelector('#study-world'),scene=new THREE.Scene(),root=new THREE.Group(),animated=[];scene.background=new THREE.Color('#f1e5cb');scene.add(root);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.append(renderer.domElement);
const camera=new THREE.PerspectiveCamera(40,1,.1,240),raycaster=new THREE.Raycaster();
scene.add(new THREE.HemisphereLight('#fff4e1','#978368',1.65));
const sun=new THREE.DirectionalLight('#fff0d3',3.2);sun.position.set(-19,31,-19);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-32,right:34,top:28,bottom:-28,near:1,far:100});sun.shadow.normalBias=.017;sun.shadow.bias=-.00006;scene.add(sun,sun.target);
const fill=new THREE.DirectionalLight('#c4e4ee',.50);fill.position.set(16,22,12);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(150,150),new THREE.MeshStandardMaterial({color:'#efe4cf',roughness:1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.visible=false;scene.add(floor);
let built,content,selected='all',view='perspective',distance=36,time=0,last=performance.now(),visible=true,focus=new THREE.Vector3(0,0,0),pan=0;const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const nav=document.querySelector('#module-nav');
for(const {id,name} of GOLD_MODULES){const button=document.createElement('button');button.type='button';button.dataset.module=id;button.textContent=name;button.setAttribute('aria-pressed','false');nav.append(button);}
function reframe(){
 if(!built)return;built.modules.forEach(m=>m.visible=selected==='all'||m.userData.moduleId===selected||(selected==='room'&&m.userData.moduleId==='props'));content.root.visible=selected==='all'||selected==='content';
 const large=selected==='all'||selected==='foundation';floor.visible=!large;
 if(large){focus.set(0,.5,camera.aspect<1?5.3:1.1);distance=Math.max(camera.aspect<1?14:36,(camera.aspect<1?14:23)*camera.aspect)/(2*Math.tan(20*Math.PI/180)*camera.aspect);}
 else{const module=selected==='content'?content.root:built.modules.find(m=>m.userData.moduleId===selected);module.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(module),size=box.getSize(new THREE.Vector3());box.getCenter(focus);floor.position.y=box.min.y-.02;distance=Math.max(size.x/camera.aspect,size.z*.93+size.y*.40,4)/(2*Math.tan(20*Math.PI/180))*1.22;}
 document.querySelector('#study-note').textContent=selected==='all'?'上下滚动，镜头沿地图平移':GOLD_MODULES.find(m=>m.id===selected).name+' · 独立模型';
}
nav.addEventListener('click',event=>{const button=event.target.closest('[data-module]');if(!button||!built)return;selected=button.dataset.module;nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));reframe();});
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));reframe();}));
function resize(){renderer.setSize(container.clientWidth,container.clientHeight,false);camera.aspect=container.clientWidth/container.clientHeight;camera.updateProjectionMatrix();reframe();}addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>visible=!document.hidden);
function draw(now){requestAnimationFrame(draw);const dt=Math.min(.05,(now-last)/1000);last=now;if(!built||!visible)return;if(!reduced.matches)time+=dt;animated.forEach(fn=>fn(time));const target=selected==='all'?scrollY/innerHeight*5:0;pan+=(target-pan)*.13;
 const pitch=(view==='top'?90:view==='detail'?58:68)*Math.PI/180;camera.up.set(0,0,-1);camera.position.set(focus.x,focus.y+Math.sin(pitch)*distance,focus.z+pan+Math.cos(pitch)*distance);camera.lookAt(focus.x,focus.y,focus.z+pan);camera.updateMatrixWorld();renderer.render(scene,camera);
}
container.addEventListener('pointermove',event=>{if(!content?.root.visible)return;const r=container.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2),camera);container.style.cursor=raycaster.intersectObjects(content.interactive,false).length?'pointer':'default';});
container.addEventListener('click',event=>{if(!content?.root.visible)return;const r=container.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2),camera);if(raycaster.intersectObjects(content.interactive,false).length)document.querySelector('#project-preview').showModal();});
document.querySelector('#project-close').addEventListener('click',()=>document.querySelector('#project-preview').close());
const capture=document.querySelector('#study-capture');document.querySelector('#study-save').addEventListener('click',()=>{if(!built)return;renderer.render(scene,camera);const image=renderer.domElement.toDataURL('image/png'),name='goldfish-'+selected+'-'+view;capture.querySelector('img').src=image;document.querySelector('#study-download').href=image;document.querySelector('#study-download').download=name+'.png';if(location.origin==='http://127.0.0.1:4173')fetch('/__capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,image})}).catch(()=>{});capture.showModal();});
document.querySelector('#study-close').addEventListener('click',()=>capture.close());
async function boot(){try{
 const loader=new THREE.TextureLoader(),[couple,reference,runtime]=await Promise.all(['./assets/goldfish/seated-couple.png','./assets/goldfish/approved-reference.png','./assets/projects/goldfish-room.jpg'].map(src=>loader.loadAsync(src)));for(const texture of [couple,reference,runtime]){texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
 const textures={couple,reference,runtime,...await loadGoldfishTextures(loader,Math.min(8,renderer.capabilities.getMaxAnisotropy()))};built=buildGoldfish({kit:modelKit(root),mobile:innerWidth<=700,textures,animate:fn=>animated.push(fn)});await document.fonts.ready;content=buildGoldfishContent(built.forms,built.plan,textures,8);root.add(content.root);root.updateMatrixWorld(true);document.querySelector('#study-status').textContent='';resize();renderer.compile(scene,camera);
}catch(error){console.error(error);document.querySelector('#study-status').textContent='场景暂时未能载入，请刷新重试。';}}
resize();requestAnimationFrame(draw);boot();
