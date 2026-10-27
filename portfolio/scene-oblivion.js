import {stoneForms} from './oblivion-forms.js?v=eed7fff475f6';
import {buildCourtyard} from './oblivion-courtyard.js?v=eed7fff475f6';
import {buildViaduct} from './oblivion-bridge.js?v=eed7fff475f6';
import {buildAbbey} from './oblivion-abbey.js?v=eed7fff475f6';
import {buildPaths} from './oblivion-paths.js?v=eed7fff475f6';
import {buildPlateau} from './oblivion-plateau.js?v=eed7fff475f6';
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
