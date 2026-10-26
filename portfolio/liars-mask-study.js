import * as THREE from './vendor/three.module.js';
import {createForms} from './liars-mask/geometry.js';
import {buildFoundation} from './liars-mask/01-foundation/index.js';
import {buildRocks} from './liars-mask/02-rocks/index.js';
import {BayerPass} from './liars-mask/bayer.js';
import {buildRuins} from './liars-mask/03-ruins/index.js';
import {buildTable} from './liars-mask/04-table/index.js';
import {buildActors} from './liars-mask/05-actors/index.js';
import {buildContent} from './liars-mask/06-content/index.js';

const container=document.querySelector('#study-world'),scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);scene.background=new THREE.Color('#eee5d3');
const renderer=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.append(renderer.domElement);
const camera=new THREE.PerspectiveCamera(40,1,.1,180),pass=new BayerPass(renderer),forms=createForms(root);
const sun=new THREE.DirectionalLight('#fff9ef',3.1);sun.position.set(14,24,-12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-28,right:28,top:27,bottom:-27,near:1,far:80});sun.shadow.normalBias=.015;sun.shadow.bias=-.00005;scene.add(sun,sun.target);
const sky=new THREE.HemisphereLight('#fff5e6','#5d4d37',.28);scene.add(sky);const fill=new THREE.DirectionalLight('#fff2db',1.3);fill.position.set(-8,5,24);scene.add(fill);
const modules=[buildFoundation(forms),buildRocks(forms),buildRuins(forms),buildTable(forms),buildActors(forms)];const artwork=await new THREE.TextureLoader().loadAsync('./assets/projects/liars-mask-gameplay.png');artwork.colorSpace=THREE.SRGBColorSpace;const content=buildContent(forms,artwork,{mobile:innerWidth<700});modules.push(content.root);const galleries={'rock-kit':buildRocks(forms,{gallery:true}),'actor-kit':buildActors(forms,{gallery:true}),'mask-kit':buildActors(forms,{gallery:true,maskOnly:true})};Object.values(galleries).forEach(g=>g.visible=false);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(120,120),forms.mat('#e9e2d3'));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.visible=false;scene.add(floor);
const query=new URLSearchParams(location.search);let selected=query.get('module')||'all',view=query.get('view')||'perspective';let pan=0,targetPan=0,focus=new THREE.Vector3(0,.65,1.2),distance=32,last=performance.now(),captureIndex=0;
pass.enabled=query.get('render')!=='normal';
function reframe(){
 modules.forEach(m=>m.visible=selected==='all'||m.userData.moduleId===selected);Object.entries(galleries).forEach(([key,g])=>g.visible=selected===key);floor.visible=!['all','foundation','mask-kit'].includes(selected);
 if(selected==='all'||selected==='foundation'){focus.set(0,.65,camera.aspect<1?3.5:1.5);distance=39/(2*Math.tan(Math.PI/9)*camera.aspect);}
 else{const object=galleries[selected]||modules.find(m=>m.userData.moduleId===selected);object.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3());box.getCenter(focus);floor.position.y=box.min.y-.02;distance=Math.max(size.x/camera.aspect,size.z*.9+size.y*.45,4)/(2*Math.tan(Math.PI/9))*1.15;}
 document.querySelector('#study-note').textContent=({all:'共同地形与模块组装',foundation:'01 · 连续地形','rock-kit':'02 · 六种独立岩石',rocks:'02 · 岩石群落',ruins:'03 · 废墟模块',table:'04 · 桌面物件',actors:'05 · 三位面具对手','actor-kit':'05 · 坐姿人物单件','mask-kit':'05 · 面具单件',content:'06 · 地面文字与图片'})[selected];
 document.querySelectorAll('[data-module]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.module===selected)));
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
 document.querySelector('#render-toggle').setAttribute('aria-pressed',String(pass.enabled));
}
function resize(){renderer.setSize(container.clientWidth,container.clientHeight,false);camera.aspect=container.clientWidth/container.clientHeight;camera.updateProjectionMatrix();pass.resize();reframe();}
function render(){
 const target=focus.clone();target.z+=pan;camera.up.set(0,0,-1);
 if(view==='top')camera.position.copy(target).add(new THREE.Vector3(0,distance,0));
 else if(view==='front'){camera.up.set(0,1,0);camera.position.copy(target).add(new THREE.Vector3(0,3,distance));}
 else if(view==='side'){camera.up.set(0,1,0);camera.position.copy(target).add(new THREE.Vector3(distance,3,0));}
 else{const pitch=52*Math.PI/180;camera.position.copy(target).add(new THREE.Vector3(0,Math.sin(pitch)*distance,Math.cos(pitch)*distance));}
 camera.lookAt(target);camera.updateMatrixWorld();pass.render(scene,camera);
 renderer.domElement.dataset.stage='composition-v6';renderer.domElement.dataset.module=selected;renderer.domElement.dataset.view=view;renderer.domElement.dataset.render=pass.enabled?'bayer8':'normal';renderer.domElement.dataset.pan=pan.toFixed(3);renderer.domElement.dataset.drawCalls=String(renderer.info.render.calls);
}
async function capture(normal=false,poster=false){const prior=pass.enabled,ratio=renderer.getPixelRatio();if(poster){renderer.setPixelRatio(1);renderer.setSize(1600,900,false);camera.aspect=16/9;camera.updateProjectionMatrix();pass.resize();reframe();}if(normal)pass.enabled=false;render();const name='liars-mask-'+renderer.domElement.dataset.stage+'-'+selected+'-'+view+'-'+(pass.enabled?'bayer':'normal')+(poster?'-16x9':'')+'-'+Date.now()+'-'+String(++captureIndex).padStart(2,'0');
 const image=renderer.domElement.toDataURL('image/png');pass.enabled=prior;if(poster){renderer.setPixelRatio(ratio);resize();}render();
 const response=await fetch('/__capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,image})});if(!response.ok)throw new Error('Capture failed');document.querySelector('#study-status').textContent='已保存 '+name+'.png';
}
document.querySelector('#module-nav').addEventListener('click',e=>{const b=e.target.closest('[data-module]');if(!b)return;selected=b.dataset.module;targetPan=pan=0;reframe();render();});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;reframe();render();}));
document.querySelector('#render-toggle').addEventListener('click',()=>{pass.enabled=!pass.enabled;reframe();render();});
document.querySelector('#save-frame').addEventListener('click',()=>capture().catch(e=>{console.error(e);document.querySelector('#study-status').textContent='截图保存失败';}));
document.querySelector('#save-normal').addEventListener('click',()=>capture(true).catch(console.error));
document.querySelector('#save-poster').addEventListener('click',()=>capture(false,true).catch(console.error));
addEventListener('scroll',()=>{targetPan=scrollY/Math.max(1,innerHeight)*5.2;});addEventListener('resize',resize);
function draw(time){const dt=Math.min(.05,(time-last)/1000);last=time;pan+=(targetPan-pan)*(1-Math.exp(-dt*10));render();requestAnimationFrame(draw);}
resize();document.querySelector('#study-status').textContent='六个独立模块 · 真实三维 + Bayer 8×8';renderer.compile(scene,camera);requestAnimationFrame(draw);
