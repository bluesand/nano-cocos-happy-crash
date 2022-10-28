const constants = {
    VERSION: '1.4.7',

    //本地缓存KEY值
    LOCAL_CACHE: {
        PLAYER: 'player', //玩家基础数据缓存，如金币砖石等信息，暂时由客户端存储，后续改由服务端管理
        SETTINGS: 'settings', //设置相关，所有杂项都丢里面进去
        DATA_VERSION: 'dataVersion', //数据版本
        ACCOUNT: 'account', //玩家账号
        PASSWORD: 'password', //玩家账号
        PRIVATE_KEY: 'privateKey', //privateKey
        // TMP_DATA: 'tmpData',             //临时数据，不会存储到云盘
        HISTORY: "history", //关卡通关数据
        BAG: "bag", //玩家背包，即道具列表，字典类型
    },

    //settings的本地缓存key
    SETTINGS_KEY: {
        LOTTERY: 'lottery', //抽奖
        MOREGAME_FIRSTCLICK: 'moreGameFirstClick', //更多游戏是否头一次点击
    },

    TMP_DATA_KEY: {
        AD_TIMES: 'adTimes', //已经观看广告的次数
    },

    //道具ID列表
    PROP_ID: {
        HAMMER: 1, //锤子
        MAGIC: 2, //魔法棒
        REFRESH: 3, //刷新
        INFINITE: 4 //无限
    },

    GUIDE_TYPE: { //新手引导类型
        SPACE: 0, //空，不做任何操作，用来判定触发
        GUIDE_ANI: 1, //引导动画
        TRIGGER_EVENT: 2, //触发事件
        WAIT_EVENT: 3, //等待事件触发
        GUIDE: 4 //界面性引导
    },

    //顺时针
    GUIDE_TIPS_DIRECTION: { //tips展示方向
        TOP: 0,
        RIGHT: 1,
        BOTTOM: 2,
        LEFT: 3
    },

    SHARE_TYPE: { //分享文案
        SHARE_GAME: 0, //游戏分享
        GROUP_RANK: 1, //群排行
    },

    SHARE_FUNCTION: {
        BALANCE: 'balance', //结算分享
        PVE: 'pve', //PVE界面分享
        START_REWARD: 'startReward', //开局奖励
        LACK_STEP: 'lackStep', //步数不足
        FILL_SIGN: 'fillSign', //补签分享
        OFFLINE: 'offline', //离线奖励
        RANK: 'rank', //排行榜
        BUY_INFINITE: 'buyInfinite', //购买无限道具需要分享
        LOTTERY: 'lottery', //抽奖
        LOTTERY_REWARD: 'lotteryReward', //抽奖奖励，用于双倍分享
        ONLINE: 'online', //在线奖励
        SHOP_PROP: 'shopprop', //商店随机道具
        FIGHT: 'fight', //战斗界面分享
        SIGN: 'sign', //签到分享
    },

    //观看广告的最大次数
    WATCH_AD_MAX_TIMES: {
        LOTTERY: 10, //抽奖
        // CHOICE: 5,          //三选一  
        // PICK_GAME: 5,       //捡蛋糕游戏
    },

    ZORDER: {
        LINK_ITEM_NORMAL: 0,
        LINK_ITEM_SKILL: 1,
        FIGHT_NUM: 20, //战斗数字特效
        DIALOG: 100, //弹窗的Z序
        REWARD: 900, //奖励的弹窗
        WAITING: 998, //等待界面弹窗
        TIPS: 999, //提示框
    },

    //统计事件类型
    STAT_EVENT_TYPE: {

        // BALANCE_SHOW: 'balanceShow',                            //结算界面展现
        // BALANCE_SHARE_SHOW: 'balanceShareShow',                 //结算界面分享按钮展现
        // BALANCE_SHARE_SUCCESS: 'balanceShareSuccess',           //结算界面分享成功
        // BALANCE_AD_SHOW: 'balanceAdShow',                       //结算界面分享按钮展现
        // BALANCE_AD_SUCCESS: 'balanceAdSuccess',                 //结算界面分享成功
        // CROSS_BTN_CLICK: 'crossBtnClick',                       //交叉营销组件点击
    },

    LINK_ROWS_COUNT: 8, //总共有多少行

    LINK_COLS_COUNT: 8, //总共有多少列

    SPECIAL_EFFECT: {
        HORIZONTAL: 1,
        VERTICAL: 2,
        PLUS: 3,
        CENTER: 4
    },

    //签到奖励状态
    SIGN_REWARD_STATUS: {
        RECEIVED: 0, //已领取的
        RECEIVABLE: 1, //可领取的
        UNRECEIVABLE: 2, //不可领取的
        FILLSIGNIN: 3, //补签的
        AFTER_FILLSIGNIN: 4 //补签后
    },

    MAX_SIGN_IN_REWARDS_DAY: 7, //最多签到获取奖励天数

    MAX_INFINITE_TIMES: 10, //获得无限道具所需分享次数

    AUDIO_MUSIC: {
        BACKGROUND: "bgm", //背景音乐
        FIGHT: "fight", //游戏音乐
    },

    AUDIO_SOUND: {
        CLICK: "click", //点击音效
        BONUS_TIME: "bonusTime",
        FINISH_LINK: "finishLink", //连接完后触发
        CLICK_CAKE: "clickCake", //点击蛋糕
        FINISH_STAR: "finishStar", //星星达成
        FLY_STAR: "flyStar", //特殊效果获得
        LINE_BOMB: "lineBomb", //横竖爆炸触发
        PLUS_BOMB: "plusBomb", //十字爆炸触发
        RANGE_BOMB: "rangeBomb", //范围爆炸触发
        SPARE_STEP: "spareStep", //剩余步数飞入
        GOOD: "good",
        GREAT: "great",
        EXCELLENT: "excellent",
        AMAZING: 'amazing',
        UNBELIEVABLE: 'unbelievable'
    },

    MAX_GRADE_OF_EACH_PVE_LEVEL: 3, // pve每个关卡最高等级

    PVE_LEVEL_STATUS: {
        DONE: 0,
        UNDONE: 1,
        DOING: 2
    },

    //加载场景类型
    SCENE_MANAGER_TYPE: {
        LOAD: 0, //加载
        LOAD_SCENE: 1 //加载场景
    },

    //奖励类型
    REWARD_TYPE: {
        DIAMOND: 1, //钻石
        GOLD: 2, //金币
        PROP: 3, //道具
        GIFT: 4, //礼包
    },

    LOTTERY_MAX_TIMES: 3, //最大抽奖次数

    LOTTERY_AD_MAX_TIMES: 10, //看广告获得奖券的总次数

    TASK_RESET_TIME: 4, //任务倒计时时间

    TASK_MAX_NUM: 4, //显示最大任务数量

    MOREGAME_MAIN: '1001',

    //任务完成状态
    TASK_STATE: {
        UNRECEIVABLE: 0, //不可领取的，任务未完成
        RECEIVABLE: 1, //可领取的，任务完成
        RECEIVED: 2, //已领取，任务完成
    },

    ANALYTICS_TYPE: {
        ON_LOGIN: 'onLogin', // 登录
        START_LEVEL: 'levelStart', //关卡开始
        END_LEVEL: 'levelOver', //关卡结束
        ASK_WATCH_ADS_GET_EFFECT: 'askWatchAdForEffect', //询问看广告的有几次
        WATCH_ADS_GET_EFFECT: 'watchAdForEffect', // 观看激励广告获得特效
        ASK_WATCH_ADS_ADD_STEP: 'askWatchAdForAddStep', //询问看广告的有几次
        WATCH_ADS_ADD_STEP: 'watchAdForAddStep', // 观看激励广告增加步数
        SCORE_OF_LEVEL: 'scoreOfLevel', // 每关的玩家得分
        ASK_LOTTERY: 'askWatchAdForLottery',
        LOTTERY: 'watchAdForLottery',
        SHARE: 'share',
        ASK_GET_INFINITE: 'askWatchAdForInfinite',
        GET_INFINITE: 'watchAdForInfinite',
        //1.新手进游戏后的正常路线，每个节点都要统计到；
        //七天登陆
        SIGNIN_RECEIVE: 'signinReceive', //签到按钮点击次数
        SIGNIN_FILL: 'signinFill', //签到按钮点击次数
        SIGNIN_CLOSE: 'signinClose', //签到关闭按钮点击次数
        //离线奖励
        OFFLINE_REWARD_SHARE: "offlineRewardShare", //分享按钮点击数
        OFFLINE_REWARD_SHARE_SUCCESS: 'offlineRewardShareSuccess', //成功分享数
        OFFLINE_REWARD_CLOSE: 'offlineRewardClose', //关闭按钮点击数
        //第一关
        OPEN_PANEL: 'openPanel', //点击打开关卡界面
        START_GAME: 'startGame', //开始游戏按钮
        START_GAME_SUCCESS: 'startGameSuccess', //成功进入游戏
        //游戏说明框
        PLAYER_STAY_TIME: 'playerStayTime', //玩家停留时间
        //结算界面
        BALANCE_USED_STEP: 'balanceUsedStep', //使用步数
        BALANCE_GAIN_SCORE: 'balanceGainScore', //获得分数
        //以上每一步的留存率，包括之后5关的留存

        //2.界面所有功能的统计；（统计单人平均数据）
        //签到
        SIGNIN_ENTRANCE: 'signinEntrance', //入口点击数
        //大转盘
        LOTTERY_ENTRANCE: 'lotteryEntrance', //入口点击数
        LOTTERY_TOTAL_TIMES: 'lotteryTotalTimes', //抽奖总次数
        LOTTERY_WATCH_AD: 'lotteryWatchAd', //广告观看次数
        LOTTERY_SHARE: 'lotteryShare', //分享次数
        LOTTERY_WATCH_AD_SUCCESS: 'lotteryWatchAdSuccess', //成功观看广告次数
        LOTTERY_SHARE_SUCCESS: 'lotteryShareSuccess', //成功分享次数
        //在线奖励
        ONLINE_REWARD_ENTRANCE: 'onlineRewardEntrance', //入口点击数
        ONLINE_REWARD_SUCCESS: 'onlineRewardSuccess', //成功领取次数
        //商店
        SHOP_ENTRANCE: 'shopEntrance', //入口点击数
        SHOP_PROP_PER_BUY: 'shopPropPerBuy', //每种道具购买次数
        SHOP_RAND_PROP_SHARE: 'shopRandPropShare', //随机道具分享次数
        SHOP_PLAYER_GOLD: 'shopPlayerGold', //玩家拥有金币数量  
        //设置
        SETTING_MUSIC_ON: 'settingMusicOn', //音乐开启        
        SETTING_MUSIC_OFF: 'settingMusicOff', //音乐开启  
        SETTING_SOUND_ON: 'settingSoundOn', //音乐开启  
        SETTING_SOUND_OFF: 'settingSoundOff', //音乐开启  
        //排行榜
        RANK_ENTRANCE: 'rankEntrance', //入口点击数
        RANK_SHARE: 'rankShare', //排行榜分享
        //分享
        SHARE_CLICK: 'shareClick', //点击数
        SHARE_SUCCESS: 'shareSuccess', //成功分享数
        //更多游戏
        MOREGAME_ENTRANCE: 'moregameEntrance', //入口点击数
        MOREGAME_SINGLE: '互推墙-卖量', //单个游戏点击数
        //主推游戏
        MAIN_PUSH_GAME: '主界面-卖量', //点击数
        //关卡说明界面
        CHECKPOINT_PROP_BUY_NUM: 'checkpointPropBuyNum', //每种道具购买数量
        //游戏中
        GAME_PROP_SUCCESS_NUM: 'gamePropSuccessNum', //每种道具成功使用数量
        GAME_PROP_BUY_NUM: 'gamePropSuccessNum', //游戏中购买的每种道具的数量
        //关卡结算
        BALANCE_NEXT: 'balanceNext', //下一关数
        BALANCE_PLAY_AGAIN: 'balancePlayAgain', //重玩次数
        BALANCE_SHARE: 'balanceShare', //分享次数
        BALANCE_CLOSE: 'balanceClose', //关闭界面次数
        GAME_BAR_CLICK: '导流条-卖量', //导流条点击
        CHANNEL: 'channel',

        WATCH_AD_BTN_SHOW_TIMES: '视频按钮展示次数',
        WATCH_AD_BTN_CLICK_TIMES: '视频按钮点击次数',
        WATCH_AD_BTN_SUCCESS_TIMES: '视频按钮成功点击次数'
    },

    //在线奖励时间间隔(分钟)
    ONLINE_REWARD_INTERVAL: [0, 3, 5, 10, 30],

    //奖励领取状态
    REWARD_STATUS: {
        UNRECEIVABLE: 0, //不可领取的
        RECEIVABLE: 1, //可领取的  
        RECEIVED: 2, //已领取的
    },

    //打开奖励的方法
    OPEN_REWARD_TYPE: {
        AD: 0,
        SHARE: 1,
        NULL: 2
    },

    //商场随机道具倒计时的小时数
    SHOP_COUNTDOWN_HOURS: 4,

    //解锁道具最高的得到第几关
    UNLOCK_HIGEST_LEVEl: 5,

    //2，3，4, 5级对应的解锁道具
    UNLOCK_PROP_ID: [1, 2, 3, 4],

    //离线奖励，与上次登录时间超过10分钟
    OFFLINE_REWARD: 10,

    // 微信banner广告
    WX_BANNER_ADS: {
        BALANCE: 0,
        PVE_PAGE: 1,
        GAME: 2
    },

    // 微信视频广告
    WX_REWARD_ADS: {
        VIDEO: 0
    },

    // 微信广告类型
    WX_ADS_TYPE: {
        BANNER: 0,
        VIDEO: 4
    },

    // 广告返回code
    WX_ADS_RESP_CODE: {
        kAdsReceived: 0,
        kAdsShown: 1,
        kAdsDismissed: 2,
        kUnknownError: 6
    },

    //次按钮在主界面显示后3秒再显示
    NORMAL_SHOW_TIME: 0.2
};
export { constants }