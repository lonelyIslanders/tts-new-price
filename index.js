const request = require('request');
const config = require('./config');
const fs = require('fs');
const tencentcloud = require('tencentcloud-sdk-nodejs-tts')
const TtsClient = tencentcloud.tts.v20190823.Client;

const clientConfig = {
    credential: {
        secretId: "AKIDQgorfEbmhLh5KNI2au6B9xZ1IROI5hM5",
        secretKey: "dD6uVt3e8f6RipiP2jMpDRTM3f4HJbij",
    },
    region: "ap-nanjing",
    profile: {
        httpProfile: {
            endpoint: "tts.tencentcloudapi.com",
        },
    },
};



async function sayCoinStatus(statusData) {
    if (statusData.alert == 0) {
        console.log('不用播报');
        return;
    }
    const content = `${statusData.symbol + statusData.trend + statusData.price}刀,现报${statusData.nowPrice}`;
    const reqTime = Date.now().toString();
    console.log(content);
    console.log(reqTime);

    const client = new TtsClient(clientConfig);
    const params = {
        "Text": content,
        "SessionId": reqTime
    };
    client.TextToVoice(params).then(
        (data) => {
            const audio = Buffer.from(data.Audio.toString(), 'base64');
            fs.writeFile('./audio.wav', audio, (err) => {
                if (err) {
                    console.log(err)
                }
            });
        },
        (err) => {
            console.error("error", err);
        }
    );
}








const url = 'https://api.binance.com/api/v3/ticker/price?symbols=';

if (fs.existsSync('./priceData.json')) {
    console.log("文件存在");
}
else {
    console.log("文件不存在，执行写入")
    fs.writeFile('./priceData.json', "666", (err) => {
    });
}


function readData() {
    return new Promise((res, rej) => {
        fs.readFile('./priceData.json', (err, data) => {
            if (err) {
                rej(err);
                return;
            }
            res(JSON.parse(data));
            return;
        })
    })
}



function getPrice(coinArray) {
    return new Promise((res, rej) => {
        const options = {
            url: `${url + JSON.stringify(coinArray)}`,
            timeout: 10000
        };

        request.get(options, (err, data) => {
            if (err) {
                rej(err);
                return;
            }
            const result = JSON.parse(data.body);
            res(result);
        })
    })
}

function writeDataAsync(data, path) {
    fs.writeFile(path, JSON.stringify(data), (err) => {
        if (err) {
            console.log(err);
        }
    })
}


async function operate(a, b) {
    return new Promise((res, rej) => {
        let result;
        let arr = [];
        const oldSymbolArr = a.latest.newData.map(item => item.symbol);
        const oldPriceArr = a.latest.newData.map(item => item.price);
        const newSymbolArr = b.map(item => item.symbol);
        const newPriceArr = b.map(item => item.price);
        const nowTimeStamp = Date.now();

        a.latest = { timestamp: nowTimeStamp, newData: b }
        writeDataAsync(a, './priceData.json');
        //还是以新symbol为准
        for (let i = 0; i < newSymbolArr.length; i++) {//循环新数组
            if (newPriceArr[i] - oldPriceArr[i] >= 0) {//新旧数据价格比较
                const diffNum = Math.abs(newPriceArr[i] - oldPriceArr[i]);
                const percent = Math.round(diffNum / oldPriceArr[i] * 10000) / 100.00;
                if (percent > 0.15) {
                    console.log(newSymbolArr[i], '暴涨啦');
                    result = { alert: 1, symbol: newSymbolArr[i].replace('USDT', ''), trend: '上涨', price: diffNum < 1 ? Math.floor(diffNum * 1000) / 1000 : Math.floor(diffNum * 100) / 100, percent: '涨幅' + percent + '%', nowPrice: newPriceArr[i] < 1 ? Math.floor(newPriceArr[i] * 1000) / 1000 : Math.floor(newPriceArr[i] * 100) / 100 };
                    arr.push(result);
                    res(arr);
                } else {
                    console.log(newSymbolArr[i], "无剧烈波动");
                    // result = { alert: 0 };
                    // arr.push(result);
                    res(arr)
                }
            } else {//币跌
                const diffNum = Math.abs(newPriceArr[i] - oldPriceArr[i]);
                const percent = Math.round(diffNum / oldPriceArr[i] * 10000) / 100.00;
                if (percent > 0.15) {
                    console.log(newSymbolArr[i], '暴跌啦');
                    result = { alert: 1, symbol: newSymbolArr[i].replace('USDT', ''), trend: '下跌', price: diffNum < 1 ? Math.floor(diffNum * 1000) / 1000 : Math.floor(diffNum * 100) / 100, percent: '跌幅' + percent + '%', nowPrice: newPriceArr[i] < 1 ? Math.floor(newPriceArr[i] * 1000) / 1000 : Math.floor(newPriceArr[i] * 100) / 100 };
                    arr.push(result)
                    res(arr);
                } else {
                    console.log(newSymbolArr[i], "无剧烈波动");
                    // result = { alert: 0 };
                    // arr.push(result);
                    res(arr)
                }
            }
            res(arr)
        }
        res(arr);
        return;
    })
}


