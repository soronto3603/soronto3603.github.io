---
layout: post
title: 지킬로 블로그 시작하기
categories: [Jekyll]
tags: [Jekyll, 블로그]
fullview: true
---
지킬을 설치하면 블로깅이 쉽다던데요
- #### [Jekyll 링크](https://jekyllrb-ko.github.io/)

- Gem 설치
    
    - Gem은 Ruby패키지 매니저이기 때문에 루비부터 설치 [Ruby 다운로드](https://rubyinstaller.org/downloads/) 


- Windows 명령 프롬프트에서 입력
{% highlight yaml %}
gem install bundler jekyll

jekyll new my-awesome-site

cd my-awesome-site

bundle exec jekyll serve

# => 브라우저로 http://localhost:4000 에 접속 
{% endhighlight %}
- 브라우저에서 **"Welcome to Jekyll"** 이 출력되면 성공

- 맘에 드는 테마를 찾기 위해 *Jekyll Themes*[링크](http://jekyllthemes.org/) 를 서핑

- 맘에 드는 테마를 찾았다면 Download

- 알집 형태의 파일을 압축해제 후 *my-awesome-site* 디렉토리로 이동


{% highlight yaml %}
cd my-awesome-site

bundle install # 의존성 패키지 설치

bundle exec jekyll serve

# => 브라우저로 http://localhost:4000 에 접속 
{% endhighlight %}

# Gitpage에 무료호스팅 해보기
- 자세한 내용 [https://pages.github.com/](https://pages.github.com/)

- Github 계정 생성하기 <br />
※( 생성시에 **Username**.github.io 이름으로 맞춰 레포지터리 생성! )
{% highlight yaml %}
git clone https://github.com/Username/Username.github.io
{% endhighlight %}

- 자신이 만든 사이트 파일 **전부**를 git에서 클론한 Username.github.io 디렉터리로 이동

{% highlight yaml %}
git add *
git commit -m "initial commit"
git push
#※https://Username.github.io/ 접속
#※상황에 따라서 github 계정 입력을 해야할 수도 있어요!
{% endhighlight %}
#### ※30분 이상 접속이 안된다면 메일을 확인해보세요.!



