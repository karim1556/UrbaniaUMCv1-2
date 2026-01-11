import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import axios from "axios";

interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
}

const PrayerTimes = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);
  const [city, setCity] = useState("Mumbai");
  const [country, setCountry] = useState("India");
  const lastFetchedDate = useRef<string>("");
  const debounceTimeout = useRef<any>(null);

  // Fetch prayer times on mount and whenever city/country changes (debounced)
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchPrayerTimes();
    }, 500); // 500ms debounce
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line
  }, [city, country]);

  // Set up timer for current time and auto-refresh at midnight
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh prayer times at midnight
  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    if (lastFetchedDate.current !== today) {
      fetchPrayerTimes();
    }
    lastFetchedDate.current = today;
    // Check every minute if the date has changed
    const midnightChecker = setInterval(() => {
      const newNow = new Date();
      const newToday = newNow.toISOString().split('T')[0];
      if (lastFetchedDate.current !== newToday) {
        fetchPrayerTimes();
        lastFetchedDate.current = newToday;
      }
    }, 60000); // check every minute
    return () => clearInterval(midnightChecker);
  }, []);

  // Update current prayer whenever time or prayerTimes change
  useEffect(() => {
    updateCurrentPrayer(prayerTimes);
  }, [currentTime, prayerTimes]);

  const fetchPrayerTimes = async () => {
    try {
      const response = await axios.get(
        `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`
      );

      const timings = response.data.data.timings;

      const mappedTimes: PrayerTime[] = [
        { name: "Fajr", time: formatTime(timings.Fajr), arabicName: "الفجر" },
        { name: "Sunrise", time: formatTime(timings.Sunrise), arabicName: "الشروق" },
        { name: "Dhuhr", time: formatTime(timings.Dhuhr), arabicName: "الظهر" },
        { name: "Asr", time: formatTime(timings.Asr), arabicName: "العصر" },
        { name: "Maghrib", time: formatTime(timings.Maghrib), arabicName: "المغرب" },
        { name: "Isha", time: formatTime(timings.Isha), arabicName: "العشاء" },
      ];

      setPrayerTimes(mappedTimes);
      updateCurrentPrayer(mappedTimes);
      // Update last fetched date
      lastFetchedDate.current = new Date().toISOString().split('T')[0];
    } catch (error) {
      console.error("Error fetching prayer times:", error);
    }
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const isPM = hour >= 12;
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
  };

  const timeToMinutes = (time: string) => {
    const [timePart, periodRaw] = time.split(" ");
    const period = periodRaw?.toUpperCase();
    const [hour, minute] = timePart.split(":").map(Number);
    let totalMinutes = hour * 60 + minute;
    if (period === "PM" && hour !== 12) totalMinutes += 12 * 60;
    if (period === "AM" && hour === 12) totalMinutes -= 12 * 60;
    return totalMinutes;
  };

  const getPrayerEndTime = (index: number) => {
    if (!prayerTimes || prayerTimes.length === 0) return 0;
    if (index === prayerTimes.length - 1) {
      return timeToMinutes(prayerTimes[0].time) + 24 * 60;
    }
    return timeToMinutes(prayerTimes[index + 1].time);
  };

  const updateCurrentPrayer = (prayerTimesList: PrayerTime[]) => {
    if (!prayerTimesList || prayerTimesList.length === 0) return;

    const nowMinutes = timeToMinutes(
      currentTime
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
        .replace(/am|pm/, m => m.toUpperCase())
    );

    for (let i = 0; i < prayerTimesList.length; i++) {
      const start = timeToMinutes(prayerTimesList[i].time);
      const end = getPrayerEndTime(i);

      if (nowMinutes >= start && nowMinutes < end) {
        setCurrentPrayer(prayerTimesList[i]);
        return;
      }
    }

    setCurrentPrayer(prayerTimesList[0]);
  };

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Daily Prayer Times</span>
          <div className="flex items-center text-sm font-normal text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* City & Country Input Fields */}
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter City"
            className="border border-gray-300 p-2 rounded-md w-1/2"
          />
          <Input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Enter Country"
            className="border border-gray-300 p-2 rounded-md w-1/2"
          />
          <Button onClick={fetchPrayerTimes} className="bg-primary text-white px-4 rounded-md">
            Get Times
          </Button>
        </div>

        {/* Prayer Times Grid */}
        <div className="grid grid-cols-3 gap-2">
          {prayerTimes.map((prayer) => (
            <div
              key={prayer.name}
              className={`text-center p-2 rounded-md ${prayer.name === currentPrayer?.name ? "bg-primary/10 border border-primary/30" : ""
                }`}
            >
              <p className="text-xs text-muted-foreground">{prayer.name}</p>
              <p className="font-medium">{prayer.time}</p>
              <p className="text-xs arabic font-medium mt-1">{prayer.arabicName}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerTimes;
