# 项目名称：国产化 Signal 协议通信系统（Local Demo版）

目标：基于 libsignal 实现端到端加密通信闭环（注册、密钥交换、加密消息发送、解密消息接收），仅用于本地测试部署，不依赖数据库。
1. 总体架构
## 1.1 模块划分
client-sdk（客户端协议层）
  * libsignal封装
  * Session 建立
  * 消息加解密
  * 密钥生成与管理

local-server（本地信令服务器）
  * WebSocket/HTTP API
  * 消息路由与转发
  * 用户注册与设备标识
  * PreKey/Bundle 分发

relay（消息转发层）
  * 简化版 Signal 服务端的 message queue
  * 内存队列实现（无数据库）

demo-client（演示客户端）
  * CLI/桌面/Web前端
  * 支持发送/接收文本消息
  * 展示协议运行过程


2. 技术选型建议

2.1 libsignal语言方案（推荐）
* Rust：`libsignal` 官方维护最完整
* Java/Kotlin：适合安卓端演示
* TypeScript/Node：适合快速demo（但libsignal支持不如Rust完整）

推荐组合：
协议核心：Rust
本地服务器： Node.js
演示客户端：Node CLI + WebSocket

---
3. 功能范围（MVP）
3.1 用户与设备模型（本地内存）
* 用户注册：`user_id`
* 设备注册：`device_id`
* identity key pair 生成
* signed prekey 生成
* one-time prekey 批量生成

3.2 密钥分发（本地服务器提供）
提供 API：
* 上传 KeyBundle（identity + signedPreKey + preKeys）
* 获取对方 KeyBundle（用于建立 session）

3.3 Session 建立（核心）
* Alice 获取 Bob bundle
* Alice 通过 X3DH 初始化 session
* 生成 session state（Double Ratchet）

3.4 消息加密与发送
* Alice 使用 session 对消息加密
* server 只负责转发 ciphertext

3.5 消息接收与解密
* Bob 收到 ciphertext
* Bob 使用 session state 解密

4. 系统组件详细大纲
4.1 client-sdk（libsignal封装层）
 4.1.1 目录结构建议
```
client-sdk/
  src/
    identity/
    prekey/
    session/
    message/
    storage/
    api/
```
4.1.2 核心功能
* IdentityKeyPair 生成
* SignedPreKey 生成/签名
* OneTimePreKey 批量生成
* SessionBuilder（建立 session）
* SessionCipher（加密/解密消息）
* 序列化与反序列化（bundle/session state）
  
4.1.3 Storage（无数据库实现）
必须实现的“存储接口”（但实际存内存）：

* IdentityStore
* PreKeyStore
* SignedPreKeyStore
* SessionStore

实现方式：
* HashMap 内存存储
* 可选：落地到本地文件 JSON（仍不算数据库）

4.2 local-server（信令服务器）
 4.2.1 功能定位
只做三件事：
1. 注册用户/设备
2. 保存并提供 KeyBundle（内存）
3. 转发加密消息（WebSocket 或 HTTP）

4.2.2 目录结构建议
```
local-server/
  src/
    api/
    websocket/
    keybundle/
    routing/
    models/
    storage/
```
4.2.3 核心接口设计（REST）

* `POST /register`

  * 参数：user_id, device_id
  * 返回：ok

* `POST /keys/upload`

  * 上传 identity key + signed prekey + prekeys

* `GET /keys/{user_id}/{device_id}`

  * 返回 bundle（供建立 session）

* `POST /message/send`

  * 参数：from, to, ciphertext

* `GET /message/pull`

  * 拉取离线消息（内存队列）

（也可以用 WebSocket 做 push）

---

4.3 relay（内存消息队列）
 4.3.1 功能
* 每个用户一个队列 `Queue<Message>`
* server 收到密文后写入队列
* 收件人在线则 push，否则 pull

4.3.2 数据结构
```
HashMap<UserDevice, VecDeque<CipherMessage>>
```
---
 4.4 demo-client（演示客户端）
 4.4.1 CLI功能
* `init`：生成身份密钥并注册
* `upload-keys`：上传 bundle
* `send <user> <text>`：加密并发送
* `listen`：监听消息并解密

 4.4.2 展示输出（便于论文/报告）
* 输出 identity public key
* 输出 signed prekey id
* 输出 session 是否建立成功
* 输出 ciphertext 长度与格式
* 输出解密后的 plaintext

---

# 5. 数据结构设计（关键）

---

## 5.1 KeyBundle（必须）

包含：

* identity public key
* signed prekey public key + signature
* one-time prekey list
* registrationId / deviceId

---

## 5.2 CiphertextMessage（必须）

字段：

* from_user
* from_device
* to_user
* to_device
* ciphertext（bytes/base64）
* timestamp

---

# 6. 协议流程（MVP闭环）

---

## 6.1 初始化阶段

1. 客户端生成 IdentityKeyPair
2. 客户端生成 SignedPreKey + PreKeys
3. 上传 KeyBundle 到 server

---

## 6.2 建立 session

1. Alice 向 server 请求 Bob bundle
2. Alice 使用 bundle 建立 session（X3DH）
3. Alice 保存 session state

---

## 6.3 发送消息

1. Alice 用 SessionCipher 加密 plaintext
2. server 只转发 ciphertext
3. Bob 解密并更新 ratchet

---

# 7. 安全策略（本地demo可简化）

必须保留：

* libsignal完整 session state 更新
* identity key 校验（防中间人）
* signed prekey signature 验证

可以忽略（demo阶段）：

* 多设备同步
* sealed sender
* 群组 sender key
* 消息回执
* 离线消息长期存储

---

# 8. 测试与验证

## 8.1 单元测试

* identity生成测试
* prekey生成测试
* bundle签名验证测试
* session建立测试
* encrypt/decrypt一致性测试

## 8.2 集成测试

* Alice ↔ Bob 双向发消息
* ratchet forward secrecy 测试（消息顺序变化）
* session恢复测试（内存重启则失败，属于预期）

---

# 9. 最终交付物

交付目录建议：

```
国产化-signal-demo/
  client-sdk/
  local-server/
  demo-client/
  docs/
    protocol-flow.md
    api.md
    threat-model.md
    test-report.md
  README.md
```

---

# 10. 后续扩展路线（可选）
如果未来要逐步接近 Signal：
* 用 SQLite 替代内存（仍轻量）
* 引入 Redis（离线队列）
* 增加 multi-device
* 增加群聊 SenderKey
* 增加 sealed sender / anonymous sender
* 增加 attachment 加密上传
* 增加语音/视频信令（WebRTC）



# 11. 里程碑计划
** client-sdk（identity/prekey/session）封装完成
** local-server API + bundle上传/获取
** demo-client 完成，跑通 Alice/Bob 双向消息
** 文档+测试报告+国产化改造说明（适合论文/项目验收）










3）最小可运行 demo（Alice/Bob CLI + server）
