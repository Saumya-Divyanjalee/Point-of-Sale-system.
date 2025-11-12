export let NAME = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export let ADDRESS = /^([A-z0-9]|[-\\,.@+]|\\\\s){4,}$/;
export let NIC = /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/;
export let EMAIL = /^([A-z])([A-z0-9.]){1,}[@]([A-z0-9]){1,10}[.]([A-z]){2,5}$/;
export let TEL = /^[0]([1-9]{2})([0-9]){7}$/;
export let PRICE = /^([0-9]){1,}[.]([0-9]){1,}$/;
export let QTY = /^[0-9]{1,5}$/;