import * as THREE from 'three';
import { gui, scene } from './sceneCreation.js';
import { arrayOfZoneCenterVtx, group_getZoneGroups, moure_byZoneCenterVtx, scene_full } from './sceneObjManage.js';
import { CSS2DObject } from '../utils/CSS2DRenderer.js';
import { gui_global_params } from './gui01.js';
import { mat_face_transp, mat_windows_transp, newFetch } from './IDF_Import.js';

//// GUI

export function gui_folder_Labelactions() {

    gui_global_params.labels_Z_ajust = 0;
    gui_global_params.labels_create = label_createAll;
    gui_global_params.labels_remove_all = labels_remove_all;
    gui_global_params.labels_changeStyleColor = '#d7ffd7';
    gui_global_params.labels_opac = 0.5;
    gui_global_params.labels_changesize = 15;
    gui_global_params.labels_changeBoldBoolean = false;
    gui_global_params.jsonLabels = false;
    gui_global_params.jsonOpacity = false;

    let folder_labelsLAB = gui.__folders['Labels LAB'];

    folder_labelsLAB.add(gui_global_params, 'labels_Z_ajust').min(-10).max(+10).step(0.1).name('Z ajust')
    folder_labelsLAB.add(gui_global_params, 'labels_create');
    folder_labelsLAB.add(gui_global_params, 'labels_remove_all');
    folder_labelsLAB.addColor(gui_global_params, 'labels_changeStyleColor')
        .onChange(function (v) { labels_changeStyleColor(v); });

    folder_labelsLAB.add(gui_global_params, 'labels_opac').min(0).max(1).step(0.01)
        .onChange(function (v) { labels_changeBackgrOpacity(v) });; //.listen();
    folder_labelsLAB.add(gui_global_params, 'labels_changesize')
        .min(0).max(50).step(1)
        .onChange(function (v) { labels_change_fontSize(v); });

    folder_labelsLAB.add(gui_global_params, 'labels_changeBoldBoolean').name('Labels en negreta?')
        .onChange(function (value) {
            labels_change_fontWeightBold(value);
        });

    folder_labelsLAB.add(gui_global_params, 'jsonLabels').name('reportId desde JSON')
        .onChange(function (value) {
            if (value == true) jsonLabels(); else idfLabels();
        });

    folder_labelsLAB.add(gui_global_params, 'jsonOpacity').name('Opacity desde JSON')
        .onChange(function (value) {
            if (value == true) objectsJsonOpacity(); else objectsBackToNormalMaterialAfterJsonOpacity();
        });

    // folder_labelsLAB.open();
}

// scene.remove()

export function label_consoleLogAll() {
    let get = scene_full()
        .filter(Z => Z.userData.objectType == 'label');
    // console.log('get:', get)
}


export function label_new_prev_xxx(text, vtx) {

    const newLabel = document.createElement('div');
    newLabel.className = 'label';
    newLabel.textContent = text;
    // newLabel.style.marginTop = '-1em';

    const label = new CSS2DObject(newLabel);
    label.position.set(vtx.x, vtx.y, vtx.z);
    label.userData.parentZone = text;
    label.userData.objectType = 'label';
    scene.add(label);

}

export function label_new(group) {

    const newLabel = document.createElement('div');
    newLabel.className = 'label';
    newLabel.textContent = group.userData.parentZone;
    const label = new CSS2DObject(newLabel);
    label.position.set(0, 0, gui_global_params.Z_ajust);
    label.userData.parentZone = group.name;
    label.userData.objectType = 'label';
    label.element.style.backgroundColor = colorTranslateToStyleFormat(gui_global_params.labels_changeStyleColor)
    group.add(label);
    // console.log('label:', label.element.style.backgroundColor)

}

export function label_createAll() {

    let sceneSelectedGroups = scene_full()
        .filter(O => O.type == 'Group' & O.name.includes("zoneGroup:"));

    sceneSelectedGroups
        .forEach(Z => {
            label_new(Z);
        });

    // labels_changeStyleColor(gui_global_params.labels_changeStyleColor)

    // label_consoleLogAll()
}

// moure labels 
export function labels_move(perc, zoneCenterVtx_array, justZoneNamesAgain, xy0_o_z1) {

    let sceneSelectedLabels = scene_full()
        .filter(Z => Z.userData.objectType == "label");

    sceneSelectedLabels
        .forEach(Z => {

            let cVtx = zoneCenterVtx_array[justZoneNamesAgain.indexOf(Z.userData.parentZone)][1];
            // console.log('cVtx:', cVtx)
            moure_byZoneCenterVtx(Z, cVtx, perc, xy0_o_z1)
        });

}

// remove labels 
function labels_remove_all() {
    labels_getAllFromZoneGroups()
        .forEach(Z => Z.removeFromParent());
}

function colorTranslateToStyleFormat(colorHexText) {
    let color1 = new THREE.Color(colorHexText);
    let opacity = gui_global_params.labels_opac
    var str = 'rgba(' + color1.r * 100 + '%, ' + color1.g * 100 + '%, ' + color1.b * 100 + '%, ' + opacity + ')'
    return str;
}

export function labels_changeStyleColor(color) {
    var str = colorTranslateToStyleFormat(color);
    var all = document.getElementsByClassName('label');
    for (var i = 0; i < all.length; i++) {
        all[i].style.background = str;
    }
}

