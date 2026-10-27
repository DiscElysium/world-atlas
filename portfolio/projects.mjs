export const PROJECTS = [
  {
    id:'oblivion', number:'01', title:'OBLIVION', name:'遗忘', category:'KNOWLEDGE-DRIVEN EXPLORATION',
    website:'https://discelysium.github.io/OBLIVION/portfolio/en.html?v=20261025-above-01',
    intro:'凝视，让遗忘的世界暂时成形。', tags:'凝视 · 镜像 · 月食', accent:'#526a71', ink:'#354650', ground:'#d5ded6',
    palette:['#aab9a2','#bdc6b5','#929da1'], concept:'oblivion-concept.png',
    crop:[[775,218],[1320,186],[1371,497],[792,537]],
    summary:'一款慢节奏的第一人称知识锁探索游戏。凝视让消散的遗迹暂时聚集，镜子让玩家理解自己也属于同一套存在规则；月食则改变下一步能够走过的道路。',
    details:[['规则与认识','同一段楼梯、同一面镜子，会在获得新知识后显露不同用途。进展发生在玩家的理解中。'],['空间与时间','镜面、路线回接与月食共同组织谜题。两面相对的镜子将大桥延伸成一条长路。'],['制作','Unity / URP；独立完成地图、建模与粒子轮廓渲染，并依据试玩反馈调整凝视时间、跳跃与提示。']],
    gallery:[['oblivion-mirror.jpg','镜面玩法实机'],['oblivion-bridge.jpg','桥与建筑模型']], role:'知识锁探索 / 空间解谜'
  },
  {
    id:'flow', number:'04', title:'FLOW', name:'山水之间', category:'POETIC TERRAIN PLAY',
    website:'https://flow-island-portfolio.1598509191.workers.dev/',
    intro:'塑造山水，让沉默的山谷苏醒。', tags:'地形塑造 · 水流模拟 · 生态回应', accent:'#91b38c', ink:'#315856', ground:'#e5e5cf',
    palette:['#e5e5cf','#acc3a2','#c8cccc','#fbfafa'], concept:'../flow/approved-reference-v3.png',
    artwork:'flow-island2-noon.webp', artworkCaption:'FLOW · Island II 游戏实机',
    summary:'通过塑造地形，引导冰川融水穿过干涸山谷。水流、树木、花朵、鸟群与声音逐渐回应，组成一段从雪峰走向海洋的安静旅程。',
    details:[['核心行动','抬升、下切与平滑地形，观察水路如何改变，让环境自己表达生命苏醒。'],['自然系统','低多边形山脊、高度场水体、生态变化与连续昼夜共同构成山水世界。'],['制作','Three.js / TypeScript；可复现的地形生成、守恒水流与风格化自然光照。']],
    gallery:[['flow-island2-noon.webp','Island II · 正午山体与水路'],['flow-island2-night.webp','Island II · 夜间实机']], role:'诗意交互 / 地形与水流'
  },
  {
    id:'tennis', number:'02', title:'TENNISATOM', name:'身体的肖像', category:'THE PORTRAIT OF THE BODY',
    website:'https://discelysium.github.io/body-portrait-portfolio/',
    intro:'让运动数据，成为身体的肖像。', tags:'姿态识别 · 运动特效 · 影像叙事', accent:'#ec651a', ink:'#26252b', ground:'#eeeae0',
    palette:['#f8f8f5','#ecece7','#ed711d','#f5f4ee'], concept:'tennisatom-reference.png',
    artwork:'tennis-project-board.jpg', artworkCaption:'身体的肖像 · 产品展板',
    summary:'与阿里橙狮体育合作，面向业余网球运动者，把训练中的身体动作、球路与关键时刻，转译为可以选择、编排和分享的运动故事。',
    details:[['捕捉值得记住的瞬间','从训练视频中分析动作、球路与事件，让数据进入运动叙事。'],['保留表达自己的选择','选择叙事倾向与视觉特效，组合成具有个人气质的画面。'],['把一段故事带走','通过绕线装置、小诗、透明特效卡和网页，连接身体经验与自我表达。']],
    gallery:[['tennis-project-board.jpg','身体的肖像 · 产品展板'],['tennis-project-exhibition.jpg','交互装置与项目展览'],['tennis-track.png','追踪与数据转译']], role:'设计研究 / 运动数据可视化'
  },
  {
    id:'engine',slug:'space', number:'03', title:'SPACE', name:'轨道工坊', category:'MOBILE AUTOMATION',
    website:'https://discelysium.github.io/space/portfolio/',
    intro:'把自动化工厂，装进一艘飞船。', tags:'模块甲板 · 自动物流 · 航行采集', accent:'#276db3', ink:'#142950', ground:'#0a1931',
    palette:['#27395d','#364c7a','#1c2c4d','#43557d'], concept:'space-reference.png',
    artwork:'engine-runtime.png',artworkCaption:'SPACE · 游戏实机',
    crop:[[801,278],[1439,320],[1454,704],[763,664]],
    summary:'亲手搭建飞船上的自动化产线，驾驶它采集与作战。重组模块甲板，让矿物经过物流、加工与科研系统，逐步扩建移动工厂。',
    details:[['移动工厂','甲板、推进器与整船物理共同决定航行；工厂随船移动，与外部资源发生关系。'],['物流与生产','采矿激光、传送带、分流器、熔炉和仓储组成可运行的生产链。'],['系统','Godot；模块建设、资源守恒、加工科研、战斗维修、存档与分章教程。']],
    gallery:[['engine-runtime.png','太空航程运行画面']], role:'自动化沙盒 / 模块系统'
  },
  {
    id:'goldfish', number:'05', title:'GOLDFISH', name:'金鱼', category:'NARRATIVE COLOR PUZZLE',
    intro:'吸色、填色、擦除，走进创作者的世界。', tags:'色彩叙事 · 拼贴世界 · 感知与表达', accent:'#cf5943', ink:'#3c3029', ground:'#f8efe0',
    palette:['#e6ddc8','#d5c9ac','#789072','#d3d0b2'], concept:'../goldfish/model-reference.png',
    artwork:'goldfish-room.jpg', artworkCaption:'金鱼 · 游戏中的创作者房间',
    summary:'玩家通过吸色、填色与擦色，亲手推进一位创作者从自由表达走向自我异化的生命轨迹。颜色是感知、妥协与理解的叙事语言。',
    details:[['三个动作','从天空、鱼缸与植物吸取颜色，把生活填回作品，再亲手擦去画面以继续前行。'],['情绪与叙事','现实与画作的颜色逐渐错位。创作、发布、评论与赞誉，改变主人公眼中的世界。'],['制作','Unity / URP / Shader Graph；颜色状态、叙事图片序列与像素擦除驱动章节推进。']],
    gallery:[['goldfish-room.jpg','创作者房间 · 恢复色彩'],['goldfish-erase.jpg','雨夜城市 · 擦除章节']], role:'叙事解谜 / 吸色、填色与擦除'
  },
  {
    id:'liars-mask',number:'06',title:'LIAR’S MASK',name:'假面骰子',category:'BLUFF · READ · CHALLENGE',
    website:'https://masked-dice-tribunal.1598509191.workers.dev/#play',
    intro:'在虚实之间，读懂面具背后的对手。',tags:'掷骰博弈 · 欺骗与质疑 · AI 对手',accent:'#7a431f',ink:'#49220d',ground:'#fff9ee',
    palette:['#e6dece','#c4b69b','#826548'],concept:'../liars-mask/reference.png',artwork:'liars-mask-gameplay.png',artworkCaption:'Liar’s Mask · 最终版本实机',
    summary:'一款棕色 1-bit 风格的骰子博弈游戏。玩家与三位 AI 对手围坐桌前，通过叫点、质疑、窥视与偷骰，在信息不完整的局面里判断谁在说谎。',
    details:[['博弈规则','每位玩家持有四枚普通骰子与一枚特殊骰子。轮流叫点或质疑，选择相信对手，还是揭穿这一次虚张声势。'],['信息与行动','叫点后可选择窥视或偷骰。特殊骰子让叫点方的计数改变，迫使玩家在概率、观察与欺骗之间取舍。'],['场景与视觉','最终版 Unity 项目采用棕色 1-bit 渲染。此作品集场景沿用原始坐姿人物与面具模型，将石庭、废墟、骰盅和铃铛重组为可浏览的三维地图。']],
    gallery:[['liars-mask-gameplay.png','最终版 · 骰桌与面具对手'],['liars-mask-round.png','最终版 · 一轮叫点与质疑']],role:'Game Jam / 骰子博弈'
  }
  ,{
    id:'otherworks',number:'07',title:'OTHER WORKS',name:'更多探索',category:'OTHER PERSPECTIVES',
    website:'https://discelysium.github.io/world-atlas/other-works/',
    intro:'换一种媒介，继续追问。',tags:'感知与表达 · 规则与交互 · 视觉研究',accent:'#536b70',ink:'#2c4247',ground:'#eeeee8',
    palette:['#f1eee4','#dce3e0','#76939c'],concept:'../../otherworks/images/spell-cover.webp',artwork:'../../otherworks/images/spell-cover.webp',artworkCaption:'Other Works · 七个探索',
    summary:'七个关于感知、交互与计算视觉的探索。来自真实项目的照片在制图台上落下、碰撞并叠放；点击标题或照片，继续进入完整的 Other Works 网页。',
    details:[['感知与表达','代谢拓扑、PRINT SMELL 与法师施法动画，把日常行为、气味联想与力量的释放转成可感知的作品。'],['规则与交互','垃圾去哪儿了与钩锁与霰弹，从资源循环和运动机制出发，探索可以亲手调整的系统。'],['视觉研究','UniGeo 与 AsymmetricBitNet，关注几何理解、图像表达与计算视觉中的可解释证据。']],
    gallery:[['../../otherworks/images/smell-camera.webp','PRINT SMELL · 实物装配'],['../../otherworks/images/unigeo-cover.webp','UniGeo · 视觉研究']],role:'7 个探索 / 其他视角'
  }
];
PROJECTS.sort((a,b)=>Number(a.number)-Number(b.number));
export const STEP=1.22;
export const imageURL=file=>'./assets/projects/'+file;

