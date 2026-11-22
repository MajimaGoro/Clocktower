// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { getSystemInfoSync, getWindowInfo } from "../runtime.js";
function getViewportInfo() {
  return "function" == typeof getWindowInfo ? getWindowInfo() : getSystemInfoSync();
}
export { getViewportInfo };
