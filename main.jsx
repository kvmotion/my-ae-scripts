{
  const win = new Window("palette", "Folder Builder", undefined);
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];

  const btn = win.add("button", undefined, "Create Folder Structure");

  btn.onClick = function () {
    function createFolder(name, parent) {
      var folder = app.project.items.addFolder(name);
      if (parent) folder.parentFolder = parent;
      return folder;
    }

    app.beginUndoGroup("Create Project Folder Structure");

    var mainFolder = createFolder("Project");
    var editFolder = createFolder("01. Edit", mainFolder);
    createFolder("Image", editFolder);
    createFolder("Sound", editFolder);
    createFolder("Text", editFolder);
    createFolder("02. Final", mainFolder);
    createFolder("03. Other", mainFolder);

    app.endUndoGroup();
    alert("Structure created!");
  };

  win.center();
  win.show();
}
