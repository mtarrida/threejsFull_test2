import * as THREE from 'three';
import { gui, scene, controls } from "./sceneCreation.js";
import * as BufferGeometryUtils from '../utils/BufferGeometryUtils.js';
import { gui_global_params } from './gui01.js';

// array amb vectors únics
function vector3array_distinct(arrayToDistinct) {
    let uniqueAllVertex = [];
    let auxUnique = [];

    arrayToDistinct.forEach(i => {
        // ho he hagut de fer rollo string pq els vector3 no es deixen netejar
        let justNowStr = i.x + ',' + i.y + ',' + i.z;
        // console.log('justNow:', justNowStr)

        if (!auxUnique.includes(justNowStr)) {
            auxUnique.push(justNowStr);
            uniqueAllVertex.push(i)
        }
    });

    // console.log('uniqueAllVertex:', uniqueAllVertex);

    return uniqueAllVertex;
}

// tota l'escena
export function scene_full() {
    let selectedObjectsFromScene = [];
    scene.traverse(i => selectedObjectsFromScene.push(i));
    // prova filtre
    // selectedObjectsFromScene = selectedObjectsFromScene.filter(i=>i.userData.parentZone == "B1:1"); 
    //chk
    // console.clear()
    // console.log('selectedObjectsFromScene:', selectedObjectsFromScene)
    return selectedObjectsFromScene;
}

// acabo muntant gran array de punts que s'han d'agrupar cada 3 per tenir coordenades
function coordenadesUniquesDelsObjectesSeleccionats(sceneSelectedObjects) {
    let iarray = [];
    let allVertex = [];

    sceneSelectedObjects
        .forEach(Z => Z.geometry.attributes.position.array
            .forEach(I => iarray.push(I)));

    for (var i = 0; i < iarray.length; i = i + 3) {
        let vtx = new THREE.Vector3(iarray[i], iarray[i + 1], iarray[i + 2])
        allVertex.push(vtx);
    }

    let uniqueAllVertex = vector3array_distinct(allVertex)

    return uniqueAllVertex;
}

// boundinBoxVectors caixa "ortogonal"...
// (no son els vtx d'un helper real
function boundinBoxVectors_byMinAndMaxVtx(uniqueAllVertex) {

    // X min max
    let xvalues = uniqueAllVertex.map(z => z.x);
    let xmax = Math.max.apply(null, xvalues);
    let xmin = Math.min.apply(null, xvalues);

    // Y min max
    let yvalues = uniqueAllVertex.map(z => z.y);
    let ymax = Math.max.apply(null, yvalues);
    let ymin = Math.min.apply(null, yvalues);

    // Z min max
    let zvalues = uniqueAllVertex.map(z => z.z);
    let zmax = Math.max.apply(null, zvalues);
    let zmin = Math.min.apply(null, zvalues);

    let boundinBoxVectors = [];
    boundinBoxVectors.push(new THREE.Vector3(xmin, ymin, zmin));
    boundinBoxVectors.push(new THREE.Vector3(xmax, ymax, zmax));

    return boundinBoxVectors;
}

// get center from BufferGeometry
function getCenterVtx_fromBufferGeometry(spacePoligonBufferGeometry) {
    //get center
    //font https://stackoverflow.com/questions/38305408/threejs-get-center-of-object
    // on linea mesh.localToWorld( center ); sembla que és incorecta
    // he hagut d efer voltes fins que he recordat el concepte
    // computeBoundingBox()
    var center = new THREE.Vector3();
    spacePoligonBufferGeometry.computeBoundingBox();
    spacePoligonBufferGeometry.boundingBox.getCenter(center);

    // chk
    // console.log('floor center: ' + center.x + ", " + center.y + ", " + center.z);
    return center;
}

// get center from scene
function getCenterVtxOfSceneObject_byGivenName(sceneObjectName) {
    let objecteGet_geo = scene.getObjectByName(sceneObjectName).geometry;
    var center = getCenterVtx_fromBufferGeometry(objecteGet_geo);
    return center;
};

//helper
function helperBox_fromBufferGeometry(spacePoligonBufferGeometry, helperName, color) { // 'fullIdfHelper' , color 0xffff00

    var helper = new THREE.BoxHelper(new THREE.Mesh(spacePoligonBufferGeometry), color);
    helper.name = helperName;
    helper.update();

    // If you want a visible bounding box
    scene.add(helper);
    helper.visible = false; //true; //false;
}

