import { _decorator, Component, Sprite, Label, SpriteFrame, Node, Color, UITransform } from 'cc';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { utils } from '../../shared/utils';
const { ccclass, property } = _decorator;

@ccclass('LotteryItem')
export class LotteryItem extends Component {
    @property(Sprite)
    public spSelect: Sprite = null!;
    @property(Label)
    public lbValue: Label = null!;
    @property(Sprite)
    public spIcon: Sprite = null!;
    @property(SpriteFrame)
    public sfGold: SpriteFrame = null!;
    @property(SpriteFrame)
    public sfDiamond: SpriteFrame = null!;
    @property(Color)
    public colorNormal: Color = new Color();
    @property(Color)
    public colorSelect: Color = new Color();
    @property(Node)
    public ndPropAddIcon: Node = null!;

    public info: any;
    public rewardType: any;
    public rewardValue: any;
    public propId: any;

    setInfo(info: any) {
        this.info = info;
        this.rewardType = info.type;
        const uiTraSpIcon = this.spIcon.getComponent(UITransform)!;
        switch (this.rewardType) {
            case constants.REWARD_TYPE.DIAMOND:
                this.rewardValue = info.amount;
                this.spIcon.spriteFrame = this.sfDiamond;
                this.ndPropAddIcon.active = false;
                this.lbValue.string = this.rewardValue;
                uiTraSpIcon.width = 88.8;
                uiTraSpIcon.height = 50.4;
                break;
            case constants.REWARD_TYPE.GOLD:
                this.rewardValue = info.amount;
                this.spIcon.spriteFrame = this.sfGold;
                this.lbValue.string = utils.formatMoney(this.rewardValue);
                this.ndPropAddIcon.active = false;
                uiTraSpIcon.width = 93;
                uiTraSpIcon.height = 92;
                break;
            case constants.REWARD_TYPE.PROP:
                this.rewardValue = info.amount;
                this.lbValue.string = this.rewardValue;
                this.propId = "00" + info.subType;
                resourceUtil.setPropIcon(this.propId, this.spIcon, () => { });
                this.ndPropAddIcon.active = true;
                uiTraSpIcon.width = 77
                uiTraSpIcon.height = 77;
                break;
        }
    }

    setSelect(isSelect: any) {
        this.spSelect.enabled = isSelect;
        this.lbValue.getComponent(Label)!.color = isSelect ? this.colorSelect : this.colorNormal;
        if (isSelect) {
            this.setReceivedUI();
        }
    }

    setReceivedUI() {
        let itemInfo: any = {}
        itemInfo['itemType'] = this.info['type'];
        itemInfo['itemSubType'] = this.info['subType'];
        itemInfo['itemAmount'] = this.info['amount'];
        uiManager.instance.showDialog('lottery/reward', [itemInfo, true, constants.SHARE_FUNCTION.LOTTERY_REWARD]);
    }
}