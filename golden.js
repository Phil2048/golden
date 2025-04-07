console.log(`[${$script.name}] Starting at ${$script.startTime}, Type: ${$script.type}`);

const appkey = $argument.split("appkey=")[1] || "99ab4e7be6afc6a1";
let au9999Price, xauPrice, exchangeRate;

// 获取 AU9999 金价（人民币/克）
$httpClient.get(
  {
    url: "https://api.jisuapi.com/gold/shgold",
    url: "https://api.jisuapi.com/gold/london?appkey=99ab4e7be6afc6a1",
    headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)" },
    params: { appkey }
  },
  function (error, response, data) {
    console.log("AU9999 Response:", data); // 调试：打印完整响应
    if (error || JSON.parse(data).status !== 0) {
      console.log(`AU9999 fetch error: ${error || JSON.parse(data).msg}`);
      au9999Price = "2000.50";
    } else {
      const result = JSON.parse(data).result;
      console.log("AU9999 Result:", result); // 调试：打印 result 数组
      const au9999Data = result.find(item => item.type === "AU99.99");
      console.log("AU9999 Found:", au9999Data); // 调试：打印找到的项
      au9999Price = au9999Data ? au9999Data.price : "2000.50";
      console.log(`AU9999: ¥${au9999Price}/g`);
    }
    fetchXAU();
  }
);

// 获取伦敦金 (XAU，美元/盎司)
function fetchXAU() {
  $httpClient.get(
    {
      url: "https://api.jisuapi.com/gold/london",
      headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)" },
      params: { appkey }
    },
    function (error, response, data) {
      console.log("XAU Response:", data); // 调试：打印完整响应
      if (error || JSON.parse(data).status !== 0) {
        console.log(`XAU fetch error: ${error || JSON.parse(data).msg}`);
        xauPrice = "2001.75";
      } else {
        const result = JSON.parse(data).result;
        console.log("XAU Result:", result); // 调试：打印 result 数组
        const xauData = result.find(item => item.type === "伦敦金");
        console.log("XAU Found:", xauData); // 调试：打印找到的项
        xauPrice = xauData ? xauData.price : "2001.75";
        console.log(`XAU: $${xauPrice}/oz`);
      }
      fetchExchangeRate();
    }
  );
}

// 获取汇率 (USDCNH)
function fetchExchangeRate() {
  $httpClient.get(
    {
      url: "https://api.jisuapi.com/exchange/convert",
      headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)" },
      params: { appkey, from: "USD", to: "CNY", amount: "1" }
    },
    function (error, response, data) {
      console.log("USDCNH Response:", data); // 调试：打印完整响应
      if (error || JSON.parse(data).status !== 0) {
        console.log(`USDCNH fetch error: ${error || JSON.parse(data).msg}`);
        exchangeRate = "7.28";
      } else {
        const result = JSON.parse(data).result;
        console.log("USDCNH Result:", result); // 调试：打印 result 对象
        exchangeRate = result.rate;
        console.log(`USDCNH: ${exchangeRate}`);
      }
      finalize();
    }
  );
}

// 计算并返回结果
function finalize() {
  const offshoreGoldPriceOz = parseFloat(xauPrice) * parseFloat(exchangeRate); // 人民币/盎司
  const offshoreGoldPrice = (offshoreGoldPriceOz / 31.1035).toFixed(2); // 人民币/克
  console.log(`Offshore: ¥${offshoreGoldPrice}/g`);

  $done({
    title: "实时金价",
    content: `AU9999: ¥${au9999Price}/g\n伦敦金: $${xauPrice}/oz\n离岸金价: ¥${offshoreGoldPrice}/g`,
    icon: "dollarsign.circle.fill",
    backgroundColor: "#FFD700"
  });

  $notification.post(
    "金价更新",
    "实时金价数据",
    `AU9999: ¥${au9999Price}/g, 伦敦金: $${xauPrice}/oz, 离岸: ¥${offshoreGoldPrice}/g`
  );
}
