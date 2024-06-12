<?php

namespace App\Http\Controllers;

use App\Models\City;
use DateTime;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;



class CityController extends Controller
{

    public function translate($property, $value)
    {
        //This data is obtained from 7Weather Api
        $translations = [
            'cloudcover' => [
                1 => "0% - 6%",
                2 => "6% - 19%",
                3 => "19% - 31%",
                4 => "31% - 44%",
                5 => "44% - 56%",
                6 => "56% - 69%",
                7 => "69% - 81%",
                8 => "81% - 94%",
                9 => "94% - 100%",
            ],
            'seeing' => [
                1 => '<0.5',
                2 => '0.5"-0.75"',
                3 => '0.75"-1"',
                4 => '0.75"-1"',
                5 => '1"-1.25"',
                6 => '1.25"-1.5"',
                7 => '1.5"-2"',
                8 => '2"-2.5"',
                9 => '>2.5"',
            ],
            'transparency' => [
                1 => '<0.3',
                2 => '0.3-0.4',
                3 => '0.4-0.5',
                4 => '0.5-0.6',
                5 => '0.6-0.7',
                6 => '0.7-0.85',
                7 => '0.85-1',
                8 => '>1',
            ],
            'lifted_index' => [
                -10 => 'Below -7',
                -6 => '-7 to -5',
                -4 => '-5 to -3',
                -1 => '-3 to 0',
                2 => '0 to 4',
                6 => '4 to 8',
                10 => '8 to 11',
                15 => 'Over 11',
            ],
            'wind10m_speed' => [
                1 => 'Below 0.3m/s (calm)',
                2 => '0.3-3.4m/s (light)',
                3 => '3.4-8.0m/s (moderate)',
                4 => '8.0-10.8m/s (fresh)',
                5 => '10.8-17.2m/s (strong)',
                6 => '17.2-24.5m/s (gale)',
                7 => '24.5-32.6m/s (storm)',
                8 => 'Over 32.6m/s (hurricane)',
            ],
            'prec_amount' =>[
                0 => 'None',
                1 => '0-0.25mm/hr',
                2 => '0.25-0.5mm/hr',
                3 => '1-4mm/hr',
                4 => '4-10mm/hr',
                5 => '10-16mm/hr',
                6 => '16-30mm/hr',
                7 => '30-50mm/hr',
                8 => '50-75mm/hr',
                9 => 'Over 75mm/hr',
            ],
            'snow_depth'=>[
                0 => 'None',
                1 => '0-1cm',
                2 => '1-5cm',
                3 => '5-10cm',
                4 => '10-25cm',
                5 => '25-50cm',
                6 => '50-100cm',
                7 => '100-150cm',
                8 => '150-250cm',
                9 => '250+cm',

            ]

        ];

        return isset($translations[$property][$value]) ? $translations[$property][$value] : "Unknown value";
    }
    //Gets the user's location and returns the city
    public function map()
    {
        try {
            $user_ip = getenv('REMOTE_ADDR');
            $geo = unserialize(file_get_contents("http://www.geoplugin.net/php.gp?ip=$user_ip"));
            $country = $geo["geoplugin_countryName"];
            $city = $geo["geoplugin_city"];
        } catch (Exception $e) {
            return response('City not found', 204);
        } finally {
            return response()->json([
                'city' => $city,
                'country' => $country,
            ], 200);
        }
    }

