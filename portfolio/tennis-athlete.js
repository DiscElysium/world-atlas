import * as THREE from './vendor/three.module.js';
import {TENNIS_COLORS as C} from './tennis-forms.js?v=03bcba9148dc';

const POSES=[
 {hip:[0,1.02,0],chest:[-.03,1.46,-.015],head:[-.06,1.81,-.02],ls:[-.25,1.50,.03],le:[-.46,1.24,.12],lw:[-.75,1.29,-.02],rs:[.23,1.50,-.07],re:[.57,1.53,-.32],rw:[.91,1.63,-.53],lk:[-.32,.54,.30],la:[-.53,.12,.43],rk:[.39,.54,-.12],ra:[.59,.12,-.31]},
 {hip:[-.06,.97,.02],chest:[-.09,1.40,.04],head:[-.09,1.75,.015],ls:[-.32,1.45,.03],le:[-.55,1.34,-.22],lw:[-.76,1.42,-.41],rs:[.14,1.45,.025],re:[.54,1.16,.20],rw:[.87,1.20,.42],lk:[-.37,.48,.28],la:[-.62,.12,.50],rk:[.31,.50,-.12],ra:[.54,.12,-.32]},
 {hip:[-.14,.93,.03],chest:[-.17,1.35,.12],head:[-.17,1.72,.13],ls:[-.36,1.41,.04],le:[-.60,1.44,-.28],lw:[-.72,1.54,-.50],rs:[.04,1.41,.16],re:[.31,1.10,.48],rw:[.55,1.26,.67],lk:[-.44,.48,.25],la:[-.65,.12,.46],rk:[.20,.47,-.08],ra:[.42,.12,-.29]},
 {hip:[-.18,.96,.03],chest:[-.22,1.38,.15],head:[-.24,1.75,.16],ls:[-.43,1.44,.09],le:[-.55,1.63,-.10],lw:[-.50,1.84,-.29],rs:[-.02,1.44,.20],re:[.19,1.22,.52],rw:[.31,1.50,.78],lk:[-.45,.51,.22],la:[-.65,.12,.42],rk:[.15,.47,-.09],ra:[.37,.12,-.30]}
];
function torso(f,pose,color,parent,options){
 const base=pose.hip,top=pose.chest,positions=[],indices=[],rings=[[base[0],base[1],base[2],.17,.11],[base[0],base[1]+.17,base[2],.145,.115],[top[0],top[1]-.06,top[2],.26,.14],[top[0],top[1]+.055,top[2],.18,.12]];
 for(const [x,y,z,rx,rz] of rings)for(let i=0;i<8;i++){const a=Math.PI*2*i/8;positions.push(x+Math.cos(a)*rx,y,z+Math.sin(a)*rz)}
 for(let row=0;row<3;row++)for(let j=0;j<8;j++){const a=row*8+j,b=row*8+(j+1)%8;indices.push(a,b,b+8,a,b+8,a+8)}
 for(let i=1;i<7;i++)indices.push(0,i+1,i,24,24+i,24+i+1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return f.mesh(g,color,parent,options);
}
export function buildRacket(f,wrist,parent,color,ghost=false){
 const g=f.group('Oval stringed racket',parent);g.position.set(wrist[0],wrist[1],wrist[2]);g.rotation.set(-.65,.24,-.58);
 f.beam([0,0,0],[0,.28,0],.023,ghost?color:C.dark,g);
 f.beam([0,.21,0],[-.105,.37,0],.015,color,g);f.beam([0,.21,0],[.105,.37,0],.015,color,g);
 const rim=f.mesh(new THREE.TorusGeometry(.23,.017,5,28),color,g);rim.scale.set(.84,1.25,1);rim.position.y=.58;
 if(!ghost){for(let i=-4;i<=4;i++){const x=i*.039,h=.26*Math.sqrt(Math.max(0,1-(x/.193)**2));f.beam([x,.58-h,0],[x,.58+h,0],.0025,'#ccd3d3',g)}for(let i=-5;i<=5;i++){const y=i*.046,w=.18*Math.sqrt(Math.max(0,1-(y/.287)**2));f.beam([-w,.58+y,0],[w,.58+y,0],.0025,'#ccd3d3',g)}}
 return g;
}
function body(f,pose,parent,ghost=false,opacity=.2,portrait=false){
 const options=ghost?{transparent:true,opacity,depthWrite:false,emissive:portrait?'#b8b4ac':'#2765bb',emissiveIntensity:.25}:{},shirt=ghost?(portrait?'#d7d3c9':'#75b4ff'):C.orange,skin=ghost?(portrait?'#ddd9d0':'#a4d1ff'):C.skin;
 torso(f,pose,shirt,parent,options);
 f.beam([pose.chest[0],pose.chest[1]+.04,pose.chest[2]],[pose.head[0],pose.head[1]-.13,pose.head[2]],.065,skin,parent,options);
 const hip=pose.hip;
 for(const [s,e,w] of [[pose.ls,pose.le,pose.lw],[pose.rs,pose.re,pose.rw]]){f.ball(.094,s,shirt,parent,options);f.beam(s,e,.068,shirt,parent,options,.085);f.ball(.061,e,skin,parent,options);f.beam(e,w,.047,skin,parent,options,.062);f.ball(.062,w,skin,parent,options);}
 for(const [k,a,side] of [[pose.lk,pose.la,-1],[pose.rk,pose.ra,1]]){
  const thigh=[hip[0]+side*.13,hip[1]-.04,hip[2]];
  f.beam(thigh,[k[0]*.76,k[1]+.16,k[2]*.76],.11,ghost?skin:C.white,parent,options,.14);
  f.beam([k[0]*.76,k[1]+.16,k[2]*.76],k,.075,skin,parent,options,.094);f.beam(k,a,.055,skin,parent,options,.080);
  const shoe=f.box([.19,.12,.33],[a[0],.065,a[2]-.045],ghost?skin:C.white,parent,options);shoe.rotation.y=side*.33;
  if(!ghost)f.box([.14,.013,.22],[a[0],.015,a[2]-.015],C.blue,parent);
 }
 const head=f.mesh(new THREE.IcosahedronGeometry(1,1),skin,parent,options);head.scale.set(.145,.186,.15);head.position.set(...pose.head);
 if(!ghost){const hair=f.mesh(new THREE.IcosahedronGeometry(1,0),'#403c35',parent);hair.scale.set(.154,.096,.151);hair.position.set(pose.head[0],pose.head[1]+.12,pose.head[2]+.016);f.box([.18,.027,.22],[pose.head[0],pose.head[1]+.11,pose.head[2]-.066],C.white,parent);}
 const racket=buildRacket(f,pose.rw,parent,ghost?'#a5d8ff':C.dark,ghost);
 if(ghost)racket.traverse(o=>{if(o.isMesh){o.material=f.material(portrait?'#c0bdb4':'#9dcaff',options);o.castShadow=false}});
 if(ghost||portrait){const joint=portrait?'#e78739':'#b9e5ff',line=portrait?'#c3c1b9':'#a4d9ff',pts={...pose,lh:[hip[0]-.13,hip[1],hip[2]],rh:[hip[0]+.13,hip[1],hip[2]]};for(const key of ['ls','le','lw','rs','re','rw','lh','rh','lk','rk','la','ra'])f.ball(.045,pts[key],joint,parent,{transparent:true,opacity:ghost?Math.min(.9,opacity*2.9):.95,depthWrite:false,emissive:joint,emissiveIntensity:.3});for(const [a,b] of [['ls','le'],['le','lw'],['rs','re'],['re','rw'],['ls','rs'],['ls','lh'],['rs','rh'],['lh','rh'],['lh','lk'],['lk','la'],['rh','rk'],['rk','ra']])f.beam(pts[a],pts[b],.014,line,parent,{transparent:true,opacity:ghost?opacity*2.5:.5,depthWrite:false,emissive:line,emissiveIntensity:.25});}
}
export function buildTennisAthlete(f,plan){
 const g=f.group('TennisAtom · Athlete and captured poses');g.position.set(plan.court.x,plan.court.y,plan.court.z);g.rotation.y=plan.court.angle;g.scale.setScalar(plan.scale);
 const live=f.group('Forehand · solid body',g);live.position.set(.3,.13,4.40);live.rotation.y=-.40;body(f,POSES[0],live,false,.2,plan.portrait);
 for(let i=1;i<=3;i++){const ghost=f.group('Captured pose '+i,g);ghost.position.set(.30-i*.47,.14,4.4+i*.24);ghost.rotation.y=-.4+(i*.10);body(f,POSES[i],ghost,true,.37-i*.065,plan.portrait);}
 g.userData.motionPhases=4;g.userData.primaryPlayer=live;return g;
}
