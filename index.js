let ordersNb = 8;
let max = 0.3
let min = 0.1
let totalToTrade = 0.01;

let interval = (max - min) / ordersNb;
let orderPrice = max;
let orders = [];
let orderVal = totalToTrade / ordersNb;
let amount = orderVal / orderPrice
let total = amount * orderPrice
let masterTotal = 0;

for (let i = 0; i < ordersNb; i++) {
    orders.push({
        'price' : orderPrice.toFixed(7),
        'amount' : amount.toFixed(5),
        'total' : total.toFixed(5)
    });
    orderPrice -= interval;
    amount = orderVal / orderPrice
    total = amount * orderPrice
    masterTotal += total;
}
console.log(orders);
console.log(masterTotal);