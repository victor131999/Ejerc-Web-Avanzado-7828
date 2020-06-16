import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as firebaseHelper from 'firebase-functions-helper';
import * as express from 'express';
import * as bodyParser from 'body-parser';

//inicualizacion de la aplicacion para produccion o de forma loca(el codigo comentado es para trabajar de forma local)
//admin.initializeApp(functions.config().firebase);
admin.initializeApp({
    credential: admin.credential.cert(require('../../serviceAccountKey.json')),
    databaseURL: "https://ejercicio-web-avanzado.firebaseio.com"
});


//variables
const db = admin.firestore();
const app = express();
const main = express();
const collectionPersons = "persons";

//lee el body que se envia or postman
main.use("/api", app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({extended: false}));

export const api = functions.https.onRequest(main);

//------------------------------------Metodos y url de las GRUDs--------------------------------------------

//agregar personas
app.post('/persons', async (req, res) => {           
    try{      
        const newPerson = await firebaseHelper.firestore.createNewDocument(db, collectionPersons, req.body);
        res.status(201).send(`Person was added to collection with id ${newPerson.id}`);
    }
    catch(err){
        res.status(400).send(`An error has ocurred ${err}`)
    }
});

//ver personas por su id
app.get('/persons/:id',(req,res)=>{
    firebaseHelper.firestore.getDocument(db, collectionPersons, req.params.id)
    .then(doc => res.status(200).send(doc))
    .catch(err => res.status(400).send(`An error has ocurred ${err}`));
});

//actualizar los datos de la persona por su id
app.patch('/persons/:id', async(req,res)=>{
    try {

        const docUpdated = await firebaseHelper.firestore.updateDocument(db, collectionPersons,req.params.id, req.body);
        res.status(200).send(`Person with id ${docUpdated}`);
    } catch (err) {
        res.status(400).send(`An error has ocurrend ${err}`);
    }
});

//eliminar la persona por su id
app.delete('/persons/:id',async(request,response)=>{
    try {
        const docDeleted = await firebaseHelper.firestore.deleteDocument(db, collectionPersons, request.params.id);
        response.status(200).send(`Person was deletd ${docDeleted}`);
    } catch (err) {
        response.status(400).send(`An error has ocurred ${err}`);
    }
});

//vizualizar las personas desde el mayor hasta el menor ingresado
app.get('/persons/minAge/:age', (req, res) =>{     
    let intAge = parseInt(req.params.age);
    let queryArray = [['age', '>=', intAge]];
    let orderBy = ['age','desc'];
    firebaseHelper.firestore.queryData(db, collectionPersons, queryArray, orderBy)
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).send(`An error has ocurred ${err}`));
});

//vizualizar las personas desde el menor hasta el mayor ingresado
app.get('/persons/maxAge/:age', (req, res) =>{     
    let intAge = parseInt(req.params.age);
    let queryArray = [['age', '<=', intAge]];
    let orderBy = ['age','desc'];
    firebaseHelper.firestore.queryData(db, collectionPersons, queryArray, orderBy)
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).send(`An error has ocurred ${err}`));
});


//vizualizar todas las personas de la base de datos
app.get('/persons',(req, res)=>{
    firebaseHelper.firestore.backup(db,collectionPersons)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).send(`An error has ocurred ${err}`));
});

export {app};
