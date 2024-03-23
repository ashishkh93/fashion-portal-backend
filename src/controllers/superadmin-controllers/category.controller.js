const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { categoryService } = require('../../services/superadmin-services');

const getAllCategories = catchAsync(async (req, res) => {
  const { page, size } = req.query;
  const cats = await categoryService.getAllCategorieService(page, size);
  res.status(httpStatus.OK).send({ status: true, message: 'Categories fetched successfully', entity: cats });
});

const createCategory = catchAsync(async (req, res) => {
  const cat = await categoryService.addCategory(req.body);
  res.status(httpStatus.CREATED).send({ status: true, message: 'Category added successfully', entity: cat });
});

const getOneCategory = catchAsync(async (req, res) => {
  const catId = req.params.catId;
  const oneCat = await categoryService.getSingleCategory(catId);
  res.status(httpStatus.OK).send({ status: true, message: 'Category fetched successfully', entity: oneCat });
});

const editCategory = catchAsync(async (req, res) => {
  const catId = req.params.catId;
  await categoryService.editCatService(req.body, catId);
  res.status(httpStatus.OK).send({ status: true, message: 'Category updated successfully', entity: req.body });
});

const deleteCategory = catchAsync(async (req, res) => {
  const catId = req.params.catId;
  await categoryService.deleteCatService(catId);
  res.status(httpStatus.OK).send({ status: true, message: 'Category deleted successfully', entity: null });
});

module.exports = {
  getAllCategories,
  createCategory,
  getOneCategory,
  editCategory,
  deleteCategory,
};
