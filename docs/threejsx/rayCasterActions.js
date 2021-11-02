import * as THREE from 'three'
import { gui_global_params } from './gui01.js';
import { mat_windows_transp } from './IDF_Import.js';
import { gui, scene, controls, camera, render } from './sceneCreation.js';
import { group_centerLevelsArray, floors_Y_explode, floors_Z_explode } from './sceneObjManage.js';


export let selectionArray = [];
export let possibleObjects = [];
export let INTERSECTED;
export let raycaster, mouse;
export let ClickWait = 0;

export let newGr;
export let zeroMat;
export let zeroMatWin;
export let zeroMatOriginalColor;


//////////////////////
//gui

export function guiAddRaycasterActions() {

    // afegir propietats
    //en aquest cas el missatget d'error no importa...
    gui_global_params.reposicionarZona = function () {
        console.log('SELECT THE OBJECT THAT YOU WANT TO RELOCATE');
        ClickWait = 1;
        cubesSelection_init_animate();
        document.addEventListener('keydown', onKeyDown_escape);
    };

    let f = gui.__folders['Groups LAB'];
    f.add(gui_global_params, 'reposicionarZona')
        .name('Canviar la posició d\'una zona')
        .title('1) clica la zona que vols canviar \n2) clica una zona que esta en el nivell desitjat');
    // f.open();
}

////////////////////////
// action select change color

export function cubesSelection_init_animate() {
    if (ClickWait == 1) {
        possibleObjects = meshesInGroupFx('_Win');
        init_Raycaster();
        animate_cubesSelection();
    }
}

export function init_Raycaster() {
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    mouse.x = 0
    mouse.y = 0;
    window.addEventListener('mousemove', onMouseMove, false);
}

export function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

export function animate_cubesSelection() {

    requestAnimationFrame(animate_cubesSelection);
    controls.update();

    if (ClickWait == 1) {
        selectionFx1(possibleObjects);
        document.addEventListener('mousedown', onDocumentMouse_ObjectToRelocate);
    };

    if (ClickWait == 2) {
        selectionFx2(possibleObjects);

        // intento passar arguments amb () => 
        // finalment no ho necessito
        // pero deixo la referencia pq ha funcionat
        // i per si ho necessito en el futur
        // document.addEventListener('mousedown', () => {onDocumentMouse_RelocationObject/*(undefined,undefined,'Z')*/},false);
        document.addEventListener('mousedown', onDocumentMouse_RelocationObject);
    };

    render();
}

export function selectionFx1(meshesInGroup) {

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshesInGroup);

    if (intersects.length > 0
        // && selectionArray[1] != intersects[0].object.parent
        // && intersects[0].object.parent != scene.getObjectByName('newGr2')
    ) {

        if (INTERSECTED != intersects[0].object.parent) {

            if (INTERSECTED) { // necessari per tornar a estat inicial
                INTERSECTED.visible = true;
                scene.remove(scene.getObjectByName('newGr'));
            }

            INTERSECTED = intersects[0].object.parent;
            // console.log('INTERSECTED:', INTERSECTED)

            newGr = INTERSECTED.clone(true);
            INTERSECTED.visible = false;

            zeroMat = intersects[0].object.material.clone();
            zeroMatWin = mat_windows_transp.clone();

            zeroMatOriginalColor = zeroMat.color.getHex();

            let newGrDeletObjects = [];
            newGr.traverse(i => {
                if (i.type == 'Mesh') i.material = zeroMat;

                try {
                    if (i.userData.idfName.includes('_Win') && i.type == 'Mesh') {
                        // newGrDeletObjects.push(i)
                        i.material = zeroMatWin;
                    }
                }
                catch (error) { };

                try { if (i.userData.objectType.includes('label')) newGrDeletObjects.push(i) }
                catch (error) { }
            })

            newGrDeletObjects.forEach(Z => Z.removeFromParent());

            newGr.name = 'newGr'
            scene.add(newGr);
            htmlPrintItem(INTERSECTED.userData.parentZone);
        }

        zeroMat.color.set((Date.now() * 0.001 * 6) % 2 > 1 ? 0x89FFB0 : zeroMatOriginalColor);
        zeroMatWin.color.set((Date.now() * 0.001 * 6) % 2 > 1 ? 0x89FFB0 : zeroMatOriginalColor);

    }
    else {
        if (INTERSECTED) {
            INTERSECTED.visible = true;
            scene.remove(scene.getObjectByName('newGr'));
        }
        INTERSECTED = null;
    }


}

