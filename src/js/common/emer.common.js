/*===============================================
 * emer.common js
 * 依赖于jquery
 * author wangshw(王绍伟)
 * dev on 2017-02-10
 ================================================*/
String.prototype.trim = function () {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
String.prototype.isNullOrEmpty = function () {
    return (this == '' || this == 'undefined' || this == 'null');
}
String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
        return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")), replaceWith);
    } else {
        return this.replace(reallyDo, replaceWith);
    }
}
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, // month   
        "d+": this.getDate(), // day   
        "h+": this.getHours(), // hour   
        "m+": this.getMinutes(), // minute   
        "s+": this.getSeconds(), // second   
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter   
        "S": this.getMilliseconds()
        // millisecond   
    }
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}
if (!Array.indexOf) {
    Array.prototype.indexOf = function (el) {
        for (var i = 0, n = this.length; i < n; i++) {
            if (this[i] === el) return i;
        }
        return -1;
    }
}

var gc = emer = function ($) {
    var emer = {
        data: {},
        indexOfArray: function (arr, o, id) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (id == undefined) {
                    if (arr[i] == o) {
                        return i;
                    }
                } else {
                    if (arr[i][o] == id) {
                        return i;
                    }
                }
            }
            return -1;
        },
        removeArrayItem: function (arr, o, id) {
            if (typeof o == "string") {
                for (var i = 0, len = arr.length; i < len; i++) {
                    if (arr[i][o] == id) {
                        arr.splice(i, 1);
                        return;
                    }
                }
            } else {
                var index = this.indexOfArray(arr, o);
                if (index != -1) {
                    arr.splice(index, 1);
                }
            }
        },
        addArrayItem: function (arr, o, r) {
            var index = this.indexOfArray(arr, o, r ? r[o] : undefined);
            if (index == -1) {
                arr.push(r ? r : o);
            } else {
                arr[index] = r ? r : o;
            }
        },
        getArrayItem: function (arr, o, id) {
            var index = this.indexOfArray(arr, o, id);
            return index == -1 ? null : arr[index];
        }
    };
    /*--------------------------------
     * emer common
     *================================*/
    emer.getHost = function () {
        return '//' + window.location.host;//带端口号
    }
    emer.queryString = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var l = decodeURI(window.location.search.substr(1));
        var r = l.match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    }
    emer.queryUrlString = function (url, name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = url.match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    }

    emer.isNullOrEmpty = function (s) {
        if (typeof (s) == 'string') return (s == '' || s == 'undefined' || s == 'null');
        if (typeof (s) == 'number') return false;
        if (typeof (s) == 'undefined') return true;
        return (s == null);
    }
    emer.trim = function (str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
    emer.trimAll = function (str) {
        return str.replace(/\s/g, "");
    }
    /**参数说明：
    * 根据长度截取先使用字符串，超长部分追加…  
    * str 对象字符串  
    * len 目标字节长度  
    * 返回值： 处理结果字符串  
    **/
    emer.titleCut = function (str, len) {
        //length属性读出来的汉字长度为1  
        if (str.length * 2 <= len) {
            return str;
        }
        var strlen = 0;
        var s = "";
        for (var i = 0; i < str.length; i++) {
            s = s + str.charAt(i);
            if (str.charCodeAt(i) > 128) {
                strlen = strlen + 2;
                if (strlen >= len) {
                    return s.substring(0, s.length - 1) + "...";
                }
            } else {
                strlen = strlen + 1;
                if (strlen >= len) {
                    return s.substring(0, s.length - 2) + "...";
                }
            }
        }
        return s;
    }
    //获得字符串实际长度，中文2，英文1
    emer.getStrLen = function (str) {
        var realLength = 0;
        var len = str.length;
        var charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128)
                realLength += 1;
            else
                realLength += 2;
        }
        return realLength;
    }

    emer.S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    emer.guid = function () {
        return (emer.S4() + emer.S4() + "-" + emer.S4() + "-" + emer.S4() + "-" + emer.S4() + "-" + emer.S4() + emer.S4() + emer.S4());
    }
    emer.random = function (n1, n2) {
        n1 = n1 || 1;
        n2 = n2 || 10000;
        var w = n2 - n1;
        var num = Math.random() * w + n1;
        return parseInt(num, 10);
    }

    emer.inArray = function (needle, haystack) {
        var i = 0, n = haystack.length;
        for (; i < n; ++i)
            if (haystack[i] === needle)
                return true;
        return false;
    }
    emer.deepCopy = function (json) {
        if (typeof json == 'number' || typeof json == 'string' || typeof json == 'boolean') {
            return json;
        }
        else if (typeof json == 'object') {
            if (json instanceof Array) {
                var newArr = [], i, len = json.length;
                for (i = 0; i < len; i++) {
                    newArr[i] = arguments.callee(json[i]);
                }
                return newArr;
            }
            else {
                var newObj = {};
                for (var name in json) {
                    newObj[name] = !emer.isNullOrEmpty(json[name]) ? arguments.callee(json[name]) : '';
                }
                return newObj;
            }
        }
    }
    emer.dateAdd = function (date, strInterval, Number) {
        //参数分别为日期对象，增加的类型，增加的数量 
        var dtTmp = date;
        switch (strInterval) {
            case 'second':
            case 's':
                return new Date(Date.parse(dtTmp) + (1000 * Number));
            case 'minute':
            case 'n':
                return new Date(Date.parse(dtTmp) + (60000 * Number));
            case 'hour':
            case 'h':
                return new Date(Date.parse(dtTmp) + (3600000 * Number));
            case 'day':
            case 'd':
                return new Date(Date.parse(dtTmp) + (86400000 * Number));
            case 'week':
            case 'w':
                return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
            case 'month':
            case 'm':
                return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
            case 'year':
            case 'y':
                return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
        }
    }

    /*--------------------------------
     * emer reg 验证
     *================================*/
    emer.data.idCardCityCode = {
        11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江",
        34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆",
        51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港",
        82: "澳门", 91: "国外"
    };
    //验证身份证号
    emer.isIdCard = function (sId) {
        if (sId == 'TR2624302') return true; //排除日本 松本身份证号验证
        var iSum = 0, sBirthday;
        if (!/^\d{17}(\d|x)$/i.test(sId)) return false;//身份证长度或格式错误
        sId = sId.replace(/x$/i, "a");
        if (emer.data.idCardCityCode[parseInt(sId.substr(0, 2))] == null) return false;//身份证地区非法
        sBirthday = sId.substr(6, 4) + "-" + Number(sId.substr(10, 2)) + "-" + Number(sId.substr(12, 2));
        var d = new Date(sBirthday.replace(/-/g, "/"));
        if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) return false;//身份证上的出生日期非法
        for (var i = 17; i >= 0; i--) iSum += (Math.pow(2, i) % 11) * parseInt(sId.charAt(17 - i), 11);
        if (iSum % 11 != 1) return false;//身份证号非法
        return true;
    }
    emer.reg = {
        mobile: function (s) {
            if (s.length != 11) return false;
            return /^1[3-9]+\d{9}$/.test(s);
        },
        phone: function (s) {
            //var rex=/^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/;
            //区号：前面一个0，后面跟2-3位数字 ： 0\d{2,3}
            //电话号码：7-8位数字： \d{7,8
            //分机号：一般都是3位数字： \d{3,}
            //这样连接起来就是验证电话的正则表达式了：/^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/		 
            var rex = /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/;
            return emer.reg.mobile(s) || rex.test(s);
        },
        //邮编
        postalCode: function (s) {
            if (s.length != 6) return false;
            return /^[0-9]{6}$/.test(s);
        },
        //email
        email: function (s) {
            return /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(s);
        },
        //验证纯数字
        isNumber: function (s) {
            return /^[0-9]*$/.test(s);
        }
    };

    /*--------------------------------
     * emer browser 
     *================================*/
    emer.browser = function () {
        var agent = navigator.userAgent.toLowerCase(),
            opera = window.opera,
            browser = {
                ie: /(msie\s|trident.*rv:)([\w.]+)/.test(agent),
                opera: (!!opera && opera.version),
                webkit: (agent.indexOf(' applewebkit/') > -1),
                mac: (agent.indexOf('macintosh') > -1),
                quirks: (document.compatMode == 'BackCompat'),

                ipad: agent.match(/ipad/i) == "ipad",
                iphone: agent.match(/iphone os/i) == "iphone os",
                midp: agent.match(/midp/i) == "midp",
                uc7: agent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
                ucweb: agent.match(/ucweb/i) == "ucweb",
                android: agent.match(/android/i) == "android",
                windows_ce: agent.match(/windows ce/i) == "windows ce",
                windows_mobile: agent.match(/windows mobile/i) == "windows mobile",

                weixin: agent.match(/MicroMessenger/i) == "micromessenger",
                wxwork: (agent.match(/MicroMessenger/i) == 'micromessenger') && (agent.match(/wxwork/i) == 'wxwork')
            };

        browser.gecko = (navigator.product == 'Gecko' && !browser.webkit && !browser.opera && !browser.ie);

        var version = 0;

        if (browser.ie) {
            var v1 = agent.match(/(?:msie\s([\w.]+))/);
            var v2 = agent.match(/(?:trident.*rv:([\w.]+))/);
            if (v1 && v2 && v1[1] && v2[1]) {
                version = Math.max(v1[1] * 1, v2[1] * 1);
            } else if (v1 && v1[1]) {
                version = v1[1] * 1;
            } else if (v2 && v2[1]) {
                version = v2[1] * 1;
            } else {
                version = 0;
            }
            browser.ie11Compat = document.documentMode == 11;
            browser.ie9Compat = document.documentMode == 9;
            browser.ie8 = !!document.documentMode;
            browser.ie8Compat = document.documentMode == 8;
            browser.ie7Compat = ((version == 7 && !document.documentMode)
                    || document.documentMode == 7);
            browser.ie6Compat = (version < 7 || browser.quirks);
            browser.ie9above = version > 8;
            browser.ie9below = version < 9;
            browser.ie11above = version > 10;
            browser.ie11below = version < 11;
        }
        // Gecko.
        if (browser.gecko) {
            var geckoRelease = agent.match(/rv:([\d\.]+)/);
            if (geckoRelease) {
                geckoRelease = geckoRelease[1].split('.');
                version = geckoRelease[0] * 10000 + (geckoRelease[1] || 0) * 100 + (geckoRelease[2] || 0) * 1;
            }
        }
        if (/chrome\/(\d+\.\d)/i.test(agent)) {
            browser.chrome = +RegExp['\x241'];
        }
        if (/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)) {
            browser.safari = +(RegExp['\x241'] || RegExp['\x242']);
        }
        // Opera 9.50+
        if (browser.opera)
            version = parseFloat(opera.version());
        // WebKit 522+ (Safari 3+)
        if (browser.webkit)
            version = parseFloat(agent.match(/ applewebkit\/(\d+)/)[1]);

        browser.version = version;

        browser.isCompatible = ((browser.ie && version >= 6) ||
            (browser.gecko && version >= 10801) ||
            (browser.opera && version >= 9.5) ||
            (browser.air && version >= 1) ||
            (browser.webkit && version >= 522) ||
            false);

        browser.ios = (browser.ipad ||
            browser.iphone ||
            browser.midp ||
            false);

        browser.mobile = (browser.ipad ||
            browser.iphone ||
            browser.midp ||
            browser.uc7 ||
            browser.ucweb ||
            browser.android ||
            browser.windows_ce ||
            browser.windows_mobile ||
            false);

        browser.deviceName = (browser.ipad && 'ipad') ||
            (browser.iphone && 'iphone') ||
            (browser.midp && 'midp') ||
            (browser.uc7 && 'uc7') ||
            (browser.ucweb && 'ucweb') ||
            (browser.android && 'android') ||
            (browser.windows_ce && 'windows ce') ||
            (browser.windows_mobile && 'windows mobile') ||
            'pc';

        return browser;
    }();
    //快捷方式
    emer.ie = emer.browser.ie;
    emer.webkit = emer.browser.webkit;
    emer.gecko = emer.browser.gecko;
    emer.opera = emer.browser.opera;
    emer.ie8below = function () {
        return emer.ie && (emer.browser.version < 8 || emer.browser.ie7Compat || emer.browser.ie6Compat);
    }

    /*--------------------------------
     * emer decoder
     *================================*/
    emer.decoder = {
        base64EncodeChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        base64DecodeChars: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1,
            -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
            22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
            39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1],
        base64encode: function (str) {
            var out, i, len;
            var c1, c2, c3;
            var _base64EncodeChars = emer.decoder.base64EncodeChars;
            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                c1 = str.charCodeAt(i++) & 0xff;
                if (i == len) {
                    out += _base64EncodeChars.charAt(c1 >> 2);
                    out += _base64EncodeChars.charAt((c1 & 0x3) << 4);
                    out += "==";
                    break;
                }
                c2 = str.charCodeAt(i++);
                if (i == len) {
                    out += _base64EncodeChars.charAt(c1 >> 2);
                    out += _base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                    out += _base64EncodeChars.charAt((c2 & 0xF) << 2);
                    out += "=";
                    break;
                }
                c3 = str.charCodeAt(i++);
                out += _base64EncodeChars.charAt(c1 >> 2);
                out += _base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += _base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
                out += _base64EncodeChars.charAt(c3 & 0x3F);
            }
            return out;
        },
        base64decode: function (str) {
            var c1, c2, c3, c4;
            var i, len, out;
            var _base64DecodeChars = emer.decoder.base64DecodeChars;
            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                /* c1 */
                do {
                    c1 = _base64DecodeChars[str.charCodeAt(i++) & 0xff];
                }
                while (i < len && c1 == -1);
                if (c1 == -1)
                    break;
                /* c2 */
                do {
                    c2 = _base64DecodeChars[str.charCodeAt(i++) & 0xff];
                }
                while (i < len && c2 == -1);
                if (c2 == -1)
                    break;
                out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
                /* c3 */
                do {
                    c3 = str.charCodeAt(i++) & 0xff;
                    if (c3 == 61)
                        return out;
                    c3 = _base64DecodeChars[c3];
                }
                while (i < len && c3 == -1);
                if (c3 == -1)
                    break;
                out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
                /* c4 */
                do {
                    c4 = str.charCodeAt(i++) & 0xff;
                    if (c4 == 61)
                        return out;
                    c4 = _base64DecodeChars[c4];
                }
                while (i < len && c4 == -1);
                if (c4 == -1)
                    break;
                out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
            }
            return out;
        }
    };
    emer.encode = function (str) {
        return emer.decoder.base64encode(escape(str));
    }
    emer.decode = function (str) {
        return unescape(emer.decoder.base64decode(str));
    }

    /*--------------------------------
     * emer rmb
     *================================*/
    emer.rmb = {
        numToCny: function (inMoney) {
            if (isNaN(inMoney)) {
                alert("不是一个有效的数字，请重新输入！"); return;
            }
            var money1 = new Number(inMoney);
            if (money1 > 1000000000000000000) {
                alert("您输入的数字太大，重新输入！"); return;
            }
            var monee = Math.round(money1 * 100).toString(10)
            var i, j = 0, leng = monee.length, monval = "";
            for (i = 0; i < leng; i++) {
                monval = monval + emer.rmb.to_upper(monee.charAt(i)) + emer.rmb.to_mon(leng - i - 1);
            }
            return emer.rmb.repace_acc(monval);
        },
        to_upper: function (a) {
            switch (a) {
                case '0': return '零';
                case '1': return '壹';
                case '2': return '贰';
                case '3': return '叁';
                case '4': return '肆';
                case '5': return '伍';
                case '6': return '陆';
                case '7': return '柒';
                case '8': return '捌';
                case '9': return '玖';
                default: return '';
            }
        },
        to_mon: function (a) {
            if (a > 10) {
                a = a - 8;
                return (emer.rmb.to_mon(a));
            }
            switch (a) {
                case 0: return '分';
                case 1: return '角';
                case 2: return '元';
                case 3: return '拾';
                case 4: return '佰';
                case 5: return '仟';
                case 6: return '万';
                case 7: return '拾';
                case 8: return '佰';
                case 9: return '仟';
                case 10: return '亿';
            }
        },
        repace_acc: function (Money) {
            Money = Money.replace("零分", "").replace("零角", "零");
            var yy = 0, outmoney = Money;
            while (true) {
                var lett = outmoney.length;
                outmoney = outmoney.replace("零元", "元");
                outmoney = outmoney.replace("零万", "万");
                outmoney = outmoney.replace("零亿", "亿");
                outmoney = outmoney.replace("零仟", "零");
                outmoney = outmoney.replace("零佰", "零");
                outmoney = outmoney.replace("零零", "零");
                outmoney = outmoney.replace("零拾", "零");
                outmoney = outmoney.replace("亿万", "亿零");
                outmoney = outmoney.replace("万仟", "万零");
                outmoney = outmoney.replace("仟佰", "仟零");
                yy = outmoney.length;
                if (yy == lett) break;
            }
            yy = outmoney.length;
            if (outmoney.charAt(yy - 1) == '零') {
                outmoney = outmoney.substring(0, yy - 1);
            }
            yy = outmoney.length;
            if (outmoney.charAt(yy - 1) == '元') {
                outmoney = outmoney + '整';
            }
            return outmoney
        }
    };

    /*--------------------------------
     * emer parse&convert
     *================================*/
    emer.parseToDate = function (value) {
        if (value == null || value == '') return undefined;
        var dt;
        if (value instanceof Date) {
            dt = value;
        }
        else {
            if (!isNaN(value)) {
                dt = new Date(value);
            }
            else if (value.indexOf('/Date') > -1) {
                value = value.replace(/\/Date(−?\d+) \//, '$1');
                dt = new Date();
                dt.setTime(value);
            } else if (value.indexOf('/') > -1) {
                dt = new Date(Date.parse(value.replace(/-/g, '/')));
            } else {
                dt = new Date(value);
            }
        }
        return dt;
    }
    emer.parse2Float = function (s) {
        if (emer.isNullOrEmpty(s)) s = 0;
        return parseFloat(s);
    }
    emer.formatNumber = function (srcStr, nAfterDot) {
        var srcStr, nAfterDot, resultStr, nTen;
        srcStr = "" + srcStr + "";
        strLen = srcStr.length;
        dotPos = srcStr.indexOf(".", 0);
        if (dotPos == -1) {
            resultStr = srcStr + ".";
            for (i = 0; i < nAfterDot; i++) {
                resultStr = resultStr + "0";
            }
        }
        else {
            if ((strLen - dotPos - 1) >= nAfterDot) {
                nAfter = dotPos + nAfterDot + 1;
                nTen = 1;
                for (j = 0; j < nAfterDot; j++) {
                    nTen = nTen * 10;
                }
                resultStr = Math.round(parseFloat(srcStr) * nTen) / nTen;
            }
            else {
                resultStr = srcStr;
                for (i = 0; i < (nAfterDot - strLen + dotPos + 1) ; i++) {
                    resultStr = resultStr + "0";
                }
            }
        }
        return resultStr;
    }

    emer.numToString = function (num, len) {
        var numStrLen = num.toString().length;
        var startStr = '';
        for (var i = 0; i < len - numStrLen; i++) {
            startStr += '0';
        }
        return startStr + num.toString();
    }
    emer.htm2txt = function (str_htm) {
        var t, tmp = $("<span></span>").html(str_htm);
        t = tmp.text();
        tmp.remove();
        return t;
    }
    /**
     * 创建多行字符串
     * var tmpl = heredoc(function(){/*
     * XXXXXX
     * /}
     **/
    emer.heredoc = function (fn) {
        return fn.toString().split('\n').slice(1, -1).join('\n') + '\n';
    }

    emer.doEscape = function (v) {
        return escape(escape(v).replace(/\+/g, '%2B').replace(/\"/g, '%22').replace(/\'/g, '%27').replace(/\//g, '%2F').replace(/\#/g, '%23')) || '';
    }
    emer.jsonValueEncode = function (jsonObj) {
        if (jsonObj) {
            $.each(jsonObj, function (name, value) {
                jsonObj[name] = emer.doEscape(value);
            });
        }
        return jsonObj
    }

    //判断浏览器是否支持图片的base64
    emer.supportBase64 = function () {
        var support = true, data = new Image();
        data.onload = data.onerror = function () {
            if (this.width != 1 || this.height != 1) support = false;
        }
        data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        return support;
    }
    //检测是否已经安装flash，检测flash的版本
    emer.flashVersion = function () {
        var version;
        try {
            version = navigator.plugins['Shockwave Flash'];
            version = version.description;
        } catch (ex) {
            try {
                version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
            } catch (ex2) {
                version = '0.0';
            }
        }
        version = version.match(/\d+/g);
        return parseFloat(version[0] + '.' + version[1], 10);
    }
    ////检测浏览器是否支持Transition
    emer.supportTransition = function () {
        var s = document.createElement('p').style,
            r = 'transition' in s ||
                'WebkitTransition' in s ||
                'MozTransition' in s ||
                'msTransition' in s ||
                'OTransition' in s;
        s = null;
        return r;
    }

    /*--------------------------------
     * emer public
     *================================*/
    emer.oa_emerail_cn = {
        host: "http://oa.emerail.cn",
        port: "998"
    }
    emer.oa_host = 'https://oa.guitea.com';
    emer.api_host = emer.api_node_host = "https://api.guitea.com";
    emer.res_host = 'https://res.guitea.com';
    emer.doc_host = 'https://doc.guitea.com';
    emer.cn_emerail_host = 'https://www.guitea.com';
    emer.bemytea_host = 'http://www.bemytea.cn';
    emer.info_guitea_host = 'https://info.guitea.com';

    //emer.doc_host = 'http://10.10.20.23:897';//测试用
    //emer.cn_emerail_host = 'http://10.10.20.24:991';//测试用

    emer.sarea = emer.websrc = emer.queryString('sarea') || 'gcoa';
    emer.area = emer.sarea.replace('test', '');

    return emer;
}(jQuery);

+function (emer) {
    emer.validate = {};
    //部门是否营销部门
    emer.validate.deptIsYxzx = function (dept) {
        switch (emer.area) {
            case "gcoa": {
                return dept.indexOf('10109') == 0
                    || dept.indexOf('11609') == 0
                    || dept.indexOf('113') == 0;
            }
            case "jcoa": {
                return dept.indexOf('102') == 0;
            }
            case "bemytea": {
                return dept.indexOf('402') == 0;
            }
            default: return false;
        }
    }

    emer.deviceDis = {
        "VIE-AL00": "华为 P9 Plus",
        "VTR-AL00": "华为 P10",
        "VKY-AL00": "华为 P10 Plus",
        "EML-AL00": "华为 P20",
        "CTL-AL00": "华为 P20 Pro",
        "ELE-AL00": "华为 P30",
        "VOG-AL00": "华为 P30 Pro",
        "VOG-TL00": "华为 P30 Pro",
        "VOG-AL10": "华为 P30 Pro",

        "LND-TL40": "华为 荣耀畅玩7C",
        "PRA-AL00": "华为 荣耀8青春",
        "PRA-AL00X": "华为 荣耀8青春",
        "JSN-AL00": "华为 荣耀8X",
        "JSN-AL00a": "华为 荣耀8X",
        "STF-AL00": "华为 荣耀9",
        "LLD-AL00": "华为 荣耀9青春",
        "LLD-AL10": "华为 荣耀9青春",
        "LLD-AL20": "华为 荣耀9i",
        "LLD-AL30": "华为 荣耀9i",
        "HLK-AL00": "华为 荣耀9X",
        "DUK-AL20": "华为 荣耀V9",
        "COL-AL00": "华为 荣耀10",
        "COL-AL10": "华为 荣耀10",
        "HRY-AL00": "华为 荣耀10青春",
        "HRY-AL00a": "华为 荣耀10青春",
        "BKL-AL20": "华为 荣耀V10",
        "YAL-AL00": "华为 荣耀20",

        "SLA-AL00": "华为 畅享7",
        "TRT-AL00A": "华为 畅享7 Plus",
        "JKM-AL00": "华为 畅享9 Plus",

        "PAR-AL00": "华为 nova3",
        "ANE-AL00": "华为 nova3e",
        "INE-AL00": "华为 nova3/3i",
        "VCE-AL00": "华为 nova4",
        "MAR-AL00": "华为 nova4e",
        "SEA-AL00": "华为 nova5 Pro",
        "SEA-AL10": "华为 nova5 Pro",

        "ALP-AL00": "华为 Mate10",
        "ALP-TL00": "华为 Mate10",
        "BLA-AL00": "华为 Mate10 Pro",
        "HMA-TL00": "华为 Mate20",
        "HMA-AL00": "华为 Mate20",
        "LYA-AL00": "华为 Mate20 Pro",
        "TAS-AL00": "华为 Mate30",
        "LIO-AL00": "华为 Mate30 Pro",
        "LIO-AN00": "华为 Mate30 Pro(5G)",

        "PCAT00": "OPPO Reno",
        "PCKM00": "OPPO Reno2",
        "PBAM00": "OPPO A5",
        "PBBM00": "OPPO A7x",
        "PBBT00": "OPPO A7x",
        "PCAM10": "OPPO A9",
        "PAAM00": "OPPO R15",

        "V1732T": "vivo Y81s",
        "V1818CT": "vivo Y93S",
        "V1813T": "vivo Z3i",
        "V1921A": "vivo Z5",
        "V1901A": "vivo Y3",

        "1807-A01": "360 N7",

        "PRO 7-H": "魅族PRO7-H"
    };
    emer.getDeviceDisName = function (name) {
        if (name && name.indexOf('(') > 0) {
            var device = name.split('(')[1].split(')')[0];
            var device_dis = emer.deviceDis[device];
            if (device_dis) return device_dis;

            if (device.indexOf('-AL') > 0 ||
                device.indexOf('-TL') > 0 ||
                device.indexOf('-AN') > 0) {
                return '华为(' + device + ')';
            }
            if (device.indexOf('P') == 0 && device.length == 6) {
                return 'OPPO(' + device + ')';
            }
            if (device.indexOf('V1') == 0 && device.length <= 7) {
                return 'vivo(' + device + ')';
            }
            return device;
        }
        return name;
    }
    emer.getDeviceIconCls = function (value) {
        var v = (value + '').toLowerCase().split('(')[0];
        switch (v) {
            case "pc": return value.indexOf('Mac OS') > 0 ? 'fa fa-laptop' : 'fa fa-tv';
            case "mobile":
            case "iphone":
            case "android": return "fa fa-mobile-phone";
            case "tablet":
            case "ipad": return "fa fa-tablet";
            default: return '';
        }
    }

    return emer;
}(emer);

+function (emer) {
    emer.surl = function (url, _sarea) {
        if (url.indexOf('sarea=') > 0) return url;
        var sarea = _sarea || emer.sarea;
        return url + (url.indexOf('?') > 0 ? '&' : '?') + 'sarea=' + sarea;
    }
    emer.url = function (url) {
        if (emer.loginUser) {
            if (url.indexOf('sarea=') > 0) {
                return url + '&uid=' + emer.loginUser.UserCode;
            }
            return url + (url.indexOf('?') > 0 ? '&' : '?')
                + 'sarea=' + emer.sarea
                + '&uid=' + emer.loginUser.UserCode;
        }
        return emer.surl(url);
    }
    emer.url_index = function () {
        return emer.surl("/index.html");
    }

    emer.isSuperManager = function () {
        return emer.loginUser && emer.loginUser.IsSuperManager == 'Y';
    }
    emer.isItManager = function () {
        return emer.loginUser && emer.loginUser.IsManager == 'Y';
    }
    emer.isRiskManager = function () {
        return emer.loginUser && emer.loginUser.IsRisk == 'Y';
    }

    /*--------------------------------
     * chart
     * add 2020-04-24 by wangshw
     *================================*/
    emer.chart = {
        def_opts: {
            apiUrl: "/gcbi/it/getChart",
            apiOpts: {
                chartConfig: {
                    title: {
                        fontSize: 22
                    },
                    toolTip: {
                        shared: true
                    }
                }
            }
        },
        onFuncInit: function (opts) {
            if (opts.legend && opts.legend.itemclick) {
                opts.legend.itemclick = (new Function('return ' + opts.legend.itemclick))();
            }
        },
        onSeriesHideClick: function (e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
    };
    emer.chart_def = emer.chart.def_opts;

    //加载图表
    emer.loadChart = function (opts, callback) {
        opts = $.extend(true, {}, emer.chart_def, opts);
        emer.guiteaApi({
            url: opts.apiUrl,
            jparam: opts.apiOpts,
            apiSuccess: function (r) {
                if (r.data && r.data.chartOpts) {
                    var chartOpts = r.data.chartOpts;
                    emer.chart.onFuncInit(chartOpts);

                    var chart = new CanvasJS.Chart(chartOpts.chartId, chartOpts);
                    chart.render();

                    if (callback) {
                        callback(chart, chartOpts);
                    }
                }
                else {
                    $.messager.alert("提示", "chartOpts为空，无法初始化图表！", "info");
                }
            }
        });
    }

    return emer;
}(emer);