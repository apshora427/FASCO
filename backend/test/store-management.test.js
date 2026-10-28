import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { unlink } from "node:fs/promises";
import { basename, join } from "node:path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";
import { Product } from "../src/models/product.model.js";
import { User } from "../src/models/user.model.js";
import { Order } from "../src/models/order.model.js";
import { Coupon } from "../src/models/coupon.model.js";
import { Review } from "../src/models/review.model.js";
import { uploadsDirectory } from "../src/utils/uploadStorage.js";
import { createOrderFromRequest } from "../src/controllers/order.controller.js";
import {
  expireUnpaidStripeSession,
  releaseUnpaidOrder,
} from "../src/controllers/paymentReservation.js";
import { completeStripeCheckout } from "../src/controllers/payment.controller.js";

let mongo;
let server;
let baseUrl;
let userToken;
let adminToken;
let accountToken;
let userId;
let accountUserId;

const request = async (path, method = "GET", body, token) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, data: await response.json() };
};

const createTestOrder = async (payload, token = userToken, options = {}) => {
  const id = token === accountToken ? accountUserId : userId;
  try {
    const order = await createOrderFromRequest(
      { body: payload, user: token ? { id } : undefined },
      { paymentStatus: "paid", paymentMethod: "test", ...options }
    );
    return { status: 201, data: { order } };
  } catch (error) {
    if (error.statusCode) return { status: error.statusCode, data: {} };
    throw error;
  }
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  const password = await bcrypt.hash("Test-Password-123!", 4);
  await User.create([
    { name: "Customer", email: "customer@test.invalid", password, role: "user", isVerified: true },
    { name: "Admin", email: "admin@test.invalid", password, role: "admin", isVerified: true },
    { name: "Account Customer", email: "account@test.invalid", password, role: "user", isVerified: true },
  ]);

  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;

  const userLogin = await request("/login", "POST", {
    email: "customer@test.invalid",
    password: "Test-Password-123!",
    role: "user",
  });
  const adminLogin = await request("/login", "POST", {
    email: "admin@test.invalid",
    password: "Test-Password-123!",
    role: "admin",
  });
  const accountLogin = await request("/login", "POST", {
    email: "account@test.invalid",
    password: "Test-Password-123!",
    role: "user",
  });
  assert.equal(userLogin.status, 200);
  assert.equal(adminLogin.status, 200);
  assert.equal(accountLogin.status, 200);
  userToken = userLogin.data.userInfo.accesstoken;
  adminToken = adminLogin.data.userInfo.accesstoken;
  accountToken = accountLogin.data.userInfo.accesstoken;
  userId = userLogin.data.userInfo.id;
  accountUserId = accountLogin.data.userInfo.id;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test("enforces roles and validates category, product, inventory, and order flows", async () => {
  const preflight = await fetch(`${baseUrl}/product`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://127.0.0.1:5198",
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), "http://127.0.0.1:5198");

  const wrongRole = await request("/login", "POST", {
    email: "customer@test.invalid",
    password: "Test-Password-123!",
    role: "admin",
  });
  assert.equal(wrongRole.status, 403);
  assert.equal(
    (await request("/category", "POST", { categoryName: "Unauthorized" }, userToken)).status,
    403
  );
  assert.equal((await request("/product/create", "POST", {}, userToken)).status, 403);
  assert.equal((await request("/order", "GET", undefined, userToken)).status, 403);
  assert.equal((await request("/users", "GET", undefined, userToken)).status, 403);
  assert.equal((await request("/subscriber", "GET", undefined, userToken)).status, 403);

  const categoryResponse = await request(
    "/category",
    "POST",
    { categoryName: "  Test   Apparel  " },
    adminToken
  );
  assert.equal(categoryResponse.status, 201);
  const categoryId = categoryResponse.data.category._id;
  assert.equal(
    (await request("/category", "POST", { categoryName: "test apparel" }, adminToken)).status,
    409
  );
  const categoryList = await request("/category");
  assert.equal(categoryList.status, 200);
  assert.deepEqual(categoryList.data.category.map(({ categoryName }) => categoryName), ["Test Apparel"]);
  assert.equal((await request("/product/create", "POST", {})).status, 401);

  assert.equal(
    (
      await request(
        "/product/create",
        "POST",
        { title: "Bad category", price: 10, category: "Missing", image: "coat.jpg" },
        adminToken
      )
    ).status,
    400
  );
  assert.equal(
    (
      await request(
        "/product/create",
        "POST",
        {
          title: "Bad stock",
          price: 10,
          category: "Test Apparel",
          image: "coat.jpg",
          stock: 2.5,
        },
        adminToken
      )
    ).status,
    400
  );

  const productResponse = await request(
    "/product/create",
    "POST",
    {
      title: "Test Coat",
      price: 10,
      originalPrice: 20,
      discount: "50% OFF",
      tag: "Sale",
      brand: "Test Brand",
      reviews: "(3)",
      category: "Test Apparel",
      image: "coat.jpg",
      stock: 3,
      sizes: ["M"],
      colors: ["Blue"],
      images: ["coat-gallery.jpg"],
    },
    adminToken
  );
  assert.equal(productResponse.status, 201);
  const productId = productResponse.data.product.id;
  assert.equal((await request("/wishlist", "GET", undefined, userToken)).data.wishlistIds.length, 0);
  assert.equal((await request("/wishlist", "PUT", { wishlistIds: [productId] }, userToken)).status, 200);
  assert.deepEqual(
    (await request("/wishlist", "GET", undefined, userToken)).data.wishlistIds,
    [productId]
  );
  assert.deepEqual(
    (await request("/wishlist", "GET", undefined, accountToken)).data.wishlistIds,
    []
  );
  assert.equal((await request("/wishlist", "PUT", { wishlistIds: [0] }, userToken)).status, 400);
  assert.equal((await request("/wishlist", "GET")).status, 401);

  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/r7sAAAAASUVORK5CYII=",
    "base64"
  );
  const formData = new FormData();
  formData.append("image", new Blob([png], { type: "image/png" }), "tiny.png");
  const uploadResponse = await fetch(`${baseUrl}/product/upload-image`, {
    method: "POST",
    headers: { Authorization: adminToken },
    body: formData,
  });
  const uploaded = await uploadResponse.json();
  assert.equal(uploadResponse.status, 201);
  assert.match(uploaded.imageUrl, /\/uploads\/[a-f0-9-]+\.png$/);
  const servedImage = await fetch(uploaded.imageUrl);
  assert.equal(servedImage.status, 200);
  assert.equal(servedImage.headers.get("content-type"), "image/png");
  assert.equal(servedImage.headers.get("cross-origin-resource-policy"), "cross-origin");
  await unlink(join(uploadsDirectory, basename(new URL(uploaded.imageUrl).pathname)));

  const spoofedForm = new FormData();
  spoofedForm.append("image", new Blob([png], { type: "image/jpeg" }), "spoofed.jpg");
  const spoofedUpload = await fetch(`${baseUrl}/product/upload-image`, {
    method: "POST",
    headers: { Authorization: adminToken },
    body: spoofedForm,
  });
  assert.equal(spoofedUpload.status, 400);
  const oversizedForm = new FormData();
  oversizedForm.append(
    "image",
    new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)], { type: "image/png" }),
    "too-large.png"
  );
  const oversizedUpload = await fetch(`${baseUrl}/product/upload-image`, {
    method: "POST",
    headers: { Authorization: adminToken },
    body: oversizedForm,
  });
  assert.equal(oversizedUpload.status, 413);
  assert.equal(
    (await fetch(`${baseUrl}/product/upload-image`, {
      method: "POST",
      body: new FormData(),
    })).status,
    401
  );
  const paymentConfig = await request("/payment/config");
  assert.equal(paymentConfig.status, 200);
  assert.equal(typeof paymentConfig.data.paymentEnabled, "boolean");
  assert.equal((await request("/order", "POST", {})).status, 404);
  if (!paymentConfig.data.paymentEnabled) {
    assert.equal(
      (await request("/payment/checkout-session", "POST", {})).status,
      503
    );
  }
  const unpaidOrder = await createTestOrder(
    {
      items: [{ id: productId, quantity: 1 }],
      customer: {
        email: "buyer@test.invalid",
        firstName: "Test",
        lastName: "Buyer",
        address: "1 Main Street",
        city: "Town",
        postal: "12345",
        country: "United States",
      },
    },
    userToken,
    { paymentStatus: "unpaid", paymentMethod: "stripe" }
  );
  assert.equal(unpaidOrder.data.order.paymentStatus, "unpaid");
  await Order.updateOne(
    { _id: unpaidOrder.data.order._id },
    { $set: { paymentSessionId: "cs_test_expired" } }
  );
  assert.equal(
    (await request(
      `/order/${unpaidOrder.data.order._id}/status`,
      "PATCH",
      { status: "confirmed" },
      adminToken
    )).status,
    409
  );
  assert.equal(await releaseUnpaidOrder(unpaidOrder.data.order._id, "failed", "cs_test_expired"), true);
  assert.equal((await Order.findById(unpaidOrder.data.order._id)).status, "cancelled");
  assert.equal((await Product.findOne({ id: productId })).stock, 3);
  const paidOrder = await createTestOrder(
    {
      items: [{ id: productId, quantity: 1 }],
      customer: {
        email: "buyer@test.invalid",
        firstName: "Test",
        lastName: "Buyer",
        address: "1 Main Street",
        city: "Town",
        postal: "12345",
        country: "United States",
      },
    },
    userToken,
    { paymentStatus: "unpaid", paymentMethod: "stripe" }
  );
  const stripeSession = {
    id: "cs_test_async_paid",
    payment_status: "paid",
    payment_intent: "pi_test_async_paid",
    amount_total: Math.round(paidOrder.data.order.total * 100),
    currency: "usd",
    metadata: { orderId: String(paidOrder.data.order._id) },
  };
  await Order.updateOne(
    { _id: paidOrder.data.order._id },
    { $set: { paymentSessionId: stripeSession.id } }
  );
  assert.equal(await completeStripeCheckout(stripeSession), true);
  assert.equal(await completeStripeCheckout(stripeSession), false);
  const confirmedPaidOrder = await Order.findById(paidOrder.data.order._id).select("+paymentIntentId");
  assert.equal(confirmedPaidOrder.status, "confirmed");
  assert.equal(confirmedPaidOrder.paymentStatus, "paid");
  assert.equal(confirmedPaidOrder.paymentIntentId, stripeSession.payment_intent);
  let sessionExpireCalls = 0;
  assert.equal(await expireUnpaidStripeSession(
    { paymentMethod: "stripe", paymentStatus: "unpaid", paymentSessionId: "cs_test_open" },
    { checkout: { sessions: {
      retrieve: async () => ({ status: "open", payment_status: "unpaid" }),
      expire: async () => {
        sessionExpireCalls += 1;
        return { status: "expired" };
      },
    } } }
  ), true);
  assert.equal(sessionExpireCalls, 1);
  await assert.rejects(
    expireUnpaidStripeSession(
      { paymentMethod: "stripe", paymentStatus: "unpaid", paymentSessionId: "cs_test_paid" },
      { checkout: { sessions: {
        retrieve: async () => ({ status: "complete", payment_status: "paid" }),
      } } }
    ),
    { statusCode: 409 }
  );
  await Order.deleteOne({ _id: paidOrder.data.order._id });
  await Product.updateOne({ id: productId }, { $inc: { stock: 1 } });
  const productList = await request("/product");
  assert.equal(productList.status, 200);
  assert.ok(productList.data.products.some((product) => product.id === productId));
  assert.equal(
    (await request(`/product/${productId}`, "PUT", { stock: 2.5 }, adminToken)).status,
    400
  );
  const clearedProduct = await request(
    `/product/${productId}`,
    "PUT",
    {
      originalPrice: null,
      discount: null,
      tag: null,
      brand: null,
      reviews: null,
      images: [],
      sizes: [],
      colors: [],
    },
    adminToken
  );
  assert.equal(clearedProduct.status, 200);
  assert.equal(clearedProduct.data.product.originalPrice, null);
  assert.equal(clearedProduct.data.product.discount, null);
  assert.equal(clearedProduct.data.product.tag, null);
  assert.equal(clearedProduct.data.product.brand, null);
  assert.equal(clearedProduct.data.product.reviews, null);
  assert.deepEqual(clearedProduct.data.product.images, []);
  assert.deepEqual(clearedProduct.data.product.sizes, []);
  assert.deepEqual(clearedProduct.data.product.colors, []);

  assert.equal((await request("/coupon", "GET", undefined, userToken)).status, 403);
  const limitedCoupon = await request(
    "/coupon",
    "POST",
    {
      code: "LIMITED",
      discount: 0.25,
      minOrderAmount: 15,
      usageLimit: 1,
    },
    adminToken
  );
  assert.equal(limitedCoupon.status, 201);
  assert.equal(
    (await request("/coupon/validate", "POST", { code: "LIMITED", subtotal: 10 })).status,
    400
  );
  assert.equal(
    (await request("/coupon/validate", "POST", { code: "LIMITED", subtotal: 20 })).data.coupon.amount,
    5
  );
  const expiredCoupon = await request(
    "/coupon",
    "POST",
    { code: "EXPIRED", discount: 0.1, expiresAt: "2020-01-01T00:00:00.000Z" },
    adminToken
  );
  assert.equal(expiredCoupon.status, 201);
  assert.equal(
    (await request("/coupon/validate", "POST", { code: "EXPIRED", subtotal: 100 })).status,
    400
  );
  assert.equal((await request(`/coupon/${expiredCoupon.data.coupon._id}`, "DELETE", undefined, userToken)).status, 403);

  const customer = {
    email: "buyer@test.invalid",
    firstName: "Test",
    lastName: "Buyer",
    address: "1 Main Street",
    city: "Town",
    postal: "12345",
    country: "United States",
  };
  assert.equal(
    (
      await createTestOrder({
        items: [{ id: productId, quantity: 2 }, { id: productId, quantity: 2 }],
        customer,
      }, userToken)
    ).status,
    400
  );
  assert.equal(
    (
      await createTestOrder({
        items: [{ id: productId, quantity: 1 }],
        customer: null,
      }, userToken)
    ).status,
    400
  );

  const attempts = await Promise.all(
    [1, 2].map(() =>
      createTestOrder(
        {
          items: [{ id: productId, quantity: 2, size: "M", color: "Blue", price: 0 }],
          customer,
          discountCode: "LIMITED",
        },
        userToken
      )
    )
  );
  const attemptStatuses = attempts.map(({ status }) => status);
  assert.equal(attemptStatuses.filter((status) => status === 201).length, 1);
  assert.ok(attemptStatuses.some((status) => status === 400 || status === 409));
  const successfulOrder = attempts.find(({ status }) => status === 201).data.order;
  assert.equal(successfulOrder.subtotal, 20);
  assert.equal(successfulOrder.discount, 5);
  assert.equal(successfulOrder.total, 55);
  assert.equal(successfulOrder.isGuest, false);
  assert.equal((await Product.findOne({ id: productId })).stock, 1);
  assert.equal(
    (await request(`/order/${successfulOrder._id}/status`, "PATCH", { status: "shipped" }, adminToken)).status,
    400
  );

  assert.equal(
    (
      await request(
        `/order/${successfulOrder._id}/status`,
        "PATCH",
        { status: "cancelled" },
        adminToken
      )
    ).status,
    200
  );
  assert.equal((await Product.findOne({ id: productId })).stock, 3);
  assert.equal((await Coupon.findOne({ code: "LIMITED" })).usageCount, 0);
  assert.equal(
    (
      await request(
        `/order/${successfulOrder._id}/status`,
        "PATCH",
        { status: "cancelled" },
        adminToken
      )
    ).status,
    200
  );
  assert.equal((await Product.findOne({ id: productId })).stock, 3);
  assert.equal(
    (
      await request(
        `/order/${successfulOrder._id}/status`,
        "PATCH",
        { status: "shipped" },
        adminToken
      )
    ).status,
    400
  );

  const deliveredOrderResponse = await createTestOrder(
    { items: [{ id: productId, quantity: 2 }], customer, discountCode: "LIMITED" },
    userToken
  );
  assert.equal(deliveredOrderResponse.status, 201);
  const deliveredOrder = deliveredOrderResponse.data.order;
  for (const status of ["confirmed", "packed", "shipped", "delivered"]) {
    const updated = await request(`/order/${deliveredOrder._id}/status`, "PATCH", { status }, adminToken);
    assert.equal(updated.status, 200);
  }
  assert.equal((await request(`/order/${deliveredOrder._id}/status`, "PATCH", { status: "cancelled" }, adminToken)).status, 400);
  assert.equal((await Coupon.findOne({ code: "LIMITED" })).usageCount, 1);
  assert.equal((await request("/coupon/validate", "POST", { code: "LIMITED", subtotal: 20 })).status, 400);

  assert.equal((await request(`/product/${productId}/reviews`, "GET")).status, 200);
  assert.equal(
    (await request(`/product/${productId}/reviews`, "POST", { rating: 5, comment: "Not signed in" })).status,
    401
  );
  assert.equal(
    (await request(`/product/${productId}/reviews`, "POST", { rating: 5, comment: "No delivered order" }, accountToken)).status,
    403
  );
  const review = await request(
    `/product/${productId}/reviews`,
    "POST",
    { rating: 4, comment: "Comfortable and well made." },
    userToken
  );
  assert.equal(review.status, 201);
  assert.equal(review.data.product.rating, 4);
  assert.equal(review.data.product.reviews, "(1)");
  assert.equal(
    (await request(`/product/${productId}/reviews`, "POST", { rating: 5, comment: "Second review" }, userToken)).status,
    409
  );
  const secondCustomerOrder = await createTestOrder(
    { items: [{ id: productId, quantity: 1 }], customer },
    accountToken
  );
  assert.equal(secondCustomerOrder.status, 201);
  for (const status of ["confirmed", "packed", "shipped", "delivered"]) {
    assert.equal(
      (await request(`/order/${secondCustomerOrder.data.order._id}/status`, "PATCH", { status }, adminToken)).status,
      200
    );
  }
  const secondReview = await request(
    `/product/${productId}/reviews`,
    "POST",
    { rating: 2, comment: "Runs a little small." },
    accountToken
  );
  assert.equal(secondReview.status, 201);
  assert.equal(secondReview.data.product.rating, 3);
  assert.equal(secondReview.data.product.reviews, "(2)");
  assert.equal((await Product.findOne({ id: productId })).rating, 3);

  assert.equal((await request(`/category/${categoryId}`, "DELETE", undefined, adminToken)).status, 400);
  assert.equal(
    (
      await request(
        `/category/${categoryId}`,
        "PUT",
        { categoryName: "Renamed Apparel" },
        adminToken
      )
    ).status,
    200
  );
  assert.equal((await Product.findOne({ id: productId })).category, "Renamed Apparel");
  assert.equal((await request(`/product/${productId}`, "DELETE", undefined, adminToken)).status, 200);
  assert.equal(await Review.countDocuments({ productId }), 0);
  assert.deepEqual(
    (await request("/wishlist", "GET", undefined, userToken)).data.wishlistIds,
    []
  );
  assert.equal((await request(`/category/${categoryId}`, "DELETE", undefined, adminToken)).status, 200);

  const usersResponse = await request("/users", "GET", undefined, adminToken);
  assert.equal(usersResponse.status, 200);
  const customerUser = usersResponse.data.users.find((item) => item.email === "customer@test.invalid");
  const adminUser = usersResponse.data.users.find((item) => item.email === "admin@test.invalid");
  assert.ok(customerUser.id);
  assert.equal(
    (await request(`/user/${customerUser.id}/role`, "PATCH", { role: "admin" }, adminToken)).status,
    200
  );
  assert.equal(
    (await request(`/user/${adminUser.id}/role`, "PATCH", { role: "user" }, adminToken)).status,
    400
  );
  assert.equal(
    (await request(`/user/${customerUser.id}`, "DELETE", undefined, adminToken)).status,
    200
  );

  const couponResponse = await request(
    "/coupon",
    "POST",
    { code: "DASHBOARD10", discount: 0.1, description: "Dashboard test" },
    adminToken
  );
  assert.equal(couponResponse.status, 201);
  const couponId = couponResponse.data.coupon._id;
  assert.equal(
    (await request("/coupon/validate", "POST", { code: "DASHBOARD10", subtotal: 100 })).data.coupon.amount,
    10
  );
  assert.equal(
    (await request(`/coupon/${couponId}`, "PUT", { active: false }, adminToken)).status,
    200
  );
  assert.equal((await request("/coupon/validate", "POST", { code: "DASHBOARD10", subtotal: 100 })).status, 400);
  assert.equal((await request(`/coupon/${couponId}`, "DELETE", undefined, adminToken)).status, 200);

  assert.equal(
    (await request("/subscribe", "POST", { email: "newsletter@test.invalid", source: "test" })).status,
    201
  );
  const subscribersResponse = await request("/subscriber", "GET", undefined, adminToken);
  assert.equal(subscribersResponse.status, 200);
  const subscriber = subscribersResponse.data.subscribers.find((item) => item.email === "newsletter@test.invalid");
  assert.ok(subscriber);
  assert.equal(
    (await request(`/subscriber/${subscriber._id}`, "DELETE", undefined, adminToken)).status,
    200
  );

  await Order.create([
    {
      orderNumber: "FS-ANALYTICS-PAID",
      items: [{ productId: 9991, title: "Analytics paid item", price: 10, quantity: 3 }],
      customer: { email: "stats@test.invalid" },
      subtotal: 30,
      total: 30,
      paymentStatus: "paid",
    },
    {
      orderNumber: "FS-ANALYTICS-UNPAID",
      items: [{ productId: 9992, title: "Analytics unpaid item", price: 80, quantity: 4 }],
      customer: { email: "stats@test.invalid" },
      subtotal: 320,
      total: 320,
      paymentStatus: "unpaid",
    },
    {
      orderNumber: "FS-ANALYTICS-CANCELLED",
      items: [{ productId: 9993, title: "Analytics cancelled item", price: 90, quantity: 5 }],
      customer: { email: "stats@test.invalid" },
      subtotal: 450,
      total: 450,
      paymentStatus: "paid",
      status: "cancelled",
    },
  ]);
  const stats = await request("/dashboard/stats", "GET", undefined, adminToken);
  assert.equal(stats.status, 200);
  assert.ok(stats.data.stats.topItems.some(({ title }) => title === "Analytics paid item"));
  assert.ok(stats.data.stats.topItems.every(({ title }) => !title.startsWith("Analytics unpaid")));
  assert.ok(stats.data.stats.topItems.every(({ title }) => !title.startsWith("Analytics cancelled")));
});

