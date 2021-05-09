/******
 * @page https://github.com/hahadu/tpswoole-websocket-jsclient
 */
/*****
 * engine packet type
 * @type {{MESSAGE: number, NOOP: number, PING: number, UPGRADE: number, CLOSE: number, PONG: number, OPEN: number}}
 */
const swoole_engine_packet_type={
    /**
     * packet type `open`.
     */
    OPEN : 0,

    /**
     * packet type `close`.
     */
    CLOSE : 1,

    /**
     * packet type `ping`.
     */
    PING : 2,

    /**
     * packet type `pong`.
     */
    PONG : 3,

    /**
     * packet type `message`.
     */
    MESSAGE : 4,

    /**
     * packet type 'upgrade'
     */
    UPGRADE : 5,

    /**
     * packet type `noop`.
     */
    NOOP : 6,
}
/*****
 * socket packet type
 * @type {{CONNECT_ERROR: number, BINARY_ACK: number, ACK: number, CONNECT: number, DISCONNECT: number, BINARY_EVENT: number, EVENT: number}}
 */
const swoole_socket_packet_type = {
    /**
     * Socket packet type `connect`.
     */
    CONNECT : 0,

    /**
     * Socket packet type `disconnect`.
     */
    DISCONNECT : 1,

    /**
     * Socket packet type `event`.
     */
    EVENT : 2,

    /**
     * Socket packet type `ack`.
     */
    ACK : 3,

    /**
     * Socket packet type `connect_error`.
     */
    CONNECT_ERROR : 4,

    /**
     * Socket packet type 'binary event'
     */
    BINARY_EVENT : 5,

    /**
     * Socket packet type `binary ack`.
     * For acks with binary arguments.
     */
    BINARY_ACK : 6,

}

/******
 * 消息处理
 * @type {{ping: hahaduWebsocketResponse.ping, errorMessage: hahaduWebsocketResponse.errorMessage, decodeMessage: hahaduWebsocketResponse.decodeMessage, pong: hahaduWebsocketResponse.pong, close: hahaduWebsocketResponse.close, open: hahaduWebsocketResponse.open}}
 */
var hahaduWebsocketResponse = {

    /*****
     * 消息处理
     * @param message_data
     */
    decodeMessage:function(message_data) {},
    /*****
     * 错误消息处理
     * @param message_data
     */
    errorMessage:function (message_data){
        console.log(message_data['message']);

    },
    /*****
     * 连接
     * @param data
     */
    open:function (data){
        console.log('连接成功');

    },
    /*****
     * 关闭
     * @param data
     */
    close:function (data){
        console.log('连接关闭');

    },
    /*****
     * ping
     * @param data
     */
    ping:function (data){

    },
    /*****
     * pong
     * @param data
     */
    pong:function (data){

    },


}

/*****
 * websocket client
 * @type {{wsServer: string, reconnectionFunc: hahaduWebsocketClient.reconnectionFunc, sendData: {packetType: string, packetId: string, data: string, packetNsp: string, engineType: string, type: string}, heartCheck: {num: number, serverTimeoutObj: null, timeoutObj: null, start: hahaduWebsocketClient.heartCheck.start, reset: (function(): hahaduWebsocketClient.heartCheck), timeout: number}, websocketInit: (function(): null), websocket: null, ping: (function(): void), quit: hahaduWebsocketClient.quit, reconnection: boolean, pong: (function(): void), send: hahaduWebsocketClient.send, checkJson: ((function(*=): (boolean|undefined))|*)}}
 */
