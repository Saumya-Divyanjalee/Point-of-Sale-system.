import ItemModel from "../model/itemModel.js";
import {item_array} from "../db/database.js";
import {setDataDropdowns} from "./orderController.js";
import {setTotalValues} from "./dashboardController.js";
import {PRICE,QTY} from "../util/regex.js";
import {setAlert} from "../util/alert.js";

let itemBody = $("#item-table-body");
let itemId = $("#inputItemId");
let itemModel = $("#inputModel");
let itemPrice = $("#inputPrice");
let itemQty = $("#inputQuantity");

// save button action
$("#item-save").on("click", function() {
    if (validationItemInputs()){
        const item = new ItemModel(itemId.val(),itemModel.val(),itemPrice.val(),itemQty.val());
        item_array.push(item);
        loadItemData();
        clearItemInputs();
        setDataDropdowns();
        setItemID();
        setTotalValues();
        setAlert('success','Inventory Saved Successfully!!');
    }
});

// set Item ID
let setItemID = () => {
    if (item_array.length === 0) {
        itemId.val(1);
    } else {
        itemId.val(parseInt(item_array[item_array.length - 1].item_id) + 1);
    }
}

setItemID();

let clearItemInputs = () => {
    itemModel.val("");
    itemPrice.val("");
    itemQty.val("");
    $("#input-search-item-id").val("");
}

// item table add data
export let loadItemData = () => {
    itemBody.children().remove();

    item_array.map((value,index) => {
        let data = `<tr><td>${value.item_id}</td><td>${value.model}</td><td>${value.price}</td><td>${value.qty}</td></tr>`;
        itemBody.append(data);
    });
}

// item table click row get data
itemBody.on('click', 'tr', function () {
    const row = $(this);
    console.log(row.index());

    let item = item_array[row.index()];
    setItemDataInput(item);
});

let setItemDataInput = (item) => {
    itemId.val(item.item_id);
    itemModel.val(item.model);
    itemPrice.val(item.price);
    itemQty.val(item.qty);
}

$("#item-clear").on("click", function() {
    clearItemInputs();
});

$("#item-delete").on("click", function() {
    let deletedId = itemId.val();
    item_array.map((value,index) => {
        if (value.item_id === deletedId) {
            item_array.splice(index, 1);
            setAlert('success','Inventory Delete Successfully!!');
        }
    })
    loadItemData();
    clearItemInputs();
    setTotalValues();
    setItemID();
});

$("#item-update").on("click", function() {
    if (validationItemInputs()){
        let updateId = itemId.val();

        item_array.map((value, index) => {
            if (value.item_id === updateId) {
                item_array[index].model = itemModel.val();
                item_array[index].price = itemPrice.val();
                item_array[index].qty = itemQty.val();
                setAlert('success','Inventory Update Successfully!!');
            }
        });

        loadItemData();
        clearItemInputs();
        setItemID();
    }
});

$("#view-all-items").on("click", function() {
    loadItemData();
    $("#input-search-item-id").val("");
});

$("#search-item").on("click", function() {
    let searchId = $("#input-search-item-id").val();

    if (QTY.test(searchId)){
        item_array.map((value,index) => {
            if (value.item_id === searchId) {
                itemBody.children().remove();

                let data = `<tr><td>${value.item_id}</td><td>${value.model}</td><td>${value.price}</td><td>${value.qty}</td></tr>`;
                itemBody.append(data);
            }
        });
    } else {
        setAlert('error','Invalid Inventory ID !!');
    }
});

let validationItemInputs = () => {
    if (itemModel.val() !== "") {
        if (PRICE.test(itemPrice.val())) {
            if (QTY.test(itemQty.val())) {
                return true;
            } else {
                setAlert('error','Invalid Quantity !!');
            }
        } else {
            setAlert('error','Invalid Price !!');
        }
    } else {
        setAlert('error','Invalid Inventory Model !!');
    }
    return false;
}