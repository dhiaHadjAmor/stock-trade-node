import fastifyPlugin from "fastify-plugin";
import fastifyMongo from "fastify-mongodb";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { Mongoose } from "mongoose";

declare module "fastify" {
  interface FastifyInstance {
    env: {
      DATABASE_URL: string;
      PORT: number;
    };
  }
}

const dbConnector = async (fastify: FastifyInstance, options: FastifyPluginOptions): Promise<void> => {
  try {
    const mongoose = new Mongoose();

    mongoose.connection.on("connected", () => {
      fastify.log.info({ actor: "MongoDB" }, "connected");
    });
    mongoose.connection.on("disconnected", () => {
      fastify.log.error({ actor: "MongoDB" }, "disconnected");
    });

    await fastify.register(fastifyMongo, {
      url: fastify.env.DATABASE_URL,
      forceClose: true,
    });
  } catch (error) {
    console.error(error);
  }
};

const envSchema = {
  type: "object",
  required: ["DATABASE_URL"],
  properties: {
    DATABASE_URL: {
      type: "string",
    },
    PORT: {
      type: "number",
    },
  },
};

export const envOptions = {
  confKey: "env",
  schema: envSchema,
  dotenv: true,
  data: process.env,
};

export const connectDb = fastifyPlugin(dbConnector);
