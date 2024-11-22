const express = require('express');
const router = express.Router();
const pool = require('../../config/pool_de_conexao');
const { salvarEvento, listarEventosUsuario, excluirEvento } = require("../controllers/calendarioController");
const userPacientesController = require('../controllers/userPacientesController');
const userPsicologosController = require('../controllers/userPsicologosController');
const { marcarDisponivel, getDiasDisponiveis, removerDisponiveis } = require("../controllers/dashboardPsicologoController");
const userMenorController = require('../controllers/userMenorController');
const { checkAuthenticatedUser, checkAuthenticatedPsicologo } = require("../models/autenticador_middleware");


router.get('/', (req, res) => {
    console.log('Sessão atual:', req.session); // Log de debug da sessão

    const autenticado = req.session.autenticado || null;
    const usuarioNome = autenticado ? autenticado.usuarioNome : 'Visitante';

    // Define que a página é 'homelogged' somente para a rota '/'
    const pagina = autenticado ? 'homelogged' : 'home';

    res.render('pages/index', {
        pagina: pagina,
        autenticado: autenticado,
        usuarioNome: usuarioNome,
    });
});



// Rotas Estáticas
router.get('/headerunlogged', (req, res) => {
    res.render('pages/index', { pagina: 'headerunlogged', autenticado: req.session.autenticado || null });
  });

  router.get('/salvospsic', (req, res) => {
    res.render('pages/index', { pagina: 'salvospsic', autenticado: req.session.autenticado || null });
  });

  router.get('/precisadeajudapsic', (req, res) => {
    res.render('pages/index', { pagina: 'precisadeajudapsic', autenticado: req.session.autenticado || null });
  });
  
  router.get('/faq', (req, res) => {
    res.render('pages/index', { pagina: 'faq', autenticado: req.session.autenticado || null });
  });

  router.get('/consultaspsic', (req, res) => {
    res.render('pages/index', { pagina: 'consultaspsic', autenticado: req.session.autenticado || null });
  });
  
  router.get('/psicologos', (req, res) => {
    res.render('pages/index', { pagina: 'psicologos', autenticado: req.session.autenticado || null });
  });
  
  router.get('/interesses', (req, res) => {
    res.render('pages/index', { pagina: 'interesses', autenticado: req.session.autenticado || null });
  });
  
  router.get('/transtornos', (req, res) => {
    res.render('pages/index', { pagina: 'transtornos', autenticado: req.session.autenticado || null });
  });
  
  router.get('/sobrenos', (req, res) => {
    res.render('pages/index', { pagina: 'sobrenos', autenticado: req.session.autenticado || null });
  });

  router.get('/editeseuperfilpsic', (req, res) => {
    res.render('pages/index', { pagina: 'editeseuperfilpsic', autenticado: req.session.autenticado || null });
  });
  
  router.get('/perfil-comunidade', (req, res) => {
    res.render('pages/index', { pagina: 'perfil-comunidade', autenticado: req.session.autenticado || null });
  });
  
  router.get('/comunidade', (req, res) => {
    res.render('pages/index', { pagina: 'comunidade', autenticado: req.session.autenticado || null });
  });
  
  router.get('/criarpostagem', (req, res) => {
    res.render('pages/index', { pagina: 'criarpostagem', autenticado: req.session.autenticado || null });
  });
  
  router.get('/criarcomunidade', (req, res) => {
    res.render('pages/index', { pagina: 'criarcomunidade', autenticado: req.session.autenticado || null });
  });
  
  router.get('/comentarios', (req, res) => {
    res.render('pages/index', { pagina: 'comentarios', autenticado: req.session.autenticado || null });
  });
  
  router.get('/rodape', (req, res) => {
    res.render('pages/index', { pagina: 'rodape', autenticado: req.session.autenticado || null });
  });
  
  router.get('/perfil', (req, res) => {
    res.render('pages/index', { pagina: 'perfil', autenticado: req.session.autenticado || null });
  });

  router.get('/perfilpsic', (req, res) => {
    res.render('pages/index', { pagina: 'perfilpsic', autenticado: req.session.autenticado || null });
  });
  
