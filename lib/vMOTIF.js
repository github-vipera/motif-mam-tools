'use babel';

//import express from 'express'
var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');
var _ = require('lodash');
var jsonutil = require('jsonutil');
var express = allowUnsafeEval(() => require('express'));
var bodyParser =  allowUnsafeEval(() => require('body-parser'));
var expressApp = express();
expressApp.use(bodyParser.json());
var http = require('http').Server(expressApp);
var io ;

export default class vMOTIF {

  constructor(eventBus){
    this.eventBus = eventBus;
    this.schemaMap = {};
    this.socketList = [];
    this.httpSockets = [];
    this.jsonSchemas = {};
    console.log("vMOTIF created with EventBus=" + eventBus);
  }

  isRunning(){
    return http.listening;
  }

  initialize(){
  }

  registerSchema(schema){
    console.log("Registering schema...");
  }

  unregisterSchema(schema){
    console.log("Unregistering schema...");

  }

  walkSync(dir, filelist) {
    var that = this;
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(dir + '/' + file).isDirectory()) {
        filelist = that.walkSync(dir + '/' + file, filelist);
      }
      else {
        if (that.fileExtension(file)==="mam"){
          filelist.push(dir + '/' + file);
        }
      }
    });
    return filelist;
  }

  fileExtension(fileName){
    var parts = _.split(fileName, ".");
    if (parts && parts.length > 0){
      return parts[parts.length-1];
    }
  }

  start(){
    console.log("Starting...");
    var that=this;

    this.jsonSchemas = {};
    //Get the list of current project MAM files
    console.log("Loading project files...");
    var projectFolders = atom.project.getPaths();
    var fileList = this.walkSync(projectFolders[0]);
    for (i=0;i<fileList.length;i++){
      try {
        var jsonSchema = jsonutil.readFileSync(fileList[i]);
        this.jsonSchemas[jsonSchema.uri] = jsonSchema;
      } catch (e){
        console.log("Error loading file " + fileList[i] + ": " + e);
      }
    }

    expressApp.post('/json', function(request,res){
      console.log("MOTIF request "+ request.body);
      try {
        var dom = request.body.req.dom;
        var app = request.body.req.app;
        var srv = request.body.req.srv;
        var op = request.body.req.op;
        var uri = "/" + dom + "/" + app + "/" + srv + "/" + op;
        if (that.jsonSchemas[uri] && that.jsonSchemas[uri].response){
          var reqSchemaResponseExample = that.jsonSchemas[uri].response.example;
          if (reqSchemaResponseExample){
            var jsonResp = {
                "dom" : dom,
                "app" : app,
                "srv" : srv,
                "op" : op,
                "header" : reqSchemaResponseExample
            };
            res.json(jsonResp);
          } else {
            res.status(500).send('Operation ' + uri +' example not defined');
          }
        } else {
          res.status(500).send('Operation ' + uri +' not defined');
        }
      } catch (e) {
        res.status(500).send('Invalid protocol: ' + e);
      }
    });

    http.on('connection',function(socket){
      var thisSocket = socket;
      console.log('HTTP socket opened ' + socket);
      that.httpSockets.push(socket);

      // Remove the socket when it closes
      thisSocket.on('close', function () {
        console.log('HTTP socket closed ' + that.thisSocket);
        delete that.thisSocket;
        that.httpSockets.splice(that.httpSockets.indexOf(socket), 1);
      });

    });

    var port = atom.config.get('motif-mam-tools.MockServerPort');
    http.listen(port, function(){
      console.log('VMOTIF listening on port ' + http.address().port);
      that.eventBus.publish("VMOTIF_STARTED", { 'status' : 'started'});
    });
  }

  stop(){
    console.log("Stopping VMOTIF...");
    this.httpSockets.forEach(function(socket){
      socket.destroy();
    })
    http.close();
    this.eventBus.publish("VMOTIF_STOPPED", { 'status' : 'stopped'});
    console.log("VMOTIF stopped.");
  }

}
