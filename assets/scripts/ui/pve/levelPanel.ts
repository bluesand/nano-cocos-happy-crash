import { _decorator, Component, Node, Label, Prefab, instantiate } from 'cc';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { localConfig } from '../../frameworks/localConfig';
import { playerData } from '../../frameworks/playerData';
import { uiManager } from '../../frameworks/uiManager';
import { constants } from '../../shared/constants';
import { utils } from '../../shared/utils';
import { PropItem } from './propItem';
import { TargetCake } from './targetCake';
const { ccclass, property } = _decorator;

@ccclass('LevelPanel')
export class LevelPanel extends Component {
    @property
    public arrStarList: Array<Node> = [];
    @property
    public lbHighScore: Label = null!;
    @property
    public lbLevelNum: Label = null!;
    @property
    public pbPropItem: Prefab = null!;
    @property
    public pbTargetCake: Prefab = null!;
    @property
    public ndStartList: Node = null!;
    @property
    public ndPropList: Node = null!;
    @property
    public ndCakeList: Node = null!;

    public levelInfo: any;
    public callback: any;

    show(levelInfo: any, callback: any) {
        this.levelInfo = levelInfo;
        this.callback = callback;
        this.lbLevelNum.string = levelInfo.name;
        this.lbHighScore.string = i18n.t('pve.highest') + " " + playerData.instance.getHighestScoreByLevel(levelInfo.name);
        let arrCake = levelInfo.targets.split("|");
        let arrCakeList = this.ndCakeList.children;
        if (this.ndCakeList.children.length > arrCake.length) {
            for (let j = arrCake.length; j < this.ndCakeList.children.length; j++) {
                this.ndCakeList.children[j].active = false;
            }
        }
        for (let i = 0; i < arrCake.length; i++) {
            let cakeInfo = arrCake[i];
            let node = null;
            if (i < arrCakeList.length) {
                node = arrCakeList[i];
            } else {
                node = instantiate(this.pbTargetCake);
                node.parent = this.ndCakeList;
            }
            node.active = true;
            let targetCakeScript = node.getComponent(TargetCake)!;
            targetCakeScript.setInfo(cakeInfo);
        }
        let dictProp = localConfig.instance.getTable('prop');
        let arrProp = utils.objectToArray(dictProp);
        let arrPropList = this.ndPropList.children;
        for (let j = 0; j < arrProp.length; j++) {
            let ndProp = null;
            let propInfo = arrProp[j];
            if (j < arrPropList.length) {
                ndProp = arrPropList[j];
            } else {
                ndProp = instantiate(this.pbPropItem);
                ndProp.parent = this.ndPropList;
            }

            let propItemScript = ndProp.getComponent(PropItem)!;
            propItemScript.setInfo(propInfo);
        }
        let history = playerData.instance.history;
        if (history[this.levelInfo.ID]) {
            let starNum = history[this.levelInfo.ID].star;
            for (let k = 0; k < constants.MAX_GRADE_OF_EACH_PVE_LEVEL; k++) {
                if (k < starNum) {
                    this.arrStarList[k].active = true;
                } else {
                    this.arrStarList[k].active = false;
                }
            }
        } else {
            this.arrStarList.forEach(element => {
                element.active = false;
            });
        }
    }

    onBtnStartClick() {
        this.callback();
    }

    onBtnCloseClick() {
        uiManager.instance.hideDialog('pve/levelPanel');
    }

}