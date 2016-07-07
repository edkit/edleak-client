/*
*****************************************************************************
*                      ___       _   _    _ _
*                     / _ \ __ _| |_| |__(_) |_ ___
*                    | (_) / _` | / / '_ \ |  _(_-<
*                     \___/\__,_|_\_\_.__/_|\__/__/
*                          Copyright (c) 2011
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*****************************************************************************/
/**
* @author   R. Picard
* @date     2011/05/11
*
*****************************************************************************/

FileSaver = function() {
}

FileSaver.prototype.setData = function(data) {
    var json = JSON.stringify(data);
    var blob = new Blob([json], {type: "application/json"});
    var url  = URL.createObjectURL(blob);
    $('#edkit_file_save').attr("href", url);
}

var FileSaverSingleton = (function() {
    var instance;

    return {
        getInstance: function () {
            if (!instance) {
                instance = new FileSaver();
            }
            return instance;
        }
    };
})();

$(document).ready( function()
{
   var menu_item  = '<div class="menu-item">';
   menu_item      += '<h4>Load file</h4>';
   menu_item      += '<div class="menu-content" >';
   menu_item      += '<span id="edkit_file_span">';
   menu_item      += '<input type="file" id="edkit_file_load" name="edkit_file_load"/>';
   menu_item      += '<input type="image" id="edkit_file_load_img" src="style/upload.png" alt="load"/>';
   menu_item      += '<a id="edkit_file_save" name="edkit_file_save" download="edleak.json" alt="save" />';
   menu_item      += '</span>';

   menu_item      += '</div></div>';
   $('#menu-bar').append(menu_item);

   $('#edkit_file_load_img').click( function() {
        $('#edkit_file_load').click();
   });

   $('#edkit_file_save_img').click( function() {
        $('#edkit_file_save').click();
   });


   $('#edkit_file_load').change( function(evt)
      {
         var file = evt.target.files[0];
         var reader = new FileReader();

         reader.onload = (function(theFile)
            {
               return function(e)
               {
                  data = JSON.parse(e.target.result);
                  vis_display();
                  FileSaverSingleton.getInstance().setData(data);
               };
            })(file);

         reader.readAsText(file);
      });
});
