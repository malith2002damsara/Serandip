import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';

// An order counts towards "total spent" when it is not cancelled and is either paid (card) or COD
const spentExpr = {
  $cond: [
    {
      $and: [
        { $ne: ['$status', 'Cancelled'] },
        { $or: [{ $eq: ['$payment', true] }, { $eq: ['$paymentMethod', 'COD'] }] }
      ]
    },
    '$amount',
    0
  ]
};

// @desc    List all users with order count + total spent
// @route   GET /api/user/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const [users, stats] = await Promise.all([
      userModel.find().select('name email').lean(),
      orderModel.aggregate([
        {
          $group: {
            _id: '$user',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: spentExpr },
            lastOrderDate: { $max: '$date' }
          }
        }
      ])
    ]);

    const statMap = new Map(stats.map((s) => [String(s._id), s]));

    const list = users
      .map((u) => {
        const st = statMap.get(String(u._id));
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          joinedAt: u._id.getTimestamp(), // registration date taken from the ObjectId
          orderCount: st?.orderCount || 0,
          totalSpent: st?.totalSpent || 0,
          lastOrderDate: st?.lastOrderDate || null
        };
      })
      .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

    res.status(200).json({
      success: true,
      totalUsers: list.length,
      usersWithOrders: list.filter((u) => u.orderCount > 0).length,
      users: list
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    One user's details + all of their orders with prices
// @route   GET /api/user/admin/users/:userId/orders
// @access  Admin
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await userModel.findById(userId).select('name email').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const orders = await orderModel.find({ user: userId }).sort({ date: -1 }).lean();

    let totalSpent = 0;
    const statusCounts = {};

    const detailedOrders = orders.map((order) => {
      const itemsTotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const countsAsSpent =
        order.status !== 'Cancelled' && (order.payment === true || order.paymentMethod === 'COD');
      if (countsAsSpent) totalSpent += order.amount;
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;

      return {
        _id: order._id,
        date: order.date,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paid: order.payment,
        paymentId: order.paymentId || null,
        address: order.address,
        items: order.items.map((i) => ({
          product: i.product,
          name: i.name,
          image: i.image,
          size: i.size,
          price: i.price,
          quantity: i.quantity,
          lineTotal: i.price * i.quantity
        })),
        itemsTotal,
        deliveryFee: Math.max(order.amount - itemsTotal, 0),
        amount: order.amount
      };
    });

    res.status(200).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, joinedAt: user._id.getTimestamp() },
      summary: { totalOrders: orders.length, totalSpent, statusCounts },
      orders: detailedOrders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};