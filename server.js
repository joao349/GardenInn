const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const bcrypt = require('bcrypt');


const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'Comi9Tijolos',
    resave: false,
    saveUninitialized: true,
}));

// ----------------------------------------------------
// 🔗 Conexão com MongoDB
// ----------------------------------------------------
const url = "mongodb+srv://j83371339_db_user:CP6D743.svTFgYQ@cluster0.ykf508g.mongodb.net/";
const client = new MongoClient(url);
const nomeBanco = "sistemaLogin";

// ----------------------------------------------------
// 📌 Rota para servir seus arquivos front-end
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/PaginaInicial.html');
});


// ----------------------------------------------------
// 📌 ROTA DE REGISTRO (modal)
// ----------------------------------------------------
app.post("/registro", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(nomeBanco);
        const usuarios = db.collection("usuarios");

        const { PrimeiroNome, SegundoNome, email, telefone, senha, ConfirmarSenha } = req.body;

        if (senha !== ConfirmarSenha) {
            return res.json({ ok: false, msg: "As senhas não coincidem." });
        }

        // Verificar se o email já existe
        const jaExiste = await usuarios.findOne({ email: email });
        if (jaExiste) {
            return res.json({ ok: false, msg: "Este email já está registrado." });
        }

        // Criptografar senha
        const hash = await bcrypt.hash(senha, 10);

        // Inserir no banco
        await usuarios.insertOne({
            PrimeiroNome,
            SegundoNome,
            email,
            telefone,
            senha: hash
        });

        return res.json({ ok: true, msg: "Usuário registrado com sucesso!" });

    } catch (err) {
        console.error("Erro ao registrar:", err);
        res.json({ ok: false, msg: "Erro interno no servidor." });
    }
});


// ----------------------------------------------------
// 📌 ROTA DE LOGIN (modal)
// ----------------------------------------------------
app.post("/login", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(nomeBanco);
        const usuarios = db.collection("usuarios");

        const { email, senha } = req.body;

        const user = await usuarios.findOne({ email });

        if (!user) {
            return res.json({ ok: false, msg: "Usuário ou senha incorretos." });
        }

        // Verifica hash
        const senhaCorreta = await bcrypt.compare(senha, user.senha);

        if (!senhaCorreta) {
            return res.json({ ok: false, msg: "Usuário ou senha incorretos." });
        }

        // Salva sessão
        req.session.user = {
            id: user._id,
            nome: user.PrimeiroNome
        };

        return res.json({ ok: true, msg: "Login bem-sucedido!" });

    } catch (err) {
        console.error("Erro ao fazer login:", err);
        res.json({ ok: false, msg: "Erro interno no servidor." });
    }
});

// Rota para receber o formulário de orçamento

app.post("/orcamento", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(nomeBanco); // mesmo banco que você usa
        const orcamentos = db.collection("orcamentos"); // coleção nova para os orçamentos

        const { tipoAmbiente, dimensoes, local, jardim, descricao } = req.body;

        // Inserir dados no banco
        await orcamentos.insertOne({
            tipoAmbiente,
            dimensoes,
            local,
            jardim,
            descricao,
            data: new Date()
        });

        return res.json({ ok: true, msg: "Dados enviados com sucesso! Em breve entraremos em contato para fornecer o seu orçamento." });
    } catch (err) {
        console.error("Erro ao enviar orçamento:", err);
        res.json({ ok: false, msg: "Erro interno no servidor." });
    }
});

// ----------------------------------------------------
// ✔ Iniciar servidor
// ----------------------------------------------------
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
