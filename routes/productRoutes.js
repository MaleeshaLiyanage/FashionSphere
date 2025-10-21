const express = require("express");
const Product = require("../models/Product");
const WaitList = require("../models/WaitingList");
const {
  protect,
  admin,
  identifyUser,
} = require("../middleware/authMiddleware");
const { restockAlertTemplate } = require("../emails/restock");
const { sendEmail } = require("../emails/client");

const router = express.Router();

// @route POST /api/products
// @desc Create a new Product
// @access Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id, // Reference to the admin user who created it
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route PUT /api/products/:id
// @desc Update an existing product ID
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    // Find product by ID
    const product = await Product.findById(req.params.id);

    if (product) {
      const previousStock = product.countInStock;
      // Update product fields
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.discountPrice = discountPrice || product.discountPrice;
      product.countInStock = countInStock || product.countInStock;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.sizes = sizes || product.sizes;
      product.colors = colors || product.colors;
      product.collections = collections || product.collections;
      product.material = material || product.material;
      product.gender = gender || product.gender;
      product.images = images || product.images;
      product.isFeatured =
        isFeatured !== undefined ? isFeatured : product.isFeatured;
      product.isPublished =
        isPublished !== undefined ? isPublished : product.isPublished;
      product.tags = tags || product.tags;
      product.dimensions = dimensions || product.dimensions;
      product.weight = weight || product.weight;
      product.sku = sku || product.sku;

      //   Save the updated product
      const updatedProduct = await product.save();

      // check current product is out of stock and product qty is updated
      if (previousStock === 0 && updatedProduct.countInStock > 0) {
        // send mails to waiting list users
        const waitList = await WaitList.find({
          productId: req.params.id,
        }).populate("user", "name email");

        waitList.forEach((user) => {
          const email = user.user.email;
          const client = user.user.name;
          const emailTemplate = restockAlertTemplate(
            client,
            updatedProduct.name,
            updatedProduct.countInStock
          );

          sendEmail(email, "Restock Alert", emailTemplate, undefined);
          console.log(
            `Email sent to ${email} for new stock : ${updatedProduct.name}`
          );
        });

        // delete wait list
        await WaitList.deleteMany({
          productId: req.params.id,
        });
        console.log(
          `Wait list deleted for product : ${updatedProduct.name} - ${req.params.id}`
        );
      }

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route DELETE /api/products/:id
// @desc Delete a product by ID
// @access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);

    if (product) {
      // Remove the product from DB
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/products
// @desc Get all products with optional query filters
// @access Public
router.get("/", async (req, res) => {
  try {
    const {
      collection,
      size,
      color,
      gender,
      minPrice,
      maxPrice,
      sortBy,
      search,
      category,
      material,
      brand,
      limit,
    } = req.query;

    let query = {};

    //  Filter logic
    if (collection && collection.toLocaleLowerCase() !== "all") {
      query.collections = collection;
    }

    if (category && category.toLocaleLowerCase() !== "all") {
      query.category = category;
    }

    if (material) {
      query.material = { $in: material.split(",") };
    }

    if (brand) {
      query.brand = { $in: brand.split(",") };
    }

    if (size) {
      query.sizes = { $in: size.split(",") };
    }

    if (color) {
      query.colors = { $in: [color] };
    }

    if (gender) {
      query.gender = gender;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort Logic
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case "priceAsc":
          sort = { price: 1 };
          break;
        case "priceDesc":
          sort = { price: -1 };
          break;
        case "popularity":
          sort = { rating: -1 };
          break;
        default:
          break;
      }
    }

    // Fetch products and apply sorting and limit
    let products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit) || 0);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

// @route GET /api/products/best-seller
// @desc Retrieve the product with highest rating
// @access Public
router.get("/best-seller", async (req, res) => {
  try {
    const bestSeller = await Product.findOne().sort({ rating: -1 });
    if (bestSeller) {
      res.json(bestSeller);
    } else {
      res.status(404).json({ message: "No best seller found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/products/new-arrivals
// @desc Retrieve latest 8 products - Creation date
// @access Public
router.get("/new-arrivals", async (req, res) => {
  try {
    // Fetch latest 8 products
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
    res.json(newArrivals);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/products/:id
// @desc Get a single product by ID
// @access Public
router.get("/:id", identifyUser, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    // get waiting list for the product and user
    const waitList = await WaitList.findOne({
      productId: req.params.id,
      user: req.user ? req.user._id : null,
    });
    if (product) {
      res.json({ product, waitList: waitList ? true : false });
    } else {
      console.error(error);
      res.status(500).send("Server Error");
    }
  } catch (error) {}
});

// @route GET /api/products/similar/:id
// @desc Retrieve similar products based on the current product's gender and category
// @access Public
router.get("/similar/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similarProducts = await Product.find({
      _id: { $ne: id }, // Exclude the current product ID
      gender: product.gender,
      category: product.category,
    }).limit(4);

    res.json(similarProducts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/products/wait-list
// @desc Add a product to the waiting list
// @access Private
router.post("/wait-list", protect, async (req, res) => {
  const { productId } = req.body;

  try {
    // Check if the product is already in the wait-list
    const existingProduct = await WaitList.findOne({
      productId,
      user: req.user._id,
    });

    if (existingProduct) {
      // remove the product from the wait-list
      await WaitList.deleteOne({
        _id: existingProduct._id,
      });

      return res.json({
        waitList: false,
        message: "Product removed from wait-list",
      });
    }

    // Add the product to the user's wait-list
    const waitList = await WaitList.create({
      productId,
      user: req.user._id,
    });

    res.json({ waitList: true, message: "Product added to wait-list" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
