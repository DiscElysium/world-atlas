import {createForms} from './liars-mask/geometry.js';
import {buildFoundation} from './liars-mask/01-foundation/index.js';
import {buildRocks} from './liars-mask/02-rocks/index.js';
import {buildRuins} from './liars-mask/03-ruins/index.js';
import {buildTable} from './liars-mask/04-table/index.js';
import {buildActors} from './liars-mask/05-actors/index.js';
export function buildLiarsMask({kit,L}){const forms=createForms(kit.root);const modules=[buildFoundation(forms,{mobile:L.mobile}),buildRocks(forms),buildRuins(forms),buildTable(forms),buildActors(forms)];if(L.mobile){modules.find(m=>m.userData.moduleId==='table').position.x=5;modules.find(m=>m.userData.moduleId==='actors').position.x=5;}return{forms,modules,mobile:L.mobile};}
