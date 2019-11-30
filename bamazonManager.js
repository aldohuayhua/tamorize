var mysql = require('mysql');
var inquirer = require('inquirer');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon_db"
})

connection.connect(function (err, res) {
    console.log("Connected as id: " + connection.threadId);
    start();
})

function start() {
    inquirer.prompt({
        name: "menuOption",
        type: "rawlist",
        message: "Please select a menu option",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
    }).then(function (answer) {
        if (answer.menuOption == "View Products for Sale") {
            productsForSale();
        } else if (answer.menuOption == "View Low Inventory") {
            viewLowInv();
        } else if (answer.menuOption == "Add to Inventory") {
            addToInv();
        } else if (answer.menuOption == "Add New Product") {
            addNewProduct();
        }
    })
}

function productsForSale() {
    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function (err, res) {
        for (i = 0; i < res.length; i++) {
            console.log(res[i]);
            console.log("-------------------------------------------------------------")
        }
    })
    connection.end();
}

function viewLowInv() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (i = 0; i < res.length; i++) {
            if (parseInt(res[i].stock_quantity) < 5) {
                console.log(res[i].product_name);
            }
        }
    })
    connection.end();
}

function addToInv() {
    connection.query("SELECT * FROM products", function (err, res) {
        console.log(res);
        inquirer.prompt([{
            name: "addingToItem",
            type: "rawlist",
            message: "Which item are you adding inventory to?",
            choices: function (value) {
                var choiceArray = [];
                for (i = 0; i < res.length; i++) {
                    choiceArray.push(res[i].product_name)
                }
                return choiceArray;
            }
        }, {
            name: "invAdd",
            type: "number",
            message: "How much inventory is being added?"
        }]).then(function (answer) {
            for (i = 0; i < res.length; i++) {
                if (res[i].product_name == answer.addingToItem) {
                    connection.query("UPDATE products SET ? WHERE ?", [{
                        stock_quantity: res[i].stock_quantity + answer.invAdd
                    }, {
                        product_name: answer.addingToItem
                    }], function (err, test) {
                        console.log("updated inventory succesfully")
                        connection.end();
                    })
                }
            }
        })
    })
}

function addNewProduct() {
    connection.query("SELECT * FROM products", function (err, res) {
        inquirer.prompt([{
            name: "productName",
            type: "input",
            message: "What is the name of the product to be added?"
        }, {
            name: "departmentName",
            type: "input",
            message: "What department does this product belong to?",
        }, {
            name: "priceOfProduct",
            type: "number",
            message: "What is the prize this item sells for?"
        }, {
            name: "stockAmount",
            type: "number",
            message: "what is the Inventory amount of this product"
        }]).then(function (answer) {
            connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?,?,?,?)", [
                answer.productName, answer.departmentName, answer.priceOfProduct, answer.stockAmount
            ], function(err,test){
                console.log("added new product succesfully");
                connection.end();
            })
        })
    })
}