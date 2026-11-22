// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { getReminderImage, isCustomReminder } from "../domain/reminders.js";
import {
  UniImage,
  UniText,
  UniView,
  computed,
  createBlock,
  createCommentVNode,
  createTextVNode,
  createVNode,
  normalizeClass,
  normalizeStyle,
  openBlock,
  ref,
  toDisplayString,
  watch,
  withCtx,
} from "../runtime.js";
import { withComponentMetadata } from "../runtime/componentMetadata.js";
const ReminderToken = withComponentMetadata(
  {
    __name: "ReminderToken",
    props: {
      token: {
        type: Object,
        default: null,
      },
      add: {
        type: Boolean,
        default: false,
      },
      size: {
        type: Number,
        default: 36,
      },
    },
    setup(props) {
      const t = props,
        i = ref(false),
        a = computed(() => getReminderImage(t.token)),
        l = computed(() => (i.value ? "/static/reference/reminder-default.webp" : a.value)),
        n = computed(() => !t.add && isCustomReminder(t.token)),
        m = computed(() => {
          const e = Number.isFinite(t.size) && t.size > 0 ? t.size : 36;
          return {
            width: `${e}px`,
            height: `${e}px`,
            "--marker-font-size": `${Math.max(8, Math.round(0.2 * e))}px`,
          };
        });
      return (
        watch(a, () => {
          i.value = false;
        }),
        (renderContext, renderCache) => {
          var b, v, y;
          const View = UniView,
            Image = UniImage,
            Text = UniText;
          return (
            openBlock(),
            createBlock(
              View,
              {
                class: normalizeClass([
                  "reference-reminder",
                  {
                    "reference-reminder-add": props.add,
                    "reference-reminder-custom": n.value,
                    "reference-reminder-inverted":
                      !props.add && (null == (b = props.token) ? void 0 : b.inverted),
                  },
                ]),
                style: normalizeStyle(m.value),
                "aria-label": props.add
                  ? "添加标记"
                  : (null == (v = props.token) ? void 0 : v.label) ||
                    (null == (y = props.token) ? void 0 : y.text) ||
                    "提醒标记",
              },
              {
                default: withCtx(() => [
                  props.add
                    ? (openBlock(),
                      createBlock(View, {
                        key: 0,
                        class: "reference-add-glyph",
                      }))
                    : (openBlock(),
                      createBlock(
                        View,
                        {
                          key: 1,
                          class: "reference-reminder-visual",
                        },
                        {
                          default: withCtx(() => [
                            createVNode(Image, {
                              webp: true,
                              class: "reference-reminder-background",
                              src: "/minibotc/static/reference/reminder.webp",
                              mode: "scaleToFill",
                            }),
                            createVNode(
                              Image,
                              {
                                webp: true,
                                class: "reference-reminder-image",
                                src: l.value,
                                mode: "scaleToFill",
                                onError: renderCache[0] || (renderCache[0] = (e) => (i.value = true)),
                              },
                              null,
                              8,
                              ["src"],
                            ),
                            createVNode(
                              Text,
                              {
                                class: "reference-reminder-text",
                              },
                              {
                                default: withCtx(() => {
                                  var t, i;
                                  return [
                                    createTextVNode(
                                      toDisplayString(
                                        (null == (t = props.token) ? void 0 : t.label) ||
                                          (null == (i = props.token) ? void 0 : i.text) ||
                                          "",
                                      ),
                                      1,
                                    ),
                                  ];
                                }),
                                _: 1,
                              },
                            ),
                          ]),
                          _: 1,
                        },
                      )),
                  props.add
                    ? createCommentVNode("", true)
                    : (openBlock(),
                      createBlock(View, {
                        key: 2,
                        class: "reference-reminder-shade",
                      })),
                ]),
                _: 1,
              },
              8,
              ["class", "style", "aria-label"],
            )
          );
        }
      );
    },
  },
  [["__scopeId", "data-v-00fa0f1f"]],
);
export { ReminderToken };
