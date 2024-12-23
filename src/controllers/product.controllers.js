import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

export const addProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, mediaUrls, condition } = req.body;
  const seller = req.user._id;

  if (!name || !price || !description || !category || !mediaUrls || !condition) {
    throw new ApiError(400, "Please provide valid fields");
  }

  const product = new Product({
    name,
    price,
    description,
    category,
    mediaUrls,
    seller,
    condition,
  });

  const savedProduct = await product.save();
  await User.findByIdAndUpdate(
    seller,
    { $push: { products: savedProduct._id } },
    { new: true }
  );

  res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully!"));
});

export const addCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, "Please provide valid fields");
  }
  const category = new Category({ name });
  await category.save();
  res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully!"));
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(new ApiResponse(200, categories, "Categories fetched!"));
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const userId = req.query.profileId || req.user?._id;

  if (!userId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User ID is required"));
  }

  const user = await User.findById(userId).populate({
    path: "products",
    populate: {
      path: "seller",
      select: "fullName",
    },
  });

  if (!user.products || user.products.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No Products found"));
  }

  const response = user.products.map((product) => ({
    id: product._id,
    name: product.name,
    price: product.price,
    description: product.description,
    condition: product.condition,
    isAvailable: product.isAvailable,
    category: product.category,
    mediaUrls: product.mediaUrls,
    seller: product.seller.fullName,
    likes: product.likes.length,
    comments: product.comments.length,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));

  res
    .status(200)
    .json(new ApiResponse(200, response, "products fetched successfully"));
});