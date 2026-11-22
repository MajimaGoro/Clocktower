// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { DEFAULT_ROLE_IMAGE } from "../data/assets.js";
import { RAW_ROLES } from "../data/roles.js";
import { TEAM_ALIASES } from "../data/teams.js";
function normalizeStaticImagePath(imagePath, usePngFallback = false) {
  return usePngFallback && "string" == typeof imagePath && /^\/static\/[\w/.-]+\.webp$/.test(imagePath)
    ? imagePath.slice(0, -5) + ".png"
    : imagePath;
}
function normalizeRoleId(roleId) {
  return String(roleId || "")
    .trim()
    .replace(/[_\-\s]/g, "")
    .toLowerCase();
}
function trimAndLimitText(text, maximumLength = 12e3) {
  return "string" == typeof text ? text.trim().slice(0, maximumLength) : "";
}
function normalizeReminderTexts(reminders) {
  return Array.isArray(reminders)
    ? reminders
        .filter((e) => "string" == typeof e && e.trim())
        .map((e) => e.trim().slice(0, 300))
        .slice(0, 100)
    : [];
}
function normalizeNightPosition(position) {
  const t = Number(position);
  return Number.isFinite(t) && t > 0 ? t : 0;
}
function selectRoleImage(imageSource) {
  return "string" == typeof imageSource
    ? normalizeStaticImagePath(imageSource.trim())
    : (Array.isArray(imageSource) && imageSource.map(selectRoleImage).find(isAllowedImageSource)) || "";
}
function isAllowedImageSource(source) {
  return (
    (function (e) {
      return (
        !("string" != typeof e || !e) &&
        (!(!/^\/static\/[\w/.-]+\.(webp|png|jpe?g)$/i.test(e) || e.includes("..")) ||
          !(!/^wxfile:\/\//i.test(e) && !/^http:\/\/usr\//i.test(e)) ||
          (e.length <= 716800 && /^data:image\/(png|webp|jpe?g);base64,[a-z\d+/=\r\n]+$/i.test(e)))
      );
    })(source) ||
    ("string" == typeof source && /^https?:\/\/[^\s/\\?#]+(?:[/?#][^\s\\]*)?$/i.test(source))
  );
}
const roleDefinitionById = new Map(RAW_ROLES.map((e) => [normalizeRoleId(e.id), e]));
const roleDefinitionByName = new Map(RAW_ROLES.map((e) => [e.name, e]));
function normalizeRole(entry) {
  var t;
  const i =
    "string" == typeof entry
      ? {
          id: entry,
        }
      : entry;
  if (!i || "object" != typeof i || Array.isArray(i))
    throw new Error("角色条目必须是角色 ID 或完整角色对象");
  const a = trimAndLimitText(i.id, 160);
  if (!a || "_meta" === a) throw new Error("角色缺少有效 ID");
  const l = roleDefinitionById.get(normalizeRoleId(a)),
    n = ["name", "team", "ability"].some((e) => Object.prototype.hasOwnProperty.call(i, e));
  if (!l && !n) throw new Error(`无法识别角色 ID「${a}」，请在 JSON 中提供名称、类型和能力资料`);
  const r = {
      ...(l || {}),
      ...i,
    },
    o = trimAndLimitText(r.name, 160),
    s = trimAndLimitText(r.team, 80).toLowerCase(),
    d = TEAM_ALIASES[s] || s;
  if (!o) throw new Error(`角色「${a}」缺少名称`);
  if (!d) throw new Error(`角色「${o}」缺少类型`);
  const u = selectRoleImage(i.image),
    m =
      (null == l ? void 0 : l.image) ||
      (null == (t = roleDefinitionByName.get(o)) ? void 0 : t.image) ||
      DEFAULT_ROLE_IMAGE;
  let c = isAllowedImageSource(u) ? u : m;
  return (
    isAllowedImageSource(c) || (c = DEFAULT_ROLE_IMAGE),
    {
      id: a,
      name: o,
      team: d,
      ability: trimAndLimitText(r.ability),
      image: c,
      firstNight: normalizeNightPosition(r.firstNight),
      otherNight: normalizeNightPosition(r.otherNight),
      firstNightReminder: trimAndLimitText(r.firstNightReminder),
      otherNightReminder: trimAndLimitText(r.otherNightReminder),
      reminders: [
        ...new Set([...normalizeReminderTexts(r.reminders), ...normalizeReminderTexts(r.reminder)]),
      ],
      remindersGlobal: [
        ...new Set(
          ["remindersGlobal", "globalreminder", "globalReminder", "globalReminders"].flatMap((e) =>
            normalizeReminderTexts(r[e]),
          ),
        ),
      ],
      setup: !!r.setup,
      ...(trimAndLimitText(r.name_id)
        ? {
            name_id: trimAndLimitText(r.name_id, 160),
          }
        : {}),
    }
  );
}
const normalizedRoles = RAW_ROLES.map((e) => normalizeRole(e));
export {
  normalizeStaticImagePath,
  normalizeRoleId,
  trimAndLimitText,
  normalizeReminderTexts,
  normalizeNightPosition,
  selectRoleImage,
  isAllowedImageSource,
  roleDefinitionById,
  roleDefinitionByName,
  normalizeRole,
  normalizedRoles,
};