test("supports secure customer profile, email, password, and private order history", async () => {
  const savedProfile = await request(
    "/profile",
    "PATCH",
    { name: "Updated Customer", phone: "+1 555 0100", avatar: "data:image/jpeg;base64,/9j/2Q==" },
    accountToken
  );
  assert.equal(savedProfile.status, 200);
  assert.equal(savedProfile.data.user.name, "Updated Customer");
  assert.equal(savedProfile.data.user.phone, "+1 555 0100");
  assert.equal(savedProfile.data.user.avatar, "data:image/jpeg;base64,/9j/2Q==");
  assert.equal(
    (await request("/profile", "PATCH", { avatar: "data:image/svg+xml;base64,PHN2Zz4=" }, accountToken)).status,
    400
  );

  const sentCode = await request(
    "/profile/email/request",
    "POST",
    { email: "new-account@test.invalid" },
    accountToken
  );
  assert.equal(sentCode.status, 200);
  assert.ok(sentCode.data.devCode);
  assert.equal(
    (await request("/profile/email/verify", "POST", { code: "000000" }, accountToken)).status,
    401
  );
  const verifiedEmail = await request(
    "/profile/email/verify",
    "POST",
    { code: sentCode.data.devCode },
    accountToken
  );
  assert.equal(verifiedEmail.status, 200);
  assert.equal(verifiedEmail.data.user.email, "new-account@test.invalid");
  const updatedToken = verifiedEmail.data.accesstoken;
  assert.equal((await request("/me", "GET", undefined, accountToken)).status, 401);

  const passwordChange = await request(
    "/profile/password",
    "POST",
    {
      currentPassword: "Test-Password-123!",
      newPassword: "Fresh-456!",
      confirmPassword: "Fresh-456!",
    },
    updatedToken
  );
  assert.equal(passwordChange.status, 200);
  assert.equal((await request("/me", "GET", undefined, updatedToken)).status, 401);
  const newPasswordLogin = await request("/login", "POST", {
    email: "new-account@test.invalid",
    password: "Fresh-456!",
    role: "user",
  });
  assert.equal(newPasswordLogin.status, 200);
  const freshToken = newPasswordLogin.data.userInfo.accesstoken;

  await Order.create([
    {
      orderNumber: "FS-ACCOUNT-1",
      items: [{ productId: 1, title: "Account order", price: 20, quantity: 1 }],
      customer: { email: "new-account@test.invalid" },
      subtotal: 20,
      total: 60,
      user: (await User.findOne({ email: "new-account@test.invalid" }))._id,
      isGuest: false,
    },
    {
      orderNumber: "FS-OTHER-1",
      items: [{ productId: 1, title: "Private order", price: 30, quantity: 1 }],
      customer: { email: "customer@test.invalid" },
      subtotal: 30,
      total: 70,
      user: (await User.findOne({ email: "admin@test.invalid" }))._id,
      isGuest: false,
    },
  ]);
  const privateOrders = await request("/my-orders", "GET", undefined, freshToken);
  assert.equal(privateOrders.status, 200);
  assert.ok(privateOrders.data.orders.some(({ orderNumber }) => orderNumber === "FS-ACCOUNT-1"));
  assert.ok(privateOrders.data.orders.every((order) => String(order.user) === String(newPasswordLogin.data.userInfo.id)));
  assert.ok(privateOrders.data.orders.every(({ orderNumber }) => orderNumber !== "FS-OTHER-1"));
  assert.equal((await request("/my-orders")).status, 401);
});
