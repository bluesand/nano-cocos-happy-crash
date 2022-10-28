import { _decorator, Component, Sprite, Animation, Enum, TweenSystem, UITransform, tween, Vec3 } from 'cc';
import { poolManager } from '../../frameworks/poolManager';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { constants } from '../../shared/constants';

const { ccclass, property } = _decorator;

const LINK_ITEM_STATUS = Enum({
    SHOW: "linkItemShow",
    HIDE: "linkItemHide",
    SELECT: "linkItemSelect",
    SHAKE: "linkItemShake",
    SKILL: "linkItemSkill"
});
@ccclass('LinkItem')
export class LinkItem extends Component {
    @property
    public spCake: Sprite = null!;
    @property
    public aniCake: Animation = null!;

    public index: any;
    public cake: any;
    public linkParent: any;
    public isSpecial: any;
    public specialType: any;
    public effectType: any;
    public currentStatus: any;
    public effectNode: any;
    public specialEffect: any;

    show(index: any, cake: any, isShowRightNow: any, parent: any) {
        this.index = index;
        this.cake = cake;
        this.linkParent = parent;
        this.isSpecial = false;
        this.specialType = null;
        this.effectType = null;
        this.node.setSiblingIndex(constants.ZORDER.LINK_ITEM_NORMAL);
        this.spCake.node.setScale(0, 0, 0);
        resourceUtil.setCakeIcon(this.cake, this.spCake, () => {
        });
        if (isShowRightNow) {
            this.playShowAction(0);
        }
    }

    playShowAction(delayTime: any) {
        TweenSystem.instance.ActionManager.removeAllActionsFromTarget(this.node);
        tween(this.node)
            .delay(delayTime)
            .call(() => {
                this.aniCake.play(LINK_ITEM_STATUS.SHOW);
                this.currentStatus = LINK_ITEM_STATUS.SHOW;
            })
            .start()
    }

    playHideAction(delayTime: any, isNeedShowEffect: any) {
        TweenSystem.instance.ActionManager.removeAllActionsFromTarget(this.node);
        tween(this.node)
            .delay(delayTime)
            .call(() => {
                this.aniCake.play(LINK_ITEM_STATUS.HIDE);
                this.currentStatus = LINK_ITEM_STATUS.HIDE;
                if (isNeedShowEffect) {
                    this.linkParent._fightScene.effectGroup.showLinkItemDestroyEffect(this.node.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0)), this.getScore());
                }

                this.aniCake.once(Animation.EventType.FINISHED, () => {
                    poolManager.instance.putNode(this.node);
                    if (this.effectNode) {
                        this.effectNode.destroy();
                        this.effectNode = null;
                    }
                    if (this.specialEffect) {
                        poolManager.instance.putNode(this.specialEffect);
                        this.specialEffect = null;
                    }
                }, this);
            })
            .start()
    }

    getScore() {
        let score = 0;
        if (this.isSpecial) {
            if (this.specialType === constants.SPECIAL_EFFECT.HORIZONTAL || this.specialType === constants.SPECIAL_EFFECT.VERTICAL) {
                score += 1000;
            } else if (this.specialType === constants.SPECIAL_EFFECT.PLUS) {
                score += 2000;
            } else if (this.specialType === constants.SPECIAL_EFFECT.CENTER) {
                score += 3000;
            }
            if (!this.effectType) {
                return score;
            }
        }
        if (this.effectType) {
            switch (this.effectType) {
                case constants.SPECIAL_EFFECT.HORIZONTAL:
                case constants.SPECIAL_EFFECT.VERTICAL:
                    return score + 500;
                case constants.SPECIAL_EFFECT.PLUS:
                    return score + 1000;
                case constants.SPECIAL_EFFECT.CENTER:
                    return score + 1500;
            }
        }
        return 50;
    }

    showSelect(isShow: any) {
        let cakeStr = this.cake;
        if (isShow) {
            this.aniCake.play(LINK_ITEM_STATUS.SELECT);
            this.currentStatus = LINK_ITEM_STATUS.SELECT;
            cakeStr = this.cake + 'Light';
        } else {
            if (this.effectType) {
                this.aniCake.play(LINK_ITEM_STATUS.SKILL);
                this.currentStatus = LINK_ITEM_STATUS.SKILL;
            } else {
                // this.aniCake.setCurrentTime(0);
                this.aniCake.stop();
            }
        }
        resourceUtil.setCakeIcon(cakeStr, this.spCake, () => {
        });
    }

    showDestory() {
        this.playHideAction(0, true);
    }

    playMove2Index(index: any) {
        let screenPos = this.linkParent.getScreenPosByIndex(index);
        let distance = screenPos.clone().subtract(this.node.position).length();
        TweenSystem.instance.ActionManager.removeAllActionsFromTarget(this.node);
        tween(this.node)
            .to(distance / 1000, { position: screenPos }, { easing: 'backIn' })
            .call(() => {
                this.aniCake.play(LINK_ITEM_STATUS.SHAKE);
            })
            .start()
    }

    showSpecial(isShow: any) {
        this.isSpecial = isShow;
        if (isShow) {
            resourceUtil.getEffectPrefab('fight/linkStar/linkStar', (err: any, prefab: any) => {
                if (err) {
                    return;
                }
                if (!this.isSpecial) {
                    return;
                }
                this.specialEffect = poolManager.instance.getNode(prefab, this.node);
                this.specialEffect.position = new Vec3(0, 0, 0);
                this.specialEffect.getComponent(Animation).play('linkStarShow');
            });
        } else if (this.specialEffect) {
            poolManager.instance.putNode(this.specialEffect);
            this.specialEffect = null;
        }
    }

    setSpecialType(type: any) {
        this.specialType = type;
    }

    markEffect(type: any) {
        this.effectType = type;
    }

    showEffect(type: any) {
        if (this.effectNode) {
            this.effectNode.destroy();
        }
        this.node.setSiblingIndex(constants.ZORDER.LINK_ITEM_SKILL);
        this.effectType = type;
        this.aniCake.play(LINK_ITEM_STATUS.SKILL);
        this.currentStatus = LINK_ITEM_STATUS.SKILL;
        let rotation = 0;
        let effectStr = "fight/effectSkillTips/skillTipsLine";
        switch (type) {
            case constants.SPECIAL_EFFECT.HORIZONTAL:
                break;
            case constants.SPECIAL_EFFECT.VERTICAL:
                rotation = 90;
                break;
            case constants.SPECIAL_EFFECT.PLUS:
                effectStr = "fight/effectSkillTips/skillTipsPlus";
                break;
            case constants.SPECIAL_EFFECT.CENTER:
                effectStr = "fight/effectSkillTips/skillTipsRange";
                break;
        }
        resourceUtil.createEffect(effectStr, (err: any, effectNode: any) => {
            if (err) {
                return;
            }
            this.effectNode = effectNode;
            this.effectNode.eulerAngles = new Vec3(0, 0, rotation);
        }, this.node);
    }

    getEffect() {
        return this.effectType;
    }

}