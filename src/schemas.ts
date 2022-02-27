import { FastifySchema } from "fastify";

export const tradePostSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["id", "type", "user", "symbol", "shares", "price"],
    properties: {
      id: { type: "integer" },
      type: { type: "string", enum: ["buy", "sell"] },
      user: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
      symbol: { type: "string" },
      shares: { type: "integer", minimum: 10, maximum: 30 },
      price: {
        type: "number",
        minimum: 130.4,
        maximum: 195.65,
        set: (v: Number) => v.toFixed(2),
      },
      timestamp: { type: "string", default: Date.now() },
    },
  },
};

export const getByUserSchema: FastifySchema = {
  params: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "integer" },
    },
  },
};

const stockQuerySchema = {
  type: "object",
  required: ["start", "end"],
  properties: {
    start: { type: "string", format: "date" },
    end: { type: "string", format: "date" },
  },
};

export const getStockPrice: FastifySchema = {
  params: {
    type: "object",
    required: ["stockSymbol"],
    properties: {
      stockSymbol: { type: "string" },
    },
  },
  querystring: stockQuerySchema,
};

export const getStockStats: FastifySchema = {
  querystring: stockQuerySchema,
};
