import { _decorator, Component, Prefab, Node, Animation, instantiate } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { playerData } from '../../frameworks/playerData';
import { ShowTargetCake } from './showTargetCake';
const { ccclass, property } = _decorator;

@ccclass('ShowTarget')
export class ShowTarget extends Component {
    @property
    public pfCake: Prefab = null!;
    @property
    public nodeTargetGroup: Node = null!;
    @property
    public aniTarget: Animation = null!;

    public _parent: any;

    show(parent: any, callback: any) {
        this._parent = parent;
        this.aniTarget.play('showTarget');
        this.aniTarget.once(Animation.EventType.FINISHED, () => {
            this.node && this.node.destroy();
            if (callback) {
                callback();
            }
        }, this);
        for (let target in playerData.instance.dictTargets) {
            let nodeTarget = instantiate(this.pfCake);
            nodeTarget.parent = this.nodeTargetGroup;
            nodeTarget.getComponent(ShowTargetCake)!.show(target, this);
        }
    }

    showFlyEffect(cake: any, srcWorldPos: any) {
        let targetWorldPos = this._parent.getTargetWorldPos(cake);
        if (targetWorldPos) {
            this._parent._fightScene.effectGroup.playTargetCakeFlyEffect(cake, srcWorldPos, targetWorldPos, () => {
                clientEvent.dispatchEvent('showTargetCake', cake);
            });
        } else {
            clientEvent.dispatchEvent('showTargetCake', cake);
        }
    }

}