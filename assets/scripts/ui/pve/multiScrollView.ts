import { _decorator, Component, ScrollView, Prefab, NodePool, instantiate, Size, Vec2, view, UITransform, find, Vec3, Node } from 'cc';
import { localConfig } from '../../frameworks/localConfig';
import { loadsh } from '../../frameworks/loadsh';
import { playerData } from '../../frameworks/playerData';
import { utils } from '../../shared/utils';
import { PveSlotUI } from './pveSlotUI';
const { ccclass, property } = _decorator;

@ccclass('MultiScrollView')
export class MultiScrollView extends Component {
    @property
    public scrollView: ScrollView = null!;
    @property
    public pve1Prefab: Prefab = null!;
    @property
    public pve2Prefab: Prefab = null!;

    public updateTimer: any;
    public updateInterval: any;
    public lastPositionY: any;
    public pool: any;
    public pool1: any;
    public pool2: any;
    public contentNode: any;
    public pve1Node: any;
    public parent: any;
    public isChange: any;
    public arrayPrefab: any;
    public positions: any;
    public isNeedScroll: any;
    public currentPosition: any;
    public cloudPrefab: any;
    public positionCloud1: any;
    public positionCloud2: any;

    onLoad() {
        this.updateTimer = 0; //更新时间
        this.updateInterval = 0.2; //更新间隔
        this.lastPositionY = 0;
        this.pool = new NodePool(); //关卡对象池
        this.pool1 = new NodePool(); //云层1对象池
        this.pool2 = new NodePool(); //云层2对象池
        this.contentNode = this.scrollView.content;
        this.pve1Node = instantiate(this.pve1Prefab);
        this.contentNode.addChild(this.pve1Node, 999); //显示在最底层
    }

    start() {
        this.show();
    }

    onEnable() {
        this.contentNode.on('size-changed', this.sizeChange, this);
    }

    onDisable() {
        this.contentNode.off('size-changed', this.sizeChange, this);
    }

    init(parent: any) {
        this.parent = parent;
    }

    show() {
        this.isChange = true;
        this.isNeedScroll = true;
        this.positions = [];
        var pve = utils.objectToArray(localConfig.instance.getTable('level'));
        var y;
        var height = -100; // 回弹范围
        var pve1Data = pve.slice(0, 1); //第一层包含1个关卡
        this.pve1Node.setPosition(0, height); //
        var uiTraContent = this.contentNode.getComponent(UITransform)! as UITransform;
        const size = uiTraContent.contentSize
        uiTraContent.setContentSize(new Size(size.width, this.pve1Node.getComponent(UITransform).height + height));
        this.pve1Node.getComponent(PveSlotUI).show(this, pve1Data, -1);
        this.arrayPrefab = loadsh.chunk(loadsh.drop(pve, 1), 22); //除第一层外包含22个关卡
        var length = this.arrayPrefab.length;
        const heightPve2 = this.pve2Prefab.data.getComponent(UITransform).height;
        for (var i = 0; i < length; i++) {
            y = size.height; //关卡无重合部分
            this.positions.push(new Vec3(0, y, 0));
            uiTraContent.setContentSize(new Size(size.width, y + heightPve2));
        }
        uiTraContent.setContentSize(new Size(size.width, size.height - heightPve2 / 3));
        this.addNode();
        var currentLevel = playerData.instance.getCurrentLevel();
        var index = loadsh.findIndex(pve, function (n: any) {
            return n.ID === currentLevel.ID;
        });
        let idxPage = index / 22;
        this.currentPosition = idxPage >= 0 ? this.positions[Math.floor(idxPage)] : new Vec2(0, 0);
        this.currentPosition = new Vec3(this.currentPosition.x, this.currentPosition.y, 0);
        let idxLevel = index % 22 + 1;
        this.currentPosition.y = this.currentPosition.y + this.pve2Prefab.data.getChildByName('level' + idxLevel).y;
        this.currentPosition.y -= view.getVisibleSize().height / 2;
        this.scrollToNode();
    }

