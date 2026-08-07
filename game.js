const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const LOGICAL_WIDTH = Number(canvas.getAttribute("width")) || 360;
const LOGICAL_HEIGHT = Number(canvas.getAttribute("height")) || 640;
const CANVAS_DPR = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
canvas.width = Math.round(LOGICAL_WIDTH * CANVAS_DPR);
canvas.height = Math.round(LOGICAL_HEIGHT * CANVAS_DPR);
ctx.setTransform(CANVAS_DPR, 0, 0, CANVAS_DPR, 0, 0);
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

const MAX_DISTANCE = 8000;
const HIT_FLASH_DURATION = 180;
const GAMEOVER_FLASH_DURATION = 350;
const SHAKE_DURATION = 300;
const SHAKE_INTENSITY = 9;
const INVINCIBLE_DURATION = 1000;
const EMITTER_X = () => GAME.width / 2;
const EMITTER_Y = 100;
const START_DELAY_FIRST = 5000;
const START_DELAY_RETRY = 1400;
const ENEMY_SCALE = 2.0;
const END_DIALOG_LINE_MS = 2600;
const END_CLEAR_ACCEL = 0.25;
const END_CLEAR_MAX_MS = 2000;
const RESULT_FADE_MS = 800;
const RESULT_SCORE_DELAY = 800;
const RESULT_SCORE_DURATION = 1400;
const RESULT_BONUS_STEP_INTERVAL = 320;
const RESULT_BONUS_SETTLE = 400;
const RESULT_TAP_ENABLE_DELAY = 1000;
const TRUE_END_UNLOCK_STORAGE_KEY = "mayousaTrueEndUnlocked";
const OFFICIAL_SITE_URL = "https://sites.google.com/view/matomayo";
const PERFORMANCE_INFO_URL = "https://sites.google.com/view/wishcdl";
const TRUE_END_PHASE2_LINE_MS = 4000;
const TRUE_END_PHASE2_LINES = [
  { speaker: "ハット", text: "ふう\nやっと着いた！" },
  { speaker: "グラサン", text: "は～間に合った間に合った！\n正直ダメかと思ったわ" },
  { speaker: "りんご", text: "うん\nみんなちゃんといるよね？" },
  { speaker: "りぼん", text: "だ、大丈夫\nちゃんと全員そろってる" },
  { speaker: "おはな", text: "ふふ\nみんな頑張ったね" },
  { speaker: "全員", text: "おはまよさ～ん！！" },
];
const TRUE_END_PHASE4_LINE_MS = TRUE_END_PHASE2_LINE_MS;
const TRUE_END_PHASE4_SHOT_TRAVEL_MS = 700;
const TRUE_END_PHASE4_HIT_FLASH_MS = 200;
const TRUE_END_PHASE4_BOTTOM_Y_OFFSET = 18;
const TRUE_END_PHASE4_CHARGE_MS = 900;
const TRUE_END_PHASE4_PULSE_MS = 3000;
const TRUE_END_PHASE4_DAMAGE_POPUP_MS = 1200;
const TRUE_END_PHASE4_CHARGE_LINE = {
  speaker: "enemy_secret",
  name: "まといちゃん",
  text: "わ、わわ",
  position: "top",
};
let trueEndPhase4Queue = null;
let trueEndPhase4ShotAfterIndex = -1;
const TRUE_END_PHASE4_LINES = [
  { speaker: "enemy_secret", name: "まといちゃん", text: "すやすや～～", position: "top" },
  { speaker: "ハット", name: "ハット", text: "あれ？\nまといちゃんだ！", position: "bottom" },
  { speaker: "enemy_secret", name: "まといちゃん", text: "すやすや～～～", position: "top" },
  { speaker: "グラサン", name: "グラサン", text: "ちょ、\n寝てる場合！？", position: "bottom" },
  { speaker: "enemy_secret", name: "まといちゃん", text: "あれれ？？\nみんなまだいたの？", position: "top" },
  { speaker: "りんご", name: "りんご", text: "稽古にきたんだよ\nおはまよさんは？", position: "bottom" },
  {
    speaker: "enemy_secret",
    name: "まといちゃん",
    text: "稽古？\nなるほど",
    position: "top",
  },
  {
    speaker: "enemy_secret",
    name: "まといちゃん",
    text: "稽古は明日だよ",
    position: "top",
  },
  { speaker: "おはな", name: "おはな", text: "え", position: "bottom" },
  {
    speaker: "enemy_secret",
    name: "まといちゃん",
    text: "今日は自主練の日だよ\nでもいい運動になったでしょ！",
    position: "top",
  },
  {
    speaker: "enemy_secret",
    name: "まといちゃん",
    text: "明日は遅刻しちゃだめだよ～！",
    position: "top",
  },
  {
    speaker: "りぼん",
    name: "りぼん",
    text: "それを先に言ってよ～～！！",
    position: "bottom",
    shotAfter: true,
  },
  { speaker: "enemy_secret", name: "まといちゃん", text: "え～～～ん！", position: "top" },
];
const TRUE_END_FADE_DURATION = 1800;
const TRUE_END_PHASE4_FADE_DURATION = 2400;
const TRUE_END_RESULT_SCORE = 100000;
const TRUE_END_PHASE_DURATIONS = [
  6000,
  5000,
  TRUE_END_PHASE2_LINE_MS * TRUE_END_PHASE2_LINES.length,
  5000,
  TRUE_END_FADE_DURATION,
  9000,
];
const END_DIALOG_LINES_BY_LIVES = {
  5: [
    { speaker: "enemy", text: "ふ～。今日の稽古終了～！\nくたくた！！" },
    { speaker: "player", text: "やれやれ。\n間に合ったから良しとしよう。" },
    {
      speaker: "enemy",
      text: "あ！ハットちゃん！\nのんびりしてると\nまよちゃんに叱られるよ～！\nふふふ！！",
    },
    { speaker: "player", text: "まといちゃんのせいだろ！！！" },
    { speaker: "enemy", text: "えええ～～～！！！" },
  ],
  4: [
    { speaker: "enemy", text: "ふ～。今日の稽古終了～！\nくたくた！！" },
    { speaker: "player", text: "いや～！走った走った～！\nマジで焦ったって！" },
    {
      speaker: "enemy",
      text: "あ！グラサンちゃん！\n寄り道してると\nまよちゃんに見つかるよ～！\nいひひ",
    },
    { speaker: "player", text: "え～？オレのせい？\nそんなことある～？" },
    { speaker: "enemy", text: "じゃんじゃん！！！" },
  ],
  3: [
    { speaker: "enemy", text: "ふ～。今日の稽古終了～！\nくたくた！！" },
    { speaker: "player", text: "ふふ。\nちゃんと着けて、よかったね。" },
    {
      speaker: "enemy",
      text: "あ！おはなちゃん！\nまよちゃんが待ちくたびれてるよ！",
    },
    { speaker: "player", text: "えっと。\nみんな、がんばってたと思うよ？" },
    { speaker: "enemy", text: "いそげ～～～！！！" },
  ],
  2: [
    { speaker: "enemy", text: "ふ～。今日の稽古終了～！\nくたくた！！" },
    { speaker: "player", text: "も、もうダメかと思ったよ～！\nほんとに！" },
    { speaker: "enemy", text: "あ！りんごちゃん！\n今日も寄り道してたの～？" },
    { speaker: "player", text: "ちがうもん！！\nわたし、ちゃんと走ったもん！！" },
    { speaker: "enemy", text: "ほ～～～？" },
  ],
  1: [
    { speaker: "enemy", text: "ふ～。今日の稽古終了～！\nくたくた！！" },
    { speaker: "player", text: "や、やっと！\nま、間に合ったよね？" },
    { speaker: "enemy", text: "あ！りぼんちゃん！\n今日も迷子になってたの？" },
    { speaker: "player", text: "えっ！？\nわ、わたしのせい！？" },
    { speaker: "enemy", text: "ふふふ！！！" },
  ],
};

function getEndDialogLinesForLives(lives) {
  return END_DIALOG_LINES_BY_LIVES[lives] || END_DIALOG_LINES_BY_LIVES[1];
}

