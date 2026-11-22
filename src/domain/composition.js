// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { isTravelerSeat } from "./game.js";
function countSeats(session) {
  let t = 0,
    i = 0,
    a = 0;
  for (const l of session.seats)
    isTravelerSeat(l) ? ((t += 1), l.alive && (i += 1)) : l.alive && (a += 1);
  return {
    ordinary: session.seats.length - t,
    travelers: t,
    aliveOrdinary: a,
    aliveTravelers: i,
    total: session.seats.length,
    alive: a + i,
  };
}
function getRecommendedComposition(playerCount) {
  const t = {
    5: [3, 0, 1, 1],
    6: [3, 1, 1, 1],
    7: [5, 0, 1, 1],
    8: [5, 1, 1, 1],
    9: [5, 2, 1, 1],
    10: [7, 0, 2, 1],
    11: [7, 1, 2, 1],
    12: [7, 2, 2, 1],
    13: [9, 0, 3, 1],
    14: [9, 1, 3, 1],
    15: [9, 2, 3, 1],
  }[playerCount];
  return t
    ? {
        townsfolk: t[0],
        outsider: t[1],
        minion: t[2],
        demon: t[3],
      }
    : null;
}
export { countSeats, getRecommendedComposition };
