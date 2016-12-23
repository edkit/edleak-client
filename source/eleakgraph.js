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
* @date     2011/05/11
*
*****************************************************************************/

var c = pv.Scale.linear(0, 100).range("lightgrey", "darkgreen");
var colors_leak = pv.Scale.linear(0, 100).range("lightgrey", "darkred");
var plot_data = [];
var allocer_label = [];

function EdleakGraph(container) {
    this.container = container;
    this.scale = "linear";
    this.data = null;
    this.selectCallback = null;
}

EdleakGraph.prototype.setSelectCallback = function(cbk) {
    this.selectCallback = cbk;
}

EdleakGraph.prototype.setScaleType = function(scale) {
    this.scale = scale;
    if(this.data != null) {
        this.redraw();
    }
}

EdleakGraph.prototype.setData = function(data) {
    this.data = data;
}

EdleakGraph.prototype.redraw = function()
{
   var self = this;
   var x, h;
   var label_width = 250;
   var margin_right = 20;
   var w = $('#' + this.container).width() - margin_right;
   console.log('width is ' + w);
   var data = this.data;
   var selectCallback = this.selectCallback;
   convert_data(data);
   h = data.allocer.length*10;
   h += 100; // x axis
   //$('#scatter-graph').css("height", h);
   const node = document.getElementById(this.container)
   node.style.height = h;

   var graph_scale;
   if(this.scale == "log")
      graph_scale = "logarithmic";
   else
      graph_scale =  "linear";

     var options =   {
            chart: {
                renderTo: this.container,
                type: 'scatter',
                zoomType: 'x',
                width: w
            },
            title: {
                text: null
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Size (Byte)'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true,
                type: graph_scale
            },
            yAxis: {
                title: {
                    text: null
                }
            },
            tooltip: {
                formatter: function() {
                        var size = this.x;
                        var size_unit = 'B';
                        if(size > 1024) {
                           size = size/1024;
                           var size_unit = 'KiB';
                        }
                        if(size > 1024) {
                           size = size/1024;
                           var size_unit = 'MiB';
                        }
                        size = Math.round(size);
                        var result = 'size: ' + size + size_unit + '<br/>' +
                           'id: '+ data.allocer[this.y].id + '<br/>' +
                           'backtrace: <br/> ';
                        var i;
                        for(i=0;i<data.allocer[this.y].stack.length;i++) {
                           result += ' - ' + data.allocer[this.y].stack[i] + '<br/>';
                           if( (data.allocer[this.y].soname != undefined) &&
                               ((data.allocer[this.y].soname[i] != undefined) &&
                               (data.allocer[this.y].soname[i+1] == undefined) ||
                                 ((data.allocer[this.y].soname[i+1] != undefined) &&
                                  (data.allocer[this.y].soname[i] != data.allocer[this.y].soname[i+1])
                              ))) {
                               result += '   ->' + data.allocer[this.y].soname[i] + '<br/>';
                           }
                        }
                        return(result);
                }
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                verticalAlign: 'top',
                x: 100,
                y: 70,
                floating: true,
                backgroundColor: '#FFFFFF',
                borderWidth: 1
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    }
                }
            },
            series : [{
              data: plot_data,
              turboThreshold: 500000,
              point: {
                events: {
                    click: function (e) {
                      console.log('clicked on ' + data.allocer[this.y].id);
                      if(selectCallback != null)
                        selectCallback(data.allocer[this.y].id);
                    }
                  }
              }

            }],
          };



   var chart = new Highcharts.Chart(options);
   return(chart);

}


function get_annotations(data) {
    var annotations = [];

    for(annotation in data.annotations) {
        var annot = data.annotations[annotation];
        annotations[annot.id] = annot;
    }
    return annotations;
}

function convert_data(data)
{
   var   i,j;
   var   slice_count = data.slice.length;
   var   slice_color_index;
   var   annotations = get_annotations(data);

   plot_data = [];

   for(i=0; i<slice_count; i++)
   {
       slice_color_index = Math.round(i*100/slice_count)+1;
       var color_leak = colors_leak(slice_color_index);;
       var color_no_leak = c(slice_color_index);;

      for(j=0; j<data.slice[i].length; j++)
      {
         /* remove identical values to avoid adding useless points on the graph */
         /* Warning: this code considers that j indices correspond to allocer id */
         if(
             ( (i>0) &&
               (data.slice[i-1][j] != undefined) &&
               (data.slice[i][j].mem == data.slice[i-1][j].mem) )
            )
         {
             continue;
         }

        var color_obj = color_no_leak;
        if( (annotations[j] != undefined) && (annotations[j].class == "leak")) {
            color_obj = color_leak;
        }

        /* 0 is not valid on log scale, so replace with small value. */
        var mem = data.slice[i][j].mem;
        if(mem == 0)
            mem = 0.01;

        plot_data.push( {
           x: mem,
           y: data.slice[i][j].alc,
           marker: { fillColor: color_obj.color} });
      }
   }
   plot_data.reverse();
}

export { EdleakGraph };
