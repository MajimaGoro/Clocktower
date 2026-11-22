// 从睡典钟楼公开前端重构；角色与素材归属保留。
const BUILT_IN_WAKE_SHORTCUTS = Object.freeze([
  ...["了解", "是", "否", "善良", "邪恶", "你得知", "你的能力未生效", "请闭眼"].map((e, t) =>
    Object.freeze({
      id: `word-${t}`,
      label: e,
      kind: "word",
    }),
  ),
  ...[
    ["ability", "你要使用你的能力吗？", "?"],
    ["choice", "做出你的选择", "☞"],
    ["bluffs", "这些角色不在场", "♧"],
    ["demon", "他是恶魔", "◆"],
    ["minions", "他们是你的爪牙", "♟"],
    ["youare", "你是", "◈"],
    ["thisplayer", "这名玩家是", "◎"],
    ["active", "该角色的能力对你生效", "✧"],
  ].map(([e, t, i]) =>
    Object.freeze({
      id: e,
      key: e,
      label: t,
      symbol: i,
      kind: "preset",
    }),
  ),
]);
export { BUILT_IN_WAKE_SHORTCUTS };
