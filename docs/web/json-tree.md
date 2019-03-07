# jQuery 拼接json tree

``` bash
  var  treeJson = [
    {
      name:'111',
      link:'###',
      children:[
        {
          name:'222',
          link:"##",
          children:[
            {
              name:'333'
            }
          ]
        }
      ]
    },
    {
      name:'222',
      link:'###',
      children:[
        {
          name:'333',
          link:"##",
          children:[
            {
              name:'444'
            }
          ]
        }
      ]
    }
  ];
  var makeTree = function(parentObj, treeJson) {
      var ulObj = $("<ul></ul>");
      for (var i = 0; i < treeJson.length; i++) {
          var childHtml = "<li>";
          var aHtml = "<a href=" + treeJson[i].link + ">" + treeJson[i].name + "</a>";
          childHtml += aHtml;
          childHtml += "</li>";
          var childObj = $(childHtml);
          if (treeJson[i].children != null && treeJson[i].children.length > 0) {
              makeTree(childObj, treeJson[i].children);
          }
          $(ulObj).append(childObj);
      }
      $(parentObj).append($(ulObj));
  };
  var parentObj = $("#treediv");
  makeTree($(parentObj), treeJson);
```