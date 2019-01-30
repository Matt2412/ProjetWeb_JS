/* global downloadPromise uploadPromise resetPromise updatePromise */
/* see http://eslint.org/docs/rules/no-undef */

/************************************************************** */
/* CONSTANTES */
/************************************************************** */

const base_url = "http://localhost:8888/";
const local_todos = "./Projet-2018-todos.json";
const local_users = "./Projet-2018-users.json";
const api_header = 'X-API-KEY';
const api_key_value = '57deb7260bada1117ad2';
const url_todos = 'http://localhost:8888/index.php/todos/';
const url_users = 'http://localhost:8888/index.php/users/';
let headers = new Headers();
headers.set(api_header, api_key_value);

////////////////////////////////////////////////////////////////////////////////
// ETAT : classe d'objet pour gérer l'état courant de l'application
////////////////////////////////////////////////////////////////////////////////

function State(users = [], todos = [], filters = [], sort = "NONE"){
  this.users  = users;
  this.todos  = todos;
  this.filters = filters;
  this.sort   = sort;

  //returns the JSON object of a user
  this.get_user_info = (user_id) => {
    return this.users.find((o)=>o['_id']===user_id);
  };

  //returns the TODO objects created by a user
  this.get_user_todos = (user_id) => {
    const result = this.todos.filter( o => (o['createdBy']===user_id) && (!o['people'].includes(user_id)));
    return result;
  };

  //returns the TODO objects where a user is mentioned
  this.get_mentioned_todos = (user_id) => {
    let mentioned_todos = [];
    mentioned_todos = this.todos.filter( o => o['people'].includes(user_id) );
    return mentioned_todos;
  };
}//end State


////////////////////////////////////////////////////////////////////////////////
// OUTILS : fonctions outils, manipulation et filtrage de TODOs
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// RENDU : fonctions génération de HTML à partir des données JSON
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// HANDLERS : gestion des évenements de l'utilisateur dans l'interface HTML
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// FETCH Fonction permettant de charger des données asynchrones
////////////////////////////////////////////////////////////////////////////////

function get_local_todos() {
  return fetch(local_todos)
    .then(response => response.text())
}

function get_local_users() {
  return fetch(local_users)
    .then(response => response.text())
}

function get_local_todos_Json() {
  return fetch(local_todos)
    .then(response => response.json())
}
// pour creer un element HTML
function createNode(element) {
     return document.createElement(element);
 }
//pour ajouter l'element el au parent
 function append(parent, el) {
   return parent.appendChild(el);
 }
/*########################Written code###############################*/

//pour creer un todo TASK dans le HTML qui fait parto de la liste UL

function createListHTML(task,ul){
  /*on ajoute le titre*/
  const li = createNode('li');
  let h4 = createNode('h4');
  h4.innerHTML = task.title;
  /*on ajoute le deadline*/
  let span = createNode('span');
  span.innerHTML = task.deadline;
  span.innerHTML += ' ' + task.status;
  span.classList.add("text-muted");
  append(li,h4);
  let button = createNode('button');
//pour afficher la description d'un todo lorsqu'on clique sur le button correspondant
  button.addEventListener("click", function()
  {
	   let titre = document.getElementById('titre-todo-selection');
     titre.innerHTML = task.title;
  	 let date = document.getElementById('date-todo-selection');
  	 date.innerHTML = task.creation + ' -> ' + task.deadline;
     let etat = document.getElementById('etat-todo-selection');
  	 etat.innerHTML = task.status;
     let user = document.getElementById('user-todo-selection');
  	 user.innerHTML = task.createdBy + ',' + task.people;
     let texte = document.getElementById('texte-todo-selection');
	 	 texte.innerHTML = task.desc;
   });
   button.setAttribute('class',"glyphicon glyphicon-info-sign");
   append(li,button);
   append(li,span);
/*on ajoute le personnes associees*/
   let a = createNode('a');
		a.innerHTML = ' ' + task.people;
		append(li,a);
/*button pour supprimer TODOs */
   let buttonRemove = createNode('button');
   buttonRemove.setAttribute('class',"glyphicon glyphicon-trash");
   append(li,buttonRemove);
   buttonRemove.addEventListener("click", function()
   {
//on cherche le todo avec l'id _id dans l'URL pour le supprimer
     fetch(url_todos+task._id, { method: 'DELETE', headers: headers});
     ul.removeChild(li);
   });
   append(ul,li);
}

//pour creer un nouveau todo sur le serveur
function creer_todo()
{
// on recupere les données de la fenetre modale
	const obj = {
		_id : 42,
		deadline : document.getElementById('upload-deadline').value,
		creation : new Date().toLocaleDateString(),
		title : document.getElementById('upload-title').value,
		desc : document.getElementById('upload-desc').value,
		status : document.getElementById('upload-state').value,
		createdBy : 'p1612224',
		people : document.getElementById('upload-users').value
	};
    let ul = document.getElementById('mytodo-list');
//on ajoute sur le serveur le todo cree
    fetch(url_todos, { method: 'POST', headers: headers, body:JSON.stringify(obj) })
    .then(response => response.json())
    .then(function (x){
      createListHTML(x,ul);
    })
}

