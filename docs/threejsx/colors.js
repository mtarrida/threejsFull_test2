
//random colors font
//https://stackoverflow.com/questions/55063134/get-random-non-repeated-color?noredirect=1&lq=1

function makeColor(colorNum, colors){
    if (colors < 1) colors = 1;
    // defaults to one color - avoid divide by zero
    return colorNum * (360 / colors) % 360;
}
// This could be length of your array.
var totalDIVs = 20;
var totalColors = totalDIVs;

for (var i = 0; i < totalDIVs; i++){
    var element = document.createElement('div');
    document.body.appendChild(element);
    var color = "hsl( " + makeColor(i, totalColors) + ", 100%, 50% )";
    element.style.backgroundColor = color;
    element.innerHTML = color;
}