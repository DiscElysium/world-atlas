import {tennisLayout} from './tennis-layout.mjs?v=eed7fff475f6';
import {tennisForms} from './tennis-forms.js?v=eed7fff475f6';
import {buildTennisFoundation,buildTennisCampus,buildTennisPlanting} from './tennis-landscape.js?v=eed7fff475f6';
import {buildTennisCourt} from './tennis-court.js?v=eed7fff475f6';
import {buildTennisAthlete} from './tennis-athlete.js?v=eed7fff475f6';
import {buildTennisTrajectories} from './tennis-trajectories.js?v=eed7fff475f6';

export const TENNIS_MODULES=[
 {id:'foundation',name:'地形与台地',build:(f,p,c)=>buildTennisFoundation(f,p)},
 {id:'court',name:'球场与器械',build:(f,p,c)=>buildTennisCourt(f,p)},
 {id:'campus',name:'看台与通路',build:(f,p,c)=>buildTennisCampus(f,p)},
 {id:'athlete',name:'人物与姿态',build:(f,p,c)=>buildTennisAthlete(f,p)},
 {id:'trajectory',name:'球路与落点',build:(f,p,c)=>buildTennisTrajectories(f,p,c.animate)},
 {id:'planting',name:'植物与岩石',build:(f,p,c)=>buildTennisPlanting(f,p,c.ground)}
];
export function buildTennis(c){
 const f=tennisForms(c.kit.root),plan=tennisLayout(c.L),modules=[];
 for(const definition of TENNIS_MODULES){const module=definition.build(f,plan,c);module.userData.moduleId=definition.id;f.compact(module);modules.push(module);}
 c.kit.root.userData.tennisPlan=plan;c.kit.root.userData.tennisModules=modules;
 return {modules,plan};
}
