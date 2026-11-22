// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { NotebookEditor } from "./NotebookEditor.js";
import { NotebookTagManager } from "./NotebookTagManager.js";
import { NOTEBOOK_TEAM_COLORS } from "../data/notebook.js";
import { createAppError } from "../domain/errors.js";
import { clamp, clampNotebookBounds, getNotebookBoundsLimits } from "../domain/notebookBounds.js";
import {
  Fragment,
  UniButton,
  UniScrollView,
  UniText,
  UniView,
  computed,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createSelectorQuery,
  createTextVNode,
  createVNode,
  getCurrentInstance,
  normalizeClass,
  normalizeStyle,
  offWindowResize,
  onBeforeUnmount,
  onMounted,
  onWindowResize,
  openBlock,
  ref,
  renderList,
  showModal,
  showToast,
  toDisplayString,
  unref,
  watch,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
import { onHide } from "../runtime/lifecycle.js";
import { getViewportInfo } from "../runtime/viewport.js";
import { STORAGE_KEYS } from "../storage/keys.js";
import {
  isNotebookPreferencesData,
  loadNotebookPreferences,
  normalizeNotebookPreferences,
} from "../storage/notebookPreferences.js";
import { saveStoredData } from "../storage/storage.js";
const FloatingNotebook = withComponentMetadata(
  {
    __name: "FloatingNotebook",
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      modelValue: {
        type: String,
        default: "",
      },
      marks: {
        type: Array,
        default: () => [],
      },
      seats: {
        type: Array,
        default: () => [],
      },
      stageLabel: {
        type: String,
        default: "准备",
      },
    },
    emits: ["update:open", "update:modelValue", "update:marks"],
    setup(props, { emit: emit }) {
      const a = props,
        l = emit,
        n = getCurrentInstance(),
        y = ref(null),
        _ = loadNotebookPreferences(),
        $ = ref(_.tags),
        T = ref(false),
        A = ref(""),
        S = ref(null),
        z = NOTEBOOK_TEAM_COLORS,
        V = ["n", "ne", "e", "se", "s", "sw", "w", "nw"],
        j = ref(ie()),
        O = ref(
          _.bounds
            ? clampNotebookBounds(_.bounds, j.value)
            : (function (e) {
                const t = getNotebookBoundsLimits(e),
                  i = Math.min(460, t.maxWidth),
                  a = Math.min(500, t.maxHeight);
                return clampNotebookBounds(
                  {
                    left: (t.left + t.right - i) / 2,
                    top: (t.top + t.bottom - a) / 2,
                    width: i,
                    height: a,
                  },
                  e,
                );
              })(j.value),
        ),
        D = ref(null),
        F = ref(a.modelValue),
        U = ref(a.marks);
      let H = false;
      const J = computed(() => ({
          left: `${O.value.left}px`,
          top: `${O.value.top}px`,
          width: `${O.value.width}px`,
          height: `${O.value.height}px`,
        })),
        K = computed(() => {
          const e = j.value,
            t = Math.min(288, e.width - 16),
            i = Math.max(
              1,
              Math.ceil(
                ($.value.reduce((e, i) => e + Math.min(t - 20, 12 * i.length + 35), 0) + 96) / (t - 20),
              ),
            ),
            l =
              "players" === A.value
                ? 52 + 43 * Math.ceil(a.seats.length / 5)
                : Math.min(280, 48 + 34 * i),
            n = Math.min(l, e.height - e.top - e.bottom - 16),
            r = S.value || {
              left: O.value.left,
              top: O.value.top + O.value.height - 30,
              bottom: O.value.top + O.value.height,
            };
          return {
            left: `${Math.max(8, Math.min(r.left, e.width - 8 - t))}px`,
            top: `${r.top - n - 8 >= e.top + 8 ? r.top - n - 8 : Math.max(e.top + 8, Math.min(r.bottom + 8, e.height - e.bottom - 8 - n))}px`,
            width: `${t}px`,
            height: `${n}px`,
          };
        });
      function Y(e) {
        try {
          return (
            (function (e) {
              if (!isNotebookPreferencesData(e))
                throw createAppError("本地数据格式不正确，未覆盖已保存内容", "INVALID_LOCAL_DATA");
              const t = loadNotebookPreferences(),
                i = {
                  ...normalizeNotebookPreferences({
                    tags: e.tags ?? t.tags,
                    bounds: e.bounds ?? t.bounds,
                    defaultsVersion: 3,
                  }),
                  defaultsVersion: 3,
                };
              saveStoredData(STORAGE_KEYS.notebookPreferences, i, isNotebookPreferencesData);
            })({
              tags: $.value,
              ...e,
            }),
            true
          );
        } catch (t) {
          return (
            showToast({
              title: t.message || "设置未能保存，请重试",
              icon: "none",
            }),
            false
          );
        }
      }
      function X(e) {
        A.value !== e
          ? ((A.value = e),
            (S.value = null),
            createSelectorQuery()
              .in(n.proxy)
              .select(`.notebook-insert-${e}`)
              .boundingClientRect((t) => {
                t && A.value === e && (S.value = t);
              })
              .exec())
          : (A.value = "");
      }
      function Q() {
        var e;
        A.value = "";
        null == (e = y.value) || e.insertStage(a.stageLabel);
      }
      function ee() {
        A.value = "";
        T.value = true;
      }
      function te(e) {
        Y({
          tags: e,
        }) && (($.value = [...e]), (T.value = false));
      }
      function ie(e) {
        var t;
        const i = getViewportInfo(),
          a = (null == e ? void 0 : e.size) || e || {};
        return {
          width: a.windowWidth || i.windowWidth || 390,
          height: a.windowHeight || i.windowHeight || 844,
          top: 0,
          bottom: (null == (t = i.safeAreaInsets) ? void 0 : t.bottom) || 0,
        };
      }
      function ae(e) {
        ce();
        A.value = "";
        j.value = ie(e);
        O.value = clampNotebookBounds(O.value, j.value);
      }
      function le(e, t) {
        const i = [...(e.touches || []), ...(e.changedTouches || [])],
          a = null == t ? i[0] || e : i.find((e) => e.identifier === t);
        if (!a) return null;
        const l = a.clientX ?? a.pageX,
          n = a.clientY ?? a.pageY;
        return Number.isFinite(l) && Number.isFinite(n)
          ? {
              x: l,
              y: n,
              identifier: a.identifier,
            }
          : null;
      }
      function ne(e, t, i) {
        const a = le(e);
        return (
          !!a &&
          (ce(),
          (A.value = ""),
          (D.value = {
            kind: i,
            direction: t,
            start: a,
            bounds: {
              ...O.value,
            },
          }),
          true)
        );
      }
      function re(e, t) {
        (null != e.button && 0 !== e.button) ||
          (e.preventDefault(),
          e.stopPropagation(),
          ne(e, t, "mouse") &&
            (window.addEventListener("mousemove", oe), window.addEventListener("mouseup", ce)));
      }
      function oe(e) {
        var t;
        "mouse" === (null == (t = D.value) ? void 0 : t.kind) && (e.preventDefault(), me(le(e)));
      }
      function se(e, t) {
        ne(e, t, "touch");
      }
      function de(e) {
        const t = D.value;
        "touch" === (null == t ? void 0 : t.kind) && me(le(e, t.start.identifier));
      }
      function ue(e) {
        var t;
        const i = D.value;
        i &&
          "touch" === i.kind &&
          (((null == (t = e.touches) ? void 0 : t.length) &&
            ![...(e.changedTouches || [])].some((e) => e.identifier === i.start.identifier)) ||
            ce());
      }
      function me(e) {
        const t = D.value;
        e &&
          t &&
          (O.value = (function (e, t, i, a, l) {
            const n = getNotebookBoundsLimits(l),
              r = {
                ...e,
              },
              o = e.left + e.width,
              s = e.top + e.height;
            return "move" === t
              ? ((r.left = clamp(e.left + i, n.left, n.right - e.width)),
                (r.top = clamp(e.top + a, n.top, n.bottom - e.height)),
                r)
              : (t.includes("e") && (r.width = clamp(e.width + i, n.minWidth, n.right - e.left)),
                t.includes("s") && (r.height = clamp(e.height + a, n.minHeight, n.bottom - e.top)),
                t.includes("w") &&
                  ((r.left = clamp(e.left + i, n.left, o - n.minWidth)), (r.width = o - r.left)),
                t.includes("n") &&
                  ((r.top = clamp(e.top + a, n.top, s - n.minHeight)), (r.height = s - r.top)),
                r);
          })(t.bounds, t.direction, e.x - t.start.x, e.y - t.start.y, j.value));
      }
      function ce() {
        const e = D.value;
        D.value = null;
        e &&
          ["left", "top", "width", "height"].some((t) => e.bounds[t] !== O.value[t]) &&
          Y({
            bounds: {
              ...O.value,
            },
          });
        window.removeEventListener("mousemove", oe);
        window.removeEventListener("mouseup", ce);
      }
      function he(e) {
        F.value = e;
        l("update:modelValue", F.value);
      }
      function ge(e) {
        U.value = e;
        l("update:marks", e);
      }
      function fe() {
        ce();
        A.value = "";
        T.value = false;
        l("update:modelValue", F.value);
        l("update:marks", U.value);
        l("update:open", false);
      }
      function pe() {
        showModal({
          title: "确认清空笔记？",
          content: "清空后本局笔记将被移除。",
          confirmText: "确认清空",
          confirmColor: "#a16d50",
          success: (e) => {
            e.confirm &&
              ((F.value = ""), (U.value = []), l("update:modelValue", ""), l("update:marks", []));
          },
        });
      }
      function be(e) {
        "Escape" === e.key && ((A.value = ""), (T.value = false));
      }
      return (
        watch(
          () => a.modelValue,
          (e) => {
            e !== F.value && (F.value = e);
          },
        ),
        watch(
          () => a.marks,
          (e) => {
            U.value = e;
          },
        ),
        watch(
          () => a.open,
          (e) => {
            ce();
            A.value = "";
            T.value = false;
            e && ae();
          },
        ),
        onHide(ce),
        onMounted(() => {
          onWindowResize ? (onWindowResize(ae), (H = true)) : window.addEventListener("resize", ae);
          window.addEventListener("blur", ce);
          window.addEventListener("keydown", be);
        }),
        onBeforeUnmount(() => {
          var e;
          ce();
          H && (null == (e = offWindowResize) || e(ae));
          window.removeEventListener("resize", ae);
          window.removeEventListener("blur", ce);
          window.removeEventListener("keydown", be);
        }),
        (renderContext, renderCache) => {
          const Text = UniText,
            View = UniView,
            Button = UniButton,
            ScrollView = UniScrollView;
          return (
            openBlock(),
            createElementBlock(
              Fragment,
              null,
              [
                props.open
                  ? (openBlock(),
                    createBlock(
                      View,
                      {
                        key: 0,
                        class: normalizeClass([
                          "notebook-window",
                          {
                            "is-interacting": D.value,
                            "is-compact": O.value.width < 200,
                          },
                        ]),
                        style: normalizeStyle(J.value),
                        role: "dialog",
                        "aria-label": "笔记本",
                        "aria-modal": false,
                        onWheel: renderCache[7] || (renderCache[7] = withModifiers(() => {}, ["stop"])),
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            View,
                            {
                              class: "notebook-header",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  View,
                                  {
                                    class: "notebook-drag-handle",
                                    onMousedown:
                                      renderCache[0] || (renderCache[0] = (e) => re(e, "move")),
                                    onTouchstart:
                                      renderCache[1] ||
                                      (renderCache[1] = withModifiers(
                                        (e) => se(e, "move"),
                                        ["stop", "prevent"],
                                      )),
                                    onTouchmove: withModifiers(de, ["stop", "prevent"]),
                                    onTouchend: withModifiers(ue, ["stop"]),
                                    onTouchcancel: withModifiers(ce, ["stop"]),
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        View,
                                        {
                                          class: "notebook-grip",
                                          "aria-hidden": "true",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("⠿")]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        Text,
                                        {
                                          class: "notebook-hint",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createTextVNode("可拖动 . 边角可缩放"),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        Text,
                                        {
                                          class: "notebook-title",
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode("笔记本")]),
                                          _: 1,
                                        },
                                      ),
                                    ]),
                                    _: 1,
                                  },
                                ),
                                createVNode(
                                  Button,
                                  {
                                    class: "notebook-clear",
                                    onClick: withModifiers(pe, ["stop"]),
                                  },
                                  {
                                    default: withCtx(() => [createTextVNode("清空")]),
                                    _: 1,
                                  },
                                ),
                                createVNode(
                                  Button,
                                  {
                                    class: "notebook-close",
                                    "aria-label": "关闭笔记本",
                                    onClick: withModifiers(fe, ["stop"]),
                                  },
                                  {
                                    default: withCtx(() => [createTextVNode("×")]),
                                    _: 1,
                                  },
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            View,
                            {
                              class: "notebook-input",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  NotebookEditor,
                                  {
                                    ref_key: "editor",
                                    ref: y,
                                    "model-value": F.value,
                                    marks: U.value,
                                    "onUpdate:modelValue": he,
                                    "onUpdate:marks": ge,
                                  },
                                  null,
                                  8,
                                  ["model-value", "marks"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ScrollView,
                            {
                              class: "notebook-shortcuts",
                              "scroll-x": "",
                              "show-scrollbar": false,
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  View,
                                  {
                                    class: "notebook-shortcut-row",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        Button,
                                        {
                                          class: "notebook-pill notebook-insert-stage",
                                          onMousedown:
                                            renderCache[2] ||
                                            (renderCache[2] = withModifiers(() => {}, ["prevent"])),
                                          onClick: Q,
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode("当前阶段")]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        Button,
                                        {
                                          class: normalizeClass([
                                            "notebook-pill notebook-insert-players",
                                            {
                                              active: "players" === A.value,
                                            },
                                          ]),
                                          "aria-expanded": "players" === A.value,
                                          onMousedown:
                                            renderCache[3] ||
                                            (renderCache[3] = withModifiers(() => {}, ["prevent"])),
                                          onClick:
                                            renderCache[4] || (renderCache[4] = (e) => X("players")),
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode("玩家")]),
                                          _: 1,
                                        },
                                        8,
                                        ["class", "aria-expanded"],
                                      ),
                                      createVNode(
                                        Button,
                                        {
                                          class: normalizeClass([
                                            "notebook-pill notebook-insert-tags",
                                            {
                                              active: "tags" === A.value,
                                            },
                                          ]),
                                          "aria-expanded": "tags" === A.value,
                                          onMousedown:
                                            renderCache[5] ||
                                            (renderCache[5] = withModifiers(() => {}, ["prevent"])),
                                          onClick: renderCache[6] || (renderCache[6] = (e) => X("tags")),
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode("标签")]),
                                          _: 1,
                                        },
                                        8,
                                        ["class", "aria-expanded"],
                                      ),
                                    ]),
                                    _: 1,
                                  },
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          (openBlock(),
                          createElementBlock(
                            Fragment,
                            null,
                            renderList(V, (e) =>
                              createVNode(
                                View,
                                {
                                  key: e,
                                  class: normalizeClass(["notebook-resize", `notebook-resize-${e}`]),
                                  "data-direction": e,
                                  onMousedown: withModifiers((t) => re(t, e), ["stop"]),
                                  onTouchstart: withModifiers((t) => se(t, e), ["stop", "prevent"]),
                                  onTouchmove: withModifiers(de, ["stop", "prevent"]),
                                  onTouchend: withModifiers(ue, ["stop"]),
                                  onTouchcancel: withModifiers(ce, ["stop"]),
                                },
                                null,
                                8,
                                ["class", "data-direction", "onMousedown", "onTouchstart"],
                              ),
                            ),
                            64,
                          )),
                        ]),
                        _: 1,
                      },
                      8,
                      ["class", "style"],
                    ))
                  : createCommentVNode("", true),
                props.open && A.value
                  ? (openBlock(),
                    createBlock(View, {
                      key: 1,
                      class: "notebook-shortcut-dismiss",
                      onMousedown:
                        renderCache[8] || (renderCache[8] = withModifiers(() => {}, ["prevent"])),
                      onClick:
                        renderCache[9] ||
                        (renderCache[9] = withModifiers((e) => (A.value = ""), ["stop"])),
                    }))
                  : createCommentVNode("", true),
                props.open && A.value
                  ? (openBlock(),
                    createBlock(
                      View,
                      {
                        key: 2,
                        class: "notebook-shortcut-popover",
                        style: normalizeStyle(K.value),
                        role: "dialog",
                        "aria-label": "players" === A.value ? "选择玩家" : "选择标签",
                        onMousedown:
                          renderCache[11] || (renderCache[11] = withModifiers(() => {}, ["prevent"])),
                        onClick:
                          renderCache[12] || (renderCache[12] = withModifiers(() => {}, ["stop"])),
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            View,
                            {
                              class: "notebook-popover-heading",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(Text, null, {
                                  default: withCtx(() => [
                                    createTextVNode(
                                      toDisplayString("players" === A.value ? "玩家" : "标签"),
                                      1,
                                    ),
                                  ]),
                                  _: 1,
                                }),
                                createVNode(
                                  Button,
                                  {
                                    class: "notebook-shortcut-close",
                                    "aria-label": "关闭快捷选择",
                                    onClick:
                                      renderCache[10] || (renderCache[10] = (e) => (A.value = "")),
                                  },
                                  {
                                    default: withCtx(() => [createTextVNode("×")]),
                                    _: 1,
                                  },
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            ScrollView,
                            {
                              class: "notebook-options-scroll",
                              "scroll-y": "",
                            },
                            {
                              default: withCtx(() => [
                                "players" === A.value
                                  ? (openBlock(),
                                    createBlock(
                                      View,
                                      {
                                        key: 0,
                                        class: "notebook-player-options",
                                      },
                                      {
                                        default: withCtx(() => [
                                          (openBlock(true),
                                          createElementBlock(
                                            Fragment,
                                            null,
                                            renderList(props.seats, (e, t) => {
                                              var i;
                                              return (
                                                openBlock(),
                                                createBlock(
                                                  Button,
                                                  {
                                                    key: e.id,
                                                    class: "notebook-player-option",
                                                    "data-seat-number": t + 1,
                                                    "aria-label": `插入${t + 1}号玩家${e.role ? "（" + e.role.name + "）" : "（未分配）"}`,
                                                    style: normalizeStyle({
                                                      color:
                                                        unref(z)[
                                                          null == (i = e.role) ? void 0 : i.team
                                                        ] || "#79633c",
                                                    }),
                                                    onClick: (e) =>
                                                      (function (e) {
                                                        var t, i, l;
                                                        const n = a.seats[e];
                                                        n &&
                                                          ((A.value = ""),
                                                          null == (l = y.value) ||
                                                            l.insertShortcut(
                                                              `${e + 1}号玩家(${(null == (t = n.role) ? void 0 : t.name) || "未分配"})`,
                                                              (null == (i = n.role) ? void 0 : i.team) ||
                                                                "",
                                                            ));
                                                      })(t),
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(t + 1), 1),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1032,
                                                  ["data-seat-number", "aria-label", "style", "onClick"],
                                                )
                                              );
                                            }),
                                            128,
                                          )),
                                          props.seats.length
                                            ? createCommentVNode("", true)
                                            : (openBlock(),
                                              createBlock(
                                                Text,
                                                {
                                                  key: 0,
                                                  class: "notebook-empty",
                                                },
                                                {
                                                  default: withCtx(() => [createTextVNode("暂无玩家")]),
                                                  _: 1,
                                                },
                                              )),
                                        ]),
                                        _: 1,
                                      },
                                    ))
                                  : (openBlock(),
                                    createBlock(
                                      View,
                                      {
                                        key: 1,
                                        class: "notebook-tag-options",
                                      },
                                      {
                                        default: withCtx(() => [
                                          (openBlock(true),
                                          createElementBlock(
                                            Fragment,
                                            null,
                                            renderList(
                                              $.value,
                                              (e) => (
                                                openBlock(),
                                                createBlock(
                                                  Button,
                                                  {
                                                    key: e,
                                                    class: "notebook-pill notebook-tag-option",
                                                    onClick: (t) =>
                                                      (function (e) {
                                                        var t;
                                                        A.value = "";
                                                        null == (t = y.value) || t.insertShortcut(e);
                                                      })(e),
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(e), 1),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1032,
                                                  ["onClick"],
                                                )
                                              ),
                                            ),
                                            128,
                                          )),
                                          createVNode(
                                            Button,
                                            {
                                              class: "notebook-pill notebook-tags-customize",
                                              onClick: ee,
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("＋ 自定义")]),
                                              _: 1,
                                            },
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                    )),
                              ]),
                              _: 1,
                            },
                          ),
                        ]),
                        _: 1,
                      },
                      8,
                      ["style", "aria-label"],
                    ))
                  : createCommentVNode("", true),
                props.open && T.value
                  ? (openBlock(),
                    createBlock(
                      NotebookTagManager,
                      {
                        key: 3,
                        tags: $.value,
                        onSave: te,
                        onClose: renderCache[13] || (renderCache[13] = (e) => (T.value = false)),
                      },
                      null,
                      8,
                      ["tags"],
                    ))
                  : createCommentVNode("", true),
              ],
              64,
            )
          );
        }
      );
    },
  },
  [["__scopeId", "data-v-e74f683a"]],
);
export { FloatingNotebook };
