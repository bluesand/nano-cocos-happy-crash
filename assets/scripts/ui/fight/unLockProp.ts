import { _decorator, Component, Label, Sprite, SpriteFrame, Node } from 'cc';
import { playerData } from '../../frameworks/playerData';
import { clientEvent } from '../../frameworks/clientEvent';
import { constants } from '../../shared/constants';
import { GameLogic } from '../../frameworks/gameLogic';
import { uiManager } from '../../frameworks/uiManager';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { localConfig } from '../../frameworks/localConfig';
const { ccclass, property } = _decorator;

@ccclass('UnLockProp')
export class UnLockProp extends Component {
    @property
    public lbNum: Label = null!;
    @property
    public lbName: Label = null!;
    @property
    public spIcon: Sprite = null!;
    @property
    public spBtnReceive: Sprite = null!;
    @property
    public sfReceive: SpriteFrame = null!;
    @property
    public sfAd: SpriteFrame = null!;
    @property
    public sfShare: SpriteFrame = null!;
    @property
    public ndBtnGoStart: Node = null!;

    public _fightUI: any;
    public callback: any;
    public level: any;
    public unLoclProp: any;
    public propItem: any;
    public openRewardType: any;

    show(callback: any, fightUI: any) {
        this._fightUI = fightUI;
        this.callback = callback;
        this.level = playerData.instance.getCurrentLevelInfo().ID;
        this.unLoclProp = constants.UNLOCK_PROP_ID[this.level - 2];
        this.propItem = localConfig.instance.queryByID('prop', this.unLoclProp);
        GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.FIGHT, (err: any, type: any) => {
            if (!err) {
                this.openRewardType = type;
                switch (type) {
                    case constants.OPEN_REWARD_TYPE.AD:
                        this.spBtnReceive.spriteFrame = this.sfAd;
                        break;
                    case constants.OPEN_REWARD_TYPE.SHARE:
                        this.spBtnReceive.spriteFrame = this.sfShare;
                        break;
                    case constants.OPEN_REWARD_TYPE.NULL:
                        this.spBtnReceive.spriteFrame = this.sfReceive;
                        break;
                }
            } else {
                this.close();
            }
        })
        this.ndBtnGoStart.active = false;
        this.scheduleOnce(() => {
            this.ndBtnGoStart.active = true;
        }, constants.NORMAL_SHOW_TIME);
        this.init();
    }

    init() {
        this.lbNum.string = (1).toString();
        this.lbName.string = this.propItem.name;
        resourceUtil.setPropIcon(this.propItem.icon, this.spIcon, () => { });
    }

    onBtnReceiveClick() {
        switch (this.openRewardType) {
            case constants.OPEN_REWARD_TYPE.AD:
                GameLogic.instance.showRewardAd((err: any) => {
                    if (!err) {
                        this.showUnlockProp();
                        GameLogic.instance.addProp(this.propItem.ID, 1);
                    }
                })
                break;
            case constants.OPEN_REWARD_TYPE.SHARE:
                GameLogic.instance.share(constants.SHARE_FUNCTION.FIGHT, {}, (err: any) => {
                    if (!err) {
                        this.showUnlockProp();
                        GameLogic.instance.addProp(this.propItem.ID, 1);
                    }
                })
                break;
            case constants.OPEN_REWARD_TYPE.NULL:
                this.showUnlockProp();
                GameLogic.instance.addProp(this.propItem.ID, 1);
                break;
        }
    }

    showUnlockProp() {
        this.close();
        this._fightUI.showUnlockProp(this.propItem.ID, () => {
            playerData.instance.updateUnLockInfo(this.propItem.ID);
            clientEvent.dispatchEvent('updateUnlockProp');
            this.callback();
        });
    }

    onBtnCloseClick() {
        this.close();
        this.showUnlockProp();
    }

    close() {
        uiManager.instance.hideDialog('fight/unLockProp');
    }

}