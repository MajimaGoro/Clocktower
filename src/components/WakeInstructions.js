// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { CompactDialog } from "./CompactDialog.js";
import { RolePortrait } from "./RolePortrait.js";
import { BUILT_IN_WAKE_SHORTCUTS } from "../data/wakeShortcuts.js";
import { createAppError } from "../domain/errors.js";
import { useLongPress } from "../composables/useLongPress.js";
import { normalizeWakeShortcuts } from "../domain/wakeShortcuts.js";
import {
  Fragment,
  UniButton,
  UniImage,
  UniInput,
  UniScrollView,
  UniText,
  UniView,
  computed,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createTextVNode,
  createVNode,
  normalizeClass,
  normalizeStyle,
  offWindowResize,
  onBeforeUnmount,
  onMounted,
  onWindowResize,
  openBlock,
  ref,
  renderList,
  showToast,
  toDisplayString,
  unref,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
import { onHide } from "../runtime/lifecycle.js";
import { getViewportInfo } from "../runtime/viewport.js";
import { STORAGE_KEYS } from "../storage/keys.js";
import { loadStoredData, saveStoredData } from "../storage/storage.js";
import { isWakeShortcutsData } from "../storage/validation.js";
const WakeInstructions = withComponentMetadata(
  {
    __name: "WakeInstructions",
    props: {
      script: {
        type: Object,
        required: true,
      },
      seats: {
        type: Array,
        default: () => [],
      },
      bluffRoles: {
        type: Array,
        default: () => [],
      },
    },
    emits: ["close"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit,
        l = ref([]),
        n = ref("common"),
        y = ref(""),
        k = ref(""),
        $ = ref(null),
        A = ref(""),
        S = ref(
          normalizeWakeShortcuts(
            loadStoredData(STORAGE_KEYS.wakeShortcuts, isWakeShortcutsData, {
              disabled: [],
              custom: [],
            }),
          ),
        ),
        z = ref(false),
        V = ref(false),
        L = ref("seat"),
        j = ref(false),
        O = ref({
          width: 390,
          height: 844,
        }),
        D = useLongPress(function (e) {
          e.role
            ? ne(e.role)
            : showToast({
                title: "该玩家尚未分配角色",
                icon: "none",
              });
        });
      let F = 1;
      const B = [
          {
            key: "common",
            label: "常用",
          },
          {
            key: "players",
            label: "玩家",
          },
          {
            key: "roles",
            label: "角色",
          },
          {
            key: "manage",
            label: "自定义常用",
          },
        ],
        U = computed(() => [
          ...BUILT_IN_WAKE_SHORTCUTS.filter(
            (e) => "preset" === e.kind || !S.value.disabled.includes(e.id),
          ),
          ...S.value.custom.map((e) => ({
            id: `custom:${e}`,
            label: e,
            kind: "custom",
          })),
        ]),
        H = computed(() =>
          BUILT_IN_WAKE_SHORTCUTS.filter((e) => "word" === e.kind && S.value.disabled.includes(e.id)),
        ),
        J = computed(() => U.value.filter((e) => "preset" !== e.kind)),
        K = computed(() => U.value.filter((e) => "preset" === e.kind)),
        Y = computed(() =>
          k.value.trim()
            ? [
                ...l.value,
                {
                  id: "custom-input",
                  label: k.value.trim(),
                },
              ]
            : l.value,
        ),
        X = computed(() =>
          (i.script.roles || []).filter(
            (e) =>
              !["a jinxed", "jinxed", "status"].includes(e.team) &&
              !(V.value && ["traveler", "traveller", "旅行者"].includes(e.team)) &&
              `${e.name} ${e.id}`.toLowerCase().includes(y.value.trim().toLowerCase()),
          ),
        ),
        Q = computed(() => {
          const e =
            Y.value.length <= 1 ? 1 : Y.value.length <= 2 ? 0.74 : Y.value.length <= 4 ? 0.55 : 0.42;
          return O.value.width > O.value.height && Y.value.length >= 3 ? 0.84 * e : e;
        }),
        ee = computed(() => Math.min(O.value.width, O.value.height)),
        te = computed(() => Math.round(Math.min(280, Math.max(88, 0.72 * ee.value * Q.value)))),
        ie = computed(() => {
          const e = Math.max(
            1,
            ...Y.value.filter((e) => !e.role).map((e) => Array.from(e.label).length),
          );
          return {
            "--wake-preview-font-size": `${Math.min(84, Math.max(28, 0.22 * ee.value * Q.value * Math.min(1, 8 / Math.sqrt(e))))}px`,
            "--wake-preview-gap": `${Math.max(10, 0.042 * ee.value * Q.value)}px`,
          };
        });
      function ae() {
        const e = k.value.trim();
        e &&
          l.value.push({
            id: F++,
            label: e,
          });
        oe();
      }
      function le(e) {
        e.trim() &&
          (ae(),
          l.value.push({
            id: F++,
            label: e,
          }));
      }
      function ne(e) {
        ae();
        l.value.push({
          id: F++,
          label: e.name,
          role: e,
        });
      }
      function re() {
        z.value = false;
        V.value = true;
        y.value = "";
        n.value = "roles";
      }
      function oe() {
        var e, t;
        k.value = "";
        se && "" !== se.value && (se.value = "");
        null == (t = null == (e = $.value) ? void 0 : e.$triggerInput) ||
          t.call(e, {
            value: "",
          });
      }
      let se = null;
      function de(e) {
        var t, i;
        const a = e.target.value;
        null == (i = null == (t = $.value) ? void 0 : t.$triggerInput) ||
          i.call(t, {
            value: a,
          });
        k.value = a;
      }
      function ue(e) {
        try {
          return (
            (function (e) {
              if (!isWakeShortcutsData(e))
                throw createAppError("本地数据格式不正确，未覆盖已保存内容", "INVALID_LOCAL_DATA");
              saveStoredData(STORAGE_KEYS.wakeShortcuts, normalizeWakeShortcuts(e), isWakeShortcutsData);
            })(e),
            (S.value = normalizeWakeShortcuts(e)),
            true
          );
        } catch (t) {
          return (
            showToast({
              title: t.message || "常用设置保存失败，请重试",
              icon: "none",
            }),
            false
          );
        }
      }
      function me() {
        const e = A.value.trim();
        if (!e) return;
        if (U.value.some((t) => t.label === e))
          return showToast({
            title: "该常用信息已存在",
            icon: "none",
          });
        const t = BUILT_IN_WAKE_SHORTCUTS.find((t) => t.label === e);
        if (!t && S.value.custom.length >= 50)
          return showToast({
            title: "最多添加50条自定义常用",
            icon: "none",
          });
        ue(
          t
            ? {
                ...S.value,
                disabled: S.value.disabled.filter((e) => e !== t.id),
              }
            : {
                ...S.value,
                custom: [...S.value.custom, e],
              },
        ) && (A.value = "");
      }
      function ce() {
        l.value = [];
        oe();
        V.value = false;
      }
      function he() {
        j.value = false;
        ce();
      }
      function ge(e) {
        const t = (null == e ? void 0 : e.size) || getViewportInfo();
        O.value = {
          width: t.windowWidth || 390,
          height: t.windowHeight || 844,
        };
      }
      return (
        onMounted(() => {
          var e;
          ge();
          null == (e = onWindowResize) || e(ge);
        }),
        onBeforeUnmount(() => {
          var e;
          null == (e = offWindowResize) || e(ge);
        }),
        onMounted(function () {
          var e, t;
          const i = (null == (e = $.value) ? void 0 : e.$el) || $.value;
          se =
            (null == (t = null == i ? void 0 : i.querySelector) ? void 0 : t.call(i, "input")) ||
            ("INPUT" === (null == i ? void 0 : i.tagName) ? i : null);
          null == se || se.addEventListener("input", de, true);
          null == se || se.addEventListener("compositionend", de, true);
        }),
        onBeforeUnmount(function () {
          null == se || se.removeEventListener("input", de, true);
          null == se || se.removeEventListener("compositionend", de, true);
        }),
        onHide(() => {
          D.cancel();
          j.value = false;
        }),
        (renderContext, renderCache) => {
          const Text = UniText,
            Button = UniButton,
            View = UniView,
            Input = UniInput,
            ScrollView = UniScrollView,
            Image = UniImage;
          return (
            openBlock(),
            createElementBlock(
              Fragment,
              null,
              [
                createVNode(
                  View,
                  {
                    class: "wake-instructions-backdrop",
                    onClick: renderCache[7] || (renderCache[7] = (e) => a("close")),
                  },
                  {
                    default: withCtx(() => [
                      createVNode(
                        View,
                        {
                          class: "wake-instructions-panel",
                          role: "dialog",
                          "aria-label": "唤醒指示",
                          onClick:
                            renderCache[6] || (renderCache[6] = withModifiers(() => {}, ["stop"])),
                        },
                        {
                          default: withCtx(() => [
                            createVNode(
                              View,
                              {
                                class: "wake-editor-heading",
                              },
                              {
                                default: withCtx(() => [
                                  createVNode(Text, null, {
                                    default: withCtx(() => [createTextVNode("唤醒指示")]),
                                    _: 1,
                                  }),
                                  createVNode(
                                    Button,
                                    {
                                      class: "wake-editor-close sheet-close",
                                      "aria-label": "关闭唤醒指示",
                                      onClick: renderCache[0] || (renderCache[0] = (e) => a("close")),
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
                                class: "wake-composer",
                              },
                              {
                                default: withCtx(() => [
                                  (openBlock(true),
                                  createElementBlock(
                                    Fragment,
                                    null,
                                    renderList(
                                      l.value,
                                      (e, t) => (
                                        openBlock(),
                                        createBlock(
                                          Button,
                                          {
                                            class: "wake-composer-block",
                                            key: e.id,
                                            "aria-label": `删除${e.label}`,
                                            onClick: (e) =>
                                              (function (e) {
                                                l.value.splice(e, 1);
                                              })(t),
                                          },
                                          {
                                            default: withCtx(() => [
                                              createVNode(
                                                Text,
                                                {
                                                  class: "wake-composer-label",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createTextVNode(toDisplayString(e.label), 1),
                                                  ]),
                                                  _: 2,
                                                },
                                                1024,
                                              ),
                                              createVNode(
                                                Text,
                                                {
                                                  class: "wake-composer-remove",
                                                  "aria-hidden": "true",
                                                },
                                                {
                                                  default: withCtx(() => [createTextVNode("×")]),
                                                  _: 1,
                                                },
                                              ),
                                            ]),
                                            _: 2,
                                          },
                                          1032,
                                          ["aria-label", "onClick"],
                                        )
                                      ),
                                    ),
                                    128,
                                  )),
                                  createVNode(
                                    Input,
                                    {
                                      ref_key: "customInputRef",
                                      ref: $,
                                      value: k.value,
                                      class: "wake-custom-input",
                                      maxlength: "240",
                                      placeholder: "您可以在这里直接输入自定义信息。",
                                      "placeholder-style": "color: #a1937e",
                                      onInput:
                                        renderCache[1] ||
                                        (renderCache[1] = (e) => {
                                          return ((t = e.detail.value), void (se || (k.value = t)));
                                          var t;
                                        }),
                                    },
                                    null,
                                    8,
                                    ["value"],
                                  ),
                                ]),
                                _: 1,
                              },
                            ),
                            createVNode(
                              View,
                              {
                                class: "wake-editor-tabs",
                              },
                              {
                                default: withCtx(() => [
                                  (openBlock(),
                                  createElementBlock(
                                    Fragment,
                                    null,
                                    renderList(B, (e) =>
                                      createVNode(
                                        Button,
                                        {
                                          class: normalizeClass([
                                            "wake-editor-tab",
                                            {
                                              active: n.value === e.key,
                                            },
                                          ]),
                                          key: e.key,
                                          "data-tab": e.key,
                                          onClick: (t) => {
                                            return (
                                              (i = e.key),
                                              D.cancel(),
                                              (n.value = i),
                                              "roles" !== i && (V.value = false),
                                              void ("players" === i && (L.value = "seat"))
                                            );
                                            var i;
                                          },
                                        },
                                        {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(e.label), 1),
                                          ]),
                                          _: 2,
                                        },
                                        1032,
                                        ["class", "data-tab", "onClick"],
                                      ),
                                    ),
                                    64,
                                  )),
                                ]),
                                _: 1,
                              },
                            ),
                            createVNode(
                              ScrollView,
                              {
                                class: "wake-editor-body",
                                "scroll-y": "",
                              },
                              {
                                default: withCtx(() => [
                                  createVNode(
                                    View,
                                    {
                                      class: "wake-editor-content",
                                    },
                                    {
                                      default: withCtx(() => [
                                        "common" === n.value
                                          ? (openBlock(),
                                            createElementBlock(
                                              Fragment,
                                              {
                                                key: 0,
                                              },
                                              [
                                                createVNode(
                                                  View,
                                                  {
                                                    class: "wake-shortcuts",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      (openBlock(true),
                                                      createElementBlock(
                                                        Fragment,
                                                        null,
                                                        renderList(
                                                          J.value,
                                                          (e) => (
                                                            openBlock(),
                                                            createBlock(
                                                              Button,
                                                              {
                                                                key: e.id,
                                                                class: "wake-shortcut",
                                                                "data-shortcut-id": e.id,
                                                                onClick: (t) => le(e.label),
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  createTextVNode(
                                                                    toDisplayString(e.label),
                                                                    1,
                                                                  ),
                                                                ]),
                                                                _: 2,
                                                              },
                                                              1032,
                                                              ["data-shortcut-id", "onClick"],
                                                            )
                                                          ),
                                                        ),
                                                        128,
                                                      )),
                                                    ]),
                                                    _: 1,
                                                  },
                                                ),
                                                createVNode(
                                                  View,
                                                  {
                                                    class: "wake-preset-grid",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      (openBlock(true),
                                                      createElementBlock(
                                                        Fragment,
                                                        null,
                                                        renderList(
                                                          K.value,
                                                          (e) => (
                                                            openBlock(),
                                                            createBlock(
                                                              Button,
                                                              {
                                                                key: e.key,
                                                                class: "wake-preset",
                                                                "data-preset": e.key,
                                                                onClick: (t) =>
                                                                  (function (e) {
                                                                    if (
                                                                      ((V.value = false),
                                                                      le(e.label),
                                                                      "bluffs" === e.key)
                                                                    ) {
                                                                      const e =
                                                                        i.bluffRoles.filter(Boolean);
                                                                      if (!e.length)
                                                                        return void (z.value = true);
                                                                      e.forEach(ne);
                                                                    }
                                                                    ("demon" !== e.key &&
                                                                      "minions" !== e.key) ||
                                                                      i.seats.forEach((t, i) => {
                                                                        var a;
                                                                        (null == (a = t.role)
                                                                          ? void 0
                                                                          : a.team) ===
                                                                          ("demon" === e.key
                                                                            ? "demon"
                                                                            : "minion") &&
                                                                          le(`${i + 1}号玩家`);
                                                                      });
                                                                    ("youare" !== e.key &&
                                                                      "active" !== e.key) ||
                                                                      (n.value = "roles");
                                                                    "thisplayer" === e.key &&
                                                                      ((L.value = "role"),
                                                                      (n.value = "players"));
                                                                  })(e),
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  createVNode(
                                                                    Text,
                                                                    {
                                                                      class: "wake-preset-symbol",
                                                                      "aria-hidden": "true",
                                                                    },
                                                                    {
                                                                      default: withCtx(() => [
                                                                        createTextVNode(
                                                                          toDisplayString(e.symbol),
                                                                          1,
                                                                        ),
                                                                      ]),
                                                                      _: 2,
                                                                    },
                                                                    1024,
                                                                  ),
                                                                  createVNode(
                                                                    Text,
                                                                    null,
                                                                    {
                                                                      default: withCtx(() => [
                                                                        createTextVNode(
                                                                          toDisplayString(e.label),
                                                                          1,
                                                                        ),
                                                                      ]),
                                                                      _: 2,
                                                                    },
                                                                    1024,
                                                                  ),
                                                                ]),
                                                                _: 2,
                                                              },
                                                              1032,
                                                              ["data-preset", "onClick"],
                                                            )
                                                          ),
                                                        ),
                                                        128,
                                                      )),
                                                    ]),
                                                    _: 1,
                                                  },
                                                ),
                                              ],
                                              64,
                                            ))
                                          : "players" === n.value
                                            ? (openBlock(),
                                              createElementBlock(
                                                Fragment,
                                                {
                                                  key: 1,
                                                },
                                                [
                                                  createVNode(
                                                    Text,
                                                    {
                                                      class: "wake-section-note",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode(
                                                          toDisplayString(
                                                            "role" === L.value
                                                              ? "选择一名玩家，将其角色加入信息"
                                                              : "轻点加入座位号，长按加入该玩家角色",
                                                          ),
                                                          1,
                                                        ),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ),
                                                  createVNode(
                                                    View,
                                                    {
                                                      class: "wake-player-grid",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        (openBlock(true),
                                                        createElementBlock(
                                                          Fragment,
                                                          null,
                                                          renderList(
                                                            props.seats,
                                                            (e, t) => (
                                                              openBlock(),
                                                              createBlock(
                                                                Button,
                                                                {
                                                                  key: e.id,
                                                                  class: "wake-player-choice",
                                                                  "data-seat-id": e.id,
                                                                  onClick: (i) =>
                                                                    (function (e, t) {
                                                                      D.allowTap() &&
                                                                        ("role" === L.value && e.role
                                                                          ? ne(e.role)
                                                                          : le(`${t + 1}号玩家`));
                                                                    })(e, t),
                                                                  onLongpress: (t) =>
                                                                    unref(D).inspect(e),
                                                                  onTouchstart: (t) =>
                                                                    unref(D).touchStart(e, t),
                                                                  onTouchmove: unref(D).move,
                                                                  onTouchend: unref(D).touchEnd,
                                                                  onTouchcancel: unref(D).cancel,
                                                                  onMousedown: (t) =>
                                                                    unref(D).mouseStart(e, t),
                                                                  onMousemove: unref(D).move,
                                                                  onMouseup: unref(D).end,
                                                                  onMouseleave: unref(D).cancel,
                                                                  onContextmenu:
                                                                    renderCache[2] ||
                                                                    (renderCache[2] =
                                                                      withModifiers(() => {}, [
                                                                        "prevent",
                                                                      ])),
                                                                },
                                                                {
                                                                  default: withCtx(() => [
                                                                    createVNode(
                                                                      Text,
                                                                      {
                                                                        class: "wake-player-number",
                                                                      },
                                                                      {
                                                                        default: withCtx(() => [
                                                                          createTextVNode(
                                                                            toDisplayString(t + 1),
                                                                            1,
                                                                          ),
                                                                        ]),
                                                                        _: 2,
                                                                      },
                                                                      1024,
                                                                    ),
                                                                    createVNode(
                                                                      Text,
                                                                      null,
                                                                      {
                                                                        default: withCtx(() => {
                                                                          var t;
                                                                          return [
                                                                            createTextVNode(
                                                                              toDisplayString(
                                                                                (null == (t = e.role)
                                                                                  ? void 0
                                                                                  : t.name) ||
                                                                                  "未分配角色",
                                                                              ),
                                                                              1,
                                                                            ),
                                                                          ];
                                                                        }),
                                                                        _: 2,
                                                                      },
                                                                      1024,
                                                                    ),
                                                                  ]),
                                                                  _: 2,
                                                                },
                                                                1032,
                                                                [
                                                                  "data-seat-id",
                                                                  "onClick",
                                                                  "onLongpress",
                                                                  "onTouchstart",
                                                                  "onTouchmove",
                                                                  "onTouchend",
                                                                  "onTouchcancel",
                                                                  "onMousedown",
                                                                  "onMousemove",
                                                                  "onMouseup",
                                                                  "onMouseleave",
                                                                ],
                                                              )
                                                            ),
                                                          ),
                                                          128,
                                                        )),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ),
                                                ],
                                                64,
                                              ))
                                            : "roles" === n.value
                                              ? (openBlock(),
                                                createElementBlock(
                                                  Fragment,
                                                  {
                                                    key: 2,
                                                  },
                                                  [
                                                    createVNode(
                                                      Input,
                                                      {
                                                        modelValue: y.value,
                                                        "onUpdate:modelValue":
                                                          renderCache[3] ||
                                                          (renderCache[3] = (e) => (y.value = e)),
                                                        class: "wake-role-search",
                                                        placeholder: "搜索角色",
                                                        "placeholder-style": "color: #a1937e",
                                                      },
                                                      null,
                                                      8,
                                                      ["modelValue"],
                                                    ),
                                                    createVNode(
                                                      View,
                                                      {
                                                        class: "wake-role-grid",
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          (openBlock(true),
                                                          createElementBlock(
                                                            Fragment,
                                                            null,
                                                            renderList(
                                                              X.value,
                                                              (e) => (
                                                                openBlock(),
                                                                createBlock(
                                                                  Button,
                                                                  {
                                                                    key: e.id,
                                                                    class: "wake-role-choice",
                                                                    "data-role-id": e.id,
                                                                    "aria-label": `添加角色${e.name}`,
                                                                    onClick: (t) => ne(e),
                                                                  },
                                                                  {
                                                                    default: withCtx(() => [
                                                                      createVNode(
                                                                        RolePortrait,
                                                                        {
                                                                          role: e,
                                                                          size: 66,
                                                                          named: "",
                                                                        },
                                                                        null,
                                                                        8,
                                                                        ["role"],
                                                                      ),
                                                                    ]),
                                                                    _: 2,
                                                                  },
                                                                  1032,
                                                                  [
                                                                    "data-role-id",
                                                                    "aria-label",
                                                                    "onClick",
                                                                  ],
                                                                )
                                                              ),
                                                            ),
                                                            128,
                                                          )),
                                                        ]),
                                                        _: 1,
                                                      },
                                                    ),
                                                    X.value.length
                                                      ? createCommentVNode("", true)
                                                      : (openBlock(),
                                                        createBlock(
                                                          Text,
                                                          {
                                                            key: 0,
                                                            class: "wake-empty",
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createTextVNode("没有匹配的角色"),
                                                            ]),
                                                            _: 1,
                                                          },
                                                        )),
                                                  ],
                                                  64,
                                                ))
                                              : "manage" === n.value
                                                ? (openBlock(),
                                                  createElementBlock(
                                                    Fragment,
                                                    {
                                                      key: 3,
                                                    },
                                                    [
                                                      createVNode(
                                                        View,
                                                        {
                                                          class: "wake-common-form",
                                                        },
                                                        {
                                                          default: withCtx(() => [
                                                            createVNode(
                                                              Input,
                                                              {
                                                                modelValue: A.value,
                                                                "onUpdate:modelValue":
                                                                  renderCache[4] ||
                                                                  (renderCache[4] = (e) =>
                                                                    (A.value = e)),
                                                                class: "wake-common-input",
                                                                maxlength: "120",
                                                                placeholder: "输入新的常用信息",
                                                                "placeholder-style": "color: #a1937e",
                                                                onConfirm: me,
                                                              },
                                                              null,
                                                              8,
                                                              ["modelValue"],
                                                            ),
                                                            createVNode(
                                                              Button,
                                                              {
                                                                class: "wake-common-add",
                                                                disabled: !A.value.trim(),
                                                                onClick: me,
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  createTextVNode("添加常用"),
                                                                ]),
                                                                _: 1,
                                                              },
                                                              8,
                                                              ["disabled"],
                                                            ),
                                                          ]),
                                                          _: 1,
                                                        },
                                                      ),
                                                      createVNode(
                                                        View,
                                                        {
                                                          class: "wake-common-list",
                                                        },
                                                        {
                                                          default: withCtx(() => [
                                                            (openBlock(true),
                                                            createElementBlock(
                                                              Fragment,
                                                              null,
                                                              renderList(
                                                                J.value,
                                                                (e) => (
                                                                  openBlock(),
                                                                  createBlock(
                                                                    View,
                                                                    {
                                                                      key: e.id,
                                                                      class: "wake-common-row",
                                                                    },
                                                                    {
                                                                      default: withCtx(() => [
                                                                        createVNode(
                                                                          Text,
                                                                          {
                                                                            class: "wake-common-label",
                                                                          },
                                                                          {
                                                                            default: withCtx(() => [
                                                                              createTextVNode(
                                                                                toDisplayString(e.label),
                                                                                1,
                                                                              ),
                                                                            ]),
                                                                            _: 2,
                                                                          },
                                                                          1024,
                                                                        ),
                                                                        createVNode(
                                                                          Button,
                                                                          {
                                                                            class: "wake-common-remove",
                                                                            "data-shortcut-id": e.id,
                                                                            "aria-label": `删除常用${e.label}`,
                                                                            onClick: (t) =>
                                                                              (function (e) {
                                                                                if ("preset" === e.kind)
                                                                                  return;
                                                                                const t = S.value;
                                                                                ue(
                                                                                  "custom" === e.kind
                                                                                    ? {
                                                                                        ...t,
                                                                                        custom:
                                                                                          t.custom.filter(
                                                                                            (t) =>
                                                                                              t !==
                                                                                              e.label,
                                                                                          ),
                                                                                      }
                                                                                    : {
                                                                                        ...t,
                                                                                        disabled: [
                                                                                          ...t.disabled,
                                                                                          e.id,
                                                                                        ],
                                                                                      },
                                                                                );
                                                                              })(e),
                                                                          },
                                                                          {
                                                                            default: withCtx(() => [
                                                                              createTextVNode("×"),
                                                                            ]),
                                                                            _: 2,
                                                                          },
                                                                          1032,
                                                                          [
                                                                            "data-shortcut-id",
                                                                            "aria-label",
                                                                            "onClick",
                                                                          ],
                                                                        ),
                                                                      ]),
                                                                      _: 2,
                                                                    },
                                                                    1024,
                                                                  )
                                                                ),
                                                              ),
                                                              128,
                                                            )),
                                                          ]),
                                                          _: 1,
                                                        },
                                                      ),
                                                      J.value.length
                                                        ? createCommentVNode("", true)
                                                        : (openBlock(),
                                                          createBlock(
                                                            Text,
                                                            {
                                                              key: 0,
                                                              class: "wake-empty",
                                                            },
                                                            {
                                                              default: withCtx(() => [
                                                                createTextVNode("暂无常用短语"),
                                                              ]),
                                                              _: 1,
                                                            },
                                                          )),
                                                      H.value.length
                                                        ? (openBlock(),
                                                          createElementBlock(
                                                            Fragment,
                                                            {
                                                              key: 1,
                                                            },
                                                            [
                                                              createVNode(
                                                                Text,
                                                                {
                                                                  class:
                                                                    "wake-section-note wake-restore-heading",
                                                                },
                                                                {
                                                                  default: withCtx(() => [
                                                                    createTextVNode("可添加的短语"),
                                                                  ]),
                                                                  _: 1,
                                                                },
                                                              ),
                                                              createVNode(
                                                                View,
                                                                {
                                                                  class: "wake-common-list",
                                                                },
                                                                {
                                                                  default: withCtx(() => [
                                                                    (openBlock(true),
                                                                    createElementBlock(
                                                                      Fragment,
                                                                      null,
                                                                      renderList(
                                                                        H.value,
                                                                        (e) => (
                                                                          openBlock(),
                                                                          createBlock(
                                                                            View,
                                                                            {
                                                                              key: e.id,
                                                                              class: "wake-common-row",
                                                                            },
                                                                            {
                                                                              default: withCtx(() => [
                                                                                createVNode(
                                                                                  Text,
                                                                                  {
                                                                                    class:
                                                                                      "wake-common-label",
                                                                                  },
                                                                                  {
                                                                                    default: withCtx(
                                                                                      () => [
                                                                                        createTextVNode(
                                                                                          toDisplayString(
                                                                                            e.label,
                                                                                          ),
                                                                                          1,
                                                                                        ),
                                                                                      ],
                                                                                    ),
                                                                                    _: 2,
                                                                                  },
                                                                                  1024,
                                                                                ),
                                                                                createVNode(
                                                                                  Button,
                                                                                  {
                                                                                    class:
                                                                                      "wake-common-restore",
                                                                                    "data-shortcut-id":
                                                                                      e.id,
                                                                                    "aria-label": `添加常用${e.label}`,
                                                                                    onClick: (t) => {
                                                                                      return (
                                                                                        (i = e.id),
                                                                                        void ue({
                                                                                          ...S.value,
                                                                                          disabled:
                                                                                            S.value.disabled.filter(
                                                                                              (e) =>
                                                                                                e !== i,
                                                                                            ),
                                                                                        })
                                                                                      );
                                                                                      var i;
                                                                                    },
                                                                                  },
                                                                                  {
                                                                                    default: withCtx(
                                                                                      () => [
                                                                                        createTextVNode(
                                                                                          "＋",
                                                                                        ),
                                                                                      ],
                                                                                    ),
                                                                                    _: 2,
                                                                                  },
                                                                                  1032,
                                                                                  [
                                                                                    "data-shortcut-id",
                                                                                    "aria-label",
                                                                                    "onClick",
                                                                                  ],
                                                                                ),
                                                                              ]),
                                                                              _: 2,
                                                                            },
                                                                            1024,
                                                                          )
                                                                        ),
                                                                      ),
                                                                      128,
                                                                    )),
                                                                  ]),
                                                                  _: 1,
                                                                },
                                                              ),
                                                            ],
                                                            64,
                                                          ))
                                                        : createCommentVNode("", true),
                                                    ],
                                                    64,
                                                  ))
                                                : createCommentVNode("", true),
                                      ]),
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
                                class: "wake-editor-footer",
                              },
                              {
                                default: withCtx(() => [
                                  createVNode(
                                    Button,
                                    {
                                      class: "wake-clear",
                                      disabled: !Y.value.length,
                                      onClick: ce,
                                    },
                                    {
                                      default: withCtx(() => [createTextVNode("清空信息")]),
                                      _: 1,
                                    },
                                    8,
                                    ["disabled"],
                                  ),
                                  createVNode(
                                    Button,
                                    {
                                      class: "wake-show",
                                      disabled: !Y.value.length,
                                      onClick:
                                        renderCache[5] || (renderCache[5] = (e) => (j.value = true)),
                                    },
                                    {
                                      default: withCtx(() => [createTextVNode("全屏展示")]),
                                      _: 1,
                                    },
                                    8,
                                    ["disabled"],
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
                ),
                j.value
                  ? (openBlock(),
                    createBlock(
                      View,
                      {
                        key: 0,
                        class: "wake-instructions-preview wake-fullscreen",
                        role: "dialog",
                        "aria-label": "唤醒信息卡，轻触任意处关闭并清空",
                        onClick: he,
                        onTouchmove:
                          renderCache[8] || (renderCache[8] = withModifiers(() => {}, ["stop"])),
                        onContextmenu:
                          renderCache[9] || (renderCache[9] = withModifiers(() => {}, ["prevent"])),
                      },
                      {
                        default: withCtx(() => [
                          createVNode(Image, {
                            webp: true,
                            class: "wake-preview-scene",
                            src: "/minibotc/static/ui/background.webp",
                            mode: "aspectFill",
                            "aria-hidden": "true",
                          }),
                          createVNode(View, {
                            class: "wake-preview-atmosphere",
                            "aria-hidden": "true",
                          }),
                          createVNode(
                            ScrollView,
                            {
                              class: "wake-preview-scroll",
                              "scroll-y": "",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  View,
                                  {
                                    class: "wake-preview-content",
                                    style: normalizeStyle(ie.value),
                                  },
                                  {
                                    default: withCtx(() => [
                                      (openBlock(true),
                                      createElementBlock(
                                        Fragment,
                                        null,
                                        renderList(
                                          Y.value,
                                          (e) => (
                                            openBlock(),
                                            createBlock(
                                              View,
                                              {
                                                key: e.id,
                                                class: "wake-block",
                                              },
                                              {
                                                default: withCtx(() => [
                                                  e.role
                                                    ? (openBlock(),
                                                      createBlock(
                                                        RolePortrait,
                                                        {
                                                          key: 0,
                                                          role: e.role,
                                                          size: te.value,
                                                          named: "",
                                                        },
                                                        null,
                                                        8,
                                                        ["role", "size"],
                                                      ))
                                                    : (openBlock(),
                                                      createBlock(
                                                        Text,
                                                        {
                                                          key: 1,
                                                        },
                                                        {
                                                          default: withCtx(() => [
                                                            createTextVNode(toDisplayString(e.label), 1),
                                                          ]),
                                                          _: 2,
                                                        },
                                                        1024,
                                                      )),
                                                ]),
                                                _: 2,
                                              },
                                              1024,
                                            )
                                          ),
                                        ),
                                        128,
                                      )),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ["style"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                        ]),
                        _: 1,
                      },
                    ))
                  : createCommentVNode("", true),
                z.value
                  ? (openBlock(),
                    createBlock(CompactDialog, {
                      key: 1,
                      class: "wake-bluff-prompt",
                      "z-index": 1700,
                      title: "提示",
                      message: "您未设置伪装角色，请手动选择。",
                      "confirm-text": "手动选择",
                      onConfirm: re,
                      onClose: re,
                    }))
                  : createCommentVNode("", true),
              ],
              64,
            )
          );
        }
      );
    },
  },
  [["__scopeId", "data-v-0440ecb8"]],
);
export { WakeInstructions };
