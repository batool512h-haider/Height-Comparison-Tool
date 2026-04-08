const MIN = 50
const MAX = 274

let people=[]
let history=[]
let redoStack=[]
let personCount=1
let editingIndex=-1 // -1 means adding new, >=0 means editing that person

const scale=document.getElementById("scale")
const grid=document.getElementById("grid")
const peopleDiv=document.getElementById("people")

// Shared cm→px converter: maps cm value to pixels from bottom of the track
// All three elements (#scale, #grid, #ruler) share top:30px bottom:50px so offsetHeight is identical
function cmToPx(cm){
  return ((cm - MIN) / (MAX - MIN)) * scale.offsetHeight
}

function buildScale(){

scale.innerHTML=""
grid.innerHTML=""

let ruler=document.getElementById("ruler")
ruler.innerHTML=""

// Add vertical divider line between ft and cm
let divider=document.createElement("div")
divider.className="scaleDivider"
scale.appendChild(divider)

// 0 mark sits exactly at the floor
let zeroMark=document.createElement("div")
zeroMark.className="scaleMark zeroMark"
zeroMark.innerHTML='<span class="scaleFt">0\'0"</span>'
  +'<span class="scaleLine"></span>'
  +'<span class="scaleCm">0 cm</span>'
zeroMark.style.bottom="0px"
scale.appendChild(zeroMark)

for(let inches=24; inches<=108; inches+=6){

let feet=Math.floor(inches/12)
let inch=inches%12
let cm=Math.round(inches*2.54)
let px=cmToPx(cm)

let mark=document.createElement("div")
mark.className="scaleMark"
mark.style.bottom=px+"px"
mark.innerHTML='<span class="scaleFt">'+feet+"'"+(inch?inch:"0")+"\"</span>"
  +'<span class="scaleLine"></span>'
  +'<span class="scaleCm">'+cm+" cm</span>"
scale.appendChild(mark)

let line=document.createElement("div")
line.className="gridLine"
line.style.bottom=px+"px"
grid.appendChild(line)

}

for(let cm=MIN;cm<=MAX;cm+=1){
let tick=document.createElement("div")
tick.className="rulerTick"
if(cm%10===0) tick.classList.add("rulerMajor")
else if(cm%5===0) tick.classList.add("rulerMid")
tick.style.bottom=cmToPx(cm)+"px"
ruler.appendChild(tick)
}

}

// Defer until after layout so offsetHeight is accurate
requestAnimationFrame(()=>{ render() })

// Rebuild whenever the chart element itself changes size (dropdown open, window resize, etc.)
let _rebuildTimer=null
new ResizeObserver(()=>{
  clearTimeout(_rebuildTimer)
  _rebuildTimer=setTimeout(render, 50)
}).observe(document.querySelector(".chart"))

const unit=document.getElementById("unit")
const cmBox=document.getElementById("cmBox")
const ftBox=document.getElementById("ftBox")

unit.onchange=()=>{

if(unit.value==="cm"){
cmBox.style.display="block"
ftBox.style.display="none"
}
else{
cmBox.style.display="none"
ftBox.style.display="block"
}

}

// slider sync is handled in index.html inline script

// Selected avatar state
let selectedAvatarVariant = "male1"
let selectedAvatarColor = "#F39C12"

document.getElementById("addBtn").onclick=()=>{

if(editingIndex===-1 && people.length>=9){
showToast("You can compare up to 9 people at a time")
return
}
let name=document.getElementById("name").value
if(name==="" && editingIndex===-1) name="Person "+personCount++
if(name==="") name=people[editingIndex].name

let height

if(unit.value==="cm"){
height=parseFloat(document.getElementById("heightCm").value)
}
else{
let ft=parseFloat(document.getElementById("feet").value)
let inch=parseFloat(document.getElementById("inch").value)
height=Math.round((ft*30.48)+(inch*2.54))
}

// Use the data URL from photo preview if available
let img=null
let previewImg=document.getElementById("photoPreviewImg")
if(previewImg && previewImg.src && document.getElementById("photoPreview").style.display!=="none"){
img=previewImg.src
}

// Get selected avatar type and color
let avatarType="male"
let activeTab=document.querySelector(".avatar-tab.active")
if(activeTab) avatarType=activeTab.dataset.tab
let avatarVariant=selectedAvatarVariant
let avatarColor=selectedAvatarColor

history.push(people.map(p=>({...p})))
redoStack=[]

if(editingIndex>=0){
// EDIT existing person
people[editingIndex].name=name
people[editingIndex].height=height
people[editingIndex].avatarType=avatarType
people[editingIndex].avatarVariant=avatarVariant
people[editingIndex].avatarColor=avatarColor
if(img) people[editingIndex].img=img
cancelEdit()
} else {
// ADD new person
people.push({name,height,img,avatarType,avatarVariant,avatarColor})
}

document.getElementById("name").value=""
document.getElementById("photo").value=""
document.getElementById("photoPreview").style.display="none"
document.getElementById("photoPreviewImg").src=""
render()

}