let hahaduWebsocketClient = {
    wsServer:'',
    websocket:null,
    sendData:{
        sendType:'',
        data:'',
        engineType:swoole_engine_packet_type.MESSAGE.toString(),
        packetType:swoole_socket_packet_type.CONNECT.toString(),
        packetNsp:'',
        packetId:''
    },
    debugger:false, //调试模式
    onbeforeunload:false,//窗口刷新断开连接
    onunload:true, //窗口关闭断开连接


    /*****
     * 自动重连 默认true 开启
     */
    reconnection:true,
    reconnectionFunc:function (){
        if(this.reconnection===true){

            this.heartCheck.reset().start();
        }
    },
    heartCheck:{
        timeout: 30000, //心跳检测时间
        num: 3,  //3次心跳均未响应重连
        timeoutObj: null,
        serverTimeoutObj: null,
        reset:function (){
            clearTimeout(this.timeoutObj);
            return this;
        },
        start: function(){
            let _this = this;
            let _num = this.num;
            this.timeoutObj && clearTimeout(this.timeoutObj);
            this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
            this.timeoutObj = setTimeout(function(){
                hahaduWebsocketClient.ping(); // 心跳包
                _num--;
                //计算答复的超时次数
                if(_num === 0) {
                    this.quit();
                }
            }, _this.timeout)
        }
    },

    /*****
     * weobsocket 连接方法
     */
    websocketInit:function(){
        try {
            this.websocket = new WebSocket(this.wsServer);//新创建一个socket对象

            this.websocket.onopen = function (evt) {
                hahaduWebsocketResponse.open(evt);
                hahaduWebsocketClient.reconnectionFunc();

            };

            this.websocket.onmessage = function (evt) {

                let received_msg = evt.data;
                if(!!hahaduWebsocketClient.debugger){
                    console.log(received_msg);
                }

                if (hahaduWebsocketClient.checkJson(received_msg)) {

                    let message_data = JSON.parse(received_msg);

                    return hahaduWebsocketResponse.decodeMessage(message_data);

                } else {
                    let response_status = (received_msg.charAt(0));

                    if(response_status==swoole_engine_packet_type.PONG){
                        received_msg = JSON.parse(received_msg.slice(2));
                        hahaduWebsocketResponse.pong(received_msg);
                        hahaduWebsocketClient.reconnectionFunc();
                    }
                    if(response_status==swoole_engine_packet_type.PING){
                        received_msg = JSON.parse(received_msg.slice(2));
                        hahaduWebsocketResponse.ping(received_msg);
                        hahaduWebsocketClient.reconnectionFunc();
                    }
                    if(response_status==swoole_engine_packet_type.MESSAGE){
                        let pack_status = received_msg.charAt(1);
                        received_msg = received_msg.slice(2);

                        if(hahaduWebsocketClient.checkJson(received_msg)){
                            received_msg = JSON.parse(received_msg);
                        }
                        if(pack_status==swoole_socket_packet_type.CONNECT_ERROR){
                            hahaduWebsocketResponse.errorMessage(received_msg);
                        }
                        if(pack_status==swoole_socket_packet_type.CONNECT){
                            if(!!received_msg){
                                hahaduWebsocketResponse.decodeMessage(received_msg);
                            }
                            hahaduWebsocketClient.reconnectionFunc();
                        }

                    }
                }

            };

            this.websocket.onclose = function (evt) {
                hahaduWebsocketResponse.close(evt);
            };
            //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
            window.onbeforeunload = function () {
                if(hahaduWebsocketClient.onbeforeunload){
                    hahaduWebsocketClient.disconnect();
                }
            };
            window.onunload = function (){
                if(hahaduWebsocketClient.onbeforeunload) {
                    hahaduWebsocketClient.disconnect();
                }
            }

        } catch (ex) {
            console.log(ex);
        }

        return this.websocket;

    },
    send:function() {
        let packetNsp = '';
        let packetId ='';
        if (this.websocket.readyState !== WebSocket.OPEN) {
            this.websocketInit();
        }
        if(this.sendData.packetNsp!==''){
            packetNsp = '/'+this.sendData.packetNsp;
        }
        if(this.sendData.packetId!==''){
            packetId = ','+this.sendData.packetId;
        }

        this.websocket.send(this.sendData.engineType + this.sendData.packetType + packetNsp + packetId + JSON.stringify({
            type: this.sendData.sendType,
            data: this.sendData.data
        }));
        this.sendData = {
            sendType: '',
            data: '',
            engineType: swoole_engine_packet_type.MESSAGE.toString(),
            packetType: swoole_socket_packet_type.CONNECT.toString(),
            packetNsp: '',
            packetId: ''
        }

    },
    ping:function (){
        this.sendData.sendType  = 'ping';
        this.sendData.data = "ping";
        this.sendData.engineType = swoole_engine_packet_type.PING
        return this.send();
    },
    pong:function (){
        this.sendData.sendType  = 'pong';
        this.sendData.data = "pong";
        this.sendData.engineType = swoole_engine_packet_type.PONG
        return this.send();
    },
    /*****
     * socket close
     */
    quit:function (){
        this.websocket.close();
    },
    /****
     * disconnect
     */
    disconnect:function () {
        this.sendData.packetType = swoole_socket_packet_type.DISCONNECT;
        this.send();
    },
    checkJson:function (str){
        if (typeof str == 'string') {
            try {
                var obj = JSON.parse(str);
                if (typeof obj == 'object' && obj) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                //    console.log('error：'+str+'!!!'+e);
                return false;
            }
        }
    }
}
