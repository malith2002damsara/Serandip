import express from 'express'
import {
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
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router()

//admin features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.get('/unviewed-count', adminAuth, getUnviewedCount)
orderRouter.get('/unviewed', adminAuth, getUnviewedOrders)
orderRouter.post('/mark-viewed', adminAuth, markAsViewed)

//payment features
orderRouter.post('/place', authUser, placeOrder)            // Cash on delivery
orderRouter.post('/payhere', authUser, placeOrderPayHere)   // Card (Visa / Mastercard)

//PayHere server callback - must be PUBLIC (no authUser), PayHere calls it directly
orderRouter.post('/payhere-notify', payhereNotify)

//user features
orderRouter.post('/userorders', authUser, userOrders)

//verify payment (customer returns from PayHere)
orderRouter.post('/verifyPayHere', authUser, verifyPayHere)

export default orderRouter