export function selectionFx2(meshesInGroup) {

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshesInGroup);

    // if (
    // ) {

    if (intersects.length > 0
        && intersects[0].object.parent != selectionArray[1]
        && intersects[0].object.parent.name != 'newGr2') {

        if (INTERSECTED != intersects[0].object.parent
            // && intersects[0].object.parent != selectionArray[1]
            // && intersects[0].object.parent.name != 'newGr'
        ) {

            if (INTERSECTED) { // necessari per tornar a estat inicial
                INTERSECTED.visible = true;
                scene.remove(scene.getObjectByName('newGr'));
            }

            INTERSECTED = intersects[0].object.parent;
            // console.log('INTERSECTED:', INTERSECTED)

            newGr = INTERSECTED.clone(true);
            INTERSECTED.visible = false;

            zeroMat = intersects[0].object.material.clone();
            zeroMatWin = mat_windows_transp.clone();

            zeroMatOriginalColor = zeroMat.color.getHex();

            let newGrDeletObjects = [];
            newGr.traverse(i => {
                if (i.type == 'Mesh') i.material = zeroMat;

                try {
                    if (i.userData.idfName.includes('_Win') && i.type == 'Mesh') {
                        // newGrDeletObjects.push(i)
                        i.material = zeroMatWin;
                    }
                }
                catch (error) { };

                try { if (i.userData.objectType.includes('label')) newGrDeletObjects.push(i) }
                catch (error) { }
            })

            newGrDeletObjects.forEach(Z => Z.removeFromParent());

            newGr.name = 'newGr'
            scene.add(newGr);
        }

        zeroMat.color.set((Date.now() * 0.001 * 6) % 2 > 1 ? 0x89FFB0 : zeroMatOriginalColor);
        zeroMatWin.color.set((Date.now() * 0.001 * 6) % 2 > 1 ? 0x89FFB0 : zeroMatOriginalColor);

    }
    else {
        if (INTERSECTED) {
            INTERSECTED.visible = true;
            scene.remove(scene.getObjectByName('newGr'));
        }
        INTERSECTED = null;
    }
    // }


}

export function selectionFx_xxxEliminar(meshesInGroup) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshesInGroup);
    let newGr;

    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {

            ///////////
            // funcionava amb meshes
            // if (INTERSECTED) {
            // INTERSECTED.material = INTERSECTED.originalMaterial;
            // INTERSECTED.visible = true;           
            // } 
            INTERSECTED = intersects[0].object;
            console.log('INTERSECTED:', INTERSECTED)

            // INTERSECTED.currentColor = INTERSECTED.material.color.getHex();
            // INTERSECTED.originalMaterial = INTERSECTED.material;
            // INTERSECTED.tempMaterial = new THREE.MeshBasicMaterial()/*newMat*/.copy(INTERSECTED.material, false);
            // INTERSECTED.material = INTERSECTED.tempMaterial;
            // console.log('INTERSECTED:', INTERSECTED.userData.idfName)
            // console.log('INTERSECTED:', INTERSECTED.parent.name)

            newGr = INTERSECTED.parent.clone(true);
            intersects[0].object.parent.visible = false;
            // scene.remove(intersects[0].object.parent);
            // newGr.copy(INTERSECTED.parent,true);
            newGr.position.z += 20;
            newGr.name = 'newGr;'
            scene.add(newGr);
        }
        ///////////
        // funcionava amb meshes
        // INTERSECTED.material.color.set((Date.now() * 0.001 * 6) % 2 > 1 ? 0x89FFB0 : INTERSECTED.currentColor);




    }
    else {
        if (INTERSECTED) {
            ///////////
            // funcionava amb meshes
            // INTERSECTED.material = INTERSECTED.originalMaterial;
            INTERSECTED.parent.visible = true;
            // scene.getObjectByName('newGr').visible = false;
        }
        // newGr.visible = false;
        INTERSECTED = null;
    }
}