// Página Logada
router.get('/homelogged', checkAuthenticatedUser, (req, res) => {
    res.render('pages/index', {
        pagina: 'homelogged',
        autenticado: req.session.autenticado,
    });
});

// Cadastro de Pacientes
router.get('/cadastropacientes', (req, res) => {
    res.render('pages/index', {
        pagina: 'cadastropacientes',
        autenticado: null,
        errorsList: null,
        valores: {
            username: '',
            userdate: '',
            userpassword: '',
            useremail: '',
            userdocuments: ''
        }
    });
});


router.post('/cadastropacientes', async (req, res) => {
    try {
        const resultado = await userPacientesController.cadastrar(req);

        if (resultado.success) {
            // Adiciona as informações na sessão
            req.session.autenticado = {
                usuarioNome: req.body.username,  // Nome do usuário
                usuarioId: resultado.id,         // ID do usuário
                tipo: 'Comum',                   // Tipo de usuário
            };

            // Salva a sessão antes do redirecionamento
            req.session.save((err) => {
                if (err) {
                    console.error('Erro ao salvar sessão:', err);
                    return res.status(500).send('Erro ao salvar sessão.');
                }
                res.redirect('/');  // Redireciona para a página inicial
            });
        } else {
            res.status(401).render('pages/index', {
                pagina: 'cadastropacientes',
                errorsList: resultado.errors,
                valores: req.body,
            });
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).render('pages/index', {
            pagina: 'cadastropacientes',
            errorsList: [{ msg: 'Erro no servidor.' }],
            valores: req.body,
        });
    }
});

// Cadastro de Psicólogos
router.get('/cadastropsicologos', (req, res) => {
    res.render('pages/index', {
        pagina: 'cadastropsicologos',
        autenticado: null,
        errorsList: null,
        valores: {
            username: '',
            useremail: '',
            userpassword: '',
            userdocuments: '',
            usercrp: ''
        }
    });
});

router.post('/cadastropsicologos', async (req, res) => {
    try {
        const resultado = await userPsicologosController.cadastrar(req);

        if (resultado.success) {
            req.session.autenticado = {
                usuarioNome: req.body.username,  // Nome do usuário
                usuarioId: resultado.id,         // ID do usuário
                tipo: 'Psicologo',
            };

            // Salva a sessão antes de redirecionar para garantir que será persistida
            req.session.save((err) => {
                if (err) {
                    console.error('Erro ao salvar sessão:', err);
                    return res.status(500).send('Erro ao salvar sessão.');
                }
                res.redirect('/');  // Redireciona para a página principal
            });
        } else {
            res.status(401).render('pages/index', {
                pagina: 'cadastropsicologos',
                errorsList: resultado.errors,
                valores: req.body,
            });
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).render('pages/index', {
            pagina: 'cadastropsicologos',
            errorsList: [{ msg: 'Erro no servidor.' }],
            valores: req.body,
        });
    }
});

router.post('/cadastropacientes', async (req, res) => {
    try {
        const resultado = await userPacientesController.cadastrar(req);

        if (resultado.success) {
            req.session.autenticado = {
                usuarioNome: req.body.username,  // Nome do usuário
                usuarioCRP: req.body.usercrp,
                usuarioId: resultado.id,         // ID do usuário
                tipo: 'Psicologo',
            };

            // Salva a sessão antes de redirecionar para garantir que será persistida
            req.session.save((err) => {
                if (err) {
                    console.error('Erro ao salvar sessão:', err);
                    return res.status(500).send('Erro ao salvar sessão.');
                }
                res.redirect('/');  // Redireciona para a página principal
            });
        } else {
            res.status(401).render('pages/index', {
                pagina: 'cadastropacientes',
                errorsList: resultado.errors,
                valores: req.body,
            });
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).render('pages/index', {
            pagina: 'cadastropacientes',
            errorsList: [{ msg: 'Erro no servidor.' }],
            valores: req.body,
        });
    }
});

