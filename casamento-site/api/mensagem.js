// Arquivo: casamento-site/api/mensagem.js
// Documentação: Função Serverless da Vercel (ES Module) para envio seguro de mensagens via Evolution API.

export default async function handler(req, res) {
  // Define o cabeçalho de resposta padrão como JSON para evitar erros no frontend
  res.setHeader("Content-Type", "application/json");

  // 1. Aceita apenas requisições HTTP do tipo POST
  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Método não permitido. Utilize o método POST.",
    });
  }

  try {
    // 2. Extrai e valida o corpo da requisição enviada pelo React
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

    // 4. Carrega as Variáveis de Ambiente cadastradas na Vercel
    let rawUrl = process.env.EVOLUTION_URL || "";
    let instanceName = process.env.INSTANCE_NAME || "toshio bot";
    let apiKey = process.env.EVOLUTION_API_KEY || "";
    let groupJid = process.env.GROUP_JID || "";

    // 5. Higienização da URL: Remove formatação Markdown, aspas e espaços acidentais
    rawUrl = rawUrl
      .replace(/\[.*?\]\((.*?)\)/g, "$1") // Remove [texto](url) caso colado via Markdown
      .replace(/[\[\]\(\)'"]/g, "") // Remove caracteres especiais soltos
      .trim()
      .replace(/\/+$/, ""); // Remove barras extras no final

    instanceName = instanceName.trim();
    apiKey = apiKey.trim();
    groupJid = groupJid.trim();

    // 6. Verificação defensiva das variáveis de ambiente na Vercel
    if (!rawUrl || !apiKey || !groupJid) {
      console.error("--- ERRO: VARIÁVEIS DE AMBIENTE INCOMPLETAS ---");
      console.error("EVOLUTION_URL:", rawUrl ? "OK" : "FALTANDO");
      console.error("EVOLUTION_API_KEY:", apiKey ? "OK" : "FALTANDO");
      console.error("GROUP_JID:", groupJid ? "OK" : "FALTANDO");

      return res.status(500).json({
        sucesso: false,
        erro: "Configurações (Variáveis de Ambiente) incompletas na Vercel.",
      });
    }

    // 7. Monta o endpoint convertendo o espaço do "toshio bot" em "%20" (URL segura)
    const endpointCompleto = `${rawUrl}/message/sendText/${encodeURIComponent(instanceName)}`;

    // 8. Prepara a mensagem formatada para o WhatsApp
    const textoFormatado = `💌 *Nova mensagem para os noivos!*\n\n*De:* ${nome}\n*Mensagem:* ${mensagem}`;

    // 9. Envia a requisição HTTP POST para a Evolution API via Cloudflare Tunnel
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
      console.error("Erro na Evolution API:", data);
      return res.status(500).json({
        sucesso: false,
        erro: "A Evolution API não conseguiu processar o envio.",
        detalhe: data,
      });
    }
  } catch (error) {
    console.error("--- ERRO CRÍTICO NA FUNÇÃO SERVERLESS ---", error);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno ao processar o envio da mensagem.",
      detalhe: error.message || String(error),
    });
  }
}