//pour afficher le nom et le mail de l'utilisateur courant à gauche
function display_name_user(user, users)
{
  const div = document.getElementById('nom_user');
  users.map(function(task){
    if (user == task._id)
    {
      let span = createNode('h5');
      span.innerHTML =  task._id;
      append(div,span);
      let span2 = createNode('h5');
      span2.innerHTML = task.email;
      append(div,span2);
    }
  });
}

//pour afficher la photo de l'utilisateur
function display_photo_user(user, users)
{
	users.map(function(task){
		if(user == task._id)
		{
			if(task.avatar == undefined)
			{
//l'utilisateur n'a pas de PDP
				document.getElementById('photo-profil').setAttribute('src',"unknown.gif");
			}
			else
			{
//l'utilisateur a une PDP à la racine du dossier
				document.getElementById('photo-profil').setAttribute('src',task.avatar);
			}
		}
	});
}

//pour afficher les informations des todos d'un utilisateur
function display_info_user(user,state) {
  let ul = document.getElementById('mytodo-list');
  state.get_user_todos(user).map(function(task){
        createListHTML(task,ul);
  });
}

//pour afficher les informations des todos mentionnés
function display_info_user_tag(user, state) {
	let ul = document.getElementById('todo-list_otherUsers');
	state.todos.map(todo =>
    todo.people != undefined
    ? (todo.people.indexOf(user) >= 0
    ? createListHTML(todo,ul) : console.log("")): console.log(""));
}

function  todo_button(user,but,tag,idList){
  let ul = document.getElementById(idList);
  ul.innerHTML = " ";
  fetch(url_todos,{method:'GET',headers:headers})
    .then(response => response.json())
    .then(function(response){
      response.map(function(task){
        if (task.status == but){
          if (!tag){
            if ((user == task.createdBy)&& (!task.people.includes("p1612224"))){
              createListHTML(task,ul);
            }
          }else{
            if (task.people.includes(user)){
              createListHTML(task,ul);
            }
          }
        }
      });
  });
}

//pour filtrer les todos par TODO,DOING,DONE
function button_manipulation(typeBut,isTagged,idList){
  todo_button("p1612224",typeBut,isTagged,idList);
}

function nb_TODO(a){
  if (a == 'TODO'){
    return 1;
  }else if (a == 'DOING'){
    return 2;
  }else{
    return 3;
  }
}

//pour trier le champ field(date,etat ou titre) , reverse fonctionne comme un flag,
// primer est une fonction qui renvoye un text en majuscule pour la comparison
function sort_by(field, reverse, primer){
  const key = primer ?
    function(x) {return primer(x[field])} :
      function(x) {return x[field]};

  reverse = !reverse ? 1 : -1;

  return function (a, b) {
    if (field == 'status'){
      a = nb_TODO(key(a));
      b = nb_TODO(key(b));
      return reverse*((a >= b) - (b >= a));
    }
    //on retourne -1 si on doit trier les donnes , 1 sinon
   return a = key(a), b = key(b), reverse * ((a >= b) - (b >= a));
  }
}

//pour trier par titre,date et etat todo
function trier(critere,isTagged,idList){
  const ul = document.getElementById(idList);
  ul.innerHTML = '';
  return fetch(url_todos,{method: 'GET',headers:headers})
    .then(response => response.json())
    .then(function(response){
      response.sort(sort_by(critere, false, function(a){return a.toUpperCase()}));
          return response.map(function(task){
            if (!isTagged){
              if (("p1612224" == task.createdBy) &&(!task.people.includes("p1612224"))){
                createListHTML(task,ul);
              }
            }else{
              if (task.people.includes("p1612224")){
                createListHTML(task,ul);
              }
            }
          })
    });
}

//pour chercher en text plein les todos
function search_todos(id,idList,isTagged){
  const search = document.getElementById(id);
  const ul = document.getElementById(idList);
  const filter = search.value.toUpperCase();
  ul.innerHTML = "";
  fetch(url_todos, { method: 'GET', headers: headers })
   .then(response => response.json())
   .then(function(todos){
     todos.filter(todo =>(!isTagged)? (todo.createdBy === 'p1612224') && (!todo.people.includes('p1612224')) : todo.people.includes('p1612224'))
     .map(function(todo){
       if (todo.title.toUpperCase().indexOf(filter) > -1) {
        createListHTML(todo,ul);
      }
     })
   })
}

//pour initialiser la page
function initialisation_site(state)
{
  display_info_user("p1612224", state);
  display_info_user_tag("p1612224", state);
	display_name_user("p1612224", state.users);
	display_photo_user("p1612224", state.users);
}

//pour recuperer les todos depuis le serveur
function get_todos() {
  return fetch(url_todos, { method: 'GET', headers: headers })
    .then(response => response.text())
}
//pour recuperer les utilisateurs depuis le serveur
function get_users() {
  return fetch(url_users, { method: 'GET', headers: headers })
    .then(response => response.text())
}

/************************************************************** */
/** MAIN PROGRAM */
/************************************************************** */

document.addEventListener('DOMContentLoaded', function(){
  let state = {};
  // garde pour ne pas exécuter dans la page des tests unitaires.
  if (document.getElementById("title-test-projet") == null) {

    Promise.all([get_users(),get_todos()])
    .then(values => values.map(JSON.parse))
    .then(values => new State(values[0], values[1]))
    .then(state => initialisation_site(state))
    .catch(reason => console.error(reason));
  }
}, false);
