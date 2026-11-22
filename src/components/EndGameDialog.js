// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  UniButton,
  UniText,
  UniView,
  createBlock,
  createTextVNode,
  createVNode,
  onBeforeUnmount,
  onMounted,
  openBlock,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const EndGameDialog = withComponentMetadata(
  {
    __name: "EndGameDialog",
    emits: ["confirm", "close"],
    setup(props, { emit: emit }) {
      const i = emit;
      function a(e) {
        "Escape" === e.key && i("close");
      }
      return (
        onMounted(() => {
          window.addEventListener("keydown", a);
        }),
        onBeforeUnmount(() => {
          window.removeEventListener("keydown", a);
        }),
        (renderContext, renderCache) => {
          const Text = UniText,
            Button = UniButton,
            View = UniView;
          return (
            openBlock(),
            createBlock(
              View,
              {
                class: "end-game-dialog",
                onClick: renderCache[5] || (renderCache[5] = (e) => i("close")),
              },
              {
                default: withCtx(() => [
                  createVNode(
                    View,
                    {
                      class: "end-review-dialog",
                      role: "dialog",
                      "aria-label": "进入复盘模式",
                      onClick: renderCache[4] || (renderCache[4] = withModifiers(() => {}, ["stop"])),
                    },
                    {
                      default: withCtx(() => [
                        createVNode(
                          View,
                          {
                            class: "end-review-heading",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(Text, null, {
                                default: withCtx(() => [createTextVNode("进入复盘模式")]),
                                _: 1,
                              }),
                              createVNode(
                                Button,
                                {
                                  class: "review-close",
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
                        createVNode(
                          Text,
                          {
                            class: "end-review-message",
                          },
                          {
                            default: withCtx(() => [createTextVNode("请选择本局获胜阵营。")]),
                            _: 1,
                          },
                        ),
                        createVNode(
                          View,
                          {
                            class: "end-review-actions",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                Button,
                                {
                                  class: "review-winner-evil",
                                  onClick:
                                    renderCache[1] || (renderCache[1] = (e) => i("confirm", "evil")),
                                },
                                {
                                  default: withCtx(() => [createTextVNode("邪恶获胜")]),
                                  _: 1,
                                },
                              ),
                              createVNode(
                                Button,
                                {
                                  class: "review-winner-good",
                                  onClick:
                                    renderCache[2] || (renderCache[2] = (e) => i("confirm", "good")),
                                },
                                {
                                  default: withCtx(() => [createTextVNode("善良获胜")]),
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
                            class: "review-cancel",
                            onClick: renderCache[3] || (renderCache[3] = (e) => i("close")),
                          },
                          {
                            default: withCtx(() => [createTextVNode("取消")]),
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
        }
      );
    },
  },
  [["__scopeId", "data-v-e363c1a7"]],
);
export { EndGameDialog };
