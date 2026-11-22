import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Resolve public functions through the checked-in map so tests stay independent
// of module grouping. Importing these functions must work without a DOM.
const moduleMap = JSON.parse(await readFile(new URL("../docs/module-map.json", import.meta.url), "utf8"));
const loadedModules = new Map();
async function loadSymbol(name) {
  assert.equal(typeof moduleMap[name], "string", `Missing public export ${name}`);
  const moduleUrl = new URL(`../src/${moduleMap[name]}`, import.meta.url).href;
  if (!loadedModules.has(moduleUrl)) loadedModules.set(moduleUrl, import(moduleUrl));
  const exports = await loadedModules.get(moduleUrl);
  assert.ok(name in exports, `Module map points to missing export ${name}`);
  return exports[name];
}

const symbols = Object.fromEntries(await Promise.all([
  "RAW_ROLES", "BUILT_IN_FABLED_ROLES", "builtInScripts", "normalizeRole", "normalizeRoleId",
  "isAllowedImageSource", "countSeats", "getRecommendedComposition", "describeStage", "changeStage",
  "setSeatRole", "updateReminder", "removeReminder", "resetGame", "updateSessionOptions",
  "toggleDraftVote", "calculateVoteTotals", "summarizeDayVotes", "getVoteOutcome",
  "createVoteDraft", "submitVoteRecord", "editVoteRecord", "deleteVoteRecord",
  "createSession", "migrateSession",
  "createIdentityDraw", "beginIdentityReveal", "pickIdentityCard", "completeIdentityReveal",
  "normalizeNotebookMarks", "replaceNotebookSelection", "isSessionData", "isScriptsData",
].map(async name => [name, await loadSymbol(name)])));
const {
  RAW_ROLES, BUILT_IN_FABLED_ROLES, builtInScripts, normalizeRole, normalizeRoleId,
  isAllowedImageSource, countSeats, getRecommendedComposition, describeStage, changeStage,
  setSeatRole, updateReminder, removeReminder, resetGame, updateSessionOptions,
  toggleDraftVote, calculateVoteTotals, summarizeDayVotes, getVoteOutcome,
  createVoteDraft, submitVoteRecord, editVoteRecord, deleteVoteRecord,
  createSession, migrateSession,
  createIdentityDraw, beginIdentityReveal, pickIdentityCard, completeIdentityReveal,
  normalizeNotebookMarks, replaceNotebookSelection, isSessionData, isScriptsData,
} = symbols;

const copy = value => structuredClone(value);
function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
  }
  return value;
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
const digest = value => createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");

const villager = { id: "chef", name: "厨师", team: "townsfolk", ability: "测试角色" };
const traveler = { id: "butler-test", name: "旅行者", team: "traveler", ability: "测试旅行者" };
function makeSeat(number, changes = {}) {
  return { id: `seat-${number}`, role: copy(villager), alive: true, ghostVote: true, tokens: [], ...changes };
}
function makeSession(seats = [makeSeat(1), makeSeat(2)]) {
  return {
    version: 1, id: "game-fixture", mode: "phased", stage: 0, furthestStage: 0,
    ended: false, reviewWinner: "", revealedSeatIds: [], scriptId: "tb", seats,
    pendingExecutionId: null, votes: [], executions: [], bluffRoles: [null, null, null],
    fabledRoles: [], notebook: "", notebookMarks: [], zoom: 1, background: "",
    layouts: { portrait: {}, landscape: {} }, showNightOrder: true, timerEndsAt: null,
  };
}

test("all original base and fabled role definitions survive the split unchanged", () => {
  assert.equal(RAW_ROLES.length, 313);
  assert.equal(BUILT_IN_FABLED_ROLES.length, 58);
  assert.equal(new Set(RAW_ROLES.map(role => normalizeRoleId(role.id))).size, 313);
  assert.equal(new Set(BUILT_IN_FABLED_ROLES.map(role => normalizeRoleId(role.id))).size, 58);
  // Golden digests were recorded by a static parser from the preserved original
  // bundle before refactoring. Sorting keys ignores formatting/property order.
  assert.equal(digest(RAW_ROLES), "ec86adc12260b7e285286195d6eea6e76192741516ecabb961ec9234a7ff5314");
  assert.equal(digest(BUILT_IN_FABLED_ROLES), "d3d07d536df219d5c30a5f1a2b0fa4475c57601ce90a3ba84242711a119332d5");
});

