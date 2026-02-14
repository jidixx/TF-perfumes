function showInfo(type) {
const info = 
document.getElementById("info");

if(type === "oud") {
info.innerText = "Сухой древесный аромат с удом и специями";
}

if(type === "tobacco") {
info.innerText = "Сладкий табачно-ванильный аромат с мёдом";
}
}