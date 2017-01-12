'use babel'
var _ =  require('lodash');
var jsonutil = require('jsonutil');
var Handlebars = require('Handlebars');
var MockObject = require('./MockObject');
var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');
export default class MockGenerator {
  constructor() {
    //init as object
    this.jsonSchemas=[];
    this.templatesFn={};
    this.completeSrc=undefined;
    this.completeAppDef=undefined;
    Handlebars.registerHelper('json', function(context, options) {
      return JSON.stringify(context);
      //return x.replace(/(['"])/g, '\\$1');
    });
  }

  initialize(){
    console.log("Init mock generator");
    this.loadProjectResources();
    this.printDebugRes();
    this.createAndPrecompileTemplates();
  }

  createAndPrecompileTemplates(){
    console.log("createAndPrecompileTemplates");
    // import template src
    var projectSrc = MockObject.projectTemplate();
    var serviceDeclarationSrc = MockObject.serviceDeclarationTemplate();
    var webApiSrc = MockObject.webApiTemplate();
    // precompile template
    this.templatesFn['project']= allowUnsafeEval(() => allowUnsafeNewFunction(() => Handlebars.compile(projectSrc)));
    this.templatesFn['serviceDeclaration']= allowUnsafeEval(() => allowUnsafeNewFunction(() => Handlebars.compile(serviceDeclarationSrc)));
    this.templatesFn['webApi'] = allowUnsafeEval(() => allowUnsafeNewFunction(() => Handlebars.compile(webApiSrc)));
  }

  initProjectSrc(){
    var projectData={
      "appDomain":"Vipera",
      "appName":"exampleApp"
    };
    return allowUnsafeEval(() => allowUnsafeNewFunction(() => this.templatesFn['project'](projectData)));
    //console.log(this.projectSrc);
  }

  printDebugRes(){
    console.log("printDebugRes");
    var str=JSON.stringify(this.jsonSchemas, null, 4);
    console.log(str);
    console.log("end printDebugRes");
  }


  loadProjectResources(){
    console.log("load project resources...");
    var projectFolders = atom.project.getPaths();
    console.log("folder: " + projectFolders[0]);
    var fileList = this.walkSync(projectFolders[0]);
    for (i=0;i<fileList.length;i++){
      try {
        var jsonSchema = jsonutil.readFileSync(fileList[i]);
        this.jsonSchemas[i] = jsonSchema;
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

  processSchemas(schemas){
    console.log("Begin processSchemas");
    this.completeAppDef={
      apis:[]
    };
    for(var i=0;i<schemas.length;i++){
      var apiInfo=this.retriveServiceInfo(schemas[i]);
      this.completeAppDef.apis[i]=apiInfo;
    }
    var str=JSON.stringify(this.completeAppDef, null, 4);
    console.log("processResult: \n" + str);
  }


  retriveServiceInfo(schema){
    var uri=schema.uri;
    // "/" + dom + "/" + app + "/" + srv + "/" + op;
    var parts=uri.split('/');
    var info= {
      'dom': parts[1],
      'app': parts[2],
      'srv': parts[3],
      'op': parts[4],
      'description':schema.description,
      'example':schema.example,
      'response': schema.response != undefined ? schema.response.example : undefined
    };
    if(info.response){
      info.responseStr=JSON.stringify(info.response, null, 4);
    }
    return info;
  }

  compile(){
    this.completeSrc = this.initProjectSrc();
    var index=this.createServiceIndex();
    this.appenServiceDefinition(index);
    this.appendApiDefinition();
    console.log(this.completeSrc);
  }

  appendApiDefinition(){
    _.forEach(this.completeAppDef.apis,(api) => {
      var fn=this.templatesFn['webApi'];
      var webApiStr=  allowUnsafeEval(() => allowUnsafeNewFunction(() => fn(api)));
      webApiStr=webApiStr.replace(/(&quot\;)/g,"\"")
      this.completeSrc += '\n' + webApiStr;
    })
  }

  appenServiceDefinition(index){
    _.forEach(index,(obj,key) => {
      var fn=this.templatesFn['serviceDeclaration'];
      var serviceModel={
        'serviceName': key
      };
      this.completeSrc += '\n' + allowUnsafeEval(() => allowUnsafeNewFunction(() => fn(serviceModel)));
    })
  }

  createServiceIndex(){
    return _.groupBy(this.completeAppDef.apis, (item) => {
      return item.srv;
    });
  }

  generateMockFile(){
    return new Promise((resolve,reject) => {

    });
  }


}
