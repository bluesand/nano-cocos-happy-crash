import { _decorator, Component, Node, Label, SpriteFrame, Animation, Sprite, Vec3 } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { GameLogic } from '../../frameworks/gameLogic';
import { playerData } from '../../frameworks/playerData';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { utils } from '../../shared/utils';
import { MultiScrollView } from './multiScrollView';
const { ccclass, property } = _decorator;

@ccclass('PveUI')
export class PveUI extends Component {
    @property
    public multiScrollView: MultiScrollView = null!;
    @property
    public settingNode: Node = null!;
    @property
    public introductionNode: Node = null!;
    @property
    public ndLotteryBtn: Node = null!;
    @property
    public ndLotteryTips: Node = null!;
    @property
    public lbLotterySpareTimes: Label = null!;
    @property
    public sfBlueDot: SpriteFrame = null!;
    @property
    public sfRedDot: SpriteFrame = null!;
    @property
    public lbGold: Label = null!;
    @property
    public ndSignRedDot: Node = null!;
    @property
    public ndShopRedDot: Node = null!;

    public rewardType: any;
    public debugIdx: any;
    public debugTimer: any;

    onEnable() {
        clientEvent.on('updateSignIn', this.checkSignInRedDot, this);
        clientEvent.on('updateLotterySpareTimes', this.updateLotterySpareTimes, this);
        clientEvent.on('updateGold', this.updateGold, this);
        clientEvent.on('updateShopPropInfo', this.checkShopRedDot, this);
    }

    onDisable() {
        clientEvent.off('updateSignIn', this.checkSignInRedDot, this);
        clientEvent.off('updateLotterySpareTimes', this.updateLotterySpareTimes, this);
        clientEvent.off('updateGold', this.updateGold, this);
        clientEvent.off('updateShopPropInfo', this.checkShopRedDot, this);
    }

    start() {
        let _this = this;
        if (playerData.instance.playerInfo.isNew) {
            this.introductionNode.active = true;
        } else {
            this.introductionNode.active = false;
        }
        this.refreshUI();
        this.checkSignInRedDot();

        this.checkShopRedDot();
        this.updateLotterySpareTimes();
    }

    refreshUI() {
        this.updateGold();
    }

    onBtnBack() {
    }

    onBtnSettingClick() {
        GameLogic.instance.showInterStitialAd(() => {
            uiManager.instance.showDialog('dialog/setting');
        });
    }

    onBtnSignClick() {
        uiManager.instance.showDialog('signIn/signIn');
    }

    onBtnLotteryClick() {
        uiManager.instance.showDialog('lottery/lottery');
    }

    onBtnIntrodutionClick() {
        this.introductionNode.active = false;
        // playerData.instance.updateIsNew();
    }

    updateLotterySpareTimes() {
        GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.LOTTERY, (err: any, type: any) => {
            if (!err) {
                this.rewardType = type;
            }
        })
        let spareTimes = playerData.instance.getLotterySpareTimes(false);
        let spareMoreTimes = playerData.instance.getLotterySpareTimes(true); //更多抽奖剩余次数
        this.ndLotteryTips.active = spareTimes > 0 || spareMoreTimes > 0;
        this.lbLotterySpareTimes.string = (spareTimes).toString();
        let ani = this.ndLotteryBtn.getComponent(Animation)!;
        if (spareTimes > 0 || spareMoreTimes > 0) {
            if (!spareTimes) { //如果三次抽取完了
                if (this.rewardType !== constants.OPEN_REWARD_TYPE.NULL) {
                    this.lbLotterySpareTimes.string = (spareMoreTimes).toString();
                    this.ndLotteryTips.getComponent(Sprite)!.spriteFrame = this.sfBlueDot;
                    ani.play();
                } else {
                    this.ndLotteryTips.active = false;
                    ani.stop();
                    this.ndLotteryBtn.getChildByName('pveIconLotterya')!.eulerAngles = new Vec3(0, 0, 0);
                }
            } else {
                ani.play();
            }
        } else {
            ani.stop();
            this.ndLotteryBtn.getChildByName('pveIconLotterya')!.eulerAngles = new Vec3(0, 0, 0);
        }
    }

    updateGold() {
        this.lbGold.string = utils.formatMoney(playerData.instance.getGold());
    }


    onBtnShopClick() {
        uiManager.instance.showDialog('shop/shop');
    }

    checkSignInRedDot() {
        playerData.instance.updateSignInCurrentDay(); //更新最新的可领取日期
        GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.FILL_SIGN, (err: any, type: any) => {
            if (!err) {
                switch (type) {
                    case constants.OPEN_REWARD_TYPE.AD:
                        this.ndSignRedDot.active = !playerData.instance.getSignInReceivedInfo().isAllReceived;
                        break;
                    case constants.OPEN_REWARD_TYPE.SHARE:
                        this.ndSignRedDot.active = !playerData.instance.getSignInReceivedInfo().isAllReceived;
                        break;
                    case constants.OPEN_REWARD_TYPE.NULL:
                        this.ndSignRedDot.active = !playerData.instance.getSignInReceivedInfo().isTodayReceived;
                        break;
                }
            }
        });
    }

    checkShopRedDot() {
        if (!playerData.instance.playerInfo.hasOwnProperty('shopPropInfo')) {
            playerData.instance.resetShopPropInfo();
            playerData.instance.updateShopPropInfo(false); //第一次设置为可以领取
        }
        this.ndShopRedDot.active = playerData.instance.playerInfo.shopPropInfo['receiveStatus'] === constants.REWARD_STATUS.RECEIVABLE;
    }

    onBtnDebugClick() {
        if (!this.debugIdx) {
            this.debugIdx = 0;
        }
        const MAX_TIMES = 8;
        this.debugIdx++;
        if (this.debugIdx > MAX_TIMES) {
            uiManager.instance.showDialog('debug/password', []);
        } else if (!this.debugTimer) {
            var _this = this;
            this.debugTimer = setTimeout(function () {
                _this.debugTimer = null!;
                if (_this.debugIdx < MAX_TIMES) {
                    _this.debugIdx = 0;
                }
            }, 3000);
        }
    }
}