const express = require('express');
const mongoClient = require('mongodb').mongoClient;
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'Comi9Tijolos',
    resave: false,
    saveUnintialized : true,
}));

const urlMongo = 'mongodb://127.0.0.1:27017';
const nomeBanco = 'sistemaLogin';

app.get('registro', (req,res) => {
    res.sendFile(__dirname + '/views/registro.html');
});

app.post('/registro', async (res,req)=>{
    
});

$('#myModal').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})