function isTrueEndUnlocked() {
  try {
    return localStorage.getItem(TRUE_END_UNLOCK_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function unlockTrueEnd() {
  try {
    localStorage.setItem(TRUE_END_UNLOCK_STORAGE_KEY, "true");
  } catch {
    // ignore storage failures
  }
}

function resetTrueEndUnlock() {
  try {
    localStorage.removeItem(TRUE_END_UNLOCK_STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}

function getEndIdForLives(lives) {
  switch (lives) {
    case 5:
      return "hat";
    case 4:
      return "sunglass";
    case 3:
      return "flower";
    case 2:
      return "apple";
    case 1:
      return "ribbon";
    default:
      return null;
  }
}

function openExternal(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function startTrueEnding() {
  GAME.state = "true_ending";
  GAME.trueEndPhase = 0;
  GAME.trueEndPhaseStart = GAME.time;
  GAME.trueEndResultStart = 0;
  GAME.trueEndResultPublished = false;
  GAME.trueEndCreditStopAt = 0;
  GAME.trueEndCreditStopBaseY = 0;
  TRUE_END_PHASE_DURATIONS[5] = 1e9;
}

function advanceTrueEndPhase() {
  GAME.trueEndPhase += 1;
  GAME.trueEndPhaseStart = GAME.time;
}

const GAME = {
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  lanePadding: 40,
  player: { x: LOGICAL_WIDTH / 2, y: LOGICAL_HEIGHT - 80, w: 36, h: 36, speed: 4 },
  scrollSpeed: 2,
  distance: 0,
  goalDistance: 8000,
  lives: 5,
  obstacles: [],
  obstacleTimer: 0,
  state: "title",
  keys: { left: false, right: false, up: false, down: false },
  time: performance.now(),
  spawnPauseUntil: 0,
  pauseUntil: 0,
  boostUntil: 0,
  shakeUntil: 0,
  invincibleUntil: 0,
  hitFlashUntil: 0,
  hitFlashDuration: HIT_FLASH_DURATION,
  messageUntil: 0,
  lastMessage: "",
  currentMayousaIndex: 0,
  resultStartTime: 0,
  bulletPhase: 0,
  bulletSweepPhase: 0,
  patternIndex: 0,
  patternPauseUntil: 0,
  safeLaneX: LOGICAL_WIDTH / 2,
  bigBulletTimer: 0,
  ceilingTimer: 0,
  snapshotTimer: 0,
  stage4NextAt: 0,
  stage4QuietUntil: 0,
  stage4FireAt: 0,
  stage4Pattern: null,
  stage4RecoverUntil: 0,
  stage4NoConvergeUntil: 0,
  pointerActive: false,
  pointerDx: 0,
  pointerDy: 0,
  enemy: { x: 0, y: 0, w: 34, h: 34, bobPhase: 0 },
  startDelayMs: START_DELAY_FIRST,
  startAt: 0,
  elapsedFromStart: 0,
  hasStartedOnce: false,
  startDialogMode: "first",
  endDialogStart: 0,
  endDialogLines: END_DIALOG_LINES_BY_LIVES[5],
  lastEndDialogLineIndex: -1,
  endDialogLineChanged: false,
  endIdThisRun: null,
  trueEndPhase: 0,
  trueEndPhaseStart: 0,
  clearStartTime: 0,
  resultFadeStart: 0,
  trueEndResultStart: 0,
  trueEndResultPublished: false,
  trueEndCreditStopAt: 0,
  trueEndCreditStopBaseY: 0,
  titleStartTime: performance.now(),
  prevState: "title",
  testMode: false,
  testKeyCount: 0,
  testKeyLastAt: 0,
};

const FONT_FAMILY = "\"Noto Sans JP\", \"Hiragino Kaku Gothic ProN\", \"Meiryo\", sans-serif";

ctx.font = `16px ${FONT_FAMILY}`;

const COLORS = {
  player: "#6ee7ff",
  obstacle: "#ff6b6b",
  road: "#141823",
  roadEdge: "#2b3142",
  text: "#e8edf2",
  accent: "#ffb86b",
};

const BG_IMAGE_COUNT = 8;
const BG_SWITCH_DISTANCE = 1000;
const BG_FADE_DURATION = 800;
const BG_LUMA_SAMPLE_SIZE = 8;
const BG_LUMA_THRESHOLD = 0.55;
const BG_FALLBACK_LUMA = 0.2;
const OBSTACLE_LIGHT = "#ffd166";
const OBSTACLE_DARK = "#1b1f2a";
const OBSTACLE_STROKE_LIGHT = "#2b3142";
const OBSTACLE_STROKE_DARK = "#ffffff";
const bgImages = Array.from({ length: BG_IMAGE_COUNT }, (_, index) => {
  const img = new Image();
  img.src = `assets/bg/scene${String(index + 1).padStart(2, "0")}.jpg`;
  return img;
});
const playerImages = [
  "assets/player/mayousa_hat.png",
  "assets/player/mayousa_glasses.png",
  "assets/player/mayousa_flower.png",
  "assets/player/mayousa_apple.png",
  "assets/player/mayousa_ribbon.png",
].map((src) => {
  const img = new Image();
  img.src = src;
  img.onerror = () => {
    console.warn(`Failed to load image: ${src}`);
  };
  return img;
});
const enemyImageTalk = new Image();
enemyImageTalk.src = "assets/enemy/enemy_talk.png";
enemyImageTalk.onerror = () => {
  console.warn("Failed to load image: assets/enemy/enemy_talk.png");
};
const enemyImageAttack = new Image();
enemyImageAttack.src = "assets/enemy/enemy_attack.png";
enemyImageAttack.onerror = () => {
  console.warn("Failed to load image: assets/enemy/enemy_attack.png");
};
const enemyImageSecret = new Image();
enemyImageSecret.src = "assets/enemy/enemy_seacret.png";
enemyImageSecret.onerror = () => {
  console.warn("Failed to load image: assets/enemy/enemy_seacret.png");
};
const obstacleImage = new Image();
obstacleImage.src = "assets/obstacles/t1.png";
obstacleImage.onerror = () => {
  console.warn("Failed to load image: assets/obstacles/t1.png");
};
const titleBg = new Image();
const titleChar = new Image();
const titleBubbleBase = new Image();
const titleBubbleText = new Image();
titleBg.src = "assets/title/bg.jpg";
titleChar.src = "assets/title/mayousa.png";
titleBubbleBase.src = "assets/title/bubble_base.png";
titleBubbleText.src = "assets/title/bubble_text.png";
const titleBg1 = new Image();
const titleBg2 = new Image();
const titleText = new Image();
titleBg1.src = "assets/title/title_bg1.png";
titleBg2.src = "assets/title/title_bg2.png";
titleText.src = "assets/title/title_text.png";
titleBg1.onerror = () => {
  console.warn("Failed to load image: assets/title/title_bg1.png");
};
titleBg2.onerror = () => {
  console.warn("Failed to load image: assets/title/title_bg2.png");
};
titleText.onerror = () => {
  console.warn("Failed to load image: assets/title/title_text.png");
};
const resultTicket = new Image();
resultTicket.src = "assets/ui/score_ticket.png";
resultTicket.onerror = () => {
  console.warn("Failed to load image: assets/ui/score_ticket.png");
};
const resultBgImage = new Image();
resultBgImage.src = "assets/ui/result_bg.jpg";
resultBgImage.onerror = () => {
  console.warn("Failed to load image: assets/ui/result_bg.jpg");
};
const secretBgImage = new Image();
secretBgImage.src = "assets/bg/secret.png";
secretBgImage.onerror = () => {
  console.warn("Failed to load image: assets/bg/secret.png");
};
const resultMayousa = new Image();
resultMayousa.src = "assets/title/mayousa.png";
const resultMayochan = new Image();
resultMayochan.src = "assets/title/mayochan.png";
const lifeIcons = [
  "assets/ui/life_hat_small.png",
  "assets/ui/life_glasses_small.png",
  "assets/ui/life_flower_small.png",
  "assets/ui/life_apple_small.png",
  "assets/ui/life_ribbon_small.png",
].map((src) => {
  const img = new Image();
  img.src = src;
  img.onerror = () => {
    console.warn(`Failed to load image: ${src}`);
  };
  return img;
});
const bgLumas = Array(BG_IMAGE_COUNT).fill(null);
const bgState = {
  currentIndex: 0,
  nextIndex: null,
  fadeStart: 0,
  pendingIndex: null,
};

const milestoneFx = {
  lastMilestone: 0,
  startTime: 0,
  value: 0,
  nextThreshold: 1000,
};

const MILESTONE_INTERVAL = 1000;
const MILESTONE_DURATION = 900;
const MILESTONE_FLASH_DURATION = 150;
const MILESTONE_SPAWN_PAUSE = 300;
const MILESTONE_PAUSE_DURATION = 500;
const MILESTONE_BOOST_DURATION = 600;
const MILESTONE_BOOST_MULTIPLIER = 1.25;
const ENABLE_MILESTONE_FX = true;
const ENABLE_BG_DEBUG = true;

const bgDebug = {
  t: 0,
  offset: 0,
  bgHeight: 0,
};

const titleUiElements = [
  {
    id: "official",
    rect: { x: 0, y: 0, w: 0, h: 0 },
    visible: true,
    enabled: true,
    onClick: () => openExternal(OFFICIAL_SITE_URL),
  },
  {
    id: "performance",
    rect: { x: 0, y: 0, w: 0, h: 0 },
    visible: true,
    enabled: true,
    onClick: () => openExternal(PERFORMANCE_INFO_URL),
  },
  {
    id: "secret",
    rect: { x: 0, y: 0, w: 0, h: 0 },
    visible: false,
    enabled: false,
    onClick: () => {
      startTrueEnding();
    },
  },
];
const BG_STRIP_WIDTH_FACTOR = 0.8;
const BG_MIN_SCROLL_EXTRA = 600;
const PAUSE_OBSTACLE_ALPHA = 0.4;
const PLAY_AREA_MARGIN = 8;
const MASK_BASE_ALPHA = 0.75;
const MASK_EDGE_ALPHA = 0.18;

const OBSTACLE_MAX = 12;
const OBSTACLE_BATCH_MIN = 1;
const OBSTACLE_BATCH_MAX = 3;
const OBSTACLE_SAFE_GAP = Math.floor(GAME.player.w * 2.5);
const OBSTACLE_SEPARATION = 18;
const OBSTACLE_SPAWN_TRIES = 10;
const PLAYER_HITBOX_SCALE = 0.3;
const PLAYER_DRAW_SIZE = 48;
const OBSTACLE_HIT_SCALE = 1.0;
const BULLET_MAX = 160;
const BULLET_SPAWN_INTERVAL = 9;
const BULLET_RING_COUNT = 8;
const BULLET_SPEED = 2.2;
const SMALL_BULLET_SIZE = 12;
const BULLET_PHASE_STEP = 0.25;
const BULLET_AIM_CHANCE = 0.12;
const PATTERN_COUNT = 4;
const PATTERN_PAUSE_DURATION = 600;
const PATTERN1_FAN_COUNT = 7;
const PATTERN1_SPREAD = 1.1;
const PATTERN2_RING_COUNT = 10;
const PATTERN3_SWEEP_COUNT = 5;
const PATTERN3_SWEEP_SPREAD = 0.5;
const SAFE_LANE_WIDTH = Math.round(GAME.player.w * 2.6);
const SAFE_LANE_LERP = 0.03;
const BULLET_HIT_SCALE = 0.5;
const STAGE_BULLET_COLORS = [
  { fill: "#ff6b6b", stroke: "#ffffff" },
  { fill: "#6bc2ff", stroke: "#ffffff" },
  { fill: "#b96bff", stroke: "#ffffff" },
  { fill: "#6bff9f", stroke: "#ffffff" },
];
const STAGE_BIG_CONFIG = [
  { size: 26, speedScale: 0.7, spawnInterval: 90, maxAlive: 3 },
  { size: 30, speedScale: 0.65, spawnInterval: 80, maxAlive: 3 },
  { size: 34, speedScale: 0.6, spawnInterval: 75, maxAlive: 4 },
  { size: 38, speedScale: 0.58, spawnInterval: 70, maxAlive: 4 },
];
const STAGE_CEILING_CONFIG = [
  { enabled: false, interval: 260, count: 3, sizeScale: 1.15, maxAlive: 3, speed: 0.55 },
  { enabled: true, interval: 220, count: 4, sizeScale: 1.2, maxAlive: 4, speed: 0.6 },
  { enabled: true, interval: 210, count: 4, sizeScale: 1.25, maxAlive: 4, speed: 0.6 },
  { enabled: false, interval: 240, count: 3, sizeScale: 1.15, maxAlive: 3, speed: 0.55 },
];
const STAGE_SNAPSHOT_CONFIG = [
  { interval: 420, count: 16, speed: 2.0 },
  { interval: 380, count: 18, speed: 2.1 },
  { interval: 360, count: 20, speed: 2.2 },
  { interval: 400, count: 16, speed: 2.0 },
];
const CEILING_Y_MIN = 60;
const CEILING_Y_MAX = 140;
const STAGE4_SILENCE_MIN = 300;
const STAGE4_SILENCE_MAX = 500;
const STAGE4_FAKE_SILENCE_MIN = 520;
const STAGE4_FAKE_SILENCE_MAX = 720;
const STAGE4_FAKE_DELAY_MIN = 180;
const STAGE4_FAKE_DELAY_MAX = 320;
const STAGE4_PATTERN_COOLDOWN_MIN = 900;
const STAGE4_PATTERN_COOLDOWN_MAX = 1400;
const STAGE4_SNAPSHOT_COUNT = 22;
const STAGE4_SNAPSHOT_SPEED = 2.1;
const STAGE4_SNAPSHOT_SPREAD = 4;
const STAGE4_NOISE_BIG_COUNT = 2;
const STAGE4_NOISE_BIG_OFFSET = 140;
const STAGE4_RECOVER_PAUSE = 600;
const STAGE4_NO_CONVERGE_DURATION = 1000;
const STAGE4_CEILING_COUNT = 3;
const STAGE4_CEILING_SIZE_SCALE = 1.2;
const STAGE4_CEILING_MAX = 3;
const STAGE4_CEILING_SPEED = 0.55;
const GAME_SPEED_SCALE = 0.75;
const MAYOUSA_PARTY = [
  { name: "まようさハット", line: "あとは任せたよ！" },
  { name: "まようさグラサン", line: "ちょっと無理しすぎたか〜" },
  { name: "まようさおはな", line: "ごめんね応援してるよ" },
  { name: "まようさりんご", line: "まだいけるよね！？" },
  { name: "まようさりぼん", line: "ぜったい間に合わせて！" },
];
const MAYOUSA_MESSAGE_DURATION = 800;
const LIFE_BONUS = 400;
const MAX_SCORE = 10000;
const RESULT_COUNTUP_DURATION = 800;
const SCENE_NAMES = [
  "開演前",
  "ロビー",
  "黎明",
  "midnight beat",
  "dancing stars",
  "MOON LIGHT",
  "鍵孔の向こう",
  "Night Song",
];
const TITLE_THRESHOLDS = [
  { max: 999, label: "まだ寝ぼけてる" },
  { max: 2999, label: "走り出したけど間に合わない！" },
  { max: 4999, label: "本気ダッシュ！" },
  { max: 7999, label: "ほぼ間に合った！" },
  { max: Infinity, label: "遅刻回避！完璧！" },
];

function getResultSummary(overrides = null) {
  const scoreOverride =
    overrides && typeof overrides.score === "number" ? overrides.score : null;
  const clearedOverride =
    overrides && typeof overrides.cleared === "boolean" ? overrides.cleared : null;
  const sceneOverride =
    overrides && typeof overrides.sceneName === "string" ? overrides.sceneName : null;
  const isTrueEnd = !!(overrides && overrides.isTrueEnd);
  const cleared = clearedOverride != null ? clearedOverride : GAME.distance >= GAME.goalDistance;
  const baseScore = scoreOverride != null ? scoreOverride : Math.floor(GAME.distance);
  const bonus = scoreOverride != null ? 0 : cleared ? GAME.lives * LIFE_BONUS : 0;
  const score = scoreOverride != null ? scoreOverride : Math.min(MAX_SCORE, baseScore + bonus);
  const stageIndex = Math.min(SCENE_NAMES.length - 1, Math.floor(GAME.distance / 1000));
  const sceneName = sceneOverride || SCENE_NAMES[stageIndex] || "開演前";
  const title = TITLE_THRESHOLDS.find((t) => score <= t.max)?.label || "";
  return {
    runId: GAME.resultRunId || "",
    cleared,
    score,
    baseScore,
    bonus,
    lives: GAME.lives,
    distance: Math.floor(GAME.distance),
    endId: GAME.endIdThisRun || (cleared ? getEndIdForLives(GAME.lives) : "gameover"),
    sceneName,
    title,
    completedAt: GAME.resultCompletedAt || new Date().toISOString(),
    testMode: GAME.testMode,
    isTrueEnd,
  };
}

function publishResultSummary(overrides = null) {
  GAME.resultRunId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  GAME.resultCompletedAt = new Date().toISOString();
  window.dispatchEvent(
    new CustomEvent("mayousa:result", {
      detail: getResultSummary(overrides),
    })
  );
}

function isImageReady(img) {
  return !!(img && img.complete && img.naturalWidth > 0);
}

function sampleImageLuma(img) {
  const sample = document.createElement("canvas");
  sample.width = BG_LUMA_SAMPLE_SIZE;
  sample.height = BG_LUMA_SAMPLE_SIZE;
  const sctx = sample.getContext("2d");
  sctx.drawImage(img, 0, 0, sample.width, sample.height);
  let data;
  try {
    data = sctx.getImageData(0, 0, sample.width, sample.height).data;
  } catch (err) {
    if (err && err.name === "SecurityError" && !sampleImageLuma.warned) {
      console.warn("Background sampling skipped due to cross-origin restrictions.");
      sampleImageLuma.warned = true;
    }
    return 0.5;
  }
  let total = 0;
  const count = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    total += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }
  return total / count;
}

sampleImageLuma.warned = false;

bgImages.forEach((img, index) => {
  img.onload = () => {
    bgLumas[index] = sampleImageLuma(img);
  };
});

function drawImageLayer(img, alpha) {
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const coverScale = Math.max(GAME.width / imgW, GAME.height / imgH);
  const coverW = imgW * coverScale;
  const coverH = imgH * coverScale;
  const coverX = (GAME.width - coverW) / 2;
  const coverY = (GAME.height - coverH) / 2;
  ctx.save();
  ctx.globalAlpha = 0.35 * alpha;
  ctx.drawImage(img, coverX, coverY, coverW, coverH);
  ctx.restore();

  const containScale = Math.min(GAME.width / imgW, GAME.height / imgH);
  const containW = imgW * containScale;
  const containH = imgH * containScale;
  const containX = (GAME.width - containW) / 2;
  const containY = (GAME.height - containH) / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, containX, containY, containW, containH);
  ctx.restore();
}

function computeStripGeometry(img) {
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const targetStripW = Math.min(
    imgW,
    Math.round(imgH * (GAME.width / GAME.height) * BG_STRIP_WIDTH_FACTOR)
  );
  const stripW = Math.max(1, targetStripW);
  const stripH = imgH;
  const srcX = Math.max(0, (imgW - stripW) / 2);
  let scale = GAME.width / stripW;
  let drawW = stripW * scale;
  let drawH = stripH * scale;
  if (drawH < GAME.height) {
    scale = GAME.height / stripH;
    drawW = stripW * scale;
    drawH = stripH * scale;
  }
  return { stripW, stripH, srcX, drawW, drawH };
}

function getPlayAreaBounds() {
  const left = GAME.lanePadding + PLAY_AREA_MARGIN;
  const right = GAME.width - GAME.lanePadding - PLAY_AREA_MARGIN;
  return { left, right };
}

function getMaskPhaseLabel() {
  if (!ENABLE_MILESTONE_FX || !milestoneFx.startTime) return null;
  const elapsed = GAME.time - milestoneFx.startTime;
  if (elapsed < 0 || elapsed > MILESTONE_DURATION) return null;
  return "REVEAL";
}

function drawPlayAreaMask() {
  if (GAME.state === "title" || GAME.state === "result" || GAME.state === "secret") return;
  const { left, right } = getPlayAreaBounds();
  ctx.save();
  ctx.globalAlpha = MASK_BASE_ALPHA;
  const bandGrad = ctx.createLinearGradient(left, 0, right, 0);
  bandGrad.addColorStop(0, "rgba(0, 0, 0, 0.62)");
  bandGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.43)");
  bandGrad.addColorStop(1, "rgba(0, 0, 0, 0.62)");
  ctx.fillStyle = bandGrad;
  ctx.fillRect(left, 0, right - left, GAME.height);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = MASK_EDGE_ALPHA;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(left, 0, right - left, GAME.height);
  ctx.restore();
}

function drawMayousaIcon(x, y, size, alpha, isActive, iconIndex) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const icon = lifeIcons[iconIndex];
  if (icon && isImageReady(icon)) {
    ctx.drawImage(icon, x - size / 2, y - size / 2, size, size);
  } else {
    ctx.fillStyle = isActive ? "#ffd1dc" : "#7b8090";
    const r = size / 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isActive ? "#ffc4d6" : "#6c707e";
    ctx.beginPath();
    ctx.arc(x - r * 0.6, y - r * 0.6, r * 0.45, 0, Math.PI * 2);
    ctx.arc(x + r * 0.6, y - r * 0.6, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStripLayer(img, alpha, stageT) {
  const geometry = computeStripGeometry(img);
  const { stripW, stripH, srcX, drawW, drawH } = geometry;
  const t = Math.min(1, Math.max(0, stageT));
  const bgH = drawH;
  const travel = Math.max(0, bgH - GAME.height);
  const offset = t * travel;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#0b0c11";
  ctx.fillRect(0, 0, GAME.width, GAME.height);
  const x = (GAME.width - drawW) / 2;
  const baseY = GAME.height - bgH;
  const y = baseY + offset;
  ctx.drawImage(
    img,
    srcX,
    0,
    stripW,
    stripH,
    x,
    y,
    drawW,
    drawH
  );
  ctx.restore();
  return { t, offset, bgH };
}

function drawFullLayer(img, alpha) {
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const containScale = Math.min(GAME.width / imgW, GAME.height / imgH);
  const containW = imgW * containScale;
  const containH = imgH * containScale;
  const containX = (GAME.width - containW) / 2;
  const containY = (GAME.height - containH) / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, containX, containY, containW, containH);
  ctx.restore();
}

function resetGame() {
  GAME.player.x = GAME.width / 2;
  GAME.player.y = GAME.height - 80;
  GAME.distance = 0;
  GAME.lives = MAYOUSA_PARTY.length;
  GAME.obstacles = [];
  GAME.obstacleTimer = 0;
  milestoneFx.lastMilestone = 0;
  milestoneFx.startTime = 0;
  milestoneFx.value = 0;
  milestoneFx.nextThreshold = 1000;
  GAME.spawnPauseUntil = 0;
  GAME.pauseUntil = 0;
  GAME.boostUntil = 0;
  GAME.shakeUntil = 0;
  GAME.invincibleUntil = 0;
  GAME.hitFlashUntil = 0;
  GAME.hitFlashDuration = HIT_FLASH_DURATION;
  GAME.messageUntil = 0;
  GAME.lastMessage = "";
  GAME.currentMayousaIndex = 0;
  GAME.endIdThisRun = null;
  GAME.resultStartTime = 0;
  GAME.resultRunId = "";
  GAME.resultCompletedAt = "";
  GAME.bulletPhase = 0;
  GAME.bulletSweepPhase = 0;
  GAME.patternIndex = 0;
  GAME.patternPauseUntil = 0;
  GAME.safeLaneX = GAME.width / 2;
  GAME.bigBulletTimer = 0;
  GAME.ceilingTimer = 0;
  GAME.snapshotTimer = 0;
  GAME.stage4NextAt = 0;
  GAME.stage4QuietUntil = 0;
  GAME.stage4FireAt = 0;
  GAME.stage4Pattern = null;
  GAME.stage4RecoverUntil = 0;
  GAME.stage4NoConvergeUntil = 0;
  GAME.pointerActive = false;
  GAME.pointerDx = 0;
  GAME.pointerDy = 0;
  GAME.enemy.x = EMITTER_X();
  GAME.enemy.y = EMITTER_Y;
  GAME.enemy.bobPhase = 0;
  GAME.startAt = GAME.time;
  GAME.endDialogStart = 0;
  GAME.clearStartTime = 0;
  GAME.resultFadeStart = 0;
}

function getStageBulletColor(stageIndex) {
  return STAGE_BULLET_COLORS[stageIndex % STAGE_BULLET_COLORS.length];
}

function spawnBullet(x, y, vx, vy, stageIndex, aimed = false, kind = "bullet") {
  if (GAME.obstacles.length >= BULLET_MAX) return;
  const stage = stageIndex ?? GAME.patternIndex;
  const color = getStageBulletColor(stage);
  const size = SMALL_BULLET_SIZE;
  GAME.obstacles.push({
    kind,
    aimed,
    x: x - size / 2,
    y: y - size / 2,
    w: size,
    h: size,
    vx,
    vy,
    fill: color.fill,
    stroke: color.stroke,
    strokeWidth: 2,
  });
}

function spawnBigBullet(x, y, vx, vy, stageIndex, kind = "bigBullet", sizeOverride) {
  if (GAME.obstacles.length >= BULLET_MAX) return;
  const stage = stageIndex ?? GAME.patternIndex;
  const config = STAGE_BIG_CONFIG[stage % STAGE_BIG_CONFIG.length];
  const limit = kind === "bigBullet" ? config.maxAlive : null;
  const bigCount = GAME.obstacles.reduce(
    (count, o) => count + (o.kind === kind ? 1 : 0),
    0
  );
  if (limit != null && bigCount >= limit) return;
  const color = getStageBulletColor(stage);
  const size = sizeOverride ?? config.size;
  GAME.obstacles.push({
    kind,
    x: x - size / 2,
    y: y - size / 2,
    w: size,
    h: size,
    vx,
    vy,
    fill: color.fill,
    stroke: color.stroke,
    strokeWidth: 3,
  });
}

function spawnCeilingCover(stageIndex) {
  const stage = stageIndex ?? GAME.patternIndex;
  const config = STAGE_CEILING_CONFIG[stage % STAGE_CEILING_CONFIG.length];
  if (!config.enabled) return;
  const count = config.count;
  const size = STAGE_BIG_CONFIG[stage % STAGE_BIG_CONFIG.length].size * config.sizeScale;
  const spacing = GAME.width / count;
  for (let i = 0; i < count; i += 1) {
    const x = spacing * (i + 0.5);
    const y = CEILING_Y_MIN + Math.random() * (CEILING_Y_MAX - CEILING_Y_MIN);
    const vy = config.speed;
    spawnBigBullet(x, y, 0, vy, stage, "ceilingBullet", size);
  }
}

function spawnSnapshotVolley(stageIndex) {
  const stage = stageIndex ?? GAME.patternIndex;
  const config = STAGE_SNAPSHOT_CONFIG[stage % STAGE_SNAPSHOT_CONFIG.length];
  const targetX = GAME.player.x + GAME.player.w / 2;
  const targetY = GAME.player.y + GAME.player.h / 2;
  const count = config.count;
  for (let i = 0; i < count; i += 1) {
    const spawnX = (GAME.width / (count - 1)) * i;
    const spawnY = EMITTER_Y;
    const spread = (i - (count - 1) / 2) * 4;
    const dx = targetX + spread - spawnX;
    const dy = targetY - spawnY;
    const len = Math.max(1, Math.hypot(dx, dy));
    const vx = (dx / len) * config.speed;
    const vy = (dy / len) * config.speed;
    spawnBullet(spawnX, spawnY, vx, vy, stage, false, "snapshotBullet");
  }
}

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

function countKind(kind) {
  return GAME.obstacles.reduce((count, o) => count + (o.kind === kind ? 1 : 0), 0);
}

function spawnStage4Ceiling(count = STAGE4_CEILING_COUNT, sizeScale = STAGE4_CEILING_SIZE_SCALE, speed = STAGE4_CEILING_SPEED) {
  if (countKind("ceilingBullet") >= STAGE4_CEILING_MAX) return;
  const size = STAGE_BIG_CONFIG[0].size * sizeScale;
  const spacing = GAME.width / count;
  for (let i = 0; i < count; i += 1) {
    if (countKind("ceilingBullet") >= STAGE4_CEILING_MAX) break;
    const x = spacing * (i + 0.5);
    const y = CEILING_Y_MIN + Math.random() * (CEILING_Y_MAX - CEILING_Y_MIN);
    spawnBigBullet(x, y, 0, speed, 4, "ceilingBullet", size);
  }
}

function spawnStage4SnapshotVolley() {
  const targetX = GAME.player.x + GAME.player.w / 2;
  const targetY = GAME.player.y + GAME.player.h / 2;
  const count = STAGE4_SNAPSHOT_COUNT;
  for (let i = 0; i < count; i += 1) {
    const spawnX = (GAME.width / (count - 1)) * i;
    const spawnY = EMITTER_Y;
    const spread = (i - (count - 1) / 2) * STAGE4_SNAPSHOT_SPREAD;
    const dx = targetX + spread - spawnX;
    const dy = targetY - spawnY;
    const len = Math.max(1, Math.hypot(dx, dy));
    const vx = (dx / len) * STAGE4_SNAPSHOT_SPEED;
    const vy = (dy / len) * STAGE4_SNAPSHOT_SPEED;
    spawnBullet(spawnX, spawnY, vx, vy, 4, false, "snapshotBullet");
  }
}

function spawnStage4NoiseBig() {
  const baseSize = STAGE_BIG_CONFIG[0].size;
  const size = baseSize * 1.05;
  const centerX = GAME.player.x + GAME.player.w / 2;
  const offsets = [-STAGE4_NOISE_BIG_OFFSET, STAGE4_NOISE_BIG_OFFSET];
  for (let i = 0; i < STAGE4_NOISE_BIG_COUNT; i += 1) {
    const x = Math.max(40, Math.min(GAME.width - 40, centerX + offsets[i % offsets.length]));
    const y = 120;
    const speed = BULLET_SPEED * 0.6;
    spawnBigBullet(x, y, 0, speed, 4, "bigBullet", size);
  }
}

function updateStage4Spawns() {
  const now = GAME.time;
  if (GAME.stage4RecoverUntil && now < GAME.stage4RecoverUntil) return;
  if (
    (GAME.spawnPauseUntil && now < GAME.spawnPauseUntil) ||
    (GAME.patternPauseUntil && now < GAME.patternPauseUntil)
  ) {
    return;
  }
  if (GAME.stage4Pattern && now < GAME.stage4FireAt) {
    return;
  }
  if (GAME.stage4NoConvergeUntil && now < GAME.stage4NoConvergeUntil) {
    if (!GAME.stage4NextAt || now >= GAME.stage4NextAt) {
      spawnStage4Ceiling(1, 1.05, 0.45);
      GAME.stage4NextAt = now + 420;
    }
    return;
  }
  if (!GAME.stage4Pattern) {
    if (!GAME.stage4NextAt) {
      GAME.stage4NextAt = now + randRange(500, 800);
    }
    if (now < GAME.stage4NextAt) return;
    const roll = Math.random();
    GAME.stage4Pattern = roll < 0.6 ? "A" : roll < 0.85 ? "B" : "C";
    if (GAME.stage4Pattern === "C") {
      GAME.stage4QuietUntil = now + randRange(STAGE4_FAKE_SILENCE_MIN, STAGE4_FAKE_SILENCE_MAX);
      GAME.stage4FireAt =
        GAME.stage4QuietUntil + randRange(STAGE4_FAKE_DELAY_MIN, STAGE4_FAKE_DELAY_MAX);
    } else {
      GAME.stage4QuietUntil = now + randRange(STAGE4_SILENCE_MIN, STAGE4_SILENCE_MAX);
      GAME.stage4FireAt = GAME.stage4QuietUntil;
    }
    return;
  }
  if (now < GAME.stage4FireAt) return;
  if (GAME.stage4Pattern === "A") {
    spawnStage4SnapshotVolley();
    spawnStage4Ceiling();
  } else if (GAME.stage4Pattern === "B") {
    spawnStage4SnapshotVolley();
    spawnStage4NoiseBig();
    spawnStage4Ceiling();
  } else {
    spawnStage4SnapshotVolley();
    spawnStage4Ceiling();
  }
  GAME.stage4Pattern = null;
  GAME.stage4NextAt = now + randRange(STAGE4_PATTERN_COOLDOWN_MIN, STAGE4_PATTERN_COOLDOWN_MAX);
}

function spawnObstacleBatch(patternIndex) {
  if (GAME.obstacles.length >= BULLET_MAX) return;
  const originX = EMITTER_X();
  const originY = EMITTER_Y;
  const phase = GAME.bulletPhase;

  switch (patternIndex) {
    case 0: {
      const ringCount = Math.min(BULLET_RING_COUNT, BULLET_MAX - GAME.obstacles.length);
      for (let i = 0; i < ringCount; i += 1) {
        const angle = phase + (i * Math.PI * 2) / ringCount;
        const vx = Math.cos(angle) * BULLET_SPEED;
        const vy = Math.sin(angle) * BULLET_SPEED + 0.6;
        spawnBullet(originX, originY, vx, vy, patternIndex);
      }
      if (Math.random() < BULLET_AIM_CHANCE) {
        const targetX = GAME.player.x + GAME.player.w / 2;
        const targetY = GAME.player.y + GAME.player.h / 2;
        const dx = targetX - originX;
        const dy = targetY - originY;
        const len = Math.max(1, Math.hypot(dx, dy));
        spawnBullet(
          originX,
          originY,
          (dx / len) * (BULLET_SPEED + 0.8),
          (dy / len) * (BULLET_SPEED + 0.8),
          patternIndex,
          true
        );
      }
      break;
    }
    case 1: {
      const baseAngle = Math.PI / 2 + Math.sin(phase) * 0.2;
      for (let i = 0; i < PATTERN1_FAN_COUNT; i += 1) {
        const t = i / (PATTERN1_FAN_COUNT - 1);
        const angle = baseAngle + (t - 0.5) * PATTERN1_SPREAD;
        spawnBullet(
          originX,
          originY,
          Math.cos(angle) * BULLET_SPEED,
          Math.sin(angle) * BULLET_SPEED,
          patternIndex
        );
      }
      break;
    }
    case 2: {
      const ringCount = Math.min(PATTERN2_RING_COUNT, BULLET_MAX - GAME.obstacles.length);
      for (let i = 0; i < ringCount; i += 1) {
        const angle = (i * Math.PI * 2) / ringCount + phase * 0.5;
        const speed = BULLET_SPEED + (i % 2) * 0.6;
        spawnBullet(originX, originY, Math.cos(angle) * speed, Math.sin(angle) * speed, patternIndex);
      }
      break;
    }
    default: {
      const sweep = Math.sin(GAME.bulletSweepPhase) * 0.9;
      const baseAngle = Math.PI / 2 + sweep;
      for (let i = 0; i < PATTERN3_SWEEP_COUNT; i += 1) {
        const t = i / (PATTERN3_SWEEP_COUNT - 1);
        const angle = baseAngle + (t - 0.5) * PATTERN3_SWEEP_SPREAD;
        spawnBullet(
          originX,
          originY,
          Math.cos(angle) * BULLET_SPEED,
          Math.sin(angle) * BULLET_SPEED,
          patternIndex
        );
      }
      GAME.bulletSweepPhase += 0.08;
      break;
    }
  }

  GAME.bulletPhase += BULLET_PHASE_STEP;
}

function updatePlayer() {
  const keyboardDx = (GAME.keys.right ? 1 : 0) - (GAME.keys.left ? 1 : 0);
  const keyboardDy = (GAME.keys.down ? 1 : 0) - (GAME.keys.up ? 1 : 0);
  if (keyboardDx || keyboardDy) {
    GAME.pointerActive = false;
    GAME.player.x += keyboardDx * GAME.player.speed;
    GAME.player.y += keyboardDy * GAME.player.speed;
  } else if (GAME.pointerActive) {
    GAME.player.x += GAME.pointerDx * GAME.player.speed * (2 / 3);
    GAME.player.y += GAME.pointerDy * GAME.player.speed * (2 / 3);
  }
  const { left, right } = getPlayAreaBounds();
  const minX = left;
  const maxX = right - GAME.player.w;
  GAME.player.x = Math.max(minX, Math.min(maxX, GAME.player.x));
  const minY = 16;
  const maxY = GAME.height - GAME.player.h - 16;
  GAME.player.y = Math.max(minY, Math.min(maxY, GAME.player.y));
}

function updateObstacles() {
  const elapsedFromStart = GAME.time - GAME.startAt;
  if (!GAME.hasStartedOnce && elapsedFromStart >= GAME.startDelayMs) {
    GAME.hasStartedOnce = true;
  }
  if (elapsedFromStart < GAME.startDelayMs) return;
  const playerCenterX = GAME.player.x + GAME.player.w / 2;
  GAME.safeLaneX += (playerCenterX - GAME.safeLaneX) * SAFE_LANE_LERP;
  const { left, right } = getPlayAreaBounds();
  const laneMin = left + SAFE_LANE_WIDTH / 2;
  const laneMax = right - SAFE_LANE_WIDTH / 2;
  GAME.safeLaneX = Math.max(laneMin, Math.min(laneMax, GAME.safeLaneX));
  const score = Math.floor(GAME.distance);
  const stageIndex = Math.floor(score / 1000);
  const nextPattern = stageIndex % PATTERN_COUNT;
  if (nextPattern !== GAME.patternIndex) {
    GAME.patternIndex = nextPattern;
    GAME.patternPauseUntil = GAME.time + PATTERN_PAUSE_DURATION;
    GAME.bulletPhase = 0;
    GAME.bulletSweepPhase = 0;
  }
  if (stageIndex === 4) {
    updateStage4Spawns();
  } else {
    GAME.obstacleTimer += 1;
    if (GAME.obstacleTimer > BULLET_SPAWN_INTERVAL) {
      if (
        (!GAME.spawnPauseUntil || GAME.time >= GAME.spawnPauseUntil) &&
        (!GAME.patternPauseUntil || GAME.time >= GAME.patternPauseUntil)
      ) {
        spawnObstacleBatch(GAME.patternIndex);
      }
      GAME.obstacleTimer = 0;
    }
    GAME.bigBulletTimer += 1;
    const bigConfig = STAGE_BIG_CONFIG[GAME.patternIndex % STAGE_BIG_CONFIG.length];
    if (GAME.bigBulletTimer > bigConfig.spawnInterval) {
      if (
        (!GAME.spawnPauseUntil || GAME.time >= GAME.spawnPauseUntil) &&
        (!GAME.patternPauseUntil || GAME.time >= GAME.patternPauseUntil)
      ) {
        const originX = GAME.width / 2 + (Math.random() - 0.5) * GAME.width * 0.4;
        const originY = 90;
        const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.35;
        const speed = BULLET_SPEED * bigConfig.speedScale;
        spawnBigBullet(
          originX,
          originY,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          GAME.patternIndex
        );
      }
      GAME.bigBulletTimer = 0;
    }
    GAME.ceilingTimer += 1;
    const ceilingConfig = STAGE_CEILING_CONFIG[GAME.patternIndex % STAGE_CEILING_CONFIG.length];
    if (ceilingConfig.enabled && GAME.ceilingTimer > ceilingConfig.interval) {
      if (
        (!GAME.spawnPauseUntil || GAME.time >= GAME.spawnPauseUntil) &&
        (!GAME.patternPauseUntil || GAME.time >= GAME.patternPauseUntil)
      ) {
        spawnCeilingCover(GAME.patternIndex);
      }
      GAME.ceilingTimer = 0;
    }
    GAME.snapshotTimer += 1;
    const snapshotConfig = STAGE_SNAPSHOT_CONFIG[GAME.patternIndex % STAGE_SNAPSHOT_CONFIG.length];
    if (GAME.snapshotTimer > snapshotConfig.interval) {
      if (
        (!GAME.spawnPauseUntil || GAME.time >= GAME.spawnPauseUntil) &&
        (!GAME.patternPauseUntil || GAME.time >= GAME.patternPauseUntil)
      ) {
        spawnSnapshotVolley(GAME.patternIndex);
      }
      GAME.snapshotTimer = 0;
    }
  }

  GAME.obstacles.forEach((o) => {
    const speed = getSpeedMultiplier() * GAME_SPEED_SCALE;
    if (
      o.kind === "bullet" ||
      o.kind === "bigBullet" ||
      o.kind === "snapshotBullet" ||
      o.kind === "ceilingBullet"
    ) {
      o.x += o.vx * speed;
      o.y += o.vy * speed;
    } else {
      o.y += o.speed * speed;
    }
  });

  if (GAME.patternPauseUntil && GAME.time >= GAME.patternPauseUntil) {
    GAME.patternPauseUntil = 0;
  }
  GAME.obstacles = GAME.obstacles.filter((o) => {
    if (
      o.kind === "bullet" ||
      o.kind === "bigBullet" ||
      o.kind === "snapshotBullet" ||
      o.kind === "ceilingBullet"
    ) {
      return (
        o.x + o.w > -40 &&
        o.x < GAME.width + 40 &&
        o.y + o.h > -40 &&
        o.y < GAME.height + 40
      );
    }
    return o.y < GAME.height + 60;
  });
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function getSpeedMultiplier() {
  if (!ENABLE_MILESTONE_FX) return 1;
  return GAME.time < GAME.boostUntil ? MILESTONE_BOOST_MULTIPLIER : 1;
}

function getPlayerHitbox() {
  const w = GAME.player.w * PLAYER_HITBOX_SCALE;
  const h = GAME.player.h * PLAYER_HITBOX_SCALE;
  const x = GAME.player.x + (GAME.player.w - w) / 2;
  const y = GAME.player.y + (GAME.player.h - h) / 2;
  return { x, y, w, h };
}

function getObstacleHitbox(obstacle) {
  const scale =
    obstacle.kind === "bullet" ||
    obstacle.kind === "bigBullet" ||
    obstacle.kind === "snapshotBullet" ||
    obstacle.kind === "ceilingBullet"
      ? BULLET_HIT_SCALE
      : OBSTACLE_HIT_SCALE;
  const w = obstacle.w * scale;
  const h = obstacle.h * scale;
  const x = obstacle.x + (obstacle.w - w) / 2;
  const y = obstacle.y + (obstacle.h - h) / 2;
  return { x, y, w, h };
}

function update() {
  if (GAME.state === "end_clearing") {
    const elapsed = GAME.time - GAME.clearStartTime;
    GAME.obstacles.forEach((o) => {
      if (
        o.kind === "bullet" ||
        o.kind === "bigBullet" ||
        o.kind === "snapshotBullet" ||
        o.kind === "ceilingBullet"
      ) {
        o.vy -= END_CLEAR_ACCEL;
        o.vx *= 0.98;
        o.x += o.vx;
        o.y += o.vy;
      }
    });
    GAME.obstacles = GAME.obstacles.filter((o) => {
      if (
        o.kind === "bullet" ||
        o.kind === "bigBullet" ||
        o.kind === "snapshotBullet" ||
        o.kind === "ceilingBullet"
      ) {
        return o.y + o.h > -80;
      }
      return false;
    });
    if (GAME.obstacles.length === 0 || elapsed >= END_CLEAR_MAX_MS) {
      GAME.obstacles = [];
      GAME.player.x = GAME.width / 2;
      GAME.player.y = GAME.height - 80;
      GAME.endDialogStart = GAME.time;
      GAME.endDialogLines = getEndDialogLinesForLives(GAME.lives);
      GAME.lastEndDialogLineIndex = -1;
      GAME.endDialogLineChanged = false;
      GAME.endIdThisRun = getEndIdForLives(GAME.lives);
      GAME.state = "end_dialog";
    }
    return;
  }
  if (GAME.state === "true_ending") {
    ensureTrueEndPhase4Queue();
    const phase = GAME.trueEndPhase;
    if (phase === 5 && GAME.trueEndCreditStopAt) {
      if (GAME.time - GAME.trueEndCreditStopAt >= 5000) {
        advanceTrueEndPhase();
      }
      return;
    }
    if (phase < TRUE_END_PHASE_DURATIONS.length) {
      const elapsed = GAME.time - GAME.trueEndPhaseStart;
      if (elapsed >= TRUE_END_PHASE_DURATIONS[phase]) {
        advanceTrueEndPhase();
      }
    }
    return;
  }
  if (GAME.state === "end_dialog") {
    const elapsed = GAME.time - GAME.endDialogStart;
    const lineCount = GAME.endDialogLines ? GAME.endDialogLines.length : 0;
    const currentIndex = Math.floor(elapsed / END_DIALOG_LINE_MS);
    GAME.endDialogLineChanged = currentIndex !== GAME.lastEndDialogLineIndex;
    if (GAME.endDialogLineChanged) {
      GAME.lastEndDialogLineIndex = currentIndex;
    }
    if (elapsed >= END_DIALOG_LINE_MS * lineCount) {
      GAME.state = "result_fade";
      GAME.resultFadeStart = GAME.time;
      GAME.resultStartTime = GAME.time;
    }
    return;
  }
  if (GAME.state === "result_fade") {
    const elapsed = GAME.time - GAME.resultFadeStart;
    if (elapsed >= RESULT_FADE_MS) {
      GAME.state = "result";
    }
    return;
  }
  if (GAME.state !== "play") return;

  updatePlayer();
  if (ENABLE_MILESTONE_FX) {
    if (GAME.pauseUntil && GAME.time >= GAME.pauseUntil) {
      GAME.pauseUntil = 0;
      GAME.boostUntil = GAME.time + MILESTONE_BOOST_DURATION;
    }
    if (GAME.pauseUntil && GAME.time < GAME.pauseUntil) {
      return;
    }
  }
  updateObstacles();
  if (GAME.elapsedFromStart >= GAME.startDelayMs) {
    GAME.distance = Math.min(
      MAX_DISTANCE,
      GAME.distance + GAME.scrollSpeed * getSpeedMultiplier() * GAME_SPEED_SCALE
    );
  }
  if (ENABLE_MILESTONE_FX) {
    if (GAME.distance >= milestoneFx.nextThreshold) {
      milestoneFx.lastMilestone = milestoneFx.nextThreshold;
      milestoneFx.startTime = GAME.time;
      milestoneFx.value = milestoneFx.nextThreshold;
      GAME.spawnPauseUntil = GAME.time + MILESTONE_SPAWN_PAUSE;
      GAME.pauseUntil = GAME.time + MILESTONE_PAUSE_DURATION;
      bgState.pendingIndex = Math.min(
        BG_IMAGE_COUNT - 1,
        Math.floor(milestoneFx.nextThreshold / MILESTONE_INTERVAL)
      );
      milestoneFx.nextThreshold += MILESTONE_INTERVAL;
    }
  }
  const playerBox = getPlayerHitbox();
  const stageIndex = Math.floor(GAME.distance / 1000);

  for (const obstacle of GAME.obstacles) {
    if (GAME.testMode) continue;
    if (checkCollision(playerBox, getObstacleHitbox(obstacle))) {
      if (GAME.time < GAME.invincibleUntil) continue;
      const idx = GAME.currentMayousaIndex;
      const mayousa = MAYOUSA_PARTY[idx];
      GAME.lastMessage = mayousa ? mayousa.line : "";
      GAME.messageUntil = GAME.time + MAYOUSA_MESSAGE_DURATION;
      GAME.lives -= 1;
      GAME.currentMayousaIndex = Math.min(
        MAYOUSA_PARTY.length - 1,
        GAME.currentMayousaIndex + 1
      );
      GAME.hitFlashUntil = GAME.time + HIT_FLASH_DURATION;
      GAME.hitFlashDuration = HIT_FLASH_DURATION;
      GAME.invincibleUntil = GAME.time + INVINCIBLE_DURATION;
      GAME.player.x = GAME.width / 2;
      GAME.player.y = GAME.height - 80;
      GAME.obstacles = [];
      if (stageIndex === 4) {
        GAME.stage4RecoverUntil = GAME.time + STAGE4_RECOVER_PAUSE;
        GAME.stage4NoConvergeUntil = GAME.stage4RecoverUntil + STAGE4_NO_CONVERGE_DURATION;
        GAME.stage4Pattern = null;
        GAME.stage4NextAt = GAME.time + randRange(400, 700);
        GAME.stage4QuietUntil = 0;
        GAME.stage4FireAt = 0;
      }
      if (GAME.lives <= 0) {
        GAME.shakeUntil = GAME.time + SHAKE_DURATION;
        GAME.hitFlashUntil = GAME.time + GAMEOVER_FLASH_DURATION;
        GAME.hitFlashDuration = GAMEOVER_FLASH_DURATION;
        GAME.endIdThisRun = "gameover";
        GAME.state = "result";
        GAME.resultStartTime = GAME.time;
      }
      return;
    }
  }

  if (GAME.distance >= MAX_DISTANCE) {
    GAME.distance = MAX_DISTANCE;
    unlockTrueEnd();
    GAME.endIdThisRun = getEndIdForLives(GAME.lives);
    GAME.clearStartTime = GAME.time;
    GAME.state = "end_clearing";
  }
}

function drawBackground() {
  const maxIndex = BG_IMAGE_COUNT - 1;
  const stageIndex = Math.min(
    maxIndex,
    Math.floor(GAME.distance / MILESTONE_INTERVAL)
  );
  const scoreInStage = GAME.distance % MILESTONE_INTERVAL;
  const stageT = scoreInStage / MILESTONE_INTERVAL;
  const maskElapsed = milestoneFx.startTime ? GAME.time - milestoneFx.startTime : 0;
  if (bgState.pendingIndex != null && maskElapsed >= 0) {
    if (isImageReady(bgImages[bgState.pendingIndex])) {
      bgState.nextIndex = bgState.pendingIndex;
      bgState.fadeStart = GAME.time;
      bgState.pendingIndex = null;
    }
  }
  if (stageIndex !== bgState.currentIndex) {
    if (bgState.nextIndex !== stageIndex) {
      if (isImageReady(bgImages[stageIndex])) {
        bgState.nextIndex = stageIndex;
        bgState.fadeStart = GAME.time;
      }
    }
  }

  let usedImage = false;
  let debugInfo = null;
  const currentImg = bgImages[bgState.currentIndex];
  const nextImg = bgState.nextIndex != null ? bgImages[bgState.nextIndex] : null;
  const hasCurrent = isImageReady(currentImg);
  const hasNext = isImageReady(nextImg);

  if (bgState.nextIndex != null && (hasCurrent || hasNext)) {
    const elapsed = GAME.time - bgState.fadeStart;
    const tFade = Math.min(1, Math.max(0, elapsed / BG_FADE_DURATION));
    if (hasCurrent) {
      drawStripLayer(currentImg, 1 - tFade, 1);
    }
    if (hasNext) {
      debugInfo = drawStripLayer(nextImg, tFade, stageT);
    }
    usedImage = hasCurrent || hasNext;
    if (tFade >= 1 && hasNext) {
      bgState.currentIndex = bgState.nextIndex;
      bgState.nextIndex = null;
      bgState.fadeStart = 0;
    }
  } else if (hasCurrent) {
    debugInfo = drawStripLayer(currentImg, 1, stageT);
    usedImage = true;
  }

  if (!usedImage) {
    const stripeHeight = 60;
    const offset = GAME.distance % stripeHeight;
    for (let y = -stripeHeight; y < GAME.height + stripeHeight; y += stripeHeight) {
      const isEven = ((y + offset) / stripeHeight) % 2 === 0;
      ctx.fillStyle = isEven ? "#121622" : "#181c28";
      ctx.fillRect(0, y + offset, GAME.width, stripeHeight);
    }
    debugInfo = {
      t: stageT,
      offset: 0,
      bgH: 0,
    };
  }

  if (ENABLE_BG_DEBUG && debugInfo) {
    bgDebug.t = debugInfo.t;
    bgDebug.offset = debugInfo.offset;
    bgDebug.bgHeight = debugInfo.bgH;
  }

  drawPlayAreaMask();
}

function drawResultBackground() {
  if (isImageReady(resultBgImage)) {
    ctx.drawImage(resultBgImage, 0, 0, GAME.width, GAME.height);
  } else {
    drawBackground();
  }
}

function drawSecretBackground() {
  if (isImageReady(secretBgImage)) {
    ctx.drawImage(secretBgImage, 0, 0, GAME.width, GAME.height);
  } else {
    drawBackground();
  }
}

function drawTrueEndingText(lines, y, font) {
  ctx.save();
  ctx.fillStyle = "#f7f1df";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
  ctx.lineWidth = 3;
  ctx.textAlign = "center";
  ctx.font = font;
  const lineHeight = 24;
  lines.forEach((line, i) => {
    const ly = y + i * lineHeight;
    ctx.strokeText(line, GAME.width / 2, ly);
    ctx.fillText(line, GAME.width / 2, ly);
  });
  ctx.textAlign = "left";
  ctx.restore();
}

function getTrueEndCreditRows() {
  return [
    { type: "heading", text: "出演" },
    { type: "name", text: "まようさハット", icon: playerImages[0] },
    { type: "name", text: "まようさグラサン", icon: playerImages[1] },
    { type: "name", text: "まようさおはな", icon: playerImages[2] },
    { type: "name", text: "まようさりんご", icon: playerImages[3] },
    { type: "name", text: "まようさリボン", icon: playerImages[4] },
    { type: "name", text: "まといちゃん", icon: enemyImageSecret },
    { gap: 28 },
    { type: "heading", text: "作った人" },
    { type: "name", text: "天使まとい" },
    { gap: 32 },
    { type: "heading", text: "Special Thanks" },
    { type: "thanks", text: "あそんでくれたあなた" },
    { gap: 420 },
    { type: "final", text: "True End", isFinal: true },
  ];
}

function getTrueEndCreditRowHeight(row) {
  if (row.gap) return row.gap;
  if (row.type === "heading") return 40;
  if (row.type === "thanks") return 46;
  return row.isFinal ? 48 : 40;
}

function getTrueEndCreditFinalOffset(rows) {
  let offset = 0;
  for (const row of rows) {
    if (row.isFinal) return offset;
    offset += getTrueEndCreditRowHeight(row);
  }
  return offset;
}

function drawTrueEndCreditRows(rows, y) {
  ctx.save();
  ctx.textBaseline = "middle";
  let currentY = y;
  rows.forEach((row) => {
    if (row.gap) {
      currentY += row.gap;
      return;
    }

    const isFinal = row.isFinal;
    const centerY = currentY + getTrueEndCreditRowHeight(row) / 2;

    if (row.type === "heading") {
      ctx.textAlign = "center";
      ctx.font = `bold 16px ${FONT_FAMILY}`;
      ctx.fillStyle = "#fff3c4";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
      ctx.lineWidth = 3;
      const lineY = centerY + 18;
      const lineW = 108;
      const lineX = GAME.width / 2 - lineW / 2;
      const grad = ctx.createLinearGradient(lineX, lineY, lineX + lineW, lineY);
      grad.addColorStop(0, "rgba(255, 243, 196, 0)");
      grad.addColorStop(0.5, "rgba(255, 243, 196, 0.85)");
      grad.addColorStop(1, "rgba(255, 243, 196, 0)");
      ctx.strokeText(row.text, GAME.width / 2, centerY);
      ctx.fillText(row.text, GAME.width / 2, centerY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lineX, lineY);
      ctx.lineTo(lineX + lineW, lineY);
      ctx.stroke();
      currentY += getTrueEndCreditRowHeight(row);
      return;
    }

    if (isFinal || row.type === "thanks") {
      ctx.textAlign = "center";
      const fontSize = isFinal ? 32 : 22;
      ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
      ctx.fillStyle = isFinal ? "#fff3c4" : "#f7f1df";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
      ctx.lineWidth = isFinal ? 5 : 4;
      ctx.shadowColor = isFinal ? "rgba(255, 211, 108, 0.7)" : "rgba(255, 243, 196, 0.35)";
      ctx.shadowBlur = isFinal ? 16 : 8;
      ctx.strokeText(row.text, GAME.width / 2, centerY);
      ctx.fillText(row.text, GAME.width / 2, centerY);
      ctx.shadowBlur = 0;
      currentY += getTrueEndCreditRowHeight(row);
      return;
    }

    const iconSize = 32;
    const gap = 12;
    ctx.font = `bold 21px ${FONT_FAMILY}`;
    const textW = ctx.measureText(row.text).width;
    const groupW = row.icon ? iconSize + gap + textW : textW;
    const groupX = GAME.width / 2 - groupW / 2;
    const iconX = groupX;
    const nameX = row.icon ? iconX + iconSize + gap : groupX;

    if (row.icon && isImageReady(row.icon)) {
      const scale = Math.min(iconSize / row.icon.naturalWidth, iconSize / row.icon.naturalHeight);
      const drawW = row.icon.naturalWidth * scale;
      const drawH = row.icon.naturalHeight * scale;
      const drawX = iconX + (iconSize - drawW) / 2;
      const drawY = centerY - drawH / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, centerY, iconSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(row.icon, drawX, drawY, drawW, drawH);
      ctx.restore();
      ctx.strokeStyle = "rgba(247, 241, 223, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, centerY, iconSize / 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.textAlign = "left";
    ctx.fillStyle = "#f7f1df";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.72)";
    ctx.lineWidth = 4;
    ctx.shadowColor = "rgba(255, 243, 196, 0.25)";
    ctx.shadowBlur = 6;
    ctx.strokeText(row.text, nameX, centerY);
    ctx.fillText(row.text, nameX, centerY);
    ctx.shadowBlur = 0;
    currentY += getTrueEndCreditRowHeight(row);
  });
  ctx.restore();
}

function wrapPhase2DialogueLines(text, maxLines, maxWidth, font) {
  if (!text) return [];
  const lineLimit = Number.isFinite(maxLines) ? maxLines : Infinity;
  const normalizedLines = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, "").replace(/^[ \t]+/g, ""))
    .filter((line) => line.length > 0);
  if (!normalizedLines.length) return [];
  const result = [];
  ctx.save();
  ctx.font = font;
  for (const raw of normalizedLines) {
    if (result.length >= lineLimit) break;
    if (raw === "") {
      result.push("");
      continue;
    }
    let current = "";
    for (const ch of raw) {
      const test = current + ch;
      if (ctx.measureText(test).width > maxWidth && current) {
        result.push(current);
        current = ch;
        if (result.length >= lineLimit) break;
      } else {
        current = test;
      }
    }
    if (result.length >= lineLimit) break;
    if (current !== "") result.push(current);
  }
  ctx.restore();
  return result.slice(0, lineLimit);
}

function drawTrueEndingPhase2Subtitle(speaker, text, curtainH, yOffset = 0) {
  const nameFont = `bold 14px ${FONT_FAMILY}`;
  const dialogFont = `bold 20px ${FONT_FAMILY}`;
  const nameLineHeight = 18;
  const dialogLineHeight = 26;
  const maxWidth = GAME.width * 0.78;
  const dialogLines = wrapPhase2DialogueLines(text, 4, maxWidth, dialogFont);
  if (!dialogLines.length) return;

  const dialogBottomY = curtainH - 18 + yOffset;
  const dialogStartY = dialogBottomY - (dialogLines.length - 1) * dialogLineHeight;
  const nameY = dialogStartY - 24;

  ctx.save();
  ctx.textAlign = "center";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
  ctx.lineWidth = 3;

  ctx.font = nameFont;
  ctx.fillStyle = "#FFF1C1";
  ctx.strokeText(speaker, GAME.width / 2, nameY);
  ctx.fillText(speaker, GAME.width / 2, nameY);

  ctx.font = dialogFont;
  ctx.fillStyle = "#FFFFFF";
  dialogLines.forEach((line, index) => {
    const y = dialogStartY + index * dialogLineHeight;
    ctx.strokeText(line, GAME.width / 2, y);
    ctx.fillText(line, GAME.width / 2, y);
  });

  ctx.textAlign = "left";
  ctx.restore();
}

function buildSecretDialogueQueue(lines, maxLines, maxWidth, font) {
  const queue = [];
  lines.forEach((entry) => {
    const wrapped = wrapPhase2DialogueLines(entry.text, Infinity, maxWidth, font);
    const segments = wrapped.length ? wrapped : [""];
    for (let i = 0; i < segments.length; i += maxLines) {
      const chunkLines = segments.slice(i, i + maxLines);
      const chunk = { ...entry, lines: chunkLines };
      if (entry.shotAfter && i + maxLines >= segments.length) {
        chunk.shotAfter = true;
      } else {
        delete chunk.shotAfter;
      }
      queue.push(chunk);
    }
  });
  return queue;
}

function ensureTrueEndPhase4Queue() {
  if (trueEndPhase4Queue) return;
  const dialogFont = `bold 20px ${FONT_FAMILY}`;
  const maxWidth = GAME.width * 0.78;
  trueEndPhase4Queue = buildSecretDialogueQueue(
    TRUE_END_PHASE4_LINES,
    3,
    maxWidth,
    dialogFont
  );
  trueEndPhase4ShotAfterIndex = trueEndPhase4Queue.findIndex((line) => line.shotAfter);
  if (trueEndPhase4ShotAfterIndex < 0) {
    trueEndPhase4ShotAfterIndex = Math.max(0, trueEndPhase4Queue.length - 2);
  }
  const chargeStart = TRUE_END_PHASE4_LINE_MS * (trueEndPhase4ShotAfterIndex + 1);
  const shotStart =
    chargeStart + TRUE_END_PHASE4_CHARGE_MS + TRUE_END_PHASE4_PULSE_MS + TRUE_END_PHASE4_LINE_MS;
  const duration =
    shotStart +
    TRUE_END_PHASE4_SHOT_TRAVEL_MS +
    TRUE_END_PHASE4_LINE_MS +
    TRUE_END_PHASE4_FADE_DURATION;
  TRUE_END_PHASE_DURATIONS[4] = duration;
}

function getTypewriterVisibleLines(lines, elapsedMs) {
  const totalChars = lines.reduce((sum, line) => sum + line.length, 0);
  if (!totalChars) {
    return lines.map(() => "");
  }
  const elapsedSec = Math.max(0, elapsedMs / 1000);
  const charsPerSec = Math.max(20, Math.min(60, totalChars / 1.2));
  let remaining = Math.min(totalChars, Math.floor(elapsedSec * charsPerSec));
  return lines.map((line) => {
    if (remaining <= 0) return "";
    if (line.length <= remaining) {
      remaining -= line.length;
      return line;
    }
    const visible = line.slice(0, Math.max(0, remaining));
    remaining = 0;
    return visible;
  });
}

function roundRectPath(context, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + w, y, x + w, y + h, radius);
  context.arcTo(x + w, y + h, x, y + h, radius);
  context.arcTo(x, y + h, x, y, radius);
  context.arcTo(x, y, x + w, y, radius);
  context.closePath();
}

function drawSecretDialogueBubble(centerX, textTop, textBottom, maxTextWidth) {
  const xPad = 18;
  const yPad = 12;
  const radius = 12;
  const width = maxTextWidth + xPad * 2;
  const height = Math.max(0, textBottom - textTop) + yPad * 2;
  const x = centerX - width / 2;
  const y = textTop - yPad;
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  } else {
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.fill();
  }
  ctx.restore();
}

function drawSecretDialogueBottom(speaker, lines, visibleLines, curtainH, yOffset = 0) {
  const nameFont = `bold 14px ${FONT_FAMILY}`;
  const dialogFont = `bold 20px ${FONT_FAMILY}`;
  const nameLineHeight = 18;
  const dialogLineHeight = 26;

  const dialogBottomY = curtainH - 18 + yOffset;
  const dialogStartY = dialogBottomY - (lines.length - 1) * dialogLineHeight;
  const nameY = dialogStartY - 24;

  ctx.save();
  ctx.textAlign = "center";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
  ctx.lineWidth = 3;

  ctx.font = dialogFont;
  let maxWidth = 0;
  lines.forEach((line) => {
    maxWidth = Math.max(maxWidth, ctx.measureText(line).width);
  });
  ctx.font = nameFont;
  maxWidth = Math.max(maxWidth, ctx.measureText(speaker).width);

  const textTop = nameY - nameLineHeight;
  const textBottom = dialogStartY + (lines.length - 1) * dialogLineHeight + 6;
  drawSecretDialogueBubble(GAME.width / 2, textTop, textBottom, maxWidth);

  ctx.font = nameFont;
  ctx.fillStyle = "#FFF1C1";
  ctx.strokeText(speaker, GAME.width / 2, nameY);
  ctx.fillText(speaker, GAME.width / 2, nameY);

  ctx.font = dialogFont;
  ctx.fillStyle = "#FFFFFF";
  visibleLines.forEach((line, index) => {
    const y = dialogStartY + index * dialogLineHeight;
    ctx.strokeText(line, GAME.width / 2, y);
    ctx.fillText(line, GAME.width / 2, y);
  });

  ctx.textAlign = "left";
  ctx.restore();
}

function drawSecretDialogueTop(speaker, lines, visibleLines) {
  const nameFont = `bold 14px ${FONT_FAMILY}`;
  const dialogFont = `bold 20px ${FONT_FAMILY}`;
  const nameLineHeight = 18;
  const dialogLineHeight = 26;
  const dialogTopY = Math.floor(GAME.height * 0.4);
  const nameY = dialogTopY - 24;

  ctx.save();
  ctx.textAlign = "center";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
  ctx.lineWidth = 3;

  ctx.font = dialogFont;
  let maxWidth = 0;
  lines.forEach((line) => {
    maxWidth = Math.max(maxWidth, ctx.measureText(line).width);
  });
  ctx.font = nameFont;
  maxWidth = Math.max(maxWidth, ctx.measureText(speaker).width);

  const textTop = nameY - nameLineHeight;
  const textBottom = dialogTopY + (lines.length - 1) * dialogLineHeight + 6;
  drawSecretDialogueBubble(GAME.width / 2, textTop, textBottom, maxWidth);

  ctx.font = nameFont;
  ctx.fillStyle = "#FFF1C1";
  ctx.strokeText(speaker, GAME.width / 2, nameY);
  ctx.fillText(speaker, GAME.width / 2, nameY);

  ctx.font = dialogFont;
  ctx.fillStyle = "#FFFFFF";
  visibleLines.forEach((line, index) => {
    const y = dialogTopY + index * dialogLineHeight;
    ctx.strokeText(line, GAME.width / 2, y);
    ctx.fillText(line, GAME.width / 2, y);
  });

  ctx.textAlign = "left";
  ctx.restore();
}

function drawTrueEndingPhase4TopSubtitle(speaker, text) {
  const nameFont = `bold 14px ${FONT_FAMILY}`;
  const dialogFont = `bold 20px ${FONT_FAMILY}`;
  const dialogLineHeight = 26;
  const maxWidth = GAME.width * 0.78;
  const dialogLines = wrapPhase2DialogueLines(text, 4, maxWidth, dialogFont);
  if (!dialogLines.length) return;

  const dialogTopY = Math.floor(GAME.height * 0.4);
  const nameY = dialogTopY - 24;

  ctx.save();
  ctx.textAlign = "center";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
  ctx.lineWidth = 3;

  ctx.font = nameFont;
  ctx.fillStyle = "#FFF1C1";
  ctx.strokeText(speaker, GAME.width / 2, nameY);
  ctx.fillText(speaker, GAME.width / 2, nameY);

  ctx.font = dialogFont;
  ctx.fillStyle = "#FFFFFF";
  dialogLines.forEach((line, index) => {
    const y = dialogTopY + index * dialogLineHeight;
    ctx.strokeText(line, GAME.width / 2, y);
    ctx.fillText(line, GAME.width / 2, y);
  });

  ctx.textAlign = "left";
  ctx.restore();
}

function drawTrueEndingSecretShot(progress, fromX, fromY, toX, toY) {
  const x = fromX + (toX - fromX) * progress;
  const y = fromY + (toY - fromY) * progress;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(255, 215, 160, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawTrueEndingSecretChargeBall(x, y, scale) {
  const radius = 6 * scale;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(255, 215, 160, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawTrueEndingSecretHit(x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTrueEndDamagePopups(x, y, elapsed) {
  const t = Math.min(1, Math.max(0, elapsed / TRUE_END_PHASE4_DAMAGE_POPUP_MS));
  const alpha = 1 - t;
  const rise = 18 * t;
  const offsets = [-28, -14, 0, 14, 28];
  const yOffsets = [0, 18, 36, 54, 72];
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `bold 18px ${FONT_FAMILY}`;
  ctx.fillStyle = "#ff4d4d";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
  ctx.lineWidth = 3;
  offsets.forEach((offsetX, index) => {
    const textX = x + offsetX;
    const textY = y - 12 - rise + yOffsets[index % yOffsets.length];
    ctx.strokeText("20000", textX, textY);
    ctx.fillText("20000", textX, textY);
  });
  ctx.restore();
}

function drawTrueEnding() {
  const phase = GAME.trueEndPhase;
  const phaseElapsed = GAME.time - GAME.trueEndPhaseStart;
  const centerY = GAME.height / 2 + 255;

  if (phase === 0) {
    const phaseDur = TRUE_END_PHASE_DURATIONS[0];
    const fadeInDur = 1200;
    const textFadeInDur = 600;
    const textHoldDur = 3000;
    const textFadeOutDur = 800;
    const textStart = fadeInDur;
    const textFadeInEnd = textStart + textFadeInDur;
    const textHoldEnd = textFadeInEnd + textHoldDur;
    const textFadeOutEnd = textHoldEnd + textFadeOutDur;

    const blackAlpha = 1;
    let textAlpha = 0;
    if (phaseElapsed >= textStart && phaseElapsed < textFadeInEnd) {
      textAlpha = (phaseElapsed - textStart) / textFadeInDur;
    } else if (phaseElapsed >= textFadeInEnd && phaseElapsed < textHoldEnd) {
      textAlpha = 1;
    } else if (phaseElapsed >= textHoldEnd && phaseElapsed < textFadeOutEnd) {
      textAlpha = 1 - (phaseElapsed - textHoldEnd) / textFadeOutDur;
    }

    ctx.save();
    ctx.globalAlpha = blackAlpha;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, GAME.width, GAME.height);
    ctx.restore();
    if (textAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = textAlpha;
      drawTrueEndingText(["Ending"], GAME.height / 2, `bold 28px ${FONT_FAMILY}`);
      ctx.restore();
    }
    return;
  }

  if (phase === 1 || phase === 2 || phase === 3 || phase === 4) {
    drawSecretBackground();
  } else {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, GAME.width, GAME.height);
  }

  const curtainH = GAME.height * 0.75;
  if (phase === 1) {
    const t = Math.min(1, Math.max(0, phaseElapsed / TRUE_END_PHASE_DURATIONS[1]));
    const rectH = GAME.height - t * (GAME.height - curtainH);
    drawSecretPlayers(centerY);
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, GAME.width, rectH);
    ctx.restore();
  } else if (phase === 2) {
    const lineIndex = Math.min(
      TRUE_END_PHASE2_LINES.length - 1,
      Math.floor(phaseElapsed / TRUE_END_PHASE2_LINE_MS)
    );
    const currentLine = TRUE_END_PHASE2_LINES[lineIndex];
    const activeIndices = currentLine
      ? getPhase2ActiveIndices(currentLine.speaker)
      : [];
    drawSecretPlayers(centerY, activeIndices);
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, GAME.width, curtainH);
    ctx.restore();
  } else if (phase === 3) {
    drawSecretPlayers(centerY);
    drawSecretEnemy();
    const t = Math.min(1, Math.max(0, phaseElapsed / TRUE_END_PHASE_DURATIONS[3]));
    const rectY = -t * curtainH;
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, rectY, GAME.width, curtainH);
    ctx.restore();
  } else if (phase === 4) {
    ensureTrueEndPhase4Queue();
    const lineMs = TRUE_END_PHASE4_LINE_MS;
    const queue = trueEndPhase4Queue || [];
    const chargeStart = lineMs * (trueEndPhase4ShotAfterIndex + 1);
    const chargeEnd = chargeStart + TRUE_END_PHASE4_CHARGE_MS;
    const pulseEnd = chargeEnd + TRUE_END_PHASE4_PULSE_MS;
    const chargeLineStart = pulseEnd;
    const chargeLineEnd = chargeLineStart + lineMs;
    const shotStart = chargeLineEnd;
    const shotHit = shotStart + TRUE_END_PHASE4_SHOT_TRAVEL_MS;
    const lineAfterShotIndex = trueEndPhase4ShotAfterIndex + 1;
    const lineAfterShotStart = shotHit;
    const lineAfterShotEnd = lineAfterShotStart + lineMs;
    let currentLine = null;
    let lineStart = 0;
    if (phaseElapsed >= chargeLineStart && phaseElapsed < chargeLineEnd) {
      const dialogFont = `bold 20px ${FONT_FAMILY}`;
      const maxWidth = GAME.width * 0.78;
      currentLine = {
        ...TRUE_END_PHASE4_CHARGE_LINE,
        lines: wrapPhase2DialogueLines(TRUE_END_PHASE4_CHARGE_LINE.text, 3, maxWidth, dialogFont),
      };
      lineStart = chargeLineStart;
    } else if (phaseElapsed < chargeStart) {
      const lineIndex = Math.min(
        trueEndPhase4ShotAfterIndex,
        Math.floor(phaseElapsed / lineMs)
      );
      currentLine = queue[lineIndex] || null;
      lineStart = lineIndex * lineMs;
    } else if (phaseElapsed >= lineAfterShotStart && phaseElapsed < lineAfterShotEnd) {
      currentLine = queue[lineAfterShotIndex] || null;
      lineStart = lineAfterShotStart;
    }

    const enemyTalking = currentLine && currentLine.speaker === "enemy_secret";
    const activeIndices =
      !enemyTalking && currentLine ? getPhase2ActiveIndices(currentLine.speaker) : [];
    const wobble = enemyTalking ? Math.sin(GAME.time / 160) * 3 : 0;

    drawSecretPlayers(centerY, activeIndices);
    drawSecretEnemy(wobble);

    const shotToX = GAME.width / 2;
    const shotToY = GAME.height / 2 + 60 + wobble;
    const shotOffsets = [-16, -8, 0, 8, 16];
    const shotPositions = getSecretPlayerPositions(centerY);
    if (phaseElapsed >= chargeStart && phaseElapsed < chargeEnd) {
      const t = (phaseElapsed - chargeStart) / TRUE_END_PHASE4_CHARGE_MS;
      const scale = (0.6 + 0.4 * Math.min(1, Math.max(0, t))) * 1.5;
      shotPositions.forEach((pos) => {
        drawTrueEndingSecretChargeBall(pos.x, pos.y - 16, scale);
      });
    } else if (phaseElapsed >= chargeEnd && phaseElapsed < pulseEnd) {
      const pulse = (1 + 0.06 * Math.sin((phaseElapsed - chargeEnd) / 100)) * 1.5;
      shotPositions.forEach((pos) => {
        drawTrueEndingSecretChargeBall(pos.x, pos.y - 16, pulse);
      });
    } else if (phaseElapsed >= pulseEnd && phaseElapsed < shotStart) {
      const pulse = (1 + 0.06 * Math.sin((phaseElapsed - chargeEnd) / 100)) * 1.5;
      shotPositions.forEach((pos) => {
        drawTrueEndingSecretChargeBall(pos.x, pos.y - 16, pulse);
      });
    } else if (phaseElapsed >= shotStart && phaseElapsed < shotHit) {
      const t = (phaseElapsed - shotStart) / TRUE_END_PHASE4_SHOT_TRAVEL_MS;
      shotPositions.forEach((pos, index) => {
        const offsetX = shotOffsets[index % shotOffsets.length];
        drawTrueEndingSecretShot(
          t,
          pos.x,
          pos.y - 10,
          shotToX + offsetX,
          shotToY
        );
      });
    } else if (
      phaseElapsed >= shotHit &&
      phaseElapsed < shotHit + TRUE_END_PHASE4_HIT_FLASH_MS
    ) {
      const t = 1 - (phaseElapsed - shotHit) / TRUE_END_PHASE4_HIT_FLASH_MS;
      shotOffsets.forEach((offsetX) => {
        drawTrueEndingSecretHit(shotToX + offsetX, shotToY, t);
      });
    }
    if (phaseElapsed >= shotHit && phaseElapsed < shotHit + TRUE_END_PHASE4_DAMAGE_POPUP_MS) {
      drawTrueEndDamagePopups(shotToX, shotToY, phaseElapsed - shotHit);
    }

    if (currentLine) {
      if (currentLine.position === "top") {
        const visibleLines = getTypewriterVisibleLines(
          currentLine.lines,
          phaseElapsed - lineStart
        );
        drawSecretDialogueTop(currentLine.name, currentLine.lines, visibleLines);
      } else {
        const visibleLines = getTypewriterVisibleLines(
          currentLine.lines,
          phaseElapsed - lineStart
        );
        drawSecretDialogueBottom(
          currentLine.name,
          currentLine.lines,
          visibleLines,
          curtainH,
          TRUE_END_PHASE4_BOTTOM_Y_OFFSET
        );
      }
    }

    const phaseDur = TRUE_END_PHASE_DURATIONS[4];
    const fadeStart = Math.max(0, phaseDur - TRUE_END_PHASE4_FADE_DURATION);
    if (phaseElapsed >= fadeStart) {
      const t = Math.min(1, (phaseElapsed - fadeStart) / TRUE_END_PHASE4_FADE_DURATION);
      ctx.save();
      ctx.globalAlpha = t;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, GAME.width, GAME.height);
      ctx.restore();
    }
  }

  if (phase === 2) {
    const lineIndex = Math.min(
      TRUE_END_PHASE2_LINES.length - 1,
      Math.floor(phaseElapsed / TRUE_END_PHASE2_LINE_MS)
    );
    const currentLine = TRUE_END_PHASE2_LINES[lineIndex];
    if (currentLine) {
      drawTrueEndingPhase2Subtitle(
        currentLine.speaker,
        currentLine.text,
        curtainH
      );
    }
  }

  if (phase === 5) {
    const creditRows = getTrueEndCreditRows();
    const scrollSpeed = 20 / 1000;
    let baseY = GAME.height + 40 - phaseElapsed * scrollSpeed;
    const trueEndY = baseY + getTrueEndCreditFinalOffset(creditRows);
    const centerY = GAME.height / 2;
    if (!GAME.trueEndCreditStopAt && Math.abs(trueEndY - centerY) < 6) {
      GAME.trueEndCreditStopAt = GAME.time;
      GAME.trueEndCreditStopBaseY = centerY - getTrueEndCreditFinalOffset(creditRows);
    }
    if (GAME.trueEndCreditStopAt) {
      baseY = GAME.trueEndCreditStopBaseY;
    }
    drawTrueEndCreditRows(creditRows, baseY);
    const t = Math.min(1, phaseElapsed / TRUE_END_FADE_DURATION);
    if (t < 1) {
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, GAME.width, GAME.height);
      ctx.restore();
    }
  }

  if (phase >= 6) {
    if (!GAME.trueEndResultStart) {
      GAME.trueEndResultStart = GAME.time;
    }
    GAME.resultStartTime = GAME.trueEndResultStart;
    const trueEndResult = {
      score: TRUE_END_RESULT_SCORE,
      cleared: true,
      sceneName: "True End",
      isTrueEnd: true,
    };
    if (!GAME.trueEndResultPublished) {
      GAME.trueEndResultPublished = true;
      publishResultSummary(trueEndResult);
    }
    drawResult({
      ...trueEndResult,
    });
  }
}

