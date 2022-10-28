import { _decorator, Component, Node, Prefab, SpriteFrame, Sprite, instantiate } from 'cc';
import { GameLogic } from '../../frameworks/gameLogic';
import { playerData } from '../../frameworks/playerData';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { AdStepItem } from './adStepItem';

const { ccclass, property } = _decorator;

@ccclass('AdStep')
export class AdStep extends Component {
    @property
    public ndContent: Node = null!;
    @property
    public pbAdStepItem: Prefab = null!;
    @property
    public imgAd: SpriteFrame = null!;
    @property
    public imgShare: SpriteFrame = null!;
    @property
    public spBtn: Sprite = null!;
    @property
    public ndBtnPlayAgain: Node = null!;

    public callback: any;
    public rewardType: any;

    show(callback: any) {
        this.callback = callback;
        GameLogic.instance.getOpenRewardType(constants.SHARE_FUNCTION.LACK_STEP, (err: any, type: any) => {
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
        let dictTargets = playerData.instance.dictTargets;
        this.ndContent.removeAllChildren();
        for (let key in dictTargets) {
            let cakeInfo = { name: key, num: dictTargets[key] };
            let node = instantiate(this.pbAdStepItem);
            node.parent = this.ndContent;
            let adStepItemScript = node.getComponent(AdStepItem)!;
            adStepItemScript.setInfo(cakeInfo);
        }
        this.ndBtnPlayAgain.active = false;
        this.scheduleOnce(() => {
            this.ndBtnPlayAgain.active = true;
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
                }
            });
        } else {
            GameLogic.instance.share(constants.SHARE_FUNCTION.START_REWARD, {}, (err: any) => {
                if (!err) {
                    this.close();
                    if (this.callback) {
                        this.callback(err);
                    }
                }
            });
        }
    }

    close() {
        uiManager.instance.hideDialog('fight/adStep');
    }

    onBtnPlayAgain() {
        this.close();
        GameLogic.instance.resetLevel();
    }

}