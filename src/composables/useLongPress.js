// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { onBeforeUnmount } from "../runtime.js";
function useLongPress(onLongPress) {
  let t = null,
    i = null,
    a = false,
    l = 0;
  function n() {
    clearTimeout(t);
    t = null;
  }
  function r(e) {
    var t, i, a, l;
    const n =
      (null == (t = e.touches) ? void 0 : t[0]) || (null == (i = e.changedTouches) ? void 0 : i[0]) || e;
    return {
      x: n.clientX ?? n.pageX ?? (null == (a = e.detail) ? void 0 : a.x) ?? 0,
      y: n.clientY ?? n.pageY ?? (null == (l = e.detail) ? void 0 : l.y) ?? 0,
    };
  }
  function o(t) {
    n();
    a || ((a = true), onLongPress(t));
  }
  function s(e, l) {
    n();
    i = r(l);
    a = false;
    t = setTimeout(() => o(e), 350);
  }
  function d() {
    n();
    i && (a = true);
    i = null;
  }
  function u() {
    n();
    i = null;
  }
  return (
    onBeforeUnmount(n),
    {
      touchStart: function (e, t) {
        var i;
        if (((l = Date.now()), (null == (i = t.touches) ? void 0 : i.length) > 1)) return d();
        s(e, t);
      },
      touchEnd: function (e) {
        var t;
        a && (null == (t = null == e ? void 0 : e.preventDefault) || t.call(e));
        l = Date.now();
        u();
      },
      mouseStart: function (e, t) {
        Date.now() - l < 800 || (null != t.button && 0 !== t.button) || s(e, t);
      },
      move: function (e) {
        var t;
        if (!i) return;
        const a = r(e);
        ((null == (t = e.touches) ? void 0 : t.length) > 1 ||
          Math.abs(a.x - i.x) > 10 ||
          Math.abs(a.y - i.y) > 10) &&
          d();
      },
      end: u,
      cancel: d,
      reset: function () {
        n();
        i = null;
        a = false;
      },
      inspect: o,
      allowTap: function () {
        const e = !a;
        return ((a = false), e);
      },
    }
  );
}
export { useLongPress };
