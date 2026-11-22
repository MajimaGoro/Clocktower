// 从睡典钟楼公开前端重构；角色与素材归属保留。
function measureSeatNumberBounds(centerX, centerY, radius, nickname = "", seatNumber = 1) {
  const n = Math.max(12, Math.min(14, 0.16 * radius)),
    r =
      0.65 * String(seatNumber).length +
      1 +
      (nickname
        ? 0.4 + Array.from(nickname).reduce((e, t) => e + (/[^\x00-\xff]/.test(t) ? 1 : 0.7), 0)
        : 0),
    o = Math.ceil(Math.max(32, Math.min(38, 0.4 * radius), r * n + 8));
  return {
    left: centerX - o / 2,
    right: centerX + o / 2,
    top: centerY + radius / 2 + 1,
    bottom: centerY + radius / 2 + 1 + Math.max(18, Math.min(20, 0.22 * radius)),
  };
}
function circleIntersectsRect(centerX, centerY, radius, rectangle, margin = 2) {
  return (
    (centerX - Math.max(rectangle.left - margin, Math.min(centerX, rectangle.right + margin))) ** 2 +
      (centerY - Math.max(rectangle.top - margin, Math.min(centerY, rectangle.bottom + margin))) ** 2 <
    radius ** 2
  );
}
function canPlaceSeatLabels(seats, radius) {
  return seats.every((i, a) => {
    const l = measureSeatNumberBounds(i.x, i.y, radius, i.nickname, i.number);
    return seats.every((e, i) => {
      if (a === i) return true;
      const n = measureSeatNumberBounds(e.x, e.y, radius, e.nickname, e.number);
      return (
        !circleIntersectsRect(e.x, e.y, radius / 2, l) &&
        (l.right + 2 <= n.left ||
          l.left >= n.right + 2 ||
          l.bottom + 2 <= n.top ||
          l.top >= n.bottom + 2)
      );
    });
  });
}
export { measureSeatNumberBounds, circleIntersectsRect, canPlaceSeatLabels };
