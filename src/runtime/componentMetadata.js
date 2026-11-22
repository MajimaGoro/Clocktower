// 从睡典钟楼公开前端重构；角色与素材归属保留。
const withComponentMetadata = (e, t) => {
  const i = e.__vccOpts || e;
  for (const [a, l] of t) i[a] = l;
  return i;
};
export { withComponentMetadata };
