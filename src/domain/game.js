// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { normalizeNotebookMarks } from "./notebook.js";
const cloneGameData = (e) => JSON.parse(JSON.stringify(e));
const createEntityId = (e) =>
  `${e}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const hasOwn = (e, t) => Object.prototype.hasOwnProperty.call(e, t);
const isTravelerSeat = (e) => {
  var t;
  return ["traveler", "traveller", "旅行者"].includes(null == (t = e.role) ? void 0 : t.team);
};
function failGameRule(message) {
  throw new Error(message);
}
function requireSeatIndex(session, seatId) {
  const i = session.seats.findIndex((e) => e.id === seatId);
  return (i < 0 && failGameRule("找不到这个座位，请重新选择"), i);
}
function requireFiniteNumber(value, label) {
  const i = Number(value);
  return (Number.isFinite(i) || failGameRule(`${label}必须是有效数字`), i);
}
function requireInteger(value, label) {
  const i = requireFiniteNumber(value, label);
  return (Number.isInteger(i) || failGameRule(`${label}必须是整数`), i);
}
function createSeat() {
  return {
    id: createEntityId("seat"),
    role: null,
    alive: true,
    ghostVote: true,
    tokens: [],
  };
}
function resetGame(session) {
  const t = cloneGameData(session);
  return (
    (t.id = createEntityId("game")),
    (t.mode = "phased"),
    (t.stage = 0),
    (t.furthestStage = 0),
    (t.ended = false),
    (t.reviewWinner = ""),
    (t.revealedSeatIds = []),
    (t.pendingExecutionId = null),
    (t.votes = []),
    (t.executions = []),
    (t.bluffRoles = [null, null, null]),
    (t.fabledRoles = []),
    (t.notebook = ""),
    (t.notebookMarks = []),
    (t.timerEndsAt = null),
    (t.seats = t.seats.map((e) => ({
      ...e,
      role: null,
      alive: true,
      ghostVote: true,
      tokens: [],
    }))),
    t
  );
}
function revealReviewSeat(session, seatId) {
  session.ended || failGameRule("请先结束本局并进入复盘模式");
  requireSeatIndex(session, seatId);
  const i = cloneGameData(session);
  return ((i.revealedSeatIds = [...new Set([...(i.revealedSeatIds || []), seatId])]), i);
}
function updateSessionOptions(session, options) {
  const i = [
      "notebook",
      "zoom",
      "background",
      "layouts",
      "showNightOrder",
      "timerEndsAt",
      "scriptId",
      "ended",
    ],
    a = cloneGameData(session);
  for (const l of i) hasOwn(options, l) && (a[l] = cloneGameData(options[l]));
  return (
    hasOwn(options, "zoom") &&
      (a.zoom = Math.min(2, Math.max(0.5, requireFiniteNumber(options.zoom, "缩放")))),
    hasOwn(options, "notebook") && (a.notebook = String(options.notebook ?? "")),
    hasOwn(options, "notebookMarks")
      ? (a.notebookMarks = normalizeNotebookMarks(a.notebook, options.notebookMarks))
      : hasOwn(options, "notebook") && a.notebook !== session.notebook && (a.notebookMarks = []),
    hasOwn(options, "showNightOrder") && (a.showNightOrder = Boolean(options.showNightOrder)),
    hasOwn(options, "timerEndsAt") &&
      null !== options.timerEndsAt &&
      (a.timerEndsAt = requireFiniteNumber(options.timerEndsAt, "计时")),
    a
  );
}
function setBluffRole(session, slotIndex, role) {
  const a = requireInteger(slotIndex, "伪装位置");
  (a < 0 || a > 2) && failGameRule("伪装位置应在 0～2 之间");
  null == role ||
    ("object" == typeof role &&
      !Array.isArray(role) &&
      "string" == typeof role.id &&
      role.id.trim() &&
      "string" == typeof role.name &&
      role.name.trim() &&
      "string" == typeof role.team &&
      role.team.trim()) ||
    failGameRule("请选择有效的伪装角色");
  const l = cloneGameData(session);
  return (
    (l.bluffRoles = [0, 1, 2].map((e) => {
      var t;
      return (null == (t = l.bluffRoles) ? void 0 : t[e]) ?? null;
    })),
    (l.bluffRoles[a] = null == role ? null : cloneGameData(role)),
    l
  );
}
function addSeat(session) {
  session.seats.length >= 20 && failGameRule("最多支持 20 个座位（含旅行者）");
  const t = cloneGameData(session);
  return (t.seats.push(createSeat()), t);
}
function transferSeatLayouts(previousSession, nextSession) {
  var i;
  for (const a of ["portrait", "landscape"]) {
    const l = (null == (i = previousSession.layouts) ? void 0 : i[a]) ?? {},
      n = {};
    nextSession.seats.forEach((t, i) => {
      var a;
      const r = l[null == (a = previousSession.seats[i]) ? void 0 : a.id];
      r && (n[t.id] = cloneGameData(r));
    });
    nextSession.layouts[a] = n;
  }
}
function setSeatRole(session, seatId, role) {
  const a = requireSeatIndex(session, seatId),
    l = cloneGameData(session);
  return ((l.seats[a].role = null == role ? null : cloneGameData(role)), l);
}
function updateReminder(session, seatId, reminderId, changes) {
  const l = requireSeatIndex(session, seatId),
    n = cloneGameData(session),
    r = n.seats[l].tokens.find((e) => e.id === reminderId);
  if ((r || failGameRule("找不到这个标记"), hasOwn(changes, "label") || hasOwn(changes, "text"))) {
    const e = String(changes.label ?? changes.text ?? "").trim();
    e || failGameRule("请输入标记文字");
    r.label = e.slice(0, 80);
  }
  return (
    hasOwn(changes, "inverted") && (r.inverted = Boolean(changes.inverted)),
    hasOwn(changes, "image") && (r.image = changes.image),
    n
  );
}
function removeReminder(session, seatId, reminderId) {
  const a = requireSeatIndex(session, seatId),
    l = cloneGameData(session);
  return ((l.seats[a].tokens = l.seats[a].tokens.filter((e) => e.id !== reminderId)), l);
}
export {
  cloneGameData,
  createEntityId,
  hasOwn,
  isTravelerSeat,
  failGameRule,
  requireSeatIndex,
  requireFiniteNumber,
  requireInteger,
  createSeat,
  resetGame,
  revealReviewSeat,
  updateSessionOptions,
  setBluffRole,
  addSeat,
  transferSeatLayouts,
  setSeatRole,
  updateReminder,
  removeReminder,
};
