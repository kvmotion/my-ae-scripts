// Randomizer Panel — Final Version
(function randomizerPanel(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Random", undefined, {resizeable:true});
        win.orientation = "column";
        win.alignChildren = "fill";

        function createPositionGroup(label, includeCompSize) {
            var group = win.add("panel", undefined, label);
            group.orientation = "column";
            group.alignChildren = "fill";

            var inputsGroup = group.add("group");
            inputsGroup.orientation = "row";
            inputsGroup.alignChildren = "top";

            var labels = ["X", "Y", "Z"];
            var inputs = [];

            for (var i = 0; i < 3; i++) {
                var column = inputsGroup.add("group");
                column.orientation = "column";

                column.add("statictext", undefined, "Min " + labels[i]);
                var minInput = column.add("edittext", undefined, "");
                minInput.characters = 6;

                column.add("statictext", undefined, "Max " + labels[i]);
                var maxInput = column.add("edittext", undefined, "");
                maxInput.characters = 6;

                inputs.push(minInput, maxInput);
            }

            var btnRow = group.add("group");
            btnRow.orientation = "row";
            btnRow.alignment = "left";

            var clearBtn = btnRow.add("button", undefined, "Clear");
            clearBtn.onClick = function() {
                for (var i = 0; i < inputs.length; i++) inputs[i].text = "";
            };

            if (includeCompSize) {
                var compBtn = btnRow.add("button", undefined, "Comp Size");
                compBtn.onClick = function() {
                    var comp = app.project.activeItem;
                    if (!(comp && comp instanceof CompItem)) {
                        alert("Select a comp first.");
                        return;
                    }
                    inputs[0].text = "0";
                    inputs[1].text = comp.width.toString();
                    inputs[2].text = "0";
                    inputs[3].text = comp.height.toString();
                };
            }

            return inputs;
        }

        function createRangeGroup(label, fields) {
            var group = win.add("panel", undefined, label);
            group.orientation = "column";
            group.alignChildren = "left";

            var row = group.add("group");
            row.orientation = "row";

            var inputs = [];
            for (var i = 0; i < fields; i++) {
                var sub = row.add("group");
                sub.orientation = "column";
                sub.add("statictext", undefined, ["Min", "Max"][i % 2]);
                var input = sub.add("edittext", undefined, "");
                input.characters = 6;
                inputs.push(input);
            }

            var btnClear = group.add("button", undefined, "Clear");
            btnClear.onClick = function() {
                for (var i = 0; i < inputs.length; i++) inputs[i].text = "";
            };

            return inputs;
        }

        var posFields = createPositionGroup("Position", true);
        var scaleFields = createRangeGroup("Scale (Uniform)", 2);
        var rot2DFields = createRangeGroup("Rotation 2D", 2);
        var rot3DFields = createPositionGroup("Rotation 3D", false);
        var opacFields = createRangeGroup("Opacity", 2);

        var btnGroup = win.add("group");
        btnGroup.orientation = "row";
        btnGroup.alignment = "center";
        var randomizeBtn = btnGroup.add("button", undefined, "Randomize");
        var analyzeBtn = btnGroup.add("button", undefined, "Analyze Range");

        var bottomGroup = win.add("group");
        bottomGroup.orientation = "row";
        bottomGroup.alignment = "center";
        var clearAllBtn = bottomGroup.add("button", undefined, "Clear All");
        var importBtn = bottomGroup.add("button", undefined, "Import Range");

        function parseValue(value) {
            var v = parseFloat(value);
            return isNaN(v) ? null : v;
        }

        function getRandom(min, max) {
            return min + Math.random() * (max - min);
        }

        function clearAllFields() {
            var all = posFields.concat(scaleFields, rot2DFields, rot3DFields, opacFields);
            for (var i = 0; i < all.length; i++) all[i].text = "";
        }

        function importRanges() {
            var result = analyzeLayers(false);
            if (!result) return;

            posFields[0].text = Math.round(result.posX[0]);
            posFields[1].text = Math.round(result.posX[1]);
            posFields[2].text = Math.round(result.posY[0]);
            posFields[3].text = Math.round(result.posY[1]);
            posFields[4].text = Math.round(result.posZ[0]);
            posFields[5].text = Math.round(result.posZ[1]);

            scaleFields[0].text = Math.round(result.scale[0]);
            scaleFields[1].text = Math.round(result.scale[1]);

            rot2DFields[0].text = Math.round(result.rotation[0]);
            rot2DFields[1].text = Math.round(result.rotation[1]);

            opacFields[0].text = Math.round(result.opacity[0]);
            opacFields[1].text = Math.round(result.opacity[1]);
        }

        function analyzeLayers(showAlert) {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                alert("Please select a composition.");
                return null;
            }

            var minMax = {
                posX: [Infinity, -Infinity],
                posY: [Infinity, -Infinity],
                posZ: [Infinity, -Infinity],
                scale: [Infinity, -Infinity],
                rotation: [Infinity, -Infinity],
                opacity: [Infinity, -Infinity]
            };

            for (var i = 0; i < comp.selectedLayers.length; i++) {
                var layer = comp.selectedLayers[i];
                var p = layer.property("Position").value;
                minMax.posX[0] = Math.min(minMax.posX[0], p[0]);
                minMax.posX[1] = Math.max(minMax.posX[1], p[0]);
                minMax.posY[0] = Math.min(minMax.posY[0], p[1]);
                minMax.posY[1] = Math.max(minMax.posY[1], p[1]);
                if (p.length > 2) {
                    minMax.posZ[0] = Math.min(minMax.posZ[0], p[2]);
                    minMax.posZ[1] = Math.max(minMax.posZ[1], p[2]);
                }

                var s = layer.property("Scale").value[0];
                minMax.scale[0] = Math.min(minMax.scale[0], s);
                minMax.scale[1] = Math.max(minMax.scale[1], s);

                var r = layer.property("Rotation").value;
                minMax.rotation[0] = Math.min(minMax.rotation[0], r);
                minMax.rotation[1] = Math.max(minMax.rotation[1], r);

                var o = layer.property("Opacity").value;
                minMax.opacity[0] = Math.min(minMax.opacity[0], o);
                minMax.opacity[1] = Math.max(minMax.opacity[1], o);
            }

            if (showAlert) {
                alert(
                    "Analyzed Property Ranges:\n" +
                    "Position X: " + Math.round(minMax.posX[0]) + " to " + Math.round(minMax.posX[1]) + "\n" +
                    "Position Y: " + Math.round(minMax.posY[0]) + " to " + Math.round(minMax.posY[1]) + "\n" +
                    "Position Z: " + Math.round(minMax.posZ[0]) + " to " + Math.round(minMax.posZ[1]) + "\n" +
                    "Scale: " + Math.round(minMax.scale[0]) + " to " + Math.round(minMax.scale[1]) + "\n" +
                    "Rotation: " + Math.round(minMax.rotation[0]) + " to " + Math.round(minMax.rotation[1]) + "\n" +
                    "Opacity: " + Math.round(minMax.opacity[0]) + " to " + Math.round(minMax.opacity[1])
                );
            }

            return minMax;
        }

        randomizeBtn.onClick = function() {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                alert("Please select a composition.");
                return;
            }

            var time = comp.time;
            var minX = parseValue(posFields[0].text), maxX = parseValue(posFields[1].text);
            var minY = parseValue(posFields[2].text), maxY = parseValue(posFields[3].text);
            var minZ = parseValue(posFields[4].text), maxZ = parseValue(posFields[5].text);
            var scaleMin = parseValue(scaleFields[0].text), scaleMax = parseValue(scaleFields[1].text);
            var rot2DMin = parseValue(rot2DFields[0].text), rot2DMax = parseValue(rot2DFields[1].text);
            var rot3DMinX = parseValue(rot3DFields[0].text), rot3DMaxX = parseValue(rot3DFields[1].text);
            var rot3DMinY = parseValue(rot3DFields[2].text), rot3DMaxY = parseValue(rot3DFields[3].text);
            var rot3DMinZ = parseValue(rot3DFields[4].text), rot3DMaxZ = parseValue(rot3DFields[5].text);
            var opMin = parseValue(opacFields[0].text), opMax = parseValue(opacFields[1].text);

            app.beginUndoGroup("Randomize Properties");

            for (var i = 0; i < comp.selectedLayers.length; i++) {
                var layer = comp.selectedLayers[i];

                var pos = layer.property("Position").value.slice();
                if (minX !== null && maxX !== null) pos[0] = getRandom(minX, maxX);
                if (minY !== null && maxY !== null) pos[1] = getRandom(minY, maxY);
                if (layer.threeDLayer && minZ !== null && maxZ !== null) pos[2] = getRandom(minZ, maxZ);
                layer.property("Position").setValue(pos);

                if (scaleMin !== null && scaleMax !== null) {
                    var s = getRandom(scaleMin, scaleMax);
                    layer.property("Scale").setValue([s, s, s]);
                }

                if (layer.threeDLayer) {
                    if (rot3DMinX !== null && rot3DMaxX !== null)
                        layer.property("X Rotation").setValue(getRandom(rot3DMinX, rot3DMaxX));
                    if (rot3DMinY !== null && rot3DMaxY !== null)
                        layer.property("Y Rotation").setValue(getRandom(rot3DMinY, rot3DMaxY));
                    if (rot3DMinZ !== null && rot3DMaxZ !== null)
                        layer.property("Z Rotation").setValue(getRandom(rot3DMinZ, rot3DMaxZ));
                } else {
                    if (rot2DMin !== null && rot2DMax !== null)
                        layer.property("Rotation").setValue(getRandom(rot2DMin, rot2DMax));
                }

                if (opMin !== null && opMax !== null)
                    layer.property("Opacity").setValue(getRandom(opMin, opMax));
            }

            app.endUndoGroup();
        };

        analyzeBtn.onClick = function() { analyzeLayers(true); };
        importBtn.onClick = importRanges;
        clearAllBtn.onClick = clearAllFields;

        win.layout.layout(true);
        return win;
    }

    var myUI = buildUI(thisObj);
    if (myUI instanceof Window) {
        myUI.center();
        myUI.show();
    }
})(this);
