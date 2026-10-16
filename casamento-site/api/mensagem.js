// Arquivo: casamento-site/api/mensagem.js
// Documentação: Função Serverless para comunicação segura com a Evolution API via ES Modules.

export default async function handler(req, res) {
  // Define o cabeçalho padrão para garantir respostas em formato JSON
  res.setHeader("Content-Type", "application/json");

  // 1. Permite apenas requisições HTTP do tipo POST
  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Método não permitido. Utilize o método POST.",
    });
  }

  try {
    // 2. Extrai e valida o corpo da requisição do React
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { nome, mensagem } = body;

    // 3. Validação dos campos obrigatórios do formulário
    if (!nome || !mensagem) {
      return res.status(400).json({
        sucesso: false,
        erro: "Os campos nome e mensagem são obrigatórios.",
      });
    }

    // 4. Carrega as Variáveis de Ambiente configuradas na Vercel
    let rawUrl = process.env.EVOLUTION_URL || "";
    let instanceName = process.env.INSTANCE_NAME || "toshio bot";
    let apiKey = process.env.EVOLUTION_API_KEY || "";
    let groupJid = process.env.GROUP_JID || "";

    // 5. Higienização e limpeza de textos (removendo aspas, colchetes ou espaços sobressalentes)
    rawUrl = rawUrl
      .replace(/\[.*?\]\((.*?)\)/g, "$1")
      .replace(/[\[\]\(\)'"]/g, "")
      .trim()
      .replace(/\/+$/, "");
    instanceName = instanceName.trim();
    apiKey = apiKey.trim();
    groupJid = groupJid.trim();

    // 6. Validação defensiva das variáveis de ambiente na Vercel
    if (!rawUrl || !apiKey || !groupJid) {
      return res.status(500).json({
        sucesso: false,
        erro: "Configurações (Variáveis de Ambiente) incompletas na Vercel.",
      });
    }

    // 7. Monta a URL de envio codificando o nome da instância (toshio bot -> toshio%20bot)
    const endpointCompleto = `${rawUrl}/message/sendText/${encodeURIComponent(instanceName)}`;

    // 8. Prepara a mensagem formatada para o WhatsApp
    const textoFormatado = `💌 *Nova mensagem para os noivos!*\n\n*De:* ${nome}\n*Mensagem:* ${mensagem}`;

    // 9. Executa a chamada HTTP POST para a Evolution API
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

    // 10. Processa a resposta da Evolution API
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
      // Captura a mensagem de erro específica devolvida pela Evolution API
      const detalheErro =
        data?.response?.message ||
        data?.message ||
        data?.error ||
        JSON.stringify(data);
      console.error("Erro na Evolution API:", detalheErro);

      return res.status(500).json({
        sucesso: false,
        erro: `A Evolution API recusou o envio: ${detalheErro}`,
        detalhe: data,
      });
    }
  } catch (error) {
    console.error("Erro crítico na execução:", error);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno no servidor ao enviar a mensagem.",
      detalhe: error.message || String(error),
    });
  }
}
