import { _decorator, Component, Node, Prefab, Label, ProgressBar, UITransform, Vec3, instantiate, Animation } from 'cc';
import { AudioManager } from '../../frameworks/audioManager';
import { clientEvent } from '../../frameworks/clientEvent';
import { localConfig } from '../../frameworks/localConfig';
import { playerData } from '../../frameworks/playerData';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { FightProp } from './fightProp';
import { FightTarget } from './fightTarget';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { ShowTarget } from './showTarget';
const { ccclass, property } = _decorator;

@ccclass('FightUI')
export class FightUI extends Component {
    @property
    public nodeTargets: Node = null!;
    @property
    public pfTarget: Prefab = null!;
    @property
    public lbStep: Label = null!;
    @property
    public lbLevel: Label = null!;
    @property
    public lbScore: Label = null!;
    @property
    public progress: ProgressBar = null!;
    @property
    public nodeProBar: Node = null!;
    @property
    public arrStars: Array<Node> = [];
    @property
    public arrStarsBg: Array<Node> = [];
    @property
    public nodePropGroup: Node = null!;
    @property
    public pfFightProp: Prefab = null!;
    @property
    public nodeInfinite: Node = null!;

    public targetProgress: any;
    public _fightScene: any;
    public arrTargetNode: any;

    start() {
        this.startCustomerRandAction();
    }

    onEnable() {
        clientEvent.on('updateStep', this.updateStepInfo, this);
        clientEvent.on('updateScore', this.updateScore, this);
    }

    onDisable() {
        clientEvent.off('updateStep', this.updateStepInfo, this);
        clientEvent.off('updateScore', this.updateScore, this);
    }

    show(fightScene: any) {
        this.targetProgress = null;
        this._fightScene = fightScene;
        this.initTargets();
        this.updateLevelInfo();
        this.updateStepInfo();
        this.updateScore();
        this.initProps();
        this.showInfinite();
        if (playerData.instance.score === 0 && this.progress.progress > 0) {
            this.progress.progress = 0;
            this.arrStars[0].active = false;
            this.arrStars[1].active = false;
            this.arrStars[2].active = false;
        }
    }

    updateLevelInfo() {
        this.lbLevel.string = playerData.instance.level;
    }

