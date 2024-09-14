import * as esbuild from "esbuild";
import { WebSocketServer } from "ws";

type Data = { type: "up" } | { type: "reload" } | { type: "down" };

export const extReloadPlugin: () => esbuild.Plugin = () => ({
  name: "ext-reload",
  setup(build) {
    const port = 8080;
    const wss = new WebSocketServer({ port });

    wss.on("connection", (ws) => {
      ws.send(JSON.stringify({ type: "up" }));
      ws.on("error", (err) => console.error(err));
    });

    const broadcast = (data: Data) => {
      wss.clients.forEach((ws) => {
        // OPEN = 1
        if (ws.readyState !== 1) return;
        ws.send(JSON.stringify(data), (err) => {
          if (err) console.error(err);
        });
      });
    };

    build.onEnd(() => {
      broadcast({ type: "reload" });
    });
  },
});
