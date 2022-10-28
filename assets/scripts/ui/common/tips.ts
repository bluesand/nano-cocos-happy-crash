import { _decorator, Component, Vec3, tween, isValid, UIOpacity, Color, Label, UITransform } from 'cc';
import { poolManager } from '../../frameworks/poolManager';
const { ccclass, property } = _decorator;

@ccclass('tips')
export class tips extends Component {
    @property(Label)
    public lbTips: Label = null!;

    @property(UIOpacity)
    public UIOpacityBg: UIOpacity = null!;

    public show(content: string, callback?: Function) {
        let size = this.lbTips?.node?.getComponent(UITransform)?.contentSize;
        if (!isValid(size)) {//size不存在，自我销毁
            poolManager.instance.putNode(this.node);
            return;
        }

        this.lbTips.string = content;

        this.UIOpacityBg.opacity = 255;
        this.node.setPosition(0, 220, 0);

        this.scheduleOnce(() => {
            tween(this.node)
                .to(0.9, { position: new Vec3(0, 450, 0) }, { easing: 'smooth' })
                .call(() => {
                    callback && callback();
                    poolManager.instance.putNode(this.node);
                })
                .start();

            tween(this.UIOpacityBg)
                .to(0.6, { opacity: 220 }, { easing: 'smooth' })
                .to(0.3, { opacity: 0 }, { easing: 'smooth' })
                .start();
        }, 0.8);
    }
}