// SVG silhouette generators — single color fill
// Male variants (12)
function makeMaleSVG1(c){ // slim
return '<svg viewBox="0 0 100 203" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="22" r="18" fill="'+c+'"/><rect x="35" y="42" width="30" height="65" rx="10" fill="'+c+'"/><rect x="25" y="47" width="14" height="48" rx="5" fill="'+c+'"/><rect x="61" y="47" width="14" height="48" rx="5" fill="'+c+'"/><rect x="36" y="105" width="13" height="90" rx="5" fill="'+c+'"/><rect x="51" y="105" width="13" height="90" rx="5" fill="'+c+'"/><ellipse cx="42" cy="198" rx="10" ry="5" fill="'+c+'"/><ellipse cx="58" cy="198" rx="10" ry="5" fill="'+c+'"/></svg>'
}
function makeMaleSVG2(c){ // average
return '<svg viewBox="0 0 100 207" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="22" r="20" fill="'+c+'"/><rect x="30" y="44" width="40" height="70" rx="12" fill="'+c+'"/><rect x="20" y="50" width="16" height="50" rx="6" fill="'+c+'"/><rect x="64" y="50" width="16" height="50" rx="6" fill="'+c+'"/><rect x="33" y="112" width="15" height="88" rx="6" fill="'+c+'"/><rect x="52" y="112" width="15" height="88" rx="6" fill="'+c+'"/><ellipse cx="40" cy="202" rx="11" ry="5" fill="'+c+'"/><ellipse cx="60" cy="202" rx="11" ry="5" fill="'+c+'"/></svg>'
}
function makeMaleSVG3(c){ // athletic
return '<svg viewBox="0 0 100 211" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="22" r="20" fill="'+c+'"/><path d="M25 44 Q30 40 50 42 Q70 40 75 44 L72 115 Q60 120 50 120 Q40 120 28 115 Z" fill="'+c+'"/><rect x="16" y="46" width="18" height="54" rx="7" fill="'+c+'"/><rect x="66" y="46" width="18" height="54" rx="7" fill="'+c+'"/><rect x="32" y="115" width="16" height="88" rx="6" fill="'+c+'"/><rect x="52" y="115" width="16" height="88" rx="6" fill="'+c+'"/><ellipse cx="40" cy="206" rx="11" ry="5" fill="'+c+'"/><ellipse cx="60" cy="206" rx="11" ry="5" fill="'+c+'"/></svg>'
}
function makeMaleSVG4(c){ // heavy
return '<svg viewBox="0 0 100 208" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="22" r="20" fill="'+c+'"/><ellipse cx="50" cy="82" rx="28" ry="40" fill="'+c+'"/><rect x="18" y="50" width="18" height="52" rx="7" fill="'+c+'"/><rect x="64" y="50" width="18" height="52" rx="7" fill="'+c+'"/><rect x="30" y="118" width="17" height="82" rx="7" fill="'+c+'"/><rect x="53" y="118" width="17" height="82" rx="7" fill="'+c+'"/><ellipse cx="38" cy="203" rx="12" ry="5" fill="'+c+'"/><ellipse cx="62" cy="203" rx="12" ry="5" fill="'+c+'"/></svg>'
}
function makeMaleSVG5(c){ // tall lanky
return '<svg viewBox="0 0 100 215" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="17" fill="'+c+'"/><rect x="37" y="39" width="26" height="72" rx="9" fill="'+c+'"/><rect x="27" y="44" width="13" height="50" rx="5" fill="'+c+'"/><rect x="60" y="44" width="13" height="50" rx="5" fill="'+c+'"/><rect x="38" y="109" width="11" height="98" rx="5" fill="'+c+'"/><rect x="51" y="109" width="11" height="98" rx="5" fill="'+c+'"/><ellipse cx="43" cy="210" rx="9" ry="4" fill="'+c+'"/><ellipse cx="57" cy="210" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeMaleSVG6(c){ // bodybuilder v-shape
return '<svg viewBox="0 0 100 210" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="22" r="20" fill="'+c+'"/><path d="M22 44 Q28 40 50 42 Q72 40 78 44 L68 118 Q58 122 50 122 Q42 122 32 118 Z" fill="'+c+'"/><rect x="12" y="44" width="20" height="56" rx="8" fill="'+c+'"/><rect x="68" y="44" width="20" height="56" rx="8" fill="'+c+'"/><rect x="33" y="118" width="16" height="85" rx="6" fill="'+c+'"/><rect x="51" y="118" width="16" height="85" rx="6" fill="'+c+'"/><ellipse cx="41" cy="206" rx="11" ry="4" fill="'+c+'"/><ellipse cx="59" cy="206" rx="11" ry="4" fill="'+c+'"/></svg>'
}
function makeMaleSVG7(c){ // dad bod
return '<svg viewBox="0 0 100 207" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="22" r="20" fill="'+c+'"/><rect x="28" y="44" width="44" height="50" rx="14" fill="'+c+'"/><ellipse cx="50" cy="95" rx="24" ry="22" fill="'+c+'"/><rect x="18" y="48" width="16" height="48" rx="6" fill="'+c+'"/><rect x="66" y="48" width="16" height="48" rx="6" fill="'+c+'"/><rect x="32" y="114" width="15" height="86" rx="6" fill="'+c+'"/><rect x="53" y="114" width="15" height="86" rx="6" fill="'+c+'"/><ellipse cx="39" cy="202" rx="11" ry="5" fill="'+c+'"/><ellipse cx="61" cy="202" rx="11" ry="5" fill="'+c+'"/></svg>'
}
function makeMaleSVG8(c){ // runner lean
return '<svg viewBox="0 0 100 208" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="18" fill="'+c+'"/><rect x="34" y="40" width="32" height="62" rx="10" fill="'+c+'"/><rect x="24" y="44" width="14" height="46" rx="5" fill="'+c+'"/><rect x="62" y="44" width="14" height="46" rx="5" fill="'+c+'"/><rect x="35" y="100" width="13" height="100" rx="5" fill="'+c+'"/><rect x="52" y="100" width="13" height="100" rx="5" fill="'+c+'"/><ellipse cx="41" cy="203" rx="10" ry="5" fill="'+c+'"/><ellipse cx="59" cy="203" rx="10" ry="5" fill="'+c+'"/></svg>'
}
function makeMaleSVG9(c){ // broad casual
return '<svg viewBox="0 0 100 206" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="22" r="19" fill="'+c+'"/><path d="M28 43 Q30 40 50 42 Q70 40 72 43 L70 110 Q60 116 50 116 Q40 116 30 110 Z" fill="'+c+'"/><rect x="18" y="46" width="16" height="52" rx="6" fill="'+c+'"/><rect x="66" y="46" width="16" height="52" rx="6" fill="'+c+'"/><rect x="34" y="112" width="14" height="86" rx="6" fill="'+c+'"/><rect x="52" y="112" width="14" height="86" rx="6" fill="'+c+'"/><ellipse cx="41" cy="201" rx="10" ry="5" fill="'+c+'"/><ellipse cx="59" cy="201" rx="10" ry="5" fill="'+c+'"/></svg>'
}
function makeMaleSVG10(c){ // elderly slightly hunched
return '<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg"><circle cx="52" cy="22" r="18" fill="'+c+'"/><path d="M34 42 Q32 44 35 75 L38 108 Q46 114 54 114 Q62 114 68 108 L70 68 Q72 44 68 42 Z" fill="'+c+'"/><rect x="22" y="48" width="15" height="46" rx="5" fill="'+c+'"/><rect x="64" y="46" width="15" height="46" rx="5" fill="'+c+'"/><rect x="36" y="110" width="14" height="82" rx="6" fill="'+c+'"/><rect x="52" y="110" width="14" height="82" rx="6" fill="'+c+'"/><ellipse cx="43" cy="195" rx="10" ry="5" fill="'+c+'"/><ellipse cx="59" cy="195" rx="10" ry="5" fill="'+c+'"/></svg>'
}
function makeMaleSVG11(c){ // teen slim
return '<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="17" fill="'+c+'"/><rect x="36" y="39" width="28" height="60" rx="10" fill="'+c+'"/><rect x="26" y="43" width="13" height="42" rx="5" fill="'+c+'"/><rect x="61" y="43" width="13" height="42" rx="5" fill="'+c+'"/><rect x="37" y="97" width="12" height="96" rx="5" fill="'+c+'"/><rect x="51" y="97" width="12" height="96" rx="5" fill="'+c+'"/><ellipse cx="43" cy="196" rx="9" ry="4" fill="'+c+'"/><ellipse cx="57" cy="196" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeMaleSVG12(c){ // formal suit silhouette
return '<svg viewBox="0 0 100 210" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="22" r="19" fill="'+c+'"/><path d="M30 43 L26 48 Q28 60 32 80 L34 118 Q42 122 50 122 Q58 122 66 118 L68 80 Q72 60 74 48 L70 43 Z" fill="'+c+'"/><rect x="18" y="46" width="15" height="50" rx="6" fill="'+c+'"/><rect x="67" y="46" width="15" height="50" rx="6" fill="'+c+'"/><rect x="34" y="118" width="14" height="84" rx="6" fill="'+c+'"/><rect x="52" y="118" width="14" height="84" rx="6" fill="'+c+'"/><ellipse cx="41" cy="205" rx="10" ry="5" fill="'+c+'"/><ellipse cx="59" cy="205" rx="10" ry="5" fill="'+c+'"/></svg>'
}

