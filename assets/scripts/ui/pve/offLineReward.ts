import { _decorator, Component, SpriteFrame, Sprite, Label, Animation, Node, UITransform } from 'cc';
import { GameLogic } from '../../frameworks/gameLogic';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { localConfig } from '../../frameworks/localConfig';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('OffLineReward')
export class OffLineReward extends Component {
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
    public ndThreeReceive: Node = null!;
    @property
    public ndNormalReceive: Node = null!;

    public itemInfo: any;
    public rewardType: any;
    public itemType: any;
    public itemAmount: any;
    public itemSubType: any;

    show(itemInfo: any) {
        this.itemInfo = itemInfo;
        this.itemType = itemInfo["itemType"];
        this.itemAmount = itemInfo["itemAmount"];
        this.itemSubType = itemInfo["itemSubType"];
        this.aniGetItem.play('getItemShow');
        this.aniGetItem.once(Animation.EventType.FINISHED, () => {
            this.aniGetItem.play('getItemIdle');
        }, this);
        this.showUI();
        this.ndNormalReceive.active = false;
        this.scheduleOnce(() => {
            this.ndNormalReceive.active = true;
        }, constants.NORMAL_SHOW_TIME);
    }

    showUI() {
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
                let propId = "00" + this.itemSubType;
                let propData = localConfig.instance.queryByID('prop', propId + '');
                uiTraSpIcon.width = 168;
                uiTraSpIcon.height = 168;
                resourceUtil.setPropIcon(propId, this.spIcon, () => { });
                let txt = i18n.t('table_prop.' + propData.name);
                this.lbRewardValue.string = txt + i18n.t('') + ' x ' + this.itemAmount;
                break;
        }
        GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.OFFLINE, (err: any, type: any) => {
            this.rewardType = type;
            if (!err) {
                this.ndThreeReceive.active = type !== constants.OPEN_REWARD_TYPE.NULL!;
            } else {
                this.close();
            }
        })
    }

    showAd() {
        GameLogic.instance.showRewardAd((err: any) => {
            if (!err) {
                this.showReward();
            }
        });
    }

    showShare() {
        GameLogic.instance.share(constants.SHARE_FUNCTION.OFFLINE, {}, (err: any) => {
            if (!err) {
                this.showReward();
            }
        });
    }

    onBtnThreeReceiveClick() {
        if (this.rewardType === constants.OPEN_REWARD_TYPE.AD) {
            this.showAd();
        } else if (this.rewardType === constants.OPEN_REWARD_TYPE.SHARE) {
            this.showShare();
        }
    }

    showReward() {
        uiManager.instance.showDialog('lottery/reward', [{
            itemType: constants.REWARD_TYPE.GOLD,
            itemAmount: this.itemAmount * 3,
            itemSubType: 0
        }, false, constants.SHARE_FUNCTION.OFFLINE]);
        this.close();
    }

    onBtnNormalClick() {
        GameLogic.instance.addGold(this.itemAmount);
        this.close();
    }

    close() {
        uiManager.instance.shiftFromPopupSeq('pve/offLineReward');
    }
}