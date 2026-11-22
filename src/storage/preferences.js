// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { createAppError } from "../domain/errors.js";
import { isPlainObject } from "../domain/validation.js";
import { STORAGE_KEYS } from "./keys.js";
import { loadStoredData, saveStoredData } from "./storage.js";
const PREFERENCE_KEYS = ["hideStatusHint", "hideNightActionHint", "hideTokenDeleteHint"];
function isPreferencesData(data) {
  return (
    isPlainObject(data) &&
    PREFERENCE_KEYS.every((t) => void 0 === data[t] || "boolean" == typeof data[t])
  );
}
function loadPreferences() {
  const e = loadStoredData(STORAGE_KEYS.preferences, isPreferencesData, {});
  return {
    hideStatusHint: true === e.hideStatusHint,
    hideNightActionHint: true === e.hideNightActionHint,
    hideTokenDeleteHint: true === e.hideTokenDeleteHint,
  };
}
function savePreferences(preferences) {
  if (!isPreferencesData(preferences))
    throw createAppError("本地数据格式不正确，未覆盖已保存内容", "INVALID_LOCAL_DATA");
  const t = loadPreferences();
  for (const i of PREFERENCE_KEYS) "boolean" == typeof preferences[i] && (t[i] = preferences[i]);
  saveStoredData(STORAGE_KEYS.preferences, t, isPreferencesData);
}
export { PREFERENCE_KEYS, isPreferencesData, loadPreferences, savePreferences };