    update(dt: any) {
        this.scrolling();
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) {
            return; // we don't need to do the math every frame
        }
        this.updateTimer = 0;
        this.addNode();
    }

    addNode() {
        if (!this.arrayPrefab) return;
        var itemHeight;
        for (var i = 0; i < this.arrayPrefab.length; i++) {
            itemHeight = this.pve2Prefab.data.getComponent(UITransform).height;
            this.updateNode(i, itemHeight, this.contentNode,
                this.pool, this.positions, this.pve2Prefab, this.arrayPrefab);
        }
        this.isChange = false;
    }

    updateNode(index: any, itemHeight: any, node: any, pool: any, positions: any, prefab: any, contents: any) {
        var child;
        var viewPos = this.getPositionInView(node, positions[index]);
        if (this.isOverBorder(viewPos, itemHeight)) {
            child = node.getChildByName(String(index));
            if (child) {
                this.remove(child, node, pool);
            }
        } else {
            child = node.getChildByName(String(index));
            if (!child) {
                this.create(child, index, node, pool, positions, prefab, contents);
            } else if (this.isChange) {
                var pveSlotUI = child.getComponent(PveSlotUI);
                if (pveSlotUI) pveSlotUI.show(this, contents[index], index);
                child.setPosition(positions[index]);
                child.tag = index;
            }
        }
    }

    create(child: Node, index: any, node: any, pool: any, positions: any, prefab: any, contents: any) {
        if (pool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            child = pool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            child = instantiate(prefab);
        }
        child.setPosition(positions[index]);
        node.addChild(child);
        child.setSiblingIndex(0);
        child.name = String(index);
        var pveSlotUI = child.getComponent(PveSlotUI);
        if (pveSlotUI) pveSlotUI.show(this, contents[index], index);
    }

    remove(child: any, node: any, pool: any) {
        pool.put(child);
        node.removeChild(child, false);
    }

    getPositionInView(node: any, position: any) {
        var worldPos = node.getComponent(UITransform).convertToWorldSpaceAR(position);
        var viewPos = this.scrollView.node.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }

    isOverBorder(viewPos: any, itemHeight: any) {
        var height = this.scrollView.node.getComponent(UITransform)!.height;
        var borderHeight = height + height / 2 + itemHeight / 2;
        return viewPos.y > borderHeight || viewPos.y < -borderHeight;
    }

    onDestory() {
        this.pool.clear();
        this.pool1.clear();
        this.pool2.clear();
    }

    sizeChange() {
        var size = this.contentNode.getComponent(UITransform);
        this.node.getComponent(UITransform)!.setContentSize(size);
    }

    scrollToNode() {
        if (this.isNeedScroll) {
            this.scrollView.scrollTo(new Vec2(
                0, this.currentPosition.y / (this.scrollView.node.getComponent(UITransform)!.height - view.getCanvasSize().height)), 0.1);
        }
    }

    scrolling() {
        var position = this.contentNode.getPosition();
        this.lastPositionY = position.y;
    }

    createCloud() {
        this.positionCloud1 = [];
        this.positionCloud2 = [];
        var winHeight = view.getCanvasSize().height;
        var totalHeight = this.contentNode.getComponent(UITransform).height;
        var n = Math.ceil(totalHeight / winHeight);
        var i;
        for (i = 0; i < n; i++) {
            this.positionCloud1.push(this.randomPosition());
        }
        for (i = 0; i < n; i++) {
            this.positionCloud2.push(this.randomPosition());
        }
    }

    randomPosition() {
        var winHeight = view.getCanvasSize().height;
        var totalHeight = this.scrollView.getMaxScrollOffset().y;
        var x = utils.getRandomInt(300, 400);
        var y = utils.getRandomInt(winHeight / 2, totalHeight);
        var symbol = utils.getRandomInt(0, 1);
        if (symbol) {
            return new Vec2(x, y);
        } else {
            return new Vec2(-x, y);
        }
    }

    getCloudPrefabMaxHeight() {
        var max = 0;
        loadsh.forEach(this.cloudPrefab, function (n: any) {
            if (max < n.data.height) {
                max = n.data.height;
            }
        });
        return max;
    }

}