export function meshesInGroupFx(exclude = "@@##") {
    let meshesIngroup = [];
    scene.traverse(i => {
        if (i.type == 'Group') {

            i.traverse(H => {
                if (H.type == 'Mesh') {
                    meshesIngroup.push(H);
                }
            })

            // let aaa = i.filter(X => X.type == 'Mesh');
            // aaa.foreach(K => meshesIngroup.push(K));
        }
    });

    meshesIngroup = meshesIngroup
        .filter(Z => Z.userData.idfName != null)
        .filter(Z => !Z.userData.idfName.includes(exclude))

    // console.log('meshesIngroup:', meshesIngroup.map(Z => Z.userData.idfName))
    return meshesIngroup; //.filter(Z=> Z.userData.idfName.includes(exclude));

}

export function onDocumentMouse_ObjectToRelocate(event) {
    event.preventDefault();

    if (INTERSECTED) {

        ClickWait = 0;

        zeroMat.color.set(0xff0000);
        zeroMatWin.color.set(0xff0000);

        let newGr2 = newGr.clone(true);
        newGr2.name = 'newGr2'
        scene.remove(scene.getObjectByName('newGr'));
        scene.add(newGr2)

        selectionArray[1] = INTERSECTED;
        INTERSECTED = null;

        // passar a un altre comportament
        ClickWait = 2;
        document.removeEventListener('mousedown', onDocumentMouse_ObjectToRelocate);
        // document.addEventListener('mousedown', onDocumentMouse_RelocationObject);
    }
}

export function onDocumentMouse_RelocationObject(event, true_spaceCenter_false_ZBaseCenter = false /*, X_Y_Z_explotion*/) {
    
    // no necessari degut a l'intent de passar arguments...
    // event.preventDefault();

    if (INTERSECTED) {

        scene.remove(scene.getObjectByName('newGr'));
        scene.remove(scene.getObjectByName('newGr2'));
        INTERSECTED.visible = true;

        let gr = selectionArray[1]
        gr.visible = true;

        gr.userData.startPosition.z = INTERSECTED.userData.startPosition.z
        gr.userData.baseZlevel.z = INTERSECTED.userData.baseZlevel.z
        
        // necessari x fer correctament la explosio en Z
        // ara no se m'acud rem més senzill
        // gr.userData.ZexplotionPosition = gr.position.z

        floors_Y_explode(gui_global_params.Y_groupsLevels, false);
        floors_Z_explode(gui_global_params.Z_groupsLevels, false);


        // switch (X_Y_Z_explotion) {
        //     case 'Y':
        //         floors_Y_explode(gui_global_params.Y_groupsLevels, false);
        //         floors_Z_explode(gui_global_params.Y_groupsLevels, false);
        //         break;
        //     case 'Z':

        //         console.log('aaa')
        //         floors_Y_explode(gui_global_params.Y_groupsLevels, false);
        //         floors_Z_explode(gui_global_params.Y_groupsLevels, false);
        //         break;
        // }

        INTERSECTED = null;

        // desactivar-ho tot
        ClickWait = 0;
        document.removeEventListener('mousedown', onDocumentMouse_RelocationObject);
        window.removeEventListener('mousemove', onMouseMove);
        closeHtmlPrintItem();
    }
}


export function htmlPrintItem(txt) {
    let ele0 = document.getElementById('container');
    let ele = document.getElementById('subContainer');
    ele0.style.display = 'inline';
    ele.style.display = 'inline';
    ele.innerHTML = '<br>zona<br><br>';
    ele.innerHTML += txt + '<br>';
}

export function closeHtmlPrintItem() {
    let ele0 = document.getElementById('container');
    let ele = document.getElementById('subContainer');
    ele.innerHTML = '';
    // ele0.style.display = 'none';
    // ele.style.display = 'none';
}


function onKeyDown_escape(event) {
    if (event.keyCode == 27) {
        // desactivar-ho tot
        ClickWait = 0;
        document.removeEventListener('mousedown', onDocumentMouse_ObjectToRelocate);
        document.removeEventListener('mousedown', onDocumentMouse_RelocationObject);
        window.removeEventListener('mousemove', onMouseMove);
        closeHtmlPrintItem();
        document.removeEventListener('keydown', onKeyDown_escape);


        // if (INTERSECTED) {
        INTERSECTED.visible = true;
        scene.remove(scene.getObjectByName('newGr'));
        scene.remove(scene.getObjectByName('newGr2'));
        // }

        INTERSECTED = null;

    }
}