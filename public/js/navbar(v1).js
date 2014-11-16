/* FIX-ME this should be done (client side rendering of pre-computed tomplates)*/

//re-label dust cache
var oldCache=dust.cache;
var cacheKeys=Object.keys(oldCache);
for(var i=0;i<cacheKeys.length;i++){
	var key=cacheKeys[i]
	var lastSlash=key.lastIndexOf("/")
	var label=key.indexOf(".")
	var newName=key.substring(lastSlash+1, label);
	dust.cache[newName]=oldCache[key];
}

var NavView=Backbone.View.extend({
	initialize: function(el){
		_.bindAll(this, 'renderHref');
		this.el=el;
	},
	events:{
		'click a': 'renderHref'
	},
	bindings:{
		'#':'index',
		'#charities':'charities',
		'#about':'about',
		'#contact':'contact',
		'#profile':'profile',
		'#logout':'logout'
	},
	renderHref:function(source){
		var href=source.target.getAttribute('href');
		var pageKeys=Object.keys(this.bindings);
		if(pageKeys.indexOf(href)!=-1){
			pageName=this.bindings[href];
			dust.render(pageName,{},function(err,out){
				$('html').html(out);
			});
		}
	}

});

var navView=new NavView({el: $(".nav")});
