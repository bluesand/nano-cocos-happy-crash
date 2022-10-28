import { _decorator, Component, UITransform, Animation, tween, Vec3, Prefab, Label, instantiate, Sprite, TweenSystem, Node } from 'cc';
import { AudioManager } from '../../frameworks/audioManager';
import { clientEvent } from '../../frameworks/clientEvent';
import { poolManager } from '../../frameworks/poolManager';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { constants } from '../../shared/constants';
import { FightNum } from './fightNum';
import { ShowTargetCake } from './showTargetCake';

const { ccclass } = _decorator;

const TAG_STAR_MOVE_ACTION = 10000;
@ccclass('EffectGroup')
export class EffectGroup extends Component {
    public _fightScene: any;

    show(fightScene: any) {
        this._fightScene = fightScene;
    }

    showStarFlyEffect(srcWorldPos: any, effectType: any, callback: any, target: any) {
        const uiTra = this.node.getComponent(UITransform)!;
        let srcPos = uiTra.convertToNodeSpaceAR(srcWorldPos);
        resourceUtil.getEffectPrefab('fight/linkStar/linkStar', (err: any, prefab: any) => {
            if (err) {
                callback.apply(target, [err]);
                return;
            }
            let effectNode = poolManager.instance.getNode(prefab, this.node);
            effectNode.position = srcPos;
            let ani = effectNode.getComponent(Animation);
            ani.once(Animation.EventType.FINISHED, () => {
                let targetIndex = this._fightScene.linkContent.getNoEffectLinkItemIndex();
                if (targetIndex) {
                    this._fightScene.linkContent.markLinkItemEffect(targetIndex, effectType);
                    let targetWorldPos = this._fightScene.linkContent.getItemWorldPosByIndex(targetIndex);
                    let targetPos = uiTra.convertToNodeSpaceAR(targetWorldPos);
                    AudioManager.instance.playSound(constants.AUDIO_SOUND.FLY_STAR, false);
                    // effectNode.stopActionByTag(TAG_STAR_MOVE_ACTION);
                    TweenSystem.instance.ActionManager.removeAllActionsFromTarget(effectNode);
                    let duration = targetPos.clone().subtract(srcPos).length() / 1200;

                    tween(effectNode)
                        .to(duration, { position: targetPos }, { easing: 'backIn' })
                        .call(() => {
                            let ani = effectNode.getComponent(Animation);
                            ani.once(Animation.EventType.FINISHED, () => {
                                poolManager.instance.putNode(effectNode);
                            });
                            ani.play('linkStarOver');
                            callback.apply(target, [null, targetIndex, effectType]);
                        })
                        .start()

                    // let moveAction = cc.moveTo(duration, targetPos).easing(cc.easeIn(1.0));
                    // let seqAction = cc.sequence(moveAction, cc.callFunc((node) => {
                    //     let ani = node.getComponent(Animation);
                    //     ani.once(Animation.EventType.FINISHED, () => {
                    //         poolManager.instance.putNode(node);
                    //     });
                    //     ani.play('linkStarOver');
                    //     callback.apply(target, [null, targetIndex, effectType]);
                    // }, this));
                    // seqAction.setTag(TAG_STAR_MOVE_ACTION);
                    // effectNode.runAction(seqAction);
                } else {
                    poolManager.instance.putNode(effectNode);
                    callback.apply(target, ['error']);
                    return;
                }
            });
            ani.play('linkStarFly');
        });
    }

    showStarAfterLevelFinished(srcWorldPos: any, effectType: any, callback: any, target: any, targetIndex: any) {
        const uiTra = this.node.getComponent(UITransform)!;
        let srcPos = uiTra.convertToNodeSpaceAR(srcWorldPos);
        resourceUtil.getEffectPrefab('fight/linkStar/linkStar', (err: any, prefab: any) => {
            if (err) {
                callback.apply(target, [err]);
                return;
            }
            let effectNode = poolManager.instance.getNode(prefab, this.node);
            effectNode.position = srcPos;
            let ani = effectNode.getComponent(Animation);
            ani.play('linkStarScale');
            if (!targetIndex) {
                targetIndex = this._fightScene.linkContent.getNoEffectLinkItemIndex();
            }
            if (targetIndex) {
                this._fightScene.linkContent.markLinkItemEffect(targetIndex, effectType);
                let targetWorldPos = this._fightScene.linkContent.getItemWorldPosByIndex(targetIndex);
                let targetPos = uiTra.convertToNodeSpaceAR(targetWorldPos);
                AudioManager.instance.playSound(constants.AUDIO_SOUND.SPARE_STEP, false);
                TweenSystem.instance.ActionManager.removeAllActionsFromTarget(effectNode);
                // let bezier = [srcPos, new Vec3((targetPos.x - srcPos.x) / 2 + srcPos.x, srcPos.y + 500, 0), targetPos];
                tween(effectNode)
                    .to(0.33, { position: srcPos })
                    .to(0.33, { position: new Vec3((targetPos.x - srcPos.x) / 2 + srcPos.x, srcPos.y + 500, 0) })
                    .to(0.33, { position: targetPos })
                    .call(() => {
                        let ani = effectNode.getComponent(Animation);
                        ani.once(Animation.EventType.FINISHED, () => {
                            poolManager.instance.putNode(effectNode);
                        });
                        ani.play('linkStarOver');
                        callback.apply(target, [null, targetIndex, effectType]);
                    })
                    .start()

                // let bezierForward = cc.bezierTo(1, bezier);
                // let seqAction = cc.sequence(bezierForward, cc.callFunc(, this));
                // seqAction.setTag(TAG_STAR_MOVE_ACTION);
                // effectNode.runAction(seqAction);
            } else {
                poolManager.instance.putNode(effectNode);
                callback.apply(target, ['error']);
                return;
            }
        });
    }

