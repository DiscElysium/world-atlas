import * as THREE from '../../vendor/three.module.js';
import {buildDie} from '../04-table/index.js?v=eed7fff475f6';
import {buildMask} from '../05-actors/index.js?v=eed7fff475f6';
import {floorHeightAt} from '../01-foundation/index.js?v=eed7fff475f6';
import {translate} from '../../i18n.mjs?v=eed7fff475f6';

export function buildContent(forms,artwork,{mobile=false,anisotropy=4,language='zh'}={}){
 const root=forms.group('06 · Ground-printed portfolio'),interactive=[],owned=[];root.userData.moduleId='content';
 const title={x:mobile?0:-3.5,z:mobile?4.5:5.6,width:mobile?16:18,depth:mobile?3.6:4.4,angle:mobile?0:.10};
 function ink(name,w,d,paint,parent=root){const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=Math.round(2048*d/w);const c=canvas.getContext('2d');paint(c,canvas.width,canvas.height);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=anisotropy;owned.push(t);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,alphaTest:.025,toneMapped:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.name=name;m.receiveShadow=false;m.castShadow=false;parent.add(m);return m;}
 const labelGroup=forms.group('Ink printed into the stone court',root,[title.x,.683,title.z]);labelGroup.rotation.y=title.angle;
 ink('project-copy',title.width,title.depth,(c,w,h)=>{
  c.fillStyle='#49220d';c.textAlign='center';c.textBaseline='middle';const headline=mobile?.52:.43;c.font=`bold ${h*headline}px Georgia, "Times New Roman", serif`;const text='LIAR’S MASK';const measured=c.measureText(text).width;if(measured>w*.98)c.font=`bold ${h*headline*w*.98/measured}px Georgia, serif`;c.fillText(text,w/2,h*.31);
  const subtitle=translate('maskName',language),subtitleSize=h*(mobile?.22:.15);c.font=`600 ${subtitleSize}px "KaiTi", "Microsoft YaHei", serif`;const subtitleWidth=c.measureText(subtitle).width;if(subtitleWidth>w*.96)c.font=`600 ${subtitleSize*w*.96/subtitleWidth}px "KaiTi", "Microsoft YaHei", serif`;c.fillText(subtitle,w/2,h*(mobile?.76:.67));
  if(!mobile){c.font=`600 ${h*.065}px Georgia, serif`;const words='B L U F F   ·   R E A D   ·   C H A L L E N G E';c.fillText(words,w/2,h*.89);}
 },labelGroup);
 const b={x:mobile?0:-3.5,z:mobile?16.4:9.45,w:mobile?13:8.4,d:mobile?2.4:1.85},button=forms.group('Large stone action slab',root,[b.x,floorHeightAt(b.x,b.z),b.z]);button.rotation.y=title.angle;
 const slab=forms.box(button,'#e5d9c3',[b.w,.30,b.d],[0,.15,0],.06,'stone button');slab.material=slab.material.clone();slab.userData.action={id:'liars-mask',kind:'project'};interactive.push(slab);
 const words=ink('project-button',b.w*.9,b.d*.88,(c,w,h)=>{c.fillStyle='#49220d';c.textAlign='center';c.textBaseline='middle';let size=h*.47;c.font=`600 ${size}px "KaiTi", "Microsoft YaHei", serif`;const text=translate('viewArrow',language),measured=c.measureText(text).width;if(measured>w*.97)c.font=`600 ${size*w*.97/measured}px "KaiTi", "Microsoft YaHei", serif`;c.fillText(text,w/2,h*.51);},button);words.position.y=.312;words.userData.action=slab.userData.action;interactive.push(words);
 const a={x:mobile?0:9.0,z:mobile?10.7:6.25,w:mobile?14.8:9.6,d:mobile?8.325:5.4},print=forms.group('Actual gameplay print',root,[a.x,.67,a.z]);print.rotation.y=mobile?0:-.22;
 forms.box(print,'#493323',[a.w+.67,.04,a.d+.67],[0,.02,0],.012,'fine print outline');
 forms.box(print,'#eee7d8',[a.w+.6,.045,a.d+.6],[0,.023,0],.012,'thin ivory print border');
 if(artwork){const picture=new THREE.Mesh(new THREE.PlaneGeometry(a.w,a.d),new THREE.MeshBasicMaterial({map:artwork,toneMapped:false,side:THREE.DoubleSide}));picture.name='project-art';picture.rotation.x=-Math.PI/2;picture.position.y=.052;picture.userData.action={id:'liars-mask',kind:'art'};picture.userData.gameArtwork=true;print.add(picture);interactive.push(picture);}
 if(!mobile){buildDie(forms,root,{position:[8.8,.65,10.5],edge:.70,face:5,yaw:.26});buildDie(forms,root,{position:[10.5,.65,10.0],edge:.68,face:4,yaw:-.12});const mask=buildMask(forms,root,{kind:'moustache',position:[11.9,.92,11.15]});mask.rotation.x=-Math.PI/2;mask.rotation.z=-.35;mask.scale.setScalar(2.25);}
 root.userData.layout={title,button:b,image:a};
 return{root,interactive,zones:[],setHighlight(action){slab.material.emissive.set(action?.kind==='project'?'#5a432b':'#000000');slab.material.emissiveIntensity=.12;},dispose(){owned.forEach(t=>t.dispose());}};
}
