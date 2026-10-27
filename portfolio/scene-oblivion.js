import {stoneForms} from './oblivion-forms.js?v=03bcba9148dc';
import {buildCourtyard} from './oblivion-courtyard.js?v=03bcba9148dc';
import {buildViaduct} from './oblivion-bridge.js?v=03bcba9148dc';
import {buildAbbey} from './oblivion-abbey.js?v=03bcba9148dc';
import {buildPaths} from './oblivion-paths.js?v=03bcba9148dc';
import {buildPlateau} from './oblivion-plateau.js?v=03bcba9148dc';
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
