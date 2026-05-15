import {
  PrivateKey
} from "@signalapp/libsignal-client";

export class PreKeyManager {
  signedPreKey: PrivateKey;
  oneTimePreKeys: PrivateKey[];

  constructor(count: number = 5) {
    this.signedPreKey = PrivateKey.generate();

    this.oneTimePreKeys = [];

    for (let i = 0; i < count; i++) {
      this.oneTimePreKeys.push(
        PrivateKey.generate()
      );
    }
  }

  getSignedPreKeyBase64() {
    return Buffer
      .from(
        this.signedPreKey
          .getPublicKey()
          .serialize()
      )
      .toString("base64");
  }

  getOneTimePreKeysBase64() {
    return this.oneTimePreKeys.map((k) =>
      Buffer
        .from(
          k.getPublicKey().serialize()
        )
        .toString("base64")
    );
  }
}