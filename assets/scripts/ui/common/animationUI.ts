import { _decorator, Component, Animation, AnimationClip } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { loadsh } from '../../frameworks/loadsh';
const { ccclass, property } = _decorator;

@ccclass('AnimationUI')
export class AnimationUI extends Component {
    @property
    public isPlayEnableAnimation = false;
    @property
    public enableAnimationName = '';
    @property
    public isPlayDisableAnimation = false;
    @property
    public disableAnimationName = '';
    @property
    public disableAnimationReverse = false;
    @property
    public disableAnimationSpeed = 0;

    public animation: any;
    public clips: any;
    public disableAnimationWrapMode: any;
    public disableAnimationDefaultSpeed: any;
    public closeCallback: any;

    onLoad() {
        this.animation = this.node.getComponent(Animation);
        if (!this.animation) {
            return;
        }
        this.clips = this.animation.clips;
        var clip: any = this.isAnimationExist(this.disableAnimationName);
        if (clip) {
            this.disableAnimationWrapMode = AnimationClip.WrapMode.Default;
            this.disableAnimationDefaultSpeed = clip.speed;
        }
    }

    onEnable() {
        if (!this.animation) return;
        if (this.isPlayEnableAnimation && this.isAnimationExist(this.enableAnimationName)) {
            this.animation.getState(this.enableAnimationName).wrapMode = AnimationClip.WrapMode.Default;
            this.animation.play(this.enableAnimationName);
        }
    }

    close(callback?: any) {
        this.closeCallback = callback;
        if (!this.animation) {
            this.closeFinish();
            return;
        }
        var clip = this.isAnimationExist(this.disableAnimationName);
        if (this.isPlayDisableAnimation && clip) {
            this.animation.once(Animation.EventType.FINISHED, this.closeFinish, this);
            this.animation.play(this.disableAnimationName);

            if (this.disableAnimationReverse) {
                this.animation.getState(this.disableAnimationName).wrapMode = AnimationClip.WrapMode.Reverse;
            }
        } else {
            this.closeFinish();
        }
    }

    closeFinish() {
        if (this.closeCallback) {
            this.closeCallback();
        } else {
            this.node.active = false;
        }
    }

    isAnimationExist(animationName: any) {
        return loadsh.find(this.clips, function (clip: any) {
            return clip.name === animationName;
        });
    }

    clickFinish(param: any) {
        clientEvent.dispatchEvent('finishClickAnimation', param);
    }

}