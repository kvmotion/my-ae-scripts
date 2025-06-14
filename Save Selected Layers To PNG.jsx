{
    function createUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Render Layers", undefined, {resizeable:true});
    
        var checkbox = win.add("checkbox", undefined, "Save Separately");
        checkbox.value = false;
    
        var pngBtn = win.add("button", undefined, "Render to PNG");
        var jpegBtn = win.add("button", undefined, "Render to JPEG");
    
        pngBtn.onClick = function() {
            renderLayers("PNG", "png", checkbox.value);
        };
    
        jpegBtn.onClick = function() {
            renderLayers("JPEG", "jpg", checkbox.value);
        };
    
        win.layout.layout(true);
        return win;
    }
    
    function renderLayers(templateName, extension, saveSeparately) {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }
    
        if (comp.selectedLayers.length < 1) {
            alert("Please select at least one layer.");
            return;
        }
    
        var selectedLayers = comp.selectedLayers;
        var time = comp.time;
        var projectPath = app.project.file ? app.project.file.path : Folder.myDocuments.absoluteURI;
        var tempFolder = new Folder(projectPath + "/_RenderedLayers_" + templateName);
        if (!tempFolder.exists) tempFolder.create();
    
        if (!saveSeparately) {
            app.beginUndoGroup("Render and Replace (Merged)");
    
            var lowestIndex = selectedLayers[0].index;
            for (var i = 1; i < selectedLayers.length; i++) {
                if (selectedLayers[i].index > lowestIndex) {
                    lowestIndex = selectedLayers[i].index;
                }
            }
    
            for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).solo = false;
            for (var i = 0; i < selectedLayers.length; i++) selectedLayers[i].solo = true;
    
            var baseName = "Merged_" + new Date().getTime();
            var outputPath = tempFolder.fsName + "/" + baseName;
    
            var rqItem = app.project.renderQueue.items.add(comp);
            rqItem.render = true;
            var om = rqItem.outputModule(1);
            om.file = new File(outputPath);
    
            try {
                om.applyTemplate(templateName);
            } catch (e) {
                alert("Output Module Template '" + templateName + "' not found.");
                app.endUndoGroup();
                return;
            }
    
            comp.workAreaStart = time;
            comp.workAreaDuration = 1 / comp.frameRate;
            rqItem.timeSpanStart = time;
            rqItem.timeSpanDuration = 1 / comp.frameRate;
    
            app.project.renderQueue.render();
            for (var i = app.project.renderQueue.numItems; i >= 1; i--) app.project.renderQueue.item(i).remove();
    
            app.beginUndoGroup("Insert " + templateName + " and Remove Originals (Merged)");
    
            var files = tempFolder.getFiles(function(f) {
                return (f instanceof File) && f.name.indexOf(baseName) === 0 && f.name.match(new RegExp("\\." + extension + "$", "i"));
            });
            if (files.length === 0) {
                alert(templateName + " render failed.");
                app.endUndoGroup();
                return;
            }
    
            var importedFootage = app.project.importFile(new ImportOptions(files[0]));
            var newLayer = comp.layers.add(importedFootage);
            newLayer.startTime = 0;
            if (lowestIndex <= comp.numLayers) newLayer.moveBefore(comp.layer(lowestIndex));
            for (var i = 0; i < selectedLayers.length; i++) {
                try { selectedLayers[i].remove(); } catch (e) {}
            }
    
            for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).solo = false;
            comp.openInViewer();
    
            app.endUndoGroup();
    
        } else {
            var layerRefs = [];
            for (var i = 0; i < selectedLayers.length; i++) {
                layerRefs.push(selectedLayers[i]);
            }
            layerRefs.sort(function(a, b) { return b.index - a.index; });
    
            var data = [];
    
            for (var i = 0; i < layerRefs.length; i++) {
                var layer = layerRefs[i];
                for (var j = 1; j <= comp.numLayers; j++) {
                    try { comp.layer(j).solo = false; } catch (e) {}
                }
                try { layer.solo = true; } catch (e) {}
    
                var nameSafe = layer.name.replace(/[^a-z0-9]/gi, "_") || "Layer";
                var baseName = nameSafe + "_" + new Date().getTime();
                var outputPath = tempFolder.fsName + "/" + baseName;
    
                var rqItem = app.project.renderQueue.items.add(comp);
                rqItem.render = true;
                var om = rqItem.outputModule(1);
                om.file = new File(outputPath);
                try {
                    om.applyTemplate(templateName);
                } catch (e) {
                    alert("Template error on layer " + layer.name + ": " + e.toString());
                    continue;
                }
    
                comp.workAreaStart = time;
                comp.workAreaDuration = 1 / comp.frameRate;
                rqItem.timeSpanStart = time;
                rqItem.timeSpanDuration = 1 / comp.frameRate;
    
                try {
                    app.project.renderQueue.render();
                } catch (e) {
                    continue;
                }
    
                for (var j = app.project.renderQueue.numItems; j >= 1; j--) app.project.renderQueue.item(j).remove();
    
                var files = tempFolder.getFiles(function(f) {
                    return (f instanceof File) && f.name.indexOf(baseName) === 0 && f.name.match(new RegExp("\\." + extension + "$", "i"));
                });
                if (files.length === 0) continue;
    
                data.push({
                    file: files[0],
                    layer: layer
                });
            }
    
            app.beginUndoGroup("Insert " + templateName + "s and Remove Originals (Separate)");
    
            for (var i = 0; i < data.length; i++) {
                var imported = app.project.importFile(new ImportOptions(data[i].file));
                var newLayer = comp.layers.add(imported);
                newLayer.startTime = 0;
                newLayer.moveBefore(data[i].layer);
                try { data[i].layer.remove(); } catch (e) {}
            }
    
            comp.openInViewer();
            app.endUndoGroup();
    
            for (var i = 1; i <= comp.numLayers; i++) {
                try { comp.layer(i).solo = false; } catch (e) {}
            }
        }
    }
    
    var myScriptPanel = createUI(this);
    if (myScriptPanel instanceof Window) {
        myScriptPanel.center();
        myScriptPanel.show();
    }
    }
    
