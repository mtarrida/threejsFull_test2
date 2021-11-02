import { idf_fullManageAndSceneAddObjects } from "../threejsx/IDF_Import.js";
import { idf_fullManageAndSceneAddObjects_windows } from "../threejsx/IDF_import_windows.js";
import { gui, scene } from "../threejsx/sceneCreation.js";
import { floors_Z_explode, fullIdfObjectsBoundingBox, group_createAllzones, moureZonesIdf } from "../threejsx/sceneObjManage.js";

var fileContent;
var reader = new FileReader();

// GUI 

export function gui_idfLoadActions() {

    // necessari per clicks & load file...
    let clickableLoadTxt = document.getElementById('myInput');
    clickableLoadTxt.addEventListener('change', readSingleFile_partA, false);

    // GUI params
    var gui_params_idfLoadActions = {
        idfFile: function () {
            clickableLoadTxt.click();
        },
        clear_Scene: sceneRemoveObjects,
        explotar: 1,
    };

    // GUI folder cnfg

    var folder_IdfLoad = gui.__folders['IDF settings'].addFolder('IDF clear / load')/*.title('wwww')*/;//.color(0x00ff00);    
    folder_IdfLoad.close();
    folder_IdfLoad.add(gui_params_idfLoadActions, 'clear_Scene').name('Clear');
    folder_IdfLoad.add(gui_params_idfLoadActions, 'idfFile')

    var folder_IdfExplotion = gui.__folders['IDF settings'].addFolder('IDF LAB');//.color(0x00ff00);
    folder_IdfExplotion.close();
    folder_IdfExplotion.add(gui_params_idfLoadActions, 'explotar').min(1).max(3).step(0.01).name('IDF_explode_xy')
        .onChange(function (value) {
            moureZonesIdf(value, 0);
        })
    folder_IdfExplotion.add(gui_params_idfLoadActions, 'explotar').min(1).max(10).step(0.01).name('IDF_explode_z')
        .onChange(function (value) {
            floors_Z_explode(value,false)
            // moureZonesIdf(value, 1)
        })
}

////////////////////////////////

// readSingleFile_partA
export function readSingleFile_partA(e) {
    var file = e.target.files[0];
    console.log('file:', file)

    if (!file) {
        return;
    }

    reader.onload = function (e) {
        var contents = e.target.result;
        console.clear();
        // console.log(contents);

        fileContent = contents;
        // displayContents(contents);
        readSingleFile_partB(fileContent);
        // idf_fullManageAndSceneAddObjects(fileContent);
        // idf_fullManageAndSceneAddObjects_windows(fileContent);
        // fullIdfObjectsBoundingBox();
        // group_createAllzones();
    };
    // scene.clear();
    reader.readAsText(e.target.files[0]);

    // E.target.files[0].reset(); // ELIMINAR
    e.target.files[0].reset();
}

// readSingleFile_partB
export function readSingleFile_partB(fileContent) {
    idf_fullManageAndSceneAddObjects(fileContent);
    idf_fullManageAndSceneAddObjects_windows(fileContent);
    fullIdfObjectsBoundingBox();
    group_createAllzones();
}

// scene clear
export function sceneRemoveObjects() {
    scene.clear();
}