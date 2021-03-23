const x = require("x-ray-scraper");
const slug = require("slug");
x.setFilters({
  trim: function (value) {
    return typeof value === "string" ? value.trim() : value;
  },
  reverse: function (value) {
    return typeof value === "string"
      ? value.split("").reverse().join("")
      : value;
  },
  slice: function (value, start, end) {
    return typeof value === "string" ? value.slice(start, end) : value;
  },
  replace: function (value, rep) {
    return typeof value === "string" ? value.replace(rep, "") : value;
  },
  number: function (value) {
    return typeof value === "string" ? Number(value) : value;
  },
});

exports.fullScraper = async () => {
  let animes = [];
  // const data = await x(
  await x(
    `${process.env.URL}/anime-list.html?aph=&page=${process.env.START}`,
    "ul.listing li",
    [
      x("a@href", {
        title: "h1",
        type:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(4) a",
        summary:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(5) | replace:'Plot Summary:' | trim",
        genre: x(
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(6) ",
          ["a"]
        ),

        released:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(7) | replace:'Released:' | trim",

        otherName:
          "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(9) | replace:'Other name:' | trim",
        totalEpisodes: x("#episode_page", ["li a"]),
        image: ".anime_info_body_bg img@src",
      }),
    ]
  )
    // .paginate(
    //   (pageNumber, $) =>
    //     `https://gogoanime.ai/anime-list.html?aph=&page=${pageNumber}`
    // )
    .paginate(".pagination-list li.selected + li a@href")
    .limit(process.env.END)
    .then(async (data) => {
      console.log(data[0]);
      for (let k = 0; k < data.length; k++) {
        if (data[k].totalEpisodes[0] === "0") {
          data[k].totalEpisodes = 0;
          data[k].episodes = [];
        } else {
          data[k].totalEpisodes = data[k].totalEpisodes.reduce((acc, cur) => {
            return (acc += cur.split("-")[1] * 1);
          }, 0);
          const episodes = [];
          const title = slug(data[k].title);
          let totalEpisodes = data[k].totalEpisodes;
          for (let i = 1; i <= totalEpisodes; i++) {
            // for (let i = 1; i <= 1; i++) {
            let link = `${title}-episode-${i}`;

            const episodeLink = await x(
              `${process.env.URL}/${link}`,
              "#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > div.anime_video_body_cate > div.favorites_book > ul > li.dowloads > a@href"
            );
            console.log(link);
            console.log(data[k].title);
            console.log(episodeLink);
            console.log("---------------------------------");
            if (!episodeLink) break;
            const obj = {
              episode: i,
              link: episodeLink,
            };

            episodes.push(obj);
          }
          data[k].slug = slug(data[k].title);
          data[k].episodes = episodes;
        }
      }
      animes = [...animes, ...data];
      // console.log(animes);
    })
    .catch((err) => {
      console.log(err); // handle error in promise
    });

  return animes;
};

exports.scrapeAnime = async () => {
  const data = await x(`${process.env.URL}/`, ".items li", [
    {
      title: "p.name a",
      link: "p.name a@href",
      episode: {
        episode: "p.episode | replace:'Episode ' | number",
        link: x("p.name a@href", "li.dowloads a@href"),
      },
      AnimeDetails: x(
        "p.name a@href",
        x(".anime-info a@href", {
          title: "h1",
          type:
            "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(4) a",
          summary:
            "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(5) | replace:'Plot Summary:' | trim",
          genre: x(
            "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(6) ",
            ["a"]
          ),

          released:
            "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(7) | replace:'Released:' | trim",

          otherName:
            "#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(9) | replace:'Other name:' | trim",
          totalEpisodes: x("#episode_page", ["li a"]),
        })
      ),
    },
  ]);

  for (let k = 0; k < data.length; k++) {
    if (data[k].AnimeDetails.totalEpisodes[0] === "0") {
      data[k].AnimeDetails.totalEpisodes = 0;
      data[k].AnimeDetails.episodes = [];
    } else {
      data[k].AnimeDetails.totalEpisodes = data[
        k
      ].AnimeDetails.totalEpisodes.reduce((acc, cur) => {
        return (acc += cur.split("-")[1] * 1);
      }, 0);

      const episodes = [];
      const title = slug(data[k].AnimeDetails.title);
      let totalEpisodes = data[k].AnimeDetails.totalEpisodes;
      for (let i = 1; i <= totalEpisodes; i++) {
        let link = `${title}-episode-${i}`;

        const episodeLink = await x(
          `${process.env.URL}/${link}`,
          "#wrapper_bg > section > section.content_left > div:nth-child(1) > div.anime_video_body > div.anime_video_body_cate > div.favorites_book > ul > li.dowloads > a@href"
        );
        console.log(link);
        console.log(data[k].AnimeDetails.title);
        console.log(episodeLink);
        console.log("---------------------------------");
        const obj = {
          episode: i,
          link: episodeLink,
        };

        episodes.push(obj);
      }
      data[k].AnimeDetails.slug = slug(data[k].AnimeDetails.title);
      data[k].AnimeDetails.episodes = episodes;
    }
  }

  return data;
};
