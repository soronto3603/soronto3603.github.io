---
layout: post
title:  "Go 우분투 16.04.4 LTS ( Ubuntu ) 에 설치하기"
date:   2018-08-24 16:17:39 +0900
categories: go ubuntu
---
## apt-get 패키지 관리자 업데이트 하기
```
sudo apt-get update
sudo apt-get -y upgrade
```

## go 압축 파일 다운로드
```
sudo curl -O https://storage.googleapis.com/golang/go1.9.1.linux-amd64.tar.gz
```

## go 압축 파일 해제
```
sudo tar -xvf go1.9.1.linux-amd64.tar.gz
```

## go 파일 경로 설정
```
sudo mv go /usr/local
```
`go` 디렉토리를 `usr/local` 로 옮기고

## 환경변수 설정
```
sudo nano ~/.profile
```
파일 끝에 다음 코드를 삽입하세요.
```
export PATH=$PATH:/usr/local/go/bin
```
다 완료 됬다면
```
source ~/.profile
```
