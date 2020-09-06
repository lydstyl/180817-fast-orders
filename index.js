const ordersDiv = document.querySelector('.orders')
const button = document.querySelector('button')
const sell = document.querySelector('.sell')
let sumQte = (sumTotal = 0)

const PRECISION = 4

initValues = {
  ordersNb: 3,
  max: 0.00042,
  min: 0.00037,
  totalToTrade: 0.2,
}

/**
 * Return an array with all buy orders. Each order is an object
 **/
function getOrders(ordersNb, max, min, totalToTrade) {
  let interval = (max - min) / (parseInt(ordersNb, 10) - 1)
  let orderPrice = max
  let orders = []
  let orderVal = totalToTrade / ordersNb
  let amount = orderVal / orderPrice
  let total = amount * orderPrice
  let masterTotal = 0
  for (let i = 0; i < parseInt(ordersNb, 10); i++) {
    orders.push({
      price: parseFloat(parseFloat(orderPrice).toPrecision(PRECISION)),
      amount: parseFloat(amount).toPrecision(PRECISION),
      total: parseFloat(total).toPrecision(PRECISION),
    })
    orderPrice -= interval
    amount = orderVal / orderPrice
    total = amount * orderPrice
    masterTotal += total
  }
  return orders
}

/**
 * Return an array with all sell orders. Each order is an object
 **/
function getOrdersSell(ordersNb, max, min, totalToTrade) {
  let interval = (max - min) / (parseInt(ordersNb, 10) - 1)
  let orderPrice = parseFloat(min)
  let orders = []
  let amount = totalToTrade / ordersNb
  let total = amount * orderPrice

  for (let i = -1; i < parseInt(ordersNb, 10) - 1; i++) {
    orders.push({
      price: parseFloat(orderPrice).toPrecision(PRECISION),
      amount: parseFloat(amount).toPrecision(PRECISION),
      total: parseFloat(total).toPrecision(PRECISION),
    })
    orderPrice += interval
    total = amount * orderPrice
    //masterTotal += total;
  }
  return orders
}

/**
 * Create a tag with a buy or sell order and append it to the orders div
 **/
function appendOrder(price, amount, total, sum) {
  let order = document.createElement('div')
  order.className = 'mt-3 order'

  if (sum) {
    order.innerHTML = `<span>${price}</span><span>qté ${amount}</span><span>total ${total}</span>`
  } else {
    order.innerHTML = `<span>prix </span> <span class="bg-danger text-white" >${price}</span> <span>qté </span>  <span class="bg-info" >${amount}</span> <span>total </span> <span class="bg-warning" >${total}</span>`
  }

  ordersDiv.appendChild(order)
}

/**
 * Show price, quantity and total of each buy order
 **/
function showResult() {
  const ordersNb = document.getElementById('ordersNb').value
  const max = document.getElementById('max').value
  const min = document.getElementById('min').value
  const totalToTrade = document.getElementById('totalToTrade').value

  ordersDiv.innerHTML = ''
  let orders = getOrders(ordersNb, max, min, totalToTrade)
  let h2 = document.createElement('h2')
  h2.innerHTML = 'Les ordres'

  ordersDiv.appendChild(h2)

  // fix asked by Antoine Bonduelle 2020 - 07
  orders.sort((a, b) => {
    if (a.price > b.price) {
      return 1
    } else {
      return -1
    }
  })

  orders.forEach((o) => {
    appendOrder(o.price, o.amount, o.total)
    sumQte += parseFloat(o.amount)
    sumTotal += parseFloat(o.total)
  })

  appendOrder(
    '___TOTAL___ ',
    sumQte.toPrecision(PRECISION),
    sumTotal.toPrecision(PRECISION),
    true
  )
  sumQte = sumTotal = 0

  ordersDiv.className = 'orders w-100 m-auto mt-5 border border-dark rounded'
}

/**
 * Show price, quantity and total of each sell order
 **/
function showSell() {
  const ordersNb = document.getElementById('ordersNb').value
  const max = document.getElementById('max').value
  const min = document.getElementById('min').value
  const totalToTrade = document.getElementById('totalToTrade').value

  ordersDiv.innerHTML = ''
  let orders = getOrdersSell(ordersNb, max, min, totalToTrade) //
  let h2 = document.createElement('h2')
  h2.innerHTML = 'Les ordres'
  ordersDiv.appendChild(h2)

  orders.forEach((o) => {
    appendOrder(o.price, o.amount, o.total)
    sumQte += parseFloat(o.amount)
    sumTotal += parseFloat(o.total)
  })

  appendOrder('___TOTAL___ ', sumQte.toFixed(5), sumTotal.toFixed(5), true)
  sumQte = sumTotal = 0

  ordersDiv.className = 'orders w-100 m-auto mt-5 border border-dark rounded'
}

/**
 * Initialize the form with values
 *
 * @param {Object} values - The input number values : ordersNb, max, min, totalToTrade.
 */
function initialize(vals) {
  const { ordersNb, max, min, totalToTrade } = vals

  document.querySelectorAll('[type=number]').forEach((input) => {
    input.value = vals[input.id]
  })
}

initialize(initValues)

button.addEventListener('click', showResult, false)

sell.addEventListener('click', showSell, false)
