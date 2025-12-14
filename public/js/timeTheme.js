fetch("https://worldtimeapi.org/api/ip")
  .then(res => res.json())
  .then(data => {
    const hour = new Date(data.datetime).getHours();

    let theme = "day";

    if (hour >= 5 && hour < 12) theme = "morning";
    else if (hour >= 12 && hour < 18) theme = "day";
    else if (hour >= 18 && hour < 22) theme = "evening";
    else theme = "night";

    document.body.classList.add("theme-" + theme);
  })
  .catch(err => console.log("time api failed", err));
