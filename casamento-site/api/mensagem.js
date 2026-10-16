// Arquivo: api/mensagem.js
// Documentação: Função Serverless com tratamento de URLs e logs de diagnóstico.

export default async function handler(req, res) {
  // 1. Permite apenas requisições HTTP do tipo POST
  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Método não permitido. Utilize o método POST.",
    });
  }

  try {
    // 2. Extrai os dados enviados pelo formulário React
    const { nome, mensagem } = req.body || {};

    // 3. Validações iniciais de preenchimento
    if (!nome || !mensagem) {
      return res.status(400).json({
        sucesso: false,
        erro: "Os campos nome e mensagem são obrigatórios.",
      });
    }

    // 4. Carrega as variáveis de ambiente cadastradas na Vercel
    const EVOLUTION_URL = process.env.EVOLUTION_URL;
    const INSTANCE_NAME = process.env.INSTANCE_NAME || "toshio bot";
    const API_KEY = process.env.EVOLUTION_API_KEY;
    const GROUP_JID = process.env.GROUP_JID;

    // Log de verificação (visível na aba Logs da Vercel)
    console.log("--- Executando Envio de Mensagem ---");
    console.log("URL de Destino:", EVOLUTION_URL);
    console.log("Nome da Instância:", INSTANCE_NAME);

    // 5. Verifica se as variáveis foram cadastradas na Vercel
    if (!EVOLUTION_URL || !API_KEY || !GROUP_JID) {
      console.error("Erro: Variáveis de ambiente incompletas na Vercel.");
      return res.status(500).json({
        sucesso: false,
        erro: "Configurações do servidor (Variáveis de Ambiente) incompletas.",
      });
    }

    // 6. Formata a URL com segurança (removendo barras extras e tratando o espaço de "toshio bot")
    const urlLimpa = EVOLUTION_URL.replace(/\/+$/, "");
    const instanciaCodificada = encodeURIComponent(INSTANCE_NAME.trim());
    const endpointCompleto = `${urlLimpa}/message/sendText/${instanciaCodificada}`;

    // 7. Formata o texto da mensagem
    const textoFormatado = `💌 *Nova mensagem para os noivos!*\n\n*De:* ${nome}\n*Mensagem:* ${mensagem}`;

    // 8. Faz a requisição HTTP POST para a Evolution API
    const response = await fetch(endpointCompleto, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: API_KEY,
      },
      body: JSON.stringify({
        number: GROUP_JID,
        text: textoFormatado,
      }),
    });

    const data = await response.json();

    // 9. Retorna a resposta adequada para o site
    if (response.ok) {
      return res.status(200).json({ sucesso: true, resposta: data });
    } else {
      console.error("Erro devolvido pela Evolution API:", data);
      return res.status(500).json({
        sucesso: false,
        erro: "Falha ao processar mensagem na Evolution API.",
      });
    }
  } catch (error) {
    // Captura qualquer exceção não tratada para não derrubar o servidor
    console.error("Erro crítico na função Vercel:", error);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno ao conectar com a Evolution API.",
      detalhe: error.message,
    });
  }
}
