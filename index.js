'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT;
mongoose.Promise = global.Promise;


mongoose.connect("mongodb+srv://gmorales:Metallica159@cluster0.mciqz.mongodb.net/portafolio?retryWrites=true&w=majority")
    .then(() => {
        console.log('Conexion con exito');
        //creacion del servidor
        app.listen(port, () => {
            console.log(`corriendo en localhost:${port}`);
        })
    }).catch(err => {
        console.log('error: ' + err);
    });

