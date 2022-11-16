import {
  _decorator,
  Component,
  Sprite,
  Label,
  Node,
  Animation,
  SpriteFrame,
  sys,
} from "cc";
import { clientEvent } from "../../frameworks/clientEvent";
import { GameLogic } from "../../frameworks/gameLogic";
import { localConfig } from "../../frameworks/localConfig";
import { playerData } from "../../frameworks/playerData";
import { resourceUtil } from "../../frameworks/resourceUtil";
import { uiManager } from "../../frameworks/uiManager";
import { constants } from "../../shared/constants";
import { ButtonEx } from "../common/buttonEx";

const { ccclass, property } = _decorator;

@ccclass("ShopItem")
export class ShopItem extends Component {
  @property
  public spIcon: Sprite = null!;
  @property
  public lbPrise: Label = null!;
  @property
  public ndGold: Node = null!;
  @property
  public lbNum: Label = null!;
  @property
  public lbProcess: Label = null!;
  @property
  public aniLight: Animation = null!;
  @property
  public exBtnBuy: ButtonEx = null!;
  @property
  public ndNumber: Node = null!;
  @property
  public spBtnBuy: Sprite = null!;
  @property
  public sfBuy: SpriteFrame = null!;
  @property
  public sfShare: SpriteFrame = null!;
  @property
  public sfAd: SpriteFrame = null!;
  @property
  public sfReceive: SpriteFrame = null!;

  public info: any;
  public parent: any;
  public id: any;
  public price: any;
  public countPerBuy: any;
  public icon: any;
  public animState: any;
  public totalPrice: any;
  public times: any;
  public maxTimes: any;
  public rewardType: any;

  onEnable() {
    clientEvent.on("updateGold", this.refreshBtn, this);
    clientEvent.on(
      "updateInfiniteShareTimes",
      this.updateInfiniteShareTimes,
      this
    );
  }

  onDisable() {
    clientEvent.off("updateGold", this.refreshBtn, this);
    clientEvent.off(
      "updateInfiniteShareTimes",
      this.updateInfiniteShareTimes,
      this
    );
  }

  setInfo(info: any, parent: any) {
    this.info = info;
    this.parent = parent;
    this.id = info.ID;
    this.price = info.price;
    this.countPerBuy = info.countPerBuy;
    this.icon = info.icon;
    this.refreshUI();
    this.refreshBtn();
  }

  refreshUI() {
    this.animState = "shopPropertyIdle";
    this.aniLight.play(this.animState);
    resourceUtil.setPropIcon(this.icon, this.spIcon, () => {});
    let propItem = localConfig.instance.queryByID("prop", this.id);
    this.totalPrice = this.countPerBuy * this.price;
    this.lbNum.string = propItem.countPerBuy;
    this.times = playerData.instance.getInfiniteTimes();
    this.maxTimes = constants.MAX_INFINITE_TIMES;
    if (this.info.ID !== constants.PROP_ID.INFINITE) {
      this.lbPrise.string = this.totalPrice;
      this.lbProcess.node.active = false;
    } else {
      GameLogic.instance.getOpenRewardType(
        constants.SHARE_FUNCTION.BUY_INFINITE,
        (err: any, type: any) => {
          if (!err) {
            this.rewardType = type;
            switch (type) {
              case constants.OPEN_REWARD_TYPE.AD:
                this.spBtnBuy.spriteFrame = this.sfAd;
                this.ndGold.active = false;
                this.updateInfiniteShareTimes();
                break;
              case constants.OPEN_REWARD_TYPE.SHARE:
                this.spBtnBuy.spriteFrame = this.sfShare;
                this.ndGold.active = false;
                this.updateInfiniteShareTimes();
                break;
              case constants.OPEN_REWARD_TYPE.NULL:
                this.spBtnBuy.spriteFrame = this.sfBuy;
                this.lbProcess.node.active = false;
                this.lbPrise.string = this.totalPrice;
                break;
            }
            this.refreshBtn();
          } else {
          }
        }
      );
    }
  }

  refreshBtn() {
    if (
      typeof this.rewardType === "number" &&
      this.rewardType !== constants.OPEN_REWARD_TYPE.NULL
    ) {
      this.exBtnBuy.interactable = true;
    } else {
      this.exBtnBuy.interactable =
        playerData.instance.getGold() >= this.totalPrice;
    }
  }

  onBtnBuyClick() {
    uiManager.instance.showDialog("props/buy", [
      this.id,
      constants.ANALYTICS_TYPE.SHOP_PROP_PER_BUY,
    ]);
    this.parent.showAllItemUnSelect();
    this.showSelect();
  }

  onItemClick() {
    this.parent.showAllItemUnSelect();
    this.parent.hideRandPropSelect();
    this.showSelect();
  }

  showSelect() {
    // if (sys.isNative) {
    //     console.log("Hello world!");
    // }

    
    // var result = jsb.reflection.callStaticMethod("com/cocos/game/AppActivity","showPayDialog","()V");
    // console.log(result);

    this.animState = "shopPropertySelect";
    this.aniLight.play(this.animState);
    this.parent.shopPropsOperationScript.show(this.id);
  }

  showUnSelect() {
    if (this.animState === "shopPropertyIdle") return;
    this.animState = "shopPropertyIdle";
    this.aniLight.play(this.animState);
  }

  updateInfiniteShareTimes() {
    this.spBtnBuy.node.setScale(1, 1, 1);
    if (this.id === constants.PROP_ID.INFINITE) {
      this.spBtnBuy.spriteFrame = this.sfReceive;
      this.spBtnBuy.node.setScale(1.3, 1.3, 1.3);
    }
  }
}
