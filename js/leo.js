

var fasta = require('fasta-parser');
var blank_char = '&ndash;';

waiting = function(x){
  if(x == "show"){
    $('body').addClass('waiting');
  }else{
    $('body').removeClass('waiting');
  }
}

commaTokenizer = function(input, selection, callback) {
        // no comma no need to tokenize
        if (input.indexOf(',')<0) return;
        input = input.toUpperCase();

        var parts=input.split(",");
        for (var i=0;i<parts.length;i++) {
            var part=parts[i];
            part=part.trim();
            // todo: check for dupes (if part is already in [selection])

            // check if the part is valid
            // todo: you will need a better way of doing this
            var valid=false;
            if (part in name2orf || part in orf2index){
              valid=true
            }

            if (valid) callback({id:part,text:part});
        }
    }

/**********************************
* ELEMENT DEFINITIONS
***********************************/
search_form = $("#search-form");
result_row = $("#result-div");
invalid_fasta_msg = $("#invalid-fasta");
textarea_form_group = $("#seq-form-group");
gene_form_group = $("#gene-form-group");
missing_genes = $("#missing-genes");
no_seq_match = $("#no-seq-match");

gene_search = $("#gene-search");
seq_data = $("#seq-data");
seq_example_btn = $("#seq-search-example-btn");
gene_example_btn = $("#gene-search-example-btn");

var tables_styled = false;
//******************************
// Bootstrap style after drawing tables
//******************************
var processingComplete = function(){
      if(!tables_styled){
        search_bar = $('.dynatable-search input');
        search_bar.addClass("form-control search-table");
        search_bar.attr("placeholder", "Type to search table...");
        search_bar.parent().contents().filter(function(){ return this.nodeType != 1; }).remove();


        dropdown = $('.dynatable-per-page-select');
        dropdown.addClass('form-control input-md')
          .wrap('<div class="form-group">').wrap('<form class="form-inline">');

        dropdown = $('.dynatable-per-page-select');
        dropdown.siblings('label').remove();
        dropdown.before('<label for="dummy">Show:&nbsp;</label>');

        dropdown_label = $('.dynatable-per-page-label')
        dropdown_label.hide();

        
        // Must trigger after bulding table
        $('[data-toggle="tooltip"]').tooltip();
        tables_styled = true;
      }

      // Style pagination manually
      pagination = $('.dynatable-pagination-links');
      pagination.addClass("pagination");

};




getFastaJson = function(){
  try {
    fastaJson = []
    fastaData = $('#seq-data').val()

    var parser = fasta()
    parser.on('data', function(data) { fastaJson.push(JSON.parse(data.toString())) })
    parser.write(fastaData)
    parser.end()

    //console.log(fastaJson)
    return(fastaJson)
  }
  catch(err) {
    waiting("hide")
    //console.log("invalid fasta");
    textarea_form_group.addClass("has-error");
    invalid_fasta_msg.removeClass("hide");
    throw new Error("Invalid FASTA format!");
    return(null);
  }

}


makeRowObject = function(i){
  orf = df.Nearest_TSS_ORF[i];
  gene_name = '';
  if(orf in orf2name) gene_name = orf2name[ orf ]
  if(orf != '' & gene_name == '') gene_name = orf

  return {"Chrm" : "chr"+df.Chrm[i], 
       "PAM_mid": df.PAM_mid[i],
       "PAM_mid_pretty": df.PAM_mid[i].toLocaleString(),
       "Seq" :df.Seq[i], 
       "Length": df.Seq[i].length,
       "ORF": orf,
       "Gene_name": gene_name,
       "Guide_name": "-",
       "1C": df['+1C'][i], "9C": df['+1C'][i],
       "Midpoint_TSS_dist": df.Midpoint_TSS_dist[i],
       "Nucleosome": df.Nucleosome[i], 
       "Chromatin": df.Chromatin_rel_1kb[i]
       };
}

