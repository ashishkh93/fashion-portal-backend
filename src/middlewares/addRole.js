const addRole = (req, role, resolve, _reject) => {
  req.role = role;
  resolve();
};

const addRoleToLoginRoute = (role) => async (req, _res, next) => {
  await new Promise((resolve, reject) => {
    addRole(req, role, resolve, reject);
  });
  next();
};

module.exports = addRoleToLoginRoute;
