export function buildPaths(f,c,viaduct){
 const route=f.group('OBLIVION · Courtyard to bridge causeway');
 const points=c.L.mobile?[[.17,.91],[.36,.94],[.69,.94],[.94,.86]]:[[.23,.89],[.33,.87],[.43,.85],[.53,.79]];
 const anchors=points.map(([u,v])=>c.ground(u,v));
 for(let i=0;i<anchors.length-1;i++){
  const a=anchors[i],b=anchors[i+1],height=.86;
  f.stairs([a.x,height,a.z],[b.x,height,b.z],1.07,route,7);
  for(const p of [a,b]){const h=Math.max(.18,height-p.y);f.box([.55,h,1.12],[p.x,height-h/2,p.z],route,.39)}
 }
 const ruins=f.group('OBLIVION · Plateau ruins');
 for(const [u,v,angle] of [[.115,.16,-.3],[.29,.125,.2],[.49,.10,-.15]]){
  const p=c.ground(u,v),g=f.group('Ruined terrace fragment',ruins);g.position.set(p.x,p.y,p.z);g.rotation.y=angle;
  f.box([3.4,.19,1.9],[0,.09,0],g,.39);
  for(const x of [-1.24,1.24]){f.box([.36,1.7,.42],[x,.92,-.45],g,.53);f.box([.5,.12,.56],[x,1.79,-.45],g,.6)}
  f.box([2.48,.56,.29],[0,.48,-.45],g,.35);
  for(let i=0;i<5;i++)f.box([.31,.16,.29],[(i-2)*.48,.86+(i%2)*.12,-.45],g,.42);
  f.segment([-1.15,.34,-.28],[1.15,.34,-.28],g,.24);
 }
 return route;
}
