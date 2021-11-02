import * as THREE from 'three'
import { i_createObjectFromOneSurface, edge_points_fx, face_points_fx, fullStrSplitAndClear, idf_oneSrf_brutLines, idf_allSrfClass } from './IDF_Import.js';
import { gui, scene } from './sceneCreation.js'
import { fullIdfObjectsBoundingBox } from './sceneObjManage.js';


export function idf_fullManageAndSceneAddObjects_windows(idfData) {

    var lines = fullStrSplitAndClear(idfData);
    var idf_wins_brutLines = idf_getWindows_brutLines(lines);
    var srf_array = idf_allSrfClass(idf_wins_brutLines, '!- Window name');
    srf_array
        // .filter(Z => Z.objectName.toLowerCase().includes(srfInclude.toLowerCase()))
        .forEach(Z => {
            var faces = face_points_fx(Z);
            var edges = edge_points_fx(Z);
            i_createObjectFromOneSurface(Z.objectName, faces, edges);
        });
}

function idf_getWindows_brutLines(lines) {

    // get surface start indexes
    var indexes = lines.multiIndexOf("FenestrationSurface:Detailed,");
    var idf_srf_brutLines = new Array();
    indexes.forEach(Z =>
        idf_srf_brutLines
            .push(idf_oneSrf_brutLines(lines, Z))
    );

    idf_srf_brutLines = idf_srf_brutLines.filter(S => !S.find(D => D.includes('Extra Crack')));

    // console.log('idf_srf_brutLines:', idf_srf_brutLines)
    return idf_srf_brutLines;
}

///funció aplicable a les Arrays
Array.prototype.multiIndexOf = function (el) {
    var idxs = [];
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i].includes(el)) {
            idxs.unshift(i);
        }
    }
    return idxs;
};