import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../errors";
import { ITrade, TradeModel } from "../models/trades";

const getStockByPrice = async (app: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const tradesCollection = app.mongo.db?.collection("trades");
  if (!tradesCollection) throw new Error("Database error - collection not found");

  const { stockSymbol } = request.params as any;
  const { start, end } = request.query as any;

  const stock = await tradesCollection.findOne({ symbol: stockSymbol });
  if (!stock) throw new NotFoundError("Stock symbol doesn't exist");

  // Set the exact time start and end to dates for a correct range
  const response = await tradesCollection
    .find({
      symbol: stockSymbol,
      timestamp: {
        $lte: new Date(`${end} 23:59:59`),
        $gte: new Date(`${start} 00:00:00`),
      },
    })
    .sort({ price: 1 });

  const stocksList = await response.toArray();

  if (!stocksList.length) reply.code(200).send({ message: "There are no trades in the given date range" });

  const res = {
    symbol: stockSymbol,
    lowest: stocksList[0].price,
    highest: stocksList[stocksList.length - 1].price,
  };
  reply.code(200).send(res);
};

// We can create a service file if we have more APIs
const getStockStats = async (app: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const tradesCollection = app.mongo.db?.collection("trades");
  if (!tradesCollection) throw new Error("Database error - collection not found");

  const { start, end } = request.query as any;

  const response = await tradesCollection.find({}, { projection: { _id: 0 } }).sort({ symbol: 1, timestamp: 1 });

  const tradesList = await response.toArray();
  if (!tradesList.length) reply.code(200).send({ message: "There are no trades in the given date range" });

  let symbols: Array<{
    stock: string;
    items: Array<ITrade>;
    fluctuations?: number;
    max_rise?: number;
    max_fall?: number;
    message?: string;
  }> = [];

  tradesList.forEach((value) => {
    const trade = new TradeModel(value);
    let symbolIndex = symbols.findIndex((value) => value.stock === trade.symbol);
    // Add the symbol if it doesn't exist
    if (symbolIndex === -1) {
      symbols.push({ stock: trade.symbol, items: [] });
      symbolIndex = symbols.length - 1;
    }
    // Add the trade to its stock if it's in the range
    if (
      trade.timestamp &&
      new Date(trade.timestamp) >= new Date(`${start} 00:00:00`) &&
      new Date(trade.timestamp) <= new Date(`${end} 23:59:59`)
    )
      symbols[symbolIndex].items.push(trade);
  });

  symbols.forEach((symbol) => {
    if (symbol.items.length === 0) {
      symbol.message = "There are no trades in the given date range";
      return;
    }
    symbol.items.forEach((item, index) => {
      if (index === 0) {
        symbol.fluctuations = 0;
        symbol.max_rise = 0;
        symbol.max_fall = 0;
      } else {
        const previousItem = symbol.items[index - 1];
        let diff = Number((item.price - previousItem.price).toFixed(2));
        // Check for max_fall and max_rise
        if (diff > 0 && symbol.max_rise !== undefined && diff > symbol.max_rise) symbol.max_rise = diff;
        else if (diff < 0 && symbol.max_fall !== undefined && Math.abs(diff) > symbol.max_fall)
          symbol.max_fall = Math.abs(diff);
        // Check for fluctuations
        if (index >= 2) {
          const beforePreviousItem = symbol.items[index - 2];
          if (
            ((previousItem.price > beforePreviousItem.price && previousItem.price > item.price) ||
              (previousItem.price < beforePreviousItem.price && previousItem.price < item.price)) &&
            symbol.fluctuations !== undefined
          ) {
            console.log("fluc ", symbol.stock);
            symbol.fluctuations++;
          }
        }
      }
    });
  });

  // Map result
  const res = symbols.map((symbol) => {
    return {
      stock: symbol.stock,
      ...(symbol.message
        ? {
            message: symbol.message,
          }
        : {
            fluctuations: symbol.fluctuations,
            max_rise: symbol.max_rise?.toFixed(2),
            max_fall: symbol.max_fall?.toFixed(2),
          }),
    };
  });

  reply.code(200).send(res);
};

export default {
  getStockByPrice,
  getStockStats,
};
