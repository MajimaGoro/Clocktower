// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  Fragment,
  UniButton,
  UniInput,
  UniScrollView,
  UniText,
  UniView,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createSelectorQuery,
  createTextVNode,
  createVNode,
  getCurrentInstance,
  nextTick,
  normalizeClass,
  normalizeStyle,
  onBeforeUnmount,
  openBlock,
  ref,
  renderList,
  toDisplayString,
  withCtx,
  withKeys,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const NotebookTagManager = withComponentMetadata(
  {
    __name: "NotebookTagManager",
    props: {
      tags: {
        type: Array,
        default: () => ["得知了", "选择了", "死亡", "被处决"],
      },
    },
    emits: ["save", "close"],
    setup(props, { emit: emit }) {
      const a = props,
        l = emit,
        n = getCurrentInstance(),
        y = (e) =>
          [
            ...new Set(
              e
                .filter((e) => "string" == typeof e)
                .map((e) => e.trim().slice(0, 40))
                .filter(Boolean),
            ),
          ].slice(0, 50),
        N = ref(y(a.tags)),
        k = ref(""),
        _ = ref(""),
        M = ref(null),
        $ = ref(0);
      function E() {
        const e = k.value.trim().slice(0, 40);
        e &&
          (N.value.includes(e)
            ? (_.value = "这个标签已经存在")
            : N.value.length >= 50
              ? (_.value = "最多添加50个标签")
              : (N.value.push(e),
                (k.value = ""),
                (_.value = ""),
                nextTick(() => {
                  $.value += 1e4;
                })));
      }
      function A(e, t) {
        B();
        const i = e + t;
        if (i < 0 || i >= N.value.length) return;
        const [a] = N.value.splice(e, 1);
        N.value.splice(i, 0, a);
      }
      function S(e) {
        var t, i;
        const a =
            (null == (t = e.touches) ? void 0 : t[0]) ||
            (null == (i = e.changedTouches) ? void 0 : i[0]) ||
            e,
          l = a.clientY ?? a.pageY;
        return Number.isFinite(l) ? l : null;
      }
      function j(e, t, i, a) {
        const l = S(i);
        if (null == l) return false;
        B();
        const r = {
          tag: e,
          index: t,
          y: l,
          kind: a,
          centers: null,
        };
        return (
          (M.value = r),
          createSelectorQuery()
            .in(n.proxy)
            .selectAll(".notebook-tag-row")
            .boundingClientRect((t) => {
              var i;
              (null == (i = M.value) ? void 0 : i.tag) === e &&
                Array.isArray(t) &&
                (M.value.centers = t.map((e) => e.top + e.height / 2));
            })
            .exec(),
          true
        );
      }
      function O(e) {
        const t = M.value,
          i = S(e);
        if (!t || null == i) return;
        const a = t.centers;
        let l = t.index + Math.round((i - t.y) / 48);
        (null == a ? void 0 : a.length) &&
          (l = a.reduce((e, t, l) => (Math.abs(t - i) < Math.abs(a[e] - i) ? l : e), 0));
        l = Math.max(0, Math.min(N.value.length - 1, l));
        const n = N.value.indexOf(t.tag);
        if (n !== l && n >= 0) {
          const [e] = N.value.splice(n, 1);
          N.value.splice(l, 0, e);
        }
      }
      function D(e) {
        var t;
        "mouse" === (null == (t = M.value) ? void 0 : t.kind) && (e.preventDefault(), O(e));
      }
      function F(e) {
        var t;
        "touch" === (null == (t = M.value) ? void 0 : t.kind) && O(e);
      }
      function B() {
        M.value = null;
        window.removeEventListener("mousemove", D);
        window.removeEventListener("mouseup", B);
        window.removeEventListener("blur", B);
      }
      function P() {
        B();
        l("close");
      }
      function W() {
        B();
        l("save", y(N.value));
      }
      return (
        onBeforeUnmount(B),
        (renderContext, renderCache) => {
          const Text = UniText,
            Button = UniButton,
            View = UniView,
            ScrollView = UniScrollView,
            Input = UniInput;
          return (
            openBlock(),
            createBlock(
              View,
              {
                class: "notebook-tags-backdrop",
                onClick: P,
                onTouchmove: renderCache[3] || (renderCache[3] = withModifiers(() => {}, ["stop"])),
              },
              {
                default: withCtx(() => [
                  createVNode(
                    View,
                    {
                      class: "notebook-tags-dialog",
                      role: "dialog",
                      "aria-modal": "true",
                      "aria-label": "自定义标签",
                      onClick: renderCache[1] || (renderCache[1] = withModifiers(() => {}, ["stop"])),
                      onMousedown:
                        renderCache[2] || (renderCache[2] = withModifiers(() => {}, ["stop"])),
                      onKeydown: withKeys(P, ["esc"]),
                    },
                    {
                      default: withCtx(() => [
                        createVNode(
                          View,
                          {
                            class: "notebook-tags-heading",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(Text, null, {
                                default: withCtx(() => [createTextVNode("自定义标签")]),
                                _: 1,
                              }),
                              createVNode(
                                Button,
                                {
                                  class: "notebook-tags-button notebook-tags-close",
                                  "aria-label": "关闭标签管理",
                                  onClick: P,
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
                          Text,
                          {
                            class: "notebook-tags-help",
                          },
                          {
                            default: withCtx(() => [createTextVNode("拖动左侧手柄调整顺序")]),
                            _: 1,
                          },
                        ),
                        createVNode(
                          ScrollView,
                          {
                            class: normalizeClass([
                              "notebook-tags-list",
                              {
                                "is-dragging": M.value,
                              },
                            ]),
                            "scroll-y": "",
                            "scroll-with-animation": false,
                            "scroll-top": $.value,
                            style: normalizeStyle({
                              height: `${Math.min(330, 64 * Math.max(1, N.value.length))}px`,
                            }),
                          },
                          {
                            default: withCtx(() => [
                              (openBlock(true),
                              createElementBlock(
                                Fragment,
                                null,
                                renderList(N.value, (e, t) => {
                                  var n;
                                  return (
                                    openBlock(),
                                    createBlock(
                                      View,
                                      {
                                        key: e,
                                        class: normalizeClass([
                                          "notebook-tag-row",
                                          {
                                            "is-moving": (null == (n = M.value) ? void 0 : n.tag) === e,
                                          },
                                        ]),
                                        "data-tag": e,
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(
                                            View,
                                            {
                                              class: "notebook-tag-handle",
                                              role: "button",
                                              "aria-label": `拖动标签${e}`,
                                              tabindex: "0",
                                              onMousedown: withModifiers(
                                                (i) =>
                                                  (function (e, t, i) {
                                                    (null != i.button && 0 !== i.button) ||
                                                      (j(e, t, i, "mouse") &&
                                                        (window.addEventListener("mousemove", D),
                                                        window.addEventListener("mouseup", B),
                                                        window.addEventListener("blur", B)));
                                                  })(e, t, i),
                                                ["stop", "prevent"],
                                              ),
                                              onTouchstart: withModifiers(
                                                (i) =>
                                                  (function (e, t, i) {
                                                    j(e, t, i, "touch");
                                                  })(e, t, i),
                                                ["stop", "prevent"],
                                              ),
                                              onTouchmove: withModifiers(F, ["stop", "prevent"]),
                                              onTouchend: withModifiers(B, ["stop"]),
                                              onTouchcancel: withModifiers(B, ["stop"]),
                                              onKeydown: [
                                                withKeys(
                                                  withModifiers((e) => A(t, -1), ["prevent"]),
                                                  ["up"],
                                                ),
                                                withKeys(
                                                  withModifiers((e) => A(t, 1), ["prevent"]),
                                                  ["down"],
                                                ),
                                              ],
                                            },
                                            {
                                              default: withCtx(() => [
                                                createVNode(
                                                  Text,
                                                  {
                                                    "aria-hidden": "true",
                                                  },
                                                  {
                                                    default: withCtx(() => [createTextVNode("⠿")]),
                                                    _: 1,
                                                  },
                                                ),
                                              ]),
                                              _: 2,
                                            },
                                            1032,
                                            ["aria-label", "onMousedown", "onTouchstart", "onKeydown"],
                                          ),
                                          createVNode(
                                            Text,
                                            {
                                              class: "notebook-tag-name",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(e), 1),
                                              ]),
                                              _: 2,
                                            },
                                            1024,
                                          ),
                                          createVNode(
                                            Button,
                                            {
                                              class: normalizeClass([
                                                "notebook-tags-button notebook-tag-order",
                                                {
                                                  "is-disabled": 0 === t,
                                                },
                                              ]),
                                              disabled: 0 === t,
                                              "aria-label": `上移标签${e}`,
                                              onClick: (e) => A(t, -1),
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("↑")]),
                                              _: 2,
                                            },
                                            1032,
                                            ["class", "disabled", "aria-label", "onClick"],
                                          ),
                                          createVNode(
                                            Button,
                                            {
                                              class: normalizeClass([
                                                "notebook-tags-button notebook-tag-order",
                                                {
                                                  "is-disabled": t === N.value.length - 1,
                                                },
                                              ]),
                                              disabled: t === N.value.length - 1,
                                              "aria-label": `下移标签${e}`,
                                              onClick: (e) => A(t, 1),
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("↓")]),
                                              _: 2,
                                            },
                                            1032,
                                            ["class", "disabled", "aria-label", "onClick"],
                                          ),
                                          createVNode(
                                            Button,
                                            {
                                              class: "notebook-tags-button notebook-tag-delete",
                                              "aria-label": `删除标签${e}`,
                                              onClick: (e) =>
                                                (function (e) {
                                                  B();
                                                  N.value.splice(e, 1);
                                                  _.value = "";
                                                })(t),
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("删除")]),
                                              _: 2,
                                            },
                                            1032,
                                            ["aria-label", "onClick"],
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1032,
                                      ["class", "data-tag"],
                                    )
                                  );
                                }),
                                128,
                              )),
                              N.value.length
                                ? createCommentVNode("", true)
                                : (openBlock(),
                                  createBlock(
                                    Text,
                                    {
                                      key: 0,
                                      class: "notebook-tags-empty",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createTextVNode("还没有标签，在下方添加。"),
                                      ]),
                                      _: 1,
                                    },
                                  )),
                            ]),
                            _: 1,
                          },
                          8,
                          ["scroll-top", "style", "class"],
                        ),
                        createVNode(
                          View,
                          {
                            class: "notebook-tags-add-row",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                Input,
                                {
                                  modelValue: k.value,
                                  "onUpdate:modelValue":
                                    renderCache[0] || (renderCache[0] = (e) => (k.value = e)),
                                  class: "notebook-tags-add-input",
                                  maxlength: "40",
                                  placeholder: "输入新标签",
                                  "aria-label": "新标签",
                                  "confirm-type": "done",
                                  onConfirm: E,
                                },
                                null,
                                8,
                                ["modelValue"],
                              ),
                              createVNode(
                                Button,
                                {
                                  class: normalizeClass([
                                    "notebook-tags-button notebook-tags-add",
                                    {
                                      "is-disabled": !k.value.trim() || N.value.length >= 50,
                                    },
                                  ]),
                                  disabled: !k.value.trim() || N.value.length >= 50,
                                  onClick: E,
                                },
                                {
                                  default: withCtx(() => [createTextVNode("添加")]),
                                  _: 1,
                                },
                                8,
                                ["class", "disabled"],
                              ),
                            ]),
                            _: 1,
                          },
                        ),
                        _.value
                          ? (openBlock(),
                            createBlock(
                              Text,
                              {
                                key: 0,
                                class: "notebook-tags-notice",
                                role: "status",
                              },
                              {
                                default: withCtx(() => [createTextVNode(toDisplayString(_.value), 1)]),
                                _: 1,
                              },
                            ))
                          : createCommentVNode("", true),
                        createVNode(
                          View,
                          {
                            class: "notebook-tags-actions",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                Button,
                                {
                                  class: "notebook-tags-button notebook-tags-cancel",
                                  onClick: P,
                                },
                                {
                                  default: withCtx(() => [createTextVNode("取消")]),
                                  _: 1,
                                },
                              ),
                              createVNode(
                                Button,
                                {
                                  class: "notebook-tags-button notebook-tags-save",
                                  onClick: W,
                                },
                                {
                                  default: withCtx(() => [createTextVNode("保存")]),
                                  _: 1,
                                },
                              ),
                            ]),
                            _: 1,
                          },
                        ),
                      ]),
                      _: 1,
                    },
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
  [["__scopeId", "data-v-a4e1ee08"]],
);
export { NotebookTagManager };
