let walls;
   class Walls{
    //Constructor de los obstaculos
       constructor() {
           this.array = []; //Creamos un arreglo de los obstaculos que se van a crear 
       }
       add(wall){
           this.array.push(wall); //Agregamos el obstaculo a el arreglo de obstaculos 
           scene.add(wall);//Agregamos a escena la wall 
       }
       //Verifica si la cabeza chocó con un obstáculo
       didCollideWith(coord,translationError){
        let i;
        for(i in this.array) { //Recorremos de i hasta la longitud del arreglo
            if (Math.abs(this.array[i].position.x - coord[0]) < translationError &&
                Math.abs(this.array[i].position.y - coord[1]) < translationError &&
                Math.abs(this.array[i].position.z - coord[2]) < translationError) {
                return true; //si choca con las coordenadas de la cabeza devuelve verdadero (Que significa que si chocó con un obstáculo)
            }

        }
       }

       //Limpia los obstaculos de la escena
       clear(){
           for(let i=0;i<this.array.length;i++){
               scene.remove(this.array[i]);
           }
       }
   }
   //Creamos una clase para la wall 
   class Wall{
    //Esta tendra una posición 
     constructor(x,y,z) {
             let material = new THREE.MeshBasicMaterial( { color: 0x333333} ), //Material de la wall y color grisaceo
                 geometry = new THREE.ConeGeometry( 0.75, 1, 3 ); //Geometria de la wall
             this.object = new THREE.Mesh( geometry, material ); //Creamos la figura 
             let edges_geometry = new THREE.EdgesGeometry( this.object.geometry ), //Material de las lineas
                 edges_material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } ), //Material de las lineas color blanco 
                 edges = new THREE.LineSegments( edges_geometry, edges_material ); //Creamos las lineas 
             this.object.add( edges ); //Le agregamos las lineas a las figuras para que tenga un contorno 
             this.object.position.set(x,y,z); //Le asignamos la posición que le pasamos de parametro al constructor 
             this.object.scale.set(0.6,0.6,0.6); //Y lo hacemos más pequeño para que no se salga de su respectivo cubito 
        }
    }
    walls = new Walls(); //Instanciamos las walls 

