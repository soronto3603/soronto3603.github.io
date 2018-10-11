---
layout: post
title:  "[WEB]HTML+CSS+Javascript Div 만들고 드래그 앤 드랍으로 위치 바꾸기"
date:   2018-08-26 16:17:39 +0900
categories: html css mysql
---
## 마우스 위치 가져오기

```javascript
//mouse x y position
var x,y;

window.onload=()=>{
  $(window).mousemove((e)=>{
    x=e.pageX;
    y=e.pageY;
    // console.log(x+":"+y);

    //mouse position checking
    if(item != null){
      item.css("top",y);
      item.css("left",x);
    }
  });
}
```

## 클릭시 이벤트 발생 시키기
id 값을 넣었을때 해당 id 값으로 마우스 클릭 이벤트를 등록해주는 녀석입니다.

`click` 이벤트를 발생시키면 안되요!

길게 눌러서 옮기는 효과를 주려면

`mousedown` 과 `mouseup` 을 동시에 사용해야합니다.

```Javascript
//selected box
var item=null;
//append event to target
function append_event(id){
  $(id).mousedown((e)=>{
    item=$(id);
  });
  $(id).mouseup((e)=>{
    item=null;
  });
}
```

## 박스를 생성하고 ID 를 등록하기
```Javascript
//create div box
//박스 생성시 id 중복 불가
function add_box(id){
  $("body").append("<div id="+id+" class=item></div>")
  append_event("#"+id);
}
```
짜잔 완성

## 전체 코드
```javascript
//mouse x y position
var x,y;
//selected box
var item=null;

//create div box
//박스 생성시 id 중복 불가
function add_box(id){
  $("body").append("<div id="+id+" class=item></div>")
  append_event("#"+id);
}

//append event to target
function append_event(id){
  $(id).mousedown((e)=>{
    item=$(id);
  });
  $(id).mouseup((e)=>{
    item=null;
  });
}

window.onload=()=>{
  $(window).mousemove((e)=>{
    x=e.pageX;
    y=e.pageY;
    // console.log(x+":"+y);

    //mouse position checking
    if(item != null){
      item.css("top",y);
      item.css("left",x);
    }
  });
}

```
