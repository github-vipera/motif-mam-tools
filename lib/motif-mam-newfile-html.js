'use babel';


module.exports = {
  render : function() {
    return `
  <div>

    <section class="section">
      <div class="section-container" style="">
        <div class="section-heading" style="min-width:500px;font-size: 1em;font-weight: bold;line-height: 1;-webkit-user-select: none;cursor: default;display:inline-block;">
          <span>New MOTIF API Model File</span>
        </div>
      </div>

      <div style="height:12px"></div>

      <div>
      <input class='input-text' type='text' placeholder='Project Path' id='vipera-tools-mam-newfile-path-textfield'>
      </div>


      <div style="height:1px;background-color:#5d5d5d;margin-top:20px;margin-bottom:8px;"></div>

      <div class='block'>
        <div class='btn-group'>
          <button class='inline-block btn' id='vipera-tools-mam-newfile-cancel'>Cancel</button>
          <button class='inline-block btn btn-info' id='vipera-tools-mam-newfile-create'>Create</button>
          <!--
          <button class='inline-block btn highlight' id='vipera-tools-mam-newprj-choosefolder'>Choose...</button>
          -->
        </div>
      </div>

    </section>


  </div>








`}

}
