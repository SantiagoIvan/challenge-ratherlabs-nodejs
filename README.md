# challenge-ratherlabs-nodejs

[Senior Backend Engineer _ Challenge (1).pdf](https://github.com/SantiagoIvan/challenge-ratherlabs-nodejs/files/8335450/Senior.Backend.Engineer._.Challenge.1.pdf)

- Use como fuente de datos a la API de Binance


## Rutas expuestas

- /book/:pair/tips

- /book/:pair/priceOrder?size=<size>&operationType=<operationType>

Con ( :pair in ["btcusdt", "ethusdt"] ) && ( operationType in ["sell", "buy"] ) && size ∈  R 
  

### Atencion

En la biblioteca de orderbooks, hay unos console log que son bastante molestos. Aconsejo borrarlos.
File:  node_modules/orderbooks/src/OrderBooksStore.js
Line: 39, 53

  
# Casos de ejemplo

###  /book/BTCUSDT/tips

  ![imagen](https://user-images.githubusercontent.com/48731203/160450072-02e08747-204d-48ac-befc-319c62ee6e1c.png)

###  /book/ETHUSDT/tips
  
  ![imagen](https://user-images.githubusercontent.com/48731203/160450343-fb00d5cc-155d-4607-8acc-33d89d68e03f.png)

###  /book/BTCUSDT/priceOrder?size=2&operationType=sell
  ![imagen](https://user-images.githubusercontent.com/48731203/160451279-1d6256b8-fbe3-4510-8bd6-876ca9139190.png)

###  /book/BTCUSDT/priceOrder?size=2&operationType=buy
  ![imagen](https://user-images.githubusercontent.com/48731203/160451418-85cc053e-84a5-48e5-90a0-2927ec4f1764.png)

###  /book/ETHUSDT/priceOrder?size=1.5&operationType=sell
  ![imagen](https://user-images.githubusercontent.com/48731203/160451624-df9e4f36-0681-42a0-941d-6762bfcb59a1.png)

###  /book/ETHUSDT/priceOrder?size=1.5&operationType=buy
  ![imagen](https://user-images.githubusercontent.com/48731203/160451578-4985cda6-8b3a-4938-9f91-8087beb98a2b.png)

  

