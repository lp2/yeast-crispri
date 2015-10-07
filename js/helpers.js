
// Get unique values of an array
Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

// Repeat a string
String.prototype.repeat = function( num ){
    return new Array( num + 1 ).join( this );
}

// Convert genename to orf and unique output
convertGeneToOrf = function(gene_names){
  arr = []
  $.each(gene_names, function( index, value ) {
    if(value in name2orf) value = name2orf[value];
    arr.push(value);
  });
  return arr.getUnique();
}

//Clear all form-group errors
clearAllErrors = function(){
	$('.help-block').addClass("hide");
    $('.form-group').removeClass("has-error");
}




$(function() {

	//******************************
	// Menu navigation clicks
	//******************************
	$('.nav-pills li').click(function(){
		

		// Hide active
		to_hide = "#" + $('.nav-pills li.active').attr("data-id");
		$(to_hide).hide();


		to_show = "#" + $(this).attr("data-id");
		$(to_show).fadeIn();

		$('.nav-pills li').removeClass('active');
		$(this).addClass('active');

		document.title = "Yeast CRISPRi | " + $(this).text();

	});
	//$('#nav-search a').click();

	//******************************
	// Left and right navigation for sites table
	//******************************
	$("body").keydown(function(e) {
	  if(e.keyCode == 37) { // left
	    $('.dynatable-active-page').prev().find('a').click();
	  }
	  else if(e.keyCode == 39) { // right
	    $('.dynatable-active-page').next().find('a').click();
	  }
	});


});