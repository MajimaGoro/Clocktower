// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { createAppError } from "../domain/errors.js";
import { normalizeStaticImagePath } from "../domain/roleNormalization.js";
import { isPlainObject } from "../domain/validation.js";
import { getStorageSync, setStorageSync } from "../runtime.js";
function loadStoredData(key, validate, fallback) {
  try {
    const a = getStorageSync(key);
    if ("" === a || null == a) return fallback;
    const l = JSON.parse("string" == typeof a ? a : JSON.stringify(a), (e, t) =>
      ["image", "logo", "background"].includes(e) ? normalizeStaticImagePath(t) : t,
    );
    return isPlainObject(l) && 1 === l.version && validate(l.data) ? l.data : fallback;
  } catch {
    return fallback;
  }
}
function saveStoredData(key, data, validate) {
  if (!validate(data))
    throw createAppError("本地数据格式不正确，未覆盖已保存内容", "INVALID_LOCAL_DATA");
  let a;
  try {
    a = JSON.stringify({
      version: 1,
      data: data,
    });
  } catch (l) {
    throw createAppError("数据无法保存，请保留当前页面后重试", "STORAGE_WRITE_FAILED", l);
  }
  try {
    setStorageSync(key, a);
  } catch (l) {
    throw createAppError(
      "本地保存失败，可能存储空间不足；当前页面内容仍保留",
      "STORAGE_WRITE_FAILED",
      l,
    );
  }
}
export { loadStoredData, saveStoredData };
