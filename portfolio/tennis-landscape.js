import * as THREE from './vendor/three.module.js';
import {seeded} from './map-model.mjs?v=03bcba9148dc';
import {tennisWorldHeight,courtPoint,routeDistance} from './tennis-layout.mjs?v=03bcba9148dc';
import {TENNIS_COLORS as C} from './tennis-forms.js?v=03bcba9148dc';
import {chalkMass,chalkOutcrop} from './tennis-geology.js?v=03bcba9148dc';
function road(f,points,width,y,parent,color=C.blue){
 const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,y,z))),positions=[],indices=[];
 for(let i=0;i<=45;i++){const p=curve.getPoint(i/45),d=curve.getTangent(i/45),side=new THREE.Vector3(d.z,0,-d.x).normalize();for(const sign of [-1,1])positions.push(p.x+side.x*width*.5*sign,y,p.z+side.z*width*.5*sign);if(i<45){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();f.mesh(g,color,parent,{side:THREE.DoubleSide,surface:color===C.blue?'sport':'concrete'});return curve;
}
export function buildTennisFoundation(f,plan){
 const g=f.group('TennisAtom · Limestone canyon'),base=f.group('Elevated court geology',g);base.position.set(plan.court.x,plan.court.y,plan.court.z);base.rotation.y=plan.court.angle;base.scale.setScalar(plan.scale);
 chalkMass(f,{id:'court',contour:plan.landContour,top:-.018,bottom:-1.75,ochre:.92},base,811);
 for(const [i,x,z,size] of [[0,-4.9,-7.2,.75],[1,-4.8,.5,.85],[2,-3.9,7.5,.70],[3,3.3,8.7,.60]])chalkOutcrop(f,x,-1.15,z,size,base,310+i*17);
 if(!plan.L.mobile){const reading=f.group('Quiet white reading clearing',g);chalkMass(f,{id:'reading',contour:plan.readingContour,top:.115,bottom:-1.55,ochre:.06,spacing:.85},reading,139);}
 plan.landforms.forEach((form,i)=>{const block=f.group(form.id,g);chalkMass(f,form,block,192+i*89);});
 const bed=f.group('Incised stream and wet banks',g),positions=[],indices=[],colors=[];
 for(let i=0;i<=120;i++){
  const x=-36+i*.60,z=plan.channelZ(x),w=1.67+.13*Math.sin(x*.43);
  for(let j=0;j<5;j++){const t=(j-2)/2;positions.push(x,-.94-Math.abs(t)*.005,z+w*t);const col=new THREE.Color('#679eaa').lerp(new THREE.Color('#aac6c4'),Math.abs(t)**3*.60);col.multiplyScalar(.96+.035*Math.sin(x*.65));colors.push(col.r,col.g,col.b);}
  if(i<120)for(let j=0;j<4;j++){const a=i*5+j;indices.push(a,a+5,a+1,a+1,a+5,a+6);}
 }
 const water=new THREE.BufferGeometry();water.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));water.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));water.setIndex(indices);water.computeVertexNormals();f.mesh(water,'#ffffff',bed,{vertexColors:true,side:THREE.DoubleSide,surface:'water'});
 const random=seeded(192);
 if(!plan.L.mobile){
  // Rock clusters are part of the terrain silhouette, rather than props used to
  // conceal an otherwise featureless base. The reading interior remains clear.
  const outcrops=[[-22,-7.2,1.1],[-21,-9.5,1.6],[-17.5,-10.2,.85],[-5,-12.9,1.25],[-.9,-8.1,1.1],[-22.4,1.8,1.0],[-20,4.8,.65],[-17.4,6.45,.50],[-1.6,7.8,.65],[-1.3,8.8,.90],[21,6.4,1.1],[22,-8.4,1.5],[-25.5,10.8,.80],[-.2,15.7,.75],[24,14.9,1.3]];
  outcrops.forEach(([x,z,size],i)=>chalkOutcrop(f,x,tennisWorldHeight(x,z,plan).height-.12,z,size,g,261+i*32));
  for(let i=0;i<70;i++){const x=-28+random()*56,z=plan.channelZ(x)+(random()>.5?1:-1)*(1.85+random()*.9),y=tennisWorldHeight(x,z,plan).baseHeight;if(routeDistance(plan.routes.lowerPath,x,z)<1.2)continue;
   const rock=f.mesh(new THREE.IcosahedronGeometry(1,0),'#c6c8b8',bed,{surface:'gravel'}),s=.08+random()*.17;rock.scale.set(s*1.8,s*.8,s);rock.position.set(x,Math.max(-1.07,y)+.04,z);rock.rotation.y=random()*6.28;
  }
 }
 g.userData.geology={landforms:plan.landforms.length+2,strata:6,readingHeight:.115,waterHeight:-.94};return g;
}
export function buildTennisCampus(f,plan){
 const g=f.group('TennisAtom · Connected paths and stands'),stands=f.group('Six-row fitted amphitheatre',g);stands.position.set(plan.court.x,plan.court.y,plan.court.z);stands.rotation.y=plan.court.angle;stands.scale.setScalar(plan.scale);
 for(let row=0;row<6;row++){const h=.36*(row+1),z=-7.95-row*.59;f.box([8.25,h,.61],[0,h/2,z],C.stone,stands);f.box([8.25,.07,.51],[0,h+.035,z],C.white,stands);for(const side of [-1,1])f.box([3,.045,.23],[side*2.12,h+.089,z+.065],row%2===0?C.orange:C.white,stands);f.box([1.02,.025,.47],[0,h+.085,z],C.orange,stands);}
 for(const side of [-1,1]){f.beam([side*4.1,2.25,-11.05],[side*4.1,2.98,-11.05],.025,C.dark,stands);f.beam([side*4.1,2.94,-11.05],[side*3.65,2.94,-11.05],.022,C.dark,stands);}
 const rear=f.group('Blue upper access curve',g);rear.position.copy(stands.position);rear.rotation.y=plan.court.angle;rear.scale.setScalar(plan.scale);road(f,[[-5.1,-13],[-5.6,-11.9],[-5.55,-10.7],[-4.85,-9.1],[-4.6,-7.1]],1.2,.065,rear);
 for(const [a,b] of [[[-6.13,.72,-12.5],[-6.08,.72,-10.65]],[[-6.08,.72,-10.65],[-5.37,.72,-8.95]]])f.beam(a,b,.025,C.dark,rear);
 const [low,landing]=plan.routes.courtStair;f.stairs(low,landing,1.85*plan.scale,g,12);
 if(!plan.L.mobile){
 road(f,plan.routes.lowerPath,1.55,.165,g);
 const end=plan.routes.lowerPath.at(-1),before=plan.routes.lowerPath.at(-2),dx=end[0]-before[0],dz=end[1]-before[1],len=Math.hypot(dx,dz),side=[dz/len,-dx/len];
 for(const sign of [-1,1])f.beam([end[0]+sign*side[0]*.76,.17,end[1]+sign*side[1]*.76],[end[0]+sign*side[0]*.76,.83,end[1]+sign*side[1]*.76],.023,C.dark,g);
 f.beam([end[0]-side[0]*.76,.83,end[1]-side[1]*.76],[end[0]+side[0]*.76,.83,end[1]+side[1]*.76],.022,C.dark,g);
 const bridge=f.group('Diagonal stream footbridge',g),bx=plan.routes.bridge.x,bz=plan.channelZ(bx)+.35;bridge.position.set(bx,.22,bz);bridge.rotation.y=plan.routes.bridge.angle;f.box([1.65,.18,8.4],[0,0,0],C.white,bridge,{surface:'concrete'});
 for(const side of [-1,1]){for(let i=0;i<9;i++)f.beam([side*.8,.1,-4.05+i*1.01],[side*.8,.78,-4.05+i*1.01],.022,C.dark,bridge);for(const y of [.48,.78])f.beam([side*.8,y,-4.1],[side*.8,y,4.1],.020,'#c4ccca',bridge);for(const z of [-1.65,1.65])f.box([.16,1.3,.34],[side*.59,-.69,z],C.stone,bridge,{surface:'concrete'});}
 road(f,[[-23,3.2],[-21,3.65],[-19,4.6],[-18.2,5.3]],2,.14,g,C.white);
 const [upperLow,upperHigh]=plan.routes.upperStair;f.stairs(upperLow,upperHigh,1.85,g,16);
 }return g;
}
function cypress(f,x,y,z,h,parent,random){
 const tree=f.group('Faceted cypress',parent);tree.position.set(x,y,z);f.beam([0,0,0],[0,h*.73,0],.042,'#81765b',tree,{},.026);
 const vertices=[],indices=[],rings=[[.20,.26],[.35,.41],[.60,.36],[.85,.20],[1,.025]];
 for(let r=0;r<rings.length;r++)for(let i=0;i<7;i++){const a=i/7*Math.PI*2+r*.31,rad=rings[r][1]*(.84+random()*.26);vertices.push(Math.cos(a)*rad,h*rings[r][0],Math.sin(a)*rad);}
 for(let r=0;r<rings.length-1;r++)for(let i=0;i<7;i++){const a=r*7+i,b=r*7+(i+1)%7;indices.push(a,b,a+7,b,b+7,a+7);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();f.mesh(geo,'#647349',tree);
 for(let i=0;i<24;i++){const leaf=f.mesh(new THREE.IcosahedronGeometry(1,0),i%2?'#6d7952':'#7d8458',tree);leaf.scale.set(.12,.19,.13);leaf.position.set((random()-.5)*.49,h*(.25+random()*.62),(random()-.5)*.49);}
}
export function buildTennisPlanting(f,plan){
 const g=f.group('TennisAtom · Layered planting and boulders'),random=seeded(13191),sites=[];
 if(!plan.L.mobile)for(const [x,z] of [[-22,-7],[-18,-10.4],[-12,-12.9],[-4,-11],[0,-8.8],[-23,-1.5],[-21,3],[-19,4.8],[-15,6.8],[-10,7.8],[-6,9.3],[-.4,10.5],[1.5,8.5],[17,6.7],[23,8.3],[25,-7.5],[23,-12.5]])sites.push({x,z,h:tennisWorldHeight(x,z,plan).height});
 for(const [x,z] of [[-5.55,-12.5],[-5.1,-8.6],[-4.6,-6.7],[-4.65,-3.8],[-4.4,1.5],[-4.6,5.5],[-3.4,8.6],[.4,8.8],[3.8,8.1],[4.5,-5.5],[4.3,-9],[3.8,-12.2]]){const p=courtPoint(plan,x,.035,z);sites.push({x:p[0],z:p[2],h:p[1]});}
 if(!plan.L.mobile){for(const [x,z] of plan.readingContour){for(let i=0;i<2;i++){const px=x+(random()-.5)*1.4,pz=z+(random()-.5)*1.0;sites.push({x:px,z:pz,h:tennisWorldHeight(px,pz,plan).height})}}for(let i=0;i<17;i++){const x=-24+i*2.6,z=plan.channelZ(x)+(i%2?-2.8:2.9);sites.push({x,z,h:tennisWorldHeight(x,z,plan).height})}}
 for(let n=0;n<sites.length;n++){const {x,z,h}=sites[n];if(!plan.L.mobile&&(x>-18.5&&x<-1&&z>-7.7&&z<8.3||routeDistance(plan.routes.lowerPath,x,z)<1.10))continue;const cluster=f.group('Landscape planting group '+n,g);cluster.position.set(x,h+.025,z);if(n%4===0||n>sites.length-3)cypress(f,0,0,0,2.1+random()*1.3,cluster,random);
 for(let i=0;i<52;i++){const a=i*2.399,r=.08+random()*.70,s=.045+random()*.09,leaf=f.mesh(new THREE.IcosahedronGeometry(1,0),['#7f8749','#65733e','#969b62','#6e8045'][i%4],cluster);leaf.scale.set(s*1.7,s*1.15,s*1.4);leaf.position.set(Math.cos(a)*r,s+.13*(1-r/.8),Math.sin(a)*r);leaf.rotation.y=a;}
 for(let i=0;i<2;i++){const b=f.mesh(new THREE.IcosahedronGeometry(1,0),i%2?'#e4e4d9':'#f6f5ec',cluster),s=.10+random()*.20;b.scale.set(s*1.5,s*.8,s*1.1);b.position.set((random()-.5)*1.4,s*.20,(random()-.5)*1.2);b.rotation.set(.12,random()*3,.1);}
 }return g;
}

