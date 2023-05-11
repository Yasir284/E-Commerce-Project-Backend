import formidable from "formidable";
import Product from "../models/product.schema";
import asyncHandler from "../services/asyncHandler";
import fs from "fs";
import CustomError from "../utils/customError.js";
import mongoose from "mongoose";
import { s3FileDelete, s3FileUpload } from "../services/imageUploader";
import config from "../config";

/**********************************************************************
 @ADD_PRODUCT
 @request_type POST
 @route http://localhost:4000/api/product/add
 @description Create products
 @parameters name, price, description, photos
 @return success message and objects
 **********************************************************************/

export const addProduct = asyncHandler(async (req, res) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err)
        throw new CustomError(
          err.message || "Error in adding new product",
          400
        );

      const productId = new mongoose.Types.ObjectId().toHexString();
      console.log(productId);

      if (!(fields.name && fields.price && fields.description))
        throw new CustomError("All fields are mandatory", 400);

      if (Array.isArray(files.filesArray))
        files.filesArray = [files.filesArray];

      const imageArray = await Promise.all(
        Object.keys(files.filesArray).map(async (fileKey, index) => {
          const element = files[fileKey];

          const data = fs.readFileSync(element.filepath);

          const upload = await s3FileUpload({
            bucketName: config.S3_BUCKET_NAME,
            key: `products/${productId}/photo_${index}`,
            body: data,
            contentType: element.mimetype,
          });

          console.log(upload);

          return {
            secure_url: upload.Location,
          };
        })
      );

      const product = await Product.create({
        id: productId,
        images: imageArray,
        ...fields,
      });

      if (!product) throw new CustomError("Error in creating product", 400);

      res.status(200).json({
        success: true,
        product,
      });
    } catch (err) {
      throw new CustomError(err.message || "Something went wrong", 500);
    }
  });
});

/**********************************************************************
 @GET_ALL_PRODUCTS
 @request_type GET
 @route http://localhost:4000/api/product/get
 @description Get all products
 @parameters 
 @return Products objects
 **********************************************************************/

export const getAllProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find();

  if (!products) throw new CustomError("Error in getting products", 400);

  res.status(200).json({ success: true, products });
});

/**********************************************************************
 @GET_PRODUCT_BY_ID
 @request_type POST
 @route http://localhost:4000/api/product/get/:productId
 @description Get product by id
 @parameters productId
 @return Product object
 **********************************************************************/

export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const products = await Product.findById(productId);

  if (!products) throw new CustomError("Error in getting product", 400);

  res.status(200).json({ success: true, products });
});

/**********************************************************************
 @DELETE_PRODUCT
 @request_type DELETE
 @route http://localhost:4000/api/product/delete/:productId
 @description Delete product by id
 @parameters productId
 @return Product object
 **********************************************************************/

export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const products = await Product.findByIdAndDelete(productId);

  if (!products) throw new CustomError("Error in deleting product", 400);

  const deleteImages = await s3FileDelete({
    bucketName: config.S3_BUCKET_NAME,
    key: `products/${productId}`,
  });

  console.log(deleteImages);

  res
    .status(200)
    .json({ success: true, message: "Product deleted successfully" });
});