test("five built-in scripts retain IDs, order, abilities and night instructions", () => {
  const expected = [
    ["tb", "暗流涌动", 27, "7c284aa053059f6f8cd8f8246970b85bcd3b2858486bee71558ffc5f473907c2"],
    ["sv", "梦殒春宵", 30, "f30e0635e852a0105475b2dd6bb26323e0ae1ceaef072ae77aaa9b925c0f46a9"],
    ["bmr", "黯月初升", 30, "d734184fb8517c734a9e982854adfaa2cb82ba8f304a4a33d00e23f88f897bc0"],
    ["pleasure", "无上愉悦", 11, "b0a9ce2a71d5c2d5f1ba30008f376614e6a7e0a1748dc64a75da7661651302ac"],
    ["whispers", "窃窃私语", 11, "5138790058df3a101346e5369a43999afcc52469d6861c9db1b03fcc0a0db72a"],
  ];
  assert.equal(builtInScripts.length, expected.length);
  builtInScripts.forEach((script, index) => {
    const [id, name, count, hash] = expected[index];
    assert.equal(script.id, id);
    assert.equal(script.name, name);
    assert.equal(script.roles.length, count);
    const details = script.roles.map(role => ({
      id: role.id, name: role.name, team: role.team, ability: role.ability, image: role.image,
      firstNight: role.firstNight, otherNight: role.otherNight,
      firstNightReminder: role.firstNightReminder, otherNightReminder: role.otherNightReminder,
    }));
    assert.equal(digest(details), hash, `Original data changed in script ${id}`);
  });
});

test("role normalization accepts aliases, restores built-in details and rejects unsafe images", () => {
  assert.equal(normalizeRoleId("  Scarlet_Woman - "), "scarletwoman");
  const builtIn = normalizeRole("washerwoman");
  assert.equal(builtIn.name, "洗衣妇");
  assert.equal(builtIn.team, "townsfolk");
  assert.equal(builtIn.image, "/static/roles/washerwoman.webp");
  const custom = normalizeRole({ id: "my-role", name: " 自制 ", team: "旅行者", image: "javascript:alert(1)", reminders: [" 中毒 ", "中毒"], reminder: ["死亡"] });
  assert.equal(custom.name, "自制");
  assert.equal(custom.team, "traveler");
  assert.equal(custom.image, "/static/ui/default-role.webp");
  assert.deepEqual(custom.reminders, ["中毒", "死亡"]);
  assert.throws(() => normalizeRole("not-a-known-role"), /无法识别角色/);
  for (const source of ["javascript:alert(1)", "data:image/svg+xml;base64,AAAA", "/static/../private.webp", "file:///secret.png"]) assert.equal(Boolean(isAllowedImageSource(source)), false, source);
  for (const source of ["/static/roles/chef.webp", "https://example.test/role.png", "data:image/png;base64,AAAA"]) assert.equal(Boolean(isAllowedImageSource(source)), true, source);
});

test("composition counts ordinary players, travelers and living players separately", () => {
  assert.deepEqual(getRecommendedComposition(12), { townsfolk: 7, outsider: 2, minion: 2, demon: 1 });
  assert.deepEqual(getRecommendedComposition(5), { townsfolk: 3, outsider: 0, minion: 1, demon: 1 });
  assert.equal(getRecommendedComposition(16), null);
  const session = makeSession([makeSeat(1), makeSeat(2, { alive: false }), makeSeat(3, { role: traveler }), makeSeat(4, { role: { ...traveler, team: "旅行者" }, alive: false })]);
  assert.deepEqual(countSeats(session), { ordinary: 2, travelers: 2, aliveOrdinary: 1, aliveTravelers: 1, total: 4, alive: 2 });
});

test("first-night transition requires every role and preserves immutable stage history", () => {
  const incomplete = deepFreeze(makeSession([makeSeat(1, { role: null })]));
  assert.throws(() => changeStage(incomplete), /请先为所有座位分配角色/);
  const original = deepFreeze(makeSession());
  const firstNight = changeStage(original);
  assert.equal(firstNight.stage, 1);
  assert.equal(original.stage, 0);
  assert.deepEqual(describeStage(firstNight.stage), { index: 1, kind: "night", day: 1, label: "首夜" });
  const day = changeStage(firstNight);
  assert.equal(describeStage(day.stage).kind, "day");
  const previous = changeStage(day, -1);
  assert.equal(previous.stage, 1);
  assert.equal(previous.furthestStage, 2);
  assert.equal(describeStage(-1).kind, "setup");
  assert.throws(() => describeStage(1.5), /整数/);
  assert.throws(() => changeStage({ ...day, ended: true }), /本局已结束/);
});

