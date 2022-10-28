import { _decorator, Component, Prefab, Node, UITransform, Vec3, instantiate, Animation } from 'cc';
import { AudioManager } from '../../frameworks/audioManager';
import { clientEvent } from '../../frameworks/clientEvent';
import { GameLogic } from '../../frameworks/gameLogic';
import { loadsh } from '../../frameworks/loadsh';
import { playerData } from '../../frameworks/playerData';
import { poolManager } from '../../frameworks/poolManager';
import { resourceUtil } from '../../frameworks/resourceUtil';
import { constants } from '../../shared/constants';
import { FightHandGuide } from './fightHandGuide';
import { LinkItem } from './linkItem';
import { LinkLine } from './linkLine';

const { ccclass, property } = _decorator;

let CELL_WIDTH = 80;
let CELL_HEIGHT = 80;
let ITEM_WIDTH = 60;
let ITEM_HEIGHT = 60;
@ccclass('LinkContent')
export class LinkContent extends Component {
    @property
    public pfCake: Prefab = null!;
    @property
    public pfLine: Prefab = null!;
    @property
    public nodeLineGroup: Node = null!;
    @property
    public nodeLinkOverEffect: Node = null!;
    @property
    public nodeLinkGroup: Node = null!;

    public lastOperationTime: any;
    public isShowHandGuide: any;
    public _fightScene: any;
    public dictCakes: any;
    public arrLinks: any;
    public arrLines: any;
    public levelInfo: any;
    public currentCake: any;
    public currentNode: any;
    public preNode: any;
    public clearScore: any;
    public clearCake: any;
    public cntTrigger: any;
    public allTriggerOverCb: any;
    public currentPropTouchNode: any;
    public isRefreshing: any;
    public arrConnected: any;
    public nodeHand: any;

    show(fightScene: any) {
        const uiTran = this.node.getComponent(UITransform)!;
        CELL_WIDTH = uiTran.width / 8;
        CELL_HEIGHT = uiTran.height / 8;
        ITEM_WIDTH = CELL_WIDTH - 25;
        ITEM_HEIGHT = CELL_HEIGHT - 25;
        this.lastOperationTime = 0;
        this.isShowHandGuide = false;
        this._fightScene = fightScene;
        this.dictCakes = {};
        this.arrLinks = [];
        this.arrLines = [];
        this.levelInfo = playerData.instance.getCurrentLevelInfo();
        this.initCake();
    }

    createCake(index: any, cake: any, isShowRightNow: any) {
        let nodeCake = poolManager.instance.getNode(this.pfCake, this.nodeLinkGroup);
        nodeCake.position = this.getScreenPosByIndex(index);
        nodeCake.opacity = 255;
        let linkItem = nodeCake.getComponent(LinkItem);
        linkItem.show(index, cake, isShowRightNow, this);
        this.dictCakes[index] = nodeCake;
        return nodeCake;
    }

    initCake(callback?: any) {
        let arrRandom = this.levelInfo.cakes.split('|');
        for (let idxRow = 0; idxRow < constants.LINK_ROWS_COUNT; idxRow++) {
            for (let idxCol = 0; idxCol < constants.LINK_COLS_COUNT; idxCol++) {
                let key = idxCol + idxRow * constants.LINK_COLS_COUNT;
                let randomCake = arrRandom[loadsh.random(0, arrRandom.length - 1)];
                this.createCake(key, randomCake, false);
            }
        }
        this.showAllLinkItem(true, () => {
            if (callback) {
                callback();
            }
            this.lastOperationTime = 0;
        });
    }

    showAllLinkItem(isShow: any, callback: any) {
        let times = constants.LINK_ROWS_COUNT + constants.LINK_ROWS_COUNT;
        for (let idx = 0; idx < times; idx++) {
            for (let idxCol = 0; idxCol < constants.LINK_COLS_COUNT; idxCol++) {
                if (idxCol > idx) {
                    break;
                }
                for (let idxRow = 0; idxRow < constants.LINK_ROWS_COUNT; idxRow++) {
                    if (idxRow > idx) {
                        break;
                    }
                    if (idxRow + idxCol === idx) {
                        let idxItem: any = this.getIndexByPos(idxCol, idxRow);
                        if (this.dictCakes.hasOwnProperty(idxItem)) {
                            if (isShow) {
                                this.dictCakes[idxItem].getComponent(LinkItem).playShowAction(0.05 * idx);
                            } else {
                                this.dictCakes[idxItem].getComponent(LinkItem).playHideAction(0.05 * idx, false);
                            }
                        }
                    }
                }
            }
        }
        if (callback) {
            this.scheduleOnce(callback, times * 0.05 + 0.5);
        }
    }

