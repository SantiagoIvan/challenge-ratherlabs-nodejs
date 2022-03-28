const request = require('supertest')
const app = require('../app.js')

describe('GET /book/:pair/tips', () => {
    it('should return a json object', () => {
        return request(app)
            .get('/book/btcusdt/tips')
            .expect('Content-Type', /json/)
            .expect(200)
    })


})