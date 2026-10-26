import {ATELIER_DAYLIGHT} from './daylight-rig.js';
import * as THREE from './vendor/three.module.js';
import {PortfolioWorld} from './portfolio-world.js?v=8f12d970b90a';
import {smooth} from './map-model.mjs';
import {loadAtelier,AtelierChapter,createAtelierConnector} from './atelier-chapter.js';
import {journeyTone} from './journey-tone.js';
import {cameraInfluence} from './reference-scenes.js?v=8f12d970b90a';
import {smoother} from './atlas/atelier-composition.js';
import {applyProjection,connectPose} from './atlas-motion.js';
import {AtlasMaterialization} from './atlas-materialization.js';
const clamp=x=>THREE.MathUtils.clamp(x,0,1);

export class AtlasWorld extends PortfolioWorld{
 constructor(container,projects,loader){
  super(container,projects);this.loader=loader;this.globalScroll=0;this.displayScroll=0;this.prefix={intro:2.6,hold:.15,travel:1.25};this.preludeScreens=4;this.phase='cover';this.activeCamera=this.camera;
  this.assembly=loadAtelier(p=>loader?.update(.68+.16*p,'atelier-model'));
  this.renderer.shadowMap.autoUpdate=false;this.materialization=new AtlasMaterialization(this.renderer);
 }
 get scrollProgress(){return this.globalScroll/(this.L?.height||innerHeight);}
 get renderProgress(){return this.displayScroll/(this.L?.height||innerHeight);}
 async prepare(){this.asset=await this.assembly;}
 rebuild(width,height,specs,textures,extras={}){
  this.building=true;try{super.rebuild(width,height,specs,textures,extras);}finally{this.building=false;}
  if(!this.atelier){this.atelier=new AtelierChapter(this.renderer,this.asset,width,height);this.scene.add(this.atelier.group);}
  else this.atelier.resize(width,height);
  this.atelier.setCenter(-this.span*.5-this.atelier.frontExtent-4);
  if(this.connector){this.scene.remove(this.connector);this.connector.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
  this.connector=createAtelierConnector(this.atelier,this.entries[0],this.span);this.scene.add(this.connector);
  this.camera.near=.5;this.camera.far=Math.max(500,this.L.distance+this.span*2+160);this.lastPrefix=-1;this.renderer.shadowMap.needsUpdate=true;this.ready=true;if(this.renderProgress<this.preludeScreens)this.applyPrefix();else this.applyCamera();
 }
 setScroll(pixels){this.globalScroll=Math.max(0,pixels);super.setScroll(Math.max(0,pixels-this.preludeScreens*(this.L?.height||innerHeight)));}
 snapScroll(pixels=this.globalScroll){this.setScroll(pixels);this.displayScroll=this.globalScroll;this.cameraZ=this.targetZ;this.motionTime=undefined;}
 entryPose(z=0){
  const tennis=this.references.views.get('tennis'),chapter=this.entries.find(e=>e.project.id==='tennis'),pitch=THREE.MathUtils.lerp(52*Math.PI/180,tennis?.pitch??56*Math.PI/180,smoother(0,.65,z/this.L.depth)),orientation=new THREE.PerspectiveCamera();orientation.up.set(0,0,-1);orientation.position.set(0,Math.sin(pitch),Math.cos(pitch));orientation.lookAt(0,0,0);
  const weight=tennis&&chapter?cameraInfluence((z-chapter.center)/this.L.depth):0,quaternion=orientation.quaternion.clone();if(tennis)quaternion.slerp(tennis.orientation,weight);
  const width=THREE.MathUtils.lerp(43.5,40,smoother(0,.6,z/this.L.depth)),fov=THREE.MathUtils.lerp(40,tennis?.fov??40,weight),distance=width/(2*Math.tan(THREE.MathUtils.degToRad(fov)/2)*this.L.aspect);
  return{focus:new THREE.Vector3(0,0,z),quaternion,width,distance,fov};
 }
 applyCamera(){
  if(this.building||!this.atelier)return super.applyCamera();
  if(this.renderProgress<this.preludeScreens)return;
  const tennis=this.entries.find(e=>e.project.id==='tennis');if(tennis&&this.cameraZ<=tennis.center){const p=this.entryPose(this.cameraZ);this.viewDistance=p.distance;this.camera.fov=p.fov;this.camera.quaternion.copy(p.quaternion);this.camera.position.set(0,0,p.distance).applyQuaternion(p.quaternion).add(p.focus);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();return;}
  this.viewDistance=undefined;super.applyCamera();
 }
 applyPrefix(){
  if(!this.atelier||!this.L)return;
  const screens=this.renderProgress,travelStart=this.prefix.intro+this.prefix.hold,travel=clamp((screens-travelStart)/this.prefix.travel),p=screens>=this.prefix.intro-1/this.L.height?1:clamp(screens/this.prefix.intro);
  this.atelier.apply(p);this.atelier.group.visible=true;this.connector.visible=travel>0;
  for(const [i,entry] of this.entries.entries()){entry.root.visible=travel>0&&i<2;if(i<2){entry.objects.visible=true;entry.content.root.visible=true;}}
  this.journeyGround.visible=false;this.cameraZ=0;
  this.phase=p<4.25/9.4?'drawing':p<=5.7/9.4?'complete-draft':p<1?'emergence':travel>0?'connection':'atelier';
  if(p===0)this.phase='cover';
  const home=this.atelier.getPose(),pose=travel>0?connectPose(home,this.entryPose(0),travel,this.L.depth*this.prefix.travel/-this.atelier.center):{...home,perspective:0};
  this.viewDistance=pose.distance;this.camera.quaternion.copy(pose.quaternion);this.camera.position.set(0,0,pose.distance).applyQuaternion(pose.quaternion).add(pose.focus);applyProjection(this.camera,{...pose,aspect:this.L.aspect});
  const s=smoother(.1,1,travel);journeyTone.value.set(0,0);this.renderer.toneMappingExposure=1;this.rim.intensity=0;
  this.sun.intensity=THREE.MathUtils.lerp(ATELIER_DAYLIGHT.sun,2.5,s);this.sky.intensity=THREE.MathUtils.lerp(ATELIER_DAYLIGHT.sky,1.5,s);this.fill.intensity=THREE.MathUtils.lerp(ATELIER_DAYLIGHT.fill,.4,s);
  this.sun.color.set(this.mode==='golden'?'#ffe3b0':ATELIER_DAYLIGHT.sunColor).lerp(new THREE.Color(this.mode==='golden'?'#ffca99':'#fff2da'),s);this.sky.color.set(ATELIER_DAYLIGHT.skyColor).lerp(new THREE.Color('#e4efff'),s);this.sky.groundColor.set(ATELIER_DAYLIGHT.groundColor).lerp(new THREE.Color('#8f9885'),s);this.fill.color.set(ATELIER_DAYLIGHT.fillColor).lerp(new THREE.Color('#bddbfa'),s);
  const lightZ=travel>0?pose.focus.z:this.atelier.center;this.sun.position.set(THREE.MathUtils.lerp(-28,-18,s),THREE.MathUtils.lerp(this.mode==='golden'?28:35,this.mode==='golden'?23:30,s),lightZ+THREE.MathUtils.lerp(10,-18,s));this.sun.target.position.set(0,0,lightZ);this.fill.position.set(THREE.MathUtils.lerp(18,15,s),THREE.MathUtils.lerp(25,20,s),lightZ+THREE.MathUtils.lerp(-14,15,s));this.fill.target.position.set(0,0,lightZ);this.sun.target.updateMatrixWorld();this.fill.target.updateMatrixWorld();
  this.sun.shadow.normalBias=THREE.MathUtils.lerp(.13,.14,s);this.sun.shadow.bias=THREE.MathUtils.lerp(-.00045,-.0008,s);
  const shadowHeight=THREE.MathUtils.lerp(55,Math.max(34,this.L.depth*.6),s),shadowWidth=THREE.MathUtils.lerp(46,28,s);Object.assign(this.sun.shadow.camera,{left:-shadowWidth,right:shadowWidth,top:shadowHeight,bottom:-shadowHeight,near:THREE.MathUtils.lerp(1,.5,s),far:THREE.MathUtils.lerp(180,100,s)});this.sun.shadow.camera.updateProjectionMatrix();
  this.scene.background=new THREE.Color('#faf9f6').lerp(new THREE.Color('#080a0a'),smooth(.32,.95,travel));
  this.prefixInk=travel>0?1:0;this.uiInk=smooth(.4,.95,travel);
  if(this.displayScroll!==this.lastPrefix){this.renderer.shadowMap.needsUpdate=true;this.lastPrefix=this.displayScroll;}
 }
 update(time,reduced=false){
  if(!this.ready)return;
  const dt=Math.min(.1,Math.max(0,(time-(this.motionTime??time-16))/1000));this.motionTime=time;this.displayScroll=reduced?this.globalScroll:this.displayScroll+(this.globalScroll-this.displayScroll)*(1-Math.exp(-dt/.085));if(Math.abs(this.displayScroll-this.globalScroll)<.08)this.displayScroll=this.globalScroll;
  if(this.renderProgress<this.preludeScreens){
   this.lastTime=time;
   this.applyPrefix();this.renderFrame();return {index:-1,atelier:true,project:{id:'atelier',ink:'#30464b'},phase:this.phase,z:this.atelier.center};
  }
  super.setScroll(Math.max(0,this.displayScroll-this.preludeScreens*this.L.height));this.cameraZ=this.targetZ;this.atelier.apply(1);this.atelier.group.visible=this.cameraZ<this.L.depth*.75;this.connector.visible=this.cameraZ<this.L.depth;this.journeyGround.visible=true;this.phase='works';this.uiInk=undefined;
  Object.assign(this.sun.shadow.camera,{left:-28,right:28,top:Math.max(34,this.L.depth*.6),bottom:-Math.max(34,this.L.depth*.6),near:.5,far:100});this.sun.shadow.camera.updateProjectionMatrix();
  this.renderer.shadowMap.needsUpdate=true;
  return super.update(time,reduced);
 }
 renderFrame(){
  if(this.building||!this.atelier)return super.renderFrame();
  if(this.renderProgress>=this.preludeScreens){
   // Keep the actual previous landscape and its spatial ink boundary until
   // they leave the frame. Releasing them at the chapter index caused a flash.
   if(this.cameraZ<this.L.depth*1.1&&this.styles.enabled){
    this.scene.background.lerp(new THREE.Color('#080a0a'),1-smoother(0,.5,this.cameraZ/this.L.depth));
    this.renderStyleExtras={displayColor:this.materialization.capture(this.scene,this.camera),inkBoundary:[this.atelier.cut-3,-this.span*.5-.25]};
   }
   try{return super.renderFrame();}finally{this.renderStyleExtras=undefined;}
  }
  const reveal=this.atelier.intro.materialization;if(reveal>0&&reveal<1&&this.renderProgress<=this.prefix.intro){this.materialization.render(this.scene,this.camera,this.atelier.intro);return;}
  const camera=this.activeCamera||this.atelier.camera;
  const displayColor=this.prefixInk>0&&this.styles.enabled?this.materialization.capture(this.scene,camera):null;
  this.styles.render(this.scene,camera,{z:0,depth:this.L.depth,span:this.span,distance:this.viewDistance,displayColor,ink:this.prefixInk||0,inkBoundary:[this.atelier.cut-3,-this.span*.5-.25],goldfishCenter:1e6,liarsMaskCenter:1e6,spaceAmount:0});
 }
 pick(x,y){
  if(this.renderProgress>=this.preludeScreens)return super.pick(x,y);
  if(this.phase!=='atelier')return null;
  this.pointer.set(x*2-1,1-y*2);const near=new THREE.Vector3(this.pointer.x,this.pointer.y,-1).unproject(this.camera),far=new THREE.Vector3(this.pointer.x,this.pointer.y,1).unproject(this.camera);this.raycaster.set(near,far.sub(near).normalize());const id=this.atelier.pick(this.raycaster);return id?{id,kind:'chapter'}:null;
 }
 async warmUp(){
  const previous=this.displayScroll;this.loader?.update(.94,'compiling-model-materials');this.displayScroll=2.6*this.L.height;this.applyPrefix();await this.renderer.compileAsync(this.scene,this.camera);this.renderFrame();this.displayScroll=2*this.L.height;this.applyPrefix();this.renderFrame();this.displayScroll=3.5*this.L.height;this.applyPrefix();await this.renderer.compileAsync(this.scene,this.camera);this.renderFrame();this.displayScroll=previous;this.applyPrefix();this.renderFrame();this.loader?.update(.98,'cover-frame-ready');
 }
 diagnostics(){return {phase:this.phase,scrollScreens:this.renderProgress,targetScreens:this.scrollProgress,prefix:this.prefix,preludeScreens:this.preludeScreens,singleScene:true,canvasCount:document.querySelectorAll('canvas').length,cameraId:this.camera.uuid,cameraPitch:THREE.MathUtils.radToDeg(Math.asin(-this.camera.getWorldDirection(new THREE.Vector3()).y)),atelier:this.atelier?.state(),connector:this.connector?.userData.connector,camera:this.camera.position.toArray()};}
}
