import * as THREE from 'three';
import { gui, scene } from './sceneCreation.js';
import { arrayOfZoneCenterVtx, group_getZoneGroups, moure_byZoneCenterVtx, scene_full } from './sceneObjManage.js';
import { CSS2DObject } from '../utils/CSS2DRenderer.js';
import { gui_global_params } from './gui01.js';
import { mat_face_transp, mat_windows_transp, newFetch } from './IDF_Import.js';

export function hvacZoneTypesFromJson() {

    let parseData;
    // read jason
    //
    // newFetch("../public/json/data02.json").then((result) => {
    newFetch("./json/data02.json").then((result) => {
        // let parseData;
        try {
            parseData = JSON.parse(result);
            // console.log('parseData:', parseData)

            let aaa = parseData.find(j => j.name == "FCU + threatedOAsys").zoneIdfNames[0];
            // console.log('aaa:', aaa)

            let dict = [];

            parseData.forEach(Z => {
                Z.zoneIdfNames.forEach(X =>
                    dict.push({ "zone": X, "color": Z.color })
                )
            })

            // console.log('dict:', dict[0]);

            let xxx = group_getZoneGroups()//.find(Z => Z.userData.parentZone == dict[0].zone);
            // console.log('xxx:', xxx);




            return;

            group_getZoneGroups().forEach(Z => {

                let gmaterial = mat_face_transp.clone();
                gmaterial.opacity = parseData.find(j => j.name == Z.userData.parentZone).energy;
                let gmaterial_win = gmaterial.clone();
                gmaterial_win.opacity = 0;
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



        } catch (error) {
            parseData = result;
        }
    });

}