
import { animate, controls, gui, init, render, scene } from "./sceneCreation.js";
import { readSingleFile_partA } from "../utils/fileReader.js";
import { sceneRemoveObjects, fullIdfObjectsBoundingBox, moureZonesIdf } from "./sceneObjManage.js";
import { controllers } from '../utils/dat.gui.module.js'; // antic dat.controllers

// GUI

// necessari per fer apareixer tooltip
function addPropertiesToGuiControllers() {
    // font
    // exemple amb boto d'exportar data  molt interessant (liniea de codi molt senzilla)
    // tot i que jo ho he adaptat per entendre millor
    // https://codepen.io/polkadotsandsky/pen/VwwBZbG
    for (var controllerName in controllers) {  // cada controller
        if (controllers.hasOwnProperty(controllerName)) { // en cas que tingui propietat que es el seu propi nom
            if (!controllers[controllerName].prototype.hasOwnProperty('title')) { //si encara no té subpropietat title
                controllers[controllerName].prototype.title = function (v) { // llavors se li afegeix una propietat
                    // __li is the root dom element of each controller
                    if (v) { this.__li.setAttribute('title', v); }
                    else { this.__li.removeAttribute('title') }
                    return this;
                };
            }
        }
    }
}

//////////////////
// fx necessaries per l'efecte de nomes un folder obert

export function theRestFoldersFolded() {

    // gui__folders

    let current_gui_folders_firstLevel = Object.getOwnPropertyNames(gui.__folders);

    let current_gui_folders_firstLevel_names_thatAreProps = []

    current_gui_folders_firstLevel
        .forEach(i => {
            current_gui_folders_firstLevel_names_thatAreProps.push(i.toString())
        });

    // no m'agrada la via getElementsByClassName pq no es deixa iterar facil
    // var x = [];
    // document.getElementsByClassName("title").forEach(Z=>x.push(Z.textContent));

    // millor la via document.querySelectorAll
    var htmlElements_ofFoldersFirstLevel = [];
    document.querySelectorAll('li.title')
        .forEach(Z => {
            htmlElements_ofFoldersFirstLevel.push(Z)
        });

    htmlElements_ofFoldersFirstLevel = htmlElements_ofFoldersFirstLevel.filter(Z => current_gui_folders_firstLevel_names_thatAreProps.indexOf(Z.innerHTML) > -1);

    htmlElements_ofFoldersFirstLevel.forEach(Z => Z.addEventListener("click", function () {
        theRestFolders(Z.innerHTML);
    }))

}

function theRestFolders(thisFolderName) {

    // gui__folders

    let current_gui_folders_firstLevel = Object
        .getOwnPropertyNames(gui.__folders)
        .filter(Z => Z != thisFolderName);

    current_gui_folders_firstLevel
        .forEach(i => {
            gui.__folders[i].close();
        });
}

// GUI params
// ho he fet Global per poder anar afegint...
export var gui_global_params = {
    color: '#ffae23',
    explotar: 1,
    idfFile: function () {
        clickableLoadTxt.click();
    },
    text: "",
    clear_Scene: sceneRemoveObjects,
    idf_FullVertex: fullIdfObjectsBoundingBox,
    // fx_just_now: LAB_fx,

    // empty fx : 
    fx_just_now: () => { }
    // per omlpir el fx_just_now s'ha de fer el seguent desde qualsevol arxiu js:
    //gui_global_params.fx_just_now = () => { console.log('exemple nova funció')}
};

export function gui_firstFoldersStructure() {

    // necessari per clicks & load file...
    let clickableLoadTxt = document.getElementById('myInput');
    clickableLoadTxt.addEventListener('change', readSingleFile_partA, false);

    // tooltips
    addPropertiesToGuiControllers();
    // addclickEvent();

    // GUI folder cnfg

    gui.remember(gui_global_params);

    gui.add(gui_global_params, 'fx_just_now').name('LAB').title('Es fa servir per executar funcions de prova');

    let folder_camera_actions = gui.addFolder('Camera settings');//.clickhideOthers('xxx');
    folder_camera_actions.close()

    let folder_IdfSettings = gui.addFolder('IDF settings'); //.color(0x00ff00);
    folder_IdfSettings.close();
    // folder_IdfSettings.open();

    let folder_GroupsLab = gui.addFolder('Groups LAB');
    // folder_GroupsLab.open();
    folder_GroupsLab.close();

    var folder_labelsLAB = gui.addFolder('Labels LAB');
    // folder_labelsLAB.open();
    folder_labelsLAB.close();

    var folder_txtLAB = gui.addFolder('Text LAB');
    folder_txtLAB.open();
    // folder_txtLAB.close();

    gui_global_params.txtLab = () => { };
    let txt = folder_txtLAB.add(gui_global_params, 'txtLab').name('this is txt.:aaa</br>this is txt.:aaa</br>this is txt.:aaa</br>this is txt.:aaa</br>this is txt.:aaa</br>this is txt.:aaa</br>')

}

// primer poso el gran LAB per poder escriure tests
gui_global_params.fx_just_now = () => {
    /*empty void*/
    controllerLongText();

    


};

// aquesta fx fa que el text style d'un gui controller ocupi el 100% del div
function controllerLongText() {
    let aaa = gui.__folders['Text LAB'].__ul.childNodes[1].classList += ' longtext';
    console.log('aaa:', aaa)
}