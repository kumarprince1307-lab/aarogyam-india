/*
 * Share Engine Core (Phase-1 foundation)
 * Purpose: provide additive helpers for asset normalization, share token generation,
 * attribution payload construction and share/lead reporting metadata.
 *
 * This file is intentionally side-effect free and does not alter current flows.
 */

(function (root, factory) {
  var api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.AarogyamShareEngine = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var SHARE_ENGINE_DEFAULTS = {
    assetType: 'website',
    shareChannel: 'other',
    shareSource: 'direct',
    visitorKey: 'aarogyam-share-visitor',
    shareTokenPrefix: 'sh'
  };

  function normalizeAsset(asset) {
    if (!asset || typeof asset !== 'object') {
      return {
        asset_type: SHARE_ENGINE_DEFAULTS.assetType,
        asset_id: 'unknown',
        asset_title: 'Unknown Asset',
        asset_url: ''
      };
    }

    return {
      asset_type: asset.asset_type || asset.type || SHARE_ENGINE_DEFAULTS.assetType,
      asset_id: asset.asset_id || asset.id || 'unknown',
      asset_title: asset.asset_title || asset.title || 'Unknown Asset',
      asset_url: asset.asset_url || asset.url || ''
    };
  }

  function generateShareToken(prefix) {
    prefix = prefix || SHARE_ENGINE_DEFAULTS.shareTokenPrefix;
    var randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
    var timePart = Date.now().toString(36).toUpperCase();
    return prefix + '-' + timePart + '-' + randomPart;
  }

  function buildShareLinkPayload(options) {
    var asset = options && options.asset;
    var profile = options && options.profile;
    var channel = options && options.channel;
    var source = options && options.source;
    var location = options && options.location;
    var referrer = options && options.referrer;
    var visitorId = options && options.visitorId;
    var shareToken = options && options.shareToken;

    var normalizedAsset = normalizeAsset(asset);
    var effectiveToken = shareToken || generateShareToken();
    var effectiveProfile = profile || {};

    return {
      token: effectiveToken,
      asset_type: normalizedAsset.asset_type,
      asset_id: normalizedAsset.asset_id,
      asset_title: normalizedAsset.asset_title,
      asset_url: normalizedAsset.asset_url || (location && location.href) || '',
      created_by_profile_id: effectiveProfile.id || null,
      share_channel: channel || SHARE_ENGINE_DEFAULTS.shareChannel,
      share_source: source || SHARE_ENGINE_DEFAULTS.shareSource,
      referrer_profile_id: effectiveProfile.referrer_profile_id || null,
      visitor_id: visitorId || null,
      referrer_url: referrer || '',
      created_at: new Date().toISOString()
    };
  }

  function buildAttributionPayload(options) {
    var asset = options && options.asset;
    var profile = options && options.profile;
    var channel = options && options.channel;
    var source = options && options.source;
    var location = options && options.location;
    var referrer = options && options.referrer;
    var visitorId = options && options.visitorId;
    var shareLinkId = options && options.shareLinkId;
    var shareToken = options && options.shareToken;

    var normalizedAsset = normalizeAsset(asset);
    var effectiveProfile = profile || {};

    return {
      acquisition_source: source || SHARE_ENGINE_DEFAULTS.shareSource,
      asset_type: normalizedAsset.asset_type,
      asset_id: normalizedAsset.asset_id,
      asset_title: normalizedAsset.asset_title,
      share_link_id: shareLinkId || null,
      referrer_profile_id: effectiveProfile.referrer_profile_id || null,
      tracking_token: shareToken || null,
      visitor_id: visitorId || null,
      share_channel: channel || SHARE_ENGINE_DEFAULTS.shareChannel,
      referrer_url: referrer || '',
      landing_url: (location && location.href) || '',
      created_at: new Date().toISOString()
    };
  }

  function buildLeadOwnershipPayload(options) {
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
      note: note || null
    };
  }

  function buildReportSummary(rows) {
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map(function (row) {
      return {
        ...row,
        shares: row.shares || 0,
        clicks: row.clicks || 0,
        visitors: row.visitors || 0,
        leads: row.leads || 0,
        registrations: row.registrations || 0,
        purchases: row.purchases || 0,
        conversion: row.conversion || 0
      };
    });
  }

  function readVisitorId(storage, key) {
    key = key || SHARE_ENGINE_DEFAULTS.visitorKey;

    if (typeof storage === 'undefined' || !storage) {
      return null;
    }

    try {
      var value = storage.getItem(key);
      return value || null;
    } catch (error) {
      return null;
    }
  }

  function writeVisitorId(storage, visitorId, key) {
    key = key || SHARE_ENGINE_DEFAULTS.visitorKey;

    if (typeof storage === 'undefined' || !storage) {
      return null;
    }

    try {
      storage.setItem(key, visitorId);
      return visitorId;
    } catch (error) {
      return null;
    }
  }

  return {
    SHARE_ENGINE_DEFAULTS: SHARE_ENGINE_DEFAULTS,
    normalizeAsset: normalizeAsset,
    generateShareToken: generateShareToken,
    buildShareLinkPayload: buildShareLinkPayload,
    buildAttributionPayload: buildAttributionPayload,
    buildLeadOwnershipPayload: buildLeadOwnershipPayload,
    buildReportSummary: buildReportSummary,
    readVisitorId: readVisitorId,
    writeVisitorId: writeVisitorId
  };
});
