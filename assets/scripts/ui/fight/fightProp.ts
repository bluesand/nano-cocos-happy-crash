
import { _decorator, Component, Sprite, Label, Vec3, UITransform } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { playerData } from '../../frameworks/playerData';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { ButtonEx } from '../common/buttonEx';

const { ccclass, property } = _decorator;

@ccclass('FightProp')
export class FightProp extends Component {
    @property
    public spProp: Sprite = null!;
    @property
    public lbNum: Label = null!;

    public prop: any;
    public clickCallback: any;

    start() {
        this.updateUnlockProp();
    }

    onEnable() {
        clientEvent.on('updateProp', this.updateProp, this);
        clientEvent.on('updateUnlockProp', this.updateUnlockProp, this);
    }

    onDisable() {
        clientEvent.off('updateProp', this.updateProp, this);
        clientEvent.off('updateUnlockProp', this.updateUnlockProp, this);
    }

    show(prop: any) {
        this.prop = prop;
        resourceUtil.setPropIcon(prop.icon, this.spProp, () => {
        });
        let num = playerData.instance.getPropAmount(prop.ID);
        if (num <= 0) {
            num = '+';
        }
        this.lbNum.string = num;
    }

    updateProp(propId: any) {
        if (propId === this.prop.ID) {
            this.show(this.prop);
        }
    }

    setClickListener(callback: any) {
        this.clickCallback = callback;
    }

    onItemClick() {
        let num = playerData.instance.getPropAmount(this.prop.ID);
        if (num <= 0) {
            uiManager.instance.showDialog('props/buy', [this.prop.ID, constants.ANALYTICS_TYPE.GAME_PROP_BUY_NUM]);
            return;
        }
        if (this.clickCallback) {
            this.clickCallback(this.prop, this.node.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0)));
        }
    }

    updateUnlockProp() {
        let isPropUnlock = playerData.instance.isPropUnlock(this.prop.ID);
        this.node.getComponent(ButtonEx)!.interactable = isPropUnlock;
        resourceUtil.setGray(this.node, !isPropUnlock);
    }
}