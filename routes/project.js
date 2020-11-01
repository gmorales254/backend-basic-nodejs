'use strict'

var express = require('express');
var ProjectController = require('../controllers/project');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddelware = multipart({ uploadDir: './uploads' })
router.get('/home', ProjectController.home);
router.post('/test', ProjectController.test);
router.post('/save-project', ProjectController.saveProject);
router.get('/project/:id?', ProjectController.getProject);
router.get('/projects', ProjectController.getAllProjects);
router.put('/project/:id', ProjectController.updateProject);
router.delete('/project/:id', ProjectController.deleteProject);
router.post('/upload-image/:id', multipartMiddelware, ProjectController.uploadImage);
router.post('/dialerCall/:token', ProjectController.dialerCall);
module.exports = router;