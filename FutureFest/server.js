// npm install mongodb
//npm install method-override
/*
    _id: 1,
    PrimeironNome: "Teste1",
    SegundoNome: "Robo2",
    Telefone: "(55) 11 0000-97486",
    Senha: "15869",
*/


const express = require('express');
const {MongoClient,ObjectID} = require('mongodb');
const app = express();
const port = 3000;
const methodOverride = require('method-override');

//Middleware para processar dados JSON e formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//configuração URL de conexão com o MongoDB
const url = 'mongodb://localhost:27017/';
const dbName = 'futurefest';
const collectionName ='resgistrousuarios'

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/PaginaInicial.html');
})

app.get('/Login',(req,res)=>{
    res.sendFile(__dirname + '/PaginaLogin.html');
    console.log('pagina de login acessada')
})

app.post('/Login', async(req,res)=>{
    const cliente = new MongoClient(url);

    try{
        await cliente.connect();
        const db = cliente.db(dbName);
        const collection = db.collection(collectionName);

        const usuario = await collection.findOne({email: req.body.email});
        if(usuario && await bcrypt.compare(req.body.senha, usuario.senha)){
            req.session.usuario = req.body.usuario;
            res.redirect('/PaginaLogada.html');
        }
        else{
            res.status(401).send('Email ou senha inválidos');
        }
    }
    catch(err){
        console.error('Erro ao fazer login:', err);
        res.status(500).send('Erro ao fazer login');
    }
    finally{
        cliente.close();
    }
});

function protegerRota(req,res,proximo){
    if(req.session.usuario){
        proximo();
    }else{
        res.redirect('/Login');
    }
}

app.get('/PaginaLogada.html',protegerRota,(req,res)=>{
    res.sendFile(__dirname + '/PaginaLogada.html');
});

 
app.post('/InserirUsuario', async (req,res)=>{
    const novoUsuario = req.body;

    const client = new MongoClient(url);
    console.log(req.body)
    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const usuarioExistente = await collection.findOne({email: novoUsuario.email});

        if(usuarioExistente){
            return res.status(400).send('Usuário com este email já existe');
        }
        else{
            const senhaCriptografada = await bcrypt.hash(novoUsuario.senha,10);

            await collection.insertOne({
                usuario: req.body.usuario,
                senha: senhaCriptografada,
            });
        }
    }
    catch(err){
        console.error('Erro ao inserir usuário:', err);
        res.status(500).send('Erro ao inserir usuário');
    }
    finally{
        client.close();
    }
});

app.listen(port, () => {
 console.log(`Servidor Node.js em execução em http://localhost:${port}`);
 });