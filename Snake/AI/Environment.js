class SnakeEnvironment{
    constructor() {
        `
        this.rewards: Blank = -0.5, Danger = -2, Apple = +2
        `
        //Terminal state = Cuando pierde la snake 
        this.time_step = 0; //Inicializamos el time step (Cada paso que da)(Otra instancia de tiempo / puede ser la misma reward pero en diferente tiempo)
        this.markov_trajectory = []; //Es la secuencia (conjunto de estados hasta el estado final) states, actions and rewards 
        this.rewards = {"b":-0.5,"d":-2,"a":+2}; //Cuanto valen las recompensas segun la casilla
        //b es blank, d es danger y a es apple
        this.episode_step = 1; //Toda tarea que tenga un terminal state se le considera Episode (Es un conjunto de secuencias/camino)
        this.max_score = 0; //Guardamos el contador de la length maxima de la snake
    }

    read_environment(){
        //Creamos un diccionario que tiene dos elementos
        //La posición de la manzana y creamos una lista vacía
        //de las casillas peligrosas (EXTREMOS Y OBSTACULOS). 
        let env_sensor = {"applePos":[
             apple.object.position.x,
             apple.object.position.y,
             apple.object.position.z
                ], "dangerPos":[]},
            pos_x,pos_y,pos_z;

        //Agregamos las casillas peligrosas a la lista del diccionario
        //dangerPos 
        for(let i=0; i<walls.length;i++){
            pos_x = Math.round(walls[i].object.position.x);
            pos_y = Math.round(walls[i].object.position.y);
            pos_z = Math.round(walls[i].object.position.z);
            env_sensor["dangerPos"].push([pos_x,pos_y,pos_z])
        }
        return env_sensor;
    }
    //Le pasamos la politica que está en un json.
    read_text_env(pack){
        this.rewards = pack["en_rew"];
        this.episode_step = pack["es"];
        this.max_score = pack["max_score"];
    }
}


