import { _decorator, Component, game, director, instantiate, find } from 'cc';
import { clientEvent } from '../../frameworks/clientEvent';
import { resourceUtil } from '../../frameworks/resourceUtil'
import { constants } from '../../shared/constants';
import { LoadingUI } from './loadingUI';

const { ccclass } = _decorator;

@ccclass('SceneManager')
export class SceneManager extends Component {
    curLoadingScene: any = null!;
    callback: any = null!;
    loading: any = null!;
    tasks: any = null!;

    public isStop = false;

    static _instance: SceneManager;
    static get instance() {
        if (this._instance) {
            return this._instance
        }

        this._instance = new SceneManager();
        return this._instance;
    }

    loadScene(sceneName: any, tasks: any, callback: any) {
        this.curLoadingScene = sceneName;
        this.callback = callback;
        var type = constants.SCENE_MANAGER_TYPE.LOAD_SCENE;
        var _this = this;
        tasks.push(this.preloadScene.bind(this));
        var parent = director.getScene();
        this.initLoadingUI(parent, 'loading', function () {
            _this.loading.getComponent(LoadingUI).startLoading(type, tasks, function (err: any, result: any) {
                if (err) {
                    console.error(err.message || err);
                    _this.callback.apply(null, [err].concat(result));
                    return;
                }
                try {
                    director.loadScene(_this.curLoadingScene, function () {
                        _this.callback.apply(null, [null].concat(null));
                        game.removePersistRootNode(_this.loading);
                        _this.loading.removeFromParent();
                        clientEvent.dispatchEvent("onSceneChanged");
                    });
                } catch (error) {
                    console.log("loadScene", sceneName, error);
                }
            });
        });
    }

    preloadScene() {
        var arg = arguments;
        var onSceneLoaded = function () {
            arg[arg.length - 1].apply(null, Array.prototype.slice.call(arg, 1));
        };
        director.preloadScene(this.curLoadingScene, onSceneLoaded);
    }

    load(tasks: any, callback: any) {
        this.callback = callback;
        this.tasks = tasks;
        var _this = this;
        var type = constants.SCENE_MANAGER_TYPE.LOAD;
        var canvas = find('Canvas');
        this.initLoadingUI(canvas, 'loading', function () {
            _this.loading.setPosition(0, 0);
            _this.loading.getComponent(LoadingUI).startLoading(type, _this.tasks, function (err: any, result: any) {
                if (err) {
                    console.error(err.message || err);
                    _this.callback.apply(null, [err].concat(result));
                    return;
                }
                _this.callback.apply(null, [null].concat(null));
            });
        });
    }

    initLoadingUI(parent: any, name: any, cb: any) {
        var _this = this;

        resourceUtil.getUIPrefabRes('loading/' + name, function (error: any, prefab: any) {
            if (!_this.loading || _this.loading.name !== 'loading') {
                delete _this.loading;
                _this.loading = instantiate(prefab);
                _this.loading.active = false;
                parent.addChild(_this.loading, 999);
            }
            cb();
        });
    }

    enterSceneByAnimation(name: any, sceneName: any, tasks: any, callback: any) {
        this.curLoadingScene = sceneName;
        this.callback = callback;
        var _this = this;
        tasks.push(this.preloadScene.bind(this));
        var parent = director.getScene();
        this.initLoadingUI(parent, name, function () {
            _this.loading.getComponent('loadingCloudUI').startLoading(false, tasks, function (err: any, result: any) {
                if (err) {
                    console.error(err.message || err);
                    _this.callback.apply(null, [err].concat(result));
                    return;
                }
                director.preloadScene(_this.curLoadingScene, function () {
                    director.loadScene(_this.curLoadingScene, function () {
                        _this.loading.getComponent('loadingCloudUI').endLoading(true);
                        _this.callback.apply(null, [null].concat(null));
                        clientEvent.dispatchEvent("onSceneChanged");
                    });
                })
            });
        });
    }

    discontinue() {
        this.loading && this.loading.destroy();
    }
}