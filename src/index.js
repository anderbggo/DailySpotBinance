import { BinanceAPI } from "./services/binance-api.js";
import { config } from "../config.js";
import cron from "node-schedule";
import cronstrue from "cronstrue/i18n.js";
import colors from "colors";
import { TelegramAPI } from "./services/telegram-api.js"
import http from "http";

/**
 * Simple HTTP server to avoid process killing on free application plans
 */
const PORT = process.env.PORT || config.port || 3000;
const requestListener = function (req, res) {
	res.writeHead(200);	
	res.write('Todo va bien,')
	res.end(' ponte un monster bien fresquito mientras ganas dinero.');
}
const server = http.createServer(requestListener);
server.listen(PORT);

/**
 * Spanish date in abroad servers
 */

// time offset in Spain (Winter) is +2
var date = new Date();
var SpanishTime = date.getTime() + (2 * 3600000);



/**
 * Binance API
 */

const BINANCE_KEY = process.env.BINANCE_KEY || config.binance_key;
const BINANCE_SECRET = process.env.BINANCE_SECRET || config.binance_secret;
const binance = new BinanceAPI(BINANCE_KEY, BINANCE_SECRET);

/**
 * Telegram API
 */
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || config.telegram_token;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || config.telegram_chat_id;
const telegram = new TelegramAPI(TELEGRAM_TOKEN, TELEGRAM_CHAT_ID);

/**
 * @param {object} coin
 */
async function placeOrder(coin) {
	const { asset, currency, quantity, quoteOrderQty } = coin;
	const pair = asset + currency;
	const response = await binance.marketBuy(pair, quantity, quoteOrderQty);

	if (response.orderId) {
		const successText = `Comprado correctamente: ${response.executedQty} ${asset} @ ${response.fills[0].price} ${currency}. Gasta: ${response.cummulativeQuoteQty} ${currency}.\n`;
		const data = `${JSON.stringify(response)}\n`;

		console.log(colors.green(successText), colors.grey(data));		

		const details = binance.getOrderDetails("BTC", "EUR", response);
		await telegram.sendMessage(`✅ *SUUU, se ha comprado (${pair})* sin probemas\n\n` +
			`_ID Orden:_ ${details.orderId}\n` +
			`_Fecha:_ ${details.transactionDateTime}\n` +
			`_Cantidad:_ ${details.quantity} ${details.asset}\n` +
			`_Total:_ ${details.totalCost} ${details.currency}\n` +
			`_Valor promedio:_ ${details.averageAssetValue} ${details.currency}/${details.asset}\n` +
			`_Comisiones:_ ${details.commissions} ${details.commissionAsset}\n\n` +
			`${details.fills.join('\n')}`);
	} else {
		const errorText = response.msg || `Error inesperado colocando la orden para ${pair}`;
		console.error(colors.red(errorText));
		
		await telegram.sendMessage(`❌ *PUTA MADRE, algo falló al comprar (${pair})*\n\n` +
			'```' +
			`${errorText}` +
			'```');
	}
}


/**
 * @param {object} buy
 */
function getBuyDetails(buy) {
	return config.buy.map(c => {
		if (c.quantity) {
			return `👉 ${c.quantity} ${c.asset} con ${c.currency} ${c.schedule ? cronstrue.toString(c.schedule, { locale: "es", use24HourTimeFormat: true }) : "inmediatamente."}`
		}
		else {
			return `👉 ${c.quoteOrderQty} ${c.currency} de ${c.asset} ${c.schedule ? cronstrue.toString(c.schedule, { locale: "es", use24HourTimeFormat: true }) : "inmediatamente."}`
		}
	}).join('\n\n');
}

// Loop through all the assets defined to buy in the config and schedule the cron jobs
async function runBot() {
	console.log(colors.magenta("Iniciando el bot de Binance DCA"), colors.grey(`[${new Date().toLocaleString()}]`));

	for (const coin of config.buy) {
		const { schedule, asset, currency, quantity, quoteOrderQty } = coin;

		if (quantity && quoteOrderQty) {
			throw new Error(`Error: No puedes usar quantity y quoteOrderQty a la vez bro.`);
		}

		if (quantity) {
			console.log(colors.yellow(`Orden de compra ajustada para comprar ${quantity} ${asset} con ${currency} ${schedule ? cronstrue.toString(schedule, { locale: "es", use24HourTimeFormat: true }) : "inmediatamente."}`));
		} else {
			console.log(colors.yellow(`Orden de compra ajustada para comprar ${quoteOrderQty} ${currency} de ${asset} ${schedule ? cronstrue.toString(schedule, { locale: "es", use24HourTimeFormat: true }) : "inmediatamente."}`));
		}

		// If a schedule is not defined, the asset will be bought immediately
		// otherwise a cronjob is setup to place the order on a schedule
		if (!schedule) {
			await placeOrder(coin);
		} else {
			cron.scheduleJob(schedule, async () => await placeOrder(coin));
		}
	}

	await telegram.sendMessage('🏁 *El bot ha empezado 🥵🥵🥵 *\n\n' + 'Las horas de compra están en UTC+0 por lo que cualquier compra se ejecutará 2h más tarde en España \n\n' +
		`💁‍♂️ _Momento de inicio:_ ${new Date().toLocaleString()}\n\n` + 
		getBuyDetails(config.buy) + '\n\nChequea si el bot sigue activo aquí: https://binancedca.herokuapp.com/');
}

await runBot();
