import * as THREE from 'three'
import { gui_global_params } from './gui01.js';
import { mat_face_transp } from "./IDF_Import.js";
import { gui } from "./sceneCreation.js";
import { group_getZoneGroups, scene_full } from './sceneObjManage.js';

//gui

export function gui_groupsFolder_add_printZones_inHtmlDiv() {

    // add properties
    // msg error no importa
    gui_global_params.printZones_inHtmlDiv = htmlPrintZones;

    gui.__folders['Groups LAB']
        .add(gui_global_params, 'printZones_inHtmlDiv')
        .name('Zone names')
        .title('Llista de noms de les zones. El text queda copiat al portapapers.');

}

export function clickable() {
    let clickableTxt = document.getElementById('clickable_leftBarTogle');

    clickableTxt.addEventListener('click', () => {

        let ele = document.getElementById('container');
        ele.innerHTML = '';
        ele.style.display = 'none';

    });
}


export function copyTxtToClipBoard(txt) {
    //font https://www.w3schools.com/howto/howto_js_copy_clipboard.asp

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(txt);

    /* Alert the copied text */
    //alert("Copied the text: " + copyText.value);
}

export function htmlPrintZones(checkRepeat = false) {

    let eleContainer = document.getElementById('container');

    // hagut de crear aquest childelement per anular l'efecte style direction: ltr; que em desordenava el contingut
    let ele = document.getElementById('subContainer');
    ele.innerHTML = "";

    let txtToClipBoard = [];

    eleContainer.style.display = 'inline';
    // ele.style.display = 'inline';
    ele.innerHTML += '<br>(aquest txt està copiat al portapapers)<br><br>';
    ele.innerHTML += 'Nom de zones importades<br><br>';
    txtToClipBoard.push('Nom de zones importades');
    txtToClipBoard.push('');

    let htmltxt = '';

    group_getZoneGroups()
        .forEach(G => {
            htmltxt += '( ' + G.userData.reportId + ' )&emsp;' + G.userData.parentZone + '<br>';;
            txtToClipBoard.push('(\t' + G.userData.reportId + '\t)\t' + G.userData.parentZone);
        });

    ele.innerHTML += htmltxt.toString();

    if (checkRepeat) {
        for (let i = 0; i < 3; i++) {
            group_getZoneGroups()
                .forEach(G => {
                    htmltxt += '(&emsp;' + G.userData.reportId + '&emsp;)&emsp;' + G.userData.parentZone + '<br>';;
                    txtToClipBoard.push('(\t' + G.userData.reportId + '\t)\t' + G.userData.parentZone);
                });
            ele.innerHTML += htmltxt.toString();

        }
    }

    ele.innerHTML += '<br><span id="clickable_leftBarTogle" class="clickableText">&nbsp;X Close&nbsp;</span>';
    clickable();

    copyTxtToClipBoard(txtToClipBoard.join('\r\n'))

}