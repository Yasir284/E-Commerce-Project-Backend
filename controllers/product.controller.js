import formidable from "formidable";
import Product from "../models/product.schema";
import asyncHandler from "../services/asyncHandler";
import fs from "fs";
import CustomError from "../utils/customError.js";
import mongoose from "mongoose";
import { s3FileUpload } from "../services/imageUploader";
import config from "../config";

/**********************************************************************
 @ADD_PRODUCT
 @request_type POST
 @route http://localhost:4000/api/product/add
 @description Create products
 @parameters name, price, description, photos
 @return success message
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
