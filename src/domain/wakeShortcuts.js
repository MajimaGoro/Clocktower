// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { BUILT_IN_WAKE_SHORTCUTS } from "../data/wakeShortcuts.js";
const wakeWordShortcutIds = new Set(
  BUILT_IN_WAKE_SHORTCUTS.filter((e) => "word" === e.kind).map((e) => e.id),
);
function normalizeWakeShortcuts(preferences) {
  if (
    !preferences ||
    "object" != typeof preferences ||
    Array.isArray(preferences) ||
    !Array.isArray(preferences.disabled) ||
    !Array.isArray(preferences.custom)
  )
    return {
      disabled: [],
      custom: [],
    };
  const t = [...new Set(preferences.disabled.filter((e) => wakeWordShortcutIds.has(e)))],
    i = [],
    a = new Set();
  for (const l of preferences.custom) {
    if ("string" != typeof l) continue;
    const e = Array.from(l.trim()).slice(0, 120).join("");
    if (e && !a.has(e) && (a.add(e), i.push(e), 50 === i.length)) break;
  }
  return {
    disabled: t,
    custom: i,
  };
}
export { wakeWordShortcutIds, normalizeWakeShortcuts };
