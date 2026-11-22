// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { isAllowedImageSource } from "../domain/roleNormalization.js";
import {
  Fragment,
  UniImage,
  UniText,
  UniView,
  computed,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createTextVNode,
  normalizeClass,
  normalizeStyle,
  openBlock,
  ref,
  renderList,
  toDisplayString,
  watch,
  withCtx,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const RolePortrait = withComponentMetadata(
  {
    __name: "RolePortrait",
    props: {
      role: {
        type: Object,
        default: null,
      },
      size: {
        type: Number,
        default: 56,
      },
      named: {
        type: Boolean,
        default: false,
      },
      concealed: {
        type: Boolean,
        default: false,
      },
      covered: {
        type: Boolean,
        default: false,
      },
      selectionAction: {
        type: String,
        default: "",
      },
      dead: {
        type: Boolean,
        default: false,
      },
      ghostVote: {
        type: Boolean,
        default: true,
      },
      pending: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const t = props,
        i = computed(
          () =>
            ({
              move: "/static/reference/seat-pick-move.png",
              swap: "/static/reference/seat-pick-swap.png",
              delete: "/static/reference/seat-pick-delete.png",
              vote: "/static/reference/seat-pick-vote.png",
              nominator: "/static/reference/seat-pick-nominator.png",
              nominee: "/static/reference/seat-pick-nominee.png",
            })[t.selectionAction] || "",
        ),
        a = ref(false),
        l = computed(() => (Number.isFinite(t.size) && t.size > 0 ? t.size : 56)),
        n = computed(() => {
          var e;
          return a.value || !isAllowedImageSource(null == (e = t.role) ? void 0 : e.image)
            ? "/static/ui/default-role.webp"
            : t.role.image;
        }),
        d = computed(() => ({
          width: `${l.value}px`,
          height: `${l.value}px`,
          "--portrait-size": `${l.value}px`,
        })),
        m = computed(() => {
          var e, i;
          return (
            (null == (i = null == (e = t.role) ? void 0 : e.name) ? void 0 : i.replace(/\s+/g, "")) ||
            "待分配"
          );
        }),
        b = computed(() => {
          const e = Array.from(m.value).length,
            t = e <= 5 ? 15 : Math.max(9, 15 - 1.8 * (e - 5));
          return Math.max(10, (t * l.value) / 100);
        }),
        v = computed(() => {
          var e;
          return {
            color: ["minion", "demon"].includes(null == (e = t.role) ? void 0 : e.team)
              ? "#c62828"
              : "#111827",
            fontSize: `${b.value}px`,
          };
        }),
        y = computed(() => {
          if (!t.role) return [];
          const e = Array.from(m.value);
          if (e.length > 8 || (e.length > 5 && l.value < 66)) return [];
          const i = e.length <= 2 ? 31 : e.length <= 5 ? 33 : 34,
            a = 24 - 1.4 * Math.min(e.length - 6, 3),
            n =
              e.length <= 5
                ? {
                    1: 0,
                    2: 42,
                    3: 64,
                    4: 86,
                    5: 108,
                  }[e.length]
                : Math.min(136, Math.max(28, (e.length - 1) * a)),
            r = 90 + n / 2,
            o = 1 === e.length ? 0 : n / (e.length - 1),
            s = e.map((e, t) => {
              const a = r - o * t,
                l = (a * Math.PI) / 180,
                n = 50 + i * Math.cos(l),
                s = 55 + i * Math.sin(l);
              return {
                key: `${e}-${t}`,
                value: e,
                x: n,
                y: s,
                style: {
                  left: `${n}%`,
                  top: `${s}%`,
                  transform: `translate(-50%, -50%) rotate(${a - 90}deg)`,
                },
              };
            }),
            d = 0.85 * b.value;
          for (let t = 1; t < s.length; t++) {
            const e = s[t - 1],
              i = s[t];
            if ((Math.hypot(i.x - e.x, i.y - e.y) * l.value) / 100 < d) return [];
          }
          return s;
        });
      return (
        watch(
          () => {
            var e;
            return null == (e = t.role) ? void 0 : e.image;
          },
          () => {
            a.value = false;
          },
        ),
        (renderContext, renderCache) => {
          const View = UniView,
            Image = UniImage,
            Text = UniText;
          return (
            openBlock(),
            createBlock(
              View,
              {
                class: normalizeClass([
                  "role-portrait",
                  {
                    "role-portrait-empty": !props.role,
                    "role-portrait-named": props.named,
                    "role-portrait-selecting": i.value,
                    "role-portrait-dead": props.dead,
                    "role-portrait-status": (props.dead || props.pending) && !i.value,
                  },
                ]),
                style: normalizeStyle(d.value),
                "aria-label": props.covered
                  ? "未翻牌"
                  : props.concealed
                    ? props.dead
                      ? "死亡"
                      : "存活"
                    : props.role
                      ? props.role.name
                      : "未分配角色",
              },
              {
                default: withCtx(() => [
                  props.covered
                    ? (openBlock(),
                      createBlock(View, {
                        key: 0,
                        class: "seat-grimoire-back",
                        "aria-hidden": "true",
                      }))
                    : (openBlock(),
                      createBlock(
                        View,
                        {
                          key: 1,
                          class: "role-portrait-paper",
                        },
                        {
                          default: withCtx(() => [
                            props.role
                              ? (openBlock(),
                                createBlock(
                                  Image,
                                  {
                                    key: 0,
                                    webp: true,
                                    class: "role-portrait-image",
                                    src: n.value,
                                    mode: "aspectFill",
                                    onError:
                                      renderCache[0] || (renderCache[0] = (e) => (a.value = true)),
                                  },
                                  null,
                                  8,
                                  ["src"],
                                ))
                              : createCommentVNode("", true),
                            props.dead && !i.value
                              ? (openBlock(),
                                createBlock(
                                  Image,
                                  {
                                    key: 1,
                                    webp: true,
                                    class: "seat-state-icon seat-state-shroud",
                                    src: `/static/reference/status-${props.ghostVote ? "deadghost" : "deadspent"}.webp`,
                                    "data-status": props.ghostVote ? "deadghost" : "deadspent",
                                    "aria-label": props.ghostVote ? "死亡带票" : "死透了，无票",
                                    mode: "aspectFit",
                                  },
                                  null,
                                  8,
                                  ["src", "data-status", "aria-label"],
                                ))
                              : createCommentVNode("", true),
                            props.pending && !i.value
                              ? (openBlock(),
                                createBlock(Image, {
                                  key: 2,
                                  webp: true,
                                  class: "seat-state-icon seat-state-pending",
                                  src: "/minibotc/static/reference/status-pending.webp",
                                  "data-status": "pending",
                                  "aria-label": "待处决",
                                  mode: "aspectFit",
                                }))
                              : createCommentVNode("", true),
                            props.concealed || props.role || i.value || props.dead || props.pending
                              ? createCommentVNode("", true)
                              : (openBlock(),
                                createBlock(
                                  Text,
                                  {
                                    key: 3,
                                    class: "role-portrait-question",
                                  },
                                  {
                                    default: withCtx(() => [createTextVNode("?")]),
                                    _: 1,
                                  },
                                )),
                            i.value
                              ? (openBlock(),
                                createBlock(
                                  Image,
                                  {
                                    key: 4,
                                    webp: true,
                                    class: "seat-pick-hint",
                                    src: i.value,
                                    "data-kind": props.selectionAction,
                                    mode: "aspectFit",
                                    "aria-hidden": "true",
                                  },
                                  null,
                                  8,
                                  ["src", "data-kind"],
                                ))
                              : createCommentVNode("", true),
                            props.named
                              ? (openBlock(),
                                createBlock(
                                  View,
                                  {
                                    key: 5,
                                    class: "role-portrait-name",
                                    style: normalizeStyle(v.value),
                                  },
                                  {
                                    default: withCtx(() => [
                                      (openBlock(true),
                                      createElementBlock(
                                        Fragment,
                                        null,
                                        renderList(
                                          y.value,
                                          (e) => (
                                            openBlock(),
                                            createBlock(
                                              Text,
                                              {
                                                key: e.key,
                                                class: "role-portrait-arc-char",
                                                style: normalizeStyle(e.style),
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createTextVNode(toDisplayString(e.value), 1),
                                                ]),
                                                _: 2,
                                              },
                                              1032,
                                              ["style"],
                                            )
                                          ),
                                        ),
                                        128,
                                      )),
                                      y.value.length
                                        ? createCommentVNode("", true)
                                        : (openBlock(),
                                          createBlock(
                                            Text,
                                            {
                                              key: 0,
                                              class: "role-portrait-name-fallback",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(m.value), 1),
                                              ]),
                                              _: 1,
                                            },
                                          )),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ["style"],
                                ))
                              : createCommentVNode("", true),
                          ]),
                          _: 1,
                        },
                      )),
                ]),
                _: 1,
              },
              8,
              ["class", "style", "aria-label"],
            )
          );
        }
      );
    },
  },
  [["__scopeId", "data-v-7c8c2d59"]],
);
export { RolePortrait };