    //obtains the city and checks if it exists in the database, if true then returns lat and lon coordinates
    public function city(Request $request)
    {
        $validated = $request->validate([
            'city' => 'required|string|max:50',
        ]);

        if (!$validated) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $response = City::where('city', $request->city)->first();
            $city['lat'] = $response->lat;
            $city['lng'] = $response->lng;

            return response()->json($city);
        } catch (Exception $e) {
            return response(['message' => 'City not found'], 404);
        }
    }


    //obtains the lat and long coordinates and does a curl to obtain weather data
    public function meteo(Request $request)
    {

        $validated = $request->validate([
            'lng' => 'required',
            'lat' => 'required',
        ]);

        if (!$validated) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $lng = $request->lng;
        $lat = $request->lat;

        $cacheKey = "meteo_{$lng}_{$lat}";

        $meteo = Cache::get($cacheKey);


        if(!$meteo){
            try {
                $url = 'https://www.7timer.info/bin/meteo.php?lon=' . $request->lng . '&lat=' . $request->lat . '&ac=0&unit=metric&output=xml&tzshift=0';
                $data = array();
                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
                $response = curl_exec($ch);
                curl_close($ch);
    
                $xml = simplexml_load_string($response);
                $json = json_encode($xml);
                $meteo = json_decode($json, TRUE);
                
                Cache::put($cacheKey, $meteo, 60 * 1);

            } catch (Exception $e) {
                return response(['message' => 'City not found'], 404);
            }
        }
        
        return response()->json($meteo);
  
    }


    public function astro(Request $request)
    {
        $validated = $request->validate([
            'lng' => 'required',
            'lat' => 'required',
        ]);

        if (!$validated) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $lng = $request->lng;
        $lat = $request->lat;
        $cacheKey = "astro_{$lng}_{$lat}";
        $astro = Cache::get($cacheKey);
        
        if(!$astro){
            try {
                $url = 'https://www.7timer.info/bin/astro.php?lon=' . $request->lng . '&lat=' . $request->lat . '&ac=0&unit=metric&output=xml&tzshift=0';
                $data2 = array();
                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data2));
                $response = curl_exec($ch);
                curl_close($ch);
    
                $xml = simplexml_load_string($response);
                $json = json_encode($xml);
                $astro = json_decode($json, TRUE);
                
                //1h
                Cache::put($cacheKey, $astro, 60 * 1);
    
            } catch (Exception $e) {
                return response(['message' => 'City not found'], 404);
            }
        }
        return response()->json($astro);
   
    }

    // Gets the weather data and translate its data, it has a dictionary that allows for translation
    public function translate_astro(Request $request)
    {
        $data = $request->input('astro');
        $translation = array();

        $hour = date('H');

        //This for recieves the array then reorgranizes it and translate it if needed
        foreach ($data['dataseries']['data'] as $entry) {
            $timepoint = $entry['@attributes']['timepoint'];
            $day = new DateTime();

            // cast becasue timepoint is str
            if ((int) $timepoint <= ($hour + 2) && (int) $timepoint >= ($hour)) {
                //There is a format because i need the day as a string 
                $format = $day->format('Y/m/d');
                $translation[$format][$timepoint] = [
                    'cloudcover' => $this->translate('cloudcover', $entry['cloudcover']),
                    'seeing' => $this->translate('seeing', $entry['seeing']),
                    'transparency' => $this->translate('transparency', $entry['transparency']),
                    'lifted_index' => $this->translate('lifted_index', $entry['lifted_index']),
                    'rh2m' => $entry['rh2m'],
                    'wind10m_direction' => $entry['wind10m_direction'],
                    'wind10m_speed' => $this->translate('wind10m_speed', $entry['wind10m_speed']),
                    'temp2m' => $entry['temp2m'],
                    'prec_type' => $entry['prec_type'],
                ];
            }

            //This means it takes the weather from 12PM
            if ((int) $timepoint > 35 && (int) $timepoint <= 38) {
                $day->modify('+1 day');
                $format = $day->format('Y/m/d');

                $translation[$format] = [
                    'cloudcover' => $this->translate('cloudcover', $entry['cloudcover']),
                    'seeing' => $this->translate('seeing', $entry['seeing']),
                    'transparency' => $this->translate('transparency', $entry['transparency']),
                    'lifted_index' => $this->translate('lifted_index', $entry['lifted_index']),
                    'rh2m' => $entry['rh2m'],
                    'wind10m_direction' => $entry['wind10m_direction'],
                    'wind10m_speed' => $this->translate('wind10m_speed', $entry['wind10m_speed']),
                    'temp2m' => $entry['temp2m'],
                    'prec_type' => $entry['prec_type'],
                ];
            }

            //This also means it takes the weather from 12PM
            if ((int) $timepoint >= 59 && (int) $timepoint <= 61) {
                $day->modify('+2 days');
                $format = $day->format('Y/m/d');
                $translation[$format] = [
                    'cloudcover' => $this->translate('cloudcover', $entry['cloudcover']),
                    'seeing' => $this->translate('seeing', $entry['seeing']),
                    'transparency' => $this->translate('transparency', $entry['transparency']),
                    'lifted_index' => $this->translate('lifted_index', $entry['lifted_index']),
                    'rh2m' => $entry['rh2m'],
                    'wind10m_direction' => $entry['wind10m_direction'],
                    'wind10m_speed' => $this->translate('wind10m_speed', $entry['wind10m_speed']),
                    'temp2m' => $entry['temp2m'],
                    'prec_type' => $entry['prec_type'],
                ];
            }
        }

        return response()->json($translation);
    }


    public function translate_meteo(Request $request)
    {
        $data = $request->input('meteo');
        $day = $data;
        $translation = array();
        $hour = date('H');

        //This for recieves the array then reorgranizes it and translate it if needed
        foreach ($data['dataseries']['data'] as $entry) {
            $timepoint = $entry['@attributes']['timepoint'];
            $day = new DateTime();

            // cast becasue timepoint is str
            if ((int) $timepoint <= ($hour + 2) && (int) $timepoint >= ($hour)) {
                $format = $day->format('Y/m/d');
                $translation[$format][$timepoint] = [
                    'msl_pressure' => $entry['msl_pressure'],
                    'prec_amount' => $this->translate('prec_amount',$entry['prec_amount']),
                    'snow_depth' => $entry['snow_depth'],
                ];
            }

            if ((int) $timepoint > 35 && (int) $timepoint <= 38) {
                $day->modify('+1 day');
                $format = $day->format('Y/m/d');

                $translation[$format] = [
                    'msl_pressure' => $entry['msl_pressure'],
                    'prec_amount' => $this->translate('prec_amount',$entry['prec_amount']),
                    'snow_depth' => $this->translate('snow_depth',$entry['snow_depth']),
                ];
            }

            if ((int) $timepoint > 59 && (int) $timepoint <= 61) {
                $day->modify('+2 day');
                $format = $day->format('Y/m/d');

                $translation[$format] = [
                    'msl_pressure' => $entry['msl_pressure'],
                    'prec_amount' => $this->translate('prec_amount',$entry['prec_amount']),
                    'snow_depth' => $this->translate('snow_depth',$entry['snow_depth']),
                ];
            }
        }
        return response()->json($translation);
    }

    public function merge_translations(Request $request)
    {
        $astro = $request->astro;
        $meteo = $request->meteo;
        
        $translation = array_merge_recursive($astro, $meteo);
        

        return response()->json($translation);
    }
    
}
