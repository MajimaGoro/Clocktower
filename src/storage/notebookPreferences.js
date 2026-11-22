// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { isPlainObject } from "../domain/validation.js";
import { STORAGE_KEYS } from "./keys.js";
import { loadStoredData } from "./storage.js";
function isNotebookPreferencesData(data) {
  return (
    isPlainObject(data) &&
    (void 0 === data.defaultsVersion ||
      (Number.isInteger(data.defaultsVersion) && data.defaultsVersion > 0)) &&
    (void 0 === data.tags ||
      (Array.isArray(data.tags) && data.tags.every((e) => "string" == typeof e))) &&
    (void 0 === data.bounds ||
      (function (e) {
        return (
          isPlainObject(e) &&
          ["left", "top", "width", "height"].every((t) => Number.isFinite(e[t])) &&
          e.width > 0 &&
          e.height > 0
        );
      })(data.bounds))
  );
}
function normalizeNotebookPreferences(preferences) {
  var t, i;
  const a = preferences.defaultsVersion || 1,
    l =
      (a < 2 &&
        1 === (null == (t = preferences.tags) ? void 0 : t.length) &&
        "得知" === preferences.tags[0]) ||
      (a < 3 &&
        2 === (null == (i = preferences.tags) ? void 0 : i.length) &&
        "得知了" === preferences.tags[0] &&
        "选择了" === preferences.tags[1]);
  return {
    tags:
      void 0 === preferences.tags || l
        ? ["得知了", "选择了", "死亡", "被处决"]
        : [...new Set(preferences.tags.map((e) => e.trim().slice(0, 40)).filter(Boolean))].slice(0, 50),
    ...(preferences.bounds
      ? {
          bounds: {
            ...preferences.bounds,
          },
        }
      : {}),
  };
}
function loadNotebookPreferences() {
  return normalizeNotebookPreferences(
    loadStoredData(STORAGE_KEYS.notebookPreferences, isNotebookPreferencesData, {}),
  );
}
export { isNotebookPreferencesData, normalizeNotebookPreferences, loadNotebookPreferences };
