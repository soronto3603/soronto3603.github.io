---
layout: post
title:  "[WEB]HTML+CSS+Javascript 4. 블로그 기본 틀 만들기 with 화면전환 효과"
date:   2018-10-18 5:28:00 +0900
categories: html css mysql
---
# 1. 네비게이션 바 만들기
간단하게 네비게이션 바를 만들어줍니다.

{% highlight html %}
<body>
  <div class="tab">
    <div class="item">Main</div>
    <div class="item">Message</div>
    <div class="item">Profile</div>
    <div class="item">Config</div>
  </div>

</body>
{% endhighlight %}


```css
  *{
    margin:0px;
    padding:0px;

    -webkit-transition: .25s ease-in-out;
    -moz-transition: .25s ease-in-out;
    -o-transition: .25s ease-in-out;
    transition: .25s ease-in-out;
  }
  .tab{
    margin-top:20px;
  }
  .item{
    width:24%;
    display:inline-block;
    color:#424242;
    font-size:26px;
    text-align:center;
  }
  .item:hover{
    background-color:#424242;
    color:#ffffff;
  }
```
위의 코드로 기본 틀을 다졌다면

네비게이터 클릭시 컨텐츠 변경을 위한 온클릭 이벤트를 달아줍시다.

# 네비게이터에 온클릭 이벤트 달기!
```HTML
<div class="tab">
  <div class="item" onclick="openTab('main')" >Main</div>
  <div class="item" onclick="openTab('message')" >Message</div>
  <div class="item" onclick="openTab('profile')">Profile</div>
  <div class="item" onclick="openTab('config')">Config</div>
</div>
<div id="main" class="pagecontent">
  a
</div>
<div id="message" class="pagecontent">
  b
</div>
  <div id="profile" class="pagecontent">
    c
</div>
<div id="config" class="pagecontent">
  d
</div>
```
```javascript
var pages=["main","message","profile","config"];

function openTab(tabname){
  for(var i=0;i<pages.length;i++){
    document.getElementById(pages[i]).style.display="none";
  }
  document.getElementById(tabname).style.display="block";
}
window.onload=()=>{
  openTab("main");
}
```
여기까지 완료가 되셨다면! 각 네비게이터를 클릭시 각 내용을 변경 합니다.

# 간단한 애니메이션을 적용해 봅시다.

```javascript
var pages=["main","message","profile","config"];

function openTab(tabname){
  for(var i=0;i<pages.length;i++){
    document.getElementById(pages[i]).style.display="none";
  }
  //여기가 포인트
  document.getElementById(tabname).style.left="100%";

  document.getElementById(tabname).style.display="block";
  //
  setTimeout(()=>{document.getElementById(tabname).style.left="0%";},10);
}
window.onload=()=>{
  openTab("main");
}
```
애니메이션의 핵심은 `display:none` 상태에서 우측으로 화면만큼 이동하여 0.01초 뒤 다시 원위치로
복귀 합니다. 여기서 애니메이션이 들어가는 이유는 `transition:.25 ease-in-out` css 를
적용했기 때문 입니다.

`CodePen` 에서 본 프로젝트를 만날 수 있습니다. 어찌된 영문인지.. 애니메이션이 안보이던군요..
아마 웹 렌더링 엔진문제이지 않을까 생각합니다. 
<p data-height="265" data-theme-id="0" data-slug-hash="zmWOEG" data-default-tab="html,result" data-user="soronto3603" data-pen-title="Blog Form Animation" class="codepen">See the Pen <a href="https://codepen.io/soronto3603/pen/zmWOEG/">Blog Form Animation</a> by soronto (<a href="https://codepen.io/soronto3603">@soronto3603</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