function drawPlayer() {
  const isInvincible = GAME.time < GAME.invincibleUntil;
  if (isInvincible && Math.floor(GAME.time / 120) % 2 === 0) return;
  const currentImg = playerImages[GAME.currentMayousaIndex];
  if (currentImg && isImageReady(currentImg)) {
    const drawSize = Math.max(GAME.player.w, PLAYER_DRAW_SIZE);
    const scale = Math.min(
      drawSize / currentImg.naturalWidth,
      drawSize / currentImg.naturalHeight
    );
    const drawW = currentImg.naturalWidth * scale;
    const drawH = currentImg.naturalHeight * scale;
    const x = GAME.player.x + GAME.player.w / 2 - drawW / 2;
    const y = GAME.player.y + GAME.player.h / 2 - drawH / 2;
    ctx.drawImage(currentImg, x, y, drawW, drawH);
  } else {
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(
      GAME.player.x + GAME.player.w / 2 - PLAYER_DRAW_SIZE / 2,
      GAME.player.y + GAME.player.h / 2 - PLAYER_DRAW_SIZE / 2,
      PLAYER_DRAW_SIZE,
      PLAYER_DRAW_SIZE
    );
  }
}

function drawObstacles() {
  const luma = bgLumas[bgState.currentIndex];
  const useLight = (luma ?? BG_FALLBACK_LUMA) <= BG_LUMA_THRESHOLD;
  const fillColor = useLight ? OBSTACLE_LIGHT : OBSTACLE_DARK;
  const strokeColor = useLight ? OBSTACLE_STROKE_LIGHT : OBSTACLE_STROKE_DARK;
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  const isPaused = ENABLE_MILESTONE_FX && GAME.pauseUntil && GAME.time < GAME.pauseUntil;
  if (isPaused) ctx.globalAlpha = PAUSE_OBSTACLE_ALPHA;
  GAME.obstacles.forEach((o) => {
    if (
      o.kind === "bullet" ||
      o.kind === "bigBullet" ||
      o.kind === "snapshotBullet" ||
      o.kind === "ceilingBullet"
    ) {
      const cx = o.x + o.w / 2;
      const cy = o.y + o.h / 2;
      const r = Math.min(o.w, o.h) / 2;
      ctx.fillStyle = o.fill ?? fillColor;
      ctx.strokeStyle = o.stroke ?? strokeColor;
      ctx.lineWidth = o.strokeWidth ?? (o.kind === "bigBullet" ? 3 : 2);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      return;
    }
    if (isImageReady(obstacleImage)) {
      const scale = Math.min(
        o.w / obstacleImage.naturalWidth,
        o.h / obstacleImage.naturalHeight
      );
      const drawW = obstacleImage.naturalWidth * scale;
      const drawH = obstacleImage.naturalHeight * scale;
      const x = o.x + (o.w - drawW) / 2;
      const y = o.y + (o.h - drawH) / 2;
      ctx.drawImage(obstacleImage, x, y, drawW, drawH);
    } else {
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
  });
  if (isPaused) ctx.globalAlpha = 1;
}

function drawEnemy() {
  if (
    GAME.state !== "play" &&
    GAME.state !== "end_dialog" &&
    GAME.state !== "result_fade"
  ) {
    return;
  }
  const timeSec = GAME.time / 1000;
  const bob = Math.sin(timeSec * 2.2) * 4;
  const x = EMITTER_X();
  const y = EMITTER_Y + bob;
  GAME.enemy.x = x;
  GAME.enemy.y = y;
  const scale = ENEMY_SCALE;
  const drawW = GAME.enemy.w * scale;
  const drawH = GAME.enemy.h * scale;
  const drawX = GAME.enemy.x - drawW / 2;
  const drawY = GAME.enemy.y - drawH / 2;
  const r = drawW / 2;
  ctx.save();
  const isTalkPhase =
    GAME.state === "end_dialog" ||
    GAME.state === "result_fade" ||
    (!GAME.hasStartedOnce && GAME.elapsedFromStart < GAME.startDelayMs);
  const enemyImg = isTalkPhase ? enemyImageTalk : enemyImageAttack;
  if (isImageReady(enemyImg)) {
    ctx.drawImage(enemyImg, drawX, drawY, drawW, drawH);
  } else {
    ctx.fillStyle = "#3a314a";
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f7f1df";
    ctx.beginPath();
    ctx.arc(x - 6, y - 2, 2.6, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 2, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.arc(x, y + 6, 5, Math.PI, 0);
    ctx.fill();
  }
  ctx.restore();
}

function drawHUD() {
  if (
    GAME.state === "result" ||
    GAME.state === "result_fade" ||
    GAME.state === "end_dialog" ||
    GAME.state === "secret"
  ) {
    return;
  }
  ctx.fillStyle = COLORS.text;
  ctx.font = `16px ${FONT_FAMILY}`;
  ctx.fillText(`距離: ${Math.floor(GAME.distance)} / ${GAME.goalDistance}`, 16, 28);

  const maxLives = MAYOUSA_PARTY.length;
  const lifeSize = 42;
  const lifeGap = 2;
  const lifeY = 30;
  const lifeRightMargin = 12;
  let startX =
    GAME.width -
    lifeRightMargin -
    lifeSize / 2 -
    (maxLives - 1) * (lifeSize + lifeGap);
  if (maxLives <= 0) return;
  const lostCount = maxLives - GAME.lives;
  for (let i = 0; i < maxLives; i += 1) {
    const x = startX + i * (lifeSize + lifeGap);
    const iconIndex = maxLives - 1 - i;
    const isLost = i >= maxLives - lostCount;
    const isActive = !isLost;
    const alpha = isActive ? 1 : 0.35;
    drawMayousaIcon(x, lifeY, lifeSize, alpha, isActive, iconIndex);
  }
}

function drawMilestoneFx() {
  if (!milestoneFx.startTime) return;
  const elapsed = GAME.time - milestoneFx.startTime;
  if (elapsed > MILESTONE_DURATION) return;

  const progress = Math.min(1, Math.max(0, elapsed / MILESTONE_DURATION));
  const scale = 1.2 - 0.2 * progress;
  const alpha = 1 - progress;
  const text = `${milestoneFx.value}点突破!`;

  ctx.save();
  ctx.translate(GAME.width / 2, GAME.height / 2);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  ctx.font = `bold 32px ${FONT_FAMILY}`;
  ctx.fillStyle = COLORS.accent;
  ctx.textAlign = "center";
  ctx.fillText(text, 0, 0);
  ctx.restore();

  if (elapsed <= MILESTONE_FLASH_DURATION) {
    if (bgState.nextIndex != null) return;
    const flashAlpha = 0.35 * (1 - elapsed / MILESTONE_FLASH_DURATION);
    ctx.save();
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, GAME.width, GAME.height);
    ctx.restore();
  }
}

function drawMayousaMessage() {
  if (!GAME.lastMessage || GAME.time > GAME.messageUntil) return;
  const remaining = GAME.messageUntil - GAME.time;
  const alpha = Math.min(1, remaining / 200);
  const x = GAME.width / 2;
  const y = GAME.height * 0.6;
  ctx.font = `bold 16px ${FONT_FAMILY}`;
  const metrics = ctx.measureText(GAME.lastMessage);
  const textW = metrics.width;
  const paddingX = 12;
  const paddingY = 8;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(
    x - textW / 2 - paddingX,
    y - 16 - paddingY,
    textW + paddingX * 2,
    22 + paddingY * 2
  );
  ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
  ctx.lineWidth = 3;
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "center";
  ctx.strokeText(GAME.lastMessage, x, y);
  ctx.fillText(GAME.lastMessage, x, y);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawStartDialog() {
  if (GAME.state !== "play") return;
  const elapsed = GAME.time - GAME.startAt;
  if (elapsed < 0 || elapsed >= GAME.startDelayMs) return;
  const isRetry = GAME.startDialogMode === "retry";
  let text = "";
  let y = GAME.height * 0.75;
  if (isRetry) {
    if (elapsed < 1400) {
      text = "急がなきゃ～！";
    } else {
      return;
    }
  } else if (elapsed < 1800) {
    text = "遅刻しちゃうよ～！";
  } else if (elapsed < 3600) {
    text = "今日もパーティクル出してくよ～！";
    y = GAME.height * 0.22;
  } else {
    text = "どいてどいて～～～！！！";
  }
  const x = GAME.width / 2;
  ctx.save();
  ctx.font = `bold 18px ${FONT_FAMILY}`;
  const textW = ctx.measureText(text).width;
  const paddingX = 14;
  const paddingY = 8;
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(
    x - textW / 2 - paddingX,
    y - 18 - paddingY,
    textW + paddingX * 2,
    24 + paddingY * 2
  );
  ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
  ctx.lineWidth = 3;
  ctx.fillStyle = "#f7f1df";
  ctx.textAlign = "center";
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawEndDialog() {
  if (GAME.state !== "end_dialog") return;
  const elapsed = GAME.time - GAME.endDialogStart;
  const index = Math.floor(elapsed / END_DIALOG_LINE_MS);
  const dialogueLines = GAME.endDialogLines || [];
  if (index < 0 || index >= dialogueLines.length) return;
  const entry = dialogueLines[index];
  const isEnemy = entry.speaker === "enemy";
  const textColor = isEnemy ? "#d28cff" : "#ffffff";
  const x = GAME.width / 2;
  const y = isEnemy ? GAME.height * 0.22 : GAME.height * 0.75;
  const maxW = GAME.width * 0.72;

  ctx.save();
  ctx.font = `bold 18px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  const lines = entry.text.split("\n").filter((l) => l.trim().length > 0);

  const lineHeight = 22;
  const textH = lines.length * lineHeight;
  const paddingX = 14;
  const paddingY = 10;
  const textW = Math.max(...lines.map((l) => ctx.measureText(l).width));
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(
    x - textW / 2 - paddingX,
    y - lineHeight - paddingY,
    textW + paddingX * 2,
    textH + paddingY * 2
  );
  ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
  ctx.lineWidth = 3;
  ctx.fillStyle = textColor;
  lines.forEach((l, i) => {
    const ly = y + i * lineHeight;
    ctx.strokeText(l, x, ly);
    ctx.fillText(l, x, ly);
  });
  ctx.restore();
}

function drawResultTicketFallback(x, y, w, h) {
  const radius = 16;
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.strokeStyle = "rgba(60, 70, 90, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 220, 120, 0.8)";
  for (let i = 0; i < 6; i += 1) {
    const sx = x + 24 + i * 18;
    const sy = y + 18;
    ctx.beginPath();
    ctx.arc(sx, sy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTitle() {
  const hasBg = isImageReady(titleBg);
  const hasChar = isImageReady(titleChar);
  const hasBubbleBase = isImageReady(titleBubbleBase);
  const hasBubbleText = isImageReady(titleBubbleText);
  const timeSec = GAME.time / 1000;
  const floatY = Math.sin(timeSec * 1.2) * 6;
  const titleElapsed = Math.max(0, (GAME.time - GAME.titleStartTime) / 1000);
  const charAlpha = Math.min(1, Math.max(0, titleElapsed / 0.8));
  const bubbleStart = 0.9;
  const bubblePopDuration = 0.4;
  const bubbleTextStart = 1.4;
  const logoStart = 2.7;
  const logoDuration = 0.8;
  const logoAlpha = Math.min(1, Math.max(0, (titleElapsed - logoStart) / logoDuration));
  const startAlpha = Math.min(1, Math.max(0, (titleElapsed - 3.2) / 0.6));
  let popScale = 0;
  if (titleElapsed >= bubbleStart) {
    const t = Math.min(1, (titleElapsed - bubbleStart) / bubblePopDuration);
    const ease = 1 - (1 - t) * (1 - t);
    const peak = 1.05;
    const base = 0.85;
    popScale = t < 0.45
      ? base + (peak - base) * (ease / 0.45)
      : peak + (1 - peak) * ((ease - 0.45) / 0.55);
  }

  if (hasBg) {
    const imgW = titleBg.naturalWidth;
    const imgH = titleBg.naturalHeight;
    const coverScale = Math.max(GAME.width / imgW, GAME.height / imgH);
    const drawW = imgW * coverScale;
    const drawH = imgH * coverScale;
    const x = (GAME.width - drawW) / 2;
    const y = (GAME.height - drawH) / 2;
    ctx.drawImage(titleBg, x, y, drawW, drawH);
  } else {
    const stripeHeight = 60;
    for (let y = -stripeHeight; y < GAME.height + stripeHeight; y += stripeHeight) {
      const isEven = (y / stripeHeight) % 2 === 0;
      ctx.fillStyle = isEven ? "#121622" : "#181c28";
      ctx.fillRect(0, y, GAME.width, stripeHeight);
    }
  }

  if (isImageReady(titleBg1) && isImageReady(titleBg2) && isImageReady(titleText)) {
    const maxW = GAME.width * 0.88;
    const baseScale = maxW / titleText.naturalWidth;
    const drawW = titleText.naturalWidth * baseScale;
    const drawH = titleText.naturalHeight * baseScale;
    const y = Math.max(14, Math.min(22, GAME.height * 0.11));
    const x = (GAME.width - drawW) / 2;
    const centerX = x + drawW / 2;
    const centerY = y + drawH / 2;
    const bg1Pulse = 0.85 + 0.15 * Math.sin(timeSec * (Math.PI * 2) / 1.6);
    const bg2Rot = (Math.PI / 180) * (3 * Math.sin(timeSec * (Math.PI * 2) / 3.0));

    ctx.save();
    ctx.globalAlpha = logoAlpha;
    ctx.translate(centerX, centerY);
    ctx.rotate(bg2Rot);
    ctx.drawImage(titleBg2, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = logoAlpha * bg1Pulse;
    ctx.drawImage(titleBg1, x, y, drawW, drawH);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = logoAlpha;
    ctx.drawImage(titleText, x, y, drawW, drawH);
    ctx.restore();
  }

  if (hasChar) {
    const baseW = 180;
    const scale = baseW / titleChar.naturalWidth;
    const drawW = titleChar.naturalWidth * scale;
    const drawH = titleChar.naturalHeight * scale;
    const baseOffsetY = 135;
    const margin = 36;
    const range = Math.max(0, GAME.width / 2 - margin - drawW / 2);
    const swayX = Math.sin(timeSec * 0.7) * range;
    const x = GAME.width / 2 - drawW / 2 + swayX;
    const y = GAME.height / 2 - drawH / 2 + floatY + baseOffsetY;
    ctx.save();
    ctx.globalAlpha = charAlpha;
    ctx.drawImage(titleChar, x, y, drawW, drawH);
    ctx.restore();

    if (hasBubbleBase && titleElapsed >= bubbleStart) {
      const bubbleW = 170;
      const bScale = bubbleW / titleBubbleBase.naturalWidth;
      const bubbleDrawW = titleBubbleBase.naturalWidth * bScale;
      const bubbleDrawH = titleBubbleBase.naturalHeight * bScale;
      const bubbleFloat = Math.sin(timeSec * 1.25) * 9;
      const bubbleX = x + drawW * 0.55 - bubbleDrawW / 2;
      const bubbleY = y - bubbleDrawH * 0.6 + bubbleFloat;
      ctx.save();
      ctx.translate(
        bubbleX + bubbleDrawW / 2,
        bubbleY + bubbleDrawH / 2
      );
      ctx.scale(popScale, popScale);
      ctx.globalAlpha = Math.min(1, popScale);
      ctx.drawImage(
        titleBubbleBase,
        -bubbleDrawW / 2,
        -bubbleDrawH / 2,
        bubbleDrawW,
        bubbleDrawH
      );
      ctx.restore();
      if (hasBubbleText && titleElapsed >= bubbleTextStart) {
        const wobble = 1.05 + 0.05 * Math.sin(timeSec * (Math.PI * 2) / 1.0);
        ctx.save();
        ctx.translate(bubbleX + bubbleDrawW / 2, bubbleY + bubbleDrawH / 2);
        ctx.scale(wobble, wobble);
        ctx.drawImage(
          titleBubbleText,
          -bubbleDrawW / 2,
          -bubbleDrawH / 2,
          bubbleDrawW,
          bubbleDrawH
        );
        ctx.restore();
      }
    }
  } else {
    const swayX = Math.sin(timeSec * 0.7) * 12;
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(
      GAME.width / 2 - 24 + swayX,
      GAME.height / 2 - 24 + floatY + 135,
      48,
      48
    );
  }

  ctx.fillStyle = COLORS.text;
  ctx.font = `bold 28px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  if (!isImageReady(titleText)) {
    ctx.fillText("Scroll Runner", GAME.width / 2, 90);
  }
  const pulse = 0.6 + 0.4 * Math.sin(timeSec * (Math.PI * 2) / 0.9);
  ctx.font = `bold 28px ${FONT_FAMILY}`;
  ctx.fillStyle = "#fff3c4";
  ctx.globalAlpha = startAlpha * pulse;
  ctx.fillText("Enterで開始！", GAME.width / 2, GAME.height - 62);
  ctx.globalAlpha = 1;

  const linkMainFont = `bold 10px ${FONT_FAMILY}`;
  const linkMainSize = 11;
  const linkPaddingX = 7;
  const linkPaddingY = 6;
  const linkRightMargin = 18;
  const linkBottomMargin = 18;

  const secret = titleUiElements.find((el) => el.id === "secret");
  if (secret) {
    secret.visible = isTrueEndUnlocked();
    secret.enabled = isTrueEndUnlocked();
  }

  const drawTitleLink = (id, text, x, y) => {
    ctx.fillStyle = "#f7f1df";
    ctx.font = linkMainFont;
    const w = ctx.measureText(text).width + linkPaddingX * 2;
    const h = linkMainSize + linkPaddingY * 2;
    ctx.fillText(text, x + w / 2, y + linkPaddingY + linkMainSize);
    ctx.strokeStyle = "rgba(247, 241, 223, 0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    const el = titleUiElements.find((item) => item.id === id);
    if (el) {
      el.rect.x = x;
      el.rect.y = y;
      el.rect.w = w;
      el.rect.h = h;
      el.visible = true;
      el.enabled = true;
    }
    return { w, h };
  };

  const baseLinkY = GAME.height - linkBottomMargin - (linkMainSize + linkPaddingY * 2);
  drawTitleLink("official", "制作者サイトへ >", linkRightMargin, baseLinkY);
  const perfText = "公演情報へ >";
  ctx.font = linkMainFont;
  const perfW = ctx.measureText(perfText).width + linkPaddingX * 2;
  drawTitleLink("performance", perfText, GAME.width - linkRightMargin - perfW, baseLinkY);

  if (secret && secret.visible) {
    const secretText = "？？？";
    ctx.font = linkMainFont;
    ctx.fillStyle = "#f7f1df";
    const secretW = ctx.measureText(secretText).width;
    const secretBoxW = secretW + linkPaddingX * 2;
    const secretBoxH = linkMainSize + linkPaddingY * 2;
    const secretX = linkRightMargin;
    const secretY = baseLinkY - 28;
    const secretTextX = secretX + secretBoxW / 2;
    const secretTextY = secretY + linkPaddingY + linkMainSize;
    ctx.fillText(secretText, secretTextX, secretTextY);
    ctx.strokeStyle = "rgba(247, 241, 223, 0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(secretX, secretY, secretBoxW, secretBoxH);
    secret.rect.x = secretX;
    secret.rect.y = secretY;
    secret.rect.w = secretBoxW;
    secret.rect.h = secretBoxH;
  }

  ctx.textAlign = "left";
}

function drawSecret() {
  ctx.save();
  const SECRET_PLAYER_Y_OFFSET = 255;
  const centerY = GAME.height / 2 + SECRET_PLAYER_Y_OFFSET;
  drawSecretPlayers(centerY);
  drawSecretEnemy();

  ctx.textAlign = "left";
  ctx.restore();
}

function drawSecretPlayers(centerY, activeIndices = []) {
  const size = GAME.player.w * 2 * 0.7;
  const gap = 18;
  const secretOrder = [0, 1, 3, 4, 2];
  const count = secretOrder.length;
  const totalW = count * size + (count - 1) * gap;
  const startX = (GAME.width - totalW) / 2;
  const activeSet = new Set(activeIndices);
  const wobble = Math.sin(GAME.time / 160) * 3;

  for (let i = 0; i < count; i += 1) {
    const img = playerImages[secretOrder[i]];
    const x = startX + i * (size + gap);
    const yOffset = activeSet.has(i) ? wobble : 0;
    if (img && isImageReady(img)) {
      const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;
      const drawX = x + (size - drawW) / 2;
      const drawY = centerY - drawH / 2 + yOffset;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = COLORS.player;
      ctx.fillRect(x, centerY - size / 2 + yOffset, size, size);
    }
  }
}

function getSecretPlayerPositions(centerY) {
  const size = GAME.player.w * 2 * 0.7;
  const gap = 18;
  const secretOrder = [0, 1, 3, 4, 2];
  const count = secretOrder.length;
  const totalW = count * size + (count - 1) * gap;
  const startX = (GAME.width - totalW) / 2;
  return secretOrder.map((imgIndex, i) => ({
    imgIndex,
    x: startX + i * (size + gap) + size / 2,
    y: centerY,
  }));
}

function drawSecretEnemy(yOffset = 0) {
  if (!isImageReady(enemyImageSecret)) return;
  const scale = ENEMY_SCALE * 1.5;
  const drawW = GAME.enemy.w * scale;
  const drawH = GAME.enemy.h * scale;
  const drawX = GAME.width / 2 - drawW / 2;
  const drawY = GAME.height / 2 - drawH / 2 + 60 + yOffset;
  ctx.drawImage(enemyImageSecret, drawX, drawY, drawW, drawH);
}

function getPhase2ActiveIndices(speaker) {
  const mapping = {
    ハット: [0],
    グラサン: [1],
    りんご: [2],
    りぼん: [3],
    おはな: [4],
    全員: [0, 1, 2, 3, 4],
  };
  return mapping[speaker] || [];
}

function drawResult(overrides = null) {
  const scoreOverride =
    overrides && typeof overrides.score === "number" ? overrides.score : null;
  const clearedOverride =
    overrides && typeof overrides.cleared === "boolean" ? overrides.cleared : null;
  const sceneOverride =
    overrides && typeof overrides.sceneName === "string" ? overrides.sceneName : null;
  const isTrueEnd = !!(overrides && overrides.isTrueEnd);
  const cleared = clearedOverride != null ? clearedOverride : GAME.distance >= GAME.goalDistance;
  const baseScore = scoreOverride != null ? scoreOverride : Math.floor(GAME.distance);
  const bonus = scoreOverride != null ? 0 : cleared ? GAME.lives * LIFE_BONUS : 0;
  const finalScore =
    scoreOverride != null ? scoreOverride : Math.min(MAX_SCORE, baseScore + bonus);
  const elapsed = Math.max(0, GAME.time - (GAME.resultStartTime || GAME.time));
  const scoreDelay = RESULT_SCORE_DELAY;
  const scoreDuration = RESULT_SCORE_DURATION;
  const bonusStepInterval = RESULT_BONUS_STEP_INTERVAL;
  const bonusSettle = RESULT_BONUS_SETTLE;
  const retryPulsePeriod = 1000;
  const easeOut = (t) => 1 - (1 - t) * (1 - t);
  let displayBonus = 0;
  let bonusPulse = 1;
  let displayScore = 0;
  if (elapsed > scoreDelay) {
    const scoreT = Math.min(1, (elapsed - scoreDelay) / scoreDuration);
    const baseScoreDisplay = Math.floor(baseScore * easeOut(scoreT));
    let bonusHitCount = 0;
    if (bonus > 0 && scoreT >= 1) {
      const bonusElapsed = elapsed - scoreDelay - scoreDuration;
      const hitCountRaw = Math.ceil(bonus / 400);
      bonusHitCount = Math.min(6, hitCountRaw);
      if (bonusHitCount > 0) {
        const hitInterval = Math.max(
          260,
          bonusStepInterval - Math.max(0, bonusHitCount - 3) * 20
        );
        const hitsDone = Math.min(
          bonusHitCount,
          Math.floor(bonusElapsed / hitInterval)
        );
        displayBonus = Math.round((bonus * hitsDone) / bonusHitCount);
        const hitProgress = (bonusElapsed % hitInterval) / hitInterval;
        if (hitsDone < bonusHitCount && hitProgress < 0.35) {
          bonusPulse = 1.12;
        }
        if (hitsDone >= bonusHitCount && bonusElapsed < bonusHitCount * hitInterval + bonusSettle) {
          bonusPulse = 1.06;
        }
      }
    }
    displayScore = baseScoreDisplay + displayBonus;
    const baseDone = scoreT >= 1;
    const bonusDone =
      bonusHitCount === 0
        ? true
        : elapsed >= scoreDelay + scoreDuration + bonusHitCount * bonusStepInterval + bonusSettle;
    const resultAnimDone = baseDone && bonusDone;
    if (resultAnimDone) {
      const pulse = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin((elapsed / retryPulsePeriod) * Math.PI * 2));
      ctx.textAlign = "center";
      ctx.font = `bold 22px ${FONT_FAMILY}`;
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = 4;
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = pulse;
      const resultHelpText = canTapResultToTitle()
        ? "タップでタイトル / Rでリトライ"
        : "Rでリトライ / Tでタイトル";
      ctx.strokeText(resultHelpText, GAME.width / 2, GAME.height - 24);
      ctx.fillText(resultHelpText, GAME.width / 2, GAME.height - 24);
      ctx.globalAlpha = 1;
    }
  }
  if (bonus === 0) {
    displayBonus = 0;
  }
  displayScore = Math.min(finalScore, displayScore);
  const stageIndex = Math.min(SCENE_NAMES.length - 1, Math.floor(GAME.distance / 1000));
  const sceneName = sceneOverride || SCENE_NAMES[stageIndex] || "開演前";
  const titleText = TITLE_THRESHOLDS.find((t) => finalScore <= t.max)?.label || "";

  let ticketW = Math.min(GAME.width * 0.82, 320);
  let ticketH = GAME.height * 0.55;
  if (isImageReady(resultTicket)) {
    const targetH = GAME.height * 0.72;
    const scale = targetH / resultTicket.naturalHeight;
    ticketW = resultTicket.naturalWidth * scale;
    ticketH = resultTicket.naturalHeight * scale;
  }
  const ticketX = (GAME.width - ticketW) / 2;
  const uiBottomMargin = 140;
  const centerY = (GAME.height - uiBottomMargin) / 2;
  const ticketY = centerY - ticketH / 2;
  const centerX = ticketX + ticketW / 2;

  if (isImageReady(resultTicket)) {
    ctx.drawImage(resultTicket, ticketX, ticketY, ticketW, ticketH);
  }

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#f7f1df";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
  ctx.lineWidth = 4;
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 6;

  const stitchY = ticketY + ticketH * 0.7;
  const mainTopY = ticketY + ticketH * 0.155;
  const mainBottomY = stitchY - 14;
  let y = mainTopY;
  const pushRow = (text, font, step) => {
    ctx.font = font;
    ctx.strokeText(text, centerX, y);
    ctx.fillText(text, centerX, y);
    y += step;
  };
  const fontHeader = `bold 14px ${FONT_FAMILY}`;
  const fontLabel = `bold 16px ${FONT_FAMILY}`;
  const fontScene = `bold 18px ${FONT_FAMILY}`;
  const fontScoreLabel = `bold 14px ${FONT_FAMILY}`;
  const fontScoreNum = `bold 36px ${FONT_FAMILY}`;
  const fontSmall = `bold 14px ${FONT_FAMILY}`;
  const fontTitleLabel = `bold 14px ${FONT_FAMILY}`;
  const fontTitleText = `bold 14px ${FONT_FAMILY}`;
  const fontStub = `bold 12px ${FONT_FAMILY}`;
  const resultOffsetUnit = 8;
  const scoreLabelOffsetY = 8;

  ctx.save();
  ctx.fillStyle = "#f0e0b0";
  pushRow("Late Runner", fontHeader, 22);
  ctx.restore();
  y += 6;
  pushRow("到達シーン", fontLabel, 28);
  pushRow(`『${sceneName}』`, fontScene, 40);
  y += 16;

  y -= resultOffsetUnit * 1.55;
  ctx.font = fontScoreLabel;
  ctx.strokeText("score", centerX, y - scoreLabelOffsetY);
  ctx.fillText("score", centerX, y - scoreLabelOffsetY);
  y += 28;
  y -= resultOffsetUnit * 0.5;
  pushRow(String(displayScore), fontScoreNum, 48);
  y -= resultOffsetUnit;
  ctx.save();
  ctx.globalAlpha = Math.min(1, 0.9 + 0.1 * bonusPulse);
  ctx.font = fontSmall;
  ctx.strokeText(`BONUS+${displayBonus}`, centerX, y);
  ctx.fillText(`BONUS+${displayBonus}`, centerX, y);
  ctx.restore();
  y += 22;
  pushRow(`${GAME.lives}羽到着`, fontSmall, 34);
  y += 16;

  const maxTextW = ticketW * 0.78;
  const titleLines = [];
  let line = "";
  ctx.font = fontTitleText;
  for (const ch of titleText) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxTextW && line) {
      titleLines.push(line);
      line = ch;
      if (titleLines.length === 1) break;
    } else {
      line = test;
    }
  }
  if (line && titleLines.length < 2) titleLines.push(line);

  const remaining = mainBottomY - y;
  const labelH = 24;
  const lineH = 26;
  let maxLines = Math.floor((remaining - labelH) / lineH);
  maxLines = Math.max(0, Math.min(2, maxLines));
  if (maxLines > 0) {
    pushRow("称号", fontTitleLabel, labelH);
    titleLines.slice(0, maxLines).forEach((t) => {
      pushRow(`「${t}」`, fontTitleText, lineH);
    });
  }

  const hashY = stitchY + 34;
  const dateY = stitchY + 62;
  const endCountY = stitchY + 86;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateText = `${yyyy}/${mm}/${dd}`;
  ctx.font = fontStub;
  ctx.strokeText("#mayousa_late_run", centerX, hashY);
  ctx.fillText("#mayousa_late_run", centerX, hashY);
  ctx.strokeText(dateText, centerX, dateY);
  ctx.fillText(dateText, centerX, dateY);
  const endText = isTrueEndUnlocked() ? "True End 解放済み" : "";
  ctx.strokeText(endText, centerX, endCountY);
  ctx.fillText(endText, centerX, endCountY);
  ctx.restore();

  const timeSec = GAME.time / 1000;
  const floatY = Math.sin(timeSec * 1.2) * 4;
  const breathe = 1.01 + Math.sin(timeSec * 0.9) * 0.01;

  const leftX = 40;
  const rightX = GAME.width - 40;
  const baseY = GAME.height - 36;
  const charSize = 108;
  if (isTrueEnd) {
    const scaledSize = charSize * 0.7;
    const startX = leftX;
    const endX = GAME.width - 40 - charSize;
    const spacing = (endX - startX) / 4;
    for (let i = 0; i < playerImages.length; i += 1) {
      const img = playerImages[i];
      const x = startX + spacing * i;
      if (img && isImageReady(img)) {
        ctx.save();
        ctx.translate(x, baseY + floatY);
        ctx.scale(breathe, breathe);
        ctx.drawImage(img, 0, -scaledSize, scaledSize, scaledSize);
        ctx.restore();
      } else {
        ctx.fillStyle = COLORS.player;
        ctx.fillRect(x, baseY - scaledSize + floatY, scaledSize, scaledSize);
      }
    }
  } else {
    const leftImg = cleared ? playerImages[GAME.currentMayousaIndex] : resultMayousa;
    if (isImageReady(leftImg)) {
      ctx.save();
      ctx.translate(leftX, baseY + floatY);
      ctx.scale(breathe, breathe);
      ctx.drawImage(leftImg, 0, -charSize, charSize, charSize);
      ctx.restore();
    }
  }
  if (isImageReady(resultMayochan)) {
    ctx.save();
    ctx.translate(rightX, baseY + floatY * 0.8);
    ctx.scale(breathe, breathe);
    ctx.drawImage(resultMayochan, -charSize, -charSize, charSize, charSize);
    ctx.restore();
  }

  ctx.textAlign = "left";
}

