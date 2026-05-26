function getActorRole(req) {
  return String(req.header('x-rol') || '').toLowerCase();
}

function getActorName(req) {
  return String(req.header('x-actor') || 'anon').trim();
}

function requireRoles(roles) {
  return (req, res, next) => {
    const role = getActorRole(req);
    if (!roles.includes(role)) {
      return res.status(403).json({
        error: 'Rol no autorizado',
        required: roles
      });
    }
    next();
  };
}

module.exports = {
  getActorName,
  getActorRole,
  requireRoles
};
