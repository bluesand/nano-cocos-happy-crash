import { _decorator, Button } from 'cc';
import { AudioManager } from '../../frameworks/audioManager';
import { constants } from '../../shared/constants';
const { ccclass, property } = _decorator;

@ccclass('ButtonEx')
export class ButtonEx extends Button {
    @property
    public isPreventSecondClick: any = false;
    @property
    public preventTime: any = 2;
    // private _N$transition = 3;  //Tansition.SCALE';
    // @property
    // private _zoomScale: any = 0.85;
    // public get zoomScale(): any {
    //     return this._zoomScale;
    // }
    // public set zoomScale(value: any) {
    //     this._zoomScale = value;
    // }
    @property
    public isPlaySound: any = true;

    start() {
        let button: any = this.node.getComponent(Button);
        this.node.on('click', (event: any) => {
            if (this.isPreventSecondClick) {
                button.interactable = false;
                this.scheduleOnce(function () {
                    if (button.node) button.interactable = true;
                }, this.preventTime);
            }
            if (this.isPlaySound) {
                AudioManager.instance.playSound(constants.AUDIO_SOUND.CLICK, false);
            }

        }, this);
    }
}