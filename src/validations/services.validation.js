const Joi = require('joi');
const { validateUUID } = require('./common.validation');

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
    adminId: validateUUID(),
    serviceId: validateUUID(),
  }),
};

const getAllService = {
  params: Joi.object().keys({
    adminId: validateUUID(),
  }),
};

const addCategory = {
  params: Joi.object().keys({
    adminId: validateUUID(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    serviceId: validateUUID(),
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
    adminId: validateUUID(),
    catId: validateUUID(),
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
  page: Joi.number().optional(),
  size: Joi.number().optional(),
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
    adminId: validateUUID(),
  }),
};

const getArtsForSingleArtist = {
  query: Joi.object().keys(artQueryParams),
  params: Joi.object().keys({
    adminId: validateUUID(),
    artistId: validateUUID(),
  }),
};

const getSingleArtist = {
  params: Joi.object().keys({
    adminId: validateUUID(),
    artistId: validateUUID(),
  }),
};

const getSingleCustomer = {
  params: Joi.object().keys({
    adminId: validateUUID(),
    customerId: validateUUID(),
  }),
};

const getSingleArt = {
  params: Joi.object().keys({
    adminId: validateUUID(),
    artId: validateUUID(),
    artistId: validateUUID(),
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
