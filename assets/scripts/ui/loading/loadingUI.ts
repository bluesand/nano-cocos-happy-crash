import { _decorator, Component, ProgressBar, Label, Node, SpriteFrame, Sprite, game } from 'cc';
import { constants } from '../../shared/constants';
const { ccclass, property } = _decorator;

@ccclass('LoadingUI')
export class LoadingUI extends Component {
    @property
    public progressBar: ProgressBar = null!;
    @property
    public percentLabel: Label = null!;
    @property
    public versionLabel: Label = null!;
    @property
    public tipsNode: Node = null!;
    @property
    public spriteArr: Array<SpriteFrame> = [];

    updateTimer: any = null!;
    updateInterval: any = null!;
    totalLength: any = null!;
    lengthInterval: any = null!;
    type: any = null!;
    callback: any = null!;
    tasks: any = null!;
    currentMaxLength: any = null!;
    currentLength: any = null!;
    taskIndex: any = null!;
    running: any = null!;

    onLoad() {
        this.updateTimer = 0;
        this.updateInterval = 0.01;
        this.totalLength = this.progressBar.totalLength;
        this.lengthInterval = 30;
        // this.versionLabel.string = 'Ver:' + localConfig.getVersion();
    }

    onEnable() {
        let num = Math.floor(Math.random() * 3);
        num = num >= 3 ? 2 : num;
        this.tipsNode.getComponent(Sprite)!.spriteFrame = this.spriteArr[num];
    }

    startLoading(type: any, tasks: any, callback: any) {
        // game.addPersistRootNode(this.node);
        this.node.active = true;
        this.type = type;
        this.callback = callback;
        this.tasks = tasks;
        this.currentMaxLength = 0;
        this.currentLength = 0;
        this.progressBar.progress = 0;
        this.percentLabel.string = '0%';
        this.taskIndex = 0;
        this.running = true;
        this.nextTask([]);
    }

    nextTask(args: any) {
        if (!this.tasks) return;
        if (this.taskIndex === this.tasks.length) {
            this.currentMaxLength = this.totalLength;
            if (this.type === constants.SCENE_MANAGER_TYPE.LOAD) {
                this.currentLength = this.currentMaxLength;
                this.setProgress();
            }
            return;
        }
        if (this.type === constants.SCENE_MANAGER_TYPE.LOAD) {
            this.currentLength = this.currentMaxLength;
            this.setProgress();
        }
        var _this = this;
        var taskCallback = function (err: any, args: any) {
            if (err) {
                return _this.callback.apply(null, [err].concat(args));
            }
            _this.nextTask(Array.prototype.slice.call(arguments).slice(1));
        };
        args.push(taskCallback);
        var task = this.tasks[this.taskIndex++];
        this.currentMaxLength = this.totalLength / (this.tasks.length + 1) * this.taskIndex;
        task.apply(null, args);
    }

    update(dt: any) {
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) {
            return; // we don't need to do the math every frame
        }
        if (!this.running) return;
        this.updateTimer = 0;
        this.currentLength += this.lengthInterval;
        this.currentLength = this.currentLength > this.currentMaxLength ? this.currentMaxLength : this.currentLength;
        this.setProgress();
    }

    setProgress() {
        var radio = this.currentLength / this.totalLength;
        radio = radio > 1 ? 1 : radio;
        this.percentLabel.string = Math.floor(radio * 100) + '%';
        this.progressBar.progress = radio;
        if (radio === 1) {
            this.running = false;
            this.callback.apply(null, [null].concat(null));
        }
    }
}