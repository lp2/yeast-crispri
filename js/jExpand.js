
(function($){
    $.fn.jExpand = function(){
    	console.log("expand row");
        var element = this;
      // Remove any expansion TRs
      $(".expand-row").remove();

      // Re-add the expansions
      $('<tr class="expand-row"><td class="expand-td" colspan="8">No data available.<td></tr>')
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

        orf = row.find("td:nth-child(1)").text();
      	pam_loc = row.find("td:nth-child(5)").text();
      	pam_loc_tss = parseInt( row.find("td:nth-child(7)").text() );
      	nucl = parseFloat( row.find("td:nth-child(8)").text() );
        atac_seq = row.find("td:nth-child(9)").text();
      	pam1 = row.find("td:nth-child(10)").text();
      	pam9 = row.find("td:nth-child(11)").text();
      	guide_length = row.find("td:nth-child(12)").text();
      	//orf_tss = parseInt( row.find("td:nth-child(15)").text() );


        // Add > symbol if > 2000
        pam_loc_tss_txt = pam_loc_tss
        if(pam_loc_tss_txt == 2000) pam_loc_tss_txt = ">" + pam_loc_tss_txt

      	// Set guide name and length
        expand_row.find("#atac-seq").text( atac_seq );
      	expand_row.find("#guide-length").text( guide_length );
      	expand_row.find("#pam-location").text( pam_loc );
      	expand_row.find("#nucleosome").text( nucl );
      	expand_row.find("#pam-location-rel").text( pam_loc_tss_txt );
      	expand_row.find("#pam-19").text( pam1 + "/" + pam9 );

        if(orf in orf2tss){
          expand_row.find("#orf-tss").text( orf2tss[orf].toLocaleString() );
        }

      	// Color boxes accordingly
      	if(nucl > 0.2) 
      		expand_row.find("#nucleosome").removeClass("bx-green").addClass("bx-red");
      	if( pam_loc_tss < 0 && pam_loc_tss >= -200 )
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