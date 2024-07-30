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
    searchToken: Joi.string().allow(''),
  }),
};

const getEditDeleteCategory = {
  params: Joi.object().keys({
    adminId: Joi.string().required(),
    catId: Joi.string().required(),
  }),
};

const editCategoryStatus = {
  params: Joi.object().keys({
    catId: Joi.string().required(),
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

const getArtists = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
    searchToken: Joi.string().allow(''),
  }),
  params: Joi.object().keys({
    adminId: Joi.string().required(),
  }),
};

const getArts = {
  query: Joi.object().keys({
    page: Joi.number(),
    size: Joi.number(),
    searchToken: Joi.string().allow(''),
    sortKey: Joi.string().allow(''),
  }),
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
  editCategoryStatus,
  getAllService,
  getArtists,
  getArts,
  getSingleArtist,
  getSingleArt,
  getSingleCustomer,
};
