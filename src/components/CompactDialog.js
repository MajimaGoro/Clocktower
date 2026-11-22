// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  UniButton,
  UniScrollView,
  UniText,
  UniView,
  createBlock,
  createCommentVNode,
  createTextVNode,
  createVNode,
  normalizeClass,
  normalizeStyle,
  openBlock,
  renderSlot,
  toDisplayString,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const CompactDialog = withComponentMetadata(
  {
    __name: "CompactDialog",
    props: {
      title: {
        type: String,
        default: "",
      },
      message: {
        type: String,
        default: "",
      },
      confirmText: {
        type: String,
        default: "知道了",
      },
      cancelText: {
        type: String,
        default: "",
      },
      checkLabel: {
        type: String,
        default: "",
      },
      modelValue: {
        type: Boolean,
        default: false,
      },
      scrollable: {
        type: Boolean,
        default: false,
      },
      zIndex: {
        type: Number,
        default: 1100,
      },
    },
    emits: ["close", "confirm", "update:modelValue"],
    setup(props, { emit: emit }) {
      const i = emit;
      return (renderContext, renderCache) => {
        const Text = UniText,
          Button = UniButton,
          View = UniView,
          ScrollView = UniScrollView;
        return (
          openBlock(),
          createBlock(
            View,
            {
              class: "compact-backdrop",
              style: normalizeStyle({
                zIndex: props.zIndex,
              }),
              onClick: renderCache[5] || (renderCache[5] = (e) => i("close")),
            },
            {
              default: withCtx(() => [
                createVNode(
                  View,
                  {
                    class: "compact-dialog sheet-panel",
                    role: "dialog",
                    "aria-label": props.title || "提示",
                    onClick: renderCache[4] || (renderCache[4] = withModifiers(() => {}, ["stop"])),
                  },
                  {
                    default: withCtx(() => [
                      createVNode(
                        View,
                        {
                          class: "compact-header",
                        },
                        {
                          default: withCtx(() => [
                            createVNode(Text, null, {
                              default: withCtx(() => [createTextVNode(toDisplayString(props.title), 1)]),
                              _: 1,
                            }),
                            createVNode(
                              Button,
                              {
                                class: "sheet-close",
                                "aria-label": "关闭",
                                onClick: renderCache[0] || (renderCache[0] = (e) => i("close")),
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
                      props.scrollable
                        ? (openBlock(),
                          createBlock(
                            ScrollView,
                            {
                              key: 0,
                              class: "compact-scroll",
                              "scroll-y": "",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  Text,
                                  {
                                    class: "compact-message",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(props.message), 1),
                                    ]),
                                    _: 1,
                                  },
                                ),
                                renderSlot(renderContext.$slots, "default", {}, void 0, true),
                              ]),
                              _: 3,
                            },
                          ))
                        : (openBlock(),
                          createBlock(
                            View,
                            {
                              key: 1,
                              class: "compact-content",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  Text,
                                  {
                                    class: "compact-message",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(props.message), 1),
                                    ]),
                                    _: 1,
                                  },
                                ),
                                renderSlot(renderContext.$slots, "default", {}, void 0, true),
                              ]),
                              _: 3,
                            },
                          )),
                      props.checkLabel
                        ? (openBlock(),
                          createBlock(
                            Button,
                            {
                              key: 2,
                              class: "compact-check",
                              "aria-pressed": props.modelValue,
                              onClick:
                                renderCache[1] ||
                                (renderCache[1] = (t) => i("update:modelValue", !props.modelValue)),
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  Text,
                                  {
                                    class: normalizeClass([
                                      "compact-check-box",
                                      {
                                        checked: props.modelValue,
                                      },
                                    ]),
                                  },
                                  {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(props.modelValue ? "✓" : ""), 1),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ["class"],
                                ),
                                createTextVNode(toDisplayString(props.checkLabel), 1),
                              ]),
                              _: 1,
                            },
                            8,
                            ["aria-pressed"],
                          ))
                        : createCommentVNode("", true),
                      createVNode(
                        View,
                        {
                          class: "compact-actions",
                        },
                        {
                          default: withCtx(() => [
                            props.cancelText
                              ? (openBlock(),
                                createBlock(
                                  Button,
                                  {
                                    key: 0,
                                    class: "compact-cancel",
                                    onClick: renderCache[2] || (renderCache[2] = (e) => i("close")),
                                  },
                                  {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(props.cancelText), 1),
                                    ]),
                                    _: 1,
                                  },
                                ))
                              : createCommentVNode("", true),
                            createVNode(
                              Button,
                              {
                                class: "compact-confirm gold-button",
                                onClick: renderCache[3] || (renderCache[3] = (e) => i("confirm")),
                              },
                              {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(props.confirmText), 1),
                                ]),
                                _: 1,
                              },
                            ),
                          ]),
                          _: 1,
                        },
                      ),
                    ]),
                    _: 3,
                  },
                  8,
                  ["aria-label"],
                ),
              ]),
              _: 3,
            },
            8,
            ["style"],
          )
        );
      };
    },
  },
  [["__scopeId", "data-v-0e8389dc"]],
);
export { CompactDialog };
