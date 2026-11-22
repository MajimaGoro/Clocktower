// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  Fragment,
  UniButton,
  UniInput,
  UniText,
  UniView,
  computed,
  createElementBlock,
  createTextVNode,
  createVNode,
  normalizeStyle,
  onBeforeUnmount,
  onMounted,
  openBlock,
  toDisplayString,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const SeatNicknamePopover = withComponentMetadata(
  {
    __name: "SeatNicknamePopover",
    props: {
      modelValue: {
        type: String,
        default: "",
      },
      seatNumber: Number,
      anchor: {
        type: Object,
        required: true,
      },
      viewport: {
        type: Object,
        required: true,
      },
    },
    emits: ["update:modelValue", "save", "clear", "close"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit,
        l = computed(() => {
          const { anchor: e, viewport: t } = i,
            a = Math.min(196, t.width - 16),
            l = e.right + 6,
            n = e.left - 6 - a;
          let r = l + a <= t.width - 8 ? l : n >= 8 ? n : e.left + (e.right - e.left - a) / 2,
            o = e.top + (e.bottom - e.top - 140) / 2;
          l + a > t.width - 8 && n < 8 && (o = e.bottom + 6);
          const s = (t.top || 0) + 8,
            d = Math.max(s, t.height - (t.bottom || 0) - 140 - 8);
          return {
            left: `${Math.max(8, Math.min(r, t.width - a - 8))}px`,
            top: `${Math.max(s, Math.min(o, d))}px`,
            width: `${a}px`,
          };
        });
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
          const View = UniView,
            Text = UniText,
            Input = UniInput,
            Button = UniButton;
          return (
            openBlock(),
            createElementBlock(
              Fragment,
              null,
              [
                createVNode(View, {
                  class: "nickname-dismiss",
                  onClick:
                    renderCache[0] || (renderCache[0] = withModifiers((e) => a("close"), ["stop"])),
                }),
                createVNode(
                  View,
                  {
                    class: "nickname-popover",
                    style: normalizeStyle(l.value),
                    role: "dialog",
                    "aria-label": `${props.seatNumber}号昵称`,
                    onClick: renderCache[5] || (renderCache[5] = withModifiers(() => {}, ["stop"])),
                    onTouchmove: renderCache[6] || (renderCache[6] = withModifiers(() => {}, ["stop"])),
                  },
                  {
                    default: withCtx(() => [
                      createVNode(
                        View,
                        {
                          class: "nickname-heading",
                        },
                        {
                          default: withCtx(() => [
                            createVNode(Text, null, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(props.seatNumber) + "号昵称", 1),
                              ]),
                              _: 1,
                            }),
                            createVNode(
                              Text,
                              {
                                class: "nickname-limit",
                              },
                              {
                                default: withCtx(() => [createTextVNode("最多四个字")]),
                                _: 1,
                              },
                            ),
                          ]),
                          _: 1,
                        },
                      ),
                      createVNode(
                        Input,
                        {
                          class: "nickname-input",
                          value: props.modelValue,
                          maxlength: "4",
                          focus: true,
                          placeholder: "输入昵称",
                          "aria-label": "昵称",
                          "confirm-type": "done",
                          onInput:
                            renderCache[1] ||
                            (renderCache[1] = (e) =>
                              a("update:modelValue", Array.from(e.detail.value).slice(0, 4).join(""))),
                          onConfirm: renderCache[2] || (renderCache[2] = (e) => a("save")),
                        },
                        null,
                        8,
                        ["value"],
                      ),
                      createVNode(
                        View,
                        {
                          class: "nickname-actions",
                        },
                        {
                          default: withCtx(() => [
                            createVNode(
                              Button,
                              {
                                class: "nickname-clear",
                                onClick: renderCache[3] || (renderCache[3] = (e) => a("clear")),
                              },
                              {
                                default: withCtx(() => [createTextVNode("清除")]),
                                _: 1,
                              },
                            ),
                            createVNode(
                              Button,
                              {
                                class: "nickname-save",
                                onClick: renderCache[4] || (renderCache[4] = (e) => a("save")),
                              },
                              {
                                default: withCtx(() => [createTextVNode("保存")]),
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
                  ["style", "aria-label"],
                ),
              ],
              64,
            )
          );
        }
      );
    },
  },
  [["__scopeId", "data-v-1c86d5e0"]],
);
export { SeatNicknamePopover };
