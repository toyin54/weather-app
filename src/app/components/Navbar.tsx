'use client'
import React, { useState } from 'react'
import { BsSunFill } from "react-icons/bs";
import { MdOutlineMyLocation } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import SearchBar from './SearchBar';
import axios from 'axios';
import { useAtom } from "jotai";{/**Global dtate managementy for rteact */}
import { loadingCityAtom, placeAtom } from "../atom";
type Props = { location?: string };

export default function Navbar({location}: Props) {
  const [city , setCity] = useState('')
  const [error , setErr] = useState('')

  const [suggestions , setSuggestions] = useState<string[]>([])
  const [showSuggestions , setShowSuggestions] = useState(false)

  {/**Use Atom Global setting of variables */}
  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadingCityAtom);

  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY

  async function handleInputChange(value: string) {
    setCity(value)
    if (value.length >= 3) {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=f090eebba96894fd5850685df998abc1`
          )
        const suggestions =  res.data.list.map((item:any) => item.name);
        setSuggestions(suggestions)
        setErr("")
        setShowSuggestions(true)
      } catch (error) {
        setSuggestions([])
        setShowSuggestions(false) 
      }
    } else{
        setSuggestions([]);
        setShowSuggestions(false);
      }
  }
  

  function handleSuggestionsClick(value: string){
    setCity(value)
    setShowSuggestions(false)
  }

  function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>){
    setLoadingCity(true)
    e.preventDefault()
    if(suggestions.length ==0){
      setErr("Loaction Not Found")
      setLoadingCity(false);
      setLoadingCity(false)
    }

    else{
      setErr('')
      setTimeout(() => {
        setLoadingCity(false);
        setPlace(city);
        setShowSuggestions(false);
      }, 500);
    }
  }

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (postiion) => {
        const { latitude, longitude } = postiion.coords;
        try {
          setLoadingCity(true);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=f090eebba96894fd5850685df998abc1`
          );
          setTimeout(() => {
            setLoadingCity(false);
            setPlace(response.data.name);
          }, 500);
        } catch (error) {
          setLoadingCity(false);
        }
      });
    }
  }
  return (
    <>
    <nav className='shadow-sm sticky top-0 left-0 z-50 bg-white'>
       <div className='h-[80px] w-full flex justify-between items-center
       max-w-7xl px-3 mx-auto'>
        <p className='flex items-center justify-center gap-2'>
            <h2 className='text-gray-500 text-3xl hover:text-blue-400'>Weather</h2>
            <BsSunFill className='text-3xl mt-1 text-yellow-300'/> 
            </p>   
            {/** */}   
            <section className='flex gap-2 items-center'>
            <CiLocationOn 
             title="Your Current Location"
             onClick={handleCurrentLocation}
              className='text-3xl text-gray-400 hover:text-blue-400'
               />
            <MdOutlineMyLocation 
              className='text-3xl' />  
            <p className='text-slate-900/80 text-sm'> {location}</p>
            <div 
              className='relative hidden md:flex'>

                <SearchBar
                  value={city}
                  onSubmit={handleSubmitSearch}
                  onChange={(e) => handleInputChange(e.target.value)}
                 />

                 <SuggestionBox
                    {...{
                      showSuggestions,
                      suggestions,
                      handleSuggestionsClick,
                      error
                  }}
                  />
              </div> 
            </section> 
        </div> 
    </nav>
    <section className="flex   max-w-7xl px-3 md:hidden ">
        <div className="relative ">
          {/* SearchBox */}

          <SearchBar
            value={city}
            onSubmit={handleSubmitSearch}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <SuggestionBox
            {...{
              showSuggestions,
              suggestions,
              handleSuggestionsClick,
              error
            }}
          />
        </div>
      </section>
    </>
  )
}

function SuggestionBox({
  showSuggestions,
  suggestions,
  handleSuggestionsClick,
  error
}: {
  showSuggestions: boolean;
  suggestions: string[],
  handleSuggestionsClick: (item : string) => void;
  error: string
}){
  return(
    <> 
    {
      ((showSuggestions && suggestions.length>1) || error) && (
    <ul className='mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rouned-md min-w-[200px]
        flex flex-col gap-1 py-2 px-2'>
        {error && suggestions.length < 1 && (
          <li className='text-red-500 p-1'>
              {error}
          </li>
        ) }
        {suggestions.map((item , i) => (
            <li
              key={i}
              onClick={() => handleSuggestionsClick(item)}
              className='cursor-pointer p-1 rounded hover:bg-gray-200'>
                {item}
            </li>
        ))}
      </ul>
    )}
    </>
  )
}