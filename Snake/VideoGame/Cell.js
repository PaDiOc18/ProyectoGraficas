let x = 4, y = 4, z = 4,cell = null, obstacles=null;

window.addEventListener('DOMContentLoaded',() => {

    class Matrix3D{
        constructor(x,y,z,fill=false,color=0x000000) {
            this.blankCoords = []; //Array que contendra los espacios en blanco
            for(let x_it=0;x_it<x;x_it++){
                for(let y_it=0;y_it<y;y_it++){
                    for(let z_it=0;z_it<z;z_it++){ //Recorremos las celdas (Tridimensional )
                        this.blankCoords.push([x_it,y_it,z_it]); //Al inicio todas las coordenadas son Vacias 
                    }
                }
            }
            let geometry_cube = new THREE.BoxGeometry(); //Creamos la geometria de un cubo 
            if(fill){ //Inicialmente aqui iban a estar los obstaculos (que iban a ser cubos rellenos color verder,pero se canceló)
                 geometry_cube.translate(-(x-1)/2,-(y-1)/2,-(z-1)/2); //Movemos la geometria del cubo al centro del grid 
                 this.object = new THREE.Mesh( geometry_cube, new THREE.MeshBasicMaterial( { color: color} ) ); //Creamos el objeto del cubo 
                 let geo = new THREE.EdgesGeometry( this.object.geometry ), //Geometria que solo toma las aristas 
                     mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 1 } ), //Material de las lineas de la geometria
                     wireframe = new THREE.LineSegments( geo, mat ); //Dibuja solo las lineas del cubo 
                 this.object.add( wireframe ); //Agregamos el cubito vacío
            }else{
              let geometry = new THREE.EdgesGeometry( geometry_cube ), //Creamos la geometria de un cubo
                  material = new THREE.LineBasicMaterial( { color: color,  transparent:true, opacity:0.25} ); //Creamos el materia del que va a estar hecho
              this.object = new THREE.LineSegments( geometry, material ); //La figura de solo las aristas del cubo 
            }
            //Asignamos sus posiciones
            //Primero se dibuja la cajita grande (La cubierta)
            this.x = x;
            this.y = y;
            this.z = z;
            this.cellsArray = this.createCellsArray(); //Retorna un array tridimensional 
        }

        //Creamos las celdas pequeñas adentro de la cubierta (Se va llenando el cubo grande)
        createCellsArray(){
               let x_index = 0, y_index = 0, z_index = 0, triDimensionalArray = this.triDimensionalArray();
                  for(;x_index<this.x;x_index++){
                           for(;y_index<this.y;y_index++){
                              for(;z_index<this.z;z_index++){
                                 triDimensionalArray[x_index][y_index][z_index] = this.object.clone();
                                 triDimensionalArray[x_index][y_index][z_index].position.set(x_index,y_index,z_index);
                              }
                              z_index = 0;
                              //Primero llenamos la z luego y, al último x
                           }
                           y_index = 0;
                        }
                  return triDimensionalArray;
               }


      //Para tener la capacidad de localizar una celda especifica
      triDimensionalArray(){
            let array = Array(this.x), //Creamos un array tridimensional 
               x_index = 0, y_index = 0, z_index = 0;

            for (; x_index < this.x; x_index++) {
              array[x_index] = Array(this.y);
              for (; y_index < this.y; y_index++) {
                 array[x_index][y_index] = Array(this.z);
              }
              y_index = 0;
            }
            return array;
        };

        //Retorna las posiciones que esten vacias del grid
        blankPositions(){
            let copyBlankCoords = this.blankCoords.slice(), //Copiar sin referenciar 
                snakePositions = snake.takenLocations();
            for(let index=0; index<snakePositions.length;index++) {
                deleteElementFromArrays(snakePositions[index],copyBlankCoords);
            }
            return copyBlankCoords;
        };
        //Limpia el grid 
        clear(new_x,new_y,new_z){
            cell = new Matrix3D(new_x,new_y,new_z);
        }
    }
    cell = new Matrix3D(x,y,z);    //Instanciamos las celdas
});

// cambiamos el contenido de un array eliminando elementos existentes (Elimina el elemento desde un indice especifico ) (ESTE ES EL BUENO)
function deleteElementFromArrays(element,array){
    for(let index = 0;index<array.length ;index++ ){
        if(element[0] === array[index][0] && element[1] === array[index][1] && element[2] === array[index][2]){
            array.splice(index, 1);
            break;
        }
    }
}

//Eliminamos un elemento del array (PRIMER INTENTO / OBSOLETO )
function deleteElement(element,array){
    for(let index = 0;index<array.length ;index++ ){
        if(element === array[index]){
            console.log(element,array[index]);
            array.splice(index, 1);
            break;
        }
    }
}

//Agregamos la matriz a la escena 
window.addMatrix3DToElement = function(cell, scene){
              let x_index = 0, y_index = 0, z_index = 0;
              for(;x_index<cell.x;x_index++){
                          for(;y_index<cell.y;y_index++){
                             for(;z_index<cell.z;z_index++){
                                scene.add(cell.cellsArray[x_index][y_index][z_index]);
                             }
                             z_index = 0;
                          }
                          y_index = 0;
                       }
              };

//Redimensionamos el grid (elimina el grid viejo y crea uno nuevo)
function resize_grid(new_x,new_y,new_z){
    let x_index = 0, y_index = 0, z_index = 0;
    for(;x_index<cell.x;x_index++){
                for(;y_index<cell.y;y_index++){
                   for(;z_index<cell.z;z_index++){
                      scene.remove(cell.cellsArray[x_index][y_index][z_index]); //Eliminamos las celdas de la escena
                   }
                   z_index = 0;
                }
                y_index = 0;
             }
    cell.clear(new_x,new_y,new_z); //Y creamos una nueva con los nuevos valores de los parámetros 
    x = new_x; y = new_y; z=new_z; //Y actualizamos las variables globales de x,y,z. 
}

//Se ejecuta a tiempo real cuando incrementas el grid en x 
window.addEventListener("load",()=>{
    document.getElementById('input-resize-x').addEventListener('change',element=>{
        new_x = element.target.value;
        resize_grid(new_x,y,z);
        gridSize_el.innerHTML = "[ {0}, {1}, {2} ]".format(new_x,y,z); //Imprime el x,y,z en la barra de navegación derecha
        calibrate_cell();
    });

//Se ejecuta a tiempo real cuando incrementas el grid en y 
    document.getElementById('input-resize-y').addEventListener('change',element=>{
        new_y = element.target.value;
        resize_grid(x,new_y,z);
        gridSize_el.innerHTML = "[ {0}, {1}, {2} ]".format(x,new_y,z); //Imprime el x,y,z en la barra de navegación derecha
        calibrate_cell();
    });
//Se ejecuta a tiempo real cuando incrementas el grid en z 
    document.getElementById('input-resize-z').addEventListener('change',element=>{
        new_z = element.target.value;
        resize_grid(x,y,new_z);
        gridSize_el.innerHTML = "[ {0}, {1}, {2} ]".format(x,y,new_z); //Imprime el x,y,z en la barra de navegación derecha
        calibrate_cell()
    });
    //Colocamos la escena en el centro  
    function calibrate_cell(){
        addMatrix3DToElement(cell,scene);
        if(!snake.user_mode || !play) scene.position.set(-(x-1)/2,-(y-1)/2,-(z-1)/2);
        window.wall_selector_resize(); //Y actualizamos los selectores al tamaño nuevo del grid 
    }
});