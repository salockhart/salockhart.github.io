import { registerReloadWebsocket } from "./utils/websocket";

registerReloadWebsocket({
  onReload: () => {
    window.location.reload();
  },
});
