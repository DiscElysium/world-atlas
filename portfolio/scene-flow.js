import {flowPlan} from './flow/plan.mjs';
import {FLOW_TERRAIN_MODULES} from './flow/terrain.js';
import {buildFlowWater} from './flow/water.js';
import {buildFlowEcology} from './flow/ecology.js';
import {buildFlowAtmosphere} from './flow/atmosphere.js';

export const FLOW_MODULES=[...FLOW_TERRAIN_MODULES,{id:'water',name:'连续河流'},{id:'headwater',name:'融水池与落水'},{id:'ocean',name:'开放海面'},{id:'ecology',name:'河岸树群'},{id:'outcrops',name:'岩石与微景'},{id:'birds',name:'远近飞鸟'},{id:'clouds',name:'漂浮薄云'}];
export function buildFlow(c){const plan=flowPlan(c.L),air=buildFlowAtmosphere(c.kit.root,plan,c.animate),modules=[...(c.terrainModules||[]),...buildFlowWater(c.kit.root,plan,c.animate),...buildFlowEcology(c.kit.root,plan,c.animate),...air.modules];c.kit.root.userData.flowPlan=plan;c.kit.root.userData.flowModules=modules;return{plan,modules,updateView:air.updateView};}
