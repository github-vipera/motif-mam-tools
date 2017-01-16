'use babel'
var _ =  require('lodash');
var jsonutil = require('jsonutil');
var Handlebars = require('Handlebars');
var fs= require("fs");
var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');
var NewMAMFileTemplate = require('./new-mam-file-template.js');

export default class MockGenerator {

  constructor() {
  }

  createNewMAMFile(filePath){
    return new Promise((resolve,reject) => {
        try{
          var content = NewMAMFileTemplate.render();
          fs.writeFile(filePath, content, (err) => {
            if(err) {
                resolve(err);
                return console.error(err);
            }
            console.log("The file was saved!");
            resolve(filePath);
          });
          /*
          this.compile();
          remote = require("remote");
          remote.dialog.showOpenDialog({ title: 'Select destination folder', properties:['openDirectory','createDirectory'] }, (folder) => {
            if (folder && folder.length>0){
              var destPath = folder + "/ControllerMock.js";
              console.log("destination path:",destPath);
              this.saveFile(destPath,this.completeSrc).then(resolve,reject)
            }
          });
          */
        }catch(ex){
          reject(ex);
        }
    });
  }
}
