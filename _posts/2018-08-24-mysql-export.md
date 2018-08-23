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
mysql -hhost_name -uuser_name -ppassword database_name table_name > write_the_name_you_want.sql
```

## Import
```
mysql -hhost_name -uuser_name -ppassword database_name < write_the_name_you_want.sql
```

즐코하세요
