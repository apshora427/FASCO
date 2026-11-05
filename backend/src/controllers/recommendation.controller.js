import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { RecommendationEvent } from "../models/recommendationEvent.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const EVENT_WEIGHTS = { view: 1, wishlist: 3, cart: 4 };
const PURCHASE_WEIGHT = 6;
const MAX_RESULTS = 12;

const addAffinity = (affinities, productId, score) => {
  affinities.set(productId, (affinities.get(productId) || 0) + score);
};

const addCategoryAffinity = (affinities, category, score) => {
  if (category) affinities.set(category, (affinities.get(category) || 0) + score);
};

const recencyMultiplier = (date, halfLifeDays = 60) => {
  const ageDays = Math.max(0, (Date.now() - new Date(date).getTime()) / 86_400_000);
  return Math.pow(0.5, ageDays / halfLifeDays);
};

const scorePurchase = (line, date, productAffinities, categoryAffinities) => {
  const score = PURCHASE_WEIGHT * (1 + Math.log1p(Math.max(0, line.quantity - 1))) * recencyMultiplier(date, 180);
  addAffinity(productAffinities, line.productId, score);
  addCategoryAffinity(categoryAffinities, line.category, score);
};

export const trackRecommendationEvent = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") throw new ApiError(403, "Recommendations are available to customer accounts");
  const { productId, eventType } = req.body || {};
  if (!Number.isSafeInteger(productId) || productId < 1) {
    throw new ApiError(400, "A valid product ID is required");
  }
  if (!Object.hasOwn(EVENT_WEIGHTS, eventType)) {
    throw new ApiError(400, "Event type must be view, cart, or wishlist");
  }

  const product = await Product.findOne({ id: productId }).select("id category");
  if (!product) throw new ApiError(404, "Product not found");

  await RecommendationEvent.findOneAndUpdate(
    { user: req.user.id, productId, eventType },
    {
      $set: { category: product.category, lastInteraction: new Date() },
      $inc: { count: 1 },
    },
    { upsert: true, returnDocument: "after", runValidators: true }
  );
  res.status(202).json({ success: true, message: "Recommendation activity recorded" });
});

