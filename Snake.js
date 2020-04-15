let snake = null;
window.addEventListener('DOMContentLoaded', ()=>{

   /*Snake Object Logic*/
   class Snake{
      constructor() {
         this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00} ); //El material del Snake
         this.length = 1; //Longitud Inicial del Snake
         this.speed = 0.05; //Velocidad con el que avanza el Snake
         this.direction = ['a','d','w','s','e','q']; //Necessary for AI
         this.currentDirection = [[0,0,0]]; //Dirección que lleva cada parte del cuerpo del snake 
         this.chosenDirection = [0,0,0]; //Dirección que se selecciona con un addEventListener
         this.volatileDirection = [0,0,0];  //Define la dirección de la cola del snake (Temp) 
         this.translationError = 0.01; //Error aceptado en el movimiento del snake (Evitar traspasar lineas)
         this.isValidTransition = [[true,true,true]]; //Valida si se puede ejecutar el cambio de dirección
         this.isValidEating = [false,false,false]; //Valida si comió manzana
         this.didCollide = [false,false,false]; //Verifica si choca el snake
         this.body = [
             new THREE.Mesh( new THREE.BoxGeometry(), this.material ),
            ]; //Creamos directamente la cabeza del snake la cual se aloja en body[0]
         this.bodyIndex = 0; //EL indice que será necesario para recorrer
         this.gameOver = false; //Indica si el juego terminó o nel
      }

     changeDirection(keyCode){
          if (keyCode === 'a')  //left
               this.chosenDirection = [1,0,0]; //Izquierda
          else if (keyCode === 'd')  //right
               this.chosenDirection = [-1,0,0]; //Derecha
          else if(keyCode === 'w') //forward
               this.chosenDirection = [0,0,1]; //Enfrenet
          else if(keyCode === 's') //back
             this.chosenDirection = [0,0,-1]; //Atras (Aunque no debería existir)
          else if (keyCode === 'e') // up
               this.chosenDirection = [0,1,0]; //Arriba
          else if (keyCode === 'q') //down
               this.chosenDirection = [0,-1,0]; //Abajo
            
          if(this.chosenDirection[0]*-1 === this.currentDirection[0][0] && // If is the opposite Direction, the snake direction does not change.
             this.chosenDirection[1]*-1 === this.currentDirection[0][1] &&
             this.chosenDirection[2]*-1 === this.currentDirection[0][2]){  //Si quieres hacia "atras", la dirección no cambia 
              this.chosenDirection = this.currentDirection[0];
          }


      }
      move(){
             for(;this.bodyIndex<this.length;this.bodyIndex++){ //Recorremos el cuerpo del snake 
                   this.isValidTransition[this.bodyIndex] = [  //Check if the current position is valid to change direction
                         Math.abs(this.body[this.bodyIndex].position.x-Math.round(this.body[this.bodyIndex].position.x)) < this.translationError, //Vemos si el snake puede cambiar de 
                         Math.abs(this.body[this.bodyIndex].position.y-Math.round(this.body[this.bodyIndex].position.y)) < this.translationError, //Dirección en los 3 puntos 
                         Math.abs(this.body[this.bodyIndex].position.z-Math.round(this.body[this.bodyIndex].position.z)) < this.translationError  //x,y,z
                   ];
                   if(this.isValidTransition[this.bodyIndex][0] && this.isValidTransition[this.bodyIndex][1] && this.isValidTransition[this.bodyIndex][2]){ //Si se puede cambiar 
                       if(this.bodyIndex!==0) { // if( it is not the head ) {follow the cube at front} .                                                    //de dirección then 
                           this.volatileDirection = [ //Only one unit of distance per cube exist. Therefore I am comparing the [front_cube.position - behind_cube.position] to get behind_cube's direction.
                               Math.round(this.body[this.bodyIndex - 1].position.x - this.body[this.bodyIndex].position.x), //Consigue la dirección del cubo de atras
                               Math.round(this.body[this.bodyIndex - 1].position.y - this.body[this.bodyIndex].position.y), //tanto su cireciión en x,y,z
                               Math.round(this.body[this.bodyIndex - 1].position.z - this.body[this.bodyIndex].position.z)
                           ];
                           this.currentDirection[this.bodyIndex] = this.volatileDirection; //Asigna el valor la dirección anterior calculada a la dirección actual
                       }else{                                                              //del cuerpo actual recorrido
                            this.currentDirection[0] = this.chosenDirection; //Como nada más es la cabeza, pues la dirección se asigna directo 
                       }
                   }
                   this.body[this.bodyIndex].position.set( //Modificamos la posicion para el movimiento del render  
                        this.body[this.bodyIndex].position.x + (this.currentDirection[this.bodyIndex][0]*this.speed),
                         this.body[this.bodyIndex].position.y + (this.currentDirection[this.bodyIndex][1]*this.speed),
                         this.body[this.bodyIndex].position.z + (this.currentDirection[this.bodyIndex][2]*this.speed)
                    );
            }
             this.bodyIndex = 0; //Lo regresamos a 0 para entrar de nuevo al for en el siguiente render
             this.checkSnakeState(); //Checamos si el snake puede comer 
      }
      checkSnakeState(){
          this.isValidEating = [
              Math.abs(this.body[0].position.x - apple.object.position.x ) < this.translationError, //Igual que arriba,
              Math.abs(this.body[0].position.y - apple.object.position.y ) < this.translationError, //checamos las 3 posiciones
              Math.abs(this.body[0].position.z - apple.object.position.z ) < this.translationError
          ];
          this.gameOverLogic(); //Ejecutamos por si se acaba el juego
          if(this.isValidEating[0] && this.isValidEating[1] && this.isValidEating[2]) { //Si se puede comer TRUE
            this.addToSnake(); //Entonces agregamos un cuadrito al snake 
            apple.setNewPosition(); //Y agregamos una nueva manzana al grid
        }
      }
      addToSnake(){
          this.currentDirection.push([0,0,0]); //Agregamos la nueva Dirección del nuevo cubo (cuerpo snake)
          this.body.push(new THREE.Mesh( new THREE.BoxGeometry(), this.material )); //Agregamos el nuevo cubo al cuerpo del snake
          this.body[this.length].position.set( //Asignamos la posición de la nueva figura
            Math.round(this.body[this.length-1].position.x),   //Le asignamos las nuevas posiciones
            Math.round(this.body[this.length-1].position.y),   //en x,y,z de 
            Math.round(this.body[this.length-1].position.z)
          );
          scene.add(this.body[this.length]); //Agregamos a la escena (visual) la figura nueva
          this.length += 1; //Crece el cuerpo del snake en 1
      }
      gameOverLogic(){

          if(!this.gameOver) {
              this.bodyIndex = 0

              this.bodyIndex = 4 // it is set at 4 because at this point the snake is capable to collision itself.
              //check if the head is in any body part.
              for(;this.bodyIndex<this.length;this.bodyIndex++){ //Recorremos el cuepo del snake a partir de, por que a partir de ahí puede autochocar 
                   this.didCollide = [
                      Math.abs(this.body[0].position.x-this.body[this.bodyIndex].position.x)<this.translationError, 
                      Math.abs(this.body[0].position.y-this.body[this.bodyIndex].position.y)<this.translationError,
                      Math.abs(this.body[0].position.z-this.body[this.bodyIndex].position.z)<this.translationError
                  ];
                  if(this.didCollide[0] && this.didCollide[1] && this.didCollide [2]){ //En caso de que colisione, se detiene el juego
                      this.gameOver = true;
                      break;
                  }
              }
              this.bodyIndex = 0; //Regresamos a 0 el Indice 

              //check if the head is outside the Cell (Grid)
              //Veficamos si la cabeza está afuera del grid 
              if (this.body[0].position.x > x - 1 + this.translationError || this.body[0].position.x < -this.translationError ||
                  this.body[0].position.y > y - 1 + this.translationError || this.body[0].position.y < -this.translationError ||
                  this.body[0].position.z > z - 1 + this.translationError || this.body[0].position.z < -this.translationError) {
                  this.gameOver = true; //Asignamos la finalización del juego
              }


              if(this.gameOver){ // this only run once to display the 'game over' text.
                  let loader = new THREE.FontLoader(); //Simplemente cargamos un tipo de fuente 
                  loader.load('https://raw.githubusercontent.com/PaDiOc18/ProyectoGraficas/master/helvetiker_regular.typeface.json', function (font) {
                      let text_geometry = new THREE.TextGeometry('Game Over', { //Agregamos texto Game Over y Características
                          font: font,
                          size: 0.8,
                          height: 0.2,
                          curveSegments: 6
                      });
                      let text_material = new THREE.MeshPhongMaterial({color: 0xFF0000}), //Material de las letras
                          text_mesh = new THREE.Mesh(text_geometry, text_material); //Hacemos la figura 
                      scene.add(text_mesh); //Y la agregamos a escena
                  });
              }
          }

      }
      takenLocations(){
          let takenPositions = []; //Creamos variable que guarda posiciones ocupadas 
          for(;this.bodyIndex<this.length;this.bodyIndex++){ //Recorremos el snake(guardamos las posiciones para que no se genera la manzana en el snake)
            takenPositions.push([ 
                    Math.round(this.body[this.bodyIndex].position.x), //En x,y,z
                    Math.round(this.body[this.bodyIndex].position.y),
                    Math.round(this.body[this.bodyIndex].position.z)
            ]);
          }
          return takenPositions;
      }
   }
   snake = new Snake();

});