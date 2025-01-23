var commenter = "Lloydi";
var timezone = "GMT";
var currentdate = new Date(); 
var datetime = currentdate.getDate() + "/"
+ (currentdate.getMonth()+1)  + "/" 
+ currentdate.getFullYear() + " @ "  
+ currentdate.getHours() + ":"  
+ currentdate.getMinutes() + ":" 
+ currentdate.getSeconds();

function copyToClipboard(text) {
 var temp = document.createElement("textarea");
 document.body.appendChild(temp);
 temp.value = text;
 temp.select();
 document.execCommand("copy");
 document.body.removeChild(temp);
}

copyToClipboard("\n--- " + commenter + " - " + datetime + " " + timezone);