test("moving from day to night executes only the pending seat and records it", () => {
  const session = deepFreeze({ ...makeSession(), stage: 2, furthestStage: 2, pendingExecutionId: "seat-2" });
  const night = changeStage(session);
  assert.equal(night.stage, 3);
  assert.equal(night.seats[0].alive, true);
  assert.equal(night.seats[1].alive, false);
  assert.equal(night.seats[1].ghostVote, true);
  assert.equal(night.pendingExecutionId, null);
  assert.equal(night.executions.length, 1);
  assert.equal(night.executions[0].seatId, "seat-2");
  assert.equal(night.executions[0].day, 1);
  assert.equal(session.seats[1].alive, true);
});

test("seat role and reminder edits return independent sessions", () => {
  const session = deepFreeze(makeSession([makeSeat(1, { tokens: [{ id: "reminder-1", label: "旧提示", inverted: false }] })]));
  const role = deepFreeze({ id: "imp", name: "小恶魔", team: "demon" });
  const assigned = setSeatRole(session, "seat-1", role);
  assert.deepEqual(assigned.seats[0].role, role);
  assert.notEqual(assigned.seats[0].role, role);
  assert.equal(session.seats[0].role.id, "chef");
  const edited = updateReminder(session, "seat-1", "reminder-1", { label: " 新提示 ", inverted: true });
  assert.equal(edited.seats[0].tokens[0].label, "新提示");
  assert.equal(edited.seats[0].tokens[0].inverted, true);
  assert.equal(session.seats[0].tokens[0].label, "旧提示");
  assert.deepEqual(removeReminder(edited, "seat-1", "reminder-1").seats[0].tokens, []);
  assert.throws(() => setSeatRole(session, "missing", role), /找不到这个座位/);
});

test("new game resets gameplay while preserving chosen script, layout and nicknames", () => {
  const old = deepFreeze({ ...makeSession([makeSeat(1, { nickname: "玩家甲", alive: false, ghostVote: false, tokens: [{ id: "a" }] })]), stage: 5, furthestStage: 6, ended: true, reviewWinner: "good", notebook: "笔记", timerEndsAt: 123, background: "image", zoom: 1.5, layouts: { portrait: { "seat-1": { x: 0.2, y: 0.3 } }, landscape: {} }, votes: [{ id: "vote-1" }] });
  const next = resetGame(old);
  assert.notEqual(next.id, old.id);
  assert.equal(next.stage, 0);
  assert.equal(next.ended, false);
  assert.deepEqual(next.votes, []);
  assert.equal(next.notebook, "");
  assert.equal(next.timerEndsAt, null);
  assert.deepEqual(next.bluffRoles, [null, null, null]);
  assert.deepEqual(next.seats[0], { id: "seat-1", nickname: "玩家甲", role: null, alive: true, ghostVote: true, tokens: [] });
  assert.equal(next.zoom, 1.5);
  assert.equal(next.background, "image");
  assert.equal(next.scriptId, old.scriptId);
  assert.deepEqual(next.layouts, old.layouts);
});

test("weighted votes and manual threshold overrides produce expected totals", () => {
  const vote = deepFreeze({ threshold: 3, people: [{ voted: true, weight: 3 }, { voted: true, weight: -1 }, { voted: false, weight: 100 }] });
  const result = calculateVoteTotals(vote);
  assert.equal(result.autoTotal, 2);
  assert.equal(result.total, 2);
  assert.equal(result.threshold, 3);
  const overridden = calculateVoteTotals({ ...vote, overrideThreshold: 1, overrideTotal: 8 });
  assert.equal(overridden.autoTotal, 2);
  assert.equal(overridden.threshold, 1);
  assert.equal(overridden.total, 8);
  assert.throws(() => calculateVoteTotals({ ...vote, overrideThreshold: -1 }), /门槛不能小于零/);
});

test("day vote summary distinguishes threshold failure, ties and repeated same nominee", () => {
  const a = { id: "vote-a", day: 1, nomineeId: "seat-1", total: 3, threshold: 3 };
  const b = { id: "vote-b", day: 1, nomineeId: "seat-2", total: 3, threshold: 3 };
  const session = { ...makeSession(), stage: 2, votes: [a, b] };
  const tie = summarizeDayVotes(session);
  assert.equal(tie.tied, true);
  assert.equal(tie.nomineeId, null);
  assert.equal(getVoteOutcome(a, tie), "tie");
  const repeated = summarizeDayVotes({ ...session, votes: [a, { ...a, id: "vote-c" }] });
  assert.equal(repeated.tied, false);
  assert.equal(repeated.nomineeId, "seat-1");
  const below = { ...a, total: 2 };
  assert.equal(summarizeDayVotes({ ...session, votes: [below] }).nomineeId, null);
  assert.equal(getVoteOutcome(below, tie), "below");
});

