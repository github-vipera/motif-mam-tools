'use babel';

import { CompositeDisposable } from 'atom';
var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');
var _ = require('lodash');
var Handlebars = require('Handlebars');
var electronApp = require('electron').remote;
var dialog = electronApp.dialog;

export default class MAMNewPojectView {


  constructor(serializedState, EventBus) {
    this.ajv = undefined;
    this.currentTextEditor = undefined;
    this.currentFileIsMAM = false;
    this.errorsTemplate = undefined;
    this.docTemplate = undefined;
    this.jsonLibrary = undefined;
    this.currentJsonSchema = undefined;
    this.currentMAMSchema = undefined;
    this.vMOTIF = undefined;
    this.eventBus = undefined;

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    var that = this;

    this.eventBus = EventBus;

    this.initUI();
  }

  initUI(){
    var that = this;

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('motif-mam-tools-newproject');

    var NewProjHTML = require("./motif-mam-newproject-html.js");
    this.element.innerHTML = NewProjHTML.render();
  }

  onCreateButton(callback){
    document.getElementById('vipera-tools-mam-newprj-create').addEventListener('click', function(evt){
      callback(document.getElementById('vipera-tools-mam-newprj-folder-textfield').value, evt);
    });

    document.getElementById('vipera-tools-mam-newprj-choosefolder').addEventListener('click', function(evt){
      dialog.showOpenDialog({ title: 'Choose new project folder',
                              buttonLabel : 'Choose folder',
                              properties:['openDirectory']}, function(paths){
          document.getElementById('vipera-tools-mam-newprj-folder-textfield').value = paths;
      });
    });

  }

  onCancelButton(callback){
    document.getElementById('vipera-tools-mam-newprj-cancel').addEventListener('click', callback);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    this.subscriptions.dispose();
  }

  getElement() {
    return this.element;
  }

}
