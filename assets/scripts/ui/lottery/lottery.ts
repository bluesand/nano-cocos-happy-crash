import { _decorator, Component, Node, Animation, Prefab, Label, instantiate, tween, Vec3 } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { localConfig } from '../../frameworks/localConfig';
import { playerData } from '../../frameworks/playerData';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { utils } from '../../shared/utils';
import { ButtonEx } from '../common/buttonEx';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { GameLogic } from '../../frameworks/gameLogic';
import { LotteryItem } from './lotteryItem';
const { ccclass, property } = _decorator;

@ccclass('Lottery')
export class Lottery extends Component {
    @property(Node)
    public arrRewardNode: Array<Node> = [];
    @property(Animation)
    public aniLightGroup: Animation = null!;
    @property(Prefab)
    public pfRewardItem: Prefab = null!;
    @property(Label)
    public lbSpareTimes: Label = null!;
    @property(Label)
    public lbAdSpareTimes: Label = null!;
    @property(Label)
    public lbShareSpareTimes: Label = null!;
    @property(Label)
    public lbGold: Label = null!;
    @property(Node)
    public ndBtnStart: Node = null!;
    @property(Node)
    public ndBtnAd: Node = null!;
    @property(Node)
    public ndBtnShare: Node = null!;
    @property(Node)
    public ndTurnable: Node = null!;

    public dictReward: any = {};;
    public arrRewardData: any = [];
    public arrProbability: any;
    public times: any;
    public moreTimes: any;
    public isBtnStartShow: any;
    public randValue: any;
    public itemNode: any;

    ctor() {
        this.dictReward = {}; //存在预制件的字典
        this.arrRewardData = []; //存放lottery表数据的数组
    }

    show() {
        let arrRewardInfo = [
            { x: 0, y: 53, angle: new Vec3(0, 0, -0) },
            { x: 32, y: 44, angle: new Vec3(0, 0, -36) },
            { x: 51, y: 15, angle: new Vec3(0, 0, -72) },
            { x: 51, y: -18, angle: new Vec3(0, 0, -108) },
            { x: 32, y: -46, angle: new Vec3(0, 0, -144) },
            { x: 0, y: -56, angle: new Vec3(0, 0, 180) },
            { x: -32.6, y: -45.7, angle: new Vec3(0, 0, 144) },
            { x: -51, y: -18, angle: new Vec3(0, 0, 108) },
            { x: -51, y: 15, angle: new Vec3(0, 0, 72) },
            { x: -32, y: 42, angle: new Vec3(0, 0, 36) },
        ]
        this.ndTurnable.children.forEach((item: any, idx: any) => {
            let itemInfo = arrRewardInfo[idx];
            item.setPosition(itemInfo.x, itemInfo.y);
            item.eulerAngles = itemInfo.angle;
        })
        this.initReward();
        this.initInfo();
        this.updateGold();
    }

    onEnable() {
        clientEvent.on('updateGold', this.updateGold, this);
    }

    onDisable() {
        clientEvent.off('updateGold', this.updateGold, this);
    }

    initReward() {
        if (this.arrRewardData.length <= 0) {
            let tbLottery = localConfig.instance.getTable('lottery');
            this.arrRewardData = utils.objectToArray(tbLottery);
        }
        this.arrProbability = [];
        let start = 0;
        this.arrRewardData.forEach((val: any, idx: any, arr: any) => {
            let parentNode = this.arrRewardNode[idx];
            let rewardItem = this.dictReward[idx];
            if (!this.dictReward.hasOwnProperty(idx)) {
                rewardItem = instantiate(this.pfRewardItem);
                rewardItem.setPosition(0, -42, 0)
                rewardItem.parent = parentNode;
                this.dictReward[idx] = rewardItem;
            }
            if (this.arrRewardData.length > idx) {
                let info = this.arrRewardData[idx];
                let script = rewardItem.getComponent(LotteryItem);
                script.setInfo(info);
                let min = start;
                let max = start + info.probability;
                this.arrProbability.push({ min: min, max: max, idx: idx }); //区间
                start = max;
            }
        });
    }

    initInfo() {
        this.times = playerData.instance.getLotterySpareTimes(false);
        this.moreTimes = playerData.instance.getLotterySpareTimes(true);
        this.lbSpareTimes.string = `${this.times}/${constants.LOTTERY_MAX_TIMES}`;
        this.lbAdSpareTimes.string = `${this.moreTimes}/${constants.LOTTERY_AD_MAX_TIMES}`;
        this.lbShareSpareTimes.string = `${this.moreTimes}/${constants.LOTTERY_AD_MAX_TIMES}`;
        this.checkBtnStatus();
    }