test("a dead player needs a remaining ghost vote or explicit override to vote", () => {
  const vote = deepFreeze({ people: [{ id: "dead", alive: false, ghostVote: false, voted: false }, { id: "ghost", alive: false, ghostVote: true, voted: false }] });
  assert.throws(() => toggleDraftVote(vote, "dead"), /已无鬼票/);
  assert.equal(toggleDraftVote(vote, "ghost").people[1].voted, true);
  const forced = toggleDraftVote(vote, "dead", { force: true });
  assert.equal(forced.people[0].voted, true);
  assert.equal(toggleDraftVote(forced, "dead").people[0].voted, false);
  assert.equal(vote.people[0].voted, false);
});

test("a nomination counts travelers for threshold and consumes a ghost vote only on submission", () => {
  const session = deepFreeze({ ...makeSession([
    makeSeat(1), makeSeat(2), makeSeat(3, { role: traveler }), makeSeat(4, { alive: false }),
  ]), stage: 2, furthestStage: 2 });
  const draft = createVoteDraft(session, "seat-1", "seat-2");
  assert.equal(draft.aliveCount, 3);
  assert.equal(draft.threshold, 2);
  assert.equal(draft.people.length, 4);
  assert.equal(session.seats[3].ghostVote, true);
  let voted = toggleDraftVote(draft, "seat-1");
  voted = toggleDraftVote(voted, "seat-4");
  assert.equal(session.seats[3].ghostVote, true, "an unfinished draft must not consume ghost votes");
  const submitted = submitVoteRecord(session, deepFreeze(voted));
  assert.equal(submitted.votes.length, 1);
  assert.equal(submitted.votes[0].total, 2);
  assert.equal(submitted.votes[0].appliedToCurrent, true);
  assert.equal(submitted.pendingExecutionId, "seat-2");
  assert.equal(submitted.seats[3].ghostVote, false);
  assert.equal(session.seats[3].ghostVote, true);
  assert.deepEqual(submitVoteRecord(deepFreeze(submitted), voted), submitted, "duplicate submission is idempotent");
  assert.throws(() => createVoteDraft(session, "seat-1", "seat-3"), /旅行者流放/);
  assert.throws(() => createVoteDraft({ ...session, stage: 1 }, "seat-1", "seat-2"), /切换到白天/);
});

test("a later tied nomination clears pending execution, while historical submissions do not alter current state", () => {
  const session = { ...makeSession(), stage: 2, furthestStage: 2 };
  let first = createVoteDraft(session, "seat-1", "seat-2");
  first = toggleDraftVote(first, "seat-1");
  const afterFirst = submitVoteRecord(session, first);
  assert.equal(afterFirst.pendingExecutionId, "seat-2");
  let second = createVoteDraft(afterFirst, "seat-2", "seat-1");
  second = toggleDraftVote(second, "seat-2");
  const afterTie = submitVoteRecord(afterFirst, second);
  assert.equal(summarizeDayVotes(afterTie).tied, true);
  assert.equal(afterTie.pendingExecutionId, null);
  const historical = deepFreeze({ ...makeSession([makeSeat(1), makeSeat(2, { alive: false })]), stage: 2, furthestStage: 4, pendingExecutionId: "seat-1" });
  const historyDraft = toggleDraftVote(createVoteDraft(historical, "seat-1", "seat-2"), "seat-2");
  assert.equal(historyDraft.applyToCurrent, false);
  const recorded = submitVoteRecord(historical, historyDraft);
  assert.equal(recorded.votes[0].appliedToCurrent, false);
  assert.equal(recorded.seats[1].ghostVote, true);
  assert.equal(recorded.pendingExecutionId, "seat-1");
});

