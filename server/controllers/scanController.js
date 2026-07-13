import { scanWebsite } from '../services/scannerService.js';
import * as log from '../logger/index.js';

export async function scanUrl(req, res, next) {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    // Simple URL validation
    const urlPattern = /^(https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,})(\/\S*)?$/i;
    if (!urlPattern.test(url.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
      });
    }

    log.info(`Scan request for: ${url}`);
    const result = await scanWebsite(url);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}