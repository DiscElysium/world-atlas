import * as THREE from '../vendor/three.module.js';
import {flowPlan,flowSurface} from './plan.mjs?v=eed7fff475f6';
import {smooth,seeded} from '../map-model.mjs?v=eed7fff475f6';
import {FLOW_COLORS as C} from './palette.mjs?v=eed7fff475f6';
import {rebuildAdaptiveTerrainMesh} from './adaptive-mesh.mjs?v=eed7fff475f6';
export const FLOW_TERRAIN_MODULES=[{id:'lowlands',name:'浅色台地'},{id:'massif',name:'主雪峰与肩脊'},{id:'north-ridge',name:'北侧山脊'},{id:'northeast',name:'东北次峰'},{id:'east-rim',name:'东侧岩坡'},{id:'foreland',name:'层叠前景低丘'},{id:'valley',name:'融水河谷'},{id:'coast',name:'海岸浅滩'},{id:'seabed',name:'海床'}];
const colors=Object.fromEntries(Object.entries(C).filter(([,v])=>typeof v==='string').map(([k,v])=>[k,new THREE.Color(v)]));
export function flowFaceColor(s,h,slope,x,z){
 const n=.42*Math.sin(x*.91+z*.73)+.24*Math.cos(x*1.37-z*1.17),relief=s.rawHeight??s.relief??h,grass=Math.max(s.wet*.91,smooth(.22,.75,h)*(1-smooth(1.0,2.7,relief))*.72)*(1-s.white*.95);
 const col=colors.plain.clone().lerp(colors.meadow,.19+.08*n).lerp(colors.green,grass);
 const rock=Math.min(1,smooth(.75+n*.08,2.7+n*.18,relief)*.96+smooth(.30,.76,slope)*smooth(.35,1.6,relief)*.50),rockColor=colors.rock.clone().lerp(colors.rockLight,.18+.12*n).lerp(colors.rockDark,smooth(.25,.80,slope)*.28);
 col.lerp(rockColor,rock*(1-s.white));
 const line=s.geology==='northeast'?2.7:4.15,snow=smooth(line-.20+n*.20,line+.85+n*.20,relief)*(1-smooth(.65,.95,slope)*.24)*(s.geology==='massif'?1-smooth(2.4,4.8,s.summitDistance??0):1);
 col.lerp(colors.snowShade.clone().lerp(colors.snow,.93),snow).lerp(colors.ivory,s.white);
 return col;
}
export function flowFaceRegion(s,h){return s.white>.7?'ivory':s.rawHeight>4.7?'snow':s.rawHeight>1.5?'rock':s.wet>.4?'green':'plain';}
export function buildFlowTerrain(L){
 const plan=flowPlan(L),root=new THREE.Group();root.name='FLOW · measured geological landscape V08';
 const modules=FLOW_TERRAIN_MODULES.map(d=>{const g=new THREE.Group();g.name='FLOW · '+d.name;g.userData={moduleId:d.id,name:d.name};root.add(g);return g;});
 const buckets=modules.map(()=>({p:[],c:[]})),width=L.mobile?257:449,height=Math.round((width-1)*plan.span/56)+1,{left,right,top,bottom}=plan.bounds,random=seeded(648701),heights=new Float32Array(width*height);
 for(let j=0;j<height;j++)for(let i=0;i<width;i++)heights[j*width+i]=flowSurface(left+i/(width-1)*(right-left),top+j/(height-1)*(bottom-top),plan,false).height;
 const adaptive=rebuildAdaptiveTerrainMesh({width,height,heights,worldSizeX:56,worldSizeZ:plan.span,maxError:L.mobile?.028:.018,preserveBoundary:true}),pos=adaptive.positions;
 function emit(a,b,c,slope,depth=0){const x=(a[0]+b[0]+c[0])/3,z=(a[2]+b[2]+c[2])/3,h=(a[1]+b[1]+c[1])/3,s=flowSurface(x,z,plan,false),qs=[a,b,c],limit=s.shore<0?2.0:s.white>.75?(L.mobile?1.15:.55):1.1,edges=qs.map((q,k)=>Math.hypot(q[0]-qs[(k+1)%3][0],q[2]-qs[(k+1)%3][2])),long=edges.indexOf(Math.max(...edges));
  if(edges[long]>limit&&depth<9){const q=qs[long],r=qs[(long+1)%3],third=qs[(long+2)%3],middle=q.map((v,k)=>(v+r[k])/2);emit(q,middle,third,slope,depth+1);emit(middle,r,third,slope,depth+1);return;}
  const bucket=buckets[s.block-1],col=flowFaceColor(s,h,slope,x,z).multiplyScalar(.975+random()*.05);
  // A flat normal AND identical vertex colors: no interpolation inside a facet.
  for(const q of qs){bucket.p.push(...q);bucket.c.push(col.r,col.g,col.b);}
 }
 for(let i=0;i<pos.length;i+=9){emit(Array.from(pos.slice(i,i+3)),Array.from(pos.slice(i+3,i+6)),Array.from(pos.slice(i+6,i+9)),adaptive.triangleSlopes[i/9]);
 }
 const meshes=[];buckets.forEach((b,i)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));g.computeVertexNormals();const m=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,metalness:0}),mesh=new THREE.Mesh(g,m);mesh.name=modules[i].name+' · shared terrain vertices';mesh.castShadow=true;mesh.receiveShadow=true;modules[i].add(mesh);modules[i].userData.triangles=b.p.length/9;modules[i].userData.modeledParts=b.p.length/9;meshes.push(mesh);});
 root.userData={source:'Island II measured Fitz Roy bedrock',sourceGrid:257,version:8,triangles:buckets.reduce((sum,b)=>sum+b.p.length/9,0),adaptiveTriangles:adaptive.topology.triangleCount,maxError:adaptive.topology.measuredMaxError,grid:[width,height],perFaceColor:true};return{root,modules,meshes,plan};
}