searchInSequence = function(fastaJson){
  // Possible window lengths to search
  window_lengths = [18,20]
  // If we have no fasta
  fastaJson = fastaJson || [{id:"testme",seq:".....TATATATTTATTTTACCAGC....."}] 
  
  var records = [];
  
  for(w = 0; w<2; w++){
    window_len = window_lengths[w]
    console.log(sprintf("Searching window length %s", window_len))

    // Loop each fasta
    $.each(fastaJson, function(i, fasta_obj){

      // Get fasta sequence
      curr_seq = fasta_obj.seq

      //Get end of window
      end = curr_seq.length - window_len + 1

      // Our sequence is too short! Skip this index
      if(end < 1) return true;

      // Sliding windows
      for(i = 0; i < end; i++){
        // Slice the window of width n
        sub_seq = curr_seq.slice(i,i+window_len);

        // If we have this stored in our db
        if(sub_seq in seq2index){
          // Get the matching rows
          ind = seq2index[sub_seq]

          for(j = 0; j < ind.length; j++)
            records.push( makeRowObject( ind[j] ) )

        }
      }
    })
    

  }

  if(records.length == 0){
    waiting("hide")
    //NO RESULTS TODO
    textarea_form_group.addClass("has-error");
    no_seq_match.removeClass("hide");

    throw new Error("No sequences found!");
  }

  // update table
  updateDynatable(records);
}



// Fetch orf json files, concat the resulting data and update table
searchInOrfs = function(orfs){
  //console.log(orfs)
  records = [];
  // Process each url
  $.each(orfs, function (i, orf) {
    ind = orf2index[orf]
    for(j=0; j<ind.length; j++){
      records.push( makeRowObject( ind[j] ) )
    }
  });

  // update table
  updateDynatable(records);
}


// Update our table with records
updateDynatable = function(records){

  // Click first page before updating
  $('.dynatable-pagination-links li:nth-child(3) a').click();

  if(search_form.is(':visible')) search_form.slideUp();
  result_row.show();

  // Compute score
  $.each(records, function (i, obj) {
    
    obj.ORF_url = blank_char;
    obj.Gene_name_url = blank_char;
    if(obj.ORF)
      obj.ORF_url = sprintf('<a href="http://www.yeastgenome.org/locus/%s/overview" target="_blank">%s</a>', obj.ORF, obj.ORF)
    
    if(obj.Gene_name)
      obj.Gene_name_url = sprintf('<a href="http://www.yeastgenome.org/locus/%s/overview" target="_blank">%s</a>', obj.ORF, obj.Gene_name)
    
    
    //Arrow
    obj.expand_arrow = '<i class="arrow fa fa-angle-right"></i>'

    score = 0
    tss_dist = obj['Midpoint_TSS_dist']
    if( tss_dist < 0 && tss_dist >= -200 ) score += 1
    if(obj['Nucleosome'] <= 0.2) score += 1

    obj.score = score

    score_viz = ""
    for(var j=0; j < 2; j++){
      if(j < score){
         score_viz += '<div class="bx bx-green"></div>'
       }else{
         score_viz += '<div class="bx bx-red"></div>'
       }
    }
    obj.score_viz = score_viz

    if(i == 0){
       //console.log(obj)
       window.obj = obj;
    }
  });

  console.log("updating dynatable...");
  dynatable = $('#data-table').dynatable({
          dataset: {
            perPageDefault: 10,
            perPageOptions: [5,10,20,100],
            records: records
          }, 
          features: {
            paginate: true,
            sort: true,
            search: true,
            recordCount: true,
            perPageSelect: true,
            pushState:false
          }, 
          inputs: { queryEvent: 'keyup'}
        }).bind('dynatable:afterProcess', function(){
          processingComplete();
          // Update expand rows
          $("#data-table").jExpand();
          waiting("hide");
        })
        .data("dynatable");

    dynatable.settings.dataset.originalRecords = records;
    //Sort by score DECENDING -1, ASCENDING 1
    dynatable.sorts.add('score', -1);
    dynatable.process();

    window.dynatable = dynatable
    processingComplete();
}

