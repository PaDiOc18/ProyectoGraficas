let scene = null,
    window_relation = window.innerWidth / window.innerHeight;


window.addEventListener('load',()=>{
    scene = new THREE.Scene(); //Creamos la escena 
    let renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true }), //Creamos el renderizador
        canvas = document.getElementById('canvas'), //Llamamos el canvas del HTML
        camera = new THREE.PerspectiveCamera( 75, window_relation, 0.1, 1000 ); //Creamos la cámara 
    let camera_direction = [0,0,0], //La dirección a la que la cámara apunta
        cameraValidDirection = [false,false,false], //Válida si la dirección a la que apunta si hay algo que mostrar
        radiansDirection = [0,0,0]; //Dirección en radianes de cada posicion
    camera.position.set( 6, 6, 6 ); //Asignamos la posicion de la camara 
	camera.rotation.y = Math.PI / 4; //Rotamos la camara en Y 45 grados
	camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) ); //Rotamos la cámara en x para la perspectica Isómetrica


    renderer.setSize( window.innerWidth, window.innerHeight ); //Asignamos el tamaño del renderizador
    canvas.appendChild( renderer.domElement ); //Y lo agregamos al canvas

    renderer.setClearColor( 0x000000, 0 ); //Le agregamos color blanco
    renderer.setSize(canvas.offsetWidth,canvas.offsetHeight); //La compensación de la cámara

    //let camera_control = new THREE.OrbitControls( camera,renderer.domElement); //Asignamos el manejo de la función OrbitControls
    scene.add(snake.body[0]);//Agregamos cabeza de snake a la escena            //Para movernos en torno al espacio  
    scene.add(apple.object); //Agregamos la manzana 
    window.addCellsToScene(cell); //Y agregamos las celdas

    var axesHelper = new THREE.AxesHelper( 5 ); //El AxisWorld que nos sirve de referencia
    axesHelper.size = 10; //Tamaño del Eje
    scene.add( axesHelper ); //Lo agregamos a la escena 

    let animate = function () {
        requestAnimationFrame(animate);
        snake.move();
        renderer.render( scene, camera );
    };
    animate();

/*Snake Listener*/
    let keyCode;
    document.addEventListener("keydown", (event)=>{ //La ventana espera en caso de que presionemos una tecla 
             keyCode = event.key;
             snake.changeDirection(keyCode); //Se lo enviamos a snake para el cambio de dirección 
           });

});

