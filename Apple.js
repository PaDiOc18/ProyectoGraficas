let apple = null;
window.addEventListener('DOMContentLoaded', ()=> {

    /*Snake Object Logic*/
    class Apple {
        constructor() {
            this.material = new THREE.MeshBasicMaterial({color: 0xff0000}); //El materia de la apple color rojo
            this.object = new THREE.Mesh(new THREE.BoxGeometry(), this.material); //Hacemos la figura 
            this.object.scale.set(0.55,0.55,0.55); //Ajustamos la escalapara que no cubra todo el minigrid
            this.setNewPosition(); //Y la invocamos a una nueva posicion
        }
        setNewPosition(){
            let blankPositions = cell.blankPositions(), //Obtenemos las posiciones que no esten ocupadas por el snake
                index = Math.floor(Math.random()*blankPositions.length); //Redondeamos a menos (para un random)
            this.object.position.set( //Le asignamos la posicion a la manzanukis
                blankPositions[index][0],
                blankPositions[index][1],
                blankPositions[index][2]
            );

        }


    }


    apple = new Apple();

});