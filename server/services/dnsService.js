import { promises as dnsPromises } from 'dns';

const TIMEOUT = 5000;

function timeoutPromise(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('DNS lookup timeout')), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function resolveDNS(domain) {
  const result = {
    A: [],
    AAAA: [],
    MX: [],
    TXT: [],
    NS: [],
  };

  try {
    result.A = await timeoutPromise(
      new Promise((resolve) => {
        dnsPromises.resolve4(domain).then(resolve).catch(() => resolve([]));
      }),
      TIMEOUT
    );
  } catch { /* ignore */ }

  try {
    result.AAAA = await timeoutPromise(
      new Promise((resolve) => {
        dnsPromises.resolve6(domain).then(resolve).catch(() => resolve([]));
      }),
      TIMEOUT
    );
  } catch { /* ignore */ }

  try {
    const mxRecords = await timeoutPromise(
      new Promise((resolve) => {
        dnsPromises.resolveMx(domain).then(resolve).catch(() => resolve([]));
      }),
      TIMEOUT
    );
    result.MX = mxRecords.map((mx) => `${mx.exchange} (priority ${mx.priority})`);
  } catch { /* ignore */ }

  try {
    const txtRecords = await timeoutPromise(
      new Promise((resolve) => {
        dnsPromises.resolveTxt(domain).then(resolve).catch(() => resolve([]));
      }),
      TIMEOUT
    );
    result.TXT = txtRecords.map((txt) => txt.join(' '));
  } catch { /* ignore */ }

  try {
    result.NS = await timeoutPromise(
      new Promise((resolve) => {
        dnsPromises.resolveNs(domain).then(resolve).catch(() => resolve([]));
      }),
      TIMEOUT
    );
  } catch { /* ignore */ }

  return result;
}