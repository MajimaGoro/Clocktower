import { loadSession } from "../storage/session.js";
import { createSession } from "../domain/session.js";
// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { DEFAULT_ROLE_IMAGE } from "../data/assets.js";
import { BUILT_IN_FABLED_ROLES } from "../data/fabledRoles.js";
import { GLOBAL_REMINDER_FIELD_NAMES, REMINDER_FIELD_NAMES } from "../data/reminders.js";
import { builtInScripts } from "../data/scripts.js";
import { PLAYER_ROLE_TEAMS, TEAM_LABELS } from "../data/teams.js";
import { countSeats, getRecommendedComposition } from "../domain/composition.js";
import { createAppError } from "../domain/errors.js";
import { fabledRoleById } from "../domain/fabledRoles.js";
import { pickLocalFile, pickLocalImage, readLocalFile } from "../services/localFiles.js";
import {
  addSeat,
  cloneGameData,
  createEntityId,
  createSeat,
  failGameRule,
  hasOwn,
  isTravelerSeat,
  removeReminder,
  requireInteger,
  requireSeatIndex,
  resetGame,
  revealReviewSeat,
  setBluffRole,
  setSeatRole,
  transferSeatLayouts,
  updateReminder,
  updateSessionOptions,
} from "../domain/game.js";
import { useLongPress } from "../composables/useLongPress.js";
import { buildNightOrder } from "../domain/nightOrder.js";
import { normalizeNotebookMarks } from "../domain/notebook.js";
import { findMatchingRole, getReminderImage, isCustomReminder } from "../domain/reminders.js";
import {
  isAllowedImageSource,
  normalizeNightPosition,
  normalizeReminderTexts,
  normalizeRole,
  normalizeRoleId,
  normalizedRoles,
  selectRoleImage,
  trimAndLimitText,
} from "../domain/roleNormalization.js";
import { hashScriptContent } from "../domain/scripts.js";
import { getSeatGlowColors } from "../domain/seatAppearance.js";
import {
  canPlaceSeatLabels,
  circleIntersectsRect,
  measureSeatNumberBounds,
} from "../domain/seatLayout.js";
import { changeStage, describeStage } from "../domain/stages.js";
import {
  playTimerChimes,
  stopTimerChimes,
  timerAudioState,
  unlockTimerAudio,
} from "../services/timerAudio.js";
import { isPlainObject } from "../domain/validation.js";
import {
  calculateVoteTotals,
  getVoteOutcome,
  refreshDayVoteOutcomes,
  summarizeDayVotes,
  toggleDraftVote,
  createVoteDraft,
  submitVoteRecord,
  editVoteRecord,
  deleteVoteRecord,
} from "../domain/voting.js";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  showModal,
  showToast,
  vibrateShort,
  watch,
} from "../runtime.js";
import { onHide, onResize, onShow } from "../runtime/lifecycle.js";
import { getViewportInfo } from "../runtime/viewport.js";
import { STORAGE_KEYS } from "../storage/keys.js";
import { loadPreferences, savePreferences } from "../storage/preferences.js";
import { saveCustomScripts } from "../storage/scripts.js";
import { loadStoredData, saveStoredData } from "../storage/storage.js";
import { isScriptsData, isSessionData } from "../storage/validation.js";
/*
 * 对局状态、视图选择器和事件处理。领域规则位于 src/domain/，存档位于 src/storage/。
 * 保留原有 watch、页面生命周期、计时器与卸载清理的执行顺序。
 */
