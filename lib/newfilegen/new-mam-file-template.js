'use babel';


module.exports = {
  render : function() {
    return `
    {
      "$schema": "https://raw.githubusercontent.com/github-vipera/MOTIF-MAM/master/json-schemas/motif.request.schema#",
      "type": "object",
      "version": "0.0.1",
      "uri": "/xybank/mobapp/Greetings/SayHello",
      "description": "This is a simple greetings API",
      "secure": false,
      "properties": {
          "name": {
              "type": "string",
              "description": "the user name"
          }
      },
      "required": [
          "name"
      ],
      "example": {
          "name": "Marco Rossi"
      },
      "response" : {
        "example" : {
            "value" : "Hello Marco Rossi"
        }
      }

    }
`}

}
