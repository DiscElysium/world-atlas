import * as THREE from '../vendor/three.module.js';
import {GOLD_COLORS as C} from './plan.mjs';

function cameraModel(f,parent,x,y,z){
 const g=f.group('Compact camera with lens, grip, dial and strap',parent);g.position.set(x,y,z);
 f.box('Camera body',[.48,.31,.26],[0,.16,0],'#383a38',g);
 f.box('Silver camera top',[.48,.055,.26],[0,.329,0],'#b8b8ad',g);
 f.box('Rubber camera grip',[.11,.26,.29],[.215,.155,.005],'#222526',g);
 f.beam('Lens barrel',[0,.16,.10],[0,.16,.25],.115,'#303637',g);
 f.beam('Lens glass',[0,.16,.249],[0,.16,.266],.085,'#526c74',g,{roughness:.15});
 f.ball('Mode dial',[.069,.025,.069],[-.13,.379,0],'#363b3b',g);
 f.box('Viewfinder',[.14,.09,.15],[.02,.388,-.02],'#b5b7aa',g);
 f.ribbon('Camera strap',[[-.23,.20,0],[-.40,.13,.07],[-.32,.02,.10],[.30,.02,.12],[.38,.18,0]],'#544333',.015,g);
}
function book(f,g,x,y,z,w,h,d,col,angle=0){const b=f.group('Paper-bound book',g);b.position.set(x,y,z);b.rotation.z=angle;f.box('Pages',[w*.90,h*.91,d],[0,0,0],'#ebe2cb',b);for(const side of [-1,1])f.box('Cover',[w*.065,h,d+.015],[side*w*.475,0,0],col,b);f.box('Spine',[w,h,.034],[0,0,d*.51],col,b);}
function poster(f,parent,x,y,z,w,h,texture,index){
 const g=f.group('Pinned studio drawing '+index,parent);g.position.set(x,y,z);g.rotation.z=(index%2?1:-1)*.05;
 f.box('Ivory paper sheet',[w,h,.012],[0,0,0],'#faf3e1',g);
 if(texture){const image=f.printed('Pinned drawing image',texture,w*.86,h*.76,g,{transparent:false});image.position.z=.011;}
 else for(let i=0;i<5;i++)f.box('Pigment swatch',[w*.22,h*.15,.014],[(i%2)*w*.29-w*.16,Math.floor(i/2)*h*.21-h*.17,.015],['#d9c157','#6f905c','#64a4bd','#b85b40','#a48dad'][i],g);
 f.box('Masking tape',[w*.20,.065,.025],[0,h*.49,.013],'#dfcba9',g);
}
export function buildGoldfishRoom(f,p,textures={}){
 const root=f.group('02 · Creator room / independently built furniture'),g=f.group('Roofless artist room',root);g.position.set(p.room.x,p.room.y,p.room.z);
 f.box('Paper-edged room floor',[10,.16,6.5],[0,.025,0],'#c9a46c',g);
 for(let i=0;i<20;i++)for(let j=0;j<4;j++){const z=-2.49+j*1.63+(i%2?.28:0);if(z+0.78>3.25)continue;f.box('Wooden floor plank '+i+'-'+j,[.487,.040,1.57],[-4.755+i*.50,.124,z],i%4===0?'#cfa66c':i%3===0?'#d8b478':'#dbba85',g);}
 // Construct around a genuine window opening rather than hiding a painted square behind a wall.
 f.box('West cutaway wall',[.16,3.10,6.5],[-5.04,1.61,0],'#e8dfc9',g);
 f.box('North wall left pier',[.65,3.25,.16],[-4.71,1.68,-3.27],C.paper,g);
 f.box('North wall right pier',[5.4,3.25,.16],[2.35,1.68,-3.27],C.paper,g);
 f.box('Window wall below sill',[4.0,.68,.16],[-2.42,.43,-3.27],C.paper,g);
 f.box('Window wall header',[4.0,.37,.16],[-2.42,3.11,-3.27],C.paper,g);
 f.box('Window sky paper',[3.84,2.10,.018],[-2.42,1.87,-3.37],'#8ec2e8',g,{emissive:'#86b9d8',emissiveIntensity:.14});
 for(const x of [-4.43,-3.42,-2.42,-1.42,-.42])f.box('Window vertical timber',[.075,2.2,.15],[x,1.84,-3.27],'#f0e6cf',g);
 for(const y of [.75,1.85,2.94])f.box('Window horizontal timber',[4.1,.072,.15],[-2.42,y,-3.27],'#f4ead1',g);
 f.box('Broad window sill',[4.22,.12,.37],[-2.42,.71,-3.12],'#e5d3ad',g);
 for(const [x,y,s] of [[-3.9,2.2,.26],[-2.9,2.65,.28],[-1.2,1.95,.33]]){f.ball('Window printed cloud',[s,.075,.014],[x,y,-3.346],'#f6f3e8',g);f.ball('Window cloud lobe',[s*.65,.12,.016],[x+s*.32,y+.06,-3.344],'#f6f3e8',g);}
 f.box('North skirting',[9.85,.17,.08],[0,.20,-3.15],'#c4aa7d',g);
 f.box('West skirting',[.08,.17,6.45],[-4.925,.20,0],'#c4aa7d',g);
 const desk=f.group('Desk',g);desk.position.set(-1.27,.16,-2.05);
 f.box('Desk top',[4.7,.12,1.45],[0,1.04,0],C.woodLight,desk);
 f.box('Desk front apron',[4.55,.25,.08],[0,.85,.62],C.wood,desk);
 for(const x of [-2.15,2.15])for(const z of [-.56,.56])f.box('Desk jointed leg',[.11,.97,.11],[x,.48,z],C.wood,desk);
 const drawer=f.group('Desk drawer pedestal',desk);drawer.position.set(-1.76,.40,0);
 f.box('Pedestal case',[.83,.77,1.18],[0,0,0],'#b78a51',drawer);
 for(let i=0;i<3;i++){f.box('Drawer face '+i,[.74,.20,.055],[0,-.25+i*.25,.623],'#c29458',drawer);f.box('Drawer handle '+i,[.17,.035,.035],[0,-.25+i*.25,.663],'#765637',drawer);}
 f.box('Monitor pedestal',[.62,.055,.34],[-.48,1.155,-.14],'#575e5e',desk);
 f.box('Monitor neck',[.10,.32,.08],[-.48,1.33,-.26],'#676f6e',desk);
 f.box('Monitor frame',[1.83,1.03,.072],[-.48,1.90,-.34],'#333b3b',desk);
 if(textures.runtime){const screen=f.printed('Actual project screen',textures.runtime,1.69,.90,desk,{transparent:false,emissiveIntensity:.25});screen.position.set(-.48,1.905,-.295);}else f.box('Monitor screen',[1.68,.9,.018],[-.48,1.905,-.292],'#79a8ca',desk);
 f.box('Monitor indicator',[.045,.015,.012],[.23,1.40,-.287],'#cad5bc',desk);
 f.box('Keyboard base',[1.08,.055,.36],[-.53,1.141,.36],'#454c4c',desk);
 for(let row=0;row<3;row++)for(let col=0;col<11;col++)f.box('Keyboard key '+row+'-'+col,[.072,.014,.078],[-1.0+col*.094,1.18,.25+row*.098],'#8c9690',desk);
 f.box('Space bar',[.38,.018,.052],[-.54,1.181,.513],'#7c8580',desk);
 f.ball('Mouse',[.11,.042,.15],[.32,1.164,.38],'#717b7b',desk);
 f.box('Mouse mat',[.42,.016,.49],[.32,1.125,.36],'#b7b2a5',desk);
 cameraModel(f,desk,-1.89,1.113,.02);
 f.box('Sketchbook paper',[.58,.038,.47],[.97,1.14,.34],'#f4eee0',desk);
 f.box('Sketchbook pencil',[.46,.014,.025],[.91,1.172,.43],'#846141',desk).rotation.y=.25;
 f.beam('Brush cup',[1.61,1.11,-.29],[1.61,1.44,-.29],.14,'#ddc5a0',desk,{},.17);
 for(let i=0;i<7;i++){const a=i*2.399,r=.075;f.beam('Brush handle '+i,[1.61+Math.cos(a)*r,1.27,-.29+Math.sin(a)*r],[1.61+Math.cos(a)*r*2,1.83+(i%3)*.1,-.29+Math.sin(a)*r*2],.013,i%2?'#a56732':'#594f3b',desk);}
 for(let i=0;i<3;i++)f.box('Paint tube '+i,[.10,.07,.25],[1.9+i*.13,1.15,.2],['#e06943','#507fa1','#d6bd61'][i],desk);
 const chair=f.group('Wooden chair with slats',g);chair.position.set(-1.25,.16,-.05);chair.rotation.y=-.11;
 f.box('Chair seat',[.85,.08,.86],[0,.54,0],C.woodLight,chair);
 for(const x of [-.34,.34])for(const z of [-.34,.34])f.box('Chair leg',[.065,.53,.065],[x,.26,z],C.wood,chair);
 for(const x of [-.36,.36])f.box('Chair back post',[.07,1.4,.075],[x,.73,.38],C.wood,chair);
 for(let i=0;i<5;i++)f.box('Chair vertical back slat',[.032,.73,.05],[-.28+i*.14,1.055,.38],C.woodLight,chair);
 f.box('Chair top rail',[.80,.09,.075],[0,1.47,.38],C.woodLight,chair);
 const bed=f.group('Wooden bed / bedding',g);bed.position.set(-3.65,.16,1.09);
 f.box('Bed frame',[2.16,.23,3.06],[0,.39,0],C.wood,bed);
 for(const x of [-.94,.94])for(const z of [-1.35,1.35])f.box('Bed post',[.10,.72,.10],[x,.36,z],C.wood,bed);
 f.box('Bed headboard',[2.16,.74,.10],[0,.65,-1.46],C.woodLight,bed);
 f.box('Mattress',[2.05,.21,2.94],[0,.60,0],'#ede8db',bed);
 f.ball('Pillow',[.88,.14,.37],[0,.83,-.92],'#fff8e6',bed);
 f.box('Linen blanket',[2.08,.06,1.96],[0,.75,.46],'#8395a0',bed);
 for(let x=0;x<8;x++)for(let z=0;z<8;z++)f.box('Checked blanket textile '+x+'-'+z,[.252,.005,.239],[-.91+x*.26,.784,-.40+z*.244],(x+z)%2?'#b5c0c4':'#80909a',bed);
 for(const side of [-1,1])f.box('Blanket hanging edge',[.035,.26,1.95],[side*1.05,.61,.46],'#96a7af',bed);
 const shelf=f.group('Small bookshelf',g);shelf.position.set(-4.36,.15,-2.23);
 for(const x of [-.43,.43])f.box('Bookshelf side',[.065,1.8,.72],[x,.90,0],C.wood,shelf);
 for(let i=0;i<4;i++)f.box('Bookshelf shelf '+i,[.92,.055,.72],[0,.03+i*.58,0],C.woodLight,shelf);
 for(let i=0;i<12;i++)book(f,shelf,-.30+(i%4)*.19,.27+Math.floor(i/4)*.58,.05,.15,.43,.43,['#768767','#b49057','#8a6660','#d3c3a2'][i%4],i%4===3?.08:0);
 poster(f,g,.98,2.06,-3.168,.72,.97,textures.runtime,1);
 poster(f,g,2.18,1.76,-3.168,.64,.95,null,2);
 poster(f,g,3.44,2.27,-3.168,.72,.91,null,3);
 poster(f,g,4.28,1.28,-3.168,.54,.83,null,4);
 const sidePaper=f.group('Room sketches on floor',g);sidePaper.position.set(.8,.17,1.65);sidePaper.rotation.y=-.21;f.box('Loose floor drawing',[1.4,.018,1.08],[0,0,0],'#f4efe0',sidePaper);
 for(let i=0;i<4;i++)f.box('Colour studies',[.16,.003,.13],[-.42+i*.27,.014,.25],['#477f9d','#8b9e67','#dbab68','#bb7262'][i],sidePaper);
 root.userData.moduleId='room';return root;
}
