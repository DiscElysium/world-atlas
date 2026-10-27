import * as THREE from '../vendor/three.module.js';
import {designDraft} from './portfolio-draft.js?v=eed7fff475f6';
import {WORKTOP_VIEW} from './atelier-composition.js?v=eed7fff475f6';

// Measured plans come from the loaded geometry; the paper also carries an
// authored editorial layer. Native modelling releases remain unchanged.
const clamp=THREE.MathUtils.clamp;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const ease=x=>x*x*x*(x*(x*6-15)+10);
const V=()=>new THREE.Vector3();
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function texture(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}

function paperInkMaterial(atlas){
  const uniforms={};
  for(const [name,layer] of Object.entries(atlas.layers))uniforms['draft_'+name]={value:texture(layer)};
  for(const name of ['guides','plan','notes','fill','outline'])uniforms['reveal_'+name]={value:0};
  const material=new THREE.MeshBasicMaterial({map:atlas.texture,transparent:true,opacity:1,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,uniforms);
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_pars_fragment>',`#include <map_pars_fragment>
      uniform sampler2D draft_guides, draft_plan, draft_notes, draft_fill, draft_outline;
      uniform float reveal_guides, reveal_plan, reveal_notes, reveal_fill, reveal_outline;
      vec4 inkOver(vec4 base, vec4 ink){
        float a=ink.a+base.a*(1.-ink.a);
        return vec4((ink.rgb*ink.a+base.rgb*base.a*(1.-ink.a))/max(a,.00001),a);
      }
      float trace(float progress,float order){return smoothstep(order-.14,order+.14,progress);}
    `).replace('#include <map_fragment>',`
      float order=.18+.64*(vMapUv.x*.6+(1.-vMapUv.y)*.4);
      vec4 guides=texture2D(draft_guides,vMapUv); guides.a*=trace(reveal_guides,order);
      vec4 plan=texture2D(draft_plan,vMapUv); plan.a*=trace(reveal_plan,order);
      vec4 notes=texture2D(draft_notes,vMapUv); notes.a*=trace(reveal_notes,order);
      vec4 fill=texture2D(draft_fill,vMapUv); fill.a*=reveal_fill;
      vec4 outline=texture2D(draft_outline,vMapUv); outline.a*=reveal_outline;
      vec4 ink=inkOver(inkOver(inkOver(inkOver(guides,plan),notes),fill),outline);
      diffuseColor*=ink;
    `);
  };
  material.customProgramCacheKey=()=> 'portfolio-registered-ink-v2';
  return {material,uniforms};
}

function planAtlas(renderer,entries,root){
  const box=new THREE.Box3();entries.filter(e=>e.index<6).forEach(e=>box.union(e.box));
  const bounds={x0:box.min.x-3,x1:box.max.x+3,z0:box.min.z-3,z1:box.max.z+3};
  const width=bounds.x1-bounds.x0,height=bounds.z1-bounds.z0;
  const w=2400,h=Math.round(w*height/width),atlas=canvas(w,h),ctx=atlas.getContext('2d');
  const capture=new THREE.Scene(),labels=new THREE.Scene(),labelProjects=new Set(),reservations=[],top=new THREE.OrthographicCamera(-width/2,width/2,height/2,-height/2,.1,180);
  top.position.set((bounds.x0+bounds.x1)/2,80,(bounds.z0+bounds.z1)/2);top.up.set(0,0,-1);top.lookAt(top.position.x,0,top.position.z);
  const temporary=[];
  for(const e of entries.filter(e=>e.index<6))for(const root of e.groups){
    root.updateWorldMatrix(true,true);
    root.traverse(o=>{
      if(!o.isMesh||!o.visible)return;
      const materials=Array.isArray(o.material)?o.material:[o.material];
      if(materials.every(m=>m.transparent||m.transmission>0))return;
      const mats=materials.map(m=>{const mm=new THREE.MeshBasicMaterial({color:m.color?.clone()||new THREE.Color('#8b9898'),map:m.map,side:THREE.DoubleSide});temporary.push(mm);return mm;});
      const mesh=new THREE.Mesh(o.geometry,Array.isArray(o.material)?mats:mats[0]);mesh.matrixAutoUpdate=false;mesh.matrix.copy(o.matrixWorld);capture.add(mesh);
    });
  }
  // Reuse the authored flat labels so names match the finished scene exactly,
  // including their type, colour, Chinese subtitles and position on the paper.
  root.traverse(o=>{
    if(!o.isMesh||!['project_title','project_subtitle'].includes(o.userData.label_role)||!Number.isInteger(o.userData.label_index)||o.userData.label_index>=6)return;
    const source=Array.isArray(o.material)?o.material:[o.material],mats=source.map(m=>{
      const copy=new THREE.MeshBasicMaterial({color:m.color?.clone()||new THREE.Color('#41555b'),map:m.map,alphaMap:m.alphaMap,alphaTest:m.alphaTest,transparent:m.transparent,opacity:m.opacity,side:THREE.DoubleSide});temporary.push(copy);return copy;
    });
    const mesh=new THREE.Mesh(o.geometry,Array.isArray(o.material)?mats:mats[0]);mesh.matrixAutoUpdate=false;mesh.matrix.copy(o.matrixWorld);labels.add(mesh);labelProjects.add(o.userData.label_index);
    reservations.push(new THREE.Box3().setFromObject(o));
  });
  const oldTarget=renderer.getRenderTarget(),oldClear=renderer.getClearColor(new THREE.Color()),oldAlpha=renderer.getClearAlpha(),oldShadow=renderer.shadowMap.enabled,oldTone=renderer.toneMapping;
  const rt=new THREE.WebGLRenderTarget(w,h,{depthBuffer:true}),normal=new THREE.MeshNormalMaterial({side:THREE.DoubleSide});
  const normals=new Uint8Array(w*h*4),colors=new Uint8Array(w*h*4),letterPixels=new Uint8Array(w*h*4);
  renderer.shadowMap.enabled=false;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearColor(0xffffff,0);renderer.setRenderTarget(rt);
  renderer.render(capture,top);renderer.readRenderTargetPixels(rt,0,0,w,h,colors);
  capture.overrideMaterial=normal;renderer.render(capture,top);renderer.readRenderTargetPixels(rt,0,0,w,h,normals);
  renderer.render(labels,top);renderer.readRenderTargetPixels(rt,0,0,w,h,letterPixels);
  renderer.setRenderTarget(oldTarget);renderer.setClearColor(oldClear,oldAlpha);renderer.shadowMap.enabled=oldShadow;renderer.toneMapping=oldTone;
  rt.dispose();normal.dispose();temporary.forEach(m=>m.dispose());
  const image=ctx.createImageData(w,h),out=image.data;
  let inkPixels=0;
  // Hidden lines are removed by the depth buffer before the pencil is drawn.
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
    const i=(y*w+x)*4,j=((h-1-y)*w+x)*4;
    let n=0,c=0,a=0;
    for(const off of [-8,8,-w*8,w*8]){
      a=Math.max(a,Math.abs(normals[i+3]-normals[i+off+3])/255);
      for(let k=0;k<3;k++){
        n=Math.max(n,Math.abs(normals[i+k]-normals[i+off+k])/255);
        c=Math.max(c,Math.abs(colors[i+k]-colors[i+off+k])/255);
      }
    }
    // Give silhouettes the strongest line. Soft, sparse interior edges keep
    // faceted mountains from turning into a dense triangulated wireframe.
    const edge=Math.max(a*.94,smooth(.14,.64,n)*.34,smooth(.15,.7,c)*.52);
    const grain=.66+.34*((Math.imul(x,127)+Math.imul(y,311))%97)/97;
    const alpha=Math.min(.8,edge)*grain;
    if(alpha>.08)inkPixels++;
    out[j]=65;out[j+1]=82;out[j+2]=82;out[j+3]=Math.round(alpha*255);
  }
  ctx.putImageData(image,0,0);
  const pencil=ctx.getImageData(0,0,w,h);for(let i=3;i<pencil.data.length;i+=4)pencil.data[i]=Math.round((1-Math.pow(1-pencil.data[i]/255,1.8))*255);ctx.putImageData(pencil,0,0);
  const labelCanvas=canvas(w,h),labelContext=labelCanvas.getContext('2d'),letterImage=labelContext.createImageData(w,h);
  const toSrgb=value=>value<=.0031308?value*12.92:1.055*Math.pow(value,1/2.4)-.055;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const from=(y*w+x)*4,to=((h-1-y)*w+x)*4,alpha=letterPixels[from+3]/255;if(!alpha)continue;
    for(let k=0;k<3;k++)letterImage.data[to+k]=Math.round(toSrgb(Math.min(1,letterPixels[from+k]/255/alpha))*255);
    letterImage.data[to+3]=letterPixels[from+3];
  }
  labelContext.putImageData(letterImage,0,0);
  const draft=designDraft({plan:atlas,labels:labelCanvas,entries,bounds,width,height,reservations});
  return {...draft,texture:texture(draft.canvas),bounds,width,height,inkPixels,labelProjects:[...labelProjects].sort().map(index=>entries[index].project.title)};
}

function paperFaces(root,atlas){
  const positions=[],uv=[],a=V(),b=V(),c=V(),n=V(),ab=V(),ac=V(),triangles=[],levels=new Map();let datum=0,found=0;
  root.updateMatrixWorld(true);
  root.traverse(o=>{
    if(!o.isMesh)return;
    const mats=Array.isArray(o.material)?o.material:[o.material];
    let component=o;while(component&&!['M01','F01'].includes(component.userData.component_id))component=component.parent;
    if(!component&&!mats.some(m=>/ivory paper surface|ivory workplane|drafting paper surface/i.test(m.name)))return;
    const g=o.geometry,p=g.attributes.position,index=g.index;
    for(let t=0;t<(index?index.count:p.count);t+=3){
      const ids=[0,1,2].map(k=>index?index.getX(t+k):t+k);
      a.fromBufferAttribute(p,ids[0]).applyMatrix4(o.matrixWorld);b.fromBufferAttribute(p,ids[1]).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(p,ids[2]).applyMatrix4(o.matrixWorld);
      n.crossVectors(ab.subVectors(b,a),ac.subVectors(c,a)).normalize();
      if(n.y<.97||Math.max(a.y,b.y,c.y)-Math.min(a.y,b.y,c.y)>.05)continue;
      const key=Math.round(a.y*1000),area=ab.cross(ac).length()/2;
      levels.set(key,(levels.get(key)||0)+area);triangles.push({key,points:[a.clone(),b.clone(),c.clone()]});
    }
  });
  const dominant=[...levels].sort((a,b)=>b[1]-a[1])[0]?.[0];
  for(const triangle of triangles){if(triangle.key!==dominant)continue;datum=triangle.points[0].y;found++;for(const v of triangle.points){positions.push(v.x,v.y+.018,v.z);uv.push((v.x-atlas.bounds.x0)/atlas.width,1-(v.z-atlas.bounds.z0)/atlas.height);}}
  if(!found)throw Error('No horizontal drafting paper was found; geometry was left unchanged.');
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  const {material,uniforms}=paperInkMaterial(atlas);
  const mesh=new THREE.Mesh(g,material);mesh.name='Registered pencil plan / runtime surface';mesh.renderOrder=3;mesh.userData.surface_marking=true;
  return {mesh,datum,triangles:found,uniforms};
}

export function createPortfolioIntro({renderer,scene,root,camera,entries,homePosition,homeTarget,getHomeWidth,getAspect,render,restoreHome,onReplay,reduced=false,scrollControlled=false}){
  const started=performance.now(),atlas=planAtlas(renderer,entries,root),surface=paperFaces(root,atlas);scene.add(surface.mesh);
  const controls=document.createElement('div');controls.className='folio-intro-controls';controls.innerHTML='<small>01 — 03</small><button type="button">跳过开场 ↗</button>';document.body.append(controls);
  const button=controls.querySelector('button'),caption=document.createElement('div');caption.className='folio-intro-caption';caption.innerHTML='SELECTED WORLDS<span>从纸面，走入六个世界。</span>';document.body.append(caption);
  const labels=[];
  root.traverse(o=>{
    if(!o.isMesh)return;
    for(let p=o;p;p=p.parent)if(Number.isInteger(p.userData.project_index))return;
    const source=Array.isArray(o.material)?o.material:[o.material];
    if(!o.userData.label_role&&!/^Drafted_.*project_(title|number)/i.test(o.name)&&!(o.userData.surface_marking&&source.some(m=>m.name.startsWith('label-'))))return;
    const fading=source.map(m=>{const c=m.clone();c.transparent=true;c.depthWrite=false;return c;});
    labels.push({mesh:o,original:o.material,fading:Array.isArray(o.material)?fading:fading[0],materials:fading,opacity:source.map(m=>m.opacity)});
  });
  const projectWrappers=entries.filter(e=>e.index<6).map(e=>{const wrapper=new THREE.Group();wrapper.name='Opening growth / '+e.project.id;scene.add(wrapper);for(const g of e.groups)wrapper.attach(g);return wrapper;});
  // Keep the complete architecture separately switchable for the registered
  // blueprint pass. Geometry and every model's proportions remain unchanged.
  const staticMeshes=[];root.traverse(o=>{
    if(!o.isMesh)return;
    // Later worktops retain selectable project roots as well. Reparenting
    // their meshes into the terrain would break direct model selection.
    for(let parent=o;parent;parent=parent.parent)if(Number.isInteger(parent.userData.project_index))return;
    const materials=Array.isArray(o.material)?o.material:[o.material];
    if(!materials.every(m=>/r(?:66|68).*(?:white stone|folded stone|cut tread)/i.test(m.name)))return;
    staticMeshes.push(o);
  });
  const architecture=new THREE.Group();architecture.name='Opening terrain growth / loaded geometry';scene.add(architecture);for(const m of staticMeshes)architecture.attach(m);
  let materialization=0;
  let active=true,playing=!scrollControlled,elapsed=0,last=null,shadowsAt=-1;
  const duration=9.4,dummy=new THREE.PerspectiveCamera();
  dummy.position.copy(homePosition);dummy.up.set(0,1,0);dummy.lookAt(homeTarget);const q1=dummy.quaternion.clone();
  // The opening starts at the final scale and nearly the final angle. Only
  // a six-degree turn separates the drawing from the completed worktop.
  const q0=q1.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...WORKTOP_VIEW.turn)));
  const distance=homePosition.distanceTo(homeTarget);
  function apply(seconds){
    elapsed=clamp(seconds,0,duration);active=elapsed<duration;const tilt=ease(clamp((elapsed-1.6)/7.5,0,1));
    document.body.classList.toggle('portfolio-opening',active&&(scrollControlled||elapsed<8.55));
    button.textContent=active?'跳过开场 ↗':'重看开场';caption.style.opacity=String(1-smooth(7.7,8.5,elapsed));
    controls.querySelector('small').textContent=elapsed<1.4?'01 / LETTERING':elapsed<4.3?'02 / DRAWING':'03 / WORLDS';
    surface.uniforms.reveal_fill.value=1-smooth(1.05,3.15,elapsed);
    surface.uniforms.reveal_outline.value=smooth(.9,2.6,elapsed);
    surface.uniforms.reveal_guides.value=smooth(.85,2.75,elapsed);
    surface.uniforms.reveal_plan.value=smooth(1.45,3.8,elapsed);
    surface.uniforms.reveal_notes.value=smooth(2.35,4.25,elapsed);
    const contextOpacity=ease(clamp((elapsed-5.7)/3.5,0,1));materialization=contextOpacity;
    root.visible=contextOpacity>0;
    const labelOpacity=smooth(3.5,4.25,elapsed);
    for(const label of labels){label.mesh.material=labelOpacity===1?label.original:label.fading;label.materials.forEach((m,i)=>m.opacity=label.opacity[i]*labelOpacity);}
    for(let i=0;i<projectWrappers.length;i++){
      projectWrappers[i].visible=contextOpacity>0;projectWrappers[i].scale.y=1;projectWrappers[i].position.y=0;
    }
    // The same ink surface stays under the complete final geometry. The
    // compositor reveals complete volumes and shadows with one coverage;
    // it neither stretches models nor slices through roofs and mountain peaks.
    architecture.visible=contextOpacity>0;architecture.scale.y=1;architecture.position.y=0;
    camera.quaternion.slerpQuaternions(q0,q1,tilt);camera.position.set(0,0,distance).applyQuaternion(camera.quaternion).add(homeTarget);
    const aspect=getAspect?.()??innerWidth/innerHeight,width=getHomeWidth();
    camera.left=-width/2;camera.right=width/2;camera.top=width/(2*aspect);camera.bottom=-camera.top;camera.clearViewOffset();camera.updateProjectionMatrix();
    if(shadowsAt<0||elapsed>5.7&&elapsed-shadowsAt>.065||!active){renderer.shadowMap.needsUpdate=true;shadowsAt=elapsed;}
    if(!active){playing=false;restoreHome();}
  }
  function seek(seconds){playing=false;last=null;shadowsAt=-1;renderer.shadowMap.needsUpdate=true;apply(seconds);render();return state();}
  function replay(){onReplay?.();restoreHome();elapsed=0;last=null;shadowsAt=-1;playing=true;apply(0);render();}
  function skip(){playing=false;last=null;apply(duration);render();}
  const initializationMs=Math.round(performance.now()-started);
  function state(){return {elapsed,duration,active,playing,scrollControlled,contextOpacity:materialization,stage:elapsed<1.6?'cover':elapsed<4.25?'drawing':elapsed<=5.7?'complete-draft':active?'emergence':'complete',growth:projectWrappers.map(()=>Math.max(.0001,materialization)),modelScaleY:projectWrappers.map(g=>g.scale.y),emergenceMode:'same-camera-complete-volume-and-shadow-blend',surfaceTriangles:surface.triangles,paperDatum:surface.datum,atlasBounds:atlas.bounds,inkPixels:atlas.inkPixels,projectLabels:atlas.labelProjects,drawingFade:surface.uniforms.reveal_plan.value,drawingLayers:Object.fromEntries(['guides','plan','notes'].map(key=>[key,surface.uniforms['reveal_'+key].value])),drawingTransition:'layered-reveal-then-persistent',initializationMs,cameraDirection:camera.getWorldDirection(V()).toArray(),cameraWidth:camera.right-camera.left,cameraDistance:camera.position.distanceTo(homeTarget),cameraRotationDegrees:THREE.MathUtils.radToDeg(camera.quaternion.angleTo(q1)),titleStyle:'original-italic-serif-on-paper',titleFill:surface.uniforms.reveal_fill.value,titleOutline:surface.uniforms.reveal_outline.value,titleFont:atlas.design.titleFont,draftDesign:atlas.design,surface:{mesh:surface.mesh.uuid,texture:atlas.texture.uuid,opacity:surface.mesh.material.opacity,visible:surface.mesh.visible},modelSource:'live-loaded-geometry'};}
  function exportSurface(){return atlas.canvas.toDataURL('image/png');}
  button.addEventListener('click',()=>active?skip():replay());
  document.addEventListener('visibilitychange',()=>{last=null;});
  const api={seek,replay,skip,state,get materialization(){return materialization;},withDraftOnly(fn){const nodes=[root,architecture,...projectWrappers],visibility=nodes.map(o=>o.visible);nodes.forEach(o=>o.visible=false);try{return fn();}finally{nodes.forEach((o,i)=>o.visible=visibility[i]);}},get active(){return active;},get playing(){return playing;},tick(time){if(!active)return false;if(playing&&!document.hidden){if(last!==null)elapsed+=Math.min((time-last)/1000,.10);last=time;}apply(elapsed);render();return true;},resize(){if(active){apply(elapsed);render();}},exportPlan(){return atlas.canvas.toDataURL('image/png');},exportSurface,exportLayer(name){if(!atlas.layers[name])throw Error('Unknown drawing layer');return atlas.layers[name].toDataURL('image/png');}};
  window.__PORTFOLIO_INTRO__=api;
  const params=new URLSearchParams(location.search),time=params.get('introTime');
  if(scrollControlled)seek(0);else if(reduced||location.hash||params.get('intro')==='skip'||params.has('study'))skip();else if(time!==null)seek(Number(time)||0);else apply(0);
  return api;
}
