/*
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * 工具类
**/
var utils = {

    /**
    * 深度拷贝
    * @param {any} sObj 拷贝的对象
    * @returns 
    */
    clone(sObj: any) {
        if (sObj === null || typeof sObj !== "object") {
            return sObj;
        }

        let s: { [key: string]: any } = {};
        if (sObj.constructor === Array) {
            s = [];
        }

        for (let i in sObj) {
            if (sObj.hasOwnProperty(i)) {
                s[i] = this.clone(sObj[i]);
            }
        }

        return s;
    },

    /**
     * 将object转化为数组
     * @param { any} srcObj  
     * @returns 
     */
    objectToArray(srcObj: { [key: string]: any }) {

        let resultArr: any[] = [];

        // to array
        for (let key in srcObj) {
            if (!srcObj.hasOwnProperty(key)) {
                continue;
            }

            resultArr.push(srcObj[key]);
        }

        return resultArr;
    },

    /**
     * !#zh 将数组转化为object。
     */
    /**
     * 将数组转化为object。
     * @param { any} srcObj 
     * @param { string} objectKey 
     * @returns 
     */
    arrayToObject(srcObj: any, objectKey: string) {

        let resultObj: { [key: string]: any } = {};

        // to object
        for (var key in srcObj) {
            if (!srcObj.hasOwnProperty(key) || !srcObj[key][objectKey]) {
                continue;
            }

            resultObj[srcObj[key][objectKey]] = srcObj[key];
        }

        return resultObj;
    },

    /**
     * 根据权重,计算随机内容
     * @param {arrany} weightArr 
     * @param {number} totalWeight 权重
     * @returns 
     */
    getWeightRandIndex(weightArr: [], totalWeight: number) {
        let randWeight: number = Math.floor(Math.random() * totalWeight);
        let sum: number = 0;
        for (var weightIndex: number = 0; weightIndex < weightArr.length; weightIndex++) {
            sum += weightArr[weightIndex];
            if (randWeight < sum) {
                break;
            }
        }

        return weightIndex;
    },

    /**
     * 从n个数中获取m个随机数
     * @param {Number} n   总数
     * @param {Number} m    获取数
     * @returns {Array} array   获取数列
     */
    getRandomNFromM(n: number, m: number) {
        let array: any[] = [];
        let intRd: number = 0;
        let count: number = 0;

        while (count < m) {
            if (count >= n + 1) {
                break;
            }

            intRd = this.getRandomInt(0, n);
            var flag = 0;
            for (var i = 0; i < count; i++) {
                if (array[i] === intRd) {
                    flag = 1;
                    break;
                }
            }

            if (flag === 0) {
                array[count] = intRd;
                count++;
            }
        }

        return array;
    },

    /**
     * 获取随机整数
     * @param {Number} min 最小值
     * @param {Number} max 最大值
     * @returns 
     */
    getRandomInt(min: number, max: number) {
        let r: number = Math.random();
        let rr: number = r * (max - min + 1) + min;
        return Math.floor(rr);
    },

    /**
     * 获取字符串长度
     * @param {string} render 
     * @returns 
     */
    getStringLength(render: string) {
        let strArr: string = render;
        let len: number = 0;
        for (let i: number = 0, n = strArr.length; i < n; i++) {
            let val: number = strArr.charCodeAt(i);
            if (val <= 255) {
                len = len + 1;
            } else {
                len = len + 2;
            }
        }

        return Math.ceil(len / 2);
    },

    /**
     * 判断传入的参数是否为空的Object。数组或undefined会返回false
     * @param obj
     */
    isEmptyObject(obj: any) {
        let result: boolean = true;
        if (obj && obj.constructor === Object) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result = false;
                    break;
                }
            }
        } else {
            result = false;
        }

        return result;
    },

    /**
     * 判断是否是新的一天
     * @param {Object|Number} dateValue 时间对象 todo MessageCenter 与 pve 相关的时间存储建议改为 Date 类型
     * @returns {boolean}
     */
    isNewDay(dateValue: any) {
        // todo：是否需要判断时区？
        var oldDate: any = new Date(dateValue);
        var curDate: any = new Date();

        var oldYear = oldDate.getYear();
        var oldMonth = oldDate.getMonth();
        var oldDay = oldDate.getDate();
        var curYear = curDate.getYear();
        var curMonth = curDate.getMonth();
        var curDay = curDate.getDate();

        if (curYear > oldYear) {
            return true;
        } else {
            if (curMonth > oldMonth) {
                return true;
            } else {
                if (curDay > oldDay) {
                    return true;
                }
            }
        }

        return false;
    },

    /**
     * 获取对象属性数量
     * @param {object}o 对象
     * @returns 
     */
    getPropertyCount(o: Object) {
        var n, count = 0;
        for (n in o) {
            if (o.hasOwnProperty(n)) {
                count++;
            }
        }
        return count;
    },

    /**
     * 返回一个差异化数组（将array中diff里的值去掉）
     * @param array
     * @param diff
     */
    difference(array: [], diff: any) {
        let result: any[] = [];
        if (array.constructor !== Array || diff.constructor !== Array) {
            return result;
        }

        let length = array.length;
        for (let i: number = 0; i < length; i++) {
            if (diff.indexOf(array[i]) === -1) {
                result.push(array[i]);
            }
        }

        return result;
    },

    //public method for encoding
    base64encode: function (input: any) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
        input = this.utf8Encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }
        return output;
    },

    // private method for UTF-8 encoding
    utf8Encode: function (string: any) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    },

    base64Decode: function (input: any) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1;
        var chr2;
        var chr3;
        var enc1;
        var enc2;
        var enc3;
        var enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = this.utf8Decode(output);
        return output;
    },

    utf8Decode: function (utftext: any) {
        var string = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;
        var c3 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    },

    stringToArray: function (string: any) {
        // 用于判断emoji的正则们
        var rsAstralRange = '\\ud800-\\udfff';
        var rsZWJ = '\\u200d';
        var rsVarRange = '\\ufe0e\\ufe0f';
        var rsComboMarksRange = '\\u0300-\\u036f';
        var reComboHalfMarksRange = '\\ufe20-\\ufe2f';
        var rsComboSymbolsRange = '\\u20d0-\\u20ff';
        var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
        var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']');

        var rsFitz = '\\ud83c[\\udffb-\\udfff]';
        var rsOptVar = '[' + rsVarRange + ']?';
        var rsCombo = '[' + rsComboRange + ']';
        var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
        var reOptMod = rsModifier + '?';
        var rsAstral = '[' + rsAstralRange + ']';
        var rsNonAstral = '[^' + rsAstralRange + ']';
        var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
        var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
        var rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
        var rsSeq = rsOptVar + reOptMod + rsOptJoin;
        var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
        var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

        var hasUnicode = function (val: any) {
            return reHasUnicode.test(val);
        };

        var unicodeToArray = function (val: any) {
            return val.match(reUnicode) || [];
        };

        var asciiToArray = function (val: any) {
            return val.split('');
        };

        return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    },

    // 模拟传msg的uuid
    simulationUUID: function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    },

    trim: function (str: any) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },

    /**
     * 判断当前时间是否在有效时间内
     * @param {String|Number} start 起始时间。带有时区信息
     * @param {String|Number} end 结束时间。带有时区信息
     */
    isNowValid: function (start: any, end: any) {
        var startTime = new Date(start);
        var endTime = new Date(end);
        var result = false;

        if (startTime.getDate() + '' !== 'NaN' && endTime.getDate() + '' !== 'NaN') {
            var curDate = new Date();
            result = curDate < endTime && curDate > startTime;
        }

        return result;
    },

    getDeltaDays: function (start: any, end: any) {
        start = new Date(start);
        end = new Date(end);

        var startYear = start.getFullYear();
        var startMonth = start.getMonth() + 1;
        var startDate = start.getDate();
        var endYear = end.getFullYear();
        var endMonth = end.getMonth() + 1;
        var endDate = end.getDate();

        start = new Date(startYear + '/' + startMonth + '/' + startDate + ' GMT+0800').getTime();
        end = new Date(endYear + '/' + endMonth + '/' + endDate + ' GMT+0800').getTime();

        var deltaTime = end - start;
        return Math.floor(deltaTime / (24 * 60 * 60 * 1000));
    },

    getMin: function (array: any) {
        var result: number = null!;
        if (array.constructor === Array) {
            var length = array.length;
            for (var i = 0; i < length; i++) {
                if (i === 0) {
                    result = Number(array[0]);
                } else {
                    result = result > Number(array[i]) ? Number(array[i]) : result;
                }
            }
        }

        return result;
    },

    /**
     * 格式化两位小数点
     * @param time 
     * @returns 
     */
    formatTwoDigits(time: number) {
        //@ts-ignore
        return (Array(2).join(0) + time).slice(-2);
    },

    /**
     * 获取格式化后的日期（不含小时分秒）
     */
    getDay: function () {
        var date = new Date();

        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    },

    formatName: function (name: any, limit: any) {
        limit = limit || 6;
        var nameArray = this.stringToArray(name);
        var str = '';
        var length = nameArray.length;
        if (length > limit) {
            for (var i = 0; i < limit; i++) {
                str += nameArray[i];
            }

            str += '...';
        } else {
            str = name;
        }

        return str;
    },

    /**
     * 格式化钱数，超过10000 转换位 10K   10000K 转换为 10M
     */
    formatMoney: function (money: any) {
        var arrUnit = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'B', 'N', 'D'];

        var strValue = '';
        for (var idx = 0; idx < arrUnit.length; idx++) {
            if (money >= 10000) {
                money /= 1000;
            } else {
                strValue = Math.floor(money) + arrUnit[idx];
                break;
            }
        }

        if (strValue === '') {
            strValue = Math.floor(money) + 'U'; //超过最大值就加个U
        }

        return strValue;
    },

    /**
     * 根据剩余秒数格式化剩余时间 返回 HH:MM:SS
     * @param {Number} leftSec 
     */
    formatTimeForSecond(leftSec: any) {
        var timeStr = '';
        var sec = leftSec % 60;

        var leftMin = Math.floor(leftSec / 60);
        leftMin = leftMin < 0 ? 0 : leftMin;

        var hour = Math.floor(leftMin / 60);
        var min = leftMin % 60;

        if (hour > 0) {
            timeStr += hour > 9 ? hour.toString() : '0' + hour;
            timeStr += ':';
        }

        timeStr += min > 9 ? min.toString() : '0' + min;
        timeStr += ':';
        timeStr += sec > 9 ? sec.toString() : '0' + sec;
        return timeStr;
    },


    /**
    *  根据剩余毫秒数格式化剩余时间 返回 HH:MM:SS
    *
    * @param {Number} ms
    */
    formatTimeForMillisecond(ms: number): Object {
        let second: number = Math.floor(ms / 1000 % 60);
        let minute: number = Math.floor(ms / 1000 / 60 % 60);
        let hour: number = Math.floor(ms / 1000 / 60 / 60);
        return `${hour}:${minute}:${second}`;
    },

    // /**
    //  * TODO 需要将pako进行引入，目前已经去除了压缩算法的需要，如需要使用需引入库文件
    //  * 将字符串进行压缩
    //  * @param {String} str 
    //  */
    // zip(str: any) {
    //     var binaryString = pako.gzip(encodeURIComponent(str), { to: 'string' });
    //     return this.base64encode(binaryString);
    // },

    // /**
    //  * todo 目前已经去除了压缩算法的需要，如需要使用需引入库文件
    //  * 将数据进行解压
    //  * @param {String} b64Data 
    //  */
    // unZip(b64Data: any) {
    //     var strData = this.base64Decode(b64Data);
    //     // Convert binary string to character-number array
    //     var charData = strData.split('').map(function (x) { return x.charCodeAt(0); });
    //     // Turn number array into byte-array
    //     var binData = new Uint8Array(charData);
    //     // // unzip
    //     var data = pako.inflate(binData);
    //     // Convert gunzipped byteArray back to ascii string:
    //     strData = String.fromCharCode.apply(null, new Uint16Array(data));
    //     return decodeURIComponent(strData);
    // },

    /**
     * 数据加密
     * @param {String} str 
     */
    encrypt(str: any) {
        let b64Data = this.base64encode(str);

        let n = 6;
        if (b64Data.length % 2 === 0) {
            n = 7;
        }

        let encodeData = '';

        for (let idx = 0; idx < (b64Data.length - n + 1) / 2; idx++) {
            encodeData += b64Data[2 * idx + 1];
            encodeData += b64Data[2 * idx];
        }

        encodeData += b64Data.slice(b64Data.length - n + 1);

        return encodeData;
    },

    /**
     * 数据解密
     * @param {String} b64Data 
     */
    decrypt(b64Data: any) {
        let n = 6;
        if (b64Data.length % 2 === 0) {
            n = 7;
        }

        let decodeData = '';
        for (var idx = 0; idx < b64Data.length - n; idx += 2) {
            decodeData += b64Data[idx + 1];
            decodeData += b64Data[idx];
        }

        decodeData += b64Data.slice(b64Data.length - n + 1);

        decodeData = this.base64Decode(decodeData);

        return decodeData;
    },
};

export { utils }
