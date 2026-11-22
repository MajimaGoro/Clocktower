import { migrateSession } from '../domain/session.js';
import { isPlainObject } from '../domain/validation.js';
import { STORAGE_KEYS } from './keys.js';
import { loadStoredData } from './storage.js';
import { isSessionData } from './validation.js';

/** 只读取原有存档键，不覆盖旧数据。无可用存档时由调用方创建新局。 */
export function loadSession() {
  const savedSession = loadStoredData(
    STORAGE_KEYS.session,
    (value) => isSessionData(value) || (
      isPlainObject(value) && value.mode === 'free' &&
      isSessionData({ ...value, mode: 'phased' })
    ),
    null,
  );
  return migrateSession(savedSession);
}
