// 从睡典钟楼公开前端重构；角色与素材归属保留。
import {
  Fragment,
  UniButton,
  UniInput,
  UniScrollView,
  UniText,
  UniView,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createTextVNode,
  createVNode,
  normalizeClass,
  onBeforeUnmount,
  onMounted,
  openBlock,
  renderList,
  toDisplayString,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const TimerDropdown = withComponentMetadata(
  {
    __name: "TimerDropdown",
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      modelValue: {
        type: [Number, String],
        default: 5,
      },
      active: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["update:modelValue", "start", "stop", "close"],
    setup(props, { emit: emit }) {
      const i = props,
        a = emit;
      function l(e) {
        i.open && "Escape" === e.key && a("close");
      }
      return (
        onMounted(() => {
          window.addEventListener("keydown", l);
        }),
        onBeforeUnmount(() => {
          window.removeEventListener("keydown", l);
        }),
        (renderContext, renderCache) => {
          const View = UniView,
            Text = UniText,
            Button = UniButton,
            Input = UniInput,
            ScrollView = UniScrollView;
          return (
            openBlock(),
            createElementBlock(
              Fragment,
              null,
              [
                props.open
                  ? (openBlock(),
                    createBlock(View, {
                      key: 0,
                      class: "timer-dismiss",
                      "aria-hidden": "true",
                      onClick:
                        renderCache[0] || (renderCache[0] = withModifiers((e) => a("close"), ["stop"])),
                    }))
                  : createCommentVNode("", true),
                props.open
                  ? (openBlock(),
                    createBlock(
                      View,
                      {
                        key: 1,
                        class: "timer-dropdown",
                        role: "dialog",
                        "aria-label": "倒计时设置",
                        "aria-modal": false,
                        onClick: renderCache[6] || (renderCache[6] = withModifiers(() => {}, ["stop"])),
                        onTouchmove:
                          renderCache[7] || (renderCache[7] = withModifiers(() => {}, ["stop"])),
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            ScrollView,
                            {
                              class: "timer-settings-scroll",
                              "scroll-y": "",
                              "show-scrollbar": true,
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  View,
                                  {
                                    class: "timer-settings-content",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        View,
                                        {
                                          class: "timer-heading",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("倒计时")]),
                                              _: 1,
                                            }),
                                            createVNode(
                                              Button,
                                              {
                                                class: "timer-close",
                                                "aria-label": "关闭倒计时设置",
                                                onClick:
                                                  renderCache[1] || (renderCache[1] = (e) => a("close")),
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
                                          class: "timer-presets",
                                        },
                                        {
                                          default: withCtx(() => [
                                            (openBlock(),
                                            createElementBlock(
                                              Fragment,
                                              null,
                                              renderList([1, 3, 5, 10, 15], (t) =>
                                                createVNode(
                                                  Button,
                                                  {
                                                    key: t,
                                                    class: normalizeClass([
                                                      "timer-preset",
                                                      {
                                                        selected: Number(props.modelValue) === t,
                                                      },
                                                    ]),
                                                    "data-minutes": t,
                                                    onClick: (e) => a("update:modelValue", t),
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(t) + "分", 1),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1032,
                                                  ["class", "data-minutes", "onClick"],
                                                ),
                                              ),
                                              64,
                                            )),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        View,
                                        {
                                          class: "timer-duration",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("时长")]),
                                              _: 1,
                                            }),
                                            createVNode(
                                              Input,
                                              {
                                                class: "timer-minutes",
                                                value: props.modelValue,
                                                type: "digit",
                                                maxlength: "6",
                                                "adjust-position": false,
                                                "aria-label": "倒计时分钟数",
                                                onInput:
                                                  renderCache[2] ||
                                                  (renderCache[2] = (e) =>
                                                    a("update:modelValue", e.detail.value)),
                                                onConfirm:
                                                  renderCache[3] || (renderCache[3] = (e) => a("start")),
                                              },
                                              null,
                                              8,
                                              ["value"],
                                            ),
                                            createVNode(Text, null, {
                                              default: withCtx(() => [createTextVNode("分钟")]),
                                              _: 1,
                                            }),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        View,
                                        {
                                          class: "timer-buttons",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Button,
                                              {
                                                class: "timer-start",
                                                onClick:
                                                  renderCache[4] || (renderCache[4] = (e) => a("start")),
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createTextVNode(
                                                    toDisplayString(
                                                      props.active ? "重新计时" : "开始计时",
                                                    ),
                                                    1,
                                                  ),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                            createVNode(
                                              Button,
                                              {
                                                class: normalizeClass([
                                                  "timer-stop",
                                                  {
                                                    "is-disabled": !props.active,
                                                  },
                                                ]),
                                                disabled: !props.active,
                                                onClick:
                                                  renderCache[5] || (renderCache[5] = (e) => a("stop")),
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("停止")]),
                                                _: 1,
                                              },
                                              8,
                                              ["class", "disabled"],
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
            )
          );
        }
      );
    },
  },
  [["__scopeId", "data-v-15e9f5a1"]],
);
export { TimerDropdown };
