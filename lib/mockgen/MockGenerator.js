'use babel'
import _ from 'lodash'
var jsonutil = require('jsonutil');
export default class MockGenerator {
  constructor() {
    this.jsonSchemas=[];
  }

  initialize(){
    console.log("Init mock generator");
    this.loadProjectResources();
  }

  loadProjectResources(){
    console.log("load project resources...");
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
    console.log("end project resources loading");
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

  generateMockFile(){
    return new Promise((resolve,reject) => {

    });
  }


}
