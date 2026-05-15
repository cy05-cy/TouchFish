import {
  PrivateKey
} from "@signalapp/libsignal-client";

export class SessionManager {
  static createSharedSecret(
    senderPrivate: PrivateKey,
    receiverPublic: any
  ) {
    const secret =
      senderPrivate.agree(receiverPublic);

    return Buffer
      .from(secret)
      .toString("base64");
  }
}