    showLinkItemDestroyEffect(srcWorldPos: any, score: any) {
        let srcPos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(srcWorldPos);
        resourceUtil.getEffectPrefab("fight/effectHide/effectHide", (err: any, prefab: any) => {
            if (err) {
                return;
            }
            let effect = poolManager.instance.getNode(prefab, this.node);
            effect.position = srcPos;
            let ani = effect.getComponent(Animation);
            ani.once(Animation.EventType.FINISHED, () => {
                poolManager.instance.putNode(effect);
                this.showAfterDestroyEffect(srcPos);
            }, this);
            ani.play('effectHide');
            this.showLinkItemScore(srcPos, score);
        });
    }

    showLinkItemScore(srcPos: any, score: any) {
        resourceUtil.loadRes('prefab/fight/fightNum', Prefab, (err: any, prefab: any) => {
            if (err) {
                return;
            }
            let effect = poolManager.instance.getNode(prefab, this.node);
            effect.position = new Vec3(srcPos.x, srcPos.y + 40);
            effect.zIndex = constants.ZORDER.FIGHT_NUM; //数字统一堆前面
            let fightNum = effect.getComponent(FightNum);
            fightNum.show(score, () => {
                poolManager.instance.putNode(effect);
            });
        });
    }

    showAfterDestroyEffect(srcPos: any) {
        let targetWorldPos = this._fightScene.fightUI.getProgressBarWorldPos();
        let targetPos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(targetWorldPos);
        if (!targetPos) {
            return;
        }
        resourceUtil.getEffectPrefab("fight/eliminate/eliminate", (err: any, prefab: any) => {
            if (err) {
                return;
            }
            let effect = poolManager.instance.getNode(prefab, this.node);
            effect.position = srcPos;

            let duration = targetPos.clone().subtract(srcPos).length() / 1000;

            tween(effect)
                .to(duration, { position: targetPos })
                .call(() => {
                    poolManager.instance.putNode(effect);
                    clientEvent.dispatchEvent('updateScore');
                })
                .start()
            // let moveAction = cc.moveTo(duration, targetPos);
            // let seqAction = cc.sequence(moveAction, cc.callFunc((node) => {
            //     poolManager.instance.putNode(node);
            //     clientEvent.dispatchEvent('updateScore');
            // }, this));
            // effect.runAction(seqAction);
        });
    }

    showSkillLineEffect(targetWorldPos: any, isHorizontal: any) {
        let targetPos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(targetWorldPos);
        resourceUtil.getEffectPrefab("fight/effectSkillLine/effectSkillLine", (err: any, prefab: any) => {
            if (err) {
                return;
            }
            let effect = poolManager.instance.getNode(prefab, this.node) as Node;
            effect.position = targetPos;
            effect.setRotationFromEuler(0, 0, 0);

            if (!isHorizontal) {
                effect.setRotationFromEuler(0, 0, 90);
            }
            let ani = effect.getComponent(Animation)!;
            ani.play('effectSkillLine');
            ani.once(Animation.EventType.FINISHED, () => {
                poolManager.instance.putNode(effect);
            }, this);
        });
    }

    showSkillRangeEffect(targetWorldPos: any) {
        let targetPos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(targetWorldPos);
        resourceUtil.getEffectPrefab("fight/effectSkillRange/effectSkillRange", (err: any, prefab: any) => {
            if (err) {
                return;
            }
            let effect = poolManager.instance.getNode(prefab, this.node);
            effect.position = targetPos;
            AudioManager.instance.playSound(constants.AUDIO_SOUND.RANGE_BOMB, false);
            let ani = effect.getComponent(Animation);
            ani.play('effectSkillRange');
            ani.once(Animation.EventType.FINISHED, () => {
                poolManager.instance.putNode(effect);
            }, this);
        });
    }

