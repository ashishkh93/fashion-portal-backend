const Joi = require('joi');

const addService = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    renderIndex: Joi.number(),
    icon: Joi.string().required(),
    coverImage: Joi.string().required(),
  }),
};

const getEditAndDeleteService = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    serviceId: Joi.string().required(),
  }),
};

const getAllService = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
  }),
};

const addCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    serviceId: Joi.string().required(),
  }),
};

const getCategories = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
    searchToken: Joi.string().allow('').allow(null),
    isActive: Joi.bool().allow('').allow(null),
  }),
};

const getEditDeleteCategory = {
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    catId: Joi.string().required().uuid(),
  }),
};

const editCategory = {
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    catId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    serviceId: Joi.string().uuid(),
  }),
};

const editCategoryStatus = {
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    catId: Joi.string().required().uuid(),
  }),
  body: Joi.object().keys({
    isActive: Joi.boolean().required(),
  }),
};

const editServiceStatus = {
  params: Joi.object().keys({
    serviceId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    isActive: Joi.boolean().required(),
  }),
};

const artQueryParams = {
  page: Joi.number(),
  size: Joi.number(),
  searchToken: Joi.string().allow(''),
  sortKey: Joi.string().allow(''),
  status: Joi.string()
    .valid('PENDING', 'APPROVED', 'REJECTED')
    .allow('')
    .allow(null)
    .messages({ 'any.only': 'Invalid stauts' }),
};

const getAllArtsArts = {
  query: Joi.object().keys(artQueryParams),
  params: Joi.object().keys({
    adminId: Joi.string().required(),
  }),
};

const getArtsForSingleArtist = {
  query: Joi.object().keys(artQueryParams),
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    artistId: Joi.string().required(),
  }),
};

const getSingleArtist = {
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    artistId: Joi.string().required().uuid(),
  }),
};

const getSingleCustomer = {
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    customerId: Joi.string().required().uuid(),
  }),
};

const getSingleArt = {
  params: Joi.object().keys({
    adminId: Joi.string().required().uuid(),
    artId: Joi.string().required().uuid(),
    artistId: Joi.string().required().uuid(),
  }),
};

module.exports = {
  addService,
  getEditAndDeleteService,
  getEditDeleteCategory,
  addCategory,
  getCategories,
  editServiceStatus,
  editCategory,
  editCategoryStatus,
  getAllService,
  getAllArtsArts,
  getArtsForSingleArtist,
  getSingleArtist,
  getSingleArt,
  getSingleCustomer,
};