// Female variants (12)
function makeFemaleSVG1(c){ // slim
return '<svg viewBox="0 0 100 204" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="17" fill="'+c+'"/><path d="M36 38 Q32 40 34 70 L38 110 Q44 115 50 115 Q56 115 62 110 L66 70 Q68 40 64 38 Z" fill="'+c+'"/><rect x="24" y="42" width="14" height="44" rx="5" fill="'+c+'"/><rect x="62" y="42" width="14" height="44" rx="5" fill="'+c+'"/><rect x="37" y="110" width="12" height="88" rx="5" fill="'+c+'"/><rect x="51" y="110" width="12" height="88" rx="5" fill="'+c+'"/><ellipse cx="43" cy="200" rx="9" ry="4" fill="'+c+'"/><ellipse cx="57" cy="200" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeFemaleSVG2(c){ // average
return '<svg viewBox="0 0 100 207" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="18" fill="'+c+'"/><path d="M33 40 L28 48 L36 115 Q43 120 50 120 Q57 120 64 115 L72 48 L67 40 Z" fill="'+c+'"/><rect x="20" y="44" width="14" height="46" rx="5" fill="'+c+'"/><rect x="66" y="44" width="14" height="46" rx="5" fill="'+c+'"/><rect x="36" y="115" width="13" height="85" rx="5" fill="'+c+'"/><rect x="51" y="115" width="13" height="85" rx="5" fill="'+c+'"/><ellipse cx="42" cy="202" rx="10" ry="5" fill="'+c+'"/><ellipse cx="58" cy="202" rx="10" ry="5" fill="'+c+'"/></svg>'
}
function makeFemaleSVG3(c){ // curvy
return '<svg viewBox="0 0 100 208" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="18" fill="'+c+'"/><path d="M32 40 L26 50 Q28 75 35 85 Q28 95 32 120 Q42 126 50 126 Q58 126 68 120 Q72 95 65 85 Q72 75 74 50 L68 40 Z" fill="'+c+'"/><rect x="18" y="44" width="14" height="46" rx="5" fill="'+c+'"/><rect x="68" y="44" width="14" height="46" rx="5" fill="'+c+'"/><rect x="35" y="120" width="14" height="80" rx="6" fill="'+c+'"/><rect x="51" y="120" width="14" height="80" rx="6" fill="'+c+'"/><ellipse cx="42" cy="203" rx="10" ry="5" fill="'+c+'"/><ellipse cx="58" cy="203" rx="10" ry="5" fill="'+c+'"/></svg>'
}
function makeFemaleSVG4(c){ // dress/formal
return '<svg viewBox="0 0 100 206" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="18" fill="'+c+'"/><path d="M34 40 L30 46 Q28 60 32 75 L20 200 Q35 206 50 206 Q65 206 80 200 L68 75 Q72 60 70 46 L66 40 Z" fill="'+c+'"/><rect x="20" y="44" width="14" height="44" rx="5" fill="'+c+'"/><rect x="66" y="44" width="14" height="44" rx="5" fill="'+c+'"/></svg>'
}
function makeFemaleSVG5(c){ // athletic
return '<svg viewBox="0 0 100 207" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="18" fill="'+c+'"/><path d="M30 40 Q32 38 50 40 Q68 38 70 40 L66 115 Q58 120 50 120 Q42 120 34 115 Z" fill="'+c+'"/><rect x="18" y="42" width="16" height="50" rx="6" fill="'+c+'"/><rect x="66" y="42" width="16" height="50" rx="6" fill="'+c+'"/><rect x="36" y="115" width="13" height="85" rx="5" fill="'+c+'"/><rect x="51" y="115" width="13" height="85" rx="5" fill="'+c+'"/><ellipse cx="42" cy="202" rx="10" ry="5" fill="'+c+'"/><ellipse cx="58" cy="202" rx="10" ry="5" fill="'+c+'"/></svg>'
}
function makeFemaleSVG6(c){ // petite
return '<svg viewBox="0 0 100 198" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="16" fill="'+c+'"/><path d="M36 38 L32 45 L38 105 Q44 110 50 110 Q56 110 62 105 L68 45 L64 38 Z" fill="'+c+'"/><rect x="24" y="40" width="12" height="40" rx="5" fill="'+c+'"/><rect x="64" y="40" width="12" height="40" rx="5" fill="'+c+'"/><rect x="38" y="106" width="11" height="84" rx="5" fill="'+c+'"/><rect x="51" y="106" width="11" height="84" rx="5" fill="'+c+'"/><ellipse cx="43" cy="193" rx="9" ry="4" fill="'+c+'"/><ellipse cx="57" cy="193" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeFemaleSVG7(c){ // tall elegant
return '<svg viewBox="0 0 100 212" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="17" fill="'+c+'"/><path d="M35 38 L30 46 L36 118 Q43 122 50 122 Q57 122 64 118 L70 46 L65 38 Z" fill="'+c+'"/><rect x="20" y="42" width="14" height="48" rx="5" fill="'+c+'"/><rect x="66" y="42" width="14" height="48" rx="5" fill="'+c+'"/><rect x="37" y="118" width="12" height="88" rx="5" fill="'+c+'"/><rect x="51" y="118" width="12" height="88" rx="5" fill="'+c+'"/><ellipse cx="43" cy="208" rx="9" ry="4" fill="'+c+'"/><ellipse cx="57" cy="208" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeFemaleSVG8(c){ // plus size
return '<svg viewBox="0 0 100 206" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="18" fill="'+c+'"/><path d="M28 40 L24 50 Q26 75 30 90 Q24 100 28 120 Q40 128 50 128 Q60 128 72 120 Q76 100 70 90 Q74 75 76 50 L72 40 Z" fill="'+c+'"/><rect x="16" y="44" width="15" height="46" rx="5" fill="'+c+'"/><rect x="69" y="44" width="15" height="46" rx="5" fill="'+c+'"/><rect x="33" y="122" width="15" height="76" rx="6" fill="'+c+'"/><rect x="52" y="122" width="15" height="76" rx="6" fill="'+c+'"/><ellipse cx="40" cy="201" rx="11" ry="5" fill="'+c+'"/><ellipse cx="60" cy="201" rx="11" ry="5" fill="'+c+'"/></svg>'
}
function makeFemaleSVG9(c){ // long skirt
return '<svg viewBox="0 0 100 208" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="18" fill="'+c+'"/><path d="M34 40 L30 46 Q30 60 34 75 L28 202 Q40 208 50 208 Q60 208 72 202 L66 75 Q70 60 70 46 L66 40 Z" fill="'+c+'"/><rect x="20" y="44" width="14" height="44" rx="5" fill="'+c+'"/><rect x="66" y="44" width="14" height="44" rx="5" fill="'+c+'"/></svg>'
}
function makeFemaleSVG10(c){ // mini dress
return '<svg viewBox="0 0 100 207" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="18" fill="'+c+'"/><path d="M32 40 L28 48 Q26 60 30 75 L24 120 Q38 126 50 126 Q62 126 76 120 L70 75 Q74 60 72 48 L68 40 Z" fill="'+c+'"/><rect x="20" y="44" width="14" height="44" rx="5" fill="'+c+'"/><rect x="66" y="44" width="14" height="44" rx="5" fill="'+c+'"/><rect x="36" y="120" width="13" height="80" rx="5" fill="'+c+'"/><rect x="51" y="120" width="13" height="80" rx="5" fill="'+c+'"/><ellipse cx="42" cy="202" rx="10" ry="5" fill="'+c+'"/><ellipse cx="58" cy="202" rx="10" ry="5" fill="'+c+'"/></svg>'
}
function makeFemaleSVG11(c){ // teen girl
return '<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="16" fill="'+c+'"/><path d="M36 38 L32 44 L38 108 Q44 112 50 112 Q56 112 62 108 L68 44 L64 38 Z" fill="'+c+'"/><rect x="24" y="40" width="12" height="40" rx="5" fill="'+c+'"/><rect x="64" y="40" width="12" height="40" rx="5" fill="'+c+'"/><rect x="38" y="108" width="11" height="84" rx="5" fill="'+c+'"/><rect x="51" y="108" width="11" height="84" rx="5" fill="'+c+'"/><ellipse cx="43" cy="195" rx="9" ry="4" fill="'+c+'"/><ellipse cx="57" cy="195" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeFemaleSVG12(c){ // wide hip
return '<svg viewBox="0 0 100 207" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="18" fill="'+c+'"/><path d="M34 40 L30 48 Q32 65 36 78 L28 118 Q40 124 50 124 Q60 124 72 118 L64 78 Q68 65 70 48 L66 40 Z" fill="'+c+'"/><rect x="20" y="44" width="14" height="44" rx="5" fill="'+c+'"/><rect x="66" y="44" width="14" height="44" rx="5" fill="'+c+'"/><rect x="34" y="118" width="14" height="82" rx="6" fill="'+c+'"/><rect x="52" y="118" width="14" height="82" rx="6" fill="'+c+'"/><ellipse cx="41" cy="202" rx="10" ry="5" fill="'+c+'"/><ellipse cx="59" cy="202" rx="10" ry="5" fill="'+c+'"/></svg>'
}

