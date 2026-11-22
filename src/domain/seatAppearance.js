// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { getReminderAlignment } from "./reminders.js";
function getSeatGlowColors(seat) {
  let t = "",
    i = "";
  const a = (null == seat ? void 0 : seat.tokens) || [];
  for (let l = a.length - 1; l >= 0; l--) {
    const e = a[l];
    if (!e || e.inverted) continue;
    const n = String(e.label || e.text || "")
        .trim()
        .toLowerCase(),
      r = getReminderAlignment(e);
    if (
      (!t && r && (t = "good" === r ? "#2f8cff" : "#ff3b45"),
      i ||
        (/^(中毒|poisoned)|^poison$/.test(n)
          ? (i = "#a855f7")
          : /^(醉酒|drunk)|^是酒鬼$/.test(n)
            ? (i = "#f59e0b")
            : /^(疯狂|madness)/.test(n) && (i = "#e11d8a")),
      t && i)
    )
      break;
  }
  return {
    alignmentColor: t,
    conditionColor: i,
  };
}
export { getSeatGlowColors };