// Rota GET: Renderiza a página de cadastro de menor
router.get('/cadastromenor', (req, res) => {
    res.render('pages/index', {
        pagina: 'cadastromenor',
        autenticado: null,
        errorsList: null,
        valores: {
            username: '',
            userpassword: '',
            useremail: '',
            userdocuments: '',
            userdatemenor: '',
            userresponsaveldocuments: '',
            usernameresponsavel: ''
        }
    });
});

// Rota POST: Processa o cadastro de menor
router.post('/cadastromenor', async (req, res) => {
    try {
        const resultado = await userMenorController.cadastrar(req, res);

        if (resultado.success) {
            // Adiciona as informações na sessão
            req.session.autenticado = {
                usuarioNome: req.body.username,
                usuarioId: resultado.id,
                tipo: 'Menor de Idade'
            };

            // Salva a sessão antes do redirecionamento
            req.session.save((err) => {
                if (err) {
                    console.error('Erro ao salvar sessão:', err);
                    return res.status(500).send('Erro ao salvar sessão.');
                }
                res.redirect('/'); // Redireciona para a página inicial
            });
        } else {
            res.status(401).render('pages/index', {
                pagina: 'cadastromenor',
                errorsList: resultado.errorsList,
                valores: req.body
            });
        }
    } catch (error) {
        console.error('Erro no cadastro de menor:', error);
        res.status(500).render('pages/index', {
            pagina: 'cadastromenor',
            errorsList: [{ msg: 'Erro no servidor.' }],
            valores: req.body
        });
    }
});

// Login de Pacientes
router.get('/loginpacientes', (req, res) => {
    res.render('pages/index', { pagina: 'loginpacientes', autenticado: null });
});

router.post('/loginpacientes', async (req, res) => {
    try {
        const resultadoLogin = await userPacientesController.logar(req);

        if (resultadoLogin.success) {
            const usuario = resultadoLogin.usuario;

            // Configura a sessão
            req.session.autenticado = {
                usuarioNome: usuario.NOME_USUARIO,
                usuarioId: usuario.ID_USUARIO,
                tipo: usuario.DIFERENCIACAO_USUARIO,
            };

            // Salva a sessão antes de redirecionar para garantir que foi persistida
            req.session.save((err) => {
                if (err) {
                    console.error('Erro ao salvar sessão:', err);
                    return res.status(500).send('Erro ao salvar sessão.');
                }
                res.redirect('/'); // Redireciona corretamente
            });
        } else {
            console.log('Erros enviados para renderização:', resultadoLogin.errors);

            // Renderiza a página com os erros e mantém os valores inseridos pelo usuário
            res.status(401).render('pages/index', {
                pagina: 'loginpacientes',
                errorsList: resultadoLogin.errors,
                valores: req.body, // Mantém os valores preenchidos no formulário
            });
        }
    } catch (error) {
        console.error('Erro no login de pacientes:', error);
        res.status(500).render('pages/index', {
            pagina: 'loginpacientes',
            errorsList: [{ msg: 'Erro no servidor.' }],
            valores: req.body, // Mantém os valores
        });
    }
});



// Login de Psicólogos
router.get('/loginpsicologos', (req, res) => {
    res.render('pages/index', { pagina: 'loginpsicologos', autenticado: null });
});

router.post('/loginpsicologos', async (req, res) => {
    try {
        const resultadoLogin = await userPsicologosController.logar(req);

        if (resultadoLogin.success) {
            req.session.autenticado = {
                usuarioNome: resultadoLogin.dados.NOME_USUARIO,
                usuarioId: resultadoLogin.dados.ID_USUARIO,
                tipo: resultadoLogin.dados.DIFERENCIACAO_USUARIO,
            };

            req.session.save((err) => {
                if (err) {
                    console.error('Erro ao salvar sessão:', err);
                    return res.status(500).send('Erro ao salvar sessão.');
                }
                res.redirect('/');
            });
        } else {
            console.log('Erros enviados para renderização:', resultadoLogin.errors);

            res.status(401).render('pages/index', {
                pagina: 'loginpsicologos',
                errorsList: resultadoLogin.errors,
                valores: req.body,
            });
        }
    } catch (error) {
        console.error('Erro no login de psicólogos:', error);

        res.status(500).render('pages/index', {
            pagina: 'loginpsicologos',
            errorsList: [{ msg: 'Erro no servidor.' }],
            valores: req.body,
        });
    }
});