function draw() {
  let shakeX = 0;
  let shakeY = 0;
  if (ENABLE_MILESTONE_FX && GAME.time < GAME.shakeUntil) {
    shakeX = (Math.random() * 2 - 1) * SHAKE_INTENSITY;
    shakeY = (Math.random() * 2 - 1) * SHAKE_INTENSITY;
  }
  ctx.clearRect(0, 0, GAME.width, GAME.height);
  if (shakeX || shakeY) ctx.save();
  if (shakeX || shakeY) ctx.translate(shakeX, shakeY);
  const isResultPhase = GAME.state === "result" || GAME.state === "result_fade";
  if (isResultPhase) {
    drawResultBackground();
  } else if (GAME.state === "secret") {
    drawSecretBackground();
  } else if (GAME.state === "true_ending") {
    // drawTrueEnding handles its own background
  } else {
    drawBackground();
  }

  if (GAME.state === "result_fade") {
    const fade = Math.max(0, 1 - (GAME.time - GAME.resultFadeStart) / RESULT_FADE_MS);
    ctx.save();
    ctx.globalAlpha = fade;
    drawEnemy();
    drawPlayer();
    ctx.restore();
  } else if (GAME.state !== "result") {
    if (GAME.state === "secret") {
      drawSecret();
      if (shakeX || shakeY) ctx.restore();
      return;
    }
    if (GAME.state === "true_ending") {
      drawTrueEnding();
      if (shakeX || shakeY) ctx.restore();
      return;
    }
    drawEnemy();
    if (GAME.state === "play" || GAME.state === "end_clearing") {
      drawObstacles();
    }
    if (GAME.state !== "result" && GAME.state !== "result_fade") {
      drawPlayer();
    }
  }
  drawStartDialog();
  drawHUD();
  if (ENABLE_MILESTONE_FX && GAME.state === "play") drawMilestoneFx();
  if (GAME.state === "play") drawMayousaMessage();
  drawEndDialog();

  if (GAME.state === "title") drawTitle();
  if (GAME.state === "secret") drawSecret();
  if (GAME.state === "result" || GAME.state === "result_fade") drawResult();
  if (GAME.time < GAME.hitFlashUntil) {
    const remaining = GAME.hitFlashUntil - GAME.time;
    const alpha = 0.35 * (1 - remaining / GAME.hitFlashDuration);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, GAME.width, GAME.height);
    ctx.restore();
  }
  if (shakeX || shakeY) ctx.restore();
}

