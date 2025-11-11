import CustomerModel from "../model/customerModel.js";
import {customers_array} from "../db/database.js";
import {setDataDropdowns} from "./orderController.js";
import {loadAllOrders,setTotalValues} from "./dashboardController.js";
import {NAME,NIC,EMAIL,TEL,QTY} from "../util/regex";
import {setAlert} from "../util/alert.js";

let cusBody = $("#customer-tbl-body");
let cusId = $("#inputId");
let cusName = $("#inputName");
let cusAddress = $("#inputAddress");
let cusNic = $("#inputNic");
let cusEmail = $("#inputEmail")
let cusTel = $("#inputTel");

//save


