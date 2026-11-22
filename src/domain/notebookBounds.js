// 从睡典钟楼公开前端重构；角色与素材归属保留。
const clamp = (e, t, i) => Math.min(Math.max(e, t), Math.max(t, i));
function getNotebookBoundsLimits(viewport) {
  const t = Math.max(1, Number(viewport.width) || 1),
    i = Math.max(1, Number(viewport.height) || 1),
    a = t <= 600 ? 8 : 12,
    l = Math.min(a, t / 4),
    n = Math.max(l + 1, t - a),
    r = Math.min(Math.max(a, (Number(viewport.top) || 0) + a), i - 1),
    o = Math.max(r + 1, i - a - (Number(viewport.bottom) || 0)),
    s = n - l,
    d = o - r;
  return {
    left: l,
    top: r,
    right: n,
    bottom: o,
    maxWidth: s,
    maxHeight: d,
    minWidth: Math.min(100, s),
    minHeight: Math.min(100, d),
  };
}
function clampNotebookBounds(bounds, viewport) {
  const i = getNotebookBoundsLimits(viewport),
    a = clamp(Number(bounds.width) || 460, i.minWidth, i.maxWidth),
    l = clamp(Number(bounds.height) || 500, i.minHeight, i.maxHeight);
  return {
    left: clamp(Number(bounds.left) || 0, i.left, i.right - a),
    top: clamp(Number(bounds.top) || 0, i.top, i.bottom - l),
    width: a,
    height: l,
  };
}
export { clamp, getNotebookBoundsLimits, clampNotebookBounds };
