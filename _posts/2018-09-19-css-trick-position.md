---
layout: post
title: [WEB]HTML+CSS+Javascript 1. 내 마음대로 위치 이동하기 display:block && display:inline-block
categories: [html,css,mysql]
tags: [html,css,mysql]
fullview: true
---
아마도 HTML+CSS를 배우면서 내가 원하는 장소에 원하는 객체를 위치시키지 못할때

무력함을 느낍니다...

( 아직도 전 어렵지만;; 그래도 시간만 있다면 원하는 곳에 놓을 수는 있게 됬습니당 ;; :( ㅜㅜ )

# 1. 세로로 배열하기
무언가를 세로로 배열 하고 싶다면..?

1.메뉴
2.메뉴
3.메뉴
4.메뉴
5.메뉴
6.메뉴

```html
<div>1.메뉴</div>
<div>2.메뉴</div>
<div>3.메뉴</div>
<div>4.메뉴</div>
<div>5.메뉴</div>
<div>6.메뉴</div>
```

```css
div{
  display:block;
}
```

`display:block`은 가로줄을 자신으로 꽉 채우며 세로로 배열할 수 있게 도와줍니다.

# 2. 가로로 배열하기
가로로 배열하고 싶다면..?
```html
<div>1.메뉴</div>
<div>2.메뉴</div>
<div>3.메뉴</div>
<div>4.메뉴</div>
<div>5.메뉴</div>
<div>6.메뉴</div>
```

```css
div{
  display:inline-block;
}
```

`display:inline-block`은 자신이 그리는 영역 만큼만 채우게 되며 나머지 공간은 차지 하지 않게 되며
가로로 배열할 수 있게 도와줍니다.

# 3. 부분적으로 배열 하기
한 부분은 세로로 배열 하고 싶고
다른 한부분은 가로로 배열 하고 싶다면?
```html
<div class="half left">
  <div>1.메뉴</div>
  <div>2.메뉴</div>
  <div>3.메뉴</div>
</div>
<div class="half right">
  <div>4.메뉴</div>
  <div>5.메뉴</div>
  <div>6.메뉴</div>
</div>
```

```css
.half{
  width:40%;
  display:inline-block;
}
.left div{
  display:block;
}
.right div{
  display:inline-block;
}
```
조금만 더 응용해본다면 수직 수평 배열은 문제 없겠죠?

아래의 페이지에서 위 코드의 실행 예제를 보고 수정할 수 있습니다.!
[https://codepen.io/soronto3603/pen/GXwvXZ](https://codepen.io/soronto3603/pen/GXwvXZ)
