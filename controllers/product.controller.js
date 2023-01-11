import Product from "../models/product.schema";
import asyncHandler from "../services/asyncHandler";

/**********************************************************************
 @CREATE_PRODUCT
 @request_type POST
 @route http://localhost:4000/api/product/create
 @description Create products
 @parameters name, price, description, stokes, photos, stokes and sold
 @return success message
 **********************************************************************/

export const createProducts = asyncHandler(async (req, res) => {});
