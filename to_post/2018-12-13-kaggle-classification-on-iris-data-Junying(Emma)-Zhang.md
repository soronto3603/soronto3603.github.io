---
layout: post
title:  "[Kaggle] 아이리스 꽃잎 데이터 분석"
date:   2018-12-06 5:28:00
categories: python
---

### 아이리스 데이터 분류
#### Junying(Emma) Zhang - Classification on Iris Data

[https://www.kaggle.com/junyingzhang2018/classification-on-iris-data](https://www.kaggle.com/junyingzhang2018/classification-on-iris-data)

데이터 세트는 아이리스 (Iris setosa, Iris virginica 및 Iris versicolor)의 3 종의 각 50 개 샘플로 구성됩니다. 꽃잎과 꽃잎의 길이와 너비 (센티미터 단위)는 각 샘플에서 4 가지 특징을 측정했습니다. 피셔(Fihser)는이 네 가지 특징의 결합을 바탕으로 종을 구별하기 위해 선형 판별 모델을 개발했습니다.


The iris dataset contains measurements for 150 iris flowers from three different species.
홍채 데이터 세트는 세 종의 150 홍채 꽃에 대한 측정 값을 포함합니다.

아이리스 데이터셋은 3가지 분류로 되어 있습니다.
```
Iris-setosa (n=50). 
Iris-versicolor (n=50).
Iris-virginica (n=50). 
```

아이리스 데이터셋은 4가지 특징점( feature )을 가지고 있습니다.
```
sepal length in cm
sepal width in cm
petal length in cm
petal width in cm
```

For this classification exercise on the Iris species data,
아이리스 종 데이터 분류 실습을 위해

1. 파이썬 코드로 데이터 분석
2. 반절은 가설 모델( Hyphothesis model ) 훈련을 위해, 반절은 정확도 검사를 위해 나눈다.
3. 서포트 벡터 머신을 이용하여 분류 모델을 학습(train)합니다.
4. And we use GridSearchCV to tune the hyperparameters(C, gamma, kernel) in the SVC model to achieve 100% accuracy score.
4.  그리고 GridSearchCV를 사용해서 SVC모델이 100% 정확한 점수를 달성하기 위해 hyperparameters(C, gamma, kernel)을 조정합니다.  