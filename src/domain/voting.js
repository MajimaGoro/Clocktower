import { countSeats } from "./composition.js";
// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  cloneGameData,
  failGameRule,
  requireFiniteNumber,
  createEntityId,
  isTravelerSeat,
  requireSeatIndex,
  hasOwn,
} from "./game.js";
import { describeStage } from "./stages.js";
function toggleDraftVote(vote, seatId, { force: i = false } = {}) {
  const a = cloneGameData(vote),
    l = a.people.find((e) => e.id === seatId);
  return (
    l || failGameRule("本次投票中没有这个玩家"),
    l.voted || l.alive || l.ghostVote || i || failGameRule("该死亡玩家已无鬼票，可由说书人手动覆盖"),
    (l.voted = !l.voted),
    a
  );
}
function calculateVoteTotals(vote) {
  Array.isArray(vote.people) || failGameRule("投票记录缺少票型");
  const t = vote.people.reduce(
      (e, t) => e + (t.voted ? requireFiniteNumber(t.weight ?? 1, "单人票数") : 0),
      0,
    ),
    i = vote.autoThreshold ?? vote.threshold,
    a =
      null == vote.overrideThreshold
        ? requireFiniteNumber(i, "门槛")
        : requireFiniteNumber(vote.overrideThreshold, "人工门槛");
  a < 0 && failGameRule("门槛不能小于零");
  const l = null == vote.overrideTotal ? t : requireFiniteNumber(vote.overrideTotal, "人工总票数");
  return {
    ...cloneGameData(vote),
    autoTotal: t,
    autoThreshold: i,
    threshold: a,
    total: l,
  };
}
function summarizeDayVotes(session, day = describeStage(session.stage).day) {
  const i = session.votes.filter((e) => e.day === day),
    a = i.length ? Math.max(...i.map((e) => e.total)) : 0,
    l = i.filter((e) => e.total === a),
    n = [...new Set(l.map((e) => e.nomineeId))],
    r = n.length > 1,
    o = l.some((e) => e.total >= e.threshold),
    s = 1 === n.length && o ? n[0] : null;
  return {
    day: day,
    records: cloneGameData(i),
    highest: a,
    totalNominations: i.length,
    tied: r,
    nomineeId: s,
  };
}
function getVoteOutcome(vote, summary) {
  return vote.total < vote.threshold
    ? "below"
    : summary.tied && vote.total === summary.highest
      ? "tie"
      : summary.nomineeId === vote.nomineeId
        ? "pending"
        : "lower";
}
function refreshDayVoteOutcomes(session, day) {
  const i = [];
  for (const a of session.votes) {
    i.push(a);
    a.day === day &&
      (a.outcome = getVoteOutcome(
        a,
        summarizeDayVotes(
          {
            ...session,
            votes: i,
          },
          day,
        ),
      ));
  }
}
export {
  toggleDraftVote,
  calculateVoteTotals,
  summarizeDayVotes,
  getVoteOutcome,
  refreshDayVoteOutcomes,
};
/* 创建提名票型，门槛按所有存活玩家计算（包含旅行者）。 */
function createVoteDraft(session, nominatorId, nomineeId) {
  session.ended && failGameRule("本局已结束");
  const a = describeStage(session.stage);
  "day" !== a.kind && failGameRule("请切换到白天再发起提名");
  const l = session.seats[requireSeatIndex(session, nominatorId)],
    n = session.seats[requireSeatIndex(session, nomineeId)];
  isTravelerSeat(n) && failGameRule("旅行者流放请由说书人通过状态手动记录");
  const r = [];
  l.alive || r.push("提名人已死亡，请由说书人确认是否允许");
  const o = session.votes.filter((e) => e.day === a.day);
  o.some((e) => e.nominatorId === nominatorId) && r.push("该玩家今天已有提名记录");
  o.some((e) => e.nomineeId === nomineeId) && r.push("该玩家今天已被提名");
  const s = countSeats(session).alive;
  return {
    id: createEntityId("vote"),
    stage: session.stage,
    day: a.day,
    nominatorId: nominatorId,
    nomineeId: nomineeId,
    createdAt: Date.now(),
    aliveCount: s,
    threshold: Math.ceil(s / 2),
    overrideThreshold: null,
    overrideTotal: null,
    warnings: r,
    applyToCurrent: session.stage >= (session.furthestStage ?? session.stage),
    people: session.seats.map((e, t) => {
      var i, a;
      return {
        id: e.id,
        seatNumber: t + 1,
        roleId: (null == (i = e.role) ? void 0 : i.id) ?? "",
        roleName: (null == (a = e.role) ? void 0 : a.name) ?? "未分配",
        name: `${t + 1}号`,
        alive: e.alive,
        ghostVote: e.ghostVote,
        voted: false,
        weight: 1,
      };
    }),
  };
}
/* 提交票型。仅作用于当前阶段时消耗鬼票和更新待处决玩家。 */
function submitVoteRecord(session, voteDraft, options = {}) {
  if (session.votes.some((e) => e.id === voteDraft.id)) return cloneGameData(session);
  session.ended && failGameRule("本局已结束");
  (voteDraft.id && voteDraft.nominatorId && voteDraft.nomineeId && voteDraft.day) ||
    failGameRule("提名信息不完整");
  const a = cloneGameData(session),
    l = calculateVoteTotals(voteDraft);
  l.submittedAt = Date.now();
  a.votes.push(l);
  const n = summarizeDayVotes(a, l.day);
  l.outcome = getVoteOutcome(l, n);
  const r =
      false !== voteDraft.applyToCurrent &&
      voteDraft.stage >= Math.max(session.stage, session.furthestStage ?? session.stage),
    o = options.applyToCurrent ?? r;
  if (((l.appliedToCurrent = Boolean(o)), o)) {
    requireSeatIndex(session, voteDraft.nominatorId);
    requireSeatIndex(session, voteDraft.nomineeId);
    for (const e of l.people) {
      if (!e.voted || e.alive || !e.ghostVote) continue;
      const t = a.seats.find((t) => t.id === e.id);
      t && !t.alive && (t.ghostVote = false);
    }
    a.pendingExecutionId = a.seats.some((e) => e.id === n.nomineeId) ? n.nomineeId : null;
    hasOwn(options, "pendingExecutionId") &&
      (null !== options.pendingExecutionId && requireSeatIndex(session, options.pendingExecutionId),
      (a.pendingExecutionId = options.pendingExecutionId));
  }
  return a;
}
/* 修正历史票型；保留当前生死、鬼票和待处决状态。 */
function editVoteRecord(session, voteId, changes) {
  const a = session.votes.findIndex((e) => e.id === voteId);
  a < 0 && failGameRule("找不到这条投票记录");
  const l = cloneGameData(session),
    n = l.votes[a],
    r = [
      "people",
      "nominatorId",
      "nomineeId",
      "aliveCount",
      "overrideThreshold",
      "overrideTotal",
      "note",
    ];
  for (const o of r) hasOwn(changes, o) && (n[o] = cloneGameData(changes[o]));
  return (
    hasOwn(changes, "total") && (n.overrideTotal = changes.total),
    hasOwn(changes, "threshold") && (n.overrideThreshold = changes.threshold),
    (l.votes[a] = {
      ...calculateVoteTotals(n),
      editedAt: Date.now(),
    }),
    refreshDayVoteOutcomes(l, n.day),
    l
  );
}
/* 删除历史票型；不撤销当前对局已经发生的状态变化。 */
function deleteVoteRecord(session, voteId) {
  var i;
  const a = cloneGameData(session),
    l = null == (i = a.votes.find((e) => e.id === voteId)) ? void 0 : i.day;
  return (
    (a.votes = a.votes.filter((e) => e.id !== voteId)),
    void 0 !== l && refreshDayVoteOutcomes(a, l),
    a
  );
}
export { createVoteDraft, submitVoteRecord, editVoteRecord, deleteVoteRecord };
