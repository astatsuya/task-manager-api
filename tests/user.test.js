const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");

describe("user", () => {
  const userOne = {
    name: "Mike",
    email: "mike@example.com",
    password: "56what!!",
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

  it("Should login nonwxistent user", async () => {
    await request(app)
      .post("/users/login")
      .send({
        email: userOne.email,
        password: "MyPas1234!!",
      })
      .expect(500);
  });
});
