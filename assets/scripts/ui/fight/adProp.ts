import { _decorator, Component, SpriteFrame, Node, Sprite } from 'cc';
import { constants } from '../../shared/constants';
import { GameLogic } from '../../frameworks/gameLogic';
import { uiManager } from '../../frameworks/uiManager';
const { ccclass, property } = _decorator;

@ccclass('AdProp')
export class AdProp extends Component {
    @property
    public imgAd: SpriteFrame = null!;
    @property
    public imgShare: SpriteFrame = null!;
    @property
    public ndBtnGoStart: Node = null!;
    @property
    public spBtn: Sprite = null!;

    public callback: any
    public rewardType: any

    show(callback: any) {
        this.callback = callback;
        this.rewardType = constants.OPEN_REWARD_TYPE.AD;
        GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.START_REWARD, (err: any, type: any) => {
            if (!err) {
                this.rewardType = type;
                switch (type) {
                    case constants.OPEN_REWARD_TYPE.AD:
                        this.spBtn.spriteFrame = this.imgAd;
                        break;
                    case constants.OPEN_REWARD_TYPE.SHARE:
                        this.spBtn.spriteFrame = this.imgShare;
                        break;
                    case constants.OPEN_REWARD_TYPE.NULL:
                        this.onBtnCloseClick(); //不支持奖励
                        break;
                }
            }
        });
        this.ndBtnGoStart.active = false;
        this.scheduleOnce(() => {
            this.ndBtnGoStart.active = true;
        }, constants.NORMAL_SHOW_TIME);
    }

    onBtnCloseClick() {
        if (this.callback) {
            this.callback('close');
        }
        this.close();
    }

    onBtnPlayClick() {
        if (this.rewardType === constants.OPEN_REWARD_TYPE.AD) {
            GameLogic.instance.showRewardAd((err: any) => {
                if (!err) {
                    this.close();
                    if (this.callback) {
                        this.callback(null);
                    }
                } else {
                    if (this.callback) {
                        this.callback('failed', err);
                    }
                }
            });
        } else {
            GameLogic.instance.share(constants.SHARE_FUNCTION.START_REWARD, {}, (err: any) => {
                if (!err) {
                    this.close();
                }
                if (this.callback) {
                    this.callback(err);
                }
            });
        }
    }

    close() {
        uiManager.instance.hideDialog('fight/adProp');
    }

}