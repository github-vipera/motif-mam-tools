'use babel';

/**
 * Vipera MOTIF MAM Tool plugin for ATOM
 */

import { CompositeDisposable } from 'atom';
import EventBus from './events/MAMEventBus';
import MAMWorkbenchView from './motif-mam-workbench';
import NewMAMProjectView from './motif-mam-newproject';
import PostmanExporter from './motif-mam-postman-exporter'
const Pane = require('atom-quick-pane');

var vMOTIF = require('./vMOTIF');

//var {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');


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

  //Workbench View
  workbenchPanel:undefined,
  workbenchView:undefined,

  //New Project Panel
  newProjectPanel:undefined,
  newProjectView:undefined,

  toolBar: undefined,

  vMOTIF:undefined,

  activate(state) {
    var that = this;

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // subscribe all debugger actions
    this.subscribeActions();

    //initialize the vMOTIF service
    this.vMOTIF = new vMOTIF(EventBus);

  },

  deactivate() {
    if (this.toolBar) {
      this.toolBar.removeItems();
      this.toolBar = null;
    }
    this.subscriptions.dispose();
  },

  serialize() {
  },

  toggleMockService(){
    if (!this.vMOTIF.isRunning()){
      this.vMOTIF.start();
    } else {
      this.vMOTIF.stop();
    }
  },

  createWorkbench(){
    var that = this;
    this.workbenchView = new MAMWorkbenchView(EventBus);
    this.workbenchPanel = atom.workspace.addRightPanel({
      item: this.workbenchView.getElement(),
      visible: false
    });
    this.workbenchPanel.onDidChangeVisible(function(){
      if (that.workbenchPanel.isVisible()){
        that.workbenchView.reloadCurrent();
      }
    });
    this.workbenchView.onStartMockServiceClick(function(){
      that.toggleMockService();
    })
  },

  toggleWorkbench(){
    console.log('workbenchPanel toggled');
    if (!this.workbenchPanel){
      this.createWorkbench();
    }
    return (
      this.workbenchPanel.isVisible() ?
      this.workbenchPanel.hide() :
      this.workbenchPanel.show()
    );
  },

  createNewProjectPanel(){
    var that = this;
    this.newProjectView = new NewMAMProjectView(EventBus);
    this.newProjectPanel = atom.workspace.addModalPanel({
      item: this.newProjectView.getElement(),
      visible: false
    });
    this.newProjectView.onCancelButton(function(evt){
      that.newProjectPanel.hide();
    });
    this.newProjectView.onCreateButton(function(prjPath, evt){
      that.newProjectPanel.hide();
      alert("Creato! " + prjPath);
    });
  },

  showNewProjectPanel(){
    if (!this.newProjectView){
      this.createNewProjectPanel();
    }
    this.newProjectPanel.show();
  },

  subscribeActions() {
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'motif-mam-tools:toggle': () => this.toggleWorkbench()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'motif-mam-tools-newproj:show': () => this.showNewProjectPanel()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'motif-mam-tools-newproj:showToolbar': () => this.showToolbar()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'motif-mam-tools:exportToPostman': () => this.exportToPostman()
    }));

  },

  exportToPostman(){
    var exporter = new PostmanExporter();
     exporter.export("./");
  },

  showToolbar(){
    if (!this.toolBar){
      alert("You need to install ATOM 'tool-bar' package to use the MAM toolbar feature.");
    }
  },

  consumeToolBar(getToolBar) {
    this.toolBar = getToolBar('your-package-name');

    // Adding button
    this.toolBar.addButton({
      icon: 'plug',
      callback: 'motif-mam-tools-newproj:show',
      tooltip: 'New MAM Project'
    });

    this.toolBar.addButton({
      icon: 'checklist',
      callback: 'motif-mam-tools:toggle',
      tooltip: 'MAM Workbench'
    })

  }


};
