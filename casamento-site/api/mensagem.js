// Arquivo: casamento-site/api/mensagem.js
// Documentação: Função Serverless da Vercel para envio de mensagens via Evolution API.

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
    // 2. Lê e valida os dados enviados pelo formulário React
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { nome, mensagem } = body;

    if (!nome || !mensagem) {
      return res.status(400).json({
        sucesso: false,
        erro: "Os campos nome e mensagem são obrigatórios.",
      });
    }

    // 3. Captura as Variáveis de Ambiente configuradas no painel da Vercel
    let rawUrl = process.env.EVOLUTION_URL || "";
    let instanceName = process.env.INSTANCE_NAME || "toshio bot";
    let apiKey = process.env.EVOLUTION_API_KEY || "";
    let groupJid = process.env.GROUP_JID || "";

    // 4. Limpeza e formatação dos textos (remove espaços ou aspas acidentais)
    rawUrl = rawUrl
      .replace(/\[.*?\]\((.*?)\)/g, "$1")
      .replace(/[\[\]\(\)'"]/g, "")
      .trim()
      .replace(/\/+$/, "");
    instanceName = instanceName.trim();
    apiKey = apiKey.trim();
    groupJid = groupJid.trim();

    // 5. Diagnóstico de segurança: Verifica se todas as variáveis necessárias existem
    if (!rawUrl || !apiKey || !groupJid) {
      console.error("=== DIAGNÓSTICO DE VARIÁVEIS NA VERCEL ===");
      console.error("EVOLUTION_URL:", rawUrl ? "ENCONTRADA" : "FALTANDO");
      console.error("EVOLUTION_API_KEY:", apiKey ? "ENCONTRADA" : "FALTANDO");
      console.error("GROUP_JID:", groupJid ? "ENCONTRADA" : "FALTANDO");

      return res.status(500).json({
        sucesso: false,
        erro: "Configurações (Variáveis de Ambiente) incompletas na Vercel.",
      });
    }

    // 6. Monta a URL de destino codificando o nome da instância (toshio bot -> toshio%20bot)
    const endpointCompleto = `${rawUrl}/message/sendText/${encodeURIComponent(instanceName)}`;

    // 7. Formata o texto que será entregue no WhatsApp
    const textoFormatado = `💌 *Nova mensagem para os noivos!*\n\n*De:* ${nome}\n*Mensagem:* ${mensagem}`;

    // 8. Envia a requisição HTTP POST para a Evolution API
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
      console.error("Erro na resposta da Evolution API:", data);
      return res.status(500).json({
        sucesso: false,
        erro: "A Evolution API não conseguiu processar o envio.",
        detalhe: data,
      });
    }
  } catch (error) {
    console.error("Erro crítico na execução:", error);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno no servidor ao enviar mensagem.",
      detalhe: error.message || String(error),
    });
  }
}
