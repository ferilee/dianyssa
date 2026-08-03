import { getOrgContext } from "@agent-native/core/org";
import {
  createAgentChatPlugin,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";

// Nitro plugin compiles this registry dynamically from the actions folder
import actionsRegistry from "../../.generated/actions-registry.js";
import { RPP_SYSTEM_PROMPT } from "../rpp/system-prompt.js";

const INITIAL_TOOL_NAMES = ["generate-rpp", "approve-rpp", "queue-rpp-export", "get-rpp-export-status", "retry-rpp-export", "export-to-docx", "export-to-pdf", "link-idetech-account", "manage-content", "list-content", "toggle-content-status", "delete-content"];

export default createAgentChatPlugin({
  appId: "rpp-bot",
  actions: loadActionsFromStaticRegistry(actionsRegistry),
  initialToolNames: INITIAL_TOOL_NAMES,
  resolveOrgId: async (event) => (await getOrgContext(event)).orgId,
  systemPrompt: RPP_SYSTEM_PROMPT,
});
