const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const app = require("../app");
const connectDB = require("../config/db");
const User = require("../models/User");
const Order = require("../models/Order");

const ensureMongoUri = () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI in .env before running test-orders");
  }
};

const parseCookie = (headers) => {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("No auth cookie returned from API");
  }
  return setCookie.split(";")[0];
};

const registerAndLogin = async (baseUrl, user) => {
  const registerBody = {
    name: user.name,
    email: user.email,
    password: user.password,
  };

  if (user.role) {
    registerBody.role = user.role;
    registerBody.adminSetupKey = process.env.ADMIN_SETUP_KEY;
  }

  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerBody),
  });

  if (![201, 409].includes(registerRes.status)) {
    throw new Error(`Register failed for ${user.email} with ${registerRes.status}`);
  }

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      role: user.role,
    }),
  });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed for ${user.email} with ${loginRes.status}`);
  }

  return parseCookie(loginRes.headers);
};

const run = async () => {
  ensureMongoUri();
  process.env.ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY || "test-admin-key";
  await connectDB();

  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    await Order.deleteMany({
      "user.email": { $in: ["customer@laundry.local", "admin@laundry.local"] },
    }).catch(() => {});
    await User.deleteMany({
      email: { $in: ["customer@laundry.local", "admin@laundry.local"] },
    });

    const customer = {
      name: "Customer User",
      email: "customer@laundry.local",
      password: "secret123",
    };
    const admin = {
      name: "Admin User",
      email: "admin@laundry.local",
      password: "secret123",
      role: "admin",
    };

    const customerCookie = await registerAndLogin(baseUrl, customer);
    const adminCookie = await registerAndLogin(baseUrl, admin);

    const createRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        items: [
          {
            clothType: "Shirt",
            serviceType: "wash-and-iron",
            qty: 3,
            unitPrice: 50,
          },
        ],
        pickupDate: "2026-04-29",
        deliveryDate: "2026-04-30",
        address: "123 Laundry Street",
        notes: "Handle with care",
      }),
    });

    if (createRes.status !== 201) {
      throw new Error(`Create order failed with ${createRes.status}`);
    }

    const createBody = await createRes.json();
    const orderId = createBody.order._id;

    const myOrdersRes = await fetch(`${baseUrl}/api/orders`, {
      headers: { Cookie: customerCookie },
    });
    if (myOrdersRes.status !== 200) {
      throw new Error(`Get my orders failed with ${myOrdersRes.status}`);
    }

    const updateByCustomerRes = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({ status: "ready" }),
    });
    if (updateByCustomerRes.status !== 403) {
      throw new Error("Customer should not be allowed to update order status");
    }

    const updateByAdminRes = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ status: "ready", paymentStatus: "paid" }),
    });
    if (updateByAdminRes.status !== 200) {
      throw new Error(`Admin update failed with ${updateByAdminRes.status}`);
    }

    const singleOrderRes = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      headers: { Cookie: customerCookie },
    });
    if (singleOrderRes.status !== 200) {
      throw new Error(`Get order by id failed with ${singleOrderRes.status}`);
    }

    const deleteRes = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      method: "DELETE",
      headers: { Cookie: customerCookie },
    });
    if (deleteRes.status !== 200) {
      throw new Error(`Delete order failed with ${deleteRes.status}`);
    }

    console.log("Order API test passed: create -> list -> admin update -> delete");
  } finally {
    await User.deleteMany({
      email: { $in: ["customer@laundry.local", "admin@laundry.local"] },
    });
    await Order.deleteMany({});
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  }
};

run().catch((error) => {
  console.error("Order API test failed:", error.message);
  process.exit(1);
});
