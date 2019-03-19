# less整理文件
**一.less是什么？**
- less是css预编译器，支持变量混合函数，为css提供更方便的维护方式
**两种注释方式**
``` md
- ①//less中的注释，但这种不会被编译

- ②
/*
 * 这也是less中的注释，但是会被编译
 */
```
**less中的变量**
1. 声明变量:@变量名:变量值;
   使用变量: @变量名
>>>less中变量的类型：
①数字类 1 10px
②字符串：无引号字符串 red ;有引号字符串 "haha"
③颜色类：red #000000 rgb()
④值列表类型：用逗号和空格分隔 10px solid red
example：
``` md
  @length: 100px;
  @color:red;
  @opa:0.5;
  @border:10px solid red;
  .borderRadius(@brWidth:10px){
      border-radius: @brWidth;
  }
  .setMargin(lefts,@width){
      margin-left:@width;
  }
```
>>>变量使用原则：
多次频繁出现的值、需要修改的值，设为变量
2. 混合(MiXins)
①无参混合
声明：.name{} 选择器中调用：.name;
②代参混合
无默认值声明：.name(@param){} 调用：.name(parValue);
有默认值声明：.name(@param:value){}
调用：.name(parValue); parValue可省
>>>如果声明时，参数没有默认值，则调用时必须赋值，否则报错！
>>>无参混合，会在css中编译除同名的class选择器，有参的不会
3. less的匹配模式：使用混合进行匹配，类似于if结构
声明：
``` md
.name(条件一，参数){}
.name(条件二，参数){}
.name(@_,参数){}
调用：.name(条件值，参数值);
```
- 匹配规则：根据调用时提供的条件值去寻找与之匹配的"MiXins"执行，其中@_表示永远需要执行的部分
4. less中的运算
``` md
+ - * / 可带、可不带单位
颜色运算时，红绿蓝分三组计算，组内可进位，组间互不干涉
```
5. 包含了传进来的所有参数：
``` md
border:@arguments;
```
6. less中的嵌套：保留HTML中的代码结构
①嵌套默认是后代选择器，如果需要子代选择器，则在子代前加>
②.&表示上一层 &:表示上一层的hover事件
example:
``` md
section{
      p{
          color: red;
          background-color: yellowgreen;
          text-align: center;
      }
      ul{
          padding: 0px;
          list-style: none;
         li{
             float: left;
             margin: 10px;
             width: 100px;
             text-align: center;
             border: @border;
             &:hover{
                 background-color: yellow;
             }
         }
     }
}
```

**二.less能做什么？**
- 可针对项目封装公共样式，公共属性，从而将复杂的css样式设计简单化，统一化处理；
**三.less的使用方式？**
- 1)直接调用，需引入.less和less.js文件,node.js编译；
- 2)第三方工具编译less，如koala等；
- 3)vue-cli可选择自动安装编译；
**四.less我还能怎么用？**
- 结合vue项目开发时使用提高效率
**五.less的优缺点有哪些？**
- 优点：高效开发，结构清晰，便于扩展
- 缺点：须要编译。无论是放在客户端还是服务器端，都是一种额外的花销
**六.同类东西 这个东西具有啥优势？**
- Less是基于JavaScript，是在客户端处理的。
- Sass是基于Ruby的，是在服务器端处理的。
- 目前优势个人觉得sass更强大一些

***Less和Sass在语法上有些共性，比如下面这些：***
1. 混入(Mixins)——class中的class；
2. 参数混入——可以传递参数的class，就像函数一样；
3. 嵌套规则——Class中嵌套class，从而减少重复的代码；
4. 运算——CSS中用上数学；
5. 颜色功能——可以编辑颜色；
6. 名字空间(namespace)——分组样式，从而可以被调用；
7. 作用域——局部修改样式；
8. JavaScript 赋值——在CSS中使用JavaScript表达式赋值。
