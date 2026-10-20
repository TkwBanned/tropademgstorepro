export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { txId } = req.query;

  if (!txId) {
    return res.status(400).json({ error: 'ID da transação é obrigatório.' });
  }

  try {
    const response = await fetch(`https://api.invictuspayv2.com.br/api/v1/transactions/${txId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': process.env.INVICTUS_API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Normaliza a resposta para o frontend
    const transaction = data.transaction || data;
    return res.status(200).json({
      id: transaction.id || transaction.hash || null,
      status: transaction.status || null,
      raw: data
    });

  } catch (error) {
    console.error('Erro ao consultar Pix:', error);
    return res.status(500).json({ error: 'Falha interna ao consultar o status.' });
  }
}
