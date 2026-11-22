// 从睡典钟楼公开前端重构；角色与素材归属保留。
const cloneIdentityData = (e) => JSON.parse(JSON.stringify(e));
const isTravelerRole = (e) => ["traveler", "traveller", "旅行者"].includes(null == e ? void 0 : e.team);
const failIdentityDrawRule = (e) => {
  throw new Error(e);
};
function createIdentityDraw(
  seats,
  { mode: t = "random", order: i = "forward", onlyTeam: a = false } = {},
  random = Math.random,
) {
  (!Array.isArray(seats) || !seats.length || seats.length > 20) &&
    failIdentityDrawRule("下发身份需要 1～20 个座位");
  (["random", "assigned"].includes(t) && ["forward", "reverse", "random"].includes(i)) ||
    failIdentityDrawRule("请选择有效的下发方式和顺序");
  (seats.some((e) => !(null == e ? void 0 : e.id)) ||
    new Set(seats.map((e) => e.id)).size !== seats.length) &&
    failIdentityDrawRule("座位信息异常，请重新打开下发身份");
  seats.some((e) => {
    var t, i, a;
    return (
      !(null == (t = e.role) ? void 0 : t.id) ||
      !(null == (i = e.role) ? void 0 : i.name) ||
      !(null == (a = e.role) ? void 0 : a.team)
    );
  }) && failIdentityDrawRule("请先为所有座位分配角色，再下发身份");
  seats.filter((e) => !isTravelerRole(e.role)).length > 15 &&
    failIdentityDrawRule("普通玩家最多 15 人，多出的座位请先分配为旅行者");
  const n = seats.map((e, t) => ({
      seatId: e.id,
      number: t + 1,
      role: cloneIdentityData(e.role),
      traveler: isTravelerRole(e.role),
    })),
    r =
      "random" === i
        ? ((e, t) => {
            const i = [...e];
            for (let a = i.length - 1; a > 0; a--) {
              const e = Math.min(a, Math.max(0, Math.floor(t() * (a + 1))));
              [i[a], i[e]] = [i[e], i[a]];
            }
            return i;
          })(n, random)
        : "reverse" === i
          ? [...n].reverse()
          : n;
  return {
    mode: t,
    order: i,
    onlyTeam: Boolean(a),
    phase: "handoff",
    cursor: 0,
    players: r,
    cards: n.map((e, t) => ({
      id: `card-${t}`,
      pickedSeatId: null,
    })),
    pool: n.map((e) => ({
      seatId: e.seatId,
      role: e.role,
      traveler: e.traveler,
      usedBy: null,
    })),
    assignments: [],
    revealRole: null,
  };
}
function beginIdentityReveal(drawState) {
  "handoff" !== drawState.phase && failIdentityDrawRule("请先确认当前接收设备的座位");
  const t = cloneIdentityData(drawState),
    i = t.players[t.cursor];
  i || failIdentityDrawRule("本次身份已领取完毕");
  const a = t.assignments.find((e) => e.seatId === i.seatId);
  return ((t.phase = a ? "reveal" : "pick"), (t.revealRole = (null == a ? void 0 : a.role) || null), t);
}
/**
 * 领取当前玩家选择的暗牌。普通玩家可重新随机抽取；旅行者始终保留身份。
 * 返回新的领取状态，原始状态不会被修改，方便界面更新和规则测试。
 */
function pickIdentityCard(drawState, cardId, random = Math.random) {
  "pick" !== drawState.phase && failIdentityDrawRule("请先确认当前座位再抽取");
  const selectedCard = drawState.cards.find((card) => card.id === cardId);
  (selectedCard && !selectedCard.pickedSeatId) ||
    failIdentityDrawRule("这张身份牌已被领取，请选择其他暗牌");

  const nextDrawState = cloneIdentityData(drawState);
  const player = nextDrawState.players[nextDrawState.cursor];
  const availableOrdinaryRoles = nextDrawState.pool.filter((entry) => !entry.usedBy && !entry.traveler);
  const selectedRole =
    player.traveler || "assigned" === nextDrawState.mode
      ? nextDrawState.pool.find((entry) => entry.seatId === player.seatId && !entry.usedBy)
      : availableOrdinaryRoles[
          Math.min(
            availableOrdinaryRoles.length - 1,
            Math.max(0, Math.floor(random() * availableOrdinaryRoles.length)),
          )
        ];

  selectedRole || failIdentityDrawRule("没有可领取的身份，请关闭后重新开始");
  selectedRole.usedBy = player.seatId;
  nextDrawState.cards.find((card) => card.id === cardId).pickedSeatId = player.seatId;
  nextDrawState.assignments.push({
    seatId: player.seatId,
    role: cloneIdentityData(selectedRole.role),
  });
  nextDrawState.revealRole = cloneIdentityData(selectedRole.role);
  nextDrawState.phase = "reveal";
  return nextDrawState;
}
function completeIdentityReveal(drawState) {
  "reveal" !== drawState.phase && failIdentityDrawRule("请先查看并确认当前角色");
  const t = cloneIdentityData(drawState);
  return (
    t.cursor++,
    (t.revealRole = null),
    (t.phase = t.cursor === t.players.length ? "complete" : "handoff"),
    t
  );
}
export {
  cloneIdentityData,
  isTravelerRole,
  failIdentityDrawRule,
  createIdentityDraw,
  beginIdentityReveal,
  pickIdentityCard,
  completeIdentityReveal,
};
