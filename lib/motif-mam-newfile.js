'use babel';

import { CompositeDisposable } from 'atom';
var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');
var _ = require('lodash');
var Handlebars = require('Handlebars');

export default class MAMNewFileView {


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
    this.element.classList.add('motif-mam-tools-newfile');

    var NewProjHTML = require("./motif-mam-newfile-html.js");
    this.element.innerHTML = NewProjHTML.render();

  }

  onCreateButton(callback){
    document.getElementById('vipera-tools-mam-newfile-create').addEventListener('click', function(evt){
      callback("TODO!! return entered path", evt);
    });
  }

  onCancelButton(callback){
    document.getElementById('vipera-tools-mam-newfile-cancel').addEventListener('click', callback);
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
