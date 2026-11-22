// 从睡典钟楼公开前端重构；角色与素材归属保留。
const STORAGE_PREFIX = "minibotc.";
const STORAGE_KEYS = Object.freeze({
  session: `${STORAGE_PREFIX}session.v1`,
  scripts: `${STORAGE_PREFIX}scripts.v1`,
  preferences: `${STORAGE_PREFIX}preferences.v1`,
  wakeShortcuts: `${STORAGE_PREFIX}wake-shortcuts.v1`,
  notebookPreferences: `${STORAGE_PREFIX}notebook-preferences.v1`,
});
export { STORAGE_PREFIX, STORAGE_KEYS };
