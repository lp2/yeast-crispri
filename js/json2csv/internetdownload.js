function JSONToCSVConvertor(JSONData,ShowLabel) {    
	var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;   
	var CSV = '';     
	if (ShowLabel) {
		 var row = "";
		 for (var index in arrData[0]) {
				 //row += index + ',';
				 row += index + '\t';
		 }
		 row = row.slice(0, -1);
		 CSV += row + '\r\n';
	}
	for (var i = 0; i < arrData.length; i++) {
		 var row = "";
		 for (var index in arrData[i]) {
				// var arrValue = arrData[i][index] == null ? "" : '="' + arrData[i][index] + '"';
				// row += arrValue + ',';
				var arrValue = arrData[i][index] == null ? "" : arrData[i][index] + "";
				row += arrValue + '\t';
		 }
		 row.slice(0, row.length - 1);
		 CSV += row + '\r\n';
	}
	if (CSV == '') {        
		 growl.error("Invalid data");
		 return;
	}   
	var fileName = "crispri-results";
	if(msieversion()){
	var IEwindow = window.open();
	IEwindow.document.write('sep=,\r\n' + CSV);
	IEwindow.document.close();
	IEwindow.document.execCommand('SaveAs', true, fileName + ".tsv");
	IEwindow.close();
	} else {
	 var uri = 'data:application/csv;charset=utf-8,' + escape(CSV);
	 var link = document.createElement("a");    
	 link.href = uri;
	 link.style = "visibility:hidden";
	 link.download = fileName + ".tsv";
	 document.body.appendChild(link);
	 link.click();
	 document.body.removeChild(link);
	}
}
function msieversion() {
	var ua = window.navigator.userAgent; 
	var msie = ua.indexOf("MSIE "); 
	if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer, return version number 
	{
		return true;
	} else { // If another browser, 
		return false;
	}
		return false; 
}
