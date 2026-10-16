// Arquivo: api/mensagem.js
// Documentação: Função Serverless da Vercel que recebe os dados do React e envia para a Evolution API.

export default async function handler(req, res) {
  // 1. Garante que apenas requisições do tipo POST sejam aceitas
  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Método não permitido. Utilize o método POST.",
    });
  }

  // 2. Extrai nome e mensagem enviados pelo formulário do React
  const { nome, mensagem } = req.body;

  // 3. Validação básica de preenchimento dos campos
  if (!nome || !mensagem) {
    return res.status(400).json({
      sucesso: false,
      erro: "Os campos nome e mensagem são obrigatórios.",
    });
  }

  // 4. Carrega as variáveis secretas cadastradas no painel da Vercel
  const EVOLUTION_URL = process.env.EVOLUTION_URL;
  const INSTANCE_NAME = process.env.INSTANCE_NAME || "bot_cointe";
  const API_KEY = process.env.EVOLUTION_API_KEY;
  const GROUP_JID = process.env.GROUP_JID;

  // 5. Monta o texto formatado para o WhatsApp com negritos (*texto*) e emojis
  const textoFormatado = `💌 *Nova mensagem para os noivos!*\n\n*De:* ${nome}\n*Mensagem:* ${mensagem}`;

  try {
    // 6. Faz o envio para a Evolution API através da URL do Cloudflare Tunnel
    const response = await fetch(
      `${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
        },
        body: JSON.stringify({
          number: GROUP_JID,
          text: textoFormatado,
        }),
      },
    );

    const data = await response.json();

    // 7. Retorna a resposta de sucesso ou erro para o frontend
    if (response.ok) {
      return res.status(200).json({ sucesso: true, resposta: data });
    } else {
      console.error("Erro de resposta da Evolution API:", data);
      return res.status(500).json({
        sucesso: false,
        erro: "Ocorreu um erro ao enviar a mensagem via Evolution API.",
      });
    }
  } catch (error) {
    console.error("Erro de conexão com o servidor:", error);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro de conexão entre a Vercel e a Evolution API.",
    });
  }
}
