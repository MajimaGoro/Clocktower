// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  cloneGameData,
  createEntityId,
  failGameRule,
  requireInteger,
  requireSeatIndex,
} from "./game.js";
function formatChineseInteger(number) {
  const t = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  return number < 10
    ? t[number]
    : number < 20
      ? `十${number % 10 ? t[number % 10] : ""}`
      : number < 100
        ? `${t[Math.floor(number / 10)]}十${number % 10 ? t[number % 10] : ""}`
        : String(number);
}
function describeStage(stageIndex = 0) {
  const t = Math.max(0, requireInteger(stageIndex, "阶段"));
  if (!t)
    return {
      index: t,
      kind: "setup",
      label: "准备",
      day: 0,
    };
  const i = Math.ceil(t / 2),
    a = t % 2 ? "night" : "day";
  return {
    index: t,
    kind: a,
    day: i,
    label: 1 === t ? "首夜" : `第${formatChineseInteger(i)}${"night" === a ? "夜" : "天"}`,
  };
}
function changeStage(session, delta = 1) {
  session.ended && failGameRule("本局已结束，请先开始新一局");
  const i = Math.max(0, session.stage + requireInteger(delta, "阶段变化"));
  0 === session.stage &&
    i > 0 &&
    session.seats.some((e) => !e.role) &&
    failGameRule("请先为所有座位分配角色，再进入首夜");
  const a =
    i > session.stage &&
    "day" === describeStage(session.stage).kind &&
    "night" === describeStage(i).kind &&
    session.pendingExecutionId
      ? (function (e, { dies: t = true } = {}) {
          var i, a;
          "day" !== describeStage(e.stage).kind && failGameRule("请在白天记录处决");
          e.ended && failGameRule("本局已结束");
          e.pendingExecutionId || failGameRule("当前没有待处决玩家");
          const l = requireSeatIndex(e, e.pendingExecutionId),
            n = cloneGameData(e),
            r = n.seats[l],
            o = r.alive;
          t && o && ((r.alive = false), (r.ghostVote = true));
          return (
            n.executions ?? (n.executions = []),
            n.executions.push({
              id: createEntityId("execution"),
              stage: e.stage,
              day: describeStage(e.stage).day,
              seatId: r.id,
              seatNumber: l + 1,
              roleId: (null == (i = r.role) ? void 0 : i.id) ?? "",
              roleName: (null == (a = r.role) ? void 0 : a.name) ?? "未分配",
              wasAlive: o,
              died: Boolean(t && o),
              createdAt: Date.now(),
            }),
            (n.pendingExecutionId = null),
            n
          );
        })(session)
      : cloneGameData(session);
  return ((a.stage = i), (a.furthestStage = Math.max(session.furthestStage ?? session.stage, i)), a);
}
export { formatChineseInteger, describeStage, changeStage };
