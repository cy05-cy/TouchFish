一、client-sdk（核心协议层）

这是整个系统最重要的模块。

建议：

client-sdk/
├── crypto/
├── session/
├── identity/
├── prekey/
├── message/
├── storage/
└── index.ts
1. crypto

负责：

Curve25519
Ed25519
AES-GCM
HKDF
HMAC-SHA256

你现在不要自己实现。

直接：

Node：
libsignal-client
Java：
官方 Signal protocol
Rust：
signal 官方 rust

建议你现在：

npm install @signalapp/libsignal-client
2. identity

负责：

IdentityKeyPair
RegistrationId
DeviceId

生成：

身份公钥
身份私钥

类似：

{
  "userId": "alice",
  "deviceId": 1,
  "identityKey": "...",
  "registrationId": 1234
}
3. prekey

负责：

SignedPreKey
OneTimePreKey
PreKeyBundle

这是 Signal 初始握手核心。

你必须实现：

generatePreKeys()
generateSignedPreKey()
uploadPreKeyBundle()
fetchPreKeyBundle()
4. session

负责：

X3DH
Double Ratchet
SessionCipher
SessionBuilder

核心流程：

Alice 获取 Bob 的 PreKeyBundle
↓
建立 Session
↓
生成 RootKey
↓
生成 ChainKey
↓
后续 Ratchet

你当前阶段：

先只做到：

SessionBuilder
SessionCipher

就能聊天了。

5. message

负责：

CiphertextMessage
PlaintextMessage
Envelope

例如：

{
  "type": "ciphertext",
  "source": "alice",
  "target": "bob",
  "body": "BASE64..."
}
6. storage

你现在不需要数据库。

直接：

MemoryStore
FileStore(JSON)

例如：

storage/
├── alice.json
└── bob.json

保存：

identity key
prekeys
session

即可。

二、local-server（本地 Signal Server）

这是简化版 signal-server。

建议：

local-server/
├── websocket/
├── api/
├── users/
├── prekeys/
├── routing/
└── app.ts
你现在真正需要的功能只有：
1. 用户注册
POST /register

返回：

{
  "userId": "alice",
  "deviceId": 1
}
2. 上传 PreKeyBundle
POST /keys/upload
3. 获取 PreKeyBundle
GET /keys/:userId
4. WebSocket 建立连接
ws://localhost:8080/ws

客户端上线：

{
  "type": "login",
  "userId": "alice"
}
5. 消息转发

服务端：

alice -> server -> bob

这里只转发：

{
  "type": "message",
  "target": "bob",
  "payload": "encrypted..."
}

服务器永远不解密。

三、relay（消息转发层）

这是简化版 Signal Message Queue。

你当前：

完全不需要 Redis。

直接：

Map<string, Message[]>

即可。

示例
const queues = new Map();

用户离线：

bob offline
↓
message push queue

用户上线：

flush queue
relay 推荐结构
relay/
├── queue.ts
├── delivery.ts
└── memory.ts
四、demo-client（演示客户端）

建议：

先 CLI。

不要一开始搞 Electron。

第一阶段 CLI 即可

结构：

demo-client/
├── cli/
├── websocket/
├── sdk/
└── main.ts
CLI 功能
登录
/login alice
发消息
/send bob hello

流程：

hello
↓
client-sdk 加密
↓
发送 ciphertext
↓
server 转发
↓
bob 解密
↓
显示 plaintext
第二阶段再做：
Web 前端

建议：

React
Vite
五、你当前最正确的技术选型
推荐（最适合本地开发）
模块	技术
client-sdk	TypeScript
local-server	Node.js + Express
websocket	ws
relay	内存 Map
crypto	libsignal-client
demo-client	CLI
storage	JSON