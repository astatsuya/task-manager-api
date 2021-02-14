const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const Task = require("../src/models/task");
const {
  userOneId,
  userOne,
  setupDatabase,
  teardownDatabase,
} = require("./fixtures/db");

describe("task", () => {
  beforeEach(setupDatabase);

  afterAll(teardownDatabase);

  it("Should create task for user", async () => {
    const response = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
      .send({
        description: "From y test",
      })
      .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
  });
});
