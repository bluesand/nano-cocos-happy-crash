import { _decorator, Component, Label, Sprite, Button, Node, SpriteFrame, Color, Animation } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { localConfig } from '../../frameworks/localConfig';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { playerData } from '../../frameworks/playerData';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { constants } from '../../shared/constants';
import { GameLogic } from '../../frameworks/gameLogic';
import { utils } from '../../shared/utils';
import { uiManager } from '../../frameworks/uiManager';
const { ccclass, property } = _decorator;

@ccclass('Buy')
export class Buy extends Component {
    @property
    public lbTitle: Label = null!;
    @property
    public lbNum: Label = null!;
    @property
    public lbDesc: Label = null!;
    @property
    public lbGold: Label = null!;
    @property
    public lbGoldNum: Label = null!;
    @property
    public lbAd: Label = null!;
    @property
    public spProp: Sprite = null!;
    @property
    public spAdIcon: Sprite = null!;
    @property
    public btnBuy: Button = null!;
    @property
    public nodeBtnBuy: Node = null!;
    @property
    public nodeBtnAd: Node = null!;
    @property
    public imgShare: SpriteFrame = null!;
    @property
    public imgAd: SpriteFrame = null!;

    public propId: any;
    public eventType: any;
    public countPerBuy: any;
    public propNum: any;
    public cost: any;
    public getPropType: any;

    onEnable() {
        clientEvent.on('updateGold', this.updateGold, this);
        clientEvent.on('updateInfiniteShareTimes', this.updateBuyBtn, this);
    }

    onDisable() {
        clientEvent.off('updateGold', this.updateGold, this);
        clientEvent.off('updateInfiniteShareTimes', this.updateBuyBtn, this);
    }

    showBuy(isShow: any) {
        this.nodeBtnBuy.active = isShow;
        this.nodeBtnAd.active = !isShow;
    }

    show(propId: any, eventType: any) {
        this.propId = propId;
        this.eventType = eventType;
        let prop = localConfig.instance.queryByID('prop', propId);
        if (!prop) {
            console.error('prop was error!', propId);
            this.close();
            return;
        }
        this.countPerBuy = prop.countPerBuy;
        this.lbTitle.string = i18n.t('table_prop.' + prop.name);
        this.propNum = prop.countPerBuy;
        this.lbNum.string = 'X ' + this.propNum;
        this.lbDesc.string = i18n.t('table_prop.' + prop.desc);
        this.cost = prop.countPerBuy * prop.price;
        this.lbGold.string = this.cost;
        if (this.cost > playerData.instance.getGold()) {
            this.btnBuy.interactable = false;
            this.lbGold.color = Color.RED;
        } else {
            this.btnBuy.interactable = true;
            this.lbGold.color = Color.WHITE;
        }
        resourceUtil.setPropIcon(prop.icon, this.spProp, () => { });
        let ani: any = this.node.getComponent(Animation);
        ani.once(Animation.EventType.FINISHED, () => {
            ani.play('buy');
        });
        this.updateGold();
        this.updateBuyBtn();
    }

    updateBuyBtn() {
        if (this.propId === constants.PROP_ID.INFINITE) {
            this.showBuy(false);
            GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.BUY_INFINITE, (err: any, type: any) => {
                this.getPropType = type;
                switch (type) {
                    case constants.OPEN_REWARD_TYPE.AD:
                        this.spAdIcon.spriteFrame = this.imgAd;
                        break;
                    case constants.OPEN_REWARD_TYPE.SHARE:
                        this.spAdIcon.spriteFrame = this.imgShare;
                        break;
                    case constants.OPEN_REWARD_TYPE.NULL:
                        this.showBuy(true);
                        break;
                }
                let infiniteShareTimes = playerData.instance.getInfiniteTimes();
                if (infiniteShareTimes >= constants.MAX_INFINITE_TIMES) {
                    this.spAdIcon.node.active = false;
                    this.lbAd.string = i18n.t('shop.receive');
                } else {
                    this.spAdIcon.node.active = true;
                    this.lbAd.string = infiniteShareTimes + '/' + constants.MAX_INFINITE_TIMES;
                }
            });
        } else {
            this.showBuy(true);
        }
    }

    onBtnCloseClick() {
        this.close();
    }

    onBtnBuyClick() {
        GameLogic.instance.addGold(-this.cost);
        clientEvent.dispatchEvent('updateInfiniteShareTimes');
        this.rewardProp();
        this.close();
    }

    rewardProp() {
        let itemInfo: any = {};
        itemInfo['itemType'] = constants.REWARD_TYPE.PROP;
        itemInfo['itemSubType'] = this.propId;
        itemInfo['itemAmount'] = this.countPerBuy;
        uiManager.instance.showDialog('lottery/reward', [itemInfo, false, constants.SHARE_FUNCTION.BUY_INFINITE]);
    }

    onBtnReceiveClick() {
        let infiniteShareTimes = playerData.instance.getInfiniteTimes();
        if (infiniteShareTimes >= constants.MAX_INFINITE_TIMES) {
            playerData.instance.exchangeInfiniteProp(); //消耗次数
            this.rewardProp();
        }
    }

    close() {
        uiManager.instance.hideDialog('props/buy');
    }

    updateGold() {
        this.lbGoldNum.string = utils.formatMoney(playerData.instance.getGold());
    }

}