function loop() {
  GAME.time = performance.now();
  GAME.elapsedFromStart = GAME.time - GAME.startAt;
  if (GAME.state !== GAME.prevState) {
    if (GAME.state === "title") {
      GAME.titleStartTime = GAME.time;
    }
    if (GAME.state === "result") {
      publishResultSummary();
    }
    GAME.prevState = GAME.state;
  }
  update();
  draw();
  requestAnimationFrame(loop);
}

function startGame() {
  const isFirstStart = !GAME.hasStartedOnce;
  GAME.startDelayMs = isFirstStart ? START_DELAY_FIRST : START_DELAY_RETRY;
  GAME.startDialogMode = isFirstStart ? "first" : "retry";
  resetGame();
  GAME.state = "play";
}

function getTitleUiHit(x, y) {
  for (const el of titleUiElements) {
    if (!el.visible || !el.enabled) continue;
    const r = el.rect;
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
      return el;
    }
  }
  return null;
}

function handleTitlePointer(clientX, clientY) {
  const { x, y } = getCanvasPoint(clientX, clientY);
  const hit = getTitleUiHit(x, y);
  if (hit) {
    hit.onClick();
  } else {
    startGame();
  }
}

function getCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = GAME.width / rect.width;
  const scaleY = GAME.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function setPointerDirection(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  const centerX = GAME.player.x + GAME.player.w / 2;
  const centerY = GAME.player.y + GAME.player.h / 2;
  const dx = point.x - centerX;
  const dy = point.y - centerY;
  const distance = Math.hypot(dx, dy);
  if (distance < 8) {
    GAME.pointerActive = false;
    GAME.pointerDx = 0;
    GAME.pointerDy = 0;
    return;
  }
  GAME.pointerActive = true;
  GAME.pointerDx = dx / distance;
  GAME.pointerDy = dy / distance;
}

