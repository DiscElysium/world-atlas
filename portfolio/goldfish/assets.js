import * as THREE from '../vendor/three.module.js';
// UV windows remove export padding and neighbouring collage fragments without
// altering the game's original transparent PNG files.
export const GAME_PAPERS={
 flower:{file:'game-pink-flowers.png',size:[799,1270],crop:[0,0,799,1270],channel:'cyanPink',source:'Image_export/花.png'},
 fish:{file:'game-red-fish.png',size:[300,283],crop:[0,0,272,283],channel:'redBlue',source:'goldfish-consciousness-web/public/assets/interlude-collage/goldfish.png'},
 window:{file:'game-blue-window.png',size:[2358,1792],crop:[17,8,2357,1790],channel:'redBlue',source:'Image_export/change/window.png'},
 painting:{file:'game-fish-painting.png',size:[2172,1629],crop:[647,490,1574,1074],channel:'painting',source:'Image_export/鱼.png'},
 sunCenter:{file:'game-sunflower-center.png',size:[388,398],crop:[28,9,375,365],channel:'yellowPurple',source:'goldfish-consciousness-web/public/assets/interlude-collage/sunflower-center.png'},
 sunPetal:{file:'game-sunflower-petal.png',size:[178,111],crop:[5,4,158,109],channel:'yellowPurple',source:'goldfish-consciousness-web/public/assets/interlude-collage/petal-1.png'}
};
export async function loadGoldfishTextures(loader,anisotropy=8){
 const entries=await Promise.all(['painting'].map(async key=>[key,await loader.loadAsync('./assets/goldfish/collage/'+GAME_PAPERS[key].file)]));
 for(const [,texture] of entries){texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=anisotropy;}
 return{collage:Object.fromEntries(entries)};
}
