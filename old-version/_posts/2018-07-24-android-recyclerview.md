---
layout: post
title: 02.Kotlin 안드로이드 리사이클러뷰 만들기
categories: [depplearning,CNN,computer vision]
tags: [depplearning,CNN,computer vision]
fullview: true
---

`Android Developers Core topics`의 ["RecyclerView를 사용하여 목록 만들기"](https://developer.android.com/guide/topics/ui/layout/recyclerview)
`RecyclerView`는 `ListView`보다 고급 버전 입니다.

`RecyclerView`는 기존의 `ListView` 와는 *다르게* `ViewHolder` 패턴을 사용하도록 유도합니다. 
`ViewHolder` 는 `RecyclerView` 에 들어가는 하나의 요소들을 화면에 보이는 것만 데이터 로딩을하며 안드로이드 메모리 관리를 효율적으로 할 수 있게 도와주는 역할을 하고 있습니다.

그 외에도 `RecyclerView` 는 다음의 최적화 작업을 수행합니다
+ 뷰홀더의 양 끝에 임시의 뷰 홀더를 생성하여 다음 요소의 디스플레이를 미리 준비해 놓습니다.
+ 스크롤 됬을때 새로운 뷰홀더를 생성하고 이미 스크롤된 뷰홀더는 저장해놓았다가 재사용 합니다. 만약 역방향으로 스크롤 한다면 저장해놓았던 뷰홀더를 재사용합니다. 만약 정방향으로 긴 스크롤을 한다면 사용안하는 뷰홀더를 재사용하여 새로운 데이터를 할당하여 보여줍니다. 뷰 홀더를 지속적으로 만들거나 팽창시킬 필요는 없습니다.

+ 표시된 항목이 추가되거나 변한다면 `RecyclerView.Adapter.notify...()` 메소드들을 사용하여 `RecyclerView` 내용을 쉽게 수정할 수 있습니다.

## 1. 의존성 라이브러리 설치
`build.gradle` 에 다음의 `depedencies` 항목을 추가합니다.
```
dependencies {
    implementation 'com.android.support:recyclerview-v7:27.1.1'
}
```

## 2. 리사이클러뷰 레이아웃을 생성합니다.
원하는 `layout`에 `RecyclerView`를 생성합니다.
```
<?xml version="1.0" encoding="utf-8"?>
<android.support.constraint.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".BookSearchActivity">

    <android.support.v7.widget.RecyclerView
        android:id="@+id/book_search_recyclerview"
        android:scrollbars="vertical"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:layout_constraintTop_toBottomOf="@+id/book_search_input_box"/>

</android.support.constraint.ConstraintLayout>
```
## 3. 메인 액티비티에 리사이클러 뷰 생성을 합니다
viewAdapter를 작성하지 않았기 때문에 오류가 보일 수 있습니다~
```kotlin
class BookSearchActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var viewAdapter: RecyclerView.Adapter<*>
    private lateinit var viewManager: RecyclerView.LayoutManager

    var myDataset=arrayListOf<String>()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_book_search)

        // 데이터 추가!
        myDataset.add("123")
        myDataset.add("456")
        myDataset.add("789")
        myDataset.add("3333")

        viewManager = LinearLayoutManager(this)
        // 뷰 어댑처 추가
        viewAdapter = mRecyclerViewAdapter(myDataset)

        // 리사이클러 뷰 생성
        recyclerView = findViewById<RecyclerView>(R.id.book_search_recyclerview).apply {
            // 이 곳의 변수셋팅으로 성능향상을 할 수 있습니다.
            // 내부 내용이 리사이클러뷰의 요소들을 수정하지는 않습니다.
            setHasFixedSize(true)

            // LinearLayout을 사용하여 viewManager를 셋팅
            layoutManager = viewManager

            // viewAdapter 셋팅
            adapter = viewAdapter

        }
    }
//    데이터 추가와 데이터 클리어를 테스트 하기위한 함수
    fun addDataTest(v:View){
        //데이터 "66666" 을 추가하고 notify함수를 호출하여 리사이클러 뷰를 업데이트 합니다.
        myDataset.add("66666")
        viewAdapter.notifyDataSetChanged()
    }
    fun clearDataTest(v:View){
        //데이터를 클리어하고 notify함수를 호출하여 리사이클러 뷰를 업데이트 합니다.
        myDataset.clear()
        viewAdapter.notifyDataSetChanged()
    }


}
```
## 4. 리사이클러뷰 어댑터를 생성합니다
리사이클러뷰 어댑터는 데이터셋을 생성자로 받고 뷰홀더 생성과 뷰홀더를 생성할때 데이터를 어떻게 연결할지 결정합니다
```kotlin
class mRecyclerViewAdapter(var myDataset: ArrayList<String>) :
        RecyclerView.Adapter<mRecyclerViewAdapter.ViewHolder>() {

    class ViewHolder(val mViewItem: ConstraintLayout) : RecyclerView.ViewHolder(mViewItem)

    // Create new views 
    override fun onCreateViewHolder(parent: ViewGroup,
                                    viewType: Int): mRecyclerViewAdapter.ViewHolder {
        // 새로운 뷰를 생성합니다.
        val mViewItem = LayoutInflater.from(parent.context)
                .inflate(R.layout.book_search_recyclerview_item, parent, false) as ConstraintLayout
        // 이곳에서 뷰의 스타일을 설정 하세요.

        return ViewHolder(mViewItem)
    }

    // 생성된 뷰에 데이터를 할당합니다.
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        // 새로 생성된 뷰 == holder == ConstraintView 내부에 접근하여 데이터를 지정
        holder.mViewItem.search_book_recyclerview_item_text.text = myDataset[position]
    }

    // 데이터셋의 길이를 리턴합니다. ( 레이아웃 매니저가 호출했을 경우 사용 )
    override fun getItemCount() = myDataset.size
}
```