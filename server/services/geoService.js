import axios from 'axios';
import { timeoutPromise } from '../utils/helpers.js';

export async function getGeolocation(ip) {
  const result = {
    ip,
    country: null,
    city: null,
    asn: null,
    hosting: null,
  };

  try {
    const response = await timeoutPromise(
      axios.get(`https://ipapi.co/${ip}/json/`, {
        timeout: 5000,
        headers: { 'User-Agent': 'WebScope/1.0' },
      }),
      6000
    );

    const data = response.data;
    if (data && !data.error) {
      result.country = data.country_name || null;
      result.city = data.city || null;
      result.asn = data.asn ? `AS${data.asn}` : null;
      result.hosting = data.org || null;
    }
  } catch {
    // Try fallback API
    try {
      const response = await timeoutPromise(
        axios.get(`https://ipwhois.app/json/${ip}`, { timeout: 5000 }),
        6000
      );
      const data = response.data;
      if (data && !data.error) {
        result.country = data.country || null;
        result.city = data.city || null;
        result.asn = data.asn || null;
        result.hosting = data.org || data.isp || null;
      }
    } catch {
      // Both failed, return what we have
    }
  }

  return result;
}