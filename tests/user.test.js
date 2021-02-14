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
    const userParams = {
      name: "Andrew",
      email: "andrew@example.com",
      password: "MyPass777!",
    };
    const response = await request(app)
      .post("/users")
      .send(userParams)
      .expect(201);

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    expect(response.body).toMatchObject({
      user: {
        name: userParams.name,
        email: userParams.email,
      },
      token: user.tokens[0].token,
    });

    expect(user.password).not.toBe(userParams.password);
  });

  it("Should login exsiting user", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({
        email: userOne.email,
        password: userOne.password,
      })
      .expect(200);

    const user = await User.findById(response.body.user._id);
    expect(response.body.token).toBe(user.tokens[1].token);
  });

  it("Should not login nonexistent user", async () => {
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

  it("Should upload avatar image", async () => {
    await request(app)
      .post("/users/me/avatar")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .attach("avatar", "tests/fixtures/profile-pic.jpg")
      .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
  });

  it("Should update valid user fields", async () => {
    await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({
        name: "Jess",
      })
      .expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toBe("Jess");
  });

  it("Should not update invalid user fields", async () => {
    await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({
        location: "Philadelphia",
      })
      .expect(400);
  });
});
