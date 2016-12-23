'use babel';

/**
 * Vipera MOTIF MAM Tool plugin for ATOM
 */

import { CompositeDisposable } from 'atom';
import EventBus from './events/MAMEventBus';
import MAMWorkbenchView from './motif-mam-workbench';
import NewMAMProjectView from './motif-mam-newproject';
const Pane = require('atom-quick-pane');

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


  activate(state) {
    var that = this;

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // subscribe all debugger actions
    this.subscribeActions();

  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
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

  },




};
