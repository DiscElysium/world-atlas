import * as THREE from './vendor/three.module.js';
import {groundPoint,smooth} from './map-model.mjs?v=03bcba9148dc';
import {riverX} from './terrain.mjs?v=03bcba9148dc';

function forest(c,count=90,paper=false){
 const {kit:k,random:r}=c,trunks=[],tops=[[],[],[]];
 for(let i=0;i<count;i++){const u=r()*1.16-.08,v=r()*1.15-.06;if(c.safe(u,v,1)||Math.abs(u-riverX(v,c.L.mobile))<.07)continue;const p=c.ground(u,v),s=.38+r()*.43;trunks.push({p:[p.x,p.y+s*.7,p.z],s:[.10,s*1.4,.10]});for(let a=0;a<3;a++)tops[a].push({p:[p.x,p.y+s*(1.2+a*.47),p.z],s:[s*(.73-a*.12),s*.95,s*(.73-a*.12)],a:r()*6});}
 k.batch('box',paper?'#b2a28a':'#887656',trunks);tops.forEach((items,i)=>k.batch('cone',paper?['#9dab89','#7e9378','#b8c0a0'][i]:['#7f9c7b','#98b58d','#a6c09c'][i],items));
}
function rockScatter(c,color,count=45){const items=[];for(let i=0;i<count;i++){const u=c.random()*1.16-.08,v=c.random()*1.16-.08;if(c.safe(u,v,.7))continue;const p=c.ground(u,v),s=.12+c.random()*.3;items.push({p:[p.x,p.y+s*.5,p.z],s:[s,s*.7,s],a:c.random()*6})}c.kit.batch('rock',color,items);}
function river(c,color,paper=false){
 const points=[],n=180;for(let i=0;i<=n;i++){const v=-.15+i/n*1.3,p=groundPoint(riverX(v,c.L.mobile),v,c.L);points.push(new THREE.Vector3(p.x,.18+(paper?0:2.9*(1-smooth(-.06,.20,v))),p.z));}
 const curve=new THREE.CatmullRomCurve3(points),positions=[],uv=[],indices=[];
 for(let i=0;i<=n;i++){const t=i/n,p=curve.getPoint(t),d=curve.getTangent(t),side=new THREE.Vector3(d.z,0,-d.x).normalize().multiplyScalar(.65+(paper?.08*Math.sin(i*2):.03*Math.sin(i)));for(const sign of [-1,1]){const q=p.clone().addScaledVector(side,sign);positions.push(q.x,q.y,q.z);uv.push(sign<0?0:1,t);}if(i<n){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const time={value:0},material=new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:paper?.9:.32,metalness:paper?0:.1,flatShading:paper});material.defines={USE_UV:''};material.onBeforeCompile=shader=>{shader.uniforms.uTime=time;shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <color_fragment>','#include <color_fragment>\nfloat crest=smoothstep(.89,1.,sin(vUv.y*180.-uTime*2.+sin(vUv.x*11.)*2.)); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.96),crest*.23);');};
 const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=true;c.kit.root.add(mesh);c.animate(t=>time.value=t);
 for(let i=1;i<16;i++){const p=curve.getPoint(i/17);c.kit.flat(paper?'#bacde5':'#e4f6f1',.32+.12*Math.sin(i),.055,p.x,p.y+.025,p.z);}
 return curve;
}
export function buildFlow(c){
 const k=c.kit;river(c,'#83bcb7');forest(c,145);rockScatter(c,'#b8c5b5',65);
 const glacier=c.place(c.L.mobile?.065:.365,.105);k.add('rock','#edf4f4',[1.1,.8,1.7],[0,.5,0],glacier);k.add('rock','#c9dfe4',[.65,.65,1.5],[.95,.4,-.8],glacier);
 const flowers=[];for(let i=0;i<130;i++){const v=.18+c.random()*.87,u=riverX(v,c.L.mobile)+(c.random()>.5?1:-1)*(.035+c.random()*.035);if(c.safe(u,v,.4))continue;const p=c.ground(u,v);flowers.push({p:[p.x,p.y+.11,p.z],s:[.055,.11,.055]});}k.batch('sphere','#f8f1d3',flowers);
 for(let i=0;i<8;i++){const g=c.place(.2+i*.065,.06+(i%3)*.07);g.position.y+=2.3;const a=k.box('#f5f5e9',[.36,.035,.15],[-.16,0,0],g),b=k.box('#f5f5e9',[.36,.035,.15],[.16,0,0],g);k.box('#e6dfca',[.11,.08,.22],[0,0,0],g);const x=g.position.x,z=g.position.z;c.animate(t=>{g.position.x=x+Math.sin(t*.45+i)*.65;g.position.z=z+Math.cos(t*.4+i)*.35;a.rotation.z=Math.sin(t*3+i)*.22;b.rotation.z=-a.rotation.z});}
}
function court(c,u,v,s){
 const k=c.kit,g=c.place(u,v);g.scale.setScalar(s);k.box('#2861a4',[8.1,.18,5.8],[0,.15,0],g);
 for(const x of [-3.6,3.6])k.flat('#f7f3df',.065,5.0,x,.252,0,g);for(const z of [-2.5,0,2.5])k.flat('#f7f3df',7.2,.065,0,.253,z,g);
 for(const z of [-1.5,1.5])k.flat('#f7f3df',5.5,.05,0,.253,z,g);for(const x of [-2.75,2.75])k.flat('#f7f3df',.05,5,x,.253,0,g);k.flat('#f7f3df',.04,3,0,.254,0,g);
 for(const x of [-4,4])k.bar([x,.2,0],[x,1.15,0],.055,'#f2f4ef',g);for(let i=0;i<7;i++)k.bar([-4,.42+i*.1,0],[4,.42+i*.1,0],.009,'#e8edf2',g);for(let i=0;i<23;i++)k.bar([-4+i*8/22,.4,0],[-4+i*8/22,1.05,0],.008,'#e8edf2',g);return g;
}
function athlete(c,parent,ghost=false){
 const k=c.kit,col=ghost?'#82bbd4':'#f07327',joint=ghost?'#8ec9e4':'#273b63';
 const pts=[[0,1.85,0],[0,1.45,0],[-.4,1.6,0],[-.7,1.95,-.2],[.4,1.6,0],[.8,1.85,-.5],[0,.95,0],[-.35,.45,.2],[.45,.4,-.4]];
 for(const [a,b] of [[0,1],[1,2],[2,3],[1,4],[4,5],[1,6],[6,7],[6,8]])k.bar(pts[a],pts[b],.045,joint,parent);
 k.box(col,[.6,.65,.32],[0,1.32,0],parent,ghost?{transparent:true,opacity:.38,depthWrite:false}:{});k.add('sphere',ghost?'#c1dfe7':'#efd2af',[.19,.23,.19],[0,1.93,0],parent);for(const p of pts)k.add('sphere',joint,[.07,.07,.07],p,parent);
 const racket=new THREE.Mesh(new THREE.TorusGeometry(.35,.025,5,22),k.material(ghost?'#93c6dd':'#f09b3c'));racket.position.set(1.0,2.1,-.55);racket.rotation.x=-Math.PI/3;parent.add(racket);k.bar([.8,1.85,-.5],[1,2.1,-.55],.025,joint,parent);
}
export function buildTennis(c){
 const k=c.kit;court(c,.79,.125,.72);court(c,.035,.865,.85);rockScatter(c,'#e1ded4',32);
 const player=c.place(.43,.1);athlete(c,player);for(let i=1;i<=2;i++){const g=k.group(-i*.85,0,i*.1,player);athlete(c,g,true);}
 const coords=[[.42,.12],[.55,.13],[.76,.19],[.92,.51],[.93,.77]],path=coords.map(([u,v],i)=>{const p=c.ground(u,v);return[p.x,p.y+Math.sin(i/4*Math.PI)*2.7+.6,p.z]});const {curve}=k.line(path,'#ed8831',.045);const ball=k.add('sphere','#d6e952',[.21,.21,.21]);c.animate(t=>ball.position.copy(curve.getPoint((t*.075)%1)));
 const landing=c.place(.93,.77);for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(.4+i*.23,.025,5,28),k.material('#ed7f25'));m.rotation.x=-Math.PI/2;m.position.y=.05;k.root.add(m);landing.add(m);c.animate(t=>m.scale.setScalar(1+.08*Math.sin(t*2-i)));}
 const seats=c.place(.61,.935);for(let i=0;i<3;i++)k.box(i%2?'#ed7522':'#faf7ed',[5,.3+i*.17,.55],[0,.15+i*.08,-i*.55],seats);
 for(const [u,v] of [[.08,.69],[.94,.19]]){const g=c.place(u,v);k.box('#f17925',[.85,.45,.7],[0,.23,0],g);for(let i=0;i<8;i++)k.add('sphere','#d6e653',[.1,.1,.1],[(i%4)*.18-.27,.48,Math.floor(i/4)*.22-.11],g);}
}
export function buildEngine(c){
 const k=c.kit,ship=c.place(.78,.135);ship.rotation.y=-.15;ship.scale.setScalar(.76);
 for(let x=0;x<8;x++)for(let z=0;z<5;z++){if((x===0||x===7)&&(z===0||z===4))continue;k.box((x+z)%2?'#8294b8':'#a1adcb',[.87,.2,.87],[x-3.5,.25,z-2],ship);}
 for(const z of [-2.47,2.47])k.box('#d8deec',[6.8,.12,.075],[0,.4,z],ship);
 for(const [x,z] of [[-1.5,-1.5],[1,-1.5],[-1.5,1.25]]){k.box('#d3d9e3',[1.2,1.05,1.05],[x,.88,z],ship);k.box('#2d3e5b',[.75,.2,.65],[x,1.45,z],ship);k.box('#f8a254',[.57,.3,.025],[x,.8,z+.535],ship,{emissive:'#f18437',emissiveIntensity:.6});}
 const belts=[];for(let x=-3;x<3.2;x+=.55){k.box('#283b5d',[.48,.1,.6],[x,.45,0],ship);k.box('#778da9',[.09,.11,.59],[x,.51,0],ship);belts.push(x);}
 for(let i=0;i<4;i++){const cargo=k.box('#e5c589',[.24,.24,.24],[0,.67,0],ship);c.animate(t=>cargo.position.x=((t*.65+i*1.45)%6)-3);}
 k.box('#e6e8ed',[.95,.8,1.05],[2,.87,1.35],ship);k.add('cone','#f0a2be',[.35,1,.35],[2,1.65,1.35],ship,{emissive:'#965e91',emissiveIntensity:.4});
 for(const z of [-1.6,1.6]){const engine=k.add('cylinder','#d1dded',[.45,.85,.45],[3.5,.7,z],ship);engine.rotation.z=Math.PI/2;const fire=k.add('cone','#88def8',[.36,1.1,.36],[4.4,.7,z],ship,{emissive:'#51bdff',emissiveIntensity:1.2});fire.rotation.z=Math.PI/2;c.animate(t=>fire.scale.y=1+.15*Math.sin(t*6+z));}
 const dish=k.group(-2.6,.5,-1.6,ship);k.bar([0,0,0],[0,1.2,0],.06,'#d7e1ee',dish);k.add('sphere','#d7e1ee',[.6,.15,.6],[0,1.3,0],dish);
 const crystals=c.place(.235,.105);for(let i=0;i<9;i++)k.add('cone',i%3?'#91bfdc':'#e0a6c8',[.25+.08*(i%2),1+i%3*.45,.25],[Math.cos(i*2)*.8,.6,Math.sin(i*2)*.6],crystals);
 const laser=c.place(.36,.12);k.box('#a6b4ca',[1,.5,.7],[0,.27,0],laser);k.bar([laser.position.x,laser.position.y+.65,laser.position.z],[crystals.position.x,crystals.position.y+.8,crystals.position.z],.035,'#82e8ed');
 const route=[];for(let i=0;i<9;i++){const u=.055+i*.115,v=.895+Math.sin(i*.7)*.025,p=c.ground(u,v);route.push([p.x,p.y+.35,p.z]);k.box('#92a4bf',[.45,.35,.45],[p.x,p.y+.17,p.z]);}
 const {curve}=k.line(route,'#8296b9',.21);for(let i=0;i<5;i++){const cargo=k.box('#dcbe84',[.35,.35,.35]);c.animate(t=>{cargo.position.copy(curve.getPoint((t*.045+i*.2)%1));cargo.position.y+=.21});}
 for(let i=0;i<15;i++){const u=c.random()*1.12-.06,v=c.random();if(c.safe(u,v,1.1))continue;const g=c.place(u,v),s=.6+c.random()*.7;k.add('rock','#56638d',[s,s*.65,s],[0,s*.3,0],g);if(i%2)k.add('cone',i%3?'#9bafd9':'#c69bbf',[.22,.8,.22],[.15,s*.6,0],g);}
}
export {buildGoldfish} from './scene-goldfish.js?v=03bcba9148dc';
