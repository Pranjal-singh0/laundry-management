const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { createToken } = require("../utils/jwt");

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const allowedRoles = ["customer", "staff", "admin"];

const resolveRegistrationRole = (role, adminSetupKey) => {
  const requestedRole = role || "customer";

  if (!allowedRoles.includes(requestedRole)) {
    return { error: "Invalid role value" };
  }

  if (requestedRole === "customer") {
    return { role: "customer" };
  }

  if (!process.env.ADMIN_SETUP_KEY) {
    return {
      error:
        "ADMIN_SETUP_KEY is not configured. Add it to .env before creating staff or admin users",
    };
  }

  if (adminSetupKey !== process.env.ADMIN_SETUP_KEY) {
    return { error: "Invalid admin setup key" };
  }

  return { role: requestedRole };
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, adminSetupKey } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, and password are required" });
    }

    const roleResult = resolveRegistrationRole(role, adminSetupKey);
    if (roleResult.error) {
      return res.status(400).json({ message: roleResult.error });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: roleResult.role,
    });

    const token = createToken({ userId: user._id });
    res.cookie("token", token, getCookieOptions());

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: "Role does not match this account" });
    }

    const token = createToken({ userId: user._id });
    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};

const me = async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

const logout = async (req, res) => {
  res.clearCookie("token", getCookieOptions());
  return res.status(200).json({ message: "Logout successful" });
};

module.exports = { register, login, me, logout };