// Child variants (12)
function makeChildSVG1(c){ // small toddler
return '<svg viewBox="0 0 80 170" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="24" r="20" fill="'+c+'"/><rect x="24" y="46" width="32" height="55" rx="10" fill="'+c+'"/><rect x="14" y="50" width="14" height="38" rx="5" fill="'+c+'"/><rect x="52" y="50" width="14" height="38" rx="5" fill="'+c+'"/><rect x="26" y="98" width="12" height="65" rx="5" fill="'+c+'"/><rect x="42" y="98" width="12" height="65" rx="5" fill="'+c+'"/><ellipse cx="32" cy="166" rx="9" ry="4" fill="'+c+'"/><ellipse cx="48" cy="166" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeChildSVG2(c){ // average kid
return '<svg viewBox="0 0 80 178" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="24" r="22" fill="'+c+'"/><rect x="22" y="48" width="36" height="58" rx="12" fill="'+c+'"/><rect x="12" y="52" width="15" height="40" rx="5" fill="'+c+'"/><rect x="53" y="52" width="15" height="40" rx="5" fill="'+c+'"/><rect x="25" y="104" width="13" height="68" rx="5" fill="'+c+'"/><rect x="42" y="104" width="13" height="68" rx="5" fill="'+c+'"/><ellipse cx="31" cy="174" rx="10" ry="4" fill="'+c+'"/><ellipse cx="49" cy="174" rx="10" ry="4" fill="'+c+'"/></svg>'
}
function makeChildSVG3(c){ // chubby toddler
return '<svg viewBox="0 0 80 165" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="24" r="22" fill="'+c+'"/><ellipse cx="40" cy="70" rx="22" ry="28" fill="'+c+'"/><rect x="12" y="50" width="14" height="34" rx="5" fill="'+c+'"/><rect x="54" y="50" width="14" height="34" rx="5" fill="'+c+'"/><rect x="26" y="95" width="12" height="62" rx="5" fill="'+c+'"/><rect x="42" y="95" width="12" height="62" rx="5" fill="'+c+'"/><ellipse cx="32" cy="160" rx="9" ry="5" fill="'+c+'"/><ellipse cx="48" cy="160" rx="9" ry="5" fill="'+c+'"/></svg>'
}
function makeChildSVG4(c){ // slim kid
return '<svg viewBox="0 0 80 175" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="22" r="19" fill="'+c+'"/><rect x="28" y="43" width="24" height="55" rx="8" fill="'+c+'"/><rect x="16" y="47" width="14" height="36" rx="5" fill="'+c+'"/><rect x="50" y="47" width="14" height="36" rx="5" fill="'+c+'"/><rect x="29" y="96" width="10" height="72" rx="4" fill="'+c+'"/><rect x="41" y="96" width="10" height="72" rx="4" fill="'+c+'"/><ellipse cx="34" cy="170" rx="8" ry="4" fill="'+c+'"/><ellipse cx="46" cy="170" rx="8" ry="4" fill="'+c+'"/></svg>'
}
function makeChildSVG5(c){ // girl with dress
return '<svg viewBox="0 0 80 175" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="22" r="20" fill="'+c+'"/><path d="M28 44 L24 48 Q26 60 28 72 L20 110 Q30 116 40 116 Q50 116 60 110 L52 72 Q54 60 56 48 L52 44 Z" fill="'+c+'"/><rect x="14" y="46" width="13" height="34" rx="5" fill="'+c+'"/><rect x="53" y="46" width="13" height="34" rx="5" fill="'+c+'"/><rect x="28" y="110" width="10" height="58" rx="4" fill="'+c+'"/><rect x="42" y="110" width="10" height="58" rx="4" fill="'+c+'"/><ellipse cx="33" cy="170" rx="8" ry="4" fill="'+c+'"/><ellipse cx="47" cy="170" rx="8" ry="4" fill="'+c+'"/></svg>'
}
function makeChildSVG6(c){ // pre-teen boy
return '<svg viewBox="0 0 80 185" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="22" r="19" fill="'+c+'"/><rect x="25" y="43" width="30" height="58" rx="10" fill="'+c+'"/><rect x="15" y="47" width="14" height="40" rx="5" fill="'+c+'"/><rect x="51" y="47" width="14" height="40" rx="5" fill="'+c+'"/><rect x="27" y="99" width="12" height="78" rx="5" fill="'+c+'"/><rect x="41" y="99" width="12" height="78" rx="5" fill="'+c+'"/><ellipse cx="33" cy="180" rx="9" ry="4" fill="'+c+'"/><ellipse cx="47" cy="180" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeChildSVG7(c){ // baby/infant
return '<svg viewBox="0 0 80 150" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="26" r="24" fill="'+c+'"/><ellipse cx="40" cy="72" rx="22" ry="26" fill="'+c+'"/><rect x="12" y="56" width="14" height="28" rx="5" fill="'+c+'"/><rect x="54" y="56" width="14" height="28" rx="5" fill="'+c+'"/><rect x="26" y="95" width="12" height="48" rx="5" fill="'+c+'"/><rect x="42" y="95" width="12" height="48" rx="5" fill="'+c+'"/><ellipse cx="32" cy="146" rx="9" ry="4" fill="'+c+'"/><ellipse cx="48" cy="146" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeChildSVG8(c){ // sporty kid
return '<svg viewBox="0 0 80 178" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="22" r="19" fill="'+c+'"/><path d="M24 43 Q28 40 40 42 Q52 40 56 43 L54 100 Q48 104 40 104 Q32 104 26 100 Z" fill="'+c+'"/><rect x="14" y="45" width="14" height="40" rx="5" fill="'+c+'"/><rect x="52" y="45" width="14" height="40" rx="5" fill="'+c+'"/><rect x="27" y="100" width="11" height="72" rx="5" fill="'+c+'"/><rect x="42" y="100" width="11" height="72" rx="5" fill="'+c+'"/><ellipse cx="32" cy="174" rx="9" ry="4" fill="'+c+'"/><ellipse cx="48" cy="174" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeChildSVG9(c){ // pre-teen girl
return '<svg viewBox="0 0 80 182" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="22" r="18" fill="'+c+'"/><path d="M28 42 L24 48 L32 108 Q36 112 40 112 Q44 112 48 108 L56 48 L52 42 Z" fill="'+c+'"/><rect x="14" y="44" width="14" height="38" rx="5" fill="'+c+'"/><rect x="52" y="44" width="14" height="38" rx="5" fill="'+c+'"/><rect x="28" y="108" width="11" height="68" rx="5" fill="'+c+'"/><rect x="41" y="108" width="11" height="68" rx="5" fill="'+c+'"/><ellipse cx="33" cy="178" rx="9" ry="4" fill="'+c+'"/><ellipse cx="47" cy="178" rx="9" ry="4" fill="'+c+'"/></svg>'
}
function makeChildSVG10(c){ // stocky kid
return '<svg viewBox="0 0 80 176" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="24" r="21" fill="'+c+'"/><rect x="20" y="47" width="40" height="56" rx="14" fill="'+c+'"/><rect x="10" y="50" width="15" height="38" rx="5" fill="'+c+'"/><rect x="55" y="50" width="15" height="38" rx="5" fill="'+c+'"/><rect x="24" y="101" width="14" height="68" rx="6" fill="'+c+'"/><rect x="42" y="101" width="14" height="68" rx="6" fill="'+c+'"/><ellipse cx="31" cy="172" rx="10" ry="4" fill="'+c+'"/><ellipse cx="49" cy="172" rx="10" ry="4" fill="'+c+'"/></svg>'
}
function makeChildSVG11(c){ // girl skirt
return '<svg viewBox="0 0 80 178" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="22" r="19" fill="'+c+'"/><path d="M28 43 L26 50 Q28 60 30 70 L22 112 Q32 118 40 118 Q48 118 58 112 L50 70 Q52 60 54 50 L52 43 Z" fill="'+c+'"/><rect x="16" y="46" width="13" height="34" rx="5" fill="'+c+'"/><rect x="51" y="46" width="13" height="34" rx="5" fill="'+c+'"/><rect x="28" y="112" width="11" height="60" rx="4" fill="'+c+'"/><rect x="41" y="112" width="11" height="60" rx="4" fill="'+c+'"/><ellipse cx="33" cy="174" rx="8" ry="4" fill="'+c+'"/><ellipse cx="47" cy="174" rx="8" ry="4" fill="'+c+'"/></svg>'
}
function makeChildSVG12(c){ // tall pre-teen
return '<svg viewBox="0 0 80 190" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="22" r="18" fill="'+c+'"/><rect x="26" y="42" width="28" height="60" rx="10" fill="'+c+'"/><rect x="16" y="46" width="13" height="42" rx="5" fill="'+c+'"/><rect x="51" y="46" width="13" height="42" rx="5" fill="'+c+'"/><rect x="28" y="100" width="11" height="82" rx="5" fill="'+c+'"/><rect x="41" y="100" width="11" height="82" rx="5" fill="'+c+'"/><ellipse cx="33" cy="185" rx="9" ry="4" fill="'+c+'"/><ellipse cx="47" cy="185" rx="9" ry="4" fill="'+c+'"/></svg>'
}

