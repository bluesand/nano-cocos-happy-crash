import { _decorator, Component, Sprite, Label, Animation, Node, Vec3, UITransform } from 'cc';
import { playerData } from '../../frameworks/playerData';
import { resourceUtil } from '../../frameworks/resourceUtil';
const { ccclass, property } = _decorator;

@ccclass('ShowTargetCake')
export class ShowTargetCake extends Component {
    @property
    public spCake: Sprite = null!;
    @property
    public lbCake: Label = null!;
    @property
    public aniCake: Animation = null!;
    @property
    public nodeValue: Node = null!;
    @property
    public nodePanel: Node = null!;

    public cake: any;

    show(cake: any, parent: any) {
        this.cake = cake;
        resourceUtil.setCakeIcon(this.cake, this.spCake, () => { });
        this.lbCake.string = playerData.instance.getTargetValue(cake);
        this.aniCake.play('showTargetCakeShow');
        this.aniCake.once(Animation.EventType.FINISHED, () => {
            this.aniCake.play('showTargetCakeOver');
            parent.showFlyEffect(this.cake, this.spCake.node.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0)));
        }, this);
    }

    onlyShowCake(cake: any) {
        resourceUtil.setCakeIcon(cake, this.spCake, () => { });
        this.nodeValue.active = false;
        this.nodePanel.active = false;
    }

}