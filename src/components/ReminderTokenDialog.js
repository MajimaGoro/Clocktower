// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { ReminderToken } from "./ReminderToken.js";
import { isCustomReminder } from "../domain/reminders.js";
import {
  UniButton,
  UniText,
  UniTextarea,
  UniView,
  computed,
  createBlock,
  createCommentVNode,
  createTextVNode,
  createVNode,
  onBeforeUnmount,
  onMounted,
  openBlock,
  toDisplayString,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const ReminderTokenDialog = withComponentMetadata(
  {
    __name: "ReminderTokenDialog",
    props: {
      token: {
        type: Object,
        required: true,
      },
      draftText: {
        type: String,
        default: "",
      },
    },
    emits: ["update:draftText", "save", "flip", "delete", "close"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit,
        l = computed(() => isCustomReminder(i.token));
      function n(e) {
        "Escape" === e.key && a("close");
      }
      return (
        onMounted(() => {
          window.addEventListener("keydown", n);
        }),
        onBeforeUnmount(() => {
          window.removeEventListener("keydown", n);
        }),
        (renderContext, renderCache) => {
          const Text = UniText,
            Button = UniButton,
            View = UniView,
            Textarea = UniTextarea;
          return (
            openBlock(),
            createBlock(
              View,
              {
                class: "token-dialog-backdrop",
                onClick: renderCache[6] || (renderCache[6] = (e) => a("close")),
              },
              {
                default: withCtx(() => [
                  createVNode(
                    View,
                    {
                      class: "token-dialog",
                      role: "dialog",
                      "aria-label": l.value ? "编辑自定义标记" : "提醒标记",
                      onClick: renderCache[5] || (renderCache[5] = withModifiers(() => {}, ["stop"])),
                    },
                    {
                      default: withCtx(() => [
                        createVNode(
                          View,
                          {
                            class: "token-dialog-header",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(Text, null, {
                                default: withCtx(() => [
                                  createTextVNode(
                                    toDisplayString(l.value ? "编辑自定义标记" : "提醒标记"),
                                    1,
                                  ),
                                ]),
                                _: 1,
                              }),
                              createVNode(
                                Button,
                                {
                                  class: "token-dialog-close",
                                  "aria-label": "关闭",
                                  onClick: renderCache[0] || (renderCache[0] = (e) => a("close")),
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
                          View,
                          {
                            class: "token-dialog-content",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                ReminderToken,
                                {
                                  token: props.token,
                                  size: 46,
                                },
                                null,
                                8,
                                ["token"],
                              ),
                              l.value
                                ? (openBlock(),
                                  createBlock(
                                    Textarea,
                                    {
                                      key: 0,
                                      class: "token-dialog-input",
                                      value: props.draftText,
                                      maxlength: "80",
                                      "auto-height": "",
                                      placeholder: "标记文字",
                                      "aria-label": "标记文字",
                                      onInput:
                                        renderCache[1] ||
                                        (renderCache[1] = (e) => a("update:draftText", e.detail.value)),
                                    },
                                    null,
                                    8,
                                    ["value"],
                                  ))
                                : (openBlock(),
                                  createBlock(
                                    Text,
                                    {
                                      key: 1,
                                      class: "token-dialog-label",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createTextVNode(
                                          toDisplayString(props.token.label || props.token.text),
                                          1,
                                        ),
                                      ]),
                                      _: 1,
                                    },
                                  )),
                            ]),
                            _: 1,
                          },
                        ),
                        createVNode(
                          View,
                          {
                            class: "token-dialog-actions",
                          },
                          {
                            default: withCtx(() => [
                              l.value
                                ? (openBlock(),
                                  createBlock(
                                    Button,
                                    {
                                      key: 0,
                                      class: "token-dialog-action token-dialog-save",
                                      onClick: renderCache[2] || (renderCache[2] = (e) => a("save")),
                                    },
                                    {
                                      default: withCtx(() => [createTextVNode("保存文字")]),
                                      _: 1,
                                    },
                                  ))
                                : createCommentVNode("", true),
                              createVNode(
                                Button,
                                {
                                  class: "token-dialog-action token-dialog-flip",
                                  onClick: renderCache[3] || (renderCache[3] = (e) => a("flip")),
                                },
                                {
                                  default: withCtx(() => [
                                    createTextVNode(
                                      toDisplayString(props.token.inverted ? "恢复正面" : "翻转标记"),
                                      1,
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ),
                              createVNode(
                                Button,
                                {
                                  class: "token-dialog-action token-dialog-delete",
                                  onClick: renderCache[4] || (renderCache[4] = (e) => a("delete")),
                                },
                                {
                                  default: withCtx(() => [createTextVNode("删除")]),
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
                    ["aria-label"],
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
  [["__scopeId", "data-v-5458083a"]],
);
export { ReminderTokenDialog };
