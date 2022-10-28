const win = window as any;

export const languages = {
    // write your key value pairs here
    "login": {
        "noAccount": "No account,please create!"
    },

    "sign": {
        "double rewards": "Sharing Award X2",
        "day%{value}": "Day%{value}",
    },

    "fight": {
        "fightStartAdAsk": "Watch ads to get bonuses?",
        "fightOverAdAsk": "watch ads to get 5 extra steps?",
        "highest": "highest: ",
        "propExceedMaxTimes": "Reach the limit. No more effects for this round.",
        "propNoEnough": "The props have been used up!",
        "needCollect": "You still need to collect",
    },

    "lottery": {
        "lotteryNotEnoughGetLotteries": "No enough tickets! Click the button below to get more tickets.",
        "noChargePleaseWait": "Coming soon",
        "waitForLoadingAds": "Ads loading...",
        "still%{value}winLottery": "<color=#ffffff>还有<color=#7dd5ff>%{value}</color>次获得奖券的机会</color>",
    },

    "pve": {
        "cannotSkipLastLevel": "Please finish the previous checkpoints first!",
        "highest": "Highest",
        "unLockProp": "Congratulations on unlocking the prop.",
    },

    "task": {
        "notExist": "Task not existed",
        "succeed": "Task completed",
        "fail": "Task not completed",
    },
    "prop": {
        "prop": "Get props",
        "lackGold": "lack of gold",
        "hammer": "hammer",
        "magic": "magic",
        "refresh": "refresh",
        "infinite": "infinite",
        "get": "obtain %{name} x%{num}"
    },

    "table_prop": {
        "锤子": "Hammer",
        "魔法棒": "Magic",
        "刷新": "Refresh",
        "无限": "infinite",
        "消除选择的1个蛋糕，每局限用3个": "Remove the selected cake. 3 times each game.",
        "赋予选择的1个蛋糕直线特效，每局限用1个": "Give the cake a straight line effect. 1 times each game.",
        "重新排列游戏区内所有蛋糕，每局限用3次": "Refresh. 3 times each game.",
        "使用后本关不再限制游戏步数,每局限用1个": "The steps will be infinite, 1 times each game.",
    },

    "rank": {
        "shareTitle": "Cake Crush",
    },

    "onlineReward": {
        "receive": "Receive it"
    },

    "shop": {
        "receive": "Receive it"
    },
};

if (!win.languages) {
    win.languages = {};
}

// if (!win.languages.en) {
win.languages.en = languages;
// }
