import * as THREE from 'three'
import { gui_global_params } from './gui01.js';
import { mat_face_transp } from "./IDF_Import.js";
import { gui, scene } from "./sceneCreation.js";
import { scene_full } from './sceneObjManage.js';

const clock = new THREE.Clock();
let stateTime = true;
let startTime = 0;
let objecteQueCanvia; // he hagut de fer una global per collona

function opacityChange(obj) {
    objecteQueCanvia = obj;
    fractionAnimation();
}

function fractionAnimation() {

    let fast = 5;
    var requestID = window.requestAnimationFrame(fractionAnimation);
    const elapsedTime = clock.getElapsedTime();

    if (stateTime) {
        startTime = Math.round(elapsedTime * fast);
        stateTime = false;
    }

    var steppedTime = Math.round(elapsedTime * fast);
    // console.log(steppedTime + ":::" + startTime + ":::" + (steppedTime - startTime) / 10);
    let newOpac = (elapsedTime * fast - startTime) / 10;

    if (newOpac <= 1) {
        objecteQueCanvia.opacity = newOpac;
    }

    if (steppedTime == startTime + 15) {
        cancelAnimationFrame(requestID);
        stateTime = true;
        // startTime = 0;
        objecteQueCanvia.opacity = 0.3;
        objecteQueCanvia = null;
    }
}

function fractionAnimation_toGroupArray() {

    let fast = 5;
    var requestID = window.requestAnimationFrame(fractionAnimation_toGroupArray);
    const elapsedTime = clock.getElapsedTime();

    if (stateTime) {
        startTime = Math.round(elapsedTime * fast);
        stateTime = false;
    }

    var steppedTime = Math.round(elapsedTime * fast);
    // console.log(steppedTime + ":::" + startTime + ":::" + (steppedTime - startTime) / 10);
    let newOpac = (elapsedTime * fast - startTime) / 10;

    // let groupArray_ = [];
    // groupArray_ = groupArray

    objecteQueCanvia.forEach(G => {
        if (newOpac <= 1) {
            G.traverse(o => { if (o.type == 'Mesh') { o.material.opacity = newOpac } })
        };
    });

    if (steppedTime == startTime + 15) {
        cancelAnimationFrame(requestID);
        stateTime = true;
        // startTime = 0;

        objecteQueCanvia.forEach(G => {
            G.traverse(o => { if (o.type == 'Mesh') { o.material.opacity = 0.3 } })
        });

        objecteQueCanvia = null;
    }
}


//gui


export function gui_folderIdfLab_addAction_OpacityTransitionLAB () {

    gui_global_params.sweetOpacityChange =  function () {
    
        objecteQueCanvia = [];

        let sceneSelectedObjects = scene_full()
            .filter(O => O.type == 'Group' & O.name.includes("zoneGroup:"));

        objecteQueCanvia.push(sceneSelectedObjects[3])
        objecteQueCanvia.push(sceneSelectedObjects[4]);

        // independitzo material de cada grup

        objecteQueCanvia.forEach(G => {
            let gmaterial = mat_face_transp.clone();
            G.traverse(o => {
                if (o.type == 'Mesh') {
                    o.material = gmaterial;
                }
            })
        });

        fractionAnimation_toGroupArray()

    }

    
    gui.__folders['IDF settings'].__folders['IDF LAB'].add(gui_global_params, 'sweetOpacityChange').name('Some zones opacity sweet transition LAB');
   
}


