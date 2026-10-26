import {makeGoldfishPlan,GOLD_MODULES} from './goldfish/model-v1/plan.mjs';
import {goldfishForms} from './goldfish/model-v1/forms.js';
import {buildGround} from './goldfish/model-v1/terrain.js';
import {buildCoast} from './goldfish/model-v1/coast.js';
import {buildStudio,buildVillage} from './goldfish/model-v1/architecture.js';
import {buildPaths,buildBoardwalk} from './goldfish/model-v1/paths.js';
import {buildEcology} from './goldfish/model-v1/ecology.js';
import {buildProps} from './goldfish/model-v1/props.js';
import {buildCouple} from './goldfish/model-v1/characters.js';
export {GOLD_MODULES};
export function buildGoldfish(c){
 const f=goldfishForms(c.kit.root),plan=makeGoldfishPlan({mobile:c.L?.mobile||c.mobile}),modules=[];
 const builders=[['foundation',()=>buildGround(f,plan)],['water',()=>buildCoast(f,plan,c.animate)],['room',()=>buildStudio(f,plan)],['village',()=>buildVillage(f,plan)],['paths',()=>buildPaths(f,plan)],['boardwalk',()=>buildBoardwalk(f,plan)],['ecology',()=>buildEcology(f,plan)],['props',()=>buildProps(f,plan,c.textures,c.animate)],['couple',()=>buildCouple(f,plan,c.textures)]];
 for(const [id,build] of builders){const module=build();module.userData.moduleId=id;f.compact(module);if(id==='foundation'||id==='water')module.traverse(o=>{if(o.isMesh)o.castShadow=id==='foundation'&&o.material.name!=='goldfish beach bed';});modules.push(module);}
 f.releaseBakedGeometry();c.kit.root.name='GOLDFISH · one continuous world, ten assembled modules';c.kit.root.userData.goldfishPlan=plan;c.kit.root.userData.moduleIds=[...modules.map(m=>m.userData.moduleId),'content'];return{root:c.kit.root,plan,modules,forms:f};
}
