import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";

export const addProduct = asyncHandler(async(req,res)=>{
    const {name, price, description, category, images,  condition} = req.body
    const seller = req.user._id;

    if(!name || !price || !description || !category || !images || !condition){
        throw new ApiError(400, "Please provide valid fields");
    }

    const product = new Product({
        name,
        price,
        description,
        category,
        images,
        seller,
        condition
    })

    const savedProduct = await product.save();
    await User.findByIdAndUpdate(
        seller,
        { $push: { products: savedProduct._id } },
        { new: true }
      );

    res.status(201).json(new ApiResponse(201, product, "Product created successfully!"));
})