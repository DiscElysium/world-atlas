import {groundPoint,screenPoint,CONTENT_HEIGHT} from './map-model.mjs?v=eed7fff475f6';

// Each content surface is a physical rectangle on the map, rather than a screen quad.
export function surfaceFrame(rect,L,height=CONTENT_HEIGHT+.04){
  const midU=(rect.left+rect.right)/2,midV=(rect.top+rect.bottom)/2;
  const left=groundPoint(rect.left,midV,L),right=groundPoint(rect.right,midV,L);
  const top=groundPoint(midU,rect.top,L),bottom=groundPoint(midU,rect.bottom,L);
  return{x:(left.x+right.x)/2,y:height,z:(top.z+bottom.z)/2,width:right.x-left.x,depth:bottom.z-top.z};
}

export function surfaceZone(frame,L){
  const points=[];
  for(const x of [-.5,.5])for(const z of [-.5,.5])points.push(screenPoint(frame.x+x*frame.width,CONTENT_HEIGHT,frame.z+z*frame.depth,L));
  return{left:Math.min(...points.map(p=>p.u)),right:Math.max(...points.map(p=>p.u)),top:Math.min(...points.map(p=>p.v)),bottom:Math.max(...points.map(p=>p.v))};
}

export function pickSurface(raycaster,camera,pointer,meshes){
  raycaster.setFromCamera(pointer,camera);
  // Scenery is deliberately excluded: a leaf in front never blocks a button click.
  return raycaster.intersectObjects(meshes,false)[0]?.object.userData.action??null;
}
