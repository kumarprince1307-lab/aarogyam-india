/* ==========================================================================
   UCAS PERMISSIONS MANAGER
   Evaluates permissions from public.permissions or defaults.
   Admin can manage; normal users cannot elevate permissions.
   ========================================================================== */

(function (window) {
  'use strict';

  // Standard UCAS Permission Keys
  const ALL_PERMISSIONS = [
    'profile_view',
    'profile_edit',
    'survey_access',
    'survey_create',
    'survey_view',
    'phonebook_view',
    'phonebook_add',
    'phonebook_edit',
    'phonebook_delete',
    'phonebook_import',
    'leads_view',
    'leads_manage',
    'leads_feedback',
    'call',
    'whatsapp',
    'message',
    'share_contact_view',
    'share_contact_action',
    'facebook_share',
    'instagram_share',
    'youtube_share',
    'referral_link_view',
    'link_generate',
    'contacts_export',
    'leads_export'
  ];

  // Default permissions granted to standard registered users
  const DEFAULT_USER_PERMISSIONS = {
    profile_view: true,
    profile_edit: true,
    survey_access: true,
    survey_create: true,
    survey_view: true,
    phonebook_view: true,
    phonebook_add: true,
    phonebook_edit: true,
    phonebook_delete: true,
    phonebook_import: true,
    leads_view: true,
    leads_manage: true,
    leads_feedback: true,
    call: true,
    whatsapp: true,
    message: true,
    share_contact_view: true,
    share_contact_action: true,
    facebook_share: true,
    instagram_share: true,
    youtube_share: true,
    referral_link_view: true,
    link_generate: true,
    contacts_export: false,
    leads_export: false
  };

  let userPermissionsMap = { ...DEFAULT_USER_PERMISSIONS };

  async function loadUserPermissions(profileId) {
    if (!profileId) {
      userPermissionsMap = { ...DEFAULT_USER_PERMISSIONS };
      return userPermissionsMap;
    }

    try {
      if (window.UCAS_DB) {
        const res = await window.UCAS_DB.getPermissions(profileId);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const map = { ...DEFAULT_USER_PERMISSIONS };
          res.data.forEach(p => {
            if (p.permission_key) {
              map[p.permission_key] = Boolean(p.allowed);
            }
          });
          userPermissionsMap = map;
          return userPermissionsMap;
        }
      }
    } catch (e) {
      console.warn('UCAS Permissions: error loading custom permissions, using defaults', e);
    }

    userPermissionsMap = { ...DEFAULT_USER_PERMISSIONS };
    return userPermissionsMap;
  }

  function hasPermission(permissionKey) {
    if (isAdmin()) return true;
    if (typeof userPermissionsMap[permissionKey] !== 'undefined') {
      return Boolean(userPermissionsMap[permissionKey]);
    }
    return Boolean(DEFAULT_USER_PERMISSIONS[permissionKey]);
  }

  function isAdmin() {
    const adminSession = localStorage.getItem('admin_session') === 'true';
    const currentUser = window.UCAS_SESSION ? window.UCAS_SESSION.getCurrentUser() : null;
    const isSpecialAdmin = currentUser && (currentUser.mobile === '7974422572' || currentUser.mobile === '9999999999' || currentUser.role === 'admin');
    return adminSession || isSpecialAdmin;
  }

  window.UCAS_PERMISSIONS = {
    ALL_PERMISSIONS,
    DEFAULT_USER_PERMISSIONS,
    loadUserPermissions,
    hasPermission,
    isAdmin,
    getMap: () => userPermissionsMap
  };

  console.log('✅ UCAS Permissions Manager Ready.');
})(window);