// fullIdfObjectsBoundingBox anf camera focus
export function fullIdfObjectsBoundingBox() {

    let sceneSelectedObjects = scene_full()
        .filter(Z => Z.userData.objectType == "idf_from");

    let uniqueAllVertex = coordenadesUniquesDelsObjectesSeleccionats(sceneSelectedObjects);

    //chk
    // console.clear();
    // console.log('uniqueAllVertex:', uniqueAllVertex)

    let boundingBoxVectors = boundinBoxVectors_byMinAndMaxVtx(uniqueAllVertex);

    let spacePoligonBufferGeometry = new THREE.BufferGeometry()
        .setFromPoints(boundingBoxVectors);

    //get center
    // var center = getCenterVtx_fromBufferGeometry(spacePoligonBufferGeometry);

    // focus cam
    controls.target = getCenterVtx_fromBufferGeometry(spacePoligonBufferGeometry);

    //helper
    helperBox_fromBufferGeometry(spacePoligonBufferGeometry, 'fullIdfHelper', 0xffff00)  // 'fullIdfHelper' , color 0xffff00
}

// centre d'un conjunt de meshes que es seleccionen per ser d'un mateix parentZone
function selectedIdfObjectsBoundingBoxCenter_byUserDataParentZone(parentZone) {

    let sceneSelectedObjects = scene_full()
        .filter(Z => Z.userData.parentZone == parentZone & Z.userData.objectType !== "label");

    let uniqueAllVertex = coordenadesUniquesDelsObjectesSeleccionats(sceneSelectedObjects);

    //chk
    // console.clear();
    // console.log('uniqueAllVertex:', uniqueAllVertex)

    let boundingBoxVectors = boundinBoxVectors_byMinAndMaxVtx(uniqueAllVertex);

    let spacePoligonBufferGeometry = new THREE.BufferGeometry()
        .setFromPoints(boundingBoxVectors);

    //get center
    var center = getCenterVtx_fromBufferGeometry(spacePoligonBufferGeometry);

    // focus cam
    // controls.target = getCenterVtx_fromBufferGeometry(spacePoligonBufferGeometry);

    //helper
    // helperBox_fromBufferGeometry(spacePoligonBufferGeometry, 'fullIdfHelper', 0xffff00)  // 'fullIdfHelper' , color 0xffff00

    return center;
}

// array de centres de cada zona
export function arrayOfZoneCenterVtx() {

    let zoneNamesArray = getUniqueZoneNames_fromSceneObjects();

    let zoneCentersArray = [];

    zoneNamesArray
        .forEach(Z => zoneCentersArray
            .push([Z, selectedIdfObjectsBoundingBoxCenter_byUserDataParentZone(Z)]));

    // chk
    // console.clear();
    // console.log('zoneCentersArray:', zoneCentersArray)
    return zoneCentersArray;

}

export function moure_byZoneCenterVtx_prev_XXX(object, centerVtx, perc, xy0_o_z1) {

    let objecteGet = object;
    // console.log(nomDeZona + ' pos ' +objecteGet.position.x);

    // centre de la zona
    var center = centerVtx;

    let centerIDFobjectsInScene = getCenterVtxOfSceneObject_byGivenName('fullIdfHelper');

    let vectorAjustarPosicio = new THREE.Vector3();

    switch (xy0_o_z1) {
        case 1:
            vectorAjustarPosicio.x = center.x - centerIDFobjectsInScene.x;
            vectorAjustarPosicio.y = center.y - centerIDFobjectsInScene.y;

            objecteGet.position.x = perc * vectorAjustarPosicio.x;
            objecteGet.position.y = perc * vectorAjustarPosicio.y;
            break;

        case 0:
            vectorAjustarPosicio.z = center.z - centerIDFobjectsInScene.z;
            objecteGet.position.z = perc * vectorAjustarPosicio.z;
            break;
    }
    // console.log(objecteGet.position.x);s
};

export function moure_byZoneCenterVtx(group, centerIDFobjectsInScene, perc, xy0_z1_y2) {

    // console.log(nomDeZona + ' pos ' +objecteGet.position.x);

    // centre de la zona
    const center = group.userData.startPosition;
    console.log('centre de la Zona:', center)

    // let centerIDFobjectsInScene = getCenterVtxOfSceneObject_byGivenName('fullIdfHelper');

    let vectorAjustarPosicio = new THREE.Vector3();

    switch (xy0_z1_y2) {
        case 0:
            vectorAjustarPosicio.x = perc * (center.x - centerIDFobjectsInScene.x);
            vectorAjustarPosicio.y = perc * (center.y - centerIDFobjectsInScene.y);

            group.position.x = centerIDFobjectsInScene.x + vectorAjustarPosicio.x;
            group.position.y = centerIDFobjectsInScene.y + vectorAjustarPosicio.y;
            break;

        case 1:
            vectorAjustarPosicio.z = perc * (center.z - centerIDFobjectsInScene.z);
            group.position.z = centerIDFobjectsInScene.z + vectorAjustarPosicio.z;
            break;

        case 2:
            vectorAjustarPosicio.y = perc * (center.y - centerIDFobjectsInScene.y);
            group.position.y = centerIDFobjectsInScene.y + vectorAjustarPosicio.y;
            break;

    }
    // console.log(objecteGet.position.x);s
};

