const roles = ['superAdmin', 'artist', 'user'];

const roleRights = new Map();
roleRights.set(roles[0], ['manageUsers', 'manageServices', 'manageArtists']);
roleRights.set(roles[1], []);

module.exports = {
  roles,
  roleRights,
};
