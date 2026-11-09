const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export function renderStyleProgress(cameraZ,depth,goldfishCenter,liarsMaskCenter){
 const p=cameraZ/depth;
 const offset=(cameraZ-liarsMaskCenter)/depth;
 const bayerBackdrop=Number.isFinite(offset)?1-smooth(.22,.77,Math.abs(offset)):0;
 // Ink belongs to the physical Mask landscape as it scrolls out of frame.
 // Background pixels have no chapter depth and keep the existing fade.
 const bayer=offset>.22&&Number.isFinite(offset)?1-smooth(.72,1.08,offset):bayerBackdrop;
 const bayerDirect=bayer>.001?smooth(.60,.82,offset):0;
 const swap=Number.isFinite(goldfishCenter)?1-smooth(.64,1.05,Math.abs(cameraZ-goldfishCenter)/depth):0;
 return{ink:1-smooth(.16,1.10,p),swap,bayer,bayerBackdrop,bayerDirect};
}
