let scene = null,
    camera = null,
    play = false,
    window_relation = window.innerWidth / window.innerHeight; //Tamaño del viewport



window.addEventListener('load',()=>{
    //let rx = document.getElementById('rx');
    scene = new THREE.Scene(); //Creamos la escena 
    let renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true }), //Creamos el renderizador
        canvas = document.getElementById('canvas'),//Llamamos el canvas del HTML
        frame_relation = canvas.offsetWidth/canvas.offsetHeight; //Calculamos el tamaño del DIV
    camera = new THREE.PerspectiveCamera( 75, frame_relation, 0.1, 1000 ); //creamos la cámara

    //Isometric View
    camera.position.set( 3.7, 3.7, 3.7 ); //Asignamos la posición de la cámara
	camera.rotation.y = Math.PI / 4; //Rotamos la cámara en y 
	camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) ); //Rotamos la cámara en x 

    canvas.appendChild( renderer.domElement ); //Agregamos el renderizador al canvas
    renderer.setClearColor( 0x000000, 0 );  //Que sea negro 
    renderer.setSize(canvas.offsetWidth,canvas.offsetHeight); //Y que sea un tamaño del div del canvas

    let camera_control = new THREE.OrbitControls( camera,renderer.domElement); //Usamos la librería de OrbitControls(Manejo de escena)
    camera_control.autoRotate = true; //La rotación esta activada por defecto 
    scene.add(snake.body[0]); //Agregamos la cabeza del snake
    scene.add(apple.object); //Agregamos la manzana al grid 
    window.addMatrix3DToElement(cell,scene); //Agregamos el grid a la escena

    scene.position.set(-(x-1)/2,-(y-1)/2,-(z-1)/2);//Obtiene el centro de cualquier dimensión (Para que no se acerque ni se aleje por 
    //la librería de Orbit Controls)

    var axesHelper = new THREE.AxesHelper( 5 );//Ayudanos a orientarnos oh querido Axes Helper
    axesHelper.size = 10; //Tamaño del objeto 
    scene.add( axesHelper ); //Lo agregamos a la escena

    //Función que Anima
    let animate = function () {
        requestAnimationFrame(animate);
        if(play) snake.run(); //Si empieza el juego entonces la snake se mueve 
        if(!snake.user_mode) camera_control.update(); //Si está en modo AI entonces Orbit Controls toma el control de la escena 
        renderer.render( scene, camera );
    };
    read_learning(); //Leemos la poliza que tenemos(define el modo que el agente se comporta en un momento definido/ estado)
    animate(); //Iniciamos la animación



document.getElementById('feature-player-mode').addEventListener('click',()=>{
    snake.clear(0.02,true); //Limpiamos snake (remove y add to scene ) VELOCIDAD Y USER_MODE
    scene.position.set(0,0,0); //Posicionamos la escena a su estado inicial
    camera.position.set( //Y hacemos que la camara se posicione en la cabeza del snake
        snake.body[0].position.x,
        snake.body[0].position.y,
        snake.body[0].position.z
        );
    camera.rotation.set(0,Math.PI,0); //Rotamos 180 para darle una perspectiva como si vieramos pa
    camera_control.enabled = false; //Desabilitamos los controles de OrbitControls
    camera_control.autoRotate = false; //Desabilitamos la autorotación 
    episode_el.innerHTML = 0; //Inicializamos el contador de las iteraciones
    score_el.innerHTML = 0; //El score actual que lleva el jugador
    method_el.innerHTML = "Keyboard Pressing"; //Cambia el label del método
    document.getElementById('control-orbit-controls-input').checked = false; //Desactivamos el checkbox de la librería
    document.getElementById('control-auto-rotation-input').checked = false; //Desactivamos el checkbox de la autorotación
    play = true; //Definimos que el juego está corriendo
});

document.getElementById('trigger-AI').addEventListener('click',()=>{
        scene.position.set(-(x-1)/2,-(y-1)/2,-(z-1)/2); //Este es el centro de rotación
        let speed = [0.05,0.1,0.5,1][parseInt(document.getElementById("feature-input-speed").value)-1]; //Toma la velocidad / El indice elegido del scrollbar
        snake.clear(speed,false); //Limpiamos snake (remove y add to scene ) VELOCIDAD Y USER_MODE
        camera.position.set(3.7, 3.7, 3.7); //Posicionamos la cámara lejos para ver el panorama de la escena 
        camera_control = new THREE.OrbitControls(camera, renderer.domElement); //Creamos los Orbit controls 
        camera_control.enabled = true; //Habilitamos los controles de OrbitControls
        camera_control.autoRotate = true; //Habilitamos la rotación
        episode_el.innerHTML = environment.episode_step; //Imprimimos en que iteración se quedó el Snake
        score_el.innerHTML = environment.max_score; //Imprime cual es la mayor longitud a la que ha llegado la snake
        method_el.innerHTML = "Monte Carlo"; //Pos el método jajaxd
        document.getElementById('control-orbit-controls-input').checked = true; //Activamos el checkbox de la librería
        document.getElementById('control-auto-rotation-input').checked = true; //Activamos el checkbox de la autorotación
    play = true; //Definimos que el juego está corriendo
});




/*Snake Control's Listeners*/

//Detecta cuando se presiona una tecla estando en el modo jugador 
 let keyCode;
  document.addEventListener("keydown", (event)=>{
         keyCode = event.key; //Tomamos la tecla presionada
         if(Object.keys(snake.directionController["USER"]).includes(keyCode)){ //Si esta en modo usuario, entonces:
              snake.changeDirection(keyCode); //Cambia la dirección de la snake
         }
       });
       
    document.getElementById('control-auto-rotation').addEventListener("change", element =>{
        camera_control.autoRotate = element.target.checked; //Verifica si está checked el checkbox (TRUE O FALSE)
    });
    document.getElementById('control-orbit-controls').addEventListener("change",element=>{
        camera_control.enabled = element.target.checked; //Verifica si está checked el checkbox (TRUE O FALSE)
    });
});




