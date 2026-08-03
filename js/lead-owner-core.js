/*
 * Lead Owner Core (Phase-1 foundation)
 * Purpose: provide additive helpers for owner assignment and permanent-lead ownership
 * without altering existing registration or checkout flows.
 */

(function (root, factory) {
  var api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.AarogyamLeadOwner = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function buildLeadOwnerRecord(options) {
    var leadId = options && options.leadId;
    var ownerProfileId = options && options.ownerProfileId;
    var ownerShareId = options && options.ownerShareId;
    var assignedByProfileId = options && options.assignedByProfileId;
    var asset = options && options.asset;
    var note = options && options.note;

    return {
      lead_id: leadId || null,
      owner_profile_id: ownerProfileId || null,
      owner_share_id: ownerShareId || null,
      assigned_by_profile_id: assignedByProfileId || null,
      asset_type: (asset && asset.asset_type) || null,
      asset_id: (asset && asset.asset_id) || null,
      assigned_at: new Date().toISOString(),
      is_permanent: true,
      allow_auto_reassign: false,
      note: note || null
    };
  }

  function canReassignLeadOwner(existingOwnerId, requestedOwnerId) {
    if (!existingOwnerId || !requestedOwnerId) {
      return false;
    }

    return false;
  }

  function buildLeadOwnerHistoryEntry(options) {
    var leadId = options && options.leadId;
    var ownerProfileId = options && options.ownerProfileId;
    var ownerShareId = options && options.ownerShareId;
    var assignedByProfileId = options && options.assignedByProfileId;
    var asset = options && options.asset;
    var note = options && options.note;

    return {
      lead_id: leadId || null,
      owner_profile_id: ownerProfileId || null,
      owner_share_id: ownerShareId || null,
      assigned_by_profile_id: assignedByProfileId || null,
      asset_type: (asset && asset.asset_type) || null,
      asset_id: (asset && asset.asset_id) || null,
      assigned_at: new Date().toISOString(),
      event_type: 'assigned',
      is_permanent: true,
      note: note || null
    };
  }

  return {
    buildLeadOwnerRecord: buildLeadOwnerRecord,
    canReassignLeadOwner: canReassignLeadOwner,
    buildLeadOwnerHistoryEntry: buildLeadOwnerHistoryEntry
  };
});
