const { OrderBooks, symbols, opTypes } = require('../marketDataSource/binance')
const fs = require('fs')
const logfile = __dirname + "/logs/requests.log"

const handleGetTips = (req, res) => {
    const { pair } = req.params
    const book = OrderBooks.getBook(pair.toUpperCase())
    if (!book.book.length) {
        res.status(404).send('Invalid pair')
        return
    }

    const result = { "bestBid": book.getBestBid(), "bestAsk": book.getBestAsk() }
    fs.appendFileSync(logfile, `[GET_TIPS] ${pair}: ${JSON.stringify(result)} \n`)
    res.json(result)
}

const handleGetPriceOrder = (req, res) => {
    if (!req.query) {
        res.status(404).send("Invalid query")
        return
    }
    let { operationType, size } = req.query
    let { pair } = req.params
    pair = decodeURIComponent(pair)?.toUpperCase()
    operationType = decodeURIComponent(operationType)?.toLowerCase()
    size = parseFloat(decodeURIComponent(size))

    fs.appendFileSync(logfile, `[PRICE_ORDER] Pair: ${pair} - OperationType: ${operationType} - Size: ${size}\n`)
    if (!symbols.includes(pair) || !opTypes.includes(operationType) || !size) {
        res.status(404).send('Invalid query')
        return
    }

    /**
     * Si es una operacion de compra, yo voy a iterar sobre las ordenes de venta y las voy a ir consumiendo
     * Si es una operacion de venta, iterare sobre las ordenes de compra
    Formato de un renglon del orderBook:
    [pair, price level, operation type , amount]
    */

    const result = OrderBooks.getBook(pair).book.filter(level => level[2].toLowerCase() !== operationType)
    if (operationType === "buy") {
        // result es un array de ordenes de ventas. En el ultimo lugar se encuentra el bestAsk. Lo doy vuelta asi los maniupulo a ambos de la misma forma
        result.reverse()
    }
    fs.appendFileSync(logfile, `[DEBUG] Size to consume: ${size} - Orders to iterate: ${JSON.stringify(result)}\n`)

    let totalPrice = 0
    let amountConsumed = 0
    let currentAmount = 0
    for (let i = 0; i < result.length; i++) {
        fs.appendFileSync(logfile, `[DEBUG] [ROW] Pair: ${result[i][0]} - Price: ${result[i][1]} - Op: ${result[i][2]} - Amount: ${result[i][3]}\n`)
        currentAmount = result[i][3]
        currentPrice = result[i][1]
        if ((amountConsumed + currentAmount) >= size) {
            // La cantidad de la orden actual sobrepasa a size. Deberia cortar aca la iteracion
            currentAmount = (size - amountConsumed)
            amountConsumed += currentAmount
            totalPrice += (currentAmount * currentPrice)
            fs.appendFileSync(logfile, `[DEBUG] Amount consumed: ${amountConsumed} - Total price: ${totalPrice}\n`)
            break;
        } else {
            amountConsumed += currentAmount
            totalPrice += (currentPrice * currentAmount)
            fs.appendFileSync(logfile, `[DEBUG] Amount consumed: ${amountConsumed} - Total price: ${totalPrice}\n`)
        }
    }
    totalPrice = totalPrice.toFixed(3)
    res.json({ pair, operationType, size, totalPrice })
}

module.exports = {
    handleGetTips,
    handleGetPriceOrder
}