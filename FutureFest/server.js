// npm install mongodb
//npm install method-override

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
const collectionName ='events'

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/PaginaInicial.html');
})

app.get('/Login',(req,res)=>{
    res.sendFile(__dirname + '/PaginaLogin.html');
})

app.get('/Sobre Nós',(req,res)=>{
    res.sendFile(__diraname + '/SobreNos.html')
})

app.get('/Orçamentos',(req,res)=>{
    res.sendFile(__diraname + '/Orçamentos.html')
})

app.get('/Nossa solução',(req,res)=>{
    res.sendFile(__diraname + '/NossaSolução.html')
})

app.post('/Login', async (res,req)=>{
    const novoUsuario = req.body;

    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const reult = await collection.insertOne(novoUsuario);
        console.log('Usuário inserido com sucesso:', result.insertedId);

        res.redirect('/');
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