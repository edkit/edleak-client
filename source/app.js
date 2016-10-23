'use strict';

function EdleakApp(loadUrl) {
    this.service = null;
    this.edleakGraph = new EdleakGraph("scatter-graph");

    this.fileLoader = new FileLoader(this.edleakGraph);
    this.wsLoader = new WSLoader(this);

    var menu_item  = '<div class="menu-item">';
    menu_item      += '<h4>Graph scale</h4>';
    menu_item      += '<input type="radio" name="scale" value="linear" checked />Linear<br />';
    menu_item      += '<input type="radio" name="scale" value="log" /> Log';
    menu_item      += '</div>';
    $('#menu-bar').append(menu_item);

    var that = this;
    $("input[name='scale']").change(function()
       {
          var scale = $("input[name='scale']:checked").val();
          that.edleakGraph.setScaleType(scale);
       });

    if(loadUrl != null) {
       this.loadUrl(loadUrl);
    }

    this.service = new WampSession();
    this.service.start();
}

EdleakApp.prototype.loadUrl = function(url) {
    console.log(loadUrl);
    $.getJSON( url, function( json ) {
        this.edleakGraph.setData(json);
        this.edleakGraph.redraw();
  });
}

EdleakApp.prototype.classifyAndDisplay = function(dataset)
{
    if(this.service.isConnected()) {
        var that = this;
        this.service.classify_dataset(dataset.getAllocerDataset()).then(
          function (res) {
              dataset.updateClassification(res);
              that.edleakGraph.setData(dataset.getDataset());
              that.edleakGraph.redraw();
          },
          function (err) {
             console.log("classify() error:", err);
          }
       );;
   }
   else {
       this.edleakGraph.setData(dataset.getDataset());
       this.edleakGraph.redraw();
   }
}
