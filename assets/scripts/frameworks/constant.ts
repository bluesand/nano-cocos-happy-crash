export class constant {

    public static GAME_NAME = 'template';

    public static GAME_VERSION = '1.0.1';

    public static GAME_FRAME = 60;      //游戏当前帧率
    public static GAME_INIT_FRAME = 60; //游戏开发基础帧率

    //本地缓存key值
    public static LOCAL_CACHE = {
        PLAYER: 'player',               //玩家基础数据缓存，如金币砖石等信息，暂时由客户端存储，后续改由服务端管理
        SETTINGS: 'settings',           //设置相关，所有杂项都丢里面进去
        DATA_VERSION: 'dataVersion',    //数据版本
        ACCOUNT: 'account',                 //玩家账号
        // TMP_DATA: 'tmpData',             //临时数据，不会存储到云盘
        HISTORY: "history",                   //关卡通关数据
        BAG: "bag",                         //玩家背包，即道具列表，字典类型
    }

}
