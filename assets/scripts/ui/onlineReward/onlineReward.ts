import { _decorator, Component, Node, Label, Animation, Button } from 'cc';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { GameLogic } from '../../frameworks/gameLogic';
import { localConfig } from '../../frameworks/localConfig';
import { playerData } from '../../frameworks/playerData';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { utils } from '../../shared/utils';
const { ccclass, property } = _decorator;

@ccclass('OnlineReward')
export class OnlineReward extends Component {
    @property
    public ndTimer: Node = null!;
    @property
    public lbTime: Label = null!;
    @property(Animation)
    public aniFreeReward: Animation = null!;
    @property
    public btnReceive: Button = null!;

    public oldTime: any;

    start() {
        this.checkOnlineReward(); //检查在线奖励
    }

    checkOnlineReward() {
        let onlineRewardInfo = playerData.instance.getOnlineRewardInfo();
        switch (onlineRewardInfo['value'].receiveStatus) {
            case constants.REWARD_STATUS.UNRECEIVABLE:
                if (this.btnReceive.node) {
                    this.btnReceive.node.active = false;
                }
                this.aniFreeReward.play('freeGiftIdle');
                this.schedule(this.countDownCallback, 0.5);
                break;
            case constants.REWARD_STATUS.RECEIVABLE:
                if (this.btnReceive.node) {
                    this.btnReceive.node.active = true;
                }
                this.aniFreeReward.play('freeGiftActivation');
                this.lbTime.string = i18n.t('onlineReward.receive');
                this.unschedule(this.countDownCallback);
                break;
        }
    }

    onBtnReceiveClick() {
        let dictProp = localConfig.instance.getTable('prop');
        if (!dictProp) {
            return false;
        }
        let arrPropKey = Object.keys(dictProp);
        let arrRandom: any = arrPropKey.filter(element => {
            return Number(element) !== constants.PROP_ID.INFINITE;
        });
        let randomVal = arrRandom[Math.floor(Math.random() * arrRandom.length)] + '';
        GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.ONLINE, (err: any, type: any) => {
            if (!err) {
                switch (type) {
                    case constants.OPEN_REWARD_TYPE.AD:
                        GameLogic.instance.showRewardAd((err: any) => {
                            if (!err) {
                                this.showReward(randomVal);
                            }
                        })
                        break;
                    case constants.OPEN_REWARD_TYPE.SHARE:
                        GameLogic.instance.share(constants.SHARE_FUNCTION.ONLINE, {}, (err: any) => {
                            if (!err) {
                                this.showReward(randomVal);
                            }
                        })
                        break;
                    case constants.OPEN_REWARD_TYPE.NULL:
                        this.showReward(randomVal);
                        break;
                }
            }
        })
    }

    countDownCallback() {
        let nowTime = Date.now();
        if (!this.oldTime) {
            this.oldTime = nowTime;
        }
        if (nowTime - this.oldTime > 1000) {
            let usedTime = playerData.instance.getOnlineRewardInfo()['usedTime'];
            let spareTime = playerData.instance.getCountdownTime() * 60 * 1000 - usedTime * 1000;
            if (spareTime <= 0) {
                this.unschedule(this.countDownCallback);
                playerData.instance.updateOnlineRewardInfo(false); //设置为可领取
                this.checkOnlineReward();
                this.lbTime.string = i18n.t('onlineReward.receive');
            } else {
                this.lbTime.string = (utils.formatTimeForMillisecond(spareTime)).toString();
                this.oldTime = nowTime;
            }
        }
    }

    showReward(randomVal: any) {
        let itemInfo: any = {};
        itemInfo['itemType'] = constants.REWARD_TYPE.PROP;
        itemInfo['itemSubType'] = randomVal;
        itemInfo['itemAmount'] = 1;
        uiManager.instance.showDialog('lottery/reward', [itemInfo, false, constants.SHARE_FUNCTION.ONLINE]);
        playerData.instance.updateOnlineRewardInfo(true);
        this.checkOnlineReward();
    }

}