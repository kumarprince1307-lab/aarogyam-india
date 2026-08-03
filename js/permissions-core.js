/*
 * Permission Core (Phase-1 foundation)
 * Purpose: provide additive permission helpers for module access and action-level checks.
 * This file is side-effect free and does not modify existing flows.
 */

(function (root, factory) {
  var api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.AarogyamPermissions = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var DEFAULT_PERMISSION_MODULES = [
    'books',
    'library',
    'downloads',
    'reports',
    'share',
    'products',
    'disease',
    'agriculture',
    'training',
    'webinar',
    'business',
    'wallet',
    'rewards'
  ];

  function normalizePermissions(input) {
    var normalized = {};

    if (!input || typeof input !== 'object') {
      return normalized;
    }

    var rawPermissions = Array.isArray(input.permissions) ? input.permissions : [];

    rawPermissions.forEach(function (permission) {
      if (typeof permission === 'string' && permission.trim()) {
        normalized[permission.trim().toLowerCase()] = true;
      }
    });

    if (typeof input.module_access === 'object' && input.module_access) {
      Object.entries(input.module_access).forEach(function (entry) {
        var moduleName = entry[0];
        var allowed = entry[1];
        normalized['module:' + moduleName.toLowerCase()] = Boolean(allowed);
      });
    }

    return normalized;
  }

  function hasPermission(permissionSet, permissionName) {
    if (!permissionSet || typeof permissionSet !== 'object') {
      return false;
    }

    if (typeof permissionName !== 'string' || !permissionName.trim()) {
      return false;
    }

    var normalized = permissionName.trim().toLowerCase();
    return Boolean(permissionSet[normalized]);
  }

  function canAccessModule(permissionSet, moduleName) {
    if (!moduleName || typeof moduleName !== 'string') {
      return false;
    }

    return hasPermission(permissionSet, 'module:' + moduleName.toLowerCase()) || hasPermission(permissionSet, 'module:all');
  }

  function getVisibleModules(permissionSet, availableModules) {
    availableModules = Array.isArray(availableModules) ? availableModules : DEFAULT_PERMISSION_MODULES;

    return availableModules.filter(function (moduleName) {
      return canAccessModule(permissionSet, moduleName);
    });
  }

  function buildPermissionGrant(permissionName, enabled) {
    enabled = typeof enabled === 'undefined' ? true : enabled;

    if (typeof permissionName !== 'string' || !permissionName.trim()) {
      return null;
    }

    return {
      permission: permissionName.trim().toLowerCase(),
      enabled: enabled
    };
  }

  return {
    DEFAULT_PERMISSION_MODULES: DEFAULT_PERMISSION_MODULES,
    normalizePermissions: normalizePermissions,
    hasPermission: hasPermission,
    canAccessModule: canAccessModule,
    getVisibleModules: getVisibleModules,
    buildPermissionGrant: buildPermissionGrant
  };
});
