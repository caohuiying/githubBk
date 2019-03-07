# Ztree 结合 JQuery-ui autocomplete 实现搜索

引入ztree 和 jquery-ui
``` html
<link rel="stylesheet" href="lib/zTree_v3/css/zTreeStyle/zTreeStyle.css">
<script src="lib/jquery/jquery-1.9.1.min.js"></script>
<script src="lib/jquery-ui/jquery-ui.js"></script>
<script src="lib/zTree_v3/js/jquery.ztree.core.js"></script>
```
页面结构
``` html
  <div class="ht_org_left">
    <div class="ht_org_search">
      <input type="text" class="layui-input" id="search_org">
    </div>
    <div class="ht_org_tree">
        <ul id="ht_tree" class="ztree"></ul>
    </div>
  </div>
```

JS 实现方式

``` js
define([
  'css!org.css',
  'text!org.html',
  'tpl',
  'org_basic',
	'user_info',
	'user_hr',
  'user_other','http','cache'
], function (css, html, tpl,org_basic,user_info,user_hr,user_other,http,cache) {
  'use strict';

  var htOrgTree = {
    zNodes:[],
    baseInfo:{},
		hrInfo:{},
    otherInfo:{},
    init:function(){
      http.get('user/baseInfo/'+cache.getToken()).then(function(data){
				htOrgTree.baseInfo = data;
				org_basic.render('#org_basic',htOrgTree.baseInfo);
				user_info.render('#org_content',htOrgTree.baseInfo);
			})
			http.get('user/hrInfo/'+cache.getToken()).then(function(data){
				htOrgTree.hrInfo = data;
			})
			http.get('user/otherInfo/'+cache.getToken()).then(function(data){
				htOrgTree.otherInfo = data;
			})
      var setting = {
        view: {
          fontCss : htOrgTree.setFontCss
        },
        callback:{
          onClick:htOrgTree.getUserInfo,
          onExpand:htOrgTree.loadChildren
        }
      };
      http.get('org/init').then(function(data){
        var root = {
          name:"根节点", 
          open:true,
          iconSkin:'ht_root',
          type:'org',
          children: []
        }
        if(data && data.length > 0){
          $.each(data,function(index,item){
            item.iconSkin = 'ht_icon_1';
            item.children = [];
          })
        }
        root.children = data;
        htOrgTree.zNodes.push(root);
        $.fn.zTree.init($("#ht_tree"), setting, htOrgTree.zNodes);
      })
    },
    loadChildren:function(event, treeId, treeNode){
      var id = treeNode.code;
      var treeObj = $.fn.zTree.getZTreeObj(treeId);
      var node = treeObj.getNodeByTId(treeNode.tId);
      //判断该节点下是否有节点，没有就加载节点
      if(treeNode.children.length == 0){
        http.get('org/findOrgUser?code='+id).then(function(data){
          if(data && data.length>0){
            $.each(data,function(index,item){
              if(item.type == 'org'){
                item.children = [];
                item.iconSkin = 'ht_icon_1'
              }else {
                item.iconSkin = 'ht_icon_2'
              }
            })
          }
          treeObj.addNodes(node, data);
        })
      }
    },
    setFontCss:function(treeId, treeNode){
      return  treeNode.type == 'org'  ? {color:"#ec6c00"} : {};
    },
    bindTabEvent:function(){
      $('#org_nav .nav_item').on('click',function(){
        var index = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        switch (index){
          case 0:
            user_info.render('#org_content',htOrgTree.baseInfo);
            break;
          case 1:
            user_hr.render('#org_content',htOrgTree.hrInfo);
            break;
          case 2:
            user_other.render('#org_content',htOrgTree.otherInfo);
            break;	
        }
      })
    },
    getUserInfo:function(event, treeId, treeNode){
      if("user"==treeNode.type){
        $('#org_nav .nav_item:first-child').click();
        $('#org_nav .nav_item:first-child').siblings().css("display","none");
        var code=treeNode.code;
        http.get('user/baseInfo/'+code).then(function(data){
            htOrgTree.baseInfo = data;
            org_basic.render('#org_basic',htOrgTree.baseInfo);
            user_info.render('#org_content',htOrgTree.baseInfo);
        });
        if(treeNode.check){
          $('#org_nav .nav_item:first-child').siblings().css("display","inline-block");
          http.get('user/hrInfo/'+code).then(function(data){
            htOrgTree.hrInfo = data;
          });
          http.get('user/otherInfo/'+code).then(function(data){
            htOrgTree.otherInfo = data;
          });
        }else{
          htOrgTree.hrInfo=[];
          htOrgTree.otherInfo =[];
        }
      }
    },
    bindClose:function(){
      $('#org_close').on('click',function(){
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭      
      })
    },
    bindSearchEvent:function(){
      $("#search_org").autocomplete({
        minLength:1,
        max:5,
        scroll: true,
        scrollHeight: 100,
        source: function (request, response) {
          http.get('org/search?keyword='+request.term).then(function(data){
            response( $.map( data, function( item ) {  
                return {
                  code:item.code,
                  value:item.name,
                  check:item.check,
                  orgPath:item.orgPath,
                  type:item.type
                }  
              }
            ));
          })
        },
        focus: function( event, ui ) {
          return false;
        },
        select: function(event, ui ) {
          var orgPath = ui.item.orgPath;
          var useCode = ui.item.code;
          htOrgTree.loadSearch(orgPath,0,useCode);
        }
      });
    },
    loadSearch:function(orgPath,idx,useCode){
      var treeObj = $.fn.zTree.getZTreeObj("ht_tree");
      var nodes = treeObj.transformToArray(treeObj.getNodes());
          nodes.splice(0,1);
      $.each(orgPath,function(oIdx,oItem){
        $.each(nodes,function(nIdx,nItem){
          if(oItem == nItem.code){
            if(nItem.children.length > 0){
              var searchNode = treeObj.getNodeByParam("code", useCode, null);
              if(searchNode){
                treeObj.expandNode(nItem, true, true, true);
                console.log(searchNode)
                treeObj.selectNode(searchNode);
                $('#'+searchNode.tId+'_a').click();
              }
            }else {
              var node = treeObj.getNodeByTId(nItem.tId);
              htOrgTree.testArr = node;
              http.get('org/findOrgUser?code='+nItem.code).then(function(data){
                if(data && data.length>0){
                  $.each(data,function(index,item){
                    if(item.type == 'org'){
                      item.children = [];
                      item.iconSkin = 'ht_icon_1'
                    }else {
                      item.iconSkin = 'ht_icon_2'
                    }
                  })
                }
                treeObj.addNodes(node, data);
                htOrgTree.loadSearch(orgPath,idx+1,useCode);
              })
            }
            return false;
          }
        })
      })
      if(idx == orgPath.length){
        var searchNode = treeObj.getNodeByParam("code", useCode, null);
        treeObj.selectNode(searchNode);
        $('#'+searchNode.tId+'_a').click();
      }
    }
  }
  return {
    render: function (node, data) {
      $(node).html(tpl.render(html, data));
      htOrgTree.init();
      htOrgTree.bindTabEvent();
      htOrgTree.bindClose();
      htOrgTree.bindSearchEvent(); //绑定搜索事件
    },
  }
});
```