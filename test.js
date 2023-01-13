
const arr1 = [
    { symbol: 'BTCUSDT', price: '17218.44000000' },
    { symbol: 'ETHUSDT', price: '1327.88000000' },
    { symbol: 'BNBUSDT', price: '274.50000000' },
]
const arr2 = [
    { symbol: 'BTCUSDT', price: '17218' },
    { symbol: 'ETHUSDT', price: '1327' },
    { symbol: 'BNBUSDT', price: '274.50000000' },
]
async function op(oldArr, newArr) {
    return new Promise((res, rej) => {
        let result;
        const oldSymbolArr = oldArr.map(item => item.symbol);
        const oldPriceArr = oldArr.map(item => item.price);
        const newSymbolArr = newArr.map(item => item.symbol);
        const newPriceArr = newArr.map(item => item.price);
        //差异判断待写
        for (let i = 0; i < newPriceArr.length; i++) {
            if (newPriceArr[i] - oldPriceArr[i] >= 0) {//币涨
                const diffNum = Math.abs(newPriceArr[i] - oldPriceArr[i]);
                const percent = Math.round(diffNum / oldPriceArr[i] * 10000) / 100.00;
                if (percent > 0.1) {
                    console.log(newSymbolArr[i], '暴涨啦');
                    result = { alert: 1, symbol: newSymbolArr[i].replace('USDT', ''), trend: '上涨', price: diffNum.toFixed(2), percent: '涨幅' + percent + '%', nowPrice: newPriceArr[i] };
                    res(result);
                    return;
                } else {
                    console.log(newSymbolArr[i], "无剧烈波动");
                    result = { alert: 0 };
                    // res(result);
                    // return;
                }
            } else {//币跌
                const diffNum = Math.abs(newPriceArr[i] - oldPriceArr[i]);
                const percent = Math.round(diffNum / oldPriceArr[i] * 10000) / 100.00;
                if (percent > 0.1) {
                    console.log(newSymbolArr[i], '暴跌啦');
                    result = { alert: 1, symbol: newSymbolArr[i].replace('USDT', ''), trend: '下跌', price: diffNum.toFixed(2), percent: '跌幅' + percent + '%', nowPrice: newPriceArr[i] };
                    res(result);
                    return;
                } else {
                    console.log(newSymbolArr[i], "无剧烈波动");
                    result = { alert: 0 };
                    // res(result);
                    // return;
                }
            }
        }
        res(result);
        return;
    })
}

op(arr1, arr2).then(v => console.log(v))







// //可读性极差，但好像可以搞
// const a1 = oldArr.map(item => item.symbol);//旧数据symbol
// const a2 = oldArr.map(item => item.price);//旧数据price

// const b1 = newArr.map(item => item.symbol);//新数据symbol
// const b2 = newArr.map(item => item.price);//新数据price

// for (let i = 0; i < a1.length; i++) {
//     let sayCoin;
//     let diffPrice;
//     if (b2[i] - a2[i] < 0) {//现价比前价低了，跌了
//         const diffNum = Math.abs(b2[i] - a2[i]);//差值
//         const percent = Math.round(diffNum / a2[i] * 10000) / 100.00;
//         if (percent > 0.1) {
//             console.log(a1[i], "暴跌拉");
//             sayCoin = a1[i].replace('USDT', '');
//             diffPrice = diffNum;
//             const result = { alert: 1, symbol: sayCoin, trend: '上涨', price: diffNum.toFixed(2), percent: '涨幅' + percent + '%', nowPrice: b2[i] };
//             console.log(result)
//             return result;
//         }
//     }
//     else {
//         const diffNum = Math.abs(b2[i] - a2[i])//
//         const percent = Math.round(diffNum / a2[i] * 10000) / 100.00;
//         if (percent > 0.1) {
//             console.log(a1[i], "暴涨拉")
//         }
//     }
// }

// const alen = a1.length;
// const blen = b1.length;
// const json = { "old": { "symbol": a1, "price": a2 }, "new": { "symbol": b1, "price": b2 } }
// console.log(json);






// console.log(oldArr.filter((i) => !newArr.find((j) => j.price === i.price)).concat(
//     newArr.filter((i) => !newArr.find((j) => j.price === i.price))
// ))


// let ab = oldArr.map(item => JSON.stringify(item))
// let bb = newArr.map(item => JSON.stringify(item))
// const re = ab.filter(i => !bb.includes(i)).concat(bb.filter((i) => !ab.includes(i)))
// console.log(re)//根据价格得到有变化的


// const res = re.filter(i => !bb.includes(i)).concat(bb.filter((i) => !ab.includes(i)))



// function strObjArrConvert(arr) {
//     let result = [];
//     for (let item of arr) {
//         result.push(JSON.parse(item))
//     }
//     return result;
// }

// console.log(strObjArrConvert(re));


// function getObjArrPrice(arr) {
//     const result = arr.filter(item => {
//         if (item.symbol) {

//         }
//     })
//     console.log(result)
// }


// getObjArrPrice(strObjArrConvert(re))

// function bi(arr1, arr2) {
//     const arr3 = arr1.concat(arr2);
//     let map = new Map();
//     for (let item of arr3) {//遍历
//         // console.log(item);
//         if (!map.has(item.price, item)) {
//             map.set(item.price, item)
//         }
//     }
//     return [...map.values()]
// }

// console.log(bi(oldArr, newArr))//根据价格得到有变化的

// function sy(arr) {
//     const map = new Map();
//     for (let item of arr) {
//         if (!map.has(item.symbol, item)) {
//             map.set(item.symbol, item)
//             // map.set(item.price, item.price)
//         }
//     }
//     return [...map.values()];
// }






// const allArr = oldArr.concat(newArr);

// let map = new Map();
// for (let item of allArr) {
//     if (!map.has(item.symbol)) {
//         map.set(item.symbol, item)
//     }
// }
// let newr = [...map.values()];
// console.log(newr)


