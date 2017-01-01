/*
*****************************************************************************
*                      ___       _   _    _ _
*                     / _ \ __ _| |_| |__(_) |_ ___
*                    | (_) / _` | / / '_ \ |  _(_-<
*                     \___/\__,_|_\_\_.__/_|\__/__/
*                          Copyright (c) 2012
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
* @date     2012/01/28
*
*****************************************************************************/

function WsLoader() {
  this.enabled    = false;
  this.data       = undefined;
  this.timer      = undefined;
  this.period     = 3;  // capture period in seconds.
  this.duration   = 300; // capture duration in seconds. default is minutes
  this.tick       = 0;
  this.cbkStarted = function() {};
  this.cbkStopped = function() {};
  this.cbkStep = function() {};
}


WsLoader.prototype.setCbk = function(cbkStopped, cbkStarted, cbkStep)
{
   this.cbkStopped = cbkStopped;
   this.cbkStarted = cbkStarted;
   this.cbkStep = cbkStep;
}


WsLoader.prototype.getData = function()
{
   return(this.data);
}

WsLoader.prototype.onSliceData = function(data)
{
   this.data.slice.push(data.slice[0]);
   this.data.allocer = data.allocer;
}

WsLoader.prototype.onTimer = function()
{
   this.tick += this.period;
   if(this.tick >= this.duration)
   {
      this.stop();
   }
   else
   {
     this.cbkStep(this.tick, this.duration);
     const request = {
         "InterfaceName": "Edleak",
         "MethodName": "GetSlice",
         "MethodParams": {}
         };
      var serialized_data = JSON.stringify(request);

      $.ajax( { "type": 'POST', "url": "http://" + this.ip + ":" + this.port + "/ws",
         "success": function(me)
         {
            return( function(data)
            {
               if(data.status == 0)
               {
                  me.onSliceData(data.data);
               }
            });
         }(this),
         "error": function(jqXHR, textStatus, errorThrown)
         {
            return 0;
         },
         "dataType": "json",
         "processData" : false,
         "data" : serialized_data
         }
         );

   }

   return;
}

WsLoader.prototype.start = function(ip, port, duration, period)
{
   if(this.enabled)
      return(-1);

   this.period    = period;
   this.duration  = duration;
   this.ip        = ip;
   this.port      = port;
   this.tick      = 0;
   this.data      = { "slice" : [], "allocer": []};
   this.timer     = setInterval( function(me) {
         return( function() {
            me.onTimer();
         });
      }(this),
      this.period*1000);
   this.enabled = true;
   this.cbkStarted();
   return(0);
}
WsLoader.prototype.isStarted = function()
{
   return(this.enabled);
}

WsLoader.prototype.stop = function()
{
   if(!this.enabled)
      return(-1);

   this.enabled = false;
   clearInterval(this.timer);
   this.timer = undefined;
   this.cbkStopped();
   return(0);
}


export { WsLoader };
