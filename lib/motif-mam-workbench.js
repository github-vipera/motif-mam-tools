'use babel';

import { CompositeDisposable } from 'atom';
var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');
var _ = require('lodash');
var Handlebars = require('Handlebars');
var jsonMarkup = require('json-markup');
//var vMOTIF = require('./vMOTIF');

export default class MAMWorkbenchView {


  constructor(serializedState, EventBus) {
    this.ajv = undefined;
    this.currentTextEditor = undefined;
    this.currentFileIsMAM = false;
    this.errorsTemplate = undefined;
    this.docTemplate = undefined;
    this.jsonLibrary = undefined;
    this.currentJsonSchema = undefined;
    this.currentMAMSchema = undefined;
    //this.vMOTIF = undefined;
    this.eventBus = undefined;

    var that = this;

    this.eventBus = EventBus;

    //this.vMOTIF = new vMOTIF(EventBus);

    this.initUI();

    this.setupSchemaValidator();

    atom.workspace.observeActivePaneItem(function(paneItem){
      that.onActivePaneEvent(paneItem);
    });

  }

  initUI(){
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('motif-mam-tools-workbench');

    var WorkbenchHTML = require("./motif-mam-workbench-html.js");
    this.element.innerHTML = WorkbenchHTML.render();
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  onActivePaneEvent(paneItem){
      this.reloadCurrentTextEditorValidation();
  }

  reloadCurrentTextEditorValidation(){
    var currentTextEditor = atom.workspace.getActiveTextEditor();
    if (currentTextEditor){
      this.onActiveTextEditorChanged(currentTextEditor);
    }
  }

  onActiveTextEditorChanged(textEditor){
    var that = this;
    var currentFileExt = this.fileExtension(textEditor.getTitle());
    console.log("Current text editor: " + currentFileExt );
    if (currentFileExt==='mam'){
      this.schemaFileSelected();
      this.currentFileIsMAM = true;
    } else {
      this.noSchemaFileSelected();
      this.currentFileIsMAM = false;
    }
    this.currentTextEditor = textEditor;
    textEditor.onDidChange(function(){
      that.onCurrentTextChanged();
    });
    //fire the validation
    this.validateCurrentSelectedFile();
  }

  onCurrentTextChanged(){
    this.validateCurrentSelectedFile();
  }

  onStartMockServiceClick(callback){
    document.getElementById('vipera-tools-mam-enable-mock-service').addEventListener('click', callback);
  }

  validateCurrentSelectedFile(){
    if (this.currentFileIsMAM){
      if (!this.currentMAMSchema){
        this.showValidationError("MAM schema not loaded");
        this.emptyDoc("MAM schema not loaded");
      }
      try {
        this.clearValidationErrors();
        var json = JSON.parse(this.currentTextEditor.getText());
        var valid = allowUnsafeEval(() => allowUnsafeNewFunction(() => this.ajv.validate(this.currentMAMSchema.id, json)));
        if (!valid) {
          console.log(this.ajv.errorsText());
          this.showValidationError("MAM schema validation error:");
          this.showValidationErrors(this.ajv.errors);
          this.emptyDoc("Invalid MAM schema");
        } else {
          this.showValidationSuccess();
          this.currentJsonSchema = json;
          this.validateExample(json);
          this.generateDoc(json);
          console.log("Valid MAM schema.");
        }
      } catch (e){
          this.emptyDoc("Invalid MAM schema");
          this.showValidationError('Not a valid MAM schema: ' + e.toLocaleString());
          console.log("Not a valid MAM schema " + e.toLocaleString());
      }
    } else {
      this.emptyDoc();
    }
  }

  validateExample(jsonSchema){
      if (jsonSchema && jsonSchema.example){
        try {
          if (this.ajv.getSchema('__current.request.schema')){
            this.ajv.removeSchema('__current.request.schema');
          }
        } catch (e){}
        allowUnsafeEval(() => allowUnsafeNewFunction(() => this.ajv.addSchema(jsonSchema, '__current.request.schema')));
        var valid = allowUnsafeEval(() => allowUnsafeNewFunction(() => this.ajv.validate('__current.request.schema', jsonSchema.example)));
        if (!valid) {
          this.showValidationError("MAM Example validation error:");
          this.showValidationErrors(this.ajv.errors);
        }
      }
  }

  fileExtension(fileName){
    var parts = _.split(fileName, ".");
    if (parts && parts.length > 0){
      return parts[parts.length-1];
    }
  }

  setupSchemaValidator() {
    console.log("Setup MAM schema...");

    var that = this;
    var Ajv = require('ajv');
    this.ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

    //first check local
    var localJsonSchema = require("./schemas/motif.request.schema.json");
    if (localJsonSchema){
      console.log("Reading local MAM schema...");
      that.loadMAMValidationSchema(localJsonSchema);
    }

    //the try to load remote
    console.log("Loading remote MAM schema...");
    var request = require('request');
    request('https://raw.githubusercontent.com/github-vipera/MOTIF-MAM/master/json-schemas/motif.request.schema', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("Remote MAM schema received.");
        that.loadMAMValidationSchema(JSON.parse(body));
        atom.notifications.addInfo("Remote MAM schema loaded successfully.");
      } else {
        console.log("Remote MAM schema error: " + error);
      }
    });
  }

  showValidationError(message){
    this.updateElementText('vipera-tools-mam-schema-validation-ko-label', message);
    this.showElement('vipera-tools-mam-schema-validation-ok', false);
    this.showElement('vipera-tools-mam-schema-validation-ko', true);
  }

  showValidationErrors(errors){
    var that = this;
    if (!that.errorsTemplate){
      var source = "<ul>{{#each errors}}<li><span class='inline-block highlight'>Validation Error: data {{dataPath}} {{message}} (schema path: {{schemaPath}})</span></li>{{/each}}</ul>";
      that.errorsTemplate = allowUnsafeEval(() => allowUnsafeNewFunction(() => Handlebars.compile(source)));
    }
    var errorsData = { 'errors': errors };
    var result = allowUnsafeEval(() => allowUnsafeNewFunction(() => that.errorsTemplate(errorsData)));
    if (document.getElementById('vipera-tools-mam-schema-validation-ko-errors')){
      document.getElementById('vipera-tools-mam-schema-validation-ko-errors').innerHTML = result;
    }
  }

  emptyDoc(withError){
    if (document.getElementById('vipera-tools-mam-schema-doc-container')){
      if (withError){
        document.getElementById('vipera-tools-mam-schema-doc-container').innerHTML = "<ul class='background-message centered'><li>" + withError +"</li></ul>";
      } else {
        document.getElementById('vipera-tools-mam-schema-doc-container').innerHTML = "<ul class='background-message centered'><li>No MAM schema selected</li></ul>";
      }
    }
  }

  generateDoc(jsonSchema){
    var that = this;
    if (!that.docTemplate){
      Handlebars.registerHelper('jsonPrettyPrint',function(jsonValue){
        return jsonMarkup(jsonValue);
      });
      Handlebars.registerHelper('jsonCallFromURI',function(uri){
        var parts = _.split(uri, "/");
        if (parts && parts.length > 0){
          return parts[parts.length-1];
        } else {
            return uri;
        }
      });
      Handlebars.registerHelper('classForRow', function(value) {
        if ((value % 2)==0){
          return "is-color background-color-selected";
        } else {
          return "is-color background-color-selected";
        }
      });
      Handlebars.registerHelper('isPropertyRequired', function(item, options) {
        var required = that.isParamRequired(item, that.currentJsonSchema);
        if (required){
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      });
      var TemplatesView = require("./motif-mam-doc-template.js");
      var source = TemplatesView.render();
      that.docTemplate = allowUnsafeEval(() => allowUnsafeNewFunction(() => Handlebars.compile(source)));
    }
    var jsonSchemaData = { 'jsonSchema': jsonSchema };
    var result = allowUnsafeEval(() => allowUnsafeNewFunction(() => that.docTemplate(jsonSchemaData)));
    document.getElementById('vipera-tools-mam-schema-doc-container').innerHTML = result;

  }

  isParamRequired(item, jsonSchema){
    if (jsonSchema.required){
      for (i=0;i<jsonSchema.required.length;i++){
        if (jsonSchema.required[i]===item){
          return true;
        }
      }
    }
    return false;
  }

  clearValidationErrors(){
    if (document.getElementById('vipera-tools-mam-schema-validation-ko-errors')){
      document.getElementById('vipera-tools-mam-schema-validation-ko-errors').innerHTML = '';
    }
  }

  showValidationSuccess(){
    this.showElement('vipera-tools-mam-schema-validation-ko', false);
    this.showElement('vipera-tools-mam-schema-validation-ok', true);
  }

  noSchemaFileSelected(){
      this.showElement('vipera-tools-mam-schema-no-mam-file-selected', false);
      this.showElement('vipera-tools-mam-schema-validation-ko', false);
      this.showElement('vipera-tools-mam-schema-validation-ok', false);
      this.clearValidationErrors();
      this.emptyDoc();
  }

  schemaFileSelected(){
    this.showElement('vipera-tools-mam-schema-no-mam-file-selected', false);
    this.showElement('vipera-tools-mam-schema-validation-ko', true);
    this.showElement('vipera-tools-mam-schema-validation-ok', false);
  }

  showElement(element, show){
    if (document.getElementById(element)){
      if (!show){
        document.getElementById(element).style.display = 'none';
      } else {
        document.getElementById(element).style.display = 'initial';
      }
    }
  }

  loadMAMValidationSchema(schema){
    console.log("Loading MAM schema ver. " + schema.version + " (current:"+this.currentMAMSchema+")");
    try {
      if (this.currentMAMSchema){
        console.log("MAM schema already loaded with version " + this.currentMAMSchema.version + " " + this.ajv);
        this.ajv.removeSchema(this.currentMAMSchema.id);
        console.log("Old MAM schema removed");
      }
    } catch (e){
      console.log("error removing schema: " + e);
    }
    this.currentMAMSchema = schema;
    allowUnsafeEval(() => allowUnsafeNewFunction(() => this.ajv.addSchema(schema, schema.id)));
    this.updateElementText('vipera-tools-mam-schema-status-label', 'MAM schema loaded successfully ver. '+ this.currentMAMSchema.version);
    console.log("MAM schema loaded successfully with version " + this.currentMAMSchema.version);
  }

  updateElementText(element, message){
    if (document.getElementById(element)){
      document.getElementById(element).innerHTML = message;
    }
  }

  reloadCurrent(){
    this.validateCurrentSelectedFile();
  }

}
