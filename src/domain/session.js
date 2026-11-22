import { createEntityId, createSeat, failGameRule, requireInteger } from './game.js';
import { normalizeNotebookMarks } from './notebook.js';

/** 新建一局。保持原版字段与默认值，存档结构版本仍为 1。 */
export function createSession({ seatCount = 12, scriptId = 'tb' } = {}) {
  const count = requireInteger(seatCount, '座位数量');
  if (count < 1 || count > 20) failGameRule('座位数量应在 1～20 之间');
  return {
    version: 1,
    id: createEntityId('game'),
    mode: 'phased',
    stage: 0,
    furthestStage: 0,
    ended: false,
    reviewWinner: '',
    revealedSeatIds: [],
    scriptId,
    seats: Array.from({ length: count }, createSeat),
    pendingExecutionId: null,
    votes: [],
    executions: [],
    bluffRoles: [null, null, null],
    fabledRoles: [],
    notebook: '',
    notebookMarks: [],
    zoom: 1,
    background: '',
    layouts: { portrait: {}, landscape: {} },
    showNightOrder: true,
    timerEndsAt: null,
  };
}

/** 沿用旧版的轻量迁移：兼容 free 模式，清理笔记标记，补充伪装槽。 */
export function migrateSession(savedSession) {
  if (!savedSession) return null;
  return {
    ...savedSession,
    mode: 'phased',
    notebookMarks: normalizeNotebookMarks(String(savedSession.notebook ?? ''), savedSession.notebookMarks),
    ...(savedSession.bluffRoles === undefined ? { bluffRoles: [null, null, null] } : {}),
  };
}
