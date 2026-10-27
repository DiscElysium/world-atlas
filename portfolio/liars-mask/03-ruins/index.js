import * as THREE from '../../vendor/three.module.js';
import {stoneGeometry,mergeMeshes} from '../geometry.js?v=eed7fff475f6';
import {surfaceHeightAt} from '../01-foundation/index.js?v=eed7fff475f6';
import {buildMask} from '../05-actors/index.js?v=eed7fff475f6';
import {PORTICO} from '../layout.mjs?v=eed7fff475f6';

export function columnShaft(radius,height,broken=false){
 const p=[],segments=48;
 function point(i,y){const a=i/segments*Math.PI*2,r=radius*(1-.09*Math.cos(a*12))*(1-.08*y/height);return[r*Math.cos(a),y,r*Math.sin(a)];}
 for(let i=0;i<segments;i++){
  const h=broken?height*(.89+.09*Math.sin(i*.41)+.025*Math.cos(i*1.83)):height;
  const hn=broken?height*(.89+.09*Math.sin((i+1)*.41)+.025*Math.cos((i+1)*1.83)):height;
  const a=point(i,0),b=point(i+1,0),c=point(i,h),d=point(i+1,hn);
  p.push(...a,...c,...d,...a,...d,...b,0,0,0,...a,...b,0,height*.9,0,...d,...c);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.computeVertexNormals();return g;
}
export function buildColumn(forms,parent,{position=[0,0,0],radius=.62,height=5.4,broken=false,name='column'}={}){
 const root=forms.group(name,parent,position),base=.46,cap=.43;
 forms.box(root,'#d8cebc',[radius*3.4,.21,radius*3.4],[0,.105,0],.018,'plinth');
 forms.box(root,'#e6dece',[radius*2.8,.25,radius*2.8],[0,.335,0],.025,'base');
 const shaftHeight=height-base-(broken?0:cap);
 forms.mesh(root,columnShaft(radius,shaftHeight,broken),'#ded6c5',[0,base,0]);
 if(!broken){forms.box(root,'#e6dece',[radius*2.3,.18,radius*2.3],[0,height-.34,0],.06,'neck');forms.box(root,'#dfd4c1',[radius*3,.23,radius*3],[0,height-.115,0],.022,'capital');}
 root.userData.height=height;root.userData.radius=radius;return root;
}
function banner(forms,parent){
 const shape=new THREE.Shape();shape.moveTo(-.9,0);shape.lineTo(.9,0);shape.lineTo(.85,-2.7);shape.lineTo(0,-3.3);shape.lineTo(-.85,-2.7);shape.closePath();
 const m=forms.mesh(parent,new THREE.ShapeGeometry(shape),'#392c1e',[0,4.85,.15]);m.material.side=THREE.DoubleSide;m.castShadow=false;
 // A small sculpted mask relief, rather than a texture impostor.
 const face=buildMask(forms,parent,{kind:'moustache',position:[0,3.45,.18],yaw:Math.PI});face.scale.setScalar(1.5);
 forms.beam(parent,'#b9ab91',[-1.1,4.9,0],[1.1,4.9,0],.05,6);
}
export function buildRuins(forms,{kitOnly=false}={}){
 const root=forms.group('03 · columns and ruins');root.userData.moduleId='ruins';
 const portico=forms.group('incomplete portico',root,PORTICO);
 for(const x of [-3.0,3.0])buildColumn(forms,portico,{position:[x,0,0],radius:.67,height:5.6});
 forms.box(portico,'#e0d7c5',[6.3,.62,1.45],[-.1,5.82,0],.026,'broken lintel');
 const end=forms.mesh(portico,stoneGeometry('wedge',115),'#ddd2be',[3.05,5.46,0],[1.0,.85,1.45]);end.rotation.z=.08;
 banner(forms,portico);
 buildColumn(forms,root,{position:[-12.1,surfaceHeightAt(-12.1,-8.7),-8.7],radius:.65,height:6.1,name:'left high column'});
 buildColumn(forms,root,{position:[2.7,surfaceHeightAt(2.7,-9),-9],radius:.63,height:6.4,name:'far column'});
 buildColumn(forms,root,{position:[17.7,.65,3.1],radius:.64,height:5.5,name:'near-right framing column'});
 buildColumn(forms,root,{position:[-13.2,.65,0],radius:.55,height:2.1,broken:true,name:'broken left drum'});
 const fallen=forms.group('fallen foreground column',root,[-14,.65,8.3]);fallen.rotation.y=.55;
 const shaft=forms.mesh(fallen,columnShaft(.79,4.8,true),'#d7cebb',[2.4,.82,0]);shaft.rotation.z=Math.PI/2;
 forms.box(fallen,'#e0d5c2',[1.1,1.6,1.8],[2.1,.85,0],.02,'fallen capital');forms.box(fallen,'#d5cab4',[.8,1.55,1.7],[-2.0,.8,0],.025,'broken collar');
 const wall=forms.group('masonry behind opponents',root,[1.9,.65,-7.6]);
 for(let row=0;row<3;row++)for(let i=0;i<4-row%2;i++)forms.box(wall,row%2?'#c9bfac':'#d3c9b4',[1.42,.55,.85],[i*1.46-2.25+(row%2?.65:0),.275+row*.57,0],.025,'wall-block');
 const rubble=forms.group('architectural rubble',root);const debris=[[-11.4,-2.0,1.0,.7,1.1,.2],[-13,-7.8,1.4,1.0,1.2,.4],[5.6,-4.2,1.1,1.3,1.0,-.2],[7.2,-1.5,1.4,1,1.0,.3],[15.9,-2.1,.8,.6,1.2,.2],[17.0,6.4,1.0,.6,1.1,.6],[-13.4,10.8,.9,.6,1.0,.4]];
 for(const[x,z,w,h,d,a]of debris){const m=forms.mesh(rubble,stoneGeometry('cube',Math.round(x*12+z*7)),'#cfc4ad',[x,surfaceHeightAt(x,z),z],[w,h,d]);m.rotation.y=a;}
 if(kitOnly){for(const c of [...root.children])if(c!==portico)c.visible=false;}
 root.userData.columnCount=6;root.userData.parts=['plinth','base','fluted shaft','capital','broken drum','lintel','wall','banner','fallen column'];
 mergeMeshes(root,'ruin stone assembly');return root;
}
