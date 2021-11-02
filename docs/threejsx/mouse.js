import * as THREE from 'three'
import { camera, render, scene } from "./sceneCreation.js";

let pointer = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

export function onPointerMove( event ) {

    pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( scene.children, false );
    // const intersects = raycaster.intersectObjects( scene.children, false );

    if ( intersects.length > 0 ) {

        const intersect = intersects[ 1 ];
        console.log('intersect:', intersect)

;

    }

render();    

}