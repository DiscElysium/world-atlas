import * as THREE from './vendor/three.module.js';

// A second portion of the same drafting sheet extends underneath the terrain.
// Its ink stays present after the real mountains rise and occlude it.
export function createSurroundingDraft(local,extent=150){
 const size=extent>150?4096:3072,c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),s=size/extent,X=x=>(x+extent/2)*s,Z=z=>(z+extent/2)*s;
 const paper=[[-24.5,-1.5],[-24.2,-7],[-20.8,-14.5],[-10.5,-16.3],[-2.5,-15.7],[5.7,-15.7],[13.5,-16.2],[22.2,-14.8],[24.7,-5],[24.6,6],[23.6,15.2],[17.5,17.4],[9.5,18.1],[2,18.4],[-5,18.7],[-13.2,17.8],[-18.8,7.5],[-24,5]];
 g.beginPath();g.rect(0,0,size,size);paper.forEach(([x,z],i)=>i?g.lineTo(X(x),Z(z)):g.moveTo(X(x),Z(z)));g.closePath();g.clip('evenodd');
 function line(points,alpha=.65,colour='#68848b',width=1.1,dash=[]){g.save();g.strokeStyle=colour;g.globalAlpha=alpha;g.lineWidth=width;g.setLineDash(dash);g.beginPath();points.forEach(([x,z],i)=>i?g.lineTo(X(x),Z(z)):g.moveTo(X(x),Z(z)));g.stroke();g.restore();}
 function text(value,x,z,size=14,italic=false){g.save();g.fillStyle='#53676d';g.globalAlpha=.9;g.font=`${italic?'italic ':''}${size}px ${italic?'Georgia':'Arial'}`;g.fillText(value,X(x),Z(z));g.restore();}
 const a=new THREE.Vector3(),b=new THREE.Vector3(),v=new THREE.Vector3(),hits=[];let contours=0;
 local.updateMatrixWorld(true);const toLocal=local.matrixWorld.clone().invert();g.strokeStyle='#78908d';g.lineWidth=.9;g.globalAlpha=.36;g.beginPath();
 local.traverse(o=>{
  if(!o.isMesh)return;const mats=Array.isArray(o.material)?o.material:[o.material];if(!mats.some(m=>/quiet white stone|folded stone|cut tread/i.test(m.name)))return;
  const p=o.geometry.attributes.position,index=o.geometry.index,count=index?.count??p.count;
  for(let i=0;i<count;i+=3){
   const tri=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+k):i+k).applyMatrix4(o.matrixWorld).applyMatrix4(toLocal));
   const low=Math.max(-5,Math.min(...tri.map(p=>p.y))),high=Math.min(14,Math.max(...tri.map(p=>p.y)));
   for(let level=Math.ceil(low/.65)*.65;level<high;level+=.65){
    hits.length=0;for(let e=0;e<3;e++){a.copy(tri[e]);b.copy(tri[(e+1)%3]);if((a.y<=level&&b.y>level)||(b.y<=level&&a.y>level)){v.copy(a).lerp(b,(level-a.y)/(b.y-a.y));hits.push([v.x,v.z]);}}
    if(hits.length===2){g.moveTo(X(hits[0][0]),Z(hits[0][1]));g.lineTo(X(hits[1][0]),Z(hits[1][1]));contours++;}
   }
  }
 });g.stroke();g.globalAlpha=1;
 // Section drawings and working details sit in the margins of the measured
 // maquettes. They fill the frame without covering their existing labels.
 const panels=[[-35,-13,'01 / MEMORY & SPACE'],[28,-11,'04 / WATER & TERRAIN'],[-34,7,'03 / SYSTEM STUDY'],[27,7,'06 / CHANCE & BELIEF'],[-20,-26,'02 / BODY IN MOTION'],[4,25,'05 / COLOUR NOTES']];
 for(const [x,z,label] of panels){
  text(label,x,z,15);line([[x,z+.45],[x+8,z+.45]],.65);
  for(let j=0;j<5;j++)line([[x+j*1.45,z+1.3],[x+j*1.45+1,z+1.3]],.45,'#8b9c96',.8);
 }
 // Oblivion's bridge section, not a duplicate top-down model thumbnail.
 for(let k=0;k<5;k++){
  const x=-34+k*1.3;line([[x,-7],[x,-9.7],[x+1.05,-9.7],[x+1.05,-7]],.8,'#5d7279',1.35);
  g.save();g.strokeStyle='#5d7279';g.globalAlpha=.75;g.lineWidth=1.2;g.beginPath();g.arc(X(x+.525),Z(-8),.43*s,Math.PI,0);g.stroke();g.restore();
 }line([[-35,-10.05],[-27,-10.05]],.8);text('section / five remembered arches',-35,-5.9,15,true);
 // Layered river sections on the opposite side of the sheet.
 for(let k=0;k<6;k++){
  const z=-7+k*.56;line([[28,z],[29.5,z-.7],[31,z-.3],[32.1,z+.65],[33.1,z+.75],[34.5,z-.45],[36,z-.2]],.7,'#7f9994',1.0);
 }text('cut / channel / response',28,-2.3,15,true);
 // A spatial production diagram and sparse revision marks.
 for(let k=0;k<4;k++){
  const x=-34+(k%2)*3,z=9+Math.floor(k/2)*2;line([[x,z],[x+2,z],[x+2,z+1],[x,z+1],[x,z]],.8);
  line([[x,z],[x+.35,z-.35],[x+2.35,z-.35],[x+2,z]],.7);text(['ore','refine','store','build'][k],x+.25,z+.65,12);
 }line([[-32,9.5],[-31,9.5],[-31,11.5],[-29,11.5]],.7,'#b68965',1.25);
 for(let k=0;k<4;k++){
  const x=29+k*1.5,z=10;line([[x,z],[x+1,z],[x+1,z+1],[x,z+1],[x,z]],.75,'#94816b',1.2);
  for(let j=0;j<=k;j++){g.beginPath();g.arc(X(x+.24+(j%2)*.45),Z(z+.25+Math.floor(j/2)*.45),.055*s,0,Math.PI*2);g.fillStyle='#8a7863';g.fill();}
 }text('read / doubt / challenge',28,13,15,true);
 // Motion-study loops and a measured gesture axis behind the court.
 for(let k=0;k<5;k++){
  g.save();g.translate(X(-17+k*1.4),Z(-22));g.rotate(-.45);g.strokeStyle='#af8163';g.globalAlpha=.65;g.lineWidth=1.2;g.beginPath();g.ellipse(0,0,.8*s,2.3*s,0,.15,Math.PI*1.85);g.stroke();g.restore();
 }line([[-21,-20],[-8,-20]],.6,'#7a929c',1,[10,5]);text('gesture / one action, many readings',-20,-18.3,15,true);
 for(let k=0;k<6;k++){g.fillStyle=['#be7b65','#c5a06b','#839977','#70a2a5','#a59bb4','#c4c6b6'][k];g.globalAlpha=.65;g.fillRect(X(5+k*1.25),Z(27),s*.9,s*.55);}g.globalAlpha=1;text('take the colour / leave a trace',4,29.1,16,true);
 // The field extends past every camera edge: faint survey axes, irregular
 // topographic rhythms and handwritten scale notes connect the studies.
 for(const z of [-32,-19,20,33])line([[-46,z],[44,z]],.24,'#819ba6',.8,[20,7,2,7]);
 for(const x of [-40,-26,26,40])line([[x,-36],[x,38]],.25,'#819ba6',.8,[20,7,2,7]);
 for(let k=0;k<6;k++){
  const points=[];for(let j=0;j<33;j++){const x=-46+j*2.9,z=35+k*1.7+1.6*Math.sin(x*.10+k*.27)+.8*Math.cos(x*.23);points.push([x,z]);}line(points,.42,'#8ca19b',.9);
 }
 text('FIELD ATLAS / WORKING SECTIONS',-34,23,18);text('space, movement, systems, stories',-34,24.2,17,true);
 // Taller sheets include further working sections above and below the main
 // composition. They are real marks on the same ground, later hidden by rock.
 for(const z of [-88,-72,-56,42,60,79]){
  line([[-25,z],[25,z]],.28,'#819ba6',.85,[16,6,2,6]);
  for(let k=0;k<11;k++)line([[-25+k*5,z-.3],[-25+k*5,z+.3]],.36,'#819ba6',.9);
 }
 text('FIELD NOTES / COLLECTION 01',-22,-72,23);text('six worlds, one working landscape',-22,-69.8,21,true);
 for(let k=0;k<5;k++){
  const points=[];for(let j=0;j<=36;j++){const x=-23+j*1.25,z=-57+k*1.15+1.2*Math.sin(x*.21+k*.35)+.7*Math.cos(x*.45);points.push([x,z]);}line(points,.35,'#80968b',1.2);
 }
 text('THE LANDSCAPE / PLAN STUDIES',-22,-46,23);
 text('SPACE / MOVEMENT / SYSTEMS',-22,44,23);text('from a first line to an inhabited world',-22,46.2,21,true);
 for(let k=0;k<6;k++){
  const x=-22+k*7.7,z=49;line([[x,z+5],[x,z],[x+5.2,z],[x+5.2,z+5],[x,z+5]],.55,'#71878b',1.2);
  line([[x,z],[x+1.1,z-1.2],[x+6.3,z-1.2],[x+5.2,z]],.45);line([[x+5.2,z+5],[x+6.3,z+3.8],[x+6.3,z-1.2]],.45);
  text(String(k+1).padStart(2,'0'),x+1.4,z+3.1,22);if(k<5)line([[x+6.6,z+2],[x+7.5,z+2]],.5,'#b28a6e',1.4);
 }
 text('TERRAIN / SECTION A—A',-22,62,23);
 const section=[];for(let j=0;j<25;j++){const x=-24+j*2,y=72-4*Math.abs(Math.sin(x*.16)*Math.cos(x*.37));section.push([x,y]);line([[x,y],[x,76]],.2,'#8ca19b',.8);}
 line(section,.58,'#71878b',1.4);line([[-25,76],[25,76]],.45,'#819ba6',1);
 text('KEEP THE TRACE / REVISION 03',-22,83,23);text('draw, test, rebuild, return',-22,85.2,21,true);
 const pixels=g.getImageData(0,0,size,size);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=Math.round((1-Math.pow(1-pixels.data[i]/255,1.6))*255);g.putImageData(pixels,0,0);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
 const material=new THREE.MeshBasicMaterial({map,transparent:true,opacity:0,depthWrite:false,toneMapped:false});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(extent,extent),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=-.075;mesh.name='Persistent extended drafting field';mesh.userData.surface_marking=true;mesh.renderOrder=2;
 return {mesh,contours,canvas:c,extent};
}
