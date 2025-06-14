
(function(thisObj) {
    function createUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "BG Color Tools", undefined, {resizeable:true});
        win.orientation = "column";
        win.alignChildren = "center";

        var btnChangeColor = win.add("button", undefined, "Change BG Color");

        var iconGroup = win.add("group");
        iconGroup.orientation = "row";
        iconGroup.alignment = "center";
        iconGroup.spacing = 10;

        var btnBlack = iconGroup.add("button", undefined, "Black");
        btnBlack.size = [60, 25];

        var btnWhite = iconGroup.add("button", undefined, "White");
        btnWhite.size = [60, 25];

        // Получение списка композиции: выделенные или активная
        function getTargetComps() {
            var selectedComps = [];
            var selection = app.project.selection;

            for (var i = 0; i < selection.length; i++) {
                if (selection[i] instanceof CompItem) {
                    selectedComps.push(selection[i]);
                }
            }

            // Если ничего не выбрано — взять активную композицию
            if (selectedComps.length === 0 && app.project.activeItem instanceof CompItem) {
                selectedComps.push(app.project.activeItem);
            }

            return selectedComps;
        }

        // Применение цвета к композициям
        function applyColorToComps(rgbColor) {
            var comps = getTargetComps();
            if (comps.length === 0) {
                alert("Please select or open at least one composition.");
                return;
            }

            app.beginUndoGroup("Set Background Color");
            for (var i = 0; i < comps.length; i++) {
                comps[i].bgColor = rgbColor;
            }
            app.endUndoGroup();
        }

        // Открытие color picker
        btnChangeColor.onClick = function() {
            var pickedColor = $.colorPicker();
            if (pickedColor !== null) {
                var rgb = [
                    ((pickedColor >> 16) & 255) / 255,
                    ((pickedColor >> 8) & 255) / 255,
                    (pickedColor & 255) / 255
                ];
                applyColorToComps(rgb);
            }
        };

        btnBlack.onClick = function() {
            applyColorToComps([0, 0, 0]);
        };

        btnWhite.onClick = function() {
            applyColorToComps([1, 1, 1]);
        };

        if (win instanceof Window) {
            win.center();
            win.show();
        } else {
            win.layout.layout(true);
        }
    }

    createUI(thisObj);
})(this);