// Rota GET: Renderiza a página de login de dependentes
router.get('/logindependentes', (req, res) => {
    res.render('pages/index', {
        pagina: 'logindependentes',
        autenticado: null,
        errorsList: null
    });
});

// Rota POST: Processa o login de dependentes
router.post('/logindependentes', async (req, res) => {
    try {
        const resultadoLogin = await userMenorController.logar(req);

        if (resultadoLogin.success) {
            const usuario = resultadoLogin.usuario;

            // Preenche a sessão com as informações do usuário
            req.session.autenticado = {
                usuarioNome: usuario.NOME_USUARIO,
                usuarioId: usuario.ID_USUARIO,
                tipo: usuario.DIFERENCIACAO_USUARIO
            };

            // Salva a sessão antes do redirecionamento
            req.session.save((err) => {
                if (err) {
                    console.error('Erro ao salvar sessão:', err);
                    return res.status(500).send('Erro ao salvar sessão.');
                }
                res.redirect('/'); // Redireciona para a página inicial
            });
        } else {
            console.log('Erros para renderização:', resultadoLogin.errors);

            // Renderiza a página com os erros e mantém os valores inseridos
            res.status(401).render('pages/index', {
                pagina: 'logindependentes',
                errorsList: resultadoLogin.errors,
                valores: req.body, // Mantém os valores preenchidos no formulário
            });
        }
    } catch (error) {
        console.error('Erro no login dependentes:', error);
        res.status(500).render('pages/index', {
            pagina: 'logindependentes',
            errorsList: [{ msg: 'Erro no servidor.' }],
            valores: req.body, // Mantém os valores
        });
    }
});

