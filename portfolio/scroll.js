export function scrollOffset(journey,stage){if(stage.clientWidth<=700)return 0;const range=journey.offsetHeight-stage.offsetHeight;return Math.max(0,Math.min(range,scrollY-journey.offsetTop))}