export const getRecommendations = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") throw new ApiError(403, "Recommendations are available to customer accounts");
  const requestedLimit = Number(req.query.limit ?? 8);
  if (!Number.isSafeInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > MAX_RESULTS) {
    throw new ApiError(400, `Limit must be a whole number between 1 and ${MAX_RESULTS}`);
  }

  const excludedIds = new Set();
  if (req.query.excludeProductId !== undefined) {
    const excludeProductId = Number(req.query.excludeProductId);
    if (!Number.isSafeInteger(excludeProductId) || excludeProductId < 1) {
      throw new ApiError(400, "excludeProductId must be a valid product ID");
    }
    excludedIds.add(excludeProductId);
  }

  const [userEvents, userOrders, user] = await Promise.all([
    RecommendationEvent.find({ user: req.user.id }).sort({ lastInteraction: -1 }).limit(250).lean(),
    Order.find({ user: req.user.id, paymentStatus: "paid" })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("items createdAt")
      .lean(),
    User.findById(req.user.id).select("wishlistIds").lean(),
  ]);

  const userAffinities = new Map();
  const categoryAffinities = new Map();
  const interactedProductIds = new Set(excludedIds);
  const categoriesByProduct = new Map();

  for (const event of userEvents) {
    const score =
      EVENT_WEIGHTS[event.eventType] *
      (1 + Math.log1p(Math.min(event.count, 100)) * 0.2) *
      recencyMultiplier(event.lastInteraction);
    addAffinity(userAffinities, event.productId, score);
    addCategoryAffinity(categoryAffinities, event.category, score);
    interactedProductIds.add(event.productId);
    categoriesByProduct.set(event.productId, event.category);
  }
  for (const order of userOrders) {
    for (const line of order.items) {
      scorePurchase(line, order.createdAt, userAffinities, categoryAffinities);
      interactedProductIds.add(line.productId);
      categoriesByProduct.set(line.productId, line.category);
    }
  }
  const wishlistIds = Array.isArray(user?.wishlistIds) ? user.wishlistIds : [];
  const wishlistedProducts = wishlistIds.length
    ? await Product.find({ id: { $in: wishlistIds } }).select("id category").lean()
    : [];
  for (const product of wishlistedProducts) {
    addAffinity(userAffinities, product.id, EVENT_WEIGHTS.wishlist);
    addCategoryAffinity(categoryAffinities, product.category, EVENT_WEIGHTS.wishlist);
    interactedProductIds.add(product.id);
    categoriesByProduct.set(product.id, product.category);
  }

  const currentProduct = excludedIds.size
    ? await Product.findOne({ id: [...excludedIds][0] }).select("category brand")
    : null;
  if (currentProduct) {
    categoriesByProduct.set([...excludedIds][0], currentProduct.category);
    addCategoryAffinity(categoryAffinities, currentProduct.category, 1.5);
  }

  const rankedAffinities = [...userAffinities.entries()].sort((a, b) => b[1] - a[1]);
  const seeds = rankedAffinities.slice(0, 30);
  const contentSeeds = rankedAffinities.slice(0, 50);
  const seedIds = seeds.map(([id]) => id);
  const peerEvents = seedIds.length
    ? await RecommendationEvent.find({
        user: { $ne: req.user.id },
        productId: { $in: seedIds },
        lastInteraction: { $gte: new Date(Date.now() - 180 * 86_400_000) },
      })
        .sort({ lastInteraction: -1 })
        .limit(3000)
        .lean()
    : [];
  const peerPurchaseSignals = seedIds.length
    ? await Order.find({
        user: { $nin: [req.user.id, null] },
        paymentStatus: "paid",
        "items.productId": { $in: seedIds },
        createdAt: { $gte: new Date(Date.now() - 365 * 86_400_000) },
      })
        .sort({ createdAt: -1 })
        .limit(1000)
        .select("user")
        .lean()
    : [];
  const peerUsers = [...new Set([
    ...peerEvents.map((event) => String(event.user)),
    ...peerPurchaseSignals.map((order) => String(order.user)),
  ])];
  const peerActivities = peerUsers.length
    ? await RecommendationEvent.find({
        user: { $in: peerUsers },
        lastInteraction: { $gte: new Date(Date.now() - 180 * 86_400_000) },
      })
        .sort({ lastInteraction: -1 })
        .limit(5000)
        .lean()
    : [];
  const peerOrders = peerUsers.length
    ? await Order.find({
        user: { $in: peerUsers },
        paymentStatus: "paid",
        createdAt: { $gte: new Date(Date.now() - 365 * 86_400_000) },
      })
        .sort({ createdAt: -1 })
        .limit(250)
        .select("user items createdAt")
        .lean()
    : [];

  const peers = new Map();
  const ensurePeer = (userId) => {
    const key = String(userId);
    if (!peers.has(key)) peers.set(key, new Map());
    return peers.get(key);
  };
  for (const event of peerActivities) {
    const score = EVENT_WEIGHTS[event.eventType] * recencyMultiplier(event.lastInteraction);
    addAffinity(ensurePeer(event.user), event.productId, score);
  }
  for (const order of peerOrders) {
    const peer = ensurePeer(order.user);
    for (const line of order.items) {
      addAffinity(peer, line.productId, PURCHASE_WEIGHT * recencyMultiplier(order.createdAt, 180));
    }
  }

  const collaborativeScores = new Map();
  for (const [, peerAffinities] of peers) {
    let dot = 0;
    let userNorm = 0;
    let peerNorm = 0;
    for (const [productId, score] of peerAffinities) {
      peerNorm += score * score;
      const userScore = userAffinities.get(productId) || 0;
      if (userScore) dot += score * userScore;
    }
    for (const score of userAffinities.values()) userNorm += score * score;
    const similarity = userNorm && peerNorm ? dot / Math.sqrt(userNorm * peerNorm) : 0;
    if (similarity < 0.05) continue;
    for (const [productId, score] of peerAffinities) {
      if (interactedProductIds.has(productId)) continue;
      addAffinity(collaborativeScores, productId, similarity * score);
    }
  }

  const catalog = await Product.find({ stock: { $gt: 0 } })
    .select("id title price originalPrice discount brand rating reviews tag category image stock sizes colors")
    .lean();
  const productById = new Map(catalog.map((product) => [product.id, product]));
  const candidates = catalog
    .filter((product) => !interactedProductIds.has(product.id))
    .map((product) => {
      let contentScore = categoryAffinities.get(product.category) || 0;
      for (const [productId, affinity] of contentSeeds) {
        const seedCategory = categoriesByProduct.get(productId);
        const seedProduct = productById.get(productId);
        if (seedCategory === product.category) contentScore += affinity * 0.35;
        if (seedProduct?.brand && seedProduct.brand === product.brand) contentScore += affinity * 0.2;
      }
      const collaborativeScore = collaborativeScores.get(product.id) || 0;
      const popularityScore = Math.max(0, product.rating || 0) * 0.015;
      return {
        ...product,
        score: contentScore + collaborativeScore * 1.5 + popularityScore,
        recommendationReason: collaborativeScore > contentScore * 0.75
          ? "Customers with similar interests also liked this"
          : contentScore > 0
            ? "Based on your browsing and purchases"
            : "Popular with FASCO customers",
      };
    })
    .sort((a, b) => b.score - a.score || (b.rating || 0) - (a.rating || 0) || a.id - b.id)
    .slice(0, requestedLimit);

  res.json({
    success: true,
    message: "Personalized recommendations",
    recommendations: candidates.map(({ score, ...product }) => product),
    signals: {
      browsing: userEvents.length > 0,
      purchases: userOrders.length > 0,
      similarCustomers: collaborativeScores.size > 0,
    },
  });
});
