import { _decorator, Component, Label, Sprite, SpriteFrame } from 'cc';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData';
import { localConfig } from '../../frameworks/localConfig';
const { ccclass, property } = _decorator;

@ccclass('ShopPropsOperation')
export class ShopPropsOperation extends Component {
    @property
    public lbTitle: Label = null!;
    @property
    public lbDesc: Label = null!;
    @property
    public spTip: Sprite = null!;
    @property
    public arrSftip: Array<SpriteFrame> = [];

    public type: any;

    show(type: any) {
        this.node.active = true;
        this.type = type;
        this.refreshUI();
    }

    hide() {
        this.node.active = false;
    }

    refreshUI() {
        let prop = localConfig.instance.queryByID('prop', this.type);
        this.lbTitle.string = i18n.t('table_prop.' + prop.name);
        this.lbDesc.string = i18n.t('table_prop.' + prop.desc);
        this.spTip.spriteFrame = this.arrSftip[this.type - 1];
    }

}