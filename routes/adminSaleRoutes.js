const express = require("express");
const cron = require("node-cron");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");
const { sendEmail } = require("../emails/client");
const { saleNotificationTemplate } = require("../emails/sales");
const User = require("../models/User");

const router = express.Router();

// @route GET /api/admin/sales
// @desc Get all sales
// @access Private/Admin
router.get("/", protect, async (req, res) => {
  try {
    const sales = await Sale.find({});
    // filter out expired sales
    const now = new Date();
    const filteredSales = sales.filter((sale) => new Date(sale.endDate) >= now);
    // sort with latest first
    filteredSales.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    res.json({ sales: filteredSales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/admin/sales/:id
// @desc Get a single sale
// @access Private/Admin
router.get("/:id", protect, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route POST /api/admin/sales
// @desc Create a new sale
// @access Private/Admin
router.post("/", protect, async (req, res) => {
  const { discountPercentage, startDate, endDate, name } = req.body;

  try {
    const sale = new Sale({
      discountPercentage,
      startDate,
      endDate,
      name,
    });
    await sale.save();
    res.status(201).json({ message: "Sale created successfully", sale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route PUT /api/admin/sales/:id
// @desc Update a sale
// @access Private/Admin
router.put("/:id", protect, async (req, res) => {
  const { discountPercentage, startDate, endDate, name } = req.body;

  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    sale.discountPercentage = discountPercentage || sale.discountPercentage;
    sale.startDate = startDate || sale.startDate;
    sale.endDate = endDate || sale.endDate;
    sale.name = name || sale.name;

    await sale.save();
    res.json({ message: "Sale updated successfully", sale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route DELETE /api/admin/sales/:id
// @desc Delete a sale
// @access Private/Admin
router.delete("/:id", protect, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // check sale is active or not
    if (sale.isActive) {
      return res.status(400).json({
        message: "Cannot delete an active sale with associated products",
      });
    } else {
      await sale.deleteOne();
      res.json({ message: "Sale removed successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}); 

// @cron job to check for active sales every day
// This cron job will run every day and check for active sales
// If there are active sales, it will apply the highest discount to all products
cron.schedule("0 0 * * *", async () => { 
  try {  
    const now = new Date();

    // Find all valid sales (active and within date range)
    const validSales = await Sale.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
 
    if (validSales.length === 0) { 
      // No valid sales, reset all discount prices
      await Product.updateMany({}, { $set: { discountPrice: 0 } });
      console.log(
        "No valid sales found. All products reset to original price."
      );
      return;
    }

    // Select the sale with the highest discountPercentage
    const bestSale = validSales.reduce(
      (max, sale) =>
        sale.discountPercentage > max.discountPercentage ? sale : max,
      validSales[0]
    );

    // Update all products' discountPrice based on the best sale
    const products = await Product.find({});
    for (const product of products) {
      product.discountPrice = Number(
        (product.price * (1 - bestSale.discountPercentage / 100)).toFixed(2)
      );
      await product.save();
    }

    // make all other sales inactive
    await Sale.updateMany(
      { _id: { $ne: bestSale._id } },
      { $set: { isActive: false } }
    );

    // sale mark as active
    await Sale.updateMany({ _id: bestSale._id }, { $set: { isActive: true } });
    
    console.log(
      `Applied ${
        bestSale.discountPercentage
      }% discount to all products at ${now.toISOString()}`
    );

    // get notifications all users
    const users = await User.find({ saleNotification: true });
    
    if (users.length === 0) {
      console.log("No users subscribed to sale notifications.");
    }
    // destructure start date , end date sales percentage and name
    const { startDate, endDate, discountPercentage, name } = bestSale;

    // create notification
    const emailTemplate = saleNotificationTemplate(
      name,
      discountPercentage,
      startDate,
      endDate
    );
    // send email to all users
    users.forEach((user) => {
      const { email } = user;
      sendEmail(email, "Sale Notification", emailTemplate, undefined);
      console.log(`Email sent to ${email} for sale: ${name}`);
    });
  } catch (error) {
    console.error("Error running sale cron job:", error);
  }
});

module.exports = router;
