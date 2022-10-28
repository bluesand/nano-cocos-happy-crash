import { _decorator, Component, Label, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Loading')
export class Loading extends Component {
    @property
    public txtTips:Label = null!;
    @property
    public aniLoading:Animation = null!;

    show (tips: any) {
        if (tips) {
           this.txtTips.string = tips;
        } else {
           this.txtTips.string = "";
        }
    }

    onEnable () {
        this.aniLoading.play();
    }

    onDisable () {
        this.aniLoading.stop();
    }

}