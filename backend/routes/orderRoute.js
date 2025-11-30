import express from 'express'
import { placeOrder,
    placeOrderStripe,
    // placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus,
    verifyStripe,
    getUnviewedCount,
    getUnviewedOrders,
    markAsViewed
// verifyRazorpay
 } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

    const orderRouter = express.Router()

    //admin features
    orderRouter.post('/list',adminAuth, allOrders)
    orderRouter.post('/status',adminAuth, updateStatus)
    orderRouter.get('/unviewed-count',adminAuth, getUnviewedCount)
    orderRouter.get('/unviewed',adminAuth, getUnviewedOrders)
    orderRouter.post('/mark-viewed',adminAuth, markAsViewed)

    //payment features
    orderRouter.post('/place',authUser, placeOrder)
    orderRouter.post('/stripe',authUser, placeOrderStripe)
    //orderRouter.post('/razorpay',authUser, placeOrderRazorpay)

    //user features
    orderRouter.post('/userorders',authUser, userOrders)

    //verify payment
    orderRouter.post('/verifyStripe',authUser,verifyStripe)
   // orderRouter.post('/verifyRazorpay',authUser,verifyRazorpay)
    export default orderRouter
