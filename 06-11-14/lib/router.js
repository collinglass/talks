/*
*
*	Router.js
*
*	Pair Programmed by RangerMauve and Collin Glass
*
*/

/*
*	Global element for routing
*/
var el = null;  

/*
*	Main Router
*/
function router () {
	var data = history.state;
	
	Promise.resolve(data) // LOOP in Diagram: DATA
	.then(render) // LOOP in Diagram: RENDER HTML
	.then(set_view) // places on page
	.then(controller || noop) // LOOP in Diagram: Add Event Listeners
	.catch(alert); // Catch any errors
}

/*
*	Render function to render file using swig.
*/
function render(data){
	var file = data.template;
	return reqwest(file).then(function(template){
		var html = swig.render(template,{locals:data});
		console.log("Rendering",file,"with",data,"as",html);
		return html;
	})
}

/*
*	Set view to the #view element
*/
function set_view(html){
	console.log("Setting view..")
	el = el || document.getElementById('view');
	if (el) el.innerHTML = html;
	return el;
}

// CONTROLLER

//	Returns empty promise
function noop(){
	return Promise.resolve();
}; 

/*
*	Resolve route and returns the data from config.
*/
function route_data(url){
	var route;
	// Set current url or set to root
	url = url || '/';

	function config(route){
		return Promise.resolve(reqwest("api/unsecured/config.json"))
		.then(function(data){
			return data[route];
		});
	}; 
	
	// Get route by url:
	url == "/" ? route = "home" : route = url.replace("/", "");
	return config(route);
}

/*
*	Returns the tabs from the config file
*/
function getTabs(){
	return Promise.resolve(reqwest("api/unsecured/config.json")).then(function(config){
		return Object.keys(config);
	});
}

/*
*	Add an event listener on click to prevent default and use history api
*/
window.addEventListener("click",function(e){
	var target = e.target;
	var tag = target.tagName.toLowerCase();
	if(tag === "a"){
		e.preventDefault(true);
		var url = target.pathname;
		route_data(url).then(function(data){
			history.pushState(data,document.title,url);
			router();
		})
	}
});

/*
*	Add an event listener on popstate
*/
window.addEventListener("popstate", router);

/*
*	Add an event listener on load
*/
window.addEventListener('load', function(){
	var url = location.pathname || "/";
	getTabs().then(function(tabs){
		return render({
			template: "nav.html",
			tabs: tabs
		});
	})
	.then(function(html){
		document.querySelector("#nav").innerHTML = html;
	})
	.then(route_data.bind(null,url))
	.then(function(data){
		history.pushState(data,document.title,url);
		router();
	})
});




