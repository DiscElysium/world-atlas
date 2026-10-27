import {buildPiano} from './oblivion-piano.js?v=03bcba9148dc';
export function buildCourtyard(f,c){
 const p=c.ground(.155,c.L.mobile?.90:.875),court=f.group('OBLIVION · Piano courtyard');court.position.set(p.x,p.y,p.z);court.rotation.y=-.12;
 court.scale.setScalar(c.L.mobile?.76:.84);
 for(let i=0;i<4;i++)f.box([7.6-i*.46,.18,5.2-i*.38],[0,.09+i*.18,0],court,.55);
 const top=.72;
 for(let i=0;i<6;i++)f.segment([-3.06+i*1.22,top+.015,-1.87],[-3.06+i*1.22,top+.015,1.87],court,.23);
 for(const z of [-1.25,0,1.25])f.segment([-3.07,top+.017,z],[3.07,top+.017,z],court,.23);
 f.stairs([.9,.05,4.3],[.9,top,2.0],1.4,court,9);
 const wall=f.group('Broken pointed gateway',court);wall.position.set(-.75,top,-2.03);
 for(const x of [-2.5,2.5]){f.box([.42,2.15,.52],[x,1.07,0],wall);f.box([.63,.16,.68],[x,2.2,0],wall);f.box([.6,.17,.7],[x,.09,0],wall)}
 for(const side of [-1,1]){
  f.box([1.12,1.0,.28],[side*1.75,.5,0],wall,.47);
  for(let row=0;row<3;row++){f.segment([side*1.2,row*.33+.02,.16],[side*2.3,row*.33+.02,.16],wall,.3);for(let j=0;j<2;j++)f.box([.38,.29,.32],[side*(1.3+j*.48),1.14+(j%2)*.17,0],wall,.45)}
 }
 const arch=f.pointed(2.4,2.72,.3,.16,wall);arch.position.set(0,0,-.15);
 for(const x of [-1.31,1.31]){f.box([.27,3.15,.35],[x,1.57,0],wall);const cap=f.gable(.4,.52,.44,wall);cap.position.set(x,3.14,-.22)}
 for(const x of [-3.04,3.04]){f.box([.2,.52,3.1],[x,top+.26,.15],court,.45);for(const z of [-1.4,1.45])f.box([.37,1.22,.4],[x,top+.61,z],court,.66)}
 buildPiano(f,court);
 return court;
}
