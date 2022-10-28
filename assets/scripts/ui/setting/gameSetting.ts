import { _decorator, Component, Node, find } from 'cc';
import { AudioManager } from '../../frameworks/audioManager';
import { GameLogic } from '../../frameworks/gameLogic';
import { uiManager } from '../../frameworks/uiManager';
import { SceneManager } from '../loading/sceneManager';

const { ccclass, property } = _decorator;

@ccclass('gameSetting')
export class gameSetting extends Component {
    @property
    public ndMusicOpen: Node = null!;
    @property
    public ndMusicClose: Node = null!;
    @property
    public ndSoundOpen: Node = null!;
    @property
    public ndSoundClose: Node = null!;


    show() {
        let isMusicOpen = AudioManager.instance.getAudioSetting(true);
        let isSoundOpen = AudioManager.instance.getAudioSetting(false);
        this.ndMusicOpen.active = !isMusicOpen;
        this.ndMusicClose.active = isMusicOpen;
        this.ndSoundOpen.active = !isSoundOpen;
        this.ndSoundClose.active = isSoundOpen;
    }

    onBtnHomeClick() {
        SceneManager.instance.loadScene('pve', [], (err: any, result: any) => {
            if (err) {
                console.error(err.message || err);
                return;
            }
        });
    }

    onBtnPlayAgainBtn() {
        this.onBtnCloseClick();
        GameLogic.instance.resetLevel();
    }

    onBtnMusicOpenClick() {
        AudioManager.instance.openMusic();
        this.show();
    }

    onBtnMusicCloseClick() {
        AudioManager.instance.closeMusic();
        this.show();
    }

    onBtnSoundOpenClick() {
        AudioManager.instance.openSound();
        this.show();
    }

    onBtnSoundCloseClick() {
        AudioManager.instance.closeSound();
        this.show();
    }

    onBtnCloseClick() {
        uiManager.instance.hideDialog('dialog/gameSetting');
    }

}