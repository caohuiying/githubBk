# JS 数组元素上移或下移

实现方式是用建立个临时变量，然后交换位置，在vue中使用的
``` js
  	movePrev(){
  		if(this.choosedIndex == null){
  			this.$Message.info(this.$t('m.business_entry_please_select_move_menu'));
  			return;
  		}

  		if(this.choosedIndex > 0){
  			let temp = this.businessMens[this.choosedIndex - 1];
  			this.businessMens[this.choosedIndex - 1] = this.businessMens[this.choosedIndex]
  			this.businessMens[this.choosedIndex] = temp;
  			this.choosedIndex = this.choosedIndex - 1;
  		}
  	},
  	moveNext(){
  		if(this.choosedIndex == null){
  			this.$Message.info(this.$t('m.business_entry_please_select_move_menu'));
  			return;
  		}
  		if(this.choosedIndex < this.businessMens.length - 1){
  			let temp = this.businessMens[this.choosedIndex];
  			this.businessMens[this.choosedIndex] = this.businessMens[this.choosedIndex + 1]
  			this.businessMens[this.choosedIndex + 1] = temp;
  			this.choosedIndex = this.choosedIndex + 1;
  		}
  	}
```

在layui 中使用的

``` html
      <table class="layui-table" id="parse-table-demo">
        <colgroup>
          <col width="320px">
          <col>
        </colgroup>
        <tbody>
          {{each $data}}
          <tr>
            <td>{{$value.name}}</td>
            <td>
              {{if $value.offen}}
              <button class="action layui-btn layui-btn-sm layui-btn-radius layui-btn-danger" 
              idx="{{$index}}" action="show">移除</button>
              <button class="action layui-btn layui-btn-sm layui-btn-radius layui-btn-danger" 
              idx="{{$index}}" action="up">上移</button>
              <button class="action layui-btn layui-btn-sm layui-btn-radius layui-btn-danger" 
              idx="{{$index}}" action="down">下移</button>
              {{else}}
              <button class="action layui-btn layui-btn-sm layui-btn-radius layui-btn-danger" 
              idx="{{$index}}" action="hide">添加</button>
              {{/if}}
            </td>
          </tr>
          {{/each}}
        </tbody>
      </table>
```

``` js
		onEvent:function(){
			var scrollTop = $('.table_content_box').scrollTop(); //记录滚动位置
			var idx = Number($(this).attr('idx'));
			var action = $(this).attr('action');
			if(action == 'show'){
				settings.data[idx].offen = false;
			}else if(action == 'hide'){
				settings.data[idx].offen = true;
			}else if(action == 'up'){
				if(idx == 0){
					return layer.msg('已经到顶了');
				}
				var temp = settings.data[idx - 1];
				settings.data[idx - 1] = settings.data[idx];
				settings.data[idx] = temp;
			}else if(action == 'down'){
				if(idx == settings.data.length - 1){
					return layer.msg('已经到底了');
				}
				var temp = settings.data[idx + 1];
				settings.data[idx + 1] = settings.data[idx];
				settings.data[idx] = temp;
			}
			//对数据做操作
			$('#LAY_layuipro').html(entry_settings.template(settings.data));
			$('.table_content_box').scrollTop(scrollTop);
			settings.bindEvent();
		},
```