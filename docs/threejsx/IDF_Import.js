import * as THREE from 'three'
import { gui_global_params } from './gui01.js';
import { gui, scene } from './sceneCreation.js'
import { fullIdfObjectsBoundingBox, group_createAllzones } from './sceneObjManage.js';

class surface {
    constructor(objectName, vertexes) {
        this.objectName = objectName;
        this.vertexArray = vertexes;
    }
}

export let mat_face_transp = new THREE.MeshBasicMaterial({
    color: 0xf0ff97,
    opacity: .7,
    transparent: true,
    // side: THREE.DoubleSide,
    side: THREE.FrontSide,
});

export let mat_windows_transp = new THREE.MeshBasicMaterial({
    color: 0x00cdff,
    opacity: .4,
    transparent: true,
    side: THREE.DoubleSide,
    // side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,//0.1,

});

var mat_lines_blue = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 4,

});

///////////////////
// gui

// var conf = {
//     color: '#f0ff97',
//     opac: 0.7,
// }

export function gui_idfFolder_addFolder_displayParameters() {

    gui_global_params.face_color = '#f0ff97';
    gui_global_params.face_opac = 0.7;

    let idfImportGeneral = gui.__folders['IDF settings'].addFolder('Display parameters');
    idfImportGeneral.close();
    idfImportGeneral.open();

    idfImportGeneral.addColor(gui_global_params, 'face_color')//.listen();
        .onChange(function (v) {
            mat_face_transp.color.set(v);
        });
    ;

    idfImportGeneral.add(gui_global_params, 'face_opac').min(0).max(1).step(0.01).name('Opacitat màxima')
        .onChange(function (v) {
            mat_face_transp.opacity = v
        }); //.listen();
}


////////////////////////

