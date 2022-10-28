import { _decorator, Component, Label } from 'cc';
import { playerData } from '../../frameworks/playerData';
import { uiManager } from '../../frameworks/uiManager';
import { GameLogic } from '../../frameworks/gameLogic';
import { SceneManager } from '../loading/sceneManager';
const { ccclass, property } = _decorator;

@ccclass('BalanceFailed')
export class BalanceFailed extends Component {
    @property
    public lbLevel: Label = null!;

    show() {
        this.lbLevel.string = playerData.instance.level;
    }

    onBtnRetryClick() {
        uiManager.instance.hideDialog('fight/balanceFailed');
        GameLogic.instance.resetLevel();
    }

    onBtnCloseClick() {
        uiManager.instance.hideDialog('fight/balanceFailed');
        SceneManager.instance.loadScene('pve', [], (err: any, result: any) => {
            if (err) {
                console.error(err.message || err);
                return;
            }
        });
    }

}