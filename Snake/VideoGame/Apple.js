let apple = null;
window.addEventListener('DOMContentLoaded', ()=> {

    /*Apple Object Logic*/
    class Apple {
        //El constructor de la manzana
        constructor() {
            this.material = new THREE.MeshBasicMaterial({color: 0xff0000}); //Material del que esta hecho la snake
            this.object = new THREE.Mesh(new THREE.BoxGeometry(), this.material); //Creamos el objeto de THREE.JS
            this.object.scale.set(0.55,0.55,0.55); //Le asignamos una escala menor a la de las celdas 
            this.setNewPosition(); //Le asignamos una nueva posición
        }
        //Le asignamos una nueva posición a la manzana 
        setNewPosition(){
            let blankPositions = cell.blankPositions(), //Obtenemos las posiciones desocupadas
                index = Math.floor(Math.random()*blankPositions.length); //agarramos un indice aleatorio
            this.object.position.set( //Le asignamos una posición
                blankPositions[index][0],
                blankPositions[index][1],
                blankPositions[index][2]
            );
        }
        //Limpiamos la manzana de escena 
        clear(){ 
            scene.remove(this.object); //Removemos de la escena
            apple = new Apple(); //Instanciamos nuevo objecto
        }
    }
    apple = new Apple(); //Instanciamos nuevo objecto
});