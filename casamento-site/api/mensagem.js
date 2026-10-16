// Arquivo: casamento-site/api/mensagem.js
// Documentação: Função Serverless com higienização automática de URL e tratamento defensivo de erros.

module.exports = async function handler(req, res) {
  // Define o cabeçalho de resposta padrão como JSON
  res.setHeader("Content-Type", "application/json");

  // 1. Permite apenas requisições HTTP do tipo POST
  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Método não permitido. Utilize o método POST.",
    });
  }

  try {
    // 2. Garante a leitura do corpo da requisição
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { nome, mensagem } = body || {};

    // 3. Validação dos campos do formulário
    if (!nome || !mensagem) {
      return res.status(400).json({
        sucesso: false,
        erro: "Os campos nome e mensagem são obrigatórios.",
      });
    }

    // 4. Carrega as Variáveis de Ambiente da Vercel
    let rawUrl = process.env.EVOLUTION_URL || "";
    let instanceName = process.env.INSTANCE_NAME || "toshio bot";
    let apiKey = process.env.EVOLUTION_API_KEY || "";
    let groupJid = process.env.GROUP_JID || "";

    // 5. HIGIENIZAÇÃO DA URL: Remove sintaxe Markdown [link](url), colchetes, aspas ou espaços extras
    rawUrl = rawUrl
      .replace(/\[.*?\]\((.*?)\)/g, "$1") // Extrai a URL se for colada em formato Markdown [texto](url)
      .replace(/[\[\]\(\)'"]/g, "") // Remove colchetes, parênteses e aspas soltas
      .trim()
      .replace(/\/+$/, ""); // Remove barras extras no final da URL

    instanceName = instanceName.trim();
    apiKey = apiKey.trim();
    groupJid = groupJid.trim();

    // 6. Verificação defensiva das variáveis na Vercel
    if (!rawUrl || !apiKey || !groupJid) {
      console.error("--- ERRO: VARIÁVEIS INCOMPLETAS NA VERCEL ---");
      console.error("EVOLUTION_URL:", rawUrl ? "OK" : "FALTANDO");
      console.error("EVOLUTION_API_KEY:", apiKey ? "OK" : "FALTANDO");
      console.error("GROUP_JID:", groupJid ? "OK" : "FALTANDO");

      return res.status(500).json({
        sucesso: false,
        erro: "Configurações (Variáveis de Ambiente) incompletas na Vercel. Verifique o painel.",
      });
    }

    // 7. Monta o endpoint com codificação segura (converte espaços em %20)
    const endpointCompleto = `${rawUrl}/message/sendText/${encodeURIComponent(instanceName)}`;
    console.log("Enviando requisição para:", endpointCompleto);

    // 8. Prepara o texto da mensagem para o WhatsApp
    const textoFormatado = `💌 *Nova mensagem para os noivos!*\n\n*De:* ${nome}\n*Mensagem:* ${mensagem}`;

    // 9. Envia a requisição HTTP POST para a Evolution API
    const response = await fetch(endpointCompleto, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: groupJid,
        text: textoFormatado,
      }),
    });

    // 10. Processa a resposta retornada
    const textoResposta = await response.text();
    let data = {};
    try {
      data = JSON.parse(textoResposta);
    } catch (e) {
      data = { respostaTexto: textoResposta };
    }

    if (response.ok) {
      return res.status(200).json({ sucesso: true, resposta: data });
    } else {
      console.error("Erro retornado pela Evolution API:", data);
      return res.status(500).json({
        sucesso: false,
        erro: "A Evolution API não conseguiu processar o envio.",
        detalhe: data,
      });
    }
  } catch (error) {
    console.error("--- ERRO CRÍTICO NA SERVERLESS FUNCTION ---", error);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno ao conectar com a Evolution API.",
      detalhe: error.message || String(error),
    });
  }
};
