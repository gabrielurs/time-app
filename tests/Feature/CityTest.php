<?php

namespace Tests\Feature;
// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CityTest extends TestCase
{
    public function test_application_returns_successfull_response(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }
    


    public function test_obtain_user_map_position(): void
    {
        $response = $this->get('api/map');

        $this->assertNotEmpty($response->json());
        $this->assertJson($response->getContent());

        $this->assertArrayHasKey('city', $response->json());
        $this->assertArrayHasKey('country', $response->json());

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_obtain_user_map_position_and_checks_that_exists_in_database_and_returns_lat_len(): void
    {

        $response = $this->get('api/map');

        $city = $this->postJson('api/city', ['city' => $response['city']]);


        $this->assertNotEmpty($response->json());
        $this->assertJson($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());

        $this->assertNotEmpty($city->json());
        $this->assertJson($city->getContent());
        $this->assertEquals(200, $city->getStatusCode());
        $this->assertArrayHasKey('lat', $city->json());
        $this->assertArrayHasKey('lng', $city->json());
    }

    public function test_invalid_user_map_position_and_does_not_exists_in_database_and_returns_error(): void
    {
        $city = $this->postJson('api/city', ['city' => "albahaca"]);
        $city->assertStatus(404);
    }

    public function test_obtain_city_astro_weather_using_lat_len(): void
    {
        $response = $this->get('api/map');
        $city = $this->postJson('api/city', ['city' => $response['city']]);


        $this->assertNotEmpty($city->json());
        $this->assertJson($city->getContent());
        $this->assertEquals(200, $city->getStatusCode());
        $this->assertArrayHasKey('lat', $city->json());
        $this->assertArrayHasKey('lng', $city->json());

        $astro = $this->postJson('api/astro', ['lat' => $city['lat'], 'lng' => $city['lng']]);

        $this->assertNotEmpty($astro->json());
        $this->assertJson($astro->getContent());

        $this->assertEquals(200, $astro->getStatusCode());
    }


    public function test_obtain_city_meteo_weather_using_lat_len(): void
    {
        $response = $this->get('api/map');
        $city = $this->postJson('api/city', ['city' => $response['city']]);


        $this->assertNotEmpty($city->json());
        $this->assertJson($city->getContent());
        $this->assertEquals(200, $city->getStatusCode());
        $this->assertArrayHasKey('lat', $city->json());
        $this->assertArrayHasKey('lng', $city->json());

        $meteo = $this->postJson('api/meteo', ['lat' => $city['lat'], 'lng' => $city['lng']]);

        $this->assertNotEmpty($meteo->json());
        $this->assertJson($meteo->getContent());

        $this->assertEquals(200, $meteo->getStatusCode());
    }

    public function test_invalid_city_name_returns_error(): void
    {
        $city = $this->postJson('api/city', ['city' => null]);
        $city->assertStatus(422);
    }

    public function test_missing_lat_lng_for_astro_returns_error(): void
    {
        $weather = $this->postJson('api/astro', ['lat' => null, 'lng' => null]);
        $weather->assertStatus(422);
    }

    public function test_missing_lat_lng_for_meteo_returns_error(): void
    {
        $weather = $this->postJson('api/meteo', ['lat' => null, 'lng' => null]);
        $weather->assertStatus(422);
    }
    
    public function test_translate_astro_data_to_json(): void
    {
        $response = $this->get('api/map');
        $city = $this->postJson('api/city', ['city' => $response['city']]);

        $this->assertNotEmpty($city->json());
        $this->assertJson($city->getContent());
        $this->assertEquals(200, $city->getStatusCode());
        $this->assertArrayHasKey('lat', $city->json());
        $this->assertArrayHasKey('lng', $city->json());

        $astro = $this->postJson('api/astro', ['lat' => $city['lat'], 'lng' => $city['lng']]);
        
        $this->assertNotEmpty($astro->json());
        $this->assertJson($astro->getContent());        
        $this->assertEquals(200, $astro->getStatusCode());
    

        $weatherTranslated = $this->postJson('api/translate_astro', $astro->json());


        $this->assertNotEmpty($weatherTranslated->json());
        $this->assertJson($weatherTranslated->getContent());
        $this->assertEquals(200, $weatherTranslated->getStatusCode());
    }

    public function test_translate_meteo_data_to_json(): void
    {
        $response = $this->get('api/map');
        $city = $this->postJson('api/city', ['city' => $response['city']]);

        $this->assertNotEmpty($city->json());
        $this->assertJson($city->getContent());
        $this->assertEquals(200, $city->getStatusCode());
        $this->assertArrayHasKey('lat', $city->json());
        $this->assertArrayHasKey('lng', $city->json());

        $meteo = $this->postJson('api/meteo', ['lat' => $city['lat'], 'lng' => $city['lng']]);
        
        $this->assertNotEmpty($meteo->json());
        $this->assertJson($meteo->getContent());        
        $this->assertEquals(200, $meteo->getStatusCode());
    

        $weatherTranslated = $this->postJson('api/translate_meteo', $meteo->json());


        $this->assertNotEmpty($weatherTranslated->json());
        $this->assertJson($weatherTranslated->getContent());
        $this->assertEquals(200, $weatherTranslated->getStatusCode());
    }


    public function test_unite_translations_and_return_json(): void
    {
        $response = $this->get('api/map');
        $city = $this->postJson('api/city', ['city' => $response['city']]);

        $this->assertNotEmpty($city->json());
        $this->assertJson($city->getContent());
        $this->assertEquals(200, $city->getStatusCode());
        $this->assertArrayHasKey('lat', $city->json());
        $this->assertArrayHasKey('lng', $city->json());


        //astro 
        $astro = $this->postJson('api/astro', ['lat' => $city['lat'], 'lng' => $city['lng']]);
        $this->assertNotEmpty($astro->json());
        $this->assertJson($astro->getContent());        
        $this->assertEquals(200, $astro->getStatusCode());
        $astroTranslated = $this->postJson('api/translate_astro', $astro->json());

        $this->assertNotEmpty($astroTranslated->json());
        $this->assertJson($astroTranslated->getContent());
        $this->assertEquals(200, $astroTranslated->getStatusCode());

        //Meteo
        $meteo = $this->postJson('api/meteo', ['lat' => $city['lat'], 'lng' => $city['lng']]);
        $this->assertNotEmpty($meteo->json());
        $this->assertJson($meteo->getContent());        
        $this->assertEquals(200, $meteo->getStatusCode());
        $meteoTranslated = $this->postJson('api/translate_meteo', $meteo->json());
        
        $this->assertNotEmpty($meteoTranslated->json());
        $this->assertJson($meteoTranslated->getContent());
        $this->assertEquals(200, $meteoTranslated->getStatusCode());

     
    }

}


