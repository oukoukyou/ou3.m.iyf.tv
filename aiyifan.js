// ==UserScript==
// @name         ou3-爱一帆手机版（去广告）
// @namespace    https://m.iyf.tv
// @version      1.0
// @description  自动跳过广告，并添加捐赠按钮
// @author       You
// @match         https://m.iyf.tv/*
// @grant        none
// @license      Proprietary
// ==/UserScript==

(function () {
    'use strict';

    console.log("🚀 Tampermonkey 脚本已启动，正在屏蔽广告...");

    let isDonateButtonsCreated = false;  // 添加一个标志变量来确保按钮只创建一次

    // 1. 定义 MutationObserver 监听 DOM 变化
    const observer1 = new MutationObserver(mutations => {
        const adImages = document.querySelectorAll('.ad .van-image__img');
        if (adImages && adImages.length > 0) {
            let img = adImages[0];
            console.log("✅ Tampermonkey 脚本加载完成，广告图片已修改！");
        }
    });

    // 2. 监听整个页面 body 中的元素变化
    observer1.observe(document.body, {
        childList: true, // 监听子元素的变化
        subtree: true    // 监听所有后代元素的变化
    });

    // 3. 拦截广告播放器初始化
    Object.defineProperty(window, "initAdPlayer", {
        value: function () {
            console.log("🛑 拦截 initAdPlayer，广告播放器不会初始化");
        },
        writable: false,
        configurable: false
    });

    // 4. 拦截广告数据获取
    Object.defineProperty(window, "getAdsData", {
        value: function () {
            console.log("🛑 拦截 getAdsData，广告数据不会加载");
        },
        writable: false,
        configurable: false
    });

    // 5. 监听 DOM 变化，删除广告元素并添加捐赠按钮
    const removeAdsAndAddDonateButton = () => {
        const adElements = document.querySelectorAll(".ad-player, .ad_tips, .skip"); // 选择广告相关元素
        adElements.forEach(el => {
            el.remove();
            console.log("🗑 移除广告元素:", el);
        });

        // 仅在第一次删除广告时创建捐赠按钮
        if (!isDonateButtonsCreated) {
            const adDivs = document.querySelectorAll('.ad');
            adDivs.forEach(adDiv => {
                // 删除广告内容
                adDiv.innerHTML = '';
                console.log("✅ 广告内容已删除");

                // 创建捐赠按钮容器
                const donateContainer = document.createElement('div');
                donateContainer.style.display = 'ruby-text';
                donateContainer.innerHTML = `
                    <p style="color: #999;font-size: 13px;">开发不易，支持作者一杯卡布奇诺.</p>
                    <button id="wechatDonate" style="margin: 10px; padding: 10px 20px; background-color: #00bb2d; color: white; border: none; border-radius: 5px;">微信支付</button>
                    <button id="alipayDonate" style="margin: 10px; padding: 10px 20px; background-color: #007aff; color: white; border: none; border-radius: 5px;">支付宝支付</button>
                `;
                adDiv.appendChild(donateContainer);

                // 设置标志，确保按钮只创建一次
                isDonateButtonsCreated = true;
            });
        }
    };

    // 6. 监听 DOM 变化，防止广告重新插入
    const observer = new MutationObserver(removeAdsAndAddDonateButton);
    observer.observe(document.body, { childList: true, subtree: true });

    // 7. 修改广告状态，直接进入主视频
    Object.defineProperty(window, "adStatus", {
        get: function () {
            return 0; // 让 adStatus 永远等于 0，跳过广告
        },
        set: function (value) {
            console.log("🚀 拦截 adStatus 设置，阻止广告播放");
        }
    });

    // 8. 注入 CSS 来隐藏 pause_ad 的 div 元素
    const style = document.createElement('style');
    style.innerHTML = `
        div.pause_ad {
            display: none !important;
        }
        .van-image .image {
            background-image: url('https://github.com/oukoukyou/ou3.m.iyf.tv/blob/main/202309130910101070268-fotor-2025030815549.png');
            background-size: cover;
            width: 100%;
            height: 100%;
        }
    `;
    document.head.appendChild(style);

    // 9. 处理捐赠按钮的点击事件，弹出二维码
    document.body.addEventListener('click', (event) => {
        if (event.target.id === 'wechatDonate') {
            showDonateModal('微信支付二维码', 'https://example.com/alipay_qr.png');
        }

        if (event.target.id === 'alipayDonate') {
            showDonateModal('支付宝支付二维码', 'https://example.com/alipay_qr.png');
        }
    });
    // 10. 创建弹出二维码的函数
    function showDonateModal(title, imgUrl) {
        // 创建遮罩层
        const modalOverlay = document.createElement('div');
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100vw';
        modalOverlay.style.height = '100vh';
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modalOverlay.style.zIndex = '9999';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.alignItems = 'center';

        // 创建弹出框
        const modalBox = document.createElement('div');
        modalBox.style.backgroundColor = 'white';
        modalBox.style.padding = '20px';
        modalBox.style.borderRadius = '10px';
        modalBox.style.position = 'relative';
        modalBox.style.textAlign = 'center';

        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.innerText = '关闭';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.padding = '5px 10px';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modalOverlay); // 关闭弹窗
        });

        // 创建二维码图像
        const qrImage = document.createElement('img');
        qrImage.src = imgUrl;
        qrImage.style.width = '200px';
        qrImage.style.height = '200px';
        qrImage.style.marginBottom = '20px';

        // 把内容添加到弹出框
        modalBox.appendChild(closeButton);
        modalBox.appendChild(qrImage);
        modalBox.appendChild(document.createElement('h3')).innerText = title;

        // 把弹出框添加到遮罩层中
        modalOverlay.appendChild(modalBox);

        // 添加遮罩层到 body 中
        document.body.appendChild(modalOverlay);
    }
    console.log("✅ Tampermonkey 脚本加载完成，广告已屏蔽，捐赠按钮已添加！");
})();
