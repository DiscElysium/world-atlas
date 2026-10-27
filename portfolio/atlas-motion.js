import * as THREE from './vendor/three.module.js';
import {smoother} from './atlas/atelier-composition.js?v=eed7fff475f6';

export function applyProjection(camera,{width,aspect,distance,perspective=1/distance}){
 // Interpolate effective perspective strength, rather than independently
 // lerping an eye distance and a projection weight (which bunches the change).
 const k=perspective*distance,near=camera.near,far=camera.far;
 const A=-(k*(far+near)/distance+2*(1-k))/(far-near),B=-k*near/distance-(1-k)+A*near;
 camera.aspect=aspect;camera.projectionMatrix.set(2/width,0,0,0,0,2*aspect/width,0,0,0,0,A,B,0,0,-k/distance,1-k);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();camera.updateMatrixWorld();
}
export function connectPose(from,to,t,endTangent){
 const turn=smoother(.08,.98,t),scale=smoother(.05,.98,t),depth=smoother(.16,1,t),s=smoother(0,1,t);
 const pan=(endTangent-2)*t*t*t+(3-endTangent)*t*t;
 const focus=new THREE.Vector3(THREE.MathUtils.lerp(from.focus.x,to.focus.x,s),THREE.MathUtils.lerp(from.focus.y,to.focus.y,s),THREE.MathUtils.lerp(from.focus.z,to.focus.z,pan));
 const distance=1/THREE.MathUtils.lerp(1/from.distance,1/to.distance,depth);
 return{focus,quaternion:from.quaternion.clone().slerp(to.quaternion,turn),width:1/THREE.MathUtils.lerp(1/from.width,1/to.width,scale),distance,perspective:depth/to.distance,pan};
}
