// set Total values
import {customers_array, item_array, order_array} from "../db/database.js";
import {QTY} from "../util/regex.js";
import {setAlert} from "../util/alert.js";

let dashboardTblBody = $("#dashboard-tbl-body");

// load order in table
export const loadAllOrders = () => {
    dashboardTblBody.children().remove();
    for (let i = 0; i < order_array.length; i++) {
        for (let j = 0; j < order_array[i].items.length; j++) {
            let order = order_array[i];
            let data = `<tr><td>${order.orderId}</td><td>${order.date}</td><td>${order.total}</td><td>${order.customerId}</td><td>${order.items[j].itemId}</td><td>${order.items[j].qty}</td></tr>`;
            dashboardTblBody.append(data);
        }
    }
}

loadAllOrders();

// get today orders
let getTodayOrders = () => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    let count = 0;
    order_array.forEach(value => {
        if (value.date === formattedDate) {
            count++;
        }
    })
    return count;
}

// set data all totals
export let setTotalValues = () => {
    $("#inputTodayOrders").text(getTodayOrders());
    $("#inputTotalOrders").text(order_array.length);
    $("#inputTotalCustomers").text(customers_array.length);
    $("#inputTotalItems").text(item_array.length);
}

setTotalValues();

$("#searchOrderIdBtn").on("click", function () {
    let inputOrderID = $("#searchOrderIds");
    if (QTY.test(inputOrderID.val())){
        dashboardTblBody.children().remove();

        let searchOrderId = parseInt(inputOrderID.val().trim());

        for (let i = 0; i < order_array.length; i++) {
            let order = order_array[i];
            if (searchOrderId === order.orderId) {
                for (let j = 0; j < order.items.length; j++) {
                    let data = `<tr><td>${order.orderId}</td><td>${order.date}</td><td>${order.total}</td><td>${order.customerId}</td><td>${order.items[j].itemId}</td><td>${order.items[j].qty}</td></tr>`;
                    dashboardTblBody.append(data);

                }
            }
            break;
        }
    } else {
        setAlert('error','Invalid Order ID !!');
    }
});

$("#viewAllOrders").on("click", function () {
    loadAllOrders();
    $("#searchOrderIds").val("");
})