function canTapResultToTitle() {
  if (GAME.state !== "result") return false;
  const elapsed = Math.max(0, GAME.time - (GAME.resultStartTime || GAME.time));
  const cleared = GAME.distance >= GAME.goalDistance;
  const bonus = cleared ? GAME.lives * LIFE_BONUS : 0;
  const bonusHitCount = bonus > 0 ? Math.min(6, Math.ceil(bonus / 400)) : 0;
  const bonusDuration =
    bonusHitCount === 0 ? 0 : bonusHitCount * RESULT_BONUS_STEP_INTERVAL + RESULT_BONUS_SETTLE;
  return elapsed >= RESULT_SCORE_DELAY + RESULT_SCORE_DURATION + bonusDuration + RESULT_TAP_ENABLE_DELAY;
}

function handleCanvasTap(clientX, clientY) {
  canvas.focus();
  if (GAME.state === "play") {
    clearMovementKeys();
    setPointerDirection(clientX, clientY);
    return true;
  }
  if (GAME.state === "title") {
    handleTitlePointer(clientX, clientY);
    return true;
  }
  if (GAME.state === "result" && canTapResultToTitle()) {
    backToTitle();
    return true;
  }
  return false;
}

function handleHiddenTestKey() {
  const now = performance.now();
  GAME.testKeyCount = now - GAME.testKeyLastAt <= 1600 ? GAME.testKeyCount + 1 : 1;
  GAME.testKeyLastAt = now;
  if (GAME.testKeyCount >= 5) {
    GAME.testMode = !GAME.testMode;
    if (GAME.testMode) unlockTrueEnd();
    GAME.testKeyCount = 0;
    console.info(`Mayousa test mode ${GAME.testMode ? "enabled" : "disabled"}`);
  }
}

