// import * as THREE from 'three'
import { init, animate, guiAddCameraCntrls } from "./sceneCreation.js";
import { gui_idfFolder_addFolder_displayParameters, idf_fullManageAndSceneAddObjects, mat_face_transp, mat_windows_transp, newFetch } from './IDF_Import.js'
import { gui_firstFoldersStructure, gui_global_params, theRestFoldersFolded } from "./gui01.js";
import { gui_folderIdfLab_addAction_OpacityTransitionLAB } from './opacity_fx.js';
import { fullIdfObjectsBoundingBox, group_createAllzones, gui_GroupActions } from './sceneObjManage.js'
import { gui_groupsFolder_add_printZones_inHtmlDiv } from "./htmFromJs.js";
import { idf_fullManageAndSceneAddObjects_windows } from "./IDF_import_windows.js";
import { guiAddRaycasterActions } from "./rayCasterActions.js";
import { gui_idfLoadActions as gui_idfLoadActions } from "../utils/fileReader.js";
import { gui_folder_Labelactions, labels_changeStyleColor, label_createAll } from "./labels.js";
import { hvacZoneTypesFromJson } from "./hvacZoneTypesFromJson.js";

function gui() {
    gui_firstFoldersStructure(); // reactivar
    guiAddCameraCntrls();
    gui_idfLoadActions();
    gui_GroupActions();
    guiAddRaycasterActions();
    gui_groupsFolder_add_printZones_inHtmlDiv();
    gui_idfFolder_addFolder_displayParameters();
    gui_folderIdfLab_addAction_OpacityTransitionLAB();
    gui_folder_Labelactions();
}

// get data from gui
function startMaterialsUpdateFromgui() {
    mat_face_transp.color.set(gui_global_params.face_color);
    mat_face_transp.opacity = gui_global_params.face_opac;
    mat_windows_transp.opacity = gui_global_params.face_opac;
}


init();

gui(); // millor crear aqui

// degut a la llogica fetch, nomes ho puc fer aixi...
// newFetch("../models/model_2.idf").then((result) => {
// newFetch("./models/model_2.idf").then((result) => {
newFetch("./models/in.idf").then((result) => {
    // newFetch("../public/models/model_2.idf").then((result) => {
    idf_fullManageAndSceneAddObjects(result);
    idf_fullManageAndSceneAddObjects_windows(result);
    fullIdfObjectsBoundingBox();
    group_createAllzones();
    label_createAll();

});

startMaterialsUpdateFromgui();

theRestFoldersFolded(); // sha de posar despres de crear tot el gui

hvacZoneTypesFromJson();

animate();

