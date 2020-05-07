let scene = null,
    window_relation = window.innerWidth / window.innerHeight
    camera = null,
    player = true,
    camera_control = null,
    renderer = null;

function EraseSnake(){
    snake.snakeClear();
};

function ChangeModePlayer(){
    EraseSnake();
    player = true;
    camera.position.set( -1.3, 0, -4);
    camera.rotation.y = 180 * (Math.PI /180);
    camera.rotation.x = 10 * (Math.PI / 180);
    camera.rotation.z = 0 * (Math.PI / 180);
    camera_control.enabled = false;
};

function ChangeModeAI(){
    EraseSnake();
    player = false;
    camera.position.set( 3.7, 3.7, 3.7 );
    //camera.rotation.y = -180 * (Math.PI /180);
    //camera.rotation.x = -20 * (Math.PI / 180);
    camera_control = new THREE.OrbitControls( camera,renderer.domElement);
    camera_control.enabled = true;

};


window.addEventListener('load',()=>{
    //let rx = document.getElementById('rx');
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true });
    let canvas = document.getElementById('canvas'),
        frame_relation = canvas.offsetWidth/canvas.offsetHeight;

        camera = new THREE.PerspectiveCamera( 75, frame_relation, 0.1, 1000 );
    
    //Isometric View
    camera.position.set( -1.3, 0, -4);
    camera.rotation.y = 180 * (Math.PI /180);
	camera.rotation.x = 20 * (Math.PI / 180);

    canvas.appendChild( renderer.domElement );
    renderer.setClearColor( 0x000000, 0 );
    renderer.setSize(canvas.offsetWidth,canvas.offsetHeight);

    scene.add(snake.body[0]);
    scene.add(apple.object);
    window.addMatrix3DToElement(cell,scene);

    scene.position.set(-(x-1)/2,-(y-1)/2,-(z-1)/2);

    var axesHelper = new THREE.AxesHelper( 5 );
    axesHelper.size = 10;
    scene.add( axesHelper );

    function UpdateOno(){
        if(player == false){
            camera_control.update();
        }

    }

    let animate = function () {
        requestAnimationFrame(animate);
        snake.move();
        renderer.render( scene, camera );
        UpdateOno();
    };


    animate();
    /*Snake Listener*/
    let keyCode;
    document.addEventListener("keydown", (event)=>{
         keyCode = event.key;
         snake.changeDirection(keyCode);
       });

    document.getElementById('auto-rotation').addEventListener("change", element =>{
        if(player == false){
            camera_control.autoRotate = element.target.checked;
        }
    })
});