function labels_changeBackgrOpacity(opac) {
    var all = document.getElementsByClassName('label');
    let currentColor = window.getComputedStyle(all[0]).backgroundColor;

    let splitOpacityValue = currentColor.split(",");//[3].split(")")[0].trim();
    let newString = [];

    for (let i = 0; i < splitOpacityValue.length - 1; i++) {
        newString.push(splitOpacityValue[i]);
    }

    newString.push(opac + ')');

    var str = newString.join(',');

    for (var i = 0; i < all.length; i++) {
        all[i].style.background = str;
        // console.log('all[i]:', all[i])
    }
}

function labels_change_fontSize(fontSize) {
    var all = document.getElementsByClassName('label');
    let currentfontsize = window.getComputedStyle(all[0]).getPropertyValue('font-size');
    // console.log('currentfontsize:', currentfontsize)


    for (var i = 0; i < all.length; i++) {
        all[i].style.fontSize = fontSize + 'px';
        // console.log('all[i]:', all[i])
    }
}

function labels_change_fontWeightBold(value) {
    var all = document.getElementsByClassName('label');
    // let currentfontsize = window.getComputedStyle(all[0]).getPropertyValue('font-weight');
    // console.log('currentfontsize:', currentfontsize)

    if (value == true) {
        for (var i = 0; i < all.length; i++) {
            all[i].style.fontWeight = 'bold';
            // console.log('all[i]:', all[i])
        }
    }

    if (value == false) {
        for (var i = 0; i < all.length; i++) {
            all[i].style.fontWeight = 'lighter';
            // console.log('all[i]:', all[i])
        }
    }



}

function labels_getAllFromZoneGroups() {

    let gr = scene_full()
        .filter(Z => Z.type == "Group");

    let grLabels = []
    gr.forEach(gr => gr.traverse(Z => grLabels.push(Z)));

    return grLabels.filter(Z => Z.userData.objectType == "label");
}

function jsonLabels() {

    let parseData;
    // read jason
    newFetch("../json/data01.json").then((result) => {
        // let parseData;
        try {
            parseData = JSON.parse(result);
            // console.log('parseData:', parseData)
            // console.log('parseData:', parseData.find(Z => Z.name == 'B:1'))

            // parseData[0].reportId
            // console.log('parseData[0].reportId:', parseData[0].reportId)

            let getLabels = []
            group_getZoneGroups().forEach(Z => Z.traverse(I => { if (I.type == 'Object3D' && I.userData.objectType == 'label') getLabels.push(I) }));

            // console.log('getLabels:', getLabels)
            getLabels.forEach(Z => {

                let originalLabel = Z.element.innerHTML;
                // console.log('originalLabel:', originalLabel)

                let itsReportIdFromJson = parseData.find(j => j.name == originalLabel).reportId;
                // console.log('itsReportIdFromJson:', itsReportIdFromJson)

                Z.userData.originalIdfId = originalLabel;
                Z.element.innerHTML = itsReportIdFromJson;
                Z.userData.reportId = itsReportIdFromJson;
                Z.parent.userData.reportId = itsReportIdFromJson;
                // console.log('Z.parent:', Z.parent)

            })

            // console.log(getLabels.map(Z => Z.element.innerHTML))


        } catch (error) {
            parseData = result;
            // console.log('parseData:', parseData)
        }
    });
}

function idfLabels() {

    let getLabels = []
    group_getZoneGroups().forEach(Z => Z.traverse(I => { if (I.type == 'Object3D' && I.userData.objectType == 'label') getLabels.push(I) }));

    getLabels.forEach(Z => {

        Z.element.innerHTML = Z.userData.originalIdfId;

    })

    // console.log(getLabels.map(Z => Z.element.innerHTML))



}

function objectsJsonOpacity() {

    let parseData;
    // read jason
    newFetch("../json/data01.json").then((result) => {
        // let parseData;
        try {
            parseData = JSON.parse(result);

            group_getZoneGroups().forEach(Z => {

                let gmaterial = mat_face_transp.clone();
                gmaterial.opacity = parseData.find(j => j.name == Z.userData.parentZone).energy;
                let gmaterial_win = gmaterial.clone();
                gmaterial_win.opacity = 0;
                // gmaterial_win.polygonOffset = true;
                // gmaterial_win.polygonOffsetFactor = -1;
                // console.log('gmaterial.opacity:', gmaterial.opacity)
                Z.traverse(o => {

                    if (o.type == 'Mesh') {
                        o.material = gmaterial;

                        //no se pq, es necessita el try...
                        try {
                            if (o.userData.idfName.includes('_Win')) {
                                o.material = gmaterial_win;
                            }

                        } catch (error) {

                        }
                    };

                })
            })

            // console.log(getLabels.map(Z => Z.element.innerHTML))


        } catch (error) {
            parseData = result;
            // console.log('parseData:', parseData)
        }
    });

}

function objectsBackToNormalMaterialAfterJsonOpacity() {

    group_getZoneGroups().forEach(Z => {

        Z.traverse(o => {

            if (o.type == 'Mesh') {
                o.material = mat_face_transp;

                //no se pq, es necessita el try...
                try {
                    if (o.userData.idfName.includes('_Win')) {
                        o.material = mat_windows_transp;
                    }

                } catch (error) {

                }
            };

        })
    })

}







