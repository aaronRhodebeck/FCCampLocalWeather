var locationAPIKey = "AIzaSyAy6rEZSV-m5GVVBjzkV4RpXL2tc45ckXg";
var locationProvider = "https://maps.googleapis.com/maps/api/geocode/json?";
var weatherProvider = "http://api.openweathermap.org/data/2.5/weather?";
var weatherAPIKey = "5149260ba1cfcbcb24b65f62a86bbafd";
var photoProvider = "https://api.flickr.com/services/rest/?";
var photoAPIKey = "2aa3ca15349793103b4bedf6329951c7";

var currentWeather = {
    temperatureK: "",
    temperatureC: "",
    temperatureF: "",
    hiLoK: "",
    hiLoF: "",
    hiLoC: "",
    wind: "",
    conditions: "",
    currentUnits: "F",
}



readableLocation = {
    neighborhood: "",
    city: "",
    state: "",
    country: "",
}

var getLocation = function() {
    var defer = $.Deferred();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            defer.resolve([position.coords.latitude, position.coords.longitude]);
        });
    } else {
        alert("location failed");
    }
    return defer.promise();
}

var getCurrentWeather = function(location, weather) {
    var defer = $.Deferred();
    var apiCall = "lat=" + location[0] + "&lon=" + location[1] + "&APPID=" + weatherAPIKey;
    $.getJSON(weatherProvider + apiCall, function(value) {
        weather.temperatureK = value.main.temp;
        weather.wind = parseWind(value.wind);
        weather.conditions = value.weather[0].description;
        weather.hiLoK = [value.main.temp_min, value.main.temp_max]
        convertTemperatures(weather);
        setWeatherHTML(weather);
        changeBackgroundPicture(weather.conditions);
        defer.resolve();
    });
    return defer.promise();
}

var convertTemperatures = function(weather) {
    weather.temperatureC = weather.temperatureK - 273.15;
    weather.temperatureF = (weather.temperatureK * (9 / 5) - 459);
    weather.hiLoF = "Hi: " + (Math.round(weather.hiLoK[1] * (9 / 5) - 459)).toString() + " / Low: " + (Math.round(weather.hiLoK[0] * (9 / 5) - 459)).toString();
    weather.hiLoC = "Hi: " + (Math.round(weather.hiLoK[1] - 273.15)).toString() + " / Low: " + (Math.round(weather.hiLoK[0] - 273.15)).toString();
}

var parseWind = function(wind) {
    var windDirection = "";
    var windSpeed = wind.speed.toString();
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
    return windDirection + "<br />" + windSpeed + " mph";
}

var setWeatherHTML = function(weather) {
    $("#currentTemperature").html(Math.round(weather.temperatureF));
    $("#weatherConditions").html(weather.conditions);
    $("#wind").html(weather.wind);
    $("#temperatureHiLo").html(weather.hiLoF);
}

var changeBackgroundPicture = function(conditions) {
    console.log(conditions);
    var apiCall = "method=flickr.photos.search&api_key=" + photoAPIKey + "&text=" + conditions + "&license=1&sort=interestingness-desc&safe_search=1&content_type=1&extras=url_l&per_page=10&format=json&nojsoncallback=1"
    $.getJSON(photoProvider + apiCall, function(photoJSON) {
        var photos = photoJSON.photos.photo;
        for (var i = 0; i < photos.length; i++) {
            if (photos[i].height_l < 700) {
                $("body").css("backgroundImage", "url(" + photos[i].url_l + ")");
                break;
            }
        }
    })
}

var getLocationName = function(location) {
    var defer = $.Deferred();
    var readableLocation = [];
    var apiCall = "latlng=" + location + "&key=" + locationAPIKey;
    $.getJSON(locationProvider + apiCall, function(locationJSON) {
        var address_components = locationJSON.results[0].address_components;
        var i = 0;
        while (readableLocation.country === "" || i < address_components.length) {
            if (address_components[i].types.includes("neighborhood")) {
                readableLocation.neighborhood = address_components[i].long_name;
            } else if (address_components[i]["types"].includes("locality")) {
                readableLocation.city = address_components[i].long_name;
            } else if (address_components[i]["types"].includes("administrative_area_level_1")) {
                readableLocation.state = address_components[i].short_name;
            } else if (address_components[i]["types"].includes("country")) {
                readableLocation.country = address_components[i].long_name;
            }
            i++;
        }
        defer.resolve(readableLocation);
        setLocationHTML(readableLocation);
    });
    return defer.promise();
}

var setLocationHTML = function(readableLocation) {
    $("#currentLocation").html(readableLocation.city + ", " + readableLocation.state + ", " + readableLocation.country);
}

var setDateHTML = function() {
    var date = new Date();
    $("#currentDate").html(date.toDateString());
}

var switchTemperatureUnits = function(weather) {
    if (weather.currentUnits === "F") {
        $("#currentTemperature").html(Math.round(weather.temperatureC));
        $("#temperatureHiLo").html(weather.hiLoC);
        weather.currentUnits = "C";
    } else {
        $("#currentTemperature").html(Math.round(weather.temperatureF));
        $("#temperatureHiLo").html(weather.hiLoF);
        weather.currentUnits = "F";
    }
}


$(document).ready(function() {
    setDateHTML();
    getLocation().done(
        [function(value) {
            getCurrentWeather(value, currentWeather);
        }, function(value) {
            getLocationName(value);
        }]
    );
    $("#swapUnitsButton").on("click", function() {
        switchTemperatureUnits(currentWeather);
    });
})