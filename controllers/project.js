'use strict'

var Project = require('../models/project');
var fs = require('fs');

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
            var extsplit = filename.split('\.');
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
    }


};



module.exports = controller;