// Avatar variant registry
const avatarVariants = {
male1: makeMaleSVG1, male2: makeMaleSVG2, male3: makeMaleSVG3, male4: makeMaleSVG4,
male5: makeMaleSVG5, male6: makeMaleSVG6, male7: makeMaleSVG7, male8: makeMaleSVG8,
male9: makeMaleSVG9, male10: makeMaleSVG10, male11: makeMaleSVG11, male12: makeMaleSVG12,
female1: makeFemaleSVG1, female2: makeFemaleSVG2, female3: makeFemaleSVG3, female4: makeFemaleSVG4,
female5: makeFemaleSVG5, female6: makeFemaleSVG6, female7: makeFemaleSVG7, female8: makeFemaleSVG8,
female9: makeFemaleSVG9, female10: makeFemaleSVG10, female11: makeFemaleSVG11, female12: makeFemaleSVG12,
child1: makeChildSVG1, child2: makeChildSVG2, child3: makeChildSVG3, child4: makeChildSVG4,
child5: makeChildSVG5, child6: makeChildSVG6, child7: makeChildSVG7, child8: makeChildSVG8,
child9: makeChildSVG9, child10: makeChildSVG10, child11: makeChildSVG11, child12: makeChildSVG12
}

const PREVIEW_COLOR = "#2C3E50"

