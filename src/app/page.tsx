/** @format */
"use client";
import { useQuery } from "react-query";
import Navbar from "./components/Navbar";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import Container from "./components/Container";
import { convertKelvinToCelsius } from "./utils/convertKelvinToCelsius";
import WeatherIcon from "./components/WeatherIcon";
import { getDayOrNightIcon } from "./utils/getDayOrNightIcon";
import WeatherDetails from "./components/WeatherDetails";
import { metersToKilometers } from "./utils/metersToKilometers";
// import { loadingCityAtom, placeAtom } from "./atom";
import { convertWindSpeed } from "./utils/convertWindSpeed";
import ForecastWeatherDetail from "./components/ForecastWeatherDetail";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { placeAtom, loadingCityAtom } from "./atom";

interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}
export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadingCityAtom);

  const { isLoading, error, data  , refetch} = useQuery<WeatherData>(
    'repoData',
    async () =>
    {
      const {data} = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=f090eebba96894fd5850685df998abc1`
      );
      return data;
    }
  )

  useEffect(() => {
    refetch()

  }, [place , refetch])
  console.log('data',data?.city)

  const firstData = data?.list[0]

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  // Filtering data to get the first entry after 6 AM for each unique date
  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });


  if (isLoading)
    return
    (
        <div className="flex items-center min-h-screen justify-center">
            <p className="animate-bounce">Loading...</p>
        </div>
    )

 

  return (
   
    //

    <div className="flex flex-col gap-4 bg-gray-200 min-h-screen">
      <Navbar location={data?.city.name}/>
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9  w-full  pb-10 pt-4 ">
        {/**Todays data */}
        <section className="space-y-4">
          <div className="space-y-2"> {/** div for displaying the weather forcast for the day */}
            <h2 className="flex gap-1 text-2xl items-end">
              <p>
                {format(parseISO(firstData?.dt_txt ?? ''), 'EEEE')}
              </p>
              <p className="text-lg text-red-500">
                {format(parseISO(firstData?.dt_txt ?? ''), 'dd:MM:yyyy')}
              </p>
            </h2> 
            <Container className = "gap-10 px-6 items-center">
              <div className="flex flex-col px-4">  
                <span className="text-5xl">
                  {convertKelvinToCelsius(firstData?.main.temp ?? 293.37)}°C
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">Feels Like {convertKelvinToCelsius(firstData?.main.feels_like ?? 0)}°C</p>
                <p className="text-xs space-x-2">
                  <span>
                  {"  "}
                    {convertKelvinToCelsius(firstData?.main.temp_min ?? 0)}
                    °↓
                  </span>
                  <span>
                  {"  "}
                    {convertKelvinToCelsius(firstData?.main.temp_max ?? 0)}
                    °↑
                  </span>
                </p>
              </div>
              {/*time and weather icon */}
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list.map((d,i) => 
                <div key = {i} className="flex flex-col justify-between gap-2 items-center text-xs font-extralight"> 
                    <p className="whitespace-nowrap">
                    {format(parseISO(d.dt_txt ), 'h:mm a')}
                    </p>
                    <WeatherIcon 
                        iconName={
                          getDayOrNightIcon(
                            d.weather[0].icon , 
                            d.dt_txt) }
                            />
                    <p>{convertKelvinToCelsius(d.main.temp) ?? 0}°C</p>
                  </div> )}
              </div>
            </Container>
          </div>
          <div className="flex gap-4 ">
            {/**Left */}
             <Container className="w-fit justify-center flex-col px-4 items-center">
                <p className="capitalize text-center">
                  {firstData?.weather[0].description ?? ''}
                  </p>   
                <WeatherIcon 
                        iconName={
                          getDayOrNightIcon(
                            firstData?.weather[0].icon ?? '' , 
                            firstData?.dt_txt ?? '') }
                            />   

              </Container>               
            {/**right */}

            <Container className="bg-yellow-300/80 px-4 gap-4 justify-between overflow-x-auto">
            <WeatherDetails 
                    visability={metersToKilometers(firstData?.visibility ?? 10000) }
                    airPressure={`${firstData?.main.pressure} hPa`}
                    humidity={`${firstData?.main.humidity}%`}
                    sunrise={format(
                      fromUnixTime(data?.city.sunrise ?? 12133412) , "H:mm"
                    )}
                    sunset={format(
                      fromUnixTime(data?.city.sunset ?? 12133412) , "H:mm"
                    )}
                    windSpeed={convertWindSpeed(firstData?.wind.speed ?? 0)}
                    />
              </Container> 
          </div>
        </section>

        {/** 7 Next & days data */}
        <section className="flex w-full flex-col gap-4 bg-white-500">
            <p className="text-2xl">7 Day Forecast</p>
            {
              firstDataForEachDate.map((d , i) => (
             <ForecastWeatherDetail 
             key={i}
             weatehrIcon={d?.weather[0].icon ?? '01d'}
             date = {format(parseISO(d?.dt_txt ?? ''), 'dd:MM:yyyy')}
             day={format(parseISO(d?.dt_txt ?? "") , "EEEE")}
             description = {d?.weather[0].description ?? ' '}
             feels_like = {d?.main.feels_like ?? 0}
             temp_min ={d?.main.temp_min ?? 0}
             temp_max = {d?.main.temp_max ?? 0}
             temp={d?.main.temp ?? 0}
             visibility={metersToKilometers(firstData?.visibility ?? 10000) }
             airPressure={`${d?.main.pressure} hPa`}
             humidity={`${d?.main.humidity}%`}
             sunrise={format(
                      fromUnixTime(data?.city.sunrise ?? 12133412) , "H:mm"
                    )}
             sunset={format(
                      fromUnixTime(data?.city.sunset ?? 12133412) , "H:mm"
                    )}
             windSpeed={convertWindSpeed(d?.wind.speed ?? 0)}
             />
            ))
          }
        </section>
      </main>
      
      </div>
  )
}