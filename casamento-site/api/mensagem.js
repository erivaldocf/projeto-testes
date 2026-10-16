// Arquivo: casamento-site/api/mensagem.js
// Documentação: Função Serverless da Vercel para envio seguro via Evolution API com tratamento de erros.

module.exports = async function handler(req, res) {
  // Configura a resposta padrão do servidor para o formato JSON
  res.setHeader("Content-Type", "application/json");

  // 1. Permite apenas requisições HTTP do tipo POST
  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Método não permitido. Utilize o método POST.",
    });
  }

  try {
    // 2. Garante a leitura correta dos dados enviados pelo formulário React
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { nome, mensagem } = body || {};

    // 3. Valida se os campos obrigatórios foram preenchidos
    if (!nome || !mensagem) {
      return res.status(400).json({
        sucesso: false,
        erro: "Os campos nome e mensagem são obrigatórios.",
      });
    }

    // 4. Carrega as Variáveis de Ambiente cadastradas na Vercel
    const EVOLUTION_URL = process.env.EVOLUTION_URL;
    const INSTANCE_NAME = process.env.INSTANCE_NAME || "toshio bot";
    const API_KEY = process.env.EVOLUTION_API_KEY;
    const GROUP_JID = process.env.GROUP_JID;

    // 5. Verificação defensiva das variáveis de ambiente
    if (!EVOLUTION_URL || !API_KEY || !GROUP_JID) {
      console.error("--- ERRO DE CONFIGURAÇÃO NA VERCEL ---");
      console.error(
        "EVOLUTION_URL:",
        EVOLUTION_URL ? "Configurada" : "FALTANDO",
      );
      console.error("EVOLUTION_API_KEY:", API_KEY ? "Configurada" : "FALTANDO");
      console.error("GROUP_JID:", GROUP_JID ? "Configurado" : "FALTANDO");

      return res.status(500).json({
        sucesso: false,
        erro: "Configurações (Variáveis de Ambiente) incompletas na Vercel.",
      });
    }

    // 6. Formata a URL de destino com tratamento de espaços no nome do bot
    const urlBase = String(EVOLUTION_URL).trim().replace(/\/+$/, "");
    const instanciaFormatada = encodeURIComponent(String(INSTANCE_NAME).trim());
    const endpointCompleto = `${urlBase}/message/sendText/${instanciaFormatada}`;

    // 7. Prepara a mensagem formatada para o WhatsApp
    const textoFormatado = `💌 *Nova mensagem para os noivos!*\n\n*De:* ${nome}\n*Mensagem:* ${mensagem}`;

    // 8. Faz a chamada HTTP POST para a Evolution API através do Cloudflare
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

    // 9. Retorna o resultado do envio para o site
    if (response.ok) {
      return res.status(200).json({ sucesso: true, resposta: data });
    } else {
      console.error("Erro na resposta da Evolution API:", data);
      return res.status(500).json({
        sucesso: false,
        erro: "A Evolution API não conseguiu processar o envio.",
      });
    }
  } catch (error) {
    // Captura qualquer exceção inesperada e loga o erro completo no painel da Vercel
    console.error("--- ERRO NA SERVERLESS FUNCTION ---", error);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno no servidor.",
      detalhe: error.message || String(error),
    });
  }
};
