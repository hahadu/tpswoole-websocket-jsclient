# tpswoole-websocket-jsclient
think-swoole javascript websocket client

think-swoole websocket js 客户端

## 使用

### 引入js文件
```html
<script src="websocketClient.js"></script>
```
### 消息处理
```javascript
var response = hahaduWebsocketResponse;
response.decodeMessage = function (message) {
    //在这里写消息处理逻辑
}
response.open = function (data) {
    //连接成功时处理方法
}
response.close = function (data) {
    //连接关闭
}

```
### 连接
```javascript
var client = hahaduWebsocketClient
client.wsServer = 'ws://127.0.0.1:9502'; //服务器地址
client.reconnection = true //开启长连接（默认true）
client.websocketInit();
```
### 发送消息
```javascript
client.sendData.data = 'hello'; //消息主体
client.send(); //发送消息
```