// Chat Protegido
router.get('/formularioconsulta', checkAuthenticatedUser,verificarPsicologo, (req, res) => {
    const psicologoId = req.session.autenticado.usuarioId; // Pega o ID do psicólogo logado
    res.render('pages/index', { pagina: "formularioconsulta", psicologoId }); // Renderiza a view com o ID do psicólogo
  });
  router.post('/api/agendar-consulta', checkAuthenticatedUser, verificarPsicologo, async (req, res) => {
    const usuarioId = req.session.autenticado.usuarioId; // ID do psicólogo que está criando a consulta
    const { cpfUsuario, dataHoraConsulta, preferenciasRemotas, valorConsulta, tempoConsulta } = req.body;
  
    try {
        // Busque o ID do usuário pelo CPF
        const [usuario] = await pool.query(`SELECT ID_USUARIO FROM usuario WHERE CPF_USUARIO = ?`, [cpfUsuario]);
  
        if (usuario.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
  
        const idUsuario = usuario[0].ID_USUARIO;
  
        // Insira a nova consulta na tabela
        await pool.query(`
            INSERT INTO consultas (DATAHORA_CONSULTAS, STATUS_CONSULTAS, PREFERENCIAS_REMOTAS_CONSULTAS, VALOR_CONSULTA, TEMPO_CONSULTA, USUARIO_ID_USUARIO, PSICOLOGO_ID_PSICOLOGO)
            VALUES (?, 'Agendada', ?, ?, ?, ?, ?)`,
            [dataHoraConsulta, preferenciasRemotas, valorConsulta, tempoConsulta, idUsuario, usuarioId]
        );
  
        res.status(201).json({ message: 'Consulta agendada com sucesso!' });
    } catch (error) {
        console.error("Erro ao agendar consulta:", error);
        res.status(500).json({ error: 'Erro ao agendar a consulta.' });
    }
  });
  router.post('/enviar-mensagem', async (req, res) => {
    if (!req.session.autenticado) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }
  
    const { consultaId, conteudo } = req.body;
    const remetenteId = req.session.autenticado.usuarioId;
  
    try {
        // Verifica se o usuário tem permissão para enviar mensagem nesta consulta
        const [consulta] = await pool.query(`
            SELECT * FROM consultas 
            WHERE ID_CONSULTAS = ? 
            AND (USUARIO_ID_USUARIO = ? OR PSICOLOGO_ID_PSICOLOGO = ?)`,
            [consultaId, remetenteId, remetenteId]
        );
  
        if (consulta.length === 0) {
            return res.status(403).json({ 
                error: 'Você não tem permissão para enviar mensagens nesta consulta' 
            });
        }
  
        // Insere a mensagem no banco de dados
        const statusChat = 'online';
        const dataHoraChat = new Date();
  
        await pool.query(`
            INSERT INTO chat 
            (MENSAGEM_CHAT, DATA_HORA_CHAT, STATUS_CHAT, ID_CONSULTA, ID_REMETENTE) 
            VALUES (?, ?, ?, ?, ?)`,
            [conteudo, dataHoraChat, statusChat, consultaId, remetenteId]
        );
  
        res.status(200).json({ 
            success: true,
            message: 'Mensagem enviada com sucesso',
            data: {
                mensagem: conteudo,
                dataHora: dataHoraChat,
                remetenteId
            }
        });
  
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
  });
  
  // Rota para carregar mensagens de uma consulta
  router.get('/carregar-sessoes-chat', async (req, res) => {
    if (!req.session.autenticado) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }
  
    const usuarioId = req.session.autenticado.usuarioId;
  
    try {
        // Consulta modificada para retornar informações corretas
        const [sessions] = await pool.query(`
            SELECT DISTINCT
                c.ID_CONSULTAS as consultaId,
                u.NOME_USUARIO as psicologoNome,
                COALESCE(
                    (SELECT MENSAGEM_CHAT 
                    FROM chat 
                    WHERE ID_CONSULTA = c.ID_CONSULTAS 
                    ORDER BY DATA_HORA_CHAT DESC 
                    LIMIT 1), 
                    'Iniciar conversa'
                ) as ultimaMensagem,
                DATE_FORMAT(c.DATAHORA_CONSULTAS, '%d/%m/%Y %H:%i') as ultimaAtualizacao
            FROM consultas c
            JOIN usuario u ON (
                CASE 
                    WHEN c.USUARIO_ID_USUARIO = ? THEN c.PSICOLOGO_ID_PSICOLOGO = u.ID_USUARIO
                    ELSE c.USUARIO_ID_USUARIO = u.ID_USUARIO
                END
            )
            WHERE 
                (c.USUARIO_ID_USUARIO = ? OR c.PSICOLOGO_ID_PSICOLOGO = ?)
                AND c.STATUS_CONSULTAS = 'Agendada'
        `, [usuarioId, usuarioId, usuarioId]);
  
        res.json(sessions || []);
    } catch (error) {
        console.error('Erro ao carregar sessões de chat:', error);
        res.status(500).json({ error: 'Erro ao carregar sessões de chat' });
    }
  });
  
  // Correção da inicialização do WebSocket
  // 1. Primeiro, corrija a rota para sessão do chat
  router.get('/sessao-chat/:consultaId', checkAuthenticatedUser, async (req, res) => {
    try {
        const consultaId = req.params.consultaId;
        const usuarioId = req.session.autenticado.usuarioId;
  
        // Verificar se o usuário tem acesso a esta consulta
        const [consulta] = await pool.query(`
            SELECT 
                c.*,
                u.NOME_USUARIO as nome_psicologo,
                u.ID_USUARIO as id_psicologo
            FROM consultas c
            JOIN usuario u ON u.ID_USUARIO = c.PSICOLOGO_ID_PSICOLOGO
            WHERE c.ID_CONSULTAS = ?
            AND (c.USUARIO_ID_USUARIO = ? OR c.PSICOLOGO_ID_PSICOLOGO = ?)
        `, [consultaId, usuarioId, usuarioId]);
  
        if (consulta.length === 0) {
            return res.status(403).json({ error: 'Acesso não autorizado a esta consulta' });
        }
  
        // Buscar mensagens da consulta
        const [mensagens] = await pool.query(`
            SELECT 
                c.*,
                u.NOME_USUARIO as nome_remetente
            FROM chat c
            JOIN usuario u ON u.ID_USUARIO = c.ID_REMETENTE
            WHERE c.ID_CONSULTA = ?
            ORDER BY c.DATA_HORA_CHAT ASC
        `, [consultaId]);
  
        // Preparar dados do psicólogo
        const dadosPsicologo = {
            id: consulta[0].id_psicologo,
            nome: consulta[0].nome_psicologo,
        };
  
        res.json({
            psicologo: dadosPsicologo,
            mensagens: mensagens.map(msg => ({
                id: msg.ID_CHAT,
                conteudo: msg.MENSAGEM_CHAT,
                dataCriacao: msg.DATA_HORA_CHAT,
                remetenteId: msg.ID_REMETENTE,
                nomeRemetente: msg.nome_remetente
            }))
        });
  
    } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        res.status(500).json({ error: 'Erro ao carregar dados da sessão' });
    }
  });
  function verificarAdmin(req, res, next) {
    if (req.session.autenticado && req.session.autenticado.tipo === 'Administrador') {
      return next(); // Usuário é administrador
    }
    res.status(403).send("Acesso negado. Apenas administradores podem acessar esta página.");
  }
  router.get('/statistics', async (req, res) => {
    try {
      // Total de consultas por status
      const consultasStats = await pool.query(`
        SELECT 
          COUNT(CASE WHEN STATUS_CONSULTAS = 'Realizada' THEN 1 END) as realizadas,
          COUNT(CASE WHEN STATUS_CONSULTAS = 'Agendada' THEN 1 END) as agendadas,
          COUNT(CASE WHEN STATUS_CONSULTAS = 'Cancelada' THEN 1 END) as canceladas,
          COUNT(*) as total
        FROM consultas
        WHERE DATAHORA_CONSULTAS >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);
  
      // Média de valor das consultas por psicólogo
      const mediaValores = await pool.query(`
        SELECT 
          p.ID_PSICOLOGO,
          u.NOME_USUARIO,
          AVG(c.VALOR_CONSULTA) as media_valor,
          COUNT(c.ID_CONSULTAS) as total_consultas
        FROM psicologo p
        JOIN usuario u ON p.ID_PSICOLOGO = u.ID_USUARIO
        JOIN consultas c ON p.ID_PSICOLOGO = c.PSICOLOGO_ID_PSICOLOGO
        GROUP BY p.ID_PSICOLOGO
      `);
  
      res.json({
        consultasStats: consultasStats[0],
        mediaValores
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  // Rota para banir/desbanir usuário
  router.post('/dashboard-monitoramento/banir', checkAuthenticatedUser, verificarAdmin, async (req, res) => {
    const { idUsuario, acao } = req.body;
  
    try {
      const status = acao === 'banir' ? 'inativo' : 'ativo';
      await pool.query(
        `UPDATE usuario SET DIFERENCIACAO_USUARIO = ? WHERE ID_USUARIO = ?`,
        [status === 'inativo' ? 'Banido' : 'Comum', idUsuario]
      );
      res.redirect('/dashboard-monitoramento');
    } catch (error) {
      console.error("Erro ao banir/desbanir usuário:", error);
      res.status(500).send("Erro ao atualizar status do usuário.");
    }
  });
  
  // Rota para monitorar sessões e engajamento
  
  router.get('/chat', async (req, res) => {
    if (!req.session.autenticado) {
        return res.redirect('/loginpacientes');
    }
  
    try {
        // Debug para verificar os dados da sessão
        console.log('Dados da sessão:', req.session.autenticado);
  
        // Verifica se temos o ID do usuário
        if (!req.session.autenticado.usuarioId) {
            throw new Error('ID do usuário não encontrado na sessão');
        }
  
        //const contacts = await Chat.getUserContacts(req.session.autenticado.usuarioId);
        //const activeConsulta = await Chat.getActiveConsulta(req.session.autenticado.usuarioId);
        const contacts = [];
        const user = req.session.autenticado; // Supondo que você tenha um usuário autenticado
        const isPsychologistOrAdmin = user && (user.tipo === 'Psicologo' || user.tipo === 'Admin');
  
        res.render('pages/index', {
            pagina:'chat',
            user: req.session.autenticado,
            autenticado: req.session.autenticado,
            usuarioId: req.session.autenticado.usuarioId,
            usuarioNome: req.session.autenticado.usuarioNome,
            isPsychologistOrAdmin: isPsychologistOrAdmin,
            contacts: contacts || [] // Garante que sempre teremos um array
            //activeConsulta: activeConsulta
          });
    } catch (error) {
        console.error('Erro completo:', error);
        res.render('pages/index', {
            user: req.session.autenticado,
            pagina:'chat',
            isPsychologistOrAdmin: isPsychologistOrAdmin,
            contacts: [],
            error: 'Erro ao carregar contatos'
        });
    }
  });
  router.get('/consultas', async (req, res) => {
    try {
      const consultas = await pool.query(`
        SELECT 
          c.*,
          u.NOME_USUARIO as nome_paciente,
          psi.NOME_USUARIO as nome_psicologo,
          psi.CRP_USUARIO
        FROM consultas c
        JOIN usuario u ON c.USUARIO_ID_USUARIO = u.ID_USUARIO
        JOIN usuario psi ON c.PSICOLOGO_ID_PSICOLOGO = psi.ID_USUARIO
        WHERE c.DATAHORA_CONSULTAS >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY c.DATAHORA_CONSULTAS DESC
      `);
      res.json(consultas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Rota principal do dashboard
router.get('/dashboard-monitoramento', checkAuthenticatedUser, verificarAdmin, async (req, res) => {
    try {
      // Estatísticas gerais
      const stats = await getStats();
      
      // Consultas recentes
      const consultas = await getConsultasRecentes();
      
      // Denúncias recentes
      const denuncias = await getDenunciasRecentes();
  
      res.render('pages/index', { pagina: "dashboard-monitoramento", stats, consultas, denuncias });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      res.status(500).send('Erro ao carregar dashboard');
    }
  });
  
  // Função para obter estatísticas
  async function getStats() {
    const hoje = new Date().toISOString().split('T')[0];
    
    const [stats] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN DATE(DATAHORA_CONSULTAS) = ? THEN 1 END) as consultasHoje,
        COUNT(CASE WHEN STATUS_CONSULTAS = 'Realizada' THEN 1 END) * 100.0 / COUNT(*) as taxaComparecimento,
        COUNT(CASE WHEN STATUS_CONSULTAS = 'Cancelada' THEN 1 END) as consultasCanceladas,
        AVG(VALOR_CONSULTA) as mediaValorConsulta
      FROM consultas
      WHERE DATAHORA_CONSULTAS >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [hoje]);
  
    return stats[0];
  }
  
  // Função para obter consultas recentes
  async function getConsultasRecentes() {
    const [consultas] = await pool.query(`
      SELECT 
        c.*,
        u.NOME_USUARIO,
        (SELECT NOME_USUARIO FROM usuario WHERE ID_USUARIO = c.PSICOLOGO_ID_PSICOLOGO) as NOME_PSICOLOGO
      FROM consultas c
      JOIN usuario u ON c.USUARIO_ID_USUARIO = u.ID_USUARIO
      ORDER BY c.DATAHORA_CONSULTAS DESC
      LIMIT 10
    `);
  
    return consultas;
  }
  
  // Função para obter denúncias recentes
  async function getDenunciasRecentes() {
    const [denuncias] = await pool.query(`
      SELECT 
        d.*,
        u.NOME_USUARIO as NOME_DENUNCIANTE
      FROM denuncia d
      JOIN usuario u ON d.ID_USUARIO = u.ID_USUARIO
      ORDER BY d.DATA_DENUNCIA DESC
      LIMIT 10
    `);
  
    return denuncias;
  }
  
  // Rota para banir usuário
  router.post('/api/banir-usuario', async (req, res) => {
    const { idUsuario } = req.body;
    
    try {
      await pool.query(`
        UPDATE usuario 
        SET DIFERENCIACAO_USUARIO = 'Banido'
        WHERE ID_USUARIO = ?
      `, [idUsuario]);
  
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao banir usuário:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao banir usuário' 
      });
    }
  });
  
  rotasEstaticas.forEach((pagina) => {
    router.get(`/${pagina}`, (req, res) => {
      res.render('pages/index', { pagina, autenticado: null });
    });
  });
  
  
// Renderiza a página de calendário
router.get("/calendario", checkAuthenticatedUser, (req, res) => {
    res.render("pages/index", {
      pagina: "calendario",
      autenticado: req.session.autenticado,
    });
  });
  
  // Rota para salvar um evento (POST)
  router.post("/calendario/salvar", checkAuthenticatedUser, async (req, res) => {
    try {
      const resultado = await salvarEvento(req, false);
      if (resultado.success) {
        return res.status(201).json(resultado);
      } else {
        return res.status(400).json(resultado);
      }
    } catch (error) {
      console.error("Erro na rota de salvar evento:", error);
      if (!res.headersSent) {
        return res.status(500).json({ success: false, message: "Erro interno do servidor." });
      }
    }
  });
  
  // Rota para editar um evento (PUT)
  router.put("/calendario/editar/:id", checkAuthenticatedUser, async (req, res) => {
    try {
      const resultado = await salvarEvento(req, true);
      if (resultado.success) {
        return res.status(200).json(resultado);
      } else {
        return res.status(400).json(resultado);
      }
    } catch (error) {
      console.error("Erro ao editar evento:", error);
      res.status(500).json({ success: false, message: "Erro interno do servidor." });
    }
  });
  
  // Rota para listar todos os eventos do usuário (GET)
  router.get("/calendario/listar-sessao", checkAuthenticatedUser, async (req, res) => {
    try {
      const usuarioId = req.session.autenticado.usuarioId;
      const eventos = await listarEventosUsuario(usuarioId);
      res.status(200).json(eventos);
    } catch (error) {
      console.error("Erro ao listar eventos:", error);
      res.status(500).json({ message: "Erro ao listar eventos." });
    }
  });  

// ROTA DE EXCLUSÃO DOS EVENTOS
router.delete("/calendario/excluir/:id", excluirEvento);

// Renderiza a página do Dashboard Psicólogos
router.get("/dashboardpsicologo", checkAuthenticatedPsicologo, (req, res) => {
    res.render("pages/index", {
      pagina: "dashboardpsicologo",
      autenticado: req.session.autenticado,
    });
  });

  // Rota para obter os dias disponíveis
router.get('/dashboardpsicologo/dias-disponiveis', getDiasDisponiveis);

// Rota para marcar um dia como disponível
router.post('/dashboardpsicologo/marcar-disponivel', marcarDisponivel);

// Rota para remover um dia disponível
router.post('/dashboardpsicologo/remover-disponiveis', removerDisponiveis);

// Rota para editar perfil de usuário
const PsicologoController = require('../controllers/editarPerfilController');
router.post('/editeseuperfilpsic', PsicologoController.editarPerfil);
router.get('/editeseuperfilpsic', PsicologoController.editarPerfilPage);

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir a sessão:', err);
            res.status(500).redirect('/');
        } else {
            res.clearCookie('user_session');
            res.redirect('/');
        }
    });
});

module.exports = router;