$( document ).ready(function() {
      console.log( "ready!" );
      

      window.df;
      window.seq2index = {};
      window.orf2index = {};
      window.select2_orfs = [];
      window.gene_selection = [];

      $.getJSON( "./data/dat.json", function(data) {
            // Get large json
            console.log( "success" );
            df = data;

            $.each(data.Seq, function( i, val ) {
              if(seq2index.hasOwnProperty(val)){
                arr = seq2index[val]
                arr.push(i);
                seq2index[val] = arr
              }else{
                seq2index[val] = [i]
              }
            });

            $.each(data.Nearest_TSS_ORF, function( i, val ) {
              // Skip no orf
              if(val == "") return true;

              if(orf2index.hasOwnProperty(val)){
                arr = orf2index[val]
                arr.push(i);
                orf2index[val] = arr
              }else{
                orf2index[val] = [i]
              }
            });

            window.orfs_and_names = Object.keys(orf2index)
                    .concat( Object.keys(name2orf) )


            $.each(orfs_and_names, function( i, val ) {
              select2_orfs.push({id:val, text:val});
            });

            // Populate select2 dropdown
            gene_search.select2({
              data:select2_orfs,
              //tags:orfs_and_names,
              placeholder: "MYDROPDOWN", 
              multiple: true, 
              maximumSelectionSize: 20, 
              minimumInputLength: 2,
              tokenizer: commaTokenizer,
              matcher: function (term, text) {
                  return text.toUpperCase().indexOf(term.toUpperCase()) === 0;
              },
              initSelection: function (element, callback) {
                  var data = [];
                  $.each(function () {
                      data.push({id: this, text: this});
                  });
                  callback(data);
              }
            }).on("change", function(e) {
                // Gene dropdown changed
                //window.gene_selection = $(this).select2("val");
                window.gene_selection = e.val;
            })

      }).done(function() {
          console.log( "second success" );
        }).fail(function() {
          console.log( "error" );
        }).always(function() {
           $("#page-loader").slideUp();
      });

    //   $('body').on('paste', '#s2id_gene-search', function () {
    //     console.log("pasted!")
    //     var that = this;
    //     console.log(this);
    //     var tokens = that.value.split(/[\,\s]+/);$(that).blur();
    //     $('#gene-search').val(tokens, true);
    //     console.log($('#gene-search').select2('val'));
        
    // });

      $('body').on('paste', '.select2-gene-search', function() {
  // append a delimiter and trigger an update
  $(this).val(this.value + ',').trigger('input');
});


    // Search gene
    $("#gene-search-btn").click(function(){
      waiting("show");
      // Clear all errors
      clearAllErrors();

      if(gene_selection.length == 0){
          waiting("hide")
         //Must have at least 1 gene, have -
         gene_form_group.addClass("has-error");
         missing_genes.removeClass("hide");
      }else{
        // Convert any non-ORF ids to ORFs
        gene_selection_2 = convertGeneToOrf(gene_selection);
        // Fetch json and update
        searchInOrfs(gene_selection_2);
      }
    });

    $("#seq-search-btn").click(function(){
      waiting("show");
      // Clear all errors
      clearAllErrors();



      console.log("search by seq button clicked!")
      fa = getFastaJson()
      searchInSequence(fa)

    });

    $("#update-search").click(function(){
      search_form.slideDown( "fast", function() {
        // Animation complete.
        result_row.hide();
      });
      
    });


    // Examples
    gene_example_btn.click(function(){
      gene_search.val("YAL067C,PHD1,ELO2").change();
    });

    seq_example_btn.click(function(){
      seq_data.val(">YAL062W 5' untranslated region, chrI 31068-31567, 500 bp\n\
GAGCACTTGCCAAAGTAATTAACGCCCATTAAAAAGAAGGCATAGGAGGCATATACATAT\n\
ATATATATATATATATATATGGCTGCTGACAGATATTCTGCACTTAAAAACTAAAAATAT\n\
TATACCAACTTTTCTTTTTCTTCCCGTTCAGTTTGCTTGATTGGCCCAGCTCTTTGAAGA\n\
AAGGAAAAAATGCGGAGAGGGAGCCAATGAGATTTTAAAGGGTATATTACTTATCTTATC\n\
GATAAGCAGTATTGATATTAAAGGGACAGTTTTATCGTTGGTTAATATGGAAAAAGTGAT\n\
GACCATGATGCCTTTCTTAAAAAGAGTATTTCTTTTTATTTCACTTTCACATAAACAGTT\n\
AATGACTTCTGACTTTGAGCCGTTCGAACTCAGTTATATAAAGGTACATACATAGGCCAC\n\
ACACACACACACACACACATATATATATATATATAGGGAAGTAGCAACAGTCACCGAAAA\n\
GAAAAGGTAAAAAGTAAAAA");
    });

    $("#clear-all").click(function(){
      seq_data.val("");
      gene_search.val("").change();
    });

    $('#download-table').click(function(){
      console.log("download clicked");
        var data = dynatable.settings.dataset.originalRecords;
        
        for(i = 0; i<data.length; i++){
          delete data[i]['ORF_url']
          delete data[i]['Gene_name_url']
          delete data[i]['expand_arrow']
          delete data[i]['score_viz']
          delete data[i]['PAM_mid_pretty']
          delete data[i]['1C']
          delete data[i]['9C']
        }

        if(data == '') return;
        JSONToCSVConvertor(data, true);
    });

});