// Build avatar selection grids with SVG thumbnails
function buildAvatarGrids(){
let maleGrid = document.getElementById("avatarMale")
let femaleGrid = document.getElementById("avatarFemale")
let childGrid = document.getElementById("avatarChild")

maleGrid.innerHTML=""
femaleGrid.innerHTML=""
childGrid.innerHTML=""

;["male1","male2","male3","male4","male5","male6","male7","male8","male9","male10","male11","male12"].forEach((v)=>{
let div = document.createElement("div")
div.className = "avatar" + (v===selectedAvatarVariant?" selected":"")
div.dataset.variant = v
div.innerHTML = avatarVariants[v](PREVIEW_COLOR)
div.onclick = ()=>{
document.querySelectorAll(".avatar").forEach(x=>x.classList.remove("selected"))
div.classList.add("selected")
selectedAvatarVariant = v
}
maleGrid.appendChild(div)
})

;["female1","female2","female3","female4","female5","female6","female7","female8","female9","female10","female11","female12"].forEach((v)=>{
let div = document.createElement("div")
div.className = "avatar" + (v===selectedAvatarVariant?" selected":"")
div.dataset.variant = v
div.innerHTML = avatarVariants[v](PREVIEW_COLOR)
div.onclick = ()=>{
document.querySelectorAll(".avatar").forEach(x=>x.classList.remove("selected"))
div.classList.add("selected")
selectedAvatarVariant = v
}
femaleGrid.appendChild(div)
})

;["child1","child2","child3","child4","child5","child6","child7","child8","child9","child10","child11","child12"].forEach((v)=>{
let div = document.createElement("div")
div.className = "avatar" + (v===selectedAvatarVariant?" selected":"")
div.dataset.variant = v
div.innerHTML = avatarVariants[v](PREVIEW_COLOR)
div.onclick = ()=>{
document.querySelectorAll(".avatar").forEach(x=>x.classList.remove("selected"))
div.classList.add("selected")
selectedAvatarVariant = v
}
childGrid.appendChild(div)
})
}

function updateAvatarColors(color){
selectedAvatarColor = color
}

