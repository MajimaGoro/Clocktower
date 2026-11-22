// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { MAX_NOTEBOOK_LENGTH, NOTEBOOK_TEAM_COLORS } from "../data/notebook.js";
function normalizeNotebookMarks(text, marks) {
  var i;
  const a = String(text ?? "").length,
    l = [],
    n = (Array.isArray(marks) ? marks : [])
      .filter(
        (e) =>
          e &&
          Number.isInteger(e.start) &&
          Number.isInteger(e.end) &&
          Object.hasOwn(NOTEBOOK_TEAM_COLORS, e.team),
      )
      .map((e) => ({
        start: Math.max(0, e.start),
        end: Math.min(a, e.end),
        team: e.team,
      }))
      .sort((e, t) => e.start - t.start || e.end - t.end);
  for (const r of n) {
    if (
      ((r.start = Math.max(r.start, (null == (i = l.at(-1)) ? void 0 : i.end) || 0)), r.end <= r.start)
    )
      continue;
    const e = l.at(-1);
    (null == e ? void 0 : e.end) === r.start && e.team === r.team ? (e.end = r.end) : l.push(r);
  }
  return l;
}
function replaceNotebookSelection(text, marks, start, end, insertedText, team) {
  var r;
  start = Math.max(0, Math.min(text.length, Number(start) || 0));
  end = Math.max(start, Math.min(text.length, Number(end) || 0));
  insertedText = String(insertedText ?? "")
    .replace(/\r\n?/g, "\n")
    .slice(0, Math.max(0, MAX_NOTEBOOK_LENGTH - text.length + end - start));
  const o = normalizeNotebookMarks(text, marks),
    s = [],
    d = insertedText.length - (end - start),
    u =
      void 0 === team
        ? null == (r = o.find((e) => start > e.start && start < e.end))
          ? void 0
          : r.team
        : team;
  for (const c of o) {
    c.start < start &&
      s.push({
        start: c.start,
        end: Math.min(start, c.end),
        team: c.team,
      });
    c.end > end &&
      s.push({
        start: Math.max(end, c.start) + d,
        end: c.end + d,
        team: c.team,
      });
  }
  insertedText &&
    Object.hasOwn(NOTEBOOK_TEAM_COLORS, u) &&
    s.push({
      start: start,
      end: start + insertedText.length,
      team: u,
    });
  const m = text.slice(0, start) + insertedText + text.slice(end);
  return {
    text: m,
    marks: normalizeNotebookMarks(m, s),
    cursor: start + insertedText.length,
  };
}
export { normalizeNotebookMarks, replaceNotebookSelection };
