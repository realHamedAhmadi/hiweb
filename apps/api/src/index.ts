import { createApp } from "./app";

const PORT = Number(process.env.PORT) || 4000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Hiweb API listening on port ${PORT}`);
});
