import crypto from 'crypto'
import mongoose from 'mongoose'
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

//global variables
const currency = 'LKR'
// keep this the same as delivery_fee in frontend ShopContext.jsx
const deliveryCharge = Number(process.env.DELIVERY_FEE) || 350

// Card orders that are not paid yet (customer didn't finish paying) are hidden from the admin panel
const adminOrderFilter = { $or: [{ paymentMethod: { $ne: 'Card' } }, { payment: true }] }

// ---------------- PayHere helpers ----------------
const md5Upper = (text) => crypto.createHash('md5').update(text).digest('hex').toUpperCase()

const getPayHereConfig = () => ({
  merchantId: process.env.PAYHERE_MERCHANT_ID,
  merchantSecret: process.env.PAYHERE_MERCHANT_SECRET,
  checkoutUrl:
    process.env.PAYHERE_MODE === 'live'
      ? 'https://www.payhere.lk/pay/checkout'
      : 'https://sandbox.payhere.lk/pay/checkout',
  backendUrl: (process.env.BACKEND_URL || '').replace(/\/$/, ''),
  frontendUrl: (process.env.FRONTEND_URL || '').replace(/\/$/, ''),
})

// placing orders using COD Method
const placeOrder = async (req, res) => {

  try {
    const { userId, items, amount, address } = req.body
    const orderData = {
      user: userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now()
    }

    const newOrder = new orderModel(orderData)
    await newOrder.save()

    await userModel.findByIdAndUpdate(userId, { cartData: {} })
    res.json({ success: true, message: "Order placed successfully" })

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message })
  }

}

// Placing orders using Card (Visa / Mastercard) via PayHere
const placeOrderPayHere = async (req, res) => {
  try {
    const { userId, items, address } = req.body
    const { merchantId, merchantSecret, checkoutUrl, backendUrl, frontendUrl } = getPayHereConfig()

    if (!merchantId || !merchantSecret || !backendUrl) {
      return res.json({ success: false, message: 'Card payments are not configured yet' })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: 'Your cart is empty' })
    }

    if (!address?.firstName || !address?.email || !address?.phone || !address?.street || !address?.country) {
      return res.json({ success: false, message: 'Please fill in all delivery details' })
    }

    // Never trust the amount sent by the browser: re-calculate it from the database prices
    const productModel = mongoose.model('product')
    const dbProducts = await productModel.find({ _id: { $in: items.map((i) => i.product) } }).select('price')
    const priceMap = {}
    dbProducts.forEach((p) => { priceMap[p._id.toString()] = p.price })

    let subtotal = 0
    const safeItems = []
    for (const item of items) {
      const price = priceMap[String(item.product)]
      const quantity = Number(item.quantity)

      if (price === undefined) {
        return res.json({ success: false, message: `"${item.name}" is no longer available` })
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.json({ success: false, message: 'Invalid item quantity' })
      }

      subtotal += price * quantity
      safeItems.push({ ...item, price, quantity })
    }

    const amount = subtotal + deliveryCharge

    // Save the order first (payment = false). It becomes true only after PayHere notifies us.
    const newOrder = new orderModel({
      user: userId,
      items: safeItems,
      amount,
      address,
      paymentMethod: "Card",
      payment: false,
      date: Date.now()
    })
    await newOrder.save()

    const orderId = newOrder._id.toString()
    const amountFormatted = amount.toFixed(2)
    const origin = frontendUrl || req.headers.origin

    // hash = MD5( merchant_id + order_id + amount + currency + MD5(merchant_secret) )  (uppercase)
    const hash = md5Upper(merchantId + orderId + amountFormatted + currency + md5Upper(merchantSecret))

    res.json({
      success: true,
      payhere: {
        action: checkoutUrl,
        params: {
          merchant_id: merchantId,
          return_url: `${origin}/verify?success=true&orderId=${orderId}`,
          cancel_url: `${origin}/verify?success=false&orderId=${orderId}`,
          notify_url: `${backendUrl}/api/order/payhere-notify`,
          order_id: orderId,
          items: `Order ${orderId}`,
          currency,
          amount: amountFormatted,
          first_name: address.firstName,
          last_name: address.lastName || '-',
          email: address.email,
          phone: address.phone,
          address: address.street,
          // PayHere requires a city value. We don't collect it, so use the country as a placeholder.
          city: address.city || address.country,
          country: address.country,
          hash
        }
      }
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message })
  }
}

