const express = require("express");
const dotenv = require("dotenv");
const app = express();
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const cron = require("node-cron");
const Anime = require("./models/AnimeModel");
const { fullScraper, scrapeAnime } = require("./lib/scrappers");

//DATABASE CONNECTIONS

mongoose.connect(
  process.env.MONGODB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => console.log("conntect to database")
);

// DATABASE CONNECTION END

app.get("/", (req, res) => {
  res.send("Working");
});

app.get("/scrape", async (req, res) => {
  const data = await fullScraper();

  for (let i = 0; i < data.length; i++) {
    const anime = await Anime.findOne({ title: data[i].title });
    if (anime) {
      if (
        anime.episodes.some(
          (episode) => episode.episode === data[i].episode.episode
        )
      ) {
        console.log("leaving this loop");
        continue;
      } else {
        anime.episodes.push(data[i].episode);
        await anime.save();
        console.log("added new episodes");
      }
    } else {
      if (data[i].episodes.length > 0) {
        await Anime.create(data[i]);
      }
    }
  }
  res.send(data);
});

cron.schedule("* * * *", async () => {
  console.log("calling from scheduler");
  const data = await scrapeAnime();

  for (let i = 0; i < data.length; i++) {
    const anime = await Anime.findOne({ title: data[i].title });
    if (anime) {
      if (
        anime.episodes.some(
          (episode) => episode.episode === data[i].episode.episode
        )
      ) {
        console.log("leaving this loop");
        continue;
      } else {
        anime.episodes.push(data[i].episode);
        await anime.save();
        console.log("added new episodes");
      }
    } else {
      await Anime.create(data[i].AnimeDetails);
    }
  }
});

app.listen(3000, () => console.log("running on 3000 port"));
