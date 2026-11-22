// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { MAX_NOTEBOOK_LENGTH, NOTEBOOK_TAIL_MARKER, NOTEBOOK_TEAM_COLORS } from "../data/notebook.js";
import { normalizeNotebookMarks, replaceNotebookSelection } from "../domain/notebook.js";
import {
  UniView,
  createBlock,
  createElementVNode,
  getCurrentInstance,
  isRef,
  nextTick,
  onBeforeUnmount,
  onMounted,
  openBlock,
  ref,
  watch,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const NotebookEditor = withComponentMetadata(
  {
    __name: "NotebookEditor",
    props: {
      modelValue: {
        type: String,
        default: "",
      },
      marks: {
        type: Array,
        default: () => [],
      },
    },
    emits: ["update:modelValue", "update:marks"],
    setup(props, { expose: expose, emit: emit }) {
      const l = props,
        n = emit,
        d = getCurrentInstance(),
        c = ref(null);
      d.uid;
      let h = String(l.modelValue || "").slice(0, MAX_NOTEBOOK_LENGTH),
        g = normalizeNotebookMarks(h, l.marks),
        f = {
          start: h.length,
          end: h.length,
        },
        p = {
          ...f,
        },
        b = false,
        v = null;
      const y = [],
        N = [];
      function _(e = f) {
        return {
          text: h,
          marks: g.map((e) => ({
            ...e,
          })),
          selection: {
            ...e,
          },
        };
      }
      function R(e) {
        y.push(_(e));
        y.length > 150 && y.shift();
        N.length = 0;
      }
      function x() {
        n(
          "update:marks",
          g.map((e) => ({
            ...e,
          })),
        );
        n("update:modelValue", h);
      }
      function G() {
        var e;
        return (null == (e = c.value) ? void 0 : e.$el) || c.value;
      }
      function C(e) {
        for (const t of e.querySelectorAll("[data-notebook-tail]"))
          t.textContent = t.textContent.replaceAll(NOTEBOOK_TAIL_MARKER, "");
        return e.textContent;
      }
      function $() {
        const e = G(),
          t = window.getSelection();
        if (!(
          e &&
          (null == t ? void 0 : t.rangeCount) &&
          e.contains(t.anchorNode) &&
          e.contains(t.focusNode)
        ))
          return null;
        const i = t.getRangeAt(0),
          a = i.cloneRange();
        a.selectNodeContents(e);
        a.setEnd(i.startContainer, i.startOffset);
        const l = C(a.cloneContents()).length;
        return (
          a.setEnd(i.endContainer, i.endOffset),
          {
            start: l,
            end: C(a.cloneContents()).length,
          }
        );
      }
      function T() {
        const e = $();
        e && (f = e);
      }
      function E(e) {
        var t;
        const i = G(),
          a = i.querySelector(`[data-notebook-offset="${e}"]`);
        if (a)
          return {
            node: a.firstChild,
            offset: 0,
          };
        const l = document.createTreeWalker(i, NodeFilter.SHOW_TEXT);
        let n;
        for (; (n = l.nextNode());)
          if (!(null == (t = n.parentElement) ? void 0 : t.closest("[data-notebook-tail]"))) {
            if (e <= n.length)
              return {
                node: n,
                offset: e,
              };
            e -= n.length;
          }
        return {
          node: i,
          offset: i.childNodes.length,
        };
      }
      function V(e = f, t = true) {
        const i = G();
        if (!i) return;
        const a = E(Math.min(h.length, Math.max(0, e.start))),
          l = E(Math.min(h.length, Math.max(0, e.end))),
          n = document.createRange();
        n.setStart(a.node, a.offset);
        n.setEnd(l.node, l.offset);
        t &&
          i.focus({
            preventScroll: true,
          });
        const r = window.getSelection();
        r.removeAllRanges();
        r.addRange(n);
        f = {
          ...e,
        };
        const o = n.getBoundingClientRect(),
          s = i.getBoundingClientRect();
        o.height && o.top < s.top
          ? (i.scrollTop -= s.top - o.top)
          : o.height && o.bottom > s.bottom && (i.scrollTop += o.bottom - s.bottom);
      }
      function L(e = false, t = true) {
        const i = G();
        if (!i) return;
        const a = document.createDocumentFragment(),
          l = [];
        for (let d = 0; d <= h.length; d++)
          (0 !== d && "\n" !== h[d - 1]) || (d !== h.length && "\n" !== h[d]) || l.push(d);
        const n = (e, t) => {
            if (!e) return;
            const i = document.createTextNode(e);
            if (t) {
              const e = document.createElement("span");
              e.className = "notebook-colored-text";
              e.dataset.notebookTeam = t;
              e.style.color = NOTEBOOK_TEAM_COLORS[t];
              e.appendChild(i);
              a.appendChild(e);
            } else a.appendChild(i);
          },
          r = (e) => {
            const t = document.createElement("span");
            t.dataset.notebookTail = "true";
            t.dataset.notebookOffset = String(e);
            t.setAttribute("aria-hidden", "true");
            t.textContent = NOTEBOOK_TAIL_MARKER;
            a.appendChild(t);
          };
        let o = 0,
          s = 0;
        for (const d of (function (e, t) {
          const i = [];
          let a = 0;
          for (const l of normalizeNotebookMarks(e, t)) {
            l.start > a &&
              i.push({
                text: e.slice(a, l.start),
                team: "",
              });
            i.push({
              text: e.slice(l.start, l.end),
              team: l.team,
            });
            a = l.end;
          }
          return (
            a < e.length &&
              i.push({
                text: e.slice(a),
                team: "",
              }),
            i
          );
        })(h, g)) {
          const e = o + d.text.length;
          let t = o;
          for (; s < l.length && l[s] < e;) {
            const e = l[s++];
            n(d.text.slice(t - o, e - o), d.team);
            r(e);
            t = e;
          }
          n(d.text.slice(t - o), d.team);
          o = e;
        }
        for (; s < l.length;) r(l[s++]);
        i.replaceChildren(a);
        i.dataset.empty = String(!h);
        e && V(f, t);
      }
      function j(e) {
        var t, i;
        if (
          (T(),
          (p = {
            ...f,
          }),
          !b && !e.isComposing)
        )
          return "insertText" === e.inputType && (null == (t = e.data) ? void 0 : t.includes("\n"))
            ? (e.preventDefault(), void K(e.data))
            : ["insertParagraph", "insertLineBreak"].includes(e.inputType)
              ? (e.preventDefault(), void K("\n"))
              : "historyUndo" === e.inputType || "historyRedo" === e.inputType
                ? (e.preventDefault(), void H("historyRedo" === e.inputType))
                : void (
                    (null == (i = e.inputType) ? void 0 : i.startsWith("format")) && e.preventDefault()
                  );
      }
      function O() {
        if (b) return;
        const e = $(),
          t = (function (e, t, i) {
            i = String(i ?? "").replace(/\r\n?/g, "\n");
            let a = 0;
            for (; a < e.length && a < i.length && e[a] === i[a];) a++;
            let l = e.length,
              n = i.length;
            for (; l > a && n > a && e[l - 1] === i[n - 1];) {
              l--;
              n--;
            }
            return replaceNotebookSelection(e, t, a, l, i.slice(a, n));
          })(
            h,
            g,
            (function () {
              const e = G();
              return e
                ? e.textContent.replaceAll(NOTEBOOK_TAIL_MARKER, "")
                  ? e.innerText.replaceAll(NOTEBOOK_TAIL_MARKER, "").replace(/\r\n?/g, "\n")
                  : ""
                : h;
            })(),
          );
        t.text !== h &&
          (R(p),
          (h = t.text),
          (g = t.marks),
          (f = e || {
            start: t.cursor,
            end: t.cursor,
          }),
          x());
        L(true);
      }
      function D() {
        b = false;
        O();
      }
      function F(e) {
        e.isComposing ||
          b ||
          ((e.ctrlKey || e.metaKey) && !e.altKey && ["z", "y"].includes(e.key.toLowerCase())
            ? (e.preventDefault(), H("y" === e.key.toLowerCase() || e.shiftKey))
            : "Enter" === e.key && (e.preventDefault(), K("\n")));
      }
      function B(e) {
        var t;
        e.preventDefault();
        K((null == (t = e.clipboardData) ? void 0 : t.getData("text/plain")) || "");
      }
      function P(e, t) {
        const i = $();
        i &&
          e.clipboardData &&
          (e.preventDefault(),
          e.clipboardData.setData("text/plain", h.slice(i.start, i.end)),
          t && i.end > i.start && J(replaceNotebookSelection(h, g, i.start, i.end, "", "")));
      }
      function W(e) {
        v = null;
        b ||
          e.shiftKey ||
          e.button > 0 ||
          (v = {
            id: e.pointerId,
            x: e.clientX,
            y: e.clientY,
            time: e.timeStamp,
            scroll: G().scrollTop,
          });
      }
      function q(e) {
        v && Math.hypot(e.clientX - v.x, e.clientY - v.y) > 7 && (v = null);
      }
      function U(e) {
        const t = v;
        v = null;
        const i = G();
        if (
          !t ||
          t.id !== e.pointerId ||
          b ||
          e.timeStamp - t.time > 450 ||
          Math.abs(i.scrollTop - t.scroll) > 2
        )
          return;
        const a = i.getBoundingClientRect(),
          l = parseFloat(getComputedStyle(i).lineHeight) || 26,
          n = Math.max(0, Math.floor((e.clientY - a.top + i.scrollTop) / l));
        for (const s of i.querySelectorAll("[data-notebook-offset]")) {
          const t = s.getBoundingClientRect();
          if (Math.max(0, Math.floor((t.top - a.top + i.scrollTop) / l)) === n)
            return (
              e.preventDefault(),
              (f = {
                start: Number(s.dataset.notebookOffset),
                end: Number(s.dataset.notebookOffset),
              }),
              void V()
            );
        }
        const r = (function (e) {
            const t = E(Math.min(h.length, Math.max(0, e))),
              i = document.createRange();
            return (i.setStart(t.node, t.offset), i.collapse(true), i);
          })(h.length).getBoundingClientRect(),
          o = r.height ? Math.max(0, Math.floor((r.top - a.top + i.scrollTop) / l)) : 0;
        n <= o ||
          (e.preventDefault(),
          (f = {
            start: h.length,
            end: h.length,
          }),
          J(replaceNotebookSelection(h, g, h.length, h.length, "\n".repeat(n - o), "")));
      }
      function H(e) {
        const t = e ? N : y,
          i = e ? y : N;
        if (!t.length) return;
        T();
        i.push(_());
        const a = t.pop();
        h = a.text;
        g = a.marks;
        f = a.selection;
        L(true);
        x();
      }
      function J(e) {
        R(f);
        h = e.text;
        g = e.marks;
        f = {
          start: e.cursor,
          end: e.cursor,
        };
        L(true);
        x();
      }
      function K(e, t = "") {
        T();
        J(replaceNotebookSelection(h, g, f.start, f.end, e, t));
      }
      return (
        watch(
          [() => l.modelValue, () => l.marks],
          async () => {
            const e = String(l.modelValue || "").slice(0, MAX_NOTEBOOK_LENGTH),
              t = normalizeNotebookMarks(e, l.marks);
            if (e === h && JSON.stringify(t) === JSON.stringify(g)) return;
            h = e;
            g = t;
            f = {
              start: Math.min(f.start, h.length),
              end: Math.min(f.end, h.length),
            };
            y.length = 0;
            N.length = 0;
            await nextTick();
            L(document.activeElement === G(), false);
          },
          {
            deep: true,
          },
        ),
        onMounted(() => {
          L();
          document.addEventListener("selectionchange", T);
        }),
        onBeforeUnmount(() => {
          document.removeEventListener("selectionchange", T);
        }),
        expose({
          insertText: K,
          insertShortcut: function (e, t = "") {
            T();
            J(
              (function (e, t, i, a, l, n = "") {
                const r = MAX_NOTEBOOK_LENGTH - e.length + Math.max(0, a - i);
                if (r < 2)
                  return {
                    text: e,
                    marks: normalizeNotebookMarks(e, t),
                    cursor: i,
                  };
                const o = String(l ?? "")
                    .replace(/\r\n?/g, "\n")
                    .slice(0, r - 2),
                  s = replaceNotebookSelection(e, t, i, a, ` ${o} `, "");
                return (
                  o &&
                    Object.hasOwn(NOTEBOOK_TEAM_COLORS, n) &&
                    (s.marks = normalizeNotebookMarks(s.text, [
                      ...s.marks,
                      {
                        start: i + 1,
                        end: i + o.length + 1,
                        team: n,
                      },
                    ])),
                  s
                );
              })(h, g, f.start, f.end, e, t),
            );
          },
          insertStage: function (e) {
            const t = (function (e, t, i) {
              const a = e && !e.endsWith("\n") ? "\n" : "",
                l = ` ${String(i || "准备")
                  .trim()
                  .replace(/[:：]\s*$/, "")}: \n`;
              return replaceNotebookSelection(e, t, e.length, e.length, a + l, "");
            })(h, g, e);
            J(t);
          },
          focus: function () {
            V();
          },
        }),
        (renderContext, renderCache) => {
          const View = UniView;
          return (
            openBlock(),
            createBlock(
              View,
              {
                class: "notebook-editor",
              },
              {
                default: withCtx(() => [
                  createElementVNode(
                    "div",
                    {
                      ref_key: "editable",
                      ref: c,
                      class: "notebook-editable",
                      contenteditable: "true",
                      role: "textbox",
                      "aria-label": "笔记内容",
                      "aria-multiline": "true",
                      spellcheck: "false",
                      "data-placeholder": "在这里任意记录内容……",
                      onBeforeinput: j,
                      onInput: O,
                      onKeydown: F,
                      onPaste: B,
                      onDrop: renderCache[0] || (renderCache[0] = withModifiers(() => {}, ["prevent"])),
                      onCopy: renderCache[1] || (renderCache[1] = (e) => P(e, false)),
                      onCut: renderCache[2] || (renderCache[2] = (e) => P(e, true)),
                      onPointerdown: W,
                      onPointermove: q,
                      onPointerup: U,
                      onPointercancel:
                        renderCache[3] ||
                        (renderCache[3] = (e) => (isRef(v) ? (v.value = null) : (v = null))),
                      onCompositionstart:
                        renderCache[4] ||
                        (renderCache[4] = (e) => (isRef(b) ? (b.value = true) : (b = true))),
                      onCompositionend: D,
                      onMouseup: T,
                      onKeyup: T,
                      onTouchend: T,
                      onBlur: T,
                    },
                    null,
                    544,
                  ),
                ]),
                _: 1,
              },
            )
          );
        }
      );
    },
  },
  [["__scopeId", "data-v-0584e913"]],
);
export { NotebookEditor };
