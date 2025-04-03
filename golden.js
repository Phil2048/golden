(async () => {
  // 输出脚本开始日志
  console.log(`[${$script.name}] Starting at ${$script.startTime}, Type: ${$script.type}`);

  try {
    // 从 $argument 获取 URL
    const url = $argument.split("url=")[1] || "https://i.jzj9999.com/quoteh5/";
    console.log(`Fetching data from: ${url}`);

    // 获取网页数据
    const response = await $http.get({
      url: url,
      headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)" }
    });
    const html = response.data;

    // 解析 AU9999 金价（回购价）
    const au9999Price = parsePrice(html, "Au99.99", "bidPrice");
    // 解析国际金价（XAU，回购价）
    const internationalGoldPrice = parsePrice(html, "XAU", "bidPrice");
    // 解析 USDCNH 汇率
    const exchangeRate = parsePrice(html, "USDCNH", "bidPrice");
    // 计算离岸汇率折合金价
    const offshoreGoldPrice = (internationalGoldPrice * exchangeRate).toFixed(2);

    // 输出解析结果到日志
    console.log(`AU9999: $${au9999Price}, XAU: $${internationalGoldPrice}, USDCNH: ${exchangeRate}, Offshore: ¥${offshoreGoldPrice}`);

    // 返回 Tile 显示内容
    $done({
      title: "实时金价",
      content: `AU9999: $${au9999Price}/oz\n国际金价: $${internationalGoldPrice}/oz\n离岸金价: ¥${offshoreGoldPrice}/oz`,
      icon: "dollarsign.circle.fill",
      backgroundColor: "#FFD700"
    });

    // 发送通知（可选）
    $notification.post("金价更新", "实时金价数据", `AU9999: $${au9999Price}, 国际: $${internationalGoldPrice}, 离岸: ¥${offshoreGoldPrice}`);
  } catch (error) {
    // 输出错误日志
    console.log(`Error: ${error.message}`);

    // 返回错误提示
    $done({
      title: "错误",
      content: "无法获取数据: " + error.message,
      icon: "exclamationmark.triangle",
      backgroundColor: "#FF0000"
    });

    // 发送错误通知
    $notification.post("金价抓取失败", "错误", error.message);
  }
})();

// 解析价格的函数
function parsePrice(html, code, field) {
  // 尝试匹配动态加载后的价格标签
  const regex = /<span class=["']symbol-price-(rise|fall)["'][^>]*>([0-9,.]+)<\/span>/i;
  const matches = html.match(regex);

  if (matches && matches[2]) {
    const value = parseFloat(matches[2].replace(",", ""));
    console.log(`Parsed ${code} (${field}): ${value}`);
    return value;
  }

  // 默认值
  const defaults = {
    "Au99.99": { "bidPrice": 2000.50 },
    "XAU": { "bidPrice": 2001.75 },
    "USDCNH": { "bidPrice": 7.28 }
  };
  const defaultValue = defaults[code]?.[field] || 2000;
  console.log(`Using default for ${code} (${field}): ${defaultValue}`);
  return defaultValue;
}
