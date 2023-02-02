import app from "app";
import supertest from "supertest";
import { Fruit } from "repositories/fruits-repository";
import fruits from "data/fruits";

function clearData() {
  while (fruits.length > 0) {
    fruits.pop();
  }
}
describe("POST /fruits", () => {
  //clear table data
  beforeEach(clearData);
  afterAll(clearData);

  it("should respond with status 422 when body is not valid", async () => {
    const body = {};
    const result = await supertest(app).post("/fruits").send(body);
    expect(result.status).toBe(422);
  });

  it("should respond with status 409 when fruit is already registered", async () => {
    const apple: Fruit = {
      id: 1,
      name: "Apple",
      price: 1250,
    };

    fruits.push(apple);

    const body = {
      name: "Apple",
      price: 1250,
    };
    const result = await supertest(app).post("/fruits").send(body);
    expect(result.status).toBe(409);
  });

  it("should respond with status 201 when fruit is successfully registered", async () => {
    const body = {
      name: "Apple",
      price: 1250,
    };
    const result = await supertest(app).post("/fruits").send(body);
    const index = fruits.length - 1;
    expect(result.status).toBe(201);
    expect(fruits[index]).toStrictEqual({ ...body, id: 1 });
  });
});

describe("GET /fruits", () => {
  //clear table data
  beforeAll(() => {
    clearData();
    const apple: Fruit = {
      id: 1,
      name: "Apple",
      price: 820,
    };

    const orange: Fruit = {
      id: 2,
      name: "Orange",
      price: 550,
    };
    fruits.push(apple, orange);
  });
  afterAll(clearData);

  it("should respond with status 200 and an array with all fruits registered on the database", async () => {
    const result = await supertest(app).get("/fruits");
    expect(result.status).toBe(200);
    expect(result.body).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining<Fruit>({
          id: expect.any(Number),
          name: expect.any(String),
          price: expect.any(Number),
        }),
      ])
    );
  });
});

describe("GET /fruits/:id", () => {
  beforeAll(() => {
    clearData();
    const apple: Fruit = {
      id: 1,
      name: "Apple",
      price: 820,
    };
    fruits.push(apple);
  });
  afterAll(clearData);

  it("should respond with status 200 and specific fruit registered on the database", async () => {
    const result = await supertest(app).get("/fruits/1");
    expect(result.body).toStrictEqual(fruits[0]);
    expect(result.status).toBe(200);
  });

  it("should respond with status 404 if id doens't exists on the database", async () => {
    const result = await supertest(app).get("/fruits/2");
    expect(result.status).toBe(404);
  });
});
