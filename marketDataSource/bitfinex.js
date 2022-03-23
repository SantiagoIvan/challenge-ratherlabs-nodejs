/*USAGE:
npm install ws lodash async moment crc-32
mkdir logs
node bfx_test_book.js BTCUSD
*/

const WS = require('ws')
const _ = require('lodash')
const async = require('async')
const fs = require('fs')
const moment = require('moment')
const CRC = require('crc-32')

const pair = "tBTCUSD"
const conf = {
    wshost: 'wss://api.bitfinex.com/ws/2'
}

const logfile = __dirname + '/logs/ws-book-aggr.log'

const orderBook = {}

let connected = false
let connecting = false
let cli
let seq = null

const connectBitFinex = () => {
    if (connecting || connected) return
    connecting = true

    cli = new WS(conf.wshost, { /* rejectUnauthorized: false */ })

    cli.on('open', function open() {
        console.log('WS open')
        connecting = false
        connected = true
        orderBook.bids = {}
        orderBook.asks = {}
        orderBook.priceSnapshot = {}
        orderBook.messageCount = 0
        cli.send(JSON.stringify({ event: 'conf', flags: 65536 + 131072 }))
        cli.send(JSON.stringify({ event: 'subscribe', channel: 'book', pair: pair, prec: 'P0', len: 100, freq: 'F1' }))
    })

    cli.on('close', function open() {
        seq = null
        console.log('WS close')
        connecting = false
        connected = false
    })

    cli.on('message', function (msg) {
        msg = JSON.parse(msg)

        if (msg.event) return
        if (msg[1] === 'hb') {
            seq = +msg[2]
            return
        } else if (msg[1] === 'cs') { //mensaje de checksum
            seq = +msg[3]

            const checksum = msg[2]
            const csdata = []
            const bids_keys = orderBook.priceSnapshot['bids']
            const asks_keys = orderBook.priceSnapshot['asks']

            for (let i = 0; i < 25; i++) {
                if (bids_keys[i]) {
                    const price = bids_keys[i]
                    const pp = orderBook.bids[price]
                    csdata.push(pp.priceLevel, pp.amount)
                }
                if (asks_keys[i]) {
                    const price = asks_keys[i]
                    const pp = orderBook.asks[price]
                    csdata.push(pp.priceLevel, -pp.amount)
                }
            }

            const cs_str = csdata.join(':')
            const cs_calc = CRC.str(cs_str)

            if (cs_calc !== checksum) {
                console.error('CHECKSUM_FAILED')
                process.exit(-1)
            }
            return
        }


        if (orderBook.messageCount === 0) { // Primer mensaje: snapshor del OrderBook. Tengo que armarlo
            fs.appendFileSync(logfile, "Snapshot message: " + JSON.stringify(msg[1]) + '\n')
            _.each(msg[1], function (pp) {
                // _.each es como un for each, aplica f a cada elemento de la lista del primer parametro
                pp = { priceLevel: pp[0], count: pp[1], amount: pp[2] }
                const side = pp.amount >= 0 ? 'bids' : 'asks'
                pp.amount = Math.abs(pp.amount)

                orderBook[side][pp.priceLevel] = pp
            })
        } else { // Si messageCount != 0 => no es el primer mensaje, es un update del libro
            // --- toda esta parte de abajo con el seq no se que garcha es
            const cseq = +msg[2]
            msg = msg[1]

            if (!seq) {
                seq = cseq - 1
            }

            if (cseq - seq !== 1) {
                console.error('OUT OF SEQUENCE', seq, cseq)
                process.exit()
            }

            seq = cseq
            // ----


            let pp = { priceLevel: msg[0], count: msg[1], amount: msg[2] }

            if (!pp.count) { // si el count = 0 entonces tengo que borrar esa entrada del price, segun donde este
                fs.appendFileSync(logfile, '[' + moment().format() + '] ' + 'Deleting ' + ': ' + JSON.stringify(pp) + '\n')
                let found = true

                if (pp.amount > 0) {
                    if (orderBook['bids'][pp.priceLevel]) {
                        delete orderBook['bids'][pp.priceLevel]
                    } else {
                        found = false
                    }
                } else if (pp.amount < 0) {
                    if (orderBook['asks'][pp.priceLevel]) {
                        delete orderBook['asks'][pp.priceLevel]
                    } else {
                        found = false
                    }
                }

                if (!found) {
                    fs.appendFileSync(logfile, '[' + moment().format() + '] ' + pair + ' | ' + JSON.stringify(pp) + ' orderBook delete fail side not found\n')
                }
            } else { // si count > 0 entonces actualizo el libro
                let side = pp.amount >= 0 ? 'bids' : 'asks'
                pp.amount = Math.abs(pp.amount)
                fs.appendFileSync(logfile, '[' + moment().format() + '] ' + side + ': ' + JSON.stringify(pp) + '\n')
                orderBook[side][pp.priceLevel] = pp
            }
        }

        _.each(['bids', 'asks'], function (side) {
            let sidebook = orderBook[side]
            let bprices = Object.keys(sidebook)

            let prices = bprices.sort(function (a, b) {
                if (side === 'bids') {
                    return +a >= +b ? -1 : 1
                    // se ordena de mayor a menor, osea que a esta primero que b. a>=b
                    // El precio mas alto que el comprador esta dispuesto a pagar
                } else {
                    return +a <= +b ? -1 : 1
                    // se ordena de menor a mayor, a esta primero que b, a <= b
                    // El precio mas bajo que el vendedor esta dispuesto a vender
                }
                //creo que el primero de cada uno, forman el precio del mercado, donde se unen ambas curvas (demanda y oferta)
            })

            orderBook.priceSnapshot[side] = prices
        })

        orderBook.messageCount++
    })
}


setInterval(function () {
    if (connected) return
    connect()
}, 3500)


module.exports = {
    connectBitFinex,
    orderBook
}