import Collection from "../models/collection.schema";
import asyncHandler from "../services/asyncHandler";
import CustomeError from "../utils/customeErrors";

/**********************************************************************
 @CREATE_COLLECTION
 @request_type POST 
 @route http://localhost:4000/api/collection/create
 @description Create new collection
 @parameters name
 @return success message and collection object
 **********************************************************************/
export const createCollection = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new CustomeError("Collection name is required", 400);
  }

  const collection = await Collection.create({ name });

  res.status(200).json({
    success: true,
    message: "Collection created with success",
    collection,
  });
});

/**********************************************************************
 @UPDATE_COLLECTION
 @request_type PUT 
 @route http://localhost:4000/api/collection/update
 @description Update collection
 @parameters collectionId and name
 @return  success message and collection object
 **********************************************************************/
export const updateCollection = asyncHandler(async (req, res) => {
  const { id: collectionId } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new CustomeError("Collection name is required", 400);
  }

  const updateCollection = await Collection.findByIdAndUpdate(
    collectionId,
    { name },
    { new: true }
  );

  if (!updateCollection) {
    throw new CustomeError("Collection not found", 400);
  }

  res.status(200).json({
    success: true,
    message: "Collection updated successfully",
    collection: updateCollection,
  });
});

/**********************************************************************
 @DELETE_COLLECTION
 @request_type DELETE 
 @route http://localhost:4000/api/collection/delete
 @description Delete collection
 @parameters collectionId and name
 @return success message
 **********************************************************************/
export const deleteCollection = asyncHandler(async (req, res) => {
  const { id: collectionId } = req.params;

  const deleteCollection = await Collection.findByIdAndDelete(collectionId);

  if (!deleteCollection) {
    throw new CustomeError("Collection not found", 400);
  }

  res.status(200).json({
    success: true,
    message: "Collection deleted successfully",
  });
});

/**********************************************************************
 @GET_COLLECTIONS
 @request_type DELETE 
 @route http://localhost:4000/api/collection/get
 @description Return all collection
 @parameters
 @return Collection object
 **********************************************************************/

export const getCollections = asyncHandler(async (_req, res) => {
  const collections = await Collection.find();

  if (!collections) {
    throw new CustomeError("Collections not found", 400);
  }

  res.status(200).json({
    success: true,
    collections,
  });
});
