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

async function runChat() {
    // Cria e inicia um spinner para indicar que o chat está sendo inicializado
    const spinner = ora('Inicializando chat...').start();

    try {
        // Cria uma instância da classe GoogleGenerativeAI com a chave da API
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Obtém o modelo generativo especificado usando o nome do modelo
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME
        });

        // Inicia uma sessão de chat com as configurações de geração e segurança definidas
        const chat = model.startChat({
            generationConfig: GENERATION_CONFIG,
            safetySettings: SAFETY_SETTINGS,
            history: [], // Inicializa o histórico do chat como vazio
        });

        // Para o spinner, pois a inicialização foi concluída
        spinner.stop();

        // Loop infinito para ler entradas do usuário e gerar respostas
        while (true) {
            // Lê a entrada do usuário, exibindo um prompt verde "Você: "
            const userInput = promptSync(chalk.green('Você: '));

            // Verifica se a entrada do usuário é 'exit' (ignora maiúsculas/minúsculas)
            if (userInput.toLowerCase() === 'exit') {
                // Exibe uma mensagem de despedida e encerra o processo
                console.log(chalk.yellow('Até breve!'));
                process.exit(0); // Encerra o processo com código de saída 0 (sucesso)
            }

            // Envia a mensagem do usuário para o chat e aguarda a resposta
            const result = await chat.sendMessage(userInput);

            // Verifica se houve um erro na resposta da IA
            if (result.error) {
                // Exibe uma mensagem de erro em vermelho
                console.error(chalk.red('AI Erro:'), result.error.message);
                continue; // Continua o loop para permitir novas entradas do usuário
            }

            // Obtém o texto da resposta da IA
            const response = result.response.text;
            // Exibe a resposta da IA em azul
            console.log(chalk.blue('AI:'), response);
        }
    } catch (error) {
        // Para o spinner se ocorrer um erro
        spinner.stop();
        // Exibe uma mensagem de erro em vermelho
        console.error(chalk.red('Erro encontrado:'), error.message);
        // Encerra o processo com código de saída 1 (erro)
        process.exit(1);
    }
}

// Chama a função runChat para iniciar o chat
runChat();

app.listen(port, () => {
 console.log(`Servidor Node.js em execução em http://localhost:${port}`);
 });