import Collection from "../models/collection.schema.js";
import CustomError from "../utils/customError.js";
import asyncHandler from "../services/asyncHandler.js";

/**********************************************************************
 @CREATE_COLLECTION
 @request_type POST
 @route http://localhost:4000/api/v1/collection/create
 @description Getting collection name from user and creating new collection 
 @parameters collection name
 @return Success message and collection object
 **********************************************************************/
export const createCollection = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) throw new CustomError("Product name is required", 400);

  const collection = await Collection.create({ name });

  res.status(200).json({
    success: true,
    message: "New collection created",
    collection,
  });
});

/**********************************************************************
 @UPADTE_COLLECTION
 @request_type PUT
 @route http://localhost:4000/api/v1/collection/update/:collectionId
 @description Getting collection name from user and updating collection 
 @parameters collection name and id
 @return Success message and collection object
 **********************************************************************/
export const updateCollection = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { collectionId } = req.params;

  if (!name) throw new CustomError("All fields are mandatory", 400);

  const updatedCollection = await Collection.findByIdAndUpdate(
    { _id: collectionId },
    { name },
    { new: true, runValidators: true }
  );

  console.log(updatedCollection);

  res.status(200).json({
    success: true,
    message: "Collection updated successfully",
    updatedCollection,
  });
});

/**********************************************************************
 @DELETE_COLLECTION
 @request_type DELETE
 @route http://localhost:4000/api/v1/collection/delete/:collectionId
 @description Getting collection name from user and creating new collection 
 @parameters collection id
 @return Success message
 **********************************************************************/
export const deleteCollection = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;

  const deletedCollection = await Collection.findByIdAndDelete(collectionId);

  deleteCollection.remove();

  res.status(200).json({
    success: true,
    message: "Collection deleted successfully",
  });
});

/**********************************************************************
 @GET_COLLECTION
 @request_type GET
 @route http://localhost:4000/api/v1/collection/get
 @description Getting all collection 
 @parameters 
 @return collection object
 **********************************************************************/
export const getCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find();

  if (!collections) throw new CustomError("Error in getting collections", 400);

  res.status(200).json({
    success: true,
    collections,
  });
});