    onEnable() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    getCakeNodeByTouchPos(pos: Vec3) {
        let startPos = this.nodeLinkGroup.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0));
        let offsetPos = pos.clone().subtract(startPos);
        let col = Math.floor(offsetPos.x / CELL_WIDTH);
        let row = Math.floor(offsetPos.y / CELL_HEIGHT);
        let key = col + row * constants.LINK_COLS_COUNT;
        let ret = this.dictCakes[key];
        if (ret) {
            if (Math.abs(offsetPos.x - ret.x) > ITEM_WIDTH / 2 || Math.abs(offsetPos.y - ret.y) > ITEM_HEIGHT / 2) {
                ret = null; //已经点超出区域了
            }
        }
        return ret;
    }

    drawLine() {
        let idxLine = 0;
        if (this.arrLinks.length > 1) {
            let nodeStart = this.arrLinks[0];
            let linkItemStart = nodeStart.getComponent(LinkItem);
            let posLinkStart: any = this.getPosByIndex(linkItemStart.index);
            let posChildStart = new Vec3((posLinkStart.x + 1 / 2) * CELL_WIDTH, (posLinkStart.y + 1 / 2) * CELL_HEIGHT, 0);
            let arrLinesPoint = [];
            for (let idx = 1; idx < this.arrLinks.length; idx++) {
                let nodeEnd = this.arrLinks[idx];
                let linkItemEnd = nodeEnd.getComponent(LinkItem);
                let posLinkEnd: any = this.getPosByIndex(linkItemEnd.index);
                let posChildEnd = new Vec3((posLinkEnd.x + 1 / 2) * CELL_WIDTH, (posLinkEnd.y + 1 / 2) * CELL_HEIGHT, 0);
                arrLinesPoint.push({ 'start': posChildStart.clone(), 'end': posChildEnd.clone() });
                posChildStart = posChildEnd;
            }
            for (; idxLine < arrLinesPoint.length; idxLine++) {
                let objLine = arrLinesPoint[idxLine];
                let linkLine = null;
                let lineNode = null;
                if (idxLine < this.arrLines.length) {
                    lineNode = this.arrLines[idxLine];
                    linkLine = lineNode.getComponent(LinkLine);
                } else {
                    lineNode = poolManager.instance.getNode(this.pfLine, this.nodeLineGroup);
                    this.arrLines.push(lineNode);
                    linkLine = lineNode.getComponent(LinkLine);
                    linkLine.show();
                }
                lineNode.getComponent(LinkLine).setLinePosition(objLine.start, objLine.end);
            }
        }
        if (idxLine < this.arrLines.length) {
            for (let idxRemove = idxLine; idxRemove < this.arrLines.length; idxRemove++) {
                poolManager.instance.putNode(this.arrLines[idxRemove]);
            }
            this.arrLines.splice(idxLine, this.arrLines.length);
        }
    }

    clearLine() {
        for (let idx = 0; idx < this.arrLines.length; idx++) {
            poolManager.instance.putNode(this.arrLines[idx]);
        }
        this.arrLines = [];
    }

    hideDiffCake() {
        for (let index in this.dictCakes) {
            let node = this.dictCakes[index];
            if (node.getComponent(LinkItem).cake !== this.currentCake) {
                node.opacity = 50; //半透明？
            }
        }
    }

    showAllCake() {
        for (let index in this.dictCakes) {
            let node = this.dictCakes[index];
            node.opacity = 255;
        }
    }

    checkStep() {
    }

    onTouchStart(touchEvent: any) {
        if (!this._fightScene || this._fightScene.isLevelOver || !this._fightScene.isLevelStart) {
            this.currentNode = null;
            this.arrLinks = [];
            return;
        }
        let node = this.getCakeNodeByTouchPos(touchEvent.getUILocation());
        if (node) {
            this.stopGuideHand();
            this.arrLinks = [node];
            this.currentNode = node;
            let linkItem = this.currentNode.getComponent(LinkItem);
            this.currentCake = linkItem.cake;
            this.preNode = null;
            linkItem.showSelect(true);
            AudioManager.instance.playSound(constants.AUDIO_SOUND.CLICK_CAKE, false);
            this.drawLine();
            this.hideDiffCake();
        }
    }

    onTouchMove(touchEvent: any) {
        if (!this.currentNode) {
            return;
        }
        let node = this.getCakeNodeByTouchPos(touchEvent.getUILocation());
        if (node && node !== this.currentNode) {
            let linkItem = node.getComponent(LinkItem);
            if (this.currentCake === linkItem.cake) {
                if (this.preNode === node) {
                    let oldLinkItem = this.currentNode.getComponent(LinkItem);
                    oldLinkItem.showSelect(false);
                    if (oldLinkItem.isSpecial) {
                        oldLinkItem.showSpecial(false);
                    }
                    this.currentNode = this.preNode;
                    this.arrLinks.pop();
                    this.preNode = this.arrLinks[this.arrLinks.length - 2];
                    this.drawLine();
                    return;
                }
                if (this.arrLinks.indexOf(node) !== -1) {
                    return;
                }
                let posNode = this.getPosByIndex(linkItem.index);
                let currentItem = this.currentNode.getComponent(LinkItem);
                let posCurrent = this.getPosByIndex(currentItem.index);
                if (Math.abs(posNode.x - posCurrent.x) <= 1 && Math.abs(posNode.y - posCurrent.y) <= 1) {
                    this.preNode = this.currentNode;
                    this.currentNode = node;
                    this.arrLinks.push(node);
                    linkItem.showSelect(true);
                    AudioManager.instance.playSound(constants.AUDIO_SOUND.CLICK_CAKE, false);
                    let cntCurrent = this.arrLinks.length;
                    if (cntCurrent >= 6 && (cntCurrent === 6 || (cntCurrent - 6) % 4 === 0)) {
                        linkItem.showSpecial(true);
                    }
                    this.drawLine();
                }
            }
        }
    }

    onTouchEnded(touchEvent: any) {
        this.touchOver();
    }

    onTouchCancel(touchEvent: any) {
        this.touchOver();
    }

    getScreenPosByIndex(index: any) {
        let pos: any = this.getPosByIndex(index);
        return new Vec3((pos.x + 1 / 2) * CELL_WIDTH, (pos.y + 1 / 2) * CELL_HEIGHT, 0);
    }

    getPosByIndex(index: any) {
        return new Vec3(index % constants.LINK_COLS_COUNT, Math.floor(index / constants.LINK_COLS_COUNT), 0);
    }

    getIndexByPos(col: any, row: any) {
        return row * constants.LINK_COLS_COUNT + col;
    }

    touchOver() {
        if (!this.isShowHandGuide) {
            if (this.arrLinks.length >= 3) {
                AudioManager.instance.playSound(constants.AUDIO_SOUND.FINISH_LINK, false);
                this.clearLinks();
            } else {
                for (let idx = 0; idx < this.arrLinks.length; idx++) {
                    this.arrLinks[idx].getComponent(LinkItem).showSelect(false);
                }
                this.arrLinks = [];
                this.preNode = null;
            }
            this.currentNode = null;
            this.clearLine();
            this.showAllCake();
            this.checkStep();
        }
    }

    clearItemByEffect(trigger: any, effectType: any, isIncludeSelf: any, isPlus?: any) {
        let pos = this.getPosByIndex(trigger);
        switch (effectType) {
            case constants.SPECIAL_EFFECT.HORIZONTAL:
                this.clearScore += 500;
                if (!isPlus) {
                    AudioManager.instance.playSound(constants.AUDIO_SOUND.LINE_BOMB, false);
                }
                this._fightScene.effectGroup.showSkillLineEffect(this.getItemWorldPosByIndex(trigger), true);
                for (let idx = 0; idx < constants.LINK_COLS_COUNT; idx++) {
                    if (idx !== pos.x || isIncludeSelf) {
                        let index = this.getIndexByPos(idx, pos.y);
                        if (this.dictCakes.hasOwnProperty(index)) {
                            let linkItem = this.dictCakes[index].getComponent(LinkItem);
                            if (this.clearCake.hasOwnProperty(linkItem.cake)) {
                                this.clearCake[linkItem.cake] += 1;
                            } else {
                                this.clearCake[linkItem.cake] = 1;
                            }
                            linkItem.showDestory();
                            delete this.dictCakes[index];
                            if (linkItem.index !== trigger) {
                                if (linkItem.getEffect()) {
                                    this.clearItemByEffect(linkItem.index, linkItem.getEffect(), isIncludeSelf);
                                } else {
                                    this.clearScore += 50;
                                }
                            }
                        }
                    }
                }
                break;
            case constants.SPECIAL_EFFECT.VERTICAL:
                this.clearScore += 500;
                if (!isPlus) {
                    AudioManager.instance.playSound(constants.AUDIO_SOUND.LINE_BOMB, false);
                }
                this._fightScene.effectGroup.showSkillLineEffect(this.getItemWorldPosByIndex(trigger), false);
                for (let idx = 0; idx < constants.LINK_ROWS_COUNT; idx++) {
                    if (idx !== pos.y || isIncludeSelf) {
                        let index = this.getIndexByPos(pos.x, idx);
                        if (this.dictCakes.hasOwnProperty(index)) {
                            let linkItem = this.dictCakes[index].getComponent(LinkItem);
                            if (this.clearCake.hasOwnProperty(linkItem.cake)) {
                                this.clearCake[linkItem.cake] += 1;
                            } else {
                                this.clearCake[linkItem.cake] = 1;
                            }
                            linkItem.showDestory();
                            delete this.dictCakes[index];
                            if (linkItem.index !== trigger) {
                                if (linkItem.getEffect()) {
                                    this.clearItemByEffect(linkItem.index, linkItem.getEffect(), isIncludeSelf);
                                } else {
                                    this.clearScore += 50;
                                }
                            }
                        }
                    }
                }
                break;
            case constants.SPECIAL_EFFECT.PLUS:
                AudioManager.instance.playSound(constants.AUDIO_SOUND.PLUS_BOMB, false);
                this.clearItemByEffect(trigger, constants.SPECIAL_EFFECT.HORIZONTAL, isIncludeSelf, true);
                this.clearItemByEffect(trigger, constants.SPECIAL_EFFECT.VERTICAL, isIncludeSelf, true);
                break;
            case constants.SPECIAL_EFFECT.CENTER:
                this.clearScore += 1500;
                this._fightScene.effectGroup.showSkillRangeEffect(this.getItemWorldPosByIndex(trigger));
                for (let idxOffsetRow = -2; idxOffsetRow <= 2; idxOffsetRow++) {
                    for (let idxOffsetCol = -2; idxOffsetCol <= 2; idxOffsetCol++) {
                        if ((idxOffsetRow === 0 && idxOffsetCol === 0) && !isIncludeSelf) {
                            continue;
                        }
                        let posNew = new Vec3(pos.x + idxOffsetRow, pos.y + idxOffsetCol, 0);
                        if (posNew.x < 0 || posNew.x > constants.LINK_COLS_COUNT || posNew.y < 0 || posNew.y > constants.LINK_ROWS_COUNT) {
                            continue;
                        }
                        if (Math.abs(posNew.x - pos.x) + Math.abs(posNew.y - pos.y) <= 2) {
                            let index = this.getIndexByPos(posNew.x, posNew.y);
                            if (this.dictCakes.hasOwnProperty(index)) {
                                let linkItem = this.dictCakes[index].getComponent(LinkItem);
                                if (this.clearCake.hasOwnProperty(linkItem.cake)) {
                                    this.clearCake[linkItem.cake] += 1;
                                } else {
                                    this.clearCake[linkItem.cake] = 1;
                                }
                                linkItem.showDestory();
                                delete this.dictCakes[index];
                                if (linkItem.index !== trigger) {
                                    if (linkItem.getEffect()) {
                                        this.clearItemByEffect(linkItem.index, linkItem.getEffect(), isIncludeSelf);
                                    } else {
                                        this.clearScore += 50;
                                    }
                                }
                            }
                        }
                    }
                }
                break;
        }
    }

    clearLinks() {
        let dictGenerator: any = {};
        let dictEffect: any = {};
        this.clearScore = 0;
        for (let idx = 0; idx < this.arrLinks.length; idx++) {
            let linkItem = this.arrLinks[idx].getComponent(LinkItem);
            let effect = linkItem.getEffect();
            if (effect) {
                dictEffect[linkItem.index] = effect;
            }
            if (linkItem.isSpecial) {
                let effect = null;
                if (idx === 5) {
                    let random = loadsh.random(0, 1);
                    effect = random ? constants.SPECIAL_EFFECT.HORIZONTAL : constants.SPECIAL_EFFECT.VERTICAL;
                    this.clearScore += 1000;
                } else {
                    let offset = idx - 5;
                    let offsetSpare = (offset / 4) % 2;
                    effect = offsetSpare ? constants.SPECIAL_EFFECT.PLUS : constants.SPECIAL_EFFECT.CENTER;
                    if (effect === constants.SPECIAL_EFFECT.PLUS) {
                        this.clearScore += 2000;
                    } else {
                        this.clearScore += 3000;
                    }
                }
                linkItem.setSpecialType(effect);
                dictGenerator[linkItem.index] = effect;
            } else if (!effect) {
                this.clearScore += 50;
            }
            linkItem.showDestory();
            delete this.dictCakes[linkItem.index];
        }
        this.clearCake = {};
        for (let trigger in dictEffect) {
            this.clearItemByEffect(trigger, dictEffect[trigger], false);
        }
        playerData.instance.addScore(this.clearScore);
        let cntLink = this.arrLinks.length;
        GameLogic.instance.finishLink(this.currentCake, cntLink);
        let sound = null;
        if (cntLink >= 22) {
            sound = constants.AUDIO_SOUND.UNBELIEVABLE;
        } else if (cntLink >= 18) {
            sound = constants.AUDIO_SOUND.AMAZING; constants.LINK_COLS_COUNT
        } else if (cntLink >= 14) {
            sound = constants.AUDIO_SOUND.EXCELLENT;
        } else if (cntLink >= 10) {
            sound = constants.AUDIO_SOUND.GREAT;
        } else if (cntLink >= 6) {
            sound = constants.AUDIO_SOUND.GOOD;
        }
        if (sound) {
            AudioManager.instance.playSound(sound, false);
        }
        this.finishTargetsBatch();
        this.arrLinks = [];
        if (Object.keys(dictGenerator).length > 0) {
            this.scheduleOnce(() => {
                this._fightScene.showFlyEffect(dictGenerator, () => {
                    GameLogic.instance.checkGame();
                });
            }, 0.1);
        } else {
            GameLogic.instance.checkGame();
        }
        this.scheduleOnce(this.fillEmptyCell, 0.3);
    }

    /**
     * 填补空缺的位置
     */
    fillEmptyCell() {
        for (let idxCol = 0; idxCol < constants.LINK_COLS_COUNT; idxCol++) {
            let emptyRow = -1;
            for (let idxRow = 0; idxRow < constants.LINK_ROWS_COUNT; idxRow++) {
                let index = idxRow * constants.LINK_COLS_COUNT + idxCol;
                if (!this.dictCakes.hasOwnProperty(index)) {
                    if (emptyRow === -1) {
                        emptyRow = idxRow;
                    }
                } else if (emptyRow !== -1) {
                    let emptyIndex = emptyRow * constants.LINK_COLS_COUNT + idxCol;
                    this.dictCakes[emptyIndex] = this.dictCakes[index];
                    let linkItem = this.dictCakes[emptyIndex].getComponent(LinkItem);
                    linkItem.index = emptyIndex;
                    linkItem.playMove2Index(emptyIndex);
                    delete this.dictCakes[index];
                    emptyRow = emptyRow + 1; //往上移动一层
                }
            }
            if (emptyRow !== -1) {
                let arrRandom = this.levelInfo.cakes.split('|');
                for (let idxRow = emptyRow; idxRow < constants.LINK_ROWS_COUNT; idxRow++) {
                    let index = idxRow * constants.LINK_COLS_COUNT + idxCol;
                    let showIndex = (constants.LINK_ROWS_COUNT + idxRow - emptyRow) * constants.LINK_COLS_COUNT + idxCol;
                    let randomCake = arrRandom[loadsh.random(0, arrRandom.length - 1)];
                    this.createCakeForFill(index, randomCake, showIndex);
                }
            }
        }
        this.scheduleOnce(() => {
            this.checkIsBlocked();
        }, 0.2);
    }

    createCakeForFill(index: any, cake: any, showIndex: any) {
        let nodeCake = poolManager.instance.getNode(this.pfCake, this.nodeLinkGroup);
        nodeCake.position = this.getScreenPosByIndex(showIndex);
        nodeCake.opacity = 255;
        let linkItem = nodeCake.getComponent(LinkItem);
        linkItem.show(index, cake, true, this);
        linkItem.playMove2Index(index);
        this.dictCakes[index] = nodeCake;
        return nodeCake;
    }

    getItemWorldPosByIndex(index: any) {
        let screenPos = this.getScreenPosByIndex(index);

        return this.nodeLinkGroup.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(screenPos.x, screenPos.y, 0));
    }

    getNoEffectLinkItemIndex() {
        let idx = 0;
        while (1) {
            let random = loadsh.random(0, (constants.LINK_ROWS_COUNT * constants.LINK_COLS_COUNT) - 1);
            if (this.dictCakes.hasOwnProperty(random)) {
                let node = this.dictCakes[random];
                let linkItem = node.getComponent(LinkItem);
                if (!linkItem.isSpecial && !linkItem.getEffect()) {
                    return linkItem.index;
                }
            }
            idx++;
            if (idx > 30) { //避免无限循环出现卡住的问题
                return null;
            }
        }
    }

    markLinkItemEffect(index: any, effect: any) {
        if (this.dictCakes.hasOwnProperty(index)) {
            this.dictCakes[index].getComponent(LinkItem).markEffect(effect);
        }
    }

    addEffect(index: any, effect: any) {
        if (this.dictCakes.hasOwnProperty(index)) {
            this.dictCakes[index].getComponent(LinkItem).showEffect(effect);
        }
    }

    delayClearItem(delayIdx: any, index: any, effect: any) {
        this.scheduleOnce(() => {
            this.cntTrigger--;
            if (this.dictCakes.hasOwnProperty(index)) {
                this.clearScore = 0;
                this.clearCake = {};
                this.clearItemByEffect(index, effect, true);
                playerData.instance.addScore(this.clearScore);
                this.finishTargetsBatch();
            }
            if (this.cntTrigger <= 0 && this.allTriggerOverCb) {
                this.allTriggerOverCb();
            }
        }, delayIdx * 0.2);
    }

    triggerAllSpecialEffect(callback: any) {
        let idx = 0;
        for (let idxRow = 0; idxRow < constants.LINK_ROWS_COUNT; idxRow++) {
            for (let idxCol = 0; idxCol < constants.LINK_COLS_COUNT; idxCol++) {
                let index = this.getIndexByPos(idxCol, idxRow);
                if (this.dictCakes.hasOwnProperty(index)) {
                    let linkItem = this.dictCakes[index].getComponent(LinkItem);
                    if (linkItem && linkItem.getEffect()) {
                        this.delayClearItem(idx, index, linkItem.getEffect());
                        idx++;
                    }
                }
            }
        }
        this.cntTrigger = idx;
        this.allTriggerOverCb = callback;
        if (this.cntTrigger <= 0 && this.allTriggerOverCb) {
            this.allTriggerOverCb();
        }
    }

    finishTargetsBatch() {
        for (let cake in this.clearCake) {
            playerData.instance.finishTarget(cake, this.clearCake[cake]);
            clientEvent.dispatchEvent('updateTargets', cake);
        }
        clientEvent.dispatchEvent('updateStep');
    }

    showLinkFinishEffect(callback: any) {
        resourceUtil.createEffect('fight/frame/frame', (err: any, effect: any) => {
            if (err) {
                if (callback) {
                    callback(err);
                }
                return;
            }
            let ani = effect.getComponent(Animation);
            ani.play('frame');
            ani.once(Animation.EventType.FINISHED, () => {
                effect && effect.destroy();
                if (callback) {
                    callback(null);
                }
            }, this);
        }, this.nodeLinkOverEffect);
    }

    checkIsBlocked() {
        for (let idxRow = 0; idxRow < constants.LINK_ROWS_COUNT; idxRow++) {
            for (let idxCol = 0; idxCol < constants.LINK_COLS_COUNT; idxCol++) {
                let index = this.getIndexByPos(idxCol, idxRow);
                if (this.dictCakes.hasOwnProperty(index)) {
                    let linkItem = this.dictCakes[index].getComponent(LinkItem);
                    if (linkItem) {
                        let ret = this.checkItemChannelIsClear(index, linkItem.cake);
                        if (ret) {
                            return;
                        }
                    }
                }
            }
        }
        this.refreshLinkItems();
    }

    checkItemChannelIsClear(index: any, cake: any, posOld?: any) {
        let pos = this.getPosByIndex(index);
        let idxClear = 0;
        for (let row = pos.y - 1; row <= pos.y + 1; row++) {
            for (let col = pos.x - 1; col <= pos.x + 1; col++) {
                if (row < 0 || col < 0 || row >= constants.LINK_ROWS_COUNT || col >= constants.LINK_COLS_COUNT) {
                    continue;
                }
                if (row !== pos.y || col !== pos.x) {
                    if (posOld && posOld.x === col && posOld.y === row) {
                        continue;
                    }
                    let idxItem = this.getIndexByPos(col, row);
                    if (this.dictCakes.hasOwnProperty(idxItem)) {
                        let linkItem = this.dictCakes[idxItem].getComponent(LinkItem);
                        if (linkItem && linkItem.cake === cake) {
                            if (posOld) {
                                return true;
                            } else {
                                let isClear = this.checkItemChannelIsClear(idxItem, cake, pos);
                                if (isClear) {
                                    return true;
                                }
                                idxClear++;
                                if (idxClear >= 2) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    onPropTouchStart(touchEvent: any) {
        let node = this.getCakeNodeByTouchPos(touchEvent.getUILocation());
        if (node) {
            node.setScale(0.9, 0.9, 0.9);
        }
        this.currentPropTouchNode = node;
    }

    onPropTouchEnd(touchEvent: any) {
        if (!this.currentPropTouchNode) {
            return -1;
        }
        this.currentPropTouchNode.setScale(1, 1, 1);
        let node = this.getCakeNodeByTouchPos(touchEvent.getUILocation());
        if (node === this.currentPropTouchNode) {
            let linkItem = node.getComponent(LinkItem);
            return linkItem.index;
        }
        this.currentPropTouchNode = null;
        return -1;
    }

    onPropTouchCancel(touchEvent: any) {
        if (this.currentPropTouchNode) {
            this.currentPropTouchNode.setScale(1, 1, 1);
            this.currentPropTouchNode = null;
        }
        return -1;
    }

    refreshLinkItems() {
        if (this.isRefreshing) {
            return false;
        }
        this.isRefreshing = true;
        this.showAllLinkItem(false, () => {
            this.initCake(() => {
                this.isRefreshing = false;
            });
        });
        return true;
    }

    destoryCake(targetId: any) {
        if (this.dictCakes.hasOwnProperty(targetId)) {
            let nodeItem = this.dictCakes[targetId];
            let linkItem = nodeItem.getComponent(LinkItem);
            linkItem.showDestory();
            delete this.dictCakes[targetId];
            this.clearScore = 0;
            this.clearCake = {};
            this.clearCake[linkItem.cake] = 1;
            if (linkItem.getEffect()) {
                this.clearItemByEffect(targetId, linkItem.getEffect(), false);
            } else {
                this.clearScore = 50;
            }
            playerData.instance.addScore(this.clearScore); //默认加50
            this.finishTargetsBatch();
            GameLogic.instance.checkGame();
            this.scheduleOnce(this.fillEmptyCell, 0.3);
        }
    }

    getConnectCake(index: any, cake: any, posOld?: any) {
        let pos = this.getPosByIndex(index);
        for (let row = pos.y - 1; row <= pos.y + 1; row++) {
            for (let col = pos.x - 1; col <= pos.x + 1; col++) {
                if (row < 0 || col < 0 || row >= constants.LINK_ROWS_COUNT || col >= constants.LINK_COLS_COUNT) {
                    continue;
                }
                if (row !== pos.y || col !== pos.x) {
                    if (posOld && posOld.x === col && posOld.y === row) {
                        continue;
                    }
                    let idxItem = this.getIndexByPos(col, row);
                    if (this.dictCakes.hasOwnProperty(idxItem)) {
                        let linkItem = this.dictCakes[idxItem].getComponent(LinkItem);
                        if (linkItem && linkItem.cake === cake) {
                            if (posOld) {
                                this.arrConnected.push(idxItem);
                                return true;
                            } else {
                                let len = this.arrConnected.length;
                                let isClear = this.getConnectCake(idxItem, cake, pos);
                                if (isClear) {
                                    this.arrConnected.splice(len, 0, idxItem);
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    getConnectCakeByIndex(idx: any, arrTarget: any) {
        this.arrConnected = [];
        if (this.dictCakes.hasOwnProperty(idx)) {
            this.arrConnected.push(idx);
            let linkItem = this.dictCakes[idx].getComponent(LinkItem);
            if (linkItem) {
                if (arrTarget) {
                    if (arrTarget.indexOf(linkItem.cake) !== -1) {
                        this.getConnectCake(idx, linkItem.cake);
                        if (this.arrConnected.length >= 3) {
                            return true;
                        }
                    }
                } else {
                    this.getConnectCake(idx, linkItem.cake);
                    if (this.arrConnected.length >= 3) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    findConnectPathForGuide(isFindTarget: any) {
        let arrTarget = null;
        if (isFindTarget) {
            arrTarget = [];
            for (var target in playerData.instance.dictTargets) {
                if (playerData.instance.dictTargets[target]) {
                    arrTarget.push(target);
                }
            }
        }
        let max = constants.LINK_ROWS_COUNT * constants.LINK_COLS_COUNT;
        let half = max / 2 + constants.LINK_COLS_COUNT / 2;
        let halfLeft = half - 1;
        let halfRight = half;
        let isFind = false;
        while (!isFind && (halfRight < max || halfLeft >= 0)) {
            this.arrConnected = [];
            if (halfRight < max) {
                let isFind = this.getConnectCakeByIndex(halfRight, arrTarget);
                if (isFind) {
                    return true;
                }
            }
            if (halfLeft > 0) {
                isFind = this.getConnectCakeByIndex(halfLeft, arrTarget);
                if (isFind) {
                    return true;
                }
            }
            halfRight++;
            halfLeft--;
        }
        return false;
    }

    showGuideLine(index: any) {
        this.arrLinks = [];
        for (let idx = 0; idx <= index; idx++) {
            let cake = this.dictCakes[this.arrConnected[idx]];
            if (cake) {
                this.arrLinks.push(cake);
            }
        }
        this.drawLine();
    }

    showGuideHand() {
        this.isShowHandGuide = true;
        let isFind = this.findConnectPathForGuide(true);
        if (!isFind) {
            isFind = this.findConnectPathForGuide(false);
        }
        if (isFind) {
            let arrPath: any = [];
            for (let idx = 0; idx < this.arrConnected.length; idx++) {
                arrPath.push(this.getScreenPosByIndex(this.arrConnected[idx]));
                let linkItem = this.dictCakes[this.arrConnected[idx]].getComponent(LinkItem);
                linkItem.showSelect(true);
            }
            if (!this.nodeHand) {
                resourceUtil.loadRes('prefab/fight/fightHandGuide', Prefab, (err: any, prefab: any) => {
                    let node = instantiate(prefab);
                    node.parent = this.node;
                    this.nodeHand = node;
                    this.nodeHand.getComponent(FightHandGuide).showGuide(arrPath, (index: any) => {
                        this.showGuideLine(index);
                    });
                });
            } else {
                this.nodeHand.active = true;
                this.nodeHand.getComponent(FightHandGuide).showGuide(arrPath, (index: any) => {
                    this.showGuideLine(index);
                });
            }
        }
    }

    stopGuideHand() {
        this.isShowHandGuide = false;
        this.lastOperationTime = 0;
        if (this.arrConnected && this.dictCakes) {
            for (let idx = 0; idx < this.arrConnected.length; idx++) {
                let nodeItem = this.dictCakes[this.arrConnected[idx]];
                if (nodeItem) {
                    let linkItem = nodeItem.getComponent(LinkItem);
                    linkItem.showSelect(false);
                }
            }
        }
        if (this.nodeHand) {
            this.nodeHand.destroy();
            this.nodeHand = null;
        }
        this.arrLinks = [];
        this.drawLine();
    }

    update(dt: any) {
        if (this._fightScene.isLevelOver || !this._fightScene.isLevelStart || this.isShowHandGuide || this.currentNode || this._fightScene.isShowOperationUI) {
            return;
        }
        this.lastOperationTime += dt;
        if (this.lastOperationTime > 5) {
            this.showGuideHand();
            this.lastOperationTime = 0;
        }
    }

}