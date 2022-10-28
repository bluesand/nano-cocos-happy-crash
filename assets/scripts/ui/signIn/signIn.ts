import { _decorator, Component, Prefab, Node, Label, Widget, instantiate, Button } from 'cc';
import { playerData } from '../../frameworks/playerData';
import { uiManager } from '../../frameworks/uiManager';
import { clientEvent } from '../../frameworks/clientEvent';
import { GameLogic } from '../../frameworks/gameLogic';
import { constants } from '../../shared/constants';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { localConfig } from '../../frameworks/localConfig';
import { ButtonEx } from '../common/buttonEx';
import { SignInItem } from './signInItem';
import { AnimationUI } from '../common/animationUI';
const { ccclass, property } = _decorator;

const MIN_CHILD_COUNT = 1;
@ccclass('SignIn')
export class SignIn extends Component {
    @property
    public prefabItem: Prefab = null!;
    @property
    public iconList: Array<Node> = [];
    @property
    public ndSeventhItem: Node = null!;
    @property
    public ndBtnDoubleReceive: Node = null!;
    @property
    public arrDay: Array<Label> = [];
    @property
    public ndBtnNormalReceive: Node = null!;

    public currentDay: any;
    public arrReceived: any;
    public arrAfterFillSignIn: any;
    public isTodayReceived: any;
    public arrSignInItemScript: any;
    public signInItemScript: any;
    public openRewardType: any;

    onEnable() {
        clientEvent.on('updateSignIn', this.updateSignIn, this);
    }

    onDisable() {
        clientEvent.off('updateSignIn', this.updateSignIn, this);
    }

    show() {
        playerData.instance.updateSignInCurrentDay();
        let signInInfo = playerData.instance.playerInfo['signInInfo'];
        console.log('###signInfo', signInInfo);
        this.currentDay = signInInfo['currentDay']; //当前日期
        this.arrReceived = signInInfo['receivedDays']; //已经领取的日期数组
        this.arrAfterFillSignIn = signInInfo['afterFillSignInDays']; //已经补签后可领取的日期数组
        this.showSignInInfo();
        this.ndSeventhItem.setSiblingIndex(constants.ZORDER.TIPS);
        this.updateSignIn();
        this.isTodayReceived = playerData.instance.getSignInReceivedInfo()['isTodayReceived'];
        this.ndBtnNormalReceive.active = false;
        if (this.isTodayReceived) {
            this.scheduleOnce(this.showNormalBtnCallback, 1);
        } else {
            this.scheduleOnce(this.showNormalBtnCallback, constants.NORMAL_SHOW_TIME);
        }
    }

    updateSignIn() {
        this.ndBtnDoubleReceive.getComponent(ButtonEx)!.interactable = !playerData.instance.getSignInReceivedInfo()['isTodayReceived'];
        console.log('###getSignInReceivedInfo', playerData.instance.getSignInReceivedInfo());
    }

    showNormalBtnCallback() {
        this.ndBtnNormalReceive.active = true;
        this.node.getComponent(Widget)!.enabled = true;
        this.ndBtnNormalReceive.getComponent(Widget)!.enabled = true;
        this.ndBtnNormalReceive.getComponent(Widget)!.bottom = 205;
        console.log('bottom', this.ndBtnNormalReceive.getComponent(Widget)!.bottom);
        console.log('enable', this.ndBtnNormalReceive.getComponent(Widget)!.enabled);
    }

    showSignInInfo() {
        let tbSignIn = localConfig.instance.getTable("signIn");
        let _this = this;
        this.arrSignInItemScript = [];
        for (var idx in tbSignIn) {
            let day = tbSignIn[idx].ID;
            let isReceived = this.arrReceived.includes(Number(day)) ? true : false; //从签到数组中判断是否已经领取
            if (day <= this.currentDay) {
                tbSignIn[idx].status = isReceived ? constants.SIGN_REWARD_STATUS.RECEIVED : constants.SIGN_REWARD_STATUS.RECEIVABLE; //状态设置为已领取或者可领取
                if (tbSignIn[idx].status === constants.SIGN_REWARD_STATUS.RECEIVABLE && day < this.currentDay) {
                    tbSignIn[idx].status = constants.SIGN_REWARD_STATUS.FILLSIGNIN;
                    if (this.arrAfterFillSignIn.includes(day)) {
                        tbSignIn[idx].status = constants.SIGN_REWARD_STATUS.AFTER_FILLSIGNIN;
                    }
                }
            } else { //不可领取
                tbSignIn[idx].status = constants.SIGN_REWARD_STATUS.UNRECEIVABLE;
            }
            let node = _this.iconList[Number(idx) - 1]; //idx从1开始
            let signInItemNode: any = null!;
            if (node.children.length <= MIN_CHILD_COUNT) {
                signInItemNode = instantiate(_this.prefabItem);
                node.addChild(signInItemNode);
                signInItemNode.setPosition(0, 0);
            } else {
                signInItemNode = node.getChildByName('signInItem');
            }
            this.signInItemScript = signInItemNode.getComponent(SignInItem)!;
            this.signInItemScript.init(tbSignIn[idx], _this);
            if (!this.arrSignInItemScript.includes(this.signInItemScript)) {
                this.arrSignInItemScript.push(this.signInItemScript);
            }
            let DayLabel = this.arrDay[Number(idx) - 1];
            DayLabel.string = i18n.t('sign.day%{value}', { value: idx });
        };
    }

