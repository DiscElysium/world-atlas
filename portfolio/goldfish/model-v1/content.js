import * as THREE from '../../vendor/three.module.js';
import {C} from './plan.mjs?v=eed7fff475f6';
import {cropPrint} from './props.js?v=eed7fff475f6';
import {GAME_PAPERS} from '../assets.js?v=eed7fff475f6';
import {translate} from '../../i18n.mjs?v=eed7fff475f6';
export function buildGoldfishContent(f,p,textures={},anisotropy=4,language='zh'){
 const root=f.group('10 · Portfolio ink and torn-paper work image'),interactive=[],owned=[],y=p.levels.reading+.052;
 function print(name,text,frame,font='Georgia',weight='400',color=C.ink){
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=Math.round(canvas.width*frame.depth/frame.width);const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';let size=canvas.height*.78;ctx.font=`${weight} ${size}px ${font}`;const length=ctx.measureText(text).width;if(length>canvas.width*.97){size*=canvas.width*.97/length;ctx.font=`${weight} ${size}px ${font}`;}ctx.fillText(text,canvas.width/2,canvas.height*.53);
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=anisotropy;owned.push(t);const m=f.printed(name,t,frame.width,frame.depth,root,{emissiveIntensity:.12});m.rotation.x=-Math.PI/2;m.position.set(frame.x,y,frame.z);m.castShadow=false;return m;
 }
 const nameFrame=language==='en'?{...p.content.name,width:p.content.intro.width}:p.content.name;
 print('GOLDFISH / ground-plane ink','GOLDFISH',p.content.title);print('金鱼 / ground-plane ink',translate('goldfishName',language),nameFrame,'"Noto Serif SC", "KaiTi", "Microsoft YaHei", serif');print('Mechanics / ground-plane ink',translate('goldfishMechanics',language),p.content.intro,'"Microsoft YaHei", sans-serif');
 const b=p.content.button,outline=[[-b.width*.50,-b.depth*.48],[-b.width*.21,-b.depth*.52],[b.width*.10,-b.depth*.49],[b.width*.50,-b.depth*.48],[b.width*.505,b.depth*.17],[b.width*.495,b.depth*.49],[b.width*.12,b.depth*.52],[-b.width*.15,b.depth*.49],[-b.width*.505,b.depth*.47]];
 const paper=f.slab('Large torn-paper action surface',outline,.02,0,'#f8f1e2',root);paper.position.set(b.x,y,b.z);paper.material=paper.material.clone();paper.userData.action={id:'goldfish',kind:'project'};interactive.push(paper);
 const label=print('Large clickable ground-plane label',translate('viewArrow',language),b,'"Microsoft YaHei", sans-serif','500');label.position.y=y+.028;label.userData.action={id:'goldfish',kind:'project'};interactive.push(label);
 const a=p.content.image,g=f.group('Actual game artwork on thin torn paper',root);g.position.set(a.x,y,a.z);g.rotation.y=a.angle;
 const edge=[[-a.width*.53,-a.depth*.55],[-a.width*.23,-a.depth*.53],[a.width*.06,-a.depth*.56],[a.width*.53,-a.depth*.54],[a.width*.55,-a.depth*.17],[a.width*.53,a.depth*.55],[a.width*.18,a.depth*.53],[-a.width*.13,a.depth*.56],[-a.width*.54,a.depth*.54],[-a.width*.55,a.depth*.02]];f.slab('Torn ivory print backing',edge,.025,0,C.paper,g);
 const art=textures.collage?.painting||textures.runtime;if(art){const picture=f.printed('Original Goldfish game illustration',art,a.width,a.depth,g,{transparent:false,emissiveIntensity:.13});picture.rotation.x=-Math.PI/2;picture.position.y=.030;if(textures.collage?.painting){const uv=picture.geometry.attributes.uv;[[872,522],[1535,605],[698,944],[1292,1050]].forEach(([x,z],i)=>uv.setXY(i,x/2172,1-z/1629));uv.needsUpdate=true;}picture.userData.action={id:'goldfish',kind:'art'};picture.userData.gameArtwork=true;interactive.push(picture);}
 root.userData.moduleId='content';return{root,interactive,owned,zones:[],setHighlight(action){paper.material.emissive.set(action?.kind==='project'?'#897258':'#000000');paper.material.emissiveIntensity=.15;},dispose(){owned.forEach(t=>t.dispose());paper.material.dispose();}};
}
