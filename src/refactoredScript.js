function Location(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    var neighborhood = "";
    var city = "";
    var state = "";
    var country = "";

    this.getLocationInfo = function() {
        var locationProvider = "https://maps.googleapis.com/maps/api/geocode/json?";
        var locationAPIKey = "AIzaSyAy6rEZSV-m5GVVBjzkV4RpXL2tc45ckXg";
        var apiArgs = "latlng=" + this.latitude + "," + this.longitude + "&key=" + locationAPIKey;

        $.getJSON(locationProvider + apiArgs, this.parseLocationJSON)
    }

    this.parseLocationJSON = function(locationInfoJSON) {
        var address_components = locationInfoJSON.results[0].address_components;
        while (this.country === "" || i < address_components.length) {
            if (address_components[i].types.includes("neighborhood")) {
                this.neighborhood = address_components[i].long_name;
            } else if (address_components[i]["types"].includes("locality")) {
                this.city = address_components[i].long_name;
            } else if (address_components[i]["types"].includes("administrative_area_level_1")) {
                this.state = address_components[i].short_name;
            } else if (address_components[i]["types"].includes("country")) {
                this.country = address_components[i].long_name;
            }
            i++;
        }
        console.log(address_components);
    }
}

function WeatherInfo(latitude, longitude) {
    var temperatureK = "";
    var hiLoK = { hi: "", lo: "" };
    var latitude = latitude;
    var longitude = latitude;

    this.temperatureF = "";
    this.temperatureC = "";
    this.hiLoF = { hi: "", lo: "" };
    this.hiLoC = { hi: "", lo: "" };
    this.conditions = "";
    this.wind = { speed: "", direction: "" };

    this.getWeatherInfo = function() {
        var weatherProvider = "http://api.openweathermap.org/data/2.5/weather?";
        var weatherAPIKey = "5149260ba1cfcbcb24b65f62a86bbafd";
        var apiCall = "lat=" + latitude + "&lon=" + longitude + "&APPID=" + weatherAPIKey;

        $.getJSON(weatherProvider + apiCall, parseWeatherJSON);
    }

    this.parseWeatherJSON = function(weatherJSON) {
        this.temperatureK = weatherJSON.main.temp;
        weather.conditions = weatherJSON.weather[0].description;
        weather.hiLoK.hi = weatherJSON.main.temp_min;
        weather.hiLoK.lo = weatherJSON.main.temp_max;
        parseWind(weatherJSON.wind);
        convertTemperatures();
    }

    var convertTemperatures = function() {
        this.temperatureC = Math.round(temperatureK - 273.15);
        this.temperatureF = Math.round(temperatureC * (9 / 5) - 459);
        this.hiLoC.hi = Math.round(hiLoK.hi - 273.15);
        this.hiLoC.lo = Math.round(hiLoK.lo - 273.15);
        this.hiLoF.hi = Math.round(hiLoK.hi * (9 / 5) - 459);
        this.hiLoF.lo = Math.round(hiLoK.lo * (9 / 5) - 459);
    }

    var parseWind = function(wind) {
        this.wind.speed = wind.speed;
        var windDirection;
        if (wind.deg < 22 || wind.deg > 338) {
            windDirection = "N";
        } else if (wind.deg < 68) {
            windDirection = "NE";
        } else if (wind.deg < 111) {
            windDirection = "E";
        } else if (wind.deg < 158) {
            windDirection = "SE";
        } else if (wind.deg < 203) {
            windDirection = "S";
        } else if (wind.deg < 248) {
            windDirection = "SW";
        } else if (wind.deg < 292) {
            windDirection = "W"
        } else {
            windDirection = "NW";
        }
    }
}