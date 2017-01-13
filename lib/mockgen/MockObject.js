module.exports = {
  projectTemplate : function() {
    return `
    Controller.mock.requestId=0;
    Controller.mock.appDomain=function(){
      return "{{appDomain}}";
    }
    Controller.mock.appName=function(){
      return "{{appName}}";
    }
    Controller.mock.sessionId=function(){
      return "SESSION_MOCK_12345";
    }
    Controller.mock.newRequestId=function(){
      return Controller.mock.requestId++;
    }
    Controller.mock.userId=function(){
      return "USER_ID_OO1";
    }
    Controller.mock.init=undefined;

    Controller.mock.appStarted=function(){
      //Impl. your init here
      Controller.mock.init=true;
    }

    /**
    * Build response structure
    */
    Controller.mock.buildResponseFromRequest = function(request,responseHeader) {
      var app = request.req.app;
      var dom = request.req.dom;
      var op = request.req.op;
      var srv = request.req.srv;
      var resp = {
          "res" : {
              "header" : {
              }
          }
      };
      if(responseHeader != undefined){
        resp.res.header = responseHeader;
      }
      resp.res.header.dom = dom;
      resp.res.header.app = app;
      resp.res.header.srv = srv;
      resp.res.header.op  = op;
      return resp;
    }
    `

  },
  serviceDeclarationTemplate: function(){
    return `
      //definition of {{serviceName}} service
      Controller.mock.{{serviceName}} = {};
    `;
  },
  webApiTemplate:function(){
    return `
      /**
      * {{description}}
      *
      {{#if example}}
      * @example
      * {{json example}}
      {{/if}}
      */
      Controller.mock.{{srv}}.{{op}} = function(request){
        {{#if response}}
          var responseHeader = {{json response}};
          var resp = Controller.mock.buildResponseFromRequest(request,responseHeader);
          return resp;
        {{else}}
          //put your code here
        {{/if}}
      };
    `;
  }
}
