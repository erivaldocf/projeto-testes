// Arquivo: casamento-site/api/mensagem.js
// Documentação: Função Serverless para integração segura com a Evolution API v2.

export default async function handler(req, res) {
  // Define o cabeçalho para garantir resposta em formato JSON
  res.setHeader("Content-Type", "application/json");

  // 1. Permite apenas requisições HTTP do tipo POST
  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Método não permitido. Utilize o método POST.",
    });
  }

  try {
    // 2. Extrai e valida o corpo da requisição enviado pelo React
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { nome, mensagem } = body;

    // 3. Validação dos campos obrigatórios
    if (!nome || !mensagem) {
      return res.status(400).json({
        sucesso: false,
        erro: "Os campos nome e mensagem são obrigatórios.",
      });
    }

    // 4. Carrega as Variáveis de Ambiente configuradas na Vercel
    let rawUrl = process.env.EVOLUTION_URL || "";
    let instanceName = process.env.INSTANCE_NAME || "toshio_bot";
    let apiKey = process.env.EVOLUTION_API_KEY || "";
    let groupJid = process.env.GROUP_JID || "";

    // 5. Higienização das variáveis (remove aspas, colchetes ou espaços)
    rawUrl = rawUrl
      .replace(/\[.*?\]\((.*?)\)/g, "$1")
      .replace(/[\[\]\(\)'"]/g, "")
      .trim()
      .replace(/\/+$/, "");
    instanceName = instanceName.trim();
    apiKey = apiKey.trim();
    groupJid = groupJid.trim();

    // 6. Verificação de segurança das variáveis na Vercel
    if (!rawUrl || !apiKey || !groupJid) {
      return res.status(500).json({
        sucesso: false,
        erro: "Configurações (Variáveis de Ambiente) incompletas na Vercel.",
      });
    }

    // 7. Monta o endpoint com codificação segura de URL
    const endpointCompleto = `${rawUrl}/message/sendText/${encodeURIComponent(instanceName)}`;

    // 8. Formata o texto da mensagem para o WhatsApp
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

    // 10. Trata a resposta retornada pela Evolution API
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
      // Trata mensagens de erro que venham dentro de arrays no JSON
      const mensagemErro = Array.isArray(data?.response?.message)
        ? data.response.message.join(", ")
        : data?.response?.message ||
          data?.message ||
          "Erro ao processar envio na API";

      console.error("Erro na Evolution API:", mensagemErro);

      return res.status(500).json({
        sucesso: false,
        erro: `A Evolution API recusou o envio: ${mensagemErro}`,
        detalhe: data,
      });
    }
  } catch (error) {
    console.error("Erro crítico na execução:", error);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno no servidor ao tentar conectar com a Evolution API.",
      detalhe: error.message || String(error),
    });
  }
}
