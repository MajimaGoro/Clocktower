// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { CompactDialog } from "../components/CompactDialog.js";
import { EndGameDialog } from "../components/EndGameDialog.js";
import { FabledDrawer } from "../components/FabledDrawer.js";
import { FloatingNotebook } from "../components/FloatingNotebook.js";
import { GameRoleSelector } from "../components/GameRoleSelector.js";
import { IdentityDraw } from "../components/IdentityDraw.js";
import { MoreDropdown } from "../components/MoreDropdown.js";
import { ReminderToken } from "../components/ReminderToken.js";
import { ReminderTokenDialog } from "../components/ReminderTokenDialog.js";
import { RolePortrait } from "../components/RolePortrait.js";
import { RoleReferencePanel } from "../components/RoleReferencePanel.js";
import { SeatActionPopover } from "../components/SeatActionPopover.js";
import { SeatNicknamePopover } from "../components/SeatNicknamePopover.js";
import { SeatRolePicker } from "../components/SeatRolePicker.js";
import { SeatStatusDialog } from "../components/SeatStatusDialog.js";
import { Sheet } from "../components/Sheet.js";
import { SupportSite } from "../components/SupportSite.js";
import { TimerDropdown } from "../components/TimerDropdown.js";
import { WakeInstructions } from "../components/WakeInstructions.js";
import { CLOUDS_IMAGE } from "../data/assets.js";
import { builtInScripts } from "../data/scripts.js";
import { updateSessionOptions } from "../domain/game.js";
import { normalizeStaticImagePath } from "../domain/roleNormalization.js";
import { describeStage } from "../domain/stages.js";
import {
  Fragment,
  UniButton,
  UniImage,
  UniInput,
  UniText,
  UniTextarea,
  UniView,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createSlots,
  createTextVNode,
  createVNode,
  normalizeClass,
  normalizeStyle,
  openBlock,
  renderList,
  showModal,
  toDisplayString,
  unref,
  withCtx,
  withModifiers,
} from "../runtime.js";
import { saveCustomScripts } from "../storage/scripts.js";
/*
 * 圆桌主视图。状态由 useGrimoireState 提供，保留 ref 对象以维持响应性。
 * 子面板请在 src/components/ 中修改；这里负责主页面的组合。
 */
