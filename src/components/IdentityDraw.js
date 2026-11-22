// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { RolePortrait } from "./RolePortrait.js";
import { TEAM_LABELS } from "../data/teams.js";
import {
  beginIdentityReveal,
  cloneIdentityData,
  completeIdentityReveal,
  createIdentityDraw,
  failIdentityDrawRule,
  pickIdentityCard,
} from "../domain/identityDraw.js";
import {
  Fragment,
  UniButton,
  UniImage,
  UniScrollView,
  UniSwitch,
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
  ref,
  renderList,
  showToast,
  toDisplayString,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
import { onHide } from "../runtime/lifecycle.js";
const IdentityDraw = withComponentMetadata(
  {
    __name: "IdentityDraw",
    props: {
      seats: {
        type: Array,
        required: true,
      },
      viewport: {
        type: Object,
        default: () => ({}),
      },
    },
    emits: ["close", "complete"],
    setup(props, { expose: expose, emit: emit }) {
      const a = props,
        l = emit,
        n = computed(() => ({})),
        y = ref("random"),
        k = ref("forward"),
        $ = ref(false),
        T = ref(null),
        E = ref(""),
        A = ref(false),
        S = [
          {
            key: "forward",
            label: "顺序",
          },
          {
            key: "reverse",
            label: "逆序",
          },
          {
            key: "random",
            label: "随机",
          },
        ],
        z = computed(() => {
          var e;
          return null == (e = T.value) ? void 0 : e.players[T.value.cursor];
        }),
        V = computed(() => {
          var e;
          return (null == (e = T.value) ? void 0 : e.cards.filter((e) => !e.pickedSeatId)) || [];
        }),
        L = computed(() => {
          var e, t;
          return (
            {
              townsfolk: "/static/roles/townsfolks.webp",
              outsider: "/static/roles/outsiders.webp",
              minion: "/static/roles/minions.webp",
              demon: "/static/roles/demons.webp",
              traveler: "/static/roles/travelers.webp",
            }[j(null == (t = null == (e = T.value) ? void 0 : e.revealRole) ? void 0 : t.team)] ||
            "/static/ui/default-role.webp"
          );
        });
      function j(e) {
        return (
          {
            镇民: "townsfolk",
            外来者: "outsider",
            爪牙: "minion",
            恶魔: "demon",
            旅行者: "traveler",
            traveller: "traveler",
          }[e] || e
        );
      }
      function O(e) {
        return TEAM_LABELS[j(e)] || e;
      }
      function D(e) {
        try {
          T.value = e(T.value);
          E.value = "";
        } catch (t) {
          E.value = t.message;
          showToast({
            title: t.message,
            icon: "none",
          });
        }
      }
      function F() {
        try {
          T.value = createIdentityDraw(a.seats, {
            mode: y.value,
            order: k.value,
            onlyTeam: $.value,
          });
          E.value = "";
        } catch (e) {
          E.value = e.message;
        }
      }
      function B() {
        D(beginIdentityReveal);
      }
      function selectIdentityCard(cardId) {
        D((drawState) => pickIdentityCard(drawState, cardId));
      }
      function q() {
        D(completeIdentityReveal);
      }
      function U() {
        K();
        A.value = true;
      }
      function H() {
        var e;
        l(
          "complete",
          (("complete" === (e = T.value).phase && e.assignments.length === e.players.length) ||
            failIdentityDrawRule("请先完成所有座位的身份领取"),
          cloneIdentityData(e.assignments)),
        );
      }
      function K() {
        T.value &&
          (T.value = (function (e) {
            if (!e || "complete" === e.phase) return e ? cloneIdentityData(e) : e;
            const t = cloneIdentityData(e);
            return ((t.phase = "handoff"), (t.revealRole = null), t);
          })(T.value));
        A.value = false;
      }
      function Y() {
        document.hidden && K();
      }
      return (
        onHide(K),
        onMounted(() => document.addEventListener("visibilitychange", Y)),
        onBeforeUnmount(() => document.removeEventListener("visibilitychange", Y)),
        expose({
          conceal: K,
        }),
        (renderContext, renderCache) => {
          const Text = UniText,
            View = UniView,
            Button = UniButton,
            Switch = UniSwitch,
            ScrollView = UniScrollView,
            Image = UniImage;
          return T.value
            ? (openBlock(),
              createBlock(
                View,
                {
                  key: 1,
                  class: "identity-draw-screen",
                  style: normalizeStyle(n.value),
                  role: "dialog",
                  "aria-label": "线下身份领取",
                },
                {
                  default: withCtx(() => [
                    createVNode(
                      View,
                      {
                        class: "identity-draw-header",
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            Text,
                            {
                              class: "identity-draw-title",
                            },
                            {
                              default: withCtx(() => [createTextVNode("身份领取")]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            Text,
                            {
                              class: "identity-progress",
                            },
                            {
                              default: withCtx(() => [
                                createTextVNode(
                                  toDisplayString(T.value.cursor) +
                                    " / " +
                                    toDisplayString(T.value.players.length),
                                  1,
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                          createVNode(
                            Button,
                            {
                              class: "identity-exit",
                              onClick: U,
                            },
                            {
                              default: withCtx(() => [createTextVNode("退出")]),
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
                        class: "identity-progress-track",
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            View,
                            {
                              class: "identity-progress-fill",
                              style: normalizeStyle({
                                width: (T.value.cursor / T.value.players.length) * 100 + "%",
                              }),
                            },
                            null,
                            8,
                            ["style"],
                          ),
                        ]),
                        _: 1,
                      },
                    ),
                    createVNode(
                      ScrollView,
                      {
                        class: "identity-draw-body",
                        "scroll-y": "",
                      },
                      {
                        default: withCtx(() => [
                          "handoff" === T.value.phase
                            ? (openBlock(),
                              createBlock(
                                View,
                                {
                                  key: 0,
                                  class: "identity-handoff",
                                },
                                {
                                  default: withCtx(() => [
                                    createVNode(
                                      Text,
                                      {
                                        class: "identity-overline",
                                      },
                                      {
                                        default: withCtx(() => [createTextVNode("请将设备交给")]),
                                        _: 1,
                                      },
                                    ),
                                    createVNode(
                                      Text,
                                      {
                                        class: "identity-seat-number",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(z.value.number), 1),
                                          createVNode(
                                            Text,
                                            {
                                              class: "identity-seat-unit",
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("号")]),
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
                                        class: "identity-draw-hint",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode("接过设备后，确认自己的座位再继续"),
                                        ]),
                                        _: 1,
                                      },
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ))
                            : "pick" === T.value.phase
                              ? (openBlock(),
                                createBlock(
                                  View,
                                  {
                                    key: 1,
                                    class: "identity-pick",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        Text,
                                        {
                                          class: "identity-pick-title",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createTextVNode(
                                              toDisplayString(z.value.number) + " 号，请选择一张暗牌",
                                              1,
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        View,
                                        {
                                          class: "identity-card-grid",
                                        },
                                        {
                                          default: withCtx(() => [
                                            (openBlock(true),
                                            createElementBlock(
                                              Fragment,
                                              null,
                                              renderList(
                                                V.value,
                                                (e) => (
                                                  openBlock(),
                                                  createBlock(
                                                    Button,
                                                    {
                                                      key: e.id,
                                                      class: "identity-card",
                                                      "data-card-id": e.id,
                                                      "aria-label": "领取这张身份牌",
                                                      onClick: (t) => selectIdentityCard(e.id),
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createVNode(
                                                          Text,
                                                          {
                                                            class: "identity-card-symbol",
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createTextVNode("☾"),
                                                            ]),
                                                            _: 1,
                                                          },
                                                        ),
                                                        createVNode(Text, null, {
                                                          default: withCtx(() => [
                                                            createTextVNode("睡典钟楼"),
                                                          ]),
                                                          _: 1,
                                                        }),
                                                      ]),
                                                      _: 2,
                                                    },
                                                    1032,
                                                    ["data-card-id", "onClick"],
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
                                ))
                              : "reveal" === T.value.phase
                                ? (openBlock(),
                                  createBlock(
                                    View,
                                    {
                                      key: 2,
                                      class: "identity-reveal",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(
                                          Text,
                                          {
                                            class: "identity-overline",
                                          },
                                          {
                                            default: withCtx(() => [
                                              createTextVNode(
                                                toDisplayString(z.value.number) +
                                                  " 号，你的" +
                                                  toDisplayString(T.value.onlyTeam ? "阵营" : "身份") +
                                                  "是",
                                                1,
                                              ),
                                            ]),
                                            _: 1,
                                          },
                                        ),
                                        T.value.onlyTeam
                                          ? (openBlock(),
                                            createElementBlock(
                                              Fragment,
                                              {
                                                key: 0,
                                              },
                                              [
                                                createVNode(
                                                  Image,
                                                  {
                                                    webp: true,
                                                    class: "identity-team-image",
                                                    src: L.value,
                                                    "aria-label": O(T.value.revealRole.team),
                                                    mode: "aspectFit",
                                                  },
                                                  null,
                                                  8,
                                                  ["src", "aria-label"],
                                                ),
                                                createVNode(
                                                  Text,
                                                  {
                                                    class: "identity-team-name",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(
                                                        toDisplayString(O(T.value.revealRole.team)),
                                                        1,
                                                      ),
                                                    ]),
                                                    _: 1,
                                                  },
                                                ),
                                              ],
                                              64,
                                            ))
                                          : (openBlock(),
                                            createElementBlock(
                                              Fragment,
                                              {
                                                key: 1,
                                              },
                                              [
                                                createVNode(
                                                  RolePortrait,
                                                  {
                                                    role: T.value.revealRole,
                                                    size: 128,
                                                  },
                                                  null,
                                                  8,
                                                  ["role"],
                                                ),
                                                createVNode(
                                                  Text,
                                                  {
                                                    class: "identity-role-name",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(
                                                        toDisplayString(T.value.revealRole.name),
                                                        1,
                                                      ),
                                                    ]),
                                                    _: 1,
                                                  },
                                                ),
                                                createVNode(
                                                  Text,
                                                  {
                                                    class: "identity-role-team",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(
                                                        toDisplayString(O(T.value.revealRole.team)),
                                                        1,
                                                      ),
                                                    ]),
                                                    _: 1,
                                                  },
                                                ),
                                                createVNode(
                                                  Text,
                                                  {
                                                    class: "identity-role-ability",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(
                                                        toDisplayString(
                                                          T.value.revealRole.ability || "暂无角色介绍",
                                                        ),
                                                        1,
                                                      ),
                                                    ]),
                                                    _: 1,
                                                  },
                                                ),
                                              ],
                                              64,
                                            )),
                                      ]),
                                      _: 1,
                                    },
                                  ))
                                : (openBlock(),
                                  createBlock(
                                    View,
                                    {
                                      key: 3,
                                      class: "identity-handoff identity-complete",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(
                                          Text,
                                          {
                                            class: "identity-complete-mark",
                                          },
                                          {
                                            default: withCtx(() => [createTextVNode("✓")]),
                                            _: 1,
                                          },
                                        ),
                                        createVNode(
                                          Text,
                                          {
                                            class: "identity-complete-title",
                                          },
                                          {
                                            default: withCtx(() => [createTextVNode("所有身份已领取")]),
                                            _: 1,
                                          },
                                        ),
                                        createVNode(
                                          Text,
                                          {
                                            class: "identity-draw-hint",
                                          },
                                          {
                                            default: withCtx(() => [
                                              createTextVNode("请将设备交回说书人，再完成下发"),
                                            ]),
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
                    "pick" !== T.value.phase
                      ? (openBlock(),
                        createBlock(
                          View,
                          {
                            key: 0,
                            class: "identity-draw-footer",
                          },
                          {
                            default: withCtx(() => [
                              "handoff" === T.value.phase
                                ? (openBlock(),
                                  createBlock(
                                    Button,
                                    {
                                      key: 0,
                                      class: "identity-action identity-confirm-seat",
                                      onClick: B,
                                    },
                                    {
                                      default: withCtx(() => [
                                        createTextVNode(
                                          "我是 " + toDisplayString(z.value.number) + " 号，开始领取",
                                          1,
                                        ),
                                      ]),
                                      _: 1,
                                    },
                                  ))
                                : "reveal" === T.value.phase
                                  ? (openBlock(),
                                    createBlock(
                                      Button,
                                      {
                                        key: 1,
                                        class: "identity-action identity-acknowledge",
                                        onClick: q,
                                      },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode("记住了，遮住身份并继续"),
                                        ]),
                                        _: 1,
                                      },
                                    ))
                                  : (openBlock(),
                                    createBlock(
                                      Button,
                                      {
                                        key: 2,
                                        class: "identity-action identity-finish",
                                        onClick: H,
                                      },
                                      {
                                        default: withCtx(() => [createTextVNode("说书人：完成下发")]),
                                        _: 1,
                                      },
                                    )),
                            ]),
                            _: 1,
                          },
                        ))
                      : createCommentVNode("", true),
                    A.value
                      ? (openBlock(),
                        createBlock(
                          View,
                          {
                            key: 1,
                            class: "identity-exit-backdrop",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                View,
                                {
                                  class: "identity-exit-panel",
                                },
                                {
                                  default: withCtx(() => [
                                    createVNode(
                                      Text,
                                      {
                                        class: "identity-exit-title",
                                      },
                                      {
                                        default: withCtx(() => [createTextVNode("放弃本次下发？")]),
                                        _: 1,
                                      },
                                    ),
                                    createVNode(Text, null, {
                                      default: withCtx(() => [
                                        createTextVNode(
                                          "已领取的结果不会保存，魔典保留开始前的角色分配。",
                                        ),
                                      ]),
                                      _: 1,
                                    }),
                                    createVNode(
                                      View,
                                      {
                                        class: "identity-exit-actions",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(
                                            Button,
                                            {
                                              class: "identity-exit-action identity-keep-drawing",
                                              onClick:
                                                renderCache[6] ||
                                                (renderCache[6] = (e) => (A.value = false)),
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("继续领取")]),
                                              _: 1,
                                            },
                                          ),
                                          createVNode(
                                            Button,
                                            {
                                              class: "identity-exit-action identity-discard",
                                              onClick:
                                                renderCache[7] || (renderCache[7] = (e) => l("close")),
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("放弃下发")]),
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
                        ))
                      : createCommentVNode("", true),
                  ]),
                  _: 1,
                },
                8,
                ["style"],
              ))
            : (openBlock(),
              createBlock(
                View,
                {
                  key: 0,
                  class: "identity-setup-backdrop",
                  onClick: renderCache[5] || (renderCache[5] = (e) => l("close")),
                },
                {
                  default: withCtx(() => [
                    createVNode(
                      View,
                      {
                        class: "identity-setup",
                        role: "dialog",
                        "aria-label": "下发身份设置",
                        onClick: renderCache[4] || (renderCache[4] = withModifiers(() => {}, ["stop"])),
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            View,
                            {
                              class: "identity-setup-header",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(View, null, {
                                  default: withCtx(() => [
                                    createVNode(
                                      Text,
                                      {
                                        class: "identity-setup-title",
                                      },
                                      {
                                        default: withCtx(() => [createTextVNode("下发身份")]),
                                        _: 1,
                                      },
                                    ),
                                    createVNode(
                                      Text,
                                      {
                                        class: "identity-setup-subtitle",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode("先选好方式，再将设备交给玩家"),
                                        ]),
                                        _: 1,
                                      },
                                    ),
                                  ]),
                                  _: 1,
                                }),
                                createVNode(
                                  Button,
                                  {
                                    class: "identity-setup-close",
                                    "aria-label": "关闭",
                                    onClick: renderCache[0] || (renderCache[0] = (e) => l("close")),
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(View, {
                                        class: "identity-close-glyph",
                                        "aria-hidden": "true",
                                      }),
                                    ]),
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
                              class: "identity-setup-body",
                              "scroll-y": "",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  View,
                                  {
                                    class: "identity-setup-content",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        View,
                                        {
                                          class: "identity-team-setting",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("仅下发阵营")]),
                                              _: 1,
                                            }),
                                            createVNode(
                                              Switch,
                                              {
                                                class: "identity-team-switch",
                                                role: "switch",
                                                "aria-label": "仅下发阵营",
                                                "aria-checked": $.value,
                                                checked: $.value,
                                                color: "#527b9b",
                                                onChange:
                                                  renderCache[1] ||
                                                  (renderCache[1] = (e) => ($.value = !!e.detail.value)),
                                              },
                                              null,
                                              8,
                                              ["aria-checked", "checked"],
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        Text,
                                        {
                                          class: "identity-field-label",
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode("身份发放")]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        View,
                                        {
                                          class: "identity-modes",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Button,
                                              {
                                                class: normalizeClass([
                                                  "identity-option",
                                                  {
                                                    selected: "random" === y.value,
                                                  },
                                                ]),
                                                "data-mode": "random",
                                                "aria-pressed": "random" === y.value,
                                                onClick:
                                                  renderCache[2] ||
                                                  (renderCache[2] = (e) => (y.value = "random")),
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createVNode(
                                                    Text,
                                                    {
                                                      class: "identity-option-title",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode("完全随机"),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ),
                                                  createVNode(
                                                    Text,
                                                    {
                                                      class: "identity-option-detail",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode(
                                                          "重新抽取本局角色，旅行者保留身份",
                                                        ),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["class", "aria-pressed"],
                                            ),
                                            createVNode(
                                              Button,
                                              {
                                                class: normalizeClass([
                                                  "identity-option",
                                                  {
                                                    selected: "assigned" === y.value,
                                                  },
                                                ]),
                                                "data-mode": "assigned",
                                                "aria-pressed": "assigned" === y.value,
                                                onClick:
                                                  renderCache[3] ||
                                                  (renderCache[3] = (e) => (y.value = "assigned")),
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createVNode(
                                                    Text,
                                                    {
                                                      class: "identity-option-title",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode("按已分配角色"),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ),
                                                  createVNode(
                                                    Text,
                                                    {
                                                      class: "identity-option-detail",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode("每个座位领取当前配置的身份"),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ),
                                                ]),
                                                _: 1,
                                              },
                                              8,
                                              ["class", "aria-pressed"],
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        Text,
                                        {
                                          class: "identity-field-label",
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode("设备传递顺序")]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        View,
                                        {
                                          class: "identity-orders",
                                        },
                                        {
                                          default: withCtx(() => [
                                            (openBlock(),
                                            createElementBlock(
                                              Fragment,
                                              null,
                                              renderList(S, (e) =>
                                                createVNode(
                                                  Button,
                                                  {
                                                    key: e.key,
                                                    class: normalizeClass([
                                                      "identity-order",
                                                      {
                                                        selected: k.value === e.key,
                                                      },
                                                    ]),
                                                    "data-order": e.key,
                                                    "aria-pressed": k.value === e.key,
                                                    onClick: (t) => (k.value = e.key),
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(e.label), 1),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1032,
                                                  ["class", "data-order", "aria-pressed", "onClick"],
                                                ),
                                              ),
                                              64,
                                            )),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        Text,
                                        {
                                          class: "identity-setup-hint",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createTextVNode(
                                              toDisplayString(
                                                "forward" === k.value
                                                  ? "从 1 号开始，按座位号依次领取。"
                                                  : "reverse" === k.value
                                                    ? `从 ${props.seats.length} 号开始，按座位号逆序领取。`
                                                    : "开始后随机决定传递顺序，每次都会提示接收座位。",
                                              ),
                                              1,
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        Text,
                                        {
                                          class: "identity-setup-hint",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createTextVNode(
                                              "所有座位都需先分配角色。抽取期间魔典会被完全遮住。",
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      E.value
                                        ? (openBlock(),
                                          createBlock(
                                            Text,
                                            {
                                              key: 0,
                                              class: "identity-error",
                                              role: "alert",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(E.value), 1),
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
                          createVNode(
                            View,
                            {
                              class: "identity-setup-footer",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  Button,
                                  {
                                    class: "identity-start",
                                    onClick: F,
                                  },
                                  {
                                    default: withCtx(() => [
                                      createTextVNode(
                                        "开始下发 · " + toDisplayString(props.seats.length) + " 人",
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
                        ]),
                        _: 1,
                      },
                    ),
                  ]),
                  _: 1,
                },
              ));
        }
      );
    },
  },
  [["__scopeId", "data-v-362fa54a"]],
);
export { IdentityDraw };
