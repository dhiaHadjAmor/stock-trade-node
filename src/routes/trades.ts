import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply, FastifyError } from "fastify";
import { getByUserSchema, tradePostSchema } from "../schemas";
import tradesController from "../controllers/trades";

const tradesRoutes = async (app: FastifyInstance, options: FastifyPluginOptions) => {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    await tradesController.getAllTrades(app, request, reply);
  });

  app.get("/users/:userId", { schema: getByUserSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
    await tradesController.getTradesByUser(app, request, reply);
  });

  app.post("/", { schema: tradePostSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
    await tradesController.addTrade(app, request, reply);
  });
};

export default tradesRoutes;
