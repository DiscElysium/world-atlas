import {createForms} from './liars-mask/geometry.js?v=eed7fff475f6';
import {buildFoundation} from './liars-mask/01-foundation/index.js?v=eed7fff475f6';
import {buildRocks} from './liars-mask/02-rocks/index.js?v=eed7fff475f6';
import {buildRuins} from './liars-mask/03-ruins/index.js?v=eed7fff475f6';
import {buildTable} from './liars-mask/04-table/index.js?v=eed7fff475f6';
import {buildActors} from './liars-mask/05-actors/index.js?v=eed7fff475f6';
export function buildLiarsMask({kit,L}){const forms=createForms(kit.root);const modules=[buildFoundation(forms,{mobile:L.mobile}),buildRocks(forms),buildRuins(forms),buildTable(forms),buildActors(forms)];if(L.mobile){modules.find(m=>m.userData.moduleId==='table').position.x=5;modules.find(m=>m.userData.moduleId==='actors').position.x=5;}return{forms,modules,mobile:L.mobile};}
