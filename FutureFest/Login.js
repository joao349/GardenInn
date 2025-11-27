const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'Comi9Tijolos',
    resave: false,
    saveUninitialized: true,
}));

const urlMongo = "mongodb+srv://j83371339_db_user:<CP6D743.svTFgYQ>@cluster0.ykf508g.mongodb.net/?appName=Cluster0";
const nomeBanco = 'sistemaLogin';

app.get('/registro', (req,res) => {
    res.sendFile(__dirname + '/views/registro.html');
});

app.post('/registro', async (req,res)=>{
    
});

$('#myModal').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})