/* Editorial translations preserve the source projects' attribution and limitations. */
window.WORKS_EN = window.WORKS.map((work, index) => ({...work, ...[
  {
    name:'Metabolic Topology', english:'Habits as a living ecosystem', category:'SENSE & EXPRESSION / INFORMATION DESIGN',
    hook:'Give everyday habits a visible ecology.', tags:['2026','Interactive visualization','D3.js / HTML / CSS / JavaScript'],
    summary:'A changing ecology built from personal food and training logs. Each entry becomes more than a number: particles carry into the next day, a calendar preserves daily snapshots, and a growing mountain makes long-term effort tangible.',
    caption:'Excerpt from the original walkthrough, 00:40–01:50. Browser chrome cropped; audio removed.',
    points:[['Make relationships visible','Five colors connect food categories; four muscle-group nodes respond to training and fatigue. One visual language links logging, feedback and reflection.'],['Let actions leave a trace','Overflow particles persist across days and can be consumed through training. The consequences of one entry carry into the next experience.'],['Turn accumulation into a journey','Daily calendar snapshots and flags mapped to cumulative training time give long-term goals a visible sense of progress.']],
    images:[['metabolic-calendar.webp','Calendar review and accumulated records from the original presentation.'],['metabolic-growth.webp','The prototype’s growth-mountain view.']],
    notes:'A design prototype based on personal logging. Intake, fatigue and recovery use fixed simulation rules, rather than physiological measurements or health advice. Some thresholds differ between the script and source code; descriptions follow the verified implementation. Original materials include the script, web source, presentation, design files and full walkthrough.'
  },
  {
    name:'PRINT SMELL', english:'Photography × scent × memory', category:'SENSE & EXPRESSION / MULTISENSORY CONCEPT',
    hook:'What if a photograph could evoke a scent?', tags:['2024','Product concept','Physical assembly / Motion communication'],
    summary:'A photograph preserves how a moment looked. Could scent offer another way back? A camera and detachable printing attachment connect taking a picture, making a print and recalling a smell in one multisensory concept.',
    caption:'Complete original concept film, 48.7 seconds. Silent export bearing the designer’s name.',
    points:[['Begin with memory','Explore the association between images and smell as a route to memory beyond vision.'],['Explain use through assembly','Magnetic, detachable parts connect carrying, shooting and printing. Physical photographs make the proposed interactions understandable.'],['Give scent a visual language','Particles, curves and moving typography work with product shots to communicate a medium that cannot be shown directly.']],
    images:[['smell-board.webp','Original concept board; contact details cropped from this display copy.'],['smell-camera.webp','Photographs of the physical assembly and use scenarios.']],
    notes:'This project presents a multisensory product concept and physical assembly. The camera and printer are existing components. Scent cartridges and automatic color-to-scent mapping remain conceptual; the available materials do not demonstrate automatic scent control. Photographs and film are from the original project.'
  },
  {
    name:'Spellcasting Study', english:'A short study in force and motion', category:'SENSE & EXPRESSION / 3D & MOTION',
    hook:'Ten seconds to gather and release a force.', tags:['3D animation','Blender','Marvelous Designer / Alembic'],
    summary:'Inside a hall of repeated columns, character movement, flowing robes, golden effects and a rolling camera shape a brief progression from gathering energy to releasing it.',
    caption:'Complete original film with audio, 10.05 seconds. Use the player controls to enable sound.',
    points:[['Give force a spatial scale','Columns and arches establish depth. The contrast between the figure and the hall amplifies the scale of the spell.'],['Let cloth carry the movement','The robe lags and swings with the character. Garment files and Alembic caches connect the cloth workflow to the final scene.'],['Build rhythm with camera and light','Golden energy directs attention; camera movement marks the moment of release and turns the rhythm of the film.']],
    images:[['spell-cloth.webp','Around 00:03: character and robe movement in the final film.'],['spell-effect.webp','Around 00:05: golden effects and camera movement.']],
    notes:'The presentation focuses on scene, cloth motion, effects and audiovisual integration. Original materials include Blender scenes, Marvelous Designer files, Alembic caches and the final film. Model, motion and sound sources are not fully documented, so this page does not claim that every asset was made from scratch. The cover uses a later unobstructed frame; an early section of the original film contains an obstruction.'
  },
  {
    name:'Where Does Waste Go?', english:'A playable recycling system', category:'RULES & INTERACTION / SYSTEMS & SERIOUS GAME',
    hook:'Turn a recycling chain into a factory you can shape.', tags:['Team of four','Unity / Tuanjie','Management simulation / Circular economy'],
    summary:'What happens after the recycling bin? A top-down factory game turns collection, transport, sorting, remanufacturing and sales into a system players can configure. Changing layouts and capacity reveals how value emerges within a resource cycle.',
    caption:'Complete original team-game demonstration, 84.45 seconds. Original audio retained.',
    points:[['Make a process operable','Conveyors, robots and multistage sorting organize a dispersed industrial process into a network players can observe and configure.'],['Make scale a decision','Changes in waste input and processing capacity prompt players to rethink routes and roles, beyond repeating a single sorting task.'],['Close the economic loop','Material value connects sales and revenue to production-line improvements, giving the environmental theme an ongoing feedback cycle.']],
    images:[['recycle-line.webp','Conveyors and sorting lines from the original demonstration.'],['recycle-dashboard.webp','Factory control panel from the original demonstration.']],
    notes:'Team of four: Bian Wenjing, Wang Congrui, Luo Chuyuan and Zhu Yixuan. Available materials include the initial proposal, full demonstration and a Tuanjie / Unity Windows build. The complete editor project and final individual-role breakdown have not been recovered. This page presents the team outcome without attributing all programming, art or planning to one person.'
  },
  {
    name:'Grapple & Recoil', english:'A study in momentum', category:'RULES & INTERACTION / GAME FEEL & PHYSICS',
    hook:'Turn recoil into a way to move.', tags:['2026','GameMaker / GML','Movement-mechanics prototype'],
    summary:'A study of continuous movement through pulling, swinging and recoil. The grapple applies sustained radial force, low drag preserves momentum, and shotgun recoil creates another deliberate way to change direction.',
    caption:'Scene assets from the original GameMaker project, combining its far, middle and foreground layers.',
    points:[['Tune pull and inertia separately','Sustained pull changes radial velocity while releasing the hook preserves tangential momentum, producing a continuous swing rather than instant snapping.'],['Treat shots as movement resources','Each shot applies an opposing velocity impulse. Two shells make firing time matter to both encounters and traversal.'],['Reload through a gesture','After both shots, an upward mouse flick triggers a spinning reload. The original debug interface exposes speed, acceleration and rope direction for tuning.']],
    images:[],
    notes:'The original GameMaker prototype loops through Room1, Room2 and Room3. It uses step-based physics and precise collision masks. This presentation shows source scene assets and the verified movement mechanics. The original authorship of all scene assets has not been fully documented.'
  },
  {
    name:'UniGeo', english:'Adapting foundation features to geometry', category:'COMPUTATIONAL VISION / FEATURE ADAPTATION',
    hook:'Bring semantic features into geometric matching.', tags:['2025','Team of three','PyTorch / RAFT / Depth Anything V2'],
    summary:'Adapting visual foundation-model features to optical flow and stereo geometry. From simple addition and concatenation to context-bottleneck remapping, the team explored how new information can fit an existing model interface.',
    caption:'Sintel qualitative comparison from the original 31-page presentation: RGB, ground truth, UniGeo and UniGeo+. Color encodes pixel displacement.',
    points:[['Move from a baseline across tasks','Use frozen Depth Anything V2 features as a prior, compare addition and multiscale fusion, and extend the exploration to stereo disparity.'],['Adapt at the interface','After context concatenation, two convolutional layers remap features to 128 dimensions, preserving the recurrent update unit’s input size.'],['Read the experimental process','Training logs, validation curves and qualitative images inform tradeoffs among convergence, overfitting and feature adaptation.']],
    images:[['unigeo-architecture.webp','UniGeo+ architecture from the original presentation.'],['unigeo-depth-results.webp','Qualitative stereo-depth comparisons from the original presentation.']],
    notes:'Team of three: Xiao Xianyue, Wang Congrui and Li Yifan. Available slides do not identify individual module ownership. The project builds on RAFT, RAFT-Stereo and Depth Anything V2. The description follows bottleneck remapping in the current code, rather than the slides’ “residual injection” wording. Minimum errors come from different model-selection conditions; this page does not claim a uniform performance gain or a public leaderboard result.'
  },
  {
    name:'AsymmetricBitNet', english:'Deepfake detection through bit planes', category:'COMPUTATIONAL VISION / DEEPFAKE DETECTION',
    hook:'One image. Two scales of observation.', tags:['2026','Machine-learning course research','PyTorch / Swin-T / ResNet-34'],
    summary:'Should coarse image structure and subtle pixel changes be handled by different branches? The project splits each RGB channel into high and low four-bit planes, compares symmetric dual-CNN and asymmetric CNN–Transformer designs, and examines their limits through ablations, perturbations and training records.',
    caption:'Input-processing illustration recreated from an original sample: high bits I & 240; low bits (I & 15) << 4. These are not detection results.',
    points:[['Match branches to information form','Feed high bits to Swin-T and low bits to ResNet-34, then connect the feature streams through cross-attention.'],['Read scores in context','Compare initialization and training budgets to distinguish the potential effects of bit planes, model capacity and pretraining.'],['Learn from failure','Degradation under large-kernel blur and failed training from scratch expose tradeoffs between sensitivity to fine signals and robustness.']],
    images:[['bitnet-training.webp','Training record of the original pretrained asymmetric model over 20 epochs.'],['bitnet-robustness.webp','Perturbation experiments on the original symmetric BitNet and baseline.']],
    notes:'BitNet here is an image bit-plane detection network, unrelated to language-model quantization work of the same name. High and low bits are not pure structure and pure forgery noise: texture, resampling and compression affect both. The symmetric two-branch network differs in capacity from its single-branch baseline, while the asymmetric design also changes backbones and initialization. Gains cannot be attributed to one factor alone. The available Grad-CAM belongs to symmetric BitNet and is not presented as an asymmetric-network attention map.'
  }
][index]}));