    checkBtnStatus() {
        if (this.times <= 0) {
            this.showBtnShareOrAd(); //显示分享或者广告按钮
            if (this.moreTimes <= 0) {
                this.ndBtnAd.getComponent(ButtonEx)!.interactable = false;
                this.ndBtnShare.getComponent(ButtonEx)!.interactable = false;
                this.lbAdSpareTimes.node.active = false;
                this.lbShareSpareTimes.node.active = false;
                resourceUtil.setGray(this.ndBtnAd, true);
                resourceUtil.setGray(this.ndBtnShare, true);
            }
        } else {
            this.ndBtnStart.active = true;
            this.ndBtnStart.getComponent(ButtonEx)!.interactable = true;
        }
    }

    updateGold() {
        this.lbGold.string = utils.formatMoney(playerData.instance.getGold());
    }

    onBtnStartClick() {
        this.showSelectUI(this.ndBtnStart, this.lbSpareTimes, false);
    }

    showSelectUI(node: any, label: any, isMore: any) {
        this.isBtnStartShow = true;
        node.getComponent(ButtonEx)!.interactable = false;
        for (let i in this.dictReward) {
            this.dictReward[i].getComponent(LotteryItem).setSelect(false);
        }
        playerData.instance.addLotteryTimes(isMore);
        if (isMore) {
            this.moreTimes = playerData.instance.getLotterySpareTimes(isMore);
            label.string = `${this.moreTimes}/${constants.LOTTERY_AD_MAX_TIMES}`;
        } else {
            this.times = playerData.instance.getLotterySpareTimes(isMore);
            label.string = `${this.times}/${constants.LOTTERY_MAX_TIMES}`;
        }
        clientEvent.dispatchEvent('updateLotterySpareTimes');
        this.randValue = this.getRandValue();
        this.aniLightGroup.play();
        this.startRun();
    }

    startRun() {
        let targetAngle = 360;
        let eulZ = this.ndTurnable.eulerAngles.z;
        eulZ = eulZ % 360;
        this.ndTurnable.setRotationFromEuler(0, 0, eulZ);

        let offset = 360 - eulZ;
        let randTimes = 3 + Math.floor(Math.random() * 4); //旋转的随机次数

        tween(this.ndTurnable)
            .to(offset / 360 + randTimes * 0.5, { eulerAngles: new Vec3(0, 0, (targetAngle + randTimes * 360 + this.randValue * 36 )) }, { easing: 'circInOut' })
            .call(() => {
                this.showReward();
            })
            .start()
    }

    getRandValue(): any {
        let randIdx = -1;
        let rand = Math.floor(Math.random() * 100);
        for (let i = 0; i < this.arrProbability.length; i++) {
            let probability = this.arrProbability[i];
            if (rand >= probability.min && rand < probability.max) {
                randIdx = probability.idx;
                break;
            }
        }
        if (randIdx !== -1) {
            return randIdx;
        }
        return this.getRandValue();
    }

    showReward() {
        this.aniLightGroup.stop();
        this.itemNode = this.dictReward[this.randValue];
        let lotteryItemScript = this.itemNode.getComponent(LotteryItem);
        lotteryItemScript.setSelect(true);
        if (this.isBtnStartShow) {
            this.checkBtnStatus();
            this.isBtnStartShow = false;
        }
    }

    onBtnAddDiamondClick() {
        uiManager.instance.showTips(i18n.t('lottery.noChargePleaseWait'));
    }

    onBtnAdClick() {
        GameLogic.instance.showRewardAd((err: any) => {
            if (!err) {
                this.showSelectUI(this.ndBtnAd, this.lbAdSpareTimes, true);
            }
        });
    }

    onBtnShareClick() {
        GameLogic.instance.share(constants.SHARE_FUNCTION.LOTTERY, {}, (err: any) => {
            if (!err) {
                this.showSelectUI(this.ndBtnShare, this.lbShareSpareTimes, true);
            }
        })
    }

    showBtnShareOrAd() {
        GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.LOTTERY, (err: any, type: any) => {
            if (!err) {
                switch (type) {
                    case constants.OPEN_REWARD_TYPE.AD:
                        this.ndBtnStart.active = false;
                        this.ndBtnShare.active = false;
                        this.ndBtnAd.active = true;
                        this.ndBtnAd.getComponent(ButtonEx)!!.interactable = true;
                        break;
                    case constants.OPEN_REWARD_TYPE.SHARE:
                        this.ndBtnStart.active = false;
                        this.ndBtnAd.active = false;
                        this.ndBtnShare.active = true;
                        this.ndBtnShare.getComponent(ButtonEx)!!.interactable = true;
                        break;
                    case constants.OPEN_REWARD_TYPE.NULL:
                        this.ndBtnStart.active = true;
                        this.ndBtnStart.getComponent(ButtonEx)!!.interactable = false;
                        resourceUtil.setGray(this.ndBtnStart, true); //这句话放在interactable后才生效
                        this.ndBtnAd.active = false;
                        this.ndBtnShare.active = false;
                        break;
                }
            } else {
            }
        })
    }

    onBtnCloseClick() {
        uiManager.instance.hideDialog('lottery/lottery');
    }

}
