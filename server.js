require('dotenv').config();

const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Configuração para permitir leitura de dados JSON
app.use(express.json());

// Servir arquivos estáticos (ex. index.html) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao MySQL
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Conexão ao banco de dados
connection.connect(err => {
    if (err) {
        console.log('Erro ao conectar ao banco de dados: ' + err.stack);
    } else {
        console.log('Conectado ao MySQL', connection.threadId);
    }
});

// Definindo uma rota simples
app.get('/', (req, res) => {
    // Enviar o arquivo index.html ao acessar a raiz
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Definir uma rota para buscar usuários
app.get('/users', (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).send('Erro ao buscar usuários');
        } else {
            res.json(results);  // Enviar resposta com os dados no formato JSON
        }
    });
});

// Definindo a porta em que o servidor vai rodar
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});



// Usando Promises com async/await
// async function runQuery() {
//     try {
//       // Conecta ao banco de dados
//       await connection.promise().connect();
  
//       // Realiza uma consulta
//       const [rows, fields] = await connection.promise().query('SELECT * FROM sua_tabela');
//       console.log(rows); // Exibe os resultados
  
//     } catch (err) {
//       console.error('Erro ao consultar:', err.stack);
//     } finally {
//       // Fecha a conexão
//       await connection.promise().end();
//     }
//   }
  
//   runQuery();