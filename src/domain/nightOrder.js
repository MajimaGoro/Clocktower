// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { normalizeNightPosition, normalizeRoleId } from "./roleNormalization.js";
function buildNightOrder(script, seats = [], nightKind = "firstNight") {
  var a, l;
  if (!script || !Array.isArray(script.roles)) return [];
  const n = "otherNight" === nightKind || "other" === nightKind ? "otherNight" : "firstNight",
    r = null == (a = null == script ? void 0 : script.meta) ? void 0 : a[n],
    o = Array.isArray(r) ? new Map(r.map((e, t) => [normalizeRoleId(e), t + 1])) : null,
    s = (null == (l = null == script ? void 0 : script.meta) ? void 0 : l.evilInfoNightOrder) || {},
    d = [
      {
        id: "minioninfo",
        name: "爪牙信息",
        team: "minion",
        image: "/static/roles/imp.webp",
        firstNight: normalizeNightPosition(s.minionInfo) || 6,
        firstNightReminder: "7 人及以上开局时，让爪牙互相确认，并向爪牙展示恶魔是谁。",
      },
      {
        id: "demoninfo",
        name: "恶魔信息与伪装身份",
        team: "demon",
        image: "/static/roles/imp.webp",
        firstNight: normalizeNightPosition(s.demonInfo) || 8,
        firstNightReminder: "7 人及以上开局时，向恶魔展示爪牙，以及三个不在场的善良角色。",
      },
      ...((null == script ? void 0 : script.roles) || []).filter((e) => "traveler" !== e.team),
    ],
    u = new Set(((null == script ? void 0 : script.roles) || []).map((e) => normalizeRoleId(e.id))),
    m = d
      .map((e) => {
        let i = e[n] || 0;
        o &&
          (i =
            [e.id, e.name, e.name_id]
              .map(normalizeRoleId)
              .map((e) => o.get(e))
              .find((e) => void 0 !== e) || 0);
        const a = seats.filter((t) => {
          if (!t.role) return false;
          const i = normalizeRoleId(t.role.id);
          return i === normalizeRoleId(e.id) || (!u.has(i) && t.role.name === e.name);
        });
        return {
          role: e,
          seats: a,
          order: i,
          reminder: e[`${n}Reminder`] || "",
          rank: null,
        };
      })
      .filter((e) => e.order > 0)
      .sort((e, t) => e.order - t.order || e.role.name.localeCompare(t.role.name, "zh-CN"));
  let c = 0;
  for (const h of m) h.seats.length && (h.rank = ++c);
  return m;
}
export { buildNightOrder };
