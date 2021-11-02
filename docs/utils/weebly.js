
// <script type="text/javascript">  

let text1 = document.getElementsByClassName('wsite-content-title')[0]
text1.innerHTML = "@@@@#kkk";
console.log(document.getElementsByClassName('wsite-content-title')[0].innerHTML);//.innerHTML = "whatever";        


let btn = document.getElementsByClassName('wsite-button wsite-button-small wsite-button-highlight')[0]
btn.innerHTML = "@@@@#kkk";
btn.removeAttribute("href");

btn.addEventListener("click", myScript);

function myScript() {
let text2 = document.getElementsByClassName('wsite-content-title')[1]
text2.innerHTML = "qqqqqqqqqq";
}



// </script>