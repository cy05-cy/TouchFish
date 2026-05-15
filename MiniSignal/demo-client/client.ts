import readline from "readline";
import WebSocket from "ws";

import { CryptoManager } from "./crypto/crypto";
import { IdentityManager } from "./identity/identity";
import { SessionManager } from "./session/session";

const userId =
  process.argv[2];

const targetId =
  process.argv[3];

if (!userId || !targetId) {

  console.log(
    "usage: npx ts-node client.ts alice bob"
  );

  process.exit(0);
}

const ws =
  new WebSocket(
    "ws://localhost:8080"
  );

const identity =
  new IdentityManager();

const targetIdentity =
  new IdentityManager();

const sharedSecret =
  SessionManager.createSharedSecret(
    identity.getPrivateKey(),
    targetIdentity.getPublicKey()
  );

ws.on("open", () => {

  console.log(
    `${userId} connected`
  );

  ws.send(
    JSON.stringify({
      type: "login",
      userId
    })
  );
});

ws.on("message", (data) => {

  const msg =
    JSON.parse(data.toString());

  if (msg.type === "message") {

    const decrypted =
      CryptoManager.decrypt(
        msg.payload.encrypted,
        msg.payload.iv,
        msg.payload.tag,
        sharedSecret
      );

    console.log();
    console.log(
      `[${msg.from}] ${decrypted}`
    );
    rl.prompt();
  }
});

const rl =
  readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

rl.setPrompt("> ");

rl.prompt();

rl.on("line", (line) => {

  const encrypted =
    CryptoManager.encrypt(
      line,
      sharedSecret
    );

  ws.send(
    JSON.stringify({
      type: "message",
      from: userId,
      target: targetId,
      payload: encrypted
    })
  );

  rl.prompt();
});
