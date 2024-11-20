require('dotenv').config();
require('dotenv').config();

require('dotenv').config();  

const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session');  

const app = express();
const port = 3000;

app.use(cors());  

// Configurando sessão
app.use(session({
    secret: 'secret-key',  
    resave: false,         
    saveUninitialized: true,  
    cookie: { secure: false }
}));

// Servir arquivos estáticos (CSS, JS, imagens, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Configuração para permitir leitura de dados JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função para criar a conexão com o banco de dados
async function createDbConnection() {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
}

// Conectar ao banco de dados
async function connectToDb() {
    const connection = await createDbConnection();
    // console.log('Conectado ao MySQL');
    return connection;
}

// Rota para servir a página de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para adivionar login
app.post('/api/cadastro', async (req, res) => {
    const { name, surname, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const connection = await connectToDb();

    try {
        const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await connection.query(
            'INSERT INTO users (name, surname, email, password, phone) VALUES (?, ?, ?, ?, ?)', 
            [name, surname, email, hashedPassword, phone]
        );

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: result.insertId });
    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    } finally {
        connection.end();
    }
});

// Rota para retornar a lista de usuários
app.get('/api/users', async (req, res) => {
    const connection = await connectToDb();

    
    try {
        const [rows] = await connection.query('SELECT id, name, email FROM users');
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    } finally {
        connection.end();
    }
});

// Rota para servir a página do usuário
app.get('/usuario', (req, res) => {
    if (!req.session.userId) {  
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'usuario.html'));
});

// Rota para login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const connection = await connectToDb();

    try {
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);  

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha inválida' });
        }

        req.session.userId = user.id;
        req.session.userName = user.name;

        return res.json({ message: 'Login bem-sucedido', userId: user.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao processar o login' });
    } finally {
        connection.end();
    }
});

// Rota para logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao fazer logout' });
        }
        res.json({ message: 'Logout bem-sucedido' });
    });
});

// Rota para buscar as listas do usuário
app.get('/api/listas', async (req, res) => {
    const { userId } = req.query;  

    if (!userId) {
        return res.status(400).json({ message: 'userId não fornecido' });
    }

    const connection = await connectToDb();

    try {
        const [result] = await connection.query(
            `SELECT listas.id_lista, listas.nome_lista, users.name
             FROM listas
             INNER JOIN users ON listas.id_usuario = users.id
             WHERE users.id = ?`, 
            [userId]
        );

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar listas', error: err });
    } finally {
        connection.end();
    }
});

// Inicializando o servidor
app.listen(port, async () => {
    const connection = await connectToDb();
    console.log(`Servidor rodando em http://localhost:${port}`);
});

// Rota para verificar a sessão do usuário
app.get('/api/session', (req, res) => {
    if (req.session.userId) {
        res.json({
            isLoggedIn: true,
            userId: req.session.userId,
            userName: req.session.userName
        });
    } else {
        res.json({ isLoggedIn: false });
    }
});

// Rota para adicionar uma nova lista
app.post('/api/listas', async (req, res) => {
    const { nome_lista, userId } = req.body;

    if (!nome_lista || !userId) {
        return res.status(400).json({ message: 'Nome da lista e ID do usuário são obrigatórios.' });
    }

    const connection = await connectToDb();

    try {
        const [result] = await connection.query(
            'INSERT INTO listas (nome_lista, id_usuario) VALUES (?, ?)', 
            [nome_lista, userId]
        );

        res.status(201).json({ message: 'Lista adicionada com sucesso!', id_lista: result.insertId });
    } catch (err) {
        console.error('Erro ao adicionar lista:', err);
        res.status(500).json({ message: 'Erro ao adicionar lista', error: err });
    } finally {
        connection.end();
    }
});

// Rota para adicionar uma tarefa
app.post('/api/tarefa', async (req, res) => {
    const { nome_tarefa, descricao, data_inicio, data_fim, prioridade, responsavel, id_lista } = req.body;

    if (!nome_tarefa || !descricao || !id_lista) {
        return res.status(400).json({ message: 'Nome da tarefa, descrição e ID da lista são obrigatórios.' });
    }

    const connection = await connectToDb();

    try {
        const [result] = await connection.query(
            'INSERT INTO tarefas (nome_tarefa, descricao, data_inicio, data_fim, prioridade, responsavel, id_lista) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [nome_tarefa, descricao, data_inicio, data_fim, prioridade, responsavel, id_lista]
        );

        res.status(201).json({ message: 'Tarefa adicionada com sucesso!', id_tarefa: result.insertId });
    } catch (err) {
        console.error('Erro ao adicionar tarefa:', err);
        res.status(500).json({ message: 'Erro ao adicionar tarefa', error: err });
    } finally {
        connection.end();
    }
});

// Rota para buscar as tarefas de uma lista
app.get('/api/tarefas', async (req, res) => {
    const { listId } = req.query;

    if (!listId) {
        return res.status(400).json({ message: 'listId não fornecido' });
    }

    const connection = await connectToDb();

    try {
        const [result] = await connection.query(
            'SELECT * FROM tarefas WHERE id_lista = ?', 
            [listId]
        );

        res.json(result);
    } catch (err) {
        console.error('Erro ao buscar tarefas:', err);
        res.status(500).json({ message: 'Erro ao buscar tarefas', error: err });
    } finally {
        connection.end();
    }
});