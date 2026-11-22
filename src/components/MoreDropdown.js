// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  Fragment,
  UniButton,
  UniScrollView,
  UniSlider,
  UniText,
  UniView,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createElementVNode,
  createTextVNode,
  createVNode,
  normalizeClass,
  onBeforeUnmount,
  onMounted,
  openBlock,
  toDisplayString,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const MoreDropdown = withComponentMetadata(
  {
    __name: "MoreDropdown",
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      seatCount: {
        type: Number,
        default: 12,
      },
      zoom: {
        type: Number,
        default: 1,
      },
      showNew: {
        type: Boolean,
        default: true,
      },
    },
    emits: ["close", "action", "zoom"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit;
      function l(e) {
        a("close");
        a("action", e);
      }
      function n(e) {
        const t = Number(e.detail.value);
        Number.isFinite(t) && a("zoom", t / 100);
      }
      function y(e) {
        i.open && "Escape" === e.key && a("close");
      }
      return (
        onMounted(() => {
          window.addEventListener("keydown", y);
        }),
        onBeforeUnmount(() => {
          window.removeEventListener("keydown", y);
        }),
        (renderContext, renderCache) => {
          const View = UniView,
            Text = UniText,
            Button = UniButton,
            Slider = UniSlider,
            ScrollView = UniScrollView;
          return (
            openBlock(),
            createElementBlock(
              Fragment,
              null,
              [
                props.open
                  ? (openBlock(),
                    createBlock(View, {
                      key: 0,
                      class: "more-dismiss",
                      "aria-hidden": "true",
                      onClick:
                        renderCache[0] || (renderCache[0] = withModifiers((e) => a("close"), ["stop"])),
                    }))
                  : createCommentVNode("", true),
                props.open
                  ? (openBlock(),
                    createBlock(
                      View,
                      {
                        key: 1,
                        class: "more-dropdown",
                        role: "menu",
                        "aria-label": "更多工具",
                        onClick: renderCache[9] || (renderCache[9] = withModifiers(() => {}, ["stop"])),
                        onTouchmove:
                          renderCache[10] || (renderCache[10] = withModifiers(() => {}, ["stop"])),
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            ScrollView,
                            {
                              class: "more-menu-scroll",
                              "scroll-y": "",
                              "show-scrollbar": true,
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  View,
                                  {
                                    class: "more-menu-content",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        Button,
                                        {
                                          class: "more-menu-item",
                                          role: "menuitem",
                                          "data-action": "history",
                                          onClick:
                                            renderCache[1] || (renderCache[1] = (e) => l("history")),
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Text,
                                              {
                                                class: "more-menu-icon",
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("▥")]),
                                                _: 1,
                                              },
                                            ),
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("历史投票")]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        Button,
                                        {
                                          class: "more-menu-item",
                                          role: "menuitem",
                                          "data-action": "layout",
                                          onClick:
                                            renderCache[2] || (renderCache[2] = (e) => l("layout")),
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Text,
                                              {
                                                class: "more-menu-icon",
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("✥")]),
                                                _: 1,
                                              },
                                            ),
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("自定义布局")]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        Button,
                                        {
                                          class: normalizeClass([
                                            "more-menu-item",
                                            {
                                              "is-disabled": props.seatCount >= 20,
                                            },
                                          ]),
                                          role: "menuitem",
                                          "data-action": "add",
                                          disabled: props.seatCount >= 20,
                                          onClick: renderCache[3] || (renderCache[3] = (e) => l("add")),
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Text,
                                              {
                                                class: "more-menu-icon",
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("＋")]),
                                                _: 1,
                                              },
                                            ),
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("添加座位")]),
                                              _: 1,
                                            }),
                                            createVNode(
                                              Text,
                                              {
                                                class: "more-menu-value",
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createTextVNode(
                                                    toDisplayString(props.seatCount) + " / 20",
                                                    1,
                                                  ),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                        8,
                                        ["class", "disabled"],
                                      ),
                                      createVNode(
                                        Button,
                                        {
                                          class: normalizeClass([
                                            "more-menu-item",
                                            {
                                              "is-disabled": props.seatCount <= 1,
                                            },
                                          ]),
                                          role: "menuitem",
                                          "data-action": "delete",
                                          disabled: props.seatCount <= 1,
                                          onClick:
                                            renderCache[4] || (renderCache[4] = (e) => l("delete")),
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Text,
                                              {
                                                class: "more-menu-icon",
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("−")]),
                                                _: 1,
                                              },
                                            ),
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("删除座位")]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 1,
                                        },
                                        8,
                                        ["class", "disabled"],
                                      ),
                                      createElementVNode(
                                        "a",
                                        {
                                          class: "more-menu-item more-online-link",
                                          role: "menuitem",
                                          "data-action": "online",
                                          href: "https://avalon2.top/",
                                          target: "_blank",
                                          rel: "noopener noreferrer",
                                          onClick:
                                            renderCache[5] || (renderCache[5] = (e) => a("close")),
                                        },
                                        [
                                          createVNode(
                                            Text,
                                            {
                                              class: "more-menu-icon",
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("↗")]),
                                              _: 1,
                                            },
                                          ),
                                          createVNode(Text, null, {
                                            default: withCtx(() => [createTextVNode("线上版")]),
                                            _: 1,
                                          }),
                                        ],
                                      ),
                                      createVNode(View, {
                                        class: "more-menu-divider",
                                      }),
                                      createVNode(
                                        View,
                                        {
                                          class: "more-zoom",
                                          role: "group",
                                          "aria-label": "座位与标记尺寸",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              View,
                                              {
                                                class: "more-zoom-heading",
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createVNode(Text, null, {
                                                    default: withCtx(() => [
                                                      createTextVNode("座位与标记尺寸"),
                                                    ]),
                                                    _: 1,
                                                  }),
                                                  createVNode(
                                                    Text,
                                                    {
                                                      class: "more-zoom-value",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode(
                                                          toDisplayString(Math.round(100 * props.zoom)) +
                                                            "%",
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
                                              Slider,
                                              {
                                                class: "more-zoom-slider",
                                                value: Math.round(100 * props.zoom),
                                                min: 65,
                                                max: 160,
                                                step: 5,
                                                "block-size": 16,
                                                activeColor: "#d8bb80",
                                                backgroundColor: "#665144",
                                                "block-color": "#edcf96",
                                                onChange: n,
                                              },
                                              null,
                                              8,
                                              ["value"],
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(View, {
                                        class: "more-menu-divider",
                                      }),
                                      createVNode(
                                        Button,
                                        {
                                          class: "more-menu-item",
                                          role: "menuitem",
                                          "data-action": "background",
                                          onClick:
                                            renderCache[6] || (renderCache[6] = (e) => l("background")),
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Text,
                                              {
                                                class: "more-menu-icon",
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("▧")]),
                                                _: 1,
                                              },
                                            ),
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("设置背景")]),
                                              _: 1,
                                            }),
                                            createVNode(
                                              Text,
                                              {
                                                class: "more-menu-chevron",
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("›")]),
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
                                          class: "more-menu-item",
                                          role: "menuitem",
                                          "data-action": "feedback",
                                          onClick:
                                            renderCache[7] || (renderCache[7] = (e) => l("feedback")),
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Text,
                                              {
                                                class: "more-menu-icon",
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("✉")]),
                                                _: 1,
                                              },
                                            ),
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("问题反馈")]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      props.showNew
                                        ? (openBlock(),
                                          createBlock(
                                            Button,
                                            {
                                              key: 0,
                                              class: "more-menu-item",
                                              role: "menuitem",
                                              "data-action": "new",
                                              onClick:
                                                renderCache[8] || (renderCache[8] = (e) => l("new")),
                                            },
                                            {
                                              default: withCtx(() => [
                                                createVNode(
                                                  Text,
                                                  {
                                                    class: "more-menu-icon",
                                                  },
                                                  {
                                                    default: withCtx(() => [createTextVNode("↻")]),
                                                    _: 1,
                                                  },
                                                ),
                                                createVNode(Text, null, {
                                                  default: withCtx(() => [createTextVNode("新一局")]),
                                                  _: 1,
                                                }),
                                              ]),
                                              _: 1,
                                            },
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
                        ]),
                        _: 1,
                      },
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
  [["__scopeId", "data-v-ba891c04"]],
);
export { MoreDropdown };
