import { _decorator, Component, Node, profiler, Rect, UITransform } from 'cc';
import { AudioManager } from '../../frameworks/audioManager';
import { clientEvent } from '../../frameworks/clientEvent';
import { GameLogic } from '../../frameworks/gameLogic';
import { localConfig } from '../../frameworks/localConfig';
import { loadsh } from '../../frameworks/loadsh';
import { playerData } from '../../frameworks/playerData';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { EffectGroup } from './effectGroup';
import { FightUI } from './fightUI';
import { LinkContent } from './linkContent';
const { ccclass, property } = _decorator;

@ccclass('FightScene')
export class FightScene extends Component {
    @property
    public nodeLinkContent: Node = null!;
    @property
    public nodeFightUI: Node = null!;
    @property
    public nodeEffectGroup: Node = null!;

    public linkContent: any;
    public fightUI: any;
    public effectGroup: any;
    public isLevelOver: any;
    public spareStar: any;
    public allFlyFinishCb: any;
    public reliveByAd: any;
    public isLevelStart: any;
    public dictPropsUseTimes: any;
    public isShowOperationUI: any;
    

    start() {
        profiler.hideStats();
        playerData.instance.startNewLevel();
        this.linkContent = this.nodeLinkContent.getComponent(LinkContent);
        this.fightUI = this.nodeFightUI.getComponent(FightUI);
        this.effectGroup = this.nodeEffectGroup.getComponent(EffectGroup);
        this.effectGroup.show(this);
        this.onNewLevel();
        AudioManager.instance.stop(constants.AUDIO_MUSIC.BACKGROUND);
        AudioManager.instance.playMusic(constants.AUDIO_MUSIC.FIGHT, true);
    }

    onEnable() {
        clientEvent.on('levelFinished', this.onLevelFinished, this);
        clientEvent.on('gameOver', this.onGameOver, this);
        clientEvent.on('newLevel', this.onNewLevel, this);
        clientEvent.on('useProp', this.useProp, this);
    }

    onDisable() {
        clientEvent.off('levelFinished', this.onLevelFinished, this);
        clientEvent.off('gameOver', this.onGameOver, this);
        clientEvent.off('newLevel', this.onNewLevel, this);
        clientEvent.off('useProp', this.useProp, this);
        AudioManager.instance.stop(constants.AUDIO_MUSIC.FIGHT);
        // AudioManager.instance.playMusic(constants.AUDIO_MUSIC.BACKGROUND, true);
    }

    onLevelFinished() {
        this.isLevelOver = true;
        if (playerData.instance.spareStep > 0 && !playerData.instance.curLevelInfo.infinite) {
            this.showBonusTime(() => {
                let step = playerData.instance.spareStep;
                this.spareStar = step;
                if (step > 0) {
                    this.allFlyFinishCb = this.triggerAllSpecialEffect;
                    for (let idx = 0; idx < step; idx++) {
                        this.scheduleOnce(() => {
                            playerData.instance.reduceStep();
                            clientEvent.dispatchEvent('updateStep');
                            let srcWorldPos = this.fightUI.getStepWorldPos();
                            let rand = loadsh.random(0, 1);
                            let effect = rand ? constants.SPECIAL_EFFECT.HORIZONTAL : constants.SPECIAL_EFFECT.VERTICAL;
                            this.effectGroup.showStarAfterLevelFinished(srcWorldPos, effect, this.showFlyEffectOver, this);
                        }, idx * 0.2);
                    }
                } else {
                    this.triggerAllSpecialEffect();
                }
            });
        } else {
            this.triggerAllSpecialEffect();
        }
    }

    showBonusTime(callback: any) {
        AudioManager.instance.playSound(constants.AUDIO_SOUND.BONUS_TIME, false);
        this.scheduleOnce(() => {
            this.effectGroup.showBonusTime(() => {
                this.linkContent.showLinkFinishEffect(callback);
            });
        }, 0.2);
    }

    onGameOver() {
        if (this.isLevelOver) {
            return;
        }
        this.isLevelOver = true;
        if (this.reliveByAd) {
            this.showGameOverUI();
        } else {
            this.reliveByAd = true;
            uiManager.instance.showDialog('fight/adStep', [(err: any) => {
                if (!err) {
                    playerData.instance.addStep(5);
                    this.isLevelOver = false;
                    clientEvent.dispatchEvent('updateStep', false);
                } else {
                    this.showGameOverUI();
                }
            }]);
        }
    }

    showGameOverUI() {
        uiManager.instance.showDialog("fight/balanceFailed");
    }

    onNewLevel() {
        this.isLevelStart = false; //等弹窗结束后在确定是否开始
        this.isLevelOver = false;
        this.reliveByAd = false; //步数用完时可通过让玩家选择是否要通过广告增加步数，仅能使用一次
        this.dictPropsUseTimes = {}; //道具使用次数
        this.effectGroup.removeLastEffect(); //删除上一关卡特效
        if (this.linkContent.dictCakes) {
            this.linkContent.showAllLinkItem(false, () => {
                this.linkContent.show(this);
                this.fightUI.show(this);
                if (playerData.instance.isNeedOpenUnlockPanel()) {
                    uiManager.instance.showDialog('fight/unLockProp', [
                        this.showTargets.bind(this),
                        this.fightUI
                    ]);
                } else {
                    this.showTargets();
                }
            });
        } else {
            this.linkContent.show(this);
            this.fightUI.show(this);
            if (playerData.instance.hasSeenGuide()) {
                if (playerData.instance.isNeedOpenUnlockPanel()) {
                    uiManager.instance.showDialog('fight/unLockProp', [
                        this.showTargets.bind(this),
                        this.fightUI
                    ]);
                } else {
                    this.showTargets();
                }
            } else {
                uiManager.instance.showDialog('fight/fightGuide', [() => {
                    playerData.instance.finishSeenGuide();
                    if (playerData.instance.isNeedOpenUnlockPanel()) {
                        uiManager.instance.showDialog('fight/unLockProp', [
                            this.showTargets.bind(this),
                            // this.fightUI
                        ]);
                    } else {
                        this.showTargets();
                    }
                }]);
            }
        }
        this.linkContent.stopGuideHand();
    }

