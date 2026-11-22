// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  ON_HIDE,
  ON_RESIZE,
  ON_SHOW,
  getCurrentInstance,
  injectUniHook,
  isInSSRComponentSetup,
} from "../runtime.js";
const createUniLifecycleHook =
  (i, a = 0) =>
  (a, l = getCurrentInstance()) => {
    isInSSRComponentSetup || injectUniHook(i, a, l);
  };
const onShow = createUniLifecycleHook(ON_SHOW, 2);
const onHide = createUniLifecycleHook(ON_HIDE, 2);
const onResize = createUniLifecycleHook(ON_RESIZE, 2);
export { createUniLifecycleHook, onShow, onHide, onResize };
