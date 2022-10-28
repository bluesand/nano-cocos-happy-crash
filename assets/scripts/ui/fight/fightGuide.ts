import { _decorator, Component } from 'cc';
import { AnimationUI } from '../common/animationUI';
const { ccclass } = _decorator;

@ccclass('FightGuide')
export class FightGuide extends Component {
    public startTime: any;
    public closeCb: any;

    show(callback: any) {
        this.startTime = Date.now();
        this.closeCb = callback;
    }

    onBtnCloseClick() {
        let ani = this.node.getComponent(AnimationUI);
        if (ani) {
            ani.close(() => {
                this.node && this.node.destroy();
            });
        } else {
            this.node && this.node.destroy();
        }
        if (this.closeCb) {
            this.closeCb();
        }
    }

}