    updateStepInfo(isInfinite?: any) {
        if (isInfinite === false) {
            this.lbStep.node.active = false;
            this._fightScene.effectGroup.showUnlimitedOrNumber(this.nodeInfinite.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0)), false, playerData.instance.spareStep);
        } else if (!playerData.instance.curLevelInfo.infinite && typeof isInfinite === 'undefined') {
            this.lbStep.node.active = true;
            this.lbStep.string = playerData.instance.spareStep;
        }
    }

    updateScore() {
        let score = playerData.instance.score;
        this.lbScore.string = score;
        let pro = 0;
        let stars = playerData.instance.arrStars;
        if (score < stars[0]) {
            pro = (score / stars[0]) * 0.33;
        } else if (score < stars[1]) {
            pro = 0.33 + ((score - stars[0]) / (stars[1] - stars[0])) * 0.33;
        } else {
            pro = 0.67 + ((score - stars[1]) / (stars[2] - stars[1])) * 0.33;
            if (pro >= 1) {
                pro = 1;
            }
        }
        this.targetProgress = pro;
    }

    initTargets() {
        this.nodeTargets.removeAllChildren();
        this.arrTargetNode = [];
        for (let target in playerData.instance.dictTargets) {
            let nodeTarget = instantiate(this.pfTarget);
            nodeTarget.parent = this.nodeTargets;

            nodeTarget.getComponent(FightTarget)!.show(target, true);
            this.arrTargetNode.push(nodeTarget);
        }
    }

    getTargetWorldPos(cake: any) {
        for (let idx = 0; idx < this.arrTargetNode.length; idx++) {
            let nodeTarget = this.arrTargetNode[idx];
            let target = nodeTarget.getComponent(FightTarget)!;
            if (target.cake === cake) {
                return target.getCakeWorldPos();
            }
        }
        return null;
    }

    showTargetsAni(callback: any) {
        resourceUtil.createUI('fight/showTarget', (err: any, tagetNode: any) => {
            if (err) {
                clientEvent.dispatchEvent('showTargetCake', 'all');
                return;
            }
            tagetNode.getComponent(ShowTarget).show(this, callback);
        }, this.node);
    }

    getStepWorldPos() {
        return this.lbStep.node.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0));
    }

    getProgressBarWorldPos() {
        const uiTra = this.nodeProBar.getComponent(UITransform)!
        return uiTra.convertToWorldSpaceAR(new Vec3(uiTra.width, 0, 0));
    }

    onBtnSettingClick() {
        uiManager.instance.showDialog('dialog/gameSetting');
    }

    onBtnQuestionClick() {
        uiManager.instance.showDialog('fight/fightGuide');
    }

    startCustomerRandAction() {
        let time = 3 + (Math.random() * 3);
        this.scheduleOnce(() => {
            if (this.arrTargetNode.length <= 0) {
                this.startCustomerRandAction();
                return;
            }
            let rand = Math.floor(Math.random() * this.arrTargetNode.length);
            let node = this.arrTargetNode[rand];
            node.getComponent(FightTarget).playIdle();
            this.startCustomerRandAction();
        }, time);
    }

    update(dt: any) {
        if (this.targetProgress !== null) {
            let curPro = this.progress.progress;
            if (this.targetProgress !== curPro) {
                let prePro = curPro;
                if (this.targetProgress > curPro) {
                    curPro += dt;
                } else {
                    curPro -= dt;
                }
                if (this.targetProgress > 0) {
                    curPro = curPro > this.targetProgress ? this.targetProgress : curPro;
                } else {
                    curPro = curPro < 0 ? 0 : curPro;
                }
                this.progress.progress = curPro;
                if (curPro >= 1 && prePro < 1) {
                    this.showStar(2);
                } else if (prePro >= 1 && curPro < 1) {
                    this.arrStars[2].active = false;
                } else if ((curPro >= 0.66 && (prePro < 0.66 || prePro >= 1))) {
                    this.arrStars[0].active = true;
                    if (prePro < 0.66) {
                        this.showStar(1);
                    }
                } else if (curPro >= 0.33 && curPro < 0.66 && (prePro < 0.33 || prePro >= 0.66)) {
                    this.arrStars[1].active = false;
                    if (prePro < 0.33) {
                        this.showStar(0);
                    }
                } else if (curPro < 0.33 && prePro >= 0.33) {
                    this.arrStars[0].active = false;
                    this.arrStars[1].active = false;
                    this.arrStars[2].active = false;
                }
            }
        }
    }

    showStar(idx: any) {
        if (this.arrStars[idx].active) {
            return; //已经展示过了
        }
        resourceUtil.createEffect('fight/homeStar/homeStar', (err: any, node: any) => {
            if (err) {
                this.arrStars[idx].active = true;
                return;
            }
            AudioManager.instance.playSound(constants.AUDIO_SOUND.FINISH_STAR, false);
            let ani = node.getComponent(Animation);
            ani.play('homeStarShow');
            ani.once(Animation.EventType.FINISHED, () => {
                node && node.destroy();
                this.arrStars[idx].active = true;
            });
        }, this.arrStarsBg[idx]);
    }

    initProps() {
        this.nodePropGroup.removeAllChildren();
        this.onItemClick = this.onItemClick.bind(this);
        let tbProps = localConfig.instance.getTable('prop');
        for (let prop in tbProps) {
            let nodeProp = instantiate(this.pfFightProp);
            nodeProp.parent = this.nodePropGroup;
            let fightProp = nodeProp.getComponent(FightProp)!;
            fightProp.show(tbProps[prop]);
            fightProp.setClickListener(this.onItemClick);
        }
    }

    onItemClick(prop: any, posWorld: any) {
        let amount = playerData.instance.getPropAmount(prop.ID);
        if (amount <= 0) {
            uiManager.instance.showTips(i18n.t('fight.propNoEnough'));
            return;
        }
        if (!this._fightScene.isPropCanUse(prop.ID)) {
            uiManager.instance.showTips(i18n.t('fight.propExceedMaxTimes'));
            return;
        }
        if (prop.ID === constants.PROP_ID.INFINITE) {
            this._fightScene.effectGroup.useInfiniteProp(posWorld, this.nodeInfinite.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0)));
        }
        if (prop.ID === constants.PROP_ID.HAMMER || prop.ID === constants.PROP_ID.MAGIC) {
            this._fightScene.showPropOperationUI(prop, posWorld);
        } else {
            clientEvent.dispatchEvent('useProp', prop.ID);
        }
    }

    showInfinite() {
        if (playerData.instance.curLevelInfo) {
            if (playerData.instance.curLevelInfo.infinite) {
                this.lbStep.node.active = false;
                this.nodeInfinite.active = true;
                return;
            }
        }
        this.lbStep.node.active = true;
        this.nodeInfinite.active = false;
    }

    showUnlockProp(propId: any, callback: any) {
        let arrProp = this.nodePropGroup.children;
        let targetProp = arrProp[propId - 1];
        let targetWorldPos = targetProp.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0));
        this._fightScene.effectGroup.showUnlockProp(targetWorldPos, propId, callback);
    }

}