test("editing or deleting vote history does not undo current life, ghost votes or pending execution", () => {
  const session = { ...makeSession([makeSeat(1), makeSeat(2, { alive: false })]), stage: 2, furthestStage: 2 };
  const draft = toggleDraftVote(createVoteDraft(session, "seat-1", "seat-2"), "seat-2");
  const recorded = deepFreeze(submitVoteRecord(session, draft));
  assert.equal(recorded.seats[1].ghostVote, false);
  assert.equal(recorded.pendingExecutionId, "seat-2");
  const edited = editVoteRecord(recorded, draft.id, { overrideTotal: 0 });
  assert.equal(edited.votes[0].total, 0);
  assert.equal(summarizeDayVotes(edited).nomineeId, null);
  assert.equal(edited.pendingExecutionId, "seat-2");
  assert.deepEqual(edited.seats, recorded.seats);
  assert.equal(recorded.votes[0].total, 1);
  const deleted = deleteVoteRecord(deepFreeze(edited), draft.id);
  assert.deepEqual(deleted.votes, []);
  assert.equal(deleted.pendingExecutionId, "seat-2");
  assert.deepEqual(deleted.seats, recorded.seats);
});

test("identity draw validates seat uniqueness, complete roles and ordinary-player limit", () => {
  assert.throws(() => createIdentityDraw([]), /1～20/);
  assert.throws(() => createIdentityDraw([makeSeat(1), makeSeat(1)]), /座位信息异常/);
  assert.throws(() => createIdentityDraw([makeSeat(1, { role: null })]), /请先为所有座位分配角色/);
  assert.throws(() => createIdentityDraw(Array.from({ length: 16 }, (_, i) => makeSeat(i + 1))), /普通玩家最多 15/);
  const state = createIdentityDraw([makeSeat(1), makeSeat(2)], { mode: "assigned", order: "reverse", onlyTeam: true });
  assert.equal(state.phase, "handoff");
  assert.equal(state.players[0].seatId, "seat-2");
  assert.equal(state.onlyTeam, true);
  assert.equal(beginIdentityReveal(deepFreeze(state)).phase, "pick");
  assert.throws(() => completeIdentityReveal(state), /请先查看并确认当前角色/);
});

test("assigned identity draw completes handoff, pick and conceal for every seat", () => {
  const imp = { id: "imp", name: "小恶魔", team: "demon" };
  const seats = deepFreeze([makeSeat(1), makeSeat(2, { role: imp }), makeSeat(3, { role: traveler })]);
  let state = createIdentityDraw(seats, { mode: "assigned", order: "reverse" });
  assert.throws(() => pickIdentityCard(state, "card-0"), /确认当前座位/);
  while (state.phase !== "complete") {
    const before = deepFreeze(state);
    const picking = beginIdentityReveal(before);
    assert.equal(before.phase, "handoff");
    const player = picking.players[picking.cursor];
    const cardId = picking.cards.find(card => !card.pickedSeatId).id;
    const reveal = pickIdentityCard(deepFreeze(picking), cardId, () => 0.99);
    assert.equal(reveal.phase, "reveal");
    assert.deepEqual(reveal.revealRole, seats.find(seat => seat.id === player.seatId).role);
    assert.equal(picking.cards.find(card => card.id === cardId).pickedSeatId, null);
    assert.equal(reveal.cards.find(card => card.id === cardId).pickedSeatId, player.seatId);
    state = completeIdentityReveal(deepFreeze(reveal));
    assert.equal(state.revealRole, null);
  }
  assert.equal(state.cursor, 3);
  assert.equal(state.assignments.length, 3);
  assert.equal(new Set(state.assignments.map(item => item.seatId)).size, 3);
  assert.ok(state.cards.every(card => card.pickedSeatId));
  assert.ok(state.pool.every(item => item.usedBy));
  assert.deepEqual(state.assignments.find(item => item.seatId === "seat-3").role, traveler);
});

test("random identity draw shuffles ordinary roles while keeping travelers fixed and cards single-use", () => {
  const imp = { id: "imp", name: "小恶魔", team: "demon" };
  let state = createIdentityDraw([makeSeat(1), makeSeat(2, { role: imp }), makeSeat(3, { role: traveler })], { mode: "random" });
  state = pickIdentityCard(beginIdentityReveal(state), "card-0", () => 0.99);
  assert.equal(state.assignments[0].role.id, "imp");
  state = beginIdentityReveal(completeIdentityReveal(state));
  assert.throws(() => pickIdentityCard(state, "card-0"), /已被领取/);
  assert.throws(() => pickIdentityCard(state, "missing"), /已被领取/);
  state = pickIdentityCard(state, "card-1", () => 0.99);
  assert.equal(state.assignments[1].role.id, "chef");
  state = pickIdentityCard(beginIdentityReveal(completeIdentityReveal(state)), "card-2", () => 0.99);
  assert.equal(state.assignments[2].role.team, "traveler");
  assert.equal(completeIdentityReveal(state).phase, "complete");
});

