var express = require("express");
var router = express.Router();
const pool = require("../../config/pool_de_conexao");
const userPacientesController = require("../controllers/userPacientesController");
const {  recordAuthenticatedUser } = require("../models/autenticador_middleware");

// ROTA PARA HEADER
router.get('/header', (req, res) => {
  res.render('pages/index', { pagina: "header", autenticado: null });
});

// ROTA PARA HEADER UNLOGGED
router.get('/headerunlogged', (req, res) => {
  res.render('pages/index', { pagina: "headerunlogged", autenticado: null });
});

// ROTA PARA INTERESSES
router.get('/interesses', (req, res) => {
  res.render('pages/index', { pagina: "interesses", autenticado: null });
});

// ROTA PARA SOBRE NÓS
router.get('/sobrenos', (req, res) => {
  res.render('pages/index', { pagina: "sobrenos", autenticado: null });
});

// ROTA PARA CARROSEL DE TRANSTORNOS
router.get('/carroseltranstornos', (req, res) => {
  res.render('pages/index', { pagina: "carroseltranstornos", autenticado: null });
});

// ROTA PARA HOME LOGGED
router.get('/homelogged', (req, res) => {
  res.render('pages/index', { pagina: "homelogged", autenticado: null });
});

// ROTA PARA HOME
router.get('/', (req, res) => {
  res.render('pages/index', { pagina: "home", autenticado: null });
});

// ROTA PARA PRECISA DE AJUDA
router.get('/precisadeajuda', (req, res) => {
  res.render('pages/index', { pagina: "precisadeajuda", autenticado: null });
});

// CADASTRO MENOR
router.get('/cadastromenor', (req, res) => {
  res.render('pages/index', { pagina: "cadastromenor", autenticado: null });
});


// COMENTARIOS
router.get('/comentarios', (req, res) => {
  res.render('pages/index', { pagina: "comentarios", autenticado: null });
});

// RODAPE
router.get('/rodape', (req, res) => {
  res.render('pages/index', { pagina: "rodape", autenticado: null });
});

// CARROSEL TRANSTORNOS
router.get('/carroseltranstornos', (req, res) => {
  res.render('pages/index', { pagina: "carrosel-transtornos", autenticado: null });
});

// PASSO A PASSO
router.get('/passoapasso', (req, res) => {
  res.render('pages/index', { pagina: "passoapasso", autenticado: null });
});

// Edite seu Perfil
router.get('/editeseuperfil', (req, res) => {
  res.render('pages/index', { pagina: "editeseuperfil", autenticado: null });
});

// Perfil
router.get('/perfil', (req, res) => {
  res.render('pages/index', { pagina: "perfil", autenticado: null });
});

// Consultas
router.get('/consultas', (req, res) => {
  res.render('pages/index', { pagina: "consultas", autenticado: null });
});

// ATIVIDADE MENSAL
router.get('/atividademensal', (req, res) => {
  res.render('pages/index', { pagina: "atividademensal", autenticado: null });
});

// Calendario
router.get('/calendario', (req, res) => {
  res.render('pages/index', { pagina: "calendario", autenticado: null });
});

// Pop-Up Psicologos
router.get('/popuppsicologos', (req, res) => {
  res.render('pages/index', { pagina: "popuppsicologos", autenticado: null });
});


// CADASTRO PSICOLOGOS
router.get('/cadastropsicologos', (req, res) => {
  res.render('pages/index', { pagina: "cadastropsicologos", autenticado: null });
});

// CADASTRO PSICOLOGOS
router.get('/planos', (req, res) => {
  res.render('pages/index', { pagina: "planos", autenticado: null });
});

// CADASTRO PACIENTES
router.get('/cadastropacientes', (req, res) => {
  res.render('pages/index', {
    pagina: "cadastropacientes",
    autenticado: null,
    errorsList: null,
    valores: {
      username: "",
      userdate: "",
      userpassword: "",
      useremail: "",
      userdocuments: ""
    }
  });
});

router.post('/cadastropacientes', async (req, res) => {
  await userPacientesController.cadastrar(req, res);
});

// LOGIN PSICOLOGOS
router.get('/loginpsicologos', (req, res) => {
  res.render('pages/index', { pagina: "loginpsicologos", autenticado: null });
});

// LOGIN PACIENTES
router.get('/loginpacientes', (req, res) => {
  res.render('pages/index', { pagina: "loginpacientes", autenticado: null });
});

 router.post('/loginpacientes', recordAuthenticatedUser, async (req, res) => {
   await userPacientesController.logar(req, res);
 });

// LOGIN DEPENDENTES
router.get('/logindependentes', (req, res) => {
  res.render('pages/index', { pagina: "logindependentes", autenticado: null });
});

// CHAT
router.get('/chat', (req, res) => {
  res.render('pages/index', { pagina: "chat", autenticado: null });
});

// COMUNIDADE
router.get('/comunidade', (req, res) => {
  res.render('pages/index', { pagina: "comunidade", autenticado: null });
});

// Psicologos

router.get('/psicologos', (req, res) => {
  res.render('pages/index', { pagina: "psicologos", autenticado: null });
});

module.exports = router;
