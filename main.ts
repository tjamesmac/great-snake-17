/// <reference lib="deno.unstable" />
//
import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import data from "./data.json" assert { type: "json" };

const KEY = "dinosaur";
const TEST = "Aardonyx";
const kv = await Deno.openKv();
await kv.set([KEY, TEST], {
  name: TEST,
  description: "An early stage in the evolution of sauropods.",
});

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Welcome to dinosaur API!";
  })
  .get("/api", (context) => {
    context.response.body = data;
  })
  .get("/api/:dinosaur", async (context) => {
    if (context?.params?.dinosaur) {
      const found = await kv.get([KEY, context?.params?.dinosaur]);
      if (found) {
        context.response.body = found.value;
      } else {
        context.response.body = "No dinosaurs found.";
      }
    }
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
