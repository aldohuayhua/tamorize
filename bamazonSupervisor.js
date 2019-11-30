var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var table = new Table({
    chars: {
        'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
        , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
        , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
        , 'right': '║', 'right-mid': '╢', 'middle': '│'
    }
});
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon_db"
})

connection.connect(function (err, res) {
    console.log("Connected as id:" + connection.threadId);
    start();
})

function start() {
    inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "Please select an action to take",
        choices: ["View Product Sales by Department", "Create New Department"]
    }).then(function (answer) {
        if (answer.action == "View Product Sales by Department") {
            salesByDept();
        } else if (answer.action == "Create New Department") {
            createDept();
        }
    })
}

function salesByDept() {
    connection.query("SELECT * FROM departments", function (err, res) {
       
        table.push(['Dept ID', 'Dept. Name', 'Dept. Over Head Cost', 'Product Sales', 'Total Profit'])
        res.forEach(r => {
            table.push([r.department_id, r.department_name, r.over_head_cost, r.product_sales, r.total_profit])
        })

        // table.push(
        //     ['Dept ID', 'Dept. Name', 'Dept. Over Head Cost', 'Product Sales', 'Total Profit']
        //     , [res[0].department_id, res[0].department_name, res[0].over_head_cost, res[0].product_sales, res[0].total_profit]
        //     , [res[1].department_id, res[1].department_name, res[1].over_head_cost, res[1].product_sales, res[1].total_profit]
        //     , [res[2].department_id, res[2].department_name, res[2].over_head_cost, res[2].product_sales, res[2].total_profit]
        // );
        console.log(table.toString());
        connection.end();
    })
}

function createDept() {
    connection.query("SELECT * FROM departments", function (err, res) {
        inquirer.prompt([{
            name: "departmentName",
            type: "input",
            message: "What is the name of the department you want to add?",
        }, {
            name: "overHeadCost",
            type: "number",
            message: "What is the over head cost for this dept.?"
        }, {
            name: "productSales",
            type: "number",
            message: "Any current product sales?"
        },{
            name: "totalProfit",
            type: "number",
            message: "What is the current total profit for this new dept."
        }]).then(function (answer) {
            connection.query("INSERT INTO departments (department_name, over_head_cost, product_sales, total_profit) VALUES (?,?,?,?)", [
                answer.departmentName, answer.overHeadCost, answer.productSales, answer.totalProfit
            ], function (err, test) {
                console.log("added new department succesfully");
                connection.end();
            })
        })
    })
}