
dapp.localstorage = {

getValue:function(v) {
	return JSON.parse(window.localStorage.getItem(v));
},

setValue:function(k,v) {	
	window.localStorage.setItem(k,JSON.stringify(v));
}

}