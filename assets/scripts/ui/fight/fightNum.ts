import { _decorator, Component, Label, Animation, Font } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FightNum')
export class FightNum extends Component {
    @property
    public lbNum: Label = null!;
    @property
    public ani: Animation = null!;
    @property
    public font1: Font = null!;
    @property
    public font2: Font = null!;

    show(value: any, callback: any) {
        this.lbNum.string = value;
        let scale = 1;
        if (value <= 50) {
            this.lbNum.font = this.font1;
        } else {
            this.lbNum.font = this.font2;
            scale = 1.2;
        }
        this.node.setScale(scale, scale, scale)
        this.ani.once(Animation.EventType.FINISHED, callback);
        this.ani.play('fightNum');
    }

}