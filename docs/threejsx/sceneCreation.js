import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import Stats from 'three/examples/jsm/libs/stats.module'
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import { GUI } from '../utils/dat.gui.module.js' // he hagut de fer una copia...
import { CSS2DRenderer, CSS2DObject } from '../utils/CSS2DRenderer.js';
// import { onPointerMove } from './mouse.js'; // eliminar

//scene
export let scene = new THREE.Scene()

//cams
export let camera, cameraPers, cameraOrtho, renderer;
let aspect = window.innerWidth / window.innerHeight;
let halfXsceen = window.innerWidth / 2;
let halfYsceen = window.innerHeight / 2;

// camera perspectiva
function camPersp() {
    cameraPers = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    cameraPers.position.x = -10;
    cameraPers.position.y = -10;
    cameraPers.position.z = 15;
    return cameraPers;
}

// camera ortho
function camOrtho() {
    cameraOrtho = new THREE.OrthographicCamera(-halfXsceen, halfXsceen, halfYsceen, -halfYsceen, 0, 10000);
    cameraOrtho.position.x = -1500;
    cameraOrtho.position.y = -1500;
    cameraOrtho.position.z = 500;
    cameraOrtho.zoom = 10;
    return cameraOrtho
}


//controls
// export const controls = new OrbitControls(camera, labelRenderer.domElement);
export let controls;



export function init() {
    // camera.position.set(10, 5, 20);
    camera = camPersp();
    // camera = camOrtho();

    // inicialitzar cams
    // camPersp();
    // camOrtho();

    // camera = cameraOrtho;
    // camera = cameraPers;

    camera.name = "cam";
    camera.up.set(0, 0, 1);
    // evitar el flichering
    // es carrega el resize...
    // camera.near = 1000;

    // axis
    // const axesHelper = new THREE.AxesHelper(50);
    // scene.add(axesHelper);

    //renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    // ??
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.enableDamping = true; //false

    controls.update()
    render();


    //resize
    window.addEventListener(
        'resize', onWindowResize, false
    );

    // // xxx eliminar
    // document.addEventListener( 'pointermove', onPointerMove );

}

function onWindowResize() {

    renderer.setSize(window.innerWidth, window.innerHeight);

    // cameraPers
    cameraPers.aspect = window.innerWidth / window.innerHeight;
    cameraPers.updateProjectionMatrix();

    try {
        
        // cameraOrtho
        cameraOrtho.left = window.innerWidth / -2;
        cameraOrtho.right = window.innerWidth / 2;
        cameraOrtho.top = window.innerHeight / 2;
        cameraOrtho.bottom = window.innerHeight / -2;
        cameraOrtho.updateProjectionMatrix();
    } catch (error) {
        
    }

    // labelRenderer
    labelRenderer.setSize(window.innerWidth, window.innerHeight);

    render();
}



export const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);


export function render() { //funció render
    //////////
    // if (camera === cameraPers) {

    //     // cameraPers.position.x = -10;
    //     // cameraPers.position.y = -10;
    //     // cameraPers.position.z = 15;
    // cameraPers.updateProjectionMatrix();

    // } else {
    //     // cameraOrtho.position.z = 30;
    // cameraOrtho.updateProjectionMatrix();

    // }

    camera.updateProjectionMatrix();
    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    labelRenderer.render(scene, camera)
    renderer.render(scene, camera);
}

//cpu monitor
// export const stats = Stats()
// document.body.appendChild(stats.dom)


//gui
export let gui = new GUI({ /*autoPlace: false,*/ width: 400 });


//animate
export function animate() {
    controls.update()
    requestAnimationFrame(animate)
    //cubeRotation() //necessita ↑ import {cubeRotation}
    render()
    // stats.update()

}




//gui 

export function guiAddCameraCntrls() {

    let cnfg = {
        switchCamType: function () {
            cametraTypeSwitch()
        },
        focus: function () {
            var point = new THREE.Vector3(0, 0, 0);
            controls.target = point;

            // camera.lookAt(point);
            // controls.update()
            // render();
        },
        zenital: function () {
            camera = camOrtho();
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 50;
            // camera.rotation.x = 0;
            // camera.rotation.y = 0;
            // camera.rotation.z = 0;
            camera.up.set(0, 0, 1);
            controls = new OrbitControls(camera, labelRenderer.domElement);
            controls.enableDamping = true; //false
        },
    }
    gui.__folders['Camera settings'].add(cnfg, 'switchCamType').name('PERSP <=> ORTHO')
    gui.__folders['Camera settings'].add(cnfg, 'zenital').name('Switch to Orho & Zenital')
    gui.__folders['Camera settings'].add(cnfg, 'focus')
}

function cametraTypeSwitch() {


    if (camera.type == 'PerspectiveCamera') {
        camera = camOrtho();
    }
    else {
        camera = camPersp();
    }

    camera.up.set(0, 0, 1);

    renderer.clear();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight)

    controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.enableDamping = true; //false

    window.addEventListener(
        'resize', onWindowResize, false
    )


    //////////
    // camera.updateProjectionMatrix();
    // renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setSize(window.innerWidth, window.innerHeight)
    // render();
    // };
    // if (camera === cameraOrtho) {
    //     camera = cameraPers;
    //     render();

    // };
    controls.update();
    // animate();

    // controls.update()
    //cubeRotation() //necessita ↑ import {cubeRotation}
    // render();

    // onWindowResize();
    // init();

}