import { _decorator, Component, Node, Prefab, Label, Animation, Sprite, SpriteFrame, instantiate } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { localConfig } from '../../frameworks/localConfig';
import { playerData } from '../../frameworks/playerData';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { utils } from '../../shared/utils';
import { ButtonEx } from '../common/buttonEx';
import { ShopItem } from './shopItem';
import { ShopPropsOperation } from './shopPropsOperation';

const { ccclass, property } = _decorator;

@ccclass('Shop')
export class Shop extends Component {
    @property
    public arrMenu: Array<Node> = [];
    @property
    public pbShopItem: Prefab = null!;
    @property
    public lbGold: Label = null!;
    @property
    public aniLight: Animation = null!;
    @property
    public ndShopPropsOperation: Node = null!;
    @property
    public spRandPropIcon: Sprite = null!;
    @property
    public lbRandPropNumber: Label = null!;
    @property
    public ndBtnReceive: Node = null!;
    @property
    public spReceive: Sprite = null!;
    @property
    public sfReceive: SpriteFrame = null!;
    @property
    public sfShare: SpriteFrame = null!;
    @property
    public sfAd: SpriteFrame = null!;

    public arrShopItemScript: any;
    public animState: any;
    public randomItem: any;
    public shopPropsOperationScript: any;

    ctor() {
        this.arrShopItemScript = [];
    }

    onEnable() {
        clientEvent.on('updateGold', this.updateGold, this);
        clientEvent.on('updateShopPropInfo', this.showShopProp, this);
    }

    onDisable() {
        clientEvent.off('updateGold', this.updateGold, this);
        clientEvent.off('updateShopPropInfo', this.showShopProp, this);
    }

    show() {
        this.updateGold();
        this.init();
        this.animState = 'shopPropertyIdle';
        this.aniLight.play(this.animState);
        this.showShopProp();
        this.spReceive.spriteFrame = this.sfReceive;
    }

    showShopProp() {
        let shopPropInfo = playerData.instance.playerInfo.shopPropInfo;
        let dictProp = localConfig.instance.getTable('prop');
        this.randomItem = dictProp[shopPropInfo.prop];
        resourceUtil.setPropIcon(this.randomItem.icon, this.spRandPropIcon, () => { });
        this.lbRandPropNumber.string = '1';
        switch (shopPropInfo.receiveStatus) {
            case constants.REWARD_STATUS.UNRECEIVABLE:
                this.ndBtnReceive.getComponent(ButtonEx)!.interactable = false
                break;
            case constants.REWARD_STATUS.RECEIVABLE:
                this.ndBtnReceive.getComponent(ButtonEx)!.interactable = true;
                break;
        }
    }

    init() {
        this.shopPropsOperationScript = this.ndShopPropsOperation.getComponent(ShopPropsOperation);
        if (!this.arrShopItemScript) {
            this.arrShopItemScript = [];
        }
        let dictShop = localConfig.instance.getTable('prop');
        let arrShop = utils.objectToArray(dictShop);
        arrShop.forEach((item, idx, arr) => {
            let node: any = null;
            if (this.arrMenu[idx].getChildByName('shopItem')) {
                node = this.arrMenu[idx].getChildByName('shopItem');
            } else {
                node = instantiate(this.pbShopItem);
                node.parent = this.arrMenu[idx];
            }
            let shopItemScript = node.getComponent(ShopItem);
            shopItemScript.setInfo(item, this);
            if (idx === 0) {
                shopItemScript.showSelect();
            }
            if (!this.arrShopItemScript.includes(shopItemScript)) {
                this.arrShopItemScript.push(shopItemScript)
            }
        });
    }

    updateGold() {
        this.lbGold.string = utils.formatMoney(playerData.instance.getGold());
    }

    onBtnCloseClick() {
        uiManager.instance.hideDialog('shop/shop');
    }

    showAllItemUnSelect() {
        this.arrShopItemScript.forEach((element: { showUnSelect: () => void; }) => {
            element.showUnSelect();
        });
    }

    onBtnReceiveClick() {
        this.showRandPropSecelt();
        this.shopPropsOperationScript.show(this.randomItem['ID']);
        this.showReward();
    }

    onRandPropClick() {
        this.showRandPropSecelt();
        this.shopPropsOperationScript.show(this.randomItem['ID']);
    }

    showRandPropSecelt() {
        this.showAllItemUnSelect();
        this.animState = 'shopPropertySelect'
        this.aniLight.play(this.animState);
    }

    hideRandPropSelect() {
        if (this.animState === 'shopPropertyIdle') return;
        this.animState = 'shopPropertyIdle';
        this.aniLight.play(this.animState);
    }

    showReward() {
        let itemInfo: any = {};
        itemInfo['itemType'] = constants.REWARD_TYPE.PROP;
        itemInfo['itemSubType'] = this.randomItem.ID;
        itemInfo['itemAmount'] = 1;
        uiManager.instance.showDialog('lottery/reward', [itemInfo, false, constants.SHARE_FUNCTION.SHOP_PROP]);
        playerData.instance.updateShopPropInfo(true);
        this.showShopProp();
        clientEvent.dispatchEvent('updateShopPropInfo');
        this.showRandPropSecelt();
        this.shopPropsOperationScript.show(this.randomItem['ID']);
    }

}