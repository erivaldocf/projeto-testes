import React, { useState, useEffect } from "react";

export default function App() {
  const [envelopeAberto, setEnvelopeAberto] = useState(false);
  const [removerEnvelope, setRemoverEnvelope] = useState(false);
  const [chavePixCopiada, setChavePixCopiada] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  const [formDataJantar, setFormDataJantar] = useState({
    nome: "",
    whatsapp: "",
    pessoas: "1",
    pretendeIr: "sim",
    restricoes: "",
  });

  const [formDataMensagem, setFormDataMensagem] = useState({
    nome: "",
    mensagem: "",
  });

  const [tempoRestante, setTempoRestante] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });

  useEffect(() => {
    const verificarTamanho = () => {
      setIsMobile(window.innerWidth < 768);
    };

    verificarTamanho();
    window.addEventListener("resize", verificarTamanho);
    return () => window.removeEventListener("resize", verificarTamanho);
  }, []);

  useEffect(() => {
    // Data oficial com indicação explícita do fuso de Brasília/Nordeste (UTC-3)
    const dataCasamento = new Date("2026-12-11T16:00:00-03:00");

    const atualizarContador = () => {
      const agora = new Date();
      const diferencaMs = dataCasamento.getTime() - agora.getTime();

      if (diferencaMs > 0) {
        const totalSegundos = Math.floor(diferencaMs / 1000);
        const dias = Math.floor(totalSegundos / (3600 * 24));
        const horas = Math.floor((totalSegundos % (3600 * 24)) / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;

        setTempoRestante({ dias, horas, minutos, segundos });
      } else {
        setTempoRestante({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
      }
    };

    atualizarContador();
    const intervalo = setInterval(atualizarContador, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const abrirEnvelope = () => {
    setEnvelopeAberto(true);
    setTimeout(() => {
      setRemoverEnvelope(true);
    }, 1200);
  };

  const rolarPara = (id) => {
    setMenuAberto(false);
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const copiarPix = () => {
    const chave = "lucas.toshio@exemplo.com";
    navigator.clipboard.writeText(chave);
    setChavePixCopiada(true);
    setTimeout(() => setChavePixCopiada(false), 3000);
  };

  const handleJantarSubmit = (e) => {
    e.preventDefault();
    alert("Obrigado por confirmar sua presença no jantar!");
    setFormDataJantar({
      nome: "",
      whatsapp: "",
      pessoas: "1",
      pretendeIr: "sim",
      restricoes: "",
    });
  };

  const handleMensagemSubmit = async (e) => {
    e.preventDefault();
    setEnviandoMensagem(true); // Desabilita o botão e mostra "Enviando..."

    try {
      // Faz o envio para a rota relativa /api/mensagem
      const response = await fetch("/api/mensagem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formDataMensagem.nome,
          mensagem: formDataMensagem.mensagem,
        }),
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        alert("Sua mensagem foi enviada com sucesso para o grupo dos noivos!");
        // Limpa os campos do formulário
        setFormDataMensagem({ nome: "", mensagem: "" });
      } else {
        alert(
          "Não foi possível enviar a mensagem no momento. Tente novamente.",
        );
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      alert("Erro de rede ao tentar enviar a mensagem.");
    } finally {
      setEnviandoMensagem(false); // Reabilita o botão
    }
  };

  return (
    <div style={estilos.pagina}>
      {!removerEnvelope && (
        <div
          style={{
            ...estilos.envelopeOverlay,
            opacity: envelopeAberto ? 0 : 1,
            pointerEvents: envelopeAberto ? "none" : "auto",
          }}
        >
          <div style={estilos.envelopeWrapper} onClick={abrirEnvelope}>
            <div
              style={{
                ...estilos.envelopeAbaSuperior,
                transform: envelopeAberto ? "rotateX(180deg)" : "rotateX(0deg)",
              }}
            />
            <div
              style={{
                ...estilos.envelopeCarta,
                transform: envelopeAberto
                  ? "translateY(-120px)"
                  : "translateY(0)",
              }}
            >
              <p style={estilos.cartaTextoMonograma}>A & L</p>
              <p style={estilos.cartaTexto}>Você é nosso convidado especial</p>
              <div style={estilos.cartaLinhas} />
            </div>
            <div style={estilos.envelopeCorpo} />
            {!envelopeAberto && (
              <div style={estilos.seloInterativo}>
                <span style={estilos.seloTexto}>Abrir Convite</span>
              </div>
            )}
          </div>
        </div>
      )}

      <header
        style={{
          ...estilos.appBar,
          padding: isMobile ? "0 20px" : "0 40px",
        }}
      >
        <div style={estilos.logoHeader} onClick={() => rolarPara("inicio")}>
          A & L
        </div>

        {isMobile ? (
          <button
            style={estilos.botaoMenuMobile}
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
        ) : (
          <nav style={estilos.navMenu}>
            <button style={estilos.navLink} onClick={() => rolarPara("inicio")}>
              Início
            </button>
            <button
              style={estilos.navLink}
              onClick={() => rolarPara("historia")}
            >
              Nossa História
            </button>
            <button style={estilos.navLink} onClick={() => rolarPara("local")}>
              Local do casamento
            </button>
            <button
              style={estilos.navLink}
              onClick={() => rolarPara("presentes")}
            >
              Lista de presentes
            </button>
            <button style={estilos.navLink} onClick={() => rolarPara("jantar")}>
              Jantar de adesão
            </button>
            <button
              style={estilos.navLink}
              onClick={() => rolarPara("mensagens")}
            >
              Mensagem para os noivos
            </button>
          </nav>
        )}
      </header>

      {isMobile && menuAberto && (
        <div style={estilos.drawerMenuMobile}>
          <button
            style={estilos.navLinkMobile}
            onClick={() => rolarPara("inicio")}
          >
            Início
          </button>
          <button
            style={estilos.navLinkMobile}
            onClick={() => rolarPara("historia")}
          >
            Nossa História
          </button>
          <button
            style={estilos.navLinkMobile}
            onClick={() => rolarPara("local")}
          >
            Local do casamento
          </button>
          <button
            style={estilos.navLinkMobile}
            onClick={() => rolarPara("presentes")}
          >
            Lista de presentes
          </button>
          <button
            style={estilos.navLinkMobile}
            onClick={() => rolarPara("jantar")}
          >
            Jantar de adesão
          </button>
          <button
            style={estilos.navLinkMobile}
            onClick={() => rolarPara("mensagens")}
          >
            Mensagem para os noivos
          </button>
        </div>
      )}

      <main
        style={{
          ...estilos.conteudoRolavel,
          marginBottom: isMobile ? "70px" : "60px",
        }}
      >
        <section id="inicio" style={estilos.secaoInicio}>
          <div
            style={{
              ...estilos.molduraInicio,
              padding: isMobile ? "24px 14px" : "36px 40px",
              aspectRatio: isMobile ? "auto" : "16 / 9",
              minHeight: isMobile ? "520px" : "auto",
            }}
          >
            <p style={estilos.subtituloSuave}>COM AMOR, CONVIDAMOS VOCÊ</p>
            <h1
              style={{
                ...estilos.tituloCasal,
                fontSize: isMobile ? "36px" : "56px",
              }}
            >
              Andrea &amp; Lucas
            </h1>
            <p
              style={{
                ...estilos.fraseCitacao,
                fontSize: isMobile ? "15px" : "18px",
              }}
            >
              "Dizem que o amor é uma questão de sorte,
              <br />
              mas encontrar você foi a certeza mais bonita que a vida me deu."
            </p>
            <p style={estilos.subtituloData}>
              Convidam para a cerimônia do seu casamento civil
            </p>
            <div
              style={{
                ...estilos.dataDestaque,
                fontSize: isMobile ? "18px" : "22px",
              }}
            >
              11 de dezembro de 2026 • 16:00 horas
            </div>
            <div
              style={{
                ...estilos.acoesInicio,
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <button
                style={estilos.botaoPrincipal}
                onClick={() => rolarPara("local")}
              >
                Conheça o local
              </button>
              <button
                style={estilos.botaoSecundario}
                onClick={() => rolarPara("jantar")}
              >
                Jantar de adesão
              </button>
            </div>
          </div>
        </section>

        <section
          id="historia"
          style={{
            ...estilos.secaoClara,
            padding: isMobile ? "50px 16px" : "80px 20px",
          }}
        >
          <div style={estilos.containerCentral}>
            <div
              style={{
                ...estilos.gridDuasColunas,
                gap: isMobile ? "32px" : "60px",
              }}
            >
              <div style={estilos.colunaImagem}>
                <div style={estilos.molduraFoto}>
                  <img
                    src="/foto1.jpeg"
                    alt="primeiro encontro"
                    style={estilos.fotoResponsiva}
                  />
                </div>
              </div>
              <div style={estilos.colunaTexto}>
                <span style={estilos.etiquetaSecao}>
                  O NOSSO SIM COMEÇA AQUI
                </span>
                <h2
                  style={{
                    ...estilos.tituloSecao,
                    fontSize: isMobile ? "28px" : "36px",
                  }}
                >
                  Nossa História
                </h2>
                <h3 style={estilos.subtituloHistoria}>
                  Quando o tempo deixa de ser pressa e se transforma em
                  encontro.
                </h3>
                <p style={estilos.paragrafoTexto}>
                  Dizem que a maturidade nos ensina a ser prudentes, mas a vida
                  sempre reserva espaço para as surpresas mais bonitas. Nossos
                  caminhos se cruzaram em um instante despretensioso em uma
                  conversa de aplicativo, e o que parecia apenas um primeiro
                  encontro logo revelou a certeza tranquila de termos encontrado
                  o lugar onde o coração faz morada.
                  <br />
                  <br />
                  Viemos de histórias já vividas, com nossos próprios passos e
                  com os maiores amores das nossas vidas: o Eduardo e o Pedro.
                  Compartilhamos o fascínio por criar, ensinar e construir o
                  futuro, mas foi no aconchego do dia a dia, nos cafés
                  compartilhados e nos risos fáceis que descobrimos que a melhor
                  conexão é aquela que acontece no olhar.
                  <br />
                  <br />
                  Em apenas alguns meses, vivemos uma intensidade de afeto,
                  presença e cumplicidade que superou tudo o que já havíamos
                  conhecido. O tempo não precisou de anos para provar nada; ele
                  apenas transbordou.
                  <br />
                  <br />
                  Agora, somamos nossas vidas, nossos filhos e nossos sonhos em
                  um só caminho. Este casamento não é apenas uma celebração do
                  amor que nos encontrou, mas a confirmação feliz de que o nosso
                  melhor capítulo começa todos os dias, a partir do momento em
                  que escolhemos caminhar juntos.
                  <br />
                  <br />
                </p>
                <p style={estilos.paragrafoDiscreto}></p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="local"
          style={{
            ...estilos.secaoVerdeClara,
            padding: isMobile ? "50px 16px" : "80px 20px",
          }}
        >
          <div style={estilos.containerCentral}>
            <div
              style={{
                ...estilos.gridDuasColunas,
                gap: isMobile ? "32px" : "60px",
              }}
            >
              <div>
                <span style={estilos.etiquetaSecao}>ONDE DIREMOS SIM</span>
                <h2
                  style={{
                    ...estilos.tituloSecao,
                    fontSize: isMobile ? "28px" : "36px",
                  }}
                >
                  Local do casamento
                </h2>
                <p style={estilos.paragrafoTexto}>
                  Será uma alegria ter você conosco na cerimônia do nosso
                  casamento civil.
                </p>
                <div style={estilos.enderecoBox}>
                  <span>
                    📍 Av. Brg. Souto, nº10 Boa Esperança - Parnamirim - RN
                  </span>
                </div>
                <a
                  href="https://maps.google.com/?q=Av.+Brg.+Souto,+10,+Boa+Esperanca,+Parnamirim+-+RN"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={estilos.linkBotao}
                >
                  Como chegar
                </a>
              </div>
              <div style={estilos.blocoDataLocal}>
                <span style={estilos.etiquetaSecao}>CERIMÔNIA CIVIL</span>
                <div style={estilos.iconeRaminho}>🌱</div>
                <div
                  style={{
                    ...estilos.numeroDataDestaque,
                    fontSize: isMobile ? "48px" : "64px",
                  }}
                >
                  11
                </div>
                <div style={estilos.mesAnoDestaque}>dezembro de 2026</div>
                <div style={estilos.horarioDestaque}>ÀS 16:00 HORAS</div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="presentes"
          style={{
            ...estilos.secaoClara,
            padding: isMobile ? "50px 16px" : "80px 20px",
          }}
        >
          <div style={estilos.containerCentral}>
            <div style={estilos.cabecalhoCentralizado}>
              <span style={estilos.etiquetaSecao}>CARINHO EM CADA DETALHE</span>
              <h2
                style={{
                  ...estilos.tituloSecao,
                  fontSize: isMobile ? "28px" : "36px",
                }}
              >
                Lista de presentes
              </h2>
              <p style={estilos.paragrafoTexto}>
                Sua presença é o nosso maior presente. Para quem quiser nos
                presentear, este será o cantinho das sugestões escolhidas com
                amor.
              </p>
            </div>
            <div style={estilos.gridTresColunas}>
              <div style={estilos.cardPresente}>
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80"
                  alt="Para o nosso lar"
                  style={estilos.imagemCard}
                />
                <span style={estilos.tagCard}>SUGESTÃO A PERSONALIZAR</span>
                <h4 style={estilos.tituloCard}>Para o nosso lar</h4>
                <p style={estilos.descCard}>
                  Pequenos detalhes para fazer da casa um lugar cheio de afeto.
                </p>
                <div style={estilos.rodapeCard}>Detalhes em breve ♡</div>
              </div>

              <div style={estilos.cardPresente}>
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80"
                  alt="Para novas memórias"
                  style={estilos.imagemCard}
                />
                <span style={estilos.tagCard}>SUGESTÃO A PERSONALIZAR</span>
                <h4 style={estilos.tituloCard}>Para novas memórias</h4>
                <p style={estilos.descCard}>
                  Experiências e momentos para celebrar a vida que começa a
                  dois.
                </p>
                <div style={estilos.rodapeCard}>Detalhes em breve ♡</div>
              </div>

              <div style={estilos.cardPresente}>
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80"
                  alt="Um gesto de carinho"
                  style={estilos.imagemCard}
                />
                <span style={estilos.tagCard}>SUGESTÃO A PERSONALIZAR</span>
                <h4 style={estilos.tituloCard}>Um gesto de carinho</h4>
                <p style={estilos.descCard}>
                  Uma lembrança escolhida com amor também faz parte da nossa
                  história.
                </p>
                <div style={estilos.rodapeCard}>Detalhes em breve ♡</div>
              </div>
            </div>

            <div style={estilos.blocoPixEndereco}>
              <div style={estilos.cardPix}>
                <h4 style={estilos.tituloSecaoPix}>Presente via Pix</h4>
                <p style={estilos.textoPix}>
                  Você pode utilizar nossa chave Pix para contribuir
                  diretamente:
                </p>
                <div
                  style={{
                    ...estilos.linhaChavePix,
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "stretch" : "center",
                  }}
                >
                  <code style={estilos.codigoChave}>
                    lucas.toshio@exemplo.com
                  </code>
                  <button style={estilos.botaoCopiarPix} onClick={copiarPix}>
                    {chavePixCopiada ? "Copiado!" : "Copiar Chave"}
                  </button>
                </div>
              </div>
              <div style={estilos.cardEndereco}>
                <h4 style={estilos.tituloSecaoPix}>Envio de Presente Físico</h4>
                <p style={estilos.textoPix}>
                  Caso prefira enviar seu presente diretamente para nosso
                  endereço:
                </p>
                <p style={estilos.textoEnderecoCompleto}>
                  Av. Brg. Souto, nº 10 - Boa Esperança, Parnamirim - RN, CEP:
                  59140-000
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="jantar"
          style={{
            ...estilos.secaoVerdeEscura,
            padding: isMobile ? "50px 16px" : "80px 20px",
          }}
        >
          <div style={estilos.containerCentral}>
            <div
              style={{
                ...estilos.gridDuasColunas,
                gap: isMobile ? "32px" : "60px",
              }}
            >
              <div>
                <span style={estilos.etiquetaSecaoBranca}>
                  MAIS UM MOMENTO JUNTOS
                </span>
                <h2
                  style={{
                    ...estilos.tituloSecaoBranco,
                    fontSize: isMobile ? "28px" : "36px",
                  }}
                >
                  Venha jantar conosco!
                </h2>
                <p style={estilos.paragrafoBranco}>
                  Depois do sim, queremos continuar a celebração. Conte para nós
                  se você deseja participar do jantar de adesão.
                </p>
                <div style={estilos.boxAvisoJantar}>
                  <span style={estilos.iconeGarfo}>🍽️ Jantar de adesão</span>
                  <p style={estilos.textoAvisoJantar}>
                    Local, horário e valor por pessoa serão informados pelos
                    noivos. A participação no jantar é opcional.
                  </p>
                </div>
                <p style={estilos.disclaimerJantar}>
                  Este formulário é exclusivo para o jantar de adesão e não
                  corresponde à confirmação para a cerimônia civil.
                </p>
              </div>
              <div
                style={{
                  ...estilos.cardFormularioJantar,
                  padding: isMobile ? "24px 16px" : "36px",
                }}
              >
                <h3 style={estilos.tituloFormularioJantar}>
                  Confirmação no jantar de adesão
                </h3>
                <p style={estilos.subtituloFormularioJantar}>
                  Deixe seus dados para organizarmos esse momento.
                </p>
                <form onSubmit={handleJantarSubmit}>
                  <div style={estilos.campoGrupo}>
                    <label style={estilos.rotuloCampo}>Nome completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Como você se chama?"
                      style={estilos.inputPadrao}
                      value={formDataJantar.nome}
                      onChange={(e) =>
                        setFormDataJantar({
                          ...formDataJantar,
                          nome: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    style={{
                      ...estilos.gridCamposDuplos,
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    }}
                  >
                    <div style={estilos.campoGrupo}>
                      <label style={estilos.rotuloCampo}>WhatsApp *</label>
                      <input
                        type="text"
                        required
                        placeholder="(00) 00000-0000"
                        style={estilos.inputPadrao}
                        value={formDataJantar.whatsapp}
                        onChange={(e) =>
                          setFormDataJantar({
                            ...formDataJantar,
                            whatsapp: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div style={estilos.campoGrupo}>
                      <label style={estilos.rotuloCampo}>
                        Pessoas, incluindo você *
                      </label>
                      <select
                        style={estilos.inputPadrao}
                        value={formDataJantar.pessoas}
                        onChange={(e) =>
                          setFormDataJantar({
                            ...formDataJantar,
                            pessoas: e.target.value,
                          })
                        }
                      >
                        <option value="1">1 pessoa</option>
                        <option value="2">2 pessoas</option>
                        <option value="3">3 pessoas</option>
                        <option value="4">4 pessoas</option>
                        <option value="5+">5 ou mais</option>
                      </select>
                    </div>
                  </div>
                  <div style={estilos.campoGrupo}>
                    <label style={estilos.rotuloCampo}>
                      Você pretende participar do jantar? *
                    </label>
                    <div
                      style={{
                        ...estilos.opcoesRadio,
                        flexDirection: isMobile ? "column" : "row",
                        gap: isMobile ? "10px" : "20px",
                      }}
                    >
                      <label style={estilos.labelRadio}>
                        <input
                          type="radio"
                          name="pretendeIr"
                          value="sim"
                          checked={formDataJantar.pretendeIr === "sim"}
                          onChange={() =>
                            setFormDataJantar({
                              ...formDataJantar,
                              pretendeIr: "sim",
                            })
                          }
                        />
                        Sim, quero participar
                      </label>
                      <label style={estilos.labelRadio}>
                        <input
                          type="radio"
                          name="pretendeIr"
                          value="nao"
                          checked={formDataJantar.pretendeIr === "nao"}
                          onChange={() =>
                            setFormDataJantar({
                              ...formDataJantar,
                              pretendeIr: "nao",
                            })
                          }
                        />
                        Não poderei ir
                      </label>
                    </div>
                  </div>
                  <div style={estilos.campoGrupo}>
                    <label style={estilos.rotuloCampo}>
                      Restrições alimentares ou observações
                    </label>
                    <input
                      type="text"
                      placeholder="Se precisar, conte por onde..."
                      style={estilos.inputPadrao}
                      value={formDataJantar.restricoes}
                      onChange={(e) =>
                        setFormDataJantar({
                          ...formDataJantar,
                          restricoes: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    style={{
                      ...estilos.linhaRodapeForm,
                      flexDirection: isMobile ? "column-reverse" : "row",
                      gap: isMobile ? "16px" : "0",
                      alignItems: isMobile ? "stretch" : "center",
                    }}
                  >
                    <span style={estilos.camposObrigatorios}>
                      * Campos obrigatórios
                    </span>
                    <button type="submit" style={estilos.botaoConfirmarJantar}>
                      Confirmar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section
          id="mensagens"
          style={{
            ...estilos.secaoVerdeClara,
            padding: isMobile ? "50px 16px" : "80px 20px",
          }}
        >
          <div style={estilos.containerCentral}>
            <div
              style={{
                ...estilos.gridDuasColunas,
                gap: isMobile ? "32px" : "60px",
              }}
            >
              <div>
                <span style={estilos.etiquetaSecao}>PALAVRAS QUE FICAM</span>
                <h2
                  style={{
                    ...estilos.tituloSecao,
                    fontSize: isMobile ? "28px" : "36px",
                  }}
                >
                  Mensagem para os noivos
                </h2>
                <p style={estilos.paragrafoTexto}>
                  Uma lembrança, um desejo ou algumas palavras de carinho. Deixe
                  sua mensagem para fazer parte deste capítulo tão especial.
                </p>
                <p style={estilos.assinaturaNoivos}>
                  Com carinho, Andrea & Lucas
                </p>
              </div>
              <div>
                <form
                  onSubmit={handleMensagemSubmit}
                  style={{
                    ...estilos.formMensagem,
                    padding: isMobile ? "24px 16px" : "36px",
                  }}
                >
                  <div style={estilos.campoGrupo}>
                    <label style={estilos.rotuloCampo}>Seu nome *</label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome ou o nome da sua família"
                      style={estilos.inputPadrao}
                      value={formDataMensagem.nome}
                      onChange={(e) =>
                        setFormDataMensagem({
                          ...formDataMensagem,
                          nome: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div style={estilos.campoGrupo}>
                    <label style={estilos.rotuloCampo}>Sua mensagem *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Escreva aqui seus votos de felicidade..."
                      style={estilos.textareaPadrao}
                      value={formDataMensagem.mensagem}
                      onChange={(e) =>
                        setFormDataMensagem({
                          ...formDataMensagem,
                          mensagem: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    style={{
                      ...estilos.linhaRodapeForm,
                      flexDirection: isMobile ? "column-reverse" : "row",
                      gap: isMobile ? "16px" : "0",
                      alignItems: isMobile ? "stretch" : "center",
                    }}
                  >
                    <span style={estilos.camposObrigatorios}>
                      * Campos obrigatórios
                    </span>
                    <button
                      type="submit"
                      disabled={enviandoMensagem}
                      style={{
                        ...estilos.botaoEnviarMensagem,
                        opacity: enviandoMensagem ? 0.6 : 1,
                        cursor: enviandoMensagem ? "not-allowed" : "pointer",
                      }}
                    >
                      {enviandoMensagem ? "Enviando..." : "Enviar mensagem ✈"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        style={{
          ...estilos.rodapeFixo,
          height: isMobile ? "auto" : "56px",
          padding: isMobile ? "10px 16px" : "0 40px",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "4px" : "0",
        }}
      >
        <div
          style={{
            ...estilos.textoRodape,
            fontSize: isMobile ? "12px" : "14px",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          O nosso dia fica mais bonito com você.
        </div>
        <div style={estilos.contadorRodape}>
          <span
            style={{
              ...estilos.contadorNumero,
              fontSize: isMobile ? "13px" : "15px",
            }}
          >
            {tempoRestante.dias}d {String(tempoRestante.horas).padStart(2, "0")}
            h {String(tempoRestante.minutos).padStart(2, "0")}m{" "}
            {String(tempoRestante.segundos).padStart(2, "0")}s
          </span>
          <span style={estilos.iconeAmpulheta}>⏳</span>
        </div>
      </footer>
    </div>
  );
}

const estilos = {
  pagina: {
    margin: 0,
    padding: 0,
    fontFamily: '"Cormorant Garamond", "Cinzel", "Georgia", serif',
    backgroundColor: "#FAF8F5",
    color: "#2D3A29",
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  envelopeOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#354433",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    transition: "opacity 0.8s ease-in-out",
  },
  envelopeWrapper: {
    position: "relative",
    width: "300px",
    height: "210px",
    backgroundColor: "#A8C3B4",
    borderRadius: "4px",
    cursor: "pointer",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    perspective: "1000px",
  },
  envelopeAbaSuperior: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    borderLeft: "150px solid transparent",
    borderRight: "150px solid transparent",
    borderTop: "105px solid #8FA89A",
    transformOrigin: "top",
    transition: "transform 0.8s ease-in-out",
    zIndex: 5,
  },
  envelopeCarta: {
    position: "absolute",
    top: "15px",
    left: "15px",
    width: "270px",
    height: "180px",
    backgroundColor: "#FFFFFF",
    borderRadius: "4px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    boxSizing: "border-box",
    transition: "transform 0.8s ease-in-out",
    zIndex: 2,
  },
  cartaTextoMonograma: {
    fontSize: "24px",
    margin: "0 0 8px 0",
    color: "#3B4D3C",
    letterSpacing: "2px",
    fontWeight: "bold",
  },
  cartaTexto: {
    fontSize: "13px",
    margin: 0,
    color: "#666",
    textAlign: "center",
  },
  cartaLinhas: {
    width: "60px",
    height: "2px",
    backgroundColor: "#C5D4CB",
    marginTop: "12px",
  },
  envelopeCorpo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderLeft: "150px solid #9BB4A6",
    borderRight: "150px solid #9BB4A6",
    borderBottom: "105px solid #A8C3B4",
    borderTop: "105px solid transparent",
    zIndex: 4,
  },
  seloInterativo: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#2D3A29",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "12px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    zIndex: 6,
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  seloTexto: {
    fontWeight: "bold",
  },
  appBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "64px",
    backgroundColor: "rgba(53, 68, 51, 0.95)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoHeader: {
    color: "#FFFFFF",
    fontSize: "22px",
    fontWeight: "bold",
    letterSpacing: "2px",
    cursor: "pointer",
  },
  botaoMenuMobile: {
    background: "none",
    border: "none",
    color: "#FFFFFF",
    fontSize: "24px",
    cursor: "pointer",
    padding: "4px 8px",
  },
  drawerMenuMobile: {
    position: "fixed",
    top: "64px",
    left: 0,
    right: 0,
    backgroundColor: "rgba(53, 68, 51, 0.98)",
    display: "flex",
    flexDirection: "column",
    padding: "16px 24px",
    zIndex: 999,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  navLinkMobile: {
    background: "none",
    border: "none",
    color: "#FFFFFF",
    fontSize: "15px",
    textAlign: "left",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
  },
  navMenu: {
    display: "flex",
    gap: "24px",
  },
  navLink: {
    background: "none",
    border: "none",
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: "13px",
    letterSpacing: "0.5px",
    cursor: "pointer",
    padding: "8px 0",
    transition: "color 0.2s ease",
    outline: "none",
  },
  conteudoRolavel: {
    marginTop: "64px",
    flex: 1,
  },
  secaoInicio: {
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#354433",
    padding: "24px 16px",
    boxSizing: "border-box",
  },
  molduraInicio: {
    width: "100%",
    maxWidth: "1100px",
    aspectRatio: "16 / 9",
    backgroundImage: 'url("/weeding site.png")',
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.35)",
    borderRadius: "4px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    boxSizing: "border-box",
    position: "relative",
  },
  subtituloSuave: {
    fontSize: "11px",
    letterSpacing: "3px",
    color: "#778873",
    margin: "0 0 6px 0",
    fontWeight: "600",
  },
  tituloCasal: {
    fontFamily: '"Cormorant Garamond", "Cinzel", "Georgia", serif',
    fontStyle: "italic",
    fontWeight: "normal",
    margin: "0 0 10px 0",
    color: "#283626",
    letterSpacing: "1px",
    lineHeight: "1.05",
  },
  fraseCitacao: {
    fontStyle: "italic",
    color: "#556652",
    lineHeight: "1.4",
    maxWidth: "540px",
    margin: "0 auto 12px auto",
  },
  subtituloData: {
    fontSize: "12px",
    color: "#778873",
    margin: "0 0 4px 0",
    letterSpacing: "0.5px",
  },
  dataDestaque: {
    fontWeight: "bold",
    color: "#283626",
    margin: "0 0 18px 0",
    letterSpacing: "0.8px",
  },
  acoesInicio: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  botaoPrincipal: {
    backgroundColor: "#2D3A29",
    color: "#FFFFFF",
    border: "none",
    padding: "12px 28px",
    borderRadius: "4px",
    fontSize: "13px",
    cursor: "pointer",
    letterSpacing: "1px",
    boxShadow: "0 4px 12px rgba(45, 58, 41, 0.2)",
  },
  botaoSecundario: {
    backgroundColor: "transparent",
    color: "#2D3A29",
    border: "1px solid #2D3A29",
    padding: "12px 28px",
    borderRadius: "4px",
    fontSize: "13px",
    cursor: "pointer",
    letterSpacing: "1px",
  },
  secaoClara: {
    backgroundColor: "#FFFFFF",
  },
  secaoVerdeClara: {
    backgroundColor: "#EFF3EE",
  },
  secaoVerdeEscura: {
    backgroundColor: "#2D3A29",
    color: "#FFFFFF",
  },
  containerCentral: {
    maxWidth: "1050px",
    margin: "0 auto",
  },
  gridDuasColunas: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    alignItems: "center",
  },
  colunaImagem: {
    display: "flex",
    justifyContent: "center",
  },
  molduraFoto: {
    width: "100%",
    maxWidth: "440px",
    borderRadius: "6px",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  fotoResponsiva: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  colunaTexto: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  etiquetaSecao: {
    fontSize: "11px",
    letterSpacing: "2px",
    color: "#778873",
    fontWeight: "bold",
    marginBottom: "12px",
    display: "block",
  },
  etiquetaSecaoBranca: {
    fontSize: "11px",
    letterSpacing: "2px",
    color: "#A8C3B4",
    fontWeight: "bold",
    marginBottom: "12px",
    display: "block",
  },
  tituloSecao: {
    fontWeight: "normal",
    margin: "0 0 16px 0",
    color: "#283626",
  },
  tituloSecaoBranco: {
    fontWeight: "normal",
    margin: "0 0 16px 0",
    color: "#FFFFFF",
  },
  subtituloHistoria: {
    fontSize: "17px",
    lineHeight: "1.5",
    fontWeight: "normal",
    margin: "0 0 16px 0",
    color: "#3B4D3C",
  },
  paragrafoTexto: {
    fontSize: "14px",
    lineHeight: "1.7",
    color: "#556652",
    margin: "0 0 16px 0",
  },
  paragrafoDiscreto: {
    fontSize: "12px",
    color: "#99A897",
    margin: 0,
  },
  enderecoBox: {
    margin: "20px 0",
    fontSize: "14px",
    color: "#3B4D3C",
    lineHeight: "1.5",
  },
  linkBotao: {
    display: "inline-block",
    backgroundColor: "#2D3A29",
    color: "#FFFFFF",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "4px",
    fontSize: "13px",
    letterSpacing: "1px",
    textAlign: "center",
  },
  blocoDataLocal: {
    backgroundColor: "#FAF8F5",
    padding: "32px 20px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  iconeRaminho: {
    fontSize: "24px",
    margin: "10px 0",
  },
  numeroDataDestaque: {
    fontWeight: "bold",
    color: "#2D3A29",
    lineHeight: "1",
  },
  mesAnoDestaque: {
    fontSize: "17px",
    color: "#556652",
    margin: "8px 0",
  },
  horarioDestaque: {
    fontSize: "12px",
    letterSpacing: "1.5px",
    color: "#778873",
  },
  cabecalhoCentralizado: {
    textAlign: "center",
    maxWidth: "650px",
    margin: "0 auto 40px auto",
  },
  gridTresColunas: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  cardPresente: {
    backgroundColor: "#FAF8F5",
    borderRadius: "6px",
    padding: "18px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
  },
  imagemCard: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "4px",
    marginBottom: "14px",
  },
  tagCard: {
    fontSize: "10px",
    letterSpacing: "1.5px",
    color: "#8FA89A",
    display: "block",
    marginBottom: "8px",
  },
  tituloCard: {
    fontSize: "17px",
    fontWeight: "normal",
    margin: "0 0 8px 0",
    color: "#283626",
  },
  descCard: {
    fontSize: "13px",
    color: "#667764",
    lineHeight: "1.5",
    margin: "0 0 16px 0",
  },
  rodapeCard: {
    fontSize: "12px",
    color: "#8FA89A",
  },
  blocoPixEndereco: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginTop: "24px",
  },
  cardPix: {
    backgroundColor: "#FAF8F5",
    padding: "20px",
    borderRadius: "6px",
    border: "1px solid #E2E8E2",
  },
  cardEndereco: {
    backgroundColor: "#FAF8F5",
    padding: "20px",
    borderRadius: "6px",
    border: "1px solid #E2E8E2",
  },
  tituloSecaoPix: {
    fontSize: "16px",
    color: "#283626",
    marginTop: 0,
    marginBottom: "10px",
  },
  textoPix: {
    fontSize: "13px",
    color: "#556652",
    marginBottom: "10px",
  },
  linhaChavePix: {
    display: "flex",
    gap: "10px",
  },
  codigoChave: {
    backgroundColor: "#FFFFFF",
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #D5DDD5",
    fontSize: "12px",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    wordBreak: "break-all",
  },
  botaoCopiarPix: {
    backgroundColor: "#2D3A29",
    color: "#FFFFFF",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  textoEnderecoCompleto: {
    fontSize: "13px",
    color: "#283626",
    fontWeight: "bold",
    lineHeight: "1.6",
    margin: 0,
  },
  paragrafoBranco: {
    fontSize: "14px",
    lineHeight: "1.7",
    color: "#C5D4CB",
    margin: "0 0 20px 0",
  },
  boxAvisoJantar: {
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "16px",
    borderRadius: "6px",
    marginBottom: "16px",
  },
  iconeGarfo: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#E8EFE9",
    display: "block",
    marginBottom: "6px",
  },
  textoAvisoJantar: {
    fontSize: "12px",
    color: "#B0C2B5",
    margin: 0,
    lineHeight: "1.5",
  },
  disclaimerJantar: {
    fontSize: "11px",
    color: "#8A9C8F",
    margin: 0,
    lineHeight: "1.4",
  },
  cardFormularioJantar: {
    backgroundColor: "#FAF8F5",
    color: "#283626",
    borderRadius: "8px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  },
  tituloFormularioJantar: {
    fontSize: "19px",
    fontWeight: "normal",
    margin: "0 0 6px 0",
  },
  subtituloFormularioJantar: {
    fontSize: "12px",
    color: "#778873",
    margin: "0 0 20px 0",
  },
  campoGrupo: {
    marginBottom: "16px",
  },
  gridCamposDuplos: {
    display: "grid",
    gap: "16px",
  },
  rotuloCampo: {
    display: "block",
    fontSize: "12px",
    color: "#556652",
    marginBottom: "6px",
  },
  inputPadrao: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "4px",
    border: "1px solid #D5DDD5",
    fontSize: "13px",
    boxSizing: "border-box",
    backgroundColor: "#FFFFFF",
    color: "#283626",
    outline: "none",
  },
  textareaPadrao: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "4px",
    border: "1px solid #D5DDD5",
    fontSize: "13px",
    boxSizing: "border-box",
    backgroundColor: "#FFFFFF",
    color: "#283626",
    outline: "none",
    resize: "vertical",
  },
  opcoesRadio: {
    display: "flex",
    marginTop: "6px",
  },
  labelRadio: {
    fontSize: "13px",
    color: "#3B4D3C",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
  linhaRodapeForm: {
    display: "flex",
    marginTop: "20px",
  },
  camposObrigatorios: {
    fontSize: "11px",
    color: "#8FA89A",
  },
  botaoConfirmarJantar: {
    backgroundColor: "#2D3A29",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 24px",
    borderRadius: "4px",
    fontSize: "13px",
    cursor: "pointer",
  },
  formMensagem: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  assinaturaNoivos: {
    fontSize: "17px",
    fontStyle: "italic",
    color: "#283626",
    marginTop: "24px",
  },
  botaoEnviarMensagem: {
    backgroundColor: "#2D3A29",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 24px",
    borderRadius: "4px",
    fontSize: "13px",
    cursor: "pointer",
  },
  rodapeFixo: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(53, 68, 51, 0.95)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
    borderTop: "1px solid rgba(255,255,255,0.1)",
    color: "#FFFFFF",
    boxSizing: "border-box",
  },
  textoRodape: {
    letterSpacing: "0.5px",
  },
  contadorRodape: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  contadorNumero: {
    fontFamily: "monospace",
    letterSpacing: "1px",
  },
  iconeAmpulheta: {
    fontSize: "15px",
  },
};
