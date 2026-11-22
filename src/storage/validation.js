// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { isPlainObject } from "../domain/validation.js";
function isWakeShortcutsData(data) {
  return isPlainObject(data) && Array.isArray(data.disabled) && Array.isArray(data.custom);
}
function isSessionData(session) {
  if (!isPlainObject(session) || "phased" !== session.mode) return false;
  if (!Number.isInteger(session.stage) || session.stage < 0) return false;
  if ("string" != typeof session.scriptId || !Array.isArray(session.seats) || session.seats.length > 20)
    return false;
  if (!Array.isArray(session.votes)) return false;
  if (
    void 0 !== session.bluffRoles &&
    !(function (e) {
      return (
        Array.isArray(e) &&
        3 === e.length &&
        e.every(
          (e) =>
            null === e ||
            (isPlainObject(e) &&
              "string" == typeof e.id &&
              !!e.id.trim() &&
              "string" == typeof e.name &&
              !!e.name.trim() &&
              "string" == typeof e.team &&
              !!e.team.trim()),
        )
      );
    })(session.bluffRoles)
  )
    return false;
  if (
    void 0 !== session.fabledRoles &&
    !(function (e) {
      if (!Array.isArray(e)) return false;
      const t = new Set();
      return e.every(
        (e) =>
          !(
            !isPlainObject(e) ||
            "string" != typeof e.instanceId ||
            !e.instanceId ||
            t.has(e.instanceId) ||
            (t.add(e.instanceId),
            "string" != typeof e.id ||
              !e.id.trim() ||
              "string" != typeof e.name ||
              !e.name.trim() ||
              "fabled" !== e.team ||
              "string" != typeof e.ability)
          ),
      );
    })(session.fabledRoles)
  )
    return false;
  const t = new Set();
  return session.seats.every(
    (e) =>
      !(!isPlainObject(e) || "string" != typeof e.id || !e.id || t.has(e.id)) &&
      !("boolean" != typeof e.alive || "boolean" != typeof e.ghostVote || !Array.isArray(e.tokens)) &&
      !(null !== e.role && !isPlainObject(e.role)) &&
      (t.add(e.id), true),
  );
}
function isScriptsData(scripts) {
  return (
    Array.isArray(scripts) &&
    scripts.every(
      (e) =>
        isPlainObject(e) &&
        "string" == typeof e.id &&
        "string" == typeof e.name &&
        Array.isArray(e.roles) &&
        e.roles.every(
          (e) =>
            isPlainObject(e) &&
            "string" == typeof e.id &&
            "string" == typeof e.name &&
            "string" == typeof e.team,
        ),
    )
  );
}
export { isWakeShortcutsData, isSessionData, isScriptsData };
