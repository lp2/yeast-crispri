
(function($){
    $.fn.jExpand = function(){
    	console.log("expand row");
        var element = this;
      // Remove any expansion TRs
      $(".expand-row").remove();

      // Re-add the expansions
      $('<tr class="expand-row"><td class="expand-td" colspan="6">No data available.<td></tr>')
      .insertAfter( $("#data-table tbody tr") );


      $(".expand-td").html( $("#expand-template").html() );


      $(element).find("tr:odd").addClass("odd");
      $(element).find("tr:not(.odd)").hide();
      $(element).find("tr:first-child").show();

      tr_odd = $(element).find("tr.odd");

      // Populate expand data
      tr_odd.each( function(){
      	window.row = $(this)
      	expand_row = row.next("tr");

      	pam_loc = parseInt( row.find("td:nth-child(5)").text() );
      	pam_loc_tss = parseInt( row.find("td:nth-child(7)").text() );
      	nucl = parseFloat( row.find("td:nth-child(8)").text() );
      	pam1 = parseInt( row.find("td:nth-child(9)").text() );
      	pam9 = parseInt( row.find("td:nth-child(10)").text() );
      	guide_length = row.find("td:nth-child(11)").text();
      	//orf_tss = parseInt( row.find("td:nth-child(15)").text() );
        

      	// Set guide name and length
      	expand_row.find("#guide-length").text( guide_length );
      	expand_row.find("#pam-location").text( pam_loc.toLocaleString() );
      	expand_row.find("#nucleosome").text( nucl );
      	expand_row.find("#pam-location-rel").text( pam_loc_tss );
      	expand_row.find("#pam-19").text( pam1 + "/" + pam9 );

      	// Color boxes accordingly
      	if(pam1 != 1 || pam9 != 1) 
      		expand_row.find("#pam-19").removeClass("bx-green").addClass("bx-red");
      	if(nucl > 0.2) 
      		expand_row.find("#nucleosome").removeClass("bx-green").addClass("bx-red");
      	if(Math.abs(pam_loc_tss) > 200)
      		expand_row.find("#pam-location-rel").removeClass("bx-green").addClass("bx-red");
      });

      //Unbind any click events
      tr_odd.unbind( "click" );
      var evt = 0;
      // On click of row
      tr_odd.click(function(e) {
      	if(e.toElement.tagName == "A") return true;
          arr = $(this).find(".arrow");
          $(this).next("tr").toggle("fast", function(){
            arr.toggleClass("spin");
          });
      });
        
        
    }    
})(jQuery); 