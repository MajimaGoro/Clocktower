// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { RolePortrait } from "./RolePortrait.js";
import { Sheet } from "./Sheet.js";
import { ORDINARY_ROLE_TEAMS, TEAM_LABELS } from "../data/teams.js";
import { getRecommendedComposition } from "../domain/composition.js";
import { useLongPress } from "../composables/useLongPress.js";
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
  openBlock,
  ref,
  renderList,
  toDisplayString,
  unref,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const GameRoleSelector = withComponentMetadata(
  {
    __name: "GameRoleSelector",
    props: {
      roles: {
        type: Array,
        required: true,
      },
      initialRoles: {
        type: Array,
        default: () => [],
      },
      playerCount: {
        type: Number,
        required: true,
      },
    },
    emits: ["close", "confirm"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit,
        l = ref([...i.initialRoles]),
        n = ref(new Set(l.value.map((e) => e.id)).size < l.value.length),
        y = ref(""),
        k = ref(""),
        R = ref([]),
        M = ref(null),
        I = useLongPress((e) => {
          M.value = e;
        }),
        $ = computed(() => getRecommendedComposition(i.playerCount)),
        A = computed(() =>
          (function (e) {
            const t = Object.fromEntries(ORDINARY_ROLE_TEAMS.map((e) => [e, 0]));
            for (const i of e)
              ORDINARY_ROLE_TEAMS.includes(null == i ? void 0 : i.team) && (t[i.team] += 1);
            return t;
          })(l.value),
        ),
        S = computed(() => $.value && ORDINARY_ROLE_TEAMS.some((e) => A.value[e] !== $.value[e])),
        z = computed(() => [...new Map(l.value.filter((e) => e.setup).map((e) => [e.id, e])).values()]),
        V = computed(() =>
          ORDINARY_ROLE_TEAMS.map((e) => ({
            team: e,
            roles: i.roles.filter(
              (t) =>
                t.team === e && `${t.name} ${t.id}`.toLowerCase().includes(y.value.trim().toLowerCase()),
            ),
          })),
        ),
        L = computed(() =>
          R.value.map((e) => `${j(e.team)}需 ${e.need} 个，剧本仅有 ${e.available} 个`).join("；"),
        );
      function j(e) {
        return TEAM_LABELS[e] || e;
      }
      function O(e) {
        return l.value.filter((t) => t.id === e).length;
      }
      function D(e, t) {
        if (((k.value = ""), t > 0)) l.value.push(e);
        else {
          const t = l.value.findIndex((t) => t.id === e.id);
          t >= 0 && l.value.splice(t, 1);
        }
      }
      function F() {
        n.value = !n.value;
        n.value || (l.value = [...new Map(l.value.map((e) => [e.id, e])).values()]);
        k.value = "";
      }
      function B() {
        l.value = [];
        k.value = "";
        R.value = [];
        M.value = null;
        I.cancel();
      }
      function P() {
        const e = (function (e, t, i = Math.random) {
          const a = Number.isInteger(t) ? getRecommendedComposition(t) : null;
          if (!a)
            return {
              roles: [],
              shortages: [],
              unsupported: true,
            };
          const l = [],
            n = [];
          for (const r of ORDINARY_ROLE_TEAMS) {
            const t = a[r];
            if (!t) continue;
            const o = new Set(),
              s = e.filter(
                (e) =>
                  !((null == e ? void 0 : e.team) !== r || !e.id || o.has(e.id) || (o.add(e.id), 0)),
              );
            s.length < t &&
              n.push({
                team: r,
                need: t,
                available: s.length,
              });
            for (let e = s.length - 1; e > 0; e -= 1) {
              const t = Math.min(e, Math.max(0, Math.floor(i() * (e + 1))));
              [s[e], s[t]] = [s[t], s[e]];
            }
            l.push(...s.slice(0, t));
          }
          return {
            roles: l,
            shortages: n,
            unsupported: false,
          };
        })(i.roles, i.playerCount);
        e.unsupported ||
          ((l.value = e.roles),
          (R.value = e.shortages),
          (k.value = ""),
          (M.value = null),
          (y.value = ""));
      }
      function W() {
        i.playerCount > 15
          ? (k.value = "普通玩家最多 15 人，请先将多出的座位分配为旅行者。")
          : i.playerCount
            ? l.value.length === i.playerCount
              ? a("confirm", [...l.value])
              : (k.value = `角色数 ${l.value.length} 与普通玩家数 ${i.playerCount} 不一致，请调整后再保存。`)
            : (k.value = "没有可分配的普通玩家座位。");
      }
      return (renderContext, renderCache) => {
        const Text = UniText,
          Button = UniButton,
          View = UniView,
          Input = UniInput,
          Image = UniImage,
          ScrollView = UniScrollView;
        return (
          openBlock(),
          createBlock(
            Sheet,
            {
              wide: "",
              appearance: "paper",
              onClose: renderCache[3] || (renderCache[3] = (e) => a("close")),
            },
            {
              footer: withCtx(() => [
                k.value
                  ? (openBlock(),
                    createBlock(
                      View,
                      {
                        key: 0,
                        class: "assignment-error",
                        role: "alert",
                      },
                      {
                        default: withCtx(() => [createTextVNode(toDisplayString(k.value), 1)]),
                        _: 1,
                      },
                    ))
                  : createCommentVNode("", true),
                M.value
                  ? (openBlock(),
                    createBlock(
                      View,
                      {
                        key: 1,
                        class: "assignment-info",
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            ScrollView,
                            {
                              class: "assignment-info-scroll",
                              "scroll-y": "",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  Text,
                                  {
                                    class: "assignment-info-name",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(M.value.name), 1),
                                    ]),
                                    _: 1,
                                  },
                                ),
                                createVNode(
                                  Text,
                                  {
                                    class: "assignment-info-ability",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createTextVNode(
                                        toDisplayString(M.value.ability || "暂无能力描述") +
                                          toDisplayString(
                                            M.value.setup
                                              ? " 提醒：此角色会改变初始配置，随机配板不会自动计算，请手动调整。"
                                              : "",
                                          ),
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
                              class: "assignment-info-close",
                              "aria-label": "关闭能力说明",
                              onClick: renderCache[2] || (renderCache[2] = (e) => (M.value = null)),
                            },
                            {
                              default: withCtx(() => [createTextVNode("×")]),
                              _: 1,
                            },
                          ),
                        ]),
                        _: 1,
                      },
                    ))
                  : createCommentVNode("", true),
                createVNode(
                  View,
                  {
                    class: "assignment-footer",
                  },
                  {
                    default: withCtx(() => [
                      createVNode(
                        Button,
                        {
                          class: "assignment-duplicate",
                          "aria-pressed": n.value,
                          onClick: F,
                        },
                        {
                          default: withCtx(() => [
                            createVNode(
                              Text,
                              {
                                class: normalizeClass([
                                  "assignment-checkbox",
                                  {
                                    checked: n.value,
                                  },
                                ]),
                              },
                              {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(n.value ? "✓" : ""), 1),
                                ]),
                                _: 1,
                              },
                              8,
                              ["class"],
                            ),
                            createVNode(Text, null, {
                              default: withCtx(() => [createTextVNode("允许重复角色")]),
                              _: 1,
                            }),
                          ]),
                          _: 1,
                        },
                        8,
                        ["aria-pressed"],
                      ),
                      createVNode(
                        View,
                        {
                          class: "assignment-buttons",
                        },
                        {
                          default: withCtx(() => [
                            createVNode(
                              Button,
                              {
                                class: "assignment-random",
                                disabled: !$.value,
                                onClick: P,
                              },
                              {
                                default: withCtx(() => [
                                  createVNode(
                                    Text,
                                    {
                                      class: "assignment-random-icon",
                                      "aria-hidden": "true",
                                    },
                                    {
                                      default: withCtx(() => [createTextVNode("⤨")]),
                                      _: 1,
                                    },
                                  ),
                                  createTextVNode("随机配板"),
                                ]),
                                _: 1,
                              },
                              8,
                              ["disabled"],
                            ),
                            createVNode(
                              Button,
                              {
                                class: "assignment-save gold-button",
                                onClick: W,
                              },
                              {
                                default: withCtx(() => [createTextVNode("保存并分配")]),
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
              default: withCtx(() => [
                createVNode(
                  View,
                  {
                    class: "game-role-selector",
                  },
                  {
                    default: withCtx(() => [
                      createVNode(
                        View,
                        {
                          class: "assignment-overview selection-counter",
                        },
                        {
                          default: withCtx(() => [
                            createVNode(
                              Text,
                              {
                                class: "assignment-count",
                              },
                              {
                                default: withCtx(() => [
                                  createTextVNode("已选 "),
                                  createVNode(
                                    Text,
                                    {
                                      class: normalizeClass([
                                        "assignment-total",
                                        {
                                          complete: l.value.length === props.playerCount,
                                        },
                                      ]),
                                    },
                                    {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(l.value.length), 1),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["class"],
                                  ),
                                  createVNode(
                                    Text,
                                    {
                                      class: "assignment-target",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createTextVNode(" / " + toDisplayString(props.playerCount), 1),
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
                                class: "assignment-clear text-button",
                                onClick: B,
                              },
                              {
                                default: withCtx(() => [createTextVNode("清空选择")]),
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
                          class: "assignment-search-row",
                        },
                        {
                          default: withCtx(() => [
                            createVNode(
                              Input,
                              {
                                modelValue: y.value,
                                "onUpdate:modelValue":
                                  renderCache[0] || (renderCache[0] = (e) => (y.value = e)),
                                class: "assignment-search",
                                placeholder: "搜索角色",
                                "placeholder-style": "color: #9b9183",
                              },
                              null,
                              8,
                              ["modelValue"],
                            ),
                            createVNode(
                              Text,
                              {
                                class: "assignment-gesture",
                              },
                              {
                                default: withCtx(() => [createTextVNode("轻点选择 · 长按看能力")]),
                                _: 1,
                              },
                            ),
                          ]),
                          _: 1,
                        },
                      ),
                      $.value
                        ? createCommentVNode("", true)
                        : (openBlock(),
                          createBlock(
                            View,
                            {
                              key: 0,
                              class: "assignment-notice assignment-rule-notice",
                            },
                            {
                              default: withCtx(() => [
                                createTextVNode(
                                  toDisplayString(
                                    props.playerCount > 15
                                      ? "普通玩家最多 15 人，多出的座位请先逐座分配为旅行者。"
                                      : "当前人数没有标准配置，请手动选择角色。",
                                  ),
                                  1,
                                ),
                              ]),
                              _: 1,
                            },
                          )),
                      L.value
                        ? (openBlock(),
                          createBlock(
                            View,
                            {
                              key: 1,
                              class: "assignment-notice",
                            },
                            {
                              default: withCtx(() => [
                                createTextVNode(
                                  toDisplayString(L.value) + "。可开启重复角色后手动补足，或调整剧本。",
                                  1,
                                ),
                              ]),
                              _: 1,
                            },
                          ))
                        : createCommentVNode("", true),
                      z.value.length
                        ? (openBlock(),
                          createBlock(
                            View,
                            {
                              key: 2,
                              class: "assignment-notice assignment-setup-notice",
                              role: "note",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  Text,
                                  {
                                    class: "assignment-notice-title",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createTextVNode(
                                        "⚠ 初始配置可能变化 · " +
                                          toDisplayString(z.value.map((e) => e.name).join("、")),
                                        1,
                                      ),
                                    ]),
                                    _: 1,
                                  },
                                ),
                                createVNode(
                                  Text,
                                  {
                                    class: "assignment-setup-detail",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createTextVNode(
                                        "随机配板不会计算这些角色的配置调整，请说书人按能力手动增减角色。",
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
                      $.value && l.value.length && S.value
                        ? (openBlock(),
                          createBlock(
                            View,
                            {
                              key: 3,
                              class: "assignment-team-notice",
                            },
                            {
                              default: withCtx(() => [
                                createTextVNode("阵营人数与标准配置不同；特殊配置可手动调整后保存。"),
                              ]),
                              _: 1,
                            },
                          ))
                        : createCommentVNode("", true),
                      (openBlock(true),
                      createElementBlock(
                        Fragment,
                        null,
                        renderList(
                          V.value,
                          (e) => (
                            openBlock(),
                            createBlock(
                              View,
                              {
                                key: e.team,
                                class: "assignment-group",
                                "data-team": e.team,
                              },
                              {
                                default: withCtx(() => [
                                  createVNode(
                                    View,
                                    {
                                      class: "assignment-group-heading",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(
                                          View,
                                          {
                                            class: "assignment-team-label",
                                          },
                                          {
                                            default: withCtx(() => [
                                              createVNode(
                                                Image,
                                                {
                                                  webp: true,
                                                  class: "assignment-team-icon",
                                                  src: `/static/reference/count-${e.team}.png`,
                                                  mode: "aspectFit",
                                                  "aria-hidden": "true",
                                                },
                                                null,
                                                8,
                                                ["src"],
                                              ),
                                              createVNode(
                                                Text,
                                                null,
                                                {
                                                  default: withCtx(() => [
                                                    createTextVNode(toDisplayString(j(e.team)), 1),
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
                                        createVNode(
                                          Text,
                                          {
                                            class: normalizeClass([
                                              "assignment-team-count",
                                              {
                                                correct: $.value && A.value[e.team] === $.value[e.team],
                                                different:
                                                  $.value && A.value[e.team] !== $.value[e.team],
                                              },
                                            ]),
                                            "data-team": e.team,
                                          },
                                          {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(A.value[e.team]), 1),
                                              createVNode(
                                                Text,
                                                {
                                                  class: "assignment-rule-count",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createTextVNode(
                                                      " / " +
                                                        toDisplayString($.value ? $.value[e.team] : "—"),
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
                                          ["data-team", "class"],
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  createVNode(
                                    View,
                                    {
                                      class: "assignment-role-list",
                                    },
                                    {
                                      default: withCtx(() => [
                                        (openBlock(true),
                                        createElementBlock(
                                          Fragment,
                                          null,
                                          renderList(
                                            e.roles,
                                            (e) => (
                                              openBlock(),
                                              createBlock(
                                                View,
                                                {
                                                  key: e.id,
                                                  class: normalizeClass([
                                                    "assignment-role",
                                                    {
                                                      selected: O(e.id) > 0,
                                                    },
                                                  ]),
                                                  "data-role-id": e.id,
                                                  "data-team": e.team,
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createVNode(
                                                      Button,
                                                      {
                                                        class: "role-pick assignment-pick",
                                                        "aria-label": `${e.name}${O(e.id) ? "，已选" : ""}`,
                                                        "aria-pressed": O(e.id) > 0,
                                                        onClick: (t) =>
                                                          (function (e) {
                                                            I.allowTap() &&
                                                              ((k.value = ""),
                                                              O(e.id)
                                                                ? n.value ||
                                                                  (l.value = l.value.filter(
                                                                    (t) => t.id !== e.id,
                                                                  ))
                                                                : l.value.push(e));
                                                          })(e),
                                                        onLongpress: (t) => unref(I).inspect(e),
                                                        onTouchstart: (t) => unref(I).touchStart(e, t),
                                                        onTouchmove: unref(I).move,
                                                        onTouchend: unref(I).touchEnd,
                                                        onTouchcancel: unref(I).cancel,
                                                        onMousedown: (t) => unref(I).mouseStart(e, t),
                                                        onMousemove: unref(I).move,
                                                        onMouseup: unref(I).end,
                                                        onMouseleave: unref(I).cancel,
                                                        onContextmenu:
                                                          renderCache[1] ||
                                                          (renderCache[1] = withModifiers(() => {}, [
                                                            "prevent",
                                                          ])),
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createVNode(
                                                            RolePortrait,
                                                            {
                                                              role: e,
                                                              size: 72,
                                                              named: "",
                                                            },
                                                            null,
                                                            8,
                                                            ["role"],
                                                          ),
                                                          O(e.id)
                                                            ? (openBlock(),
                                                              createBlock(
                                                                Text,
                                                                {
                                                                  key: 0,
                                                                  class: "assignment-check",
                                                                  "aria-hidden": "true",
                                                                },
                                                                {
                                                                  default: withCtx(() => [
                                                                    createTextVNode("✓"),
                                                                  ]),
                                                                  _: 1,
                                                                },
                                                              ))
                                                            : createCommentVNode("", true),
                                                          n.value && O(e.id) > 0
                                                            ? (openBlock(),
                                                              createBlock(
                                                                Text,
                                                                {
                                                                  key: 1,
                                                                  class: "assignment-multiplicity",
                                                                },
                                                                {
                                                                  default: withCtx(() => [
                                                                    createTextVNode(
                                                                      "×" + toDisplayString(O(e.id)),
                                                                      1,
                                                                    ),
                                                                  ]),
                                                                  _: 2,
                                                                },
                                                                1024,
                                                              ))
                                                            : createCommentVNode("", true),
                                                        ]),
                                                        _: 2,
                                                      },
                                                      1032,
                                                      [
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
                                                    ),
                                                    e.setup && O(e.id)
                                                      ? (openBlock(),
                                                        createBlock(
                                                          Button,
                                                          {
                                                            key: 0,
                                                            class: "assignment-setup-warning",
                                                            "aria-label": `${e.name}会改变初始配置，查看说明`,
                                                            onClick: withModifiers(
                                                              (t) =>
                                                                (function (e) {
                                                                  M.value = e;
                                                                })(e),
                                                              ["stop"],
                                                            ),
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createVNode(Text, null, {
                                                                default: withCtx(() => [
                                                                  createTextVNode("!"),
                                                                ]),
                                                                _: 1,
                                                              }),
                                                            ]),
                                                            _: 2,
                                                          },
                                                          1032,
                                                          ["aria-label", "onClick"],
                                                        ))
                                                      : createCommentVNode("", true),
                                                    n.value && O(e.id)
                                                      ? (openBlock(),
                                                        createBlock(
                                                          View,
                                                          {
                                                            key: 1,
                                                            class: "assignment-quantity",
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createVNode(
                                                                Button,
                                                                {
                                                                  class: "assignment-dec",
                                                                  "aria-label": `减少${e.name}`,
                                                                  onClick: (t) => D(e, -1),
                                                                },
                                                                {
                                                                  default: withCtx(() => [
                                                                    createTextVNode("−"),
                                                                  ]),
                                                                  _: 2,
                                                                },
                                                                1032,
                                                                ["aria-label", "onClick"],
                                                              ),
                                                              createVNode(
                                                                Text,
                                                                null,
                                                                {
                                                                  default: withCtx(() => [
                                                                    createTextVNode(
                                                                      toDisplayString(O(e.id)),
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
                                                                  class: "assignment-inc",
                                                                  "aria-label": `增加${e.name}`,
                                                                  onClick: (t) => D(e, 1),
                                                                },
                                                                {
                                                                  default: withCtx(() => [
                                                                    createTextVNode("＋"),
                                                                  ]),
                                                                  _: 2,
                                                                },
                                                                1032,
                                                                ["aria-label", "onClick"],
                                                              ),
                                                            ]),
                                                            _: 2,
                                                          },
                                                          1024,
                                                        ))
                                                      : createCommentVNode("", true),
                                                  ]),
                                                  _: 2,
                                                },
                                                1032,
                                                ["class", "data-role-id", "data-team"],
                                              )
                                            ),
                                          ),
                                          128,
                                        )),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  e.roles.length
                                    ? createCommentVNode("", true)
                                    : (openBlock(),
                                      createBlock(
                                        Text,
                                        {
                                          key: 0,
                                          class: "assignment-empty",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createTextVNode(
                                              toDisplayString(
                                                y.value.trim() ? "无匹配角色" : "剧本中没有此类角色",
                                              ),
                                              1,
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      )),
                                ]),
                                _: 2,
                              },
                              1032,
                              ["data-team"],
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
          )
        );
      };
    },
  },
  [["__scopeId", "data-v-e53a4d7a"]],
);
export { GameRoleSelector };
