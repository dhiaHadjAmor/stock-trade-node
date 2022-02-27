import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ConflictError, NotFoundError } from "../errors";
import { TradeModel } from "../models/trades";
import { UserModel } from "../models/users";

const getAllTrades = async (app: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const tradesCollection = app.mongo.db?.collection("trades");
  if (!tradesCollection) throw new Error("Database error - collection not found");

  const response = tradesCollection.find({}, { projection: { _id: 0 } }).sort({ id: 1 });
  const tradesList = await response.toArray();
  reply.code(200).send(tradesList);
};

const getTradesByUser = async (app: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const tradesCollection = app.mongo.db?.collection("trades");
  const usersCollection = app.mongo.db?.collection("users");

  if (!tradesCollection || !usersCollection) throw new Error("Database error - collection not found");

  const { userId } = request.params as any;
  const user = await usersCollection.findOne({ id: Number(userId) });
  if (!user) throw new NotFoundError("User not found");

  const response = await tradesCollection.find({ "user.id": userId }, { projection: { _id: 0 } }).sort({ id: 1 });
  const tradesList = await response.toArray();
  reply.code(200).send(tradesList);
};

const addTrade = async (app: FastifyInstance, request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const tradesCollection = app.mongo.db?.collection("trades");
  const usersCollection = app.mongo.db?.collection("users");

  if (!tradesCollection || !usersCollection) throw new Error("Database error - collection not found");
  const trade = new TradeModel(request.body as any);

  // Create the user if it doesn't exist
  const user = await usersCollection.findOne({ id: Number(trade.user.id) });
  if (!user) {
    const newUser = new UserModel(trade.user);
    await usersCollection.insertOne(newUser);
  }

  const existingTrade = await tradesCollection.findOne({
    id: trade.id,
  });

  if (existingTrade) {
    // reply.code(400).send();
    throw new ConflictError("Existing trade");
  }

  await tradesCollection.insertOne(trade);
  reply.code(201).send();
};

export default {
  getAllTrades,
  getTradesByUser,
  addTrade,
};
