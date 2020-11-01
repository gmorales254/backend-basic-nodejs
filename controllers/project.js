'use strict'

var Project = require('../models/project');
var axios = require('axios');
var fs = require('fs');
var qs = require('qs');

let controller = {
    home: function (req, res) {
        return res.status(200).send({
            message: "soy la home"
        });
    },
    test: function (req, res) {
        return res.status(200).send({
            message: "soy la test"
        });
    },
    saveProject: function (req, res) {
        let project = new Project();
        const { name, description, category, year, langs, image } = req.body;
        project.name = name;
        project.description = description;
        project.category = category;
        project.year = year;
        project.langs = langs;
        project.image = image;
        project.save((err, projectStored) => {
            if (err) return res.status(400).send({ message: "error" });
            if (!projectStored) return res.status(404).send({ message: "no se pudo guardar el objeto" });

            return res.status(200).send({ project: projectStored });
        });
    },

    getProject: function (req, res) {
        let projectid = req.params.id;
        Project.findById(projectid, (err, projects) => {
            if (err) return res.status(400).send({ message: "Error al devolver los datos" });
            if (!projects) return res.status(404).send({ message: "Proyecto no existe" });

            return res.status(200).send({
                projects
            });
        });
    },

    getAllProjects: function (req, res) {
        Project.find({}).exec((err, projects) => {
            if (err) return res.status(400).send({ message: "Error al devolver los datos" });
            if (!projects) return res.status(404).send({ message: "No hay proyectos para mostrar" });

            return res.status(200).send({ projects })
        });
    },

    updateProject: function (req, res) {
        let projectid = req.params.id;
        let update = req.body;

        Project.findByIdAndUpdate(projectid, update, (err, projectUpdated) => {
            if (err) return res.status(400).send({ message: "Error al actualizar proyecto" });
            if (!projectUpdated) return res.status(404).send({ message: "No se encontro proyecto" });

            return res.status(200).send({ project: projectUpdated });
        });

    },

    deleteProject: function (req, res) {
        let projectid = req.params.id;
        Project.findByIdAndDelete(projectid, (err, projectRemoved) => {
            if (err) return res.status(400).send({ message: "Error al actualizar proyecto" });
            if (!projectRemoved) return res.status(404).send({ message: "No se encontro proyecto" });

            return res.status(200).send({ project: projectRemoved });

        });

    },

    uploadImage: function (req, res) {
        var projectid = req.params.id;
        var fileName = 'Imagen no subida';

        if (req.files) {
            var filepath = req.files.image.path;
            var filesplit = filepath.split("\\");
            var filename = filesplit[1];
            var extsplit = fileName.split('\.');
            var fileext = extsplit[1];

            if (fileext == "png" || fileext == "jpg" || fileext == "jpeg" || fileext == "gif") {

                Project.findByIdAndUpdate(projectid, { image: filename }, (err, projectUpdated) => {
                    if (err) return res.status(400).send({ message: "Error al actualizar proyecto" });
                    if (!projectUpdated) return res.status(404).send({ message: "No se encontro proyecto" });

                    return res.status(200).send({ files: filename });

                });
            } else {
                fs.unlink(filepath, (err) => {
                    return res.status(400).send({ message: "la extencion no es valida" });
                });
            }


        } else {
            return res.status(400).send({
                message: "no se pudo subir la imagen"
            })
        }
    },

    dialerCall: async function (req, res) {
        const buff = Buffer.from(req.params.token, 'base64');
        const token = buff.toString('utf-8');
        //return token ? res.status(200).send({ result: token }) : res.status(400).send({ result: 'ERROR' });
        if (token.split(':')[0] === process.env.USERTOKEN && token.split(':')[1] === process.env.PASSTOKEN) {
            console.log('entre')
            let tokenito = await Login();
            let resp = await Dial(tokenito, req.body.info, req.body.phone, req.body.dialer);
            console.log(resp);
            await CloseSession(tokenito);
            return res.status(200).send({ result: resp != false ? "OK" : "BAD" });

        } else {
            return res.status(400).send({
                result: "check your token"
            });
        }


    }




};

async function Login() {

    let urlencoded = new URLSearchParams();
    urlencoded.append("user", process.env.USERTOKEN);
    urlencoded.append("password", process.env.PASSTOKEN);

    let respi = await axios.post(`https://${process.env.ENVUC}.ucontactcloud.com/Integra/resources/auth/UserLogin`,
        urlencoded,
        {
            headers:
            {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "Accept": "*/*"
            }
        });

    return respi ? respi.data[2] : false;


}

async function Dial(token, info, phone, dialer) {

    let par = new URLSearchParams();
    par.append("call", `{"calldate" : null, "campaign" : "${dialer}","destination": "${phone}","alternatives": "","agent" : "","data": "phone=${phone}:name=${info.name}:country=${info.country}:state=${info.state}:email=${info.email}:field1=How did you know? ${info.howdid}:field2=Want test? ${info.didyou}","source":"source","bulk" : false,"automatic" : true }`);

    let dialersent = await axios.post(`https://${process.env.ENVUC}.ucontactcloud.com/Integra/resources/Dialers/DialerTask`, par,
        {
            headers:
            {
                "Authorization": `Basic ${token}`,
                "Content-Type": "application/x-www-form-urlencoded ; charset=UTF-8",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                'Access-Control-Allow-Credentials': '*',
                "Accept": "*/*",
                "cache-control": "no-cache"
            }
        }
    ).then((response) => { console.log(response) })
        .catch((error) => { console.log(error) })

    console.log(dialersent.data);
}

async function CloseSession(token) {

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    myHeaders.append("Authorization", "Basic " + token);

    let urlencoded = new URLSearchParams();
    urlencoded.append("user", process.env.USERTOKEN);
    urlencoded.append("token", token);

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch(`https://${process.env.ENVUC}.ucontactcloud.com/Integra/resources/auth/EndSession`, requestOptions)
        .then(response => response.text())
        .then(result => {
            return (result === 1 ? true : false);
        })
        .catch(error => console.log('error', error));



}
module.exports = controller;