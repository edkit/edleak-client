/*
*****************************************************************************
*                      ___       _   _    _ _
*                     / _ \ __ _| |_| |__(_) |_ ___
*                    | (_) / _` | / / '_ \ |  _(_-<
*                     \___/\__,_|_\_\_.__/_|\__/__/
*                          Copyright (c) 2013
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
* @date     2013/03/25
*
*****************************************************************************/

function WsCallerAdder() {
}

WsCallerAdder.prototype.add = function(id, host, port) {
   const request = {
      "InterfaceName": "Edleak",
      "MethodName": "AddStackWatch",
      "MethodParams": { "id": id}
   };
   var serialized_data = JSON.stringify(request);

   $.ajax( { "type": 'POST', "url": "http://" + host + ":" + port + "/ws",
      "success": function(me) {
         return( function(data) {
            }
         );
      }(this),
      "error": function(jqXHR, textStatus, errorThrown) {
         return 0;
      },
      "dataType": "json",
      "processData" : false,
      "data" : serialized_data
      }
   );

   return;
}


WsCallerAdder.prototype.onAdd = function(id) {
    var settings = ws_ui.getSettings();

   request = {
      "InterfaceName": "Edleak",
      "MethodName": "AddStackWatch",
      "MethodParams": { "id": id}
   };
   var serialized_data = JSON.stringify(request);

   $.ajax( { "type": 'POST', "url": "http://" + settings.ip + ":" + settings.port + "/ws",
      "success": function(me) {
         return( function(data) {
            }
         );
      }(this),
      "error": function(jqXHR, textStatus, errorThrown) {
         return 0;
      },
      "dataType": "json",
      "processData" : false,
      "data" : serialized_data
      }
   );

   return;
}

export { WsCallerAdder };
