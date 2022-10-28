import { _decorator, Component, Animation, TweenSystem, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FightHandGuide')
export class FightHandGuide extends Component {
    @property
    public ani: Animation = null!;

    moveOverCallback(idx: any, callback: any) {
        if (callback) {
            callback(idx);
        }
    }

    showGuide(arrPath: any, callback: any) {
        this.node.setPosition(arrPath[0]);
        TweenSystem.instance.ActionManager.removeAllActionsFromTarget(this.node);
        if (callback) {
            callback(0);
        }
        this.ani.play('handDown');
        let action = tween(this.node);
        this.ani.once(Animation.EventType.FINISHED, () => {
            for (let idx = 1; idx < arrPath.length; idx++) {
                let posTarget = arrPath[idx];
                let posOrigin = arrPath[idx - 1];
                let dis = posTarget.clone().subtract(posOrigin).length();
                action.then(tween().to(dis / 150, { position: posTarget }).call(() => { this.moveOverCallback(idx, callback) }))
            }
            action.call(() => {
                this.ani.play('handUp');
                this.ani.once(Animation.EventType.FINISHED, () => {
                    this.scheduleOnce(() => {
                        this.showGuide(arrPath, callback);
                    }, 0.5);
                }, this);
            })
            action.start();
        }, this);
    }

}