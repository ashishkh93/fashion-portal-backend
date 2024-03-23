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
    serviceId: Joi.string().required(),
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
  }),
};

const getEditDeleteCategory = {
  params: Joi.object().keys({
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

module.exports = {
  addService,
  getEditAndDeleteService,
  getEditDeleteCategory,
  addCategory,
  getCategories,
  editServiceStatus,
  editCategoryStatus,
};
