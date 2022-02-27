import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { getStockPrice, getStockStats } from "../schemas";
import stocksController from "../controllers/stocks";

const stocksRoutes = async (app: FastifyInstance, options: FastifyPluginOptions) => {
  app.get("/:stockSymbol/price", { schema: getStockPrice }, async (request: FastifyRequest, reply: FastifyReply) => {
    await stocksController.getStockByPrice(app, request, reply);
  });

  app.get("/stats", { schema: getStockStats }, async (request: FastifyRequest, reply: FastifyReply) => {
    await stocksController.getStockStats(app, request, reply);
  });
};

export default stocksRoutes;
