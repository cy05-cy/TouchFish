import {
  PrivateKey
} from "@signalapp/libsignal-client";

export class IdentityManager {
  private identityKey: PrivateKey;

  constructor() {
    this.identityKey = PrivateKey.generate();
  }

  getPrivateKey() {
    return this.identityKey;
  }

  getPublicKey() {
    return this.identityKey.getPublicKey();
  }

  getPublicKeyBase64() {
    return Buffer
      .from(this.getPublicKey().serialize())
      .toString("base64");
  }
}