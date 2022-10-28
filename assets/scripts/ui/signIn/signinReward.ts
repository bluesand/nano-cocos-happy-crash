import { _decorator, Component, SpriteFrame, Sprite, Label, Animation, UITransform } from 'cc';
import { uiManager } from '../../frameworks/uiManager';
import { playerData } from '../../frameworks/playerData';
import { clientEvent } from '../../frameworks/clientEvent';
import { GameLogic } from '../../frameworks/gameLogic';
import { constants } from '../../shared/constants';
import { localConfig } from '../../frameworks/localConfig';
import { resourceUtil } from '../../frameworks/resourceUtil';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('signInReward')
export class signInReward extends Component {
    @property(SpriteFrame)
    public sfDiamond: SpriteFrame = null!;
    @property(SpriteFrame)
    public sfGold: SpriteFrame = null!;
    @property(Sprite)
    public spIcon: Sprite = null!;
    @property(Label)
    public lbRewardValue: Label = null!;
    @property(Animation)
    public aniGetItem: Animation = null!;

    public itemInfo: any;
    public currentDay: any;
    public callback: any;
    public isLast: any;
    public itemType: any;
    public itemAmount: any;
    public itemSubType: any;

    show(itemInfo: any, callback: any, isLast: any) {
        this.itemInfo = itemInfo;
        this.currentDay = itemInfo['ID'];
        this.callback = callback;
        this.isLast = isLast;
        this.itemType = itemInfo["itemType"];
        this.itemAmount = itemInfo["itemAmount"];
        this.itemSubType = itemInfo["itemSubType"];
        this.aniGetItem.play('getItemShow');
        this.aniGetItem.once(Animation.EventType.FINISHED, () => {
            this.aniGetItem.play('getItemIdle');
        }, this);
        this.setRewardPage();
    }

    setRewardPage() {
        const uiTraSpIcon = this.spIcon.getComponent(UITransform)!;
        switch (this.itemType) {
            case constants.REWARD_TYPE.DIAMOND:
                this.spIcon.spriteFrame = this.sfDiamond;
                this.lbRewardValue.string = this.itemAmount;
                break;
            case constants.REWARD_TYPE.GOLD:
                this.spIcon.spriteFrame = this.sfGold;
                this.lbRewardValue.string = this.itemAmount;
                uiTraSpIcon.width = 257;
                uiTraSpIcon.height = 166;
                break;
            case constants.REWARD_TYPE.PROP:
                let propId = this.itemSubType;
                let propData = localConfig.instance.queryByID('prop', propId + '');
                resourceUtil.setPropIcon("00" + propId, this.spIcon, () => { });
                uiTraSpIcon.width = 168;
                uiTraSpIcon.height = 168;
                let txt = i18n.t('table_prop.' + propData.name);
                this.lbRewardValue.string = txt + i18n.t('') + ' x ' + this.itemAmount;
                break;
        }
    }

    onBtnReceiveClick() {
        this.addReward();
        if (this.isLast) { //当前的isLast
            let isReceive = null;
            GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.FILL_SIGN, (err: any, type: any) => {
                if (!err) {
                    switch (type) {
                        case constants.OPEN_REWARD_TYPE.AD:
                            isReceive = playerData.instance.getSignInReceivedInfo()['isAllReceived'];
                            break;
                        case constants.OPEN_REWARD_TYPE.SHARE:
                            isReceive = playerData.instance.getSignInReceivedInfo()['isAllReceived'];
                            break;
                        case constants.OPEN_REWARD_TYPE.NULL:
                            isReceive = playerData.instance.getSignInReceivedInfo()['isTodayReceived'];
                            break;
                    }
                } else {
                    isReceive = playerData.instance.getSignInReceivedInfo()['isAllReceived'];
                }
            })
            if (!isReceive) { //null：是今天否领取完，分享广告：是否全部领取完，如果没有则接着显示signIn界面
                uiManager.instance.showDialog('signIn/signIn');
            } else { //直接隐藏自己
                uiManager.instance.hideDialog("signIn/signInReward");
            }
        }
        uiManager.instance.shiftFromPopupSeq('signIn/signInReward'); //关闭当前奖励界面，显示下一个
    }

    addReward() {
        switch (this.itemType) {
            case constants.REWARD_TYPE.DIAMOND:
                GameLogic.instance.addDiamond(this.itemAmount);
                break;
            case constants.REWARD_TYPE.GOLD:
                GameLogic.instance.addGold(this.itemAmount);
                break;
            case constants.REWARD_TYPE.PROP:
                GameLogic.instance.addProp(this.itemSubType, this.itemAmount);
                break;
        }
        if (this.currentDay) {
            playerData.instance.updateSignInReceivedDays(this.currentDay);
            clientEvent.dispatchEvent('updateSignIn');
        }
        if (this.callback) {
            this.callback();
        }
    }
}