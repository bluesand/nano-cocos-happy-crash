import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { AudioManager } from '../../frameworks/audioManager';
import { localConfig } from '../../frameworks/localConfig';
import { uiManager } from '../../frameworks/uiManager';
const { ccclass, property } = _decorator;

@ccclass('Setting')
export class Setting extends Component {
    @property
    public versionLabel: Label = null!;
    @property
    public ndMusicOpen: Node = null!;
    @property
    public ndMusicClose: Node = null!;
    @property
    public ndSoundOpen: Node = null!;
    @property
    public ndSoundClose: Node = null!;
    @property
    public spMusicIcon: Sprite = null!;
    @property
    public spSoundIcon: Sprite = null!;
    @property
    public sfMusicOn: SpriteFrame = null!;
    @property
    public sfMusicOff: SpriteFrame = null!;
    @property
    public sfSoundOn: SpriteFrame = null!;
    @property
    public sfSoundOff: SpriteFrame = null!;

    show() {
        this.node.active = true;
        let isMusicOpen = AudioManager.instance.getAudioSetting(true);
        let isSoundOpen = AudioManager.instance.getAudioSetting(false);
        this.ndMusicOpen.active = !isMusicOpen;
        this.ndMusicClose.active = isMusicOpen;
        this.ndSoundOpen.active = !isSoundOpen;
        this.ndSoundClose.active = isSoundOpen;
        // this.versionLabel.string = 'Ver: ' + localConfig.instance.getVersion();
        this.spMusicIcon.spriteFrame = this.ndMusicOpen.active === true ? this.sfMusicOff : this.sfMusicOn;
        this.spSoundIcon.spriteFrame = this.ndSoundOpen.active === true ? this.sfSoundOff : this.sfSoundOn;
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
        uiManager.instance.hideDialog('dialog/setting');
    }

}