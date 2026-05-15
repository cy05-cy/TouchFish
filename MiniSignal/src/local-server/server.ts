import WebSocket, {
  WebSocketServer
} from "ws";

const wss =
  new WebSocketServer({
    port: 8080
  });

console.log(
  "MiniSignal Server Running: ws://localhost:8080"
);

const clients =
  new Map<string, WebSocket>();

wss.on("connection", (ws) => {

  console.log("client connected");

  ws.on("message", (data) => {

    const message =
      JSON.parse(data.toString());

    console.log(
      "RECV:",
      message
    );

    // 用户登录
    if (message.type === "login") {

      clients.set(
        message.userId,
        ws
      );

      console.log(
        `${message.userId} online`
      );

      return;
    }

    // 消息转发
    if (message.type === "message") {

      const target =
        clients.get(message.target);

      if (target) {

        target.send(
          JSON.stringify({
            type: "message",
            from: message.from,
            payload: message.payload
          })
        );

        console.log(
          `${message.from} -> ${message.target}`
        );
      }
      else {

        console.log(
          "target offline"
        );
      }
    }
  });

  ws.on("close", () => {
    console.log("client disconnected");
  });
});