function createGrimoireView(viewState) {
  const {
    $a,
    Aa,
    Ca,
    D,
    Da,
    Ea,
    El,
    Fa,
    Ga,
    Gi,
    Gl,
    Ha,
    He,
    Hi,
    Ii,
    Ja,
    Ji,
    Ka,
    Ke,
    Ki,
    Ll,
    Ml,
    Na,
    Nl,
    O,
    Oa,
    Oi,
    Pa,
    Qa,
    Qi,
    Ra,
    Rl,
    S,
    Tl,
    Ua,
    Ue,
    Ui,
    V,
    Va,
    Vi,
    Vl,
    Wa,
    We,
    Wi,
    Ya,
    Za,
    Zi,
    _l,
    aa,
    abilitySeatId,
    activeSheet,
    activeVoteDraft,
    addReminder,
    allowDuplicateRoles,
    assignRandomRoles,
    assignmentMode,
    automaticVoteTotal,
    availableScripts,
    bl,
    bluffSlotIndex,
    ca,
    changePhase,
    cl,
    closeSheet,
    commitSession,
    currentPhase,
    currentScript,
    customScripts,
    da,
    defaultComposition,
    deleteSelectedReminder,
    dl,
    ea,
    ga,
    gameState,
    gl,
    hasUnsavedSessionChanges,
    hideStatusHint,
    hideTokenDeleteHint,
    ia,
    il,
    imageFailures,
    importScriptJson,
    isEditingLayout,
    isIdentityPanelOpen,
    isLandscape,
    isNotebookOpen,
    isPlayerView,
    isRoleSidebarOpen,
    isWakePanelOpen,
    j,
    jl,
    ka,
    kl,
    la,
    ll,
    ma,
    ml,
    na,
    nicknameDraft,
    nicknameEditorBounds,
    nicknameSeat,
    nicknameSeatId,
    nl,
    notebookMarks,
    notebookText,
    oa,
    ol,
    openIdentityPanel,
    openRoleAssignment,
    openSheet,
    openWakePanel,
    pendingExecutionSeat,
    phaseLabel,
    ra,
    rl,
    roleSearchQuery,
    roleSidebarTab,
    roleTeamFilter,
    sa,
    seatInteraction,
    seatPressGesture,
    seatStatistics,
    selectedAssignmentRoles,
    selectedSeat,
    selectedSeatId,
    selectedToken,
    selectedTokenId,
    sheetSubtitle,
    sheetTitle,
    showStatusHint,
    showTokenDeleteHint,
    sl,
    startTimer,
    ta,
    timerLabel,
    timerMinutes,
    tl,
    toggleNotebook,
    togglePlayerView,
    tokenPressGesture,
    ua,
    updateSessionSetting,
    viewport,
    vl,
    voteHistoryDraft,
    voteThreshold,
    wa,
    wakePanelRef,
    winnerLabel,
    wl,
    xa,
    xi,
    xl,
    ya,
    z,
    za,
    zi,
    zl,
  } = viewState;
  return (renderContext, renderCache) => {
    const Image = UniImage,
      View = UniView,
      Button = UniButton,
      Text = UniText,
      Textarea = UniTextarea,
      Input = UniInput;
    return (
      openBlock(),
      createBlock(
        View,
        {
          class: normalizeClass([
            "grimoire",
            {
              "is-landscape": isLandscape.value,
              "is-mp": unref(false),
              "is-night": "night" === currentPhase.value.kind,
              "is-player-view": isPlayerView.value,
              "is-review": gameState.value.ended,
              crowded: gameState.value.seats.length > 16,
            },
          ]),
          style: normalizeStyle(Hi.value),
        },
        {
          default: withCtx(() => {
            var e, u, h;
            return [
              createVNode(
                Image,
                {
                  webp: true,
                  class: "table-background",
                  src: unref(normalizeStaticImagePath)(
                    gameState.value.background || "/static/ui/background.webp",
                  ),
                  mode: "aspectFill",
                },
                null,
                8,
                ["src"],
              ),
              createVNode(View, {
                class: "table-night-dim",
              }),
              createVNode(
                View,
                {
                  class: "table-night-clouds",
                },
                {
                  default: withCtx(() => [
                    "night" === currentPhase.value.kind
                      ? (openBlock(),
                        createBlock(
                          View,
                          {
                            key: 0,
                            class: "table-night-cloud-strip",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(Image, {
                                webp: true,
                                src: CLOUDS_IMAGE,
                                mode: "aspectFill",
                              }),
                              createVNode(Image, {
                                webp: true,
                                src: CLOUDS_IMAGE,
                                mode: "aspectFill",
                              }),
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
                View,
                {
                  class: "table-toolbar",
                },
                {
                  default: withCtx(() => [
                    createVNode(
                      View,
                      {
                        class: "left-tools",
                      },
                      {
                        default: withCtx(() => [
                          (openBlock(),
                          createBlock(
                            FabledDrawer,
                            {
                              key: gameState.value.id,
                              roles: gameState.value.fabledRoles || [],
                              "available-roles": Ii.value,
                              "player-view": isPlayerView.value,
                              concealed: isIdentityPanelOpen.value || isWakePanelOpen.value,
                              onAdd: Oa,
                              onRemove: Da,
                            },
                            null,
                            8,
                            ["roles", "available-roles", "player-view", "concealed"],
                          )),
                          createVNode(
                            SupportSite,
                            {
                              concealed: isIdentityPanelOpen.value || isWakePanelOpen.value,
                            },
                            null,
                            8,
                            ["concealed"],
                          ),
                        ]),
                        _: 1,
                      },
                    ),
                    createVNode(
                      View,
                      {
                        class: normalizeClass([
                          "top-tools",
                          {
                            "tools-open": j.value || O.value,
                          },
                        ]),
                      },
                      {
                        default: withCtx(() => [
                          createVNode(
                            Button,
                            {
                              class: "view-toggle",
                              "data-action": "view",
                              "aria-label": isPlayerView.value ? "切换到说书人视角" : "切换到玩家视角",
                              title: isPlayerView.value
                                ? "玩家视角，点击切换到说书人视角"
                                : "说书人视角，点击切换到玩家视角",
                              "aria-pressed": isPlayerView.value,
                              onClick: togglePlayerView,
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  Image,
                                  {
                                    webp: true,
                                    class: "view-toggle-icon",
                                    src: isPlayerView.value
                                      ? "/static/ui/eye-off.svg"
                                      : "/static/ui/eye.svg",
                                    mode: "aspectFit",
                                    "aria-hidden": "true",
                                  },
                                  null,
                                  8,
                                  ["src"],
                                ),
                              ]),
                              _: 1,
                            },
                            8,
                            ["aria-label", "title", "aria-pressed"],
                          ),
                          createVNode(
                            View,
                            {
                              class: "top-actions",
                            },
                            {
                              default: withCtx(() => [
                                isPlayerView.value
                                  ? createCommentVNode("", true)
                                  : (openBlock(),
                                    createBlock(
                                      Button,
                                      {
                                        key: 0,
                                        class: "top-action notebook-tool",
                                        "data-action": "notebook",
                                        "aria-label": "笔记",
                                        "aria-expanded": isNotebookOpen.value,
                                        onClick: toggleNotebook,
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(
                                            Text,
                                            {
                                              class: "action-symbol",
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("✎")]),
                                              _: 1,
                                            },
                                          ),
                                          createVNode(Text, null, {
                                            default: withCtx(() => [createTextVNode("笔记")]),
                                            _: 1,
                                          }),
                                          gameState.value.notebook
                                            ? (openBlock(),
                                              createBlock(Text, {
                                                key: 0,
                                                class: "toolbar-note-dot",
                                              }))
                                            : createCommentVNode("", true),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ["aria-expanded"],
                                    )),
                                createVNode(
                                  View,
                                  {
                                    class: "timer-control",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        Button,
                                        {
                                          class: normalizeClass([
                                            "top-action",
                                            {
                                              "timer-running": gameState.value.timerEndsAt,
                                              "timer-expired":
                                                gameState.value.timerEndsAt &&
                                                "00:00" === timerLabel.value,
                                            },
                                          ]),
                                          "data-action": "timer",
                                          "aria-label": gameState.value.timerEndsAt
                                            ? `倒计时 ${timerLabel.value}，点击设置`
                                            : "定时器",
                                          "aria-expanded": O.value,
                                          "aria-haspopup": "dialog",
                                          onClick: withModifiers(Ea, ["stop"]),
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Text,
                                              {
                                                class: "action-symbol",
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("◷")]),
                                                _: 1,
                                              },
                                            ),
                                            createVNode(
                                              Text,
                                              {
                                                class: "timer-button-label",
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createTextVNode(
                                                    toDisplayString(
                                                      gameState.value.timerEndsAt
                                                        ? timerLabel.value
                                                        : "定时器",
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
                                        8,
                                        ["class", "aria-label", "aria-expanded"],
                                      ),
                                      createVNode(
                                        TimerDropdown,
                                        {
                                          open: O.value,
                                          modelValue: timerMinutes.value,
                                          "onUpdate:modelValue":
                                            renderCache[0] ||
                                            (renderCache[0] = (e) => (timerMinutes.value = e)),
                                          active: !!gameState.value.timerEndsAt,
                                          onClose:
                                            renderCache[1] ||
                                            (renderCache[1] = (e) => (O.value = false)),
                                          onStart: startTimer,
                                          onStop: Ml,
                                        },
                                        null,
                                        8,
                                        ["open", "modelValue", "active"],
                                      ),
                                    ]),
                                    _: 1,
                                  },
                                ),
                                isPlayerView.value
                                  ? (openBlock(),
                                    createBlock(
                                      Button,
                                      {
                                        key: 1,
                                        class: "top-action",
                                        "data-action": "history",
                                        "aria-label": "历史投票",
                                        onClick:
                                          renderCache[2] ||
                                          (renderCache[2] = (e) => openSheet("history")),
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(
                                            Text,
                                            {
                                              class: "action-symbol",
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("▥")]),
                                              _: 1,
                                            },
                                          ),
                                          createVNode(Text, null, {
                                            default: withCtx(() => [createTextVNode("历史投票")]),
                                            _: 1,
                                          }),
                                        ]),
                                        _: 1,
                                      },
                                    ))
                                  : createCommentVNode("", true),
                                isPlayerView.value
                                  ? createCommentVNode("", true)
                                  : (openBlock(),
                                    createBlock(
                                      Button,
                                      {
                                        key: 2,
                                        class: "top-action more-button",
                                        "aria-label": "更多工具",
                                        "aria-expanded": j.value,
                                        "aria-haspopup": "menu",
                                        onClick: withModifiers(Aa, ["stop"]),
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(
                                            Text,
                                            {
                                              class: "action-symbol",
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode("•••")]),
                                              _: 1,
                                            },
                                          ),
                                          createVNode(Text, null, {
                                            default: withCtx(() => [createTextVNode("更多")]),
                                            _: 1,
                                          }),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ["aria-expanded"],
                                    )),
                                createVNode(
                                  MoreDropdown,
                                  {
                                    open: j.value && !isPlayerView.value,
                                    "seat-count": gameState.value.seats.length,
                                    zoom: gameState.value.zoom,
                                    "show-new": !gameState.value.ended,
                                    onClose:
                                      renderCache[3] || (renderCache[3] = (e) => (j.value = false)),
                                    onAction: El,
                                    onZoom:
                                      renderCache[4] ||
                                      (renderCache[4] = (e) => updateSessionSetting("zoom", e)),
                                  },
                                  null,
                                  8,
                                  ["open", "seat-count", "zoom", "show-new"],
                                ),
                              ]),
                              _: 1,
                            },
                          ),
                        ]),
                        _: 1,
                      },
                      8,
                      ["class"],
                    ),
                  ]),
                  _: 1,
                },
              ),
              seatInteraction.value
                ? (openBlock(),
                  createBlock(
                    View,
                    {
                      key: 0,
                      class: "selection-banner seat-selection-banner",
                      style: normalizeStyle(Ki.value),
                      onClick:
                        renderCache[5] || (renderCache[5] = (e) => (seatInteraction.value = null)),
                    },
                    {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(seatInteraction.value.message), 1),
                        createVNode(Text, null, {
                          default: withCtx(() => [createTextVNode("取消 ×")]),
                          _: 1,
                        }),
                      ]),
                      _: 1,
                    },
                    8,
                    ["style"],
                  ))
                : createCommentVNode("", true),
              isEditingLayout.value
                ? (openBlock(),
                  createBlock(
                    View,
                    {
                      key: 1,
                      class: "selection-banner",
                    },
                    {
                      default: withCtx(() => [
                        createTextVNode("拖动座位调整布局"),
                        createVNode(
                          Button,
                          {
                            class: "inline-button",
                            onClick: jl,
                          },
                          {
                            default: withCtx(() => [createTextVNode(" 恢复默认")]),
                            _: 1,
                          },
                        ),
                        createVNode(
                          Button,
                          {
                            class: "inline-button",
                            onClick:
                              renderCache[6] ||
                              (renderCache[6] = (e) => (isEditingLayout.value = false)),
                          },
                          {
                            default: withCtx(() => [createTextVNode(" 保存布局 ✓ ")]),
                            _: 1,
                          },
                        ),
                      ]),
                      _: 1,
                    },
                  ))
                : createCommentVNode("", true),
              createVNode(
                View,
                {
                  class: "table-area",
                  style: normalizeStyle(Ji.value),
                },
                {
                  default: withCtx(() => [
                    createVNode(
                      View,
                      {
                        class: "table-center",
                      },
                      {
                        default: withCtx(() => [
                          We.value
                            ? (openBlock(),
                              createBlock(
                                View,
                                {
                                  key: 1,
                                  class: "script-cover cover-fallback",
                                },
                                {
                                  default: withCtx(() => [createTextVNode("◈")]),
                                  _: 1,
                                },
                              ))
                            : (openBlock(),
                              createBlock(
                                Image,
                                {
                                  key: 0,
                                  webp: true,
                                  class: "script-cover",
                                  src: unref(normalizeStaticImagePath)(
                                    currentScript.value.logo || "/static/scripts/tb.webp",
                                  ),
                                  mode: "aspectFit",
                                  onError: renderCache[7] || (renderCache[7] = (e) => (We.value = true)),
                                },
                                null,
                                8,
                                ["src"],
                              )),
                          defaultComposition.value
                            ? (openBlock(),
                              createBlock(
                                View,
                                {
                                  key: 2,
                                  class: "composition",
                                },
                                {
                                  default: withCtx(() => [
                                    (openBlock(),
                                    createElementBlock(
                                      Fragment,
                                      null,
                                      renderList(Gi, (e) =>
                                        createVNode(
                                          View,
                                          {
                                            key: e,
                                            class: normalizeClass(["composition-item", e]),
                                            "aria-label": `${ya(e)} ${defaultComposition.value[e]}人`,
                                            title: ya(e),
                                            onClick: (t) =>
                                              Ga(`${ya(e)} ${defaultComposition.value[e]}人`),
                                          },
                                          {
                                            default: withCtx(() => [
                                              createVNode(
                                                Text,
                                                {
                                                  class: "composition-number",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createTextVNode(
                                                      toDisplayString(defaultComposition.value[e]),
                                                      1,
                                                    ),
                                                  ]),
                                                  _: 2,
                                                },
                                                1024,
                                              ),
                                              createVNode(
                                                Image,
                                                {
                                                  webp: true,
                                                  class: "composition-icon",
                                                  src: `/static/reference/count-${e}.png`,
                                                  mode: "aspectFit",
                                                },
                                                null,
                                                8,
                                                ["src"],
                                              ),
                                            ]),
                                            _: 2,
                                          },
                                          1032,
                                          ["class", "aria-label", "title", "onClick"],
                                        ),
                                      ),
                                      64,
                                    )),
                                  ]),
                                  _: 1,
                                },
                              ))
                            : (openBlock(),
                              createBlock(
                                Text,
                                {
                                  key: 3,
                                  class: "composition-unavailable",
                                  "aria-label": `${seatStatistics.value.ordinary}名普通玩家，暂无对应标准配比`,
                                },
                                {
                                  default: withCtx(() => [
                                    createTextVNode(
                                      toDisplayString(seatStatistics.value.ordinary) + " 人",
                                      1,
                                    ),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ["aria-label"],
                              )),
                        ]),
                        _: 1,
                      },
                    ),
                    Zi.value.length
                      ? (openBlock(),
                        createBlock(
                          View,
                          {
                            key: 0,
                            class: "nomination-clock",
                          },
                          {
                            default: withCtx(() => [
                              (openBlock(true),
                              createElementBlock(
                                Fragment,
                                null,
                                renderList(
                                  Zi.value,
                                  (e) => (
                                    openBlock(),
                                    createBlock(
                                      Image,
                                      {
                                        webp: true,
                                        key: e.kind,
                                        class: normalizeClass(["clock-pointer", `clock-${e.kind}`]),
                                        src: `/static/ui/clock-${e.kind}.webp`,
                                        mode: "aspectFit",
                                        style: normalizeStyle(e.style),
                                        "data-seat-id": e.seatId,
                                        "aria-label": e.label,
                                      },
                                      null,
                                      8,
                                      ["class", "src", "style", "data-seat-id", "aria-label"],
                                    )
                                  ),
                                ),
                                128,
                              )),
                            ]),
                            _: 1,
                          },
                        ))
                      : createCommentVNode("", true),
                    gameState.value.ended
                      ? (openBlock(),
                        createBlock(
                          View,
                          {
                            key: 1,
                            class: "review-controls",
                          },
                          {
                            default: withCtx(() => [
                              winnerLabel.value
                                ? (openBlock(),
                                  createBlock(
                                    Text,
                                    {
                                      key: 0,
                                      class: normalizeClass([
                                        "review-winner",
                                        gameState.value.reviewWinner,
                                      ]),
                                    },
                                    {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(winnerLabel.value), 1),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["class"],
                                  ))
                                : createCommentVNode("", true),
                              !isPlayerView.value && zi.value.length
                                ? (openBlock(),
                                  createBlock(
                                    Button,
                                    {
                                      key: 1,
                                      class: "replay-flip-all-button",
                                      disabled: S.value,
                                      onClick: Nl,
                                    },
                                    {
                                      default: withCtx(() => [
                                        createTextVNode(
                                          toDisplayString(
                                            S.value ? `翻转中 ${z.value}/${V.value}` : "翻转所有",
                                          ),
                                          1,
                                        ),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["disabled"],
                                  ))
                                : createCommentVNode("", true),
                            ]),
                            _: 1,
                          },
                        ))
                      : createCommentVNode("", true),
                    (openBlock(true),
                    createElementBlock(
                      Fragment,
                      null,
                      renderList(
                        Qi.value,
                        (e) => (
                          openBlock(),
                          createBlock(
                            View,
                            {
                              key: e.number,
                              class: "seat-position",
                              style: normalizeStyle(e.style),
                              onTouchstart: (t) => zl(e.seat.id, t),
                              onTouchmove: renderCache[9] || (renderCache[9] = (e) => Vl(e)),
                              onTouchend: Ll,
                              onMousedown: (t) =>
                                (function (e, t) {
                                  if (!isEditingLayout.value) return;
                                  t.preventDefault();
                                  zl(e, t);
                                  const i = (e) => Vl(e),
                                    a = () => {
                                      Ll();
                                      window.removeEventListener("mousemove", i);
                                      window.removeEventListener("mouseup", a);
                                    };
                                  window.addEventListener("mousemove", i);
                                  window.addEventListener("mouseup", a);
                                })(e.seat.id, t),
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  Button,
                                  {
                                    class: normalizeClass([
                                      "seat-button",
                                      {
                                        dead: !gameState.value.ended && !e.seat.alive,
                                        voted: !isPlayerView.value && wl(e.seat.id),
                                        pending:
                                          !gameState.value.ended &&
                                          !isPlayerView.value &&
                                          gameState.value.pendingExecutionId === e.seat.id,
                                        "is-target":
                                          seatInteraction.value &&
                                          seatInteraction.value.source !== e.seat.id &&
                                          !ra(e.seat.id),
                                        "nomination-disabled": ra(e.seat.id),
                                        "has-alignment-glow": e.glows.alignmentColor,
                                        "review-revealed": gameState.value.ended && e.showRole,
                                      },
                                    ]),
                                    style: normalizeStyle({
                                      "--alignment-color": e.glows.alignmentColor,
                                      "--alignment-shadow":
                                        e.glows.alignmentColor && e.glows.alignmentColor + "88",
                                      "--condition-color": e.glows.conditionColor,
                                      "--condition-shadow":
                                        e.glows.conditionColor && e.glows.conditionColor + "88",
                                    }),
                                    "aria-label": Ra(e),
                                    role: "button",
                                    disabled: !!ra(e.seat.id),
                                    title: ra(e.seat.id) || void 0,
                                    "aria-disabled":
                                      !!ra(e.seat.id) || (isPlayerView.value && !e.covered),
                                    onClick: (t) => Ja(e.seat.id),
                                    onLongpress: (t) => {
                                      return (
                                        (i = e.seat.id),
                                        void (Pa() && seatPressGesture.inspect(i))
                                      );
                                      var i;
                                    },
                                    onTouchstart: (t) => Wa(e.seat.id, t),
                                    onTouchmove: unref(seatPressGesture).move,
                                    onTouchend: unref(seatPressGesture).touchEnd,
                                    onTouchcancel: unref(seatPressGesture).cancel,
                                    onMousedown: (t) => Wa(e.seat.id, t, true),
                                    onMousemove: unref(seatPressGesture).move,
                                    onMouseup: unref(seatPressGesture).end,
                                    onMouseleave: unref(seatPressGesture).cancel,
                                    onContextmenu:
                                      renderCache[8] ||
                                      (renderCache[8] = withModifiers(() => {}, ["prevent"])),
                                  },
                                  {
                                    default: withCtx(() => {
                                      var t;
                                      return [
                                        createVNode(
                                          RolePortrait,
                                          {
                                            role: e.showRole ? e.seat.role : null,
                                            concealed: !e.showRole,
                                            covered: e.covered,
                                            size: Wi.value,
                                            named: e.showRole,
                                            dead: !gameState.value.ended && !e.seat.alive,
                                            "ghost-vote": e.seat.ghostVote,
                                            pending:
                                              !gameState.value.ended &&
                                              !isPlayerView.value &&
                                              gameState.value.pendingExecutionId === e.seat.id,
                                            "selection-action":
                                              (null == (t = ia.value[e.seat.id]) ? void 0 : t.kind) ||
                                              "",
                                          },
                                          null,
                                          8,
                                          [
                                            "role",
                                            "concealed",
                                            "covered",
                                            "size",
                                            "named",
                                            "dead",
                                            "ghost-vote",
                                            "pending",
                                            "selection-action",
                                          ],
                                        ),
                                        e.glows.conditionColor
                                          ? (openBlock(),
                                            createBlock(View, {
                                              key: 0,
                                              class: "seat-condition-glow",
                                              "aria-hidden": "true",
                                            }))
                                          : createCommentVNode("", true),
                                        !isPlayerView.value && wl(e.seat.id)
                                          ? (openBlock(),
                                            createBlock(
                                              Text,
                                              {
                                                key: 1,
                                                class: "vote-check",
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode("✓")]),
                                                _: 1,
                                              },
                                            ))
                                          : createCommentVNode("", true),
                                      ];
                                    }),
                                    _: 2,
                                  },
                                  1032,
                                  [
                                    "class",
                                    "style",
                                    "aria-label",
                                    "disabled",
                                    "title",
                                    "aria-disabled",
                                    "onClick",
                                    "onLongpress",
                                    "onTouchstart",
                                    "onTouchmove",
                                    "onTouchend",
                                    "onTouchcancel",
                                    "onMousedown",
                                    "onMousemove",
                                    "onMouseup",
                                    "onMouseleave",
                                  ],
                                ),
                                aa.value.first[e.seat.id]
                                  ? (openBlock(),
                                    createBlock(
                                      Text,
                                      {
                                        key: 0,
                                        class: normalizeClass([
                                          "night-rank",
                                          "first-rank",
                                          {
                                            "night-rank-dead": !e.seat.alive,
                                          },
                                        ]),
                                        "aria-label": `首夜夜序 ${aa.value.first[e.seat.id]}`,
                                        title: "首夜夜序",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(aa.value.first[e.seat.id]), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1032,
                                      ["class", "aria-label"],
                                    ))
                                  : createCommentVNode("", true),
                                aa.value.other[e.seat.id]
                                  ? (openBlock(),
                                    createBlock(
                                      Text,
                                      {
                                        key: 1,
                                        class: normalizeClass([
                                          "night-rank",
                                          "other-rank",
                                          {
                                            "night-rank-dead": !e.seat.alive,
                                          },
                                        ]),
                                        "aria-label": `其他夜夜序 ${aa.value.other[e.seat.id]}`,
                                        title: "其他夜夜序",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(aa.value.other[e.seat.id]), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1032,
                                      ["class", "aria-label"],
                                    ))
                                  : createCommentVNode("", true),
                                isEditingLayout.value
                                  ? (openBlock(),
                                    createBlock(
                                      Text,
                                      {
                                        key: 2,
                                        class: "drag-hint",
                                      },
                                      {
                                        default: withCtx(() => [createTextVNode("✥")]),
                                        _: 1,
                                      },
                                    ))
                                  : createCommentVNode("", true),
                              ]),
                              _: 2,
                            },
                            1032,
                            ["style", "onTouchstart", "onMousedown"],
                          )
                        ),
                      ),
                      128,
                    )),
                    (openBlock(true),
                    createElementBlock(
                      Fragment,
                      null,
                      renderList(ta.value, (e) => {
                        var i;
                        return (
                          openBlock(),
                          createBlock(
                            Button,
                            {
                              key: e.slotKey,
                              class: normalizeClass([
                                "reminder-marker",
                                {
                                  "add-marker": e.add,
                                  inverted: null == (i = e.token) ? void 0 : i.inverted,
                                },
                              ]),
                              style: normalizeStyle(e.style),
                              "aria-label": e.add
                                ? `给${e.number}号添加标记`
                                : `${e.number}号标记${e.token.label}`,
                              onClick: withModifiers(
                                (t) =>
                                  (function (e) {
                                    tokenPressGesture.allowTap() &&
                                      !isPlayerView.value &&
                                      ((selectedSeatId.value = e.seatId),
                                      e.add
                                        ? ((Ue.value = ""), openSheet("tokens"))
                                        : ((selectedTokenId.value = e.token.id),
                                          (He.value = e.token.label),
                                          openSheet("token")));
                                  })(e),
                                ["stop"],
                              ),
                              onLongpress: withModifiers(
                                (t) =>
                                  (function (e) {
                                    isPlayerView.value || e.add || tokenPressGesture.inspect(e);
                                  })(e),
                                ["stop"],
                              ),
                              onTouchstart: (t) => dl(e, t),
                              onTouchmove: unref(tokenPressGesture).move,
                              onTouchend: unref(tokenPressGesture).touchEnd,
                              onTouchcancel: unref(tokenPressGesture).cancel,
                              onMousedown: (t) => dl(e, t, true),
                              onMousemove: unref(tokenPressGesture).move,
                              onMouseup: unref(tokenPressGesture).end,
                              onMouseleave: unref(tokenPressGesture).cancel,
                              onContextmenu:
                                renderCache[10] ||
                                (renderCache[10] = withModifiers(() => {}, ["prevent"])),
                            },
                            {
                              default: withCtx(() => [
                                createVNode(
                                  ReminderToken,
                                  {
                                    token: e.token,
                                    add: e.add,
                                    size: e.size,
                                  },
                                  null,
                                  8,
                                  ["token", "add", "size"],
                                ),
                              ]),
                              _: 2,
                            },
                            1032,
                            [
                              "class",
                              "style",
                              "aria-label",
                              "onClick",
                              "onLongpress",
                              "onTouchstart",
                              "onTouchmove",
                              "onTouchend",
                              "onTouchcancel",
                              "onMousedown",
                              "onMousemove",
                              "onMouseup",
                              "onMouseleave",
                            ],
                          )
                        );
                      }),
                      128,
                    )),
                  ]),
                  _: 1,
                },
                8,
                ["style"],
              ),
              (openBlock(true),
              createElementBlock(
                Fragment,
                null,
                renderList(Qi.value, (e) => {
                  var t, i, a;
                  return (
                    openBlock(),
                    createBlock(
                      Button,
                      {
                        key: e.number,
                        class: normalizeClass([
                          "seat-number",
                          {
                            "nomination-number-selectable":
                              "nomination" === (null == (t = seatInteraction.value) ? void 0 : t.type) &&
                              !ra(e.seat.id),
                            "nomination-number-nominee":
                              "nomination" === (null == (i = seatInteraction.value) ? void 0 : i.type) &&
                              seatInteraction.value.nominatorId,
                            "nomination-number-disabled": ra(e.seat.id),
                          },
                        ]),
                        style: normalizeStyle({
                          "--seat-size": `${Wi.value}px`,
                          width: e.numberBounds.right - e.numberBounds.left + "px",
                          left: `${Ui.value.x + (e.numberBounds.left + e.numberBounds.right) / 2}px`,
                          top: `${Ui.value.y + e.numberBounds.top}px`,
                        }),
                        "aria-label":
                          "nomination" === (null == (a = seatInteraction.value) ? void 0 : a.type)
                            ? Ra(e)
                            : `${e.number}号${e.seat.nickname ? ":" + e.seat.nickname : ""}，设置昵称`,
                        role: "button",
                        "aria-disabled": isPlayerView.value || !!ra(e.seat.id),
                        disabled: isPlayerView.value || !!ra(e.seat.id),
                        onClick: withModifiers(
                          (t) => {
                            var i;
                            return "nomination" ===
                              (null == (i = seatInteraction.value) ? void 0 : i.type)
                              ? Ja(e.seat.id)
                              : (function (e) {
                                  isPlayerView.value ||
                                    isEditingLayout.value ||
                                    ($a(),
                                    (nicknameDraft.value = e.seat.nickname || ""),
                                    (nicknameSeatId.value = e.seat.id));
                                })(e);
                          },
                          ["stop"],
                        ),
                      },
                      {
                        default: withCtx(() => [
                          createTextVNode(
                            toDisplayString(e.number) +
                              "号" +
                              toDisplayString(e.seat.nickname ? ":" + e.seat.nickname : ""),
                            1,
                          ),
                        ]),
                        _: 2,
                      },
                      1032,
                      ["class", "style", "aria-label", "aria-disabled", "disabled", "onClick"],
                    )
                  );
                }),
                128,
              )),
              isPlayerView.value
                ? createCommentVNode("", true)
                : (openBlock(),
                  createBlock(
                    View,
                    {
                      key: 2,
                      class: "left-tool-dock",
                      style: normalizeStyle({
                        "--bluff-portrait-size": `${xi.value}px`,
                      }),
                    },
                    {
                      default: withCtx(() => [
                        createVNode(
                          View,
                          {
                            class: normalizeClass([
                              "bluff-drawer",
                              {
                                "is-open": allowDuplicateRoles.value,
                              },
                            ]),
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                View,
                                {
                                  class: "bluff-drawer-track",
                                },
                                {
                                  default: withCtx(() => [
                                    createVNode(
                                      View,
                                      {
                                        class: "bluff-drawer-panel",
                                        "aria-hidden": !allowDuplicateRoles.value,
                                      },
                                      {
                                        default: withCtx(() => [
                                          (openBlock(true),
                                          createElementBlock(
                                            Fragment,
                                            null,
                                            renderList(
                                              gameState.value.bluffRoles,
                                              (e, t) => (
                                                openBlock(),
                                                createBlock(
                                                  Button,
                                                  {
                                                    key: t,
                                                    class: "bluff-slot",
                                                    "aria-label": `设置第${t + 1}个伪装角色${e ? "：" + e.name : ""}`,
                                                    tabindex: allowDuplicateRoles.value ? 0 : -1,
                                                    onClick: (e) =>
                                                      (function (e) {
                                                        bluffSlotIndex.value = e;
                                                        assignmentMode.value = "bluff";
                                                        roleTeamFilter.value = "all";
                                                        openSheet("assign");
                                                      })(t),
                                                  },
                                                  {
                                                    default: withCtx(() => [
                                                      e
                                                        ? (openBlock(),
                                                          createBlock(
                                                            RolePortrait,
                                                            {
                                                              key: 0,
                                                              role: e,
                                                              size: xi.value,
                                                            },
                                                            null,
                                                            8,
                                                            ["role", "size"],
                                                          ))
                                                        : (openBlock(),
                                                          createBlock(
                                                            View,
                                                            {
                                                              key: 1,
                                                              class: "bluff-slot-empty",
                                                            },
                                                            {
                                                              default: withCtx(() => [
                                                                createVNode(Image, {
                                                                  webp: true,
                                                                  src: "/minibotc/static/ui/token.webp",
                                                                  mode: "aspectFit",
                                                                }),
                                                                createVNode(Text, null, {
                                                                  default: withCtx(() => [
                                                                    createTextVNode("＋"),
                                                                  ]),
                                                                  _: 1,
                                                                }),
                                                              ]),
                                                              _: 1,
                                                            },
                                                          )),
                                                      e
                                                        ? (openBlock(),
                                                          createBlock(
                                                            Text,
                                                            {
                                                              key: 2,
                                                              class: normalizeClass([
                                                                "bluff-slot-name",
                                                                e.team,
                                                              ]),
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
                                                            1032,
                                                            ["class"],
                                                          ))
                                                        : createCommentVNode("", true),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1032,
                                                  ["aria-label", "tabindex", "onClick"],
                                                )
                                              ),
                                            ),
                                            128,
                                          )),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ["aria-hidden"],
                                    ),
                                    createVNode(
                                      Button,
                                      {
                                        class: normalizeClass([
                                          "drawer-tab",
                                          {
                                            active: allowDuplicateRoles.value,
                                          },
                                        ]),
                                        "aria-expanded": allowDuplicateRoles.value,
                                        "aria-label": "伪装",
                                        onClick:
                                          renderCache[11] ||
                                          (renderCache[11] = (e) =>
                                            (allowDuplicateRoles.value = !allowDuplicateRoles.value)),
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(View, {
                                            class: "dock-icon dock-icon-masks",
                                            "aria-hidden": "true",
                                          }),
                                          createVNode(
                                            View,
                                            {
                                              class: "drawer-tab-label",
                                            },
                                            {
                                              default: withCtx(() => [
                                                createVNode(Text, null, {
                                                  default: withCtx(() => [createTextVNode("伪")]),
                                                  _: 1,
                                                }),
                                                createVNode(Text, null, {
                                                  default: withCtx(() => [createTextVNode("装")]),
                                                  _: 1,
                                                }),
                                              ]),
                                              _: 1,
                                            },
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ["class", "aria-expanded"],
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["class"],
                        ),
                        createVNode(
                          Button,
                          {
                            class: normalizeClass([
                              "drawer-tab",
                              {
                                active: isRoleSidebarOpen.value,
                              },
                            ]),
                            "aria-expanded": isRoleSidebarOpen.value,
                            "aria-label": "角色",
                            onClick: za,
                          },
                          {
                            default: withCtx(() => [
                              createVNode(View, {
                                class: "dock-icon dock-icon-book",
                                "aria-hidden": "true",
                              }),
                              createVNode(
                                View,
                                {
                                  class: "drawer-tab-label",
                                },
                                {
                                  default: withCtx(() => [
                                    createVNode(Text, null, {
                                      default: withCtx(() => [createTextVNode("角")]),
                                      _: 1,
                                    }),
                                    createVNode(Text, null, {
                                      default: withCtx(() => [createTextVNode("色")]),
                                      _: 1,
                                    }),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["class", "aria-expanded"],
                        ),
                      ]),
                      _: 1,
                    },
                    8,
                    ["style"],
                  )),
              hasUnsavedSessionChanges.value
                ? (openBlock(),
                  createBlock(
                    View,
                    {
                      key: 3,
                      class: "offline-sign",
                    },
                    {
                      default: withCtx(() => [
                        createVNode(Text, {
                          class: "offline-dot",
                        }),
                        createTextVNode("保存失败，请重试"),
                      ]),
                      _: 1,
                    },
                  ))
                : createCommentVNode("", true),
              isPlayerView.value
                ? (openBlock(),
                  createBlock(
                    View,
                    {
                      key: 4,
                      class: "panel-game-status",
                      "aria-label": "游戏状态",
                    },
                    {
                      default: withCtx(() => [
                        createVNode(
                          View,
                          {
                            class: "panel-game-status__phase",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(
                                Image,
                                {
                                  webp: true,
                                  src:
                                    "night" === currentPhase.value.kind
                                      ? "/static/ui/eye-off.svg"
                                      : "/static/ui/eye.svg",
                                  mode: "aspectFit",
                                  "aria-hidden": "true",
                                },
                                null,
                                8,
                                ["src"],
                              ),
                              createVNode(Text, null, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(phaseLabel.value), 1),
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
                            class: "panel-game-status__row",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(View, {
                                class: "status-people",
                                "aria-hidden": "true",
                              }),
                              createVNode(
                                Text,
                                {
                                  class: "status-count",
                                },
                                {
                                  default: withCtx(() => [
                                    createTextVNode(
                                      toDisplayString(seatStatistics.value.aliveOrdinary) +
                                        " / " +
                                        toDisplayString(seatStatistics.value.ordinary),
                                      1,
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ),
                              createVNode(Text, null, {
                                default: withCtx(() => [createTextVNode("名玩家存活")]),
                                _: 1,
                              }),
                            ]),
                            _: 1,
                          },
                        ),
                        createVNode(
                          View,
                          {
                            class: "panel-game-status__row",
                          },
                          {
                            default: withCtx(() => [
                              createVNode(View, {
                                class: "status-people travelers",
                                "aria-hidden": "true",
                              }),
                              createVNode(
                                Text,
                                {
                                  class: "status-count",
                                },
                                {
                                  default: withCtx(() => [
                                    createTextVNode(
                                      toDisplayString(seatStatistics.value.aliveTravelers) +
                                        " / " +
                                        toDisplayString(seatStatistics.value.travelers),
                                      1,
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ),
                              createVNode(Text, null, {
                                default: withCtx(() => [createTextVNode("名旅行者存活")]),
                                _: 1,
                              }),
                            ]),
                            _: 1,
                          },
                        ),
                      ]),
                      _: 1,
                    },
                  ))
                : (openBlock(),
                  createBlock(
                    View,
                    {
                      key: 5,
                      class: normalizeClass([
                        "workbench",
                        {
                          "voting-bench": activeVoteDraft.value,
                        },
                      ]),
                      role: "region",
                      "aria-label": "说书人工作台",
                    },
                    {
                      default: withCtx(() => [
                        activeVoteDraft.value
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
                                    class: "bench-overline",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(Text, {
                                        class: "live-dot",
                                      }),
                                      createTextVNode("正在记录投票"),
                                      createVNode(
                                        Button,
                                        {
                                          class: "text-button",
                                          onClick:
                                            renderCache[12] ||
                                            (renderCache[12] = (e) => openSheet("vote")),
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode(" 调整 ")]),
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
                                    class: "vote-heading",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createTextVNode(
                                        toDisplayString(ka(activeVoteDraft.value.nominatorId)),
                                        1,
                                      ),
                                      createVNode(Text, null, {
                                        default: withCtx(() => [createTextVNode("提名")]),
                                        _: 1,
                                      }),
                                      createTextVNode(
                                        toDisplayString(ka(activeVoteDraft.value.nomineeId)),
                                        1,
                                      ),
                                    ]),
                                    _: 1,
                                  },
                                ),
                                createVNode(
                                  View,
                                  {
                                    class: "vote-stat",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        Text,
                                        {
                                          class: "vote-total",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(ga.value), 1),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(Text, null, {
                                        default: withCtx(() => [
                                          createTextVNode(
                                            "票 / " + toDisplayString(voteThreshold.value) + " 票起",
                                            1,
                                          ),
                                        ]),
                                        _: 1,
                                      }),
                                      createVNode(
                                        Text,
                                        {
                                          class: "tiny",
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode("点头像投票")]),
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
                                    class: "button-row",
                                  },
                                  {
                                    default: withCtx(() => [
                                      createVNode(
                                        Button,
                                        {
                                          class: "subtle-button",
                                          onClick: _l,
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode("取消")]),
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        Button,
                                        {
                                          class: "gold-button",
                                          onClick: Rl,
                                        },
                                        {
                                          default: withCtx(() => [createTextVNode(" 完成投票 ")]),
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
                          : gameState.value.ended
                            ? (openBlock(),
                              createElementBlock(
                                Fragment,
                                {
                                  key: 1,
                                },
                                [
                                  createVNode(
                                    View,
                                    {
                                      class: "bench-overline",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(Text, null, {
                                          default: withCtx(() => [createTextVNode("复盘模式")]),
                                          _: 1,
                                        }),
                                        createVNode(Text, null, {
                                          default: withCtx(() => [
                                            createTextVNode(toDisplayString(winnerLabel.value), 1),
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
                                      class: "bench-actions review-links",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(
                                          Button,
                                          {
                                            class: "subtle-button",
                                            onClick:
                                              renderCache[13] ||
                                              (renderCache[13] = (e) => openSheet("history")),
                                          },
                                          {
                                            default: withCtx(() => [createTextVNode(" 历史投票")]),
                                            _: 1,
                                          },
                                        ),
                                        createVNode(
                                          Button,
                                          {
                                            class: "subtle-button",
                                            onClick: toggleNotebook,
                                          },
                                          {
                                            default: withCtx(() => [createTextVNode(" 笔记 ")]),
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
                                      class: "gold-button full-width",
                                      onClick: Tl,
                                    },
                                    {
                                      default: withCtx(() => [createTextVNode(" 开始新一局 ")]),
                                      _: 1,
                                    },
                                  ),
                                ],
                                64,
                              ))
                            : (openBlock(),
                              createElementBlock(
                                Fragment,
                                {
                                  key: 2,
                                },
                                [
                                  createVNode(
                                    View,
                                    {
                                      class: "phase-selector",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(
                                          Button,
                                          {
                                            class: "phase-arrow",
                                            "aria-label": "上一阶段",
                                            disabled: 0 === gameState.value.stage,
                                            onClick:
                                              renderCache[14] ||
                                              (renderCache[14] = (e) => changePhase(-1)),
                                          },
                                          {
                                            default: withCtx(() => [createTextVNode(" ‹ ")]),
                                            _: 1,
                                          },
                                          8,
                                          ["disabled"],
                                        ),
                                        createVNode(
                                          View,
                                          {
                                            class: "phase-title",
                                          },
                                          {
                                            default: withCtx(() => [
                                              createVNode(Text, null, {
                                                default: withCtx(() => [
                                                  createTextVNode(
                                                    toDisplayString(currentPhase.value.label),
                                                    1,
                                                  ),
                                                ]),
                                                _: 1,
                                              }),
                                              createVNode(Text, null, {
                                                default: withCtx(() => [
                                                  createTextVNode(toDisplayString(la.value), 1),
                                                ]),
                                                _: 1,
                                              }),
                                            ]),
                                            _: 1,
                                          },
                                        ),
                                        createVNode(
                                          Button,
                                          {
                                            class: "phase-arrow",
                                            "aria-label": "下一阶段",
                                            onClick:
                                              renderCache[15] ||
                                              (renderCache[15] = (e) => changePhase(1)),
                                          },
                                          {
                                            default: withCtx(() => [createTextVNode(" › ")]),
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
                                      class: "alive-counts",
                                    },
                                    {
                                      default: withCtx(() => [
                                        createVNode(Text, null, {
                                          default: withCtx(() => [
                                            createVNode(
                                              Text,
                                              {
                                                class: "alive-number",
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createTextVNode(
                                                    toDisplayString(seatStatistics.value.aliveOrdinary),
                                                    1,
                                                  ),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                            createTextVNode(
                                              " / " +
                                                toDisplayString(seatStatistics.value.ordinary) +
                                                " " +
                                                toDisplayString(
                                                  "day" === currentPhase.value.kind
                                                    ? "玩家"
                                                    : "普通玩家存活",
                                                ),
                                              1,
                                            ),
                                          ]),
                                          _: 1,
                                        }),
                                        seatStatistics.value.travelers
                                          ? (openBlock(),
                                            createBlock(
                                              Text,
                                              {
                                                key: 0,
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createVNode(
                                                    Text,
                                                    {
                                                      class: "alive-number",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode(
                                                          toDisplayString(
                                                            seatStatistics.value.aliveTravelers,
                                                          ),
                                                          1,
                                                        ),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ),
                                                  createTextVNode(
                                                    " / " +
                                                      toDisplayString(seatStatistics.value.travelers) +
                                                      " 旅行者",
                                                    1,
                                                  ),
                                                ]),
                                                _: 1,
                                              },
                                            ))
                                          : createCommentVNode("", true),
                                      ]),
                                      _: 1,
                                    },
                                  ),
                                  "setup" === currentPhase.value.kind
                                    ? (openBlock(),
                                      createBlock(
                                        View,
                                        {
                                          key: 0,
                                          class: "bench-actions bench-setup-actions",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Button,
                                              {
                                                class: "subtle-button bench-script",
                                                "aria-label": "选择剧本",
                                                title: currentScript.value.name,
                                                onClick:
                                                  renderCache[16] ||
                                                  (renderCache[16] = (e) => openSheet("scripts")),
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode(" ▤ 剧本 ")]),
                                                _: 1,
                                              },
                                              8,
                                              ["title"],
                                            ),
                                            createVNode(
                                              Button,
                                              {
                                                class: "gold-button bench-assign",
                                                onClick:
                                                  renderCache[17] ||
                                                  (renderCache[17] = (e) => openRoleAssignment()),
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createTextVNode(
                                                    toDisplayString(
                                                      Vi.value ? "查看角色分配" : "分配本局角色",
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
                                                class: "subtle-button bench-dispatch",
                                                onClick: openIdentityPanel,
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode(" 下发身份 ")]),
                                                _: 1,
                                              },
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ))
                                    : (openBlock(),
                                      createBlock(
                                        View,
                                        {
                                          key: 1,
                                          class: "bench-actions",
                                        },
                                        {
                                          default: withCtx(() => [
                                            "day" === currentPhase.value.kind
                                              ? (openBlock(),
                                                createElementBlock(
                                                  Fragment,
                                                  {
                                                    key: 0,
                                                  },
                                                  [
                                                    createVNode(
                                                      Button,
                                                      {
                                                        class: "gold-button",
                                                        onClick:
                                                          renderCache[18] ||
                                                          (renderCache[18] = (e) =>
                                                            (function () {
                                                              if (
                                                                gameState.value.ended ||
                                                                "day" !== currentPhase.value.kind
                                                              )
                                                                return Ga("请先切换到白天阶段");
                                                              if (activeVoteDraft.value)
                                                                return Ga("请先完成或取消当前投票");
                                                              const e = Object.values(na.value);
                                                              return e.some((e) => !e.nominator)
                                                                ? e.some((e) => !e.nominee)
                                                                  ? ($a(),
                                                                    void (seatInteraction.value = {
                                                                      type: "nomination",
                                                                      message:
                                                                        "请先点击提名人的座位（蓝色箭头）",
                                                                    }))
                                                                  : Ga("今天没有可被提名的玩家")
                                                                : Ga("今天没有可提名的玩家");
                                                            })()),
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createTextVNode(" 发起提名"),
                                                        ]),
                                                        _: 1,
                                                      },
                                                    ),
                                                    createVNode(
                                                      Button,
                                                      {
                                                        class: "subtle-button",
                                                        onClick:
                                                          renderCache[19] ||
                                                          (renderCache[19] = (e) => openSheet("end")),
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createTextVNode(" 结束本局 "),
                                                        ]),
                                                        _: 1,
                                                      },
                                                    ),
                                                  ],
                                                  64,
                                                ))
                                              : "night" === currentPhase.value.kind
                                                ? (openBlock(),
                                                  createBlock(
                                                    Button,
                                                    {
                                                      key: 1,
                                                      class: "gold-button bench-wake",
                                                      onClick: openWakePanel,
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode(" 唤醒指示 "),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ))
                                                : createCommentVNode("", true),
                                          ]),
                                          _: 1,
                                        },
                                      )),
                                  pendingExecutionSeat.value && "day" === currentPhase.value.kind
                                    ? (openBlock(),
                                      createBlock(
                                        Text,
                                        {
                                          key: 2,
                                          class: "execution-summary",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createTextVNode(
                                              toDisplayString(ka(pendingExecutionSeat.value.id)) +
                                                " 待处决",
                                              1,
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ))
                                    : createCommentVNode("", true),
                                ],
                                64,
                              )),
                      ]),
                      _: 1,
                    },
                    8,
                    ["class"],
                  )),
              createVNode(
                SeatActionPopover,
                {
                  open: D.value && !!selectedSeat.value,
                  anchor: ea.value,
                  viewport: viewport.value,
                  "seat-number": wa(selectedSeatId.value),
                  "role-name":
                    (null == (u = null == (e = selectedSeat.value) ? void 0 : e.role)
                      ? void 0
                      : u.name) || "未分配角色",
                  onClose: renderCache[20] || (renderCache[20] = (e) => (D.value = false)),
                  onAction: Ka,
                },
                null,
                8,
                ["open", "anchor", "viewport", "seat-number", "role-name"],
              ),
              nicknameSeat.value && nicknameEditorBounds.value && !isPlayerView.value
                ? (openBlock(),
                  createBlock(
                    SeatNicknamePopover,
                    {
                      key: 6,
                      modelValue: nicknameDraft.value,
                      "onUpdate:modelValue":
                        renderCache[21] || (renderCache[21] = (e) => (nicknameDraft.value = e)),
                      "seat-number": wa(nicknameSeat.value.id),
                      anchor: nicknameEditorBounds.value,
                      viewport: viewport.value,
                      onClose: renderCache[22] || (renderCache[22] = (e) => (nicknameSeatId.value = "")),
                      onSave: xa,
                      onClear: renderCache[23] || (renderCache[23] = (e) => xa("")),
                    },
                    null,
                    8,
                    ["modelValue", "seat-number", "anchor", "viewport"],
                  ))
                : createCommentVNode("", true),
              createVNode(
                RoleReferencePanel,
                {
                  open: isRoleSidebarOpen.value,
                  viewport: viewport.value,
                  script: currentScript.value,
                  seats: gameState.value.seats,
                  "initial-section": roleSidebarTab.value,
                  "wake-enabled": false,
                  onClose:
                    renderCache[24] || (renderCache[24] = (e) => (isRoleSidebarOpen.value = false)),
                  onReplaceIcon: ll,
                  onReorder: nl,
                  onSaveNightOrders: rl,
                  onRemoveRole: ol,
                },
                null,
                8,
                ["open", "viewport", "script", "seats", "initial-section"],
              ),
              createVNode(
                FloatingNotebook,
                {
                  open: isNotebookOpen.value,
                  modelValue: notebookText.value,
                  "onUpdate:modelValue":
                    renderCache[25] || (renderCache[25] = (e) => (notebookText.value = e)),
                  marks: notebookMarks.value,
                  "onUpdate:marks":
                    renderCache[26] || (renderCache[26] = (e) => (notebookMarks.value = e)),
                  seats: gameState.value.seats,
                  "stage-label": currentPhase.value.label,
                  "onUpdate:open": Va,
                },
                null,
                8,
                ["open", "modelValue", "marks", "seats", "stage-label"],
              ),
              "assign" === activeSheet.value && "batch" === assignmentMode.value
                ? (openBlock(),
                  createBlock(
                    GameRoleSelector,
                    {
                      key: 7,
                      roles: ua.value,
                      "initial-roles": selectedAssignmentRoles.value,
                      "player-count": seatStatistics.value.ordinary,
                      onClose: closeSheet,
                      onConfirm: assignRandomRoles,
                    },
                    null,
                    8,
                    ["roles", "initial-roles", "player-count"],
                  ))
                : createCommentVNode("", true),
              "assign" === activeSheet.value && "single" === assignmentMode.value
                ? (openBlock(),
                  createBlock(
                    SeatRolePicker,
                    {
                      key: 8,
                      "script-roles": sa.value,
                      "extra-travelers": da.value,
                      "current-role": null == (h = selectedSeat.value) ? void 0 : h.role,
                      onSelect: Qa,
                      onClear: Za,
                      onClose: closeSheet,
                    },
                    null,
                    8,
                    ["script-roles", "extra-travelers", "current-role"],
                  ))
                : createCommentVNode("", true),
              "status" === activeSheet.value && selectedSeat.value
                ? (openBlock(),
                  createBlock(
                    SeatStatusDialog,
                    {
                      key: 9,
                      seat: selectedSeat.value,
                      pending: gameState.value.pendingExecutionId === selectedSeatId.value,
                      onSelect: Ya,
                      onClose: closeSheet,
                    },
                    null,
                    8,
                    ["seat", "pending"],
                  ))
                : createCommentVNode("", true),
              "token" === activeSheet.value && selectedToken.value
                ? (openBlock(),
                  createBlock(
                    ReminderTokenDialog,
                    {
                      key: 10,
                      token: selectedToken.value,
                      "draft-text": He.value,
                      "onUpdate:draftText": renderCache[27] || (renderCache[27] = (e) => (He.value = e)),
                      onSave: ml,
                      onFlip: cl,
                      onDelete: deleteSelectedReminder,
                      onClose: closeSheet,
                    },
                    null,
                    8,
                    ["token", "draft-text"],
                  ))
                : createCommentVNode("", true),
              showStatusHint.value
                ? (openBlock(),
                  createBlock(
                    CompactDialog,
                    {
                      key: 11,
                      modelValue: hideStatusHint.value,
                      "onUpdate:modelValue":
                        renderCache[28] || (renderCache[28] = (e) => (hideStatusHint.value = e)),
                      class: "status-gesture-hint",
                      title: "操作提示",
                      message: "您可以通过长按座位来设置状态。",
                      "check-label": "不再提示",
                      onClose: Ua,
                      onConfirm: Ha,
                    },
                    null,
                    8,
                    ["modelValue"],
                  ))
                : createCommentVNode("", true),
              showTokenDeleteHint.value
                ? (openBlock(),
                  createBlock(
                    CompactDialog,
                    {
                      key: 12,
                      modelValue: hideTokenDeleteHint.value,
                      "onUpdate:modelValue":
                        renderCache[29] || (renderCache[29] = (e) => (hideTokenDeleteHint.value = e)),
                      class: "token-delete-gesture-hint",
                      title: "操作提示",
                      message: "标记已删除。您也可以长按标记直接删除。",
                      "check-label": "不再提示",
                      onClose: gl,
                      onConfirm: gl,
                    },
                    null,
                    8,
                    ["modelValue"],
                  ))
                : createCommentVNode("", true),
              Oi.value
                ? (openBlock(),
                  createBlock(
                    CompactDialog,
                    {
                      key: 13,
                      class: "seat-ability-dialog",
                      title: Oi.value.title,
                      message: Oi.value.message,
                      scrollable: Oi.value.message.length > 150,
                      onClose: renderCache[30] || (renderCache[30] = (e) => (abilitySeatId.value = "")),
                      onConfirm:
                        renderCache[31] || (renderCache[31] = (e) => (abilitySeatId.value = "")),
                    },
                    null,
                    8,
                    ["title", "message", "scrollable"],
                  ))
                : createCommentVNode("", true),
              "end" === activeSheet.value
                ? (openBlock(),
                  createBlock(EndGameDialog, {
                    key: 14,
                    onClose: closeSheet,
                    onConfirm: vl,
                  }))
                : createCommentVNode("", true),
              isIdentityPanelOpen.value
                ? (openBlock(),
                  createBlock(
                    IdentityDraw,
                    {
                      key: 15,
                      ref_key: "identityDrawRef",
                      ref: wakePanelRef,
                      seats: gameState.value.seats,
                      viewport: viewport.value,
                      onClose:
                        renderCache[32] ||
                        (renderCache[32] = (e) => (isIdentityPanelOpen.value = false)),
                      onComplete: bl,
                    },
                    null,
                    8,
                    ["seats", "viewport"],
                  ))
                : createCommentVNode("", true),
              isWakePanelOpen.value
                ? (openBlock(),
                  createBlock(
                    WakeInstructions,
                    {
                      key: 16,
                      script: currentScript.value,
                      seats: gameState.value.seats,
                      "bluff-roles": gameState.value.bluffRoles,
                      onClose:
                        renderCache[33] || (renderCache[33] = (e) => (isWakePanelOpen.value = false)),
                    },
                    null,
                    8,
                    ["script", "seats", "bluff-roles"],
                  ))
                : createCommentVNode("", true),
              !activeSheet.value ||
              ["status", "end", "token", "nomination"].includes(activeSheet.value) ||
              ("assign" === activeSheet.value && "bluff" !== assignmentMode.value)
                ? createCommentVNode("", true)
                : (openBlock(),
                  createBlock(
                    Sheet,
                    {
                      key: 17,
                      title: sheetTitle.value,
                      subtitle: sheetSubtitle.value,
                      wide: ["assign", "history", "scripts"].includes(activeSheet.value),
                      compact: "tokens" === activeSheet.value,
                      onClose: closeSheet,
                    },
                    createSlots(
                      {
                        default: withCtx(() => {
                          var e;
                          return [
                            "background" === activeSheet.value
                              ? (openBlock(),
                                createElementBlock(
                                  Fragment,
                                  {
                                    key: 0,
                                  },
                                  [
                                    createVNode(
                                      Image,
                                      {
                                        webp: true,
                                        class: "background-preview",
                                        src: unref(normalizeStaticImagePath)(
                                          gameState.value.background || "/static/ui/background.webp",
                                        ),
                                        mode: "aspectFill",
                                      },
                                      null,
                                      8,
                                      ["src"],
                                    ),
                                    createVNode(
                                      View,
                                      {
                                        class: "button-row background-actions",
                                      },
                                      {
                                        default: withCtx(() => [
                                          createVNode(
                                            Button,
                                            {
                                              class: "gold-button background-choose",
                                              onClick: sl,
                                            },
                                            {
                                              default: withCtx(() => [createTextVNode(" 选择本地图片")]),
                                              _: 1,
                                            },
                                          ),
                                          createVNode(
                                            Button,
                                            {
                                              class: "subtle-button background-reset",
                                              disabled: !gameState.value.background,
                                              onClick:
                                                renderCache[34] ||
                                                (renderCache[34] = (e) =>
                                                  updateSessionSetting("background", "")),
                                            },
                                            {
                                              default: withCtx(() => [
                                                createTextVNode(" 恢复默认背景 "),
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
                                  ],
                                  64,
                                ))
                              : "scripts" === activeSheet.value
                                ? (openBlock(),
                                  createElementBlock(
                                    Fragment,
                                    {
                                      key: 1,
                                    },
                                    [
                                      createVNode(
                                        View,
                                        {
                                          class: "script-grid",
                                        },
                                        {
                                          default: withCtx(() => [
                                            (openBlock(true),
                                            createElementBlock(
                                              Fragment,
                                              null,
                                              renderList(
                                                availableScripts.value,
                                                (e) => (
                                                  openBlock(),
                                                  createBlock(
                                                    View,
                                                    {
                                                      key: e.id,
                                                      class: normalizeClass([
                                                        "script-card",
                                                        {
                                                          selected: gameState.value.scriptId === e.id,
                                                        },
                                                      ]),
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createVNode(
                                                          Button,
                                                          {
                                                            class: "script-select",
                                                            onClick: (t) =>
                                                              (function (e) {
                                                                commitSession((t) =>
                                                                  updateSessionOptions(t, {
                                                                    scriptId: e.id,
                                                                  }),
                                                                ) && ((We.value = false), closeSheet());
                                                              })(e),
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createVNode(
                                                                Image,
                                                                {
                                                                  webp: true,
                                                                  src: unref(normalizeStaticImagePath)(
                                                                    imageFailures.value[e.logo]
                                                                      ? "/static/scripts/tb.webp"
                                                                      : e.logo ||
                                                                          "/static/scripts/tb.webp",
                                                                  ),
                                                                  mode: "aspectFill",
                                                                  onError: (t) =>
                                                                    (imageFailures.value[e.logo] = true),
                                                                },
                                                                null,
                                                                8,
                                                                ["src", "onError"],
                                                              ),
                                                              createVNode(
                                                                View,
                                                                null,
                                                                {
                                                                  default: withCtx(() => [
                                                                    createVNode(
                                                                      Text,
                                                                      {
                                                                        class: "script-card-name",
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
                                                                        class: "helper-text",
                                                                      },
                                                                      {
                                                                        default: withCtx(() => [
                                                                          createTextVNode(
                                                                            toDisplayString(
                                                                              e.roles.filter(Na).length,
                                                                            ) +
                                                                              " 个角色" +
                                                                              toDisplayString(
                                                                                e.author
                                                                                  ? " · " + e.author
                                                                                  : "",
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
                                                              gameState.value.scriptId === e.id
                                                                ? (openBlock(),
                                                                  createBlock(
                                                                    Text,
                                                                    {
                                                                      key: 0,
                                                                      class: "selected-tick",
                                                                    },
                                                                    {
                                                                      default: withCtx(() => [
                                                                        createTextVNode("✓"),
                                                                      ]),
                                                                      _: 1,
                                                                    },
                                                                  ))
                                                                : createCommentVNode("", true),
                                                            ]),
                                                            _: 2,
                                                          },
                                                          1032,
                                                          ["onClick"],
                                                        ),
                                                        tl(e)
                                                          ? createCommentVNode("", true)
                                                          : (openBlock(),
                                                            createBlock(
                                                              Button,
                                                              {
                                                                key: 0,
                                                                class: "script-delete",
                                                                "aria-label": `删除剧本：${e.name}`,
                                                                onClick: withModifiers(
                                                                  (t) =>
                                                                    (function (e) {
                                                                      !tl(e) &&
                                                                        customScripts.value.some(
                                                                          (t) => t.id === e.id,
                                                                        ) &&
                                                                        showModal({
                                                                          title: "删除剧本？",
                                                                          content: `将从本机删除「${e.name}」，已分配的座位角色会保留。${gameState.value.scriptId === e.id ? `当前剧本将切换为「${builtInScripts[0].name}」。` : ""}`,
                                                                          confirmText: "删除",
                                                                          cancelText: "取消",
                                                                          success: (t) => {
                                                                            if (t.confirm)
                                                                              try {
                                                                                const t =
                                                                                  customScripts.value.filter(
                                                                                    (t) => t.id !== e.id,
                                                                                  );
                                                                                saveCustomScripts(t);
                                                                                customScripts.value = t;
                                                                                gameState.value
                                                                                  .scriptId === e.id &&
                                                                                  (commitSession((e) =>
                                                                                    updateSessionOptions(
                                                                                      e,
                                                                                      {
                                                                                        scriptId:
                                                                                          builtInScripts[0]
                                                                                            .id,
                                                                                      },
                                                                                    ),
                                                                                  ),
                                                                                  (We.value = false));
                                                                                Ga("剧本已删除");
                                                                              } catch (i) {
                                                                                Ca(i);
                                                                              }
                                                                          },
                                                                          fail: Ca,
                                                                        });
                                                                    })(e),
                                                                  ["stop"],
                                                                ),
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  createTextVNode(" 删除剧本 "),
                                                                ]),
                                                                _: 2,
                                                              },
                                                              1032,
                                                              ["aria-label", "onClick"],
                                                            )),
                                                      ]),
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
                                          _: 1,
                                        },
                                      ),
                                      createVNode(
                                        View,
                                        {
                                          class: "button-row",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createVNode(
                                              Button,
                                              {
                                                class: "gold-button",
                                                onClick: il,
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createTextVNode(" 从本地 JSON 导入"),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                            createVNode(
                                              Button,
                                              {
                                                class: "subtle-button",
                                                onClick:
                                                  renderCache[35] ||
                                                  (renderCache[35] = (e) => {
                                                    Ke.value = "";
                                                    openSheet("import");
                                                  }),
                                              },
                                              {
                                                default: withCtx(() => [createTextVNode(" 粘贴 JSON ")]),
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
                                          class: "helper-text",
                                        },
                                        {
                                          default: withCtx(() => [
                                            createTextVNode(
                                              "自定义角色随剧本导入。图标可在角色资料中替换为本地图片。",
                                            ),
                                          ]),
                                          _: 1,
                                        },
                                      ),
                                    ],
                                    64,
                                  ))
                                : "import" === activeSheet.value
                                  ? (openBlock(),
                                    createElementBlock(
                                      Fragment,
                                      {
                                        key: 2,
                                      },
                                      [
                                        createVNode(
                                          Textarea,
                                          {
                                            modelValue: Ke.value,
                                            "onUpdate:modelValue":
                                              renderCache[36] ||
                                              (renderCache[36] = (e) => (Ke.value = e)),
                                            class: "json-editor",
                                            maxlength: "-1",
                                            placeholder: "粘贴包含剧本名称与角色资料的 JSON 数组",
                                          },
                                          null,
                                          8,
                                          ["modelValue"],
                                        ),
                                        createVNode(
                                          Button,
                                          {
                                            class: "gold-button full-width",
                                            onClick:
                                              renderCache[37] ||
                                              (renderCache[37] = (e) => importScriptJson(Ke.value)),
                                          },
                                          {
                                            default: withCtx(() => [createTextVNode(" 导入剧本 ")]),
                                            _: 1,
                                          },
                                        ),
                                      ],
                                      64,
                                    ))
                                  : "assign" === activeSheet.value
                                    ? (openBlock(),
                                      createElementBlock(
                                        Fragment,
                                        {
                                          key: 3,
                                        },
                                        [
                                          createVNode(
                                            Input,
                                            {
                                              modelValue: roleSearchQuery.value,
                                              "onUpdate:modelValue":
                                                renderCache[38] ||
                                                (renderCache[38] = (e) => (roleSearchQuery.value = e)),
                                              class: "search-input",
                                              placeholder: "搜索角色名称或 ID",
                                            },
                                            null,
                                            8,
                                            ["modelValue"],
                                          ),
                                          createVNode(
                                            View,
                                            {
                                              class: "filter-tabs",
                                            },
                                            {
                                              default: withCtx(() => [
                                                (openBlock(true),
                                                createElementBlock(
                                                  Fragment,
                                                  null,
                                                  renderList(
                                                    oa.value,
                                                    (e) => (
                                                      openBlock(),
                                                      createBlock(
                                                        Button,
                                                        {
                                                          key: e,
                                                          class: normalizeClass({
                                                            active: roleTeamFilter.value === e,
                                                          }),
                                                          onClick: (t) => (roleTeamFilter.value = e),
                                                        },
                                                        {
                                                          default: withCtx(() => [
                                                            createTextVNode(
                                                              toDisplayString(
                                                                "all" === e ? "全部" : ya(e),
                                                              ),
                                                              1,
                                                            ),
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
                                              ]),
                                              _: 1,
                                            },
                                          ),
                                          createVNode(
                                            View,
                                            {
                                              class: "role-grid",
                                            },
                                            {
                                              default: withCtx(() => [
                                                (openBlock(true),
                                                createElementBlock(
                                                  Fragment,
                                                  null,
                                                  renderList(
                                                    ma.value,
                                                    (e) => (
                                                      openBlock(),
                                                      createBlock(
                                                        View,
                                                        {
                                                          key: e.id,
                                                          class: "role-option",
                                                        },
                                                        {
                                                          default: withCtx(() => [
                                                            createVNode(
                                                              Button,
                                                              {
                                                                class: "role-pick",
                                                                onClick: (t) => Qa(e),
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  createVNode(
                                                                    RolePortrait,
                                                                    {
                                                                      role: e,
                                                                      size: 56,
                                                                    },
                                                                    null,
                                                                    8,
                                                                    ["role"],
                                                                  ),
                                                                  createVNode(
                                                                    Text,
                                                                    {
                                                                      class: normalizeClass(e.team),
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
                                                                    1032,
                                                                    ["class"],
                                                                  ),
                                                                  createVNode(
                                                                    Text,
                                                                    {
                                                                      class: "role-ability",
                                                                    },
                                                                    {
                                                                      default: withCtx(() => [
                                                                        createTextVNode(
                                                                          toDisplayString(e.ability),
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
                                                              ["onClick"],
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
                                              _: 1,
                                            },
                                          ),
                                          ma.value.length
                                            ? createCommentVNode("", true)
                                            : (openBlock(),
                                              createBlock(
                                                Text,
                                                {
                                                  key: 0,
                                                  class: "empty-state",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createTextVNode("没有找到对应角色"),
                                                  ]),
                                                  _: 1,
                                                },
                                              )),
                                          "batch" !== assignmentMode.value
                                            ? (openBlock(),
                                              createBlock(
                                                Button,
                                                {
                                                  key: 1,
                                                  class: "subtle-button full-width",
                                                  onClick: Za,
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createTextVNode(
                                                      toDisplayString(
                                                        "bluff" === assignmentMode.value
                                                          ? "清空此伪装"
                                                          : "移除该座位角色",
                                                      ),
                                                      1,
                                                    ),
                                                  ]),
                                                  _: 1,
                                                },
                                              ))
                                            : createCommentVNode("", true),
                                        ],
                                        64,
                                      ))
                                    : "tokens" === activeSheet.value
                                      ? (openBlock(),
                                        createElementBlock(
                                          Fragment,
                                          {
                                            key: 4,
                                          },
                                          [
                                            createVNode(
                                              View,
                                              {
                                                class: "input-row",
                                              },
                                              {
                                                default: withCtx(() => [
                                                  createVNode(
                                                    Input,
                                                    {
                                                      modelValue: Ue.value,
                                                      "onUpdate:modelValue":
                                                        renderCache[39] ||
                                                        (renderCache[39] = (e) => (Ue.value = e)),
                                                      class: "search-input",
                                                      maxlength: "80",
                                                      placeholder: "输入自定义提醒",
                                                    },
                                                    null,
                                                    8,
                                                    ["modelValue"],
                                                  ),
                                                  createVNode(
                                                    Button,
                                                    {
                                                      class: "gold-button",
                                                      onClick:
                                                        renderCache[40] ||
                                                        (renderCache[40] = (e) => addReminder(Ue.value)),
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode(" 添加 "),
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
                                                class: "reminder-grid",
                                              },
                                              {
                                                default: withCtx(() => [
                                                  (openBlock(true),
                                                  createElementBlock(
                                                    Fragment,
                                                    null,
                                                    renderList(
                                                      ca.value,
                                                      (e) => (
                                                        openBlock(),
                                                        createBlock(
                                                          Button,
                                                          {
                                                            key: e.key,
                                                            class: "reminder-choice",
                                                            "aria-label": e.label,
                                                            onClick: (t) => addReminder(e.label, e),
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createVNode(
                                                                ReminderToken,
                                                                {
                                                                  token: e,
                                                                  size: 48,
                                                                },
                                                                null,
                                                                8,
                                                                ["token"],
                                                              ),
                                                            ]),
                                                            _: 2,
                                                          },
                                                          1032,
                                                          ["aria-label", "onClick"],
                                                        )
                                                      ),
                                                    ),
                                                    128,
                                                  )),
                                                ]),
                                                _: 1,
                                              },
                                            ),
                                          ],
                                          64,
                                        ))
                                      : "vote" === activeSheet.value && activeVoteDraft.value
                                        ? (openBlock(),
                                          createElementBlock(
                                            Fragment,
                                            {
                                              key: 5,
                                            },
                                            [
                                              createVNode(
                                                View,
                                                {
                                                  class: "setting-row",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createVNode(Text, null, {
                                                      default: withCtx(() => [
                                                        createTextVNode("自动计票"),
                                                      ]),
                                                      _: 1,
                                                    }),
                                                    createVNode(Text, null, {
                                                      default: withCtx(() => [
                                                        createTextVNode(
                                                          toDisplayString(automaticVoteTotal.value) +
                                                            " 票",
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
                                                  class: "field-group",
                                                },
                                                {
                                                  default: withCtx(() => [
                                                    createVNode(
                                                      Text,
                                                      {
                                                        class: "field-label",
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createTextVNode("处决票数门槛"),
                                                        ]),
                                                        _: 1,
                                                      },
                                                    ),
                                                    createVNode(
                                                      Input,
                                                      {
                                                        class: "search-input",
                                                        type: "number",
                                                        value:
                                                          activeVoteDraft.value.overrideThreshold ??
                                                          activeVoteDraft.value.threshold,
                                                        onInput:
                                                          renderCache[41] ||
                                                          (renderCache[41] = (e) =>
                                                            (activeVoteDraft.value.overrideThreshold =
                                                              Fa(e.detail.value))),
                                                      },
                                                      null,
                                                      8,
                                                      ["value"],
                                                    ),
                                                  ]),
                                                  _: 1,
                                                },
                                              ),
                                              (openBlock(true),
                                              createElementBlock(
                                                Fragment,
                                                null,
                                                renderList(
                                                  activeVoteDraft.value.people,
                                                  (e) => (
                                                    openBlock(),
                                                    createBlock(
                                                      View,
                                                      {
                                                        key: e.id,
                                                        class: "voter-row",
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createVNode(
                                                            Button,
                                                            {
                                                              class: normalizeClass([
                                                                "voter-toggle",
                                                                {
                                                                  checked: e.voted,
                                                                },
                                                              ]),
                                                              onClick: (t) => kl(e.id),
                                                            },
                                                            {
                                                              default: withCtx(() => [
                                                                createTextVNode(
                                                                  toDisplayString(e.voted ? "✓" : "○") +
                                                                    " " +
                                                                    toDisplayString(e.seatNumber) +
                                                                    "号 " +
                                                                    toDisplayString(e.roleName),
                                                                  1,
                                                                ),
                                                              ]),
                                                              _: 2,
                                                            },
                                                            1032,
                                                            ["class", "onClick"],
                                                          ),
                                                          createVNode(
                                                            Input,
                                                            {
                                                              class: "weight-input",
                                                              type: "number",
                                                              value: e.weight,
                                                              onInput: (t) =>
                                                                (e.weight = Number(t.detail.value) || 0),
                                                            },
                                                            null,
                                                            8,
                                                            ["value", "onInput"],
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
                                              (
                                                null == (e = activeVoteDraft.value.warnings)
                                                  ? void 0
                                                  : e.length
                                              )
                                                ? (openBlock(),
                                                  createBlock(
                                                    Text,
                                                    {
                                                      key: 0,
                                                      class: "warning-text",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode(
                                                          toDisplayString(
                                                            activeVoteDraft.value.warnings.join("；"),
                                                          ),
                                                          1,
                                                        ),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ))
                                                : createCommentVNode("", true),
                                              activeVoteDraft.value.applyToCurrent
                                                ? createCommentVNode("", true)
                                                : (openBlock(),
                                                  createBlock(
                                                    Text,
                                                    {
                                                      key: 1,
                                                      class: "warning-text",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode(
                                                          "这是较早阶段的历史补录，只保存票型，不消耗当前鬼票。",
                                                        ),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  )),
                                            ],
                                            64,
                                          ))
                                        : "history" === activeSheet.value
                                          ? (openBlock(),
                                            createElementBlock(
                                              Fragment,
                                              {
                                                key: 6,
                                              },
                                              [
                                                gameState.value.votes.length
                                                  ? createCommentVNode("", true)
                                                  : (openBlock(),
                                                    createBlock(
                                                      View,
                                                      {
                                                        key: 0,
                                                        class: "empty-state",
                                                      },
                                                      {
                                                        default: withCtx(() => [
                                                          createVNode(Text, null, {
                                                            default: withCtx(() => [
                                                              createTextVNode("还没有投票记录"),
                                                            ]),
                                                            _: 1,
                                                          }),
                                                          createVNode(
                                                            Text,
                                                            {
                                                              class: "helper-text",
                                                            },
                                                            {
                                                              default: withCtx(() => [
                                                                createTextVNode(
                                                                  "白天发起提名后，完整票型会保存在这里。",
                                                                ),
                                                              ]),
                                                              _: 1,
                                                            },
                                                          ),
                                                        ]),
                                                        _: 1,
                                                      },
                                                    )),
                                                (openBlock(true),
                                                createElementBlock(
                                                  Fragment,
                                                  null,
                                                  renderList(
                                                    gameState.value.votes,
                                                    (e) => (
                                                      openBlock(),
                                                      createBlock(
                                                        View,
                                                        {
                                                          key: e.id,
                                                          class: "history-card",
                                                        },
                                                        {
                                                          default: withCtx(() => [
                                                            createVNode(
                                                              View,
                                                              {
                                                                class: "history-heading",
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  createVNode(
                                                                    Text,
                                                                    null,
                                                                    {
                                                                      default: withCtx(() => [
                                                                        createTextVNode(
                                                                          toDisplayString(
                                                                            unref(describeStage)(e.stage)
                                                                              .label,
                                                                          ),
                                                                          1,
                                                                        ),
                                                                      ]),
                                                                      _: 2,
                                                                    },
                                                                    1024,
                                                                  ),
                                                                  createVNode(
                                                                    Text,
                                                                    null,
                                                                    {
                                                                      default: withCtx(() => {
                                                                        var t, i;
                                                                        return [
                                                                          createTextVNode(
                                                                            toDisplayString(
                                                                              null ==
                                                                                (t = e.people.find(
                                                                                  (t) =>
                                                                                    t.id ===
                                                                                    e.nominatorId,
                                                                                ))
                                                                                ? void 0
                                                                                : t.seatNumber,
                                                                            ) +
                                                                              "号 → " +
                                                                              toDisplayString(
                                                                                null ==
                                                                                  (i = e.people.find(
                                                                                    (t) =>
                                                                                      t.id ===
                                                                                      e.nomineeId,
                                                                                  ))
                                                                                  ? void 0
                                                                                  : i.seatNumber,
                                                                              ) +
                                                                              "号",
                                                                            1,
                                                                          ),
                                                                        ];
                                                                      }),
                                                                      _: 2,
                                                                    },
                                                                    1024,
                                                                  ),
                                                                  createVNode(
                                                                    Text,
                                                                    {
                                                                      class: "history-total",
                                                                    },
                                                                    {
                                                                      default: withCtx(() => [
                                                                        createTextVNode(
                                                                          toDisplayString(e.total) +
                                                                            " 票",
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
                                                            createVNode(
                                                              View,
                                                              {
                                                                class: "history-voters",
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  (openBlock(true),
                                                                  createElementBlock(
                                                                    Fragment,
                                                                    null,
                                                                    renderList(
                                                                      e.people,
                                                                      (e) => (
                                                                        openBlock(),
                                                                        createBlock(
                                                                          Text,
                                                                          {
                                                                            key: e.id,
                                                                            class: normalizeClass({
                                                                              yes: e.voted,
                                                                            }),
                                                                          },
                                                                          {
                                                                            default: withCtx(() => [
                                                                              createTextVNode(
                                                                                toDisplayString(
                                                                                  e.seatNumber,
                                                                                ) +
                                                                                  toDisplayString(
                                                                                    e.voted ? "✓" : "·",
                                                                                  ),
                                                                                1,
                                                                              ),
                                                                            ]),
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
                                                            ),
                                                            createVNode(
                                                              View,
                                                              {
                                                                class: "history-bottom",
                                                              },
                                                              {
                                                                default: withCtx(() => [
                                                                  createVNode(
                                                                    Text,
                                                                    null,
                                                                    {
                                                                      default: withCtx(() => {
                                                                        return [
                                                                          createTextVNode(
                                                                            toDisplayString(
                                                                              ((t = e.outcome),
                                                                              {
                                                                                below: "未达门槛",
                                                                                tie: "平票",
                                                                                pending: "待处决",
                                                                                lower: "未超过最高票",
                                                                              }[t] || "已记录"),
                                                                            ) +
                                                                              " · 门槛 " +
                                                                              toDisplayString(
                                                                                e.threshold,
                                                                              ),
                                                                            1,
                                                                          ),
                                                                        ];
                                                                        var t;
                                                                      }),
                                                                      _: 2,
                                                                    },
                                                                    1024,
                                                                  ),
                                                                  isPlayerView.value
                                                                    ? createCommentVNode("", true)
                                                                    : (openBlock(),
                                                                      createBlock(
                                                                        Button,
                                                                        {
                                                                          key: 0,
                                                                          class: "text-button",
                                                                          onClick: (t) =>
                                                                            (function (e) {
                                                                              isPlayerView.value ||
                                                                                ((voteHistoryDraft.value =
                                                                                  JSON.parse(
                                                                                    JSON.stringify(e),
                                                                                  )),
                                                                                openSheet(
                                                                                  "historyEdit",
                                                                                ));
                                                                            })(e),
                                                                        },
                                                                        {
                                                                          default: withCtx(() => [
                                                                            createTextVNode(" 修正"),
                                                                          ]),
                                                                          _: 2,
                                                                        },
                                                                        1032,
                                                                        ["onClick"],
                                                                      )),
                                                                  isPlayerView.value
                                                                    ? createCommentVNode("", true)
                                                                    : (openBlock(),
                                                                      createBlock(
                                                                        Button,
                                                                        {
                                                                          key: 1,
                                                                          class:
                                                                            "text-button danger-text",
                                                                          onClick: (t) => Gl(e.id),
                                                                        },
                                                                        {
                                                                          default: withCtx(() => [
                                                                            createTextVNode(" 删除 "),
                                                                          ]),
                                                                          _: 2,
                                                                        },
                                                                        1032,
                                                                        ["onClick"],
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
                                              ],
                                              64,
                                            ))
                                          : "historyEdit" === activeSheet.value && voteHistoryDraft.value
                                            ? (openBlock(),
                                              createElementBlock(
                                                Fragment,
                                                {
                                                  key: 7,
                                                },
                                                [
                                                  createVNode(
                                                    Text,
                                                    {
                                                      class: "helper-text",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode(
                                                          "修改只修正历史记录和当天摘要，不恢复或消耗当前鬼票。",
                                                        ),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ),
                                                  createVNode(
                                                    View,
                                                    {
                                                      class: "setting-row",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createVNode(Text, null, {
                                                          default: withCtx(() => [
                                                            createTextVNode("自动计票"),
                                                          ]),
                                                          _: 1,
                                                        }),
                                                        createVNode(
                                                          Text,
                                                          {
                                                            class: "history-draft-total",
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createTextVNode(
                                                                toDisplayString(
                                                                  voteHistoryDraft.value.people.reduce(
                                                                    (e, t) =>
                                                                      e +
                                                                      ((t.voted && Number(t.weight)) ||
                                                                        0),
                                                                    0,
                                                                  ),
                                                                ) + " 票",
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
                                                    View,
                                                    {
                                                      class: "field-group",
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createVNode(
                                                          Text,
                                                          {
                                                            class: "field-label",
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createTextVNode("门槛"),
                                                            ]),
                                                            _: 1,
                                                          },
                                                        ),
                                                        createVNode(
                                                          Input,
                                                          {
                                                            class: "search-input",
                                                            type: "number",
                                                            value:
                                                              voteHistoryDraft.value.overrideThreshold ??
                                                              voteHistoryDraft.value.threshold,
                                                            onInput:
                                                              renderCache[42] ||
                                                              (renderCache[42] = (e) =>
                                                                (voteHistoryDraft.value.overrideThreshold =
                                                                  Fa(e.detail.value))),
                                                          },
                                                          null,
                                                          8,
                                                          ["value"],
                                                        ),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ),
                                                  (openBlock(true),
                                                  createElementBlock(
                                                    Fragment,
                                                    null,
                                                    renderList(
                                                      voteHistoryDraft.value.people,
                                                      (e) => (
                                                        openBlock(),
                                                        createBlock(
                                                          View,
                                                          {
                                                            key: e.id,
                                                            class: "voter-row",
                                                          },
                                                          {
                                                            default: withCtx(() => [
                                                              createVNode(
                                                                Button,
                                                                {
                                                                  class: normalizeClass([
                                                                    "voter-toggle",
                                                                    {
                                                                      checked: e.voted,
                                                                    },
                                                                  ]),
                                                                  onClick: (t) => (e.voted = !e.voted),
                                                                },
                                                                {
                                                                  default: withCtx(() => [
                                                                    createTextVNode(
                                                                      toDisplayString(
                                                                        e.voted ? "✓" : "○",
                                                                      ) +
                                                                        " " +
                                                                        toDisplayString(e.seatNumber) +
                                                                        "号 " +
                                                                        toDisplayString(e.roleName),
                                                                      1,
                                                                    ),
                                                                  ]),
                                                                  _: 2,
                                                                },
                                                                1032,
                                                                ["class", "onClick"],
                                                              ),
                                                              createVNode(
                                                                Input,
                                                                {
                                                                  class: "weight-input",
                                                                  type: "number",
                                                                  value: e.weight,
                                                                  onInput: (t) =>
                                                                    (e.weight =
                                                                      Number(t.detail.value) || 0),
                                                                },
                                                                null,
                                                                8,
                                                                ["value", "onInput"],
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
                                                  createVNode(
                                                    Button,
                                                    {
                                                      class: "gold-button full-width",
                                                      onClick: xl,
                                                    },
                                                    {
                                                      default: withCtx(() => [
                                                        createTextVNode(" 保存修正 "),
                                                      ]),
                                                      _: 1,
                                                    },
                                                  ),
                                                ],
                                                64,
                                              ))
                                            : createCommentVNode("", true),
                          ];
                        }),
                        _: 2,
                      },
                      [
                        "vote" === activeSheet.value
                          ? {
                              name: "footer",
                              fn: withCtx(() => [
                                createVNode(
                                  Button,
                                  {
                                    class: "gold-button full-width",
                                    onClick: renderCache[43] || (renderCache[43] = (e) => closeSheet()),
                                  },
                                  {
                                    default: withCtx(() => [createTextVNode(" 返回圆桌继续录票 ")]),
                                    _: 1,
                                  },
                                ),
                              ]),
                              key: "0",
                            }
                          : void 0,
                      ],
                    ),
                    1032,
                    ["title", "subtitle", "wide", "compact"],
                  )),
            ];
          }),
          _: 1,
        },
        8,
        ["class", "style"],
      )
    );
  };
}
export { createGrimoireView };
