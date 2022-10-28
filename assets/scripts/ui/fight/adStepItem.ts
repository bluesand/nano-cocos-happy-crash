import { _decorator, Component, Sprite, Label, Node } from 'cc';
import { resourceUtil } from '../../frameworks/resourceUtil';
const { ccclass, property } = _decorator;

@ccclass('AdStepItem')
export class AdStepItem extends Component {
    @property
    public spPropIcon: Sprite = null!;
    @property
    public lbPropNum: Label = null!;
    @property
    public ndFinishedIcon: Node = null!;

    public cakeInfo: any;

    setInfo(cakeInfo: any) {
        this.cakeInfo = cakeInfo;
        resourceUtil.setCakeIcon(cakeInfo.name, this.spPropIcon, () => { });
        this.lbPropNum.string = cakeInfo.num ? cakeInfo.num : '';
        this.ndFinishedIcon.active = !cakeInfo.num;
        if (cakeInfo.num > 0) {
            this.spPropIcon.grayscale = false;
        } else {
            this.spPropIcon.grayscale = true;
        }
    }

}