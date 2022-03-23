var express = require('express');
var router = express.Router();
const { OrderBooks } = require('../marketDataSource/binance')
const { orderBook } = require('../marketDataSource/bitfinex')

router.get('/', function (req, res, next) {
    res.send("market")
});

router.get('/book/btcusd', function (req, res) {
    res.json(orderBook)
})

router.get('/book/ethusd', function (req, res) {
    res.json(OrderBooks.books.ETHUSDT)
})

module.exports = router;
