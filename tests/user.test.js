const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");

describe("user", () => {
  const userOneId = new mongoose.Types.ObjectId();

  const userOne = {
    _id: userOneId,
    name: "Mike",
    email: "mike@example.com",
    password: "56what!!",
    tokens: [
      {
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
      },
    ],
  };

  beforeEach(async () => {
    await User.deleteMany();
    await new User(userOne).save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("Should signup a new user", async () => {
    await request(app)
      .post("/users")
      .send({
        name: "Andrew",
        email: "andrew@example.com",
        password: "MyPass777!",
      })
      .expect(201);
  });

  it("Should login exsiting user", async () => {
    await request(app)
      .post("/users/login")
      .send({
        email: userOne.email,
        password: userOne.password,
      })
      .expect(200);
  });

  it("Should login nonexistent user", async () => {
    await request(app)
      .post("/users/login")
      .send({
        email: userOne.email,
        password: "MyPas1234!!",
      })
      .expect(500);
  });

  it("Should get profile for user", async () => {
    await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
  });

  it("Should not get profile for unauthenticated user", async () => {
    await request(app).get("/users/me").send().expect(401);
  });

  it("Should delete account for user", async () => {
    await request(app)
      .delete("/users/me")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200);
  });

  it("Should not delete account for unauthenticateuser", async () => {
    await request(app).delete("/users/me").send().expect(401);
  });
});
