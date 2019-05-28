/**
 * Created by admin on 2019/3/1.
 */
module.exports = {
    title: '小白的博客',
    description: '现在的现在不会等你预支将来的将来！',
    head: [ // 注入到当前页面的 HTML <head> 中的标签
        ['link', { rel: 'icon', href: '/logo.jpg' }], // 增加一个自定义的 favicon(网页标签的图标)
    ],
    base: '/', // 这是部署到github相关的配置
    markdown: {
        lineNumbers: false // 代码块显示行号
    },
    themeConfig: {
        nav:[ // 导航栏配置
            { text: '主页', link: '/' },
            {text: '基础库', link: '/web/' },
            {text: '小白', link: '/algorithm/'},
            {text: '特等舱', link: 'https://github.com/caohuiying'}
        ],
        sidebar: {
            '/web/': [
                {
                    title: '工具类',
                    collapsable: true,
                    children: [
                        '',
                        'json-tree',
                        'heightlight',
                        'date-format',
                        'util',
                        'split-file-name',
                        'array-move',
                        'markdown',
                        'less'
                    ]
                },
                {
                    title: 'VUE',
                    collapsable: true,
                    children: [
                        'keep-alive',
                        'axios',
                        'vux-load-more',
                        'vue-cli3'
                    ]
                },
                {
                    title: 'CANVAS',
                    children: [
                        'rain',
                        'particle'
                    ]
                },
                {
                    title: 'JQuery',
                    children: [
                        'ztree',
                        'fullCalendar'
                    ]
                }
            ],
            '/about/':[
                {
                    title: 'SunnyLi',
                    collapsable: false,
                    children: [
                        ''
                    ]
                },
            ]
        }, // 侧边栏配置
        sidebarDepth: 2, // 侧边栏显示2级
        head: [ // 注入到当前页面的 HTML <head> 中的标签
            ['link', { rel: 'manifest', href: '/photo.jpg' }],
            ['link', { rel: 'apple-touch-icon', href: '/photo.jpg' }],
        ],
        serviceWorker: true // 是否开启 PWA
    }
};