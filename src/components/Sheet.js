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
  openBlock,
  renderSlot,
  toDisplayString,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const Sheet = withComponentMetadata(
  {
    __name: "Sheet",
    props: {
      title: {
        type: String,
        default: "",
      },
      subtitle: {
        type: String,
        default: "",
      },
      wide: {
        type: Boolean,
        default: false,
      },
      compact: {
        type: Boolean,
        default: false,
      },
      appearance: {
        type: String,
        default: "default",
      },
    },
    emits: ["close"],
    setup(props, { emit: emit }) {
      const i = emit;
      return (renderContext, renderCache) => {
        const Text = UniText,
          View = UniView,
          Button = UniButton,
          ScrollView = UniScrollView;
        return (
          openBlock(),
          createBlock(
            View,
            {
              class: "sheet-backdrop",
              onClick: renderCache[3] || (renderCache[3] = (e) => i("close")),
            },
            {
              default: withCtx(() => [
                createVNode(
                  View,
                  {
                    class: normalizeClass([
                      "sheet-panel",
                      {
                        "sheet-panel-wide": props.wide,
                        "sheet-panel-compact": props.compact,
                        "sheet-panel-paper": "paper" === props.appearance,
                      },
                    ]),
                    onClick: renderCache[2] || (renderCache[2] = withModifiers(() => {}, ["stop"])),
                  },
                  {
                    default: withCtx(() => [
                      props.title || props.subtitle
                        ? (openBlock(),
                          createBlock(
                            View,
                            {
                              key: 0,
                              class: "sheet-header",
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  View,
                                  {
                                    class: "sheet-heading",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        Text,
                                        {
                                          class: "sheet-title",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(props.title), 1),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      props.subtitle
                                        ? (openBlock(),
                                          createBlock(
                                            Text,
                                            {
                                              key: 0,
                                              class: "sheet-subtitle",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createTextVNode(toDisplayString(props.subtitle), 1),
                                              ]),
                                              _: 1,
                                            },
                                          ))
                                        : createCommentVNode("", true),
                                    ]),
                                    _: 1,
                                  },
                                ),
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
                          ))
                        : (openBlock(),
                          createBlock(
                            Button,
                            {
                              key: 1,
                              class: "sheet-close sheet-close-floating",
                              "aria-label": "关闭",
                              onClick: renderCache[1] || (renderCache[1] = (e) => i("close")),
                            },
                            {
                              default: withCtx(() => [createTextVNode("×")]),
                              _: 1,
                            },
                          )),
                      createVNode(
                        ScrollView,
                        {
                          class: "sheet-body",
                          "scroll-y": "",
                        },
                        {
                          default: withCtx(() => [
                            createVNode(
                              View,
                              {
                                class: "sheet-content",
                              },
                              {
                                default: withCtx(() => [
                                  renderSlot(renderContext.$slots, "default", {}, void 0, true),
                                ]),
                                _: 3,
                              },
                            ),
                          ]),
                          _: 3,
                        },
                      ),
                      renderContext.$slots.footer
                        ? (openBlock(),
                          createBlock(
                            View,
                            {
                              key: 2,
                              class: "sheet-footer",
                            },
                            {
                              default: withCtx(() => [
                                renderSlot(renderContext.$slots, "footer", {}, void 0, true),
                              ]),
                              _: 3,
                            },
                          ))
                        : createCommentVNode("", true),
                    ]),
                    _: 3,
                  },
                  8,
                  ["class"],
                ),
              ]),
              _: 3,
            },
          )
        );
      };
    },
  },
  [["__scopeId", "data-v-5cc07f67"]],
);
export { Sheet };
