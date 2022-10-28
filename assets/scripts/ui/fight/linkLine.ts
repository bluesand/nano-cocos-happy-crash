import { _decorator, Component, Animation, Vec3, misc } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LinkLine')
export class LinkLine extends Component {
    @property
    public animation: Animation = null!;

    show() {
        this.animation.play('linkLineShow');
        this.animation.once(Animation.EventType.FINISHED, () => {
            this.animation.play('linkLineNormal');
        });
    }

    setLinePosition(posStart: Vec3, posEnd: Vec3) {
        let posOffset = posEnd.clone().subtract(posStart);
        let pos = new Vec3(posStart.x + posOffset.x / 2, posStart.y + posOffset.y / 2, 0);
        this.node.position = pos;
        let degree = 0;
        if (posOffset.x !== 0) {
            degree = misc.radiansToDegrees(Math.atan(posOffset.y / posOffset.x));
        } else {
            degree = 90;
        }
        this.node.eulerAngles = new Vec3(0, 0, degree);
    }

}