// PayHere server -> our server callback (NO login token here, PayHere calls this directly)
const payhereNotify = async (req, res) => {
  try {
    const { merchant_id, order_id, payment_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body
    const { merchantId, merchantSecret } = getPayHereConfig()

    if (!merchant_id || !order_id || !md5sig || !merchantSecret) {
      return res.status(400).send('Bad request')
    }

    // Verify that this notification really came from PayHere
    const localSig = md5Upper(
      merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5Upper(merchantSecret)
    )

    if (merchant_id !== merchantId || localSig !== String(md5sig).toUpperCase()) {
      console.log('PayHere notify: invalid signature for order', order_id)
      return res.status(400).send('Invalid signature')
    }

    if (!mongoose.isValidObjectId(order_id)) {
      return res.status(400).send('Invalid order')
    }

    const order = await orderModel.findById(order_id)
    if (!order) {
      return res.status(404).send('Order not found')
    }

    // status_code 2 = success
    if (String(status_code) === '2' && !order.payment) {
      // amount + currency must match what we saved
      if (payhere_currency !== currency || Number(payhere_amount).toFixed(2) !== order.amount.toFixed(2)) {
        console.log('PayHere notify: amount mismatch for order', order_id)
        return res.status(400).send('Amount mismatch')
      }

      order.payment = true
      order.paymentId = payment_id
      await order.save()
      await userModel.findByIdAndUpdate(order.user, { cartData: {} })
    }

    res.status(200).send('OK')

  } catch (error) {
    console.log(error);
    res.status(500).send('Server error')
  }
}

// Called by the /verify page after the customer comes back from PayHere
const verifyPayHere = async (req, res) => {
  const { orderId, success, userId } = req.body

  try {
    if (!mongoose.isValidObjectId(orderId)) {
      return res.json({ success: false, message: "Invalid order" })
    }

    const order = await orderModel.findOne({ _id: orderId, user: userId })
    if (!order) {
      return res.json({ success: false, message: "Order not found" })
    }

    // Payment already confirmed by PayHere notification
    if (order.payment) {
      return res.json({ success: true, paid: true, message: "Payment successful" })
    }

    // Customer came back after paying, but PayHere's notification has not arrived yet
    if (success === 'true') {
      return res.json({ success: true, paid: false, message: "Payment is being confirmed" })
    }

    // Customer cancelled: remove the unpaid card order
    if (order.paymentMethod === 'Card') {
      await orderModel.findByIdAndDelete(orderId)
    }
    res.json({ success: false, message: "Payment cancelled" })

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message })
  }
}

//all orders data for admin pannel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find(adminOrderFilter).populate({
      path: 'items.product',
      select: 'sellername sellerphone'
    });

    // Add seller information to each order item
    const ordersWithSellerInfo = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map(item => {
        if (item.product) {
          return {
            ...item,
            sellername: item.product.sellername,
            sellerphone: item.product.sellerphone
          };
        }
        return item;
      });
      return orderObj;
    });

    res.json({ success: true, orders: ordersWithSellerInfo })

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message })
  }
}

//User order data for frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body
    const orders = await orderModel.find({ user: userId }).populate({
      path: 'items.product',
      select: 'sellername sellerphone'
    });

    // Add seller information to each order item
    const ordersWithSellerInfo = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map(item => {
        if (item.product) {
          return {
            ...item,
            sellername: item.product.sellername,
            sellerphone: item.product.sellerphone
          };
        }
        return item;
      });
      return orderObj;
    });

    res.json({ success: true, orders: ordersWithSellerInfo })

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message })
  }
}

//update order status from admin pannel
const updateStatus = async (req, res) => {
  try {

    const { orderId, status } = req.body
    await orderModel.findByIdAndUpdate(orderId, { status })
    res.json({ success: true, message: "Order status updated successfully" })

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message })
  }

}

// Get unviewed orders count for notifications
const getUnviewedCount = async (req, res) => {
  try {
    const count = await orderModel.countDocuments({ viewed: false, ...adminOrderFilter })
    res.json({ success: true, count })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all orders for notification dropdown (including viewed ones)
const getUnviewedOrders = async (req, res) => {
  try {
    const orders = await orderModel.find(adminOrderFilter)
      .populate({
        path: 'items.product',
        select: 'sellername sellerphone'
      })
      .populate('user', 'name email')
      .sort({ date: -1 })
      .limit(20);

    // Add seller information to each order item
    const ordersWithSellerInfo = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map(item => {
        if (item.product) {
          return {
            ...item,
            sellername: item.product.sellername,
            sellerphone: item.product.sellerphone
          };
        }
        return item;
      });
      return orderObj;
    });

    res.json({ success: true, orders: ordersWithSellerInfo })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message })
  }
}

// Mark orders as viewed
const markAsViewed = async (req, res) => {
  try {
    const { orderIds } = req.body
    await orderModel.updateMany(
      { _id: { $in: orderIds } },
      { viewed: true }
    )
    res.json({ success: true, message: "Orders marked as viewed" })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message })
  }
}

export {
  placeOrder,
  placeOrderPayHere,
  payhereNotify,
  verifyPayHere,
  allOrders,
  userOrders,
  updateStatus,
  getUnviewedCount,
  getUnviewedOrders,
  markAsViewed
}