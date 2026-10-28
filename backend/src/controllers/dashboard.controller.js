import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Subscriber } from "../models/subscriber.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DAY = 24 * 60 * 60 * 1000;

// GET /dashboard/stats — admin: everything the overview page renders, in one
// round trip (counts, revenue, 7-day trend, status split, top items, recents).
export const getStats = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 6 * DAY);
  since.setHours(0, 0, 0, 0); // include today fully

  const [productCount, categoryCount, userCount, subscriberCount, revenueAgg, statusAgg, trendAgg, topItems, recentOrders, lowStock] =
    await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      User.countDocuments(),
      Subscriber.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", title: { $first: "$items.title" }, image: { $first: "$items.image" }, sold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { sold: -1 } },
        { $limit: 5 },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(6),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(6),
    ]);

  // last 7 calendar days, zero-filled so the sparkline never has gaps
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * DAY);
    return d.toISOString().slice(0, 10);
  });
  const trendMap = new Map(trendAgg.map((t) => [t._id, t]));
  const trend = days.map((day) => ({
    day,
    label: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
    revenue: trendMap.get(day)?.revenue ?? 0,
    orders: trendMap.get(day)?.orders ?? 0,
  }));

  const byStatus = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));
  const pending = (byStatus.pending || 0) + (byStatus.confirmed || 0);

  res.json({
    success: true,
    message: "Stats",
    stats: {
      counts: {
        products: productCount,
        categories: categoryCount,
        orders: revenueAgg[0]?.count ?? 0,
        users: userCount,
        subscribers: subscriberCount,
        pending,
        lowStock: lowStock.length,
      },
      revenue: Math.round((revenueAgg[0]?.revenue ?? 0) * 100) / 100,
      ordersByStatus: byStatus,
      trend,
      topItems,
      recentOrders,
      lowStock,
    },
  });
});