// noms de zones desde loop per tots els objectes idf a l'escena
export function getUniqueZoneNames_fromSceneObjects() {
    let justNow = [];

    scene.traverse(function (i) {
        if (i.userData.objectType == "idf_from" & justNow.includes(i.userData.parentZone) == false) {
            justNow.push(i.userData.parentZone);
        }

    });
    //chk
    // console.clear();
    // console.log('justNow:', justNow)

    return justNow;
}

// mourezones IDF
export function moureZonesIdf(perc, xy0_z1_y2) {

    let centerIDFobjectsInScene = getCenterVtxOfSceneObject_byGivenName('fullIdfHelper');
    // console.log('centerIDFobjectsInScene:', centerIDFobjectsInScene);

    let sceneSelectedObjects = scene_full()
        .filter(Z => Z.type == "Group" & Z.name.includes("zoneGroup:"));

    sceneSelectedObjects.forEach(Z => { moure_byZoneCenterVtx(Z, centerIDFobjectsInScene, perc, xy0_z1_y2) });

}

// scene clear
export function sceneRemoveObjects() {
    scene.clear();
}

// labels(); // reactivar


// groups workarround

function group_fromIdfObjectsWithoutLabels_byUserDataParentZone(parentZone) {

    let group = new THREE.Group();
    group.name = "zoneGroup:" + parentZone;
    group.userData.parentZone = parentZone;
    // console.log('parentZone:', parentZone)
    // a group_fix_centeringSteps s'hi posa userData.startPosition

    let sceneSelectedObjects = scene_full()
        .filter(Z => Z.userData.parentZone == parentZone & Z.userData.objectType !== "label");

    // trobar el centre
    group = group_fix_centeringSteps(group, sceneSelectedObjects, true);

    scene.add(group);
}

function group_fix_centeringSteps(groupToFix, sceneSelectedObjects, insertSphereBool = false) {

    let itsMeshes = [];
    itsMeshes = sceneSelectedObjects.filter(Z => Z.type == 'Mesh');
    // console.log('itsMeshes:', itsMeshes)
    let itsBuffGeoms = itsMeshes.map(Z => Z.geometry); // ara és [] de THREE.BufferGeometry();
    let mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(itsBuffGeoms);
    mergedGeometry.computeBoundingBox();
    let center = new THREE.Vector3();
    mergedGeometry.boundingBox.getCenter(center);

    if (insertSphereBool) {
        const geometry = new THREE.SphereGeometry(.2, 12, 12);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const sphere = new THREE.Mesh(geometry, material);
        // sphere.position.set(center.x, center.y, center.z);
        groupToFix.add(sphere);
    }

    groupToFix.position.set(center.x, center.y, center.z);

    // fixar la el punt inicial CENTRAL al user data!!
    groupToFix.userData.startPosition = center;
    
    //necessari x fer la explosio en Z correctament
    groupToFix.userData.ZexplotionPosition = center.z


    // fixar el punt central portat a Z INFERIOR (BASE) al user data!!
    // aprofito la Z del boundinBox recentmentcreat
    groupToFix.userData.baseZlevel = new THREE.Vector3(center.x, center.y, mergedGeometry.boundingBox.min.z);

    // reposicionar objectes
    sceneSelectedObjects.forEach(O => {
        O.position.set(-center.x, -center.y, -center.z);
        groupToFix.add(O);
    });

    return groupToFix;

}

export function group_createAllzones() {
    let zoneNamesArray = getUniqueZoneNames_fromSceneObjects();
    zoneNamesArray.forEach(zn => {
        // console.log(zn);
        group_fromIdfObjectsWithoutLabels_byUserDataParentZone(zn);
    });

    //
    grCenterSphereVisibility(gui_global_params.mostrarCentresBoolean)
}


function Group_scaleZones(scale, onlyZ = false) {

    let sceneSelectedObjects = scene_full()
        .filter(O => O.type == 'Group' & O.name.includes("zoneGroup:"));

    let scaleVtr = new THREE.Vector3(scale, scale, scale)
    switch (onlyZ) {
        case false:
            // let scale = .8
            sceneSelectedObjects.forEach(Z => Z.scale.set(scaleVtr.x, scaleVtr.y, scaleVtr.z));
            break;

        case true:
            sceneSelectedObjects.forEach(Z => Z.scale.z = scaleVtr.z);
            break;
    }


}

