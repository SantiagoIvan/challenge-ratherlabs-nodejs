const request = require('supertest')
const app = require('../app.js')

describe('GET /book/:pair/priceOrder', () => {
    it('should return a json object', () => { })

    it('should return 200 for btcusdt pairname, a random size and random operationtype', () => { })

    it('should return 200 for ethusdt pairname, a random size and random operationtype', () => { })

    it('should return 404 for incorrect operationType', () => { })

    it('should return 404 for incorrect pairname', () => { })

    it('should return 404 for incorrect size', () => { })
})