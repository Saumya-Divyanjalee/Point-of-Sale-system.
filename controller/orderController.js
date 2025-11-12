import {customers_array, item_array,order_array} from "../db/database.js";
import OrderModel from "../model/orderModel.js";
import OrderItemModel from "../model/orderItemModel.js";
import {setTotalValues,loadAllOrders} from "./dashboardController.js";
import {loadItemData} from "./itemController.js";
import {PRICE, QTY} from "../util/regex.js";
import {setAlert} from "../util/alert.js";

let orderId = $("#inputOrderId");
let customerId = $("#inputCustomerId");
let customerName = $("#inputCustomerName");
let inputDate = $("#inputDate");
let inventoryIdDropDown = $("#inputInventoryId");
let inventoryModel = $("#inputOrderModel");
let inventoryPrice = $("#inputOrderPrice");
let onHandQty = $("#inputOnHandQty");
let orderQty = $("#inputOrderQty");
let addBtn = $("#addBtn");
let orderDetailTblBody = $("#orderDetailTblBody");
let inputTotal = $("#inputTotal");

// set date
const date = new Date();
const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
inputDate.val(formattedDate);

//set order ID
let setOrderID = () => {
    if (order_array.length === 0){
        orderId.val(1);
    } else {
        console.log(parseInt(order_array[order_array.length - 1].orderId) + 1)
        orderId.val(order_array[order_array.length - 1].orderId + 1);
    }
}
setOrderID();

// set total
function setTotal(){
    const lastColumnData = [];
    $('#orderDetailTblBody tr').each(function() {
        //lastColumnData.splice(0, lastColumnData.length);
        const totalCell = $(this).find('td:nth-child(5)');
        lastColumnData.push(totalCell.text());
    });

    let total = 0;
    lastColumnData.map(value => {
        total += parseFloat(value);
    });
    inputTotal.val(total);
}

// add button action
addBtn.on("click", function() {
    if (QTY.test(orderQty.val())){
        let data = `<tr><td>${inventoryIdDropDown.text()}</td><td>${inventoryModel.val()}</td><td>${inventoryPrice.val()}</td><td>${orderQty.val()}</td><td>${parseFloat(inventoryPrice.val()) * parseInt(orderQty.val()).toFixed(2)}</td><td><button class="btn btn-danger btn-sm delete-btn">Delete</button></td></tr>`;
        orderDetailTblBody.append(data);
        setTotal();
        inventoryIdDropDown.text("Inventory ID");
        inventoryModel.val("");
        inventoryPrice.val("");
        onHandQty.val("");
        orderQty.val("");
    } else {
        setAlert('error','Invalid Order Quantity !!');
    }
});

// Event delegation for delete button
orderDetailTblBody.on('click', '.delete-btn', function() {
    let row = $(this).closest('tr');
    setAlert('warning','Do you want to remove this order item?',row);
});

// customer id eka click kla wita button eke text eka set wenw
$("#customerIds").on("click", "li", function() {
    const selectId = $(this);
    customerId.text(selectId.text());
    customerName.val(customers_array[selectId.text()-1].name); // meka hriynne na
});

// item id eka click kla wita button eke text eka set wenw
$("#itemIds").on("click", "li", function() {
    const selectId = $(this);
    inventoryIdDropDown.text(selectId.text());  // meka hriynne na
    inventoryModel.val(item_array[selectId.text()-1].model);
    inventoryPrice.val(item_array[selectId.text()-1].price);
    onHandQty.val(item_array[selectId.text()-1].qty);
});

export let setDataDropdowns = () => {
    // customer ids tika dropdown ekt set wenw
    $("#customerIds").empty();
    customers_array.forEach((value,index) => {
        console.log("value.customer_id");
        let data = `<li>${value.customer_id}</li>`;
        $("#customerIds").append(data);
    });
    console.log(customers_array);

    // item ids tika dropdown ekt set wenw
    $("#itemIds").empty();
    item_array.map((value,index) => {
        let data = `<li>${value.item_id}</li>`;
        $("#itemIds").append(data);
    });
}

setDataDropdowns();

// discount input enter action
let subTotal = 0;
$('#inputDiscount').on('keydown', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        // Action to perform when Enter is pressed
        let discountValue = $('#inputDiscount').val();
        if (discountValue.slice(-1) === '%') {
            discountValue = discountValue.slice(0, -1);
            subTotal = parseFloat(inputTotal.val()) - (parseFloat(inputTotal.val()) * parseFloat(discountValue) / 100);
            $("#inputSubTotal").val(subTotal.toFixed(2));
        } else {
            subTotal = parseFloat(inputTotal.val()) - parseFloat(discountValue);
            $("#inputSubTotal").val(subTotal.toFixed(2));
        }

    }
});

// set balance cash input enter action
$('#inputCash').on('keydown', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        if (PRICE.test($('#inputCash').val())){
            $("#inputBalance").val((parseFloat($('#inputCash').val()) - parseFloat($("#inputSubTotal").val())).toFixed(2));
        } else {
            setAlert('error','Invalid Cash Price !!');
        }
    }
});

// place order button action
$("#place-order-btn").on("click", function() {
    if ($("#inputSubTotal").val() !== ""){
        saveOrder();
        setOrderID();
        clearFrom();
        setTotalValues();
        loadAllOrders();
        loadItemData();
        setAlert('success','Order Placed Successfully!!');
    }
});

// set order
let saveOrder = () => {
    let orderItems = [];
    $('#orderDetailTblBody tr').each(function() {
        // Get the Inventory ID and Quantity for each row
        let itemId = $(this).find('td').eq(0).text();  // First column (Inventory ID)
        let quantity = $(this).find('td').eq(3).text();      // Fourth column (Quantity)

        item_array.map((value,index) => {
            if (value.item_id === itemId){
                value.qty -= quantity;
            }
        });

        const orderItemModel = new OrderItemModel(parseInt(itemId),parseInt(quantity));
        orderItems.push(orderItemModel);
    });
    const order = new OrderModel(parseInt(orderId.val()),parseInt(customerId.text()),inputDate.val(),parseFloat($("#inputSubTotal").val()),orderItems);
    order_array.push(order);
    console.log(order_array);
}

//set clear form
let clearFrom = () => {
    customerId.text("Customer ID");
    customerName.val("");
    inventoryIdDropDown.text("Inventory ID");
    inventoryModel.val("");
    inventoryPrice.val("");
    onHandQty.val("");
    orderQty.val("");
    orderDetailTblBody.children().remove();
    inputTotal.val("");
    $('#inputDiscount').val("");
    $("#inputSubTotal").val("");
    $('#inputCash').val("");
    $("#inputBalance").val("");
}

$("#clear-btn").on('click',function (){
    clearFrom();
});

$("#new-btn").on('click', function (){
    clearFrom();
    setOrderID();
})
