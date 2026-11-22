// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { STORAGE_KEYS } from "./keys.js";
import { saveStoredData } from "./storage.js";
import { isScriptsData } from "./validation.js";
function saveCustomScripts(scripts) {
  saveStoredData(STORAGE_KEYS.scripts, scripts, isScriptsData);
}
export { saveCustomScripts };
