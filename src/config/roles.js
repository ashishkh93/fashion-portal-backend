const roles = ['superAdmin', 'artist', 'customer'];

const roleRights = new Map();
roleRights.set(roles[0], ['manageUsers', 'manageServices', 'manageArtists', 'managePayouts']);
roleRights.set(roles[1], []);

module.exports = {
  roles,
  roleRights,
};
