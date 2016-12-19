'use babel';


module.exports = {
  render : function() {
    return `
    <img class="va-white-logo" src="atom://dynamicengine-templates-tool/resources/VA_white.png" style="position:absolute;opacity:0.2;">
  <div style='margin:30px;'>

        <section class="section">
          <div class="section-container">
            <div class="section-heading" style="font-size: 1.75em;font-weight: bold;line-height: 1;-webkit-user-select: none;cursor: default;">
              <span class="icon icon-puzzle">MOTIF API Modeler Workbench</span>
            </div>
          </div>
        </section>

        <div style="padding:4px;"></div>
        <div id="vipera-tools-mam-schema-status-label">MAM Schema not loaded</div>

        <div style="height:1px;background:#528bff;margin-top:15px;margin-bottom:10px;"></div>
        <div style="padding:4px;"></div>

        <div id="vipera-tools-mam-schema-validation-ok" style="display:none;"><span id="vipera-tools-mam-schema-validation-ok-label" class='inline-block highlight-success'>No errors found.The MAM schema is valid</span></div>
        <div id="vipera-tools-mam-schema-validation-ko" style="display:none;"><span id="vipera-tools-mam-schema-validation-ko-label" class='inline-block highlight-error'></span></div>
        <div id="vipera-tools-mam-schema-validation-ko-errors"></div>
        <div id="vipera-tools-mam-schema-no-mam-file-selected" style="display:none;"><span class='inline-block'>No MAM schema file selected</span></div>

        <div style="padding:4px;"></div>
        <div id="vipera-tools-mam-schema-doc-container"></div>
    </div>








`}

}
