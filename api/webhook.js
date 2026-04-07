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

    // ★ 最重要：GASへの転送を待たずに
    //   LINEに即座に200を返す！
    res.status(200).json({ status: 'ok' });

    // ★ GASへの転送はバックグラウンドで実行
    const GAS_URL ='https://script.google.com/macros/s/AKfycbyyiT7gjHbtLrfRAk3Zt5SEd9rZPCO-VAseBDT6oXbsSseaw8OAnsGQFZzGQ4x8Sa4jRw/exec'';

    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(req.body),
        redirect: 'follow'
      });
      console.log('GASに転送完了');
    } catch (err) {
      console.error('GAS転送エラー:', err.message);
    }

    // ★ ここではreturnしない
    //   すでに200を返しているので
    return;
  }

  return res.status(200).json({ status: 'ok' });
}
