// 从睡典钟楼公开前端重构；角色与素材归属保留。
import { withComponentMetadata } from "../runtime/componentMetadata.js";
import { useGrimoireState } from "../state/useGrimoireState.js";
import { createGrimoireView } from "../views/GrimoireView.js";
const GrimoireApp = withComponentMetadata(
  {
    __name: "GrimoireApp",
    setup(props) {
      const viewState = useGrimoireState(props);
      return createGrimoireView(viewState);
    },
  },
  [["__scopeId", "data-v-78824981"]],
);
export { GrimoireApp };
export default GrimoireApp;
