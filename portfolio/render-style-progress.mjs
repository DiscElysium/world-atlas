const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export function renderStyleProgress(cameraZ,depth,goldfishCenter,liarsMaskCenter){
 const p=cameraZ/depth;
 const bayer=Number.isFinite(liarsMaskCenter)?1-smooth(.22,.77,Math.abs(cameraZ-liarsMaskCenter)/depth):0;
 const swap=Number.isFinite(goldfishCenter)?1-smooth(.64,1.05,Math.abs(cameraZ-goldfishCenter)/depth):0;
 return{ink:1-smooth(.16,1.10,p),swap,bayer};
}