function clearMovementKeys() {
  GAME.keys.left = false;
  GAME.keys.right = false;
  GAME.keys.up = false;
  GAME.keys.down = false;
  document.querySelectorAll("[data-key]").forEach((button) => {
    button.classList.remove("is-pressed");
  });
}

function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function backToTitle() {
  clearMovementKeys();
  GAME.obstacles = [];
  GAME.state = "title";
}

window.addEventListener("keydown", (e) => {
  if (isTypingTarget(e.target)) return;
  const movementKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "W", "a", "A", "s", "S", "d", "D"];
  if (GAME.state === "play" && movementKeys.includes(e.key)) {
    e.preventDefault();
  }
  if (e.key === "ArrowLeft") GAME.keys.left = true;
  if (e.key === "ArrowRight") GAME.keys.right = true;
  if (e.key === "ArrowUp") GAME.keys.up = true;
  if (e.key === "ArrowDown") GAME.keys.down = true;
  if (e.key === "w" || e.key === "W") GAME.keys.up = true;
  if (e.key === "s" || e.key === "S") GAME.keys.down = true;
  if (e.key === "a" || e.key === "A") GAME.keys.left = true;
  if (e.key === "d" || e.key === "D") GAME.keys.right = true;

  if (GAME.state === "title" && e.key === "Enter") {
    startGame();
  }

  if (e.key === "m" || e.key === "M") {
    handleHiddenTestKey();
  }

  if (e.key === "t" || e.key === "T") {
    if (
      GAME.state === "result" ||
      GAME.state === "result_fade" ||
      GAME.state === "secret" ||
      (GAME.state === "true_ending" && GAME.trueEndPhase >= 6)
    ) {
      backToTitle();
    }
  }

  if (GAME.state === "true_ending" && GAME.trueEndPhase >= 6) {
    if (e.key === "Enter" || e.key === "r" || e.key === "R") {
      backToTitle();
    }
  }

  if (GAME.state === "result" && (e.key === "r" || e.key === "R")) {
    startGame();
  }
});

