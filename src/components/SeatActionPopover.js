// 从睡典钟楼公开前端重构；角色与素材归属保留。
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
  createTextVNode,
  createVNode,
  normalizeClass,
  normalizeStyle,
  onBeforeUnmount,
  onMounted,
  openBlock,
  renderList,
  toDisplayString,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const SeatActionPopover = withComponentMetadata(
  {
    __name: "SeatActionPopover",
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      anchor: {
        type: Object,
        default: null,
      },
      viewport: {
        type: Object,
        default: () => ({
          width: 390,
          height: 844,
          top: 0,
          bottom: 0,
        }),
      },
      seatNumber: {
        type: Number,
        default: 1,
      },
      roleName: {
        type: String,
        default: "",
      },
    },
    emits: ["close", "action"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit,
        l = [
          {
            key: "assign",
            icon: "♧",
            label: "分配角色",
          },
          {
            key: "status",
            icon: "☠︎",
            label: "设置状态",
          },
          {
            key: "ability",
            icon: "✧",
            label: "显示能力",
          },
          {
            key: "move",
            icon: "✥",
            label: "移动",
          },
          {
            key: "swap",
            icon: "⇄",
            label: "换座",
          },
        ],
        n = (e, t, i) => Math.max(t, Math.min(i, e)),
        y = computed(() => {
          const e = Number(i.viewport.width) || 390,
            t = Number(i.viewport.height) || 844,
            a = 10,
            r = (Number(i.viewport.top) || 0) + 8,
            o = t - (Number(i.viewport.bottom) || 0) - 8;
          let s = Math.max(1, Math.min(164, e - 16)),
            d = Math.max(1, Math.min(35 * l.length + 16, o - r));
          const u = i.anchor,
            m = Number.isFinite(null == u ? void 0 : u.left) ? u.left : e / 2,
            c = Number.isFinite(null == u ? void 0 : u.right)
              ? u.right
              : m + (Number(null == u ? void 0 : u.width) || 0),
            h = Number.isFinite(null == u ? void 0 : u.top)
              ? u.top + (Number(u.height) || 0) / 2
              : t / 2,
            g = (m + c) / 2,
            f = Number.isFinite(null == u ? void 0 : u.top) ? u.top : h,
            p = Number.isFinite(null == u ? void 0 : u.bottom)
              ? u.bottom
              : f + (Number(null == u ? void 0 : u.height) || 0),
            b = e - 8 - c - a,
            v = m - a - 8,
            y = b >= s,
            N = v >= s;
          let w = g > e / 2 ? "left" : "right";
          if ("left" === w && !N && y) w = "right";
          else if ("right" === w && !y && N) w = "left";
          else if (!N && !y)
            if (Math.max(v, b) >= 126) {
              w = v > b ? "left" : "right";
              s = Math.min(s, Math.max(v, b));
            } else {
              const e = f - a - r,
                t = o - p - a;
              w = t >= d ? "bottom" : e >= d ? "top" : t >= e ? "bottom" : "top";
              d = Math.min(d, Math.max(48, "bottom" === w ? t : e));
            }
          const k = "left" === w || "right" === w,
            _ = n(k ? ("right" === w ? c + a : m - a - s) : g - s / 2, 8, e - 8 - s),
            R = n(k ? h - d / 2 : "bottom" === w ? p + a : f - a - d, r, Math.max(r, o - d));
          return {
            side: w,
            x: _,
            centreY: R + d / 2,
            width: s,
            height: d,
            arrowY: n(h - R, 14, Math.max(14, d - 14)),
            arrowX: n(g - _, 14, Math.max(14, s - 14)),
          };
        }),
        w = computed(() => ({
          left: `${y.value.x}px`,
          top: `${y.value.centreY}px`,
          width: `${y.value.width}px`,
          height: `${y.value.height}px`,
          "--seat-action-arrow-y": `${y.value.arrowY}px`,
          "--seat-action-arrow-x": `${y.value.arrowX}px`,
        }));
      function k(e) {
        i.open && "Escape" === e.key && a("close");
      }
      return (
        onMounted(() => {
          window.addEventListener("keydown", k);
        }),
        onBeforeUnmount(() => {
          window.removeEventListener("keydown", k);
        }),
        (renderContext, renderCache) => {
          const View = UniView,
            Text = UniText,
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
                    createBlock(View, {
                      key: 0,
                      class: "seat-popover-dismiss",
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
                        class: normalizeClass([
                          "seat-action-popover",
                          `seat-action-popover-${y.value.side}`,
                        ]),
                        style: normalizeStyle(w.value),
                        role: "menu",
                        "aria-label": `${props.seatNumber}号 ${props.roleName || "未分配角色"}座位操作`,
                        onClick: renderCache[1] || (renderCache[1] = withModifiers(() => {}, ["stop"])),
                        onTouchmove:
                          renderCache[2] || (renderCache[2] = withModifiers(() => {}, ["stop"])),
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            ScrollView,
                            {
                              class: "seat-action-scroll",
                              "scroll-y": "",
                              "show-scrollbar": true,
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  View,
                                  {
                                    class: "seat-action-list",
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
                                              class: "seat-action",
                                              "data-action": e.key,
                                              role: "menuitem",
                                              onClick: (t) => {
                                                return ((i = e.key), a("close"), void a("action", i));
                                                var i;
                                              },
                                            },
                                            {
                                              default: withCtx(() => [
                                                createVNode(
                                                  Text,
                                                  {
                                                    class: "seat-action-icon",
                                                    "aria-hidden": "true",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(e.icon), 1),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1024,
                                                ),
                                                createVNode(
                                                  Text,
                                                  {
                                                    class: "seat-action-label",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(e.label), 1),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1024,
                                                ),
                                              ]),
                                              _: 2,
                                            },
                                            1032,
                                            ["data-action", "onClick"],
                                          ),
                                        ),
                                        64,
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
                      8,
                      ["class", "style", "aria-label"],
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
  [["__scopeId", "data-v-fb44a2af"]],
);
export { SeatActionPopover };
