const ordersDiv = document.querySelector('.orders')
const button = document.querySelector('button')
const sell = document.querySelector('.sell')
let sumQte = (sumTotal = 0)

const PRECISION = 4

let initValues = {
  ordersNb: 3,
  max: 0.00042,
  min: 0.00037,
  totalToTrade: 0.2,
}

getInitialValues()

initialize(initValues)

button.addEventListener('click', showResult, false)

sell.addEventListener('click', showSell, false)

/**
 * Return the values of 1 parameter in the url
 **/
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&')

  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url)

  if (!results) return null

  if (!results[2]) return ''

  let parameter = decodeURIComponent(results[2].replace(/\+/g, ' '))

  return parameter
}

/**
 * Return the value of 1 parameter in the url as a float
 **/
function getFloatParamByName(name) {
  const param = getParameterByName(name)

  return parseFloat(param)
}

/**
 * Return the 4 initiales values in the url or null
 * Url exemple : url?ordersNb=20&max=0.00088343&min=0.00021351&totalToTrade=0.2
 **/
function getCurrentUrlParameters() {
  let ordersNb = getParameterByName('ordersNb')
  ordersNb = parseInt(ordersNb, 10)

  const max = getFloatParamByName('max'),
    min = getFloatParamByName('min'),
    totalToTrade = getFloatParamByName('totalToTrade')

  const parameters = { ordersNb, max, min, totalToTrade }

  console.log('getCurrentUrlParameters -> parameters', parameters)

  if (ordersNb && max && min && totalToTrade) {
    return parameters
  }

  return null
}

/**
 * Get and set initial values of the form from url parameters or local storage
 **/
function getInitialValues() {
  const parameters = getCurrentUrlParameters()

  if (parameters) {
    initValues = parameters
  } else {
    const vals = JSON.parse(localStorage.getItem('fastOrdersVals'))
    if (vals) {
      initValues = vals
    }
  }
}

/**
 * Append the url to share, with form values in .orders div
 **/
function appendUrlToShare() {
  const vals = JSON.parse(localStorage.getItem('fastOrdersVals'))

  const url = new URL(window.location.href)

  Object.keys(vals).forEach(paramName => {
    const val = vals[paramName]

    url.searchParams.set(paramName, val)
  })

  const urlToShare = url.href

  const link = `<div class="link-box"><span>URL à partager: </span><span class="link">${urlToShare}</span></div>`

  document.querySelector('.orders').insertAdjacentHTML('beforeend', link)
}

/**
 * Save form values to local storage
 **/
function saveInitialValues() {
  const ordersNb = document.getElementById('ordersNb').value
  const max = document.getElementById('max').value
  const min = document.getElementById('min').value
  const totalToTrade = document.getElementById('totalToTrade').value

  const vals = {
    ordersNb,
    max,
    min,
    totalToTrade,
  }

  localStorage.setItem('fastOrdersVals', JSON.stringify(vals))
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
    order.innerHTML = `<span>prix </span> <span class="bg-danger text-white clipboard" >${price}</span> <span>qté </span>  <span class="bg-info clipboard" >${amount}</span> <span>total </span> <span class="bg-warning clipboard" >${total}</span>`
  }

  ordersDiv.appendChild(order)
}

function addClassesToOrdersDiv() {
  ordersDiv.className =
    'orders w-100 m-auto mt-5 pt-3 pb-3 border border-dark rounded'
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

  orders.forEach(o => {
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

  addClassesToOrdersDiv()
  saveInitialValues()

  appendUrlToShare()

  setCopyValToClipboardListener()
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

  orders.forEach(o => {
    appendOrder(o.price, o.amount, o.total)
    sumQte += parseFloat(o.amount)
    sumTotal += parseFloat(o.total)
  })

  appendOrder('___TOTAL___ ', sumQte.toFixed(5), sumTotal.toFixed(5), true)
  sumQte = sumTotal = 0

  addClassesToOrdersDiv()
  saveInitialValues()

  appendUrlToShare()

  setCopyValToClipboardListener()
}

/**
 * Initialize the form with values
 *
 * @param {Object} values - The input number values : ordersNb, max, min, totalToTrade.
 */
function initialize(vals) {
  const { ordersNb, max, min, totalToTrade } = vals

  document.querySelectorAll('[type=number]').forEach(input => {
    input.value = vals[input.id]
  })
}

// The functions below are here so the user can copy values to his clipboard with on click

function setCopyValToClipboardListener() {
  document.querySelectorAll('.orders .clipboard').forEach(clipboard => {
    clipboard.addEventListener('click', evt => {
      copyTextToClipboard(evt.target.textContent)
    })
  })
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement('textarea')
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'successful' : 'unsuccessful'
    console.log('Fallback: Copying text command was ' + msg)
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err)
  }

  document.body.removeChild(textArea)
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log('Async: Copying to clipboard was successful!')
    },
    function (err) {
      console.error('Async: Could not copy text: ', err)
    }
  )
}