function useGrimoireState(props) {
  var t, i, a;
  const gameState = ref(loadSession() || createSession()),
    customScripts = ref(loadStoredData(STORAGE_KEYS.scripts, isScriptsData, [])),
    hasUnsavedSessionChanges = ref(false),
    activeSheet = ref(""),
    isPlayerView = ref(false),
    S = ref(false),
    z = ref(0),
    V = ref(0);
  let L;
  const j = ref(false),
    O = ref(false),
    D = ref(false),
    selectedSeatId = ref(""),
    selectedTokenId = ref(""),
    nicknameSeatId = ref(""),
    nicknameDraft = ref(""),
    nicknameSeat = computed(() => gameState.value.seats.find((e) => e.id === nicknameSeatId.value)),
    nicknameEditorBounds = computed(() => {
      const e = Qi.value.find((e) => e.seat.id === nicknameSeatId.value);
      if (!e) return null;
      const t = e.numberBounds;
      return {
        left: Ui.value.x + t.left,
        right: Ui.value.x + t.right,
        top: Ui.value.y + t.top,
        bottom: Ui.value.y + t.bottom,
      };
    }),
    assignmentMode = ref("batch"),
    selectedAssignmentRoles = ref([]),
    roleSearchQuery = ref(""),
    roleTeamFilter = ref("all"),
    roleSidebarTab = ref("roles"),
    allowDuplicateRoles = ref(false),
    isRoleSidebarOpen = ref(false),
    isNotebookOpen = ref(false),
    bluffSlotIndex = ref(0),
    We = ref(false),
    imageFailures = ref({}),
    Ue = ref(""),
    He = ref(""),
    Ke = ref(""),
    notebookText = ref(gameState.value.notebook),
    notebookMarks = ref(gameState.value.notebookMarks || []),
    isWakePanelOpen = ref(false),
    isIdentityPanelOpen = ref(false),
    wakePanelRef = ref(null),
    showStatusHint = ref(false),
    hideStatusHint = ref(loadPreferences().hideStatusHint),
    showTokenDeleteHint = ref(false),
    hideTokenDeleteHint = ref(loadPreferences().hideTokenDeleteHint),
    abilitySeatId = ref(""),
    seatPressGesture = useLongPress(function (e) {
      if (!Pa()) return;
      D.value = false;
      j.value = false;
      O.value = false;
      selectedSeatId.value = e;
      qa(e, false);
    }),
    tokenPressGesture = useLongPress(function (e) {
      if (
        isPlayerView.value ||
        e.add ||
        !gameState.value.seats.some(
          (t) => t.id === e.seatId && t.tokens.some((t) => t.id === e.token.id),
        )
      )
        return;
      commitSession((t) => removeReminder(t, e.seatId, e.token.id));
    }),
    activeVoteDraft = ref(null),
    voteHistoryDraft = ref(null),
    timerMinutes = ref(5),
    nowMillis = ref(Date.now()),
    seatInteraction = ref(null),
    isEditingLayout = ref(false),
    activeSeatDrag = ref(null);
  let timerInterval,
    notebookSaveTimeout,
    ignoreSeatTapUntil = 0,
    isReassignConfirmationOpen = false,
    lastAlarmDeadline =
      Number.isFinite(gameState.value.timerEndsAt) && gameState.value.timerEndsAt <= nowMillis.value
        ? gameState.value.timerEndsAt
        : null;
  const initialWindowInfo = getViewportInfo(),
    viewport = ref({
      width: initialWindowInfo.windowWidth || 390,
      height: initialWindowInfo.windowHeight || 844,
      top: 0,
      bottom: (null == (t = initialWindowInfo.safeAreaInsets) ? void 0 : t.bottom) || 0,
      left: (null == (i = initialWindowInfo.safeAreaInsets) ? void 0 : i.left) || 0,
      right: (null == (a = initialWindowInfo.safeAreaInsets) ? void 0 : a.right) || 0,
    }),
    xi = computed(() =>
      viewport.value.width <= 600 || (isLandscape.value && viewport.value.height < 550) ? 44 : 48,
    ),
    Gi = ["townsfolk", "outsider", "minion", "demon"],
    availableScripts = computed(() => [...builtInScripts, ...customScripts.value]),
    currentScript = computed(
      () => availableScripts.value.find((e) => e.id === gameState.value.scriptId) || builtInScripts[0],
    ),
    Ii = computed(() =>
      (function (e) {
        const t = [],
          i = new Set(),
          a = Array.isArray(null == e ? void 0 : e.roles) ? e.roles : [];
        for (const l of [...a, ...BUILT_IN_FABLED_ROLES]) {
          if (
            !l ||
            !["fabled", "传奇角色"].includes(
              String(l.team || "")
                .trim()
                .toLowerCase(),
            )
          )
            continue;
          const e = normalizeRoleId(l.id);
          if (!e || i.has(e)) continue;
          const a = fabledRoleById.get(e),
            n = isAllowedImageSource(l.image)
              ? l.image
              : (null == a ? void 0 : a.image) || DEFAULT_ROLE_IMAGE;
          t.push(
            normalizeRole({
              ...a,
              ...l,
              image: n,
            }),
          );
          i.add(e);
        }
        return t;
      })(currentScript.value),
    ),
    seatStatistics = computed(() => countSeats(gameState.value)),
    defaultComposition = computed(() => getRecommendedComposition(seatStatistics.value.ordinary)),
    currentPhase = computed(() => describeStage(gameState.value.stage)),
    phaseLabel = computed(() =>
      gameState.value.ended
        ? "复盘模式"
        : "setup" === currentPhase.value.kind
          ? "准备中"
          : 1 === gameState.value.stage
            ? "首夜"
            : `第 ${currentPhase.value.day} ${"night" === currentPhase.value.kind ? "夜" : "天"}`,
    ),
    winnerLabel = computed(
      () =>
        ({
          good: "善良获胜",
          evil: "邪恶获胜",
        })[gameState.value.reviewWinner] || "",
    ),
    zi = computed(() => gameState.value.seats.filter((e) => !_a(e.id))),
    Vi = computed(() => gameState.value.seats.every((e) => !!e.role)),
    selectedSeat = computed(() => gameState.value.seats.find((e) => e.id === selectedSeatId.value)),
    selectedToken = computed(() => {
      var e;
      return null == (e = selectedSeat.value)
        ? void 0
        : e.tokens.find((e) => e.id === selectedTokenId.value);
    }),
    Oi = computed(() => {
      if (!abilitySeatId.value) return null;
      const e = gameState.value.seats.find((e) => e.id === abilitySeatId.value);
      if (!e) return null;
      const t = e.role;
      if (!t)
        return {
          title: "未分配角色",
          message: "该座位尚未分配角色。",
        };
      const i =
          "traveler" === t.team ||
          !currentScript.value.roles.some(
            (e) => normalizeRoleId(e.id) === normalizeRoleId(t.id) || e.name === t.name,
          ),
        a = [
          ["firstNight", "首夜行动"],
          ["otherNight", "其他夜行动"],
        ].map(([a, n]) => {
          const r = buildNightOrder(currentScript.value, gameState.value.seats, a).find((t) =>
              t.seats.some((t) => t.id === e.id),
            ),
            o = i ? t[`${a}Reminder`] : null == r ? void 0 : r.reminder;
          return `${n}\n${(i ? Boolean(o || t[a] > 0) : Boolean(r)) ? o || "该角色本夜有行动，暂无行动说明。" : "该角色本夜没有夜间行动。"}`;
        });
      return {
        title: t.name,
        message: [`角色能力\n${t.ability || "该角色暂无能力说明。"}`, ...a].join("\n\n"),
      };
    }),
    pendingExecutionSeat = computed(() =>
      gameState.value.seats.find((e) => e.id === gameState.value.pendingExecutionId),
    ),
    isLandscape = computed(() => viewport.value.width > viewport.value.height),
    layoutOrientation = computed(() => (isLandscape.value ? "landscape" : "portrait")),
    Pi = computed(() => Yi.value.size),
    Wi = computed(() => {
      let e = Math.round(Pi.value * gameState.value.zoom);
      for (; e > 24 && !canPlaceSeatLabels(Xi.value, e);) e--;
      return e;
    }),
    qi = computed(() => {
      const { width: e, height: t, top: i } = viewport.value,
        a = isLandscape.value && t < 550,
        l = a ? 32 : isLandscape.value ? 100 : 12,
        n = a ? 256 : l,
        r = i + (a ? 12 : 92);
      return {
        x: l,
        y: r,
        width: Math.max(220, e - l - n),
        height: Math.max(160, t - r - (a ? 12 : 170) - viewport.value.bottom),
      };
    }),
    Ui = computed(() => {
      if (!isLandscape.value) return qi.value;
      const { width: e, height: t, top: i, bottom: a } = viewport.value,
        l = t < 550,
        n = l ? 48 : 56,
        r = l ? 256 : e <= 600 ? 273 : 333,
        o = Math.max(1, e - n - r),
        s = Math.max(1, t - i - a - 34);
      return {
        x: (e - o) / 2,
        y: i + (t - i - a - s) / 2,
        width: o,
        height: s,
      };
    }),
    Hi = computed(() => ({
      "--safe-top": `${viewport.value.top}px`,
      "--safe-bottom": `${viewport.value.bottom}px`,
    })),
    Ji = computed(() => ({
      left: `${Ui.value.x}px`,
      top: `${Ui.value.y}px`,
      width: `${Ui.value.width}px`,
      height: `${Ui.value.height}px`,
    })),
    Ki = computed(() => ({
      left: `${Ui.value.x + Ui.value.width / 2}px`,
      top: `${Ui.value.y + Ui.value.height / 2}px`,
      maxWidth: `${Math.max(112, Math.min(360, Math.min(Ui.value.width, Ui.value.height) - Math.round(Pi.value) - Wi.value - 24))}px`,
    })),
    Yi = computed(() => {
      const e = qi.value.width / 2,
        t = qi.value.height / 2,
        i = gameState.value.seats.length,
        a = (e, t) => Math.max(32, Math.min(120, 2 * e * Math.sin(Math.PI / Math.max(2, t)) * 0.9)),
        n = (i) => Math.max(0, Math.min(e - i / 2 - 5, t - i / 2 - 5));
      let r = a(n(32), i),
        o = n(r);
      const s = a(o, 10);
      r > s && ((r = s), (o = n(r)));
      const d = a(o, i);
      return (
        r > d && ((r = d), (o = n(r))),
        {
          size: r,
          radius: o,
        }
      );
    }),
    Xi = computed(() => {
      const e = isLandscape.value
        ? Math.max(0, (Math.min(Ui.value.width, Ui.value.height - 64) - Math.round(Pi.value)) / 2)
        : Yi.value.radius;
      let t = e,
        i = e;
      const a = () =>
          gameState.value.seats.map((e, a) => {
            const n = (a / gameState.value.seats.length) * Math.PI * 2 - Math.PI / 2;
            return {
              x: Math.cos(n) * t,
              y: Math.sin(n) * i,
              nickname: gameState.value.seats[a].nickname || "",
              number: a + 1,
            };
          }),
        n = isLandscape.value
          ? Math.max(e, (Ui.value.width - Pi.value) / 2 - 8)
          : Math.max(e, (Ui.value.height - Pi.value) / 2 - 28);
      for (; !canPlaceSeatLabels(a(), Math.round(Pi.value)) && (isLandscape.value ? t : i) < n;)
        isLandscape.value ? (t = Math.min(n, t + 4)) : (i = Math.min(n, i + 4));
      if (isLandscape.value) {
        const e = Math.max(i, Ui.value.height / 2 - 25);
        for (; !canPlaceSeatLabels(a(), 32) && i < e;) i = Math.min(e, i + 4);
      }
      return a();
    }),
    Qi = computed(() =>
      (function (e, t, i) {
        const a = [],
          l = [];
        for (let n = 0; n <= 80; n += 4)
          for (let e = -96; e <= 96; e += 4)
            l.push({
              dx: e,
              dy: n,
            });
        return (
          l.sort((e, t) => e.dx ** 2 + e.dy ** 2 - t.dx ** 2 - t.dy ** 2),
          e.map((n) => {
            const r = measureSeatNumberBounds(n.x, n.y, t, n.seat.nickname, n.number),
              o = r.right - r.left;
            let s = r;
            for (const { dx: d, dy: u } of l) {
              const l = Math.max(i.left, Math.min(r.left + d, i.right - o)),
                n = {
                  left: l,
                  right: l + o,
                  top: r.top + u,
                  bottom: r.bottom + u,
                };
              if (!(
                n.bottom > i.bottom ||
                e.some((e) => circleIntersectsRect(e.x, e.y, t / 2, n, 0)) ||
                a.some((e) => {
                  return (
                    (i = e),
                    (t = n).left < i.right + 2 &&
                      t.right + 2 > i.left &&
                      t.top < i.bottom + 2 &&
                      t.bottom + 2 > i.top
                  );
                  var t, i;
                })
              )) {
                s = n;
                break;
              }
            }
            return (
              a.push(s),
              {
                ...n,
                numberBounds: s,
              }
            );
          })
        );
      })(
        gameState.value.seats.map((e, t) => {
          var i, a;
          const n = gameState.value.ended && !_a(e.id),
            r = gameState.value.ended ? !n : !isPlayerView.value,
            o =
              null == (a = null == (i = gameState.value.layouts) ? void 0 : i[layoutOrientation.value])
                ? void 0
                : a[e.id],
            s = "expanded" === (null == o ? void 0 : o.space) ? Ui.value : qi.value,
            d = o ? s.x + o.x * s.width - Ui.value.x : Ui.value.width / 2 + Xi.value[t].x,
            u = o ? s.y + o.y * s.height - Ui.value.y : Ui.value.height / 2 + Xi.value[t].y;
          return {
            seat: e,
            number: t + 1,
            x: d,
            y: u,
            covered: n,
            showRole: r,
            glows: r ? getSeatGlowColors(e) : {},
            style: {
              left: `${d}px`,
              top: `${u}px`,
              width: `${Wi.value}px`,
              height: `${Wi.value}px`,
              "--seat-size": `${Wi.value}px`,
            },
          };
        }),
        Wi.value,
        {
          left: 4 - Ui.value.x,
          right: viewport.value.width - Ui.value.x - 4,
          bottom: viewport.value.height - Ui.value.y - viewport.value.bottom - 8,
        },
      ),
    ),
    Zi = computed(() => {
      var e;
      const t =
        "nomination" === (null == (e = seatInteraction.value) ? void 0 : e.type)
          ? seatInteraction.value
          : activeVoteDraft.value;
      return !t || gameState.value.ended || "day" !== currentPhase.value.kind
        ? []
        : [
            {
              kind: "small",
              seatId: t.nominatorId,
              label: "提名人",
              imageWidth: 60,
            },
            {
              kind: "big",
              seatId: t.nomineeId,
              label: "被提名人",
              imageWidth: 34,
            },
          ].flatMap((e) => {
            const t = Qi.value.find((t) => t.seat.id === e.seatId);
            if (!t) return [];
            const i = t.x - Ui.value.width / 2,
              a = t.y - Ui.value.height / 2,
              l = Math.max(0, 2 * (Math.hypot(i, a) - Wi.value / 2));
            if (!l) return [];
            const n = (180 * Math.atan2(a, i)) / Math.PI + 90;
            return [
              {
                ...e,
                label: `${e.label}：${t.number}号`,
                style: {
                  width: (l * e.imageWidth) / 416 + "px",
                  height: `${l}px`,
                  transform: `translate(-50%, -50%) rotate(${n}deg)`,
                },
              },
            ];
          });
    }),
    ea = computed(() => {
      const e = Qi.value.find((e) => e.seat.id === selectedSeatId.value);
      return e
        ? {
            left: Ui.value.x + e.x - Wi.value / 2,
            top: Ui.value.y + e.y - Wi.value / 2,
            width: Wi.value,
            height: Wi.value,
          }
        : null;
    }),
    ta = computed(() => {
      const e = Qi.value.map((e) => e.numberBounds);
      return Qi.value.flatMap((t) => {
        if (!t.showRole) return [];
        const i = Ui.value.width / 2 - t.x,
          a = Ui.value.height / 2 - t.y,
          n = Math.sqrt(i * i + a * a) || 1,
          r = i / n,
          o = a / n;
        let s = 0;
        return [
          ...t.seat.tokens.map((e) => ({
            token: e,
          })),
          ...(gameState.value.ended
            ? []
            : [
                {
                  add: true,
                },
              ]),
        ].map((i, a) => {
          var l;
          const d = Math.max(24, Math.min(64, 0.5 * Wi.value)),
            u = Math.max(Wi.value / 2 + 0.6 * d, 0.1 * d),
            m = Math.max(s, Math.min(u + d * a, Math.max(0, n - 0.5 * d))),
            c = (function (e, t, i, a, l, n, r, o) {
              const s = (e, t) => o.every((i) => !circleIntersectsRect(e, t, r, i));
              for (let d = l; d <= Math.max(l, n); d += 3) {
                const l = e + i * d,
                  n = t + a * d;
                if (s(l, n))
                  return {
                    x: l,
                    y: n,
                    distance: d,
                  };
              }
              for (let d = 2 * r + 4; ; d += 2 * r + 4)
                for (const n of [1, -1]) {
                  const r = e + i * l - a * d * n,
                    o = t + a * l + i * d * n;
                  if (s(r, o))
                    return {
                      x: r,
                      y: o,
                      distance: l,
                    };
                }
            })(t.x, t.y, r, o, m, n - d / 2, d / 2, e);
          return (
            (s = c.distance + d),
            {
              ...i,
              size: d,
              id: (null == (l = i.token) ? void 0 : l.id) || `add-${t.seat.id}`,
              slotKey: `${t.number}-${a}`,
              seatId: t.seat.id,
              number: t.number,
              style: {
                left: `${c.x}px`,
                top: `${c.y}px`,
                width: `${d}px`,
                height: `${d}px`,
              },
            }
          );
        });
      });
    }),
    ia = computed(() => {
      var e;
      const t = {};
      if (
        gameState.value.ended ||
        isPlayerView.value ||
        activeSheet.value ||
        isRoleSidebarOpen.value ||
        isWakePanelOpen.value ||
        isIdentityPanelOpen.value ||
        showStatusHint.value ||
        abilitySeatId.value ||
        isEditingLayout.value ||
        j.value ||
        O.value ||
        D.value
      )
        return t;
      if ("nomination" === (null == (e = seatInteraction.value) ? void 0 : e.type)) {
        const e = seatInteraction.value.nominatorId ? "nominee" : "nominator";
        for (const i of gameState.value.seats)
          ra(i.id) ||
            (t[i.id] = {
              kind: e,
              label: "nominator" === e ? "点击选择提名人" : "点击选择被提名人",
            });
        return t;
      }
      if (seatInteraction.value) {
        const e = {
          move: "点击移动到此座位前",
          swap: "点击与此座位换座",
          delete: "点击选择要删除的座位",
        };
        for (const i of gameState.value.seats)
          i.id !== seatInteraction.value.source &&
            (t[i.id] = {
              kind: seatInteraction.value.type,
              label: e[seatInteraction.value.type],
            });
      } else if (activeVoteDraft.value)
        for (const i of activeVoteDraft.value.people)
          i.voted ||
            (!i.alive && !i.ghostVote) ||
            (t[i.id] = {
              kind: "vote",
              label: "点击为此玩家投票",
            });
      return t;
    }),
    aa = computed(() => {
      const e = {
        first: {},
        other: {},
      };
      if (isPlayerView.value || gameState.value.ended) return e;
      for (const [t, i] of [
        ["first", "firstNight"],
        ["other", "otherNight"],
      ])
        for (const a of buildNightOrder(currentScript.value, gameState.value.seats, i))
          for (const i of a.seats) e[t][i.id] = a.rank;
      return e;
    }),
    la = computed(() =>
      "setup" === currentPhase.value.kind
        ? `${gameState.value.seats.filter((e) => e.role).length} / ${gameState.value.seats.length} 角色已分配`
        : "day" === currentPhase.value.kind
          ? "提名、计票与说书人裁定"
          : "夜幕已降临，轻声唤醒他们",
    ),
    na = computed(() =>
      (function (e) {
        const t = describeStage(e.stage),
          i = e.votes.filter((e) => e.day === t.day);
        return Object.fromEntries(
          e.seats.map((a) => {
            const l = e.ended || "day" !== t.kind ? "当前不能提名" : "";
            return [
              a.id,
              {
                nominator:
                  l ||
                  (a.alive ? "" : "死亡玩家不能提名") ||
                  (i.some((e) => e.nominatorId === a.id) ? "今天已提名" : ""),
                nominee:
                  l ||
                  (isTravelerSeat(a) ? "旅行者不能被普通提名" : "") ||
                  (i.some((e) => e.nomineeId === a.id) ? "今天已被提名" : ""),
              },
            ];
          }),
        );
      })(gameState.value),
    );
  function ra(e) {
    var t, i;
    if ("nomination" !== (null == (t = seatInteraction.value) ? void 0 : t.type)) return "";
    const a = seatInteraction.value.nominatorId ? "nominee" : "nominator";
    return (null == (i = na.value[e]) ? void 0 : i[a]) || "";
  }
  const oa = computed(() =>
      "bluff" === assignmentMode.value
        ? ["all", ...new Set(ua.value.map((e) => e.team))]
        : ["all", ...Gi, ...("single" === assignmentMode.value ? ["traveler"] : [])],
    ),
    sa = computed(() => currentScript.value.roles.filter(Na)),
    da = computed(() =>
      normalizedRoles.filter((e) => "traveler" === e.team && !sa.value.some((t) => t.id === e.id)),
    ),
    ua = computed(() => {
      if ("bluff" === assignmentMode.value) {
        const e = new Set(
          gameState.value.seats
            .map((e) => {
              var t, i;
              return null == (i = null == (t = e.role) ? void 0 : t.name) ? void 0 : i.trim();
            })
            .filter(Boolean),
        );
        return currentScript.value.roles.filter(
          (t) =>
            !["a jinxed", "jinxed", "status", "traveler", "traveller", "旅行者"].includes(t.team) &&
            !e.has(t.name.trim()),
        );
      }
      let e = currentScript.value.roles.filter(Na);
      return (
        (e =
          "single" === assignmentMode.value
            ? [
                ...e,
                ...normalizedRoles.filter((t) => "traveler" === t.team && !e.some((e) => e.id === t.id)),
              ]
            : e.filter((e) => "traveler" !== e.team)),
        e
      );
    }),
    ma = computed(() =>
      ua.value.filter(
        (e) =>
          ("all" === roleTeamFilter.value || e.team === roleTeamFilter.value) &&
          ((e) =>
            `${e.name} ${e.id}`.toLowerCase().includes(roleSearchQuery.value.trim().toLowerCase()))(e),
      ),
    ),
    ca = computed(() =>
      (function (e, t = []) {
        const i = Array.isArray(null == e ? void 0 : e.roles) ? e.roles : [],
          a = [],
          l = new Set();
        function n(e, t, i = null) {
          if ("string" != typeof e || !e.trim()) return;
          const n = e.trim(),
            r = getReminderImage(
              i
                ? {
                    image: i.image,
                  }
                : {
                    label: n,
                    type: "alignment",
                  },
            ),
            o = JSON.stringify([n, r]);
          l.has(o) ||
            (l.add(o),
            a.push({
              key: o,
              label: n,
              source: t,
              custom: false,
              image: r,
              ...(i
                ? {
                    roleId: i.id || "",
                  }
                : {
                    type: "alignment",
                  }),
            }));
        }
        function r(e, t) {
          for (const i of t)
            if (Array.isArray(null == e ? void 0 : e[i]))
              for (const t of e[i]) n(t, e.name || "角色提醒", e);
        }
        n("善良", "通用提醒");
        n("邪恶", "通用提醒");
        for (const o of i) r(o, GLOBAL_REMINDER_FIELD_NAMES);
        for (const o of Array.isArray(t) ? t : []) {
          if (!(null == o ? void 0 : o.role)) continue;
          const e = findMatchingRole(i, o.role),
            t = findMatchingRole(normalizedRoles, o.role);
          r(
            e || {
              ...t,
              ...o.role,
            },
            REMINDER_FIELD_NAMES,
          );
        }
        return a;
      })(currentScript.value, gameState.value.seats, selectedSeatId.value),
    ),
    automaticVoteTotal = computed(() => {
      var e;
      return (
        (null == (e = activeVoteDraft.value)
          ? void 0
          : e.people.reduce((e, t) => e + ((t.voted && Number(t.weight)) || 0), 0)) || 0
      );
    }),
    ga = computed(() => automaticVoteTotal.value),
    voteThreshold = computed(() => {
      var e, t;
      return (
        (null == (e = activeVoteDraft.value) ? void 0 : e.overrideThreshold) ??
        (null == (t = activeVoteDraft.value) ? void 0 : t.threshold) ??
        0
      );
    }),
    timerLabel = computed(() =>
      (function (e, t = Date.now()) {
        if ("number" != typeof e || !Number.isFinite(e)) return "--:--";
        const i = Math.max(0, Math.ceil((e - t) / 1e3)),
          a = Math.floor(i / 3600),
          l = Math.floor((i % 3600) / 60),
          n = i % 60,
          r = (e) => String(e).padStart(2, "0");
        return a ? `${a}:${r(l)}:${r(n)}` : `${r(l)}:${r(n)}`;
      })(gameState.value.timerEndsAt, nowMillis.value),
    ),
    sheetTitle = computed(
      () =>
        ({
          background: "设置背景",
          status: "设置玩家状态",
          scripts: "选择剧本",
          import: "导入本地剧本",
          assign:
            "bluff" === assignmentMode.value
              ? `选择第${bluffSlotIndex.value + 1}个伪装角色`
              : "single" === assignmentMode.value
                ? `为${ka(selectedSeatId.value)}分配角色`
                : "选择本局角色",
          tokens: `为${ka(selectedSeatId.value)}添加标记`,
          token: "编辑提醒标记",
          wake: `快捷唤醒 · ${ka(selectedSeatId.value)}`,
          nomination: "发起提名",
          vote: "调整本次投票",
          history: "历史投票",
          historyEdit: "修正历史票型",
          end: "结束本局",
          execution: "处理处决",
        })[activeSheet.value] || "魔典",
    ),
    sheetSubtitle = computed(() =>
      ["assign", "scripts"].includes(activeSheet.value) ? currentScript.value.name : "",
    );
  function ya(e) {
    return TEAM_LABELS[e] || e || "角色";
  }
  function Na(e) {
    return PLAYER_ROLE_TEAMS.includes(e.team);
  }
  function wa(e) {
    return gameState.value.seats.findIndex((t) => t.id === e) + 1;
  }
  function ka(e) {
    const t = wa(e);
    return t > 0 ? `${t}号` : "玩家";
  }
  function _a(e) {
    return (gameState.value.revealedSeatIds || []).includes(e);
  }
  function Ra(e) {
    var t, i, a;
    if (gameState.value.ended)
      return e.covered
        ? `${e.number}号，点击翻牌`
        : `${e.number}号 ${(null == (t = e.seat.role) ? void 0 : t.name) || "未分配角色"}，已公开`;
    const n = e.seat.alive ? "存活" : e.seat.ghostVote ? "死亡带票" : "死透了，无票";
    if (isPlayerView.value) return `${e.number}号，${n}`;
    if ("nomination" === (null == (i = seatInteraction.value) ? void 0 : i.type)) {
      const t = ra(e.seat.id);
      return `${e.number}号，${n}，${t || (seatInteraction.value.nominatorId ? "点击选择被提名人" : "点击选择提名人")}`;
    }
    return `${e.number}号 ${(null == (a = e.seat.role) ? void 0 : a.name) || "未分配角色"}，${n}${gameState.value.pendingExecutionId === e.seat.id ? "，待处决" : ""}${ia.value[e.seat.id] ? "，" + ia.value[e.seat.id].label : ""}`;
  }
  function xa(e = nicknameDraft.value) {
    !isPlayerView.value &&
      nicknameSeat.value &&
      commitSession((t) =>
        (function (e, t, i) {
          const a = String(i ?? "").trim();
          Array.from(a).length > 4 && failGameRule("昵称最多四个字");
          const l = requireSeatIndex(e, t),
            n = cloneGameData(e);
          return ((n.seats[l].nickname = a), n);
        })(t, nicknameSeatId.value, e),
      ) &&
      (nicknameSeatId.value = "");
  }
  function Ga(e) {
    showToast({
      title: String(e).slice(0, 100),
      icon: "none",
      duration: 2500,
    });
  }
  function Ca(e) {
    (function (e) {
      return (
        !!e &&
        ("USER_CANCELLED" === e.code ||
          /\bcancel(?:led|ed)?\b/i.test(String(e.errMsg || e.message || "")))
      );
    })(e) || Ga(e.message || "操作未完成，请重试");
  }
  function commitSession(e) {
    let t;
    try {
      t = "function" == typeof e ? e(gameState.value) : e;
    } catch (i) {
      return (Ca(i), false);
    }
    gameState.value = t;
    try {
      !(function (e) {
        saveStoredData(STORAGE_KEYS.session, e, isSessionData);
      })(t);
      hasUnsavedSessionChanges.value = false;
    } catch (i) {
      hasUnsavedSessionChanges.value = true;
      Ca(i);
    }
    return true;
  }
  function openSheet(e) {
    if (
      (seatPressGesture.cancel(),
      (D.value = false),
      (j.value = false),
      (O.value = false),
      (roleSearchQuery.value = ""),
      "roles" === e)
    )
      return ((isRoleSidebarOpen.value = true), void (allowDuplicateRoles.value = false));
    activeSheet.value = e;
  }
  function $a() {
    var e;
    nicknameSeatId.value = "";
    seatPressGesture.reset();
    tokenPressGesture.reset();
    showTokenDeleteHint.value = false;
    Ll();
    isNotebookOpen.value && Va(false);
    null == (e = wakePanelRef.value) || e.conceal();
    activeSheet.value = "";
    D.value = false;
    j.value = false;
    O.value = false;
    isRoleSidebarOpen.value = false;
    allowDuplicateRoles.value = false;
    isWakePanelOpen.value = false;
    isIdentityPanelOpen.value = false;
    showStatusHint.value = false;
    abilitySeatId.value = "";
    seatInteraction.value = null;
    isEditingLayout.value = false;
  }
  function togglePlayerView() {
    $a();
    isPlayerView.value = !isPlayerView.value;
  }
  function Ea() {
    D.value = false;
    j.value = false;
    O.value = !O.value;
  }
  function Aa() {
    D.value = false;
    O.value = false;
    j.value = !j.value;
  }
  function closeSheet() {
    activeSheet.value = "";
  }
  function za() {
    D.value = false;
    roleSidebarTab.value = "roles";
    isRoleSidebarOpen.value = !isRoleSidebarOpen.value;
    isRoleSidebarOpen.value && (allowDuplicateRoles.value = false);
  }
  function Va(e) {
    e || flushNotebook();
    isNotebookOpen.value = e;
  }
  function toggleNotebook() {
    D.value = false;
    j.value = false;
    O.value = false;
    isNotebookOpen.value ||
      ((notebookText.value = gameState.value.notebook),
      (notebookMarks.value = gameState.value.notebookMarks || []));
    Va(!isNotebookOpen.value);
  }
  function updateSessionSetting(e, t) {
    commitSession((i) =>
      updateSessionOptions(i, {
        [e]: t,
      }),
    );
  }
  function Oa(e) {
    isPlayerView.value ||
      commitSession((t) =>
        (function (e, t) {
          (t &&
            "fabled" === t.team &&
            "string" == typeof t.id &&
            t.id.trim() &&
            "string" == typeof t.name &&
            t.name.trim() &&
            "string" == typeof t.ability) ||
            failGameRule("请选择有效的传奇角色");
          const i = cloneGameData(e);
          return (
            (i.fabledRoles = [
              ...(i.fabledRoles || []),
              {
                ...cloneGameData(t),
                instanceId: createEntityId("fabled"),
              },
            ]),
            i
          );
        })(t, e),
      );
  }
  function Da(e) {
    isPlayerView.value ||
      commitSession((t) =>
        (function (e, t) {
          (e.fabledRoles || []).some((e) => e.instanceId === t) || failGameRule("找不到这个传奇角色");
          const i = cloneGameData(e);
          return ((i.fabledRoles = i.fabledRoles.filter((e) => e.instanceId !== t)), i);
        })(t, e),
      );
  }
  function Fa(e) {
    return "" === String(e).trim() ? null : Number(e);
  }
  function changePhase(e) {
    if (activeVoteDraft.value) return Ga("请先完成或取消当前投票");
    commitSession((t) => changeStage(t, e)) &&
      (seatPressGesture.cancel(),
      (D.value = false),
      (seatInteraction.value = null),
      (abilitySeatId.value = ""));
  }
  function Pa() {
    return !(
      gameState.value.ended ||
      isPlayerView.value ||
      isEditingLayout.value ||
      seatInteraction.value ||
      activeVoteDraft.value ||
      activeSheet.value ||
      isIdentityPanelOpen.value ||
      isWakePanelOpen.value ||
      showStatusHint.value ||
      abilitySeatId.value
    );
  }
  function Wa(e, t, i = false) {
    if (!Pa()) return seatPressGesture.reset();
    i ? seatPressGesture.mouseStart(e, t) : seatPressGesture.touchStart(e, t);
  }
  function qa(e, t = true) {
    selectedSeatId.value = e;
    !t || hideStatusHint.value ? openSheet("status") : (showStatusHint.value = true);
  }
  function Ua() {
    if (hideStatusHint.value)
      try {
        savePreferences({
          hideStatusHint: true,
        });
      } catch (e) {
        Ca(e);
      }
    showStatusHint.value = false;
  }
  function Ha() {
    Ua();
    openSheet("status");
  }
  function Ja(e) {
    if (
      (!isPlayerView.value || gameState.value.ended) &&
      seatPressGesture.allowTap() &&
      !(Date.now() < ignoreSeatTapUntil || isEditingLayout.value)
    ) {
      if (seatInteraction.value) {
        const t = seatInteraction.value;
        if ("nomination" === t.type) {
          if (ra(e)) return;
          return void (t.nominatorId
            ? (function (e, t) {
                var i, a, n;
                try {
                  const r = na.value,
                    o =
                      (null == (i = r[e]) ? void 0 : i.nominator) ||
                      (null == (a = r[t]) ? void 0 : a.nominee);
                  if (o) return Ga(o);
                  activeVoteDraft.value = createVoteDraft(gameState.value, e, t);
                  Ll();
                  seatInteraction.value = null;
                  isEditingLayout.value = false;
                  closeSheet();
                  (null == (n = activeVoteDraft.value.warnings) ? void 0 : n.length) &&
                    Ga(activeVoteDraft.value.warnings.join("；"));
                } catch (r) {
                  Ca(r);
                }
              })(t.nominatorId, e)
            : (seatInteraction.value = {
                ...t,
                nominatorId: e,
                message: `已选${ka(e)}提名，请点击被提名人的座位`,
              }));
        }
        if (t.source === e) return;
        return (
          (seatInteraction.value = null),
          "delete" === t.type
            ? (function (e) {
                const t = ka(e);
                commitSession((t) =>
                  (function (e, t) {
                    const i = requireSeatIndex(e, t);
                    e.seats.length <= 1 && failGameRule("至少保留一个座位");
                    const a = cloneGameData(e);
                    a.seats.splice(i, 1);
                    a.pendingExecutionId === t && (a.pendingExecutionId = null);
                    for (const l of ["portrait", "landscape"]) delete a.layouts[l][t];
                    return a;
                  })(t, e),
                ) && Ga(`已删除${t}座位`);
              })(e)
            : void commitSession((i) =>
                "move" === t.type
                  ? (function (e, t, i) {
                      const a = requireSeatIndex(e, t);
                      requireSeatIndex(e, i);
                      const l = cloneGameData(e);
                      if (t === i) return l;
                      const [n] = l.seats.splice(a, 1),
                        r = l.seats.findIndex((e) => e.id === i);
                      return (l.seats.splice(r, 0, n), transferSeatLayouts(e, l), l);
                    })(i, t.source, e)
                  : (function (e, t, i) {
                      const a = requireSeatIndex(e, t),
                        l = requireSeatIndex(e, i),
                        n = cloneGameData(e);
                      return (
                        ([n.seats[a], n.seats[l]] = [n.seats[l], n.seats[a]]),
                        transferSeatLayouts(e, n),
                        n
                      );
                    })(i, t.source, e),
              )
        );
      }
      if (gameState.value.ended) _a(e) || commitSession((t) => revealReviewSeat(t, e));
      else {
        if (activeVoteDraft.value) return kl(e);
        j.value = false;
        O.value = false;
        selectedSeatId.value = e;
        D.value = true;
      }
    }
  }
  function Ka(e) {
    return (
      (D.value = false),
      "assign" === e
        ? openRoleAssignment(selectedSeatId.value)
        : "status" === e
          ? qa(selectedSeatId.value)
          : "ability" !== e
            ? "move" === e || "swap" === e
              ? ((isEditingLayout.value = false),
                (seatInteraction.value = {
                  type: e,
                  source: selectedSeatId.value,
                  message:
                    "move" === e
                      ? `点头像：将${ka(selectedSeatId.value)}移动到哪个玩家前？`
                      : `点头像：${ka(selectedSeatId.value)}与谁换座？`,
                }),
                void closeSheet())
              : void openSheet(e)
            : void (abilitySeatId.value = selectedSeatId.value)
    );
  }
  function Ya(e) {
    commitSession((t) =>
      (function (e, t, i) {
        const a = requireSeatIndex(e, t),
          l = cloneGameData(e),
          n = l.seats[a];
        switch (i) {
          case "alive":
            n.alive = true;
            n.ghostVote = true;
            break;
          case "deadghost":
            n.alive = false;
            n.ghostVote = true;
            break;
          case "deadspent":
            n.alive = false;
            n.ghostVote = false;
            break;
          case "pending":
            l.pendingExecutionId = t;
            break;
          case "clearPending":
            l.pendingExecutionId === t && (l.pendingExecutionId = null);
            break;
          case "clearStatus":
            n.alive = true;
            n.ghostVote = true;
            l.pendingExecutionId === t && (l.pendingExecutionId = null);
            break;
          default:
            failGameRule("不支持的玩家状态");
        }
        return l;
      })(t, selectedSeatId.value, e),
    ) && closeSheet();
  }
  function openRoleAssignment(e) {
    if (activeVoteDraft.value) return Ga("请先完成或取消当前投票");
    assignmentMode.value = e ? "single" : "batch";
    e && (selectedSeatId.value = e);
    selectedAssignmentRoles.value = gameState.value.seats
      .filter((e) => e.role && "traveler" !== e.role.team)
      .map((e) => e.role);
    roleTeamFilter.value = "all";
    openSheet("assign");
  }
  function Qa(e) {
    "bluff" === assignmentMode.value
      ? commitSession((t) => setBluffRole(t, bluffSlotIndex.value, e)) && closeSheet()
      : commitSession((t) => setSeatRole(t, selectedSeatId.value, e)) && closeSheet();
  }
  function Za() {
    commitSession((e) =>
      "bluff" === assignmentMode.value
        ? setBluffRole(e, bluffSlotIndex.value, null)
        : setSeatRole(e, selectedSeatId.value, null),
    ) && closeSheet();
  }
  function assignRandomRoles(e) {
    if (isReassignConfirmationOpen) return;
    const t = () => {
      commitSession((t) =>
        (function (e, t, i = Math.random) {
          const a = e.seats.filter((e) => !isTravelerSeat(e));
          t.length !== a.length &&
            failGameRule(`角色数 ${t.length} 与普通玩家座位数 ${a.length} 不一致`);
          t.some((e) => !e || ["traveler", "traveller", "旅行者"].includes(e.team)) &&
            failGameRule("旅行者请逐座手动分配，不加入普通角色随机池");
          const l = cloneGameData(t);
          for (let o = l.length - 1; o > 0; o -= 1) {
            const e = Math.min(o, Math.max(0, Math.floor(i() * (o + 1))));
            [l[o], l[e]] = [l[e], l[o]];
          }
          const n = cloneGameData(e);
          let r = 0;
          for (const o of n.seats) isTravelerSeat(o) || (o.role = l[r++]);
          return n;
        })(t, e),
      ) && (closeSheet(), Ga("本局角色已随机分配"));
    };
    if (!gameState.value.seats.some((e) => e.role)) return t();
    isReassignConfirmationOpen = true;
    showModal({
      title: "重新分配角色",
      content: "当前魔典部分座位已分配角色，此操作将已选中角色重新随机给所有座位，要继续吗？",
      confirmText: "继续分配",
      cancelText: "取消",
      success: (e) => {
        e.confirm && t();
      },
      fail: Ca,
      complete: () => {
        isReassignConfirmationOpen = false;
      },
    });
  }
  function tl(e) {
    return builtInScripts.some((t) => t.id === e.id);
  }
  async function il() {
    try {
      importScriptJson(
        await ("undefined" != typeof document && "undefined" != typeof FileReader
          ? pickLocalFile(".json,application/json").then((e) => {
              if (e.size > 2097152) throw createAppError("剧本文件不能超过 2MB", "FILE_TOO_LARGE");
              return readLocalFile(e);
            })
          : Promise.reject(
              createAppError("当前环境不支持选择文件，可使用粘贴 JSON 导入", "FILE_PICK_UNSUPPORTED"),
            )),
      );
    } catch (e) {
      Ca(e);
    }
  }
  function importScriptJson(e) {
    try {
      const t = (function (e) {
          var t;
          if ("string" != typeof e) throw new Error("请选择 JSON 文本文件");
          let i,
            a = 0;
          for (const m of e) {
            const e = m.codePointAt(0);
            if (((a += e <= 127 ? 1 : e <= 2047 ? 2 : e <= 65535 ? 3 : 4), a > 2097152))
              throw new Error("剧本文件过大，请控制在 2 MB 以内");
          }
          try {
            i = JSON.parse(e.replace(/^\uFEFF/, ""));
          } catch {
            throw new Error("JSON 格式有误，请检查逗号、括号和引号");
          }
          const l = Array.isArray(i)
            ? i
            : i && "object" == typeof i && Array.isArray(i.roles)
              ? [
                  {
                    id: "_meta",
                    ...(i.meta || {}),
                    name: i.name || (null == (t = i.meta) ? void 0 : t.name),
                  },
                  ...i.roles,
                ]
              : null;
          if (!l) throw new Error("剧本应为角色数组，格式与 trustme-vue 导入格式一致");
          if (l.length > 500) throw new Error("单个剧本最多包含 500 条资料");
          const n = l.find((e) => e && "object" == typeof e && "_meta" === e.id) || {},
            r = l
              .filter((e) => !(e && "object" == typeof e && "_meta" === e.id))
              .map((e) => normalizeRole(e));
          if (!r.length) throw new Error("剧本没有角色");
          const o = new Set();
          for (const m of r) {
            const e = normalizeRoleId(m.id);
            if (o.has(e)) throw new Error(`角色 ID「${m.id}」重复，请合并或更改后重新导入`);
            o.add(e);
          }
          const s = trimAndLimitText(n.name, 120) || "自定义剧本",
            d = selectRoleImage(n.logo),
            u = {};
          for (const m of ["firstNight", "otherNight"])
            Array.isArray(n[m]) && (u[m] = normalizeReminderTexts(n[m]));
          return (
            n.evilInfoNightOrder &&
              "object" == typeof n.evilInfoNightOrder &&
              (u.evilInfoNightOrder = {
                minionInfo: normalizeNightPosition(n.evilInfoNightOrder.minionInfo) || 6,
                demonInfo: normalizeNightPosition(n.evilInfoNightOrder.demonInfo) || 8,
              }),
            {
              script: {
                id: `custom-${hashScriptContent(e)}`,
                name: s,
                author: trimAndLimitText(n.author, 160),
                logo: isAllowedImageSource(d) ? d : "/static/scripts/tb.webp",
                roles: r,
                meta: u,
                builtin: false,
              },
              warnings: [],
            }
          );
        })(e),
        i = [...customScripts.value.filter((e) => e.id !== t.script.id), t.script];
      saveCustomScripts(i);
      customScripts.value = i;
      commitSession((e) =>
        updateSessionOptions(e, {
          scriptId: t.script.id,
        }),
      );
      We.value = false;
      closeSheet();
      t.warnings.length
        ? showModal({
            title: "剧本已导入",
            content: t.warnings.slice(0, 5).join("\n"),
            showCancel: false,
          })
        : Ga("剧本已保存");
    } catch (t) {
      Ca(t);
    }
  }
  async function ll(e) {
    try {
      const t = await pickLocalImage(),
        i = currentScript.value,
        a = {
          ...i,
          id: i.id.startsWith("local-") || i.id.startsWith("import-") ? i.id : `local-${i.id}`,
          name: i.name,
          roles: i.roles.map((i) =>
            i.id === e.id
              ? {
                  ...i,
                  image: t,
                }
              : i,
          ),
        },
        l = [...customScripts.value.filter((e) => e.id !== a.id), a];
      saveCustomScripts(l);
      customScripts.value = l;
      commitSession((i) => {
        var l;
        let n = updateSessionOptions(i, {
          scriptId: a.id,
        });
        for (const a of n.seats)
          (null == (l = a.role) ? void 0 : l.id) === e.id &&
            (n = setSeatRole(n, a.id, {
              ...a.role,
              image: t,
            }));
        return (
          n.bluffRoles.forEach((i, a) => {
            (null == i ? void 0 : i.id) === e.id &&
              (n = setBluffRole(n, a, {
                ...i,
                image: t,
              }));
          }),
          n
        );
      });
      Ga("本地图标已保存");
    } catch (t) {
      Ca(t);
    }
  }
  function nl(e, t = currentScript.value.meta) {
    try {
      const i = currentScript.value,
        a = {
          ...i,
          id: /^(local-|import-)/.test(i.id) ? i.id : `local-${i.id}`,
          roles: e,
          meta: t,
        },
        l = [...customScripts.value.filter((e) => e.id !== a.id), a];
      saveCustomScripts(l);
      customScripts.value = l;
      commitSession((e) =>
        updateSessionOptions(e, {
          scriptId: a.id,
        }),
      );
    } catch (i) {
      Ca(i);
    }
  }
  function rl(e) {
    var t;
    Array.isArray(null == (t = currentScript.value.meta) ? void 0 : t.firstNight) ||
      nl(currentScript.value.roles, {
        ...currentScript.value.meta,
        evilInfoNightOrder: e,
      });
  }
  function ol(e) {
    showModal({
      title: "从剧本移除此角色？",
      content: "已分配的座位角色会保留。",
      success: (t) => {
        t.confirm && nl(currentScript.value.roles.filter((t) => t.id !== e));
      },
    });
  }
  async function sl() {
    try {
      updateSessionSetting("background", await pickLocalImage());
    } catch (e) {
      Ca(e);
    }
  }
  function dl(e, t, i = false) {
    if (isPlayerView.value || e.add) return tokenPressGesture.reset();
    i ? tokenPressGesture.mouseStart(e, t) : tokenPressGesture.touchStart(e, t);
  }
  function addReminder(e, t = {}) {
    if (!e.trim()) return Ga("请输入提醒文字");
    commitSession((i) =>
      (function (e, t, i) {
        const a = requireSeatIndex(e, t),
          l =
            "string" == typeof i
              ? {
                  label: i,
                }
              : i,
          n = String((null == l ? void 0 : l.label) ?? (null == l ? void 0 : l.text) ?? "").trim();
        n || failGameRule("请输入标记文字");
        const r = cloneGameData(e);
        return (
          r.seats[a].tokens.push({
            ...cloneGameData(l),
            id: createEntityId("token"),
            label: n.slice(0, 80),
            inverted: Boolean(l.inverted),
          }),
          r
        );
      })(i, selectedSeatId.value, {
        label: e.trim(),
        image: t.image || "",
        roleId: t.roleId || "",
        custom: t.custom ?? !t.key,
        type: t.type || "",
      }),
    ) && closeSheet();
  }
  function ml() {
    if (isCustomReminder(selectedToken.value))
      return He.value.trim()
        ? void (
            commitSession((e) =>
              updateReminder(e, selectedSeatId.value, selectedTokenId.value, {
                label: He.value.trim(),
              }),
            ) && closeSheet()
          )
        : Ga("请输入提醒文字");
  }
  function cl() {
    commitSession((e) =>
      updateReminder(e, selectedSeatId.value, selectedTokenId.value, {
        inverted: !selectedToken.value.inverted,
      }),
    );
    closeSheet();
  }
  function deleteSelectedReminder() {
    commitSession((e) => removeReminder(e, selectedSeatId.value, selectedTokenId.value)) &&
      (closeSheet(), hideTokenDeleteHint.value || (showTokenDeleteHint.value = true));
  }
  function gl() {
    if (((showTokenDeleteHint.value = false), hideTokenDeleteHint.value))
      try {
        savePreferences({
          hideTokenDeleteHint: true,
        });
      } catch (e) {
        Ca(e);
      }
  }
  function openWakePanel() {
    gameState.value.ended ||
      "night" !== currentPhase.value.kind ||
      ((D.value = false),
      (j.value = false),
      (O.value = false),
      (isRoleSidebarOpen.value = false),
      (isEditingLayout.value = false),
      (seatInteraction.value = null),
      closeSheet(),
      (isWakePanelOpen.value = true));
  }
  function openIdentityPanel() {
    0 !== gameState.value.stage ||
      gameState.value.ended ||
      activeVoteDraft.value ||
      ((D.value = false),
      (j.value = false),
      (O.value = false),
      (isRoleSidebarOpen.value = false),
      (isEditingLayout.value = false),
      (seatInteraction.value = null),
      isNotebookOpen.value && (flushNotebook(), (isNotebookOpen.value = false)),
      closeSheet(),
      (isIdentityPanelOpen.value = true));
  }
  function bl(e) {
    commitSession((t) => {
      if (0 !== t.stage || t.ended) throw new Error("请在准备阶段下发身份");
      if (e.length !== t.seats.length || new Set(e.map((e) => e.seatId)).size !== t.seats.length)
        throw new Error("领取结果与座位不一致，请重新下发");
      let i = t;
      for (const a of e) i = setSeatRole(i, a.seatId, a.role);
      return changeStage(i);
    }) && ((isIdentityPanelOpen.value = false), Ga("身份已下发，已进入首夜"));
  }
  function vl(e) {
    if (activeVoteDraft.value) return Ga("请先完成或取消当前投票");
    $a();
    yl();
    commitSession((t) =>
      (function (e, t) {
        return e.ended
          ? cloneGameData(e)
          : (["good", "evil"].includes(t) || failGameRule("请选择获胜阵营"),
            {
              ...cloneGameData(e),
              ended: true,
              reviewWinner: t,
              revealedSeatIds: [],
            });
      })(t, e),
    );
  }
  function yl() {
    clearTimeout(L);
    S.value = false;
  }
  function Nl() {
    if (!gameState.value.ended || isPlayerView.value || S.value) return;
    z.value = 0;
    V.value = zi.value.length;
    S.value = true;
    const e = () => {
      const t = zi.value[0];
      return gameState.value.ended && t && commitSession((e) => revealReviewSeat(e, t.id))
        ? (z.value++, void (zi.value.length ? (L = setTimeout(e, 500)) : yl()))
        : yl();
    };
    e();
  }
  function wl(e) {
    var t, i;
    return (
      (null == (i = null == (t = activeVoteDraft.value) ? void 0 : t.people.find((t) => t.id === e))
        ? void 0
        : i.voted) || false
    );
  }
  function kl(e) {
    try {
      activeVoteDraft.value = toggleDraftVote(activeVoteDraft.value, e);
    } catch (t) {
      showModal({
        title: "人工裁定",
        content: `${t.message}。仍要为此玩家记录投票吗？`,
        success: (t) => {
          if (t.confirm)
            try {
              activeVoteDraft.value = toggleDraftVote(activeVoteDraft.value, e, {
                force: true,
              });
            } catch (i) {
              Ca(i);
            }
        },
      });
    }
  }
  function _l() {
    showModal({
      title: "取消当前投票？",
      content: "未完成票型不保存，也不会消耗鬼票。",
      success: (e) => {
        e.confirm && ((activeVoteDraft.value = null), closeSheet());
      },
    });
  }
  function Rl() {
    commitSession((e) =>
      submitVoteRecord(e, {
        ...activeVoteDraft.value,
        overrideTotal: null,
      }),
    ) && ((activeVoteDraft.value = null), closeSheet(), Ga("票型已记录"));
  }
  function xl() {
    isPlayerView.value ||
      (commitSession((e) =>
        editVoteRecord(e, voteHistoryDraft.value.id, {
          people: voteHistoryDraft.value.people,
          overrideTotal: null,
          overrideThreshold: voteHistoryDraft.value.overrideThreshold,
        }),
      ) &&
        openSheet("history"));
  }
  function Gl(e) {
    isPlayerView.value ||
      showModal({
        title: "删除投票记录？",
        content: "仅删除历史，不改变当前生死、鬼票与待处决状态。",
        success: (t) => {
          t.confirm && commitSession((t) => deleteVoteRecord(t, e));
        },
      });
  }
  function startTimer() {
    const e = Number(timerMinutes.value);
    if (!Number.isFinite(e) || e <= 0 || e > 180) return Ga("请输入 0 到 180 之间的分钟数");
    stopTimerChimes();
    unlockTimerAudio();
    lastAlarmDeadline = null;
    nowMillis.value = Date.now();
    commitSession((t) =>
      updateSessionOptions(t, {
        timerEndsAt: nowMillis.value + Math.round(6e4 * e),
      }),
    ) && (O.value = false);
  }
  function Ml() {
    stopTimerChimes();
    lastAlarmDeadline = null;
    updateSessionSetting("timerEndsAt", null);
    O.value = false;
  }
  function Il() {
    var e;
    nowMillis.value = Date.now();
    const t = gameState.value.timerEndsAt;
    !Number.isFinite(t) ||
      t > nowMillis.value ||
      t === lastAlarmDeadline ||
      ((lastAlarmDeadline = t),
      (function () {
        if (!timerAudioState.context || "closed" === timerAudioState.context.state) return false;
        stopTimerChimes();
        const e = timerAudioState.context,
          t = timerAudioState.generation;
        if ("running" !== e.state)
          try {
            return (
              Promise.resolve(e.resume()).then(
                () => {
                  timerAudioState.context === e &&
                    timerAudioState.generation === t &&
                    "running" === e.state &&
                    playTimerChimes(e);
                },
                () => {},
              ),
              true
            );
          } catch {
            return false;
          }
        playTimerChimes(e);
      })(),
      Ga("倒计时已结束"),
      null == (e = vibrateShort) ||
        e({
          fail() {},
        }));
  }
  function $l() {
    gameState.value.timerEndsAt > Date.now() && unlockTimerAudio();
  }
  function Tl() {
    if (activeVoteDraft.value) return Ga("请先完成或取消当前投票");
    D.value = false;
    j.value = false;
    O.value = false;
    showModal({
      title: "开始新一局？",
      content: "本局角色、伪装、标记、投票与笔记将被清空，并回到准备阶段。座位、剧本、背景与布局保留。",
      success: (e) => {
        e.confirm &&
          (yl(),
          commitSession(resetGame) &&
            (stopTimerChimes(),
            (lastAlarmDeadline = null),
            clearTimeout(notebookSaveTimeout),
            (activeVoteDraft.value = null),
            (notebookText.value = ""),
            (notebookMarks.value = []),
            (isNotebookOpen.value = false),
            (isRoleSidebarOpen.value = false),
            (allowDuplicateRoles.value = false),
            (seatInteraction.value = null),
            (isEditingLayout.value = false),
            closeSheet()));
      },
    });
  }
  async function El(e) {
    return (
      (D.value = false),
      (j.value = false),
      activeVoteDraft.value && ["new", "add", "delete"].includes(e)
        ? Ga("请先完成或取消当前投票")
        : "add" !== e
          ? "delete" === e
            ? ((isEditingLayout.value = false),
              (seatInteraction.value = {
                type: "delete",
                message: "点头像：请选择要删除的座位",
              }),
              void closeSheet())
            : "layout" === e
              ? ((seatInteraction.value = null), (isEditingLayout.value = true), void closeSheet())
              : "new" === e
                ? Tl()
                : void ("feedback" !== e
                    ? openSheet(e)
                    : showModal({
                        title: "问题反馈",
                        content: "问题反馈QQ群：66604951",
                        showCancel: false,
                        confirmText: "知道了",
                      }))
          : void commitSession(addSeat)
    );
  }
  function flushNotebook() {
    clearTimeout(notebookSaveTimeout);
    (notebookText.value === gameState.value.notebook &&
      JSON.stringify(notebookMarks.value) === JSON.stringify(gameState.value.notebookMarks || [])) ||
      commitSession((e) =>
        updateSessionOptions(e, {
          notebook: notebookText.value,
          notebookMarks: notebookMarks.value,
        }),
      );
  }
  function Sl(e) {
    var t, i;
    const a =
      (null == (t = e.touches) ? void 0 : t[0]) || (null == (i = e.changedTouches) ? void 0 : i[0]) || e;
    return {
      x: a.clientX ?? a.pageX,
      y: a.clientY ?? a.pageY,
    };
  }
  function zl(e, t) {
    if (!isEditingLayout.value) return;
    const i = Sl(t),
      a = Qi.value.find((t) => t.seat.id === e);
    activeSeatDrag.value = {
      id: e,
      start: i,
      x: a.x,
      y: a.y,
    };
  }
  function Vl(e) {
    var t;
    if (!activeSeatDrag.value) return;
    const i = Sl(e),
      a = (null == (t = gameState.value.layouts) ? void 0 : t[layoutOrientation.value]) || {},
      n = isLandscape.value ? Math.min(0.5, Wi.value / 2 / Ui.value.width) : 0.07,
      r = isLandscape.value ? Math.min(0.5, Wi.value / 2 / Ui.value.height) : 0.09,
      o = Math.max(
        n,
        Math.min(1 - n, (activeSeatDrag.value.x + i.x - activeSeatDrag.value.start.x) / Ui.value.width),
      ),
      s = Math.max(
        r,
        Math.min(1 - r, (activeSeatDrag.value.y + i.y - activeSeatDrag.value.start.y) / Ui.value.height),
      );
    gameState.value = updateSessionOptions(gameState.value, {
      layouts: {
        ...gameState.value.layouts,
        [layoutOrientation.value]: {
          ...a,
          [activeSeatDrag.value.id]: {
            x: o,
            y: s,
            ...(isLandscape.value
              ? {
                  space: "expanded",
                }
              : {}),
          },
        },
      },
    });
  }
  function Ll() {
    activeSeatDrag.value &&
      ((activeSeatDrag.value = null),
      (ignoreSeatTapUntil = Date.now() + 200),
      commitSession(gameState.value));
  }
  function jl() {
    updateSessionSetting("layouts", {
      ...gameState.value.layouts,
      [layoutOrientation.value]: {},
    });
  }
  watch([notebookText, notebookMarks], () => {
    isNotebookOpen.value &&
      (clearTimeout(notebookSaveTimeout), (notebookSaveTimeout = setTimeout(flushNotebook, 250)));
  });
  onResize(({ size: e }) => {
    var t, i, a;
    D.value = false;
    j.value = false;
    e.windowWidth !== viewport.value.width && (O.value = false);
    const l = getViewportInfo();
    viewport.value = {
      width: e.windowWidth,
      height: e.windowHeight,
      top: 0,
      bottom: (null == (t = l.safeAreaInsets) ? void 0 : t.bottom) || 0,
      left: (null == (i = l.safeAreaInsets) ? void 0 : i.left) || 0,
      right: (null == (a = l.safeAreaInsets) ? void 0 : a.right) || 0,
    };
  });
  onHide(() => {
    var e;
    yl();
    seatPressGesture.cancel();
    tokenPressGesture.cancel();
    null == (e = wakePanelRef.value) || e.conceal();
    D.value = false;
    j.value = false;
    O.value = false;
    isNotebookOpen.value ? flushNotebook() : commitSession(gameState.value);
  });
  onShow(Il);
  onMounted(() => {
    commitSession(gameState.value);
    timerInterval = setInterval(Il, 500);
    document.addEventListener("pointerdown", $l, true);
    document.addEventListener("keydown", $l, true);
  });
  onBeforeUnmount(() => {
    yl();
    isNotebookOpen.value && flushNotebook();
    clearInterval(timerInterval);
    clearTimeout(notebookSaveTimeout);
    document.removeEventListener("pointerdown", $l, true);
    document.removeEventListener("keydown", $l, true);
    (function () {
      stopTimerChimes();
      const e = timerAudioState.context;
      if (((timerAudioState.context = null), e && "closed" !== e.state))
        try {
          Promise.resolve(e.close()).catch(() => {});
        } catch {}
    })();
  });
  return {
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
  };
}
export { useGrimoireState };
