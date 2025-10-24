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

 
app.post('/InserirUsuario', async (res,req)=>{
    const novoUsuario = req.body;

    const client = new MongoClient(url);

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

//IA abaixo 

import {
    GoogleGenerativeAI, // Classe para interagir com o Google Generative AI
    HarmCategory,       // Enum para categorias de conteúdo prejudicial
    HarmBlockThreshold  // Enum para os níveis de bloqueio de conteúdo prejudicial
} from "@google/generative-ai";

import chalk from "chalk";
import ora from "ora";
import prompt from 'prompt-sync';

const promptSync = prompt();
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = "AIzaSyCrIMv-WrvE_6XkWVNKzOXzJEJxlNEHiKo"

// Configuração de geração para o modelo, ajustando parâmetros como temperatura e tokens de saída
const GENERATION_CONFIG = {
    temperature: 1, //Define o quão criativa é a resposta da IA, de 0 a 1
    topK: 1, // Controla o número de palavras candidatas consideradas durante a geração
    topP: 1, // Controla a probabilidade cumulativa das palavras candidatas consideradas
    maxOutputTokens: 2048, // Define o número máximo de tokens (palavras) na resposta gerada
};

// Configuração de segurança para filtrar conteúdo prejudicial com diferentes categorias e limiares
const SAFETY_SETTINGS = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT, // Categoria de conteúdo prejudicial: assédio
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE // Limitar para bloquear conteúdo com médio nível de gravidade e acima
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, // Categoria de conteúdo prejudicial: discurso de ódio
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE // Limitar para bloquear conteúdo com médio nível de gravidade e acima
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, // Categoria de conteúdo prejudicial: conteúdo sexual explícito
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE // Limitar para bloquear conteúdo com médio nível de gravidade e acima
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, // Categoria de conteúdo prejudicial: conteúdo perigoso
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE // Limitar para bloquear conteúdo com médio nível de gravidade e acima
    },
];