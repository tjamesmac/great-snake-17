/// <reference lib="deno.unstable" />
//
import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import data from "./data.json" assert { type: "json" };

const KEY = "dinosaur";
const kv = await Deno.openKv();

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Welcome to dinosaur API!";
  })
  .get("/api", (context) => {
    context.response.body = data;
  })
  .get('/api/dinos', async () => {
    for (const dino of data) {
      await kv.set([KEY, dino.name.toLowerCase()], dino)
    }
  })
  .get("/api/:dinosaur", async (context) => {
    if (context?.params?.dinosaur) {
      const found = await kv.get([
        KEY,
        context?.params?.dinosaur.toLowerCase(),
      ]);
      if (found) {
        console.log(found, "am i found");
        context.response.body = found.value;
      } else {
        console.log(found, "am i not found");
        context.response.body = "No dinosaurs found.";
      }
    }
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

console.log("running 🦕");
await app.listen({ port: 8005 });
