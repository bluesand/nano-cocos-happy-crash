import { _decorator } from 'cc';
import { playerData } from './playerData';
import { clientEvent } from './clientEvent';
import { constants } from '../shared/constants';
import { uiManager } from './uiManager';
import { SceneManager } from '../ui/loading/sceneManager';
const { ccclass, property } = _decorator;

@ccclass('GameLogic')
export class GameLogic {
    @property
    public isConnect = false;

    static _instance: GameLogic;
    channel: any;
    timer: any;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new GameLogic();
        return this._instance;
    }

    onAppShow(res: any) {
        console.log('onAppShow', res);
        if (res.scene === 1037 && res.query) {
            let paramStr = 'game_id';
            if (res.query.hasOwnProperty(paramStr)) {
                let gameId = res.query[paramStr];
                this.channel = gameId;
                if (gameId) {
                    this.customEventStatistics(constants.ANALYTICS_TYPE.CHANNEL, { channel: gameId });
                }
            }
        } else if (res.scene === 1044) {
            this.channel = 'share';
        } else if (res.scene) {
            this.channel = res.scene + '';
        }
    }

    afterLogin() {
        this.startTick();
        setTimeout(() => {
            if (playerData.instance.isOpenOffLineReward(constants.OFFLINE_REWARD * 60 * 1000)) {
                uiManager.instance.showDialog('pve/offLineReward', [{
                    itemType: constants.REWARD_TYPE.GOLD,
                    itemAmount: 500,
                    itemSubType: 0
                }]);
            }
            this.convertSignInDataFormat();
            if (!playerData.instance.isNewBee) {
                this.checkSignIn();
            }
        }, 1000);
    }

    startTick() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(this.onTick.bind(this), 1000);
    }

    onTick() {
        if (SceneManager.instance.isStop) {
            return;
        }
        let onlineRewardInfo = playerData.instance.getOnlineRewardInfo();
        if (onlineRewardInfo['value'].receiveStatus === constants.REWARD_STATUS.UNRECEIVABLE) {
            this.addUsedTime();
        }
        this.checkShopPropInfo();
    }

    checkShopPropInfo() {
        if (!playerData.instance.playerInfo.hasOwnProperty('shopPropInfo')) {
            playerData.instance.resetShopPropInfo();
            playerData.instance.updateShopPropInfo(false); //第一次设置为可以领取
        } else {
            let shopPropInfo = playerData.instance.playerInfo.shopPropInfo;
            let shopCreateDate = shopPropInfo['createDate'];
            let shopReceiveStatus = shopPropInfo['receiveStatus'];
            let isReceived = shopPropInfo['isReceived'];
            let isTimeOut = Date.now() - shopCreateDate >= constants.SHOP_COUNTDOWN_HOURS * 3600000;
            if (isTimeOut && shopReceiveStatus !== constants.REWARD_STATUS.RECEIVABLE) {
                playerData.instance.updateShopPropInfo(false);
                clientEvent.dispatchEvent('updateShopPropInfo');
            }
        }
    }

    checkSignIn() {
        playerData.instance.updateSignInCurrentDay();
        if (!playerData.instance.getSignInReceivedInfo().isTodayReceived) { //如果今天还没签到则弹出
            uiManager.instance.showDialog('signIn/signIn')
        }
    }

    addUsedTime() {
        let usedTime = playerData.instance.getOnlineRewardInfo()['usedTime'];
        let spareTime = playerData.instance.getCountdownTime() * 60 * 1000 - usedTime * 1000;
        if (spareTime <= 0) {
            playerData.instance.updateOnlineRewardInfo(false); //显示可领取按钮
        }
        playerData.instance.addUsedTime();
    }

    convertSignInDataFormat() {
        if (playerData.instance.playerInfo.hasOwnProperty('signInInfo') &&
            playerData.instance.playerInfo['signInInfo'].hasOwnProperty('value')) {
            playerData.instance.convertSignInDataFormat(playerData.instance.playerInfo['signInInfo']);
        }
    }

    finishLink(cake: any, value: any) {
        playerData.instance.finishLink(cake, value);
        clientEvent.dispatchEvent('updateTargets', cake);
        clientEvent.dispatchEvent('updateStep');
    }

    checkGame() {
        if (playerData.instance.isLevelFinish()) {
            clientEvent.dispatchEvent('levelFinished');
            return;
        }
        if (playerData.instance.isGameOver()) {
            clientEvent.dispatchEvent('gameOver');
            return;
        }
    }

    resetLevel() {
        playerData.instance.startNewLevel();
        clientEvent.dispatchEvent('newLevel');
    }

    showRewardAd(callback: any) {
        callback && callback(null);
    }

    showInterStitialAd(callback: any) {
        callback(null);
    }

    share(funStr: any, objQuery: any, callback: any, isShowConfirmAfterFailed?: any) {
        callback();
    }

    addDiamond(num: any) {
        playerData.instance.addDiamond(num);
        clientEvent.dispatchEvent('updateDiamond');
    }

    addGold(num: any) {
        playerData.instance.addGold(num);
        clientEvent.dispatchEvent('updateGold');
    }

    addProp(propId: any, num: any) {
        playerData.instance.addProp(propId, num);
        clientEvent.dispatchEvent('updateProp', propId);
    }

    getOpenRewardType(funStr: any, callback: any) {
        callback(null, constants.OPEN_REWARD_TYPE.NULL);
    }

    customEventStatistics(eventType: any, objParams?: any) {
    }

    requestWithPost(url: any, data: any, callback: any) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    let dataObj = xhr.responseText;
                    try {
                        dataObj = JSON.parse(xhr.responseText);
                    } catch (exception) {
                        console.error(xhr.responseText);
                    }
                    callback(null, dataObj);
                } else {
                    callback('failed', xhr.status);
                }
            }
        };
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    }
}