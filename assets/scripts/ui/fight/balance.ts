import { _decorator, Component, Label, Node, Sprite, Animation, SpriteFrame } from 'cc';
import { playerData } from '../../frameworks/playerData';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { GameLogic } from '../../frameworks/gameLogic';
import { constants } from '../../shared/constants';
import { AudioManager } from '../../frameworks/audioManager';
import { clientEvent } from '../../frameworks/clientEvent';
import { SceneManager } from '../loading/sceneManager';
import { uiManager } from '../../frameworks/uiManager';
const { ccclass, property } = _decorator;

@ccclass('Balance')
export class Balance extends Component {
    @property
    public lbLevel: Label = null!;
    @property
    public lbScore: Label = null!;
    @property
    public lbHighest: Label = null!;
    @property
    public lbGold: Label = null!;
    @property
    public arrStar: Array<Node> = [];
    @property
    public arrStarLight: Array<Node> = [];
    @property
    public ndBtnDouble: Node = null!;
    @property
    public spBtnDouble: Sprite = null!;
    @property
    public ani: Animation = null!;
    @property
    public aniGold: Animation = null!;
    @property
    public sfAd: SpriteFrame = null!;
    @property
    public sfShare: SpriteFrame = null!;

    public isFirstInvite: any;
    public goldNum: any;
    public isOver: any;
    public soundStar: any;
    public openRewardType: any;

    show() {
        this.aniGold.node.active = true;
        this.isFirstInvite = false;
        let ret = playerData.instance.finishLevel(playerData.instance.level, playerData.instance.score);
        let levelVal = playerData.instance.getCurrentLevel()['ID'] + '';
        this.goldNum = ret.gold;
        this.isOver = false;
        this.lbGold.string = (ret.gold).toString();
        this.lbLevel.string = ret.levelId;
        this.lbScore.string = ret.score;
        this.lbHighest.string = i18n.t('fight.highest') + playerData.instance.getHighestScoreByLevel(ret.levelId);
        this.soundStar = 0;
        let stars = playerData.instance.arrStars;
        this.arrStar[0].active = ret.star > 0;
        this.arrStarLight[0].active = ret.star > 0;
        this.arrStar[1].active = ret.star > 1;
        this.arrStarLight[1].active = ret.star > 1;
        this.arrStar[2].active = ret.star > 2;
        this.arrStarLight[2].active = ret.star > 2;
        this.ani.play("balanceShow");
        this.ani.once(Animation.EventType.FINISHED, () => {
            this.ani.play('balanceIdle');
        }, this);
        if (this.goldNum > 0) {
            GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.FILL_SIGN, (err: any, type: any) => {
                if (!err) {
                    this.openRewardType = type;
                    switch (type) {
                        case constants.OPEN_REWARD_TYPE.AD:
                            this.ndBtnDouble.active = true;
                            this.spBtnDouble.spriteFrame = this.sfAd;
                            this.aniGold.play();
                            break;
                        case constants.OPEN_REWARD_TYPE.SHARE:
                            this.ndBtnDouble.active = true;
                            this.aniGold.play();
                            this.spBtnDouble.spriteFrame = this.sfShare;
                            break;
                        case constants.OPEN_REWARD_TYPE.NULL:
                            this.ndBtnDouble.active = false;
                            break;
                    }
                } else {
                    this.close();
                }
            })
        } else {
            this.ndBtnDouble.active = false;
        }
    }

    onShowStar() {
        if (this.arrStar[this.soundStar].active) {
            AudioManager.instance.playSound(constants.AUDIO_SOUND.FINISH_STAR, false);
        }
        this.soundStar++;
    }

    onDisable() {
    }

    onBtnNextClick() {
        GameLogic.instance.customEventStatistics(constants.ANALYTICS_TYPE.BALANCE_NEXT);
        if (this.isOver) {
            return;
        }
        this.isOver = true;
        playerData.instance.nextLevel();
        this.close();
        clientEvent.dispatchEvent('newLevel');
    }

    onBtnRetryClick() {
        this.close();
        GameLogic.instance.customEventStatistics(constants.ANALYTICS_TYPE.BALANCE_PLAY_AGAIN);
        GameLogic.instance.resetLevel();
    }

    onBtnCloseClick() {
        GameLogic.instance.customEventStatistics(constants.ANALYTICS_TYPE.BALANCE_CLOSE);
        this.close();
        SceneManager.instance.loadScene('pve', [], (err: any, result: any) => {
            if (err) {
                console.error(err.message || err);
                return;
            }
        });
    }

    onBtnDoubleClick() {
        if (this.openRewardType === constants.OPEN_REWARD_TYPE.SHARE) {
            GameLogic.instance.share(constants.SHARE_FUNCTION.BALANCE, {}, (err: any) => {
                if (!err) {
                    this.showReward();
                }
            });
            GameLogic.instance.customEventStatistics(constants.ANALYTICS_TYPE.BALANCE_SHARE);
        } else {
            GameLogic.instance.showRewardAd((err: any) => {
                if (!err) {
                    this.showReward();
                }
            });
        }
    }

    showReward() {
        if (!this.isFirstInvite) {
            this.isFirstInvite = true;
            let itemInfo: any = {}
            itemInfo.itemType = constants.REWARD_TYPE.GOLD;
            itemInfo.itemSubType = 0;
            itemInfo.itemAmount = this.goldNum;
            this.aniGold.node.active = false;
            uiManager.instance.showDialog('lottery/reward', [itemInfo, false, constants.SHARE_FUNCTION.BALANCE]);
        }
    }

    close() {
        uiManager.instance.hideDialog('fight/balance');
    }

}