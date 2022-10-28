import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Vec3, UITransform } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { FightProp } from './fightProp';
import { uiManager } from '../../frameworks/uiManager';
import { resourceUtil } from '../../frameworks/resourceUtil';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('FightPropsOperation')
export class FightPropsOperation extends Component {
    @property
    public nodeMask: Node = null!;
    @property
    public nodeTouch: Node = null!;
    @property
    public nodeBg: Node = null!;
    @property
    public nodeProp: Node = null!;
    @property
    public lbTips: Label = null!;
    @property
    public lbName: Label = null!;
    @property
    public spProp: Sprite = null!;
    @property
    public arrSfTip: Array<SpriteFrame> = [];

    public propId: any;
    public closeCallback: any;
    public _fightScene: any;

    onEnable() {
        this.nodeTouch.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.nodeTouch.on(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.nodeTouch.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onDisable() {
        this.nodeTouch.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.nodeTouch.off(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.nodeTouch.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    show(propInfo: any, propWorldPos: any, linkRect: any, fightScene: any, closeCallback: any) {
        this.propId = propInfo.ID;
        resourceUtil.setPropIcon(propInfo.icon, this.spProp, () => { });
        let propPos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(propWorldPos);
        this.closeCallback = closeCallback;
        this.nodeProp.position = propPos;
        this.nodeProp.getComponent(FightProp)!.show(propInfo);
        this.lbTips.string = i18n.t('table_prop.' + propInfo.desc);
        this.lbName.string = i18n.t('table_prop.' + propInfo.name);
        this._fightScene = fightScene;
        this.nodeMask.position = new Vec3(linkRect.x + linkRect.width / 2, linkRect.y + linkRect.height / 2, 0);
        this.nodeTouch.position = this.nodeMask.position;
        const uiTraMask = this.nodeMask.getComponent(UITransform)!;
        uiTraMask.width = linkRect.width;
        uiTraMask.height = linkRect.height;
        const uiTraTouch = this.nodeTouch.getComponent(UITransform)!;
        uiTraTouch.width = linkRect.width;
        uiTraTouch.height = linkRect.height;
        this.scheduleOnce(() => {
            const uiTraSelf = this.node.getComponent(UITransform)!;
            const uiTraBg = this.nodeBg.getComponent(UITransform)!;
            uiTraBg.width = uiTraSelf.width;
            uiTraBg.height = uiTraSelf.height;
            this.nodeBg.position = new Vec3(-this.nodeMask.position.x, -this.nodeMask.position.y, 0);
        }, 0.1);
    }

    onTouchStart(touchEvent: any) {
        this._fightScene.linkContent.onPropTouchStart(touchEvent);
    }

    onTouchEnded(touchEvent: any) {
        let idxTouch = this._fightScene.linkContent.onPropTouchEnd(touchEvent);
        if (idxTouch !== -1) {
           clientEvent.dispatchEvent('useProp', this.propId, idxTouch);
           this.close();
        }
    }

    onTouchCancel(touchEvent: any) {
        this._fightScene.linkContent.onPropTouchCancel(touchEvent);
    }

    onBtnCloseClick() {
        this.close();
    }

    close() {
        uiManager.instance.hideDialog('fight/fightPropsOperation');
        if (this.closeCallback) {
           this.closeCallback();
        }
    }

}