import { _decorator, Component, Label, Sprite, SpriteFrame, Node, UITransform, Vec3 } from 'cc';
import { playerData } from '../../frameworks/playerData';
import { GameLogic } from '../../frameworks/gameLogic';
import { constants } from '../../shared/constants';
const { ccclass, property } = _decorator;

@ccclass('SignInItem')
export class SignInItem extends Component {
    @property
    public lbAmount: Label = null!;
    @property
    public spIcon: Sprite = null!;
    @property
    public spPan: Sprite = null!;
    @property
    public sfDiamond: SpriteFrame = null!;
    @property
    public sfGold: SpriteFrame = null!;
    @property
    public sfGift: SpriteFrame = null!;
    @property
    public ndLight: Node = null!;
    @property
    public ndTick: Node = null!;
    @property
    public ndBtnFillSignIn: Node = null!;
    @property
    public ndBtnReceive: Node = null!;
    @property
    public ndMenu: Node = null! //按钮菜单 = 'Node //按钮菜单';

    public isReceived: any;
    public _parent: any;
    public itemInfo: any;
    public openRewardType: any;

    start() {
        this.isReceived = false;
    }

    init(itemInfo: any, parent: any) {
        this._parent = parent;
        this.itemInfo = itemInfo;
        this.setIcon(itemInfo["rewardType"]);
        this.setStatus(itemInfo["status"]);
        GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.FILL_SIGN, (err: any, type: any) => {
            if (!err) {
                this.openRewardType = type;
                switch (type) {
                    case constants.OPEN_REWARD_TYPE.AD:
                        break;
                    case constants.OPEN_REWARD_TYPE.SHARE:
                        break;
                    case constants.OPEN_REWARD_TYPE.NULL:
                        this.ndBtnFillSignIn.active = false;
                        break;
                }
            }
            // else {
            //     this.close();
            // }
        })
    }

    setIcon(type: any) {
        let v3_init = new Vec3();
        const uiTraSpIcon = this.spIcon.getComponent(UITransform)!;
        switch (type) {
            case constants.REWARD_TYPE.DIAMOND:
                this.spIcon.spriteFrame = this.sfDiamond;
                uiTraSpIcon.width = 165;
                uiTraSpIcon.height = 126;
                v3_init.set(this.spIcon.node.position);
                v3_init.y = 56;
                this.spIcon.node.setPosition(v3_init);
                break;
            case constants.REWARD_TYPE.GOLD:
                this.spIcon.spriteFrame = this.sfGold;
                uiTraSpIcon.width = 165;
                uiTraSpIcon.height = 126;
                v3_init.set(this.spIcon.node.position);
                v3_init.y = 56;
                this.spIcon.node.setPosition(v3_init);
                break;
            case constants.REWARD_TYPE.GIFT:
                this.spIcon.spriteFrame = this.sfGift;
                break;
        }

        if (this.itemInfo['ID'] <= 6) {
            v3_init.set(0.6, 0.6, 0.6)
            this.spPan.node.setScale(v3_init);
        } else {
            v3_init.set(this.ndTick.position);
            v3_init.y = 50;
            this.ndTick.setPosition(v3_init);
        }

        v3_init.set(this.ndMenu.position);
        v3_init.y = -50;
        this.ndMenu.setPosition(v3_init);
    }

    setStatus(status: any) {
        switch (status) {
            case constants.SIGN_REWARD_STATUS.RECEIVED:
                this.showItemUI(false, true, false, false);
                break;
            case constants.SIGN_REWARD_STATUS.RECEIVABLE:
                this.showItemUI(true, false, false, false);
                break;
            case constants.SIGN_REWARD_STATUS.UNRECEIVABLE:
                this.showItemUI(false, false, false, false);
                break;
            case constants.SIGN_REWARD_STATUS.FILLSIGNIN:
                this.showItemUI(false, false, true, false);
                break;
            case constants.SIGN_REWARD_STATUS.AFTER_FILLSIGNIN:
                this.showItemUI(true, false, false, true);
                break;
        }
    }

    showItemUI(isShowLight: any, isShowTick: any, isShowBtnFillSignIn: any, isShowBtnReceive: any) {
        this.ndLight.active = isShowLight;
        this.ndTick.active = isShowTick;
        this.ndBtnFillSignIn.active = isShowBtnFillSignIn;
        this.ndBtnReceive.active = isShowBtnReceive;
    }

    onBtnReceiveClick() {
        if (this.itemInfo["status"] === constants.SIGN_REWARD_STATUS.AFTER_FILLSIGNIN || this.itemInfo["status"] === constants.SIGN_REWARD_STATUS.RECEIVABLE) {
            this._parent.receiveReward(this.itemInfo, false, this.markReceived.bind(this));
        }
    }

    markReceived() {
        this.itemInfo["status"] = constants.SIGN_REWARD_STATUS.RECEIVED;
        this.setStatus(this.itemInfo["status"]);
    }

    markAfterFillSignIn() {
        this.itemInfo["status"] = constants.SIGN_REWARD_STATUS.AFTER_FILLSIGNIN;
        this.setStatus(this.itemInfo["status"]);
        playerData.instance.updateSignInFillSignInDays(this.itemInfo['ID'], false);
    }

    onBtnFillSignInClick() {
        switch (this.openRewardType) {
            case constants.OPEN_REWARD_TYPE.AD:
                GameLogic.instance.showRewardAd((err: any) => {
                    if (!err) {
                        this.markAfterFillSignIn()
                    }
                })
                break;
            case constants.OPEN_REWARD_TYPE.SHARE:
                GameLogic.instance.share(constants.SHARE_FUNCTION.FILL_SIGN, {}, (err: any) => {
                    if (!err) {
                        this.markAfterFillSignIn()
                    }
                })
                break;
            case constants.OPEN_REWARD_TYPE.NULL:
                break;
        }
    }

}