async function judgeStoredDataAndWrite(oldData, newData) {
    return new Promise((res, rej) => {
        let result;
        const nowTimeStamp = Date.now();
        const fiveAgoSymbolArr = oldData.ago.five.newData.map(item => item.symbol);
        const fiveAgoPriceArr = oldData.ago.five.newData.map(item => item.price);
        const fiveAgoTimeStamp = oldData.ago.five.timestamp;

        const fifteenAgoSymbolArr = oldData.ago.fifteen.newData.map(item => item.symbol);
        const fifteenAgoPriceArr = oldData.ago.fifteen.newData.map(item => item.price);
        const fifteenAgoTimeStamp = oldData.ago.fifteen.timestamp;

        const hourAgoSymbolArr = oldData.ago.hour.newData.map(item => item.symbol);
        const hourAgoPriceArr = oldData.ago.hour.newData.map(item => item.price);
        const hourAgoTimeStamp = oldData.ago.hour.timestamp;

        const newDataSymbolArr = newData.map(item => item.symbol);
        const newDataPriceArr = newData.map(item => item.price);
        console.log(fiveAgoTimeStamp);


        for (let i = 0; i < fiveAgoSymbolArr.length; i++) {
            if (newDataPriceArr[i] - fiveAgoPriceArr[i] >= 0) {//币涨
                if (nowTimeStamp - fiveAgoTimeStamp >= 300000) {
                    const diffNum = Math.abs(newDataPriceArr[i] - fiveAgoPriceArr[i]);
                    const percent = Math.round(diffNum / fiveAgoPriceArr[i] * 10000) / 100.00;
                    if (percent > 0.2) {
                        console.log(newDataSymbolArr[i], '5分钟暴涨啦');
                        oldData.ago.five = { timestamp: nowTimeStamp, newData: newData };
                        fs.writeFile('./priceData.json', JSON.stringify(oldData), (err) => {
                            if (err) {
                                console.log('写入5失败');
                                return;
                            }
                        })
                        result = { alert: 1, symbol: newDataSymbolArr[i].replace('USDT', ''), trend: '上涨', price: diffNum.toFixed(2), percent: "涨幅" + percent + '%', nowPrice: newDataPriceArr[i] };
                        res(result);
                        return;
                    } else {
                        console.log(newDataSymbolArr[i], "5分钟无剧烈波动");
                        result = { alert: 0 };
                    }
                }
            } else {//币跌
                const diffNum = Math.abs(newDataPriceArr[i] - fiveAgoPriceArr[i]);
                const percent = Math.round(diffNum / fiveAgoPriceArr[i] * 10000) / 100.00;
                if (percent > 0.2) {
                    console.log(newDataSymbolArr[i], '5分钟暴跌啦');
                    oldData.ago.five = { timestamp: nowTimeStamp, newData: newData };
                    fs.writeFile('./priceData.json', JSON.stringify(oldData), (err) => {
                        if (err) {
                            console.log('写入5失败');
                            return;
                        }
                    })
                    result = { alert: 1, symbol: newDataSymbolArr[i].replace('USDT', ''), trend: '下跌', price: diffNum.toFixed(2), percent: '跌幅' + percent + '%', nowPrice: newDataPriceArr[i] };
                    res(result);
                    return;
                }
            }
        }

        for (let i = 0; i < fifteenAgoSymbolArr.length; i++) {
            if (newDataPriceArr[i] - fifteenAgoSymbolArr[i] >= 0) {//币涨
                if (nowTimeStamp - fifteenAgoTimeStamp >= 900000) {
                    const diffNum = Math.abs(newDataPriceArr[i] - fifteenAgoSymbolArr[i]);
                    const percent = Math.round(diffNum / fifteenAgoSymbolArr[i] * 10000) / 100.00;
                    if (percent > 0.3) {
                        console.log(newDataSymbolArr[i], '15分钟暴涨啦');
                        oldData.ago.five = { timestamp: nowTimeStamp, newData: newData };
                        fs.writeFile('./priceData.json', JSON.stringify(oldData), (err) => {
                            if (err) {
                                console.log('写入15失败');
                                return;
                            }
                        })
                        result = { alert: 1, symbol: newDataSymbolArr[i].replace('USDT', ''), trend: '上涨', price: diffNum.toFixed(2), percent: "涨幅" + percent + '%', nowPrice: newDataPriceArr[i] };
                        res(result);
                        return;
                    } else {
                        console.log(newDataSymbolArr[i], "15分钟剧烈波动");
                        result = { alert: 0 };
                    }
                }
            } else {//币跌
                const diffNum = Math.abs(newDataPriceArr[i] - fifteenAgoSymbolArr[i]);
                const percent = Math.round(diffNum / fifteenAgoSymbolArr[i] * 10000) / 100.00;
                if (percent > 0.3) {
                    console.log(newDataSymbolArr[i], '15分钟暴跌啦');
                    oldData.ago.five = { timestamp: nowTimeStamp, newData: newData };
                    fs.writeFile('./priceData.json', JSON.stringify(oldData), (err) => {
                        if (err) {
                            console.log('写入15失败');
                            return;
                        }
                    })
                    result = { alert: 1, symbol: newDataSymbolArr[i].replace('USDT', ''), trend: '下跌', price: diffNum.toFixed(2), percent: '跌幅' + percent + '%', nowPrice: newDataPriceArr[i] };
                    res(result);
                    return;
                }
            }
        }

        for (let i = 0; i < hourAgoSymbolArr.length; i++) {
            if (newDataPriceArr[i] - hourAgoSymbolArr[i] >= 0) {//币涨
                if (nowTimeStamp - hourAgoTimeStamp >= 3600000) {
                    const diffNum = Math.abs(newDataPriceArr[i] - hourAgoSymbolArr[i]);
                    const percent = Math.round(diffNum / hourAgoSymbolArr[i] * 10000) / 100.00;
                    if (percent > 0.25) {
                        console.log(newDataSymbolArr[i], '1小时暴涨啦');
                        oldData.ago.five = { timestamp: nowTimeStamp, newData: newData };
                        fs.writeFile('./priceData.json', JSON.stringify(oldData), (err) => {
                            if (err) {
                                console.log('写入60失败');
                                return;
                            }
                        })
                        result = { alert: 1, symbol: newDataSymbolArr[i].replace('USDT', ''), trend: '上涨', price: diffNum.toFixed(2), percent: "涨幅" + percent + '%', nowPrice: newDataPriceArr[i] };
                        res(result);
                        return;
                    } else {
                        console.log(newDataSymbolArr[i], "1小时无剧烈波动");
                        result = { alert: 0 };
                    }
                }
            } else {//币跌
                const diffNum = Math.abs(newDataPriceArr[i] - hourAgoSymbolArr[i]);
                const percent = Math.round(diffNum / hourAgoSymbolArr[i] * 10000) / 100.00;
                if (percent > 0.25) {
                    console.log(newDataSymbolArr[i], '1小时暴跌啦');
                    oldData.ago.five = { timestamp: nowTimeStamp, newData: newData };
                    fs.writeFile('./priceData.json', JSON.stringify(oldData), (err) => {
                        if (err) {
                            console.log('写入60失败');
                            return;
                        }
                    })
                    result = { alert: 1, symbol: newDataSymbolArr[i].replace('USDT', ''), trend: '下跌', price: diffNum.toFixed(2), percent: '跌幅' + percent + '%', nowPrice: newDataPriceArr[i] };
                    res(result);
                    return;
                }
            }
        }
        res(result);


        // for (let i = 0; i < fifteenAgoSymbolArr.length; i++) { }








        if (typeof oldData !== 'object') {
            const willWriteData = {
                latest: { timestamp: nowTimeStamp, newData },
                ago: {
                    five: { timestamp: nowTimeStamp, newData },
                    fifteen: { timestamp: nowTimeStamp, newData },
                    hour: { timestamp: nowTimeStamp, newData },
                    day: { timestamp: nowTimeStamp, newData }
                }
            }

            fs.writeFile('./priceData.json', JSON.stringify(willWriteData), (err) => {
                if (err) {
                    console.log('写入失败');
                    return;
                }
            })
            return;
        }
        oldData.latest.timestamp = nowTimeStamp;
        oldData.latest.newData = newData;
        if (nowTimeStamp - oldData.ago.five.timestamp >= 300000) {//5分钟
            oldData.latest = { timestamp: nowTimeStamp, newData: newData }//顺手把最新价格更新下
            console.log('五分钟判断');

            oldData.ago.five = { timestamp: nowTimeStamp, newData: newData }
            fs.writeFile('./priceData.json', JSON.stringify(oldData), (err) => {
                if (err) {
                    console.log("写入五分失败");
                    return;
                }
            })
            return;
        }
        if (nowTimeStamp - oldData.ago.fifteen.timestamp >= 900000) {//15分钟
            oldData.latest = { timestamp: nowTimeStamp, newData: newData }
            console.log('十五分钟判断');
            oldData.ago.fifteen = { timestamp: nowTimeStamp, newData: newData };
            fs.writeFile('./priceData.json', JSON.stringify(oldData), (err) => {
                if (err) {
                    console.log("写入十五分失败");
                    return
                }
            })
            return;
        }

        if (nowTimeStamp - oldData.ago.fifteen.timestamp >= 3600000) {//60分钟
            oldData.latest = { timestamp: nowTimeStamp, newData: newData };
            console.log('六十分钟判断');
            oldData.ago.fifteen = { timestamp: nowTimeStamp, newData: newData };
            fs.writeFile('./priceData.json', JSON.stringify(oldData), (err) => {
                if (err) {
                    console.log("写入六十分失败");
                    return
                }
            })
            return;
        }

        console.log("都不满足，最后更新最新价格");
        fs.writeFile('./priceData.json', JSON.stringify(oldData), (err) => {
            if (err) {
                console.log("写入最新价失败");
                return;
            }
        })
    })
}