    showTargets() {
        this.fightUI.showTargetsAni(() => {
            this.showAdRewardAsk();
            this.isLevelStart = true;
        });
    }

    showAdRewardAsk() {
        if (playerData.instance.level > 3) {
            uiManager.instance.showDialog('fight/adProp', [(err: any) => {
                if (!err) {
                    this.showAdRewardOver(true);
                } else {
                    this.showAdRewardOver(false);
                }
            }]);
        } else {
            this.showAdRewardOver(false);
        }
    }

    showAdRewardOver(isReward: any) {
        if (isReward) {
            this.spareStar = 2;
            this.allFlyFinishCb = null;
            for (let idx = 0; idx < 2; idx++) {
                this.scheduleOnce(() => {
                    let srcWorldPos = this.fightUI.getStepWorldPos();
                    let rand = loadsh.random(0, 1);
                    let effect = rand ? constants.SPECIAL_EFFECT.HORIZONTAL : constants.SPECIAL_EFFECT.VERTICAL;
                    this.effectGroup.showStarAfterLevelFinished(srcWorldPos, effect, this.showFlyEffectOver, this);
                }, idx * 0.2);
            }
        }
    }

    showFlyEffect(dictGenerator: any, callback: any) {
        this.allFlyFinishCb = callback;
        this.spareStar = 0;
        for (let index in dictGenerator) {
            let srcWorldPos = this.linkContent.getItemWorldPosByIndex(index);
            this.spareStar++;
            this.effectGroup.showStarFlyEffect(srcWorldPos, dictGenerator[index], this.showFlyEffectOver, this);
        }
    }

    showFlyEffectOver(error: any, idxTarget: any, effectType: any) {
        this.spareStar--;
        if (error) {
            return;
        }
        this.spareStar = this.spareStar < 0 ? 0 : this.spareStar;
        this.linkContent.addEffect(idxTarget, effectType);
        if (this.spareStar === 0) {
            if (this.allFlyFinishCb) {
                this.allFlyFinishCb();
            }
        }
    }

    triggerAllSpecialEffect() {
        this.linkContent.triggerAllSpecialEffect(() => {
            this.scheduleOnce(() => {
                this.linkContent.fillEmptyCell();
            }, 0.3);
            this.scheduleOnce(() => {
                if (!playerData.instance.balanceOverAdTimes) {
                    playerData.instance.balanceOverAdTimes = 1;
                }
                playerData.instance.balanceOverAdTimes++;
                if (playerData.instance.balanceOverAdTimes > 2) {
                    GameLogic.instance.showInterStitialAd((dataObj: any) => {
                        uiManager.instance.showDialog("fight/balance");
                    });
                    playerData.instance.balanceOverAdTimes = 1;
                } else {
                    uiManager.instance.showDialog("fight/balance");
                }
            }, 2);
        });
    }

    getLinkContentRect() {
        let pos = this.nodeLinkContent.position;
        const uiTra = this.nodeLinkContent.getComponent(UITransform)!;
        return new Rect(pos.x, pos.y, uiTra.width, uiTra.height);
    }

    isPropCanUse(propId: any) {
        let prop = localConfig.instance.queryByID('prop', propId);
        if (prop) {
            if (this.dictPropsUseTimes.hasOwnProperty(propId)) {
                let times = this.dictPropsUseTimes[propId];
                if (times >= prop.limit) {
                    return false;
                }
            }
            return true;
        }
        return true;
    }

    showPropOperationUI(prop: any, posWorld: any) {
        this.linkContent.stopGuideHand();
        this.isShowOperationUI = true;
        uiManager.instance.showDialog('fight/fightPropsOperation', [prop, posWorld, this.getLinkContentRect(), this, () => {
            this.isShowOperationUI = false;
        }]);
    }

    useProp(propId: any, triggerIndex: any) {
        switch (propId) {
            case constants.PROP_ID.HAMMER:
                if (!triggerIndex || triggerIndex < 0) {
                    return;
                }
                this.linkContent.destoryCake(triggerIndex);
                break;
            case constants.PROP_ID.MAGIC:
                if (!triggerIndex || triggerIndex < 0) {
                    return;
                }
                let srcWorldPos = this.fightUI.getStepWorldPos();
                this.spareStar = 1;
                let rand = loadsh.random(0, 1);
                let effect = rand ? constants.SPECIAL_EFFECT.HORIZONTAL : constants.SPECIAL_EFFECT.VERTICAL;
                this.allFlyFinishCb = null;
                this.effectGroup.showStarAfterLevelFinished(srcWorldPos, effect, this.showFlyEffectOver, this, triggerIndex);
                break;
            case constants.PROP_ID.REFRESH:
                this.linkContent.stopGuideHand();
                if (!this.linkContent.refreshLinkItems()) {
                    return;
                }
                break;
            case constants.PROP_ID.INFINITE:
                playerData.instance.curLevelInfo.infinite = true;
                this.fightUI.showInfinite();
                break;
        }
        if (this.dictPropsUseTimes.hasOwnProperty(propId)) {
            this.dictPropsUseTimes[propId]++;
        } else {
            this.dictPropsUseTimes[propId] = 1;
        }
        playerData.instance.costProp(propId);
        clientEvent.dispatchEvent('updateProp', propId);
    }

}