var btnConvert = document.querySelector("#convert");
var raw = "";
var indented = "";
var input = document.querySelector("#txtRaw");
var output = document.querySelector("#txtConverted");
var stat = document.querySelector("#stat");
console.log(stat.innerHTML);
var indentStyle;
var indentDepth;
var indent;
var filterStyle = document.querySelector("#chk_style");
var filterOnclick = document.querySelector("#chk_onclick");
var filterOnClickReact = document.querySelector("#chk_onClickReact");
var filterDataDash = document.querySelector("#chk_dataDash");
var filterAngularNgCrap = document.querySelector("#chk_angularNgCrap");
var otherFilters = document.querySelectorAll("#otherFilters [type=checkbox]");

function removeStatus(){
 stat.textContent="";
}

function generateMarkup() {
 indentStr="";
 indentStyle = document.querySelector("[name=rad_Indentstyle]:checked").value;
 indentDepth = document.querySelector("[name=rad_Indentdepth]:checked").value;
 for (i=0; i<indentDepth; i++) {
  indentStr+=indentStyle;
 }
 
 raw = document.querySelector("#txtRaw").value;
 indented = raw.split("><").join(">\n<");
 input.value = indent.js(indented, {tabString: indentStr});
 indented = indented.replace(/ class=\"([^"]*)\"/g, "");
 if (filterStyle.checked) {
  indented = indented.replace(/ style=\"([^"]*)\"/g, "");
 }
 if (filterOnclick.checked) {
  indented = indented.replace(/ onclick=\"([^"]*)\"/g, "");
 }
 if (filterOnClickReact.checked) {
  indented = indented.replace(/ onClick=\"([^"]*)\"/g, "");
 }
 if (filterDataDash.checked) {
  indented = indented.replace(/ data-([^"]*)=\"([^"]*)\"/g, "");
 }
 if (filterAngularNgCrap.checked) {
     console.log('remove ng');
     indented = indented.replace(/ ng-[^\"\s]*="[^\"]*"/g, "");
 }
 indented = indent.js(indented, {tabString: indentStr});
 output.value = indented;
 stat.textContent="Markup updated";
 setTimeout(function(){
  removeStatus();
 },5000);
}
btnConvert.addEventListener("click", (ev) => {
 generateMarkup();
});
var radios = document.querySelectorAll('[name=rad_Indentstyle],[name=rad_Indentdepth]');
Array.from(radios).forEach(radio => {
 radio.addEventListener('change', e => {
  generateMarkup();
 });
});
var otherFilterCheckboxes = document.querySelectorAll('#otherFilters [type=checkbox]');
Array.from(otherFilterCheckboxes).forEach(otherFilterCheckboxes => {
 otherFilterCheckboxes.addEventListener('click', e => {
  generateMarkup();
 });
});

