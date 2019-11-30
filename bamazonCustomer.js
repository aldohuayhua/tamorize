var mysql = require('mysql');
var inquirer = require('inquirer');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon_db"
})

connection.connect(function (err) {
    console.log("Connected as id: " + connection.threadId);
    start();
})

function start() {
    connection.query("SELECT item_id, product_name, price, stock_quantity, product_sales FROM products", function (err, res) {
        for (i = 0; i < res.length; i++) {
            console.log(res[i]);
            console.log("-------------------------------------------------------------")
        }
        inquirer.prompt([{
            name: "purchaseId",
            type: "rawlist",
            choices: function (value) {
                var productsArray = [];
                for (i = 0; i < res.length; i++) {
                    productsArray.push(res[i].item_id)
                } return productsArray;
            },
            message: "Please select the Product ID of the item you would like to purchase"
        }]).then(function (answer) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].item_id == answer.purchaseId) {
                    var chosenItem = res[i].product_name;
                    console.log("chosen item: " + chosenItem)
                    inquirer.prompt({
                        name: "numberOfUnits",
                        type: "input",
                        message: "How many units of this product would you like to buy?",
                        validate: function (value) {
                            if (isNaN(value) == false) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }).then(function (test) {
                        if (res[(answer.purchaseId) - 1].stock_quantity < test.numberOfUnits) {
                            console.log("Insufficient quantity!");
                            connection.end();
                        } else {
                            console.log("your in luck we have enough in stock");
                            console.log("Your Total is: " + (res[(answer.purchaseId) - 1].price)*(test.numberOfUnits))
                            connection.query("UPDATE products SET ? WHERE ?", [{
                                stock_quantity: (res[(answer.purchaseId) - 1].stock_quantity - test.numberOfUnits),
                            }, {
                                item_id: answer.purchaseId
                            }], function (err, x) {
                                connection.query("UPDATE products SET ? WHERE?", [{
                                    product_sales: (((res[(answer.purchaseId) - 1].price)*(test.numberOfUnits))+(res[(answer.purchaseId) - 1].product_sales))
                                },{
                                    item_id: answer.purchaseId
                                }], function (err, z){
                                    connection.end();
                                })
                            });
                        }
                    })
                }
            }
        })
    })
}
