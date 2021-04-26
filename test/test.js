import {hahaduWebsocketClient,hahaduWebsocketResponse} from "../js/websocketClient";

var response = hahaduWebsocketResponse;
response.decodeMessage = function (message) {
    alert(JSON.stringify(message));
}
response.open = function (data) {
    alert('测试连接成功。。。');
}
response.close = function (data) {
    alert('连接关闭成功。。。');
}
var client = hahaduWebsocketClient
client.wsServer = 'ws://127.0.0.1:8800'; //服务器地址
client.reconnection = true //开启长连接（默认true）
client.websocketInit();

function test_send(){
    //    client.sendData.sendType = 'hello';
    client.sendData.data = 'hello'; //消息主体
    client.send(); //发送消息
}
function test_close(){
    client.quit();

}
