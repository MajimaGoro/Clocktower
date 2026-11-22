// 从睡典钟楼公开前端重构；角色与素材归属保留。
function createAppError(message, code, cause) {
  const a = new Error(message);
  return ((a.code = code), cause && (a.cause = cause), a);
}
export { createAppError };
