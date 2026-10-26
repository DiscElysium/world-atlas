import * as THREE from '../../vendor/three.module.js';
import {C} from './plan.mjs';
import {plantKit} from './ecology.js';
import {GAME_PAPERS} from '../assets.js';
export function cropPrint(mesh,info){const [x0,y0,x1,y1]=info.crop,[w,h]=info.size,uv=mesh.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(x0+uv.getX(i)*(x1-x0))/w,1-(y0+(1-uv.getY(i))*(y1-y0))/h);uv.needsUpdate=true;}
export function buildProps(f,p,textures={},animate=()=>{}){
 const g=f.group('08 · Individually assembled artist props and aquarium'),room=f.group('Props in studio coordinates',g);room.position.set(p.room.x,p.room.y,p.room.z);const k=plantKit(f);
 const desk=f.group('P01 · Desk with drawers',room);desk.position.set(-1.05,0,-1.45);f.box('Desk wooden top',[2.6,.105,.85],[0,.90,0],'#ad8058',desk);
 for(const x of [-1.15,1.15])for(const z of [-.31,.31])f.box('Desk leg',[.09,.85,.09],[x,.42,z],C.woodDark,desk);
 f.box('Desk drawer bank',[.68,.63,.73],[.84,.55,0],C.wood,desk);
 for(let i=0;i<3;i++){f.box('Individual drawer front',[.63,.19,.035],[.84,.33+i*.20,.39],'#b89065',desk);f.beam('Drawer handle',[.72,.33+i*.20,.42],[.95,.33+i*.20,.42],.018,C.woodDark,desk);}
 const chair=f.group('P02 · Artist chair',room);chair.position.set(-1.05,0,-.1);f.box('Chair seat',[.65,.07,.65],[0,.53,0],C.wood,chair);
 for(const x of [-.255,.255])for(const z of [-.255,.255])f.box('Chair leg',[.06,.53,.06],[x,.265,z],C.woodDark,chair);
 for(const x of [-.25,.25])f.box('Chair back post',[.055,.63,.055],[x,.81,.27],C.woodDark,chair);f.box('Chair back board',[.62,.33,.06],[0,.94,.29],C.wood,chair);
 const cab=f.group('P03 · Tank cabinet',room);cab.position.set(1.4,0,-1.4);f.box('Tank cabinet body',[1.2,.79,.8],[0,.43,0],C.wood,cab);f.box('Cabinet top',[1.27,.06,.85],[0,.85,0],'#b89268',cab);
 for(const x of [-.29,.29]){f.box('Cabinet door',[.55,.67,.025],[x,.43,.416],'#b48a61',cab);f.box('Cabinet door handle',[.022,.12,.028],[x+(x<0?.16:-.16),.50,.445],C.woodDark,cab);}
 const tank=f.group('P04 · Transparent glass fish tank',room);tank.position.set(1.4,.89,-1.4);const glass=f.material('#bce1e6',{transparent:true,opacity:.20,roughness:.15,side:THREE.DoubleSide,depthWrite:false});
 for(const [size,pos] of [[[1.2,.85,.018],[0,.425,-.375]],[[1.2,.85,.018],[0,.425,.375]],[[.018,.85,.75],[-.6,.425,0]],[[.018,.85,.75],[.6,.425,0]],[[1.2,.025,.75],[0,.012,0]]]){const pane=f.box('Thin aquarium glass',size,pos,glass,tank,{bevel:false});pane.userData.batchGlass=true;}
 f.box('Aquarium sand floor',[1.16,.065,.71],[0,.068,0],'#dccc9e',tank);
 for(const z of [-.375,.375])for(const y of [0,.85])f.beam('Glass tank rim',[-.6,y,z],[.6,y,z],.015,'#87b7b8',tank);
 for(const x of [-.6,.6])for(const z of [-.375,.375])f.beam('Glass vertical seam',[x,0,z],[x,.85,z],.012,'#9bc7c8',tank);
 const ws=f.box('Aquarium water surface',[1.16,.009,.71],[0,.71,0],'#67b9c5',tank,{transparent:true,opacity:.25,depthWrite:false,roughness:.18,bevel:false});ws.castShadow=false;
 for(const [x,z] of [[-.43,-.2],[.43,-.23],[.25,.23]]){k.leaves(tank,x,.10,z,.13,5);f.ball('Aquarium river stone',[.09,.055,.07],[x,.12,z],C.stone,tank);}
 const fish=f.group('P06 · Goldfish body, flowing fins and tail',tank);fish.position.set(-.06,.43,.04);const fm=f.material(C.fish,{roughness:.60});f.ball('Faceted goldfish body',[.20,.115,.075],[0,0,0],fm,fish);
 for(const side of [-1,1]){const tail=f.mesh(new THREE.ConeGeometry(.11,.20,3),fm,fish);tail.name='Goldfish forked tail';tail.rotation.z=Math.PI/2+side*.25;tail.position.set(-.23,side*.052,0);tail.scale.z=.35;}
 f.ball('Goldfish dorsal fin',[.09,.045,.018],[-.04,.105,0],fm,fish);f.ball('Goldfish pectoral fin',[.055,.035,.025],[.03,-.025,.067],fm,fish);f.ball('Goldfish dark eye',[.012,.016,.006],[.135,.03,.072],'#302c2b',fish);f.compact(fish);fish.traverse(o=>{if(o.isMesh)o.userData.dynamic=true;});animate(t=>{fish.position.x=-.06+Math.sin(t*.5)*.16;fish.position.y=.43+Math.sin(t*.9)*.035;fish.rotation.y=Math.sin(t*.5)*.20;});
 k.pot(room,2.12,0,.35,.55);
 const book=f.group('P08 · Open sketchbook',room);book.position.set(-1.1,.96,-1.4);f.box('Book cream pages',[.63,.06,.43],[0,.025,0],C.paper,book);f.box('Book cloth cover',[.66,.025,.45],[0,-.016,0],'#6d8779',book);f.box('Open sketchbook spine',[.016,.007,.42],[0,.061,0],C.woodDark,book);
 if(textures.collage?.painting){const sketch=f.printed('Game fish illustration in sketchbook',textures.collage.painting,.28,.28,book);sketch.rotation.x=-Math.PI/2;sketch.position.set(.16,.063,0);cropPrint(sketch,GAME_PAPERS.painting);}
 const cup=f.mesh(new THREE.CylinderGeometry(.09,.07,.17,8),'#d9cbb3',room);cup.name='P09 · Brush cup';cup.position.set(-2,1.05,-1.62);
 for(let i=0;i<5;i++){const x=-2+(i-2)*.025,z=-1.62+(i%2)*.035;f.beam('Paintbrush handle',[x,1.03,z],[x+.035,1.32+(i%3)*.04,z],.008,C.woodDark,room);f.beam('Paintbrush tip',[x+.035,1.32+(i%3)*.04,z],[x+.045,1.37+(i%3)*.04,z],.010,'#81664f',room);}
 const camera=f.group('P10 · Camera',room);camera.position.set(-.25,.965,-1.57);f.box('Camera body',[.3,.18,.14],[0,.10,0],'#3f4140',camera);const lens=f.mesh(new THREE.CylinderGeometry(.065,.07,.10,10),'#343837',camera);lens.name='Camera lens';lens.rotation.x=Math.PI/2;lens.position.set(.06,.10,.10);f.box('Shutter button',[.035,.023,.04],[-.09,.21,0],'#acaaa0',camera);
 const easel=f.group('P11 · Three-leg easel',room);easel.position.set(-2.1,0,1.4);for(const x of [-.28,.28])f.beam('Easel front leg',[x,0,.12],[x*.64,1.3,-.07],.025,C.woodDark,easel);f.beam('Easel rear support',[0,0,-.4],[0,1.2,-.06],.025,C.woodDark,easel);f.box('Easel picture ledge',[.70,.045,.09],[0,.51,.06],C.wood,easel);f.box('Thin easel paper',[.60,.50,.015],[0,.78,.015],C.paper,easel);
 if(textures.collage?.painting){const print=f.printed('Original game painting on easel',textures.collage.painting,.51,.35,easel);print.position.set(0,.81,.027);cropPrint(print,GAME_PAPERS.painting);}
 const lamp=f.group('P12 · Desk lamp',room);lamp.position.set(-1.78,.965,-1.3);f.box('Lamp base',[.21,.025,.16],[0,.013,0],'#56594b',lamp);f.beam('Lamp articulated stem',[0,.02,0],[.07,.31,0],.015,C.woodDark,lamp);f.beam('Lamp articulated stem',[.07,.31,0],[.18,.40,0],.015,C.woodDark,lamp);const shade=f.mesh(new THREE.ConeGeometry(.10,.14,8,1,true),'#72846c',lamp);shade.name='Lamp shade';shade.position.set(.19,.40,0);shade.rotation.z=-.6;
 for(let i=0;i<5;i++)f.box('Wall pinned paper sketch',[.31,.40,.008],[-2.1+i*.33,2.68,-2.28],C.paper,room,{bevel:false});return g;
}
