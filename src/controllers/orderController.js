const mongoose = require("mongoose");
const Order = require("../models/Order");

const allowedStatuses = [
  "pending",
  "picked",
  "washing",
  "ready",
  "delivered",
  "cancelled",
];

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "At least one order item is required";
  }

  for (const item of items) {
    if (
      !item.clothType ||
      !item.serviceType ||
      typeof item.qty !== "number" ||
      typeof item.unitPrice !== "number"
    ) {
      return "Each item must include clothType, serviceType, qty, and unitPrice";
    }

    if (item.qty < 1 || item.unitPrice < 0) {
      return "qty must be at least 1 and unitPrice cannot be negative";
    }
  }

  return null;
};

const calculateTotalAmount = (items) =>
  items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

const canManageAnyOrder = (user) =>
  user.role === "admin" || user.role === "staff";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createOrder = async (req, res) => {
  try {
    const { items, pickupDate, deliveryDate, address, notes } = req.body;

    const itemError = validateItems(items);
    if (itemError) {
      return res.status(400).json({ message: itemError });
    }

    if (!pickupDate || !deliveryDate || !address) {
      return res
        .status(400)
        .json({ message: "pickupDate, deliveryDate, and address are required" });
    }

    const pickup = new Date(pickupDate);
    const delivery = new Date(deliveryDate);

    if (Number.isNaN(pickup.getTime()) || Number.isNaN(delivery.getTime())) {
      return res.status(400).json({ message: "pickupDate or deliveryDate is invalid" });
    }

    if (delivery < pickup) {
      return res
        .status(400)
        .json({ message: "deliveryDate must be after or equal to pickupDate" });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      pickupDate: pickup,
      deliveryDate: delivery,
      address,
      notes,
      totalAmount: calculateTotalAmount(items),
    });

    const populatedOrder = await Order.findById(order._id).populate(
      "user",
      "name email role"
    );

    return res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create order" });
  }
};

const getOrders = async (req, res) => {
  try {
    const filter = canManageAnyOrder(req.user) ? {} : { user: req.user._id };
    const orders = await Order.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id).populate("user", "name email role");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!canManageAnyOrder(req.user) && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: cannot access this order" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!canManageAnyOrder(req.user)) {
      return res.status(403).json({ message: "Forbidden: staff or admin only" });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      order.status = status;
    }

    if (paymentStatus) {
      if (!["pending", "paid"].includes(paymentStatus)) {
        return res.status(400).json({ message: "Invalid paymentStatus value" });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id).populate(
      "user",
      "name email role"
    );

    return res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner && !canManageAnyOrder(req.user)) {
      return res.status(403).json({ message: "Forbidden: cannot delete this order" });
    }

    await order.deleteOne();
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete order" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
