'use babel';

import { CompositeDisposable } from 'atom';
var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');
var _ = require('lodash');
var Handlebars = require('Handlebars');
var jsonMarkup = require('json-markup');
var jsonutil = require('jsonutil');
const path = require('path');

export default class MAM2PostmanCollectionExporter {

  constructor() {
  }

  export(exportPath){
    var that = this;
    this.exportPath = path;
    this.jsonSchemas = {};

    //load the file lsit
    console.log("Loading project files...");
    var projectFolders = atom.project.getPaths();
    var fileList = this.walkSync(projectFolders[0]);

    for (i=0;i<fileList.length;i++){
      try {
        var jsonSchema = jsonutil.readFileSync(fileList[i]);
        var absoluteFilePath = path.dirname(fileList[i]);
        var relativeFilePath = atom.project.relativizePath(absoluteFilePath);
        jsonSchema.relativeFilePath = relativeFilePath[1];
        jsonSchema.absoluteFileName = fileList[i];
        jsonSchema.fileName = path.basename(fileList[i]);
        this.jsonSchemas[jsonSchema.uri] = jsonSchema;
      } catch (e){
        console.log("Error loading file " + fileList[i] + ": " + e);
      }
    }

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


}
