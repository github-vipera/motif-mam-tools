'use babel';

//import express from 'express'
var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');
var express = allowUnsafeEval(() => require('express'));
var expressApp = express();
var http = require('http').Server(expressApp);
var io ;

export default class vMOTIF {

  constructor(eventBus){
    this.eventBus = eventBus;
    this.schemaMap = {};
    this.socketList = [];
    this.httpSockets = [];
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

  start(){
    console.log("Starting...");
    var that=this;

    expressApp.post('/json', function(req,res){
      console("MOTIF request "+ req);
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
    http.listen(3000, function(){
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
