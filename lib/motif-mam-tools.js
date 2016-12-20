'use babel';

/**
 * Vipera MOTIF MAM Tool plugin for ATOM
 */

/**
import logger from './loggers/logger'
import DEDebugger from './DEDebugger';
import DeviceInfo from './DeviceInfo'
import ConsoleHandler from './loggers/ConsoleHandler'
import MotifConnector from './connectors/MotifConnector'
import Config from './Config'
import EventBus from './events/DebuggerEventBus'
var exec = require('child_process').exec;
**/

import { CompositeDisposable } from 'atom';
import EventBus from './events/MAMEventBus';
var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');
var _ = require('lodash');
var Handlebars = require('Handlebars');
var jsonMarkup = require('json-markup');
var vMOTIF = require('./vMOTIF');

const Pane = require('atom-quick-pane');

export default {

  config:{
    MockServerPort: {
      title: 'Mock Server Port',
      description: 'Set the Mock Server port',
      type: 'integer',
      default: 8080,
      minimum: 1024
    }
  },

  mamPane: undefined,
  ajv: undefined,
  currentTextEditor: undefined,
  currentFileIsMAM: false,
  errorsTemplate: undefined,
  docTemplate: undefined,
  jsonLibrary: undefined,
  currentJsonSchema: undefined,
  currentMAMSchema: undefined,
  vMOTIF: undefined,

  activate(state) {
    var that = this;

    this.vMOTIF = new vMOTIF(EventBus);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    // subscribe all debugger actions
    this.subscribeActions();

    this.setupSchemaValidator();

    atom.workspace.observeActivePaneItem(function(paneItem){
      that.onActivePaneEvent(paneItem);
    });

  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
  },

  onActivePaneEvent(paneItem){
    if (this.mamPane){
      this.reloadCurrentTextEditorValidation();
    }
  },

  reloadCurrentTextEditorValidation(){
    var currentTextEditor = atom.workspace.getActiveTextEditor();
    if (currentTextEditor){
      this.onActiveTextEditorChanged(currentTextEditor);
    }
  },

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
  },

  onCurrentTextChanged(){
    this.validateCurrentSelectedFile();
  },

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
  },

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
  },

  subscribeActions() {
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'motif-mam-tools:toggle': () => this.showMAMPane()
    }));
  },

  fileExtension(fileName){
    var parts = _.split(fileName, ".");
    if (parts && parts.length > 0){
      return parts[parts.length-1];
    }
  },

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
  },

  showValidationError(message){
    this.updateElementText('vipera-tools-mam-schema-validation-ko-label', message);
    this.showElement('vipera-tools-mam-schema-validation-ok', false);
    this.showElement('vipera-tools-mam-schema-validation-ko', true);
  },

  showValidationErrors(errors){
    var that = this;
    if (!that.errorsTemplate){
      var source = "<ul>{{#each errors}}<li><span class='inline-block highlight'>Validation Error: data {{dataPath}} {{message}} (schema path: {{schemaPath}})</span></li>{{/each}}</ul>";
      that.errorsTemplate = allowUnsafeEval(() => allowUnsafeNewFunction(() => Handlebars.compile(source)));
    }
    var errorsData = { 'errors': errors };
    var result = allowUnsafeEval(() => allowUnsafeNewFunction(() => that.errorsTemplate(errorsData)));
    document.getElementById('vipera-tools-mam-schema-validation-ko-errors').innerHTML = result;
  },

  emptyDoc(withError){
    if (withError){
      document.getElementById('vipera-tools-mam-schema-doc-container').innerHTML = "<ul class='background-message centered'><li>" + withError +"</li></ul>";
    } else {
      document.getElementById('vipera-tools-mam-schema-doc-container').innerHTML = "<ul class='background-message centered'><li>No MAM schema selected</li></ul>";
    }
  },

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

  },

  isParamRequired(item, jsonSchema){
    if (jsonSchema.required){
      for (i=0;i<jsonSchema.required.length;i++){
        if (jsonSchema.required[i]===item){
          return true;
        }
      }
    }
    return false;
  },

  clearValidationErrors(){
    document.getElementById('vipera-tools-mam-schema-validation-ko-errors').innerHTML = '';
  },

  showValidationSuccess(){
    this.showElement('vipera-tools-mam-schema-validation-ko', false);
    this.showElement('vipera-tools-mam-schema-validation-ok', true);
  },

  noSchemaFileSelected(){
      this.showElement('vipera-tools-mam-schema-no-mam-file-selected', false);
      this.showElement('vipera-tools-mam-schema-validation-ko', false);
      this.showElement('vipera-tools-mam-schema-validation-ok', false);
      this.clearValidationErrors();
      this.emptyDoc();
  },

  schemaFileSelected(){
    this.showElement('vipera-tools-mam-schema-no-mam-file-selected', false);
    this.showElement('vipera-tools-mam-schema-validation-ko', true);
    this.showElement('vipera-tools-mam-schema-validation-ok', false);
  },

  showElement(element, show){
    if (!show){
      document.getElementById(element).style.display = 'none';
    } else {
      document.getElementById(element).style.display = 'initial';
    }
  },

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
    if (this.mamPane){
      this.updateElementText('vipera-tools-mam-schema-status-label', 'MAM schema loaded successfully ver. '+ this.currentMAMSchema.version);
    }
    console.log("MAM schema loaded successfully with version " + this.currentMAMSchema.version);
  },

  updateElementText(element, message){
    document.getElementById(element).innerHTML = message;
  },

  showMAMPane(){
    var that = this;

    //check if already opened
    if (that.mamPane){
      //already opened, do nothing
      return;
    }

    var TemplatesView = require("./motif-mam-mainview.js");

      var panePromise = Pane({
        element: 'div',
        title: 'MOTIF API Modeler (MAM)',
        split: 'right',
        activatePane: true
      }, function (err, div) {
        if (err) throw err
        div.innerHTML = TemplatesView.render();
        that.mamPane = div;

        that.setupPaneUI(div);

      }, function () {
        // clean up any event listeners or other resources here
        that.mamPane = undefined;
      });
      panePromise.then(function(value){
      });
  },

  setupPaneUI(element){
    var that = this;

    document.getElementById('vipera-tools-mam-enable-mock-service').onchange = function(event){
      if (document.getElementById('vipera-tools-mam-enable-mock-service').checked){
        that.vMOTIF.start();
      } else {
        that.vMOTIF.stop();
      }
    };

    if (this.currentMAMSchema){
      this.updateElementText('vipera-tools-mam-schema-status-label', 'MAM schema loaded successfully ver. '+ this.currentMAMSchema.version);
    }

    this.reloadCurrentTextEditorValidation();
  }


};
