import * as THREE from './vendor/three.module.js';
import {seeded} from './map-model.mjs?v=03bcba9148dc';
import {landformHeight} from './tennis-layout.mjs?v=03bcba9148dc';

function outline(points,random,spacing=1.1){
 const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/spacing);
  for(let j=0;j<n;j++){const t=j/n;out.push([a[0]+(b[0]-a[0])*t+(j?(random()-.5)*.16:0),a[1]+(b[1]-a[1])*t+(j?(random()-.5)*.16:0)]);}}
 return out;
}
function triangle(positions,colors,a,b,c,color){for(const p of[a,b,c]){positions.push(...p);colors.push(color.r,color.g,color.b);}}
function geometry(positions,colors){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;}

// A closed geological solid, with alternating fractured faces and horizontal
// shelves. The cap may remain perfectly level for reading/court surfaces.
export function chalkMass(f,form,parent,seed=1){
 const random=seeded(seed),points=outline(form.contour,random,form.spacing??1.1),n=points.length;
 const center=points.reduce((a,p)=>[a[0]+p[0]/n,a[1]+p[1]/n],[0,0]);
 const height=(x,z)=>form.relief?landformHeight(form,x,z):form.top;
 const strata=[[0,0],[.10,.025],[.52,.085],[.57,.16],[.94,.27],[1,.22]];
 const rings=points.map(([x,z],i)=>{const top=height(x,z),dx=x-center[0],dz=z-center[1],length=Math.hypot(dx,dz),unit=[dx/length,dz/length],phase=Math.sin(i*1.73)*.17;
  return strata.map(([t,expand],r)=>{const fracture=r>0&&r<5?(Math.sin(i*.77+r*.9)*.07+(random()-.5)*.07):0,ledge=r===3?.5+.5*Math.sin(i*.27):1,jag=r>0&&r<5?(random()-.5)*Math.min(.8,(top-form.bottom)*.38):0;return[x+unit[0]*(expand*(top-form.bottom)*ledge+phase*(r?1:0))+unit[1]*jag,top+(form.bottom-top)*(t+fracture),z+unit[1]*(expand*(top-form.bottom)*ledge+phase*(r?1:0))-unit[0]*jag];});});
 const walls=[],wallColors=[],caps=[],capColors=[];
 for(let i=0;i<n;i++){
  const j=(i+1)%n,expose=(.5+.5*Math.sin(points[i][0]*.57+points[i][1]*.22))<form.ochre;
  for(let r=0;r<strata.length-1;r++){
   const shelf=r===0||r===2,wet=r===4;
   const col=new THREE.Color(shelf?'#f5f2e8':wet?'#bfc2b6':expose?'#fa974d':'#e5e4d9');
   // Slow mineral variation follows the cliff, instead of alternating face colors.
   col.multiplyScalar(.94+.085*Math.sin(i*.43+r*.91));
   triangle(walls,wallColors,rings[i][r],rings[i][r+1],rings[j][r],col);
   triangle(walls,wallColors,rings[j][r],rings[i][r+1],rings[j][r+1],col.clone().multiplyScalar(.985+random()*.025));
  }
 }
 f.mesh(geometry(walls,wallColors),'#ffffff',parent,{vertexColors:true,side:THREE.DoubleSide,surface:'limestone'}).name=form.id+' · fractured strata';
 // ShapeGeometry triangulates concave reading/landing outlines correctly. Its
 // triangles are then subdivided so crags have relief without radial fan spikes.
 const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z))),flat=new THREE.ShapeGeometry(shape),p=flat.attributes.position,idx=flat.index;
 const capTri=(a,b,c,depth)=>{
  if(depth>0&&Math.max(Math.hypot(a[0]-b[0],a[2]-b[2]),Math.hypot(b[0]-c[0],b[2]-c[2]),Math.hypot(c[0]-a[0],c[2]-a[2]))>2.0){
   const mid=(x,y)=>{const px=(x[0]+y[0])/2,pz=(x[2]+y[2])/2;return[px,height(px,pz),pz];},ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);capTri(a,ab,ca,depth-1);capTri(ab,b,bc,depth-1);capTri(ca,bc,c,depth-1);capTri(ab,bc,ca,depth-1);return;
  }
  const col=new THREE.Color('#f3f1e7'),variation=form.relief?.96+random()*.065:.992+random()*.016;col.multiplyScalar(variation);triangle(caps,capColors,a,b,c,col);
 };
 for(let i=0;i<idx.count;i+=3){const vertices=[];for(let k=0;k<3;k++){const id=idx.getX(i+k),x=p.getX(id),z=-p.getY(id);vertices.push([x,height(x,z),z]);}capTri(...vertices,4);}
 f.mesh(geometry(caps,capColors),'#ffffff',parent,{vertexColors:true,side:THREE.DoubleSide,surface:form.relief?'limestone':'chalk'}).name=form.id+' · chalk cap';
 return{rings:rings.length,strata:strata.length,top:form.top,bottom:form.bottom};
}

export function chalkOutcrop(f,x,y,z,size,parent,seed=1){
 const random=seeded(seed),geo=new THREE.IcosahedronGeometry(1,0),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const px=p.getX(i),py=p.getY(i),pz=p.getZ(i);p.setXYZ(i,px*size*(1+.18*Math.sin(pz*5+seed)),Math.max(-.08,(py+.38)*size*(.7+.3*Math.sin(px*3+seed))),pz*size*.8);}
 geo.computeVertexNormals();const rock=f.mesh(geo,seed%3?'#e9e7da':'#f2efe4',parent,{surface:'limestone'});rock.name='Angular detached limestone block';rock.position.set(x,y,z);rock.rotation.y=random()*Math.PI;return rock;
}