async function timeBlockOpeate(a, b) {
    return new Promise((res, rej) => {
        const fiveAgoSymbol = a.ago.five.newData.map(item => item.symbol);
        const fiveAgoPrice = a.ago.five.newData.map(item => item.price);
        const fifteenAgoSymbol = a.ago.fifteen.newData.map(item => item.symbol);
        const fifteenAgoPrice = a.ago.fifteen.newData.map(item => item.price);
        const hourAgoSymbol = a.ago.hour.newData.map(item => item.symbol);
        const hourAgoPrice = a.ago.hour.newData.map(item => item.price);
        const newSymbol = b.map(item => item.price);
        const newPrice = b.map(item => item.price);
        const nowTimeStamp = Date.now();
        let result;
        let arr = []


        for (let i in newSymbol) {//循环遍历新币价
            if (nowTimeStamp - a.ago.five.timestamp >= 300000) {//如果五分钟了
                a.ago.five = { timestamp: nowTimeStamp, newData: b }
                writeDataAsync(a, './priceData.json');
                if (newPrice[i] - fiveAgoPrice[i] >= 0) { //如果当前某个币价比五分钟前高了
                    console.log(fiveAgoSymbol[i], '5分涨', newPrice[i] - fiveAgoPrice[i]);
                    const diffNum = Math.abs(newPrice[i] - fiveAgoPrice[i]);
                    const percent = Math.round(diffNum / fiveAgoPrice[i] * 10000) / 100.00;
                    if (percent >= 0.2) {
                        result = { alert: 1, symbol: fiveAgoSymbol[i], trend: "5分钟内上涨", price: diffNum < 1 ? Math.floor(diffNum * 1000) / 1000 : Math.floor(diffNum * 100) / 100, percent: '涨幅' + percent + '%', nowPrice: newPrice[i] < 1 ? Math.floor(newPrice[i] * 1000) / 1000 : Math.floor(newPrice[i] * 100) / 100 };
                        arr.push(result);
                        res(arr);
                    }
                } else {
                    console.log(fiveAgoSymbol[i], '5分跌');
                    const diffNum = Math.abs(newPrice[i] - fiveAgoPrice[i]);
                    const percent = Math.round(diffNum / fiveAgoPrice[i] * 10000) / 100.00;
                    if (percent >= 0.2) {
                        result = { alert: 1, symbol: fiveAgoSymbol[i], trend: "5分钟内下跌", price: diffNum < 1 ? Math.floor(diffNum * 1000) / 1000 : Math.floor(diffNum * 100) / 100, percent: '涨幅' + percent + '%', nowPrice: newPrice[i] < 1 ? Math.floor(newPrice[i] * 1000) / 1000 : Math.floor(newPrice[i] * 100) / 100 };
                        arr.push(result);
                        res(arr);
                    }
                }
                res(arr);
            }
            res(arr);

            if (nowTimeStamp - a.ago.fifteen.timestamp >= 900000) {//如果15分钟了
                a.ago.fifteen = { timestamp: nowTimeStamp, newData: b }
                writeDataAsync(a, './priceData.json');
                if (newPrice[i] - fifteenAgoPrice[i] >= 0) {
                    console.log(fifteenAgoSymbol[i], '15分涨');
                    const diffNum = Math.abs(newPrice[i] - fifteenAgoPrice[i]);
                    const percent = Math.round(diffNum / fifteenAgoPrice[i] * 10000) / 100.00;
                    if (percent >= 0.3) {
                        result = { alert: 1, symbol: fifteenAgoPrice[i], trend: "15分钟内上涨", price: diffNum < 1 ? Math.floor(diffNum * 1000) / 1000 : Math.floor(diffNum * 100) / 100, percent: '涨幅' + percent + '%', nowPrice: newPrice[i] < 1 ? Math.floor(newPrice[i] * 1000) / 1000 : Math.floor(newPrice[i] * 100) / 100 };
                        arr.push(result);
                        res(arr);
                    }
                } else {
                    console.log(fifteenAgoSymbol[i], '15分跌');
                    const diffNum = Math.abs(newPrice[i] - fifteenAgoPrice[i]);
                    const percent = Math.floor(diffNum / fifteenAgoPrice[i] * 10000) / 100.00;
                    if (percent >= 0.3) {
                        result = { alert: 1, symbol: fifteenAgoPrice[i], trend: "15分钟内下跌", price: diffNum < 1 ? Math.floor(diffNum * 1000) / 1000 : Math.floor(diffNum * 100) / 100, percent: '跌幅' + percent + '%', nowPrice: newPrice[i] < 1 ? Math.floor(newPrice[i] * 1000) / 1000 : Math.floor(newPrice[i] * 100) / 100 };
                        arr.push(result);
                        res(arr);
                    }
                }
                res(arr);
            }
            if (nowTimeStamp - a.ago.hour.timestamp >= 3600000) {//如果60分钟了
                a.ago.hour = { timestamp: nowTimeStamp, newData: b }
                writeDataAsync(a, './priceData.json');
                if (newPrice[i] - hourAgoPrice[i] >= 0) {
                    console.log(hourAgoSymbol[i], '60分涨');
                    const diffNum = Math.abs(newPrice[i] - hourAgoPrice[i]);
                    const percent = Math.round(diffNum / hourAgoPrice[i] * 10000) / 100.00;
                    if (percent >= 0.3) {
                        result = { alert: 1, symbol: hourAgoPrice[i], trend: "1小时内上涨", price: diffNum < 1 ? Math.floor(diffNum * 1000) / 1000 : Math.floor(diffNum * 100) / 100, percent: '涨幅' + percent + '%', nowPrice: newPrice[i] < 1 ? Math.floor(newPrice[i] * 1000) / 1000 : Math.floor(newPrice[i] * 100) / 100 };
                        arr.push(result);
                        res(arr);
                    }
                } else {
                    console.log(fifteenAgoSymbol[i], '15分跌');
                    const diffNum = Math.abs(newPrice[i] - fifteenAgoPrice[i]);
                    const percent = Math.floor(diffNum / fifteenAgoPrice[i] * 10000) / 100.00;
                    if (percent >= 0.3) {
                        result = { alert: 1, symbol: fifteenAgoPrice[i], trend: "1小时内下跌", price: diffNum < 1 ? Math.floor(diffNum * 1000) / 1000 : Math.floor(diffNum * 100) / 100, percent: '跌幅' + percent + '%', nowPrice: newPrice[i] < 1 ? Math.floor(newPrice[i] * 1000) / 1000 : Math.floor(newPrice[i] * 100) / 100 };
                        arr.push(result);
                        res(arr);
                    }
                }
                res(arr);
            }
            res(arr);
        }
        res(arr);
        return;
    })
}


(async () => {
    const oldData = await readData();//上次币价,priceData.json数据，首次就是666数据

    const newData = await getPrice(config.coinArray);//最新币价[{"symbol": "BTCUSDT","price": "17448.37000000"}],

    const re = await operate(oldData, newData);//只计算当前时间与上一次价格差异并更新最新价格

    const res = await timeBlockOpeate(oldData, newData);//用于计算5、15、60分钟变化

    // if (re.length == 0 && res.length == 0) {
    //     return;
    // }

    console.log(re)
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    console.log(res)
    // await sayCoinStatus(re);
})()