canvas.addEventListener("pointerdown", (e) => {
  if (handleCanvasTap(e.clientX, e.clientY)) {
    e.preventDefault();
  }
});

canvas.addEventListener("pointerup", (e) => {
  if (GAME.state === "play") {
    GAME.pointerActive = false;
    e.preventDefault();
    return;
  }
  if (handleCanvasTap(e.clientX, e.clientY)) e.preventDefault();
});

canvas.addEventListener("pointercancel", () => {
  GAME.pointerActive = false;
});

canvas.addEventListener("pointermove", (e) => {
  if (GAME.state === "play") {
    e.preventDefault();
    return;
  }
  if (GAME.state !== "title") {
    canvas.style.cursor = "";
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const scaleX = GAME.width / rect.width;
  const scaleY = GAME.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  const hit = getTitleUiHit(x, y);
  canvas.style.cursor = hit ? "pointer" : "";
});

canvas.addEventListener(
  "touchstart",
  (e) => {
    const touch = e.changedTouches && e.changedTouches[0];
    if (!touch) return;
    if (handleCanvasTap(touch.clientX, touch.clientY)) {
      e.preventDefault();
    }
  },
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  (e) => {
    if (GAME.state === "play") {
      GAME.pointerActive = false;
      e.preventDefault();
    }
  },
  { passive: false }
);

canvas.addEventListener("click", (e) => {
  if (GAME.state === "play") {
    e.preventDefault();
    return;
  }
  if (handleCanvasTap(e.clientX, e.clientY)) {
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  if (isTypingTarget(e.target)) return;
  if (e.key === "ArrowLeft") GAME.keys.left = false;
  if (e.key === "ArrowRight") GAME.keys.right = false;
  if (e.key === "ArrowUp") GAME.keys.up = false;
  if (e.key === "ArrowDown") GAME.keys.down = false;
  if (e.key === "w" || e.key === "W") GAME.keys.up = false;
  if (e.key === "s" || e.key === "S") GAME.keys.down = false;
  if (e.key === "a" || e.key === "A") GAME.keys.left = false;
  if (e.key === "d" || e.key === "D") GAME.keys.right = false;
});

window.addEventListener("blur", clearMovementKeys);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearMovementKeys();
});

document.querySelectorAll("[data-key]").forEach((button) => {
  const key = button.dataset.key;
  const setPressed = (pressed) => {
    GAME.keys[key] = pressed;
    button.classList.toggle("is-pressed", pressed);
  };
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    setPressed(true);
  });
  button.addEventListener("pointerup", (e) => {
    e.preventDefault();
    setPressed(false);
  });
  button.addEventListener("pointercancel", () => setPressed(false));
  button.addEventListener("lostpointercapture", () => setPressed(false));
});

document.querySelector("[data-action='start']")?.addEventListener("click", () => {
  if (GAME.state === "title" || GAME.state === "result") {
    startGame();
  } else if (GAME.state === "true_ending" && GAME.trueEndPhase >= 6) {
    GAME.state = "title";
  }
});

loop();
