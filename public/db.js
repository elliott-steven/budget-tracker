let db;
//creates a new db request
const request = indexedDB.open("budget", 1);

//create object store called pending with autoIncrement set to true
request.onupgradeneeded = function (event) {

    const db = event.target.result;

    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {

    db = event.target.result;

    //this will check if app is online before reading from db
    if (navigator.online) {
        checkDB();
    }
};

request.onerror = function (event){

    console.log("Error Occured!");
};

