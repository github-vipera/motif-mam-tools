'use babel';


module.exports = {
  render : function() {
    return `

    <style>
    .vipera-tools-mam-schema-even-row {
      background-color:#454545;
    }
    .vipera-tools-mam-schema-odd-row {
    }
    .mam-tool-publish-toggle.input-toggle:checked {
      background-color: #11c38a;
    }
    </style>

      <atom-panel>
        <div class="inset-panel">
          <div class="panel-heading">
            <div>
              <div style="display:inline-block;">
                <h2 class="text-success" style="font-size:25px;">{{jsonCallFromURI jsonSchema.uri}}</h2>
              </div>
              <!--
              <div style="float:right;">
                <label style="vertical-align: middle;padding-top:2px;" class='input-label'><input id="vipera-tools-mam-publish-call" class='input-toggle mam-tool-publish-toggle' type='checkbox' unchecked>Publish</label>
              </div>
              -->
            </div>
            <div style="display:flex;">
              <div style="width:100%;">
                <span class='text-subtle' style="font-size:18px;">{{jsonSchema.description}}</span>
              </div>
              <div>
                {{#if jsonSchema.secure}}
                  <span class='badge badge-success'>Secure</span>
                {{else}}
                  <span class='badge badge-info'>Public</span>
                {{/if}}
              </div>
            </div>
            <div style="height:2px;"></div>
            <span class='text-subtle'>API Version:&nbsp;&nbsp;{{jsonSchema.version}}</span>
          </div>

          <div class="panel-body padded">
            <a class="text-subtle">URI:&nbsp;&nbsp;</a><a class="text-info">{{jsonSchema.uri}}</a>

            <div style="padding:10px;">
              <table style="width:100%;">
                <tr style="height:35px;">
                  <th>Name</th><th>Type</th><th align="center" style="text-align:center;">Required</th><th>Description</th>
                </tr>
                  {{#each jsonSchema.properties}}
                  <tr class="is-color background-color-selected {{classForRow @index}}" style="height:35px;border-bottom:solid 1px #5a5a5a;font-family:Courier New, monospace;">
                    <td style="font-weight:bold;">{{@key}}</td>
                    <td>{{type}}</td>
                    {{#isPropertyRequired @key}}
                      <td align="center"><span class='badge badge-success'>Yes</span></td>
                    {{else}}
                      <td align="center"></td>
                    {{/isPropertyRequired}}
                    <td>{{description}}</td>
                  </tr>
                  {{/each}}
                </th>
              </table>
            </div>


            <div>
              {{#if jsonSchema.example}}
                <h2>Example:</h2>
                <div style="font-family:Courier New, monospace;">
                  <pre><code>
                    {{{jsonPrettyPrint jsonSchema.example}}}
                  </code></pre>
                </div>
              {{/if}}
            </div>


          </div>


        </div>
      </atom-panel>
`}

}