export function group_getZoneGroups() {
    let sceneSelectedObjects = scene_full()
        .filter(O => O.type == 'Group' & O.name.includes("zoneGroup:"));
    return sceneSelectedObjects;

}

let distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

export function group_centerLevelsArray(true_spaceCenter_false_ZBaseCenter = true) {

    // let sceneZoneGroups_Zlevel = group_getZoneGroups().map(Z => Z.position.z); // [] de Vertexs

    let sceneZoneGroups_Zlevel = () => {
        switch (true_spaceCenter_false_ZBaseCenter) {
            case true:
                // return group_getZoneGroups().map(Z => Z.position.z); // [] de Vertexs
                return group_getZoneGroups().map(Z => Z.userData.startPosition.z); // [] de Vertexs
            // break;
            case false:
                return group_getZoneGroups().map(Z => Z.userData.baseZlevel.z); // [] de Vertexs
            // break;
        }
    }

    let distinct_sceneZoneGroups_Zlevel = sceneZoneGroups_Zlevel().filter(distinct).sort();
    // console.log('sceneSelectedObjects:', distinct_sceneZoneGroups_Zlevel);
    return distinct_sceneZoneGroups_Zlevel;
}

export function floors_Y_explode(value, true_spaceCenter_false_ZBaseCenter = true) {

    let sceneZoneGroups = group_getZoneGroups();

    let levelsArray = group_centerLevelsArray(true_spaceCenter_false_ZBaseCenter);

    sceneZoneGroups
        .forEach(G =>
            G.position.y = G.userData.startPosition.y + (value * levelsArray
                .indexOf((true_spaceCenter_false_ZBaseCenter ? G.userData.startPosition.z : G.userData.baseZlevel.z)))
        );
}


export function floors_Z_explode(value, true_spaceCenter_false_ZBaseCenter = true) {

    let sceneZoneGroups = group_getZoneGroups();

    let levelsArray = group_centerLevelsArray(true_spaceCenter_false_ZBaseCenter);

    sceneZoneGroups
        .forEach(G =>
            // console.log('G.userData.ZexplotionPosition:', G.userData.ZexplotionPosition)
            G.position.z = G.userData.ZexplotionPosition/*G.userData.baseZlevel.z/*G.position.z*//*G.userData.startPosition.z*/ + (value * levelsArray
                .indexOf((true_spaceCenter_false_ZBaseCenter ? G.userData.startPosition.z : G.userData.baseZlevel.z)))
        );
}

function grCenterSphereVisibility(value) {
    let gr = scene_full().filter(Z => Z.type == "Group");
    let grSpheres = []
    gr.forEach(gr => gr.traverse(Z => grSpheres.push(Z)));
    grSpheres = grSpheres
        .filter(Z => Z.type == 'Mesh')
        .filter(Z => Z.geometry.type == 'SphereGeometry');
    grSpheres.forEach(Z => Z.visible = value)
    // console.log('grSpheres:', grSpheres)
}

//// GUI

// export var folder = gui.addFolder('Groups LAB');
// // folder.open();
// folder.close();

// export let gui_params_GroupsSettings = {
//     createGroups: group_createAllzones,
//     boolean: true,
//     _Group_scaleZones: 0,
//     groupsLevels: 0,
// }

export function gui_GroupActions() {

    //en aquest cas el missatget d'error no importa...
    gui_global_params.createGroups = group_createAllzones;
    gui_global_params.mostrarCentresBoolean = false;
    gui_global_params._Group_scaleZones = 0;
    gui_global_params.Y_groupsLevels = 0;
    gui_global_params.Z_groupsLevels = 0;

    let f = gui.__folders['Groups LAB'];

    f.add(gui_global_params, 'createGroups');

    f.add(gui_global_params, 'mostrarCentresBoolean').name('mostrar centres?')
        .onChange(function (value) {
            grCenterSphereVisibility(value);
        });
    f.add(gui_global_params, '_Group_scaleZones')
        .min(0).max(3).step(0.01)
        .onChange(function (value) {
            Group_scaleZones(value);
        });

    f.add(gui_global_params, '_Group_scaleZones')
        .min(0).max(3).step(0.01)
        .onChange(function (value) {
            Group_scaleZones(value, true);
        });

    f.add(gui_global_params, 'Y_groupsLevels')
        .min(0).max(200).step(1)
        .onChange(function (value) {
            floors_Y_explode(value, false);
        });

    f.add(gui_global_params, 'Z_groupsLevels')
        .min(0).max(200).step(1)
        .onChange(function (value) {
            floors_Z_explode(value, false);
        });
    // .listen();

}



