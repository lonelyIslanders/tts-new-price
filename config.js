module.exports = {
    //小写大写无所谓，混搭也行
    //务必写入正确且币存在于binance市场，不然报错哦⭕
    //严格按照币名USDT
    coinArray: [
        "BTCUSDT",
        "ETHUSDT",
        "BNBUSDT",
        "DOGEUSDT",
        "CFXUSDT",
    ],
    //可命名中文，你想叫它沙币就沙币～播报时会自动解析，没有则播报原名
    coinName: {
        "BTC": "比特币",
        "ETH": "以太坊",
        "DOGE": "狗狗币"
    },
    //你想关注的币，仅支持添加一种，多次添加只取第一个，默认关注BTC
    //关注币必须包含在coinArray里面
    //可为空，或变动情况不包含关注币，则会按照变动情况顺序播报
    //添加币名可加可不加USDT
    yourFollow: [
        "BTC"
    ]
}