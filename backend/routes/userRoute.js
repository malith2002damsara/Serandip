import express from "express";
import {loginUser,registerUser,adminLogin} from '../controllers/userController.js'
import { getAllUsers, getUserOrders } from '../controllers/adminUserController.js'
import adminAuth from '../middleware/adminAuth.js'

const userRouter = express.Router();

userRouter.post('/login', loginUser)
userRouter.post('/register', registerUser)
userRouter.post('/admin', adminLogin)
userRouter.get('/admin/users', adminAuth, getAllUsers)
userRouter.get('/admin/users/:userId/orders', adminAuth, getUserOrders)

export default userRouter;