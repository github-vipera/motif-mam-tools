'use babel';

import { CompositeDisposable } from 'atom';
var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');
var _ = require('lodash');
var Handlebars = require('Handlebars');

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

    var that = this;

    this.eventBus = EventBus;

    this.initUI();
  }

  initUI(){
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('motif-mam-tools-newproject');

    var NewProjHTML = require("./motif-mam-newproject-html.js");
    this.element.innerHTML = NewProjHTML.render();
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

}
