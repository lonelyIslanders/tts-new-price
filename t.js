const coinName = [
    ["BTC", "比特币"],
    ["ETH", "以太坊"],
    ["DOGE", "狗狗币"]
]

const bi = 'DOGE';
let flag = false;
for (let i = 0; i < coinName.length; i++) {
    console.log(coinName[i]);
}

const a = coinName.map(item => item)
console.log(a)