export function fullStrSplitAndClear(data) {
    return data.split(/\r\n|\n/);
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

export function idf_oneSrf_brutLines(lines, indexTurn) {

    var sliceLines = lines.slice(indexTurn, indexTurn + 100);

    //search last vertexline    
    var vertexNum_subIndex = -1;
    var vertexNum = -1;
    var numberOfItemsUntilLastVertex = -1;
    var ctr = -1;
    var whileState = true;

    sliceLines.forEach(element => {
        ++ctr;
        if (
            element.includes("!- Number vertices")
            &&
            whileState
        ) {
            whileState = false;
            vertexNum_subIndex = ctr;
            vertexNum = element.split(",")[0].trim();
            numberOfItemsUntilLastVertex = 1 + Number(vertexNum_subIndex) + Number(vertexNum);
            //chk
            // console.log("!!! " + vertexNum_subIndex + ": " + element);
            // console.log(vertexNum);
            // console.log(vertexLast_subIndex);

        }
    });

    sliceLines = sliceLines.slice(0, numberOfItemsUntilLastVertex);
    //chk
    // sliceLines.forEach(Z => console.log(Z))

    return sliceLines;
}

function idf_getSrf_brutLines(lines) {

    // get surface start indexes
    var indexes = lines.multiIndexOf("BuildingSurface:Detailed,");
    //chk
    // console.log('primera linea trobada');
    // console.log(indexes[0]);

    var idf_srf_brutLines = new Array();
    indexes.forEach(Z =>
        idf_srf_brutLines
            .push(idf_oneSrf_brutLines(lines, Z))
    );

    idf_srf_brutLines = idf_srf_brutLines.filter(S => !S.find(D => D.includes('Extra Crack')));

    return idf_srf_brutLines;
}

function idf_oneSrf_newClass(sliceLines, included = '!- Surface name') {

    var srfName = sliceLines
        .find(Z => Z.includes(included))
        .replace('FenestrationSurface:Detailed, ', '') // necessari per corregir el nom de finestres
        .split(",")[0].trim();
    // console.log('srfName:', srfName)

    var srfVtxArray = sliceLines
        .filter(Z => Z.includes('!- Vertex'))
        .map(
            Z => Z.trim().split(",").slice(0, 3)
                .map(X => {
                    if (X.includes(";")) {
                        return X.split(";")[0]
                    } else { return X; }
                }
                )
                .map(
                    M => (Math.round(Number(M) / 0.05) * 0.05).toFixed(2)
                )

        )
        .filter(x => x !== undefined);
    // console.log('srfVtxArray:', srfVtxArray)



    //chk
    // console.log(srfVtxArray[0])

    return new surface(srfName, srfVtxArray)
}

export function idf_allSrfClass(idf_srf_brutLines, str = '!- Surface name') {
    return idf_srf_brutLines.map(Z => idf_oneSrf_newClass(Z, str));
}

export function face_points_fx(surfClass) {

    // i.vertexArray.forEach(Z => console.log("\t " + Z))
    let counter = 0;
    const i_face_points = [];

    // primer punt
    let puntComu = new THREE.Vector3(
        surfClass.vertexArray[0][0],
        surfClass.vertexArray[0][1],
        surfClass.vertexArray[0][2]
    )
    // console.log(puntComu)

    // push points creant triangles
    // important de tiem (desde 0) 1 a llarg-2
    for (var po = 1; po < (surfClass.vertexArray.length - 1); po++) {
        // console.log('z')
        i_face_points.push(puntComu);

        let puntA = new THREE.Vector3(
            surfClass.vertexArray[po][0],
            surfClass.vertexArray[po][1],
            surfClass.vertexArray[po][2]
        )
        i_face_points.push(puntA);

        let puntB = new THREE.Vector3(
            surfClass.vertexArray[po + 1][0],
            surfClass.vertexArray[po + 1][1],
            surfClass.vertexArray[po + 1][2]
        )
        i_face_points.push(puntB);

    }

    // chk
    // i_face_points.forEach(Z => console.log(Z));
    return i_face_points;

}

export function edge_points_fx(surfClass) {

    let vtxWorkingArray = surfClass.vertexArray;

    const i_edge_points = [];

    // primer punt
    let punt_ini_fi = new THREE.Vector3(
        vtxWorkingArray[0][0],
        vtxWorkingArray[0][1],
        vtxWorkingArray[0][2])

    // afegeixo punt final per despres poder fer facilment l'ultim segment
    // al lloro que ara te un item mes i afecta al tope de seguent for
    vtxWorkingArray.push(vtxWorkingArray[0]);

    // console.log(puntComu)

    // push points creant linies de 2 punts
    for (var po = 0; po < (surfClass.vertexArray.length - 1); po++) {
        // console.log('z')

        let puntA = new THREE.Vector3(
            surfClass.vertexArray[po][0],
            surfClass.vertexArray[po][1],
            surfClass.vertexArray[po][2])
        i_edge_points.push(puntA);

        let puntB = new THREE.Vector3(
            surfClass.vertexArray[po + 1][0],
            surfClass.vertexArray[po + 1][1],
            surfClass.vertexArray[po + 1][2])
        i_edge_points.push(puntB);
    }

    // chk
    // i_edge_points.forEach(Z => console.log(Z));
    return i_edge_points;
}

export function i_createObjectFromOneSurface(objectName, face_points, edges_points) {


    let spacePoligon = new THREE.BufferGeometry()
        .setFromPoints(face_points);

    let chooseMat = () => {
        if (objectName.includes('_Win')) { return mat_windows_transp; }
        else { return mat_face_transp; }
    }

    const mesh_shape2D = new THREE.Mesh(spacePoligon, chooseMat());
    mesh_shape2D.userData = {
        idfName: objectName,
        parentZone: objectName.split("_")[0].trim(),
        objectType: 'idf_from'

    };

    scene.add(mesh_shape2D);
    // console.log(mesh_shape2D.userData.parentZone);


    let geo_edgesFromPoints = new THREE.BufferGeometry().setFromPoints(edges_points);
    var lines_shape2D = new THREE.LineSegments(geo_edgesFromPoints, mat_lines_blue);
    lines_shape2D.userData = {
        idfName: objectName,
        parentZone: objectName.split("_")[0].trim(),
        objectType: 'idf_from'
    };

    scene.add(lines_shape2D);
    // console.log(lines_shape2D.userData.parentZone);

}

// var idfPath = "./";
var srfInclude = "";

export function idf_fullManageAndSceneAddObjects(idfData) {

    var lines = fullStrSplitAndClear(idfData);
    var idf_srf_brutLines = idf_getSrf_brutLines(lines);
    var srf_array = idf_allSrfClass(idf_srf_brutLines);

    srf_array
        // .slice( 12, 12+5) //un  tros
        .filter(Z => Z.objectName.toLowerCase().includes(srfInclude.toLowerCase()))
        .forEach(Z => {
            // console.log(Z.objectName)
            // Z.vertexArray.forEach(Z => console.log("\t " + Z))
            // console.log('---FACES point array---');
            var faces = face_points_fx(Z);
            // console.log('---EDGES point array---');
            var edges = edge_points_fx(Z);
            // console.log('-----');

            i_createObjectFromOneSurface(Z.objectName, faces, edges);

            // console.log(Z.vertexArray.length)

            // if (Z.vertexArray.length > 5) {
            //     console.log(Z.objectName);
            //     Z.vertexArray.forEach(Z => console.log("\t " + Z));
            // }
        });

    // chk
    // console.log(srf_array.forEach(Z => Z.vertexArray.length))

}

export let idfData_ = '';

export function idf_fetchAndReturnGeometry(path) {

    // haure de substituir el fetch
    // https://stackoverflow.com/questions/49971575/chrome-fetch-api-cannot-load-file-how-to-workaround

    // let xxx = '';

    return fetch(path)
        .then(function (response) {
            return response.text();
        })
        .then(function (idfData) {

            idfData_ = idfData;
            // console.log('idfData_:', idfData_)
            idf_fullManageAndSceneAddObjects(idfData);
            fullIdfObjectsBoundingBox();
            group_createAllzones();

            return idfData_
        })

    // return idfData_;
}


/////////////

export async function newFetch(path) {

    let respo = await fetch(path);

    let data = await respo.text();
    // console.log('data:', data)
    // idfData_= data;

    return data;


}

/////////////

function idf_fileLoadTextAndReturnGeometry(idfData) {
    idf_fullManageAndSceneAddObjects(idfData);
    fullIdfObjectsBoundingBox();
}

