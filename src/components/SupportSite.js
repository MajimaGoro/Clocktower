// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  Fragment,
  UniButton,
  UniImage,
  UniScrollView,
  UniText,
  UniView,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createTextVNode,
  createVNode,
  onBeforeUnmount,
  onMounted,
  openBlock,
  ref,
  unref,
  watch,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const SupportSite = withComponentMetadata(
  {
    __name: "SupportSite",
    props: {
      concealed: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["open"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit,
        l = ref(false);
      function n() {
        l.value = true;
        a("open");
      }
      function c() {
        l.value = false;
      }
      function f(e) {
        "Escape" === e.key && c();
      }
      return (
        watch(
          () => i.concealed,
          (e) => {
            e && c();
          },
        ),
        onMounted(() => {
          window.addEventListener("keydown", f);
        }),
        onBeforeUnmount(() => {
          window.removeEventListener("keydown", f);
        }),
        (renderContext, renderCache) => {
          const View = UniView,
            Text = UniText,
            Button = UniButton,
            Image = UniImage,
            ScrollView = UniScrollView;
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
                    Button,
                    {
                      class: "support-toggle",
                      "aria-label": "支持本站",
                      "aria-expanded": l.value,
                      "aria-haspopup": "dialog",
                      onClick: n,
                    },
                    {
                      default: withCtx(() => [
                        createVNode(View, {
                          class: "support-dot",
                          "aria-hidden": "true",
                        }),
                        createVNode(Text, null, {
                          default: withCtx(() => [createTextVNode("支持本站")]),
                          _: 1,
                        }),
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
                          class: "support-backdrop",
                          onClick: c,
                          onTouchmove:
                            renderCache[2] ||
                            (renderCache[2] = withModifiers(() => {}, ["stop", "prevent"])),
                        },
                        {
                          default: withCtx(() => [
                            createVNode(
                              View,
                              {
                                class: "support-panel",
                                role: "dialog",
                                "aria-modal": "true",
                                "aria-label": "支持本站",
                                onClick:
                                  renderCache[0] || (renderCache[0] = withModifiers(() => {}, ["stop"])),
                                onTouchmove:
                                  renderCache[1] || (renderCache[1] = withModifiers(() => {}, ["stop"])),
                              },
                              {
                                default: withCtx(() => [
                                  createVNode(
                                    View,
                                    {
                                      class: "support-header",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(Text, null, {
                                          default: withCtx(() => [createTextVNode("支持本站")]),
                                          _: 1,
                                        }),
                                        createVNode(
                                          Button,
                                          {
                                            class: "support-close",
                                            "aria-label": "关闭支持本站",
                                            onClick: c,
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
                                      class: "support-body",
                                      "scroll-y": "",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(
                                          View,
                                          {
                                            class: "support-content",
                                          },
                                          {
                                            default: withCtx(() => [
                                              createVNode(
                                                View,
                                                {
                                                  class: "support-donation",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createVNode(
                                                      Text,
                                                      {
                                                        class: "support-intro",
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createTextVNode(
                                                            "微信扫码支持，感谢你的心意。",
                                                          ),
                                                        ]),
                                                        _: 1,
                                                      },
                                                    ),
                                                    createVNode(
                                                      View,
                                                      {
                                                        class: "support-qr-frame",
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createVNode(
                                                            Image,
                                                            {
                                                              webp: true,
                                                              class: "support-code",
                                                              src: unref(
                                                                "/minibotc/assets/weixin-oTbPJk-8.jpg",
                                                              ),
                                                              mode: "aspectFit",
                                                              "aria-label": "微信收款码",
                                                            },
                                                            null,
                                                            8,
                                                            ["src"],
                                                          ),
                                                        ]),
                                                        _: 1,
                                                      },
                                                    ),
                                                    createVNode(
                                                      Text,
                                                      {
                                                        class: "support-caption",
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createTextVNode("微信收款码"),
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
                                                  class: "support-feedback",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createVNode(
                                                      Text,
                                                      {
                                                        class: "support-feedback-text",
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createTextVNode(
                                                            "有任何建议，都可以加我微信反馈。",
                                                          ),
                                                        ]),
                                                        _: 1,
                                                      },
                                                    ),
                                                    createVNode(
                                                      Text,
                                                      {
                                                        class: "support-feedback-text support-contact",
                                                        selectable: "",
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createTextVNode("微信：emerdsword"),
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
              ));
        }
      );
    },
  },
  [["__scopeId", "data-v-7c188aaa"]],
);
export { SupportSite };
