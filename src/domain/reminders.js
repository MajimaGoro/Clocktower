// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { ALIGNMENT_IMAGES } from "../data/assets.js";
import { isAllowedImageSource, normalizeRoleId } from "./roleNormalization.js";
function getReminderAlignment(reminder) {
  if (!reminder) return "";
  if (!(
    "alignment" === reminder.type ||
    ("custom" !== reminder.type && true !== reminder.custom && !reminder.roleId && !reminder.image)
  ))
    return "";
  const t = String(reminder.label || reminder.text || "")
    .trim()
    .toLowerCase();
  return "善良" === t || "good" === t ? "good" : "邪恶" === t || "evil" === t ? "evil" : "";
}
function getReminderImage(reminder) {
  return (
    ALIGNMENT_IMAGES[getReminderAlignment(reminder)] ||
    (isAllowedImageSource(null == reminder ? void 0 : reminder.image)
      ? reminder.image
      : "/static/reference/reminder-default.webp")
  );
}
function isCustomReminder(reminder) {
  return (
    !!reminder &&
    !getReminderAlignment(reminder) &&
    (true === reminder.custom || "custom" === reminder.type || (!reminder.roleId && !reminder.image))
  );
}
function findMatchingRole(roles, targetRole) {
  const i = normalizeRoleId(null == targetRole ? void 0 : targetRole.id);
  return (
    (i && roles.find((e) => normalizeRoleId(null == e ? void 0 : e.id) === i)) ||
    roles.find((e) => {
      return (
        (i = null == e ? void 0 : e.name),
        (a = null == targetRole ? void 0 : targetRole.name),
        "string" == typeof i && !!i.trim() && i.trim() === String(a || "").trim()
      );
      var i, a;
    })
  );
}
export { getReminderAlignment, getReminderImage, isCustomReminder, findMatchingRole };