    playTargetCakeFlyEffect(cake: any, srcWorldPos: any, targetWorldPos: any, callback: any) {
        resourceUtil.createUI('fight/showTargetCake', (err: any, node: any) => {
            if (err) {
                callback(err, node);
                return;
            }
            const uiTra = this.node.getComponent(UITransform)!;
            let srcPos = uiTra.convertToNodeSpaceAR(srcWorldPos);
            let targetPos = uiTra.convertToNodeSpaceAR(targetWorldPos);
            node.position = srcPos;
            node.getComponent(ShowTargetCake).onlyShowCake(cake);
            let duration = targetPos.clone().subtract(srcPos).length() / 1000;
            tween(node)
                .to(duration, { position: targetPos })
                .call((node: any) => {
                    node && node.destroy();
                    callback();
                })
                .start()
            // let moveAction = cc.moveTo(duration, targetPos);
            // let seqAction = cc.sequence(moveAction, cc.callFunc((node) => {
            //     node && node.destroy();
            //     callback();
            // }, this));
            // node.runAction(seqAction);
        }, this.node);
    }

    showBonusTime(callback: any) {
        resourceUtil.createEffect('fight/bonusTime/bonusTime', (err: any, node: any) => {
            if (err) {
                callback(err, node);
                return;
            }
            let ani = node.getComponent(Animation);
            ani.play('bonusTime');
            ani.once(Animation.EventType.FINISHED, () => {
                node && node.destroy();
                callback(null);
            }, this);
        }, this.node);
    }

    useInfiniteProp(propWorldPos: any, infiniteWorldPos: any) {
        let srcPos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(propWorldPos);
        resourceUtil.createEffect('fight/propUse/propUse', (err: any, node: any) => {
            if (err) {
                return;
            }
            node.position = srcPos;
            let ani = node.getComponent(Animation);
            ani.play('propUse');
            ani.on(Animation.EventType.FINISHED, () => {
                node && node.destroy();
                this.showUnlimitedOrNumber(infiniteWorldPos, true, null);
            })
        }, this.node);
    }

    showUnlimitedOrNumber(srcWorldPos: any, isInfinite: any, number: any) {
        let srcPos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(srcWorldPos);
        resourceUtil.createEffect('fight/unlimited/unlimited', (err: any, node: any) => {
            if (err) {
                return;
            }
            node.position = srcPos;
            let ani = node.getComponent(Animation);
            let homeIconNode = node.getChildByName('homeIcon');
            let infiniteNode = homeIconNode.getChildByName('homeIconUnlimited');
            let txtNode = homeIconNode.getChildByName('txt');
            infiniteNode.active = isInfinite;
            txtNode.active = !isInfinite;
            if (!isInfinite && number > 0) {
                txtNode.getComponent(Label).string = number;
            }
            ani.play('unlimitedStart');
            ani.on(Animation.EventType.FINISHED, () => {
                if (isInfinite) {
                    ani.play('unlimitedIdle');
                } else {
                    node && node.destroy();
                    clientEvent.dispatchEvent('updateStep');
                }
            })
        }, this.node);
    }

    removeLastEffect() {
        let arrLast = [];
        let unlimitedNode = this.node.getChildByName('unlimited');
        if (unlimitedNode) arrLast.push(unlimitedNode);
        if (arrLast.length !== 0) {
            arrLast.forEach((element) => {
                element.removeFromParent();
            })
        }
    }

    showUnlockProp(targetWorldPos: any, propId: any, callback: any) {
        resourceUtil.getEffectPrefab("fight/propGet/propGet", (err: any, prefab: any) => {
            if (err) {
                return;
            }
            let node = instantiate(prefab) as Node;
            node.setScale(2, 2, 2);
            node.parent = this.node;
            let targetNodePos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(targetWorldPos);
            let id = '00' + propId;
            let propIcon = node.getChildByName('prop')!;
            resourceUtil.setPropIcon(id, propIcon.getComponent(Sprite), () => { });
            let ani = node.getComponent(Animation)!;
            ani.play('propGetStart');

            // let moveAction = cc.moveTo(duration, targetNodePos).easing(cc.easeCubicActionOut());
            // let seq = cc.sequence(moveAction, cc.callFunc(() => {
            //     ani.play('propGetOver');
            //     ani.on(Animation.EventType.FINISHED, () => {
            //         node && node.destroy();
            //     }, this);
            //     if (callback) {
            //         callback();
            //     }
            // }))
            ani.on(Animation.EventType.FINISHED, () => {
                let duration = targetNodePos.clone().subtract(node.position).length() / 500;
                tween(node)
                    .to(duration, { position: targetNodePos, scale: new Vec3(1, 1, 1) }, { easing: 'cubicInOut' })
                    .call(() => {
                        ani.play('propGetOver');
                        ani.on(Animation.EventType.FINISHED, () => {
                            node && node.destroy();
                        }, this);
                        if (callback) {
                            callback();
                        }
                    })
                    .start()
            }, this);
        })
    }

}