var person = {
    name: "ganesh",
    age: 21
}

function updatePerson (obj) {
    // obj = {
    //     name: "Ganesh Sanap",
    //     age: 31
    // }

    obj.name = "Ganesh Sanap"
    obj.age = 31;
}

updatePerson(person);
console.log(person);