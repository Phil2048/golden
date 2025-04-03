$httpClient.get('https://api.metalpriceapi.com/v1/latest?api_key=YOUR_METALPRICEAPI_KEY&base=USD&currencies=XAU', function(error, response, data) {
  if (error) {
    $done({
      title: 'Gold Price Error',
      content: 'Failed to fetch gold price',
      icon: 'exclamationmark.circle.fill',
      backgroundColor: '#FF0000'
    });
    return;
  }
  
  const goldData = JSON.parse(data);
  const goldPriceUSD = goldData.rates.XAU; // 假设返回美元/盎司
  
  $httpClient.get('https://v6.exchangerate-api.com/v6/YOUR_EXCHANGERATEAPI_KEY/latest/USD', function(error, response, data) {
    if (error) {
      $done({
        title: 'Gold Price Error',
        content: 'Failed to fetch exchange rate',
        icon: 'exclamationmark.circle.fill',
        backgroundColor: '#FF0000'
      });
      return;
    }
    
    const rateData = JSON.parse(data);
    const cnyRate = rateData.conversion_rates.CNY;
    
    const convertedPrice = goldPriceUSD * cnyRate;
    
    $done({
      title: 'Gold Price',
      content: `AU9999: $${goldPriceUSD.toFixed(2)}/oz\nCNY: ¥${convertedPrice.toFixed(2)}/oz`,
      icon: 'dollarsign.circle.fill',
      backgroundColor: '#FFD700'
    });
  });
});
