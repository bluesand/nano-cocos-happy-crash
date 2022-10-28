import { _decorator, Component, Node, Label, Animation, Sprite, find } from 'cc';
import { playerData } from '../../frameworks/playerData';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { constants } from '../../shared/constants';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { uiManager } from '../../frameworks/uiManager';
import { SceneManager } from '../loading/sceneManager';

const { ccclass, property } = _decorator;

@ccclass('LevelUI')
export class LevelUI extends Component {
    @property(Node)
    public nStars: Node = null!;
    @property(Node)
    public nCurrentLevel: Node = null!;
    @property(Node)
    public nLevelNotPassed: Node = null!;
    @property(Node)
    public nLevelPassed: Node = null!;
    @property(Label)
    public lbLevel: Label = null!;
    @property(Animation)
    public aniTips: Animation = null!;
    @property(Sprite)
    public spAvatar: Sprite = null!;
    @property(Node)
    public arrStarNode: Array<Node> = [];

    public levelInfo: any;

    public updateInterval: any;
    public lastPositionY: any;
    public pool: any;
    public pool1: any;

    onLoad() {
        this.aniTips.once(Animation.EventType.FINISHED, this.onAniTipsFinished, this);
    }

    onDisable() {
        this.aniTips.once(Animation.EventType.FINISHED, this.onAniTipsFinished, this);
    }

    onAniTipsFinished() {
        this.aniTips.play('pveLevelTipsIdle');
    }

    init(levelInfo: any) {
        this.levelInfo = levelInfo;
        this.setLevelNum(levelInfo.name);
        this.setLevelStatus(levelInfo.status);
        this.setStars(levelInfo.star);
        if (playerData.instance.playerInfo.avatarUrl) {
            resourceUtil.setAvatar(playerData.instance.playerInfo.avatarUrl, this.spAvatar, () => { });
        }
    }

    setLevelNum(number: any) {
        this.lbLevel.string = number;
    }

    setLevelStatus(status: any) {
        if (status === constants.PVE_LEVEL_STATUS.DONE) {
            this.nCurrentLevel.active = false;
            this.nLevelNotPassed.active = false;
            this.nLevelPassed.active = true;
        } else if (status === constants.PVE_LEVEL_STATUS.DOING) {
            this.nCurrentLevel.active = true;
            this.nLevelNotPassed.active = false;
            this.nLevelPassed.active = false;
        } else {
            this.nCurrentLevel.active = false;
            this.nLevelNotPassed.active = true;
            this.nLevelPassed.active = false;
        }
    }

    setStars(stars: any) {
        if (!stars) {
            this.nStars.active = false;
            return;
        }
        this.nStars.active = true;
        for (let i = 0; i < constants.MAX_GRADE_OF_EACH_PVE_LEVEL; i++) {
            let acheived = false;
            if (i <= stars - 1) {
                acheived = true;
            }
            this.arrStarNode[i].active = acheived;
        }
    }

    onBtnLevelChallenge() {
        if (this.levelInfo.status === constants.PVE_LEVEL_STATUS.UNDONE) {
            uiManager.instance.showTips(i18n.t('pve.cannotSkipLastLevel'));
            return;
        }
        uiManager.instance.showDialog('pve/levelPanel', [this.levelInfo, this.levelCallback]);
    }

    levelCallback() {
        // let timeStamp = Date.now();
        try {
            playerData.instance.level = this.levelInfo.ID;
            SceneManager.instance.loadScene('fight', [
                function (cb: any) {
                    cb();
                }
            ], (err: any, result: any) => {
                if (err) {
                    console.error(err.message || err);
                    return;
                }
            });
        } catch (error) {
            console.log("levelCallback.error", error);
        }
    }

}