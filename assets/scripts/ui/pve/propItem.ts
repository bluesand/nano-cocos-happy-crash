import { _decorator, Component, Label, Sprite } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { playerData } from '../../frameworks/playerData';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { ButtonEx } from '../common/buttonEx';

const { ccclass, property } = _decorator;

@ccclass('PropItem')
export class PropItem extends Component {
    @property
    public lbPropNum: Label = null!;
    @property
    public spPropIcon: Sprite = null!;

    public propInfo: any;
    public propPrice: any;

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

    setInfo(propInfo: any) {
        this.propInfo = propInfo;
        let propNum = playerData.instance.getPropAmount(propInfo.ID);
        if (propNum <= 0) {
            propNum = '+';
        }
        this.lbPropNum.string = propNum;
        resourceUtil.setPropIcon(propInfo.icon, this.spPropIcon, () => { });
        this.propPrice = propInfo.price;
    }

    onPropItemClick() {
        uiManager.instance.showDialog('props/buy', [this.propInfo.ID, constants.ANALYTICS_TYPE.CHECKPOINT_PROP_BUY_NUM]);
    }

    updateProp(propId: any) {
        if (propId === this.propInfo.ID) {
            this.setInfo(this.propInfo);
        }
    }

    updateUnlockProp() {
        let isPropUnlock = playerData.instance.isPropUnlock(this.propInfo.ID);
        this.node.getComponent(ButtonEx)!.interactable = isPropUnlock;
        resourceUtil.setGray(this.node, !isPropUnlock);
    }

}