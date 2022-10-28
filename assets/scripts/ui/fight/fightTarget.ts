import { _decorator, Component, Sprite, Label, Node, Animation, Vec3, UITransform } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { loadsh } from '../../frameworks/loadsh';
import { playerData } from '../../frameworks/playerData';
import { resourceUtil } from '../../frameworks/resourceUtil';

const { ccclass, property } = _decorator;

@ccclass('FightTarget')
export class FightTarget extends Component {
    @property
    public spCake: Sprite = null!;
    @property
    public lbTargetValue: Label = null!;
    @property
    public nodeCustomer: Node = null!;
    @property
    public nodeNeed: Node = null!;
    @property
    public nodeCake: Node = null!;
    @property
    public nodeYes: Node = null!;
    @property
    public aniCake: Animation = null!;

    public cake: any;
    public customer: any;

    onEnable() {
        clientEvent.on('updateTargets', this.updateTarget, this);
        clientEvent.on('showTargetCake', this.showTargetCake, this);
    }

    onDisable() {
        clientEvent.off('updateTargets', this.updateTarget, this);
        clientEvent.off('showTargetCake', this.showTargetCake, this);
    }

    show(cake: any, isShowCustomer: any) {
        this.cake = cake;
        resourceUtil.setCakeIcon(this.cake, this.spCake, () => { });
        this.updateTagetValue();
        if (isShowCustomer) {
            if (this.customer) {
                this.customer.active = true;
            } else {
                let rand = loadsh.random(0, 1);
                let roleStr = 'role/man01/man01';
                let posY = 0;
                if (rand) {
                    roleStr = 'role/woman01/woman01';
                    posY = 15;
                }
                resourceUtil.createEffect(roleStr, (err: any, role: any) => {
                    if (!err) {
                        this.customer = role;
                        this.customer.position = new Vec3(0, posY, 0);
                    }
                }, this.nodeCustomer);
            }
        } else if (this.customer) {
            this.customer.active = false;
        }
        this.nodeNeed.active = false;
        this.nodeCake.active = false;
    }

    showTargetCake(cake: any) {
        if (cake === 'all' || cake === this.cake) {
            this.nodeNeed.active = true;
            this.nodeCake.active = true;
            this.node.getComponent(Animation)!.play('linkItemShowTarget');
        }
    }

    updateTagetValue() {
        let spareValue = playerData.instance.getTargetValue(this.cake);
        this.lbTargetValue.string = spareValue;
        this.nodeYes.active = spareValue <= 0;
    }

    updateTarget(cake: any) {
        if (this.cake === cake) {
            this.updateTagetValue();
        }
    }

    playIdle() {
        if (this.customer) {
            this.customer.getComponent(Animation).play('idle');
        }
    }

    getCakeWorldPos() {
        return this.spCake.node.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0));
    }

}