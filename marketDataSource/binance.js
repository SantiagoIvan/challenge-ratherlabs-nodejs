
const Binance = require('node-binance-api');
const binance = new Binance().options({});
const fs = require('fs')
require('dotenv').config()
const logfile = __dirname + '/logs/binance-logs.log'

const { OrderBooksStore, OrderBookLevel } = require('orderbooks');
const OrderBooks = new OrderBooksStore({ traceLog: true, checkTimestamps: false, maxDepth: process.env.MAX_DEPTH });//25 de cada tipo

// connect to a websocket and relay orderbook events to handlers
const symbols = ['ETHUSDT', 'BTCUSDT'];
const opTypes = ["sell", "buy"]

const connectBinance = () => {
    symbols.forEach(symbol => {
        binance.websockets.depth([symbol], depth => {
            console.clear();
            if (depth.e == 'depthUpdate') {
                return handleOrderbookUpdate(depth, symbol);
            }
            debugger;
            console.log('unknown event type: ', depth);
        });


        // get initial book snapshot
        binance.depth(symbol).then(results => {
            // combine bids and asks
            const { bids, asks } = results;

            const bidsArray = Object.keys(bids).map(price => {
                return OrderBookLevel(symbol, +price, 'Buy', +bids[price])
            });

            const asksArray = Object.keys(asks).map(price => {
                return OrderBookLevel(symbol, +price, 'Sell', +asks[price])
            });

            // store inititial snapshot
            OrderBooks.handleSnapshot(
                symbol,
                [...bidsArray, ...asksArray],
                new Date().getTime()
            );
            fs.appendFileSync(logfile, "Snapshot " + symbol + ": " + JSON.stringify(OrderBooks.getBook(symbol)) + '\n')
        });
    })



    // process delta update event from websocket
    const handleOrderbookUpdate = depth => {
        let { e: eventType, E: eventTime, s: symbol, u: updateId, b: bidDepth, a: askDepth } = depth;
        const deleteLevels = [];
        const upsertLevels = [];

        bidDepth.forEach(([price, amount]) => {
            assignLevel(OrderBookLevel(symbol, +price, 'Buy', +amount), upsertLevels, deleteLevels);
        });
        askDepth.forEach(([price, amount]) => {
            assignLevel(OrderBookLevel(symbol, +price, 'Sell', +amount), upsertLevels, deleteLevels);
        });

        // upsert/insert is automatically decided using price as primary key.
        // Binance has these mixed, so let the book handler decide
        const insertLevels = [];

        updatedBook = OrderBooks.handleDelta(
            symbol,
            deleteLevels,
            upsertLevels,
            insertLevels,
            eventTime
        );
        fs.appendFileSync(logfile, "Updated Book " + symbol + ": " + JSON.stringify(OrderBooks.getBook(symbol)) + '\n')
        return updatedBook
    };

    // utility method to decide if a delta level is an upsert or deletion
    const assignLevel = (level, updateArray, deleteArray) => {
        const qtyIndex = 3;
        if (level[qtyIndex]) {
            updateArray.push(level);
        } else {
            deleteArray.push(level);
        }
    };
}

module.exports = {
    connectBinance,
    OrderBooks,
    symbols,
    opTypes
}