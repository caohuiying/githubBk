# 上拉加载/下拉刷新

- 使用`vux`库的`Scroller`实现的，虽然`vux`库`Scroller`已经不再维护，但还是可以拿来用用

页面结构如下：

``` vue
  <scroller use-pullup :pullup-config="pullupConfig" 
            @on-pullup-loading="loadMore"
            use-pulldown 
            :pulldown-config="pulldownConfig" 
            @on-pulldown-loading="refresh"
            lock-x ref="myScroller" height="-45">
    <div class="noticeTop">
      <div class="activeItem" v-for="(item,index) in itemList" 
           :key="index" @click="goDetail(item.announcementId)">
        <div class='sbottom'>
          <p class="title" :class="{isRead:item.isHaveRead}">{{item.title}}</p>
          <flexbox class="time-line" justify>
            <flexbox-item>
              <span>发布时间：</span><span  class='time'>{{item.publishDate.substring(0,10)}}</span> 
            </flexbox-item>
            <flexbox-item style="text-align:right;">
              <span>发布部门：</span><span>{{item.publishDept}}</span>
            </flexbox-item>
          </flexbox>
        </div>
      </div>
    </div>
  </scroller>
```

JS部分：

``` js
import { Scroller } from "vux";
const pulldownConfig = {
  content: "下拉刷新",
  height: 45,
  autoRefresh: false,
  downContent: "下拉刷新",
  upContent: "释放后刷新",
  loadingContent: "正在刷新...",
  clsPrefix: "xs-plugin-pulldown-"
};

const pullupConfig = {
  content: "上拉加载更多",
  pullUpHeight: 100,
  height: 45,
  autoRefresh: false,
  downContent: "释放后加载",
  upContent: "上拉加载更多",
  loadingContent: "加载中...",
  clsPrefix: "xs-plugin-pullup-"
};

export default {
  data() {
    return {
      pullupConfig: pullupConfig,
      pulldownConfig: pulldownConfig,
      pageNo: 0,
      pageSize:10
    };
  },
  mounted() {
    this.$store.commit("UPDATE_PAGE_TITLE", "通知公告");
    this.$nextTick(() => {
      this.$refs.myScroller.reset({ top: 0 });
    });
    // this.loadMore();
  },
	activated() {
		if (!this.$route.meta.isBack) {
			this.itemList = [];
			this.pageNo = 0;
			this.$nextTick(() => {
				this.$refs.myScroller.reset({ top: 0 });
			});
			this.loadMore();
		}
		this.$route.meta.isBack = false;
	},
  methods: {
    noticeList(cb) {
      api.article.noticeList(this.pageNo,this.pageSize).then(data => {
        this.$nextTick(() => {
          this.$refs.myScroller.reset();
        });
        cb(data);
      });
    },
    refresh() {
      console.info("refresh");
      this.pageNo = 1;
      setTimeout(() => {
        this.noticeList(data => {
          this.itemList = data.data;
          this.$nextTick(() => {
            this.$refs.myScroller.enablePullup();
            this.$refs.myScroller.donePulldown();
            this.$refs.myScroller.reset({ top: 0 });
          });
        });
      }, 1000);
    },
    loadMore() {
      console.info("loadMore");
      this.pageNo ++;
      this.noticeList(data => {
        if(this.pageNo * this.pageSize <= data.count){
          this.itemList = this.itemList.concat(data.data);
          this.$nextTick(() => {
            this.$refs.myScroller.enablePullup();
            this.$refs.myScroller.donePullup();
            this.$refs.myScroller.reset();
          });
        }else {
          this.$refs.myScroller.disablePullup();
        }
      });
    },
  },
  components: {
    Scroller,
  }
};
```

- `mint-ui` 里面的`loadmore`

``` vue
  <Loadmore  :bottom-method="loadBottom"
              :bottom-all-loaded="allLoaded"
              :auto-fill='false' ref="loadmore">
    <div class="butterfly_award_box">
      <div class="card_list"
            v-for="(item,index) in detailList" :key="index" @click="goDetail(item.id)">
        <div class="card_group">
          <div class="card_item"><div class="left">发送人：</div><div class="right">{{item.createCnName}}</div></div>
          <div class="card_item"><div class="left">接收人：</div><div class="right">{{item.receiveNames}}</div></div>
          <div class="card_item"><div class="left">日&nbsp;&nbsp;&nbsp;&nbsp;期：</div><div class="right">{{item.createDateStr}}</div></div>
        </div>
      </div>
    </div>
  </Loadmore>
```

JS部分：

``` js
  import { Loadmore } from 'mint-ui';
  export  default {
    components:{
      Loadmore
    },
    computed:{
      detailId(){
        return this.$route.params.id;
      }
    },
    data(){
      return {
        tabIndex:0,
        allLoaded:false,
        noData:false,
        detailList:[],
        totalCount:0,
        params:{
          page:1,
          pageSize:5,
        }
      }
    },
    mounted(){
      this.getReceives();
    },
    methods:{
      getReceives(){
        ButterflyAPI.getReceives(this.params.page,this.params.pageSize,this.detailId).then(data=>{
          this.parseData(data);
        })
      },
      parseData(data){
        this.totalCount = data.count;
        if(data.list.length == 0 && this.params.page == 1){
          this.detailList = [];
          this.noData = true;
          document.querySelector('.mint-loadmore-text').style.display = 'none';
        }else {
          this.noData = false;
          document.querySelector('.mint-loadmore-text').style.display = 'block';
          if(data.list && data.list.length > 0){
            this.detailList = this.detailList.contact(data.list);
          }
          if(this.totalCount <= this.params.pageSize * this.params.page){
            this.allLoaded = true;
            document.querySelector('.mint-loadmore-text').innerHTML= '无更多数据!';
          }else {
            this.allLoaded = false;
            document.querySelector('.mint-loadmore-text').innerHTML= '上拉刷新';
          }
        }
      },
      loadBottom(){
        this.params.page ++ ;
        this.getReceives();
        this.$refs.loadmore.onBottomLoaded();
      },
    }
  }
```