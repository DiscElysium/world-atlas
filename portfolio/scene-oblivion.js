import {stoneForms} from './oblivion-forms.js';
import {buildCourtyard} from './oblivion-courtyard.js';
import {buildViaduct} from './oblivion-bridge.js';
import {buildAbbey} from './oblivion-abbey.js';
import {buildPaths} from './oblivion-paths.js';
import {buildPlateau} from './oblivion-plateau.js';
export function buildOblivion(c){
 const f=stoneForms(c.kit.root);
 buildPlateau(f,c);
 buildCourtyard(f,c);
 const viaduct=buildViaduct(f,c);
 buildAbbey(f,c,viaduct);
 buildPaths(f,c,viaduct);
 // Each modeled block stays separate, while its static faces and edges share draws.
 for(const chunk of [...c.kit.root.children])if(!chunk.name.includes('Dissolving')&&!chunk.userData.groundBlended)f.compact(chunk);
}
