import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import fastifyStatic from "fastify-static";
import pointOfView from "point-of-view";
import Handlebars from "handlebars";
import fastifyEnv from "fastify-env";

import routes from "./routes";
import { connectDb, envOptions } from "./config";

const app = Fastify({
  logger: true,
});
const { log } = app;

const start = async () => {
  await app.register(fastifyEnv, envOptions);
  await app.register(connectDb);

  await app.register(routes);

  await app.register(fastifyStatic, {
    root: path.join(__dirname, "../public"),
  });

  // view engine setup
  await app.register(pointOfView, {
    engine: {
      handlebars: Handlebars,
    },
    root: path.join(__dirname, "views"),
  });

  const port = app.env.PORT || 8080;

  app.listen(port, function (err, address) {
    if (err) {
      log.error(err);
      process.exit(1);
    }
    log.info(`Example app listening at http://localhost:${port}`);
  });

  // error handler
  app.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    // Logging locally
    log.error(error);
    reply.status(error.statusCode || 500).send({ error: "Something went wrong" });
  });

  return app;
};

start();

export { app };
