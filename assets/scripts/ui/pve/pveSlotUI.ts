import { _decorator, Component, Node, Prefab, instantiate, UITransform } from 'cc';
import { playerData } from '../../frameworks/playerData';
import { constants } from '../../shared/constants';
import { LevelUI } from './levelUI';
const { ccclass, property } = _decorator;

@ccclass('PveSlotUI')
export class PveSlotUI extends Component {
    @property
    public levelNodes: Array<Node> = [];
    @property
    public prefabLevel: Prefab = null!;
    @property
    public prefabCloud: Prefab = null!;

    public index: any;
    public _parent: any;
    public levelArray: any;

    show(parent: any, pveData: any, index: any) {
        this.index = index;
        this._parent = parent;
        this.levelArray = pveData;
        this.addLevelNodes();
    }

    addLevelNodes() {
        let curLevel = playerData.instance.getCurrentLevel();
        let curLevenName = parseInt(curLevel.name);
        let total = this.levelArray.length;
        let lastHeight = 0;
        for (let i = 0; i < total; i++) {
            this.levelNodes[i].active = true;
            let levelUI = this.levelNodes[i].getComponentInChildren(LevelUI);
            if (!levelUI) {
                let child = instantiate(this.prefabLevel);
                child.active = true;
                child.setPosition(0, 0);
                this.levelNodes[i].addChild(child);
            }
            let name = this.levelArray[i].name;
            if (parseInt(name) < curLevenName) { // 已完成
                this.levelArray[i].status = constants.PVE_LEVEL_STATUS.DONE;
            } else if (parseInt(name) === curLevenName) { // 当前等级
                this.levelArray[i].status = constants.PVE_LEVEL_STATUS.DOING;
            } else { //  未完成
                this.levelArray[i].status = constants.PVE_LEVEL_STATUS.UNDONE;
            }
            let ID = this.levelArray[i].ID;
            if (playerData.instance.history.hasOwnProperty(ID)) {
                this.levelArray[i].star = playerData.instance.history[ID].star;
            }
            levelUI = this.levelNodes[i].getComponentInChildren(LevelUI)!;
            levelUI.init(this.levelArray[i]);
            lastHeight = this.levelNodes[i].position.y;
        }
        this.showCloudsUponLevels(lastHeight);
        let cnt = this.levelNodes.length;
        for (let idx = this.levelArray.length; idx < cnt; idx++) {
            this.levelNodes[idx].removeAllChildren();
            this.levelNodes[idx].active = false;
        }
    }

    showCloudsUponLevels(lastHeight: any) {
        let isNode = this.node.getChildByName('cloud');
        if (isNode) {
            this.node.removeChild(isNode);
        }
        let multi = 0;
        let height = lastHeight;
        if (this.index < 0) {
            multi = 0;
        } else {
            multi = this.index;
            height = height + 430; // prefab1的高度530减去回弹范围100
        }
        const nodeHeight = this.node.getComponent(UITransform)!.height;
        height = height + nodeHeight * multi; // 最后一个level节点的高度
        let topY = nodeHeight + this.node.position.y;
        let contentY = this._parent.contentNode.getComponent(UITransform).height; // content的总高度
        let nodeCloud = instantiate(this.prefabCloud);
        const nodeCloudHeight = nodeCloud.getComponent(UITransform)!.height
        let diff = Math.floor(Math.abs(contentY - height) / nodeCloudHeight);
        if (diff && Math.abs(topY - height) > nodeCloudHeight) {
            nodeCloud.setPosition(0, lastHeight + nodeCloudHeight / 2);
            nodeCloud.active = true;
            this.node.addChild(nodeCloud);
        }
    }

}