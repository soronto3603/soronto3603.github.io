---
layout: post
title:  "[WEB]HTML+CSS+Javascript 3. 애니메이션이 들어간 체크박스 만들기!"
date:   2018-10-11 17:40:00 +0900
categories: html css mysql
---

<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-6674782401318634"
     data-ad-slot="1424643683"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

# 체크 이미지 구하기
체크 표시를 어떻게 구하셔도 상관 없지만 저는 `Favicon` 으로 했습니다.
{% highlight html %}
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
{% endhighlight %}

헤더에 추가해주세요.

# 체크 박스 CSS로 표현하기
{% highlight html %}
  <div id=a class="outter-red" onclick="ab('a')" >
    <i class="fas fa-check"></i>
  </div>
  <div id=b class="outter-red" onclick="ab('b')" >
    <i class="fas fa-check"></i>
  </div>
  <div id=c class="outter-red" onclick="ab('c')" >
    <i class="fas fa-check"></i>
  </div>
  <div id=d class="outter-red" onclick="ab('d')" >
    <i class="fas fa-check"></i>
  </div>
{% endhighlight %}


{% highlight css %}
.outter-red{
  -webkit-transition: .25s ease-in-out;
  -moz-transition: .25s ease-in-out;
  -o-transition: .25s ease-in-out;
  transition: .25s ease-in-out;

  display: inline-block;
  padding: 10px;
  background-color: #F5624D;
  color: #ffffff;
}
{% endhighlight %}

# 체크 박스 클릭시 효과 넣어주기
{% highlight css %}
  function ab(id){
    if(document.getElementById(id).style.backgroundColor=="rgb(231, 231, 231)"){
      document.getElementById(id).style.backgroundColor="#F5624D";
    }else{
      document.getElementById(id).style.backgroundColor="#e7e7e7";
    }
  }
{% endhighlight %}

<p data-height="265" data-theme-id="0" data-slug-hash="EdXKyp" data-default-tab="html,result" data-user="soronto3603" data-pen-title="checkbox animation" class="codepen">See the Pen <a href="https://codepen.io/soronto3603/pen/EdXKyp/">checkbox animation</a> by soronto (<a href="https://codepen.io/soronto3603">@soronto3603</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