function render(){

buildScale()
peopleDiv.innerHTML=""
// Reset scroll state
peopleDiv.style.overflowX=""
peopleDiv.style.overflowY=""

let sorted=[...people].sort((a,b)=>b.height-a.height)
if(!sorted.length){ showResults(sorted); return }

const SCALE_W = 120
const SAFE_GAP = 32         // clear visual gap between scale boundary and any avatar
const BASE_AVATAR_W = 80   // base avatar width at no compression
const BASE_GAP = 20        // base gap between avatars at no compression
const MIN_AVATAR_W = 18
const LABEL_H = 16

let chartWidth = document.querySelector(".chart").offsetWidth
let usableW = chartWidth - SCALE_W - SAFE_GAP  // reserve SAFE_GAP from left
let n = sorted.length

// Compression ratio: scale down proportionally when avatars don't fit at base size
let compression = Math.min(1, usableW / (n * (BASE_AVATAR_W + BASE_GAP)))
let avatarW = Math.max(MIN_AVATAR_W, Math.round(BASE_AVATAR_W * compression))
let gap = Math.round(BASE_GAP * compression)
let slotW = avatarW + gap

// Total width of all avatars; center the group in usable area
let totalW = n * slotW - gap
let groupStart = SCALE_W + SAFE_GAP + Math.max(0, Math.round((usableW - totalW) / 2))

// Avatar left edges: evenly spaced from groupStart
// Left-clamped to SCALE_W + SAFE_GAP, right-clamped to chart edge
const LEFT_BOUND = SCALE_W + SAFE_GAP
let avatarLefts = sorted.map((_, i) => {
  let left = groupStart + i * slotW
  return Math.min(Math.max(left, LEFT_BOUND), chartWidth - avatarW)
})

// Center X of each avatar for label anchoring
let centerXs = avatarLefts.map(l => l + avatarW / 2)

let showName = avatarW >= 50
let showHeightLabel = avatarW >= MIN_AVATAR_W

// Label collision: stack overlapping labels vertically, centered above each avatar
// Natural label top in #people coords: (trackH - heightPx) - 22
let trackH = scale.offsetHeight
let labelTopOffsets = sorted.map(() => 0)
let labelLeftNudge = sorted.map(() => 0)  // px nudge to keep label right of LEFT_BOUND
const EST_LABEL_W = 90  // conservative estimate of label pixel width
if(showHeightLabel){
  let placed = [] // {cx, top, bottom}
  for(let i = 0; i < n; i++){
    let naturalTop = (trackH - cmToPx(sorted[i].height)) - 22
    let top = naturalTop
    let bottom = top + LABEL_H
    for(let j = 0; j < placed.length; j++){
      if(Math.abs(centerXs[i] - placed[j].cx) < 90){
        if(top < placed[j].bottom && bottom > placed[j].top){
          let shift = placed[j].top - bottom - 2
          labelTopOffsets[i] += shift
          top = naturalTop + labelTopOffsets[i]
          bottom = top + LABEL_H
        }
      }
    }
    placed.push({cx: centerXs[i], top, bottom})
    // Nudge label right if its left edge would cross into the scale area
    let labelLeft = centerXs[i] - EST_LABEL_W / 2
    if(labelLeft < LEFT_BOUND) labelLeftNudge[i] = LEFT_BOUND - labelLeft
  }
}

sorted.forEach((p,i)=>{

let px=cmToPx(p.height)

let div=document.createElement("div")
div.className="person"
if(slotW<50) div.classList.add("person--dense")

// Avatar positioned at its clamped left edge, centered within slot
div.style.left=avatarLefts[i]+"px"
div.style.width=Math.round(avatarW)+"px"
div.style.height=px+"px"

// SVG human figure
let figDiv=document.createElement("div")
figDiv.className="personFigure"

let variant=p.avatarVariant||"male2"
let color=p.avatarColor||"#F39C12"
let svgFn=avatarVariants[variant]
if(!svgFn){
// fallback based on avatarType
let type=p.avatarType||"male"
if(type==="female") svgFn=makeFemaleSVG2
else if(type==="child") svgFn=makeChildSVG1
else svgFn=makeMaleSVG2
}
figDiv.innerHTML=svgFn(color)

div.appendChild(figDiv)

// If user uploaded photo, show as face overlay
if(p.img){
let face=document.createElement("img")
face.className="personFace"
face.src=p.img
div.appendChild(face)
}

let totalIn=p.height/2.54
let lFt=Math.floor(totalIn/12)
let lIn=Math.round(totalIn%12)
if(lIn===12){lFt++;lIn=0}

// Stacked height label
let label=document.createElement("div")
label.className="heightLabel"
label.innerHTML=
  '<span class="lbl-name">'+p.name+'</span>'+
  '<span class="lbl-val">cm: '+Math.round(p.height)+'</span>'+
  '<span class="lbl-val">ft: '+lFt+"' "+lIn+'"</span>'
if(showHeightLabel){
  if(labelTopOffsets[i] !== 0) label.style.top = (-22 + labelTopOffsets[i]) + "px"
  if(labelLeftNudge[i] !== 0) label.style.transform = "translateX(calc(-50% + "+labelLeftNudge[i]+"px))"
  div.appendChild(label)
} else {
  label.className="heightLabel heightLabel--hover"
  div.appendChild(label)
}

// Head-top line
let headLine=document.createElement("div")
headLine.className="headLine"
div.appendChild(headLine)

// Hover actions (edit/delete)
let origIndex=people.indexOf(p)
let actions=document.createElement("div")
actions.className="hover-actions"

let editAction=document.createElement("button")
editAction.className="edit-action"
editAction.innerHTML='<i class="fa fa-pen"></i>'
editAction.onclick=(e)=>{
e.stopPropagation()
selectPerson(origIndex)
}

let deleteAction=document.createElement("button")
deleteAction.className="delete-action"
deleteAction.innerHTML='<i class="fa fa-trash"></i>'
deleteAction.onclick=(e)=>{
e.stopPropagation()
history.push(people.map(pp=>({...pp})))
redoStack=[]
people.splice(origIndex,1)
if(editingIndex===origIndex) cancelEdit()
else if(editingIndex>origIndex) editingIndex--
render()
}

actions.appendChild(editAction)
actions.appendChild(deleteAction)
div.appendChild(actions)

div.style.cursor="pointer"
if(origIndex===editingIndex) div.classList.add("personSelected")

div.onclick=()=>{
selectPerson(origIndex)
}

peopleDiv.appendChild(div)

})

showResults(sorted)

}

