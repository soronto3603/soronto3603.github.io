---
layout: post
title:  "Mysql 데이터 export 하기"
date:   2018-08-24 16:17:39 +0900
categories: mysql ubuntu
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
