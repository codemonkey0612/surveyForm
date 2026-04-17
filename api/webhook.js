const https = require('https');
const http = require('http');

export default async function handler(req, res) {

  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods',
    'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers',
    'Content-Type');

  // OPTIONSリクエスト対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET（動作確認用）
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'Qooco Bot is running!'
    });
  }

  // POST（LINEとフォームからのデータ）
  if (req.method === 'POST') {

    // ★ LINEにすぐ200を返す
    res.status(200).json({ status: 'ok' });
    console.log(req.body);
    // ★ バックグラウンドでGASに転送
    const GAS_URL =
      'https://script.google.com/macros/s/AKfycbwNKi5EHi7H0f7tWRMXjQQ4k1KiNQHql1rvOZeUM-ESBrwfQj9o3qlYKQOR7JMDq4dtEw/exec';
    try {
      await forwardToGas(GAS_URL, req.body);
      console.log('GASに転送完了');
    } catch (err) {
      console.error('GAS転送エラー:', err.message);
    }

    return;
  }

  return res.status(200).json({ status: 'ok' });
}

function forwardToGas(gasUrl, body) {
  return new Promise((resolve, reject) => {

    const postData = JSON.stringify(body);

    // URLをパースする
    const urlObj = new URL(gasUrl);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        // GASが302リダイレクトを返した場合
        if (res.statusCode === 302 && res.headers.location) {
          console.log('302リダイレクト先:', res.headers.location);
          // リダイレクト先にも転送
          forwardToRedirect(res.headers.location, body)
            .then(resolve)
            .catch(reject);
        } else {
          console.log('GAS応答:', res.statusCode, data);
          resolve(data);
        }
      });
    });

    req.on('error', (err) => {
      console.error('リクエストエラー:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

function forwardToRedirect(redirectUrl, body) {
  return new Promise((resolve, reject) => {

    const postData = JSON.stringify(body);
    const urlObj = new URL(redirectUrl);

    // httpかhttpsか判定
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('リダイレクト先応答:', res.statusCode);
        resolve(data);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

