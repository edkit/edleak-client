'use strict';


function EdleakDataset() {
    this.sliceDataset = null;
    this.allocerDataset = [];
}

EdleakDataset.loadFromObject = function(data) {
    var ds = new EdleakDataset();
    ds.sliceDataset = data;
    ds.allocerDataset = ds.mapAllocerDataset(ds.sliceDataset);
    return ds;
}

EdleakDataset.loadFromJson = function(json) {
    var data = JSON.parse(json);
    return EdleakDataset.loadFromObject(data);
}

/*
    Returns a slice oriented dataset
*/
EdleakDataset.prototype.getDataset = function () {
    return this.sliceDataset;
}

/*
    Returns an allocer oriented dataset.
*/
EdleakDataset.prototype.getAllocerDataset = function () {
    return this.allocerDataset;
}

EdleakDataset.prototype.setStackState = function (id, state) {
  if(this.allocerDataset[id] != undefined) {
    this.allocerDataset[id].stackState = state;
  }
}


EdleakDataset.prototype.mapAllocerDataset = function (sliceDataset) {
    var tmp_dataset = [];
    var slices = sliceDataset.slice;
    for(var slice_key in slices) {
        for(var entry_key in slices[slice_key]) {
            var slice = slices[slice_key];
            var id = slice[entry_key].alc;
            if(tmp_dataset[id] != undefined) {
                tmp_dataset[id].mem.push(slice[entry_key].mem);
            }
            else {
                tmp_dataset[id] = {
                  "id":id,
                  "class": "noleak",
                  "mem": [slice[entry_key].mem],
                  "stackState": false};
            }
        }
    }

    return tmp_dataset;
}

EdleakDataset.prototype.setAnnotationClassification = function (id, classification) {
    if(classification == false)
        return;

    for(var entry_key in this.sliceDataset.annotations) {
        if(this.sliceDataset.annotations[entry_key].alc == id) {
            this.sliceDataset.annotations[entry_key].class = classification;
            return;
        }
    }
    this.sliceDataset.annotations.push({ "id": id, "class" : 'leak'});
    return;
}

/*
*/
EdleakDataset.prototype.updateClassification = function (classification) {
    if(classification == null || classification.length != this.allocerDataset.length)
        return;

    if(this.sliceDataset.annotations == undefined) {
        this.sliceDataset.annotations = [];
    }

    for(var entry_key in classification) {
        this.setAnnotationClassification(this.allocerDataset[entry_key].id, classification[entry_key]);
    }
    return;
}

export { EdleakDataset };
