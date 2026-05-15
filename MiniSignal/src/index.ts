import { CryptoManager } from "./crypto/crypto";
import { IdentityManager } from "./identity/identity";
import { SessionManager } from "./session/session";

async function main() {

  const alice = new IdentityManager();
  const bob = new IdentityManager();

  const aliceSecret =
    SessionManager.createSharedSecret(
      alice.getPrivateKey(),
      bob.getPublicKey()
    );

  const bobSecret =
    SessionManager.createSharedSecret(
      bob.getPrivateKey(),
      alice.getPublicKey()
    );

  console.log("MATCH:",
    aliceSecret === bobSecret
  );

  console.log();

  const plaintext =
    "hello signal";

  console.log("PLAINTEXT:");
  console.log(plaintext);

  console.log();

  const encrypted =
    CryptoManager.encrypt(
      plaintext,
      aliceSecret
    );

  console.log("ENCRYPTED:");
  console.log(encrypted);

  console.log();

  const decrypted =
    CryptoManager.decrypt(
      encrypted.encrypted,
      encrypted.iv,
      encrypted.tag,
      bobSecret
    );

  console.log("DECRYPTED:");
  console.log(decrypted);
}

main();