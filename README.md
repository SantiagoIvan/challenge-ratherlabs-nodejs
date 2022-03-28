# challenge-ratherlabs-nodejs

[Senior Backend Engineer _ Challenge (1).pdf](https://github.com/SantiagoIvan/challenge-ratherlabs-nodejs/files/8335450/Senior.Backend.Engineer._.Challenge.1.pdf)

## Rutas expuestas

- /book/:pair/tips

- /book/:pair/priceOrder?size=<size>&operationType=<operationType>

Con :pair in ["btcusdt", "ethusdt"] && operationType in ["sell", "buy"] && size ∈  R 

### Atencion

En la biblioteca de orderbooks, hay unos console log que son bastante molestos. Aconsejo borrarlos.
File:  node_modules/orderbooks/src/OrderBooksStore.js
Line: 39, 53
