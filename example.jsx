
(function resetTransformUI() {
    var win = new Window("palette", "Reset Transform", undefined);
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];

    var btn = win.add("button", undefined, "Reset Transform");

    btn.onClick = function () {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Please select at least one layer.");
            return;
        }

        app.beginUndoGroup("Reset Transform");

        function resetProp(prop, value) {
            if (prop.numKeys > 0) {
                for (var k = prop.numKeys; k >= 1; k--) {
                    prop.removeKey(k);
                }
            }
            prop.setValue(value);
        }

        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var t = layer.transform;

            // Position
            try {
                var defaultPos = [comp.width / 2, comp.height / 2];
                if (layer.threeDLayer) defaultPos.push(0);
                resetProp(t.position, defaultPos);
            } catch (e) {}

            // Anchor Point via sourceRectAtTime
            try {
                var rect = layer.sourceRectAtTime(comp.time, false);
                var center = [rect.left + rect.width / 2, rect.top + rect.height / 2];
                if (layer.threeDLayer) center.push(0);
                resetProp(t.anchorPoint, center);
            } catch (e) {}

            // Scale
            try {
                var scaleVal = layer.threeDLayer ? [100, 100, 100] : [100, 100];
                resetProp(t.scale, scaleVal);
            } catch (e) {}

            // Rotation(s)
            try { resetProp(t.rotation, 0); } catch (e) {}
            try { resetProp(t.xRotation, 0); } catch (e) {}
            try { resetProp(t.yRotation, 0); } catch (e) {}
            try { resetProp(t.zRotation, 0); } catch (e) {}

            // Opacity
            try { resetProp(t.opacity, 100); } catch (e) {}
        }

        app.endUndoGroup();
    };

    win.center();
    win.show();
})();
