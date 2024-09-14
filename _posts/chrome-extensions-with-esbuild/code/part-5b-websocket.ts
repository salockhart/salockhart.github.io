interface Props {
  onReload?: () => void;
}

export const registerReloadWebsocket = ({ onReload }: Props) => {
  const socket = new WebSocket("ws://localhost:8080");
  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    console.log("[ext-reload] received message", payload);

    switch (payload.type) {
      case "reload":
        console.log("[ext-reload] extension updated, reloading...");
        onReload?.();
        break;
    }
  });
};
