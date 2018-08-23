---
layout: post
title: Mysql 데이터 export 하기
categories: [mysql,ubuntu]
tags: [mysql,ubuntu]
fullview: true
---

## MySql 안의 데이터 .sql 파일로 export 하기

## Export
```
mysqldump -u[user] -p[pw] [dbname] > [filename].sql
```

## Import
```
mysql -u[user] -p[pw] [dbname] < [filename].sql
```

즐코하세요
