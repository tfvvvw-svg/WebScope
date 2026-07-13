import https from 'https';

export function getSslInfo(domain) {
  return new Promise((resolve) => {
    const result = { issuer: null, expires: null, valid: false };

    const options = {
      hostname: domain,
      port: 443,
      method: 'GET',
      path: '/',
      rejectUnauthorized: false,
      timeout: 8000,
    };

    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      if (cert && Object.keys(cert).length > 0) {
        if (cert.issuer) {
          const issuerObj = typeof cert.issuer === 'object' ? cert.issuer : {};
          result.issuer = issuerObj.O || issuerObj.CN || cert.issuer?.O || JSON.stringify(cert.issuer);
        }
        if (cert.valid_to) {
          result.expires = cert.valid_to;
          const expiresDate = new Date(cert.valid_to);
          if (!isNaN(expiresDate.getTime())) {
            const daysLeft = Math.floor((expiresDate - Date.now()) / (1000 * 60 * 60 * 24));
            result.expires = `${cert.valid_to} (${daysLeft > 0 ? `${daysLeft} days left` : 'Expired'})`;
          }
        }
        if (cert.subject) {
          result.valid = true;
        }
      }
      // Consume response data
      res.on('data', () => {});
      res.on('end', () => resolve(result));
    });

    req.on('error', () => resolve(result));
    req.on('timeout', () => {
      req.destroy();
      resolve(result);
    });

    req.end();
  });
}