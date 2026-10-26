import * as THREE from './vendor/three.module.js';
import {layout} from './map-model.mjs';
import {modelKit} from './model-kit.js';
import {buildFlow,FLOW_MODULES} from './scene-flow.js';
import {buildFlowTerrain} from './flow/terrain.js';
import {flowSurface,FLOW_ZONES,FLOW_CONTENT} from './flow/plan.mjs';
import {buildFlowZoning} from './flow/zoning.js';
import {FLOW_COLORS as C,FLOW_LIGHT as light} from './flow/palette.mjs';

const container=document.querySelector('#study-world'),scene=new THREE.Scene(),objects=new THREE.Group(),content=new THREE.Group(),animated=[];
scene.background=new THREE.Color(C.background);scene.add(objects,content);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=light.exposure;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.append(renderer.domElement);
const topCamera=new THREE.OrthographicCamera(-20,20,11.25,-11.25,.1,300),perspectiveCamera=new THREE.PerspectiveCamera(30,1,.1,300),raycaster=new THREE.Raycaster();
scene.add(new THREE.HemisphereLight(light.sky,light.ground,light.skyIntensity));const sun=new THREE.DirectionalLight(light.sun,light.sunIntensity);sun.position.set(-18,34,-19);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-34,right:34,top:35,bottom:-35,near:.5,far:120});sun.shadow.normalBias=.028;sun.shadow.bias=-.00012;scene.add(sun,sun.target);const fill=new THREE.DirectionalLight(light.fill,light.fillIntensity);fill.position.set(18,24,8);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshStandardMaterial({color:'#f6f3e6',roughness:1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.visible=false;scene.add(floor);
const L=layout(1440,810,Object.values(FLOW_CONTENT.desktop),Math.PI/2),terrain=buildFlowTerrain(L);scene.add(terrain.root);
const built=buildFlow({kit:modelKit(objects),L,terrainModules:terrain.modules,animate:fn=>animated.push(fn)}),interactive=[];
const zoning=buildFlowZoning(scene,terrain,built.plan);
let selected='all',view='perspective',time=0,last=performance.now(),visible=true,center=new THREE.Vector3(),halfWidth=20,halfDepth=11.25,distance=34;
function print(text,width,depth,x,z,{size=64,color=C.ink,weight='400',font='Arial',spacing=0}={}){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=Math.round(2048*depth/width);const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${weight} ${size}px ${font}`;if('letterSpacing' in ctx)ctx.letterSpacing=spacing+'px';ctx.fillText(text,512,canvas.height/4,1000);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.025,toneMapped:false}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.205,z);mesh.receiveShadow=true;content.add(mesh);return mesh;
}
function leftPrint(text,width,depth,x,z,{size=64,color=C.ink,spacing=0,font='Arial'}={}){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=Math.max(96,Math.round(2048*depth/width));const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.fillStyle=color;ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`400 ${size}px ${font}`;if('letterSpacing' in ctx)ctx.letterSpacing=spacing+'px';ctx.fillText(text,2,canvas.height/4,1018);
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshBasicMaterial({map:t,transparent:true,toneMapped:false,alphaTest:.01}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.208,z);content.add(mesh);return mesh;
}
async function makeContent(){
 await document.fonts.ready;
 const p=built.plan,d=p.depth,toZ=v=>(v-.5)*d;
 const mobile=L.mobile,left=mobile?-14.8:5.4,w=mobile?29.6:10.04,cx=left+w/2;
 leftPrint('03 / POETIC TERRAIN PLAY',w,.52,cx,toZ(mobile?.245:.279),{size:31});
 leftPrint('FLOW',w,1.60,cx,toZ(mobile?.31:.327),{size:145,spacing:15});
 leftPrint('塑造山水，让沉默的山谷苏醒。',w,.58,cx,toZ(mobile?.40:.369),{size:39,font:'"Noto Sans SC"'});
 const bw=mobile?20:5.28,bz=toZ(mobile?.525:.423),bx=left+bw/2;
 const button=print('查看作品',bw,1.08,bx,bz,{size:94,color:C.paper,font:'"Noto Sans SC"'}),body=new THREE.Mesh(new THREE.BoxGeometry(bw,.08,1.08),new THREE.MeshBasicMaterial({color:C.button,toneMapped:false}));body.position.set(bx,.17,bz);content.add(body);button.position.y=.222;interactive.push(button);
 const t=await new THREE.TextureLoader().loadAsync('./assets/projects/flow-island2-noon.webp');t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.offset.y=.10;t.repeat.y=.79;const iw=w,ih=mobile?w/1.78:4.973;
 const image=new THREE.Mesh(new THREE.PlaneGeometry(iw,ih),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));image.rotation.x=-Math.PI/2;image.position.set(cx,.207,toZ(mobile?.705:.5785));content.add(image);interactive.push(image);
 document.querySelector('#study-status').textContent='';
}
const definitions=[...FLOW_MODULES,{id:'content',name:'作品内容'}],nav=document.querySelector('#module-nav');for(const d of definitions){const button=document.createElement('button');button.type='button';button.dataset.module=d.id;button.setAttribute('aria-pressed','false');button.textContent=d.name;nav.append(button);}
function reframe(){
 const all=selected==='all',withFoundation=['water','headwater','ocean','ecology','outcrops','birds','clouds'].includes(selected);built.modules.forEach(module=>module.visible=all||module.userData.moduleId===selected||(withFoundation&&terrain.modules.includes(module)));zoning.visible=all&&view==='zones';content.visible=view!=='zones'&&(all||selected==='content');floor.visible=!all&&!withFoundation;const aspect=container.clientWidth/container.clientHeight;
 if(all){center.set(0,0,-.75);halfWidth=20;halfDepth=halfWidth/aspect;distance=halfWidth/(Math.tan(Math.PI/12)*aspect)*1.085;}
 else {const target=selected==='content'?content:built.modules.find(m=>m.userData.moduleId===selected),box=new THREE.Box3().setFromObject(target),size=box.getSize(new THREE.Vector3());if(box.isEmpty())return;box.getCenter(center);halfWidth=Math.max(size.x/2,size.z*aspect/2,1.5)*1.15;halfDepth=halfWidth/aspect;distance=Math.max(size.x/aspect,size.z*.94+size.y*.34,2)/(2*Math.tan(Math.PI/9))*1.22;floor.position.y=box.min.y-.025;}
 topCamera.left=-halfWidth;topCamera.right=halfWidth;topCamera.top=halfDepth;topCamera.bottom=-halfDepth;topCamera.updateProjectionMatrix();perspectiveCamera.aspect=aspect;perspectiveCamera.updateProjectionMatrix();
 document.querySelector('#study-note').textContent=all?'上下滚动，沿水路查看地形':definitions.find(m=>m.id===selected).name+(withFoundation?' · 保留地形基础':' · 独立模型');
}
nav.addEventListener('click',event=>{const button=event.target.closest('[data-module]');if(!button)return;selected=button.dataset.module;nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));reframe();});
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;if(view==='zones'){selected='all';nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.module==='all')));}document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));reframe();}));
function resize(){renderer.setSize(container.clientWidth,container.clientHeight,false);reframe();}addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>visible=!document.hidden);
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
function currentCamera(){return view==='perspective'?perspectiveCamera:topCamera;}
function draw(now){requestAnimationFrame(draw);const dt=Math.min(.05,(now-last)/1000);last=now;if(!visible)return;if(!reduced.matches)time+=dt;animated.forEach(fn=>fn(time));const pan=selected==='all'?window.scrollY/innerHeight*6:0,targetZ=center.z+pan;
 topCamera.up.set(0,0,-1);topCamera.position.set(center.x,center.y+64,targetZ);topCamera.lookAt(center.x,center.y,targetZ);
 const pitch=Math.PI*76/180;perspectiveCamera.up.set(0,0,-1);perspectiveCamera.position.set(center.x,center.y+distance*Math.sin(pitch),targetZ+distance*Math.cos(pitch));perspectiveCamera.lookAt(center.x,center.y,targetZ);
 const camera=currentCamera();camera.updateMatrixWorld();renderer.render(scene,camera);
}
container.addEventListener('click',event=>{if(!content.visible)return;const r=container.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2),currentCamera());if(raycaster.intersectObjects(interactive,false).length)location.href='./#flow';});
const capture=document.querySelector('#study-capture');document.querySelector('#study-save').addEventListener('click',()=>{renderer.render(scene,currentCamera());const url=renderer.domElement.toDataURL('image/png'),name='flow-'+selected+'-'+view;capture.querySelector('img').src=url;document.querySelector('#study-download').href=url;document.querySelector('#study-download').download=name+'.png';if(location.hostname==='127.0.0.1')fetch('/__capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,image:url})}).catch(()=>{});capture.showModal();});document.querySelector('#study-close').addEventListener('click',()=>capture.close());
resize();makeContent().then(reframe).catch(error=>{console.error(error);document.querySelector('#study-status').textContent='作品图片暂时无法载入。';});requestAnimationFrame(draw);


