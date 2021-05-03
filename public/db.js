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

request.onerror = function (event) {

    console.log("Error Occured!");
};

function saveRecord(record) {
    //this will create a transaction on the pending db
    const transaction = db.transaction(["pending"], "readwrite");

    //accesses the pending object store
    const store = transaction.objectStore("pending");

    //adds the record
    store.add(record);
}

function checkDB() {

    const transaction = db.transaction(["pending"], "readwrite");

    const store = transaction.objectStore("pending");

    //gets all records from object store and set to a getAll variable
    const getAll = store.getAll();

    getAll.onsuccess = function() {

        if (getAll.result.length > 0) {
            
            fetch("api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "applicaion/json, text/plain, */*", 
                    "Content-Type": "application/json",
                },
            })

            .then((response) => response.json())

            .then(() => {

                const transaction = db.transaction(["pending"], "readwrite");

                const store = transaction.objectStore("pending");

                //clears all items from store after success
                store.clear();
            });
        }
    };
}

//event listener is waiting for app to come back online
window.addEventListener("online", checkDB);