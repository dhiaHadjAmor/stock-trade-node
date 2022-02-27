import { FastifyInstance, FastifyPluginOptions } from "fastify";
import stocksRoutes from "./stocks";
import tradesRoutes from "./trades";

const routes = async (app: FastifyInstance, options: FastifyPluginOptions) => {
  app.register(tradesRoutes, { prefix: "/trades" });
  app.register(stocksRoutes, { prefix: "/stocks" });

  // I didn't create a router file for "erase" as it is only one simple route
  app.delete("/erase", async (request, reply) => {
    try {
      const collection = app.mongo.db?.collection("trades");
      await collection?.deleteMany({});
      reply.status(200).send();
    } catch (error) {
      request.log.error(error);
      reply.status(500).send();
    }
  });
};

export default routes;
