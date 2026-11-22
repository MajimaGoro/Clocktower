// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { BUILT_IN_FABLED_ROLES } from "../data/fabledRoles.js";
import { normalizeRoleId } from "./roleNormalization.js";
const fabledRoleById = new Map(BUILT_IN_FABLED_ROLES.map((e) => [normalizeRoleId(e.id), e]));
export { fabledRoleById };
