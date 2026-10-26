import {TENNIS_COLORS as C} from './tennis-forms.js';

export function buildTennisTrajectories(f,plan,animate){
 const g=f.group('TennisAtom · Ball path and motion accents'),s=plan.scale,c=plan.court;
 const at=(x,y,z)=>[c.x+s*(Math.cos(c.angle)*x+Math.sin(c.angle)*z),c.y+y*s,c.z+s*(-Math.sin(c.angle)*x+Math.cos(c.angle)*z)];
 const flight=[at(1.3,1.77,3.6),at(1.7,2.6,1.7),at(1.25,2.7,-1.0),at(.5,1.5,-3.9),at(.20,.29,-5.0)];
 const {curve}=f.ribbon(flight,'#eecb40',.031*s,g,{emissive:'#d3a931',emissiveIntensity:.16});
 const ball=f.ball(.10*s,flight[0],C.lime,g);ball.userData.dynamic=true;
 animate?.(t=>ball.position.copy(curve.getPoint((t*.1+.15)%1)));
 const impact=at(.2,.144,-5);for(let i=0;i<3;i++){const ring=f.ring((.23+i*.18)*s,.010*s,'#e5c544',g);ring.position.set(...impact);}
 const arc=[];for(let i=0;i<32;i++){const a=-.9+i/31*2.35;arc.push(at(.35+Math.cos(a)*1.35,1.16+.17*Math.sin(a),4.25+Math.sin(a)*1.15))}f.ribbon(arc,'#85bbf2',.018*s,g,{transparent:true,opacity:.75,depthWrite:false});
 // The portrait's swing continues across the cliff into the live capture.
 if(!plan.L.mobile){const points=[[-8.2,.235,-3.4],[-4.1,.45,-.4],[.7,1.65,2.4],at(-2.2,1.3,4.25),at(1.1,1.55,4.1)];const {curve:connection}=f.ribbon(points,'#e9a54b',.023,g,{emissive:'#c88624',emissiveIntensity:.12});const linkedBall=f.ball(.115,connection.getPoint(.53),C.lime,g);linkedBall.userData.dynamic=true;animate?.(t=>linkedBall.position.copy(connection.getPoint((t*.065+.48)%1)));}
 return g;
}
