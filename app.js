const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const pool = require('./config/pool_de_conexao'); // Conexão com o banco de dados
const router = require('./app/routes/router'); // Importação das rotas
const communityRoutes = require('./app/routes/router');
const postRoutes = require('./app/routes/router');
const commentRoutes = require('./app/routes/router');

require('dotenv').config(); // Carregar variáveis de ambiente
//const routerConsultas = require('./app/routes/consultas'); // Certifique-se de que o caminho está correto
//const routerPlanos = require('./app/routes/planos'); 

const app = express();
const server = http.createServer(app);
const port = 3000;

// **Configuração do trust proxy** (Render usa HTTPS por padrão)
app.set('trust proxy', 1);

// **Configuração do MySQLStore**
let sessionStore = new MySQLStore(
  {
      expiration: 1800000,  // 30 minutos
      checkExpirationInterval: 300000,  // Verifica sessões expiradas a cada 5 minutos
      endConnectionOnClose: true,  // Fecha conexões após o encerramento
  },
  pool
);
app.get('/chat', (req, res) => {
  const usuarioId = req.session?.userId || "defaultUserId"; // Substitua com a lógica correta
  res.render('partial/chat', { usuarioId });
});

app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
//app.use('/consultas', routerConsultas);
//app.use('/planos', routerPlanos);
// **Configuração do middleware de sessão**
app.use(
  session({
    key: 'user_session',
    secret: 'pudimcombolodecenoura',
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    },
  })
);

// **Middleware global para variáveis nas views**
app.use((req, res, next) => {
  const autenticado = req.session.autenticado || false;
  res.locals.autenticado = autenticado;
  res.locals.usuarioNome = autenticado ? autenticado.usuarioNome : null;
  next();
});

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// **Middleware para arquivos estáticos**
app.use(express.static(path.join(__dirname, 'app/public')));

// **Configuração da view engine EJS**
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// **Parsing do corpo das requisições**
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// **Configuração do Multer para upload de arquivos**
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Pasta onde os arquivos serão salvos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);  // Nome único para o arquivo
  },
});


const upload = multer({ storage });

// **Rota de upload de arquivos**
app.post('/api/upload', upload.single('arquivo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const { consultaId, remetenteId } = req.body;

  try {
    await pool.query(
      `INSERT INTO chat (ID_CONSULTA, ID_REMETENTE, DOCUMENTOS_CHAT, DATA_HORA_CHAT) 
       VALUES (?, ?, ?, NOW())`,
      [consultaId, remetenteId, req.file.filename]
    );

    const connections = activeConnections.get(consultaId) || new Set();
    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'novo_arquivo',
          consultaId,
          remetenteId,
          arquivo: req.file.filename,
        }));
      }
    });

    res.status(200).json({
      success: true,
      arquivo: req.file.filename,
      path: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    res.status(500).json({ error: 'Erro ao salvar arquivo' });
  }
});
app.use((req, res, next) => {
  if (req.session && req.session.message) {
    res.locals.message = req.session.message; // Transfere para o escopo local das views
    delete req.session.message; // Remove para evitar mensagens persistentes
  } else {
    res.locals.message = null; // Define como nulo se não existir
  }
  next();
});
// **Servir arquivos da pasta 'uploads'**
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// **Importação e uso das rotas**
app.use('/', router);

// **Configuração do WebSocket**
const wss = new WebSocket.Server({ server });
const activeConnections = new Map();

// **Lidar com novas conexões WebSocket**
wss.on('connection', (ws) => {
  console.log('Nova conexão WebSocket estabelecida');
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Mensagem recebida:', data);

      if (data.type === 'join') {
        if (!activeConnections.has(data.consultaId)) {
          activeConnections.set(data.consultaId, new Set());
        }
        activeConnections.get(data.consultaId).add(ws);
      } else if (data.type === 'nova_mensagem') {
        const connections = activeConnections.get(data.consultaId) || new Set();
        connections.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'nova_mensagem',
              consultaId: data.consultaId,
              mensagem: data.mensagem,
            }));
          }
        });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });

  ws.on('close', () => {
    activeConnections.forEach((conjunto, consultaId) => {
      conjunto.delete(ws);
      if (conjunto.size === 0) {
        activeConnections.delete(consultaId);
      }
    });
    console.log('Conexão WebSocket fechada');
  });
});

// **Verificar e encerrar conexões inativas a cada 30 segundos**
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// **Inicializar o servidor**
server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}\nhttp://localhost:${port}`);
});
