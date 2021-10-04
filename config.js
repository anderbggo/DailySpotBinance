const config = {
  buy: [	
	/*
  //Need to complete binance fields. Optionally complete telegram fields to receive notifications on telegram.
  //To get Binance API and secret you need to enter on Binance API section and create a new one. Enable spot is neccesary.
  //To get telegram token you need to talk with @BotFather and chatId is found when talking with @getmyid_bot
  binance_key: "",
  binance_secret: "",
  telegram_token: "",
  telegram_chat_id: "",
	*/
    {
      asset: "BTC", // Cripto que quieras pillar
      currency: "USDT", // Moneda para hacer la operación
      quoteOrderQty: 5, // Cantidad (en este caso estás comprando 5 USDT de BTC
      schedule: "0 0 * * MON,WED,FRI,SUN"  // Orden activa todos los lunes, miercoles, viernes y domingos a las 00:00
    },
    {
      asset: "ETH",
      currency: "USDT",
      quoteOrderQty: 2.5,
      schedule: "0 0 * * TUE,THU,SAT"
    },
    {
      asset: "ADA",
      currency: "USDT",
      quoteOrderQty: 2.5,
      schedule: "0 0 * * MON,WED,FRI,SUN"
     },
     {
      asset: "DOT",
      currency: "USDT",
      quoteOrderQty: 2.5,
      schedule: "0 0 * * TUE,THU,SAT"
     },
     {
      asset: "LTC",
      currency: "USDT",
      quoteOrderQty: 2.5,
      schedule: "0 0 * * MON,WED,FRI,SUN"
     },
     {
      asset: "ROSE",
      currency: "USDT",
      quoteOrderQty: 1,
      schedule: "0 0 * * TUE,THU,SAT"
     },
     {
      asset: "BNB",
      currency: "USDT",
      quoteOrderQty: 2.5,
      schedule: "0 0 * * TUE,THU,SAT"
     }
  ]
}

export { config };
