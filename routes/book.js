var express = require('express');
var router = express.Router();
const { handleGetTips, handleGetPriceOrder } = require('../controller/orderBookController.js')

router.get('/:pair/priceOrder', function (req, res) {
    handleGetPriceOrder(req, res)
})

router.get('/:pair/tips', function (req, res) {
    handleGetTips(req, res)
})


module.exports = router;
