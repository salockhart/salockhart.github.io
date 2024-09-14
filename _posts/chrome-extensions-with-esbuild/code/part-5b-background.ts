import { registerReloadWebsocket } from "./utils/websocket";

addEventListener("activate", () => {
  console.log("[ext-reload] background script loaded");
  registerReloadWebsocket({
    onReload: () => {
      chrome.runtime.reload();
    },
  });
});
