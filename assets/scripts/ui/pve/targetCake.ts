import { _decorator, Component, Sprite, Label } from 'cc';
import { resourceUtil } from '../../frameworks/resourceUtil';
const { ccclass, property } = _decorator;

@ccclass('TargetCake')
export class TargetCake extends Component {
    @property
    public spCakeIcon: Sprite = null!;
    @property
    public lbCakeNum: Label = null!;

    setInfo(cakeInfo: any) {
        let arrCakeInfo = cakeInfo.split('-');
        resourceUtil.setCakeIcon(arrCakeInfo[0], this.spCakeIcon, () => { });
        this.lbCakeNum.string = arrCakeInfo[1];
    }

}