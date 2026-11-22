// 从睡典钟楼公开前端重构；角色与素材归属保留。
const TEAM_LABELS = {
  townsfolk: "镇民",
  outsider: "外来者",
  minion: "爪牙",
  demon: "恶魔",
  traveler: "旅行者",
  fabled: "传奇角色",
  "a jinxed": "相克",
  status: "状态",
};
const PLAYER_ROLE_TEAMS = ["townsfolk", "outsider", "minion", "demon", "traveler"];
const TEAM_ALIASES = {
  镇民: "townsfolk",
  外来者: "outsider",
  爪牙: "minion",
  恶魔: "demon",
  旅行者: "traveler",
  traveller: "traveler",
  传奇角色: "fabled",
  jinxed: "a jinxed",
  相克: "a jinxed",
  状态: "status",
};
const ORDINARY_ROLE_TEAMS = ["townsfolk", "outsider", "minion", "demon"];
export { TEAM_LABELS, PLAYER_ROLE_TEAMS, TEAM_ALIASES, ORDINARY_ROLE_TEAMS };
