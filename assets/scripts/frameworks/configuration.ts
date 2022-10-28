import { sys, _decorator } from 'cc';
const { ccclass } = _decorator;

let KEY_CONFIG = "LinkConfig";
@ccclass('Configuration')
export class Configuration {
    public jsonData: any;
    public path: any;
    public markSave: any;
    public saveTimer: any;

    static _instance: Configuration;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new Configuration();
        this._instance.init();
        return this._instance;
    }

    init() {
        this.jsonData = {
            "userId": ""
        };
        this.path = this.getConfigPath();
        var content;
        if (sys.isNative) {
            var valueObject = jsb.fileUtils.getValueMapFromFile(this.path);
            content = valueObject[KEY_CONFIG];
        } else {
            content = sys.localStorage.getItem(KEY_CONFIG);
        }
        if (content && content.length) {
            if (content.startsWith('@')) {
                content = content.substring(1);
            }
            try {
                var jsonData = JSON.parse(content);
                this.jsonData = jsonData;
            } catch (excepaiton) {
            }
        }
        this.markSave = false;
        this.saveTimer = setInterval(() => {
            this.scheduleSave();
        }, 500);
    }

    setConfigDataWithoutSave(key: any, value: any) {
        var account = this.jsonData.userId;
        if (this.jsonData[account]) {
            this.jsonData[account][key] = value;
        } else {
            console.error("no account can not save");
        }
    }

    setConfigData(key: any, value: any) {
        this.setConfigDataWithoutSave(key, value);
        this.markSave = true; //标记为需要存储，避免一直在写入，而是每隔一段时间进行写入
    }

    getConfigData(key: any) {
        var account = this.jsonData.userId;
        if (this.jsonData[account]) {
            var value = this.jsonData[account][key];
            return value ? value : "";
        } else {
            console.log("no account can not load");
            return "";
        }
    }

    setGlobalData(key: any, value: any) {
        this.jsonData[key] = value;
        this.save();
    }

    getGlobalData(key: any) {
        return this.jsonData[key];
    }

    setUserId(userId: any) {
        this.jsonData.userId = userId;
        if (!this.jsonData[userId]) {
            this.jsonData[userId] = {};
        }
        this.save();
    }

    getUserId() {
        return this.jsonData.userId;
    }

    scheduleSave() {
        if (!this.markSave) {
            return;
        }
        this.save();
    }

    markModified() {
        this.markSave = true;
    }

    save() {
        var str = JSON.stringify(this.jsonData);
        let zipStr = str;
        this.markSave = false;
        if (!sys.isNative) {
            var ls = sys.localStorage;
            ls.setItem(KEY_CONFIG, zipStr);
            return;
        }
        var valueObj: any = {};
        valueObj[KEY_CONFIG] = zipStr;
        jsb.fileUtils.writeToFile(valueObj, configuration.path);
    }

    getConfigPath() {
        var platform = sys.platform;
        var path = "";
        if (platform === sys.Platform.WIN32) {
            path = "src/conf";
        } else if (platform === sys.Platform.IOS) {
            path = "./conf";
        } else {
            if (sys.isNative) {
                path = jsb.fileUtils.getWritablePath();
                path = path + "conf";
            } else {
                path = "src/conf";
            }
        }
        return path;
    }

    parseUrl(paramStr: any) {
        if (!paramStr || (typeof paramStr === 'string' && paramStr.length <= 0)) {
            return;
        }
        var dictParam: any = {};
        if (typeof paramStr === 'string') {
            paramStr = paramStr.split('?')[1]; // 去除掉 ？号
            var arrParam = paramStr.split("&");
            arrParam.forEach(function (paramValue: any) {
                var idxEqual = paramValue.indexOf("=");
                if (idxEqual !== -1) {
                    var key = paramValue.substring(0, idxEqual);
                    dictParam[key] = paramValue.substring(idxEqual + 1);
                }
            });
        } else {
            dictParam = paramStr;
        }
        if (dictParam.action) {
            this.setGlobalData('urlParams', dictParam);
        }
        if (dictParam.source) {
            this.setGlobalData('source', dictParam.source);
        }
        if (dictParam.adchannelid) {
            this.setGlobalData('adchannelid', dictParam.adchannelid);
        }
    }

    generateGuestAccount() {
        return `${Date.now()}${0 | (Math.random() * 1000, 10)}`;
    }

}