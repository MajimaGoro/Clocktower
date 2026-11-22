// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { RolePortrait } from "./RolePortrait.js";
import {
  Fragment,
  UniButton,
  UniImage,
  UniInput,
  UniScrollView,
  UniText,
  UniTextarea,
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
  toDisplayString,
  watch,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const FabledDrawer = withComponentMetadata(
  {
    __name: "FabledDrawer",
    props: {
      roles: {
        type: Array,
        default: () => [],
      },
      availableRoles: {
        type: Array,
        default: () => [],
      },
      playerView: {
        type: Boolean,
        default: false,
      },
      concealed: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["add", "remove"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit,
        l = ref(false),
        n = ref(""),
        y = ref(""),
        E = ref(""),
        A = ref(""),
        S = ref(null),
        z = computed(() =>
          i.availableRoles.filter((e) =>
            `${e.name} ${e.id}`.toLowerCase().includes(y.value.trim().toLowerCase()),
          ),
        ),
        V = computed(() => {
          var e;
          return "picker" === n.value
            ? "添加传奇角色"
            : "custom" === n.value
              ? "自定义传奇规则"
              : (null == (e = S.value) ? void 0 : e.name) || "传奇角色";
        });
      function L() {
        n.value = "";
        S.value = null;
        A.value = "";
      }
      function j() {
        i.playerView || ((y.value = ""), (n.value = "picker"));
      }
      function O(e) {
        i.playerView || (a("add", e), L());
      }
      function D() {
        if (!i.playerView)
          try {
            O(
              (function (e) {
                const t = "string" == typeof e ? e.trim() : "";
                if (!t) throw new Error("请输入自定义规则");
                if (Array.from(t).length > 1e3) throw new Error("自定义规则最多1000字");
                return {
                  id: "custom-fabled",
                  name: "自定义私货",
                  team: "fabled",
                  image: "/static/roles/bootlegger.webp",
                  ability: t,
                  custom: true,
                };
              })(E.value),
            );
          } catch (e) {
            A.value = e.message;
          }
      }
      function F() {
        !i.playerView && S.value && (a("remove", S.value.instanceId), L());
      }
      function B(e) {
        "Escape" === e.key && (n.value ? L() : (l.value = false));
      }
      return (
        watch(() => i.playerView, L),
        watch(
          () => i.concealed,
          (e) => {
            e && (L(), (l.value = false));
          },
        ),
        watch(
          () => i.roles,
          (e) => {
            S.value && !e.some((e) => e.instanceId === S.value.instanceId) && L();
          },
        ),
        onMounted(() => {
          window.addEventListener("keydown", B);
        }),
        onBeforeUnmount(() => {
          window.removeEventListener("keydown", B);
        }),
        (renderContext, renderCache) => {
          const Text = UniText,
            Image = UniImage,
            Button = UniButton,
            View = UniView,
            ScrollView = UniScrollView,
            Input = UniInput,
            Textarea = UniTextarea;
          return props.concealed
            ? createCommentVNode("", true)
            : (openBlock(),
              createElementBlock(
                Fragment,
                {
                  key: 0,
                },
                [
                  createVNode(
                    View,
                    {
                      class: "fabled-dock",
                    },
                    {
                      default: withCtx(() => [
                        createVNode(
                          Button,
                          {
                            class: "fabled-toggle",
                            "aria-label": "传奇",
                            "aria-expanded": l.value,
                            onClick: renderCache[0] || (renderCache[0] = (e) => (l.value = !l.value)),
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                Text,
                                {
                                  "aria-hidden": "true",
                                },
                                {
                                  default: withCtx(() => [createTextVNode("✧")]),
                                  _: 1,
                                },
                              ),
                              createVNode(Text, null, {
                                default: withCtx(() => [createTextVNode("传奇")]),
                                _: 1,
                              }),
                              createVNode(
                                Image,
                                {
                                  webp: true,
                                  class: normalizeClass([
                                    "fabled-chevron",
                                    {
                                      "is-open": l.value,
                                    },
                                  ]),
                                  src: "/minibotc/static/ui/chevron-down.svg",
                                  mode: "aspectFit",
                                  "aria-hidden": "true",
                                },
                                null,
                                8,
                                ["class"],
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["aria-expanded"],
                        ),
                        l.value
                          ? (openBlock(),
                            createBlock(
                              View,
                              {
                                key: 0,
                                class: normalizeClass([
                                  "fabled-drawer",
                                  {
                                    "fabled-readonly": props.playerView,
                                  },
                                ]),
                              },
                              {
                                default: withCtx(() => [
                                  props.roles.length
                                    ? (openBlock(),
                                      createBlock(
                                        ScrollView,
                                        {
                                          key: 0,
                                          class: "fabled-selected-scroll",
                                          "scroll-x": "",
                                          "show-scrollbar": true,
                                          style: normalizeStyle({
                                            width: `${Math.min(64 * props.roles.length, 320)}px`,
                                          }),
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              View,
                                              {
                                                class: "fabled-selected-list",
                                              },
                                              {
                                                default: withCtx(() => [
                                                  (openBlock(true),
                                                  createElementBlock(
                                                    Fragment,
                                                    null,
                                                    renderList(
                                                      props.roles,
                                                      (e) => (
                                                        openBlock(),
                                                        createBlock(
                                                          Button,
                                                          {
                                                            key: e.instanceId,
                                                            class: "fabled-token",
                                                            "data-instance-id": e.instanceId,
                                                            "aria-label": e.name,
                                                            onClick: (t) =>
                                                              (function (e) {
                                                                S.value = e;
                                                                n.value = i.playerView
                                                                  ? "info"
                                                                  : "action";
                                                              })(e),
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createVNode(
                                                                RolePortrait,
                                                                {
                                                                  role: e,
                                                                  size: 44,
                                                                },
                                                                null,
                                                                8,
                                                                ["role"],
                                                              ),
                                                              createVNode(
                                                                Text,
                                                                {
                                                                  class: "fabled-token-name",
                                                                },
                                                                {
                                                                  default: withCtx(() => [
                                                                    createTextVNode(
                                                                      toDisplayString(e.name),
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
                                                          ["data-instance-id", "aria-label", "onClick"],
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
                                        8,
                                        ["style"],
                                      ))
                                    : createCommentVNode("", true),
                                  props.playerView
                                    ? props.roles.length
                                      ? createCommentVNode("", true)
                                      : (openBlock(),
                                        createBlock(
                                          Text,
                                          {
                                            key: 2,
                                            class: "fabled-empty",
                                          },
                                          {
                                            default: withCtx(() => [createTextVNode("暂无传奇角色")]),
                                            _: 1,
                                          },
                                        ))
                                    : (openBlock(),
                                      createBlock(
                                        Button,
                                        {
                                          key: 1,
                                          class: "fabled-add",
                                          "aria-label": "添加传奇角色",
                                          onClick: j,
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("＋")]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 1,
                                        },
                                      )),
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
                  n.value
                    ? (openBlock(),
                      createBlock(
                        View,
                        {
                          key: 0,
                          class: "fabled-backdrop",
                          onClick: L,
                        },
                        {
                          default: withCtx(() => [
                            createVNode(
                              View,
                              {
                                class: normalizeClass([
                                  "fabled-panel",
                                  {
                                    "fabled-picker": "picker" === n.value,
                                    "fabled-action-dialog": "action" === n.value,
                                    "fabled-info": "info" === n.value,
                                    "fabled-custom-dialog": "custom" === n.value,
                                    "fabled-small": "picker" !== n.value,
                                  },
                                ]),
                                role: "dialog",
                                "aria-label": V.value,
                                onClick:
                                  renderCache[5] || (renderCache[5] = withModifiers(() => {}, ["stop"])),
                              },
                              {
                                default: withCtx(() => [
                                  createVNode(
                                    View,
                                    {
                                      class: "fabled-header",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(Text, null, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(V.value), 1),
                                          ]),
                                          _: 1,
                                        }),
                                        createVNode(
                                          Button,
                                          {
                                            class: "fabled-close",
                                            "aria-label": "关闭",
                                            onClick: L,
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
                                  "picker" === n.value
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
                                              class: "fabled-picker-tools",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createVNode(
                                                  Input,
                                                  {
                                                    modelValue: y.value,
                                                    "onUpdate:modelValue":
                                                      renderCache[1] ||
                                                      (renderCache[1] = (e) => (y.value = e)),
                                                    class: "fabled-search",
                                                    placeholder: "搜索传奇角色",
                                                  },
                                                  null,
                                                  8,
                                                  ["modelValue"],
                                                ),
                                                createVNode(
                                                  Button,
                                                  {
                                                    class: "fabled-custom-open",
                                                    onClick:
                                                      renderCache[2] ||
                                                      (renderCache[2] = (e) => {
                                                        E.value = "";
                                                        A.value = "";
                                                        n.value = "custom";
                                                      }),
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode("自定义私货"),
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
                                              class: "fabled-picker-scroll",
                                              "scroll-y": "",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createVNode(
                                                  View,
                                                  {
                                                    class: "fabled-choices",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      (openBlock(true),
                                                      createElementBlock(
                                                        Fragment,
                                                        null,
                                                        renderList(
                                                          z.value,
                                                          (e) => (
                                                            openBlock(),
                                                            createBlock(
                                                              Button,
                                                              {
                                                                key: e.id,
                                                                class: "fabled-choice",
                                                                "data-role-id": e.id,
                                                                onClick: (t) => O(e),
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  createVNode(
                                                                    RolePortrait,
                                                                    {
                                                                      role: e,
                                                                      size: 50,
                                                                    },
                                                                    null,
                                                                    8,
                                                                    ["role"],
                                                                  ),
                                                                  createVNode(
                                                                    View,
                                                                    {
                                                                      class: "fabled-choice-copy",
                                                                    },
                                                                    {
                                                                      default: withCtx(() => [
                                                                        createVNode(
                                                                          Text,
                                                                          {
                                                                            class: "fabled-name",
                                                                          },
                                                                          {
                                                                            default: withCtx(() => [
                                                                              createTextVNode(
                                                                                toDisplayString(e.name),
                                                                                1,
                                                                              ),
                                                                            ]),
                                                                            _: 2,
                                                                          },
                                                                          1024,
                                                                        ),
                                                                        createVNode(
                                                                          Text,
                                                                          {
                                                                            class: "fabled-ability",
                                                                          },
                                                                          {
                                                                            default: withCtx(() => [
                                                                              createTextVNode(
                                                                                toDisplayString(
                                                                                  e.ability ||
                                                                                    "暂无说明",
                                                                                ),
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
                                                                    1024,
                                                                  ),
                                                                ]),
                                                                _: 2,
                                                              },
                                                              1032,
                                                              ["data-role-id", "onClick"],
                                                            )
                                                          ),
                                                        ),
                                                        128,
                                                      )),
                                                      z.value.length
                                                        ? createCommentVNode("", true)
                                                        : (openBlock(),
                                                          createBlock(
                                                            Text,
                                                            {
                                                              key: 0,
                                                              class: "fabled-empty",
                                                            },
                                                            {
                                                              default: withCtx(() => [
                                                                createTextVNode("没有匹配的传奇角色"),
                                                              ]),
                                                              _: 1,
                                                            },
                                                          )),
                                                    ]),
                                                    _: 1,
                                                  },
                                                ),
                                              ]),
                                              _: 1,
                                            },
                                          ),
                                        ],
                                        64,
                                      ))
                                    : "custom" === n.value
                                      ? (openBlock(),
                                        createElementBlock(
                                          Fragment,
                                          {
                                            key: 1,
                                          },
                                          [
                                            createVNode(
                                              Textarea,
                                              {
                                                modelValue: E.value,
                                                "onUpdate:modelValue":
                                                  renderCache[3] ||
                                                  (renderCache[3] = (e) => (E.value = e)),
                                                class: "fabled-custom-input",
                                                maxlength: "1000",
                                                placeholder: "请输入自定义规则",
                                              },
                                              null,
                                              8,
                                              ["modelValue"],
                                            ),
                                            A.value
                                              ? (openBlock(),
                                                createBlock(
                                                  Text,
                                                  {
                                                    key: 0,
                                                    class: "fabled-error",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(A.value), 1),
                                                    ]),
                                                    _: 1,
                                                  },
                                                ))
                                              : createCommentVNode("", true),
                                            createVNode(
                                              Button,
                                              {
                                                class: "fabled-primary fabled-custom-save",
                                                disabled: !E.value.trim(),
                                                onClick: D,
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("添加私货")]),
                                                _: 1,
                                              },
                                              8,
                                              ["disabled"],
                                            ),
                                          ],
                                          64,
                                        ))
                                      : "action" === n.value && S.value
                                        ? (openBlock(),
                                          createElementBlock(
                                            Fragment,
                                            {
                                              key: 2,
                                            },
                                            [
                                              createVNode(
                                                View,
                                                {
                                                  class: "fabled-selected-preview",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createVNode(
                                                      RolePortrait,
                                                      {
                                                        role: S.value,
                                                        size: 56,
                                                      },
                                                      null,
                                                      8,
                                                      ["role"],
                                                    ),
                                                    createVNode(Text, null, {
                                                      default: withCtx(() => [
                                                        createTextVNode(
                                                          toDisplayString(S.value.name),
                                                          1,
                                                        ),
                                                      ]),
                                                      _: 1,
                                                    }),
                                                  ]),
                                                  _: 1,
                                                },
                                              ),
                                              createVNode(
                                                View,
                                                {
                                                  class: "fabled-actions",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createVNode(
                                                      Button,
                                                      {
                                                        class: "fabled-primary fabled-show",
                                                        onClick:
                                                          renderCache[4] ||
                                                          (renderCache[4] = (e) => (n.value = "info")),
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createTextVNode("展示说明"),
                                                        ]),
                                                        _: 1,
                                                      },
                                                    ),
                                                    props.playerView
                                                      ? createCommentVNode("", true)
                                                      : (openBlock(),
                                                        createBlock(
                                                          Button,
                                                          {
                                                            key: 0,
                                                            class: "fabled-delete",
                                                            onClick: F,
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createTextVNode("删除"),
                                                            ]),
                                                            _: 1,
                                                          },
                                                        )),
                                                  ]),
                                                  _: 1,
                                                },
                                              ),
                                            ],
                                            64,
                                          ))
                                        : "info" === n.value && S.value
                                          ? (openBlock(),
                                            createElementBlock(
                                              Fragment,
                                              {
                                                key: 3,
                                              },
                                              [
                                                createVNode(
                                                  ScrollView,
                                                  {
                                                    class: "fabled-info-scroll",
                                                    "scroll-y": "",
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createVNode(
                                                        Text,
                                                        {
                                                          class: "fabled-ability",
                                                        },
                                                        {
                                                          default: withCtx(() => [
                                                            createTextVNode(
                                                              toDisplayString(
                                                                S.value.ability || "暂无说明",
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
                                                    class: "fabled-primary",
                                                    onClick: L,
                                                  },
                                                  {
                                                    default: withCtx(() => [createTextVNode("关闭")]),
                                                    _: 1,
                                                  },
                                                ),
                                              ],
                                              64,
                                            ))
                                          : createCommentVNode("", true),
                                ]),
                                _: 1,
                              },
                              8,
                              ["class", "aria-label"],
                            ),
                          ]),
                          _: 1,
                        },
                      ))
                    : createCommentVNode("", true),
                ],
                64,
              ));
        }
      );
    },
  },
  [["__scopeId", "data-v-94b64979"]],
);
export { FabledDrawer };