// Select a person and load their data into the form
function selectPerson(index){
editingIndex=index
let p=people[index]

// Load data into form
document.getElementById("name").value=p.name

// Convert cm to ft/inch
let totalInches=p.height/2.54
let ft=Math.floor(totalInches/12)
let inc=Math.round(totalInches%12)
if(inc===12){ft++;inc=0}

document.getElementById("feet").value=ft
document.getElementById("inch").value=inc
document.getElementById("heightCm").value=Math.round(p.height)
document.getElementById("slider").value=Math.round(p.height)
document.getElementById("sliderValue").textContent=Math.round(p.height)+' cm'

// Set avatar tab, color, and variant
let tabName=p.avatarType||"male"
selectedAvatarVariant=p.avatarVariant||(tabName+"2")
selectedAvatarColor=p.avatarColor||"#F39C12"

let tabs=document.querySelectorAll(".avatar-tab")
tabs.forEach(t=>{
t.classList.remove("active")
if(t.dataset.tab===tabName) t.classList.add("active")
})
document.getElementById("avatarMale").style.display="none"
document.getElementById("avatarFemale").style.display="none"
document.getElementById("avatarChild").style.display="none"
document.getElementById("avatar"+tabName.charAt(0).toUpperCase()+tabName.slice(1)).style.display="grid"

// Update color picker selection
document.querySelectorAll(".color-dot").forEach(d=>{
d.classList.remove("selected")
if(d.dataset.color===selectedAvatarColor) d.classList.add("selected")
})
buildAvatarGrids()

// Change button text
document.getElementById("addBtn").innerHTML='<i class="fa fa-save"></i> Save Changes'
document.getElementById("addBtn").classList.add("editing")

// Show cancel button
let cancelBtn=document.getElementById("cancelEditBtn")
if(!cancelBtn){
cancelBtn=document.createElement("button")
cancelBtn.id="cancelEditBtn"
cancelBtn.className="cancel-btn"
cancelBtn.innerHTML='<i class="fa fa-times"></i> Cancel'
cancelBtn.onclick=cancelEdit
document.getElementById("addBtn").parentNode.insertBefore(cancelBtn,document.getElementById("addBtn").nextSibling)
}
cancelBtn.style.display="block"

render()
}

function cancelEdit(){
editingIndex=-1
document.getElementById("name").value=""
document.getElementById("feet").value=5
document.getElementById("inch").value=7
document.getElementById("heightCm").value=170
document.getElementById("slider").value=170
document.getElementById("sliderValue").textContent="170 cm"
document.getElementById("addBtn").innerHTML='<i class="fa fa-plus"></i> Add Person'
document.getElementById("addBtn").classList.remove("editing")
let cancelBtn=document.getElementById("cancelEditBtn")
if(cancelBtn) cancelBtn.style.display="none"
document.getElementById("photo").value=""
render()
}

function showResults(sorted){

const results=document.getElementById("results")

if(sorted.length<2){
results.innerHTML=""
return
}

let tallest=sorted[0]

let html="<b>"+tallest.name+" is the tallest</b><br><br>"

for(let i=1;i<sorted.length;i++){

let diff=tallest.height-sorted[i].height
let diffIn=diff/2.54
let diffFt=Math.floor(diffIn/12)
let diffInch=Math.round(diffIn%12)
let diffStr=diffFt>0 ? diffFt+"' "+diffInch+'"' : Math.round(diffIn)+' inches'

html+=tallest.name+" is <b>"+diffStr+" ("+Math.round(diff)+" cm)</b> taller than "+sorted[i].name+"<br>"

}

results.innerHTML=html

}

document.getElementById("undoBtn").onclick=()=>{
if(history.length){
redoStack.push([...people])
people=history.pop()
render()
}
}

document.getElementById("redoBtn").onclick=()=>{
if(redoStack.length){
history.push([...people])
people=redoStack.pop()
render()
}
}

document.getElementById("editBtn").onclick=()=>{
if(people.length && editingIndex===-1){
// Select first person if none selected
selectPerson(0)
} else if(editingIndex>=0){
cancelEdit()
}
}

document.getElementById("clearBtn").onclick=()=>{
people=[]
history=[]
redoStack=[]
peopleDiv.innerHTML=""
document.getElementById("results").innerHTML=""
}

// Generate share link with people data in URL
function generateShareLink(){
let data=people.map(p=>p.name+","+Math.round(p.height)).join(";")
let url=location.origin+location.pathname+"?data="+encodeURIComponent(data)
return url
}

// Download chart as image using html2canvas
document.getElementById("downloadBtn").onclick=()=>{
let chartEl=document.querySelector(".chart")
html2canvas(chartEl,{
useCORS:true,
backgroundColor:null,
scale:2
}).then(canvas=>{
let link=document.createElement("a")
link.download="height-comparison.png"
link.href=canvas.toDataURL()
link.click()
})
}

function showToast(msg){
let toast=document.createElement("div")
toast.className="toast"
toast.innerHTML='<svg class="toast-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" stroke="#2563EB" stroke-width="1.5"/><path d="M6 10.5l2.5 2.5 5-5" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>'+msg+'</span>'
document.body.appendChild(toast)
requestAnimationFrame(()=>toast.classList.add("toast--show"))
setTimeout(()=>{
toast.classList.remove("toast--show")
toast.addEventListener("transitionend",()=>toast.remove(),{once:true})
},2500)
}

// Copy share link with data
document.getElementById("copyBtn").onclick=()=>{
let link=generateShareLink()
navigator.clipboard.writeText(link).then(()=>showToast("Share link copied!"))
}

function share(platform){

let url=encodeURIComponent(generateShareLink())
let text=encodeURIComponent("Check out this height comparison!")

if(platform==="facebook"){
window.open("https://www.facebook.com/sharer/sharer.php?u="+url)
}

if(platform==="twitter"){
window.open("https://twitter.com/intent/tweet?text="+text+"&url="+url)
}

if(platform==="whatsapp"){
window.open("https://api.whatsapp.com/send?text="+text+" "+url)
}

}

// Load people from URL if shared link
function loadFromURL(){
let params=new URLSearchParams(location.search)
let data=params.get("data")
if(data){
let entries=data.split(";")
entries.forEach(entry=>{
let parts=entry.split(",")
if(parts.length>=2){
let name=parts[0]
let height=parseFloat(parts[1])
if(name && !isNaN(height)){
people.push({name,height,img:null,avatarType:"male"})
}
}
})
if(people.length) render()
}
}

loadFromURL()