test("notebook marks are clipped, merged and made nonoverlapping without mutating input", () => {
  const marks = deepFreeze([{ start: -3, end: 2, team: "townsfolk" }, { start: 2, end: 5, team: "townsfolk" }, { start: 4, end: 8, team: "minion" }, { start: 8, end: 99, team: "demon" }, { start: 0, end: 10, team: "unknown" }, { start: 5, end: 5, team: "outsider" }]);
  assert.deepEqual(normalizeNotebookMarks("0123456789", marks), [{ start: 0, end: 5, team: "townsfolk" }, { start: 5, end: 8, team: "minion" }, { start: 8, end: 10, team: "demon" }]);
  assert.equal(marks[0].start, -3);
});

test("notebook replacement maintains annotation positions, cursor and text limit", () => {
  const originalMarks = deepFreeze([{ start: 1, end: 5, team: "townsfolk" }]);
  const edit = replaceNotebookSelection("abcdef", originalMarks, 2, 4, "XY");
  assert.equal(edit.text, "abXYef");
  assert.equal(edit.cursor, 4);
  assert.deepEqual(edit.marks, [{ start: 1, end: 5, team: "townsfolk" }]);
  const newline = replaceNotebookSelection("ab", [], 1, 1, "\r\n", "demon");
  assert.equal(newline.text, "a\nb");
  assert.deepEqual(newline.marks, [{ start: 1, end: 2, team: "demon" }]);
  assert.equal(replaceNotebookSelection("x".repeat(30000), [], 30000, 30000, "extra").text.length, 30000);
  const cleared = updateSessionOptions({ ...makeSession(), notebook: "abcdef", notebookMarks: originalMarks }, { notebook: "new" });
  assert.deepEqual(cleared.notebookMarks, []);
});

test("session validation retains legacy optional fields but rejects duplicate seats", () => {
  const minimalLegacy = { mode: "phased", stage: 0, scriptId: "tb", seats: [makeSeat(1)], votes: [] };
  assert.equal(isSessionData(minimalLegacy), true);
  assert.equal(isSessionData({ ...minimalLegacy, seats: [makeSeat(1), makeSeat(1)] }), false);
  assert.equal(isSessionData({ ...minimalLegacy, bluffRoles: [null] }), false);
  assert.equal(isSessionData({ ...minimalLegacy, fabledRoles: [{ instanceId: "f1", id: "angel", name: "天使", team: "fabled", ability: "" }] }), true);
  assert.equal(isScriptsData([{ id: "legacy", name: "旧剧本", roles: [{ id: "role", name: "旧角色", team: "townsfolk" }] }]), true);
});

test("session creation provides original defaults and migration preserves legacy free-mode data", () => {
  const created = createSession();
  assert.equal(created.mode, "phased");
  assert.equal(created.version, 1);
  assert.equal(created.stage, 0);
  assert.equal(created.scriptId, "tb");
  assert.equal(created.seats.length, 12);
  assert.equal(new Set(created.seats.map(seat => seat.id)).size, 12);
  assert.ok(created.seats.every(seat => seat.role === null && seat.alive && seat.ghostVote && seat.tokens.length === 0));
  assert.deepEqual(created.bluffRoles, [null, null, null]);
  assert.equal(isSessionData(created), true);
  assert.throws(() => createSession({ seatCount: 0 }), /1～20/);
  assert.throws(() => createSession({ seatCount: 21 }), /1～20/);
  assert.throws(() => createSession({ seatCount: 1.5 }), /整数/);
  const legacy = deepFreeze({ mode: "free", stage: 2, scriptId: "legacy-script", seats: [makeSeat(1)], votes: [], notebook: "笔记", notebookMarks: [{ start: -5, end: 50, team: "demon" }] });
  const migrated = migrateSession(legacy);
  assert.equal(migrated.mode, "phased");
  assert.equal(migrated.scriptId, "legacy-script");
  assert.equal(migrated.stage, 2);
  assert.deepEqual(migrated.bluffRoles, [null, null, null]);
  assert.deepEqual(migrated.notebookMarks, [{ start: 0, end: 2, team: "demon" }]);
  assert.deepEqual(migrated.seats, legacy.seats);
  assert.equal(legacy.mode, "free");
  assert.equal(legacy.bluffRoles, undefined);
  assert.equal(isSessionData(migrated), true);
  assert.equal(migrateSession(null), null);
});
