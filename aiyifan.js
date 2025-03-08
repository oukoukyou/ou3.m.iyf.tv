// ==UserScript==
// @name         跳过网站广告
// @namespace    https://m.iyf.tv
// @version      1.0
// @description  自动跳过广告
// @author       You
// @match         https://m.iyf.tv/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log("🚀 Tampermonkey 脚本已启动，正在屏蔽广告...");

    // 1. 拦截广告播放器初始化
    Object.defineProperty(window, "initAdPlayer", {
        value: function () {
            console.log("🛑 拦截 initAdPlayer，广告播放器不会初始化");
        },
        writable: false,
        configurable: false
    });

    // 2. 拦截广告数据获取
    Object.defineProperty(window, "getAdsData", {
        value: function () {
            console.log("🛑 拦截 getAdsData，广告数据不会加载");
        },
        writable: false,
        configurable: false
    });

    // 3. 监听 DOM 变化，删除广告元素
    const removeAds = () => {
        const adElements = document.querySelectorAll(".ad-player, .ad_tips, .skip"); // 选择广告相关元素
        adElements.forEach(el => {
            el.remove();
            console.log("🗑 移除广告元素:", el);
        });
    };

    // 4. 监听 DOM 变化，防止广告重新插入
    const observer = new MutationObserver(removeAds);
    observer.observe(document.body, { childList: true, subtree: true });

    // 5. 修改广告状态，直接进入主视频
    Object.defineProperty(window, "adStatus", {
        get: function () {
            return 0; // 让 adStatus 永远等于 0，跳过广告
        },
        set: function (value) {
            console.log("🚀 拦截 adStatus 设置，阻止广告播放");
        }
    });

    // 6. 注入 CSS 来隐藏 pause_ad 的 div 元素
    const style = document.createElement('style');
    style.innerHTML = `
        div.pause_ad {
            display: none !important;
        }
        .van-image .image {
            background-image: url('https://yourdomain.com/path/to/your-image.jpg');
            background-size: cover;
            width: 100%;
            height: 100%;
        }
    `;
    document.head.appendChild(style);

    console.log("✅ Tampermonkey 脚本加载完成，广告已屏蔽！");

})();
