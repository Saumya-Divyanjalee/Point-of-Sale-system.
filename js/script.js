let dashboardNav = $("#dashboard-nav");
let customerNav = $("#customer-nav");
let itemNav = $("#item-nav");
let orderNav = $("#order-nav");

let dashboardForm = $("#dashboard");
let customerForm = $("#customer");
let itemForm = $("#item");
let orderForm = $("#order");

customerForm.css("display", "none");
itemForm.css("display", "none");
orderForm.css("display", "none");
dashboardNav.addClass("active");

dashboardNav.on("click", function () {
    dashboardForm.css("display", "block");
    customerForm.css("display", "none");
    itemForm.css("display", "none");
    orderForm.css("display", "none");
    removeActiveClass();
    dashboardNav.addClass("active");
});

customerNav.on("click", function () {
    dashboardForm.css("display", "none");
    customerForm.css("display", "block");
    itemForm.css("display", "none");
    orderForm.css("display", "none");
    removeActiveClass();
    customerNav.addClass("active");
});
itemNav.on("click", function () {
    dashboardForm.css("display", "none");
    customerForm.css("display", "none");
    itemForm.css("display", "block");
    orderForm.css("display", "none");
    removeActiveClass();
    itemNav.addClass("active");
});
orderNav.on("click", function () {
    dashboardForm.css("display", "none");
    customerForm.css("display", "none");
    itemForm.css("display", "none");
    orderForm.css("display", "block");
    removeActiveClass();
    orderNav.addClass("active");
});

function removeActiveClass(){
    dashboardNav.removeClass("active");
    customerNav.removeClass("active");
    itemNav.removeClass("active");
    orderNav.removeClass("active");
}

let container = $(".container");
let dashboardMenuBtn = $("#dashboard-btn-menu");
let customerMenuBtn = $("#customer-btn-menu");
let itemMenuBtn = $("#item-btn-menu");
let orderMenuBtn = $("#order-btn-menu");

// phone size menu bar icon display
setInterval(() => {
    if (window.matchMedia("(max-width: 600px)").matches) {
        container.css("display" , "inline-block");
    } else {
        container.css("display" , "none");
        $(".menu-div").css("display" , "none");
    }
},100);

// phone size menu display
function myFunction(x) {
    x.classList.toggle("change");
    checkMenuDisplay();
}

// check menu display
var menuDiv = $(".menu-div");

function checkMenuDisplay(){
    if (menuDiv.css("display") === "grid") {
        menuDiv.css("display" , "none");
    } else {
        menuDiv.css("display" , "grid");
    }
}

dashboardMenuBtn.on("click", function () {
    dashboardForm.css("display", "block");
    customerForm.css("display", "none");
    itemForm.css("display", "none");
    orderForm.css("display", "none");
    myFunction(container[0]);
});
customerMenuBtn.on("click", function () {
    dashboardForm.css("display", "none");
    customerForm.css("display", "block");
    itemForm.css("display", "none");
    orderForm.css("display", "none");
    myFunction(container[0]);
});
itemMenuBtn.on("click", function () {
    dashboardForm.css("display", "none");
    customerForm.css("display", "none");
    itemForm.css("display", "block");
    orderForm.css("display", "none");
    myFunction(container[0]);
});
orderMenuBtn.on("click", function () {
    dashboardForm.css("display", "none");
    customerForm.css("display", "none");
    itemForm.css("display", "none");
    orderForm.css("display", "block");
    myFunction(container[0]);
});

