// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { RolePortrait } from "./RolePortrait.js";
import { Sheet } from "./Sheet.js";
import { useLongPress } from "../composables/useLongPress.js";
import {
  Fragment,
  UniButton,
  UniInput,
  UniScrollView,
  UniText,
  UniView,
  computed,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createSlots,
  createTextVNode,
  createVNode,
  normalizeClass,
  openBlock,
  ref,
  renderList,
  toDisplayString,
  unref,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const SeatRolePicker = withComponentMetadata(
  {
    __name: "SeatRolePicker",
    props: {
      scriptRoles: {
        type: Array,
        default: () => [],
      },
      extraTravelers: {
        type: Array,
        default: () => [],
      },
      currentRole: {
        type: Object,
        default: null,
      },
    },
    emits: ["select", "clear", "close"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit,
        l = [
          {
            key: "script",
            label: "剧本内角色",
          },
          {
            key: "traveler",
            label: "其他旅行者",
          },
        ],
        n = ref("script"),
        y = ref(""),
        k = ref(null),
        _ = useLongPress((e) => {
          k.value = e;
        }),
        R = computed(() =>
          ("script" === n.value ? i.scriptRoles : i.extraTravelers).filter((e) =>
            `${e.name} ${e.id}`.toLowerCase().includes(y.value.trim().toLowerCase()),
          ),
        );
      function M(e) {
        var t;
        return (null == (t = i.currentRole) ? void 0 : t.id) === e.id;
      }
      return (renderContext, renderCache) => {
        const Button = UniButton,
          View = UniView,
          Input = UniInput,
          Text = UniText,
          ScrollView = UniScrollView;
        return (
          openBlock(),
          createBlock(
            Sheet,
            {
              wide: "",
              appearance: "paper",
              onClose: renderCache[4] || (renderCache[4] = (e) => a("close")),
            },
            createSlots(
              {
                default: withCtx(() => [
                  createVNode(
                    View,
                    {
                      class: "seat-role-picker",
                    },
                    {
                      default: withCtx(() => [
                        createVNode(
                          View,
                          {
                            class: "seat-role-tabs",
                          },
                          {
                            default: withCtx(() => [
                              (openBlock(),
                              createElementBlock(
                                Fragment,
                                null,
                                renderList(l, (e) =>
                                  createVNode(
                                    Button,
                                    {
                                      key: e.key,
                                      class: normalizeClass([
                                        "seat-role-tab",
                                        {
                                          active: n.value === e.key,
                                        },
                                      ]),
                                      "data-tab": e.key,
                                      "aria-pressed": n.value === e.key,
                                      onClick: (t) => {
                                        return (
                                          (i = e.key),
                                          (n.value = i),
                                          (y.value = ""),
                                          (k.value = null),
                                          void _.cancel()
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
                                    ["class", "data-tab", "aria-pressed", "onClick"],
                                  ),
                                ),
                                64,
                              )),
                            ]),
                            _: 1,
                          },
                        ),
                        createVNode(
                          View,
                          {
                            class: "seat-role-search-row",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                Input,
                                {
                                  modelValue: y.value,
                                  "onUpdate:modelValue":
                                    renderCache[0] || (renderCache[0] = (e) => (y.value = e)),
                                  class: "seat-role-search",
                                  placeholder: "搜索角色名字",
                                  "placeholder-style": "color: #9b9183",
                                },
                                null,
                                8,
                                ["modelValue"],
                              ),
                              createVNode(
                                Text,
                                {
                                  class: "seat-role-hint",
                                },
                                {
                                  default: withCtx(() => [createTextVNode("轻点分配 · 长按看能力")]),
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
                            class: "seat-role-list",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                Button,
                                {
                                  class: "seat-role-clear",
                                  "aria-label": "清空座位角色",
                                  onClick: renderCache[1] || (renderCache[1] = (e) => a("clear")),
                                },
                                {
                                  default: withCtx(() => [
                                    createVNode(
                                      View,
                                      {
                                        class: "seat-role-clear-icon",
                                        "aria-hidden": "true",
                                      },
                                      {
                                        default: withCtx(() => [createTextVNode("↺")]),
                                        _: 1,
                                      },
                                    ),
                                    createVNode(
                                      Text,
                                      {
                                        class: "seat-role-name",
                                      },
                                      {
                                        default: withCtx(() => [createTextVNode("清空")]),
                                        _: 1,
                                      },
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ),
                              (openBlock(true),
                              createElementBlock(
                                Fragment,
                                null,
                                renderList(
                                  R.value,
                                  (e) => (
                                    openBlock(),
                                    createBlock(
                                      Button,
                                      {
                                        key: e.id,
                                        class: normalizeClass([
                                          "role-pick",
                                          {
                                            selected: M(e),
                                          },
                                        ]),
                                        "data-role-id": e.id,
                                        "aria-label": `${e.name}${M(e) ? "，当前角色" : ""}`,
                                        "aria-pressed": M(e),
                                        onClick: (t) =>
                                          (function (e) {
                                            _.allowTap() && a("select", e);
                                          })(e),
                                        onLongpress: (t) => unref(_).inspect(e),
                                        onTouchstart: (t) => unref(_).touchStart(e, t),
                                        onTouchmove: unref(_).move,
                                        onTouchend: unref(_).touchEnd,
                                        onTouchcancel: unref(_).cancel,
                                        onMousedown: (t) => unref(_).mouseStart(e, t),
                                        onMousemove: unref(_).move,
                                        onMouseup: unref(_).end,
                                        onMouseleave: unref(_).cancel,
                                        onContextmenu:
                                          renderCache[2] ||
                                          (renderCache[2] = withModifiers(() => {}, ["prevent"])),
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(
                                            RolePortrait,
                                            {
                                              role: e,
                                              size: 76,
                                            },
                                            null,
                                            8,
                                            ["role"],
                                          ),
                                          createVNode(
                                            Text,
                                            {
                                              class: "seat-role-name",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(e.name), 1),
                                              ]),
                                              _: 2,
                                            },
                                            1024,
                                          ),
                                          M(e)
                                            ? (openBlock(),
                                              createBlock(
                                                Text,
                                                {
                                                  key: 0,
                                                  class: "seat-role-check",
                                                  "aria-hidden": "true",
                                                },
                                                {
                                                  default: withCtx(() => [createTextVNode("✓")]),
                                                  _: 1,
                                                },
                                              ))
                                            : createCommentVNode("", true),
                                        ]),
                                        _: 2,
                                      },
                                      1032,
                                      [
                                        "class",
                                        "data-role-id",
                                        "aria-label",
                                        "aria-pressed",
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
                        R.value.length
                          ? createCommentVNode("", true)
                          : (openBlock(),
                            createBlock(
                              Text,
                              {
                                key: 0,
                                class: "seat-role-empty",
                              },
                              {
                                default: withCtx(() => [createTextVNode("没有匹配的角色")]),
                                _: 1,
                              },
                            )),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 2,
              },
              [
                k.value
                  ? {
                      name: "footer",
                      fn: withCtx(() => [
                        createVNode(
                          View,
                          {
                            class: "seat-role-info",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                ScrollView,
                                {
                                  class: "seat-role-info-scroll",
                                  "scroll-y": "",
                                },
                                {
                                  default: withCtx(() => [
                                    createVNode(
                                      Text,
                                      {
                                        class: "seat-role-info-name",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(k.value.name), 1),
                                        ]),
                                        _: 1,
                                      },
                                    ),
                                    createVNode(
                                      Text,
                                      {
                                        class: "seat-role-info-ability",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode(
                                            toDisplayString(k.value.ability || "暂无角色介绍"),
                                            1,
                                          ),
                                        ]),
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
                                  class: "seat-role-info-close",
                                  "aria-label": "关闭能力说明",
                                  onClick: renderCache[3] || (renderCache[3] = (e) => (k.value = null)),
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
                      ]),
                      key: "0",
                    }
                  : void 0,
              ],
            ),
            1024,
          )
        );
      };
    },
  },
  [["__scopeId", "data-v-75f10dd6"]],
);
export { SeatRolePicker };
