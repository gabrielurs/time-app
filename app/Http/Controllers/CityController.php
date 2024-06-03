<?php

namespace App\Http\Controllers;

use App\Models\City;
use Exception;
use Illuminate\Http\Request;




class CityController extends Controller
{

    
    //Gets the user's location and returns the city
    public function map()
    {
        try {
            $user_ip = getenv('REMOTE_ADDR');
            $geo = unserialize(file_get_contents("http://www.geoplugin.net/php.gp?ip=$user_ip"));
           // $country = $geo["geoplugin_countryName"];
            $city = $geo["geoplugin_city"];
        }catch (Exception $e) {
            return response('City not found', 204);
        }finally{
            return response()->json($city, 200);
        }
    }

    //obtains the city and checks if it exists in the database, if true then returns lat and lon coordinates
    public function city(Request $request){
        $validated = $request->validate([
            'city' => 'required|string|max:50',
        ]);

        if(!$validated){
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $response = City::where('city', $request->city)->first();
            $city['lat'] = $response->lat;
            $city['lng'] = $response->lng;

            return response()->json($city);
        } catch (Exception $e) {
            return response(['message' => 'City not found'],404);
        }


    }


    //obtains the lat and long coordinates and does a curl to obtain weather data
    public function weather(Request $request){
        
        $validated = $request->validate([
            'lng' => 'required',
            'lat' => 'required',
        ]);

        if(!$validated){
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $url = 'https://www.7timer.info/bin/astro.php?lon='.$request->lng.'&lat='.$request->lat.'&ac=0&unit=metric&output=xml&tzshift=0';
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
            $array = json_decode($json,TRUE);

            return response()->json($array);

        } catch (Exception $e) {
            return response(['message' => 'City not found'], 404);
        }
    }

   

    public function weather_translate(Request $request){
        $data = $request->all();
        $day = $data;['init'];
        $translation = array();
        
        function translate($property, $value) {
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
            ];
            
            return isset($translations[$property][$value]) ? $translations[$property][$value] : "Unknown value";
        }
        //This for recieves the array then reorgranizes it and translate it if needed
        foreach ($data['dataseries']['data'] as $entry) {
            $timepoint = $entry['@attributes']['timepoint'];
            // cast becasue timepoint is str
            if( (int) $timepoint <= 24){
                $translation[$timepoint] = [
                    'cloudcover' => translate('cloudcover', $entry['cloudcover']),
                    'seeing' => translate('seeing',$entry['seeing']),
                    'transparency' => translate('transparency',$entry['transparency']),
                    'lifted_index' => translate('lifted_index',$entry['lifted_index']),
                    'rh2m' => $entry['rh2m'],
                    'wind10m_direction' => $entry['wind10m_direction'],
                    'wind10m_speed' => translate('wind10m_speed',$entry['wind10m_speed']),
                    'temp2m' => $entry['temp2m'],
                    'prec_type' => $entry['prec_type'],
                ];
         }
        }   

        return response($translation);
    }



}
