import { director } from 'cc';

export let _language = 'zh';

export let ready: boolean = false;

/**
 * 初始化
 * @param language 
 */
export function init(language: string) {
    ready = true;
    _language = language;
}

/**
 * 翻译数据
 * @param key 
 * @param changeData 
 * @returns 
 */
export function t(key: string, changeData?: any) {
    const win: any = window;

    if (!win.languages) {
        return key;
    }
    const searcher = key.split('.');

    let data = win.languages[_language];
    for (let i = 0; i < searcher.length; i++) {
        data = data[searcher[i]];
        if (!data) {
            return '';
        }
    }
    if (changeData) {
        for (let j in changeData) {
            data = data.replace('%{' + j + '}', changeData[j]);
        }
    }
    return data || '';
}

export function updateSceneRenderers() { // very costly iterations
    const rootNodes = director.getScene()!.children;
    // walk all nodes with localize label and update
    const allLocalizedLabels: any[] = [];
    const allLocalizedSprites: any[] = [];
    const allLocalizedMaterial: any[] = [];

    for (let i = 0; i < rootNodes.length; ++i) {
        let labels = rootNodes[i].getComponentsInChildren('LocalizedLabel');
        Array.prototype.push.apply(allLocalizedLabels, labels);

        let sprites = rootNodes[i].getComponentsInChildren('LocalizedSprite');
        Array.prototype.push.apply(allLocalizedSprites, sprites);

        let meshs = rootNodes[i].getComponentsInChildren('LocalizedMaterial');
        Array.prototype.push.apply(allLocalizedMaterial, meshs);
    }

    for (let i = 0; i < allLocalizedLabels.length; ++i) {
        let label = allLocalizedLabels[i];
        if (!label.node.active) continue;
        label.updateLabel();
    }
    // walk all nodes with localize sprite and update

    for (let i = 0; i < allLocalizedSprites.length; ++i) {
        let sprite = allLocalizedSprites[i];
        if (!sprite.node.active) continue;
        sprite.updateSprite();
    }

    for (let i = 0; i < allLocalizedMaterial.length; ++i) {
        let mesh = allLocalizedMaterial[i];
        if (!mesh.node.active) continue;
        mesh.updateMat();
    }
}

// 供插件查询当前语言使用
const win = window as any;
win._languageData = {
    get language() {
        return _language;
    },
    init(lang: string) {
        init(lang);
    },
    updateSceneRenderers() {
        updateSceneRenderers();
    },
};
