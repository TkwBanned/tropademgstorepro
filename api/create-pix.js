// Listas de dados mockados (movidas para o backend por segurança)
const CPF_LIST = ["09176809013", "91180708091", "62906496049", "06340910009", "31775513084", "98540706032", "61472390075", "94284423053", "89488045027", "14758430039", "89230442020", "18312455078", "99823493090", "14453937008", "21325083054", "09258122003", "30219225036", "23263732005", "71679243004", "21083365088", "34121229045", "55585864009", "07198161065", "82269418069", "21016595069", "34236480077", "48428361053", "76835057068", "22555958002", "51036271080", "97525547092", "31196088071", "35735992066", "62232997022", "17572189040", "36334601016", "77003848007", "55117661001", "02453771078", "74898446060", "63521412008", "23489835085", "69407291006", "18774835084", "22014152004", "83544112060", "51025322002", "90595554067", "11017416001", "26999084017", "71811094058", "37680062048", "99152040003", "66108808080", "66617831098", "87982210007", "90761966056", "04123143040", "64405499012", "05377361075", "63577892080", "53739022094", "82565437013", "49349435012", "70549006001"];
const EMAIL_LIST = ["lucas.silva98@gmail.com", "ana.rodrigues23@gmail.com", "pedro.henrique.oliveira@gmail.com", "juliana.martins@gmail.com", "rafael.costa1987@gmail.com", "fernanda.alves@gmail.com", "bruno.santos01@gmail.com", "mariana.lima@gmail.com", "guilherme.neves@gmail.com", "camila.goncalves@gmail.com", "diego.souza.tech@gmail.com", "larissa.pereira@gmail.com", "vinicius.ribeiro@gmail.com", "amanda.ferreira@gmail.com", "leonardo.cavalcanti@gmail.com", "beatriz.rocha92@gmail.com", "gustavo.monteiro@gmail.com", "isabela.cardoso@gmail.com", "renato.barros@gmail.com", "carolina.nascimento@gmail.com"];
const PHONE_LIST = ["11984325678", "21976543210", "31987124563", "11955438762", "21963219874", "31998712300", "11971235689", "21984567012", "31976123498", "11988833445", "21991122334", "31984455667", "11966778899", "21963322110", "31975544332", "11980012345", "21990087654", "31981109988", "11962233447", "21974455661", "31986677889", "11993344556", "21985544339", "31987766550"];
const NAME_LIST = ["Lucas Gabriel Oliveira Santos", "Ana Júlia Mendes Costa", "Pedro Henrique Almeida Lima", "Mariana Fernanda Rodrigues", "Rafael Augusto Pereira Dias", "Beatriz Souza Carvalho", "Felipe Duarte Barros", "Camila Nogueira Martins", "Bruno César Ribeiro", "Laura Cristina Freitas", "João Victor Castro Monteiro", "Isabella Rocha Teixeira", "Matheus Alves da Silva", "Larissa Andrade Moreira", "Gustavo Henrique Lopes"];

function getRandomUser() {
  const cpf = CPF_LIST[Math.floor(Math.random() * CPF_LIST.length)];
  const email = EMAIL_LIST[Math.floor(Math.random() * EMAIL_LIST.length)];
  const phone = PHONE_LIST[Math.floor(Math.random() * PHONE_LIST.length)];
  const name = NAME_LIST[Math.floor(Math.random() * NAME_LIST.length)];
  return { name, cpf, email, phone };
}

export default async function handler(req, res) {
  // Configuração de CORS para permitir chamadas do seu domínio
  res.setHeader('Access-Control-Allow-Origin', '*'); // Em produção, troque '*' pelo seu domínio
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Responde ao preflight (OPTIONS) do navegador
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { amount, items } = req.body;

  // Validação básica
  if (!amount || !items || items.length === 0) {
    return res.status(400).json({ error: 'Dados incompletos para gerar o Pix.' });
  }

  // Gera os dados do cliente no backend
  const user = getRandomUser();

  const customer = {
    name: user.name,
    email: user.email,
    document: user.cpf,
    phone: user.phone
  };

  try {
    const response = await fetch('https://api.invictuspayv2.com.br/api/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': process.env.INVICTUS_API_KEY,
      },
      body: JSON.stringify({
        amount: amount,
        paymentMethod: 'pix',
        customer: customer,
        items: items,
        pix: { expirationInSeconds: 600 }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Erro ao criar Pix:', error);
    return res.status(500).json({ error: 'Falha interna ao processar o pagamento.' });
  }
}
