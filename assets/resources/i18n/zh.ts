const win = window as any;

export const languages = {
    // write your key value pairs here
    "login": {
        "noAccount": "没有账户,请创建"
    },

    "sign": {
        "double rewards": "分享奖励数量X2",
        "day%{value}": " 第%{value}天",
    },

    "fight": {
        "fightStartAdAsk": "观看广告可获得2个随机效果，是否观看？",
        "fightOverAdAsk": "步数不足!观看广告可额外获得5步，是否观看？",
        "highest": "最高分: ",
        "propExceedMaxTimes": "该道具已经超过本局最大可用次数",
        "propNoEnough": "该道具已用完，快去购买吧!",
        "needCollect": "你还需收集",
    },

    "lottery": {
        "lotteryNotEnoughGetLotteries": "奖券不足!点击下方按钮获得更多奖券",
        "noChargePleaseWait": "暂未开放充值功能，敬请期待",
        "waitForLoadingAds": "正在加载广告，请骚等",
        "still%{value}winLottery": "<color=#ffffff>还有<color=#7dd5ff>%{value}</color>次获得奖券的机会</color>",
    },

    "pve": {
        "cannotSkipLastLevel": "不能跳过未通关的关卡",
        "highest": "最高分",
        "unLockProp": "恭喜解锁道具",
    },

    "task": {
        "notExist": "任务不存在",
        "succeed": "任务领取成功",
        "fail": "任务未完成",
    },

    "prop": {
        "prop": "道具",
        "lackGold": "金币不足",
        "hammer": "锤子",
        "magic": "魔法棒",
        "refresh": "刷新",
        "infinite": "无限",
        "get": "获得%{name}x%{num}"
    },

    "table_prop": {
        "锤子": "锤子",
        "魔法棒": "魔法棒",
        "刷新": "刷新",
        "无限": "无限",
        "消除选择的1个蛋糕，每局限用3个": "消除选择的1个蛋糕，每局限用3个",
        "赋予选择的1个蛋糕直线特效，每局限用1个": "赋予选择的1个蛋糕直线特效，每局限用1个",
        "重新排列游戏区内所有蛋糕，每局限用3次": "重新排列游戏区内所有蛋糕，每局限用3次",
        "使用后本关不再限制游戏步数,每局限用1个": "使用后本关不再限制游戏步数,每局限用1个",
    },

    "rank": {
        "shareTitle": "蛋糕连接",
    },

    "onlineReward": {
        "receive": "立即领取"
    },

    "shop": {
        "receive": "立即领取"
    },
};


if (!win.languages) {
    win.languages = {};
}

// if (!win.languages.zh) {
win.languages.zh = languages;
// }
