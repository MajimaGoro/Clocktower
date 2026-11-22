// 从睡典钟楼公开前端重构；角色与素材归属保留。
function hashScriptContent(content) {
  let t = 2166136261;
  for (let i = 0; i < content.length; i += 1) {
    t ^= content.charCodeAt(i);
    t = Math.imul(t, 16777619);
  }
  return (t >>> 0).toString(36);
}
export { hashScriptContent };
