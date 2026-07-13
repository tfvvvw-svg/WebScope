import axios from 'axios';
import { timeoutPromise } from '../utils/helpers.js';

const WHOIS_API = 'https://whois.freeaiapi.xyz';

export async function getWhoisInfo(domain) {
  const result = {
    creationDate: null,
    age: null,
    registrar: null,
  };

  try {
    const response = await timeoutPromise(
      axios.get(`${WHOIS_API}?name=${encodeURIComponent(domain)}&format=json`, {
        timeout: 8000,
        headers: { 'Accept': 'application/json' },
      }),
      10000
    );

    const data = response.data;

    // Try to extract creation date
    if (data.created || data.creation_date || data.created_date) {
      const dateStr = data.created || data.creation_date || data.created_date;
      result.creationDate = dateStr;
      const created = new Date(dateStr);
      if (!isNaN(created.getTime())) {
        const years = Math.floor((Date.now() - created.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        result.age = `${years} years`;
      }
    }

    // Try to extract registrar
    if (data.registrar) {
      result.registrar = data.registrar;
    }

    return result;
  } catch {
    // Fallback: try alternative free API
    try {
      const response = await timeoutPromise(
        axios.get(`https://whois-datadump.vercel.app/api/whois?domain=${encodeURIComponent(domain)}`, {
          timeout: 8000,
        }),
        10000
      );
      const data = response.data;
      if (data.creationDate) {
        result.creationDate = data.creationDate;
        const created = new Date(data.creationDate);
        if (!isNaN(created.getTime())) {
          const years = Math.floor((Date.now() - created.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          result.age = `${years} years`;
        }
      }
      if (data.registrar) result.registrar = data.registrar;
      return result;
    } catch {
      return { creationDate: null, age: null, registrar: null };
    }
  }
}