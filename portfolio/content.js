import * as THREE from './vendor/three.module.js';
import {surfaceFrame,surfaceZone} from './content-layout.mjs?v=eed7fff475f6';

export async function loadArtwork(image){
  const texture=await new THREE.TextureLoader().loadAsync(image.currentSrc||image.src);
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}

function canvasFor(element){
  const rect=element.getBoundingClientRect(),scale=Math.min(3,3072/Math.max(rect.width,rect.height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(rect.width*scale);canvas.height=Math.ceil(rect.height*scale);
  const ctx=canvas.getContext('2d');ctx.scale(scale,scale);
  return{canvas,ctx,rect};
}

// Rasterize the live typography once at high resolution; WebGL draws it after that.
export function copyCanvas(element){
  const {canvas,ctx,rect}=canvasFor(element),walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
  ctx.textBaseline='alphabetic';
  while(walker.nextNode()){
    const node=walker.currentNode,style=getComputedStyle(node.parentElement);
    ctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;ctx.fillStyle=style.color;
    let index=0;
    for(const glyph of node.textContent){
      const range=document.createRange();range.setStart(node,index);index+=glyph.length;range.setEnd(node,index);
      const box=range.getBoundingClientRect();if(box.width===0||box.height===0||!glyph.trim())continue;
      const ascent=ctx.measureText(glyph).fontBoundingBoxAscent??parseFloat(style.fontSize)*.88;
      ctx.fillText(glyph,box.left-rect.left,box.top-rect.top+ascent);
    }
  }
  const marker=element.querySelector('.eyebrow span');
  if(marker){const box=marker.getBoundingClientRect();ctx.fillStyle='#a8b0ae';ctx.fillRect(box.right-rect.left-1,box.top-rect.top,1,box.height)}
  return canvas;
}

export function buttonCanvas(element){
  const {canvas,ctx,rect}=canvasFor(element),style=getComputedStyle(element);
  const flow=element.closest('[data-project="flow"]');
  ctx.fillStyle=style.backgroundColor;ctx.beginPath();ctx.roundRect(0,0,rect.width,rect.height,flow?1:8);ctx.fill();
  if(!flow){ctx.strokeStyle=style.borderColor;ctx.lineWidth=1.5;ctx.stroke();}
  ctx.font=`600 ${style.fontSize} ${style.fontFamily}`;ctx.fillStyle='#fffdf2';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(element.textContent.trim(),rect.width/2,rect.height/2);
  return canvas;
}

function roundedShape(width,depth,radius){
  const x=-width/2,y=-depth/2,r=Math.min(radius,width/2,depth/2),s=new THREE.Shape();
  s.moveTo(x+r,y);s.lineTo(x+width-r,y);s.quadraticCurveTo(x+width,y,x+width,y+r);
  s.lineTo(x+width,y+depth-r);s.quadraticCurveTo(x+width,y+depth,x+width-r,y+depth);
  s.lineTo(x+r,y+depth);s.quadraticCurveTo(x,y+depth,x,y+depth-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}

export function createPortfolioContent(L,spec,artwork,anisotropy=8,project=null){
  const root=new THREE.Group();root.name='Portfolio content · real scene surfaces';
  const ownedTextures=[],interactive=[],frames={};
  function texture(canvas){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=anisotropy;ownedTextures.push(t);return t}
  artwork.anisotropy=anisotropy;
  if(project?.id==='flow'){artwork.offset.set(0,.10);artwork.repeat.set(1,.79);}
  function surface(name,frame,map,transparent=false){
    const material=['oblivion','flow'].includes(project?.id)?new THREE.MeshBasicMaterial({map,transparent,alphaTest:transparent?.025:0,toneMapped:false}):new THREE.MeshStandardMaterial({map,roughness:1,metalness:0,transparent,alphaTest:transparent?.025:0,emissive:'#ffffff',emissiveMap:map,emissiveIntensity:.26});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(frame.width,frame.depth),material);
    mesh.name=name;mesh.rotation.x=-Math.PI/2;mesh.position.set(frame.x,frame.y,frame.z);mesh.receiveShadow=true;root.add(mesh);frames[name]=frame;return mesh;
  }
  const copyFrame=surfaceFrame(spec.copy.rect,L),buttonFrame=surfaceFrame(spec.button.rect,L,project?.id==='flow'?.222:.35),artFrame=surfaceFrame(spec.art.rect,L,project?.id==='flow'?.207:.265);
  surface('project-copy',copyFrame,texture(spec.copy.canvas),true);
  const captionFrame=spec.caption?surfaceFrame(spec.caption.rect,L,.215):null;
  if(captionFrame)captionFrame.z=Math.max(captionFrame.z,artFrame.z+artFrame.depth/2+captionFrame.depth/2+.22);
  if(captionFrame)surface('art-caption',captionFrame,texture(spec.caption.canvas),true);
  const art=surface('project-art',artFrame,artwork,!!artwork.userData?.tennisPortrait);art.material.color.setScalar(['oblivion','tennis','flow'].includes(project?.id)?1:.72);if(artwork.userData?.tennisPortrait){art.material.emissiveIntensity=0;art.material.depthWrite=false;}art.userData.action=project?{id:project.id,kind:'art'}:'art';interactive.push(art);
  if(project?.crop){const uv=art.geometry.attributes.uv;const corners=[project.crop[0],project.crop[1],project.crop[3],project.crop[2]];corners.forEach(([x,y],i)=>uv.setXY(i,x/1672,1-y/941));uv.needsUpdate=true;}
  const backing=new THREE.Mesh(new THREE.BoxGeometry(artFrame.width+.14,.09,artFrame.depth+.14),new THREE.MeshStandardMaterial({color:'#f7f7ec',roughness:1}));
  const artRim=null;
  if(artRim)backing.add(artRim);
  backing.position.set(artFrame.x,.207,artFrame.z);backing.castShadow=!['tennis','flow'].includes(project?.id);backing.receiveShadow=true;backing.visible=!['tennis','flow'].includes(project?.id);root.add(backing);
  const button=surface('project-button',buttonFrame,texture(spec.button.canvas),true);button.userData.action=project?{id:project.id,kind:'project'}:'project';interactive.push(button);
  const body=new THREE.Mesh(new THREE.ExtrudeGeometry(roundedShape(buttonFrame.width,buttonFrame.depth,.2),{depth:.12,bevelEnabled:true,bevelSize:.015,bevelThickness:.012,bevelSegments:2,steps:1}),new THREE.MeshStandardMaterial({color:project?.accent??'#446c58',roughness:.9}));
  body.rotation.x=-Math.PI/2;body.position.set(buttonFrame.x,project?.id==='flow'?.173:.193,buttonFrame.z);body.castShadow=project?.id!=='flow';body.receiveShadow=true;if(project?.id==='flow'){body.material.dispose();body.material=new THREE.MeshBasicMaterial({color:project.accent,toneMapped:false});body.scale.z=1/3;}root.add(body);
  const ring=new THREE.Mesh(new THREE.ShapeGeometry(roundedShape(buttonFrame.width+.16,buttonFrame.depth+.16,.39)),new THREE.MeshBasicMaterial({color:project?.id==='oblivion'?'#ffffff':'#f2db9b',toneMapped:project?.id!=='oblivion'}));
  ring.rotation.x=-Math.PI/2;ring.position.set(buttonFrame.x,.302,buttonFrame.z);ring.visible=false;root.add(ring);
  const copyZone=surfaceZone(copyFrame,L),buttonZone=surfaceZone(buttonFrame,L);
  const zones=[{left:Math.min(copyZone.left,buttonZone.left),right:Math.max(copyZone.right,buttonZone.right),top:copyZone.top,bottom:buttonZone.bottom},surfaceZone(artFrame,L)];
  if(captionFrame){const captionZone=surfaceZone(captionFrame,L);zones[1].bottom=Math.max(zones[1].bottom,captionZone.bottom);}
  root.updateMatrixWorld(true);
  return{root,interactive,zones,frames,setHighlight(action){const kind=typeof action==='string'?action:action?.kind;ring.visible=kind==='project';button.material.color.set(kind==='project'?'#eeeeee':'#ffffff');if(artRim)artRim.material.opacity=kind==='art'?1:.6;if('emissiveIntensity' in art.material)art.material.emissiveIntensity=kind==='art'?.4:.26;},dispose(){root.traverse(obj=>{if(obj.isMesh||obj.isLine){obj.geometry.dispose();obj.material.dispose()}});ownedTextures.forEach(t=>t.dispose())}};
}
