const ipWhitelistService = require('../services/ipWhitelistService');

/**
 * Extracts the client's real IP from the request.
 * Supports x-forwarded-for (first IP when behind Nginx/reverse proxy) and req.socket.remoteAddress.
 * @param {import('express').Request} req
 * @returns {string}
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0];
    const ip = (first || '').trim();
    if (ip) return ip;
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    const ip = realIp.trim();
    if (ip) return ip;
  }
  const socketAddr = req.socket?.remoteAddress;
  if (socketAddr) {
    return socketAddr.replace(/^::ffff:/, '');
  }
  return '';
}

/** Paths that bypass IP whitelist (bootstrap and health checks). */
const BYPASS_PATHS = ['/health', '/admin'];

function shouldBypassWhitelist(path) {
  if (!path) return false;
  if (BYPASS_PATHS.includes(path)) return true;
  if (path.startsWith('/admin/')) return true;
  return false;
}

/**
 * Middleware: allow request only if the client IP is in the allowed_ips table.
 * Bypasses check for /health and /admin/* so the whitelist can be managed.
 * If the list is empty, allow all (bootstrap). Otherwise return 403 if IP not allowed.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function checkIPWhitelist(req, res, next) {
  if (shouldBypassWhitelist(req.path)) {
    return next();
  }
  try {
    const clientIp = getClientIp(req);
    const allowed = await ipWhitelistService.isIpAllowed(clientIp);
    const list = await ipWhitelistService.getAllowedIps();

    if (list.length === 0) {
      return next();
    }
    if (!allowed) {
      return res.status(403).json({
        message: 'Access Denied: Unauthorized IP',
      });
    }
    next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('checkIPWhitelist error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getClientIp,
  checkIPWhitelist,
  shouldBypassWhitelist,
  BYPASS_PATHS,
};
