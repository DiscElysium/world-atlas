import {DRAFT_TITLE,makeTitleBitmap} from './atelier-composition.js';
// The directory is also an authored working sheet: geometry provides the
// measured plan; a separate editorial layer explains each world's idea.
const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};

export function designDraft({plan,labels,entries,bounds,width,height,reservations}){
  const w=plan.width,h=plan.height,s=w/width,X=x=>(x-bounds.x0)*s,Z=z=>(z-bounds.z0)*h/height;
  const guides=make(w,h),notes=make(w,h),g=guides.getContext('2d'),n=notes.getContext('2d');
  const colours={blue:'#537985',graphite:'#4e5f61',orange:'#a06342',green:'#5f7f70',ochre:'#7d6b50'};
  function clipLabels(c){
    c.beginPath();c.rect(0,0,w,h);
    for(const b of reservations)c.rect(X(b.min.x-.22),Z(b.min.z-.18),(b.max.x-b.min.x+.44)*s,(b.max.z-b.min.z+.36)*s);
    c.clip('evenodd');
  }
  g.save();n.save();clipLabels(g);clipLabels(n);
  function path(c,points,{colour=colours.blue,alpha=.45,line=.9,dash=[]}={}){
    c.save();c.strokeStyle=colour;c.globalAlpha=alpha;c.lineWidth=line*1.65;c.setLineDash(dash);c.lineJoin='round';c.lineCap='round';c.beginPath();
    points.forEach(([x,z],i)=>i?c.lineTo(X(x),Z(z)):c.moveTo(X(x),Z(z)));c.stroke();c.restore();
  }
  function curve(c,points,{colour=colours.blue,alpha=.4,line=1,dash=[]}={}){
    c.save();c.strokeStyle=colour;c.globalAlpha=alpha;c.lineWidth=line*1.5;c.setLineDash(dash);c.beginPath();c.moveTo(X(points[0][0]),Z(points[0][1]));
    for(let i=1;i<points.length;i+=3)c.bezierCurveTo(X(points[i][0]),Z(points[i][1]),X(points[i+1][0]),Z(points[i+1][1]),X(points[i+2][0]),Z(points[i+2][1]));
    c.stroke();c.restore();
  }
  function circle(c,x,z,r,{colour=colours.blue,alpha=.5,line=.9,fill=false}={}){
    c.save();c.globalAlpha=alpha;c.strokeStyle=c.fillStyle=colour;c.lineWidth=line*1.5;c.beginPath();c.arc(X(x),Z(z),r*s,0,Math.PI*2);fill?c.fill():c.stroke();c.restore();
  }
  function text(c,value,x,z,{size=17,alpha=.7,colour=colours.graphite,font='Arial',italic=false,align='left'}={}){
    c.save();c.globalAlpha=alpha;c.fillStyle=colour;c.font=`${italic?'italic ':''}${size*1.12}px ${font}`;c.textAlign=align;c.fillText(value,X(x),Z(z));c.restore();
  }
  function cross(x,z,r=.14){path(g,[[x-r,z],[x+r,z]],{alpha:.5});path(g,[[x,z-r],[x,z+r]],{alpha:.5});}
  function ruler(x0,x1,z){
    path(g,[[x0,z],[x1,z]],{alpha:.4,line:1.1});
    for(let x=x0;x<=x1+.01;x+=.5)path(g,[[x,z],[x,z+(Math.round((x-x0)*2)%4===0?.15:.07)]],{alpha:.36,line:.8});
  }
  // An incomplete border leaves room for the notched tool bay. The six
  // studies share a registration system, without six repetitive boxes.
  for(const [x,z,dx,dz] of [[-20.5,-14.15,1,1],[21.9,-14.4,-1,1],[22.4,15.1,-1,-1],[-10.5,17.8,1,-1]]){
    path(g,[[x,z+dz*.65],[x,z],[x+dx*.85,z]],{alpha:.62,line:1.2});cross(x+dx*1.2,z+dz*.4,.08);
  }
  path(g,[[-22,-10.8],[-22,4.5]],{alpha:.22,line:.8});
  path(g,[[22.7,-13.4],[22.7,15]],{alpha:.22,line:.8});
  ruler(-20,-17.3,-14.1);ruler(8.5,16.9,17.38);
  text(n,'FIELDNOTES',-20.4,-13.45,{size:21,alpha:.86});
  text(n,'SIX WORLDS / 01—06',-20.4,-13.0,{size:10,alpha:.65});
  text(n,'a collection of spaces, systems & stories',9,-14.9,{size:21,font:'Georgia',italic:true,alpha:.66});
  path(g,[[9,-14.45],[20.9,-14.45]],{alpha:.35});
  text(n,'STUDIES 01—06',9,-14.08,{size:11,alpha:.55});
  text(n,'SELECTED WORKS',20.9,-14.08,{size:11,alpha:.55,align:'right'});

  for(const e of entries.filter(e=>e.index<6)){
    const b=e.box,cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2;
    // A short baseline and just two corner marks replace the old full box.
    const y=b.max.z+.46;
    path(g,[[b.min.x-.3,y],[b.min.x+1.8,y]],{alpha:.44});
    path(g,[[b.max.x-.3,b.min.z-.35],[b.max.x+.35,b.min.z-.35],[b.max.x+.35,b.min.z+.3]],{alpha:.36});
    cross(cx,cz,.16);
    path(g,[[cx-1.1,cz],[cx+1.1,cz]],{alpha:.19,dash:[9,6,2,6]});
    path(g,[[cx,cz-.75],[cx,cz+.75]],{alpha:.19,dash:[9,6,2,6]});
    for(let k=0;k<7;k++)path(g,[[b.min.x+.12*k,y+.08],[b.min.x+.12*k+.16,y-.08]],{alpha:.24,line:.75});
  }

  // 01 — the eclipse and a mirrored sightline describe Oblivion's rule,
  // rather than adding another thumbnail of its landscape.
  for(let i=0;i<3;i++){
    const x=-21+i*.85;circle(n,x,-9.6,.26,{alpha:.68});
    n.save();n.beginPath();n.arc(X(x),Z(-9.6),s*.26,-Math.PI/2,Math.PI/2);n.fillStyle=colours.graphite;n.globalAlpha=.26*(i+1);n.fill();n.restore();
  }
  text(n,'gaze / mirror / eclipse',-21.35,-8.9,{size:15,font:'Georgia',italic:true});
  path(g,[[-20,-8.5],[-18.3,-8],[-16.8,-8]],{alpha:.5});circle(g,-16.8,-8,.055,{fill:true});
  path(n,[[-20.9,-7.6],[-20.1,-8.4],[-19.3,-7.6],[-20.1,-6.8],[-20.9,-7.6]],{alpha:.52});
  path(n,[[-20.1,-8.4],[-20.1,-6.8]],{alpha:.38,dash:[3,3]});
  text(n,'01 / PERCEPTION',-21.35,-5.3,{size:13,alpha:.7});

  // 02 — sparse orange motion traces, echoing the tennis project's authored
  // trajectories. The court plan remains the dominant geometry.
  curve(g,[[-2.4,-10.7],[-3.2,-5.5],[3.5,-2.4],[4.3,-7.4]],{colour:colours.orange,alpha:.55,line:1.5,dash:[10,5]});
  for(const [i,x,z] of [[1,-2.4,-10.7],[2,.3,-6],[3,4.3,-7.4]]){circle(n,x,z,.12,{colour:colours.orange,alpha:.65});text(n,String(i),x+.19,z-.1,{size:12,colour:colours.orange});}
  text(n,'movement becomes a portrait',-.6,-12.8,{size:15,font:'Georgia',italic:true,colour:colours.orange});

  // 03 — contour studies are smooth and deliberately incomplete; their
  // rhythm gives the natural landscape a different voice from the factory.
  for(let k=0;k<5;k++){
    const d=k*.28;
    curve(g,[[10.1-d,-5.8+d],[11.4-d,-8.5+d],[15.6+d,-8.2+d],[16.2+d,-5.1+d]],{colour:colours.green,alpha:.34-k*.035,line:.9});
  }
  curve(g,[[12.3,-6.9],[12.8,-3.8],[17.7,-5.3],[16.8,-2],[16.3,.1],[12.9,.3],[12.5,1.9]],{alpha:.43,line:1.6});
  text(n,'04 / TERRAIN',18.1,4.1,{size:12,colour:colours.green});
  text(n,'& RESPONSE',18.1,4.5,{size:12,colour:colours.green});

  // 04 — a little production sequence is an actual reading key for Engine.
  const process=['extract','refine','build'];
  process.forEach((label,i)=>{
    const x=-19.8+i*2.22;path(n,[[x,-3.4],[x+1.66,-3.4],[x+1.66,-2.63],[x,-2.63],[x,-3.4]],{alpha:.57});
    text(n,label,x+.83,-2.92,{size:13,alpha:.85,align:'center'});
    if(i<2)path(n,[[x+1.76,-3.02],[x+2.12,-3.02],[x+1.99,-3.15]],{alpha:.6});
  });
  text(n,'03 / A FACTORY IN MOTION',-19.8,-3.85,{size:12,alpha:.65});

  // 05 — the narrative colour tools become a restrained pigment study at
  // the foot of the sheet, away from the roof and the koi pond.
  text(n,'05 / COLOUR AS A LANGUAGE',-7.4,17.95,{size:12,alpha:.75});
  for(const [i,colour] of ['#bf7966','#bd9f63','#859477','#77a4a9','#aea3b4'].entries()){
    const x=-7.4+i*.62;n.save();n.fillStyle=colour;n.globalAlpha=.40;n.fillRect(X(x),Z(18.15),s*.40,s*.22);n.restore();
  }
  text(n,'take / fill / erase',-3.7,18.36,{size:12,font:'Georgia',italic:true,alpha:.7});

  // 06 — a small probability study and three possible readings of a throw.
  for(let k=0;k<3;k++){
    const x=20.9,z=9.3+k*.8;path(n,[[x-.27,z-.27],[x+.27,z-.27],[x+.27,z+.27],[x-.27,z+.27],[x-.27,z-.27]],{colour:colours.ochre,alpha:.7});
    for(let j=0;j<=k;j++)circle(n,x+(j-k/2)*.16,z+(j%2?-.10:.10),.035,{colour:colours.ochre,alpha:.85,fill:true});
  }
  text(n,'read',20.9,8.75,{size:13,font:'Georgia',italic:true,colour:colours.ochre,align:'center'});
  text(n,'06 / BELIEF & CHANCE',10.1,16.25,{size:12,colour:colours.ochre});

  // The compact colophon belongs to the paper, not to the surrounding UI.
  path(g,[[9.5,16.75],[16.9,16.75]],{alpha:.48,line:1.1});
  text(n,'WORLD ATLAS',9.5,17.2,{size:17,alpha:.85});
  text(n,'01 / OPEN STUDIES',16.9,17.2,{size:12,align:'right',alpha:.7});
  g.restore();n.restore();
  // Strengthen fine marks before the site's filmic display curve; otherwise
  // a half-pixel construction line becomes almost invisible on ivory paper.
  for(const [context,power] of [[g,1.7],[n,2.25]]){
    const pixels=context.getImageData(0,0,w,h);
    for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=Math.round((1-Math.pow(1-pixels.data[i]/255,power))*255);
    context.putImageData(pixels,0,0);
  }
  n.drawImage(labels,0,0);

  // Restore the original italic serif lettering, at one fixed position and
  // size on this same sheet. Fill and outline are independent ink layers.
  const fill=make(w,h),outline=make(w,h);
  for(const [destination,hollow] of [[fill,false],[outline,true]]){
    const letter=makeTitleBitmap(hollow),t=DRAFT_TITLE,d=destination.getContext('2d');d.translate(X(t.x),Z(t.z));d.rotate(t.rotation);d.drawImage(letter,-t.width/2*s,-t.height/2*s,t.width*s,t.height*s);
  }
  const final=make(w,h),f=final.getContext('2d');
  for(const layer of [guides,plan,notes,outline])f.drawImage(layer,0,0);
  return {canvas:final,layers:{guides,plan,notes,fill,outline},design:{name:'Fieldnotes / six worlds',lineHierarchy:['registration and construction','silhouette and structure','thematic studies and marginalia'],motifs:['gaze / mirror / eclipse','body and motion','terrain and response','mobile production','colour as language','belief and chance'],titleFont:'italic 560px Georgia, "Times New Roman", serif',titleBounds:{x:-.7,z:.4,width:37,height:8.67,rotation:-.205}}};
}
