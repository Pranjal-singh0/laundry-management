const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const app = require("../app");
const connectDB = require("../config/db");
const User = require("../models/User");

const ensureMongoUri = () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI in .env before running test-api");
  }
};

const parseCookie = (headers) => {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("No auth cookie returned from API");
  }
  return setCookie.split(";")[0];
};

const run = async () => {
  ensureMongoUri();
  await connectDB();

  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    await User.deleteOne({ email: "testuser@laundry.local" });

    const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "testuser@laundry.local",
        password: "secret123",
      }),
    });

    if (registerRes.status !== 201) {
      throw new Error(`Register failed with status ${registerRes.status}`);
    }

    const cookie = parseCookie(registerRes.headers);

    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: { Cookie: cookie },
    });

    if (meRes.status !== 200) {
      throw new Error(`/me failed with status ${meRes.status}`);
    }

    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookie },
    });

    if (logoutRes.status !== 200) {
      throw new Error(`/logout failed with status ${logoutRes.status}`);
    }

    console.log("API test passed: register -> me -> logout");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  }
};

run().catch((error) => {
  console.error("API test failed:", error.message);
  process.exit(1);
});
