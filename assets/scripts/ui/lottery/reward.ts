import { _decorator, Component, SpriteFrame, Sprite, Label, Animation, Node, UITransform } from 'cc';
import { GameLogic } from '../../frameworks/gameLogic';
import { localConfig } from '../../frameworks/localConfig';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { constants } from '../../shared/constants';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { uiManager } from '../../frameworks/uiManager';
const { ccclass, property } = _decorator;

@ccclass('Reward')
export class Reward extends Component {
    @property
    public sfDiamond: SpriteFrame = null!;
    @property
    public sfGold: SpriteFrame = null!;
    @property
    public spIcon: Sprite = null!;
    @property
    public lbRewardValue: Label = null!;
    @property
    public aniGetItem: Animation = null!;
    @property
    public ndBtnNormalReceive: Node = null!;
    @property
    public ndBtnDoubleReceive: Node = null!;
    @property
    public ndBtnReceive: Node = null!;

    public itemType: any;
    public itemAmount: any;
    public itemSubType: any;
    public shareFunction: any;
    public openRewardType: any;

    show(itemInfo: any, isDoubleReceive: any, shareFunction: any) {
        this.itemType = itemInfo["itemType"];
        this.itemAmount = itemInfo["itemAmount"];
        this.itemSubType = itemInfo["itemSubType"];
        this.shareFunction = shareFunction;
        this.aniGetItem.play('getItemShow');
        this.aniGetItem.once(Animation.EventType.FINISHED, () => {
            this.aniGetItem.play('getItemIdle');
        }, this);
        this.setRewardPage();
        if (isDoubleReceive) {
            this.ndBtnReceive.active = false;
            GameLogic.instance.getOpenRewardType(this.shareFunction, (err: any, type: any) => {
                if (!err) {
                    this.openRewardType = type;
                    switch (type) {
                        case constants.OPEN_REWARD_TYPE.AD:
                            this.ndBtnDoubleReceive.active = true;
                            break;
                        case constants.OPEN_REWARD_TYPE.SHARE:
                            this.ndBtnDoubleReceive.active = true;
                            break;
                        case constants.OPEN_REWARD_TYPE.NULL:
                            this.ndBtnDoubleReceive.active = false;
                            break;
                    }
                } else {
                    this.close();
                }
            });
            this.ndBtnNormalReceive.active = false;
            this.scheduleOnce(this.normalBtnCallback, constants.NORMAL_SHOW_TIME);
        } else {
            this.ndBtnNormalReceive.active = false;
            this.ndBtnDoubleReceive.active = false;
            this.ndBtnReceive.active = true;
        }
    }

    normalBtnCallback() {
        this.ndBtnNormalReceive.active = true;
    }

    setRewardPage() {
        const uiTraSpIcon = this.spIcon.getComponent(UITransform)!;
        switch (this.itemType) {
            case constants.REWARD_TYPE.DIAMOND:
                this.spIcon.spriteFrame = this.sfDiamond;
                this.lbRewardValue.string = 'x' + this.itemAmount;
                break;
            case constants.REWARD_TYPE.GOLD:
                this.spIcon.spriteFrame = this.sfGold;
                this.lbRewardValue.string = 'x' + this.itemAmount;
                uiTraSpIcon.width = 257;
                uiTraSpIcon.height = 166;
                break;
            case constants.REWARD_TYPE.PROP:
                let propData = localConfig.instance.queryByID('prop', this.itemSubType);
                uiTraSpIcon.width = 168;
                uiTraSpIcon.height = 168;
                resourceUtil.setPropIcon(propData.icon, this.spIcon, () => { });
                let txt = i18n.t('table_prop.' + propData.name);
                this.lbRewardValue.string = txt + i18n.t('') + ' x ' + this.itemAmount;
                break;
        }
    }

    onBtnNormalReceiveClick() {
        this.addReward();
        this.close();
    }

    onBtnDoubleReceiveClick() {
        switch (this.openRewardType) {
            case constants.OPEN_REWARD_TYPE.AD:
                GameLogic.instance.showRewardAd((err: any) => {
                    if (!err) {
                        this.itemAmount *= 2;
                        this.showDoubleReward();
                    }
                })
                break;
            case constants.OPEN_REWARD_TYPE.SHARE:
                GameLogic.instance.share(this.shareFunction, {}, (err: any) => {
                    if (!err) {
                        this.itemAmount *= 2;
                        this.showDoubleReward();
                    }
                })
                break;
        }
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
    }

    showDoubleReward() {
        this.unschedule(this.normalBtnCallback);
        let itemInfo: any = {};
        itemInfo['itemType'] = this.itemType;
        itemInfo['itemSubType'] = this.itemSubType;
        itemInfo['itemAmount'] = this.itemAmount;
        uiManager.instance.showDialog('lottery/reward', [itemInfo, false, this.shareFunction]);
        this.close();
    }

    close() {
        uiManager.instance.shiftFromPopupSeq('lottery/reward');
    }

}