    receiveReward(itemInfo: any, isDouble: any, callback: any) {
        let day = itemInfo["ID"];
        if (this.currentDay < day) { //大于可领奖天数点击图标不能领取
            return;
        }
        let isLast = false; //某一天的签到奖励的最后一个弹窗(礼包弹出3个),判断是否需要再次显示签到界面
        let type = itemInfo.rewardType;
        if (type === constants.REWARD_TYPE.GIFT) { //如果奖励等于礼包
            let arrGift = playerData.instance.parseGift(itemInfo.subType);
            for (let i = 0; i < arrGift.length; i++) {
                let giftItemInfo: any = {}; //每个弹窗的数据
                giftItemInfo['ID'] = itemInfo['ID'];
                giftItemInfo['itemType'] = arrGift[i]['type'];
                giftItemInfo['itemSubType'] = arrGift[i]['subType'];
                giftItemInfo['itemAmount'] = isDouble ? Number(arrGift[i]['amount']) * 2 : arrGift[i]['amount'];
                isLast = i === arrGift.length - 1 ? true : false;
                uiManager.instance.pushToPopupSeq('signIn/signInReward', 'signinReward', [giftItemInfo, callback, isLast]);
            }
        } else {
            let normalItemInfo: any = {}
            normalItemInfo['ID'] = itemInfo['ID'];
            normalItemInfo['itemType'] = itemInfo['rewardType'];
            normalItemInfo['itemSubType'] = itemInfo['subType'];
            normalItemInfo['itemAmount'] = isDouble ? Number(itemInfo['amount']) * 2 : itemInfo['amount'];
            isLast = true;
            uiManager.instance.pushToPopupSeq('signIn/signInReward', 'signinReward', [normalItemInfo, callback, isLast]);
        }
        uiManager.instance.hideDialog('signIn/signIn');
        this.unschedule(this.showNormalBtnCallback);
    }

    receiveClick(isDouble: any) {
        for (let j = 0; j < this.arrSignInItemScript.length; j++) {
            let element = this.arrSignInItemScript[j];
            if (element.itemInfo["status"] === constants.SIGN_REWARD_STATUS.RECEIVABLE) {
                element._parent.receiveReward(element.itemInfo, isDouble, () => {
                    element.markReceived();
                });
                break;
            }
        }
    }

    onBtnDoubleReceiveClick() {
        GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.SIGN, (err: any, type: any) => {
            if (!err) {
                this.openRewardType = type;
                switch (type) {
                    case constants.OPEN_REWARD_TYPE.AD:
                        this.showAd();
                        break;
                    case constants.OPEN_REWARD_TYPE.SHARE:
                        this.showShare();
                        break;
                    case constants.OPEN_REWARD_TYPE.NULL:
                        this.receiveClick(false);
                        break;
                }
            }
            else {
                this.node.getComponent(AnimationUI)!.close();
            }
        })
    }

    showAd() {
        GameLogic.instance.showRewardAd((err: any) => {
            if (!err) {
                this.receiveClick(true);
            }
        });
    }

    showShare() {
        GameLogic.instance.share(constants.SHARE_FUNCTION.SIGN, {}, (err: any) => {
            if (!err) {
                this.receiveClick(true);
            }
        });
    }

    onBtnNormalReceiveClick() {
        this.onBtnCloseClick();
    }

    onBtnCloseClick() {
        uiManager.instance.hideDialog('signIn/signIn');
        uiManager.instance.hideDialog('signIn/signInReward');
        this.unschedule(this.showNormalBtnCallback);
    }

}