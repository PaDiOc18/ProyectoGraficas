let snake = null;
window.addEventListener('DOMContentLoaded', ()=>{

   /*Snake Object Logic*/
   class Snake{
      constructor(speed=1,user_mode=false) {
         this.speed = speed; //Velocidad del Snake que de forma inicial es 1
         this.directionController = { //Diccionario de Controles  
             "USER":{"a":[1,0,0],"w":[0,1,0],"s":[0,-1,0],"d":[-1,0,0],"none":[0,0,1]}, //Guardamos los controles de la AI 
             "FIRST_P":{"a":[1,0,0],"w":[0,1,0],"s":[0,-1,0],"d":[-1,0,0],"none":[0,0,1]} //Guardamos los controles del usuario que son dinámicos
         };
         this.oppositeKeyCode= {"a":"d","w":"s","s":"w","d":"a"}; //Diccionario que te guarda las direcciones contrarias posibles, 
         //para actualizar los controles del siguiente time step (IA)
         this.currentDirection = [[0,0,1]]; //Dirección que lleva cada parte del cuerpo del snake 
         this.chosenDirection = [0,0,1]; //Dirección que se selecciona con un addEventListener
         this.volatileDirection = [0,0,0]; //Define la dirección de la cola del snake (Temp)/ comparas con el de atras
         this.translationError = 0.01; //Error aceptado en el movimiento del snake (Evitar traspasar lineas)
         this.isValidTransition = [true]; //Valida si se puede ejecutar el cambio de dirección en los 3 ejes
         this.isValidEating = false; //Valida si comió manzana (Si está o no en la misma posición de la manzana)
         this.body = [
             new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshBasicMaterial( { color: 0x00ff00} ) ),
            ]; //Creamos directamente la cabeza del snake la cual se aloja en body[0]
         this.body[0].position.set(
             Math.round(Math.random()*(x-1)),
             Math.round(Math.random()*(y-1)),
             Math.round(Math.random()*(z-1))
         ); //Colocamos a la cabeza del snake en una posicion aleatoria que no se salga del grid
         this.gameOver = false; //Booleano que te verifica si se acabo el juego
         this.chosenSpeed = speed; //La velocidad del snake que elegimos           
         this.user_mode = user_mode; //Es un booleano que te verfica si está en el modo jugador o modo AI
         this.lastPosition = [-1,-1,-1]; //Checa que no entre en el mismo estado que ya ha sido explorado. (Optimización)
         this.tempDir = []; //Controles volatiles que cambian dependiendo a la dirección que el snake yendo (Cambian dependiendo la currentDirection)
         this.lastKeyCode = "none"; //Guarda la ultima tecla que presionaste, osea toma la ultima señal
         this.cameraTransitionConstant = Math.PI/32; //Constante para girar lentamente (y que quedé derecho / sin inclinaciones)
         this.cameraControllerSign = { //Aquí va la big brain rotaciones
          //Toma la dirección a la que va y te dice si la rotación es positiva o negativa (Hacia donde estas yendo -> Hacia donde quieres ir)
            "100": {"010":+1,"0-10":-1,"001":-1,"00-1":+1}, //Las z así daban por una extraña razón (invertidas) (Creo que es por que rotamos la cámara 180°)
            "-100": {"010":-1,"0-10":+1,"001":+1,"00-1":-1}, 
            "010": {"100":-1,"-100":+1,"001":+1,"00-1":-1},
            "0-10": {"100":+1,"-100":-1,"001":-1,"00-1":+1},
            "001": {"100":+1,"-100":-1,"010":-1,"0-10":+1},
            "00-1": {"100":-1,"-100":+1,"010":+1,"0-10":-1}
            };
         this.cameraRotationVec = new THREE.Vector3(0,0,0); //Instanciamos el vector de rotación de la cámara, selecciona el eje que queremos rotar
         this.cameraChanging = false; //Valida si la cámara cambia o no
         this.cameraTransitionCounter = 0; //Contador de la rotación de la cámara
         this.cameraCurrentSign = 0; //Signo que indica si va hacia positivo o negativo  
      };


     //Te determinaba la posición contraria de la dirección actual para hacer los controles dinámicos 
     //Básicamente cambiamos de dirección primero y posteriormente esa dirección se vuelve la contraria de los controles dinámicas
     //direction = temporaldirecion que es la currentDirection
     oppositeController(keyCode_1,direction){
        if(keyCode_1 !== "none") { //Si la ultima tecla que presionaste es igual a ninguna
            let oppositeKeyCode = this.oppositeKeyCode[keyCode_1]; //Tomamos la direccion contraria de la ultima señal recibida (en Key{a,s,d,w}) 
            this.directionController["FIRST_P"][oppositeKeyCode] = direction; //El pivote para no perder la orientación de los controles dinámicos {Cambiamos el diccionario} 
            this.directionController["FIRST_P"][keyCode_1] = [ //La dirección ahora (girada) que se presionó se debe actualizar para no perder el sentido
                direction[0] * -1,
                direction[1] * -1,
                direction[2] * -1
            ]; //Ejemplo de las manos estiradas hacia los lados y rota hacia izquierda yendo hacia z
        }
     }
     
     //Gira la cámara de la snake, se ejecuta continuamente (animation) y gira la perspectiva del snake dependiendo si cameraChanging es true
     changeSnakeCamera(){
            //Rotación del eje de la cámara con respecto al eje del mundo (Estático)
            //Recibe de parametros el vector a rotar, y el ángulo que va a rotar 
            camera.rotateOnWorldAxis(this.cameraRotationVec,this.cameraCurrentSign*this.cameraTransitionConstant)   
            this.cameraTransitionConstant = Math.PI/32;  //Constante para girar lentamente (y que quedé derecho / sin inclinaciones)
            this.cameraTransitionCounter += 1; //Contador de la rotación de la cámara
            if( this.cameraTransitionCounter === 16 ){ //Hasta que de vuelta Math.PI/2 que son 90°
                this.cameraRotationVec.set( false,false,false ); //Paramos de rotar en un eje determinado 
                this.cameraChanging = false; //La cámara ya no está cambiando 
                this.cameraTransitionCounter = 0; //Y reiniciamos el contador 
            }  
        }

      // Tiene la lógica del movimiento del snake, como se mueve cada cubo siguiendo el cubo siguiente y si es valido cambiar de posición
      move(){
             for(let i=0;i<this.body.length;i++){//Recorremos el cuerpo del snake 
                   this.isValidTransition[i] =  //Check if the current position is valid to change direction (para cada parte del cuepro del snake)
                         Math.abs(this.body[i].position.x-Math.round(this.body[i].position.x)) < this.translationError &&
                         Math.abs(this.body[i].position.y-Math.round(this.body[i].position.y)) < this.translationError &&
                         Math.abs(this.body[i].position.z-Math.round(this.body[i].position.z)) < this.translationError;

                   if(this.isValidTransition[i]){ //Si la transición es valida del cubo [i]esimo.
                       if(i!==0) { // if( it is not the head ) {follow the cube at front} .
                           this.volatileDirection = [//Only one unit of distance per cube exist. Therefore I am comparing the [front_cube.position - behind_cube.position] to get behind_cube's direction.
                               Math.round(this.body[i - 1].position.x - this.body[i].position.x),
                               Math.round(this.body[i - 1].position.y - this.body[i].position.y),
                               Math.round(this.body[i - 1].position.z - this.body[i].position.z)
                           ];
                           //Solo hay una unidad de distancia por cubo. Por lo tanto, comparamos la posicion del cubo de enfrente  - posición del cubo detras para seguir al cubo de enfrente
                           //Para obtener la dirección del cubo detras
                           this.currentDirection[i] = this.volatileDirection; //La dirección actual de cada cubo es igual a la calculada con anterioridad
                       }else{  //Si es la cabeza entonces
                           if (this.lastPosition[0] !== Math.round(this.body[0].position.x) ||
                               this.lastPosition[1] !== Math.round(this.body[0].position.y)  ||
                               this.lastPosition[2] !== Math.round(this.body[0].position.z)) { //Si la última posición es diferente a la posición actual (CON QUE UN EJE SEA DIFERENTE)
                               this.lastPosition = [ //La ultima posición va a ser igual a la posición a la que va actualmente 
                                        Math.round(this.body[0].position.x),
                                        Math.round(this.body[0].position.y),
                                        Math.round(this.body[0].position.z),
                                    ];
                                if(snake.user_mode){//Si está en modo usuario (Movimientos de la cámara)
                                    this.cameraChanging = //Si la dirección a la que vamos es diferente a la dirección elegida por la tecla (AddEventListener) en algún eje de la cabeza 
                                                          //Regresa true y la camara tendrá que cambiar
                                        this.currentDirection[0][0] !== this.chosenDirection[0] ||
                                        this.currentDirection[0][1] !== this.chosenDirection[1] ||
                                        this.currentDirection[0][2] !== this.chosenDirection[2];
                                    if(this.cameraChanging){ //Si la cámara está cambiando
                                        this.cameraRotationVec.set( //La rotación de la cámara va a ser igual a la dirección seleccionada por el AddEventListener (osea hacia donde gira)
                                            this.currentDirection[0][0] === this.chosenDirection[0], //Si es true entonces va a girar en este eje(Ojo que num*false = 0 y num*true = num
                                            this.currentDirection[0][1] === this.chosenDirection[1], 
                                            this.currentDirection[0][2] === this.chosenDirection[2] 
                                        );
                                        //Elegimos el signo hacia donde va a girar la cámara, este depende hacia donde estas yendo y hacía donde quieres ir (regresa un int {1,-1})
                                        this.cameraCurrentSign = 
                                            this.cameraControllerSign["{0}{1}{2}".format(...this.currentDirection[0])]["{0}{1}{2}".format(...this.chosenDirection)]
                                        }
                                    }
                                    this.currentDirection[0] = this.chosenDirection; //La dirección actual cambia a la dirección elegida por  el AddEventListener (de la cabeza)
                                    this.speed = this.chosenSpeed; //La velocidad se iguala a la elegida (Por si cambia con el input)
                                    this.directionController["FIRST_P"]["none"] = this.chosenDirection; //Ahora cambiamos la dirección none como la dirección elegida, para que vaya para enfrente
                                    this.oppositeController(this.lastKeyCode,this.tempDir); // Ahora actualizamos los controles dinámicos, según la última tecla presionada y la dirección temporal
                                }   
                        }       
                    }      
            this.body[i].position.set( //Movemos cada cubito/Cuerpo de la snake por por la velocidad (se ejecuta continuamente)
                this.body[i].position.x + (this.currentDirection[i][0]*this.speed),
                this.body[i].position.y + (this.currentDirection[i][1]*this.speed),
                this.body[i].position.z + (this.currentDirection[i][2]*this.speed)
           );
        }
        if(snake.user_mode){ //Si es modo usuario 
            camera.position.set(...Object.values(this.body[0].position)); //La cánara hace tracking a la cabeza del snake
            if(this.cameraChanging) this.changeSnakeCamera(); //Si la cámara está cambiando ejecutamos la función de rotación
        }  
    }
  
    //Función que recibe la key presionada (se ejecuta cada vez que presionamos una tecla)
    changeDirection(keyCode){
        this.tempDir = this.currentDirection[0]; //Guardamos la dirección actual a la que va, temporalmente( Es un vec3 )
        this.chosenDirection = this.directionController["FIRST_P"][keyCode]; //Tomamos la dirección a la ve según los controles dinámicos
        this.lastKeyCode = keyCode; //Guardamos la última tecla presionada
        }

     //Function que te verifica si no se ha terminado el juego
      run(){
       if(!this.gameOver){ //Si no ha terminado el juego, entonces sigue corriendo
         this.checkSnakeState(); //Función que te permite validar si la snake come o no
         this.move(); //Ejecutamos la lógica del movimiento
       }
      }

      //Función que te verifica si puede comer o no la cabeza de la snake
      checkSnakeState(){
               this.isValidTransition[0] =  //Verifica si la posición actual es valida para cambiar dirección (que no cambie cuando quiera, que respete las lineas del grid) (de la cabeza)
                   Math.abs(this.body[0].position.x - Math.round(this.body[0].position.x)) < this.translationError &&
                   Math.abs(this.body[0].position.y - Math.round(this.body[0].position.y)) < this.translationError &&
                   Math.abs(this.body[0].position.z - Math.round(this.body[0].position.z)) < this.translationError &&
                   (this.lastPosition[0] !== Math.round(this.body[0].position.x) || //Y la última posición sea diferente a la posición actual
                    this.lastPosition[1] !== Math.round(this.body[0].position.y) ||
                    this.lastPosition[2] !== Math.round(this.body[0].position.z));

               if (this.isValidTransition[0]) { //Si la cabeza tiene una transición valida
                   if(!this.user_mode) this.send_time_step_signal(); //Enviamos la señal a la Inteligencia Artificial
                   this.isValidEating = //Si la manzana tiene la misma posición de que la cabeza del Snake entonces es TRUE
                       Math.round(this.body[0].position.x) === apple.object.position.x &&
                       Math.round(this.body[0].position.y) === apple.object.position.y &&
                       Math.round(this.body[0].position.z) === apple.object.position.z;
                   if(this.isValidEating) { //Si la cabeza puede comer(TRUE) entonces
                       this.addToSnake(); //Agregamos una bolita a la snake
                       apple.setNewPosition(); //Y dibujamos una nueva manzana en el grid
                       right_bar_update(this.body.length);  //Actualizamos la longitud del snake del la barra navegadora
                   }
                   this.gameOverLogic(); //Verficamos si el juego no ha terminado

           }
      }

      //Agrega una bolita al cuerpo de la snake 
      addToSnake(){
          this.currentDirection.push([0,0,0]); //Agregamos la nueva bolita al final de la lista de las direcciones
          this.body.push(new THREE.Mesh( new THREE.BoxGeometry(),  new THREE.MeshBasicMaterial( { color: 0x00DD00} )  )); //Agregamos la figura al cuerpo del snake
          this.body[this.body.length-1].position.set( //asignamos la posición de la cola del snake
            Math.round(this.body[this.body.length-2].position.x - this.currentDirection[this.body.length-2][0]), //Calculamos la posicion de la cola (penultimo) para agregar
            Math.round(this.body[this.body.length-2].position.y - this.currentDirection[this.body.length-2][1]), //la nueva cola (ultimo)
            Math.round(this.body[this.body.length-2].position.z - this.currentDirection[this.body.length-2][2])
          );
          scene.add(this.body[this.body.length-1]);//Y lo dibujamos en la escena
      }
      
      //Verifica si ha perdido 
      gameOverLogic(){
          if(!this.gameOver) { //Si no ha perdido,entonces
              this.gameOver = this.didLose(); //Vemos si colisiono
              if(this.gameOver){  //Si colisionó, entonces
                 restart_game(); //reiniciamos el juego
              }
          }
      }

      //Verifica si colisionó con algún obstáculo, consigo misma o se salió del grid 
      didLose(){
          // it is set at 4 because at this point the snake is capable to collision itself.
          //check if the head is in any body part.
          for(let i=4;i<this.body.length;i++){  //Recorrer la snake para ver si no chocó con algo (Puede colisionar a partir de length=4)
              if(Math.abs(this.body[0].position.x-this.body[i].position.x)<this.translationError &&
                 Math.abs(this.body[0].position.y-this.body[i].position.y)<this.translationError &&
                 Math.abs(this.body[0].position.z-this.body[i].position.z)<this.translationError){ //Si choca con alguna parte de su cuerpo entonces pierde (TRUE)
                  return true; //Entonces muere
              }
          }
           //Verificamos si la cabeza del snake está fuera del grid (Ojo le sumamos el error de Three.js)
          if (this.body[0].position.x > x - 1 + this.translationError || this.body[0].position.x < -this.translationError ||
              this.body[0].position.y > y - 1 + this.translationError || this.body[0].position.y < -this.translationError ||
              this.body[0].position.z > z - 1 + this.translationError || this.body[0].position.z < -this.translationError) {
              return true;
          }
          //Verifica si chocamos con los obstaculos (Implementación extra)
          return walls.didCollideWith([
              this.body[0].position.x,
              this.body[0].position.y,
              this.body[0].position.z
                        ],this.translationError);
      }

      //Esta función verifica las posiciones que estan tomadas por el cuerpo del snake. 
      takenLocations(){
          let takenPositions = [];
          for(let i=0;i<this.body.length;i++){
            takenPositions.push([  //Recorremos el body del snake para guardar sus posiciones en un arreglo 
                    Math.round(this.body[i].position.x),
                    Math.round(this.body[i].position.y),
                    Math.round(this.body[i].position.z)
            ]);
          }
          return takenPositions; //Regresa las posiciones tomadas por el snake juas xd
      }

      //Elimina los objetos de la escena para agregar una nueva snake 
     clear(speed,user_mode){
          for (let i = 0; i < this.body.length; i++) { //Recorremos el cuerpo del snake para darle kill
            scene.remove(this.body[i]); //Los borramos de la escena (Cada parte del cuerpo de la snake)
          }
         snake = new Snake(speed,user_mode); //Creamos una nueva snake 
         scene.add(snake.body[0]); //Agregamos la snake a la escena
     }


    send_time_step_signal(){
        time_step_signal(); //Envia la señal a la inteligencia artificial (para crear un nuevo time step )
     }

   }
   snake = new Snake(); //Instanciamos el objeto del snake 
});

//Reinicia el juego 
function restart_game(){
    if(!snake.user_mode) receive_update_signal();
    snake.clear(snake.chosenSpeed,snake.user_mode); //Limpiamos el snake (Está arriba la función)
    if(snake.user_mode){ //Si la snake esta en modo jugador
        camera.position.set(snake.body[0].position.x, snake.body[0].position.y, snake.body[0].position.z); //La cámara se posiciona donde se encuentre la cabeza del snake
        camera.rotation.set(0,Math.PI,0); //Y nos volvemos a posicionar detras de la snake (Como si fueramos su cabeza)
    }
    walls.clear(); //Limpiamos los obstaculos 
    apple.clear(); //Limpiamos la manzana (borra y crea nueva instancia)
    delete_labeled_walls(); //Eliminamos las impresiones de los obstaculos 
    right_bar_update(); //Actualiza los datos del menu (Diseño)
    scene.add(apple.object); //Agregamos una nueva manzana a escena
}

function camera_rotation(){

}