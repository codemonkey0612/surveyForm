export default async function handler(req, res) {

    // GASのURL（あなたのデプロイURL）
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbyyiT7gjHbtLrfRAk3Zt5SEd9rZPCO-VAseBDT6oXbsSseaw8OAnsGQFZzGQ4x8Sa4jRw/exec';
  
    // GET（確認用）
    if (req.method === 'GET') {
      return res.status(200).json({ 
        status: 'ok', 
        message: 'Qooco Bot is running!' 
      });
    }
  
    // POST（LINEからのWebhook）
    if (req.method === 'POST') {
      try {
        // GASに転送（302を自動でたどる）
        await fetch(GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body),
          redirect: 'follow'
        });
      } catch (err) {
        console.error('GAS転送エラー:', err);
      }
      // LINEには必ず200を返す
      return res.status(200).json({ status: 'ok' });
    }
  
    return res.status(200).json({ status: 'ok' }); 
}
