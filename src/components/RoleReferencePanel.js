// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { DEFAULT_ROLE_IMAGE } from "../data/assets.js";
import { TEAM_LABELS } from "../data/teams.js";
import { buildNightOrder } from "../domain/nightOrder.js";
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
  createSelectorQuery,
  createTextVNode,
  createVNode,
  getCurrentInstance,
  nextTick,
  normalizeClass,
  normalizeStyle,
  onBeforeUnmount,
  onMounted,
  openBlock,
  ref,
  renderList,
  toDisplayString,
  watch,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const RoleReferencePanel = withComponentMetadata(
  {
    __name: "RoleReferencePanel",
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      script: {
        type: Object,
        default: () => ({
          roles: [],
        }),
      },
      seats: {
        type: Array,
        default: () => [],
      },
      initialSection: {
        type: String,
        default: "roles",
      },
      wakeEnabled: {
        type: Boolean,
        default: false,
      },
      viewport: {
        type: Object,
        default: () => ({}),
      },
    },
    emits: ["close", "replace-icon", "wake", "reorder", "remove-role", "save-night-orders"],
    setup(props, { emit: emit }) {
      const a = props,
        l = computed(() => ({})),
        n = emit,
        y = getCurrentInstance(),
        $ = (e) => ("night" === e || "night-order" === e ? "night" : "roles"),
        E = ref($(a.initialSection)),
        A = ref(""),
        S = ref({}),
        V = ref({}),
        j = ref(false),
        O = ref({
          minionInfo: 6,
          demonInfo: 8,
        }),
        D = [
          {
            key: "minionInfo",
            label: "爪牙互认、得知恶魔",
          },
          {
            key: "demonInfo",
            label: "恶魔得知爪牙及伪装身份",
          },
        ],
        F = computed(() => {
          var e, t;
          return Array.isArray(
            null == (t = null == (e = a.script) ? void 0 : e.meta) ? void 0 : t.firstNight,
          );
        }),
        B = computed(() => {
          return (
            !F.value &&
            !!(e = O.value) &&
            ["minionInfo", "demonInfo"].every((t) => {
              const i = e[t];
              if ("number" != typeof i && "string" != typeof i) return false;
              const a = Number(i);
              return Number.isInteger(a) && a >= 1 && a <= 999;
            })
          );
          var e;
        });
      function P() {
        var e, t;
        const i = null == (t = null == (e = a.script) ? void 0 : e.meta) ? void 0 : t.evilInfoNightOrder;
        O.value = {
          minionInfo: (null == i ? void 0 : i.minionInfo) ?? 6,
          demonInfo: (null == i ? void 0 : i.demonInfo) ?? 8,
        };
        j.value = true;
      }
      function W(e) {
        F.value ||
          (!e && !B.value) ||
          (n(
            "save-night-orders",
            e
              ? {
                  minionInfo: 6,
                  demonInfo: 8,
                }
              : {
                  minionInfo: Number(O.value.minionInfo),
                  demonInfo: Number(O.value.demonInfo),
                },
          ),
          (j.value = false));
      }
      const q = ref(null),
        U = ref(null),
        H = ref(false),
        J = ref(false),
        K = ref({
          x: 0,
          y: 0,
        });
      let Y = [],
        X = null,
        Q = null,
        Z = null,
        ee = 0;
      const te = [
        {
          className: "role-ability-red",
          words: [
            "邪恶",
            "死亡",
            "恶魔",
            "邪恶阵营",
            "醉酒直到下个黄昏",
            "爪牙",
            "恶魔的负面能力",
            "阵营落败",
            "醉酒",
            "错误",
            "已死亡",
            "转变为他的阵营",
            "中毒",
            "失去此能力",
            "产生错误信息",
            "处决",
            "邪恶阵营获胜",
            "邪恶角色",
            "被处决",
            "落败",
            "中毒直到下个黄昏",
            "杀死",
            "小恶魔",
            "自杀",
          ],
        },
        {
          className: "role-ability-blue",
          words: [
            "善良玩家",
            "非恶魔",
            "存活",
            "善良",
            "不会死亡",
            "发起提名",
            "线索",
            "镇民玩家",
            "镇民角色",
            "镇民",
            "外来者数量",
          ],
        },
        {
          className: "role-ability-purple",
          words: ["疯狂", "投票标记"],
        },
      ];
      function ie(e = "") {
        const t = String(e),
          i = [];
        let a = 0;
        for (; a < t.length;) {
          let e = null;
          for (const i of te)
            for (const l of i.words) {
              const n = t.indexOf(l, a);
              n >= 0 &&
                (!e || n < e.index || (n === e.index && l.length > e.word.length)) &&
                (e = {
                  index: n,
                  word: l,
                  className: i.className,
                });
            }
          if (!e) {
            i.push({
              text: t.slice(a),
              className: "",
            });
            break;
          }
          e.index > a &&
            i.push({
              text: t.slice(a, e.index),
              className: "",
            });
          i.push({
            text: e.word,
            className: e.className,
          });
          a = e.index + e.word.length;
        }
        return i;
      }
      const ae = ["townsfolk", "outsider", "minion", "demon", "a jinxed", "status"],
        le = computed(() => {
          var e;
          return ((null == (e = a.script) ? void 0 : e.roles) || [])
            .map((e, t) => ({
              ...e,
              editionIndex: t,
              segments: ie(e.ability),
            }))
            .filter((e) => e.name && ae.includes(e.team));
        }),
        oe = computed(() => ae.filter((e) => le.value.some((t) => t.team === e))),
        se = computed(() => {
          const e = A.value.trim().toLocaleLowerCase();
          return oe.value
            .map((t) => ({
              team: t,
              label: TEAM_LABELS[t] || t,
              roles: le.value.filter(
                (i) => i.team === t && (!e || i.name.toLocaleLowerCase().includes(e)),
              ),
            }))
            .filter((e) => e.roles.length);
        }),
        de = computed(() => [
          {
            key: "firstNight",
            title: "首夜行动",
            rows: buildNightOrder(a.script, a.seats, "firstNight"),
          },
          {
            key: "otherNight",
            title: "其他夜晚",
            rows: buildNightOrder(a.script, a.seats, "otherNight"),
          },
        ]),
        ue = (e) => ("a jinxed" === e ? "jinxed" : e),
        me = (e) => (S.value[e.id] ? DEFAULT_ROLE_IMAGE : e.image || DEFAULT_ROLE_IMAGE),
        ce = (e) => a.seats.findIndex((t) => t.id === e) + 1;
      function he(e) {
        var t, i;
        const a =
          (null == (t = e.touches) ? void 0 : t[0]) ||
          (null == (i = e.changedTouches) ? void 0 : i[0]) ||
          e;
        return {
          x: Number(a.clientX ?? a.pageX ?? 0),
          y: Number(a.clientY ?? a.pageY ?? 0),
        };
      }
      function ge() {
        q.value &&
          createSelectorQuery()
            .in(y.proxy)
            .selectAll(".role-ref-row")
            .fields({
              rect: true,
              size: true,
              dataset: true,
            })
            .select(".role-trash-zone")
            .boundingClientRect()
            .exec((e) => {
              q.value &&
                ((Y = ((null == e ? void 0 : e[0]) || []).filter(Boolean)),
                (X = (null == e ? void 0 : e[1]) || null),
                be(K.value));
            });
      }
      function fe(e, t, i) {
        q.value = e;
        K.value = t;
        J.value = i;
        U.value = null;
        H.value = false;
        nextTick(ge);
      }
      function pe(e, t) {
        return !!t && e.x >= t.left && e.x <= t.right && e.y >= t.top && e.y <= t.bottom;
      }
      function be(e) {
        var t, i;
        if (!q.value) return;
        K.value = e;
        H.value = pe(e, X);
        const l = Y.find((t) => pe(e, t)),
          n = l ? Number(null == (t = l.dataset) ? void 0 : t.editionIndex) : -1;
        U.value =
          H.value ||
          n === q.value.editionIndex ||
          (null == (i = a.script.roles[n]) ? void 0 : i.team) !== q.value.team
            ? null
            : n;
      }
      function ve(e) {
        const t = he(e);
        Z &&
          Math.hypot(t.x - Z.point.x, t.y - Z.point.y) > 12 &&
          (clearTimeout(Q), (Q = null), (Z = null));
        q.value && J.value && be(t);
      }
      function ye(e) {
        ee = Date.now();
        q.value && be(he(e));
        Ne();
      }
      function Ne() {
        const e = q.value,
          t = U.value,
          i = H.value;
        ke();
        e &&
          (i
            ? n("remove-role", e.id)
            : null !== t &&
              (function (e, t) {
                const i = [...a.script.roles];
                if (e === t || !i[e] || !i[t] || i[e].team !== i[t].team) return;
                const [l] = i.splice(e, 1);
                i.splice(t, 0, l);
                n("reorder", i);
              })(e.editionIndex, t));
      }
      function ke() {
        clearTimeout(Q);
        Q = null;
        Z = null;
        q.value = null;
        U.value = null;
        H.value = false;
        Y = [];
        X = null;
      }
      function _e(e) {
        q.value && !J.value && be(he(e));
      }
      function Re(e) {
        q.value && !J.value && (be(he(e)), Ne());
      }
      return (
        watch(
          () => a.open,
          (e) => {
            ke();
            j.value = false;
            e && (E.value = $(a.initialSection));
          },
        ),
        watch(
          () => {
            var e;
            return null == (e = a.script) ? void 0 : e.id;
          },
          () => {
            j.value = false;
          },
        ),
        watch(
          () => a.initialSection,
          (e) => {
            E.value = $(e);
          },
        ),
        watch(
          () => {
            var e;
            return null == (e = a.script) ? void 0 : e.roles;
          },
          () => {
            ke();
            S.value = {};
          },
        ),
        watch([E, A], ke),
        onMounted(() => {
          window.addEventListener("mousemove", _e);
          window.addEventListener("mouseup", Re);
          window.addEventListener("blur", ke);
          window.addEventListener("resize", ke);
        }),
        onBeforeUnmount(() => {
          ke();
          window.removeEventListener("mousemove", _e);
          window.removeEventListener("mouseup", Re);
          window.removeEventListener("blur", ke);
          window.removeEventListener("resize", ke);
        }),
        (renderContext, renderCache) => {
          const Button = UniButton,
            Text = UniText,
            View = UniView,
            Input = UniInput,
            Image = UniImage,
            ScrollView = UniScrollView;
          return props.open
            ? (openBlock(),
              createBlock(
                View,
                {
                  key: 0,
                  class: "role-reference-backdrop",
                  style: normalizeStyle(l.value),
                  onClick: renderCache[11] || (renderCache[11] = (e) => n("close")),
                },
                {
                  default: withCtx(() => [
                    createVNode(
                      View,
                      {
                        class: "role-reference role-reference-two-columns",
                        role: "dialog",
                        "aria-label": "角色与行动顺序",
                        "aria-modal": true,
                        onClick: renderCache[4] || (renderCache[4] = withModifiers(() => {}, ["stop"])),
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            View,
                            {
                              class: "section-tabs",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  View,
                                  {
                                    class: "section-tab-list",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        Button,
                                        {
                                          class: normalizeClass([
                                            "section-tab",
                                            {
                                              active: "roles" === E.value,
                                            },
                                          ]),
                                          onClick:
                                            renderCache[0] ||
                                            (renderCache[0] = (e) => (E.value = "roles")),
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode("角色表")]),
                                          _: 1,
                                        },
                                        8,
                                        ["class"],
                                      ),
                                      createVNode(
                                        Button,
                                        {
                                          class: normalizeClass([
                                            "section-tab",
                                            {
                                              active: "night" === E.value,
                                            },
                                          ]),
                                          onClick:
                                            renderCache[1] ||
                                            (renderCache[1] = (e) => (E.value = "night")),
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode("行动顺序")]),
                                          _: 1,
                                        },
                                        8,
                                        ["class"],
                                      ),
                                      props.script.name
                                        ? (openBlock(),
                                          createBlock(
                                            Text,
                                            {
                                              key: 0,
                                              class: "edition-title",
                                              title: props.script.name,
                                            },
                                            {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(props.script.name), 1),
                                              ]),
                                              _: 1,
                                            },
                                            8,
                                            ["title"],
                                          ))
                                        : createCommentVNode("", true),
                                    ]),
                                    _: 1,
                                  },
                                ),
                                createVNode(
                                  Button,
                                  {
                                    class: "reference-close",
                                    "aria-label": "关闭角色资料",
                                    onClick: renderCache[2] || (renderCache[2] = (e) => n("close")),
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
                          "roles" === E.value
                            ? (openBlock(),
                              createBlock(
                                View,
                                {
                                  key: 0,
                                  class: "role-search",
                                },
                                {
                                  default: withCtx(() => [
                                    createVNode(
                                      Input,
                                      {
                                        class: "role-search-input",
                                        modelValue: A.value,
                                        "onUpdate:modelValue":
                                          renderCache[3] || (renderCache[3] = (e) => (A.value = e)),
                                        placeholder: "搜索角色名字",
                                        "placeholder-style": "color: #7f8da1",
                                        "aria-label": "搜索角色名字",
                                      },
                                      null,
                                      8,
                                      ["modelValue"],
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ))
                            : createCommentVNode("", true),
                          createVNode(
                            ScrollView,
                            {
                              class: "reference-content",
                              "scroll-y": !q.value,
                              "show-scrollbar": true,
                            },
                            {
                              default: withCtx(() => [
                                "roles" === E.value
                                  ? (openBlock(),
                                    createBlock(
                                      View,
                                      {
                                        key: 0,
                                        class: "all-role-groups",
                                      },
                                      {
                                        default: withCtx(() => [
                                          (openBlock(true),
                                          createElementBlock(
                                            Fragment,
                                            null,
                                            renderList(
                                              se.value,
                                              (t) => (
                                                openBlock(),
                                                createBlock(
                                                  View,
                                                  {
                                                    key: t.team,
                                                    class: "all-role-group",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createVNode(
                                                        View,
                                                        {
                                                          class: normalizeClass([
                                                            "team-line",
                                                            `team-line-${ue(t.team)}`,
                                                          ]),
                                                        },
                                                        {
                                                          default: withCtx(() => [
                                                            createVNode(
                                                              View,
                                                              {
                                                                class: "team-line-label",
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  (openBlock(true),
                                                                  createElementBlock(
                                                                    Fragment,
                                                                    null,
                                                                    renderList(
                                                                      t.label,
                                                                      (e, t) => (
                                                                        openBlock(),
                                                                        createBlock(
                                                                          Text,
                                                                          {
                                                                            key: t,
                                                                          },
                                                                          {
                                                                            default: withCtx(() => [
                                                                              createTextVNode(
                                                                                toDisplayString(e),
                                                                                1,
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
                                                                _: 2,
                                                              },
                                                              1024,
                                                            ),
                                                          ]),
                                                          _: 2,
                                                        },
                                                        1032,
                                                        ["class"],
                                                      ),
                                                      createVNode(
                                                        View,
                                                        {
                                                          class: "all-role-grid",
                                                        },
                                                        {
                                                          default: withCtx(() => [
                                                            (openBlock(true),
                                                            createElementBlock(
                                                              Fragment,
                                                              null,
                                                              renderList(
                                                                t.roles,
                                                                (t) => (
                                                                  openBlock(),
                                                                  createBlock(
                                                                    View,
                                                                    {
                                                                      key: t.editionIndex,
                                                                      class: normalizeClass([
                                                                        "role-ref-row all-role-row",
                                                                        [
                                                                          `role-team-${ue(t.team)}`,
                                                                          {
                                                                            "role-drop-target":
                                                                              U.value === t.editionIndex,
                                                                            "role-drag-source":
                                                                              q.value &&
                                                                              q.value.editionIndex ===
                                                                                t.editionIndex,
                                                                          },
                                                                        ],
                                                                      ]),
                                                                      "data-edition-index":
                                                                        t.editionIndex,
                                                                    },
                                                                    {
                                                                      default: withCtx(() => [
                                                                        createVNode(
                                                                          View,
                                                                          {
                                                                            class: "role-drag-handle",
                                                                            "aria-label":
                                                                              "长按拖动调整顺序",
                                                                            onMousedown: withModifiers(
                                                                              (e) =>
                                                                                (function (e, t) {
                                                                                  Date.now() - ee <
                                                                                    600 ||
                                                                                    (void 0 !==
                                                                                      e.button &&
                                                                                      0 !== e.button) ||
                                                                                    fe(t, he(e), false);
                                                                                })(e, t),
                                                                              ["stop", "prevent"],
                                                                            ),
                                                                            onTouchstart: withModifiers(
                                                                              (e) =>
                                                                                (function (e, t) {
                                                                                  ke();
                                                                                  ee = Date.now();
                                                                                  const i = he(e);
                                                                                  Z = {
                                                                                    role: t,
                                                                                    point: i,
                                                                                  };
                                                                                  Q = setTimeout(() => {
                                                                                    Q = null;
                                                                                    Z &&
                                                                                      (fe(
                                                                                        Z.role,
                                                                                        Z.point,
                                                                                        true,
                                                                                      ),
                                                                                      (Z = null));
                                                                                  }, 260);
                                                                                })(e, t),
                                                                              ["stop"],
                                                                            ),
                                                                            onTouchmove: withModifiers(
                                                                              ve,
                                                                              ["stop", "prevent"],
                                                                            ),
                                                                            onTouchend: withModifiers(
                                                                              ye,
                                                                              ["stop"],
                                                                            ),
                                                                            onTouchcancel: withModifiers(
                                                                              ke,
                                                                              ["stop"],
                                                                            ),
                                                                          },
                                                                          {
                                                                            default: withCtx(() => [
                                                                              createTextVNode("⠿"),
                                                                            ]),
                                                                            _: 2,
                                                                          },
                                                                          1032,
                                                                          [
                                                                            "onMousedown",
                                                                            "onTouchstart",
                                                                          ],
                                                                        ),
                                                                        createVNode(
                                                                          Button,
                                                                          {
                                                                            class: "role-icon-button",
                                                                            "aria-label": `替换${t.name}的本地图标`,
                                                                            title: "替换本地图标",
                                                                            onClick: withModifiers(
                                                                              (i) =>
                                                                                n(
                                                                                  "replace-icon",
                                                                                  props.script.roles[
                                                                                    t.editionIndex
                                                                                  ],
                                                                                ),
                                                                              ["stop"],
                                                                            ),
                                                                          },
                                                                          {
                                                                            default: withCtx(() => [
                                                                              createVNode(
                                                                                Image,
                                                                                {
                                                                                  webp: true,
                                                                                  class: "role-icon",
                                                                                  src: me(t),
                                                                                  mode: "aspectFit",
                                                                                  onError: (e) =>
                                                                                    (S.value[t.id] =
                                                                                      true),
                                                                                },
                                                                                null,
                                                                                8,
                                                                                ["src", "onError"],
                                                                              ),
                                                                            ]),
                                                                            _: 2,
                                                                          },
                                                                          1032,
                                                                          ["aria-label", "onClick"],
                                                                        ),
                                                                        createVNode(
                                                                          View,
                                                                          {
                                                                            class: "role-content",
                                                                          },
                                                                          {
                                                                            default: withCtx(() => [
                                                                              createVNode(
                                                                                View,
                                                                                {
                                                                                  class:
                                                                                    "role-name-line",
                                                                                },
                                                                                {
                                                                                  default: withCtx(
                                                                                    () => [
                                                                                      createVNode(
                                                                                        Text,
                                                                                        {
                                                                                          class:
                                                                                            "role-name",
                                                                                        },
                                                                                        {
                                                                                          default:
                                                                                            withCtx(
                                                                                              () => [
                                                                                                createTextVNode(
                                                                                                  toDisplayString(
                                                                                                    t.name,
                                                                                                  ),
                                                                                                  1,
                                                                                                ),
                                                                                              ],
                                                                                            ),
                                                                                          _: 2,
                                                                                        },
                                                                                        1024,
                                                                                      ),
                                                                                    ],
                                                                                  ),
                                                                                  _: 2,
                                                                                },
                                                                                1024,
                                                                              ),
                                                                              createVNode(
                                                                                View,
                                                                                {
                                                                                  class: "role-ability",
                                                                                },
                                                                                {
                                                                                  default: withCtx(
                                                                                    () => [
                                                                                      (openBlock(true),
                                                                                      createElementBlock(
                                                                                        Fragment,
                                                                                        null,
                                                                                        renderList(
                                                                                          t.segments,
                                                                                          (e, t) => (
                                                                                            openBlock(),
                                                                                            createBlock(
                                                                                              Text,
                                                                                              {
                                                                                                key: t,
                                                                                                class:
                                                                                                  normalizeClass(
                                                                                                    e.className,
                                                                                                  ),
                                                                                              },
                                                                                              {
                                                                                                default:
                                                                                                  withCtx(
                                                                                                    () => [
                                                                                                      createTextVNode(
                                                                                                        toDisplayString(
                                                                                                          e.text,
                                                                                                        ),
                                                                                                        1,
                                                                                                      ),
                                                                                                    ],
                                                                                                  ),
                                                                                                _: 2,
                                                                                              },
                                                                                              1032,
                                                                                              ["class"],
                                                                                            )
                                                                                          ),
                                                                                        ),
                                                                                        128,
                                                                                      )),
                                                                                    ],
                                                                                  ),
                                                                                  _: 2,
                                                                                },
                                                                                1024,
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
                                                                    ["class", "data-edition-index"],
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
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1024,
                                                )
                                              ),
                                            ),
                                            128,
                                          )),
                                          se.value.length
                                            ? createCommentVNode("", true)
                                            : (openBlock(),
                                              createBlock(
                                                View,
                                                {
                                                  key: 0,
                                                  class: "reference-empty",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createTextVNode(
                                                      toDisplayString(
                                                        A.value.trim()
                                                          ? "没有找到这个角色"
                                                          : "当前剧本还没有角色资料",
                                                      ),
                                                      1,
                                                    ),
                                                  ]),
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
                                        class: "night-order-wrapper",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(
                                            View,
                                            {
                                              class: "night-order-help",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createVNode(Text, null, {
                                                  default: withCtx(() => [
                                                    createTextVNode("夜间顺序不准确？"),
                                                  ]),
                                                  _: 1,
                                                }),
                                                createVNode(
                                                  Button,
                                                  {
                                                    class: "night-order-help-button",
                                                    onClick: P,
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode("点我解决"),
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
                                              class: "night-order",
                                            },
                                            {
                                              default: withCtx(() => [
                                                (openBlock(true),
                                                createElementBlock(
                                                  Fragment,
                                                  null,
                                                  renderList(
                                                    de.value,
                                                    (t) => (
                                                      openBlock(),
                                                      createBlock(
                                                        View,
                                                        {
                                                          key: t.key,
                                                          class: "night-column",
                                                        },
                                                        {
                                                          default: withCtx(() => [
                                                            createVNode(
                                                              Text,
                                                              {
                                                                class: normalizeClass([
                                                                  "night-title",
                                                                  "firstNight" === t.key
                                                                    ? "first-night-title"
                                                                    : "other-night-title",
                                                                ]),
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  createTextVNode(
                                                                    toDisplayString(t.title),
                                                                    1,
                                                                  ),
                                                                ]),
                                                                _: 2,
                                                              },
                                                              1032,
                                                              ["class"],
                                                            ),
                                                            (openBlock(true),
                                                            createElementBlock(
                                                              Fragment,
                                                              null,
                                                              renderList(
                                                                t.rows,
                                                                (i) => (
                                                                  openBlock(),
                                                                  createBlock(
                                                                    View,
                                                                    {
                                                                      key: i.role.id,
                                                                      class: normalizeClass([
                                                                        "night-item",
                                                                        `night-team-${ue(i.role.team)}`,
                                                                      ]),
                                                                      onClick: (e) =>
                                                                        (function (e, t) {
                                                                          const i = `${e}:${t}`;
                                                                          V.value[i] = !V.value[i];
                                                                        })(t.key, i.role.id),
                                                                    },
                                                                    {
                                                                      default: withCtx(() => [
                                                                        createVNode(
                                                                          View,
                                                                          {
                                                                            class: "night-role-line",
                                                                          },
                                                                          {
                                                                            default: withCtx(() => [
                                                                              createVNode(
                                                                                Image,
                                                                                {
                                                                                  webp: true,
                                                                                  class:
                                                                                    "night-role-icon",
                                                                                  src: me(i.role),
                                                                                  mode: "aspectFit",
                                                                                  onError: (e) =>
                                                                                    (S.value[i.role.id] =
                                                                                      true),
                                                                                },
                                                                                null,
                                                                                8,
                                                                                ["src", "onError"],
                                                                              ),
                                                                              createVNode(
                                                                                Text,
                                                                                {
                                                                                  class:
                                                                                    "night-role-name",
                                                                                },
                                                                                {
                                                                                  default: withCtx(
                                                                                    () => [
                                                                                      createTextVNode(
                                                                                        toDisplayString(
                                                                                          i.role.name,
                                                                                        ),
                                                                                        1,
                                                                                      ),
                                                                                    ],
                                                                                  ),
                                                                                  _: 2,
                                                                                },
                                                                                1024,
                                                                              ),
                                                                            ]),
                                                                            _: 2,
                                                                          },
                                                                          1024,
                                                                        ),
                                                                        i.seats.length
                                                                          ? (openBlock(),
                                                                            createBlock(
                                                                              View,
                                                                              {
                                                                                key: 0,
                                                                                class: "role-seat-list",
                                                                              },
                                                                              {
                                                                                default: withCtx(() => [
                                                                                  (openBlock(true),
                                                                                  createElementBlock(
                                                                                    Fragment,
                                                                                    null,
                                                                                    renderList(
                                                                                      i.seats,
                                                                                      (t) => (
                                                                                        openBlock(),
                                                                                        createBlock(
                                                                                          View,
                                                                                          {
                                                                                            key: t.id,
                                                                                            class:
                                                                                              normalizeClass(
                                                                                                [
                                                                                                  "role-seat-mark",
                                                                                                  {
                                                                                                    "role-seat-mark-dead":
                                                                                                      !t.alive,
                                                                                                  },
                                                                                                ],
                                                                                              ),
                                                                                          },
                                                                                          {
                                                                                            default:
                                                                                              withCtx(
                                                                                                () => [
                                                                                                  props.wakeEnabled
                                                                                                    ? (openBlock(),
                                                                                                      createBlock(
                                                                                                        Button,
                                                                                                        {
                                                                                                          key: 0,
                                                                                                          class:
                                                                                                            "role-seat-button",
                                                                                                          "aria-label": `唤醒${ce(t.id)}号座位`,
                                                                                                          onClick:
                                                                                                            withModifiers(
                                                                                                              (
                                                                                                                e,
                                                                                                              ) =>
                                                                                                                n(
                                                                                                                  "wake",
                                                                                                                  t.id,
                                                                                                                ),
                                                                                                              [
                                                                                                                "stop",
                                                                                                              ],
                                                                                                            ),
                                                                                                        },
                                                                                                        {
                                                                                                          default:
                                                                                                            withCtx(
                                                                                                              () => [
                                                                                                                createTextVNode(
                                                                                                                  toDisplayString(
                                                                                                                    ce(
                                                                                                                      t.id,
                                                                                                                    ),
                                                                                                                  ),
                                                                                                                  1,
                                                                                                                ),
                                                                                                              ],
                                                                                                            ),
                                                                                                          _: 2,
                                                                                                        },
                                                                                                        1032,
                                                                                                        [
                                                                                                          "aria-label",
                                                                                                          "onClick",
                                                                                                        ],
                                                                                                      ))
                                                                                                    : (openBlock(),
                                                                                                      createBlock(
                                                                                                        Text,
                                                                                                        {
                                                                                                          key: 1,
                                                                                                          class:
                                                                                                            "role-seat-button",
                                                                                                          "aria-label": `${ce(t.id)}号座位`,
                                                                                                        },
                                                                                                        {
                                                                                                          default:
                                                                                                            withCtx(
                                                                                                              () => [
                                                                                                                createTextVNode(
                                                                                                                  toDisplayString(
                                                                                                                    ce(
                                                                                                                      t.id,
                                                                                                                    ),
                                                                                                                  ),
                                                                                                                  1,
                                                                                                                ),
                                                                                                              ],
                                                                                                            ),
                                                                                                          _: 2,
                                                                                                        },
                                                                                                        1032,
                                                                                                        [
                                                                                                          "aria-label",
                                                                                                        ],
                                                                                                      )),
                                                                                                ],
                                                                                              ),
                                                                                            _: 2,
                                                                                          },
                                                                                          1032,
                                                                                          ["class"],
                                                                                        )
                                                                                      ),
                                                                                    ),
                                                                                    128,
                                                                                  )),
                                                                                ]),
                                                                                _: 2,
                                                                              },
                                                                              1024,
                                                                            ))
                                                                          : createCommentVNode("", true),
                                                                        V.value[`${t.key}:${i.role.id}`]
                                                                          ? (openBlock(),
                                                                            createBlock(
                                                                              View,
                                                                              {
                                                                                key: 1,
                                                                                class: "role-reminder",
                                                                              },
                                                                              {
                                                                                default: withCtx(() => [
                                                                                  createTextVNode(
                                                                                    toDisplayString(
                                                                                      i.reminder ||
                                                                                        i.role.ability ||
                                                                                        "该角色暂无行动提示",
                                                                                    ),
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
                                                                    ["class", "onClick"],
                                                                  )
                                                                ),
                                                              ),
                                                              128,
                                                            )),
                                                            t.rows.length
                                                              ? createCommentVNode("", true)
                                                              : (openBlock(),
                                                                createBlock(
                                                                  View,
                                                                  {
                                                                    key: 0,
                                                                    class: "reference-empty",
                                                                  },
                                                                  {
                                                                    default: withCtx(() => [
                                                                      createTextVNode("暂无行动角色"),
                                                                    ]),
                                                                    _: 1,
                                                                  },
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
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                    )),
                              ]),
                              _: 1,
                            },
                            8,
                            ["scroll-y"],
                          ),
                          q.value
                            ? (openBlock(),
                              createBlock(
                                View,
                                {
                                  key: 1,
                                  class: normalizeClass([
                                    "role-trash-zone",
                                    {
                                      "role-trash-zone-active": H.value,
                                    },
                                  ]),
                                },
                                {
                                  default: withCtx(() => [
                                    createVNode(
                                      Text,
                                      {
                                        class: "role-trash-icon",
                                      },
                                      {
                                        default: withCtx(() => [createTextVNode("⌫")]),
                                        _: 1,
                                      },
                                    ),
                                    createVNode(Text, null, {
                                      default: withCtx(() => [
                                        createTextVNode(
                                          toDisplayString(
                                            H.value ? "松开以移除角色" : "拖到这里删除角色",
                                          ),
                                          1,
                                        ),
                                      ]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ["class"],
                              ))
                            : createCommentVNode("", true),
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
                            class: "night-settings-backdrop",
                            onClick:
                              renderCache[10] ||
                              (renderCache[10] = withModifiers((e) => (j.value = false), ["stop"])),
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                View,
                                {
                                  class: "night-settings-dialog",
                                  role: "dialog",
                                  "aria-label": "调整邪恶阵营首夜夜序",
                                  "aria-modal": true,
                                  onClick:
                                    renderCache[9] ||
                                    (renderCache[9] = withModifiers(() => {}, ["stop"])),
                                },
                                {
                                  default: withCtx(() => [
                                    createVNode(
                                      View,
                                      {
                                        class: "night-settings-header",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(Text, null, {
                                            default: withCtx(() => [
                                              createTextVNode("调整邪恶阵营首夜夜序"),
                                            ]),
                                            _: 1,
                                          }),
                                          createVNode(
                                            Button,
                                            {
                                              "aria-label": "关闭夜序设置",
                                              onClick:
                                                renderCache[5] ||
                                                (renderCache[5] = (e) => (j.value = false)),
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
                                        class: "night-settings-content",
                                        "scroll-y": "",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(
                                            Text,
                                            {
                                              class: "night-settings-tip",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createTextVNode(
                                                  "爪牙互认与恶魔获取伪装身份的夜序没有统一规范，当前剧本可能与默认值（6、8）不符。你可以在这里修改当前剧本采用的基准夜序。",
                                                ),
                                              ]),
                                              _: 1,
                                            },
                                          ),
                                          F.value
                                            ? (openBlock(),
                                              createBlock(
                                                View,
                                                {
                                                  key: 0,
                                                  class: "night-settings-alert",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createTextVNode(
                                                      "当前剧本已自带首夜夜序（_meta.firstNight），将优先遵循剧本作者指定的顺序，不能在这里修改。",
                                                    ),
                                                  ]),
                                                  _: 1,
                                                },
                                              ))
                                            : createCommentVNode("", true),
                                          (openBlock(),
                                          createElementBlock(
                                            Fragment,
                                            null,
                                            renderList(D, (e) =>
                                              createVNode(
                                                View,
                                                {
                                                  key: e.key,
                                                  class: "night-setting-row",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createVNode(
                                                      Text,
                                                      null,
                                                      {
                                                        default: withCtx(() => [
                                                          createTextVNode(toDisplayString(e.label), 1),
                                                        ]),
                                                        _: 2,
                                                      },
                                                      1024,
                                                    ),
                                                    createVNode(
                                                      Input,
                                                      {
                                                        class: "night-order-input",
                                                        type: "number",
                                                        value: O.value[e.key],
                                                        "aria-label": e.label,
                                                        disabled: F.value,
                                                        onInput: (t) =>
                                                          (O.value[e.key] = t.detail.value),
                                                      },
                                                      null,
                                                      8,
                                                      ["value", "aria-label", "disabled", "onInput"],
                                                    ),
                                                  ]),
                                                  _: 2,
                                                },
                                                1024,
                                              ),
                                            ),
                                            64,
                                          )),
                                          F.value || B.value
                                            ? createCommentVNode("", true)
                                            : (openBlock(),
                                              createBlock(
                                                Text,
                                                {
                                                  key: 1,
                                                  class: "night-settings-error",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createTextVNode("请输入 1–999 之间的整数。"),
                                                  ]),
                                                  _: 1,
                                                },
                                              )),
                                          createVNode(
                                            Text,
                                            {
                                              class: "night-settings-tip",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createTextVNode(
                                                  "确认后会保存到当前本地剧本，再次打开仍会保留。",
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
                                      View,
                                      {
                                        class: "night-settings-actions",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(
                                            Button,
                                            {
                                              disabled: F.value,
                                              onClick:
                                                renderCache[6] || (renderCache[6] = (e) => W(true)),
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("恢复默认")]),
                                              _: 1,
                                            },
                                            8,
                                            ["disabled"],
                                          ),
                                          createVNode(
                                            View,
                                            {
                                              class: "night-settings-action-group",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createVNode(
                                                  Button,
                                                  {
                                                    onClick:
                                                      renderCache[7] ||
                                                      (renderCache[7] = (e) => (j.value = false)),
                                                  },
                                                  {
                                                    default: withCtx(() => [createTextVNode("取消")]),
                                                    _: 1,
                                                  },
                                                ),
                                                createVNode(
                                                  Button,
                                                  {
                                                    class: "night-settings-confirm",
                                                    disabled: !B.value,
                                                    onClick:
                                                      renderCache[8] ||
                                                      (renderCache[8] = (e) => W(false)),
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode("确认保存"),
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
                    q.value
                      ? (openBlock(),
                        createBlock(
                          View,
                          {
                            key: 1,
                            class: normalizeClass([
                              "role-drag-preview",
                              {
                                "role-drag-preview-touch": J.value,
                              },
                            ]),
                            style: normalizeStyle({
                              left: `${K.value.x}px`,
                              top: `${K.value.y}px`,
                            }),
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                Image,
                                {
                                  webp: true,
                                  class: "role-drag-preview-image",
                                  src: me(q.value),
                                  mode: "aspectFit",
                                },
                                null,
                                8,
                                ["src"],
                              ),
                              createVNode(
                                View,
                                {
                                  class: "role-drag-preview-content",
                                },
                                {
                                  default: withCtx(() => [
                                    createVNode(
                                      Text,
                                      {
                                        class: "role-drag-preview-name",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(q.value.name), 1),
                                        ]),
                                        _: 1,
                                      },
                                    ),
                                    createVNode(
                                      Text,
                                      {
                                        class: "role-drag-preview-ability",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(q.value.ability), 1),
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
                          ["class", "style"],
                        ))
                      : createCommentVNode("", true),
                  ]),
                  _: 1,
                },
                8,
                ["style"],
              ))
            : createCommentVNode("", true);
        }
      );
    },
  },
  [["__scopeId", "data-v-49a373ff"]],
);
export { RoleReferencePanel };
