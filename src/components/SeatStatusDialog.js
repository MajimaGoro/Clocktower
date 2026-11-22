// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  Fragment,
  UniButton,
  UniImage,
  UniText,
  UniView,
  computed,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createTextVNode,
  createVNode,
  normalizeClass,
  openBlock,
  renderList,
  toDisplayString,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const SeatStatusDialog = withComponentMetadata(
  {
    __name: "SeatStatusDialog",
    props: {
      seat: {
        type: Object,
        required: true,
      },
      pending: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["select", "close"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit,
        l = computed(() => [
          {
            key: "deadghost",
            label: "死亡带票",
            description: "保留一次死亡投票",
            image: "/static/reference/status-deadghost.webp",
            active: !i.seat.alive && i.seat.ghostVote,
          },
          {
            key: "deadspent",
            label: "死透了",
            description: "死亡投票已使用",
            image: "/static/reference/status-deadspent.webp",
            active: !i.seat.alive && !i.seat.ghostVote,
          },
          {
            key: i.pending ? "clearPending" : "pending",
            label: i.pending ? "取消待处决" : "待处决",
            description: i.pending ? "移除待处决标记" : "标记当前处决候选",
            image: "/static/reference/status-pending.webp",
            active: i.pending,
          },
          {
            key: "clearStatus",
            label: "取消所有状态",
            description: "恢复存活，移除待处决标记",
            image: "",
            active: false,
          },
        ]);
      return (renderContext, renderCache) => {
        const Button = UniButton,
          Image = UniImage,
          Text = UniText,
          View = UniView;
        return (
          openBlock(),
          createBlock(
            View,
            {
              class: "seat-status-backdrop",
              onClick: renderCache[2] || (renderCache[2] = (e) => a("close")),
            },
            {
              default: withCtx(() => [
                createVNode(
                  View,
                  {
                    class: "seat-status-panel sheet-panel",
                    role: "dialog",
                    "aria-label": "设置状态",
                    onClick: renderCache[1] || (renderCache[1] = withModifiers(() => {}, ["stop"])),
                  },
                  {
                    default: withCtx(() => [
                      createVNode(
                        Button,
                        {
                          class: "sheet-close",
                          "aria-label": "关闭",
                          onClick: renderCache[0] || (renderCache[0] = (e) => a("close")),
                        },
                        {
                          default: withCtx(() => [createTextVNode("×")]),
                          _: 1,
                        },
                      ),
                      createVNode(
                        View,
                        {
                          class: "seat-status-options",
                        },
                        {
                          default: withCtx(() => [
                            (openBlock(true),
                            createElementBlock(
                              Fragment,
                              null,
                              renderList(
                                l.value,
                                (e) => (
                                  openBlock(),
                                  createBlock(
                                    Button,
                                    {
                                      key: e.key,
                                      class: normalizeClass([
                                        "status-option",
                                        {
                                          selected: e.active,
                                          "status-clear": "clearStatus" === e.key,
                                        },
                                      ]),
                                      "data-status": e.key,
                                      "aria-pressed": e.active,
                                      onClick: (t) => a("select", e.key),
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(
                                          View,
                                          {
                                            class: normalizeClass([
                                              "seat-status-symbol",
                                              {
                                                "seat-status-symbol-pending":
                                                  "pending" === e.key || "clearPending" === e.key,
                                              },
                                            ]),
                                          },
                                          {
                                            default: withCtx(() => [
                                              e.image
                                                ? (openBlock(),
                                                  createBlock(
                                                    Image,
                                                    {
                                                      key: 0,
                                                      webp: true,
                                                      class: "seat-status-icon",
                                                      src: e.image,
                                                      mode: "aspectFit",
                                                      "aria-hidden": "true",
                                                    },
                                                    null,
                                                    8,
                                                    ["src"],
                                                  ))
                                                : (openBlock(),
                                                  createBlock(
                                                    Text,
                                                    {
                                                      key: 1,
                                                      class: "seat-status-reset",
                                                      "aria-hidden": "true",
                                                    },
                                                    {
                                                      default: withCtx(() => [createTextVNode("↺")]),
                                                      _: 1,
                                                    },
                                                  )),
                                            ]),
                                            _: 2,
                                          },
                                          1032,
                                          ["class"],
                                        ),
                                        createVNode(
                                          View,
                                          {
                                            class: "seat-status-copy",
                                          },
                                          {
                                            default: withCtx(() => [
                                              createVNode(
                                                Text,
                                                {
                                                  class: "seat-status-label",
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
                                                  class: "seat-status-description",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createTextVNode(toDisplayString(e.description), 1),
                                                  ]),
                                                  _: 2,
                                                },
                                                1024,
                                              ),
                                            ]),
                                            _: 2,
                                          },
                                          1024,
                                        ),
                                        e.active
                                          ? (openBlock(),
                                            createBlock(
                                              Text,
                                              {
                                                key: 0,
                                                class: "seat-status-check",
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
                                    ["class", "data-status", "aria-pressed", "onClick"],
                                  )
                                ),
                              ),
                              128,
                            )),
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
      };
    },
  },
  [["__scopeId", "data-v-9042351d"]],
);
export { SeatStatusDialog };
