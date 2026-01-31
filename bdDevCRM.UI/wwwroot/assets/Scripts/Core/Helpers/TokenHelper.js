/*=========================================================
 * Token Helper Utilities
 * File: TokenHelper.js
 * Description: JWT token parsing and validation utilities
 * Author: devSakhawat
 * Date: 2026-01-30
 * 
 * Features:
 * - Parse JWT tokens
 * - Extract claims from tokens
 * - Validate token structure
 * - Check token expiration
 * - Decode base64url encoded payloads
=========================================================*/

var TokenHelper = (function () {
  'use strict';

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Base64URL decode (JWT uses base64url, not standard base64)
   * @private
   */
  function _base64UrlDecode(base64Url) {
    try {
      // Replace URL-safe characters
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // Add padding if needed
      var pad = base64.length % 4;
      if (pad) {
        if (pad === 1) {
          throw new Error('Invalid base64url string');
        }
        base64 += new Array(5 - pad).join('=');
      }

      // Decode base64
      var decoded = atob(base64);

      // Convert to UTF-8
      return decodeURIComponent(
        decoded.split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
    } catch (error) {
      console.error('[TokenHelper] Base64URL decode error:', error);
      return null;
    }
  }

  /**
   * Validate JWT structure (3 parts separated by dots)
   * @private
   */
  function _isValidJwtStructure(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    var parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Parse JWT token into header, payload, signature
   * @private
   */
  function _parseJwtParts(token) {
    var parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    return {
      header: parts[0],
      payload: parts[1],
      signature: parts[2]
    };
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /**
     * Parse JWT token and extract payload
     * @param {string} token - JWT token string
     * @returns {object|null} Decoded payload or null if invalid
     */
    parseToken: function (token) {
      if (!_isValidJwtStructure(token)) {
        console.error('[TokenHelper] Invalid JWT structure');
        return null;
      }

      try {
        var parts = _parseJwtParts(token);
        var decodedPayload = _base64UrlDecode(parts.payload);

        if (!decodedPayload) {
          console.error('[TokenHelper] Failed to decode payload');
          return null;
        }

        return JSON.parse(decodedPayload);
      } catch (error) {
        console.error('[TokenHelper] Error parsing token:', error);
        return null;
      }
    },

    /**
     * Get specific claim from token
     * @param {string} token - JWT token
     * @param {string} claimName - Claim name to extract
     * @returns {*} Claim value or null
     */
    getClaim: function (token, claimName) {
      var payload = this.parseToken(token);

      if (!payload) {
        return null;
      }

      return payload[claimName] || null;
    },

    /**
     * Get all claims from token
     * @param {string} token - JWT token
     * @returns {object|null} All claims or null
     */
    getAllClaims: function (token) {
      return this.parseToken(token);
    },

    /**
     * Get user ID from token
     * @param {string} token - JWT token
     * @returns {number|null} User ID or null
     */
    getUserId: function (token) {
      var userId = this.getClaim(token, 'UserId');
      return userId ? parseInt(userId, 10) : null;
    },

    /**
     * Get username from token
     * @param {string} token - JWT token
     * @returns {string|null} Username or null
     */
    getUsername: function (token) {
      return this.getClaim(token, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name') ||
        this.getClaim(token, 'name') ||
        this.getClaim(token, 'UserName');
    },

    /**
     * Get token expiry timestamp (in seconds)
     * @param {string} token - JWT token
     * @returns {number|null} Expiry timestamp or null
     */
    getExpiry: function (token) {
      var exp = this.getClaim(token, 'exp');
      return exp ? parseInt(exp, 10) : null;
    },

    /**
     * Get token issued at timestamp (in seconds)
     * @param {string} token - JWT token
     * @returns {number|null} Issued at timestamp or null
     */
    getIssuedAt: function (token) {
      var iat = this.getClaim(token, 'iat');
      return iat ? parseInt(iat, 10) : null;
    },

    /**
     * Check if token is expired
     * @param {string} token - JWT token
     * @returns {boolean} True if expired
     */
    isExpired: function (token) {
      var exp = this.getExpiry(token);

      if (!exp) {
        return true; // No expiry = consider expired
      }

      var now = Math.floor(Date.now() / 1000); // Current time in seconds
      return now >= exp;
    },

    /**
     * Get remaining token lifetime in seconds
     * @param {string} token - JWT token
     * @returns {number} Remaining seconds (0 if expired)
     */
    getRemainingLifetime: function (token) {
      var exp = this.getExpiry(token);

      if (!exp) {
        return 0;
      }

      var now = Math.floor(Date.now() / 1000);
      var remaining = exp - now;

      return remaining > 0 ? remaining : 0;
    },

    /**
     * Check if token should be refreshed soon
     * @param {string} token - JWT token
     * @param {number} thresholdSeconds - Refresh threshold (default: 60)
     * @returns {boolean} True if should refresh
     */
    shouldRefreshToken: function (token, thresholdSeconds) {
      var threshold = thresholdSeconds || 60;
      var remaining = this.getRemainingLifetime(token);

      return remaining > 0 && remaining <= threshold;
    },

    /**
     * Validate token structure (basic check)
     * @param {string} token - JWT token
     * @returns {boolean} True if valid structure
     */
    isValidStructure: function (token) {
      return _isValidJwtStructure(token);
    },

    /**
     * Get token header (decoded)
     * @param {string} token - JWT token
     * @returns {object|null} Decoded header or null
     */
    getHeader: function (token) {
      if (!_isValidJwtStructure(token)) {
        return null;
      }

      try {
        var parts = _parseJwtParts(token);
        var decodedHeader = _base64UrlDecode(parts.header);

        if (!decodedHeader) {
          return null;
        }

        return JSON.parse(decodedHeader);
      } catch (error) {
        console.error('[TokenHelper] Error parsing header:', error);
        return null;
      }
    },

    /**
     * Get token algorithm from header
     * @param {string} token - JWT token
     * @returns {string|null} Algorithm (e.g., "HS256") or null
     */
    getAlgorithm: function (token) {
      var header = this.getHeader(token);
      return header ? header.alg : null;
    },

    /**
     * Get token type from header
     * @param {string} token - JWT token
     * @returns {string|null} Type (e.g., "JWT") or null
     */
    getTokenType: function (token) {
      var header = this.getHeader(token);
      return header ? header.typ : null;
    },

    /**
     * Get comprehensive token info (for debugging)
     * @param {string} token - JWT token
     * @returns {object|null} Token information object
     */
    getTokenInfo: function (token) {
      if (!_isValidJwtStructure(token)) {
        return null;
      }

      var payload = this.parseToken(token);
      var header = this.getHeader(token);

      if (!payload) {
        return null;
      }

      var exp = this.getExpiry(token);
      var iat = this.getIssuedAt(token);

      return {
        header: header,
        payload: payload,
        userId: this.getUserId(token),
        username: this.getUsername(token),
        issuedAt: iat ? new Date(iat * 1000).toISOString() : null,
        expiresAt: exp ? new Date(exp * 1000).toISOString() : null,
        isExpired: this.isExpired(token),
        remainingSeconds: this.getRemainingLifetime(token),
        shouldRefresh: this.shouldRefreshToken(token),
        algorithm: this.getAlgorithm(token),
        tokenType: this.getTokenType(token)
      };
    },

    /**
     * Format token for display (truncated, for debugging only)
     * @param {string} token - JWT token
     * @returns {string} Truncated token string
     */
    formatToken: function (token) {
      if (!token || token.length < 20) {
        return token;
      }

      return token.substring(0, 10) + '...' + token.substring(token.length - 10);
    }
  };
})();

// Log initialization
console.log('%c[TokenHelper] ✓ Initialized', 'color: #4CAF50; font-weight: bold;');