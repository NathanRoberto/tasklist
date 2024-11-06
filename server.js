const express = require('express');
const app = express();
const port = 3000;

// Configuração para permitir leitura de dados JSON
app.use(express.json());

// Definindo uma rota simples
app.get('/', (req, res) => {
    res.send('Bem-vindo ao meu projeto de faculdade!');
});

// Definindo a porta em que o servidor vai rodar
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

const mysql = require('mysql2');

// Conectar ao MySQL (substitua pelos seus dados de conexão)
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sua-senha',
    database: 'meu-banco'
});

connection.connect(err => {
    if (err) {
        console.log('Erro ao conectar ao banco de dados: ' + err);
    } else {
        console.log('Conectado ao MySQL');
    }
});

// Definir uma rota para buscar usuários
app.get('/users', (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).send('Erro ao buscar usuários');
        } else {
            res.json(results);
        }
    });
});
